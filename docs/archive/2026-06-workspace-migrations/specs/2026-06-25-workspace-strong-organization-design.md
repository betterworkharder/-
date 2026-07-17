# Workspace Strong Organization Design

## Context

This workspace serves Fengxing Huiyun internet intelligence research. The current structure already has the right major zones: `config/`, `knowledge/`, `fengxing_knowledge_pack/`, `scripts/`, `templates/`, `state/`, `output/`, and `intelligence-library/`.

The main friction is not missing capability. It is that canonical research inputs, temporary render artifacts, and operational instructions are too easy to confuse during a new research run.

## Diagnosis

- `tmp/business_doc_renders/` contains many PNG render artifacts and accounts for most of the workspace size. These files are useful for visual verification but should not appear as primary research inputs.
- `tmp/business_doc_extracts/` contains text extracted from business documents and is referenced by `knowledge/README.md` as research context. Because it lives under `tmp/`, it looks disposable even though it contains important background material.
- `knowledge/` is a stable entrypoint, but it only has one README and no visible priority folders matching the project rules.
- The root directory lacks a `README.md`, so a new research session must infer the workflow from several files.
- The workspace is not currently a git repository, so commit-based checkpoints are unavailable.

## Target Structure

```text
.
├── README.md
├── AGENTS.md
├── config/
├── knowledge/
│   ├── README.md
│   ├── current/
│   ├── product-strategy/
│   ├── historical/
│   └── source-extracts/
├── fengxing_knowledge_pack/
├── scripts/
├── templates/
├── state/
├── output/
├── intelligence-library/
├── examples/
├── docs/
└── tmp/
```

## Design Decisions

1. Keep `fengxing_knowledge_pack/` unchanged because it is the curated knowledge package and already has internal structure.
2. Move extracted business-document text from `tmp/business_doc_extracts/` to `knowledge/source-extracts/` because it is research context, not disposable cache.
3. Leave `tmp/business_doc_extracts` as a compatibility symlink to avoid breaking older prompts or habits immediately.
4. Keep `tmp/business_doc_renders/` in `tmp/` because PNG renders are disposable visual artifacts.
5. Add `knowledge/current/`, `knowledge/product-strategy/`, and `knowledge/historical/` README files as navigational layers rather than duplicating or splitting the underlying source files.
6. Add a root `README.md` with the daily/weekly research start checklist and canonical workflow commands.
7. Add `.gitignore` rules for local noise such as `.DS_Store`, Python caches, and render artifacts.

## Risk Controls

- No formal weekly output files are moved.
- No scripts are moved or renamed.
- No `selected-intelligence.json` schema is changed.
- No internal knowledge claims are rewritten.
- The old extract path remains available through a symlink.
- Verification uses file search, stale-reference checks, unit tests, and the existing weekly validator.

## Known Limitation

The brainstorming workflow normally requires committing this design document. This workspace is not a git repository, so the design is saved but not committed.
