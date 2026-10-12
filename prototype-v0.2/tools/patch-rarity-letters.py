"""
Repaint the rarity letter in a card's footer (owner approval 2026-10-12): Set 1 was printed with tier-based letters,
but its rarity now follows the rarity rubric (data/set1-digital-rarity.json). This covers the old letter with the
footer's own background and writes the new one in the same place and style. Only regular numbered cards carry a
letter (Alternate Art, Masterwork and Omega footers show AA / X/100 / OMEGA instead).

Usage:
  python prototype-v0.2/tools/patch-rarity-letters.py            patch the game images and the printable singles
  python prototype-v0.2/tools/patch-rarity-letters.py --check    list what would change, write nothing
export-card-images.py and build-printable.py call patch_image() themselves, so a re-export keeps the new letters.
Master card sheets in Crownfall Art are never touched.
"""
import json
import os
import re
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
DATA = os.path.join(ROOT, "prototype-v0.2", "data")
LETTER = {"common": "C", "uncommon": "U", "elite": "E", "epic": "P", "mythic": "M"}


def letters_to_patch(set_no=1):
    """{card number: new letter} for every regular card whose printed letter differs from its digital rarity."""
    printed = json.load(open(os.path.join(DATA, f"set{set_no}-printed-letters.json"), encoding="utf-8"))["letters"]
    ts = open(os.path.join(ROOT, "src", "v02", "content", "printings.ts"), encoding="utf-8").read()
    digital = {m.group(1): LETTER[m.group(2)] for m in re.finditer(
        rf'"set": {set_no}, "no": "(\d{{3}})", "kind": "base", "rarity": "(\w+)"', ts)}
    return {n: l for n, l in digital.items() if printed.get(n) and printed[n] != l}


def _font(size):
    for name in ("georgia.ttf", "times.ttf", "DejaVuSerif.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default()


def patch_image(im, letter):
    """Return a copy of a card image (any size, card proportions) with its footer rarity letter replaced."""
    im = im.convert("RGB").copy()
    w, h = im.size
    sx, sy = w / 600, h / 838
    # The letter sits between the card number ("021/248") and the studio name, on the footer baseline.
    bx0, bx1, by0, by1 = int(105 * sx), int(175 * sx), int(790 * sy), int(826 * sy)
    a = np.asarray(im).astype(int)[by0:by1, bx0:bx1].max(axis=2)
    cols = np.where((a > 150).any(axis=0))[0]
    if len(cols) == 0:
        raise ValueError("no footer letter found")
    # The window can catch the tail of a wide card number: keep only the rightmost run of lit columns (the letter).
    gaps = np.where(np.diff(cols) > max(2, round(3 * sx)))[0]
    cols = cols[gaps[-1] + 1:] if len(gaps) else cols
    ys = np.where((a[:, cols.min():cols.max() + 1] > 150).any(axis=1))[0]
    x0, x1, y0, y1 = cols.min() + bx0, cols.max() + bx0, ys.min() + by0, ys.max() + by0
    if (x1 - x0) > 22 * sx or (y1 - y0) > 22 * sy:
        raise ValueError(f"footer letter box looks wrong ({x1 - x0}x{y1 - y0})")
    pad = max(2, round(3 * sx))
    # Cover it with a strip of plain footer taken from just to its right (the gap before the studio name).
    gw = x1 - x0 + 2 * pad
    src = im.crop((x1 + pad + round(4 * sx), y0 - pad, x1 + pad + round(4 * sx) + gw, y1 + pad + 1))
    im.paste(src, (x0 - pad, y0 - pad))
    size = max(8, round((y1 - y0 + 1) / 0.68))
    ImageDraw.Draw(im).text(((x0 + x1) / 2, (y0 + y1) / 2 + 0.5 * sy), letter, font=_font(size), fill=(238, 234, 224), anchor="mm")
    return im


def main():
    todo = letters_to_patch(1)
    check = "--check" in sys.argv
    game = os.path.join(ROOT, "public", "v02", "cards", "s1")
    art = r"C:\Users\micha\Desktop\Crownfall Art\10 Sovereign's Hand\Set 1 - The Shattered Crown\PRINTABLE CARDS\Individual Cards"
    done = 0
    for n, letter in sorted(todo.items()):
        for path, fmt in ((os.path.join(game, f"{n}.webp"), "WEBP"), (os.path.join(art, f"{n}.png"), "PNG")):
            if not os.path.exists(path):
                continue
            if check:
                print(n, letter, path)
                continue
            out = patch_image(Image.open(path), letter)
            out.save(path, fmt, **({"quality": 76, "method": 6} if fmt == "WEBP" else {}))
            done += 1
    print(f"{len(todo)} cards need a new letter; {done} images patched." if not check else f"{len(todo)} cards need a new letter.")


if __name__ == "__main__":
    main()
