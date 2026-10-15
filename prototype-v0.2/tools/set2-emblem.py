"""
Set 2 bottom-centre emblem (owner request 2026-10-15): the bronze keyhole gateway, the studio mountain logo and the
"Northern Summit Studios" footer name drift between AI-made sheets. stamp_emblem() replaces that block on any Set 2
card with ONE reference block cut from the first approved Set 2 card (S2-001 Bramble), aligned on the teal keyhole.
The parchment and flavour text above the arch are kept: reference parchment pixels are left out of the stamp.
"""
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SET2 = r"C:\Users\micha\Desktop\Crownfall Art\10 Sovereign's Hand\Set 2 - Beneath the Arena"
ORIGINALS = os.path.join(SET2, "Old", "Card Sheets (original)")
REF_SHEET = "Cards 001-003 Bramble and Kira Volt.png"
BOX = (0.29, 0.835, 0.71, 0.985)   # block on a card, as fractions of width / height
_REF = None


def keyhole(a, w, h):
    """Centre of the teal keyhole in the bottom-centre of a card array, or None."""
    x0, x1, y0 = int(w * 0.38), int(w * 0.62), int(h * 0.82)
    r, g, b = a[y0:, x0:x1, 0], a[y0:, x0:x1, 1], a[y0:, x0:x1, 2]
    m = (g > 150) & (b > 150) & (r < 130)
    ys, xs = np.where(m)
    if len(xs) < 15:
        return None
    return (xs.min() + xs.max()) / 2 + x0, (ys.min() + ys.max()) / 2 + y0


def footer_row(a, w, h):
    """Vertical centre of the studio name on the footer line (centroid of its light pixels), or None."""
    y0 = int(h * 0.93)
    band = a[y0:h, int(w * 0.30):int(w * 0.70)].min(axis=2) > 175
    ys = np.where(band)[0]
    if len(ys) < 20:
        return None
    return ys.mean() + y0


def credit_left(a, w, h, fy):
    """Left edge of the artist credit ("Art: ..."), found by walking left from the card's right side over word gaps."""
    y0, y1 = max(0, int(fy - h * 0.02)), min(h, int(fy + h * 0.024))
    lit = (a[y0:y1].min(axis=2) > 175).any(axis=0)
    xs = np.where(lit[int(w * 0.55):int(w * 0.95)])[0] + int(w * 0.55)
    if len(xs) == 0:
        return int(w * 0.73)
    left = xs.max()
    for x in xs[::-1]:
        if left - x > w * 0.025:  # a gap wider than a space: the studio name is on the other side
            break
        left = x
    return int(left)


def _cards(im):
    a = np.asarray(im).astype(int)
    h = im.height
    lit = a[int(h * .12):int(h * .88)].max(axis=2).max(axis=0) >= 24
    runs, start = [], None
    for x, v in enumerate(lit):
        if v and start is None:
            start = x
        if not v and start is not None:
            runs.append((start, x)); start = None
    if start is not None:
        runs.append((start, len(lit)))
    out = []
    for x0, x1 in (r for r in runs if r[1] - r[0] > im.width * 0.2):
        rows = np.where(a[:, x0:x1].max(axis=2).max(axis=1) >= 24)[0]
        out.append((x0, rows[0], x1, rows[-1] + 1))
    return out


