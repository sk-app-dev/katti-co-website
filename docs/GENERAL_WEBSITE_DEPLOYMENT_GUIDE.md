# General Website Deployment Guide

A reusable playbook for building and deploying a marketing/content website with a CMS, a contact form, and an optional AI chat feature — for any business, not just a law firm. This is written from real lessons learned building the Katti & Co. site (see `DEPLOYMENT.md` for that specific site, `SESSION_LOG.md` for the full incident history behind these lessons).

Nothing here is law-specific. Swap "the firm" for whatever the business is.

## The stack this guide assumes

- **Next.js (App Router) + TypeScript** — server components for anything that doesn't need interactivity, client components (`"use client"`) for anything that fetches its own data or handles user input.
- **A headless CMS** (Sanity, in the reference project) for anything a non-developer needs to edit: page copy, images, team bios, blog posts, site-wide settings like contact info.
- **A transactional email service** (Resend, in the reference project) for form submissions.
- **Plain CSS or a design-token system** — pick one styling approach and use it everywhere. Don't let two different components use two different styling paradigms (see Lesson 6 below).
- **An optional LLM-backed chat widget**, if the business wants one — but see Lesson 7 before building it as a novelty.

## Before writing any code

1. **Decide what content is CMS-managed vs. hardcoded, and commit to it.** Anything that will change without a code deploy (contact email, phone, address, team roster, testimonials, pricing) belongs in the CMS from day one. Retrofitting this later means finding every hardcoded copy scattered across components, API routes, and any chatbot's knowledge base — which is exactly what happened here (one phone number was hardcoded in eleven different places).
2. **Decide the CMS schema before the pages that consume it.** Naming collisions between schema types (this project ended up with both a "Team Members" and a "Team Member" type, indistinguishable in the CMS sidebar) are avoidable if you name types once, deliberately, and don't leave the old one around when you replace it.
3. **Decide your image-cropping strategy up front.** Fixed-aspect-ratio cropping (square avatars, 16:9 thumbnails) works for uniform content like team photos. For anything where the actual photo composition matters (a founder's professional headshot, a hero banner), don't fight the CMS's stored crop — either respect it consistently or bypass it consistently (see Lesson 3).

## Lessons, in the order you're likely to hit them

### 1. Two Sanity clients (or two of anything) will drift, silently

If your project ends up with more than one client instance pointed at the "same" backend, one of two things will happen: they'll actually point at different data (you won't notice until content edited in the CMS doesn't show up on the site, or vice versa), or they'll duplicate the same GROQ queries with subtly different field selections that drift apart over time. Pick one client module, one shared query file, and make every component import from it. If you find a second one mid-project (via `grep -rn "createClient"`), that's a bug to fix, not a pattern to follow.

### 2. A CMS schema change needs its own deploy, separate from the website

If your CMS's admin UI is deployed independently from your website (true of Sanity Studio, and similar for many headless CMS setups with a hosted editor), remember: pushing website code does not update the editor, and updating the editor's schema does not touch site content. Someone can create a document of a type the editor no longer recognizes (or vice versa) and get a confusing "schema not found" error, or silently lose access to editing something that still exists in the database. When you change a schema, deploy *both* halves before considering the change done.

### 3. Don't fight a stored crop with a requested crop

If your CMS lets editors manually crop an image at upload time, that stored crop typically gets applied by the image URL builder *regardless of what dimensions your code requests* — unless you explicitly bypass it by requesting the raw asset instead of the annotated image object. If a photo looks cropped in ways your code doesn't seem to be causing, check whether the CMS itself is applying a crop you didn't ask for. The fix is usually: request the asset directly, use the CMS's own stored dimensions/aspect-ratio metadata to size your display box, and let CSS (`width: 100%; height: auto`) preserve the natural ratio instead of forcing one.

### 4. `min-height: 100vh` doesn't scale — cap it

A hero section sized to `100vh` looks intentional on a laptop and looks broken on a 27"+ monitor: the section stretches to match the viewport, the content doesn't grow to fill it, and you get a large dead gap of empty space. Use `min-height: min(100vh, <sane-max>px)` and `justify-content: center` so the section holds a comfortable size and centers its content within whatever height it ends up being, instead of pinning content to the top and leaving overflow at the bottom.

### 5. `align-items: center` on a multi-column layout needs equal-height content

If one column is a short block of text and the other is a stack of cards, centering them against each other pushes the short column's content away from its own heading, creating what looks like a spacing bug but is actually a height-mismatch bug. Default to `align-items: start` on any grid/flex row where the columns won't reliably be the same height, and only use `center` when you've checked they will be.

### 6. Pick one styling system and enforce it

A page or component that reaches for a different styling paradigm than the rest of the site (Tailwind utility classes dropped into a codebase that has no Tailwind dependency, in this project's case) will render completely unstyled in production with no build error — the classes just don't exist. If you're grepping the codebase and find CSS classes with no matching stylesheet rule, or an unfamiliar utility-class pattern, that page is broken right now, not "differently styled."

### 7. An AI chat feature needs the same input-handling discipline as a form

If you're rendering LLM output (or any user-supplied text) as HTML via `dangerouslySetInnerHTML` — common for a chat widget that needs to render markdown-style formatting — escape it first, and allowlist the URL schemes you'll accept in any rendered links (`http:`, `https:`, `mailto:` — reject `javascript:` and anything else). This is true even if you believe the LLM's output is "trusted"; the user's own typed input goes through the same renderer.

### 8. A contact form writing to a database, not just sending an email, needs to actually be awaited

If you add a secondary write (saving a form submission to the CMS as a trackable record, logging an event, anything beyond the primary action) alongside a primary action like sending an email, don't fire it and forget it. Serverless hosting can freeze a function's execution the instant it returns a response — an unawaited promise started just before that point may never finish. Run the primary and secondary actions concurrently (`Promise.all`) and await both, but only let the *primary* action's failure fail the whole request; log-and-swallow failures in the secondary one.

### 9. Security basics that are cheap to get right from the start

- Validate every API route's input with a schema library (Zod or similar) — length caps included, not just type checks.
- Escape any user input before interpolating it into an HTML email body or any HTML you render.
- Add basic per-IP rate limiting to any public POST endpoint that costs you money per call (an email send, an LLM call) — a simple in-memory sliding window is enough for low-to-medium traffic; don't ship a form or chat endpoint without one.
- Set `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and a `Referrer-Policy` in `next.config.js`'s `headers()` — five lines, closes off clickjacking and MIME-sniffing for free.
- Never return raw internal error messages to the client (`error.message` from a caught exception) — log it server-side, return a generic message.
- Run `npm audit` before every deploy, and understand *what's actually reachable* before panicking about the count — a vulnerability in a dev-only tool that's never invoked in production is real but not urgent; a vulnerability in something on your request path is.

### 10. Delete dead code as you find it, don't just note it

Unused exports, orphaned API routes from a removed feature, duplicate query strings, unused npm dependencies — each one is small, but they compound, and each one is a small tax on every future person (or AI session) trying to understand the codebase. When you find one, remove it in the same pass rather than leaving a comment about it. Verify with a full type-check and build immediately after — deletions are the cheapest changes to get wrong and the cheapest to verify.

## Generic pre-deploy checklist

- [ ] Type-check and production build both pass clean
- [ ] Every environment variable the app reads has a placeholder in `.env.example` and a real value set on the host
- [ ] CMS CORS/allowed-origins settings include the production domain
- [ ] No hardcoded content that should be CMS-managed (contact info, especially)
- [ ] No debug `console.log` statements in changed files
- [ ] No unused dependencies in `package.json` (check anything that isn't imported anywhere with `grep -rln "<package-name>"`)
- [ ] Security headers are set; contact/API routes validate input, escape output, and rate-limit
- [ ] If the CMS has a separately-deployed editor UI, it's been redeployed to match any schema changes
- [ ] Test the site at a small viewport (mobile), a normal laptop size, and a large monitor size — don't tune spacing/typography for one screen size and assume it holds
