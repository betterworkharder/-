import argparse
from datetime import datetime, timedelta
from html import unescape
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Union
from urllib.parse import urlencode
from urllib.request import Request, urlopen


CATEGORY_ORDER = [
    "政策趋势与监管",
    "资金与项目机会",
    "竞合与标杆动向",
    "市场与客户趋势",
    "技术与能力演进",
]

CATEGORY_FIELDS = {
    "政策趋势与监管": [
        "政策方向",
        "核心内容",
        "趋势分析",
        "对丰行的启示",
        "官方原文链接",
        "解读链接",
    ],
    "资金与项目机会": [
        "机会类型",
        "牵头主体",
        "涉及地区/行业",
        "可跟进点",
    ],
    "竞合与标杆动向": [
        "动态类别",
        "核心内容",
        "战略意义",
        "对丰行的启示",
    ],
    "市场与客户趋势": [
        "客户行业",
        "需求变化",
        "业务痛点",
        "丰行契合点",
    ],
    "技术与能力演进": [
        "技术/能力方向",
        "核心变化",
        "应用场景",
        "能力启示",
    ],
}

REQUIRED_ITEM_FIELDS = [
    "id",
    "category",
    "title",
    "summary",
    "published_at",
    "stars",
    "score",
    "entities",
    "fields",
    "source",
    "evidence",
    "source_facts",
    "business_inference",
    "implication_for_fengxing",
    "recommended_actions",
    "uncertainties",
    "review_status",
]

BLOCKING_UNCERTAINTY_PATTERNS = [
    "待补核",
    "待补充",
    "无法核验",
    "未打开",
    "待确认来源",
    "pending official",
    "pending full verification",
]

ACADEMIC_SOURCE_PATTERNS = [
    "arxiv.org",
    "biorxiv.org",
    "medrxiv.org",
    "openreview.net",
    "doi.org/10.",
]

TAIBO_API_BASE = "https://data.taibo.cn/api"
TAIBO_DATA_URL = "https://data.taibo.cn/intelligence/{id}"
TAIBO_LIST_TYPES = {
    "latest": None,
    "news": 0,
    "market": 1,
}

TAIBO_RELEVANCE_KEYWORDS = {
    "direct_fengxing": [
        "公路货运",
        "货运",
        "物流",
        "商用车",
        "车队",
        "道路运输",
        "运输管理",
        "智能调度",
        "路径规划",
        "低空物流",
        "新能源重卡",
        "智能网联货车",
        "自动驾驶卡车",
        "干线运输",
        "园区运输",
        "运输监管",
        "车辆监管",
        "北斗",
    ],
    "adjacent_industry": [
        "时空智能",
        "空间数据",
        "数据空间",
        "可信数据空间",
        "智慧交通",
        "车路协同",
        "智能网联汽车",
        "自动驾驶",
        "仿真平台",
        "数据合成",
        "场景库",
        "物理世界模型",
        "物理AI",
        "空间感知",
        "遥感",
        "卫星数据",
        "地图",
        "数字孪生",
    ],
    "background_watch": [
        "具身智能",
        "机器人",
        "世界模型",
        "大模型",
        "AI Agent",
        "低空经济",
        "商业航天",
    ],
}

TAIBO_CATEGORY_HINTS = [
    ("政策趋势与监管", ["政策", "方案", "规划", "办法", "行动方案", "工信部", "交通运输部", "七部门"]),
    ("资金与项目机会", ["招标", "中标", "采购", "预算", "项目", "验收", "示范", "航线", "试点"]),
    ("竞合与标杆动向", ["发布", "战略合作", "融资", "财报", "上线", "成立", "竣工"]),
    ("技术与能力演进", ["模型", "仿真", "数据合成", "场景库", "平台", "引擎", "智能体", "空间感知"]),
]


def load_json_records(path: Path) -> List[Dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and isinstance(data.get("items"), list):
        return data["items"]
    raise ValueError(f"{path} must contain a JSON list or an object with items[]")


def score_to_stars(score: int) -> str:
    if score >= 90:
        return "★★★★★"
    if score >= 80:
        return "★★★★"
    if score >= 75:
        return "★★★"
    return "观察池"


def _as_text_list(value: Any) -> List[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item) for item in value]
    return [str(value)]


def strip_html(value: str) -> str:
    text = re.sub(r"<[^>]+>", " ", value or "")
    return re.sub(r"\s+", " ", unescape(text)).strip()


def _parse_taibo_time(value: Any) -> Optional[datetime]:
    if not value:
        return None
    text = str(value)
    for fmt in ("%Y-%m-%d %H:%M", "%Y-%m-%d"):
        try:
            return datetime.strptime(text[: len(fmt)], fmt)
        except ValueError:
            continue
    return None


