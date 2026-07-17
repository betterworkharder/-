# Workspace Strong Organization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the Fengxing intelligence workspace so canonical knowledge, temporary artifacts, workflow instructions, and generated outputs are easy to distinguish.

**Architecture:** Keep the existing pipeline and knowledge package intact. Move durable extracted source material into `knowledge/source-extracts/`, leave a compatibility symlink at the old path, and add lightweight navigation documents at the root and inside the knowledge tiers.

**Tech Stack:** Markdown, JSON manifests, shell file moves, Python standard-library test runner.

---

### Task 1: Document The Strong Organization Design

**Files:**
- Create: `docs/superpowers/specs/2026-06-25-workspace-strong-organization-design.md`
- Create: `docs/superpowers/plans/2026-06-25-workspace-strong-organization.md`

- [x] Create the design document with diagnosis, target structure, design decisions, risks, and verification.
- [x] Create this implementation plan with concrete file changes and verification commands.
- [x] Note that commit steps are unavailable because the workspace is not a git repository.

### Task 2: Move Durable Extracts Out Of `tmp/`

**Files:**
- Move: `tmp/business_doc_extracts/` to `knowledge/source-extracts/`
- Create: `tmp/business_doc_extracts` symlink pointing to `../knowledge/source-extracts`
- Modify: `knowledge/source-extracts/manifest.json`
- Modify: `knowledge/source-extracts/manifest_v2.json`

- [x] Move the extracted text directory into `knowledge/source-extracts/`.
- [x] Create the compatibility symlink at `tmp/business_doc_extracts`.
- [x] Rewrite manifest paths from `tmp/business_doc_extracts/` to `knowledge/source-extracts/`.
- [x] Verify that `knowledge/source-extracts/manifest.json` and `manifest_v2.json` exist.

### Task 3: Add Workspace Navigation And Ignore Rules

**Files:**
- Create: `README.md`
- Create: `.gitignore`
- Create: `.ignore`
- Create: `tmp/README.md`
- Create: `docs/operations/directory-map.md`
- Modify: `knowledge/README.md`

- [x] Add a root README with directory map, start checklist, workflow commands, and safety notes.
- [x] Add ignore rules for `.DS_Store`, Python caches, and render artifacts.
- [x] Add `.ignore` so `rg` excludes render artifacts even though the workspace is not a git repository.
- [x] Add `tmp/README.md` that explains which temporary material is disposable and which path is only a compatibility link.
- [x] Add an operations directory map for future maintainers.
- [x] Update `knowledge/README.md` to point to `knowledge/source-extracts/`.

### Task 4: Add Knowledge Tier Entry Points

**Files:**
- Create: `knowledge/current/README.md`
- Create: `knowledge/product-strategy/README.md`
- Create: `knowledge/historical/README.md`

- [x] Add the current-knowledge entrypoint with the highest priority source files.
- [x] Add the product-strategy entrypoint with product and planning source files.
- [x] Add the historical entrypoint with reuse restrictions for historical materials.

### Task 5: Verify The Workspace

**Commands:**

```bash
find knowledge -maxdepth 3 -type f -print
find tmp -maxdepth 2 -type f -print
ls -la tmp
rg -n "tmp/business_doc_extracts" README.md knowledge docs config scripts templates AGENTS.md fengxing_knowledge_pack
python3 -m unittest tests/test_intelligence_pipeline.py -v
python3 scripts/validate_weekly.py output/weekly/2026-06-19
```

**Expected:**

- `knowledge/source-extracts/` contains the durable extracted text files.
- `tmp/business_doc_extracts` is a symlink, not a second copy.
- Any remaining `tmp/business_doc_extracts` references describe compatibility or the executed migration, not the primary knowledge path.
- Unit tests pass.
- Historical weekly validation may still report pre-existing source-audit issues; that is acceptable because this task does not rewrite old intelligence outputs.

**Result on 2026-06-25:**

- [x] `knowledge/source-extracts/` contains the durable extracted text files.
- [x] `tmp/business_doc_extracts` is a symlink to `../knowledge/source-extracts`.
- [x] Remaining `tmp/business_doc_extracts` references describe compatibility or this migration.
- [x] `rg --files tmp` returns only `tmp/README.md`; render PNGs are hidden from normal search by `.ignore`.
- [x] Unit tests pass: `Ran 7 tests in 0.002s OK`.
- [x] Historical weekly validation fails only on pre-existing unresolved `待补核` source-audit blockers in `output/weekly/2026-06-19`.
