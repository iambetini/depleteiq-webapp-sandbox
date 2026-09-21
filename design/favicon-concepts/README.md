# Orbit favicon concepts

Three favicon directions for Orbit Distribution, built on the existing brand
orange (`#ff6600`, rendered here as a subtle `#ff7a1f → #f25c00` vertical
gradient) and the white striped-globe mark from `images/orbit-logo.png`.

These are proposals only — nothing in `public/` has been replaced.

| Concept | Idea | Notes |
| --- | --- | --- |
| `01-orbit-sphere` | The logo's striped globe, simplified to three fat latitude bands | Closest to today's brand; stripes soften at 16px |
| `02-orbit-monogram` | An "O" drawn as an orbit arc, with a satellite sitting in the gap | Strongest silhouette at 16px; reads as both O and orbit |
| `03-distribution-node` | Hub-and-spoke node — a distribution network in three links | Most literal to "distribution"; very legible small |

Each folder ships the source SVG plus PNGs at 512, 192, 180, 128, 64, 32 and 16px.
`preview.png` shows all three at 128/64/32/16 on light and dark backgrounds.

## Regenerating

```bash
pip install pillow cairosvg
python3 design/favicon-concepts/generate.py
```

## Adopting one

Copy the chosen concept's PNGs over the names `app/layout.tsx` already
references, then rebuild `favicon.ico` from the 32px file:

```
favicon-32x32.png, favicon-16x16.png,
apple-touch-icon.png            (from favicon-180x180.png)
android-chrome-192x192.png      (from favicon-192x192.png)
android-chrome-512x512.png      (from favicon-512x512.png)
```
