"""
One frame for every Set 1 card (owner request 2026-10-16: "I like this framework the best ... every card uses this exact frame").

The reference frame is card 004 Kira Volt ★. Every card keeps its OWN contents (gem, name plate, stars, art, trait bar,
text box, shields, footer) and gets card 004's border, vines and panel edges around them. Cards are compared at the
printable single size (744 x 1039); all Set 1 cards share the same layout to within a few pixels.

Usage: python prototype-v0.2/tools/unify-frame.py preview 088 001 130   (writes previews to the scratch folder given by --out)
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ART = r"C:\Users\micha\Desktop\Crownfall Art\10 Sovereign's Hand"
SINGLES = os.path.join(ART, "Set 1 - The Shattered Crown", "PRINTABLE CARDS", "Individual Cards")
W, H = 744, 1039
# frozen copies of the two reference cards, so re-running never drifts
TEMPLATES = os.path.join(os.path.dirname(__file__), "..", "card-template")
REF = "004"


def _beige(a):
    return (a[..., 0] > 185) & (a[..., 1] > 165) & (a[..., 2] > 120) & (a[..., 0] - a[..., 2] > 20)


REF_SPELL = "170"  # First Light: the shield-free bottom corners every spell and Edict shares


def holes(kind="champion"):
    """Where the card's own contents show through (255) and where the reference frame is drawn (0).
    Coordinates are for a 744 x 1039 card; holes() scales with the card."""
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    d.polygon([(12, 66), (44, 4), (122, 4), (154, 66), (122, 130), (44, 130)], fill=255)     # cost gem incl. its rim
    d.rounded_rectangle((148, 34, 660, 108), radius=6, fill=255)                              # name plate
    d.rectangle((600, 36, 706, 104), fill=255)                                                # stars / type symbol
    if kind == "champion":
        d.rounded_rectangle((42, 118, 702, 574), radius=16, fill=255)                         # art window (+ Ascension band)
        d.rectangle((34, 584, 712, 636), fill=255)                                            # trait bar
        d.rounded_rectangle((50, 646, 696, 930), radius=10, fill=255)                         # text box
        d.polygon([(18, 864), (88, 838), (158, 864), (152, 940), (88, 992), (24, 940)], fill=255)   # Might shield
        d.polygon([(586, 864), (656, 838), (726, 864), (720, 940), (656, 992), (592, 940)], fill=255)  # Guard shield
    else:
        d.rounded_rectangle((42, 118, 702, 578), radius=16, fill=255)                         # taller art window
        d.rectangle((30, 582, 714, 676), fill=255)                                            # type band + trait bar
        d.rounded_rectangle((44, 684, 700, 934), radius=10, fill=255)                         # text box
    d.rectangle((14, 986, 730, 1032), fill=255)                                               # footer line
    return m.filter(ImageFilter.GaussianBlur(1.5))


def reference(kind, size):
    """Card 004's frame; for spells and Edicts its lower part (below the art) comes from First Light, which has no shields."""
    ref = Image.open(os.path.join(TEMPLATES, "frame-ref-004-champion.png")).convert("RGB").resize((W, H), Image.LANCZOS)
    if kind != "champion":
        low = Image.open(os.path.join(TEMPLATES, "frame-ref-170-spell.png")).convert("RGB").resize((W, H), Image.LANCZOS)
        g = np.clip((np.arange(H) - 560) / 20.0, 0, 1)[:, None, None]
        ref = Image.fromarray((np.asarray(ref) * (1 - g) + np.asarray(low) * g).astype("uint8"))
    return ref.resize(size, Image.LANCZOS)


def unify(card, kind="champion", ref=None):
    """card at any size; returns the same size."""
    card = card.convert("RGB")
    ref = ref or reference(kind, card.size)
    m = np.asarray(holes(kind).resize(card.size, Image.LANCZOS)).astype(float)[..., None] / 255
    out = np.asarray(ref).astype(float) * (1 - m) + np.asarray(card).astype(float) * m
    return Image.fromarray(out.astype("uint8"))


def kind_of(number):
    return "champion" if int(number) <= 165 else "spell"


if __name__ == "__main__":
    out = sys.argv[sys.argv.index("--out") + 1]
    nums = [x for x in sys.argv[2:] if x.isdigit()]
    tiles = []
    for n in nums:
        c = Image.open(os.path.join(SINGLES, n + ".png")).convert("RGB")
        tiles += [c, unify(c, kind_of(n))]
    sheet = Image.new("RGB", (W * len(tiles) // 2, H * 2), "white")
    for i, t in enumerate(tiles):
        sheet.paste(t, (W * (i // 2), H * (i % 2)))
    sheet.save(os.path.join(out, "unify-preview.png"))
