import importlib.util
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
MODULE_PATH = ROOT / "workflows" / "web-publishing" / "audit_site_bundle.py"
SPEC = importlib.util.spec_from_file_location("audit_site_bundle", MODULE_PATH)
audit_site_bundle = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(audit_site_bundle)


class SiteBundleAuditTest(unittest.TestCase):
    def test_accepts_public_bundle(self):
        with tempfile.TemporaryDirectory() as directory:
            dist = Path(directory)
            (dist / "index.html").write_text("<h1>丰行慧运情报中心</h1>", encoding="utf-8")
            self.assertEqual(audit_site_bundle.audit_dist(dist), [])

    def test_rejects_internal_field(self):
        with tempfile.TemporaryDirectory() as directory:
            dist = Path(directory)
            (dist / "app.js").write_text("const source_facts = [];", encoding="utf-8")
            issues = audit_site_bundle.audit_dist(dist)
            self.assertEqual(len(issues), 1)
            self.assertIn("source_facts", issues[0])


if __name__ == "__main__":
    unittest.main()
