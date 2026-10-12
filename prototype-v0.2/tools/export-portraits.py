"""
Champion portraits for the game UI: just the artwork window of each printed Set 1 champion card (owner 2026-10-11:
show the champion's picture, not the whole card). Reads public/v02/cards/s1/NNN.webp, writes public/v02/portraits/NNN.webp.
Usage: python prototype-v0.2/tools/export-portraits.py
"""
import os
import re
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
SRC = os.path.join(ROOT, "public", "v02", "cards", "s1")
OUT = os.path.join(ROOT, "public", "v02", "portraits")
os.makedirs(OUT, exist_ok=True)
# Art window on a 600 x 838 card: below the name bar, above the trait bar (★★/★★★ also stop above the Ascension band).
BOX = {1: (32, 118, 568, 456), 2: (32, 118, 568, 418)}
# Which numbers are Ascension (★★/★★★) cards, from the generated printings list.
TS = open(os.path.join(ROOT, "src", "v02", "content", "printings.ts"), encoding="utf-8").read()
ASC = {m.group(2) for m in re.finditer(r'"cardId": "([^"]+-[23])", "set": 1, "no": "(\d{3})"', TS)}
n = 0
for name in sorted(os.listdir(SRC)):
    if not re.fullmatch(r"\d{3}\.webp", name):
        continue
    im = Image.open(os.path.join(SRC, name)).convert("RGB")
    if im.size != (600, 838):
        im = im.resize((600, 838), Image.LANCZOS)
    star = 2 if name[:3] in ASC else 1
    im.crop(BOX[star]).save(os.path.join(OUT, name), quality=88)
    n += 1
print(f"{n} portraits written to public/v02/portraits")
