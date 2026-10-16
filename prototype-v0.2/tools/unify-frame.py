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


def holes(kind="champion", set_no=1):
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
    elif set_no == 2:  # Set 2 spells sit ~20 px higher than Set 1's (measured on 054 / 057 / 060)
        d.rounded_rectangle((42, 118, 702, 574), radius=16, fill=255)                         # art window
        d.rectangle((30, 572, 714, 656), fill=255)                                            # type band + trait bar
        d.rounded_rectangle((40, 650, 704, 932), radius=10, fill=255)                         # text box
    else:
        d.rounded_rectangle((42, 118, 702, 578), radius=16, fill=255)                         # taller art window
        d.rectangle((30, 582, 714, 676), fill=255)                                            # type band + trait bar
        d.rounded_rectangle((44, 684, 700, 934), radius=10, fill=255)                         # text box
    d.rectangle((14, 986, 730, 1032), fill=255)                                               # footer line
    if set_no == 2:
        d.rectangle((148, 96, 660, 120), fill=255)  # room for a two-line name's "TACTIC" / "MONSTER" label
    # footer: only the card number + rarity letter are the card's own (placed by footer()); the mountain,
    # "Northern Summit Studios" and "Art: Jerian Latawiec" always come from the reference
    d.rectangle((14, 952, 730, 1036), fill=0)
    m = m.filter(ImageFilter.GaussianBlur(1.5))
    if set_no == 2:  # the Set 2 gateway always comes from the reference frame: cut out exactly its outline
        m = Image.fromarray(np.minimum(np.asarray(m), 255 - np.asarray(_gateway_mask())))
    else:            # the Set 1 shield crest likewise (owner 2026-10-16: identical bottom centre on every card)
        m = Image.fromarray(np.minimum(np.asarray(m), 255 - np.asarray(_crest_mask())))
    return m


_CREST = None


def _crest_mask():
    """The Set 1 shield crest on card 004 (x ~340-410, y ~880-962), grown 2 px."""
    global _CREST
    if _CREST is None:
        a = np.asarray(Image.open(os.path.join(TEMPLATES, "frame-ref-004-champion.png")).convert("RGB").resize((W, H))).astype(int)
        beige = (a.min(axis=2) > 150) & (a.max(axis=2) - a.min(axis=2) < 75)
        g = np.zeros((H, W), bool)
        g[870:935, 335:415] = ~beige[870:935, 335:415]   # the crest's part above the bar (below is frame anyway)
        _CREST = Image.fromarray((g * 255).astype("uint8")).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.0))
    return _CREST


_FOOT = None


def footer(card, ref_card):
    """Lay this card's own number + rarity letter (footer x 14-200) onto the reference footer, on the same baseline."""
    w, h = card.size
    c = np.asarray(card.resize((W, H), Image.LANCZOS)).astype(float)
    r = np.asarray(ref_card.resize((W, H), Image.LANCZOS)).astype(float)
    y0, y1, x0, x1 = 984, 1034, 16, 214
    def _al(x):
        reg = x[y0:y1, x0:x1]
        return np.clip((reg.min(axis=2) - 110) / 70.0, 0, 1) * ((reg.max(axis=2) - reg.min(axis=2)) < 60)
    out = r.copy()
    # blank the reference's own number: the plain footer strip between its letter and the studio name, repeated
    for x in range(x0, x1):
        out[y0:y1, x] = r[y0:y1, 168 + (x - x0) % 60]
    ca, ra = _al(c), _al(r)
    cy, ry = np.where(ca.max(axis=1) > 0.4)[0], np.where(ra.max(axis=1) > 0.4)[0]
    dy = int(round((ry.min() + ry.max()) / 2 - (cy.min() + cy.max()) / 2)) if len(cy) and len(ry) else 0
    dy = max(-6, min(6, dy))
    src = np.roll(c[y0:y1, x0:x1], dy, axis=0)
    al = np.roll(ca, dy, axis=0)[..., None]
    out[y0:y1, x0:x1] = out[y0:y1, x0:x1] * (1 - al) + src * al
    res = c.copy()
    res[y0:y1, :] = out[y0:y1, :]
    return Image.fromarray(np.clip(res, 0, 255).astype("uint8")).resize((w, h), Image.LANCZOS)


_GATE = None