def classify_taibo_item(item: Dict[str, Any]) -> Dict[str, Any]:
    haystack = " ".join(
        [
            str(item.get("title", "")),
            str(item.get("description", "")),
            str(item.get("content_text", "")),
            " ".join(item.get("related_companies", [])),
            str(item.get("source", "")),
        ]
    )
    matched: Dict[str, List[str]] = {}
    for level, keywords in TAIBO_RELEVANCE_KEYWORDS.items():
        hits = [keyword for keyword in keywords if keyword.lower() in haystack.lower()]
        if hits:
            matched[level] = hits

    if "direct_fengxing" in matched:
        relevance = "direct_fengxing"
        disposition = "候选池-需回溯原始来源"
        reason = "命中丰行直接业务关键词，必须进入候选池并回溯原始来源。"
    elif "adjacent_industry" in matched:
        relevance = "adjacent_industry"
        disposition = "观察池或淘汰留痕"
        reason = "命中邻近行业能力关键词，至少进入观察池或记录淘汰原因。"
    elif "background_watch" in matched:
        relevance = "background_watch"
        disposition = "背景观察-低相关留痕"
        reason = "命中背景观察关键词，若丰行关系不足可淘汰，但不得静默丢弃。"
    else:
        relevance = "low_relevance"
        disposition = "可淘汰-需记录低相关原因"
        reason = "未命中泰伯重点相关关键词。"

    suggested_category = "技术与能力演进"
    for category, keywords in TAIBO_CATEGORY_HINTS:
        if any(keyword in haystack for keyword in keywords):
            suggested_category = category
            break

    return {
        "relevance_level": relevance,
        "matched_keywords": matched,
        "recommended_disposition": disposition,
        "suggested_category": suggested_category,
        "disposition_reason": reason,
    }


def normalize_taibo_record(record: Dict[str, Any]) -> Dict[str, Any]:
    nested = record.get("data") if isinstance(record.get("data"), dict) else {}
    related_companies = []
    for company in nested.get("linkdatas") or []:
        name = company.get("subtitle") or company.get("title")
        if name:
            related_companies.append(str(name))
    item_id = record.get("guid") or record.get("id")
    normalized = {
        "id": item_id,
        "guid": record.get("guid") or item_id,
        "title": record.get("title", ""),
        "created_at": record.get("created_at", ""),
        "created_time": record.get("created_time", ""),
        "type_id": record.get("type_id"),
        "source": nested.get("copyfrom", ""),
        "description": strip_html(record.get("description", "")),
        "content_text": strip_html(nested.get("content", "")),
        "related_companies": related_companies,
        "original_url": record.get("url", ""),
        "taibo_url": TAIBO_DATA_URL.format(id=item_id),
    }
    normalized.update(classify_taibo_item(normalized))
    return normalized


