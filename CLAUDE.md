@../katti-co-shared/CONTEXT.md
@AGENTS.md

# katti-co-website

The public site at kattiandco.com, plus Mitra — the free public legal
information assistant. Next.js + Sanity, deploys to Vercel from the repo root.

Sibling projects: `../katti-co-research` (internal search index and MCP server),
`../katti-co-drafting` (internal drafting tool). Shared context is imported
above; this project's own working notes live in its own memory.

## What makes this project different from the siblings

This is the only one that is **public-facing**, so it is the only one where
Rule 36 is live and where Mitra's professional-conduct ceiling applies. Mitra
explains the law and points to a consultation; it never advises on a specific
case, no matter how good the retrieval gets.

It is also the only one that is **serverless**. Mitra runs on Vercel functions,
so it cannot hold a large index in memory — it needs a small hosted index
(~150K chunks, ~50 MB quantised) plus an embedding call per query. The research
project's index is local and can be far larger; they are deliberately two
different indexes, not one shared one.

## Repo structure

- Root — Next.js and Sanity source and config. **Must stay at root**; Vercel
  builds from here.
- `docs/` — `DEPLOYMENT.md` (how to ship), `SESSION_LOG.md` (what changed and
  what broke), `GENERAL_WEBSITE_DEPLOYMENT_GUIDE.md` (reusable playbook). These
  reference each other by bare filename, so they stay together.
- `docs/research/` — nine archived artifacts from the Open India Law
  investigation, with a `README.md` index. Start at
  `09-everything-we-can-build.html`.

## Mitra's upgrade path

In order: foundation polish (streaming, persistent rate limiting, feedback
capture) → real law instead of hand-written answers → ratio-aware retrieval
(weight `ratio_decidendi` over `arguments`, so it quotes what a court *held*) →
deterministic citation validation before display → agentic retrieval → an
India-specific answer benchmark → practice-area routing → multilingual.

Full reasoning in `docs/research/09-everything-we-can-build.html`.
