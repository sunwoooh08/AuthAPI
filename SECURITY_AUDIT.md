# Security Audit — AuthAPI

Branch: `claude/investigate-security-vulnerabilities-LWJgG`
Date: 2026-04-23
Scope: Full repository review of authentication / authorization surface.

> Note: Much of this codebase is scaffolding with empty method stubs.
> Findings include both exploitable defects and **missing security
> controls that must exist before this API can be deployed**.

## Critical

### C1. Plaintext passwords — no hashing anywhere
- **Location**: `src/auth/service/auth.service.ts` (empty `signUp`), `prisma/prisma/schema.prisma:20` (`userPassword: String`), `src/auth/controller/dto/signup.dto.ts`
- **Impact**: Any database leak exposes every password in clear text. Credential stuffing against other sites becomes trivial.
- **Fix**: Hash with `argon2id` (preferred) or `bcrypt` cost ≥ 12 before persisting. Never log or return the hash.

### C2. No JWT issuance or verification
- **Location**: `src/auth/controller/token.controller.ts`, `src/auth/service/auth.service.ts`
- **Impact**: `signIn`, `refreshToken`, `signOut` are empty stubs. No access/refresh tokens are produced, no signature verification exists. Any caller can hit downstream endpoints because nothing validates identity.
- **Fix**: Use `@nestjs/jwt` with `HS256` (with a ≥256-bit secret) or `RS256`. Require `iss`, `aud`, `exp` (≤15 min access, ≤7d refresh), and rotating refresh tokens.

### C3. Missing `@UseGuards` on sensitive controllers
- **Location**: `src/auth/admin/admin.controller.ts`, `src/auth/controller/token.controller.ts`, `src/auth/controller/email.controller.ts`
- **Impact**: Admin, token refresh, and email-reset endpoints are reachable unauthenticated.
- **Fix**: Define `JwtAuthGuard` and `RolesGuard`; apply on every non-public route. Add a default-deny policy via `APP_GUARD` and mark public endpoints with a `@Public()` decorator.

### C4. No DTO validation on auth inputs
- **Location**: `src/auth/controller/dto/signin.dto.ts`, `signup.dto.ts`, `reset-*.dto.ts`
- **Impact**: Email format, password strength, field types, and lengths are unenforced. Enables malformed payloads, NoSQL operator injection, and mass-assignment.
- **Fix**: Add `class-validator` decorators (`@IsEmail`, `@IsString`, `@Length`, `@Matches`). Enable `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` globally.

### C5. `decryptData()` is empty while pipe trusts its output
- **Location**: `src/common/utils/decrypt-data.ts:1`, `src/common/pipe/decode-body.pipe.ts:17-18`
- **Impact**: When `BODY-DATA-ENCRYPTION` is enabled the pipe casts raw bytes to `object` with no decryption or schema check — an attacker controls the parsed body directly.
- **Fix**: Implement AES-256-GCM with a random IV per message, authenticated AAD binding to route/user, and revalidate with a Zod/DTO schema after decryption.

### C6. Password stored unencrypted even at rest
- **Location**: `prisma/prisma/schema.prisma:20`
- **Impact**: Compounds C1 — column is also unencrypted at the datastore layer.
- **Fix**: Store only the hash. Add a `@map("password_hash")` column and never persist the plaintext.

## High

### H1. No rate limiting on login / reset / signup
- **Location**: `src/auth/controller/auth.controller.ts`, `src/auth/controller/email.controller.ts`
- **Impact**: Online password brute force and reset-code brute force.
- **Fix**: Add `@nestjs/throttler` globally (e.g. 10 req/min) plus per-route stricter limits (5/15min on login, 3/hour on reset).

### H2. Reset-code field typed as `number`
- **Location**: `src/auth/controller/dto/reset-process.dto.ts`
- **Impact**: `code: number` (no length/range) invites short codes that can be brute forced in seconds.
- **Fix**: Use a 128-bit random URL-safe token, time-box to ≤15 min, single-use, bound to the user id and IP/UA fingerprint.

