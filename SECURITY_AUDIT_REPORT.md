# AI Career Mentor Security Audit

**Assessment date:** 2026-11-24  
**Status:** Focused remediation completed; several architecture and deployment actions remain. This audit does not certify that the application is secure.

## 1. Project overview

### Architecture discovered

- Frontend: React 18, Vite 8, React Router, `react-markdown`, browser `fetch`/Axios dependencies.
- Backend: Python 3.12 test environment, FastAPI 0.104, Pydantic 2, SQLAlchemy 2, PostgreSQL in the stated deployment architecture, SQLite used for tests.
- Authentication: bearer JWTs signed with a configured HMAC key; bcrypt via Passlib; access and refresh tokens are both returned from login.
- AI: backend service named `GrokService`, calling the Groq-compatible API endpoint.
- Files: resume PDF/DOCX and profile images stored on the backend filesystem.
- Deployment/configuration: Vercel rewrites, Render-compatible FastAPI app, Dockerfile and docker-compose, `.env.example`, requirements and npm lockfiles.

### Files and areas inspected

Inspected the frontend app/router, API helpers, auth and protected-route components, all page modules under `src/pages`, navigation/context components, translation setup and locale files. Inspected backend application startup/config/database code, every module in `backend/app/api`, `models`, `schemas`, `services`, `utils` and `ml`, plus existing tests, requirements, seed/setup scripts, Docker files, deployment files, and environment templates. Generated dependency folders, caches, and build output were excluded from source review.

The API modules `onboarding.py`, `users.py`, `progress.py` and `search.py` exist but are not included by `app.main`; their source was reviewed, but those routes are not reachable through this FastAPI app as currently assembled.

## 2. Original security findings