def reference():
    """(RGBA block, its keyhole centre inside the block, card width it was cut at)."""
    global _REF
    if _REF is None:
        src = os.path.join(ORIGINALS, REF_SHEET)
        if not os.path.exists(src):
            src = os.path.join(SET2, "Card Sheets", REF_SHEET)
        im = Image.open(src).convert("RGB")
        card = im.crop(_cards(im)[0])
        w, h = card.size
        a = np.asarray(card).astype(int)
        kx, ky = keyhole(a, w, h)
        bx = (int(w * BOX[0]), int(h * BOX[1]), int(w * BOX[2]), min(h, int(h * BOX[3])))
        blk = a[bx[1]:bx[3], bx[0]:bx[2]]
        # leave the parchment out (light beige), keep arch, steps, dark band, mountain and studio name
        parch = (blk[..., 0] > 195) & (blk[..., 1] > 175) & (blk[..., 2] > 130) & (blk[..., 0] - blk[..., 2] > 25)
        mask = Image.new("L", (blk.shape[1], blk.shape[0]), 255)
        edge = Image.new("L", mask.size, 0)
        ImageDraw.Draw(edge).rounded_rectangle((10, 6, mask.width - 11, mask.height - 1), radius=14, fill=255)
        edge = edge.filter(ImageFilter.GaussianBlur(5))
        mask = Image.fromarray(np.minimum(np.asarray(mask), np.asarray(edge)))
        rgba = Image.fromarray(blk.astype("uint8")).convert("RGBA")
        rgba.putalpha(mask)
        fy = footer_row(a, w, h)
        _REF = (rgba, (kx - bx[0], fy - bx[1]), w)
    return _REF


def _beige(x):
    return (x[..., 0] > 195) & (x[..., 1] > 175) & (x[..., 2] > 130) & (x[..., 0] - x[..., 2] > 25)


