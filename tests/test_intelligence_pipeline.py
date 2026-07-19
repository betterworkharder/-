import json
import tempfile
import unittest
from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path

from scripts.intelligence_pipeline import (
    IntelligenceRenderer,
    QualityValidator,
    WebsiteTextAuditor,
    _validate_issue_date_window,
    load_json_records,
    normalize_taibo_record,
    render_taibo_markdown,
    validate_weekly_dir,
)


class QualityValidatorTest(unittest.TestCase):
    def test_rejects_item_published_outside_issue_window(self):
        item = self._base_item("竞合与标杆动向")
        item["published_at"] = "2026-07-09"
        item["source_published_at"] = "2026-07-09"
        item["event_date"] = "2026-07-09"

        errors = _validate_issue_date_window(Path("2026-07-17"), [item])

        self.assertIn(
            "FXHY-TEST-BASE: published_at 2026-07-09 is outside issue window 2026-07-10 to 2026-07-17",
            errors,
        )

    def test_rejects_policy_with_old_event_hidden_by_late_page_date(self):
        item = self._base_item("政策趋势与监管")
        item["published_at"] = "2026-07-13"
        item["source_published_at"] = "2026-07-13"
        item["event_date"] = "2026-07-01"
        item["date_basis"] = "办法施行日期"

        errors = _validate_issue_date_window(Path("2026-07-17"), [item])

        self.assertIn(
            "FXHY-TEST-BASE: event_date 2026-07-01 is outside issue window 2026-07-10 to 2026-07-17",
            errors,
        )

    def test_accepts_policy_effective_inside_issue_window(self):
        item = self._base_item("政策趋势与监管")
        item["published_at"] = "2026-07-16"
        item["source_published_at"] = "2026-07-16"
        item["event_date"] = "2026-07-15"
        item["date_basis"] = "办法正式施行日期"

        errors = _validate_issue_date_window(Path("2026-07-17"), [item])

        self.assertEqual(errors, [])

    def test_rejects_non_policy_event_outside_issue_window(self):
        item = self._base_item("竞合与标杆动向")
        item["published_at"] = "2026-07-13"
        item["source_published_at"] = "2026-07-13"
        item["event_date"] = "2026-07-09"
        item["date_basis"] = "企业活动发生日期"

        errors = _validate_issue_date_window(Path("2026-07-17"), [item])

        self.assertIn(
            "FXHY-TEST-BASE: event_date 2026-07-09 is outside issue window 2026-07-10 to 2026-07-17",
            errors,
        )

    def test_rejects_source_date_different_from_displayed_date(self):
        item = self._base_item("技术与能力演进")
        item["published_at"] = "2026-07-17"
        item["source_published_at"] = "2026-07-15"
        item["event_date"] = "2026-07-15"
        item["date_basis"] = "主来源发布日期"

        errors = _validate_issue_date_window(Path("2026-07-17"), [item])

        self.assertIn(
            "FXHY-TEST-BASE: source_published_at 2026-07-15 does not match displayed published_at 2026-07-17",
            errors,
        )

    def test_rejects_selected_item_with_unresolved_source_audit(self):
        item = {
            "id": "FXHY-TEST-001",
            "category": "政策趋势与监管",
            "title": "测试政策",
            "summary": "官方发布测试政策。",
            "published_at": "2026-06-20",
            "stars": "★★★★",
            "score": 86,
            "entities": ["交通运输部"],
            "fields": {
                "政策方向": "道路货运",
                "核心内容": "测试内容",
                "趋势分析": "测试趋势",
                "对丰行的启示": "测试启示",
                "官方原文链接": "https://www.mot.gov.cn/test.html",
                "解读链接": "",
            },
            "source": {
                "name": "交通运输部网站",
                "url": "https://www.mot.gov.cn/test.html",
                "tier": "A",
                "is_original": True,
            },
            "evidence": ["官方发布测试政策"],
            "source_facts": "官方发布测试政策。",
            "business_inference": "可能影响道路货运监管。",
            "implication_for_fengxing": "可关注监管平台需求。",
            "recommended_actions": ["跟踪细则"],
            "uncertainties": ["正式文件原文待补核"],
            "review_status": "待人工审核草稿",
        }

        errors = QualityValidator([item]).validate()

        self.assertIn(
            "FXHY-TEST-001: unresolved uncertainty blocks formal output: 正式文件原文待补核",
            errors,
        )

    def test_rejects_arxiv_as_formal_intelligence_source(self):
        item = self._base_item("技术与能力演进")
        item["source"]["url"] = "https://arxiv.org/abs/2604.05987"
        item["fields"] = {
            "技术/能力方向": "供应链智能体",
            "核心变化": "从问答走向流程自动化",
            "应用场景": "运输异常处理",
            "能力启示": "需要可审计的执行闭环",
        }

        errors = QualityValidator([item]).validate()

        self.assertIn(
            "FXHY-TEST-BASE: academic/preprint source cannot enter formal output",
            errors,
        )

    def test_rejects_score_star_mismatch_and_duplicate_url(self):
        first = self._base_item("竞合与标杆动向")
        second = self._base_item("竞合与标杆动向")
        second["id"] = "FXHY-TEST-DUP"
        first["score"] = 82
        first["stars"] = "★★★★★"

        errors = QualityValidator([first, second]).validate()

        self.assertIn("FXHY-TEST-BASE: score 82 should map to ★★★★", errors)
        self.assertIn(
            "duplicate source url: https://example.com/news used by FXHY-TEST-BASE and FXHY-TEST-DUP",
            errors,
        )

    def test_rejects_policy_document_in_technology_category(self):
        item = self._base_item("技术与能力演进")
        item["title"] = "《功能型无人车道路测试及应用试点管理办法（试行）》印发"

        errors = QualityValidator([item]).validate()

        self.assertIn(
            "FXHY-TEST-BASE: policy, regulation, or standard publication must use 政策趋势与监管",
            errors,
        )

    def test_rejects_standard_release_in_technology_category(self):
        item = self._base_item("技术与能力演进")
        item["title"] = "七项人工智能智能体行业标准正式发布"

        errors = QualityValidator([item]).validate()

        self.assertIn(
            "FXHY-TEST-BASE: policy, regulation, or standard publication must use 政策趋势与监管",
            errors,
        )

    def test_rejects_out_of_scope_company_from_formal_output(self):
        item = self._base_item("竞合与标杆动向")
        item["entities"] = ["project44"]

        errors = QualityValidator([item]).validate()

        self.assertIn(
            "FXHY-TEST-BASE: out-of-scope entity cannot enter formal output: project44",
            errors,
        )

    def test_renderer_uses_standard_category_templates(self):
        item = self._base_item("市场客户趋势与资金项目机会")

        text = IntelligenceRenderer([item]).render()

        self.assertIn("## 市场客户趋势与资金项目机会", text)
        self.assertIn("信息类型：资金与项目机会", text)
        self.assertIn("真实新闻链接：https://example.com/news", text)
        self.assertNotIn("score", text)
        self.assertNotIn("分数", text)

    def test_renderer_uses_updated_competitor_fields_and_order(self):
        competitor = self._base_item("竞合与标杆动向")
        market = self._base_item("市场客户趋势与资金项目机会")
        technology = self._base_item("技术与能力演进")

        text = IntelligenceRenderer([technology, market, competitor]).render()

        self.assertLess(text.index("## 竞合与标杆动向"), text.index("## 市场客户趋势与资金项目机会"))
        self.assertLess(text.index("## 竞合与标杆动向"), text.index("## 技术与能力演进"))
        self.assertIn("核心内容：发布车队管理方案。", text)
        self.assertIn("战略意义：可作为新能源车队运营能力对比样本。", text)
        self.assertIn("对丰行的启示：关注车队运营、安全风控和客户交付闭环差异。", text)
        self.assertNotIn("企业主体：", text)
        self.assertNotIn("核心动作：", text)
        self.assertNotIn("参考意义：", text)

    def test_load_json_records_accepts_list_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "selected-intelligence.json"
            path.write_text(json.dumps([self._base_item("政策趋势与监管")]), encoding="utf-8")

            records = load_json_records(path)

        self.assertEqual(records[0]["id"], "FXHY-TEST-BASE")

    def test_validate_weekly_dir_rejects_source_audit_date_mismatch(self):
        with tempfile.TemporaryDirectory() as tmp:
            weekly_dir = Path(tmp)
            item = self._base_item("政策趋势与监管")
            (weekly_dir / "selected-intelligence.json").write_text(
                json.dumps([item], ensure_ascii=False),
                encoding="utf-8",
            )
            (weekly_dir / "source-audit.md").write_text(
                "## FXHY-TEST-BASE 测试标题\n\n- 发布时间：2026-06-19\n",
                encoding="utf-8",
            )

            with redirect_stdout(StringIO()):
                status = validate_weekly_dir(weekly_dir)

        self.assertEqual(status, 1)

    def test_validate_weekly_dir_rejects_taibo_no_find_without_api_scan(self):
        with tempfile.TemporaryDirectory() as tmp:
            weekly_dir = Path(tmp)
            item = self._base_item("政策趋势与监管")
            (weekly_dir / "selected-intelligence.json").write_text(
                json.dumps([item], ensure_ascii=False),
                encoding="utf-8",
            )
            (weekly_dir / "source-audit.md").write_text(
                "## FXHY-TEST-BASE 测试标题\n\n- 发布时间：2026-06-20\n",
                encoding="utf-8",
            )
            (weekly_dir / "candidate-pool.md").write_text(
                "- 泰伯网：作为时空智能、智慧交通、地图和交通数字化线索检索，未发现可回溯候选。\n",
                encoding="utf-8",
            )

            buffer = StringIO()
            with redirect_stdout(buffer):
                status = validate_weekly_dir(weekly_dir)

        self.assertEqual(status, 1)
        self.assertIn("Taibo Data API scan evidence", buffer.getvalue())

    def test_normalize_taibo_record_classifies_direct_fengxing_item(self):
        record = {
            "id": 32009656,
            "guid": 32009656,
            "type_id": 0,
            "title": "交通运输部等：开展智能驾驶“端到端”大模型研发与测试",
            "description": "面向公路货运、园区运输、短途接驳等不同类型场景，开展智能测评技术研发与验证。",
            "created_at": "2026-06-25 11:30",
            "url": "",
            "data": {
                "copyfrom": "交通运输部网站",
                "content": "聚焦矿产、集装箱、粮食等大宗货物干线运输场景，推进货物运输技术性降本提质增效。",
                "linkdatas": [],
            },
        }

        item = normalize_taibo_record(record)

        self.assertEqual(item["relevance_level"], "direct_fengxing")
        self.assertEqual(item["recommended_disposition"], "候选池-需回溯原始来源")
        self.assertEqual(item["suggested_category"], "政策趋势与监管")
        self.assertIn("公路货运", item["matched_keywords"]["direct_fengxing"])

    def test_render_taibo_markdown_keeps_candidate_pool_context(self):
        item = normalize_taibo_record(
            {
                "id": 32009723,
                "title": "国内首个AI自动驾驶数据合成仿真平台在渝上线",
                "description": "平台依托前沿AI技术，重构了智驾数据生产模式。",
                "created_at": "2026-06-24 14:48",
                "data": {"copyfrom": "中国重庆自由贸易试验区", "content": "自动驾驶数据合成仿真平台。"},
            }
        )

        text = render_taibo_markdown([item])

        self.assertIn("用途：候选池线索", text)
        self.assertIn("相关性层级：adjacent_industry", text)
        self.assertIn("处理建议：观察池或淘汰留痕", text)

    def _base_item(self, category):
        fields_by_category = {
            "政策趋势与监管": {
                "政策方向": "道路货运",
                "核心内容": "测试内容",
                "趋势分析": "测试趋势",
                "对丰行的启示": "测试启示",
                "官方原文链接": "https://example.com/news",
                "解读链接": "",
            },
            "市场客户趋势与资金项目机会": {
                "信息类型": "资金与项目机会",
                "客户行业/项目主体": "某市交通运输局",
                "趋势或机会内容": "建设道路货运监管平台。",
                "业务痛点/建设任务": "车辆动态监管与风险闭环。",
                "丰行契合点/可跟进点": "跟踪招标文件和平台建设范围。",
            },
            "资金与项目机会": {
                "机会类型": "政府采购",
                "牵头主体": "某市交通运输局",
                "涉及地区/行业": "华东；道路货运监管",
                "可跟进点": "跟踪招标文件和平台建设范围。",
            },
            "市场与客户趋势": {
                "客户行业": "冷链物流",
                "需求变化": "从基础运输转向全程可视化。",
                "业务痛点": "温控、ETA、异常处置。",
                "丰行契合点": "地图和路径能力可作为底层支撑，待确认。",
            },
            "竞合与标杆动向": {
                "动态类别": "产品落地",
                "核心内容": "发布车队管理方案。",
                "战略意义": "可作为新能源车队运营能力对比样本。",
                "对丰行的启示": "关注车队运营、安全风控和客户交付闭环差异。",
            },
            "技术与能力演进": {
                "技术/能力方向": "运输智能体",
                "核心变化": "从问答转向流程执行。",
                "应用场景": "派车、在途、异常。",
                "能力启示": "需要可审计、可集成。",
            },
        }
        return {
            "id": "FXHY-TEST-BASE",
            "category": category,
            "title": "测试标题",
            "summary": "来源确认的测试事实。",
            "published_at": "2026-06-20",
            "source_published_at": "2026-06-20",
            "event_date": "2026-06-20",
            "date_basis": "测试主来源及事件日期",
            "document_issued_at": None,
            "effective_at": None,
            "page_updated_at": None,
            "stars": "★★★★",
            "score": 82,
            "entities": ["测试主体"],
            "competitor_relation": None,
            "fields": fields_by_category[category],
            "source": {
                "name": "测试来源",
                "url": "https://example.com/news",
                "tier": "A",
                "is_original": True,
            },
            "evidence": ["来源确认的测试事实"],
            "source_facts": "来源确认的测试事实。",
            "business_inference": "可能影响丰行相关业务。",
            "implication_for_fengxing": "建议评估业务契合点。",
            "recommended_actions": ["跟踪后续"],
            "uncertainties": ["无"],
            "review_status": "待人工审核草稿",
        }


class WebsiteTextAuditorTest(unittest.TestCase):
    def test_flags_website_generation_quality_issues(self):
        text = """
市场与客户趋势
重点呈现需求变化背后的业务逻辑，判断客户侧投入方向 and 市场需求的演进趋势。
技术与能力演进
2026-06-17
物流AI大模型：从“经验调度”演进为“预测型调度”
高峰物流深度检验AI与运筹大模型，毫秒决策重排动态路由。
阅读 ArXiv 论文 [PDF]
查看官网原文
"""

        issues = WebsiteTextAuditor(text).audit()

        self.assertIn("mixed English connector found: ' and '", issues)
        self.assertIn("formal page contains ArXiv/preprint content", issues)
        self.assertIn("link text appears without a visible URL: 查看官网原文", issues)
        self.assertIn("unverifiable generated claim mentions 高峰物流", issues)


if __name__ == "__main__":
    unittest.main()
