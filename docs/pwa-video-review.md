# PWA and opening review — 2026-09-30

Implemented locally; not deployed.

- Hero video has play/pause, playback rejection feedback and retry after media errors.
- Reduced motion avoids assigning the video source until explicit playback.
- Opening artwork uses WebP: mobile 1,758,081 → 71,696 bytes; desktop 2,295,115 → 189,904 bytes. Original PNGs remain available.
- Removed the mandatory 1.8-second intro hold and window-load dependency. The transition is 400 ms; the image wait is bounded at 1.2 seconds after hydration.
- Added actual mobile/desktop screenshots, text direction, unrestricted orientation and explicit web-app preference to the manifest.
- Fixed one existing nullable competition check that prevented the production build. Other pre-existing admin changes were preserved.

Validation:

- Production build and TypeScript: pass.
- ESLint for changed TypeScript files: pass.
- Chromium production preview: desktop and 412 × 915 mobile render; no reported page errors; no mobile horizontal overflow.
- Reduced motion: video source absent, intro hidden, content interactive. Manual play and pause pass.
- Simulated rejected play promise: explanatory message displayed. Simulated media error: retry button displayed and playback recovers.
- Manifest screenshot URLs return 200 and decoded dimensions match the declared dimensions.
- Full repository lint remains blocked by the existing set-state-in-effect violation in user-management.tsx.
- Existing verify-pwa.mjs stops at its unrelated coach-license assertion (expected pending qualification, current fixture has UEFA C), before service-worker checks.
- Lighthouse did not produce a usable report: initial Chrome-launcher attempt failed with Windows EPERM; separate remote-debugging browser launch was rejected by execution policy. No before/after score or TBT improvement is claimed.

Outstanding: real S24 Ultra installation/playback test, identification of browser-generated WebAPK versus downloaded APK, and a fresh Lighthouse report after deployment. No Android package was produced or repaired; video MP4 files were not re-encoded.
