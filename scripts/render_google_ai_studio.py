from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scripts.intelligence_pipeline import render_weekly_dir


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Render google-ai-studio-input.md from selected-intelligence.json")
    parser.add_argument("weekly_dir", type=Path)
    args = parser.parse_args()
    raise SystemExit(render_weekly_dir(args.weekly_dir))