### H3. Redis cache TTL of 1 hour applied globally
- **Location**: `src/app/app.module.ts:20`
- **Impact**: If OTPs, reset tokens, or session state share the default TTL they live longer than necessary, widening the replay window.
- **Fix**: Per-key TTL; never reuse the global default for auth material.

### H4. CORS origin parsing is fragile
- **Location**: `src/app/main.ts:14-20`, `.env.example` (`CORS-ORIGIN`)
- **Impact**: Comma-space split + `credentials: true`; an empty env var collapses to an empty whitelist that some Express middleware treats as "allow all". Request smuggling / CSRF surface.
- **Fix**: Parse to a strict array, reject empty, disallow wildcards, require HTTPS origins in production, fail-closed.

### H5. No account-state check on signin
- **Location**: `prisma/prisma/schema.prisma:27` (`isInactivated`), `src/auth/service/auth.service.ts`
- **Impact**: Disabled/banned accounts can still authenticate once auth is wired.
- **Fix**: After credential check, reject if `isInactivated` or email not verified.

### H6. No session revocation / logout
- **Location**: `src/auth/controller/auth.controller.ts` (empty `signOut`)
- **Impact**: Issued tokens can't be invalidated — stolen tokens remain valid until natural expiry.
- **Fix**: Maintain a per-user token version (`tokenVersion`) in DB or a Redis denylist keyed by `jti` with TTL = remaining token lifetime.

## Medium

### M1. Swagger exposed unconditionally
- **Location**: `src/app/main.ts:22`, `src/app/lib/swagger.ts:14`
- **Impact**: Full API surface disclosed in production, easing recon.
- **Fix**: Gate on `NODE_ENV !== 'production'` or the `ENABLE-SWAGGER-ON` flag.

### M2. No HSTS / hardened Helmet config
- **Location**: `src/app/main.ts`
- **Impact**: `helmet()` default only; no HSTS preload, no CSP suited for this API.
- **Fix**: `helmet({ hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }, contentSecurityPolicy: {...} })`.

### M3. Plaintext IP array stored per user
- **Location**: `prisma/prisma/schema.prisma:24`
- **Impact**: Long-term PII retention without purpose limitation; GDPR/PIPA exposure.
- **Fix**: Store salted hashes or truncated `/24` aggregates; add retention policy.

### M4. Generic decrypt errors may leak behavior
- **Location**: `src/common/pipe/decode-body.pipe.ts:20`
- **Impact**: Same error class regardless of cause — fine, but stack traces may leak through default exception filter.
- **Fix**: Global exception filter that returns sanitized responses and logs full context server-side only.

### M5. No audit logging of auth events
- **Location**: `src/common/logging/logging.interceptor.ts` (empty)
- **Impact**: Breaches and brute force attacks are undetectable.
- **Fix**: Structured logs (JSON) for signin, signout, reset request/complete, admin actions — with user id, IP, UA, result.

## Low

### L1. Empty stubs elsewhere (`redis.service.ts`, `admin.service.ts`, `cookie.service.ts`)
- Secure cookie service must set `HttpOnly`, `Secure`, `SameSite=Strict|Lax` once it exists.

### L2. `.env.example` doesn't separate dev vs prod; no validation on startup.
- **Fix**: Add `@nestjs/config` schema validation with `Joi` — fail fast when `JWT_SECRET` is weak or missing.

### L3. `DATABASE_URL` unvalidated.
- **Fix**: Assert scheme (`mongodb+srv://`), credentials presence, TLS.

### L4. No transaction wrappers on multi-step auth flows.
- **Fix**: Wrap signup + token issuance in `prisma.$transaction`.

---

## Summary
- Critical: 6
- High: 6
- Medium: 5
- Low: 4

**Blocking**: C1–C6 must be fixed before this project can authenticate any real user.
