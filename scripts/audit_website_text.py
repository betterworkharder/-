from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scripts.intelligence_pipeline import audit_text_file


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Audit generated website text for intelligence quality issues")
    parser.add_argument("text_file", type=Path)
    args = parser.parse_args()
    raise SystemExit(audit_text_file(args.text_file))
