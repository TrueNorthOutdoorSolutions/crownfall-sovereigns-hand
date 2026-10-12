import csv, re, json, html, collections
R = "C:/Users/micha/Desktop/crownfall-sovereigns-hand/"
S = "C:/Users/micha/AppData/Local/Temp/claude/C--Users-micha-Desktop-CommandHQ/f359006e-ea88-4784-a964-34ce713748e9/scratchpad/"
ORDER = ['common', 'uncommon', 'elite', 'epic', 'mythic']
NAME = {'common': 'Common', 'uncommon': 'Uncommon', 'elite': 'Elite', 'epic': 'Epic', 'mythic': 'Mythic'}

def rows(path):
    return [r for r in csv.DictReader(open(path, encoding='utf-8-sig')) if re.fullmatch(r'S\d-\d{3}', r['No.'])]

def norm(x):
    x = (x or '').strip().lower()
    return x if x in ORDER else ''

# ---- Set 2 ----
new2 = rows(R + 'prototype-v0.2/master-card-list-set2.csv')
old2 = {r['Card ID']: r for r in rows(S + 'old2.csv')}
printed = set(json.load(open(R + 'prototype-v0.2/data/set2-printed.json', encoding='utf-8')).get('printed', {}) or [])
s2 = []
for r in new2:
    o = old2.get(r['Card ID'], {})
    text = ' · '.join(x for x in [r['Keywords'], (r['Ability name'] + '.') if r['Ability name'] else '', r['Rules text']] if x)
    otext = ' · '.join(x for x in [o.get('Keywords', ''), (o.get('Ability name', '') + '.') if o.get('Ability name') else '', o.get('Rules text', '')] if x)
    s2.append(dict(no=r['No.'][3:], oldno=o.get('No.', '')[3:], name=r['Card name'], star=r['Star form'], type=r['Card type'],
                   cost=r['Cost (↑ = Ascend cost)'], mg=f"{r['Might']}/{r['Guard']}" if r['Might'] else '',
                   rar=norm(r['Rarity']), orar=norm(o.get('Rarity')), text=text, changed=bool(o) and text != otext,
                   statchg=bool(o) and (r['Might'], r['Guard'], r['Cost (↑ = Ascend cost)']) != (o.get('Might'), o.get('Guard'), o.get('Cost (↑ = Ascend cost)')),
                   printed=r['No.'][3:] in {'001','002','003','004','005','006','007','008','009','010','011','012','013','014','015','016','017','018','019','020','021','022','023','024','025','026','027','028','029','030','031','033','118','251','252'},
                   new=not o))

# ---- Set 1 (digital rarity from printings.ts; old = printed tier letter) ----
ts = open(R + 'src/v02/content/printings.ts', encoding='utf-8').read()
dig = {m.group(1): m.group(2) for m in re.finditer(r'"no": "(\d{3})", "kind": "base", "rarity": "(\w+)"', ts)}
oldts = open(S + 'old_pr.ts', encoding='utf-8').read()
olddig = {m.group(1): m.group(2) for m in re.finditer(r'"no": "(\d{3})", "kind": "base", "rarity": "(\w+)"', oldts)}
s1 = []
for r in rows(R + 'prototype-v0.2/master-card-list-set1.csv'):
    n = r['No.'][3:]
    text = ' · '.join(x for x in [r['Keywords'], (r['Ability name'] + '.') if r['Ability name'] else '', r['Rules text']] if x)
    s1.append(dict(no=n, name=r['Card name'], star=r['Star form'], type=r['Card type'], cost=r['Cost (↑ = Ascend cost)'],
                   mg=f"{r['Might']}/{r['Guard']}" if r['Might'] else '', rar=dig.get(n, ''), orar=olddig.get(n, ''), text=text))