def stamp_emblem(card):
    """Card with the reference gateway + mountain + studio name. Flavour text lines on the parchment are kept."""
    im = card.convert("RGB").copy()
    w, h = im.size
    arr = np.asarray(im).astype(int)
    k = keyhole(arr, w, h) or (w * 0.5, h * 0.89)
    fy = footer_row(arr, w, h)
    fy = fy if fy is not None else h * 0.955
    ref, (rkx, rfy), rw = reference()
    s = w / rw
    blk = ref.resize((round(ref.width * s), round(ref.height * s)), Image.LANCZOS)
    x = round(k[0] - rkx * s)
    # the studio name sits on the card's own footer line, level with the card number and artist credit
    y = round((fy if fy is not None else h * 0.955) - rfy * s)
    x0, y0 = max(0, x), max(0, y)
    H, W = min(blk.height - (y0 - y), h - y0), min(blk.width - (x0 - x), w - x0)
    tgt = arr[y0:y0 + H, x0:x0 + W]
    rb = np.asarray(blk.convert("RGB")).astype(int)[y0 - y:y0 - y + H, x0 - x:x0 - x + W]
    tb, rbg = _beige(tgt), _beige(rb)
    arch_cols = np.where((~rbg[: int(H * 0.55)]).any(axis=0))[0]
    cx0, cx1 = (arch_cols.min(), arch_cols.max()) if len(arch_cols) else (W // 2 - 20, W // 2 + 20)
    arch_top = y0 + int(np.argmax((~rbg[:, cx0:cx1 + 1]).any(axis=1)))  # first row of the reference arch (card coords)
    # lowest flavour-text row: dark ink on parchment across the card, ignoring the gateway columns
    full_b = _beige(arr)
    near_full = np.asarray(Image.fromarray((full_b * 255).astype("uint8")).filter(ImageFilter.MaxFilter(5))) > 0
    ink_full = near_full & ~full_b & (arr.mean(axis=2) < 140)
    gx0, gx1 = x0 + cx0 - 10, x0 + cx1 + 10
    side = np.concatenate([ink_full[:, int(w * 0.18):max(int(w * 0.18), gx0)], ink_full[:, min(gx1, int(w * 0.82)):int(w * 0.82)]], axis=1)
    rows = np.where(side[int(h * 0.75):int(h * 0.92)].sum(axis=1) >= 3)[0] + int(h * 0.75)
    text_bottom = rows.max() if len(rows) else -1
    a_full = np.asarray(blk.split()[-1]).copy()
    if text_bottom >= arch_top - 2:
        # the flavour runs down past the top of the reference arch: keep the card's own gateway, swap the rest
        cut = round(h * 0.905) - y
        a_full[:max(0, cut)] = 0
    else:
        # parchment is only painted where it covers leftovers of the card's old gateway (no tone boxes elsewhere)
        keep = ~rbg | ~tb
        keep = np.asarray(Image.fromarray((keep * 255).astype("uint8")).filter(ImageFilter.MaxFilter(5))) > 0
        sub = a_full[y0 - y:y0 - y + H, x0 - x:x0 - x + W]
        sub[~keep] = 0
    a_full = np.asarray(Image.fromarray(a_full.astype("uint8")).filter(ImageFilter.GaussianBlur(1.2))).copy()
    cl = credit_left(arr, w, h, fy)
    fade = np.clip((cl - 3 - (np.arange(a_full.shape[1]) + x)) / 6.0, 0, 1)  # never paint over the artist credit
    rows_f = slice(max(0, int(fy - h * 0.03) - y), a_full.shape[0])
    a_full[rows_f] = (a_full[rows_f] * fade[None, :]).astype(a_full.dtype)
    blk = blk.copy()
    blk.putalpha(Image.fromarray(a_full.astype("uint8")))
    im.paste(blk, (x, y), blk)
    # leftovers of the card's old, wider studio name just outside the new one (e.g. a stray "s"): paint them out
    # with the footer's own dark colour, between the new name and the artist credit
    out = np.asarray(im).astype(float)
    rgb = np.asarray(blk.convert("RGB")).astype(int)
    ra = np.asarray(blk.split()[-1]) > 200
    fy0, fy1 = max(0, int(fy - h * 0.02)), min(h, int(fy + h * 0.024))
    lit = (rgb.max(axis=2) > 150) & ra
    band = lit[fy0 - y:fy1 - y]
    tcols = np.where(band.any(axis=0))[0] + x if band.size else np.array([])
    if len(tcols):
        for lo, hi in ((int(w * 0.25), tcols.min() - 4), (tcols.max() + 5, cl - 3)):
            if hi <= lo:
                continue
            reg = out[fy0:fy1, lo:hi]
            lum = reg.max(axis=2)
            dark = reg[lum < 70]
            if (lum > 150).any() and len(dark):
                m = np.asarray(Image.fromarray(((lum > 70) * 255).astype("uint8")).filter(ImageFilter.MaxFilter(3))) > 0
                reg[m] = np.median(dark, axis=0)
                out[fy0:fy1, lo:hi] = reg
        im = Image.fromarray(out.astype("uint8"))
    return im


def main():
    """Stamp every Set 2 sheet from its untouched original (copied once to Old/Card Sheets (original)),
    then refresh the repo previews in prototype-v0.2/card-art/set2. Safe to run again after new sheets arrive."""
    import re
    import shutil
    import sys
    check = "--check" in sys.argv
    sheets = os.path.join(SET2, "Card Sheets")
    repo = os.path.join(os.path.dirname(__file__), "..", "card-art", "set2")
    os.makedirs(ORIGINALS, exist_ok=True)
    done = 0
    for name in sorted(os.listdir(sheets)):
        if not (name.startswith("Cards ") and name.lower().endswith(".png")):
            continue
        orig = os.path.join(ORIGINALS, name)
        if not os.path.exists(orig):
            shutil.copy2(os.path.join(sheets, name), orig)
        im = Image.open(orig).convert("RGB")
        for b in _cards(im):
            im.paste(stamp_emblem(im.crop(b)), b[:2])
        if check:
            print("would stamp", name); continue
        dest = os.path.join(sheets, name)
        tmp = dest + ".tmp.png"
        im.save(tmp)
        try:
            os.replace(tmp, dest)
        except OSError as e:  # open in an image viewer
            os.remove(tmp)
            print(f"COULD NOT SAVE {name}: {e} (close it and run again)"); continue
        key = "-".join(re.findall(r"\d{3}|xxx", name.split(" ", 2)[1])).lower()
        for j in os.listdir(repo):
            if j.startswith(f"cards-{key}-") and j.endswith(".jpg"):
                p = os.path.join(repo, j)
                im.resize(Image.open(p).size, Image.LANCZOS).save(p, "JPEG", quality=88)
        done += 1
    print(f"{done} Set 2 sheets stamped; originals kept in {ORIGINALS}")


if __name__ == "__main__":
    main()
