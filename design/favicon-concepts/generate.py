import cairosvg, os, math
from PIL import Image

OUT = "/home/user/depleteiq-webapp-sandbox/design/favicon-concepts"
os.makedirs(OUT, exist_ok=True)

ORANGE_A, ORANGE_B = "#ff7a1f", "#f25c00"   # subtle vertical gradient
WHITE = "#ffffff"

def shell(body, radius=28, bg=True):
    grad = f'''<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="{ORANGE_A}"/><stop offset="1" stop-color="{ORANGE_B}"/>
    </linearGradient></defs>'''
    back = f'<rect x="0" y="0" width="128" height="128" rx="{radius}" fill="url(#g)"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">{grad}{back}{body}</svg>'

# --- Concept 1: Striped orbit sphere (direct descendant of the logo mark) ---
stripes = "".join([
    '<path d="M 8,42 Q 64,26 120,42" />',
    '<path d="M 4,67 Q 64,52 124,67" />',
    '<path d="M 12,92 Q 64,78 116,92" />',
])
c1 = shell(f'''
  <defs><clipPath id="sphere"><circle cx="64" cy="64" r="44"/></clipPath></defs>
  <circle cx="64" cy="64" r="44" fill="{WHITE}"/>
  <g clip-path="url(#sphere)" transform="rotate(-18 64 64)"
     stroke="{ORANGE_B}" stroke-width="13" fill="none" stroke-linecap="round">{stripes}</g>
  <circle cx="64" cy="64" r="44" fill="none" stroke="{ORANGE_B}" stroke-width="3" opacity="0.25"/>
''')

# --- Concept 2: "O" monogram as an orbit arc with a satellite in the gap ---
R, GAP_C, GAP_HALF = 35.0, -45.0, 32.0
def pt(a, r=R):
    return 64 + r*math.cos(math.radians(a)), 64 + r*math.sin(math.radians(a))
ax, ay = pt(GAP_C + GAP_HALF)          # arc start, just past the gap
bx, by = pt(GAP_C - GAP_HALF + 360)    # arc end, the long way around
sx, sy = pt(GAP_C, 50)                 # satellite sits in the gap
c2 = shell(f'''
  <path d="M {ax:.2f},{ay:.2f} A {R},{R} 0 1 1 {bx:.2f},{by:.2f}"
        fill="none" stroke="{WHITE}" stroke-width="19" stroke-linecap="round"/>
  <circle cx="{sx:.2f}" cy="{sy:.2f}" r="13" fill="{WHITE}"/>
''')

# --- Concept 3: Distribution node — hub with three spokes ---
nodes = [(-90, 42), (30, 42), (150, 42)]
pts = [(64 + r*math.cos(math.radians(a)), 64 + r*math.sin(math.radians(a))) for a, r in nodes]
spokes = "".join(f'<line x1="64" y1="64" x2="{x:.1f}" y2="{y:.1f}"/>' for x, y in pts)
dots = "".join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="12"/>' for x, y in pts)
c3 = shell(f'''
  <g stroke="{WHITE}" stroke-width="9" stroke-linecap="round">{spokes}</g>
  <g fill="{WHITE}">{dots}<circle cx="64" cy="64" r="14"/></g>
''')

CONCEPTS = [("01-orbit-sphere", c1), ("02-orbit-monogram", c2), ("03-distribution-node", c3)]
SIZES = [512, 192, 180, 128, 64, 32, 16]

for name, svg in CONCEPTS:
    d = os.path.join(OUT, name); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, f"{name}.svg"), "w").write(svg)
    for s in SIZES:
        cairosvg.svg2png(bytestring=svg.encode(), write_to=os.path.join(d, f"favicon-{s}x{s}.png"),
                         output_width=s, output_height=s)

# --- Contact sheet preview: each concept at 128 / 64 / 32 / 16, light and dark rows ---
PAD, CELL = 28, 128
cols = [128, 64, 32, 16]
W = PAD + len(cols)*(CELL + PAD) + 120
H = PAD + len(CONCEPTS)*(CELL + PAD)
sheet = Image.new("RGB", (W, H*2 - PAD), "#f8f8f8")
for band, bgcol in enumerate(["#f8f8f8", "#1b1b1b"]):
    top = band*(H - PAD//2)
    sheet.paste(Image.new("RGB", (W, H), bgcol), (0, top))
    for r, (name, _) in enumerate(CONCEPTS):
        y = top + PAD + r*(CELL + PAD)
        for c, s in enumerate(cols):
            im = Image.open(os.path.join(OUT, name, f"favicon-{s}x{s}.png")).convert("RGBA")
            x = PAD + c*(CELL + PAD) + (CELL - s)//2
            sheet.paste(im, (x, y + (CELL - s)//2), im)
sheet.save(os.path.join(OUT, "preview.png"))
print("\n".join(sorted(os.listdir(OUT))))
