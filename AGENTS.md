# Agent Notes — NichePost AI

Context for future coding agents. Keep this updated when behavior changes.

## Tech stack
- Next.js 14 (App Router), React 18, TypeScript strict
- Tailwind (custom palette in `tailwind.config.ts`: `ink`, `panel`, `accent`, `mute`, etc.)
- Vitest + `vite-tsconfig-paths` for tests (Node environment)
- No external auth provider — sessions are HMAC-signed cookies, users live in a JSON file

## Layout
```
app/
  layout.tsx                 root layout, mounts <AnimatedBackground/> globally
  page.tsx                   marketing landing (hero, generator, how-it-works, benefits)
  globals.css                Tailwind + animation keyframes (np-drift-a/b/c, np-grid-pan)
  components/
    AnimatedBackground.tsx   site-wide drifting blobs + grid (fixed, -z-10, prefers-reduced-motion safe)
    AuthShell.tsx            shared shell for /login + /signup (logo, title, panel, footer)
    AuthField.tsx            reusable labeled input with leading icon, error/hint slots
    useCurrentUser.ts        client hook → GET /api/auth/me; powers the generator gate
    GeneratorForm.tsx        gated by useCurrentUser; renders SignInToGenerate when logged-out
    ContentCalendar.tsx      existing
    ResultsDisplay.tsx       existing
  login/page.tsx             email + password, calls POST /api/auth/login
  signup/page.tsx            name + email + password + confirm, calls POST /api/auth/signup
  profile/page.tsx           GET /api/profile on mount; PUT to save; logout button
  api/
    auth/signup/route.ts     POST  → creates user, sets np_session cookie, 201
    auth/login/route.ts      POST  → verifies password, sets np_session, 200
    auth/logout/route.ts     POST  → clears cookie (Max-Age=0)
    auth/me/route.ts         GET   → { user } or { user: null } (never 401)
    profile/route.ts         GET/PUT → 401 if no session; PUT validates name/bio/avatarColor
    generate-content/        Gemini; 401 unless np_session is valid
    generate-image/          Cloudflare Workers AI; 401 unless np_session is valid
lib/
  auth.ts                    JSON-file user store, scrypt password hashing, HMAC sessions
  validation.ts              shared validators (email, password, name, bio, payloads)
  posts.ts / site.ts         existing
tests/
  validation.test.ts         pure validator tests (email/password/name/bio + payloads)
  auth.test.ts               hashing, store CRUD, session sign/verify, buildSessionCookie,
                             userIdFromCookieHeader (uses per-test temp dir)
  routes.test.ts             signup/login/logout + remember-me cookie + 401 on
                             generate-content / generate-image without session
data/users.json              created on first signup; .gitignored
```

## Auth contract
- Cookie: `np_session`, HttpOnly, SameSite=Lax, Secure in production.
- Token shape: `base64url(JSON({ uid, iat })).base64url(HMAC-SHA256)`.
- Token max validity: **30 days** (server-checked in `verifySession`).
- Cookie persistence is set by `buildSessionCookie(token, remember)`:
  - `remember=true` → `Max-Age=2592000` (30 days; persistent on disk).
  - `remember=false` → no `Max-Age` / `Expires` → browser session cookie, dies on browser close.
  - Signup always sets `remember=true` (you just made the account, you want it sticky).
  - Login passes through the user's checkbox choice.
- `SESSION_SECRET` env var (dev fallback string included for local use — replace in prod).
- `AUTH_DATA_FILE` env var overrides the user-store path (used by tests for isolation).
- Passwords: scrypt, 16-byte salt, 64-byte derived key, both stored as hex.
- `toPublicUser()` strips `passwordHash` and `passwordSalt` before any response.

## Auth-gated endpoints
The two generation routes require a valid session:
- `POST /api/generate-content` → 401 `"You must be signed in to generate content."`
- `POST /api/generate-image`   → 401 `"You must be signed in to generate images."`

