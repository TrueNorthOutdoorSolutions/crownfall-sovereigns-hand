"""
Set 2: one locked master image per Origin / Class icon (owner request 2026-10-20, picks approved the same day).

  python tools/set2-icons.py masters            cut the masters from the picked cards -> card-template/icons-set2/
  python tools/set2-icons.py preview <sheet>    write a before/after preview of one card sheet (nothing saved over)
  python tools/set2-icons.py apply <sheet> <out>  write the fixed sheet to <out>

Works like the footer fix: only the small icon squares on the trait bar change. The old icon is erased with the
bar's own colour (blended from either side of it) and the master is laid on top, centred where the old one was.
Never mass-apply: preview one sheet, get the owner's OK, then do the rest.
"""
import csv
import json
import os
import sys

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
ART = "C:/Users/micha/Desktop/Crownfall Art/10 Sovereign's Hand/Set 2 - Beneath the Arena/Card Sheets/"
OUT = os.path.join(ROOT, "card-template", "icons-set2-locked")
H = 858  # masters are stored at sheet card height 858

# Owner-approved masters, 2026-10-20: trait -> the (current) card number its icon is cut from.
PICKS = {"Artificer": 17, "Astral": 28, "Binder": 126, "Channeler": 111, "Dawnforged": 20, "Delver": 20,
         "Elemental": 23, "Gearbound": 6, "Gladiator": 31, "Hexbound": 34, "Hollow": 4, "Hunter": 9, "Kingdom": 13,
         "Restorer": 23, "Riftborn": 108, "Rogue": 25, "Sapper": 1, "Seer": 113, "Sentinel": 4, "Sharpshooter": 3,
         "Titanborn": 26, "Umbral": 25, "Verdant": 1, "Voltborn": 3, "Wildkin": 9}


# ---- finding the trait bar and its icons --------------------------------------------------------------------------
def _beige(a):
    return (a[..., 0] > 185) & (a[..., 1] > 160) & (a[..., 2] > 115) & (a[..., 0] - a[..., 2] > 20)


def bar(a):
    """(top, bottom) rows of the trait bar's inside, just above the text box's parchment."""
    h, w, _ = a.shape
    b = _beige(a)[:, int(w * .25):int(w * .75)].mean(1)
    pt = next(y for y in range(int(h * .53), int(h * .75)) if b[y] > .6 and b[y + 4] > .6)
    k = h / H
    return pt - int(54 * k), pt - int(7 * k)


def _runs(mask, gap):
    cols = np.where(mask.any(0))[0]
    out, st = [], None
    for c0, c1 in zip(cols, list(cols[1:]) + [None]):
        st = c0 if st is None else st
        if c1 is None or c1 - c0 > gap:
            out.append([int(st), int(c0)])
            st = None
    return out


def icons(a):
    """Boxes (x0, y0, x1, y1) of every trait icon on a Set 2 card, left to right: the first icon after the bar's
    left cap, then the icon after each gold '|' divider. None if the bar can't be read."""
    h, w, _ = a.shape
    k = h / H
    T, B = bar(a)
    t, b = T + int(8 * k), B - int(5 * k)
    reg = a[t:b]
    fg = reg.max(2) > 115
    rs = _runs(fg, int(4 * k))
    i1 = next((i for i, r in enumerate(rs) if r[0] >= 54 * k and r[1] - r[0] >= 15 * k), None)
    if i1 is None:
        return None

    def gold(r):
        p = reg[:, r[0]:r[1] + 1][fg[:, r[0]:r[1] + 1]]
        return len(p) > 0 and ((p[:, 0] > 100) & (p[:, 2] < 0.65 * p[:, 0])).mean() > .5

    pipes = [i for i, r in enumerate(rs) if i > i1 and r[1] - r[0] <= 5 * k and r[0] < w * .72 and gold(r) and i + 1 < len(rs)]
    return [(r[0], T + int(k), r[1] + 1, B) for r in [rs[i1]] + [rs[i + 1] for i in pipes]]


# ---- cards on disk -------------------------------------------------------------------------------------------------
def _pins():
    return json.load(open(os.path.join(ROOT, "data", "set2-printed.json"), encoding="utf-8"))["cards"]


def _rows():
    return {r["Card ID"]: r for r in csv.DictReader(open(os.path.join(ROOT, "master-card-list-set2.csv"), encoding="utf-8-sig"))}


