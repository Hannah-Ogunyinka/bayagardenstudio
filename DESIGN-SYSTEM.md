# Baya Garden Studio design system

Every page is built from one set of tokens, in the same structure as the PHSL system. The live reference is at **/design-system/** (run `npm run dev` and open http://localhost:4321/design-system/). It reads `tokens.css` directly, so it is always current, and shows each fluid value at your window size. It is `noindex` and left out of the sitemap.

## Files

| File | What it is |
|---|---|
| `design-system-source/tokens.template.css` | Hand-written tokens: palette, colour roles, type and space roles, layout, radii, shadows, motion, z-index. **Change colours and roles here.** |
| `design-system-source/generate.py` | Generates the fluid type and space scales, checks WCAG 1.4.4 (text must still grow with zoom), and writes the three files below. |
| `src/styles/tokens.css` | Generated. Do not edit. |
| `design-system-source/tokens.json` | Generated. Same tokens in W3C Design Tokens format for Figma or Tokens Studio. |
| `src/config/breakpoints.ts` | Generated. `MQ` media queries for image `sizes` and `<source media>`. |
| `src/styles/media.css` | Breakpoints as `@custom-media` (`--sm-down`, `--md-up`…), in em. Available in every component through PostCSS. |
| `src/styles/base.css` | Element styles and layout helpers: `.container`, `.section`, `.stack`, `.flow`, `.cluster`, `.auto-grid`, `.switcher`, `.sr-only`. |
| `scripts/check-tokens.mjs` | Fails if a component sets a raw colour, px, rem or media width of its own. Runs before every build. |

## Commands

```
npm run tokens         # regenerate tokens.css, tokens.json and breakpoints.ts
npm run check:tokens   # check every component uses tokens
npm run build          # runs check:tokens, then builds
```

## Three layers

1. **Primitives**: the palette (`--color-grey-800`) and generated steps (`--step-md`, `--space-md`).
2. **Roles**: what a value is for (`--color-surface`, `--text-body`, `--gutter`, `--inset-card`, `--radius-card`). Components use these.
3. **Components**: read roles only.

## Units

- `rem`: type, space, radii, widths. Follows the reader's text size.
- `clamp(rem, vw + rem, rem)`: fluid tokens, 320px to 1920px wide. Text always pairs vw with rem so zoom works.
- `em`: things that belong to their text (button padding, icon size, letter spacing, paragraph spacing).
- `ch`: line length. Unitless: line height.
- `px`: borders, focus rings and the 44px tap-target floor only.

## Exceptions

A one-off value copied from the live design (artwork positions, for example) can stay in a component if it is marked:

```css
top: 3rem; /* token-exempt: artwork position from the live theme */
```

## Accessibility rules built in

- The bright purple `--color-accent` (#9747ff) is only for text 24px and up, fills and borders. Small purple text uses `--color-accent-strong` on light backgrounds and `--color-accent-on-dark` on dark grey.
- Every interactive element gets the focus ring from `base.css`.
- Animations stop under `prefers-reduced-motion`.
- Form fields never go below 16px, so iOS does not zoom in.
