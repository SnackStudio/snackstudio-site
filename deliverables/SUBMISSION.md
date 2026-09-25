# SnackStudio submission draft

Status: not ready to file. The implementation is a review build, editorial files and physical production are missing, and the full mechanic register contains explicit unfinished items. No submissions or payments have been made.

## Project identity

- Title: SnackStudio: one cookie, taken apart
- Studio: SnackStudio
- Creator: Zach Shallbetter
- Location: Spokane, Washington
- Contact: hi@zachshallbetter.com
- Intended production URL: https://snackstud.io
- Source: https://github.com/SnackStudio/snackstudio-site
- Review deployment: record the verified Vercel URL in RELEASE.md.

## Short description

A product and engineering studio expressed as an edible interface. A pink cookie can be bitten, sliced, and dunked. Its crumbs become navigation. The visitor leaves a sentence in the headline and takes their cookie away as an image.

## Case study

The starting point was four cookie marks and a constraint: every interaction had to come from the cookie. That led to one shared object across scrolling, browsing, and returning to the site. A bite changes the central mark, a tab icon, a saved local state, and the image a visitor can export.

The implementation uses TypeScript and Vite without React or 3D. SVG masks remove bites, GSAP controls the spring and scroll cuts, and Matter.js gives crumbs weight. Browser storage remembers the local cookie; BroadcastChannel connects open tabs. The offline shell is fingerprinted during the build.

The camera is opt-in. A locally served MediaPipe model estimates a shape from jaw landmarks; camera frames are neither stored nor sent to a server. This build does not yet measure the actual bitten edge of a physical cookie. That distinction is visible in the experience.

Motion is an enhancement. Reduced-motion visitors get immediate baking, ordinary cursors, keyboard controls, and text navigation. A known-answer studio input refuses to invent evidence. Missing project and essay files remain visible placeholders.

The shared jar has an optional server endpoint with atomic Redis updates and bounded anonymous state. Its production datastore has not been configured or load-tested. The public build therefore does not display fabricated live counts.

## Submission assets

- `hero.png`: actual desktop capture.
- `mobile.png`: actual mobile-layout capture.
- `share.png`: exported visitor image.
- `case-study-30s.mp4`, `case-study-60s.mp4`, `case-study-90s.mp4`: screen demonstrations, not completed award films.
- `interaction.gif`: an actual bite sequence.
- `lighthouse.report.html` and `.json`: local mobile audit.
- `MECHANICS.md`: constants, fallbacks, checks, and remaining scope.

## Destination-specific edits

| Destination | Proposed angle | Assets prepared | Before filing |
|---|---|---|---|
| Awwwards | A single edible interaction language for a studio site | 60-second demonstration; desktop/mobile captures; build narrative | Complete content and physical run; verify current category, eligibility, rights, fees, and live URL. |
| FWA | Browser-native interaction and local computation | 30-second demonstration; source and technical narrative | Complete the mechanics and verify the current submission format and fees. |
| CSS Design Awards | Visual consistency, interaction, accessibility | Captures, audit, responsive build | Complete editorial content; re-audit production; verify current form requirements. |
| The Webby Awards | An independent studio's participatory web experience | 90-second demonstration; credits and narrative | Verify current eligibility period/category; obtain physical-run footage and all rights/credits. |

The requested titles “Site of the Year” and “FWA of the Month” are ambitions, not awards won or guaranteed application categories. Check the official submission forms at filing time. Nothing in this package asserts an award result.

## Physical production handoff

`physical-run.csv` reserves box numbers 01–50. Recipient and physical bite fields remain empty. Do not print a recipient-specific QR code until its measured bite coordinates and authorized delivery address are supplied. The actual cookies, food handling, mailing, and recordings require human production work.
