"""
Printable starter decks for Sovereign's Hand (US Letter, 63 x 88 mm, 9 per page, same layout as build-printable.py).

For each Set 1 starter deck writes, to <art>/Set 1 - The Shattered Crown/PRINTABLE CARDS/Starter Decks/:
  <Deck> - Cards.pdf      the 30-card deck (copies included), then the 8-card Ascension Pile, then both reference cards
  <Deck> - Decklist.pdf   one page: every card, how many, and what goes where
Print the backs with Card Backs.pdf (one back page per card page), flipped on the long edge.

Usage: python prototype-v0.2/tools/build-deck-printables.py <decks.json>
decks.json comes from the card data (src/v02/content/cards.ts DECKS).
"""
import csv
import importlib.util
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(__file__)
spec = importlib.util.spec_from_file_location("bp", os.path.join(HERE, "build-printable.py"))
bp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bp)
# 5 x 7 inch paper, 2 x 2 per page (owner request 2026-10-11): written beside the Letter files in "5x7 (4 per page)".
spec5 = importlib.util.spec_from_file_location("bp5", os.path.join(HERE, "build-printable-5x7.py"))
bp5 = importlib.util.module_from_spec(spec5)
spec5.loader.exec_module(bp5)

SET_DIR = os.path.join(bp.ART, bp.SETS[1])
SINGLES = os.path.join(SET_DIR, "PRINTABLE CARDS", "Individual Cards")
EXTRAS = os.path.join(SET_DIR, "Inserts and Tokens")
OUT = os.path.join(SET_DIR, "PRINTABLE CARDS", "Starter Decks")
OUT5 = os.path.join(OUT, "5x7 (4 per page)")


def font(size, bold=False):
    for name in (("georgiab.ttf" if bold else "georgia.ttf"), ("arialbd.ttf" if bold else "arial.ttf")):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default()


def main():
    decks = json.load(open(sys.argv[1], encoding="utf-8"))
    rows = list(csv.DictReader(open(os.path.join(HERE, "..", "master-card-list-set1.csv"), encoding="utf-8-sig")))
    by_id = {r["Card ID"]: r for r in rows}
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(OUT5, exist_ok=True)
    refs = [Image.open(os.path.join(EXTRAS, f"Reference {x}.png")).convert("RGB").resize((bp.CARD_W, bp.CARD_H), Image.LANCZOS)
            for x in ("A", "B")]

    for deck in decks.values():
        name = deck["name"].replace("&", "and")
        cards, lines = [], []
        for cid, n in deck["main"]:
            r = by_id[cid]
            num = int(r["No."].split("-")[1])
            cards += [Image.open(os.path.join(SINGLES, f"{num:03d}.png"))] * n
            lines.append((n, num, r["Card name"], r["Card type"], r["Cost (↑ = Ascend cost)"]))
        asc = []
        for cid in deck["ascension"]:
            r = by_id[cid]
            num = int(r["No."].split("-")[1])
            cards.append(Image.open(os.path.join(SINGLES, f"{num:03d}.png")))
            asc.append((num, r["Card name"], r["Star form"], r["Cost (↑ = Ascend cost)"]))
        run = cards + refs
        pages = [bp.page(run[i:i + 9], label=f"{deck['name']} · page {i // 9 + 1} of {(len(run) + 8) // 9} · print at 100% (Actual size)")
                 for i in range(0, len(run), 9)]
        bp.save_pdf(pages, os.path.join(OUT, f"{name} - Cards.pdf"))
        run5 = [c.convert("RGB").resize((bp5.CARD_W, bp5.CARD_H), Image.LANCZOS) for c in run]
        pages5 = bp5.pages(run5)
        bp.save_pdf(pages5, os.path.join(OUT5, f"{name} - Cards 5x7.pdf"))

        # Decklist page
        p = Image.new("RGB", (bp.PAGE_W, bp.PAGE_H), "white")
        d = ImageDraw.Draw(p)
        x, y = 180, 160
        d.text((x, y), deck["name"], font=font(96, True), fill="black"); y += 130
        d.text((x, y), f"Sovereign's Hand · Set 1 Starter Deck · {deck['origins']}", font=font(40), fill=(90, 90, 90)); y += 70
        d.text((x, y), deck["pitch"], font=font(36), fill=(60, 60, 60)); y += 110
        d.text((x, y), f"MAIN DECK — {sum(n for n, *_ in lines)} cards (shuffle these)", font=font(48, True), fill="black"); y += 80
        for n, num, cname, ctype, cost in lines:
            d.text((x, y), f"{n}×", font=font(40, True), fill="black")
            d.text((x + 110, y), f"{num:03d}  {cname}", font=font(40), fill="black")
            d.text((x + 1300, y), f"{ctype} · cost {cost}", font=font(36), fill=(90, 90, 90)); y += 58
        y += 50
        d.text((x, y), f"ASCENSION PILE — {len(asc)} cards (keep face-up beside you, not in the deck)", font=font(48, True), fill="black"); y += 80
        for num, cname, form, cost in asc:
            d.text((x + 110, y), f"{num:03d}  {cname} ({len(form)}-star form)", font=font(40), fill="black")
            d.text((x + 1300, y), f"Ascend cost {cost.lstrip('↑')}", font=font(36), fill=(90, 90, 90)); y += 58
        y += 50
        d.text((x, y), "Also print: Reference A and B (included at the end of the cards file).", font=font(36), fill=(90, 90, 90))
        p.save(os.path.join(OUT, f"{name} - Decklist.pdf"), "PDF", resolution=bp.DPI)
        # The same decklist shrunk onto a 5 x 7 page.
        w5 = bp5.PAGE_W - 60
        small = p.resize((w5, round(p.height * w5 / p.width)), Image.LANCZOS)
        p5 = Image.new("RGB", (bp5.PAGE_W, bp5.PAGE_H), "white")
        p5.paste(small, (30, (bp5.PAGE_H - small.height) // 2))
        p5.save(os.path.join(OUT5, f"{name} - Decklist 5x7.pdf"), "PDF", resolution=bp.DPI)
        print(f"{deck['name']}: {len(cards)} cards + 2 references on {len(pages)} Letter pages / {len(pages5)} 5x7 pages")


if __name__ == "__main__":
    main()
