"""Render tight, unredacted certificate previews directly from the prepared PDFs.

Usage: python3 scripts/render_previews.py --source-dir '/path/to/Prepared Documents'
Requires Pillow and Poppler. Certificates are rendered at 400 DPI and saved as
lossless WebP without an added matte, borders, credential masks, or enlargement.
Optional document arguments regenerate the corresponding seminar/paper previews.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image, ImageChops, ImageOps


OUT = Path(__file__).resolve().parents[1] / "docs" / "assets" / "previews"

# Trim only the source page's outer blank/scanner margins. Keep the complete
# certificate designs, signatures, QR code, serial numbers, and credential IDs.
CERTIFICATES = (
    ("Academic Certificates/001-OPJEMS-2019-saha-nilabro.pdf", (.004, 0, 1, 1), "opjems-2019"),
    ("Academic Certificates/002-OPJEMS-2020-saha-nilabro.pdf", (.045, .045, .962, .93), "opjems-2020"),
    ("Academic Certificates/003-CMERI-internship-saha-nilabro.pdf", (.020, .054, .962, .95), "cmeri-internship"),
    ("Academic Certificates/004-SIH2020-saha-nilabro.pdf", (0, .019, 1, .978), "sih-2020"),
    ("Academic Certificates/005-iNaCoMM2021-saha-nilabro.pdf", (.029, .042, .97, .962), "inacomm-2021"),
    ("Professional Certificates/2026-06-05 - Oracle GoldenGate 19c Implementation Certified Professional.pdf", (.063, .074, .94, .878), "oracle-goldengate"),
    ("Professional Certificates/2026-02-16 - Fusion AI Agent Studio Developer Professional.pdf", (.063, .074, .94, .878), "oracle-fusion-ai"),
)


def render_page(pdf: Path, page: int, dpi: int = 400) -> Image.Image:
    with tempfile.TemporaryDirectory(prefix="portfolio-pdf-") as temporary:
        prefix = Path(temporary) / "page"
        subprocess.run(
            ["pdftoppm", "-f", str(page), "-l", str(page), "-singlefile", "-r", str(dpi), "-png", str(pdf), str(prefix)],
            check=True,
            capture_output=True,
        )
        with Image.open(prefix.with_suffix(".png")) as image:
            return image.convert("RGB")


def crop(image: Image.Image, bounds: tuple[float, float, float, float]) -> Image.Image:
    width, height = image.size
    return image.crop(tuple(round(value * dimension) for value, dimension in zip(bounds, (width, height, width, height))))


def trim_white(image: Image.Image) -> Image.Image:
    """Remove blank outer margins from an evidence excerpt, retaining its content."""
    difference = ImageChops.difference(image, Image.new("RGB", image.size, "white"))
    mask = difference.convert("L").point(lambda value: 255 if value > 18 else 0)
    bounds = mask.getbbox()
    return image.crop(bounds) if bounds else image


def save(image: Image.Image, name: str) -> dict:
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f"{name}.webp"
    image.save(path, format="WEBP", lossless=True, method=4)
    preview = ImageOps.contain(image, (1600, 1600), Image.Resampling.LANCZOS) if max(image.size) > 1600 else image.copy()
    preview.save(OUT / f"{name}-preview.webp", format="WEBP", lossless=True, method=4)
    print(f"Wrote {path.name}: {image.width} × {image.height}, {path.stat().st_size:,} bytes", flush=True)
    return {"name": name, "width": image.width, "height": image.height, "bytes": path.stat().st_size, "preview_width": preview.width, "preview_height": preview.height, "version": hashlib.sha256(path.read_bytes()).hexdigest()[:12]}


def make_inae(source_dir: Path, dpi: int) -> Image.Image:
    """Combine the same approval passage and complete named row without a matte.

    These remain two separate source excerpts, not one continuous document.
    No content within the selected passages is masked or redacted.
    """
    pdf = source_dir / "INAE-mentee-saha-nilabro.pdf"
    approval = trim_white(crop(render_page(pdf, 2, dpi), (.055, .34, .95, .43)))
    row = trim_white(crop(render_page(pdf, 4, dpi), (.116, .477, .918, .569)))
    # Downsize the wider excerpt to match the narrower one; never enlarge text.
    width = min(approval.width, row.width)
    pieces = [ImageOps.contain(piece, (width, piece.height), Image.Resampling.LANCZOS) for piece in (approval, row)]
    gap = max(1, round(dpi / 50))
    combined = Image.new("RGB", (width, sum(piece.height for piece in pieces) + gap), "white")
    top = 0
    for piece in pieces:
        combined.paste(piece, (0, top))
        top += piece.height + gap
    return combined


def update_dimensions(results: list[dict]) -> None:
    """Keep the HTML's intrinsic dimensions in sync without changing its layout."""
    page = OUT.parents[1] / "index.html"
    html = page.read_text()
    for result in results:
        pattern = r'<img\b[^>]*\bsrc="\./assets/previews/' + re.escape(result["name"]) + r'\.webp(?:\?[^"]*)?"[^>]*>'
        full_url = f'./assets/previews/{result["name"]}.webp?v={result["version"]}'
        def replace(match):
            tag = re.sub(r'\bwidth="\d+"', f'width="{result["width"]}"', match.group())
            tag = re.sub(r'\bheight="\d+"', f'height="{result["height"]}"', tag)
            tag = re.sub(r'\s+(?:srcset|sizes)="[^"]*"', '', tag)
            tag = re.sub(r'\bsrc="[^"]*"', f'src="{full_url}"', tag)
            variants = f'./assets/previews/{result["name"]}-preview.webp?v={result["version"]} {result["preview_width"]}w, {full_url} {result["width"]}w'
            sizes = '(max-width: 700px) calc(100vw - 30px), (max-width: 1000px) calc((100vw - 62px) / 2), 328px'
            return tag.replace('/>', f' srcset="{variants}" sizes="{sizes}"/>')
        html = re.sub(pattern, replace, html)
        link = r'href="\./assets/previews/' + re.escape(result["name"]) + r'\.webp(?:\?[^"]*)?"'
        html = re.sub(link, f'href="{full_url}"', html)
    page.write_text(html)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", required=True, type=Path)
    parser.add_argument("--dpi", type=int, default=400)
    parser.add_argument("--seminar-one", type=Path)
    parser.add_argument("--seminar-two", type=Path)
    parser.add_argument("--gear-paper", type=Path)
    parser.add_argument("--linkage-paper", type=Path)
    args = parser.parse_args()
    source = args.source_dir.expanduser().resolve()
    if args.dpi < 72:
        parser.error("--dpi must be at least 72")
    required = [source / relative for relative, _, _ in CERTIFICATES] + [source / "INAE-mentee-saha-nilabro.pdf"]
    missing = [str(path) for path in required if not path.is_file()]
    if missing:
        parser.error("Missing source PDFs: " + ", ".join(missing))

    def render_certificate(spec):
        relative, bounds, name = spec
        image = crop(render_page(source / relative, 1, args.dpi), bounds)
        result = save(image, name)
        return {**result, "source": relative, "page": 1, "crop": list(bounds), "dpi": args.dpi, "lossless": True, "redacted": False, "added_padding": 0}

    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(render_certificate, CERTIFICATES))
    results.append({**save(make_inae(source, args.dpi), "inae-mentee"), "source": "INAE-mentee-saha-nilabro.pdf", "pages": [2, 4], "dpi": args.dpi, "lossless": True, "redacted": False, "added_padding": 0, "note": "Two separate excerpts: approval passage and complete named appendix row; an 8px separator distinguishes them at 400 DPI."})
    (OUT / "CERTIFICATE-SOURCES.json").write_text(json.dumps(results, indent=2, ensure_ascii=False) + "\n")

    for pdf, name, bottom in (
        (args.seminar_one, "seminar-wearable-technology", 1),
        (args.seminar_two, "seminar-compliant-mechanisms", 1),
        (args.gear_paper, "paper-gear-meshing", .58),
        (args.linkage_paper, "paper-linkage-kinematics", .78),
    ):
        if pdf:
            image = render_page(pdf.expanduser().resolve(), 1, args.dpi)
            results.append(save(crop(image, (0, 0, 1, bottom)), name))
    update_dimensions(results)


if __name__ == "__main__":
    main()
