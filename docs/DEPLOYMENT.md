# Katti & Co. — Deployment Guide

This is the accurate, current guide for deploying this specific site. It reflects the codebase as of the session that produced `SESSION_LOG.md` — read that file first if you're picking this project up cold.

If you're trying to build a *different* website using this project as a starting pattern, use `GENERAL_WEBSITE_DEPLOYMENT_GUIDE.md` instead — this file is specific to Katti & Co.

## What this site actually is

- **Framework:** Next.js 16 (App Router), TypeScript, plain CSS (no Tailwind, no CSS-in-JS — `globals.css` is the only stylesheet).
- **CMS:** Sanity (see `sanity.config.ts` for the project ID; dataset `production`) — blog posts, founder profile, team members, gallery, site-wide contact settings, and a private form-submissions log.
- **Email:** Resend, for the contact form.
- **AI chat:** "Mitra" — a hybrid assistant. Most questions are answered instantly from a hand-written knowledge base (BM25 keyword search, zero API calls); only novel questions fall through to Google Gemini.
- **No user authentication anywhere.** No admin panel, no login, no session cookies. Every page is public.

## Two separate things get deployed

This trips people up, so it's worth stating plainly:

1. **The website** (this Next.js app) — deployed via your host (Vercel, etc.) from a git push.
2. **The Sanity Studio** (the content-editing UI your team uses) — deployed *separately* via `npx sanity deploy`, hosted by Sanity itself (see `sanity.cli.ts` for the deployment target). It shares this repo's `sanity/schemaTypes/` folder as its schema source, but pushing website code does **not** update the Studio, and vice versa.

If you add or change a Sanity schema type (a new content type, a new field), you must run `npx sanity deploy` for the Studio's editing UI to pick it up — the website reading/writing data doesn't require this, but *editing that data by hand in Studio* does.

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values. On your host, set the same variables in its dashboard (Vercel → Project → Settings → Environment Variables, or equivalent).

| Variable | Used by | Notes |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | everywhere data is read | public, safe to expose to the browser |
| `NEXT_PUBLIC_SANITY_DATASET` | everywhere data is read | `production` |
| `SANITY_API_TOKEN` | `app/api/contact/route.ts` | needs **write** access — used to save form submissions |
| `RESEND_API_KEY` | `app/api/contact/route.ts` | contact form email |
| `CONTACT_RECIPIENT_EMAIL` | `app/api/contact/route.ts` | where enquiries land; falls back to a hardcoded address if unset |
| `CONTACT_SENDER_EMAIL` | `app/api/contact/route.ts` | must be a domain verified in Resend |
| `GEMINI_API_KEY` | `app/api/mitra/route.ts` | only called for questions the knowledge base can't answer; site works without it (falls back to a "not configured" message) |

There is no `NEXTAUTH_*`, no `ADMIN_*` — those were removed along with the unused `next-auth`/`bcryptjs` dependencies. If a future session needs real authentication, it has to be built, not just uncommented.

## First-time setup

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev                  # http://localhost:3000
```

## Deploying the website

Standard Next.js deploy — this repo has no special build steps.

```bash
git push origin main
```

If your host auto-deploys from `main` (Vercel default), that's it. Otherwise trigger a build from your host's dashboard/CLI. Confirm the environment variables above are set on the host *before* the first deploy — several routes throw at request time (not build time) if they're missing, so a missing var won't fail the build, it'll fail silently in production until someone hits that path.

The homepage (`/`) is statically generated at build time. **This matters**: if you edit content in Sanity Studio after the site is deployed, those changes will not appear on the live site until you redeploy — there's no automatic revalidation on the homepage. `/blog/[slug]` pages do revalidate automatically (`export const revalidate = 60`), but `/` and the founder/team sections do not use ISR at the page level (they're client-fetched, so they do update live in the browser — see the note in SESSION_LOG.md about the local/live desync this caused).

## Deploying the Sanity Studio

Only needed when you change something under `sanity/schemaTypes/`:

```bash
npx sanity deploy --yes
```

This requires you to be logged in (`npx sanity login`) with access to the project. It rebuilds and pushes the Studio's editing UI — it does **not** touch your content data, so it's always safe to run.

## Pre-deploy checklist

- [ ] `npx tsc --noEmit` passes clean
- [ ] `npx next build` passes clean
- [ ] All env vars above are set on the host
- [ ] If you changed any `sanity/schemaTypes/*.ts` file, you've also run `npx sanity deploy`
- [ ] Sanity's CORS origins (sanity.io/manage → project → API → CORS Origins) include your production domain — without this, every client-side data fetch (founder, team, gallery, contact settings) silently fails on the live site
- [ ] Placeholder/test content has been replaced or removed in Studio (check Founder Profile, Team Member) — nothing you don't want visible should be live
- [ ] No `console.log` debug statements left in changed files (`grep -rn "console.log(" app components lib`)

## Rolling back

Nothing here is destructive by nature — Sanity Studio deploys never touch content, and the website deploy is just whatever's in your last-known-good commit. To roll back the website, redeploy an earlier commit through your host, or `git revert`. To roll back a schema change, redeploy Studio from an earlier commit of `sanity/schemaTypes/` — again, content is untouched either way.
