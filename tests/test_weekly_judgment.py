import copy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

from scripts.intelligence_pipeline import load_weekly_judgment, public_weekly_judgment, render_judgment

ROOT = Path(__file__).resolve().parents[1]


class WeeklyJudgmentTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name) / '2026-09-18'
        self.path.mkdir()
        self.records = [{'id': 'policy-1', 'category': '政策趋势与监管'}, {'id': 'tech-1', 'category': '技术与能力演进'}]
        self.source = self.path / 'selected-intelligence.json'
        self.source.write_text(json.dumps(self.records))
        self.value = {
            'issue_id': self.path.name, 'source_hash': hashlib.sha256(self.source.read_bytes()).hexdigest(),
            'title': '本期判断', 'review_status': '待人工审核草稿',
            'policy': {'title': '政策判断', 'subtitle': '政策变化', 'items': [{'title': '规则', 'body': '地方执行变化。', 'evidence_ids': ['policy-1']}]},
            'industry': {'title': '行业趋势判断', 'subtitle': '能力变化', 'items': [{'title': '能力', 'body': '仍需场景验证。', 'evidence_ids': ['tech-1']}]},
        }

    def check_value(self, value):
        (self.path / 'weekly-judgment.json').write_text(json.dumps(value, ensure_ascii=False))
        return load_weekly_judgment(self.path, self.records)[1]

    def test_required_for_new_issues_and_optional_for_archives(self):
        self.assertTrue(load_weekly_judgment(self.path, self.records)[1])
        self.assertEqual(load_weekly_judgment(self.path.parent / '2026-09-11', self.records), (None, []))

    def test_accepts_same_issue_evidence(self):
        self.assertEqual(self.check_value(self.value), [])

    def test_rejects_cross_issue_and_stale_source(self):
        for field, value in [('issue_id', '2026-09-11'), ('source_hash', '0' * 64)]:
            with self.subTest(field=field):
                data = copy.deepcopy(self.value)
                data[field] = value
                self.assertTrue(self.check_value(data))
        self.source.write_text(self.source.read_text() + '\n')
        self.assertTrue(self.check_value(self.value))

    def test_rejects_foreign_evidence_and_wrong_policy_category(self):
        for ids in [[], ['last-week'], ['tech-1'], [None]]:
            with self.subTest(ids=ids):
                self.value['policy']['items'][0]['evidence_ids'] = ids
                self.assertTrue(self.check_value(self.value))

    def test_empty_evidence_is_explicit_not_fabricated(self):
        self.value['policy']['items'] = []
        self.assertTrue(self.check_value(self.value))
        self.value['policy']['empty_reason'] = '本期证据不足，暂不形成政策判断。'
        self.assertEqual(self.check_value(self.value), [])
        self.assertIn('本期证据不足', render_judgment(self.value))

    def test_public_output_drops_internal_evidence_and_notes(self):
        self.value['analyst_notes'] = '内部笔记'
        self.value['policy']['items'][0]['internal_score'] = 95
        public = public_weekly_judgment(self.value)
        for secret in ['analyst_notes', 'internal_score', 'source_hash', 'evidence_ids']:
            self.assertNotIn(secret, json.dumps(public))
        text = render_judgment(self.value)
        self.assertIn('## 本周主判断', text)
        self.assertIn('### 行业趋势判断', text)
        self.assertNotIn('policy-1', text)

    def test_non_object_fails_cleanly(self):
        self.assertTrue(self.check_value([]))


if __name__ == '__main__':
    unittest.main()
