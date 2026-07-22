"""Extract embedded Office/PDF images without changing source documents."""

from __future__ import annotations

import hashlib
import os
from pathlib import Path
import shutil
import sys
import zipfile

IMAGE_EXTENSIONS = {".avif", ".bmp", ".gif", ".heic", ".heif", ".jpeg", ".jpg", ".png", ".svg", ".tif", ".tiff", ".webp"}
OFFICE_EXTENSIONS = {".docx", ".pptx", ".xlsx"}
CONTAINER_EXTENSIONS = OFFICE_EXTENSIONS | {".zip"}
SKIP_DIRECTORIES = {".git", ".next", ".superpowers", ".worktrees", "node_modules", "tmp"}


def safe_name(value: str) -> str:
    return "".join(character if character.isalnum() or character in " -_." else "_" for character in value)[:100]


def destination_root(source: Path, desktop: Path, output: Path) -> Path:
    relative = source.relative_to(desktop)
    group = safe_name(relative.parts[0] if relative.parts else "Desktop")
    digest = hashlib.sha1(str(source).encode("utf-8")).hexdigest()[:10]
    return output / group / f"{safe_name(source.stem)}-{digest}"


def extract_zip_images(source: Path, desktop: Path, output: Path) -> int:
    count = 0
    try:
        with zipfile.ZipFile(source) as archive:
            for entry in archive.infolist():
                suffix = Path(entry.filename).suffix.lower()
                is_office_media = source.suffix.lower() in OFFICE_EXTENSIONS and "/media/" in entry.filename.lower()
                if suffix not in IMAGE_EXTENSIONS or (source.suffix.lower() in OFFICE_EXTENSIONS and not is_office_media):
                    continue
                target = destination_root(source, desktop, output) / safe_name(Path(entry.filename).name)
                target.parent.mkdir(parents=True, exist_ok=True)
                with archive.open(entry) as incoming, target.open("wb") as outgoing:
                    shutil.copyfileobj(incoming, outgoing)
                count += 1
    except (OSError, zipfile.BadZipFile):
        return count
    return count


def extract_pdf_images(source: Path, desktop: Path, output: Path) -> int:
    try:
        from pypdf import PdfReader
        reader = PdfReader(str(source))
    except Exception:
        return 0
    count = 0
    for page_index, page in enumerate(reader.pages, start=1):
        try:
            images = page.images
        except Exception:
            continue
        for image_index, image in enumerate(images, start=1):
            extension = Path(image.name).suffix.lower() or ".bin"
            if extension not in IMAGE_EXTENSIONS:
                extension = ".png"
            target = destination_root(source, desktop, output) / f"page-{page_index}-{image_index}{extension}"
            target.parent.mkdir(parents=True, exist_ok=True)
            try:
                target.write_bytes(image.data)
                count += 1
            except OSError:
                continue
    return count


def walk(desktop: Path):
    for root, directories, files in os.walk(desktop):
        directories[:] = [directory for directory in directories if directory not in SKIP_DIRECTORIES]
        for filename in files:
            yield Path(root) / filename


def main() -> None:
    desktop = Path(os.environ.get("USERPROFILE", "")) / "OneDrive" / "Desktop"
    output = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("tmp") / "asset-picker-extracted"
    containers = pdfs = extracted = 0
    for source in walk(desktop):
        suffix = source.suffix.lower()
        if suffix in CONTAINER_EXTENSIONS:
            containers += 1
            extracted += extract_zip_images(source, desktop, output)
        elif suffix == ".pdf":
            pdfs += 1
            extracted += extract_pdf_images(source, desktop, output)
    print(f"Extracted {extracted} embedded images from {containers} Office/ZIP files and {pdfs} PDFs.")


if __name__ == "__main__":
    main()