| Finding | Severity | Affected area | Original issue and impact | Remediation |
|---|---|---|---|---|
| Database credential in tracked environment template | **High** | `backend/.env.example` and Git history | A populated database credential was committed in a template. If still valid, it could permit direct database access. | Replaced it in the current file with a placeholder. Git history was not rewritten; rotation and history cleanup remain required. |
| Private resume files exposed by broad static mount | **High** | `backend/app/main.py` | `/uploads` served both public profile images and private resume files without authentication. A guessed or leaked stored filename could expose resumes and extracted personal data. | Static serving is limited to `uploads/profile`; resumes use an authenticated owner-checked download route with private/no-store caching. |
| Upload validation trusted extension/MIME metadata | **High** | `resume.py`, `resume_service.py`, `profile.py` | Resume validation did not check file bytes, used client-derived names, read unbounded data into memory, and permitted malformed DOCX/PDF content. Profile images trusted MIME type and were unbounded. | Added byte-signature/ZIP-structure checks, random resume names, sanitized display names, size limits, DOCX expansion/member limits, bounded PDF/DOCX text extraction, image decoding/dimension checks, and exclusive server-generated photo names. |
| Generic exception handler returned internal errors | **Medium** | `backend/app/main.py` | Unhandled exception details were returned to clients, potentially disclosing database/provider/configuration internals. | Client receives a generic error; details remain in server logs. |
| AI and interview data was written to logs/errors | **Medium** | AI, interview, career, quiz and resume modules/services | Raw AI responses, ML input features, exception messages and provider response bodies could contain user answers, resume text, or internal details. | Removed prompt/response and feature dumps; sanitized API/provider errors and removed raw provider-body reporting. |
| No effective shared request throttling | **Medium** | Login, AI, resume, interview, quiz, career prediction | Expensive endpoints could be repeatedly invoked, enabling credential guessing and resource/cost exhaustion. An in-memory limiter would not cover Render replicas. | Added atomic PostgreSQL/SQLite database-backed counters shared across application instances for login and expensive endpoints. |
| Password length could exceed bcrypt’s 72-byte input | **Medium** | Auth schemas, user schemas, password hashing | Bcrypt truncates input after 72 bytes, which can make distinct long passwords equivalent. The password-change API also lacked the registration policy. | Enforced a 72 UTF-8 byte maximum at hash/verify boundaries and consistent length/uppercase/digit requirements for registration and password changes. |
| Token class was not validated by API authentication | **Medium** | `security.py`, `dependencies.py` | API dependencies accepted any valid JWT with a subject, including refresh-class tokens. | Access tokens now have `type=access`; API authentication rejects refresh tokens and validates a non-empty string subject. Legacy untyped access tokens remain accepted temporarily for compatibility. |
| Password reset and email verification were placeholder success responses | **Medium** | `backend/app/api/auth.py` | Verification did not validate its token; reset reported success without changing a password; forgot-password suggested mail was sent when no mail service existed. | Added SMTP-backed verification/reset links, sign-in gating until verification, resend throttling, generic reset responses, and 30-minute reset tokens bound to the current password hash so successful use invalidates replay. SMTP configuration remains required. |
| Production settings accepted unsafe defaults | **Medium** | `backend/app/config.py` | Debug defaults, localhost CORS entries, default DB credentials and placeholder secrets could be used accidentally in production. | Production startup validation now rejects debug mode, weak/placeholder secrets, default/local DB URLs, placeholder AI keys, non-HS256 JWT algorithms and non-HTTPS/local origins. CSV list settings are parsed. |
| Missing browser/API security headers and broad CORS | **Medium** | `backend/app/main.py`, `vercel.json` | Broad methods/headers and missing browser policies increased cross-origin and browser attack surface. | Restricted CORS methods/headers; added CSP and browser headers on Vercel and API headers including HSTS in production. |
| Unbounded AI inputs and provider errors | **Medium** | AI schemas and `GrokService` | Requests could be oversized and provider error bodies could escape into user-visible errors/logs. | Bounded AI fields and prompt sizes; clamped provider timeout; generic provider failures; AI output remains rendered through `react-markdown` without raw HTML injection. |
| Vulnerable frontend dependency versions | **High/Medium** | `package.json`, `package-lock.json` | Initial online npm audit reported high advisories in Axios, `follow-redirects`, `source-map-js` and Vite, plus moderate advisories in i18next, PostCSS selector parser and React Router. | Updated lock-resolved compatible packages and upgraded i18next after reviewing its simple static-resource usage. High advisories cleared. Two moderate React Router advisories remain because their fix requires a major v7 upgrade. |

### Authorization review

Reviewed all route modules and user-owned query patterns. User data routes generally scope reads and writes by the authenticated user's ID; resume analysis/delete, interview sessions, notifications, roadmaps, course progress, quiz sessions and project records contain server-side ownership checks. The new resume download repeats the owner check in its query. Catalog/search endpoints return public career/course/job/project content. No confirmed cross-user IDOR was found in the mounted route set. The unmounted route modules are not reachable and should be reviewed again if mounted later.

## 3. Files changed

