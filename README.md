# SnackStudio

Vite + TypeScript, GSAP, Matter.js and on-device MediaPipe. No React, no 3D.

## Development

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview -- --port 4173`
- `npx playwright install chromium` (one-time browser install)
- `npm run format`
- `npm test` (against the preview on port 4173)
- `npm run audit` (against the preview on port 4173; Chrome required)

Vercel uses `npm run build`, output `dist`, and the `/api/pantry` function. Configure the two server-only Upstash Redis variables in `.env.example` for the shared jar and anonymous ghost crumbs. Never expose Redis credentials in Vite variables. Without that service the local experience works and worldwide counts are not fabricated.

Original supplied PNGs are in `public/brand`. The four requested vector originals, WORK.md, ESSAYS.md, recipient list, commissioned audio, and session footage were not supplied. Missing editorial content is visible on the site. See MECHANICS.md for implementation and limitations; deliverables/ contains submission materials and acceptance checks.

Camera permission is explicit. Frames stay in memory and go only to a locally running landmark model. Model files and WASM runtimes are served from public/models and loaded only after opting in; see MECHANICS.md. Nothing from camera or landmarks is sent to the pantry API. Jaw landmarks estimate a bite; they cannot measure the actual cookie's bitten edge.

## Deployment and review

`vercel deploy --prod --yes --project snackstudio-site` publishes to the authenticated Vercel account. The custom domain must belong to that account before attaching it. GitHub publication uses a new `SnackStudio/snackstudio-site` repository; do not modify existing SnackStudio applications.

`npm run build` creates a fingerprinted offline shell and a real 404 document. `npm run audit` measures a mobile profile. Supplied PNG files remain the source of truth; any compressed delivery copies must preserve their geometry.

## Status

The default branch currently holds only this README, the license and `.gitignore`. The application source, the `npm` scripts above and the deliverables are on the `feat/edible-studio` branch (draft pull request #1). The package is private and untagged, and the repository has no CI workflow. See MECHANICS.md on that branch for limitations.

## License

MIT. See [LICENSE](LICENSE).