def table_by_star(cards):
    t = collections.defaultdict(collections.Counter)
    for c in cards:
        key = c['star'] if c['star'] else ('Spell' if 'Tactic' in c['type'] or 'Scheme' in c['type'] else c['type'])
        if key in ('Swift Tactic', 'Tactic', 'Scheme'): key = 'Spell'
        t[key][c['rar']] += 1
    keys = [k for k in ['★', '★★', '★★★', 'Spell', 'Relic', 'Edict', 'Monster', 'Guardian'] if k in t] + [k for k in t if k not in ['★', '★★', '★★★', 'Spell', 'Relic', 'Edict', 'Monster', 'Guardian']]
    h = '<table class="sum"><tr><th></th>' + ''.join(f'<th class="r-{r}">{NAME[r]}</th>' for r in ORDER) + '<th>Total</th></tr>'
    for k in keys:
        h += f'<tr><td><b>{html.escape(k)}</b></td>' + ''.join(f'<td>{t[k][r] or ""}</td>' for r in ORDER) + f'<td>{sum(t[k].values())}</td></tr>'
    tot = collections.Counter(c['rar'] for c in cards)
    h += '<tr class="tot"><td><b>All</b></td>' + ''.join(f'<td>{tot[r]}</td>' for r in ORDER) + f'<td>{len(cards)}</td></tr></table>'
    return h

def badge(r):
    return f'<span class="b r-{r}">{NAME.get(r, "?")}</span>' if r else ''

def card_rows(cards, set_no):
    out = []
    for r in ORDER:
        group = [c for c in cards if c['rar'] == r]
        out.append(f'<h3 class="r-{r}">{NAME[r]} <small>({len(group)})</small></h3><div class="list">')
        for c in group:
            moved = c['orar'] and c['orar'] != c['rar']
            tags = []
            if moved: tags.append(f'<span class="mv">was {NAME[c["orar"]]}</span>')
            if set_no == 2:
                if c.get('printed'): tags.append('<span class="pr">printed</span>')
                if c.get('new'): tags.append('<span class="nw">new card</span>')
                elif c.get('changed') or c.get('statchg'): tags.append('<span class="ch">text/stats changed</span>')
                if c.get('oldno') and c['oldno'] != c['no'] and not c.get('printed'): tags.append(f'<span class="nm">was #{c["oldno"]}</span>')
            line = f'{c["type"]}' + (f' · cost {c["cost"]}' if c['cost'] else '') + (f' · {c["mg"]}' if c['mg'] else '')
            out.append(f'<div class="c{" moved" if moved else ""}" data-s="{html.escape((c["name"] + " " + c["text"]).lower())}" data-moved="{1 if moved else 0}">'
                       f'<div class="h"><span class="no">{c["no"]}</span><b>{html.escape(c["name"])}</b> <span class="st">{c["star"]}</span> {" ".join(tags)}</div>'
                       f'<div class="m">{html.escape(line)}</div><div class="t">{html.escape(c["text"]) or "<i>no text</i>"}</div></div>')
        out.append('</div>')
    return '\n'.join(out)

