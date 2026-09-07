#!/usr/bin/env python3
"""Alex's tpl-*.html → content/**/*.mdx for the Claims 24/7 site (one-off; the MDX is now the source).

    python3 scripts/alex-to-mdx.py <folder of tpl-*.html>
"""
import re, json, glob, os, sys, html
from html.parser import HTMLParser

SRC = sys.argv[1] if len(sys.argv) > 1 else 'design/alex-seo-pages'  # the folder of Alex's tpl-*.html files
REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

# slug → (mdx path, template, highlight)
MANIFEST = {
 '/accident-management-vs-insurance/': ('content/comparison/accident-management-vs-insurance.mdx','comparison','Accident management'),
 '/will-a-non-fault-accident-affect-my-insurance/': ('content/resource-hub/will-a-non-fault-accident-affect-my-insurance.mdx','article','non-fault'),
 '/advice/dash-cam-non-fault-accident/': ('content/resource-hub-advice/advice/dash-cam-non-fault-accident.mdx','article','Dash cams'),
 '/do-i-have-to-pay-excess-if-not-my-fault/': ('content/resource-hub/do-i-have-to-pay-excess-if-not-my-fault.mdx','article','my excess'),
 '/vehicle-replacement/will-i-get-a-like-for-like-replacement/': ('content/accident-management-services/vehicle-replacement/will-i-get-a-like-for-like-replacement.mdx','article','like-for-like'),
 '/what-to-do-after-a-car-accident/minor-car-accident/': ('content/resource-hub/what-to-do-after-a-car-accident/minor-car-accident.mdx','article','Minor car'),
 '/had-accident/should-i-settle-privately/': ('content/resource-hub/had-accident/should-i-settle-privately.mdx','article','privately?'),
 '/advice/what-to-do-if-hit-by-uninsured-driver/': ('content/resource-hub-advice/advice/what-to-do-if-hit-by-uninsured-driver.mdx','article','uninsured driver'),
 '/what-to-do-after-a-car-accident/what-details-to-exchange/': ('content/resource-hub/what-to-do-after-a-car-accident/what-details-to-exchange.mdx','article','What details'),
 '/how-to-prove-fault/car-accident-reversing/': ('content/resource-hub/how-to-prove-fault/car-accident-reversing.mdx','article','reversing'),
 '/how-to-prove-fault/car-park-accidents/': ('content/articles/car-park-accidents.mdx','article','at fault?'),
 '/how-to-prove-fault/car-park-accidents/parked-car/': ('content/resource-hub/how-to-prove-fault/car-park-accidents/parked-car.mdx','article','parked car'),
 '/how-to-prove-fault/rear-end-collision/': ('content/articles/rear-end-collision.mdx','article','at fault?'),
 '/how-to-prove-fault/side-impact-collision/': ('content/articles/side-impact-collision.mdx','article','at fault?'),
 '/car-written-off-not-my-fault/': ('content/non-fault-accident/car-written-off-not-my-fault.mdx','pillar','written off'),
 '/credit-hire/': ('content/pillars/credit-hire.mdx','pillar','Credit hire'),
 '/how-accident-management-works/': ('content/process/how-accident-management-works.mdx','process','accident management'),
 '/accident-management-services-london/': ('content/locations/accident-management-services-london.mdx','location','London'),
 '/non-fault-accident-courtesy-car/': ('content/pillars/non-fault-accident-courtesy-car.mdx','pillar','courtesy car'),
 '/non-fault-accident/': ('content/pillars/non-fault-accident.mdx','pillar','Non-fault'),
 '/third-party-insurance-claim/': ('content/pillars/third-party-insurance-claim.mdx','pillar','Third party'),
 '/what-to-do-after-a-car-accident/': ('content/guides/what-to-do-after-a-car-accident.mdx','guide','car accident'),
}

# Links Alex's export flattened to "Title ." inside callouts.
LINK_FIX = {
 'What to do after a car accident': '/what-to-do-after-a-car-accident/',
 'How a third party insurance claim works': '/third-party-insurance-claim/',
 'How accident management works': '/how-accident-management-works/',
 'How credit hire works': '/credit-hire/',
 'How liability is assessed': '/assessing-liability/',
 'How to prove fault': '/how-to-prove-fault/',
 'Dash cams and non-fault accidents': '/advice/dash-cam-non-fault-accident/',
 'Someone hit my parked car': '/how-to-prove-fault/car-park-accidents/parked-car/',
 'The full comparison': '/accident-management-vs-insurance/',
 'The full guide to what to do after a car accident': '/what-to-do-after-a-car-accident/',
 'What details to exchange': '/what-to-do-after-a-car-accident/what-details-to-exchange/',
 'Non-fault accident: what to do and who pays': '/non-fault-accident/',
 'What to do if hit by an uninsured driver': '/advice/what-to-do-if-hit-by-uninsured-driver/',
}
# List items whose link text Alex's export flattened ("You were hit from behind: rear-end collisions").
INLINE_LINKS = {
 'rear-end collisions': '/how-to-prove-fault/rear-end-collision/',
 'someone hit my parked car': '/how-to-prove-fault/car-park-accidents/parked-car/',
 'side-impact collisions': '/how-to-prove-fault/side-impact-collision/',
}

