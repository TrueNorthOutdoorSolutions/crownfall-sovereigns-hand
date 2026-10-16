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


_REF = None


def _ref():
    """Sol 151 (untouched original): its bar rims, tier-word x, and the card itself."""
    global _REF
    if _REF is None:
        import os, importlib.util
        sp = importlib.util.spec_from_file_location("ps", os.path.join(os.path.dirname(__file__), "patch-sheet-letters.py"))
        ps = importlib.util.module_from_spec(sp); sp.loader.exec_module(ps)
        im = Image.open(os.path.join(ps.ORIGINALS, "Cards 151-153 Sol.png")).convert("RGB")
        c = np.asarray(im.crop(ps.card_boxes(im)[0])).astype(float)
        _REF = (c, locate(c.astype(int)))
    return _REF


def fix(card, source_card=None):
    """Copy Sol's own chevron (the exact one every Set 1 card has) onto this card's bar, lined up on this card's
    gold rims and "TIER V" word; darken the plate behind the word to Sol's tone. Trait words stay untouched."""
    im = card.convert("RGB")
    a = np.asarray(im).astype(float)
    h, w, _ = a.shape
    top, bot, lx = locate(a.astype(int))
    src, (st, sb, sl) = _ref()
    L, R = 38, 6                                   # strip: from 38 px left of the word to 6 px left of it
    strip = src[st - 2:sb + 3, sl - L:sl - R]
    hgt = bot - top + 5
    strip = np.asarray(Image.fromarray(strip.astype("uint8")).resize((L - R, hgt), Image.LANCZOS)).astype(float)
    # darken the plate right of the chevron to Sol's plate tone (letters and rims kept)
    x_end = min(w - 2, lx + int(w * 0.24))
    plate = a[top + 2:bot - 1, lx - R:x_end]
    keep = (plate.min(axis=2) > 150) | _gold(plate.astype(int))
    sol_tone = np.median(src[st + 8:sb - 6, sl - 4:sl - 1].reshape(-1, 3), axis=0)
    plate[~keep] = plate[~keep] * 0.35 + sol_tone * 0.65
    # paste the strip, feathered 3 px on the left so it meets this card's bar softly
    m = np.clip(np.arange(L - R) / 3.0, 0, 1)[None, :, None]
    reg = a[top - 2:top - 2 + hgt, lx - L:lx - R]
    a[top - 2:top - 2 + hgt, lx - L:lx - R] = reg * (1 - m) + strip * m
    return Image.fromarray(np.clip(a, 0, 255).astype("uint8"))
