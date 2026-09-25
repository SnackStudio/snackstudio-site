# Review release

Date: 2026-09-25

Live review build: https://snackstudio-site.vercel.app
Source: https://github.com/SnackStudio/snackstudio-site

The separate Vercel project is in the Snack team. Its initial deployment returned READY and HTTP 200. The existing snackstud.io and www.snackstud.io domains still belong to snack-client and have not been moved.

## Evidence

- TypeScript and Vite production build passed.
- 10 Playwright checks passed: keyboard bite lifecycle, saved headline, shared tabs, mobile overflow, work/method/pantry navigation, kitchen controls, share PNG, camera opt-in, offline reload, and API validation (some checks cover multiple paths).
- Local Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1.9 seconds; CLS 0; FCP 1.4 seconds. The brief's 1.2-second readable-hero target has not been established on a real mid-range phone.
- Generated MP4 files are exactly 30, 60, and 90 seconds. They capture actual interaction in the review build, without commissioned audio or physical-run footage.
- API returns `{ "available": false }` when the optional store is not configured. No global visitor count is invented.

## Not a completed award release

MECHANICS.md records incomplete visual/physical mechanics, missing supplied content, unverified real-camera behavior, and the absent production Redis configuration. The requested 25 separate mechanic PRs with individual GIF and Lighthouse evidence are not complete. The source is provided in one integration PR for review. Submission copy is drafted; entries have not been filed.

## Reproduce

Run `npm install`, `npx playwright install chromium`, `npm run build`, then `npm run preview -- --port 4173`. In another terminal use `npm test`, `npm run audit`, or `node scripts/capture.mjs`.
