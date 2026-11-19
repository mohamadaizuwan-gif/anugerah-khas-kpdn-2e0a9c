# Anugerah Khas KPDN Segamat 2026

A Malay-language voting website with a public ballot and password-protected administration. All seven categories contain the same initial 27 participants. Voters select one participant in every category, review their choices, and submit once.

## Technology

TanStack Start, React, TypeScript, Vite, Radix Dialog, Lucide icons, and Netlify Database (Postgres) with Drizzle ORM. Netlify Functions handle authentication, voting and settings. Database migrations in `netlify/database/migrations` are applied automatically during deployment.

## Local development

Use Node 22.13+ or Node 24 and pnpm. Install dependencies with `pnpm install`. Link the project with the Netlify CLI and configure `ADMIN_PASSWORD` as a secret environment variable available to Functions. Never put its value into source files.

Run `netlify dev --port 8889` to serve the app with Netlify services. Open `http://localhost:8889` for voting or `/admin` for administration. Secure cookies are used in production; use the Netlify proxy for local platform emulation.

## Voting and administration

The public link is `/`. The admin link is `/admin`; the configured password is required before accessing any settings or results. Login creates an eight-hour HttpOnly session. Repeated login attempts are limited per IP over a 15-minute window.

Admin can view category rankings, refresh counts, export CSV, add/remove/rename participants, edit the title and category names, choose emerald, midnight or burgundy backgrounds, and open/close voting. Changes remain drafts until **Simpan perubahan** is clicked. All categories share one participant list. Historical votes are preserved when participants are removed.

As requested, voters do not log in. A one-year HttpOnly browser cookie identifies their browser; its hash is unique in Postgres. Duplicate submissions from the same cookie are rejected atomically. Clearing cookies, private browsing, or another browser/device can bypass this restriction; it is not verified one-person voting. All seven selections are stored as one ballot. Configuration versions prevent voting against a changed participant list.

## Deployment

Netlify runs the configured build and applies migrations before publishing. Generate migrations with `pnpm exec drizzle-kit generate --name <descriptive_name>` after schema changes. Never apply migrations manually. Runtime verification requires deployment and the configured admin password.
