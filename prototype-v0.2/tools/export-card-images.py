"""
Export approved card art into the digital game.

Reads the single-card images in the art folder (the same ones the printables use) and writes:
  public/v02/cards/s<N>/<file>.webp       one image per printing, 600 px wide
  src/v02/content/printings.ts            generated list of every printing (base, tokens, Alternate Art,
                                          Masterwork, Omega) with its card id, number and image

Card ids come from prototype-v0.2/master-card-list-set<N>.csv; Alternate Art and Masterwork mappings from
card-art/ALT_ART_LIST.md and card-art/MASTERWORKS.md. Nothing here changes card text.

Usage: python prototype-v0.2/tools/export-card-images.py [set number, default 1]
       python prototype-v0.2/tools/export-card-images.py 1 --rarity-only   (re-apply rarity to printings.ts, no images)

Rarity: Set 1's printed footers follow champion tier, but its DIGITAL rarity (pack opener, collection) comes from
prototype-v0.2/data/set1-digital-rarity.json (rarity rubric, owner decision 2026-10-12), so a re-export never reverts it.
"""
import csv
import importlib.util
import json
import os
import re
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
spec = importlib.util.spec_from_file_location("bp", os.path.join(HERE, "build-printable.py"))
bp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bp)

WIDTH = 600
# Pack rarity (owner decision 2026-10-11): champion tier I-V = Common/Uncommon/Elite/Epic/Mythic.
# Spells: Common -> Common, Rare -> Uncommon, Epic -> Epic, Exalted -> Mythic; Edicts are Rare -> Uncommon.
TIER_RARITY = {"I": "common", "II": "uncommon", "III": "elite", "IV": "epic", "V": "mythic"}
SPELL_RARITY = {"": "common", "Common": "common", "Rare": "uncommon", "Epic": "epic", "Exalted": "mythic"}


def load_digital_rarity(set_no):
    """Per-card digital rarity overrides (data/set<N>-digital-rarity.json), or {} when the set has none."""
    path = os.path.join(ROOT, "prototype-v0.2", "data", f"set{set_no}-digital-rarity.json")
    return json.load(open(path, encoding="utf-8"))["rarity"] if os.path.exists(path) else {}


DIGITAL = {}


def rarity(row):
    if row["Card ID"] in DIGITAL:
        return DIGITAL[row["Card ID"]]
    if row.get("Rarity") in ("common", "uncommon", "elite", "epic", "mythic"):
        return row["Rarity"]  # Set 2+: every card carries its own rarity in the master list
    tier = row["Champion tier"]
    if tier:
        return TIER_RARITY[tier.split()[1]]
    if row["Card type"] == "Edict":
        return "uncommon"
    sub = row["Title / subtype"].split("·")[-1].strip() if "·" in row["Title / subtype"] else ""
    return SPELL_RARITY[sub]


def rarity_only(set_no):
    """Rewrite only the rarity field of every printing in printings.ts (no images needed)."""
    ts = os.path.join(ROOT, "src", "v02", "content", "printings.ts")
    out, changed = [], 0
    for line in open(ts, encoding="utf-8").read().split("\n"):
        m = re.match(r'^  (\{.*\}),$', line)
        if m:
            p = json.loads(m.group(1))
            if p["set"] == set_no and p["cardId"] in DIGITAL and p["rarity"] != DIGITAL[p["cardId"]]:
                p["rarity"] = DIGITAL[p["cardId"]]
                changed += 1
                line = f"  {json.dumps(p, ensure_ascii=False)},"
        out.append(line)
    open(ts, "w", encoding="utf-8", newline="\n").write("\n".join(out))
    print(f"Set {set_no}: rarity updated on {changed} printings -> {os.path.relpath(ts, ROOT)}")