# Copy-lint fixes (no timing promises, no exclamation marks): the facts stand, the phrasing moves.
REWRITES = {
 'the process can complete in a matter of weeks. Where fault is disputed': 'the process is usually shorter. Where fault is disputed',
 'makes a personal injury claim weeks after you settled': 'makes a personal injury claim long after you settled',
 'Call us! MIB claims have specific requirements': 'Call us. MIB claims have specific requirements',
}

def clean(s):
    s = html.unescape(s)
    for a, b in REWRITES.items(): s = s.replace(a, b)
    s = s.replace(' -- ', ' — ').replace('--', '—')
    s = re.sub(r"(\w)'(\w)", r"\1’\2", s)          # driver's → driver’s
    s = re.sub(r"'(\w)", r"‘\1", s)
    s = s.replace('Motor Claims Department Ltd', 'MCD_LTD')
    s = re.sub(r'\bMotor Claims Department\b', 'Claims 24/7', s)
    s = re.sub(r"\bMCD’s\b", 'Claims 24/7’s', s)
    s = re.sub(r'\bMCD\b', 'Claims 24/7', s)
    s = s.replace('MCD_LTD', 'Motor Claims Department Ltd')
    s = re.sub(r'[ \t]+', ' ', s)
    return s.strip()

def rel(href):
    href = re.sub(r'^https://motorclaimsdepartment\.co\.uk', '', href)
    return href or '/'

class Node:
    def __init__(self, tag, attrs):
        self.tag = tag; self.attrs = dict(attrs); self.children = []
    def cls(self): return self.attrs.get('class', '')
    def text(self):
        return ''.join(c if isinstance(c, str) else c.text() for c in self.children)

class Tree(HTMLParser):
    VOID = {'br','img','path','line','circle','rect','polygon','use','meta','link'}
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node('root', []); self.stack = [self.root]
    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs); self.stack[-1].children.append(n)
        if tag not in self.VOID: self.stack.append(n)
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]; break
    def handle_data(self, data):
        self.stack[-1].children.append(data)

def find(node, pred):
    out = []
    def walk(n):
        if isinstance(n, str): return
        if pred(n): out.append(n)
        for c in n.children: walk(c)
    walk(node); return out

def first(node, pred):
    r = find(node, pred); return r[0] if r else None

def inline(node):
    """Inline HTML → markdown."""
    parts = []
    for c in node.children:
        if isinstance(c, str): parts.append(c)
        elif c.tag == 'a': parts.append(f'[{inline(c)}]({rel(c.attrs.get("href",""))})')
        elif c.tag in ('strong','b'): parts.append(f'**{inline(c)}**')
        elif c.tag == 'em': parts.append(inline(c))
        elif c.tag == 'span' and 'muted' in c.cls(): parts.append(f'<Muted>{inline(c)}</Muted>')
        elif c.tag == 'br': parts.append('\n')
        elif c.tag == 'svg': pass
        else: parts.append(inline(c))
    return ''.join(parts)

def relink(m):
    parts = m.group(1).split(' · ')
    if not all(p in LINK_FIX for p in parts): return m.group(0)
    return ' · '.join(f'[{p}]({LINK_FIX[p]})' for p in parts) + '.'

def md_text(s):
    s = clean(s)
    s = re.sub(r'((?:[A-Z][^.\n\[\]()]*?)(?: · [A-Z][^.\n\[\]()]*?)*) \.', relink, s)
    for text, href in INLINE_LINKS.items():
        s = re.sub(rf'(?<!\[)\b{re.escape(text)}\b(?!\])', f'[{text}]({href})', s)
    return s

