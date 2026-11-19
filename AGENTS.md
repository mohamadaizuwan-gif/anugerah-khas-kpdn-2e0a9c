# Project guide

A Malay-language Anugerah Khas KPDN Segamat 2026 voting application using TanStack Start, React, TypeScript, Netlify Functions and Netlify Database with Drizzle beta.

## Architecture

- `src/routes/index.tsx`: public ballot at `/`.
- `src/routes/admin.tsx`: admin UI at `/admin`.
- `src/components/election-app.tsx`: ballot, review/help dialogs, admin login, configuration and results.
- `src/lib/election.ts`: types and exact initial seven categories and 27 names. Defaults are seeded only if configuration does not exist.
- `src/styles.css`: emerald/gold design, alternative hero backgrounds and responsive layouts.
- `src/routes/__root.tsx`: Malay HTML and share metadata.
- `netlify/functions/election.mts`: `/api/election/:action`, public config, atomic ballot submission and protected admin APIs.
- `db/schema.ts`: configuration JSON with version, ballots with unique hashed browser identity and selection snapshots, hashed sessions and login attempt limits.
- `db/index.ts`: Drizzle Netlify adapter factory.
- `drizzle.config.ts`, `netlify/database/migrations`: schema generation and deployment-applied migrations.

## Conventions and decisions

Use Netlify Database for persistence. Do not use local files or process memory as a database. Keep Drizzle ORM/Kit on the beta line for the Netlify adapter. Generate migrations for schema changes; never apply them manually.

The secret `ADMIN_PASSWORD` is read only on the server using `Netlify.env.get`. Never expose it or session tokens in logs, browser storage, URLs, output or source files. Session cookies are HttpOnly, Secure and SameSite Strict with eight-hour expiry. Require sessions for results and edits and check same-origin POST requests. Login attempts are throttled in Postgres.

The user explicitly requested no voter identity verification. Cookies enforce one submission per browser with a database unique constraint. Do not claim this verifies unique humans. All seven selections are required by client and server. Ballot submission locks configuration in a Postgres transaction and validates its version. Admin saves use optimistic version checks. Preserve votes when names change or participants are removed.

Edits remain drafts until saved. Categories share a participant list. Category IDs A–G remain stable while names can change. No participant photos are needed. Never return counts from the public endpoint. Preserve native keyboard-accessible controls and accessible dialogs. Do not edit generated route trees.

## Development

Install with `pnpm install`; run `netlify dev --port 8889` with the configured admin password for platform emulation. The hosted pipeline validates the project; this build run does not run local validation or dev-server commands.
