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
DEBUG = False
BOX = (0.29, 0.835, 0.71, 0.985)   # block on a card, as fractions of width / height
_REF = None


def keyhole(a, w, h):
    """Centre of the teal keyhole in the bottom-centre of a card array, or None."""
    x0, x1, y0, y1 = int(w * 0.38), int(w * 0.62), int(h * 0.80), int(h * 0.93)  # above the teal frame line at the bottom
    r, g, b = a[y0:y1, x0:x1, 0], a[y0:y1, x0:x1, 1], a[y0:y1, x0:x1, 2]
    m = (g > 150) & (b > 150) & (r < 130)
    ys, xs = np.where(m)
    if len(xs) < 15:
        return None
    col = m.sum(axis=0)
    pk = int(np.argmax(col))
    lo = pk
    while lo > 0 and col[lo - 1] >= col[pk] * 0.15:
        lo -= 1
    hi = pk
    while hi < len(col) - 1 and col[hi + 1] >= col[pk] * 0.15:
        hi += 1
    sel = (xs >= lo) & (xs <= hi)  # the keyhole itself, not stray teal glints elsewhere on the band
    return (lo + hi) / 2 + x0, (ys[sel].min() + ys[sel].max()) / 2 + y0


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



def _lift_text(arr, w, h, text_bottom, lift):
    """A flavour line that runs down into the gateway: move the whole text box content up by `lift` px into the
    spare parchment above it (owner rule: the emblem never changes, and the card text must stay whole)."""
    beige = _beige(arr)
    mid = slice(int(w * 0.2), int(w * 0.8))
    # the box's top edge: walk up a parchment-only strip just inside its left edge (text starts further right)
    strip = beige[:, int(w * 0.08):int(w * 0.10)].mean(axis=1)
    r = int(h * 0.78)
    while r > h * 0.45 and strip[r - 1] > 0.6:
        r -= 1
    box_top = r + 1  # first parchment row of the text box
    ink = (arr[:, int(w * 0.12):int(w * 0.88)].mean(axis=2) < 140).sum(axis=1) >= 3
    box_top += 3  # skip the box's own shaded rim
    content = [y for y in range(box_top, text_bottom + 1) if ink[y]]
    if not content:
        return None
    # text lines = runs of ink rows; take the room from the gaps between them (each gap keeps at least 4 px)
    segs, start = [], content[0]
    for y0_, y1_ in zip(content, content[1:] + [None]):
        if y1_ is None or y1_ - y0_ > 2:
            segs.append((start, y0_ + 1))
            start = y1_
    gaps = [(segs[i][1], segs[i + 1][0]) for i in range(len(segs) - 1)]
    room = [max(0, g1 - g0 - 3) for g0, g1 in gaps] + [0]
    room[-1] = max(0, segs[0][0] - box_top - 2)  # and a little from the top margin
    if DEBUG:
        print("lift", lift, "segments", len(segs), "room", sum(room))
    if sum(room) < lift:
        return None
    # rows to drop: spread over the gaps (middle rows of each gap) and the top margin, `lift` in total
    take = [r_ * lift / sum(room) for r_ in room]
    counts, acc = [], 0.0
    for t in take:
        acc += t
        counts.append(round(acc) - sum(counts))
    drop = set()
    for (g0, g1), n in zip(gaps, counts[:-1]):
        mid_ = (g0 + g1) // 2
        drop.update(range(mid_ - n // 2, mid_ - n // 2 + n))
    drop.update(range(box_top + 1, box_top + 1 + counts[-1]))
    # every destination row from the box top down takes the next kept source row (parchment and all), so lines move
    # up together with their own paper; past the text the rows just below follow on. Shield pixels never move.
    # the Might / Guard shields (saturated red / blue / gold plus their dark rims) are fenced off and never move
    R, G, B = arr[..., 0], arr[..., 1], arr[..., 2]
    sat = ((R > 140) & (G < 90) & (B < 90)) | ((B > 150) & (R < 90) & (G < 150))  # red Might / blue Guard shield bodies
    sat[:int(h * 0.785)] = False  # shields start at ~0.80 h; the gold stars in rules text sit higher
    sat[:, int(w * 0.30):int(w * 0.70)] = False
    sat[:, :int(w * 0.08)] = False; sat[:, int(w * 0.92):] = False  # the frame has red gems of its own
    # the Might / Guard shields: rows from their top down only move between the shields' inner edges
    near_sh = np.asarray(Image.fromarray((sat * 255).astype("uint8")).filter(ImageFilter.MaxFilter(25))) > 0  # bodies + rims + outline
    sh_rows = np.where(sat.sum(axis=1) >= 5)[0]  # ignore stray red / blue flecks
    sh_top = sh_rows.min() - 12 if len(sh_rows) else h  # the gold rim sits above the coloured body
    lc = np.where(sat[:, :w // 2].sum(axis=0) >= 4)[0]
    rc = np.where(sat[:, w // 2:].sum(axis=0) >= 4)[0]
    L = (lc.max() + 14) if len(lc) else int(w * 0.09)
    R = (w // 2 + rc.min() - 14) if len(rc) else int(w * 0.91)
    chroma = arr.max(axis=2) - arr.min(axis=2)
    lettering = ~beige & ~near_sh & (arr.mean(axis=2) < 205)  # letter strokes and the divider, not shields or shading
    body9 = np.asarray(Image.fromarray((sat * 255).astype("uint8")).filter(ImageFilter.MaxFilter(9))) > 0
    gold = (R > 160) & (B < 90)
    divider = ~beige & ~body9 & ~gold & (arr.mean(axis=2) > 90) & (arr.mean(axis=2) < 215) & (chroma < 90)  # the thin flavour divider
    src_rows = [y for y in range(box_top + 1, text_bottom + lift + 8) if y not in drop]
    out = arr.copy()
    for d, sy in zip(range(box_top + 1, text_bottom + 8), src_rows):
        if sy < sh_top:  # clear of the shields: the whole width of the box moves
            out[d, int(w * 0.09):int(w * 0.91)] = arr[sy, int(w * 0.09):int(w * 0.91)]
            continue
        if d < sh_top:  # above the shields, but the row below reaches them: take what is not shield, paper the rest
            X = slice(int(w * 0.09), int(w * 0.91))
            take_ = ~near_sh[sy, X]
            out[d, X][take_] = arr[sy, X][take_]
            px = arr[max(0, d - 3):d + 4, X][beige[max(0, d - 3):d + 4, X]]
            if len(px):
                paper = np.median(px, axis=0)
                m_ = ~take_ & (np.abs(arr[d, X] - paper).max(axis=1) > 18)  # letter strokes and their pale halo
                out[d, X][m_] = paper
            continue
        out[d, L:R] = arr[sy, L:R]
        for x0_, x1_ in ((int(w * 0.09), L), (R, int(w * 0.91))):  # beside the shields: old strokes become paper
            m_ = lettering[d, x0_:x1_] | divider[d, x0_:x1_]
            if m_.any():
                px = arr[max(0, d - 3):d + 4, x0_:x1_][beige[max(0, d - 3):d + 4, x0_:x1_]]
                if len(px):
                    out[d, x0_:x1_][m_] = np.median(px, axis=0)
    return Image.fromarray(out.astype("uint8"))

def stamp_emblem(card, _lifted=False):
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
    # same spot on every card: the reference keyhole's position on card 001, whatever this card's old gateway did
    x = round(w * (rkx + int(rw * BOX[0])) / rw - rkx * s)
    # the studio name sits on the card's own footer line, level with the card number and artist credit
    y = round((fy if fy is not None else h * 0.955) - rfy * s)
    x0, y0 = max(0, x), max(0, y)
    H, W = min(blk.height - (y0 - y), h - y0), min(blk.width - (x0 - x), w - x0)
    tgt = arr[y0:y0 + H, x0:x0 + W]
    rb = np.asarray(blk.convert("RGB")).astype(int)[y0 - y:y0 - y + H, x0 - x:x0 - x + W]
    tb, rbg = _beige(tgt), _beige(rb)
    ref_np = ~rbg & (np.asarray(blk.split()[-1])[y0 - y:y0 - y + H, x0 - x:x0 - x + W] > 128)
    span = ref_np.mean(axis=1)
    top_rows = np.where(span > 0.02)[0]
    band_row = top_rows[np.argmax(span[top_rows] > 0.6)] if len(top_rows) and (span[top_rows] > 0.6).any() else int(H * 0.55)
    arch_cols = np.where(ref_np[:max(1, band_row - 3)].any(axis=0))[0]  # the gateway alone, above the wide dark band
    cx0, cx1 = (arch_cols.min(), arch_cols.max()) if len(arch_cols) else (W // 2 - 20, W // 2 + 20)
    arch_top = y0 + int(np.argmax((~rbg[:, cx0:cx1 + 1]).any(axis=1)))  # first row of the reference arch (card coords)
    # lowest flavour-text row: dark ink on parchment across the card, ignoring the gateway columns
    full_b = _beige(arr)
    near_full = np.asarray(Image.fromarray((full_b * 255).astype("uint8")).filter(ImageFilter.MaxFilter(5))) > 0
    ink_full = near_full & ~full_b & (arr.mean(axis=2) < 140)
    gx0, gx1 = x0 + cx0 - 10, x0 + cx1 + 10
    gx0, gx1 = gx0 - int(w * 0.05), gx1 + int(w * 0.05)  # also clear of a wider or off-centre old gateway
    left = ink_full[:, int(w * 0.24):max(int(w * 0.24), gx0)].sum(axis=1)  # inside the Might / Guard shields
    right = ink_full[:, min(gx1, int(w * 0.76)):int(w * 0.76)].sum(axis=1)
    # centred flavour text has ink on both sides of the gateway; an old arch leftover only on one
    sides = np.concatenate([full_b[:, int(w * 0.24):max(int(w * 0.24), gx0)], full_b[:, min(gx1, int(w * 0.76)):int(w * 0.76)]], axis=1)
    paper_row = sides.mean(axis=1) > 0.6  # a text line sits on parchment, unlike the edge of the dark band
    rows = np.where(((left >= 2) & (right >= 2) & paper_row)[int(h * 0.75):int(h * 0.92)])[0] + int(h * 0.75)
    text_bottom = rows.max() if len(rows) else -1
    if text_bottom >= arch_top - 3 and not _lifted:
        lifted = _lift_text(arr, w, h, text_bottom, text_bottom - arch_top + 3)
        if lifted is not None:
            return stamp_emblem(lifted, _lifted=True)
    a_full = np.asarray(blk.split()[-1]).copy()
    # the reference gateway, mountain and studio name always go on, unchanged (owner rule 2026-10-15: "on all cards, no changes").
    # Only the reference's own gateway / dark band / logo / name are pasted (never its parchment, so no tone boxes).
    # Leftovers of the card's old gateway around it are first painted out with the card's OWN parchment, row by row.
    sub = a_full[y0 - y:y0 - y + H, x0 - x:x0 - x + W]
    sub[rbg] = 0
    cover = np.zeros((h, w), bool)
    cover[y0:y0 + H, x0:x0 + W] = sub > 128
    wx0, wx1 = int(w * 0.34), int(w * 0.66)
    textrows = np.zeros(h, bool)
    for r in rows:
        textrows[max(0, r - 3):r + 4] = True
    # The card's old gateway = the non-parchment blob grown upward from the dark band around the card's keyhole.
    # Flavour-text rows (ink on both sides, beyond the gateway zone) are never touched; the blob, minus whatever the
    # new gateway covers, is repainted flat with the card's own parchment colour for that row.
    nk = x + rkx * s
    zx0, zx1 = max(0, int(min(k[0], nk) - w * 0.13)), min(w, int(max(k[0], nk) + w * 0.13))
    band_y = y0 + band_row
    ink_l = ink_full[:, int(w * 0.10):max(int(w * 0.10), int(min(k[0], nk) - w * 0.075))].any(axis=1)
    ink_r = ink_full[:, min(w, int(max(k[0], nk) + w * 0.075)):int(w * 0.90)].any(axis=1)
    trow = ink_l & ink_r
    trow = np.convolve(trow.astype(int), np.ones(7, int), "same") > 0  # a little margin above and below each line
    zone = np.zeros((h, w), bool)
    zone[int(h * 0.78):band_y + 3, zx0:zx1] = True
    zone[trow] = False
    blob = zone & ~full_b
    grow = np.zeros((h, w), bool)
    grow[band_y:band_y + 3, zx0:zx1] = True
    for _ in range(150):
        nxt = (np.asarray(Image.fromarray((grow * 255).astype("uint8")).filter(ImageFilter.MaxFilter(3))) > 0) & (blob | grow)
        if (nxt == grow).all():
            break
        grow = nxt
    fill = grow & zone
    fill = (np.asarray(Image.fromarray((fill * 255).astype("uint8")).filter(ImageFilter.MaxFilter(5))) > 0) & zone & ~cover
    if DEBUG:
        ys, xs = np.where(fill); print("fill", (xs.min(), xs.max(), ys.min(), ys.max()) if len(xs) else None)
    if fill.any():
        out = arr.astype(float)
        sx0, sx1 = max(0, zx0 - int(w * 0.10)), min(w, zx1 + int(w * 0.10))
        for r in np.where(fill.any(axis=1))[0]:
            seg = np.r_[sx0:zx0, zx1:sx1]
            lo, hi = max(0, r - 2), r + 3
            px = arr[lo:hi][:, seg][full_b[lo:hi][:, seg]]
            if len(px):
                out[r, fill[r]] = np.median(px, axis=0)
        feather = np.asarray(Image.fromarray((fill * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(1.5))).astype(float)[..., None] / 255
        feather = np.maximum(feather, fill[..., None].astype(float))
        feather[trow] = 0
        out = arr * (1 - feather) + out * feather
        im = Image.fromarray(out.astype("uint8"))
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


_RIM = None


def _rim():
    """Card 001's bottom rim: every row below its footer text, down to the black sheet background."""
    global _RIM
    if _RIM is None:
        src = os.path.join(ORIGINALS, REF_SHEET)
        if not os.path.exists(src):
            src = os.path.join(SET2, "Card Sheets", REF_SHEET)
        im = Image.open(src).convert("RGB")
        x0, y0, x1, y1 = _cards(im)[0]
        a = np.asarray(im).astype(int)
        card = a[y0:y1, x0:x1]
        h, w, _ = card.shape
        fy = footer_row(card, w, h)
        top = int(round(fy + h * 0.013))
        strip = a[y0 + top:min(a.shape[0], y1 + 6), x0:x1]  # a few rows of black below the card too
        _RIM = (Image.fromarray(strip.astype("uint8")), top / h, w)
    return _RIM


def stamp_rim(card):
    """Replace the bottom rim (below the footer text) with card 001's, so every card ends the same way:
    rounded corners, dark border, no stray teal line (owner request 2026-10-16)."""
    im = card.convert("RGB").copy()
    w, h = im.size
    arr = np.asarray(im).astype(int)
    fy = footer_row(arr, w, h) or h * 0.955
    strip, _, rw = _rim()
    s = w / rw
    st = strip.resize((w, max(1, round(strip.height * s))), Image.LANCZOS)
    top = int(round(fy + h * 0.013))
    out = arr.copy()
    out[top:] = 0  # sheet background below the card
    n = min(st.height, h - top)
    out[top:top + n] = np.asarray(st).astype(int)[:n]
    # blend the first rows into the card's own footer band so no seam shows
    k = 4
    for i in range(k):
        t = (i + 1) / (k + 1)
        r = top + i
        if r < h:
            out[r] = arr[r] * (1 - t) + out[r] * t
    return Image.fromarray(out.astype("uint8"))


# Stat changes made after a card was drawn (owner decisions). (sheet, card index) -> (source sheet, card index, which shield)
# The whole shield is taken from a finished card that already shows the new number, so the art style matches exactly.
STAT_PATCHES = {
    # 2026-10-16: Crystal Mite 1/2 -> 1/3 ("a tad tougher"; sim: Guardians' Brood 51.4% -> 53.1%). Guard 3 from Lady Volt 048.
    ("Cards 049-051 Vessimer ATLAS-Omega and Crystal Mite.png", 2): ("Cards 046-048 Titan Rho and Lady Volt.png", 2, "guard"),
}


def _shield_box(a, w, h, which):
    """Bounding box of the Might (red, bottom-left) or Guard (blue, bottom-right) shield body."""
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    m = ((R > 140) & (G < 90) & (B < 90)) if which == "might" else ((B > 150) & (R < 90) & (G < 150))
    m[:int(h * 0.80)] = False
    if which == "might":
        m[:, int(w * 0.30):] = False
    else:
        m[:, :int(w * 0.70)] = False
    ys, xs = np.where(m)
    return xs.min(), ys.min(), xs.max(), ys.max()


def patch_stat(card, src_card, which):
    """Paste src_card's whole Might/Guard shield (with its gold rim) over card's, centred on card's shield."""
    im = card.convert("RGB").copy()
    w, h = im.size
    src = src_card.convert("RGB").resize((w, round(src_card.height * w / src_card.width)), Image.LANCZOS)
    a, b = np.asarray(im).astype(int), np.asarray(src).astype(int)
    tx0, ty0, tx1, ty1 = _shield_box(a, w, h, which)
    sx0, sy0, sx1, sy1 = _shield_box(b, w, src.height, which)
    pad = int(w * 0.03)
    piece = src.crop((sx0 - pad, sy0 - pad, sx1 + pad, sy1 + pad))
    mask = Image.new("L", piece.size, 0)
    ImageDraw.Draw(mask).ellipse((2, 2, piece.width - 3, piece.height - 3), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(3))
    cx, cy = (tx0 + tx1) / 2 - (sx1 - sx0) / 2 - pad, (ty0 + ty1) / 2 - (sy1 - sy0) / 2 - pad
    im.paste(piece, (round(cx), round(cy)), mask)
    return im


_REFCARD = None


def _refcard():
    """Card 001 (untouched original) as an array, with its gateway measurements."""
    global _REFCARD
    if _REFCARD is None:
        src = os.path.join(ORIGINALS, REF_SHEET)
        im = Image.open(src).convert("RGB")
        c = np.asarray(im.crop(_cards(im)[0])).astype(float)
        h, w, _ = c.shape
        kx, _ = keyhole(c.astype(int), w, h)
        b = _beige(c.astype(int))
        cols = slice(int(kx - w * 0.03), int(kx + w * 0.03))
        arch_top = next(y for y in range(int(h * 0.80), h) if (~b[y, cols]).mean() > 0.3)
        side = slice(int(kx - w * 0.10), int(kx - w * 0.07))
        band_y = next(y for y in range(arch_top, h) if (~b[y, side]).mean() > 0.8)
        fy = footer_row(c.astype(int), w, h)
        _REFCARD = (c, kx, arch_top, band_y, fy)
    return _REFCARD


def clean_gate(card):
    """Make the gateway area identical to card 001 (owner 2026-10-16: clean, no overlaps, no colour boost, no doubles).
    Above the dark band: the card's own parchment colour row by row, with only 001's arch on it (old arches gone);
    flavour-text rows keep their letters. From the band down to the studio name: 001's pixels, feathered at the sides."""
    im = card.convert("RGB")
    a = np.asarray(im).astype(float)
    h, w, _ = a.shape
    c, kx, at, by, rfy = _refcard()
    rh, rw, _ = c.shape
    s = w / rw
    fy = footer_row(a.astype(int), w, h) or h * 0.955
    # same placement rule as stamp_emblem: 001's keyhole x position, this card's footer line
    ox = 0.0   # ref x -> card x: x * s + ox
    oy = fy - rfy * s
    ref = np.asarray(Image.fromarray(c.astype("uint8")).resize((round(rw * s), round(rh * s)), Image.LANCZOS)).astype(float)
    def R(x, y):
        return ref[min(ref.shape[0] - 1, max(0, int(round(y)))), min(ref.shape[1] - 1, max(0, int(round(x))))]
    half = rw * 0.11
    X0, X1 = int(round((kx - half) * s + ox)), int(round((kx + half) * s + ox))
    Y0 = int(round((at - rh * 0.035) * s + oy))
    YB = int(round(by * s + oy))
    YE = int(round((rfy - rh * 0.016) * s + oy))
    # reference crop aligned to the card
    ry0 = int(round((Y0 - oy) / s * s))
    def ref_rows(y0, y1):
        r0, r1 = int(round(y0 - oy)), int(round(y1 - oy))
        return ref[max(0, r0):r1, max(0, X0):X1]
    up_ref = ref_rows(Y0, YB)
    ui = up_ref.astype(int)
    rb = (ui.min(axis=2) > 150) & ((ui.max(axis=2) - ui.min(axis=2)) < 80)
    # 001's arch only: the non-parchment blob connected to the arch's centre column (its flavour text is left out)
    arch = ~rb
    seed = np.zeros_like(arch)
    cx = int(round(kx * s + ox)) - X0
    seed[-3:, max(0, cx - 3):cx + 3] = True
    seed &= arch
    for _ in range(400):
        nxt = (np.asarray(Image.fromarray((seed * 255).astype("uint8")).filter(ImageFilter.MaxFilter(3))) > 0) & arch
        if (nxt == seed).all():
            break
        seed = nxt
    arch = np.asarray(Image.fromarray((seed * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.6))).astype(float) / 255
    arch_top_i = int(np.where(seed.any(axis=1))[0].min()) if seed.any() else 0
    acols = np.where(seed.any(axis=0))[0]
    near = np.zeros(X1 - X0, bool)
    if len(acols):
        near[max(0, acols.min() - 10):acols.max() + 11] = True
    far = ~near
    ai = a.astype(int)
    tb = (ai.min(axis=2) > 150) & ((ai.max(axis=2) - ai.min(axis=2)) < 80)   # any light paper tone
    ink = (a.mean(axis=2) < 130) & ((a.max(axis=2) - a.min(axis=2)) < 70)
    out = a.copy()
    lx0, lx1 = max(0, X0 - int(w * 0.10)), X0
    rx0, rx1 = X1, min(w, X1 + int(w * 0.10))
    # where this card's own band line starts (just beside the arch): never paint paper over it
    probe = np.concatenate([np.arange(X0, X0 + 14), np.arange(X1 - 14, X1)])
    ystart = Y0 + (int(np.where(seed.any(axis=1))[0].min()) if seed.any() else 0) + 8
    nonp = (~tb[:, probe]).mean(axis=1) > 0.6
    ybc = next((y for y in range(ystart, YB + 8) if nonp[y] and nonp[y + 1] and nonp[y + 2]), YB)
    for i, y in enumerate(range(Y0, YB)):
        if i >= up_ref.shape[0]:
            break
        side = np.concatenate([a[y, lx0:lx1][tb[y, lx0:lx1]], a[y, rx0:rx1][tb[y, rx0:rx1]]])
        paper = np.median(side, axis=0) if len(side) else np.median(a[y, X0:X1], axis=0)
        row = a[y, X0:X1].copy()
        ink_r = ink[y, X0:X1]
        text_line = (ink[y, lx0:lx1].any() and ink[y, rx0:rx1].any()) or ink_r[far].sum() >= 2
        letters = ink_r if text_line else np.zeros_like(ink_r)
        # leftovers of the old gateway: anything not paper, plus off-tone paper (old glow) near the arch
        off = np.abs(row - paper).max(axis=1) > 22
        fix = (~tb[y, X0:X1] | (off & near)) & ~letters
        if y >= ybc - 6 and len(acols):
            # at the band line: the card's own line is carried straight in to the arch (old wider arch bases gone)
            fix[:] = False
            l0, r0 = max(0, acols.min() - 18), min(X1 - X0 - 1, acols.max() + 18)
            row[l0:acols.min() + 2] = row[l0]
            row[acols.max() - 2:r0 + 1] = row[r0]
        row[fix] = paper
        m = arch[i, :X1 - X0, None]
        out[y, X0:X1] = row * (1 - m) + up_ref[i, :X1 - X0] * m
    low = ref_rows(YB, YE)
    n = min(low.shape[0], YE - YB)
    fe = np.clip(np.minimum(np.arange(X1 - X0), np.arange(X1 - X0)[::-1]) / 12.0, 0, 1)[None, :, None]
    out[YB:YB + n, X0:X1] = a[YB:YB + n, X0:X1] * (1 - fe) + low[:n, :X1 - X0] * fe
    # soften the top/left/right edge of the repainted paper
    return Image.fromarray(np.clip(out, 0, 255).astype("uint8"))


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
        for i, b in enumerate(_cards(im)):
            card = im.crop(b)
            if (name, i) in STAT_PATCHES:
                sname, si, which = STAT_PATCHES[(name, i)]
                sim = Image.open(os.path.join(ORIGINALS, sname)).convert("RGB")
                card = patch_stat(card, sim.crop(_cards(sim)[si]), which)
            im.paste(stamp_rim(clean_gate(stamp_emblem(card))), b[:2])
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
