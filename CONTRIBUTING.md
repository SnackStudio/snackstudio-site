# Contributing to SnackStudio

Thanks for your interest. The commands below are the ones the [README](README.md) documents.

## Setup and checks

```bash
npm install
npx playwright install chromium   # one-time browser install
npm run dev                       # local dev server
npm run build                     # type-check, build and write the offline shell
npm run preview -- --port 4173    # preview the build
npm test                          # Playwright tests, against the preview on port 4173
npm run audit                     # Lighthouse mobile profile, against the preview; Chrome required
npm run format                    # Prettier
```

Run `npm test` and `npm run audit` with the preview serving on port 4173. At the time of writing the
application source is on the `feat/edible-studio` branch (draft pull request #1), not yet on `main`.

## Conventions

- The stack is Vite, TypeScript, GSAP, Matter.js and on-device MediaPipe. No React, no 3D.
- Never expose Redis credentials through Vite variables; they are server-only. See `.env.example` on the application branch.
- Do not fabricate worldwide counts when the pantry service is not configured, and keep camera data on the device.
- Commit subjects use a conventional prefix such as `feat:` or `chore:`, as the history does.
- Open a pull request against `main` and fill in the pull request template: what and why, how it was verified, and notes.

## Conduct, support and security

See [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), [`SUPPORT.md`](SUPPORT.md) and [`SECURITY.md`](SECURITY.md).
