"""
One tier plate on every champion card (owner request 2026-10-16): the gold chevron + dark plate + "TIER I…V" exactly as on
card 004 Kira Volt. Cards whose three traits ran into the plate get their trait row gently narrowed to make room.
Plates are frozen crops in card-template/tier-plate-<N>.png (744 x 1039 card coordinates, x 528-714, y 576-644).
"""
import os

import numpy as np
from PIL import Image, ImageFilter

TEMPLATES = os.path.join(os.path.dirname(__file__), "..", "card-template")
W, H = 744, 1039
PX0, PX1, PY0, PY1 = 528, 714, 576, 644


def _white(a):
    return (a.min(axis=2) > 175) & ((a.max(axis=2) - a.min(axis=2)) < 45)


def build_plates(singles):
    """Cut the four clean plates (I-IV) from Set 1 cards and make V from IV (drop the 'I', move the 'V' left)."""
    src = {"I": "004", "II": "040", "III": "079", "IV": "115"}
    for t, n in src.items():
        Image.open(os.path.join(singles, n + ".png")).convert("RGB").crop((PX0, PY0, PX1, PY1)).save(
            os.path.join(TEMPLATES, f"tier-plate-{t}.png"))
    a = np.asarray(Image.open(os.path.join(TEMPLATES, "tier-plate-IV.png"))).astype(int).copy()
    # columns in plate coords: 'I' of IV at ~657-664, 'V' at ~666-686 (card x); plate x = card x - PX0
    i0, v0, v1 = 652 - PX0, 665 - PX0, 690 - PX0
    vglyph = a[:, v0:v1].copy()
    bg = np.median(a[:, 578 - PX0:586 - PX0], axis=1, keepdims=True)  # plain plate between chevron and 'T'
    rows = slice(12, 56)
    a[rows, i0:v1 + 2] = bg[rows]
    a[rows, i0 + 4:i0 + 4 + (v1 - v0)] = vglyph[rows]
    Image.fromarray(a.astype("uint8")).save(os.path.join(TEMPLATES, "tier-plate-V.png"))


BX0, BX1, BY0, BY1 = 28, 716, 570, 648   # the whole trait bar on card 004


def _content(a, x1):
    """Soft mask of the trait icons, words and separators on a trait bar (dark plate + gold rims excluded)."""
    reg = a[BY0:BY1, BX0:x1]
    mx = reg.max(axis=2)
    alpha = np.clip((mx - 75) / 55.0, 0, 1)
    alpha[:12] = 0; alpha[-12:] = 0      # the bar's gold top / bottom rims
    alpha[:, :18] = 0                    # the bar's left end cap
    return alpha


_BLANK = None


def _blank_bar():
    """Card 004 with its trait words removed: the plain bar strip x 445-535 (nothing written there) repeated along it."""
    global _BLANK
    if _BLANK is None:
        r = np.asarray(Image.open(os.path.join(TEMPLATES, "frame-ref-004-champion.png")).convert("RGB").resize((W, H))).astype(float)
        for x in range(50, 546):
            r[BY0:BY1, x] = r[BY0:BY1, 445 + (x - 50) % 90]
        # smooth the repeat seams along the bar (horizontal blur only, so the gold rims stay crisp)
        strip = Image.fromarray(r[BY0 + 12:BY1 - 12, 50:546].astype("uint8"))
        r[BY0 + 12:BY1 - 12, 50:546] = np.asarray(strip.filter(ImageFilter.BoxBlur(0)).resize((124, strip.height)).resize(strip.size, Image.BICUBIC)).astype(float)
        _BLANK = r
    return _BLANK