| File | Change and security purpose | Functionality impact |
|---|---|---|
| `backend/.env.example` | Removed the populated database credential; added limiter settings. | Template only; configure actual deployment values separately. |
| `backend/app/api/ai.py` | Added input limits, per-user shared throttling, and generic provider errors. | AI contract/routes remain the same. |
| `backend/app/api/auth.py` | Throttled login, validated verification tokens, removed fake reset success, kept forgot response generic, used configured access lifetime. | Reset cannot claim success without a delivery/token flow; this exposes an existing incomplete feature. |
| `backend/app/api/career.py` | Throttled career prediction and sanitized errors. | Route and response shape preserved. |
| `backend/app/api/interview.py` | Added input bounds and shared throttling; removed error details from responses/logging. | Routes remain; error text is less detailed. |
| `backend/app/api/profile.py` | Bounded and decoded photos, enforced dimensions and actual image format, used configured upload directory and random names. | JPG/PNG/WEBP remain supported, now capped at 5 MB and 20 MP. |
| `backend/app/api/quiz.py` | Added shared generation throttling and sanitized errors. | Quiz route contract remains. |
| `backend/app/api/resume.py` | Bounded upload reads, validates file bytes, sanitizes filenames, added protected owner-only download and generic errors. | New download route; existing upload/analysis/delete routes remain. |
| `backend/app/api/users.py` | Applied password-change policy and restricted preference fields. | Supported preference fields still work; unsupported keys now return 400. |
| `backend/app/config.py` | Production validation and list-setting parsing; rate-limit settings. | Production deployments must set valid explicit environment values. |
| `backend/app/db.py` | Imports the new limiter model so `create_all` recognizes its additive table. | Creates one additional table; no existing tables/data are dropped. |
| `backend/app/main.py` | Restricted static files to profile photos, added request-size/security headers, tightened CORS, hid error details. | Resume access is now through authenticated download; profile image URLs remain public. |
| `backend/app/schemas/auth.py` | Added bcrypt byte-length limit to registration password validation. | Existing password requirements remain. |
| `backend/app/schemas/user.py` | Added bcrypt byte-length limit to password-change schema. | Existing password requirements remain. |
| `backend/app/services/auth_service.py` | Uses configured access-token expiration. | Preserves current 30-minute default. |
| `backend/app/services/grok_service.py` | Bounds prompt size/time, hides provider bodies, removes raw AI output and parsing logs. | Provider failures are reported generically; fallback behavior remains. |
| `backend/app/services/interview_service.py` | Removed raw question/AI/error logging. | Interview generation/fallback behavior remains. |
| `backend/app/services/ml_service.py` | Removed logs containing ML input features. | Prediction behavior unchanged. |
| `backend/app/services/resume_service.py` | Validates PDF/DOCX signatures/structure, uses UUID filenames, caps archive expansion and extracted text, removes sensitive logging. | Only valid supported PDF/DOCX files are accepted. |
| `backend/app/utils/dependencies.py` | Separates access and refresh tokens; makes optional bearer auth genuinely optional. | Legacy untyped access tokens are temporarily accepted. |
| `backend/app/utils/security.py` | Handles bcrypt byte limits safely, adds access token type, requires valid subject. | API access tokens now include a claim; refresh tokens remain separately typed. |
| `backend/app/models/rate_limit.py` **(new)** | Shared limiter bucket table. | Additive database table. |
| `backend/app/utils/rate_limit.py` **(new)** | Atomic shared rate-limit upsert for PostgreSQL/SQLite and stale counter cleanup. | Adds database writes for throttled endpoints. |
| `backend/tests/test_auth.py` | Replaced stateful/broken tests with isolated SQLite cases; added login, refresh rejection, resume ownership and invalid token tests. | Test-only. |
| `backend/tests/test_security_hardening.py` **(new)** | Regression coverage for file validation, password boundaries, JWT type/subject, production settings, rate limit and headers. | Test-only. |
| `package.json` | Upgraded i18next to patched 26.x. | Initialization and bundled locale usage were reviewed; post-upgrade build could not be verified locally. |
| `package-lock.json` | Updated patched dependency resolutions including Axios, follow-redirects, Router 6 latest, Vite, source-map-js and PostCSS selector parser. | No intentional API changes; lockfile install is required in CI/deployment. |
| `vercel.json` | Added CSP, frame, MIME, referrer and permissions policies. | CSP allows HTTPS connections/images to retain external API/resource functionality. |
| `SECURITY_AUDIT_REPORT.md` **(new)** | This audit record. | Documentation only. |

## 4. New files created

- `backend/app/models/rate_limit.py`
- `backend/app/utils/rate_limit.py`
- `backend/tests/test_security_hardening.py`
- `SECURITY_AUDIT_REPORT.md`

No destructive migration or production database command was run. The existing startup `Base.metadata.create_all` will create the additive limiter table when deployed; alternatively, apply an equivalent reviewed migration before deploying if production database permissions do not allow application DDL.

## 5. Security protections implemented

