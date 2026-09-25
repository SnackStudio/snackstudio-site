import { test, expect } from "@playwright/test";
import handler from "../api/pantry";
import { PassThrough } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
async function request(method: string, body?: unknown) {
  const req = Object.assign(new PassThrough(), {
    method,
    headers: {
      "content-type": "application/json",
      host: "snackstud.io",
      origin: "https://snackstud.io",
    },
    body,
  });
  let status = 200,
    result: unknown;
  const res = {
    set statusCode(v: number) {
      status = v;
    },
    setHeader() {},
    end(text: string) {
      result = JSON.parse(text);
    },
  };
  await handler(
    req as unknown as IncomingMessage,
    res as unknown as ServerResponse,
  );
  return { status, result };
}
test("pantry fails closed for missing configuration, unsafe endpoints and invalid input", async () => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  expect((await request("GET")).result).toEqual({ available: false });
  process.env.UPSTASH_REDIS_REST_URL = "http://127.0.0.1";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-only";
  expect((await request("GET")).status).toBe(503);
  process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
  expect(
    (await request("POST", { kind: "unknown", token: "bad", eaten: -1 }))
      .status,
  ).toBe(400);
  expect((await request("DELETE")).status).toBe(405);
});
test("pantry rejects malformed upstream state and accepts the validated tuple", async () => {
  process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-only";
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ result: ["NaN"] }));
    expect((await request("GET")).status).toBe(502);
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ result: ["5", "2", "0", "0", []] }));
    expect((await request("GET")).result).toEqual({
      visitors: 5,
      eaten: 2,
      empty: false,
      last: false,
      crumbs: [],
    });
  } finally {
    globalThis.fetch = original;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  }
});