They use `userIdFromCookieHeader(request.headers.get("cookie"))` from `lib/auth.ts`,
which works in any runtime (it does NOT depend on `next/headers`). Use the same
helper for any future auth-protected route. For pages/route handlers that have
access to `next/headers`, `cookies().get(SESSION.cookieName)?.value` →
`verifySession(token)` is fine too (that's how `/api/profile` and `/api/auth/me` do it).

The home page generator (`app/components/GeneratorForm.tsx`) gates the UI client-side
via the `useCurrentUser` hook in `app/components/useCurrentUser.ts` — when no user
is logged in it renders a `SignInToGenerate` CTA instead of the form. The server
401 is the source of truth; the client gate is just a friendlier UX layer.

## Validation
Field rules live in `lib/validation.ts`. The same functions are imported by both
the React pages (client-side) and the API route handlers (server-side) so the
two never drift. Rules:
- email: standard regex, max 254
- password: 8–128 chars, must include letters AND numbers
- name: 2–60 chars after trim
- bio: optional, max 280
- avatarColor: hex `#RRGGBB`

## UI conventions
- Dark theme, panel cards with `border-hairline bg-panel`, purple gradient CTA.
- Auth pages use `AuthShell` so login + signup match exactly.
- Profile page uses the same panel/field/button styling.
- Background animation is mounted ONCE in `app/layout.tsx` via `<AnimatedBackground/>`
  — do not also mount it in individual pages, it stacks.
- Animation keyframes live in `globals.css`. They are disabled under
  `prefers-reduced-motion: reduce`.

## Tests
- `npm test` runs Vitest once. `npm run test:watch` for watch mode.
- 50 tests across 3 files; all green at last commit.
- Tests use `mkdtempSync` + `AUTH_DATA_FILE` to isolate the user store per test.
- `me` and `profile` route handlers are NOT covered by route tests because they
  call `cookies()` from `next/headers`, which only works inside a real request
  context. Their underlying logic (`verifySession`, `updateUser`) is covered in
  `auth.test.ts` instead.

## Gotchas
- Adding new pages: do not add background animation to the page itself; the
  global one in `layout.tsx` handles it.
- Adding new auth-protected route handlers: prefer
  `userIdFromCookieHeader(request.headers.get("cookie"))` — it works in any
  runtime. Use `cookies().get(SESSION.cookieName)?.value` only when you already
  depend on `next/headers` (page server components, profile/me routes).
- If you change the `SESSION_SECRET`, all existing sessions are invalidated.
- `data/users.json` is the source of truth in dev. Delete it to reset accounts.

## Change log

### 2026-05-03 — Auth + UI overhaul
1. **Auth backend** — added `lib/auth.ts` (scrypt password hashing, JSON-file user
   store, HMAC-signed `np_session` cookies) and `lib/validation.ts` (shared
   client/server validators for email, password, name, bio, payloads).
2. **Auth API routes** — `POST /api/auth/signup`, `POST /api/auth/login`,
   `POST /api/auth/logout`, `GET /api/auth/me`, plus `GET/PUT /api/profile`.
3. **Auth pages** — `/login`, `/signup`, `/profile` built on shared `AuthShell`
   + `AuthField` so all three match the existing dark/purple landing theme.
   Profile page edits name, bio, avatar color, and signs out.
4. **Animated background** — new `AnimatedBackground` component (drifting
   gradient blobs + grid) mounted globally in `app/layout.tsx`. Keyframes in
   `globals.css`; respects `prefers-reduced-motion`.
5. **Landing nav** — added Sign in + Get started links pointing at `/login`
   and `/signup`.
6. **Validation** — every form uses the same validators on both sides of the
   wire so client errors match server errors.
7. **Tests** — added Vitest, `vite-tsconfig-paths`, `vitest.config.ts`, npm
   scripts `test` / `test:watch`. 50 tests, all passing. Tests isolate the
   user store via `AUTH_DATA_FILE` + `mkdtempSync`.
8. **Auth-gated generation** — `POST /api/generate-content` and
   `POST /api/generate-image` now return 401 unless the request carries a
   valid `np_session`. Added `userIdFromCookieHeader` helper for runtime-agnostic
   cookie reading. Home-page `GeneratorForm` swaps to a `SignInToGenerate` CTA
   when `useCurrentUser` reports no user.
9. **Remember-me** — login page has a "Remember me on this device" checkbox.
   Login route reads `remember` and uses `buildSessionCookie(token, remember)`:
   `true` → 30-day persistent cookie, `false` → browser session cookie. Token
   max validity bumped to 30 days. Signup always issues a persistent cookie.
10. **Misc** — `/data/` added to `.gitignore`.