def main():
    set_no = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    DIGITAL.update(load_digital_rarity(set_no))
    if "--rarity-only" in sys.argv:
        return rarity_only(set_no)
    set_dir = os.path.join(bp.ART, bp.SETS[set_no])
    rows = list(csv.DictReader(open(os.path.join(ROOT, "prototype-v0.2", f"master-card-list-set{set_no}.csv"), encoding="utf-8-sig")))
    by_no = {r["No."].split("-")[1]: r for r in rows}
    total = max(int(n) for n in by_no if n.isdigit())
    out_dir = os.path.join(ROOT, "public", "v02", "cards", f"s{set_no}")
    os.makedirs(out_dir, exist_ok=True)
    printings = []

    def export(src, name, card_id, no, kind, **extra):
        if not os.path.exists(src):
            print("MISSING", src)
            return
        im = Image.open(src).convert("RGB")
        im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
        im.save(os.path.join(out_dir, name + ".webp"), "WEBP", quality=76, method=6)
        row = next(r for r in rows if r["Card ID"] == card_id)
        printings.append({"id": f"S{set_no}-{no}", "cardId": card_id, "set": set_no, "no": no, "kind": kind, "rarity": rarity(row),
                          **({"flavour": row["Flavour text"]} if row["Flavour text"] else {}),
                          "img": f"v02/cards/s{set_no}/{name}.webp", **extra})

    singles = os.path.join(set_dir, "PRINTABLE CARDS", "Individual Cards")
    for n in sorted(k for k in by_no if k.isdigit()):
        export(os.path.join(singles, f"{n}.png"), n, by_no[n]["Card ID"], n, "base")

    extras = os.path.join(set_dir, "Inserts and Tokens")
    for n in sorted(k for k in by_no if k.startswith("T")):
        name = by_no[n]["Card name"]
        export(os.path.join(extras, f"{n} {name}.png"), n.lower(), by_no[n]["Card ID"], n, "token")

    # Reference inserts and the shared card back (not collectible printings, just images).
    for ref in ("A", "B"):
        src = os.path.join(extras, f"Reference {ref}.png")
        if os.path.exists(src):
            im = Image.open(src).convert("RGB")
            im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS).save(os.path.join(out_dir, f"reference-{ref.lower()}.webp"), "WEBP", quality=76, method=6)
    back = os.path.join(bp.ART, "00 Templates", "Card Back (LOCKED).png")
    if os.path.exists(back):
        im = Image.open(back).convert("RGB")
        im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS).save(os.path.join(ROOT, "public", "v02", "cards", "back.webp"), "WEBP", quality=76, method=6)

    alt_md = open(os.path.join(ROOT, "prototype-v0.2", "card-art", "ALT_ART_LIST.md"), encoding="utf-8").read()
    for alt, base in re.findall(r"^\| (\d{3})/\d+ \| (\d{3}) \|", alt_md, re.M):
        export(os.path.join(set_dir, "Alternate Art", f"{alt}.png"), alt, by_no[base]["Card ID"], alt, "alt", base=base)

    mw_md = open(os.path.join(ROOT, "prototype-v0.2", "card-art", "MASTERWORKS.md"), encoding="utf-8").read()
    for mw, base in re.findall(r"^\| (MW\d{2}) \| (\d{3}) ", mw_md, re.M):
        export(os.path.join(set_dir, "Masterworks", f"{mw}.png"), mw.lower(), by_no[base]["Card ID"], mw, "masterwork", base=base, serialOf=100)
    for om, base in re.findall(r"^\| (OM\d{2}) \| (\d{3}) ", mw_md, re.M):
        export(os.path.join(set_dir, "Omega Masterworks", f"{om}.png"), om.lower(), by_no[base]["Card ID"], om, "omega", base=base, serialOf=10)

    ts = os.path.join(ROOT, "src", "v02", "content", "printings.ts")
    lines = ["// GENERATED by prototype-v0.2/tools/export-card-images.py. Do not edit by hand.",
             "export type PrintingKind = 'base' | 'token' | 'alt' | 'masterwork' | 'omega';",
             "export type Rarity = 'common' | 'uncommon' | 'elite' | 'epic' | 'mythic';",
             "export interface Printing { id: string; cardId: string; set: number; no: string; kind: PrintingKind; rarity: Rarity; img: string; flavour?: string; base?: string; serialOf?: number }",
             f"export const SET{set_no}_TOTAL = {total};",
             f"export const SET{set_no}_PRINTINGS: Printing[] = ["]
    lines += [f"  {json.dumps(p, ensure_ascii=False)}," for p in printings]
    lines.append("];")
    open(ts, "w", encoding="utf-8", newline="\n").write("\n".join(lines) + "\n")
    kinds = {}
    for p in printings:
        kinds[p["kind"]] = kinds.get(p["kind"], 0) + 1
    print(f"Set {set_no}: {len(printings)} printings {kinds} -> {os.path.relpath(out_dir, ROOT)}")


if __name__ == "__main__":
    main()