- Private resumes are outside static file serving, protected by authentication and a user ownership predicate, returned with `private, no-store`, and checked to remain inside the configured upload directory.
- Uploads have bounded reads, random storage names, extension and content checks, DOCX ZIP structure/expansion/member checks, profile image decoding/format/dimension validation, and text extraction limits.
- Shared PostgreSQL/SQLite request counters throttle login, AI, resume, interview, quiz generation and career prediction. Values are hashed before storage. No per-process in-memory limiter is used.
- JWT algorithm remains explicitly pinned to configured algorithm; production requires HS256. Subject and expiry are checked by JWT decode; access and refresh token classes are separated.
- Password inputs respect bcrypt's 72-byte boundary on both hashing and verification.
- Production settings fail fast for debug mode, weak/placeholder JWT secret, placeholder database/AI config, local database URLs, unsafe JWT algorithm, or non-HTTPS/local CORS origins.
- Vercel and API security headers are added; CORS methods and request headers are narrowed.
- AI prompt/output/error logging was reduced; AI request size and timeout are bounded; raw HTML is not enabled in React Markdown.
- User preference updates are allow-listed to prevent arbitrary profile-field assignment.

## 6. Testing results

| Check | Result |
|---|---|
| Python compile check (`python -m compileall -q app tests`) | **Passed** |
| Backend pytest suite | **14 passed**, 76 warnings. Uses isolated SQLite; does not exercise production PostgreSQL. Includes verification, unverified-login rejection, and reset-token replay checks. |
| Regression cases | Registration/login/current user, invalid password, refresh-token rejection, resume owner-only download/static denial, invalid reset/verification tokens, upload signatures/size, password byte limit, production config, DB rate counter, security headers. |
| Frontend production build before dependency remediation | **Passed** on the original installed Vite 8.2.1 tree. |
| Frontend production build after dependency remediation | **Built successfully** with cached Vite 8.2.1/Rolldown 1.2.3 into an ignored local preview directory. The lockfile pins patched Vite 8.3.8; its Windows native binding was unavailable in the local npm cache, so the exact lockfile build remains **not verified locally**. |
| Frontend tests | **Not available**: `package.json` has no test script. |
| npm audit after lock updates | **No high/critical advisories** (`npm audit --audit-level=high` exits successfully). Default audit still reports **2 moderate React Router advisories**; v7 is the available fix and was not applied due to major-version compatibility risk. |
| Python dependency audit | **Not run**: `pip-audit`/Safety are not installed in the project environment; no audit tool was installed. |
| Bandit | **Not run**: not available in the environment. |
| Live PostgreSQL, Render, Vercel, email, Grok and full browser auth flows | **Not tested**: external credentials/services and deployed configuration were not exercised. |

Warnings remaining in pytest include existing Pydantic class-config/FastAPI startup deprecations, deprecated PyPDF2, SQLAlchemy relationship overlap warnings, and `utcnow` deprecations. They did not fail tests.

## 7. Before and after

| Area | Before | After |
|---|---|---|
| Resume exposure | All uploads reachable under static `/uploads`. | Only profile photos static; resumes require authenticated, owner-checked download. |
| Resume storage | Timestamp and client filename-derived paths; extension-only check. | UUID storage names; path-normalized display name; PDF/DOCX content checks and bounded parsing. |
| Profile images | MIME-only, unbounded read. | 5 MB cap, decoded format verification, 20 MP cap, random exclusive filename. |
| API errors/logging | Raw errors and AI/interview/ML contents could leak. | Generic client errors; sensitive output/input dumps removed. |
| Rate limits | None shared across processes. | Atomic database-backed limits for expensive endpoints/login. |
| JWT | API dependency did not check token class or subject type. | Access-token type and subject validation; refresh token rejected as API access. |
| Production config | Debug/local origins/default DB values could be accepted. | Production startup rejects known unsafe defaults. |
| Dependency audit | 4 high and 4 moderate findings in initial full audit. | High findings cleared; 2 moderate Router advisories remain. |

## 8. Remaining risks

