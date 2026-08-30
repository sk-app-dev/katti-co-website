# Research &amp; planning archive

Investigation into open Indian legal data and what Katti &amp; Co. can build with it,
August 2026. Read in order — later documents correct earlier ones.

Each file here is a local copy of a published artifact. Open the `.html` files
directly in a browser, or use the live links (which stay current if updated).

| # | Document | Live link | What it covers |
|---|---|---|---|
| 01 | `01-vaquill-find.html` | [link](https://claude.ai/code/artifact/39d97ed2-7594-4a33-974a-a4112aebe917) | First find of the Open India Law dataset. **Contains four fabricated repo names** — see 02. |
| 02 | `02-open-india-law-brainstorm.html` | [link](https://claude.ai/code/artifact/8fa80e6c-ca75-41e1-adbf-aa9c95ea2f18) | Full repo read, what's verified vs. fabricated, wider ecosystem, commercial angles. |
| 03 | `03-three-systems-build-plan.html` | [link](https://claude.ai/code/artifact/32761ff0-9812-429b-aa6f-935c6818480b) | Mitra / search bot / draft bot as three separate systems. Superseded by 04. |
| 04 | `04-master-plan.html` | [link](https://claude.ai/code/artifact/a3d31871-a274-4957-af12-cd2b85d531c3) | Plain-English consolidated plan. Covers the GPU, and the judge-conduct idea. |
| 05 | `05-second-opinion.html` | [link](https://claude.ai/code/artifact/a82fc87f-db6e-489c-9abc-fcec9c9f93a2) | **Important.** Bar Council rules 36 and 47 — kills public lead-gen and complicates commercialisation. |
| 06 | `06-second-pass.html` | [link](https://claude.ai/code/artifact/60e48987-8ab6-4fd2-8b83-90da761ba30d) | Rigorous repo read: citation parser, PII redactor, ratio-aware retrieval. |
| 07 | `07-full-sweep.html` | [link](https://claude.ai/code/artifact/128a8103-2c1e-43ce-98dc-6315e03f8d49) | Computed index sizing, the two-index architecture, MCP critique. |
| 08 | `08-beyond-the-corpus.html` | [link](https://claude.ai/code/artifact/0e9c638c-60f6-416f-befa-e27fbf6d5eb2) | The other repos and tools — Opennyai, DocuChat, and two findings that changed advice. |
| 09 | `09-everything-we-can-build.html` | [link](https://claude.ai/code/artifact/4b630f95-a0e8-4ced-b82d-08551b9d0537) | **Start here.** All 34 options in five tiers. |

Two earlier artifacts exist online only (local copies were lost to temp cleanup):

- [Mitra Pipeline](https://claude.ai/code/artifact/94512622-90d4-4f27-9664-b51dd13363ab) — how Mitra works end to end
- [Mitra Roadmap](https://claude.ai/code/artifact/fd623493-2636-435c-b41b-7533b2b63638) — pre-dataset upgrade path
- [Internal Tools Scope](https://claude.ai/code/artifact/746f720f-4c12-4758-8f7e-2e34971c67c3) — first scoping of the research and drafting tools

## The short version

- The dataset is real, free (CC BY 4.0, attribution required) and useful: 12.8M
  judgments, 1.1M legislation provisions. Karnataka High Court alone is 581,276
  cases / 1,552,339 chunks.
- Re-embedding it ourselves is far cheaper than the headline suggests — Karnataka
  is ~0.56 GB quantised and under two hours on the RTX 3060, not 463 GB.
- For judgments, the AWS Open Data upstream is fresher (synced daily) and larger
  (~17.8M) than Vaquill's frozen snapshot. Use Vaquill for legislation and
  regulators, which the upstream doesn't have.
- **Bar Council rules bind before any technical decision.** No public-facing tool
  whose purpose or effect is bringing in work (Rule 36). Commercialisation is not
  something a practising advocate can simply do (Rule 47).
- Build internal tools first. They're free, they carry no conduct risk, and they
  are where the real time savings are.

See `09-everything-we-can-build.html` for the full option list.
