# EZAdd

Add up a basket before you reach the till. Live at [ezadd.oneline.software](https://ezadd.oneline.software).

- Prices, names and quantities, with a running total that is always on screen
- Taxes and fees: presets by country, US state and Canadian province, tips, and your own saved ones
- Any currency, with the right number of decimals
- Split between people, to the cent
- Four themes, each with its own accent colour, in light and dark
- The basket is saved on the device, and anything removed can be undone
- Share a basket as text or as a link
- Works offline, installs as an app
- Keyboard shortcuts on a desk (listed in Settings)

## How it is built

Vue 3, TypeScript, Vite, vite-plugin-pwa, Cloudflare Pages. Tailwind v4 is used for its base styles only; the look is plain CSS on tokens.

| Where | What |
|---|---|
| `src/lib/` | Money in whole minor units, currencies, tax presets, region guess. Tested with `npm test` |
| `src/composables/` | `useBasket` (state, saving, undo), `useScreen` (what every theme shares), `useShortcuts` |
| `src/themes/` | One screen per theme |
| `src/components/` | The shared sheets, toasts, flags, mark and OneLine credit |
| `src/styles/tokens.css` | Every theme's values |
| `functions/` | The feedback and feature-request endpoints |

`DESIGN.md` describes the themes and how to add one, `PRODUCT.md` who the app is for, `MOTION.md` how it may move.

`?demo` opens a sample basket and saves nothing. Add `&look=accent|till|sticker|calc`, `&theme=light|dark` and `&currency=EUR` to see any combination.

Tax presets carry the date they were checked in `src/lib/taxPresets.ts`. The United States, Canada and Europe were checked against a source; other countries have not been yet.

