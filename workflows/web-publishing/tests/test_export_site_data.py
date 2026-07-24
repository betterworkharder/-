import importlib.util
import copy
import json
import shutil
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
MODULE_PATH = ROOT / "workflows" / "web-publishing" / "export_site_data.py"
SPEC = importlib.util.spec_from_file_location("export_site_data", MODULE_PATH)
export_site_data = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(export_site_data)


class SitePublicationTest(unittest.TestCase):
    def test_generated_content_and_index_are_deterministic(self):
        first = export_site_data.build_site_content(ROOT)
        second = export_site_data.build_site_content(ROOT)
        self.assertEqual(first, second)
        self.assertEqual(first["mode"], "site")
        issue_ids = [issue["issue_id"] for issue in first["issues"]]
        self.assertGreaterEqual(len(issue_ids), 4)
        self.assertEqual(issue_ids, sorted(issue_ids, reverse=True))
        self.assertEqual(first["latest_issue_id"], issue_ids[0])
        self.assertEqual(issue_ids[0], "2026-07-24")
        self.assertNotIn("2026-07-23", issue_ids)
        self.assertNotIn("provenance", first["issues"][0])
        self.assertIn("content_hash", first["issues"][0])
        self.assertEqual(first["portal"]["schema_version"], 1)
        self.assertEqual(
            [category["id"] for category in first["issues"][0]["categories"]],
            ["policy", "competitor", "market-opportunity", "tech"],
        )

    def test_portal_output_is_valid(self):
        portal = export_site_data.load_portal_content(ROOT)
        export_site_data.validate_portal_content(portal)
        self.assertGreaterEqual(len(portal["expert_insights"]["items"]), 2)
        self.assertGreaterEqual(len(portal["competitor_dashboard"]["groups"]), 5)

    def test_content_hash_detects_manual_changes(self):
        issue = copy.deepcopy(export_site_data.load_published_issues(ROOT)[0])
        issue["title"] = "手工篡改标题"
        with self.assertRaises(export_site_data.PublicationError):
            export_site_data.validate_issue(issue)

    def test_formal_item_maps_to_existing_visual_contract(self):
        item = {
            "id": "FXHY-TEST",
            "category": "市场客户趋势与资金项目机会",
            "title": "测试标题",
            "summary": "测试摘要",
            "published_at": "2026-07-17",
            "stars": "★★★★",
            "fields": {
                "信息类型": "市场与客户趋势",
                "客户行业/项目主体": "制造业货主",
                "趋势或机会内容": "统一运输协同",
                "业务痛点/建设任务": "系统割裂",
                "丰行契合点/可跟进点": "运输控制塔"
            },
            "source": {"name": "测试来源", "url": "https://example.com"},
            "recommended_actions": ["继续跟踪"]
        }
        mapped = export_site_data.convert_selected_item(item)
        self.assertEqual(mapped["eventProperty"], "市场与客户趋势\n制造业货主")
        self.assertEqual(mapped["coreFacts"], "统一运输协同")
        self.assertEqual(mapped["rating"], 4)
        self.assertEqual(mapped["sourceLabel"], "测试来源")

    def test_validated_issue_exports_without_review_record(self):
        internal_issue = ROOT / "output" / "weekly" / "2026-07-10"
        if not internal_issue.exists():
            self.skipTest("internal weekly source is intentionally absent from public release")
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_root = Path(temp_dir)
            shutil.copytree(ROOT / "scripts", temp_root / "scripts")
            shutil.copytree(ROOT / "publish", temp_root / "publish")
            shutil.copytree(ROOT / "output" / "site", temp_root / "output" / "site")
            shutil.copytree(
                internal_issue,
                temp_root / "output" / "weekly" / "2026-07-10",
            )
            generated = temp_root / "site-content.json"
            export_site_data.export_validated_issue(temp_root, "2026-07-10", generated)
            site = json.loads(generated.read_text(encoding="utf-8"))
            issue = export_site_data.read_json(
                temp_root / "publish" / "weekly" / "2026-07-10" / "issue.json"
            )
            self.assertEqual(site["mode"], "site")
            self.assertEqual(issue["provenance"]["type"], "validated_intelligence")
            self.assertFalse((temp_root / "publish" / "reviews").exists())


if __name__ == "__main__":
    unittest.main()
