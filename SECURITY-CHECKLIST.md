# Security & QA Checklist — Pre-Deployment

## FRD §7 Controls

| # | Control | Status | Evidence |
|---|---------|--------|----------|
| 7.1 | **Rate limiting** on login | ✅ PASS | `src/lib/rate-limiter.ts`: in-memory Map, 5 attempts per 15-min sliding window per IP+email key. Invoked in `src/lib/auth.ts:25` before bcrypt compare. `resetRateLimit()` called on success. |
| 7.2 | **Brute-force protection** | ✅ PASS | Same mechanism as 7.1 — 5 max attempts triggers `TOO_MANY_ATTEMPTS` error thrown from authorize callback, caught by login page and displayed as user-facing error. No account lockout disclosure. |
| 7.3 | **CSRF protection** | ✅ PASS | NextAuth.js v5 provides built-in CSRF token via `__Secure-authjs.csrf-token` cookie. All admin mutations go through fetch() with credentials: 'include' implicitly via same-origin. Server actions require host check. No unprotected GET mutations. |
| 7.4 | **XSS prevention** | ✅ PASS | Input sanitization: Zod validation on all public schemas (`src/lib/validation.ts`). Search/filter values are regex-escaped before $regex: `search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")`. CSP header restricts script-src to 'self' 'unsafe-inline' (required for Next.js). Only `dangerouslySetInnerHTML` usage is JSON-LD structured data (no user input). Email content (nodemailer HTML) is constructed from validated DB fields only. |
| 7.5 | **Secure HTTP headers** | ✅ PASS | `next.config.ts` sets: HSTS (2yr preload), X-Frame-Options DENY, X-Content-Type-Options nosniff, CSP, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy (camera/mic/geo denied). |
| 7.6 | **Input sanitization** | ✅ PASS | All public-facing inputs validated via `publicLeadSchema` (Zod) before DB write. Admin mutations validated via `leadSchema`/`userSchema`/`remarkSchema`. Server action returns field-level errors without exposing internals. Rate-limiter key uses `ip:email` — email is lowercased. |
| 7.7 | **Session security** | ✅ PASS | JWT strategy with 8h `maxAge`. Cookie: `__Secure-authjs.session-token`, httpOnly, sameSite=lax, secure in production. Session expiry enforced server-side. |

## RBAC Enforcement — Server-Side

### Admin Pages (7 routes)

| Route | Auth Gate | RBAC Gate | Status |
|-------|-----------|-----------|--------|
| `/admin/login` | Public | None needed | ✅ |
| `/admin/dashboard` | `getAuthContext()` → redirect | Implicit — all authenticated roles have `view_own_leads` | ✅ (data-scoped) |
| `/admin/leads` | `getAuthContext()` → redirect | Implicit — AGENT scoped to assigned leads only | ✅ (data-scoped) |
| `/admin/leads/[id]` | Client-side `fetch` → 401/403 | API route checks AGENT ownership | ✅ (data-scoped)
| `/admin/reports` | `getAuthContext()` → redirect | `can(role, "access_reports")` → redirect | ✅ |
| `/admin/users` | `getAuthContext()` → redirect | `can(role, "manage_users")` → redirect | ✅ |
| `/admin/settings` | `getAuthContext()` → redirect | `can(role, "view_audit_logs")` → redirect | ✅ |

### API Routes (10 routes)

| Route | Auth Gate | RBAC Gate | Status |
|-------|-----------|-----------|--------|
| `GET /api/leads` | `getAuthContext()` | Implicit — AGENT scoped to own leads | ✅ |
| `PATCH /api/leads/[id]` | `getAuthContext()` | `can("update_lead_status")`, `can("add_remark")`, `can("assign_lead")` + AGENT ownership | ✅ |
| `POST /api/leads/assign` | `getAuthContext()` | `can("assign_lead")` | ✅ |
| `GET /api/leads/export` | `getAuthContext()` | `can("export_data")` | ✅ |
| `GET /api/leads/[id]/activities` | `getAuthContext()` | Implicit — AGENT scoped to own leads | ✅ |
| `GET /api/reports` | `getAuthContext()` | `can("access_reports")` | ✅ |
| `GET /api/reports/export` | `getAuthContext()` | `can("export_data")` | ✅ |
| `GET /api/activities` | `getAuthContext()` | `can("view_audit_logs")` | ✅ |
| `GET/POST/PATCH /api/users` | `getAuthContext()` | `can("manage_users")` | ✅ |
| `GET /api/dashboard/metrics` | `getAuthContext()` | Implicit — data-scoped by role via `getDashboardMetrics()` | ✅ |

