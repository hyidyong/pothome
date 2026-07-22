from pathlib import Path
import shutil

target = Path(__file__).resolve().parents[1] / "tmp" / "asset-picker-extracted"
if target.exists() and target.is_dir():
    shutil.rmtree(target)
print(f"Cleaned generated catalog directory: {target}")