def _gateway_mask():
    """The gateway arch + steps on the Set 2 reference (non-parchment pixels around x 300-444, y 850-990), grown 3 px."""
    global _GATE
    if _GATE is None:
        a = np.asarray(Image.open(os.path.join(TEMPLATES, "frame-ref-set2-champion.png")).convert("RGB").resize((W, H))).astype(int)
        # parchment = light and only mildly tinted; the arch's gold rim is saturated, so it counts as gateway
        beige = (a.min(axis=2) > 150) & (a.max(axis=2) - a.min(axis=2) < 75)
        g = np.zeros((H, W), bool)
        g[820:990, 310:434] = ~beige[820:990, 310:434]
        # keep only the connected blob that holds the keyhole (drops stray text / divider pixels of the reference)
        seed = np.zeros_like(g)
        seed[905:925, 365:380] = True
        seed &= g
        for _ in range(300):
            nxt = (np.asarray(Image.fromarray((seed * 255).astype("uint8")).filter(ImageFilter.MaxFilter(3))) > 0) & g
            if (nxt == seed).all():
                break
            seed = nxt
        g = seed
        _GATE = Image.fromarray((g * 255).astype("uint8")).filter(ImageFilter.MaxFilter(13)).filter(ImageFilter.GaussianBlur(1.2))
    return _GATE


def reference(kind, size, set_no=1):
    """Card 004's frame; for spells and Edicts its lower part (below the art) comes from First Light, which has no shields."""
    if set_no == 2:  # Set 1's frame with the Set 2 gateway (owner rule 2026-10-16: Set 2 uses the Set 1 frame)
        name = "frame-ref-set2-champion.png" if kind == "champion" else "frame-ref-set2-spell.png"
        return Image.open(os.path.join(TEMPLATES, name)).convert("RGB").resize(size, Image.LANCZOS)
    ref = Image.open(os.path.join(TEMPLATES, "frame-ref-004-champion.png")).convert("RGB").resize((W, H), Image.LANCZOS)
    if kind != "champion":
        low = Image.open(os.path.join(TEMPLATES, "frame-ref-170-spell.png")).convert("RGB").resize((W, H), Image.LANCZOS)
        g = np.clip((np.arange(H) - 560) / 20.0, 0, 1)[:, None, None]
        ref = Image.fromarray((np.asarray(ref) * (1 - g) + np.asarray(low) * g).astype("uint8"))
    return ref.resize(size, Image.LANCZOS)


def unify(card, kind="champion", ref=None, set_no=1):
    """card at any size; returns the same size."""
    card = card.convert("RGB")
    ref = ref or reference(kind, card.size, set_no)
    m = np.asarray(holes(kind, set_no).resize(card.size, Image.LANCZOS)).astype(float)[..., None] / 255
    out = np.asarray(ref).astype(float) * (1 - m) + np.asarray(card).astype(float) * m
    return footer(card, Image.fromarray(out.astype("uint8")))


# One clean green cost gem per number (owner 2026-10-16: "the gems that are green are all green, no black specs").
# Frozen crops (170 x 140 at card size 744 x 1039) of the cleanest gem for each cost; every ★ champion, Tactic, Scheme and
# Edict gets the one for its cost. Gold Ascend gems (★★/★★★) are left as they are.
def _costs():
    import csv
    out = {}
    path = os.path.join(TEMPLATES, "..", "master-card-list-set1.csv")
    for r in csv.DictReader(open(path, encoding="utf-8-sig")):
        c = r["Cost (↑ = Ascend cost)"]
        if r["No."].startswith("S1-") and c.isdigit() and r["Star form"] in ("★", ""):
            out[int(r["No."][3:])] = c
    return out


_COST = None


def green_gem(card, number):
    """Paste the master green gem for this card's cost (card at any size); cards without a green gem are unchanged."""
    global _COST
    _COST = _COST if _COST is not None else _costs()
    cost = _COST.get(int(number))
    path = os.path.join(TEMPLATES, f"gem-green-{cost}.png")
    if cost is None or not os.path.exists(path):
        return card
    sx, sy = card.width / W, card.height / H
    gem = Image.open(path).convert("RGB")
    gem = gem.resize((round(gem.width * sx), round(gem.height * sy)), Image.LANCZOS)
    m = Image.new("L", (W, H), 0)
    ImageDraw.Draw(m).polygon([(14, 66), (45, 6), (121, 6), (152, 66), (121, 128), (45, 128)], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(1.5)).resize(card.size, Image.LANCZOS).crop((0, 0, gem.width, gem.height))
    out = card.copy()
    out.paste(gem, (0, 0), m)
    return out


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
