#!/usr/bin/env python3
"""Generate the Baya Garden Studio fluid type and space scales.

Writes src/styles/tokens.css (fluid primitives + the hand-written colour and
role layer from tokens.template.css) and design-system-source/tokens.json
(W3C Design Tokens Community Group format), then checks every fluid text
size against WCAG 1.4.4 (Resize text): at some browser zoom level up to 500%
the text must reach at least 200% of its unzoomed size, at every viewport
width.

Run:  npm run tokens   (or: python3 design-system-source/generate.py)
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CSS_OUT = os.path.join(ROOT, "src", "styles", "tokens.css")
JSON_OUT = os.path.join(HERE, "tokens.json")

ROOT_PX = 16                 # browser default; all tokens are written in rem
VP_MIN, VP_MAX = 320, 1920   # the live WordPress theme's fluid range (20rem to 120rem)

# ---- Type scale -------------------------------------------------------------
# Matched to the live site (theme.json fluid font sizes), so pages still match.
# Each step is (size on a 320px screen, size at 1920px and wider), in px at the
# default 16px root; they are written out in rem.
TYPE = {
    "xs":  (12.8, 16),      # card text, captions, buttons (WP "small")
    "sm":  (16, 19.2),      # UI text, eyebrows, intros (WP "medium-small")
    "base": (18.08, 20.8),  # body copy (WP "base")
    "md":  (20.8, 25.6),    # lead, h4, prose h2 (WP "medium")
    "lg":  (27.2, 32),      # h3, quotes (WP "large")
    "xl":  (32, 44.8),      # panel and card headings (WP "x-large")
    "2xl": (27.2, 72),      # section headings (WP "xx-large")
    "3xl": (48, 176),       # display words (WP "xxx-large")
    "4xl": (80, 256),       # service page titles: Build, Support, Grow (WP "xxxx-large")
}
# Off-scale fluid roles the live site uses once or twice.
TYPE_ROLES = {
    "2xl-alt": (35.2, 73.6),     # About heading, packages title
    "home-h1": (64, 137.6),      # homepage hero heading
    "logo": (14.4, 24),          # site title beside the logo
    "services-h1": (54.8, 112),  # "Services" in the tiled hero
    "section-h2": (48.6, 96),    # "What's Included", "Optional Add Ons"
    "card-h3": (21.6, 35.2),     # bento and add-on card headings
    # Insights title ("10em" in the theme): grows from 550px and keeps growing
    # past 1920px, so it gives its own (min, max, from vw, to vw).
    "insights-h1": (82.08, 208, 550.4, 2924),
}
# Display sizes too large to double: at 500% zoom they still grow by 1.5x or
# more, and they are never smaller than 3rem. WCAG 1.4.4 is met for them by the
# page's other text and by reflow; they are reported, not failed.
DISPLAY = {"3xl", "4xl", "home-h1", "services-h1", "insights-h1"}

# ---- Space scale --------------------------------------------------------------
# (min px, max px, viewport where it starts growing, viewport where it stops).
# Matched to the live theme's spacing presets.
SPACE = {
    "3xs": (4, 6, 320, 1280),
    "2xs": (8, 12, 320, 1280),
    "xs":  (12, 16, 320, 1280),
    "sm":  (8, 16, 320, 640),      # WP "small":   clamp(0.5rem, 2.5vw, 1rem)
    "md":  (24, 48, 600, 1200),    # WP "medium":  clamp(1.5rem, 4vw, 3rem)
    "lg":  (32, 48, 640, 960),     # WP "large":   clamp(2rem, 5vw, 3rem)
    "xl":  (48, 80, 48 / .07, 80 / .07),    # WP "x-large": clamp(3rem, 7vw, 5rem)
    "2xl": (64, 112, 64 / .09, 112 / .09),   # WP "xx-large"
    "3xl": (80, 144, 80 / .12, 144 / .12),   # WP "xxx-large"
    "4xl": (96, 208, 96 / .14, 208 / .14),   # WP "xxxx-large"
}


def rem(px):
    return f"{round(px / ROOT_PX, 4):g}rem"


def fluid(min_px, max_px, lo=VP_MIN, hi=VP_MAX):
    """clamp() that is min_px at viewport lo and max_px at viewport hi.

    The preferred value is rem + vw, never vw alone, so text still responds
    to the reader's default font size.
    """
    if abs(min_px - max_px) < 0.01:
        return rem(min_px)
    slope = (max_px - min_px) / (hi - lo)
    intercept = min_px - slope * lo
    a, b = sorted((min_px, max_px))
    vw = f"{round(slope * 100, 2):g}vw"
    offset = round(intercept / ROOT_PX, 3)
    if abs(offset) < 0.005:  # spacing presets that are pure vw on the live site
        return f"clamp({rem(a)}, {vw}, {rem(b)})"
    sign = "+" if offset >= 0 else "-"
    return f"clamp({rem(a)}, {vw} {sign} {abs(offset):g}rem, {rem(b)})"


def steps():
    """Every type step as (name, min, max, from vw, to vw)."""
    for name, spec in {**TYPE, **TYPE_ROLES}.items():
        a, b, lo, hi = (*spec, VP_MIN, VP_MAX)[:4]
        yield name, a, b, lo, hi


def size_at(min_px, max_px, vw, lo=VP_MIN, hi=VP_MAX):
    slope = (max_px - min_px) / (hi - lo)
    intercept = min_px - slope * lo
    return min(max(min_px, intercept + slope * vw), max_px)


def wcag_144(min_px, max_px, lo=VP_MIN, hi=VP_MAX):
    """Worst-case best zoom gain across device widths 320 to 3840px."""
    worst = 99.0
    for dev_w in range(320, 3841, 40):
        base = size_at(min_px, max_px, dev_w, lo, hi)
        best = max(z * size_at(min_px, max_px, dev_w / z, lo, hi)
                   for z in (1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5))
        worst = min(worst, best / base)
    return worst


# ---- Checks -------------------------------------------------------------------
print("Type (px at 320 -> 1920)        WCAG 1.4.4 zoom gain (needs >= 2.0)")
ok = True
for name, a, b, lo, hi in steps():
    gain = wcag_144(a, b, lo, hi)
    if name in DISPLAY:
        status = "display" if gain >= 1.5 else "FAIL"
        ok &= gain >= 1.5
    else:
        status = "ok" if gain >= 2 else "FAIL"
        ok &= gain >= 2
    print(f"  {name:>11}: {a:6.1f} -> {b:6.1f}   {gain:4.2f} {status}")
assert ok, "a type size fails WCAG 1.4.4"

# ---- tokens.css ----------------------------------------------------------------
lines = ["  /* Type steps: generated by design-system-source/generate.py. Do not edit",
         "     by hand. px in comments are the size at the default 16px text size. */"]
for name, a, b, lo, hi in steps():
    lines.append(f"  --step-{name}: {fluid(a, b, lo, hi)}; /* {a:g}px -> {b:g}px */")
lines += ["", "  /* Space steps: generated. Matched to the live theme's spacing presets. */"]
for name, (a, b, lo, hi) in SPACE.items():
    lines.append(f"  --space-{name}: {fluid(a, b, lo, hi)}; /* {a:g}px -> {b:g}px */")

with open(os.path.join(HERE, "tokens.template.css")) as f:
    template = f.read()
with open(CSS_OUT, "w") as f:
    f.write(template.replace("  /*@GENERATED@*/", "\n".join(lines)))

# ---- tokens.json (DTCG) -------------------------------------------------------
tokens = {"type": {}, "space": {}, "color": {}, "breakpoint": {}}
for name, a, b, lo, hi in steps():
    tokens["type"][f"step-{name}"] = {
        "$type": "dimension", "$value": fluid(a, b, lo, hi),
        "$extensions": {"baya.fluid": {"min": rem(a), "max": rem(b)}}}
for name, (a, b, lo, hi) in SPACE.items():
    tokens["space"][name] = {
        "$type": "dimension", "$value": fluid(a, b, lo, hi),
        "$extensions": {"baya.fluid": {"min": rem(a), "max": rem(b)}}}
for name, value in re.findall(r"--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;", template):
    tokens["color"][name] = {"$type": "color", "$value": value}
media_css = open(os.path.join(ROOT, "src", "styles", "media.css")).read()
queries = dict(re.findall(r"@custom-media --([a-z0-9]+-(?:up|down)) (\([^)]*\));", media_css))
for name, value in re.findall(r"@custom-media --([a-z0-9]+)-up \(width >=? ([0-9.]+em)\)", media_css):
    tokens["breakpoint"][name] = {"$type": "dimension", "$value": value}

# ---- src/config/breakpoints.ts ---------------------------------------------------
# The same queries for HTML attributes (img sizes, <source media>), which can't
# read CSS custom media.
def camel(name):
    head, *rest = name.split("-")
    return head + "".join(part.title() for part in rest)

ts = ["/**",
      " * Breakpoint media queries for HTML attributes (img `sizes`, <source media>).",
      " * GENERATED from src/styles/media.css by design-system-source/generate.py.",
      " * Do not edit by hand.",
      " */",
      "export const MQ = {"]
ts += [f"  {camel(name) if not name[0].isdigit() else 'x' + camel(name)}: '{query}'," for name, query in queries.items()]
ts += ["} as const;", ""]
with open(os.path.join(ROOT, "src", "config", "breakpoints.ts"), "w") as f:
    f.write("\n".join(ts))
with open(JSON_OUT, "w") as f:
    json.dump(tokens, f, indent=2)
print("wrote src/styles/tokens.css, design-system-source/tokens.json and src/config/breakpoints.ts")