def traits(r):
    return [t.strip() for part in (r["Origins"], r["Classes"]) for t in part.replace("\u00b7", "|").split("|") if t.strip()]


def sheet_cards(path):
    """[(card id, x0, x1)] for the three cards on a saved sheet, read from the footer-fix map (sheet files keep the
    pre-renumber number in their name)."""
    old = json.load(open(os.path.join(ROOT, "data", "set2-printed-before-2026-10-20.json"), encoding="utf-8"))["cards"]
    byold = {o["no"]: cid for cid, o in old.items()}
    s = int(os.path.basename(path)[6:9])
    w = Image.open(path).width
    return [(byold.get(s + i), x0, x1) for i, (x0, x1) in enumerate([(0, 611), (611, 1222), (1222, w)])]


# ---- masters -------------------------------------------------------------------------------------------------------
def _bg_fill(a, x0, x1, y0, y1, pad=4):
    """The bar's own colour under an icon: per row, a blend from the plain bar just left to just right of it."""
    L = np.median(a[y0:y1, max(0, x0 - pad - 4):x0 - pad], axis=1)
    R = np.median(a[y0:y1, x1 + pad:x1 + pad + 4], axis=1)
    lb, rb = L.mean(), R.mean()
    if lb > rb + 25:          # the left sample hit the bar's gold end-cap: use the plain bar on the right
        L = R
    elif rb > lb + 25:
        R = L
    t = np.linspace(0, 1, x1 - x0 + 2 * pad)[None, :, None]
    return L[:, None, :] * (1 - t) + R[:, None, :] * t


def _main_pieces(mask):
    """Mask of the connected pieces that make up the icon (pieces at least 8% the size of the biggest)."""
    lab = np.zeros(mask.shape, int)
    sizes, n = [], 0
    for y, x in zip(*np.nonzero(mask)):
        if lab[y, x]:
            continue
        n += 1
        stack, size = [(y, x)], 0
        lab[y, x] = n
        while stack:
            cy, cx = stack.pop()
            size += 1
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    yy, xx = cy + dy, cx + dx
                    if 0 <= yy < mask.shape[0] and 0 <= xx < mask.shape[1] and mask[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = n
                        stack.append((yy, xx))
        sizes.append(size)
    if not sizes:
        return mask.astype(float)
    keep = [i + 1 for i, sz in enumerate(sizes) if sz >= .08 * max(sizes)]
    return np.isin(lab, keep).astype(float)


def cut_masters():
    os.makedirs(OUT, exist_ok=True)
    pins, rows = _pins(), _rows()
    bynew = {p["no"]: cid for cid, p in pins.items()}
    found = {}
    for f in sorted(os.listdir(ART)):
        if not f.startswith("Card"):
            continue
        if f.startswith("Card ") and not f.startswith("Cards "):          # single masters 001-003
            n = int(f[5:8])
            items = [(bynew[n], Image.open(ART + f).convert("RGB"))]
        elif f.startswith("Cards 001"):
            continue
        else:
            im = Image.open(ART + f).convert("RGB")
            items = [(cid, im.crop((x0, 0, x1, im.height))) for cid, x0, x1 in sheet_cards(ART + f) if cid]
        for cid, card in items:
            n = pins[cid]["no"]
            want = [t for t in traits(rows[cid]) if PICKS.get(t) == n] if rows[cid]["Origins"] else []
            if not want:
                continue
            if card.height != H:
                card = card.resize((round(card.width * H / card.height), H), Image.LANCZOS)
            a = np.asarray(card).astype(float)
            boxes = icons(a.astype(int))
            for t, (x0, y0, x1, y1) in zip(traits(rows[cid]), boxes):
                if t in want:
                    pad = 4
                    crop = a[y0:y1, x0 - pad:x1 + pad]
                    bg = _bg_fill(a, x0, x1, y0, y1, pad)
                    diff = np.abs(crop - bg).max(2)
                    alpha = np.clip((diff - 12) / 60, 0, 1)
                    # drop slivers of the bar's gold rims: thin bands across the top / bottom few rows
                    for yy in list(range(0, 6)) + list(range(alpha.shape[0] - 4, alpha.shape[0])):
                        if (alpha[yy] > .3).mean() > .35:
                            alpha[yy] = 0
                    alpha = alpha * _main_pieces(alpha > .15)   # keep only the icon itself
                    rgba = np.dstack([crop, alpha * 255]).astype("uint8")
                    Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, t + ".png"))
                    found[t] = n
    missing = sorted(set(PICKS) - set(found))
    print("masters cut:", len(found), "missing:", missing)


