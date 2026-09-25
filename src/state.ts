export type Bite = {
  x: number;
  y: number;
  r: number;
  points?: [number, number][];
};
export type Crumb = {
  x: number;
  y: number;
  size: number;
  angle: number;
  section: string;
  dark?: boolean;
};
export type CookieState = {
  version: 1;
  revision: number;
  bites: Bite[];
  crumbs: Crumb[];
  letters: number[];
  baked: string;
  seen: number;
  created: number;
  eaten: number;
  signature?: [number, number][];
};
export const sections = [
  "studio",
  "work",
  "method",
  "pantry",
  "plate",
] as const;
export const today = () => new Date().toLocaleDateString("en-CA");
export const fresh = (): CookieState => ({
  version: 1,
  revision: 0,
  bites: [],
  crumbs: [],
  letters: [],
  baked: "",
  seen: Date.now(),
  created: Date.now(),
  eaten: 0,
});
const finite = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);
const point = (v: unknown): v is [number, number] =>
  Array.isArray(v) &&
  v.length === 2 &&
  v.every((n) => finite(n) && Math.abs(n) <= 2000);
export function valid(v: unknown): v is CookieState {
  if (!v || typeof v !== "object") return false;
  const s = v as CookieState;
  return (
    s.version === 1 &&
    finite(s.revision) &&
    finite(s.seen) &&
    finite(s.created) &&
    finite(s.eaten) &&
    typeof s.baked === "string" &&
    Array.isArray(s.bites) &&
    s.bites.length <= 6 &&
    s.bites.every(
      (b) =>
        finite(b.x) &&
        finite(b.y) &&
        finite(b.r) &&
        b.r > 0 &&
        b.r <= 900 &&
        (!b.points || (b.points.length <= 40 && b.points.every(point))),
    ) &&
    Array.isArray(s.crumbs) &&
    s.crumbs.length <= 400 &&
    s.crumbs.every(
      (c) =>
        finite(c.x) &&
        finite(c.y) &&
        finite(c.size) &&
        c.size > 0 &&
        c.size < 50 &&
        finite(c.angle) &&
        sections.includes(c.section as (typeof sections)[number]),
    ) &&
    Array.isArray(s.letters) &&
    s.letters.length < 100 &&
    s.letters.every((n) => Number.isInteger(n) && n >= 0 && n < 100) &&
    (!s.signature || (s.signature.length <= 40 && s.signature.every(point)))
  );
}
export function read(): CookieState {
  try {
    const s: unknown = JSON.parse(
      localStorage.getItem("snack-cookie") || "null",
    );
    if (valid(s)) {
      if (Date.now() - s.seen > 7 * 86400000) {
        s.baked = "";
        s.bites = [];
      }
      return s;
    }
  } catch {
    /* Storage may be unavailable. */
  }
  return fresh();
}
export function save(s: CookieState) {
  s.seen = Date.now();
  s.revision += 1;
  try {
    localStorage.setItem("snack-cookie", JSON.stringify(s));
  } catch {
    /* The cookie remains available in memory. */
  }
}
