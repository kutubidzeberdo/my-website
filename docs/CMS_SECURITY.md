# CMS security implementation and limits

## Phase 4.2 public cutover

Public frontend queries explicitly enforce published/active state and `overrideAccess: false`. Anonymous Media reads are restricted to assets referenced by published content, active collections or public globals; draft-only uploads remain private. Shared-file deletion is guarded. Public social/telephone destinations are validated. Site Settings contains public display information, not Gmail OAuth credentials. See [the Phase 4.2 report](PHASE4_2_IMPLEMENTATION_REPORT.md).

## Authentication

Payload 3.92.0 handles all password hashing and authentication. Its installed implementation uses salted PBKDF2-SHA256 (600,000 iterations, random 32-byte salt); application code does not derive or encrypt passwords. No plaintext password column is defined. API tests check absence of password/hash/salt in returned users. Password input is checked for 14–1024 characters, preserving strong passphrases. Native authentication fields and hash internals are retained.

Username-only login is enabled with a required recovery email. Public registration and unauthorized first-user creation are blocked by a server hook. First super administrator creation uses a guarded CLI, PostgreSQL transaction/advisory lock and hidden or randomly generated credentials; it refuses if users already exist.

Regular native sessions expire after two hours; the Phase 4.1 Remember Me extension caps remembered sessions at 30 days, preserves native revocation and does not return tokens; production cookies are Secure, HTTP-only and SameSite=Lax. Responses omit authentication tokens; the admin uses cookies. Five failed login attempts cause a 15-minute native lockout. Deactivation blocks login and clears sessions; permissions check active status. Logout invalidates the session. Trusted CMS origins use the configured server URL, with native CSRF/origin enforcement; CMS_SERVER_URL supports an isolated local test port.

The official SMTP adapter enables native expiring, single-use password recovery when configured. Without SMTP, forgot-password returns the same service-unavailable result before account lookup; no default development mail/token logger is used. The native reset flow was tested offline using a disposable account: success, minimum password policy, rejection of reused/expired tokens, rejection of the old password and acceptance of the replacement. Live recovery email delivery and a full mail/reset browser round trip remain untested. Gmail OAuth code/settings were not changed.

## Authorization

Roles: Super Administrator, Administrator, Editor, Author and Viewer. Every managed section has server-enforced read/create/update/publish/delete permissions. Optional per-user section entries replace role defaults for that section, including an empty action list to deny access. Duplicate entries are rejected. Roles and granular permissions can be assigned only by a super administrator; ordinary users cannot grant themselves permissions. Administrators can manage content by default; user management needs explicit delegation or a super administrator.

Authors can create their own News/Project drafts, edit only their own records and cannot publish by default. Published records remain publicly readable; authors can read their own drafts. Other collections use their section permissions. Viewer has read-only defaults. Globals have update/read checks; official logo replacement is additionally restricted to super administrators/administrators. Audit Logs are readable only by active super administrators/administrators and cannot be modified through ordinary APIs.

User writes serialize with a PostgreSQL transaction advisory lock. Before demotion/deactivation/deletion, the hook checks for another active super administrator within the transaction. The last active super administrator is protected. Test coverage verifies direct API denial; concurrent multi-process stress testing is not claimed.

User-facing operations use native Payload access enforcement. Trusted local import/bootstrap scripts explicitly use overrideAccess:true with server-only context; they are not HTTP endpoints. Tests use real restricted REST calls. Do not copy the trusted import access mode into user-request handlers.

## Content, uploads and audit

Lexical uses official formatting/upload features plus structured gallery and allowlisted HTTPS YouTube/Vimeo blocks. Hooks reject script/HTML nodes and unsafe URL schemes. No public HTML renderer or frontend query switch was added. Future frontend rendering must use safe Lexical components rather than raw HTML.

Media requires authorized access, supported image MIME and matching Sharp-detected content, a 10 MB limit, a 40-megapixel metadata limit and randomized server-owned filenames. SVG/executables are excluded. Native image derivatives and relationships are used. Production Spaces integration uses the official S3 adapter, enabled only with private environment credentials; local uploads are not suitable for App Platform persistence.

Audit records include actor relationship, action, section, record ID, timestamps and confirmed-success outcome. User role/permission/active changes are identified without recording their sensitive values. Draft/publication changes are identified. Logging uses a savepoint in the primary transaction, so audit errors can roll back auxiliary work without aborting successful CMS changes. Failure events are not recorded where the outcome cannot be established reliably. No passwords, tokens, OAuth credentials or private request bodies are logged by custom audit code.

## Database and environment

PostgreSQL 17.11:5433 uses pmc_app owning pmc_cms with no superuser/createdb/createrole/replication/bypassrls privileges. Password is SCRAM-stored and enforced by scoped server rules. Existing PostgreSQL 13 is untouched. Secrets remain in ignored mode-0600 .env.local; initial admin credentials/backups are private and ignored. Production needs separate migration/runtime privileges, TLS, encrypted environment settings and tested backups.

## Remaining risks and checks

- npm audit after patched DOMPurify/Happy DOM overrides reports five moderate advisories in the drizzle-kit / legacy esbuild migration-tooling chain. No safe upstream fix was offered; no forced/breaking upgrade applied. Review again before production.
- No independent penetration test or claim of perfect security.
- Account lockout is native/per-account; no new distributed IP throttle was added. Production ingress/shared rate limiting needs review.
- Existing Gmail contact throttling/idempotency remains process-local, as before; multi-instance production needs a shared mechanism. Gmail logic is unchanged.
- SMTP delivery, Spaces upload, production HTTPS/domain behavior and backup restore rehearsal require the actual external configuration and remain untested.
- Some native admin help/errors remain English. Error toasts persist until dismissed via the native toast policy.
- Public draft preview/rendering and database reads are deliberately deferred with the public frontend integration.

Actual validation results are recorded in PHASE4_IMPLEMENTATION_REPORT.md; remaining items above are not presented as passed.