- **High:** A database credential was present in Git history. Current template is scrubbed, but old commits remain accessible until that credential is rotated and history access is addressed.
- **Medium:** Access tokens are stored in browser `localStorage`, so an XSS flaw could steal them. CSP reduces exposure but does not make localStorage equivalent to HttpOnly cookies. A cookie migration would require coordinated CSRF/session work and was not attempted.
- **Medium:** Refresh-token rotation, reuse detection, revocation, and server-side logout are not implemented. Logout currently relies on the frontend deleting local tokens; an already-issued access token remains valid until expiry.
- **Medium:** Email and password reset delivery require valid SMTP settings and a correct `FRONTEND_URL`. Reset links are invalidated after password change; verification links are signed and expire after 24 hours. SMTP delivery and deployed links were not exercised locally.
- **Medium:** React Router 6 remains on a version with two moderate advisories; the available fix is major v7. The current app uses client-side navigation and no SSR hydration, reducing applicability of one advisory, but it is not considered resolved.
- **Medium:** AI requests send user-provided content and resume text to the configured external provider. Prompt injection cannot be eliminated; users should be informed of this processing and production retention/provider terms reviewed. No resume anonymization was added.
- **Low/Medium:** Database-backed limits are keyed per account/user, not by trusted client IP. They do not cover every cheap route (registration/catalog/search), and production PostgreSQL upsert behavior was not executed in tests. Add a trusted edge/WAF limit for IP-wide abuse if needed.
- **Low/Medium:** The global body middleware rejects oversized `Content-Length`; chunked non-upload requests depend on endpoint/schema limits. Resume/photo reads have explicit limits.
- **Low:** CSP `connect-src https:` intentionally allows HTTPS destinations broadly so the configured Render API and resource links keep working. Narrow this to the exact production API host after confirming the Render hostname.
- **Low:** Some catalog endpoints use permissive pagination parameters; clamp them before exposing catalogs to untrusted high-volume traffic.
- Python dependency vulnerabilities were not assessed by an installed advisory scanner; pinned older Python dependencies warrant a `pip-audit` run in CI.

## 9. Manual actions required

1. **Rotate the database credential that appeared in the committed template.** Also rotate it anywhere it may have been reused. Do not reuse the old value.
2. Remove the old credential from Git history using your repository's approved history-rewrite process, then coordinate force-push/clones. This audit did not rewrite history.
3. In Render, set `ENVIRONMENT=production`, `DEBUG=false`, a randomly generated `SECRET_KEY` of at least 32 characters, `ALGORITHM=HS256`, the rotated `DATABASE_URL`, `GROK_API_KEY`, and `ALLOWED_ORIGINS` containing only the exact HTTPS Vercel origin(s). Confirm upload directory persistence and database DDL permission for the new limiter table.
4. In Vercel, confirm `VITE_API_BASE_URL` points to the production Render API. Confirm the CSP `connect-src` allows only the actual API/resource hosts needed by the product.
5. Configure and exercise SMTP in the deployment environment. Add refresh-token rotation/revocation and server-side logout in a coordinated auth migration.
6. Resolve the remaining React Router advisory in a dedicated v7 compatibility change and get a successful production build in CI/Node Linux before deployment.
7. Run `pip-audit`/Bandit in CI after installing approved pinned tooling, and run production PostgreSQL/CORS/AI/upload integration checks with staging credentials.

## 10. Final security assessment

- **Critical issues remaining:** 0 confirmed.
- **High issues remaining:** 1 operational secret exposure in Git history until rotation/history remediation is complete.
- **Medium issues remaining:** localStorage token exposure risk, missing refresh/logout revocation and email recovery flows, 2 moderate dependency advisories, external AI data handling, and incomplete IP-wide throttling.
- **Low issues remaining:** broad HTTPS CSP connection allowance, some pagination/body edge cases, and dependency scanner coverage.
- **Remediation status:** Safe source-level fixes and regression tests are complete for the findings listed above. The project is **not ready for a clean security sign-off** until the manual actions are completed and the updated frontend build and Python dependency audit pass.