moved1 = sum(1 for c in s1 if c['orar'] and c['orar'] != c['rar'])
moved2 = sum(1 for c in s2 if c['orar'] and c['orar'] != c['rar'])
doc = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sovereign's Hand Card List</title><style>
:root{{--bg:#fbf8f1;--fg:#1d1a16;--mut:#6b645a;--card:#fff;--line:#e4ddcf;--c:#7b7f86;--u:#2e8b57;--e:#2f6fd0;--p:#8a3fd1;--m:#d26a12}}
@media (prefers-color-scheme:dark){{:root{{--bg:#14121a;--fg:#ece6da;--mut:#a39b8d;--card:#1d1a25;--line:#33303d;--c:#a7abb2;--u:#5fd08f;--e:#6aa2ff;--p:#c08bff;--m:#ffa24c}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.45 system-ui,-apple-system,Segoe UI,sans-serif}}
main{{max-width:980px;margin:auto;padding:16px}} h1{{font-size:24px;margin:8px 0}} h2{{margin:28px 0 8px;font-size:21px;border-bottom:2px solid var(--line);padding-bottom:4px}}
h3{{margin:18px 0 6px;font-size:17px}} h3 small{{color:var(--mut);font-weight:400}}
.r-common{{color:var(--c)}}.r-uncommon{{color:var(--u)}}.r-elite{{color:var(--e)}}.r-epic{{color:var(--p)}}.r-mythic{{color:var(--m)}}
.sum{{border-collapse:collapse;width:100%;margin:8px 0;font-size:14px}} .sum td,.sum th{{border:1px solid var(--line);padding:5px 6px;text-align:center}} .sum td:first-child{{text-align:left}} .tot td{{font-weight:700}}
.bar{{position:sticky;top:0;background:var(--bg);padding:8px 0;display:flex;gap:8px;flex-wrap:wrap;z-index:2;border-bottom:1px solid var(--line)}}
.bar input{{flex:1;min-width:160px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg);font:inherit}}
.bar button{{padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg);font:inherit;cursor:pointer}} .bar button.on{{background:var(--fg);color:var(--bg)}}
.c{{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px 10px;margin:6px 0}} .c.moved{{border-left:4px solid var(--m)}}
.h{{display:flex;flex-wrap:wrap;gap:6px;align-items:baseline}} .no{{color:var(--mut);font-variant-numeric:tabular-nums;min-width:30px}} .st{{color:#c99a2e}}
.m{{color:var(--mut);font-size:13px}} .t{{font-size:14px;margin-top:2px}}
.mv,.pr,.nw,.ch,.nm{{font-size:11.5px;padding:1px 7px;border-radius:999px;border:1px solid var(--line)}} .mv{{border-color:var(--m);color:var(--m)}} .pr{{color:var(--e);border-color:var(--e)}} .nw{{color:var(--u);border-color:var(--u)}}
.note{{color:var(--mut);font-size:14px}} details{{margin:6px 0}} summary{{cursor:pointer;font-weight:600}}
</style></head><body><main>
<h1>Sovereign's Hand: every card by rarity</h1>
<p class="note">After the audit (12 Oct 2026). Cards with an orange edge changed rarity. Set 2 tags: <b>printed</b> = art already finished (locked), <b>text/stats changed</b>, <b>new card</b>, <b>was #</b> = renumbered. Everything new is PROPOSED for your approval.</p>
<div class="bar"><input id="q" placeholder="Search a name or ability…" aria-label="Search cards"><button id="mv" type="button">Only rarity changes</button></div>
<h2>Set 2 · Beneath the Arena <small class="note">(266 cards · {moved2} changed rarity)</small></h2>
{table_by_star(s2)}
{card_rows(s2, 2)}
<h2>Set 1 · The Shattered Crown <small class="note">(248 cards · {moved1} changed rarity in the game; printed footers repainted)</small></h2>
{table_by_star(s1)}
{card_rows(s1, 1)}
</main><script>
const q=document.getElementById('q'),mv=document.getElementById('mv');let only=false;
function f(){{const s=q.value.trim().toLowerCase();document.querySelectorAll('.c').forEach(c=>{{c.style.display=(!s||c.dataset.s.includes(s))&&(!only||c.dataset.moved==='1')?'':'none'}})}}
q.oninput=f;mv.onclick=()=>{{only=!only;mv.classList.toggle('on',only);f()}};
</script></body></html>'''
open(R + 'prototype-v0.2/CARD_LIST_BY_RARITY.html', 'w', encoding='utf-8').write(doc)
print(len(s1), len(s2), moved1, moved2)
for nm, cs in (('S2', s2), ('S1', s1)):
    t = collections.defaultdict(collections.Counter)
    for c in cs:
        if c['star']: t[c['star']][c['rar']] += 1
    print(nm, {k: dict(v) for k, v in t.items()})
