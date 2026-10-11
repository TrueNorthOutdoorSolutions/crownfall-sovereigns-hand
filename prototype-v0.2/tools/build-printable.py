"""
Printable card sheets for Sovereign's Hand (US Letter, 63 x 88 mm cards, 9 per page).

Reads the approved 3-card sheets in  <art>/Set N - <name>/Card Sheets/Cards ###-### <Name>.png,
cuts out each card, and writes to     <art>/Set N - <name>/PRINTABLE CARDS/:
  Individual Cards/###.png           one file per card, 744 x 1039 px (63 x 88 mm at 300 dpi)
  Set N Card Fronts.pdf              every approved card in number order, 9 per page
  Card Backs.pdf                     one page of 9 backs, positioned to line up with every front page
  Alignment Test.pdf                 front + back test page to check your printer before a full run

Layout: 3 x 3 cards, no gaps and no overlap (neighbouring cards share one cut line), centred on the page
(13.5 mm left/right, 7.7 mm top/bottom). The grid is symmetric, so the backs line up when the page is
flipped on its long edge. Crop marks sit only in the margins, never on a card.

Usage: python prototype-v0.2/tools/build-printable.py [set number, default 1]
Source art is only read, never changed.
"""
import os
import re
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

DPI = 300
MM = DPI / 25.4
PAGE_W, PAGE_H = round(8.5 * DPI), round(11 * DPI)          # 2550 x 3300
CARD_W, CARD_H = round(63 * MM), round(88 * MM)              # 744 x 1039
COLS, ROWS = 3, 3
GRID_W, GRID_H = COLS * CARD_W, ROWS * CARD_H
X0, Y0 = (PAGE_W - GRID_W) // 2, (PAGE_H - GRID_H) // 2

ART = r"C:\Users\micha\Desktop\Crownfall Art\10 Sovereign's Hand"
SETS = {1: "Set 1 - The Shattered Crown", 2: "Set 2 - Beneath the Arena"}
BACK = os.path.join(ART, "00 Templates", "Card Back (LOCKED).png")


def card_numbers(name):
    """'Cards 001-003 Bramble.png' -> [1, 2, 3]; 'Cards 166-170-171 Spells.png' -> [166, 170, 171]."""
    nums = [int(n) for n in re.findall(r"\d{3}", name.split(" ", 2)[1])]
    if len(nums) == 2:
        a, b = nums
        return list(range(a, b + 1)) if b - a == 2 else nums
    return nums


def split_sheet(path):
    """Cut a 3-card sheet into its three cards using the dark gaps between them."""
    im = Image.open(path).convert("RGB")
    a = np.asarray(im).astype(int)
    h, w, _ = a.shape
    dark_col = a[int(h * 0.12):int(h * 0.88)].max(axis=2).max(axis=0) < 24
    runs, start = [], None
    for x in range(w):
        if not dark_col[x] and start is None:
            start = x
        if dark_col[x] and start is not None:
            runs.append((start, x)); start = None
    if start is not None:
        runs.append((start, w))
    runs = [r for r in runs if r[1] - r[0] > w * 0.2]
    if len(runs) != 3:
        raise SystemExit(f"{os.path.basename(path)}: expected 3 cards, found {len(runs)} — check the sheet")
    cards = []
    for x0, x1 in runs:
        sub = a[:, x0:x1].max(axis=2)
        rows = np.where(sub.max(axis=1) >= 24)[0]
        y0, y1 = rows[0], rows[-1] + 1
        cards.append(im.crop((x0, y0, x1, y1)).resize((CARD_W, CARD_H), Image.LANCZOS))
    return cards


def crop_marks(draw):
    """Short lines in the margins at every cut position; they never touch a card."""
    gap, ln, wd = round(1.5 * MM), round(5 * MM), 3
    for c in range(COLS + 1):
        x = X0 + c * CARD_W
        draw.line([(x, max(0, Y0 - gap - ln)), (x, Y0 - gap)], fill="black", width=wd)
        draw.line([(x, Y0 + GRID_H + gap), (x, min(PAGE_H, Y0 + GRID_H + gap + ln))], fill="black", width=wd)
    for r in range(ROWS + 1):
        y = Y0 + r * CARD_H
        draw.line([(max(0, X0 - gap - ln), y), (X0 - gap, y)], fill="black", width=wd)
        draw.line([(X0 + GRID_W + gap, y), (min(PAGE_W, X0 + GRID_W + gap + ln), y)], fill="black", width=wd)


