#!/usr/bin/env python3
"""Build deterministic, browser-safe JSON from validated local outputs.

Generating JSON is a local content-build step and does not require a review
record. Human review controls whether the resulting Git change may be pushed;
the production Netlify deploy is triggered by that push.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any, Iterable


CURRENT_CATEGORY_ORDER = ["policy", "competitor", "market-opportunity", "tech"]
PREVIOUS_CURRENT_CATEGORY_ORDER = ["policy", "market-opportunity", "competitor", "tech"]
LEGACY_CATEGORY_ORDER = ["policy", "funding", "competitor", "market", "tech"]
VALID_CATEGORY_ORDERS = [
    CURRENT_CATEGORY_ORDER,
    PREVIOUS_CURRENT_CATEGORY_ORDER,
    LEGACY_CATEGORY_ORDER,
]
CATEGORY_NAME_TO_ID = {
    "政策趋势与监管": "policy",
    "市场客户趋势与资金项目机会": "market-opportunity",
    "资金与项目机会": "funding",
    "竞合与标杆动向": "competitor",
    "市场与客户趋势": "market",
    "技术与能力演进": "tech",
}
class PublicationError(ValueError):
    pass


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def content_hash(value: Any) -> str:
    return hashlib.sha256(canonical_json(value).encode("utf-8")).hexdigest()


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    rendered = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(rendered, encoding="utf-8")
    temporary.replace(path)


def without_content_hash(issue: dict[str, Any]) -> dict[str, Any]:
    normalized = copy.deepcopy(issue)
    normalized.setdefault("provenance", {}).pop("content_hash", None)
    return normalized


def finalize_issue(issue: dict[str, Any]) -> dict[str, Any]:
    normalized = copy.deepcopy(issue)
    normalized.setdefault("provenance", {})["content_hash"] = content_hash(
        without_content_hash(normalized)
    )
    validate_issue(normalized)
    return normalized


def validate_issue(issue: dict[str, Any]) -> None:
    required = ["schema_version", "issue_id", "issue_date", "display_date", "title", "categories", "provenance"]
    missing = [key for key in required if key not in issue]
    if missing:
        raise PublicationError(f"issue {issue.get('issue_id', '<unknown>')} missing fields: {', '.join(missing)}")
    if issue["schema_version"] != 1:
        raise PublicationError("unsupported site issue schema_version")
    if issue["issue_id"] != issue["issue_date"]:
        raise PublicationError("issue_id and issue_date must match")
    categories = issue["categories"]
    category_ids = [category.get("id") for category in categories]
    if category_ids not in VALID_CATEGORY_ORDERS:
        raise PublicationError(
            f"{issue['issue_id']}: categories must use a supported four-category "
            "order or the legacy five-category order"
        )
    seen_ids: set[str] = set()
    for category in categories:
        for item in category.get("news", []):
            item_id = str(item.get("id", ""))
            if not item_id or item_id in seen_ids:
                raise PublicationError(f"{issue['issue_id']}: missing or duplicate news id {item_id!r}")
            seen_ids.add(item_id)
            for key in ["sourceTitle", "sourceUrl", "date", "summary"]:
                if not str(item.get(key, "")).strip():
                    raise PublicationError(f"{issue['issue_id']} {item_id}: missing {key}")
            if not str(item["sourceUrl"]).startswith(("https://", "http://")):
                raise PublicationError(f"{issue['issue_id']} {item_id}: invalid source URL")
    expected_hash = issue.get("provenance", {}).get("content_hash")
    if expected_hash and expected_hash != content_hash(without_content_hash(issue)):
        raise PublicationError(f"{issue['issue_id']}: content hash mismatch")


def load_published_issues(root: Path) -> list[dict[str, Any]]:
    issues = []
    for path in sorted((root / "publish" / "weekly").glob("*/issue.json"), reverse=True):
        issue = read_json(path)
        validate_issue(issue)
        if not any(category.get("news") for category in issue["categories"]):
            continue
        issues.append(issue)
    if not issues:
        raise PublicationError("no published site issues found")
    return sorted(issues, key=lambda item: item["issue_date"], reverse=True)


def build_index(issues: list[dict[str, Any]]) -> dict[str, Any]:
    entries = []
    for issue in issues:
        entries.append(
            {
                "issue_id": issue["issue_id"],
                "issue_date": issue["issue_date"],
                "display_date": issue["display_date"],
                "title": issue["title"],
                "category_counts": {
                    category["id"]: len(category.get("news", []))
                    for category in issue["categories"]
                },
                "content_hash": issue["provenance"]["content_hash"],
            }
        )
    index = {
        "schema_version": 1,
        "latest_issue_id": issues[0]["issue_id"],
        "issues": entries,
    }
    index["content_hash"] = content_hash(index)
    return index


def refresh_index(root: Path) -> dict[str, Any]:
    issues = load_published_issues(root)
    index = build_index(issues)
    write_json(root / "publish" / "issues.json", index)
    return index


def validate_portal_content(portal: dict[str, Any]) -> None:
    required = ["schema_version", "site", "expert_insights", "competitor_dashboard", "about"]
    missing = [key for key in required if key not in portal]
    if missing:
        raise PublicationError(f"portal content missing fields: {', '.join(missing)}")
    if portal["schema_version"] != 1:
        raise PublicationError("unsupported portal schema_version")
    site_fields = [
        "name", "english_name", "report_title", "report_description", "focus_title",
        "footer_brand", "footer_tagline", "copyright", "version",
    ]
    for key in site_fields:
        if not str(portal["site"].get(key, "")).strip():
            raise PublicationError(f"portal site missing {key}")

    insight_ids: set[str] = set()
    for item in portal["expert_insights"].get("items", []):
        item_id = str(item.get("id", "")).strip()
        if not item_id or item_id in insight_ids:
            raise PublicationError(f"portal insight missing or duplicate id: {item_id!r}")
        insight_ids.add(item_id)
        for key in ["badge", "published_label", "title", "summary"]:
            if not str(item.get(key, "")).strip():
                raise PublicationError(f"portal insight {item_id} missing {key}")
        link = item.get("link", {})
        if not str(link.get("url", "")).startswith(("https://", "http://")):
            raise PublicationError(f"portal insight {item_id} has invalid link")

    dashboard = portal["competitor_dashboard"]
    tab_ids = [str(tab.get("id", "")) for tab in dashboard.get("tabs", [])]
    if not tab_ids or len(tab_ids) != len(set(tab_ids)):
        raise PublicationError("portal competitor tabs are missing or duplicated")
    for group in dashboard.get("groups", []):
        if not str(group.get("category", "")).strip() or not group.get("companies"):
            raise PublicationError("portal competitor group is incomplete")
        for company in group["companies"]:
            if not str(company.get("name", "")).strip():
                raise PublicationError("portal competitor company is missing a name")
            values = company.get("values", {})
            missing_tabs = [tab_id for tab_id in tab_ids if tab_id not in values]
            if missing_tabs:
                raise PublicationError(
                    f"portal competitor {company['name']} missing tabs: {', '.join(missing_tabs)}"
                )


def load_portal_content(root: Path) -> dict[str, Any]:
    path = root / "output" / "site" / "portal-content.json"
    portal = read_json(path)
    validate_portal_content(portal)
    return portal


def browser_issue(issue: dict[str, Any]) -> dict[str, Any]:
    return {
        "schema_version": issue["schema_version"],
        "issue_id": issue["issue_id"],
        "issue_date": issue["issue_date"],
        "display_date": issue["display_date"],
        "title": issue["title"],
        "categories": issue["categories"],
        "content_hash": issue["provenance"]["content_hash"],
    }


def build_site_content(root: Path) -> dict[str, Any]:
    issues = load_published_issues(root)
    expected_index = build_index(issues)
    index_path = root / "publish" / "issues.json"
    if not index_path.exists() or read_json(index_path) != expected_index:
        raise PublicationError("publish/issues.json is stale; export the issue or run --refresh-index")
    browser_issues = [browser_issue(issue) for issue in issues]
    portal = load_portal_content(root)
    site_content = {
        "schema_version": 1,
        "mode": "site",
        "latest_issue_id": issues[0]["issue_id"],
        "issues": browser_issues,
        "portal": portal,
    }
    site_content["content_hash"] = content_hash(site_content)
    return site_content


def _link_values(value: Any) -> list[str]:
    if not value:
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return [part.strip() for part in re.split(r"[\n,，]", str(value)) if part.strip()]


def _field(fields: dict[str, Any], name: str) -> str:
    return str(fields.get(name, "")).strip()


def convert_selected_item(item: dict[str, Any]) -> dict[str, Any]:
    category = item["category"]
    fields = item["fields"]
    source = item["source"]
    if category == "政策趋势与监管":
        event_property = _field(fields, "政策方向")
        core_facts = _field(fields, "核心内容")
        strategic_signal = _field(fields, "趋势分析")
        business_connection = _field(fields, "对丰行的启示")
    elif category == "市场客户趋势与资金项目机会":
        event_property = "\n".join([
            _field(fields, "信息类型"),
            _field(fields, "客户行业/项目主体"),
        ])
        core_facts = _field(fields, "趋势或机会内容")
        strategic_signal = _field(fields, "业务痛点/建设任务")
        business_connection = _field(fields, "丰行契合点/可跟进点")
    elif category == "资金与项目机会":
        event_property = "\n".join([_field(fields, "机会类型"), _field(fields, "牵头主体")])
        core_facts = _field(fields, "涉及地区/行业")
        strategic_signal = ""
        business_connection = _field(fields, "可跟进点")
    elif category == "竞合与标杆动向":
        event_property = f"动态类别：{_field(fields, '动态类别')}"
        core_facts = _field(fields, "核心内容")
        strategic_signal = _field(fields, "战略意义")
        business_connection = _field(fields, "对丰行的启示")
    elif category == "市场与客户趋势":
        event_property = _field(fields, "客户行业")
        core_facts = _field(fields, "需求变化")
        strategic_signal = _field(fields, "业务痛点")
        business_connection = _field(fields, "丰行契合点")
    else:
        event_property = _field(fields, "技术/能力方向")
        core_facts = _field(fields, "核心变化")
        strategic_signal = _field(fields, "应用场景")
        business_connection = _field(fields, "能力启示")

    interpretations = [
        {"title": "政策解读", "url": url}
        for url in _link_values(fields.get("解读链接"))
        if url.startswith(("https://", "http://"))
    ]
    official_links = [
        url for url in _link_values(fields.get("官方原文链接"))
        if url.startswith(("https://", "http://")) and url != source["url"]
    ]
    return {
        "id": item["id"],
        "sourceTitle": item["title"],
        "sourceUrl": source["url"],
        "sourceLabel": source["name"],
        "date": item["published_at"],
        "eventProperty": event_property,
        "coreFacts": core_facts,
        "strategicSignal": strategic_signal,
        "businessConnection": business_connection,
        "judgmentSuggestion": "\n".join(str(action) for action in item.get("recommended_actions", [])),
        "rating": len(item["stars"]),
        "summary": item["summary"],
        "interpretations": interpretations,
        "downloads": [{"title": "官方原文", "url": url} for url in official_links],
    }


def build_issue_from_selected(root: Path, issue_id: str) -> tuple[dict[str, Any], Path]:
    selected_path = root / "output" / "weekly" / issue_id / "selected-intelligence.json"
    if not selected_path.exists():
        raise PublicationError(f"{issue_id}: selected intelligence is missing")

    sys.path.insert(0, str(root))
    from scripts.intelligence_pipeline import validate_weekly_dir

    if validate_weekly_dir(selected_path.parent) != 0:
        raise PublicationError(f"{issue_id}: weekly quality validation failed")
    records = read_json(selected_path)
    if not records:
        raise PublicationError(f"{issue_id}: selected intelligence is empty")

    published_issues = load_published_issues(root)
    legacy_issue = next(
        issue
        for issue in published_issues
        if [category["id"] for category in issue["categories"]] == LEGACY_CATEGORY_ORDER
    )
    legacy_templates = {item["id"]: item for item in legacy_issue["categories"]}
    current_templates = [
        {
            "id": "policy",
            "title": "政策趋势与监管",
            "icon": legacy_templates["policy"]["icon"],
            "description": "数据要素、人工智能、交通运输与道路货运相关规则和监管变化",
        },
        {
            "id": "competitor",
            "title": "竞合与标杆动向",
            "icon": legacy_templates["competitor"]["icon"],
            "description": legacy_templates["competitor"]["description"],
        },
        {
            "id": "market-opportunity",
            "title": "市场客户趋势与资金项目机会",
            "icon": legacy_templates["market"]["icon"],
            "description": "客户需求变化、运营痛点以及资金、采购、试点和建设机会",
        },
        {
            "id": "tech",
            "title": "技术与能力演进",
            "icon": legacy_templates["tech"]["icon"],
            "description": legacy_templates["tech"]["description"],
        },
    ]
    uses_current_categories = all(
        item.get("category") in {
            "政策趋势与监管",
            "市场客户趋势与资金项目机会",
            "竞合与标杆动向",
            "技术与能力演进",
        }
        for item in records
    ) and any(
        item.get("category") == "市场客户趋势与资金项目机会"
        for item in records
    )
    if uses_current_categories:
        categories = [{**item, "news": []} for item in current_templates]
    else:
        categories = [
            {
                "id": legacy_templates[category_id]["id"],
                "title": legacy_templates[category_id]["title"],
                "icon": legacy_templates[category_id]["icon"],
                "description": legacy_templates[category_id]["description"],
                "news": [],
            }
            for category_id in LEGACY_CATEGORY_ORDER
        ]
    categories_by_id = {category["id"]: category for category in categories}
    for item in records:
        category_id = CATEGORY_NAME_TO_ID.get(item.get("category"))
        if category_id is None:
            raise PublicationError(f"{issue_id}: unknown category {item.get('category')!r}")
        categories_by_id[category_id]["news"].append(convert_selected_item(item))

    issue = finalize_issue(
        {
            "schema_version": 1,
            "issue_id": issue_id,
            "issue_date": issue_id,
            "display_date": issue_id.replace("-", "."),
            "title": f"{int(issue_id[0:4])}年{int(issue_id[5:7])}月{int(issue_id[8:10])}日刊",
            "categories": categories,
            "provenance": {
                "type": "validated_intelligence",
                "source_file": f"output/weekly/{issue_id}/selected-intelligence.json",
                "source_hash": hashlib.sha256(selected_path.read_bytes()).hexdigest(),
            },
        }
    )
    return issue, selected_path


def export_validated_issue(root: Path, issue_id: str, output: Path) -> None:
    """Generate site JSON immediately after weekly validation succeeds."""

    issue, _selected_path = build_issue_from_selected(root, issue_id)
    issue_path = root / "publish" / "weekly" / issue_id / "issue.json"
    write_json(issue_path, issue)
    refresh_index(root)
    write_json(output, build_site_content(root))
    print(f"EXPORTED: {issue_id} site JSON generated")
    print(f"ISSUE: {issue_path}")
    print(f"HASH: {issue['provenance']['content_hash']}")


def write_or_check(root: Path, output: Path, check: bool) -> None:
    expected = build_site_content(root)
    if check:
        if not output.exists() or read_json(output) != expected:
            raise PublicationError(f"generated site data is stale: {output}")
        print(f"OK: {output} matches generated publication data")
        return
    write_json(output, expected)
    print(output)


def main(argv: Iterable[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Export validated Fengxing site JSON")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--output", type=Path)
    actions = parser.add_mutually_exclusive_group()
    actions.add_argument("--issue", metavar="ISSUE_ID")
    actions.add_argument("--refresh-index", action="store_true")
    actions.add_argument("--check", action="store_true")
    args = parser.parse_args(argv)
    root = args.root.resolve()
    output = args.output or root / "apps" / "web" / "src" / "generated" / "site-content.json"
    if not output.is_absolute():
        output = (Path.cwd() / output).resolve()
    try:
        if args.issue:
            export_validated_issue(root, args.issue, output)
        elif args.refresh_index:
            refresh_index(root)
        else:
            write_or_check(root, output, args.check)
        return 0
    except (PublicationError, FileNotFoundError, json.JSONDecodeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
