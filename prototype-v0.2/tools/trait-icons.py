"""
One master image per Origin / Class icon on every card (owner request 2026-10-16).
Works per card, at the card's own layout: finds the trait bar (the dark band just above the text box), finds each icon
in it (the coloured / tall blobs left of each trait word), and swaps only those small squares for the master icon.
Nothing else on the card is touched.
"""
import csv
import os

import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(__file__)
ICONS = os.path.join(HERE, "..", "card-template", "icons")


def _beige(a):
    return (a[..., 0] > 185) & (a[..., 1] > 165) & (a[..., 2] > 120) & (a[..., 0] - a[..., 2] > 20)


def bar_rows(a):
    """(top, bottom) of the trait bar: the dark band directly above the text box's parchment."""
    h, w, _ = a.shape
    b = _beige(a)[:, int(w * 0.2):int(w * 0.8)].mean(axis=1)
    tb = next(y for y in range(int(h * 0.62), int(h * 0.85)) if b[y] > 0.6 and b[y + 3] > 0.6)
    return tb - int(h * 0.066), tb - 2   # the bar is a fixed-height band right above the text box


def icon_boxes(a):
    """Boxes (x0, y0, x1, y1) of the trait icons, left to right, in card pixels."""
    h, w, _ = a.shape
    top, bot = bar_rows(a)
    top, bot = top + 9, bot - 7          # inside the bar's gold rims
    reg = a[top:bot]
    sat = reg.max(axis=2) - reg.min(axis=2)
    lit = (reg.max(axis=2) > 120)
    colour = lit & (sat > 70)                 # icons are coloured; words are white
    whiteish = lit & (sat <= 70)
    cols = np.where((colour | whiteish).any(axis=0))[0]
    cols = cols[(cols > w * 0.04) & (cols < w * 0.78)]
    runs, st = [], None
    for c0, c1 in zip(cols, list(cols[1:]) + [None]):
        st = c0 if st is None else st
        if c1 is None or c1 - c0 > 3:
            runs.append((st, c0)); st = None
    boxes = []
    for x0, x1 in runs:
        m = colour[:, x0:x1 + 1] | whiteish[:, x0:x1 + 1]
        ys = np.where(m.any(axis=1))[0]
        hgt = ys.max() - ys.min() + 1
        wid = x1 - x0 + 1
        col_frac = colour[:, x0:x1 + 1].sum() / max(1, m.sum())
        # an icon: roughly square and taller than the text, or clearly coloured
        if wid >= h * 0.018 and wid <= h * 0.06 and (hgt >= (bot - top) * 0.5 or col_frac > 0.5) and hgt >= (bot - top) * 0.35:
            boxes.append((x0, top + ys.min(), x1 + 1, top + ys.max() + 1))
    return boxes, (top, bot)


def traits(set_no=1):
    """{card number: [trait names in bar order]} from the master card list."""
    out = {}
    for r in csv.DictReader(open(os.path.join(HERE, "..", f"master-card-list-set{set_no}.csv"), encoding="utf-8-sig")):
        if not r["Origins"]:
            continue
        names = [t.strip() for part in (r["Origins"], r["Classes"]) for t in part.replace("\u00b7", "|").split("|") if t.strip()]
        out[int(r["No."][3:])] = names
    return out


def find(a, n):
    """The n trait icons on this card (left cap and tier chevron excluded), or None if detection is unsure."""
    h, w, _ = a.shape
    boxes, _ = icon_boxes(a)
    boxes = [b for b in boxes if b[0] > w * 0.06]
    return boxes[:n] if len(boxes) >= n else None


def _bar_bg(a, box):
    """The plain bar colour around an icon, row by row (median of the dark pixels just left and right of it)."""
    x0, y0, x1, y1 = box
    side = np.concatenate([a[y0:y1, max(0, x0 - 10):x0 - 2], a[y0:y1, x1 + 2:x1 + 10]], axis=1)
    dark = side.max(axis=2) < 90
    rows = []
    for r in range(side.shape[0]):
        px = side[r][dark[r]]
        rows.append(np.median(px, axis=0) if len(px) else np.array([22, 22, 26]))
    return np.array(rows)