def block(node, out, notes):
    for c in node.children:
        if isinstance(c, str):
            if c.strip(): out.append(md_text(c))
            continue
        t, k = c.tag, c.cls()
        if t == 'h2' and c.attrs.get('id') == 'faq': pass   # the template renders the FAQ heading itself
        elif t == 'h2': out.append('## ' + md_text(inline(c)))
        elif t == 'h3': out.append('### ' + md_text(inline(c)))
        elif t == 'p' and 'muted' in k: out.append(f'<Muted>{md_text(inline(c))}</Muted>')
        elif t == 'p': out.append(md_text(inline(c)))
        elif t in ('ul','ol'):
            items = [md_text(inline(li)) for li in c.children if not isinstance(li,str) and li.tag=='li']
            out.append('\n'.join((f'{i+1}. ' if t=='ol' else '- ') + it for i, it in enumerate(items)))
        elif t == 'div' and 'callout' in k:
            lead = first(c, lambda n: n.tag=='b')
            lead_t = md_text(inline(lead)) if lead else ''
            body = Node('x', []); body.children = [x for x in c.children if x is not lead]
            body_t = md_text(inline(body))
            if lead_t.startswith('The catch'):
                out.append('<Callout variant="catch" />')   # the one wording for the catch (appendix §11)
                notes.append('catch callout → canonical wording')
            else:
                out.append(f'<Callout lead="{lead_t}">{body_t}</Callout>')
        elif t == 'div' and 'steps' in k:
            items = []
            for st in [x for x in c.children if not isinstance(x,str) and 'step' in x.cls()]:
                title = md_text(first(st, lambda n: n.tag=='b').text())
                body = md_text(first(st, lambda n: n.tag=='p').text())
                if title.startswith('1.'):
                    body = re.split(r'\s(?=2\.\s)', body)[0]   # Alex's export repeats every step inside step 1
                items.append({'title': title, 'body': body})
            out.append(f'<Steps items={{{json.dumps(items, ensure_ascii=False)}}} />')
        elif t == 'div' and k == 'tu':
            head = [md_text(h.text()) for h in first(c, lambda n: 'tu-head' in n.cls()).children if not isinstance(h,str)]
            rows = []; variant = 'them-us'
            for r in [x for x in c.children if not isinstance(x,str) and 'tu-row' in x.cls()]:
                cells = [x for x in r.children if not isinstance(x,str)]
                if all('us' in x.cls() for x in cells): variant = 'you-we'
                rows.append({'them': md_text(cells[0].children[-1].text()), 'us': md_text(cells[1].children[-1].text())})
            v = ' variant="you-we"' if variant == 'you-we' else ''
            out.append(f'<ThemUs head={{{json.dumps(head, ensure_ascii=False)}}} rows={{{json.dumps(rows, ensure_ascii=False)}}}{v} />')
        elif t == 'figure':
            notes.append('figure dropped: ' + clean(c.text())[:80])
        elif t == 'div' and 'cta-row' in k: pass
        elif t == 'div' and 'faq' in k: pass
        else: block(c, out, notes)

def convert(path):
    raw = open(path).read()
    tree = Tree(); tree.feed(raw); root = tree.root
    canon = re.search(r"<link href=\"([^\"]+)\" rel=\"canonical\"", raw).group(1)
    slug = rel(canon)
    mdx_path, template, highlight = MANIFEST[slug]
    title = clean(first(root, lambda n: n.tag=='title').text())
    title = re.sub(r'\s*\|\s*(MCD|Claims 24/7)$', ' | Claims 24/7', title)
    meta = re.search(r'<meta[^>]*name="description"[^>]*>', raw).group(0)
    desc = clean(re.search(r'content="([^"]*)"', meta).group(1))
    h1 = clean(first(root, lambda n: n.tag=='h1').text())
    kicker_n = first(root, lambda n: 'kicker' in n.cls()); kicker = clean(kicker_n.text()) if kicker_n else ''
    lead_n = first(root, lambda n: 'lead' in n.cls()); lead = clean(lead_n.text()) if lead_n else ''
    assert highlight in h1, (slug, h1, highlight)
    crumbs = []
    for li in find(first(root, lambda n: 'crumbs' in n.cls()), lambda n: n.tag=='li')[:-1]:
        a = first(li, lambda n: n.tag=='a')
        label = clean(li.text())
        if label == 'Home': continue
        crumbs.append({'href': rel(a.attrs['href']) if a else '', 'label': label})
    keeps = bool(first(root, lambda n: n.tag=='section' and 'keeps' in n.cls()))
    prose = first(root, lambda n: 'prose' in n.cls())
    body, notes = [], []
    block(prose, body, notes)
    faq = []
    for d in find(prose, lambda n: n.tag=='details'):
        q = clean(first(d, lambda n: n.tag=='summary').text())
        a = ' '.join(md_text(inline(p)) for p in find(d, lambda n: n.tag=='p')) or md_text(inline(first(d, lambda n: 'a' == n.cls())))
        faq.append({'q': q, 'a': a})
    def y(s): return json.dumps(s, ensure_ascii=False)
    fm = ['---', f'slug: {y(slug)}', f'template: {y(template)}', f'title: {y(title)}', f'description: {y(desc)}']
    if kicker: fm.append(f'kicker: {y(kicker)}')
    fm += [f'h1: {y(h1)}', f'highlight: {y(highlight)}']
    if lead: fm.append(f'lead: {y(lead)}')
    fm.append('phase: 1')
    default_keeps = template in ('pillar','process','comparison','location')
    if keeps != default_keeps: fm.append(f'keeps: {"true" if keeps else "false"}')
    if crumbs:
        fm.append('breadcrumb:')
        for c in crumbs: fm += [f'  - href: {y(c["href"])}', f'    label: {y(c["label"])}']
    if faq:
        fm.append('faq:')
        for f in faq: fm += [f'  - q: {y(f["q"])}', f'    a: {y(f["a"])}']
    fm.append('---')
    text = '\n'.join(fm) + '\n\n' + '\n\n'.join(body) + '\n'
    return mdx_path, text, notes, slug

if __name__ == '__main__':
    written = []
    for f in sorted(glob.glob(f'{SRC}/*.html')):
        mdx_path, text, notes, slug = convert(f)
        full = os.path.join(REPO, mdx_path)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        open(full, 'w').write(text)
        written.append((slug, mdx_path, notes))
    for slug, p, notes in written:
        print(f'{slug:62s} → {p}' + (f'   [{"; ".join(notes)}]' if notes else ''))