**Summary**: All admin pages and API routes enforce authentication server-side. Restricted actions (status update, assignment, export, reports, user management, audit logs, settings) have explicit `can()` permission checks. List-type endpoints (leads list, dashboard metrics) rely on role-based data scoping in the query layer.

## MongoDB Injection Vectors

| Query Location | Method | Safe? | Notes |
|---------------|--------|-------|-------|
| `Lead.find(filter)` — search, status, loanType, date filters | Mongoose query builder | ✅ | All values are pre-validated (Zod or allowlist). Search is regex-escaped. Status/loanType are allowlisted. Date values are `new Date()` cast. |
| `Lead.aggregate([{$match: ...}])` in dashboard.ts, reports.ts | Mongoose aggregation | ✅ | Uses same filter objects built with the same precautions. |
| `User.findOne({ email })` | Mongoose direct field match | ✅ | Email is lowercased before query. |
| `Counter.findOneAndUpdate(...)` | Mongoose operator | ✅ | Uses `$inc` operator — no raw strings. |
| `Activity.create(...)` / `Activity.insertMany(...)` | Mongoose insert | ✅ | Field values come from validated schemas or system-generated descriptions. |
| `user.save()` / `lead.save()` | Mongoose save | ✅ | Values set on document fields, never raw query. |

**Verdict**: Zero raw string interpolation in MongoDB queries. All user-supplied values pass through either Zod validation, allowlist filtering, or regex escaping before reaching the database.

## Environment Secrets

| Variable | Source | Hardcoded? | Status |
|----------|--------|------------|--------|
| `MONGODB_URI` | `process.env.MONGODB_URI` (mongodb.ts:3) | No — read from env | ✅ |
| `AUTH_SECRET` | Auto-read by NextAuth.js from `AUTH_SECRET` env | No — read from env | ✅ |
| `SMTP_HOST/SMTP_USER/SMTP_PASS` | `process.env.*` (notifications.ts) | No — read from env, graceful skip if unset | ✅ |
| `NOTIFICATION_EMAIL` | `process.env.NOTIFICATION_EMAIL` | No — falls back to SMTP_USER | ✅ |
| `WHATSAPP_API_KEY/PHONE_ID/TO` | `process.env.*` (notifications.ts) | No — read from env, graceful skip if unset | ✅ |
| `NODE_ENV` | `process.env.NODE_ENV` (auth.ts) | No — framework-provided | ✅ |

**Important**: `.env.local` contains real credentials (MongoDB URI with password, AUTH_SECRET). The `.gitignore` has `.env*` — verify this before committing any code. For production, use a secrets manager or CI/CD injection instead of a `.env.local` file.

## Input Validation Coverage

| Entry Point | Schema | Zod? | Strictness |
|------------|--------|------|------------|
| Public lead form (server action) | `publicLeadSchema` | ✅ | Name (1-100 chars), mobile (10-digit regex), email, salary/amount (positive), loanType (enum) |
| Admin login | `loginSchema` | ✅ | Email (valid format), password (non-empty) |
| Admin create user | `userSchema` | ✅ | Name (1-100), email (valid), password (min 8), role (enum) |
| Admin add remark | `remarkSchema` | ✅ | Text (1-1000 chars) |
| URL params (search, filters) | Ad-hoc allowlisting | ✅ | Status/loanType filtered against allowlist, search regex-escaped |

## Findings & Recommendations

1. **Minor: Email notification — WHATSAPP_TO env var misuse** (`src/lib/notifications.ts:126`): `process.env.WHATSAPP_TO || process.env.WHATSAPP_TO` is redundant. Should be `process.env.WHATSAPP_TO || ""`. Not a security issue but a correctness bug.
2. **Info: Admin leads page** (`src/app/admin/(dashboard)/leads/page.tsx:31`): Only checks auth, no explicit `can()` call. Functionally safe because all authenticated roles have `view_own_leads`, but adding `can(role, "view_own_leads")` would improve defense-in-depth.
3. **Info: Dashboard page** (`src/app/admin/(dashboard)/dashboard/page.tsx:9`): Same as above — only checks auth, no `can()` call.
4. **Info: `GET /api/leads`** and `GET /api/dashboard/metrics`: Same pattern — no explicit `can()` check, but data-scoped by role.
5. **Info: `AUTH_URL` + `NEXTAUTH_URL`** in `.env.local` are set to `http://localhost:3000` — must be updated to production URL before deployment.
6. **Info: Session `maxAge: 8h`** — reasonable for CRM admin. Consider shorter (4h) for higher security environments.
7. **Good: Password hashing** uses bcrypt with 12 salt rounds (seed.ts + users/route.ts + auth.ts).
8. **Good: Activity collection is append-only** — verified no update/delete operations exist on Activity model anywhere in the codebase.
