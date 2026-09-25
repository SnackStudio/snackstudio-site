import type { IncomingMessage, ServerResponse } from "node:http";
// One atomic script owns unique visits, idempotent eaten events, the shared jar,
// short-lived anonymous crumbs, and bounded per-session event rate limits.
const script = `
local mode=ARGV[1]
local token=ARGV[2]
local serial=ARGV[3]
local last=0
local rate=0
if mode~='read' then rate=redis.call('INCR',KEYS[5]..token) end
if rate==1 then redis.call('EXPIRE',KEYS[5]..token,60) end
if rate>30 then return {'rate'} end
if mode=='visit' then
 local added=redis.call('SADD',KEYS[1],token)
 redis.call('EXPIRE',KEYS[1],172800)
 local visitors=redis.call('SCARD',KEYS[1])
 if added==1 and visitors%1000==0 then redis.call('SET',KEYS[3],'1','EX',60);last=1 end
elseif mode=='eaten' then
 local seen=redis.call('SET',KEYS[6]..token..':'..serial,'1','NX','EX',172800)
 if seen then redis.call('INCR',KEYS[2]);redis.call('EXPIRE',KEYS[2],172800) end
elseif mode=='crumb' then
 redis.call('LPUSH',KEYS[4],ARGV[4]);redis.call('LTRIM',KEYS[4],0,99);redis.call('EXPIRE',KEYS[4],60)
end
return {tostring(redis.call('SCARD',KEYS[1])),redis.call('GET',KEYS[2]) or '0',tostring(redis.call('EXISTS',KEYS[3])),tostring(last),redis.call('LRANGE',KEYS[4],0,99)}
`;
function reply(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}
async function body(req: IncomingMessage): Promise<unknown> {
  let data = "";
  for await (const chunk of req) {
    data += chunk.toString();
    if (Buffer.byteLength(data) > 1024) throw new Error("payload");
  }
  return JSON.parse(data);
}
export default async function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return reply(res, 405, { error: "method" });
  }
  const endpoint = process.env.UPSTASH_REDIS_REST_URL,
    token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!endpoint || !token) return reply(res, 200, { available: false });
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return reply(res, 503, { error: "pantry_config" });
  }
  if (
    url.protocol !== "https:" ||
    !url.hostname.endsWith(".upstash.io") ||
    url.username ||
    url.password ||
    url.port ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    return reply(res, 503, { error: "pantry_config" });
  let kind = "read",
    visitor = "reader",
    serial = 0;
  if (req.method === "POST") {
    if (!req.headers["content-type"]?.startsWith("application/json"))
      return reply(res, 415, { error: "content_type" });
    if (Number(req.headers["content-length"] || 0) > 1024)
      return reply(res, 413, { error: "payload" });
    const origin = req.headers.origin;
    if (origin) {
      let originHost: string;
      try {
        originHost = new URL(origin).host;
      } catch {
        return reply(res, 403, { error: "origin" });
      }
      if (originHost !== req.headers.host)
        return reply(res, 403, { error: "origin" });
    }
    let value: unknown;
    try {
      value = req.body ?? (await body(req));
      if (typeof value === "string") value = JSON.parse(value);
    } catch {
      return reply(res, 400, { error: "payload" });
    }
    if (!value || typeof value !== "object")
      return reply(res, 400, { error: "payload" });
    const v = value as Record<string, unknown>;
    if (
      !["visit", "crumb", "eaten"].includes(String(v.kind)) ||
      typeof v.token !== "string" ||
      !/^[a-f0-9-]{36}$/.test(v.token) ||
      !Number.isSafeInteger(v.eaten) ||
      Number(v.eaten) < 0 ||
      (v.kind === "eaten" && Number(v.eaten) < 1) ||
      Number(v.eaten) > 100000 ||
      Object.keys(v).some((k) => !["kind", "token", "eaten"].includes(k))
    )
      return reply(res, 400, { error: "payload" });
    kind = String(v.kind);
    visitor = v.token;
    serial = Number(v.eaten);
  }
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
  }).format(new Date());
  const prefix = `snack:v1:${day}:`;
  // Positions are presentation-only; no face, jaw, prompt, name, or IP is retained.
  const crumb = JSON.stringify({
    x: (serial % 19) / 19,
    y: (serial % 7) / 7,
    token: visitor,
  });
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        script,
        6,
        prefix + "visitors",
        prefix + "eaten",
        prefix + "empty",
        prefix + "crumbs",
        prefix + "rate:",
        prefix + "event:",
        kind,
        visitor,
        String(serial),
        crumb,
      ]),
      signal: AbortSignal.timeout(4000),
      redirect: "error",
    });
    if (!response.ok) return reply(res, 502, { error: "pantry_upstream" });
    const reader = response.body?.getReader();
    if (!reader) return reply(res, 502, { error: "pantry_response" });
    let bytes = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 32768) {
        await reader.cancel();
        return reply(res, 502, { error: "pantry_response" });
      }
      chunks.push(chunk.value);
    }
    const result = JSON.parse(Buffer.concat(chunks).toString()).result;
    if (Array.isArray(result) && result.length === 1 && result[0] === "rate")
      return reply(res, 429, { error: "rate_limit" });
    if (
      !Array.isArray(result) ||
      result.length !== 5 ||
      !result
        .slice(0, 4)
        .every((v) => typeof v === "string" && /^\d+$/.test(v)) ||
      !Array.isArray(result[4]) ||
      result[4].length > 100
    )
      return reply(res, 502, { error: "pantry_schema" });
    const [visitors, eaten, empty, last] = result.slice(0, 4).map(Number);
    if (
      !Number.isSafeInteger(visitors) ||
      !Number.isSafeInteger(eaten) ||
      ![0, 1].includes(empty) ||
      ![0, 1].includes(last)
    )
      return reply(res, 502, { error: "pantry_schema" });
    const crumbs: unknown[] = [];
    for (const item of result[4]) {
      if (typeof item !== "string")
        return reply(res, 502, { error: "pantry_schema" });
      const c = JSON.parse(item);
      if (
        typeof c.x !== "number" ||
        c.x < 0 ||
        c.x > 1 ||
        typeof c.y !== "number" ||
        c.y < 0 ||
        c.y > 1 ||
        typeof c.token !== "string" ||
        !/^[a-f0-9-]{36}$/.test(c.token)
      )
        return reply(res, 502, { error: "pantry_schema" });
      crumbs.push(c);
    }
    return reply(res, 200, {
      visitors,
      eaten,
      empty: empty === 1,
      last: last === 1,
      crumbs,
    });
  } catch {
    return reply(res, 502, { error: "pantry_unavailable" });
  }
}