def page(cards, marks=True, label=None):
    p = Image.new("RGB", (PAGE_W, PAGE_H), "white")
    for i, c in enumerate(cards):
        p.paste(c, (X0 + (i % COLS) * CARD_W, Y0 + (i // COLS) * CARD_H))
    d = ImageDraw.Draw(p)
    if marks:
        crop_marks(d)
    if label:
        try:
            f = ImageFont.truetype("arial.ttf", 26)
        except OSError:
            f = ImageFont.load_default()
        d.text((X0 + round(10 * MM), PAGE_H - Y0 + round(2.5 * MM)), label, fill=(120, 120, 120), font=f)
    return p


def save_pdf(pages, path):
    pages[0].save(path, "PDF", resolution=DPI, save_all=True, append_images=pages[1:])


def main():
    set_no = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    set_dir = os.path.join(ART, SETS[set_no])
    sheets = os.path.join(set_dir, "Card Sheets")
    out = os.path.join(set_dir, "PRINTABLE CARDS")
    singles = os.path.join(out, "Individual Cards")
    os.makedirs(singles, exist_ok=True)

    cards = {}
    for name in sorted(os.listdir(sheets)):
        if not name.lower().startswith("cards ") or not name.lower().endswith(".png"):
            continue
        nums = card_numbers(name)
        for n, img in zip(nums, split_sheet(os.path.join(sheets, name))):
            if n in cards:
                raise SystemExit(f"card {n:03d} appears in two sheets — remove the old sheet")
            cards[n] = img
    order = sorted(cards)
    for n in order:
        cards[n].save(os.path.join(singles, f"{n:03d}.png"))

    total = 248 if set_no == 1 else 236
    pages = [page([cards[n] for n in order[i:i + 9]],
                  label=f"Sovereign's Hand Set {set_no} · cards {order[i]:03d}–{order[min(i + 8, len(order) - 1)]:03d} · print at 100% (Actual size)")
             for i in range(0, len(order), 9)]
    save_pdf(pages, os.path.join(out, f"Set {set_no} Card Fronts.pdf"))

    if os.path.exists(BACK):
        back = Image.open(BACK).convert("RGB")
        if back.width > back.height * 1.5:          # a 3-wide sheet: use the first card
            back = split_sheet(BACK)[0]
        back = back.resize((CARD_W, CARD_H), Image.LANCZOS)
        save_pdf([page([back] * 9, label="Card backs · print on the reverse, flip on LONG edge")],
                 os.path.join(out, "Card Backs.pdf"))
        test_front = page([cards[n] for n in order[:9]], label="ALIGNMENT TEST · front")
        save_pdf([test_front, page([back] * 9, label="ALIGNMENT TEST · back")], os.path.join(out, "Alignment Test.pdf"))
        back_note = "Card Backs.pdf and Alignment Test.pdf written."
    else:
        back_note = "No card back yet (00 Templates/Card Back (LOCKED).png) — backs skipped."

    # Inserts and tokens: every single-card PNG in "Inserts and Tokens" (reference cards first, then T01, T02 ...)
    extra_dir = os.path.join(set_dir, "Inserts and Tokens")
    if os.path.isdir(extra_dir):
        names = sorted([n for n in os.listdir(extra_dir) if n.lower().endswith(".png") and not n.startswith("Sheet")],
                       key=lambda n: (0 if n.startswith("Reference") else 1, n))
        extras = [Image.open(os.path.join(extra_dir, n)).convert("RGB").resize((CARD_W, CARD_H), Image.LANCZOS) for n in names]
        if extras:
            extra_pages = [page(extras[i:i + 9], label="Inserts and tokens · print at 100% (Actual size)") for i in range(0, len(extras), 9)]
            save_pdf(extra_pages, os.path.join(out, f"Set {set_no} Inserts and Tokens.pdf"))
            # The master file holds everything in one continuous run: the numbered cards, then straight on
            # into the inserts and tokens with no blank slots between them.
            run = [cards[n] for n in order] + extras
            master = [page(run[i:i + 9], label=f"Sovereign's Hand Set {set_no} · master sheet {i // 9 + 1} · print at 100% (Actual size)")
                      for i in range(0, len(run), 9)]
            save_pdf(master, os.path.join(out, f"Set {set_no} Card Fronts.pdf"))
            print(f"Master file: {len(run)} cards on {len(master)} pages")
            print(f"Inserts and tokens: {len(extras)} cards ({', '.join(n[:-4] for n in names)})")

    missing = [n for n in range(1, total + 1) if n not in cards]
    print(f"{len(order)} cards -> {len(pages)} front pages. {back_note}")
    print(f"Missing from Set {set_no}: {len(missing)} of {total}" + (f" (next: {missing[0]:03d})" if missing else ""))


if __name__ == "__main__":
    main()