def replace(card, n_traits, names, masters):
    """Swap each detected icon for its master (same size on every card, centred on the old icon)."""
    im = card.convert("RGB")
    a = np.asarray(im).astype(float)
    h, w, _ = a.shape
    boxes = find(a.astype(int), n_traits)
    if boxes is None:
        return im, False
    for (x0, y0, x1, y1), name in zip(boxes, names):
        if name not in masters:
            continue
        m_img, m_alpha = masters[name]
        s = h / m_img.shape[0] if False else h / 840.0          # masters are cut at card height 840
        mi = np.asarray(Image.fromarray(m_img.astype("uint8")).resize((max(1, round(m_img.shape[1] * s)), max(1, round(m_img.shape[0] * s))), Image.LANCZOS)).astype(float)
        ma = np.asarray(Image.fromarray((m_alpha * 255).astype("uint8")).resize((mi.shape[1], mi.shape[0]), Image.LANCZOS)).astype(float) / 255
        # 1) erase the old icon with the bar's own colour
        g = 2
        bx = (max(0, x0 - g), max(0, y0 - g), min(w, x1 + g), min(h, y1 + g))
        bg = _bar_bg(a, bx)
        a[bx[1]:bx[3], bx[0]:bx[2]] = bg[:, None, :]
        # 2) the master, centred on the old icon
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        px, py = int(round(cx - mi.shape[1] / 2)), int(round(cy - mi.shape[0] / 2))
        reg = a[py:py + mi.shape[0], px:px + mi.shape[1]]
        al = ma[:reg.shape[0], :reg.shape[1], None]
        a[py:py + mi.shape[0], px:px + mi.shape[1]] = reg * (1 - al) + mi[:reg.shape[0], :reg.shape[1]] * al
    return Image.fromarray(np.clip(a, 0, 255).astype("uint8")), True


def cut_master(card, index, n_traits):
    """(image, alpha) of one icon on a reference card, at card height 840, with 3 px of margin."""
    im = card.convert("RGB").resize((round(card.width * 840 / card.height), 840), Image.LANCZOS)
    a = np.asarray(im).astype(int)
    boxes = find(a, n_traits)
    x0, y0, x1, y1 = boxes[index]
    x0, y0, x1, y1 = x0 - 3, y0 - 3, x1 + 3, y1 + 3
    img = a[y0:y1, x0:x1].astype(float)
    alpha = (img.max(axis=2) > 70).astype(float)
    alpha = np.asarray(Image.fromarray((alpha * 255).astype("uint8")).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.8))).astype(float) / 255
    return img, alpha


_MASTERS = None


def masters():
    """{trait: (image at card height 840, alpha)} from card-template/icons/<Trait>.png."""
    global _MASTERS
    if _MASTERS is None:
        _MASTERS = {}
        for f in os.listdir(ICONS):
            img = np.asarray(Image.open(os.path.join(ICONS, f)).convert("RGB")).astype(float)
            al = (img.max(axis=2) > 70).astype(float)
            al = np.asarray(Image.fromarray((al * 255).astype("uint8")).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.8))).astype(float) / 255
            _MASTERS[f[:-4]] = (img, al)
    return _MASTERS


def _sig(a):
    return np.asarray(Image.fromarray(a.astype("uint8")).resize((32, 32), Image.LANCZOS)).astype(float).ravel()


def unify_icons(card, names, max_dist=50.0):
    """Swap every icon on this card's trait bar that clearly matches one of its traits for that trait's master.
    Returns (image, [(trait, distance, swapped)])."""
    im = card.convert("RGB")
    a = np.asarray(im).astype(float)
    h, w, _ = a.shape
    boxes, _ = icon_boxes(a.astype(int))
    boxes = [b for b in boxes if b[0] > w * 0.03]   # the bar's left cap / chevron never match a trait closely
    M = masters()
    sc = h / 840.0
    log, used = [], set()
    for (x0, y0, x1, y1) in boxes:
        crop = a[max(0, y0 - 3):y1 + 3, max(0, x0 - 3):x1 + 3]
        best = min(((np.abs(_sig(crop) - _sig(M[t][0])).mean(), t) for t in names if t in M and t not in used), default=None)
        if best is None or best[0] > max_dist:
            log.append((best[1] if best else None, round(best[0], 1) if best else None, False))
            continue
        d, t = best
        used.add(t)
        mi, ma = M[t]
        mi = np.asarray(Image.fromarray(mi.astype("uint8")).resize((max(1, round(mi.shape[1] * sc)), max(1, round(mi.shape[0] * sc))), Image.LANCZOS)).astype(float)
        ma = np.asarray(Image.fromarray((ma * 255).astype("uint8")).resize((mi.shape[1], mi.shape[0]), Image.LANCZOS)).astype(float) / 255
        bx = (max(0, x0 - 2), max(0, y0 - 2), min(w, x1 + 2), min(h, y1 + 2))
        a[bx[1]:bx[3], bx[0]:bx[2]] = _bar_bg(a, bx)[:, None, :]
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        px, py = int(round(cx - mi.shape[1] / 2)), int(round(cy - mi.shape[0] / 2))
        reg = a[py:py + mi.shape[0], px:px + mi.shape[1]]
        al = ma[:reg.shape[0], :reg.shape[1], None]
        a[py:py + reg.shape[0], px:px + reg.shape[1]] = reg * (1 - al) + mi[:reg.shape[0], :reg.shape[1]] * al
        log.append((t, round(d, 1), True))
    return Image.fromarray(np.clip(a, 0, 255).astype("uint8")), log
