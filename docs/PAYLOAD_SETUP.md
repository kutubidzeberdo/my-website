# Payload CMS local setup

## Verified environment

PostgreSQL **17.11** runs on **5433**, database **pmc_cms**, role **pmc_app**. Password authentication is verified: the configured password succeeds and an incorrect password fails. PostgreSQL 13 on 5432 is unrelated and must remain untouched. No SCRAM reconfiguration or database recreation is needed.

Payload and official Next/Postgres/Lexical/S3/translations/SMTP adapters are pinned to **3.92.0**. Existing Next **16.4.3**, React **19.3.1** and Node **24.22.1** were retained. Package peer metadata confirms compatibility. `next.config.mjs` uses the official withPayload wrapper.

DATABASE_URL and PAYLOAD_SECRET are in ignored mode-0600 `.env.local`; preserve those values and all Gmail settings. `.env.example` contains placeholders only. Never copy it over an existing local env file.

## Start

```sh
npm install
python3 scripts/verify-local-cms-db.py
npm run cms -- migrate:status
npm run cms -- migrate
npm run dev
```

Open http://localhost:3000/admin and sign in with **username and password**, not email. Public website URLs are unchanged. Its content still comes from the original static sources by explicit scope restriction.

The first administrator was created through the guarded local bootstrap flow. Its randomly generated credentials are saved only in `.cms-backups/initial-admin.json` (mode 0600, Git ignored). Open that file privately in your editor, sign in, change the password through Account, and securely remove the initial credential file afterward. Do not paste credentials into chat. Existing account/secret files are never overwritten.

For a new empty installation only, interactive initial setup is:

```sh
npm run cms:bootstrap
```

It reads the password without terminal echo and refuses if any user already exists. The noninteractive local option `npm run cms:bootstrap -- --generate-local` creates a random password in the private file above; it was already used here. Public first-user registration is blocked by a server hook even though Payload may display its initial setup view on a completely empty database.

## Schema and content commands

```sh
npm run cms -- generate:types
npm run cms -- generate:importmap
npm run cms -- migrate:create descriptive_change_name
npm run cms -- migrate
npm run cms:import -- --dry-run
npm run cms:import
```

Schema push is disabled in all environments. Review every generated migration; never use reset/fresh/down against this application database without a separately approved recovery procedure. The wrapper intentionally allows only forward migration and generation/status commands.

## Recovery email and storage

SMTP is independent of Gmail OAuth. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD and SMTP_FROM_ADDRESS privately to enable the official Nodemailer adapter. Without SMTP, the recovery endpoint consistently returns a Georgian service-unavailable message before account lookup, and no recovery token is logged. Existing authenticated super administrators can set a new password in Users. Actual email delivery has not been tested.

Local uploads are in ignored `media/`; source images remain in public/images. Production must set S3_BUCKET, S3_REGION, S3_ENDPOINT, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY to use the official S3 adapter. No paid resources were created.

## Validation

```sh
npm run typecheck
npm test
npm run build
node --import tsx tests/cms-data.test.ts
node --import tsx tests/cms-recovery.test.ts
```

API/browser tests require the production test server and private initial-admin credential file. They create and remove only dedicated test records:

```sh
CMS_SERVER_URL=http://localhost:3100 npm start -- --port 3100
# In another terminal:
CMS_TEST_ORIGIN=http://localhost:3100 node tests/cms-api.test.mjs
node tests/cms-browser.test.mjs
```

The browser suite uses existing macOS Google Chrome through playwright-core. After changing the initial administrator password, update the private test fixture locally or provide a dedicated test environment. Never commit it.