# ---- applying ------------------------------------------------------------------------------------------------------
# Icons left as drawn (already match the master, and the bar is too tight to swap cleanly).
KEEP = {("maeve@2", "Verdant")}


def fix_card(card, names, cid=None):
    """Swap each trait icon on one card for its master. Returns (image, log)."""
    k = card.height / H
    a = np.asarray(card.convert("RGB")).astype(float)
    boxes = icons(a.astype(int))
    if not boxes or len(boxes) != len(names):
        return card, ["SKIPPED: found %s icons, expected %d" % (len(boxes) if boxes else 0, len(names))]
    log = []
    for t, (x0, y0, x1, y1) in zip(names, boxes):
        p = os.path.join(OUT, t + ".png")
        if (cid, t) in KEEP:
            log.append(t + ": kept as drawn")
            continue
        if not os.path.exists(p):
            log.append(t + ": no master")
            continue
        m = Image.open(p)
        if k != 1:
            m = m.resize((max(1, round(m.width * k)), max(1, round(m.height * k))), Image.LANCZOS)
        m = np.asarray(m).astype(float)
        # a tight bar (three traits) has smaller icons: never let the master grow past the old icon's width
        vis = np.where((m[..., 3] > 80).any(0))[0]
        mw = vis.max() - vis.min() + 1 if len(vis) else m.shape[1]
        if len(names) >= 3 and mw > (x1 - x0) * 1.08:
            f = (x1 - x0) / mw
            log.append("%s: fitted to %d%%" % (t, round(f * 100)))
            mi = Image.fromarray(m.astype("uint8"), "RGBA")
            m = np.asarray(mi.resize((max(1, round(mi.width * f)), max(1, round(mi.height * f))), Image.LANCZOS)).astype(float)
        pad = int(4 * k)
        # 1) erase the old icon (and its glow) with the bar's own colour. Reach a little above the bar's inside:
        #    some drawn icons poke into the gold rim, and the rim (a straight line) rebuilds itself from either side.
        e0, e1 = y0 - int(8 * k), y1 + int(2 * k)
        a[e0:e1, x0 - pad:x1 + pad] = _bg_fill(a, x0, x1, e0, e1, pad)
        # 2) the master, centred on where the old icon was, same rows as the bar
        cx = (x0 + x1) / 2
        px = int(round(cx - m.shape[1] / 2))
        py = y0 + max(0, (y1 - y0 - m.shape[0]) // 2)
        hh, ww = min(m.shape[0], a.shape[0] - py), m.shape[1]
        al = m[:hh, :ww, 3:4] / 255
        reg = a[py:py + hh, px:px + ww]
        a[py:py + hh, px:px + ww] = reg * (1 - al) + m[:hh, :ww, :3] * al
        log.append(t + ": swapped")
    return Image.fromarray(np.clip(a, 0, 255).astype("uint8")), log


def fix_sheet(path):
    rows = _rows()
    im = Image.open(path).convert("RGB")
    out, logs = im.copy(), []
    for cid, x0, x1 in sheet_cards(path):
        if not cid or not rows[cid]["Origins"]:
            logs.append((cid, ["no trait bar"]))
            continue
        fixed, log = fix_card(im.crop((x0, 0, x1, im.height)), traits(rows[cid]), cid)
        out.paste(fixed, (x0, 0))
        logs.append((cid, log))
    return im, out, logs


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "masters":
        cut_masters()
    elif cmd in ("preview", "apply"):
        before, after, logs = fix_sheet(sys.argv[2])
        for cid, log in logs:
            print(cid, "; ".join(log))
        if cmd == "apply":
            after.save(sys.argv[3])
        else:
            T = bar(np.asarray(before.crop((0, 0, 611, before.height))).astype(int))[0]
            y0, y1 = T - 20, T + 70
            W = before.width
            pv = Image.new("RGB", (W, (y1 - y0) * 2 + 10), (255, 255, 255))
            pv.paste(before.crop((0, y0, W, y1)), (0, 0))
            pv.paste(after.crop((0, y0, W, y1)), (0, y1 - y0 + 10))
            pv.save(sys.argv[3])
