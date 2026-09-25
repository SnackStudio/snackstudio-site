import { readFile, writeFile, copyFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
const assets = (await readdir("dist/assets"))
  .filter((name) => /\.(js|css)$/.test(name))
  .map((name) => "/assets/" + name);
const shell = [
  "/",
  "/kitchen",
  ...assets,
  "/brand/web/whole-solid.webp",
  "/brand/web/whole-outline-small.webp",
  "/brand/web/bitten-solid-small.webp",
  "/brand/web/bitten-outline-small.webp",
];
let sw = await readFile("public/sw.js", "utf8");
const version = createHash("sha256")
  .update(assets.join("\n"))
  .digest("hex")
  .slice(0, 12);
sw = sw
  .replace(
    "const CACHE='snackstudio-v1';",
    `const CACHE='snackstudio-${version}';`,
  )
  .replace(/const SHELL=\[[^;]+;/, `const SHELL=${JSON.stringify(shell)};`);
await writeFile("dist/sw.js", sw);
await copyFile("dist/index.html", "dist/404.html");
