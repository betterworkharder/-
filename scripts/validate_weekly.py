from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scripts.intelligence_pipeline import validate_weekly_dir


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Validate a weekly intelligence output folder")
    parser.add_argument("weekly_dir", type=Path)
    args = parser.parse_args()
    raise SystemExit(validate_weekly_dir(args.weekly_dir))
