# Intelligence Pipeline Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local quality-gated workflow that improves Fengxing intelligence indexing, generation speed, templates, reliability, completeness, and business relevance.

**Architecture:** Keep `selected-intelligence.json` as the single structured source of truth, validate it before publishing, and render `google-ai-studio-input.md` from that JSON instead of hand-writing final copy. Use stable source indexes and category templates so research starts from trusted sources and each output follows the same schema.

**Tech Stack:** Python 3 standard library, Markdown templates, JSON schema, YAML configuration.

---

### Task 1: Quality Validator and Renderer

**Files:**
- Create: `scripts/intelligence_pipeline.py`
- Create: `scripts/validate_weekly.py`
- Create: `scripts/render_google_ai_studio.py`
- Test: `tests/test_intelligence_pipeline.py`

- [x] Write failing tests for unresolved source audit, arXiv blocking, duplicate URLs, star-score mismatch, renderer output, JSON loading, and website text auditing.
- [x] Run tests and confirm failure due to missing implementation.
- [x] Implement validator, renderer, and website text auditor.
- [x] Run tests and confirm pass.

### Task 2: Stable Knowledge and Source Index

**Files:**
- Create: `knowledge/README.md`
- Create: `config/source-index.yaml`

- [x] Add a stable `knowledge/` entrypoint that points to `fengxing_knowledge_pack/`.
- [x] Add recurring source groups for policy, projects, market trends, competitors, and technology.
- [x] Add formal-output blocking rules.

### Task 3: Standard Templates

**Files:**
- Create: `templates/selected-intelligence.schema.json`
- Create: `templates/category-format-standard.md`
- Create: `templates/google-ai-studio-lock-prompt.md`

- [x] Define required JSON fields.
- [x] Define category-specific fields and quality rules.
- [x] Add a prompt that tells Google AI Studio not to rewrite facts or links.

### Task 4: Operations Documentation

**Files:**
- Create: `docs/operations/optimized-intelligence-workflow.md`

- [x] Document the optimized indexing model.
- [x] Document generation and validation commands.
- [x] Document issues found in the attached website output.

### Task 5: Verification

**Commands:**

```bash
python3 -m unittest tests/test_intelligence_pipeline.py -v
python3 scripts/audit_website_text.py /path/to/website-output.txt
python3 scripts/validate_weekly.py output/weekly/2026-06-19
```

**Expected:**

- Unit tests pass.
- Website text audit flags current generated-site issues.
- Historical weekly validation reports old unresolved source-audit issues, proving the gate catches previous weak points.
