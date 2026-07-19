#!/usr/bin/env python3
"""Fail a web build when internal publication fields leak into browser assets."""

from __future__ import annotations

import argparse
from pathlib import Path


FORBIDDEN_TOKENS = [
    "source_facts",
    "business_inference",
    "recommended_actions",
    "candidate-pool",
    "source-audit",
    "analyst-review",
    "knowledge/source-extracts",
    "legacy/frontend-content",
    "review_hash",
    "source_hash",
    "source_file",
]
TEXT_SUFFIXES = {".html", ".js", ".css", ".json", ".map", ".txt"}


def audit_dist(dist: Path) -> list[str]:
    issues: list[str] = []
    if not dist.is_dir():
        return [f"build directory does not exist: {dist}"]
    for path in sorted(dist.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore").lower()
        for token in FORBIDDEN_TOKENS:
            if token.lower() in text:
                issues.append(f"{path}: contains forbidden token {token}")
    return issues


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit generated site bundle")
    parser.add_argument("--dist", type=Path, required=True)
    args = parser.parse_args()
    issues = audit_dist(args.dist)
    if issues:
        for issue in issues:
            print(f"ERROR: {issue}")
        return 1
    print("OK: site bundle contains no internal publication fields")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
