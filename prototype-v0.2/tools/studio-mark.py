"""
Studio mountain mark (owner request 2026-10-13): the small white mountain logo under the bottom-centre crest drifted
slightly from sheet to sheet. stamp_mark() replaces it on any card with ONE reference mark, cut from the first
approved sheet (Set 1 Cards 001-003 Bramble, card 001), so every card carries the identical logo.
"""
import os

import numpy as np
from PIL import Image, ImageFilter

REF_SHEET = os.path.join(r"C:\Users\micha\Desktop\Crownfall Art\10 Sovereign's Hand\Set 1 - The Shattered Crown",
                         "Old", "Card Sheets (original print letters)", "Cards 001-003 Bramble.png")
_REF = None


def _mark_box(a, w, h):
    """Bounding box of the white mountain strokes in a card array (or None)."""
    x0, x1, y0, y1 = int(w * 0.43), int(w * 0.57), int(h * 0.928), int(h * 0.955)
    m = a[y0:y1, x0:x1].min(axis=2) > 140
    # The window can reach the top of the footer text below the mark (Edict layout): keep only the topmost band of
    # lit rows, i.e. the mark, which ends at its solid base line followed by an empty row.
    lit = np.where(m.sum(axis=1) > 0)[0]
    if len(lit) == 0:
        return None
    gaps = np.where(np.diff(lit) > 1)[0]
    band = lit[:gaps[0] + 1] if len(gaps) else lit
    m = m[band.min():band.max() + 1]
    ys, xs = np.where(m)
    if len(xs) < 20:
        return None
    return xs.min() + x0, xs.max() + x0, ys.min() + y0 + band.min(), ys.max() + y0 + band.min()


def reference():
    """(RGBA mark, card width it was cut at)."""
    global _REF
    if _REF is None:
        im = Image.open(REF_SHEET).convert("RGB")
        a = np.asarray(im).astype(int)
        # card 001 is the left card: its columns are the first non-dark run
        cols = np.where(a[int(im.height * .12):int(im.height * .88)].max(axis=2).max(axis=0) >= 24)[0]
        gap = np.where(np.diff(cols) > 1)[0]
        cx0, cx1 = cols[0], cols[gap[0]] if len(gap) else cols[-1]
        rows = np.where(a[:, cx0:cx1].max(axis=2).max(axis=1) >= 24)[0]
        card = im.crop((cx0, rows[0], cx1 + 1, rows[-1] + 1))
        ca = np.asarray(card).astype(int)
        bx = _mark_box(ca, *card.size)
        p = 3
        crop = ca[bx[2] - p:bx[3] + p + 1, bx[0] - p:bx[1] + p + 1]
        lum = crop.min(axis=2).astype(float)
        alpha = np.clip((lum - 55) * 255 / 120, 0, 255).astype("uint8")
        rgba = np.dstack([np.full(lum.shape, 240, "uint8")] * 3 + [alpha])
        _REF = (Image.fromarray(rgba, "RGBA"), card.size[0])
    return _REF


def stamp_mark(card):
    """Return a copy of a card image with its mountain mark replaced by the reference mark (unchanged if none found)."""
    im = card.convert("RGB").copy()
    w, h = im.size
    a = np.asarray(im).astype(int)
    bx = _mark_box(a, w, h)
    if bx is None:
        return im
    x0, x1, y0, y1 = bx
    pad = max(2, round(3 * w / 600))
    box = (x0 - pad, y0 - pad, x1 + pad + 1, y1 + 2)
    reg = a[box[1]:box[3], box[0]:box[2]].astype(float)
    lum = reg.max(axis=2)
    dark = reg[lum < 90]
    fill = np.median(dark, axis=0) if len(dark) else np.array([16.0, 22.0, 26.0])
    reg[lum >= 60] = fill
    im.paste(Image.fromarray(reg.astype("uint8")).filter(ImageFilter.GaussianBlur(max(1, 1.2 * w / 600))), box[:2])
    ref, ref_w = reference()
    s = w / ref_w
    mark = ref.resize((max(1, round(ref.width * s)), max(1, round(ref.height * s))), Image.LANCZOS)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    im.paste(mark, (round(cx - mark.width / 2), round(cy - mark.height / 2)), mark)
    return im
