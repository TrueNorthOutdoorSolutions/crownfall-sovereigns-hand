"""
Bring the Set 1 MASTER card sheets (Crownfall Art/.../Set 1 - The Shattered Crown/Card Sheets/Cards ###-### *.png)
up to date with the rarity rubric (owner request 2026-10-13: "a perfect master draft copy of Set 1").

Every card whose footer letter differs from its current rarity (and every spell, Scheme and Edict, which were printed
with the Crownfall C/R/P/X letters) gets the letter repainted in place, using patch-rarity-letters.py.
Card numbers and order never change: the set still runs 001-003 Bramble, 004-006 Kira Volt, and so on.

The untouched originals are copied once to  Set 1 - The Shattered Crown/Old/Card Sheets (original print letters)/
and the tool always works FROM those originals, so running it again (after a later rarity change) is safe.

Usage: python prototype-v0.2/tools/patch-sheet-letters.py [--check]
"""
import importlib.util
import os
import shutil
import sys

import numpy as np
from PIL import Image

HERE = os.path.dirname(__file__)


def _load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, file))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


bp = _load("bp", "build-printable.py")
pr = _load("pr", "patch-rarity-letters.py")

SET_DIR = os.path.join(bp.ART, bp.SETS[1])
SHEETS = os.path.join(SET_DIR, "Card Sheets")
ORIGINALS = os.path.join(SET_DIR, "Old", "Card Sheets (original print letters)")


def card_boxes(im):
    """Bounding boxes of the cards on a sheet (same detection as build-printable.split_sheet)."""
    a = np.asarray(im.convert("RGB")).astype(int)
    h, w, _ = a.shape
    dark_col = a[int(h * 0.12):int(h * 0.88)].max(axis=2).max(axis=0) < 24
    runs, start = [], None
    for x in range(w):
        if not dark_col[x] and start is None:
            start = x
        if dark_col[x] and start is not None:
            runs.append((start, x)); start = None
    if start is not None:
        runs.append((start, w))
    boxes = []
    for x0, x1 in (r for r in runs if r[1] - r[0] > w * 0.2):
        rows = np.where(a[:, x0:x1].max(axis=2).max(axis=1) >= 24)[0]
        boxes.append((x0, rows[0], x1, rows[-1] + 1))
    return boxes


def main():
    check = "--check" in sys.argv
    todo = pr.letters_to_patch(1)
    os.makedirs(ORIGINALS, exist_ok=True)
    changed = 0
    for name in sorted(os.listdir(SHEETS)):
        if not (name.lower().startswith("cards ") and name.lower().endswith(".png")):
            continue
        nums = bp.card_numbers(name)
        hits = [(i, f"{n:03d}") for i, n in enumerate(nums) if n is not None and f"{n:03d}" in todo]
        if not hits:
            continue
        orig = os.path.join(ORIGINALS, name)
        if not os.path.exists(orig) and not check:
            shutil.copy2(os.path.join(SHEETS, name), orig)
        src = orig if os.path.exists(orig) else os.path.join(SHEETS, name)
        im = Image.open(src).convert("RGB")
        boxes = card_boxes(im)
        if len(boxes) < len(nums):
            print(f"SKIP {name}: found {len(boxes)} cards, expected {len(nums)}")
            continue
        for i, no in hits:
            x0, y0, x1, y1 = boxes[i]
            card = pr.patch_image(im.crop((x0, y0, x1, y1)), todo[no])
            im.paste(card, (x0, y0))
        if check:
            print(name, [f"{no}->{todo[no]}" for _, no in hits])
        else:
            dest = os.path.join(SHEETS, name)
            tmp = dest + ".tmp.png"
            im.save(tmp)
            try:
                os.replace(tmp, dest)
            except OSError as e:  # file open in another program (e.g. an image viewer)
                os.remove(tmp)
                print(f"COULD NOT SAVE {name}: {e} (close it in any viewer and run again)")
                continue
        changed += 1
    print(f"{changed} master sheets {'would be ' if check else ''}updated; originals kept in {ORIGINALS}")


if __name__ == "__main__":
    main()
