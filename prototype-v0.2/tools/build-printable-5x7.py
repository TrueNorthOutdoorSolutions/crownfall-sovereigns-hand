"""
Printable cards on 5 x 7 inch paper: 2 x 2 cards per page (owner request 2026-10-11).
The 3 x 3 US Letter sheets from build-printable.py stay exactly as they are; run that first.

Cards are the true 63 x 88 mm size. Four of them make a 126 x 176 mm block on a 127 x 177.8 mm page,
so only about 0.5 mm is left at the sides and 0.9 mm at the top and bottom: there is no room for crop marks
or labels, and the printer must print BORDERLESS at 100% (Actual size) or the outer card edges get clipped.
The grid is centred and symmetric, so the backs line up when the page is flipped on its long edge.

Writes to <art>/Set N - <name>/PRINTABLE CARDS/5x7 (4 per page)/:
  Set N Card Fronts 5x7.pdf     every card in the same order as the 3 x 3 master file, 4 per page
  Set N <part> 5x7.pdf          the same split into numbered cards, inserts/tokens, Alternate Art, Masterworks, Omegas
  Card Backs 5x7.pdf            one page of 4 backs
  Alignment Test 5x7.pdf        front + back test page

Usage: python prototype-v0.2/tools/build-printable-5x7.py [set number, default 1]
Source art is only read, never changed.
"""
import importlib.util
import os
import re
import sys

from PIL import Image

HERE = os.path.dirname(__file__)
spec = importlib.util.spec_from_file_location("bp", os.path.join(HERE, "build-printable.py"))
bp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bp)

DPI = bp.DPI
PAGE_W, PAGE_H = round(5 * DPI), round(7 * DPI)              # 1500 x 2100
CARD_W, CARD_H = bp.CARD_W, bp.CARD_H                        # 744 x 1039 (63 x 88 mm)
COLS, ROWS = 2, 2
GRID_W, GRID_H = COLS * CARD_W, ROWS * CARD_H                # 1488 x 2078
X0, Y0 = (PAGE_W - GRID_W) // 2, (PAGE_H - GRID_H) // 2      # 6 px (0.5 mm), 11 px (0.9 mm)
PER = COLS * ROWS


def page(cards):
    p = Image.new("RGB", (PAGE_W, PAGE_H), "white")
    for i, c in enumerate(cards):
        p.paste(c, (X0 + (i % COLS) * CARD_W, Y0 + (i // COLS) * CARD_H))
    return p


def pages(cards):
    return [page(cards[i:i + PER]) for i in range(0, len(cards), PER)]


def load(path):
    return Image.open(path).convert("RGB").resize((CARD_W, CARD_H), Image.LANCZOS)


def main():
    set_no = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    set_dir = os.path.join(bp.ART, bp.SETS[set_no])
    printable = os.path.join(set_dir, "PRINTABLE CARDS")
    singles = os.path.join(printable, "Individual Cards")
    if not os.path.isdir(singles):
        raise SystemExit("Run build-printable.py first: it cuts the card sheets into Individual Cards.")
    out = os.path.join(printable, "5x7 (4 per page)")
    os.makedirs(out, exist_ok=True)

    parts = []
    numbered = [load(os.path.join(singles, n)) for n in sorted(os.listdir(singles)) if re.fullmatch(r"\d{3}\.png", n)]
    parts.append(("Card Fronts (numbered)", numbered))
    extra_dir = os.path.join(set_dir, "Inserts and Tokens")
    if os.path.isdir(extra_dir):
        names = sorted([n for n in os.listdir(extra_dir) if n.lower().endswith(".png") and not n.startswith("Sheet")],
                       key=lambda n: (0 if n.startswith("Reference") else 1, n))
        parts.append(("Inserts and Tokens", [load(os.path.join(extra_dir, n)) for n in names]))
    alt_dir = os.path.join(set_dir, "Alternate Art")
    if os.path.isdir(alt_dir):
        parts.append(("Alternate Art", [load(os.path.join(alt_dir, n)) for n in sorted(os.listdir(alt_dir)) if re.fullmatch(r"\d{3}\.png", n)]))
    for folder, prefix in (("Masterworks", "MW"), ("Omega Masterworks", "OM")):
        sp_dir = os.path.join(set_dir, folder)
        if os.path.isdir(sp_dir):
            parts.append((folder, [load(os.path.join(sp_dir, n)) for n in sorted(os.listdir(sp_dir)) if re.fullmatch(prefix + r"\d{2}\.png", n)]))

    run = []
    for title, cards in parts:
        if not cards:
            continue
        run += cards
        if title != "Card Fronts (numbered)":
            bp.save_pdf(pages(cards), os.path.join(out, f"Set {set_no} {title} 5x7.pdf"))
        print(f"{title}: {len(cards)} cards")
    master = pages(run)
    bp.save_pdf(master, os.path.join(out, f"Set {set_no} Card Fronts 5x7.pdf"))
    print(f"Master 5x7 file: {len(run)} cards on {len(master)} pages")

    if os.path.exists(bp.BACK):
        back = Image.open(bp.BACK).convert("RGB")
        if back.width > back.height * 1.5:
            back = bp.split_sheet(bp.BACK)[0]
        back = back.resize((CARD_W, CARD_H), Image.LANCZOS)
        bp.save_pdf([page([back] * PER)], os.path.join(out, "Card Backs 5x7.pdf"))
        bp.save_pdf([page(run[:PER]), page([back] * PER)], os.path.join(out, "Alignment Test 5x7.pdf"))
        print("Card Backs 5x7.pdf and Alignment Test 5x7.pdf written.")

    with open(os.path.join(out, "HOW TO PRINT 5x7.txt"), "w", encoding="utf-8") as f:
        f.write(
            "HOW TO PRINT ON 5 x 7 INCH PAPER (4 cards per page)\n\n"
            "1. Paper size: 5 x 7 in (127 x 178 mm). Load one sheet first to test.\n"
            "2. Print at 100% / Actual size. Never 'Fit to page' or 'Shrink'.\n"
            "3. Turn on BORDERLESS printing. The four cards fill the page with only about half a millimetre\n"
            "   to spare, so a printer that keeps a white border will clip the outer edges of the cards.\n"
            "4. Print 'Alignment Test 5x7.pdf' first: page 1 on the front, then put the sheet back in,\n"
            "   flipped on its LONG edge, and print page 2 (the backs). Hold it to a light to check they line up.\n"
            "5. Fronts: 'Set 1 Card Fronts 5x7.pdf'. Backs: print 'Card Backs 5x7.pdf' once for every front page.\n"
            "6. Cut along the edges between the cards: one cross through the middle of the page, then trim the outside.\n"
            "Cards are the standard 63 x 88 mm, so they fit normal card sleeves.\n"
        )


if __name__ == "__main__":
    main()
