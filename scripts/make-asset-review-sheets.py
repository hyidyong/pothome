from pathlib import Path
import subprocess
import textwrap

from PIL import Image, ImageDraw, ImageFont, ImageOps

root = Path(__file__).resolve().parents[1]
output = root / "tmp" / "asset-picker-review-sheets"
output.mkdir(parents=True, exist_ok=True)
query = "select file_path, file_name, source_group from public.asset_picker_assets where decision in ('undecided','selected') order by source_group, file_name"
result = subprocess.run(
    ["docker", "exec", "supabase_db_work-home", "psql", "-U", "postgres", "-d", "postgres", "-t", "-A", "-F", "\t", "-c", query],
    check=True,
    capture_output=True,
    text=True,
    encoding="utf-8",
)
rows = [line.split("\t") for line in result.stdout.splitlines() if line.strip()]
font = ImageFont.load_default()
tile_width, tile_height = 260, 220
for sheet_index in range(0, len(rows), 40):
    sheet_rows = rows[sheet_index : sheet_index + 40]
    sheet = Image.new("RGB", (tile_width * 5, tile_height * 8), "white")
    draw = ImageDraw.Draw(sheet)
    for index, (file_path, file_name, source_group) in enumerate(sheet_rows):
        x = (index % 5) * tile_width
        y = (index // 5) * tile_height
        try:
            with Image.open(file_path) as source:
                preview = ImageOps.contain(source.convert("RGB"), (240, 175))
                sheet.paste(preview, (x + (240 - preview.width) // 2 + 10, y + 6))
        except Exception:
            draw.rectangle((x + 10, y + 6, x + 250, y + 181), fill="#f5d5d5")
            draw.text((x + 20, y + 90), "미리보기 실패", fill="#8b1e1e", font=font)
        label = textwrap.shorten(f"{source_group} · {file_name}", width=38, placeholder="…")
        draw.text((x + 10, y + 188), f"{sheet_index + index + 1:03d} {label}", fill="#222", font=font)
    sheet.save(output / f"review-{sheet_index // 40 + 1}.jpg", quality=88, optimize=True)
print(f"Wrote {((len(rows) - 1) // 40) + 1 if rows else 0} review sheets for {len(rows)} candidates.")