def fetch_json_url(url: str) -> Any:
    request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(request, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def fetch_taibo_detail(item_id: Union[int, str]) -> Dict[str, Any]:
    payload = fetch_json_url(f"{TAIBO_API_BASE}/info/view?{urlencode({'id': item_id})}")
    if not payload.get("success"):
        raise ValueError(f"Taibo detail API failed for {item_id}: {payload.get('message')}")
    return normalize_taibo_record(payload.get("data") or {})


def fetch_taibo_list_page(list_type: str, page: int) -> List[Dict[str, Any]]:
    params: Dict[str, Any] = {"page": page}
    taibo_type = TAIBO_LIST_TYPES[list_type]
    if taibo_type is not None:
        params["type"] = taibo_type
    payload = fetch_json_url(f"{TAIBO_API_BASE}/info/index?{urlencode(params)}")
    if not payload.get("success"):
        raise ValueError(f"Taibo list API failed for {list_type} page {page}: {payload.get('message')}")
    return list(payload.get("data") or [])


def scan_taibo(
    *,
    days: int = 7,
    pages: int = 3,
    list_types: Sequence[str] = ("latest", "news", "market"),
    ids: Sequence[str] = (),
) -> List[Dict[str, Any]]:
    cutoff = datetime.now() - timedelta(days=days)
    records: Dict[str, Dict[str, Any]] = {}

    for item_id in ids:
        detail = fetch_taibo_detail(item_id)
        records[str(detail["id"])] = detail

    for list_type in list_types:
        for page in range(1, pages + 1):
            for row in fetch_taibo_list_page(list_type, page):
                item_time = _parse_taibo_time(row.get("created_at"))
                if item_time and item_time < cutoff:
                    continue
                item_id = row.get("guid") or row.get("id")
                if item_id is None or str(item_id) in records:
                    continue
                detail = fetch_taibo_detail(item_id)
                records[str(item_id)] = detail

    return sorted(records.values(), key=lambda item: str(item.get("created_at", "")), reverse=True)


def render_taibo_markdown(records: Sequence[Dict[str, Any]]) -> str:
    lines = [
        "# 泰伯数据候选扫描",
        "",
        "用途：候选池线索，不等于正式入选。正式候选仍需回溯原始来源并评分。",
        "",
    ]
    for item in records:
        lines.extend(
            [
                f"## {item['title']}",
                "",
                f"- 泰伯链接：{item['taibo_url']}",
                f"- 发布时间：{item.get('created_at', '')}",
                f"- 来源：{item.get('source', '')}",
                f"- 建议类别：{item.get('suggested_category', '')}",
                f"- 相关性层级：{item.get('relevance_level', '')}",
                f"- 处理建议：{item.get('recommended_disposition', '')}",
                f"- 命中关键词：{json.dumps(item.get('matched_keywords', {}), ensure_ascii=False)}",
                f"- 关联企业：{'、'.join(item.get('related_companies', []))}",
                f"- 判断理由：{item.get('disposition_reason', '')}",
                f"- 摘要：{item.get('description', '')}",
                "",
            ]
        )
    return "\n".join(lines).rstrip() + "\n"


class QualityValidator:
    def __init__(self, records: Sequence[Dict[str, Any]]):
        self.records = list(records)

    def validate(self) -> List[str]:
        errors: List[str] = []
        seen_urls: Dict[str, str] = {}

        for item in self.records:
            item_id = str(item.get("id", "<missing-id>"))
            errors.extend(self._validate_required_fields(item_id, item))

            category = item.get("category")
            if category not in CATEGORY_FIELDS:
                errors.append(f"{item_id}: unknown category: {category}")
                continue

            errors.extend(self._validate_category_fields(item_id, item, category))
            errors.extend(self._validate_source(item_id, item, seen_urls))
            errors.extend(self._validate_scoring(item_id, item))
            errors.extend(self._validate_uncertainties(item_id, item))
            errors.extend(self._validate_content_hygiene(item_id, item))

        return errors

    def _validate_required_fields(self, item_id: str, item: Dict[str, Any]) -> List[str]:
        errors = []
        for field in REQUIRED_ITEM_FIELDS:
            if field not in item:
                errors.append(f"{item_id}: missing required field: {field}")
        return errors

    def _validate_category_fields(
        self, item_id: str, item: Dict[str, Any], category: str
    ) -> List[str]:
        errors = []
        fields = item.get("fields")
        if not isinstance(fields, dict):
            return [f"{item_id}: fields must be an object"]
        for field in CATEGORY_FIELDS[category]:
            if field not in fields:
                errors.append(f"{item_id}: missing category field: {field}")
        return errors

    def _validate_source(
        self,
        item_id: str,
        item: Dict[str, Any],
        seen_urls: Dict[str, str],
    ) -> List[str]:
        errors = []
        source = item.get("source")
        if not isinstance(source, dict):
            return [f"{item_id}: source must be an object"]

        url = str(source.get("url", "")).strip()
        if not url.startswith(("http://", "https://")):
            errors.append(f"{item_id}: source.url must be a visible http(s) URL")
        elif url in seen_urls:
            errors.append(f"duplicate source url: {url} used by {seen_urls[url]} and {item_id}")
        else:
            seen_urls[url] = item_id

        tier = str(source.get("tier", "")).upper()
        if tier.startswith("C"):
            errors.append(f"{item_id}: C-tier source cannot support formal output")

        searchable = " ".join(
            [
                url.lower(),
                str(source.get("name", "")).lower(),
                str(item.get("title", "")).lower(),
            ]
        )
        if any(pattern in searchable for pattern in ACADEMIC_SOURCE_PATTERNS):
            errors.append(f"{item_id}: academic/preprint source cannot enter formal output")

        return errors

    def _validate_scoring(self, item_id: str, item: Dict[str, Any]) -> List[str]:
        errors = []
        try:
            score = int(item.get("score"))
        except (TypeError, ValueError):
            return [f"{item_id}: score must be an integer"]
        expected = score_to_stars(score)
        actual = str(item.get("stars", "")).strip()
        if expected != actual:
            errors.append(f"{item_id}: score {score} should map to {expected}")
        if score < 75:
            errors.append(f"{item_id}: score below 75 cannot enter formal output")
        return errors

    def _validate_uncertainties(self, item_id: str, item: Dict[str, Any]) -> List[str]:
        errors = []
        uncertainties = _as_text_list(item.get("uncertainties"))
        for uncertainty in uncertainties:
            lowered = uncertainty.lower()
            if any(pattern in lowered or pattern in uncertainty for pattern in BLOCKING_UNCERTAINTY_PATTERNS):
                errors.append(
                    f"{item_id}: unresolved uncertainty blocks formal output: {uncertainty}"
                )
        return errors

    def _validate_content_hygiene(self, item_id: str, item: Dict[str, Any]) -> List[str]:
        errors = []
        summary = str(item.get("summary", ""))
        if re.search(r"[\u4e00-\u9fff]\s+and\s+[\u4e00-\u9fff]", summary):
            errors.append(f"{item_id}: mixed English connector found in summary")
        if any(word in summary for word in ["必然", "全面领先", "巨大商机", "颠覆"]):
            errors.append(f"{item_id}: summary contains unsupported promotional language")
        return errors


class IntelligenceRenderer:
    def __init__(self, records: Sequence[Dict[str, Any]], title: str = "丰行慧运周度情报"):
        self.records = list(records)
        self.title = title

    def render(self) -> str:
        lines = [f"# {self.title}", "", "状态：待人工审核草稿", ""]
        by_category = {category: [] for category in CATEGORY_ORDER}
        for item in self.records:
            by_category.setdefault(item["category"], []).append(item)

        for category in CATEGORY_ORDER:
            lines.append(f"## {category}")
            lines.append("")
            items = by_category.get(category, [])
            if not items:
                lines.append("本期该栏目未发现达到正式候选标准的新情报。")
                lines.append("")
                continue
            for item in items:
                lines.extend(self._render_item(item))
                lines.append("")
        return "\n".join(lines).rstrip() + "\n"

    def _render_item(self, item: Dict[str, Any]) -> List[str]:
        source = item["source"]
        fields = item["fields"]
        lines = [
            f"【{item['stars']}】",
            "",
            item["title"],
            "",
            f"摘要：{item['summary']}",
            f"发布时间：{item['published_at']}",
            f"来源：{source['name']}",
            f"真实新闻链接：{source['url']}",
        ]
        for field in CATEGORY_FIELDS[item["category"]]:
            lines.append(f"{field}：{fields.get(field, '')}")
        return lines


class WebsiteTextAuditor:
    def __init__(self, text: str):
        self.text = text

    def audit(self) -> List[str]:
        issues: List[str] = []
        if " and " in self.text:
            issues.append("mixed English connector found: ' and '")
        if re.search(r"\bArXiv\b|arxiv\.org|预印本", self.text, re.IGNORECASE):
            issues.append("formal page contains ArXiv/preprint content")
        for label in ["查看官网原文", "阅读 ArXiv 论文 [PDF]", "下载完整 PDF"]:
            if label in self.text:
                matching_lines = [line for line in self.text.splitlines() if label in line]
                if any("http://" not in line and "https://" not in line for line in matching_lines):
                    issues.append(f"link text appears without a visible URL: {label}")
        for suspect in ["高峰物流", "廊坊经洽会"]:
            if suspect in self.text:
                issues.append(f"unverifiable generated claim mentions {suspect}")
        if "边缘算力能效." in self.text:
            issues.append("mixed punctuation found: English period in Chinese sentence")
        return issues


def validate_weekly_dir(path: Path) -> int:
    selected_path = path / "selected-intelligence.json"
    google_path = path / "google-ai-studio-input.md"
    source_audit_path = path / "source-audit.md"
    candidate_pool_path = path / "candidate-pool.md"
    records = load_json_records(selected_path)
    errors = QualityValidator(records).validate()

    if source_audit_path.exists():
        errors.extend(_validate_source_audit(source_audit_path, records))
    if candidate_pool_path.exists():
        errors.extend(_validate_candidate_pool(candidate_pool_path))

    if google_path.exists():
        rendered_urls = {item["source"]["url"] for item in records if "source" in item}
        google_text = google_path.read_text(encoding="utf-8")
        for url in rendered_urls:
            if url not in google_text:
                errors.append(f"google-ai-studio-input.md missing selected URL: {url}")
        errors.extend(f"google-ai-studio-input.md: {issue}" for issue in WebsiteTextAuditor(google_text).audit())

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1
    print("OK: weekly output passed quality validation")
    return 0


def _validate_source_audit(path: Path, records: Sequence[Dict[str, Any]]) -> List[str]:
    text = path.read_text(encoding="utf-8")
    errors: List[str] = []
    for item in records:
        item_id = str(item.get("id", ""))
        section = _source_audit_section(text, item_id)
        if not section:
            errors.append(f"source-audit.md missing section for {item_id}")
            continue
        published_match = re.search(r"发布时间[:：]\s*([0-9]{4}-[0-9]{2}-[0-9]{2})", section)
        if published_match and published_match.group(1) != item.get("published_at"):
            errors.append(
                f"{item_id}: source-audit published_at {published_match.group(1)} "
                f"does not match selected-intelligence {item.get('published_at')}"
            )
        for pattern in ["待补核", "未打开正文", "无法核验"]:
            if pattern in section:
                errors.append(f"{item_id}: source-audit contains unresolved blocker: {pattern}")
    return errors


def _source_audit_section(text: str, item_id: str) -> str:
    pattern = re.compile(rf"^##\s+{re.escape(item_id)}.*?(?=^##\s+|\Z)", re.MULTILINE | re.DOTALL)
    match = pattern.search(text)
    return match.group(0) if match else ""


def _validate_candidate_pool(path: Path) -> List[str]:
    text = path.read_text(encoding="utf-8")
    errors: List[str] = []
    taibo_no_find_patterns = [
        "泰伯网：作为",
        "泰伯网：本期未发现",
        "泰伯网未发现",
        "泰伯网：未发现",
    ]
    claims_no_find = any(pattern in text for pattern in taibo_no_find_patterns) and "未发现" in text
    has_api_evidence = "data.taibo.cn/api" in text or "泰伯数据 API" in text
    if claims_no_find and not has_api_evidence:
        errors.append(
            "candidate-pool.md claims Taibo found no effective updates without Taibo Data API scan evidence"
        )
    return errors


def render_weekly_dir(path: Path) -> int:
    records = load_json_records(path / "selected-intelligence.json")
    errors = QualityValidator(records).validate()
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    output = IntelligenceRenderer(records, title=path.name + " 丰行慧运周度情报").render()
    (path / "google-ai-studio-input.md").write_text(output, encoding="utf-8")
    print(path / "google-ai-studio-input.md")
    return 0


def audit_text_file(path: Path) -> int:
    issues = WebsiteTextAuditor(path.read_text(encoding="utf-8")).audit()
    if issues:
        for issue in issues:
            print(f"ISSUE: {issue}")
        return 1
    print("OK: website text audit passed")
    return 0


def scan_taibo_command(args: argparse.Namespace) -> int:
    records = scan_taibo(
        days=args.days,
        pages=args.pages,
        list_types=args.type,
        ids=args.ids,
    )
    if args.format == "jsonl":
        output = "\n".join(json.dumps(record, ensure_ascii=False) for record in records)
        if output:
            output += "\n"
    else:
        output = render_taibo_markdown(records)

    if args.output:
        args.output.write_text(output, encoding="utf-8")
        print(args.output)
    else:
        print(output, end="")
    return 0


def main(argv: Iterable[str] = None) -> int:
    parser = argparse.ArgumentParser(description="Fengxing intelligence workflow utilities")
    subparsers = parser.add_subparsers(dest="command", required=True)

    validate_parser = subparsers.add_parser("validate-weekly")
    validate_parser.add_argument("path", type=Path)

    render_parser = subparsers.add_parser("render-weekly")
    render_parser.add_argument("path", type=Path)

    audit_parser = subparsers.add_parser("audit-website-text")
    audit_parser.add_argument("path", type=Path)

    taibo_parser = subparsers.add_parser("scan-taibo")
    taibo_parser.add_argument("--days", type=int, default=7)
    taibo_parser.add_argument("--pages", type=int, default=3)
    taibo_parser.add_argument(
        "--type",
        choices=tuple(TAIBO_LIST_TYPES.keys()),
        action="append",
        default=None,
        help="Taibo list type to scan; defaults to latest, news, and market",
    )
    taibo_parser.add_argument("--ids", nargs="*", default=[])
    taibo_parser.add_argument("--output", type=Path)
    taibo_parser.add_argument("--format", choices=("markdown", "jsonl"), default="markdown")

    args = parser.parse_args(argv)
    if args.command == "scan-taibo":
        if args.type is None:
            args.type = [] if args.ids else ["latest", "news", "market"]
        return scan_taibo_command(args)
    if args.command == "validate-weekly":
        return validate_weekly_dir(args.path)
    if args.command == "render-weekly":
        return render_weekly_dir(args.path)
    if args.command == "audit-website-text":
        return audit_text_file(args.path)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
