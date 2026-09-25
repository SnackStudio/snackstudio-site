import { chromium } from "@playwright/test";
import { mkdir, rename } from "node:fs/promises";
await mkdir("deliverables/recording", { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: {
    dir: "deliverables/recording",
    size: { width: 1440, height: 900 },
  },
});
const page = await context.newPage();
const start = Date.now();
const at = async (seconds) => {
  const delay = start + seconds * 1000 - Date.now();
  if (delay > 0) await page.waitForTimeout(delay);
};
await page.goto("http://127.0.0.1:4173/");
await at(9);
await page.screenshot({ path: "deliverables/hero.png" });
for (let i = 0; i < 3; i++) {
  await page.locator(".cookie-hit").focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1400);
}
await at(15);
await page.locator('[data-letter="0"]').click();
await page.locator('[data-letter="5"]').click();
await at(20);
await page.locator("#work").scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);
await page.locator('[data-work="0"]').click();
await at(27);
await page.locator("#method").scrollIntoViewIfNeeded();
await page.locator("#question").fill("Who is behind the studio?");
await page.locator(".ask-form button").click();
await at(34);
await page.locator("#pantry").scrollIntoViewIfNeeded();
await page.locator('[data-jar="Structure"]').click();
await at(40);
await page.locator('[data-jar="Authority"]').click();
await at(45);
await page.locator("#plate").scrollIntoViewIfNeeded();
await page.locator(".contact").hover();
await at(51);
await page.goto("http://127.0.0.1:4173/");
await page.locator("#sweep").click();
await at(57);
await page.locator(".cookie-hit").focus();
await page.keyboard.press("Enter");
await at(61);
await page.goto("http://127.0.0.1:4173/kitchen");
await page.locator("#test-spring").click();
await at(66);
await page.locator("#drop-crumbs").click();
await at(71);
await page.locator("details").nth(1).click();
await at(76);
await page.emulateMedia({ reducedMotion: "reduce" });
await page.goto("http://127.0.0.1:4173/");
await at(81);
await page.locator(".cookie-hit").focus();
await page.keyboard.press("Enter");
await at(86);
await page.locator("#sweep").click();
await at(90);
const video = page.video();
await page.close();
await context.close();
await rename(await video.path(), "deliverables/recording/master.webm");
await browser.close();
