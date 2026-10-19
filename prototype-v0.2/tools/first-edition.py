"""
Set 1 1st Edition print (owner approved 2026-10-18): every numbered card gets the locked "1st Edition" seal
(card-template/first-edition-seal.png) at the bottom-left of the art, 66 px wide at 744 x 1039, top-left corner (30, 500).
The standard cards are never changed; the 1st Edition copies go to <Set 1>/1st Edition/.
Usage: python prototype-v0.2/tools/first-edition.py
"""
import importlib.util
import os

from PIL import Image

HERE = os.path.dirname(__file__)


def _load(name, file):
    sp = importlib.util.spec_from_file_location(name, os.path.join(HERE, file))
    m = importlib.util.module_from_spec(sp)
    sp.loader.exec_module(m)
    return m


bp = _load("bp", "build-printable.py")
b5 = _load("b5", "build-printable-5x7.py")
SEAL = Image.open(os.path.join(HERE, "..", "card-template", "first-edition-seal.png")).convert("RGBA")
POS, SIZE = (30, 500), 66


def stamp(card):
    c = card.convert("RGB").resize((744, 1039), Image.LANCZOS)
    s = SEAL.resize((SIZE, SIZE), Image.LANCZOS)
    c.paste(s, POS, s)
    return c.resize((bp.CARD_W, bp.CARD_H), Image.LANCZOS)


def main():
    set_dir = os.path.join(bp.ART, bp.SETS[1])
    src = os.path.join(set_dir, "PRINTABLE CARDS", "Individual Cards")
    out = os.path.join(set_dir, "1st Edition")
    singles = os.path.join(out, "Individual Cards")
    os.makedirs(singles, exist_ok=True)
    nums = sorted(f for f in os.listdir(src) if f.endswith(".png"))
    cards = []
    for f in nums:
        c = stamp(Image.open(os.path.join(src, f)))
        c.save(os.path.join(singles, f))
        cards.append(c)
    pages = [bp.page(cards[i:i + 9], label=f"Sovereign's Hand Set 1 · 1st Edition · cards {nums[i][:3]}–{nums[min(i + 8, len(nums) - 1)][:3]} · print at 100% (Actual size)")
             for i in range(0, len(cards), 9)]
    bp.save_pdf(pages, os.path.join(out, "Set 1 1st Edition Card Fronts.pdf"))
    p5 = b5.pages(cards)
    bp.save_pdf(p5, os.path.join(out, "Set 1 1st Edition Card Fronts 5x7.pdf"))
    print(f"{len(cards)} 1st Edition cards -> {out}")


if __name__ == "__main__":
    main()
