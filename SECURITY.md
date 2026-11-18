# Security Policy

## Reporting a vulnerability

Please report security issues privately rather than opening a public issue. Use GitHub private
vulnerability reporting:

**https://github.com/SnackStudio/snackstudio-site/security/advisories/new**

Include a description of the issue and its impact, steps to reproduce (a minimal example is ideal),
and the affected path and version. Do not include credentials in a report.

This is a solo-maintained project. Handling is best-effort with no SLA: there is no guaranteed
response or fix time.

## Scope

SnackStudio is a Vite and TypeScript site with one server function, `/api/pantry`, which uses two
server-only Upstash Redis variables for the shared jar and anonymous ghost crumbs. Camera use is opt-in:
frames stay in memory and go only to an on-device landmark model, and nothing from the camera or
landmarks is sent to the pantry API (see the README). Reports about the pantry API, exposure of the
Redis credentials, anything that sends camera data off the device, and the build and deploy
configuration are in scope. At the time of writing, the application source is on the
`feat/edible-studio` branch (draft pull request #1), not yet on `main`.

## Supported versions

There are no tagged releases. Only the default branch receives fixes.