def apply(card, tier):
    """card at any size; tier 'I'..'V'. Card 004's whole trait bar + the master tier plate, with this card's own icons and
    words laid on top (narrowed when three traits would run into the plate)."""
    im = card.convert("RGB")
    size = im.size
    a = np.asarray(im.resize((W, H), Image.LANCZOS)).astype(float)
    ref = _blank_bar()
    plate = np.asarray(Image.open(os.path.join(TEMPLATES, f"tier-plate-{tier}.png")).convert("RGB")).astype(float)
    # where this card's tier plate starts: its chevron is the first bright gold run right of the traits
    wm = _white(a[590:630].astype(int)).any(axis=0)
    xs = np.where(wm[400:712])[0] + 400
    left = xs.max() if len(xs) else 600
    for x in xs[::-1]:
        if left - x > 14:
            break
        left = x
    chev = left - 6
    alpha = _content(a, chev)
    # drop a stray "|" just before the old chevron (the plate brings its own edge)
    cols = np.where(alpha.max(axis=0) > 0.3)[0]
    if len(cols):
        runs, st = [], cols[0]
        for c0, c1 in zip(cols, list(cols[1:]) + [None]):
            if c1 is None or c1 - c0 > 6:
                runs.append((st, c0)); st = c1
        # trailing gold pieces (the old chevron, a "|" before the tier) go: they hold almost no white text
        white = _white(a[BY0:BY1, BX0:chev].astype(int))
        while len(runs) > 1 and runs[-1][1] - runs[-1][0] < 45 and white[:, runs[-1][0]:runs[-1][1] + 1].mean() < 0.04:
            alpha[:, runs[-1][0]:] = 0
            runs.pop()
        end = runs[-1][1] + 1 if runs else 1
    else:
        end = 1
    ys = np.where(alpha.max(axis=1) > 0.3)[0]
    ref_alpha = _content(np.asarray(Image.open(os.path.join(TEMPLATES, "frame-ref-004-champion.png")).convert("RGB").resize((W, H))).astype(float), 420)
    rys = np.where(ref_alpha.max(axis=1) > 0.3)[0]
    dy = int(round((rys.min() + rys.max()) / 2 - (ys.min() + ys.max()) / 2)) if len(ys) and len(rys) else 0
    room = (PX0 + 20) - BX0                # content must end before the plate's chevron
    src = a[BY0:BY1, BX0:BX0 + end]
    al = alpha[:, :end]
    if end > room:
        src = np.asarray(Image.fromarray(src.astype("uint8")).resize((room, BY1 - BY0), Image.LANCZOS)).astype(float)
        al = np.asarray(Image.fromarray((al * 255).astype("uint8")).resize((room, BY1 - BY0), Image.LANCZOS)).astype(float) / 255
    out = a.copy()
    out[BY0:BY1, BX0:BX1] = ref[BY0:BY1, BX0:BX1]
    m = np.ones(plate.shape[:2]) * np.clip(np.arange(plate.shape[1]) / 3.0, 0, 1)[None, :]
    out[PY0:PY1, PX0:PX1] = out[PY0:PY1, PX0:PX1] * (1 - m[..., None]) + plate * m[..., None]
    wdt = src.shape[1]
    y0 = BY0 + dy
    tgt = out[y0:y0 + (BY1 - BY0), BX0:BX0 + wdt]
    out[y0:y0 + (BY1 - BY0), BX0:BX0 + wdt] = tgt * (1 - al[..., None]) + src * al[..., None]
    return Image.fromarray(np.clip(out, 0, 255).astype("uint8")).resize(size, Image.LANCZOS)


TIER_OF = {"Tier I · Common": "I", "Tier II · Uncommon": "II", "Tier III · Elite": "III", "Tier IV · Epic": "IV", "Tier V · Mythic": "V"}


def tiers(set_no):
    import csv
    out = {}
    path = os.path.join(TEMPLATES, "..", f"master-card-list-set{set_no}.csv")
    for r in csv.DictReader(open(path, encoding="utf-8-sig")):
        t = r["Champion tier"].strip()
        roman = TIER_OF.get(t) or (t.split()[1] if t.startswith("Tier ") else None)
        if r["No."][3:].isdigit() and roman in ("I", "II", "III", "IV", "V"):
            out[int(r["No."][3:])] = roman
    return out
