"""
Give the Tier V cards printed without the gold chevron before "TIER V" (Aurex 142-144, Veyra Sol 157-159) the exact
right end of Sol's trait bar (card 151): chevron + "TIER V" + end cap, aligned on each card's own "TIER V" word.
Owner request 2026-10-16. Only that small end of the bar changes.
"""
import numpy as np
from PIL import Image

FIX = {142, 143, 144, 157, 158, 159}
SOURCE = 151


def _ti():
    import importlib.util, os
    sp = importlib.util.spec_from_file_location("ti", os.path.join(os.path.dirname(__file__), "trait-icons.py"))
    ti = importlib.util.module_from_spec(sp); sp.loader.exec_module(ti)
    return ti


def _gold(px):
    return (px[..., 0] > 150) & (px[..., 1] > 105) & (px[..., 2] < 110) & (px[..., 0] - px[..., 2] > 70)


def locate(a):
    """(top rim, bottom rim, left x of "TIER V"): the bar is a pair of thin gold rims ~45-55 px apart with the
    parchment text box starting right under the bottom one (read in a column under the tier plate)."""
    h, w, _ = a.shape
    br = a[:, int(w * 0.86):int(w * 0.90)].mean(axis=1).max(axis=1) > 140
    ys = [y for y in range(int(h * 0.45), int(h * 0.75)) if br[y]]
    cl, st = [], ys[0]
    for y0, y1 in zip(ys, ys[1:] + [None]):
        if y1 is None or y1 - y0 > 1:
            cl.append((st, y0)); st = y1
    for i in range(2, len(cl)):
        par, bot, top = cl[i], cl[i - 1], cl[i - 2]
        if par[1] - par[0] >= 10 and bot[1] - bot[0] <= 4 and 2 <= par[0] - bot[1] <= 8 and 38 <= bot[0] - top[1] <= 60:
            break
    else:
        raise ValueError("trait bar not found")
    t, b = top[1], bot[0]
    reg = a[t + 4:b - 3, int(w * 0.6):int(w * 0.97)]
    white = ((reg.min(axis=2) > 175) & ((reg.max(axis=2) - reg.min(axis=2)) < 50)).sum(axis=0) >= 3  # ignore 1-px specks
    xs = np.where(white)[0]
    left = xs.max()
    for x in xs[::-1]:
        if left - x > 20:
            break
        left = x
    return t, b, left + int(w * 0.6)


def fix(card, source_card=None):
    """Turn the plain "|" before "TIER V" into the gold chevron every other card has, and darken the plate behind the
    word like Sol's. Only the separator and the plate change; trait words and the tier word stay untouched."""
    from PIL import ImageDraw
    im = card.convert("RGB")
    a = np.asarray(im).astype(float)
    h, w, _ = a.shape
    top, bot, lx = locate(a.astype(int))
    mid = (top + bot) / 2
    # the "|" separator: the most gold column between the last trait word and the tier word
    zone = a[top + 6:bot - 5, lx - 60:lx - 4].astype(int)
    gcol = _gold(zone).sum(axis=0)
    sx = int(np.argmax(gcol)) + lx - 60
    gold_px = a[top - 1:top + 2, lx:lx + 60].reshape(-1, 3).astype(int)
    gm = _gold(gold_px[None])[0]
    gold = tuple(int(v) for v in np.median(gold_px[gm], axis=0)) if gm.any() else (214, 168, 74)
    # 1) remove the "|" (gold pixels only, within 3 px of it)
    reg = a[top + 3:bot - 2, sx - 3:sx + 4]
    g = _gold(reg.astype(int)) | (reg.max(axis=2) > 120) & ((reg.max(axis=2) - reg.min(axis=2)) > 40)
    bg = np.median(a[top + 6:bot - 5, sx - 12:sx - 6].reshape(-1, 3), axis=0)
    reg[g] = bg
    # 2) darken the plate from the chevron to the bar's end, keeping white letters and gold rims
    x_end = min(w - 2, lx + int(w * 0.24))
    for y in range(top + 2, bot - 1):           # follow the chevron's slant so the dark plate starts right at it
        xs = int(round(sx - 4 + 14 * (1 - abs(y - mid) / ((bot - top) / 2))))
        row = a[y, xs:x_end]
        keep = (row.min(axis=1) > 150) | _gold(row.astype(int)[None])[0]
        row[~keep] *= 0.55
    # 3) the chevron: arms start at the separator, tip 14 px to the right (as on Sol)
    S = 4
    x0, y0 = sx - 12, top - 2
    W_, H_ = 36, bot - top + 5
    big = Image.new("RGBA", (W_ * S, H_ * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)
    pts = [((sx - 4 - x0) * S, (top + 1 - y0) * S), ((sx + 10 - x0) * S, (mid - y0) * S), ((sx - 4 - x0) * S, (bot - 1 - y0) * S)]
    d.line(pts, fill=(20, 14, 6, 220), width=7 * S // 2, joint="curve")
    d.line(pts, fill=gold + (255,), width=3 * S // 2, joint="curve")
    small = big.resize((W_, H_), Image.LANCZOS)
    out = Image.fromarray(np.clip(a, 0, 255).astype("uint8"))
    out.paste(small, (x0, y0), small)
    return out
