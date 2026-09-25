import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.route("**/api.open-meteo.com/**", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        current: { temperature_2m: 67, weather_code: 1, is_day: 1 },
      }),
    }),
  );
  await page.route("**/api/pantry", (r) =>
    r.fulfill({ status: 503, body: "unavailable" }),
  );
});
test("six keyboard bites, persistence, seventh bite and sweep", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("#bite-count")).toHaveText("6 bites left");
  const cookie = page.locator(".cookie-hit");
  for (let i = 0; i < 6; i++) {
    await cookie.focus();
    await page.keyboard.press("Enter");
  }
  await expect(page.locator("#bite-count")).toHaveText("Every last crumb.");
  await page.reload();
  await expect(page.locator("#bite-count")).toHaveText("Every last crumb.");
  await cookie.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#bite-count")).toHaveText("6 bites left");
  await page.locator('[data-letter="0"]').click();
  await page.locator("#sweep").click();
  await expect(page.locator('[data-letter="0"]')).not.toBeDisabled();
  expect(errors).toEqual([]);
});
test("honest work, grounded answers, pantry, kitchen", async ({ page }) => {
  await page.goto("/#work");
  await page.locator('[data-work="0"]').click();
  await expect(page.locator('[data-work="0"]')).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await page.locator("[data-question]").first().click();
  await expect(page.locator(".answer")).toHaveText(
    "SnackStudio is run by Zach Shallbetter.",
  );
  await page.locator("#question").fill("How many awards have you won?");
  await page.locator(".ask-form button").click();
  await expect(page.locator(".answer")).toContainText("grounded answer");
  await page.locator('[data-jar="Structure"]').click();
  await expect(page.locator("#essay-card")).toContainText("Structure");
  await page.goto("/kitchen");
  await expect(page.locator("main h1")).toContainText("Nothing up");
  await page.locator("#drop-crumbs").click();
});
test("mobile has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await page.screenshot({ path: "deliverables/mobile.png", fullPage: true });
});
test("tabs share the same cookie", async ({ page, context }) => {
  await page.goto("/");
  const other = await context.newPage();
  await other.goto("/");
  await page.locator(".cookie-hit").focus();
  await page.keyboard.press("Enter");
  await expect(other.locator("#bite-count")).toHaveText("5 bites left");
});
test("desktop composition and camera reduced motion path", async ({ page }) => {
  await page.goto("/");
  await page.locator("#mouth").click();
  await expect(page.locator(".toast")).toContainText("reduced motion");
  await page.screenshot({ path: "deliverables/desktop.png", fullPage: false });
});

test("share exports a real PNG and restores the edited headline", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-letter="0"]').click();
  await page.reload();
  await expect(page.locator('[data-letter="0"]')).toBeDisabled();
  const downloaded = page.waitForEvent("download");
  await page.locator("#share").click();
  const file = await downloaded;
  expect(file.suggestedFilename()).toBe("my-snackstudio-bite.png");
  await file.saveAs("deliverables/share.png");
});

test("camera is opt-in and the dialog closes from the keyboard", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const modelRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/models/")) modelRequests.push(request.url());
  });
  await page.goto("/");
  await page.locator("#mouth").click();
  await expect(page.locator("#camera-dialog")).toBeVisible();
  expect(modelRequests).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.locator("#camera-dialog")).not.toBeVisible();
});

test("offline reload retains the page and saved bites", async ({ browser }) => {
  const context = await browser.newContext({
    serviceWorkers: "allow",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.locator(".cookie-hit").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#bite-count")).toHaveText("5 bites left");
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("#bite-count")).toHaveText("5 bites left");
  await expect(page.locator(".offline-badge")).toBeVisible();
  await context.close();
});
