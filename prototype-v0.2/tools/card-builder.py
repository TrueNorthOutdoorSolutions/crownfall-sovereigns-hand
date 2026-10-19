"""
Card builder (TEST, 2026-10-18): GPT paints only the artwork; every card is assembled here on one locked frame,
so frames, headers, bands, trait bars, dividers, gateways and footers can never drift again.

Base frames are cut from the approved Set 2 cards (Bramble 001 = champion 1 star, 002 = Ascension 2 stars,
Iron Plate 068 body with Bramble's header = Relic). Text is drawn with Georgia (closest installed match).
"""
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 744, 1039
SINGLES = r"C:\Users\micha\Desktop\Crownfall Art\10 Sovereign's Hand\Set 2 - Beneath the Arena\PRINTABLE CARDS\Individual Cards"
ICONS = os.path.join(os.path.dirname(__file__), "..", "card-template", "icons-set2")
F = {"b": "cambriab.ttf", "r": "cambria.ttc", "i": "cambriai.ttf", "bi": "cambriaz.ttf", "sym": "seguisym.ttf"}
INK, WHITE = (24, 20, 18), (240, 236, 228)
STAR = "\u2605"
ARROW = "\u2191"


def font(kind, size):
    return ImageFont.truetype(F[kind], size)


def load(no):
    return np.asarray(Image.open(os.path.join(SINGLES, f"{no}.png")).convert("RGB").resize((W, H), Image.LANCZOS)).astype(float)


def inpaint(a, mask, iters=250):
    """Fill masked pixels smoothly from their surroundings (diffusion)."""
    v = a.copy()
    for _ in range(iters):
        p = np.pad(v, ((1, 1), (1, 1), (0, 0)), mode="edge")
        avg = (p[:-2, 1:-1] + p[2:, 1:-1] + p[1:-1, :-2] + p[1:-1, 2:]) / 4
        v[mask] = avg[mask]
    return v


def grow(mask, n=2):
    return np.asarray(Image.fromarray((mask * 255).astype("uint8")).filter(ImageFilter.MaxFilter(2 * n + 1))) > 0


def blank(a, box, test, n=2):
    """Inpaint pixels inside box (x0, y0, x1, y1) where test(region) is True."""
    x0, y0, x1, y1 = box
    reg = a[y0:y1, x0:x1]
    m = grow(test(reg), n)
    a[y0:y1, x0:x1] = inpaint(reg, m)


def dark(r):
    return r.mean(axis=2) < 120


def light(r):
    return (r.min(axis=2) > 150) & ((r.max(axis=2) - r.min(axis=2)) < 70)


def ink(r):
    return (r.mean(axis=2) < 175) & ((r.max(axis=2) - r.min(axis=2)) < 80)


def clean_paper(a, box, keep=None):
    """Rebuild a parchment area with no trace of old text: smooth local paper colour + the paper's own fine grain
    (taken from the same area after the text is removed)."""
    x0, y0, x1, y1 = box
    reg = a[y0:y1, x0:x1].copy()
    m = grow(ink(reg) | (reg.mean(axis=2) < 200) & (np.abs(reg[..., 0] - reg[..., 2]) < 60), 3)
    if keep is not None:
        m &= ~keep[y0:y1, x0:x1]
    filled = inpaint(reg, m, 400)
    base = np.asarray(Image.fromarray(np.clip(filled, 0, 255).astype("uint8")).filter(ImageFilter.GaussianBlur(18))).astype(float)
    grain = filled - np.asarray(Image.fromarray(np.clip(filled, 0, 255).astype("uint8")).filter(ImageFilter.GaussianBlur(2))).astype(float)
    grain[m] = 0
    out = base + np.clip(grain, -8, 8)
    if keep is not None:
        k = keep[y0:y1, x0:x1]
        out[k] = reg[k]
    a[y0:y1, x0:x1] = out


def flatbar(a, box):
    """Repaint a dark bar region with its own colour, row by row (median of its dark pixels)."""
    x0, y0, x1, y1 = box
    for y in range(y0, y1):
        row = a[y, x0:x1]
        dk = row[row.max(axis=1) < 70]
        if len(dk):
            a[y, x0:x1] = np.median(dk, axis=0)


def text(d, xy, s, f, fill, anchor="la", outline=None):
    if outline:
        d.text(xy, s, font=f, fill=fill, anchor=anchor, stroke_width=3, stroke_fill=outline)
    else:
        d.text(xy, s, font=f, fill=fill, anchor=anchor)


def wrap(d, s, f, width, first_width=None):
    words, lines, cur = s.split(), [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        lim = first_width if (first_width is not None and not lines) else width
        if d.textlength(t, font=f) <= lim:
            cur = t
        else:
            lines.append(cur)
            cur = w_
    if cur:
        lines.append(cur)
    return lines


# ---------------------------------------------------------------- base frames
def base_champion(star):
    a = load({1: "001", 2: "002", 3: "251"}[star])
    blank(a, (162, 40, 548, 113), ink, 2)                                    # name + title (plate edges kept)
    if star == 1:
        blank(a, (30, 25, 130, 140), lambda r: r.min(axis=2) > 170, 2)       # white cost digit
    else:
        blank(a, (30, 25, 130, 140), dark, 2)                                # arrow + number on the gold gem
    flatbar(a, (52, 594, 540, 630))                                          # trait icons + words (rims kept)
    blank(a, (600, 594, 704, 630), lambda r: r.max(axis=2) > 120, 2)         # "TIER I" (chevron kept)
    if star > 1:
        blank(a, (120, 540, 620, 578), lambda r: r.max(axis=2) > 150, 2)     # Ascension band words + star
    clean_paper(a, (52, 652, 692, 858))                                      # whole text box (divider redrawn)
    blank(a, (86, 878, 146, 958), lambda r: r.min(axis=2) > 190, 2)          # Might number (icon kept)
    blank(a, (655, 878, 714, 958), lambda r: r.min(axis=2) > 190, 2)         # Guard number (icon kept)
    blank(a, (20, 988, 190, 1020), light, 2)                                 # card number + rarity letter
    return a


def base_relic():
    a = load("068")
    top = load("001")[:118]
    a[:118, :560] = top[:, :560]                                             # Bramble's header: gem + name plate
    a[:118, :15] = top[:, :15]
    a[:118, -15:] = top[:, -15:]
    blank(a, (162, 40, 548, 113), ink, 2)
    blank(a, (30, 25, 130, 140), lambda r: r.min(axis=2) > 170, 2)
    blank(a, (40, 618, 300, 660), light, 2)                                  # "Component"
    clean_paper(a, (52, 670, 692, 790))
    clean_paper(a, (52, 790, 548, 860))
    blank(a, (20, 988, 190, 1020), light, 2)
    return a


# ---------------------------------------------------------------- assembly
def place_art(a, art, box):
    x0, y0, x1, y1 = box
    art = art.convert("RGB")
    s = max((x1 - x0) / art.width, (y1 - y0) / art.height)
    art = art.resize((round(art.width * s), round(art.height * s)), Image.LANCZOS)
    ox, oy = (art.width - (x1 - x0)) // 2, (art.height - (y1 - y0)) // 2
    a[y0:y1, x0:x1] = np.asarray(art.crop((ox, oy, ox + x1 - x0, oy + y1 - y0))).astype(float)


def icon(name, h):
    im = Image.open(os.path.join(ICONS, f"{name}.png")).convert("RGB")
    al = Image.fromarray(((np.asarray(im).max(axis=2) > 70) * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.6))
    s = h / im.height
    size = (round(im.width * s), h)
    return im.resize(size, Image.LANCZOS), al.resize(size, Image.LANCZOS)


def rich(d, para, x0, y, width, size):
    """One rules paragraph with **bold** segments and word wrap; a leading trigger ("Attack:") is bold too."""
    if para.startswith(TRIGGERS):
        t, rest = para.split(":", 1)
        para = f"**{t}:**{rest}"
    if para.startswith(("+", "−")) and "**" not in para:
        para = f"**{para}**"
    words = []
    for k, part in enumerate(para.split("**")):
        for w_ in part.split(" "):
            if w_:
                words.append((w_, k % 2 == 1))
    x = x0
    sp = d.textlength(" ", font=font("r", size))
    for w_, b in words:
        f = font("b" if b else "r", size)
        wl = d.textlength(w_, font=f)
        if x + wl > x0 + width and x > x0:
            x, y = x0, y + int(size * 1.23)
        text(d, (x, y), w_, f, INK, "ls")
        x += wl + sp
    return y + int(size * 1.23)


def star_poly(d, cx, cy, r):
    import math
    pts = []
    for i in range(10):
        rr = r if i % 2 == 0 else r * 0.42
        ang = -math.pi / 2 + i * math.pi / 5
        pts.append((cx + rr * math.cos(ang), cy + rr * math.sin(ang)))
    d.polygon(pts, fill=(240, 190, 60), outline=(120, 80, 20))


TRIGGERS = ("Arrival:", "Attack:", "Block:", "Ascend:", "Defeated:")


def build(card, art, frame):
    a = frame.copy()
    kind = card["kind"]
    if kind == "relic":
        art_box = (24, 121, 720, 560)
    else:
        art_box = (24, 121, 720, 578 if card["star"] == 1 else 538)
    keep = a.copy()
    place_art(a, art, art_box)
    x0, y0, x1, y1 = art_box
    for xs in (slice(x0, x0 + 6), slice(x1 - 6, x1)):
        a[y0:y1, xs] = keep[y0:y1, xs]
    im = Image.fromarray(np.clip(a, 0, 255).astype("uint8"))
    d = ImageDraw.Draw(im)
    # gem
    if kind == "relic" or card["star"] == 1:
        text(d, (76, 80), str(card["cost"]), font("b", 66), WHITE, "mm", outline=(10, 40, 20))
    else:
        cx, cy = 62, 82
        d.polygon([(cx, cy - 24), (cx - 13, cy - 6), (cx - 5, cy - 6), (cx - 5, cy + 22), (cx + 5, cy + 22), (cx + 5, cy - 6), (cx + 13, cy - 6)], fill=INK)
        text(d, (96, 84), str(card["cost"]), font("b", 58), INK, "mm")
    # name plate
    text(d, (172, 66), card["name"], font("b", 47), INK, "ls")
    if kind == "relic":
        text(d, (174, 103), card["title"], font("b", 22), INK, "ls")
        text(d, (62, 640), card["subtype"], font("r", 27), WHITE, "lm")
    else:
        text(d, (172, 102), card["title"], font("r", 30), INK, "ls")
        if card["star"] > 1:
            s_ = f"ASCENSION \u2022 from {card['name']}"
            tw = d.textlength(s_, font=font("r", 26))
            n_ = card["star"] - 1
            x_ = 372 - (tw + 10 + 26 * n_) / 2
            text(d, (x_, 558), s_, font("r", 26), WHITE, "lm")
            for k in range(n_):
                star_poly(d, x_ + tw + 22 + 26 * k, 557, 11)
        x = 58
        for i, t in enumerate(card["traits"]):
            if i:
                d.line((x + 2, 594, x + 2, 626), fill=(196, 160, 70), width=2)
                x += 22
            ic, al = icon(t, 34)
            im.paste(ic, (int(x), 593), al)
            x += ic.width + 12
            text(d, (x, 610), t, font("r", 29), WHITE, "lm")
            x += d.textlength(t, font=font("r", 29)) + 18
        text(d, (652, 610), f"TIER {card['tier']}", font("r", 28), WHITE, "mm")
    # divider (card 001's thin tan line), always in the same place
    dy = 800 if kind != "relic" else 832
    dx1 = 660 if kind != "relic" else 540
    d.line((85, dy, dx1, dy), fill=(200, 164, 124), width=2)
    # rules text
    y = 692 if kind != "relic" else 745
    if card.get("ability"):
        text(d, (85, y), card["ability"] + ".", font("b", 30), INK, "ls")
        y += 40
    for para in card["rules"]:
        big = kind == "relic" and para.startswith(("+", "\u2212"))
        y = rich(d, para, 85, y, 575, 34 if big else 30)
    if card.get("flavour"):
        text(d, (372, 830), f"\u201c{card['flavour']}\u201d", font("i", 25), INK, "mm")
    # shields
    if card.get("might") not in (None, ""):
        text(d, (106, 918), str(card["might"]), font("b", 66), WHITE, "mm", outline=(40, 10, 5))
    if card.get("guard") not in (None, "") and kind != "relic":
        text(d, (672, 918), str(card["guard"]), font("b", 66), WHITE, "mm", outline=(5, 15, 50))
    # footer
    text(d, (35, 1003), f"{card['number']}/266", font("r", 24), WHITE, "lm")
    text(d, (160, 1003), card["rarity"], font("r", 24), WHITE, "lm")
    return im
