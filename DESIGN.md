# EZAdd design

EZAdd adds up a basket before you reach the till. It has four themes, and the person picks one in Settings. `PRODUCT.md` says who it is for; `MOTION.md` says how anything may move. This file says what the themes are and how they are built.

EZAdd is a OneLine Labs product with its own look. It does not use OneLine purple or the Family Funds colours. It borrows their structure: one set of token names, a contrast rule, and the OneLine credit.

## The mark

A soft plus in the accent colour with a plus cut into it (`src/components/Mark.vue`). It is the app icon and the favicon in every theme. Each theme may also draw its own small badge in its header (a receipt, a sale burst, a key), but the mark is the logo. Icons are drawn from it by `node scripts/icons.mjs`.

## The four themes

| Theme | `data-look` | The idea | Type | Default accent |
|---|---|---|---|---|
| One accent (default) | `accent` | Black, white and one colour. Soft shapes that squish under the thumb | Bricolage Grotesque | blue, hue 265 |
| Till roll | `till` | The whole screen is one receipt, printed by a till | Martian Mono, Instrument Serif for the sign-off | till red, hue 30 |
| Price sticker | `sticker` | Sale tags and fat numerals. Every item is a sticker | Lilita One, Nunito | sale red, hue 25 |
| Pocket calculator | `calc` | A device with its own keys and screen, so the phone keyboard never opens | Space Grotesk, Doto on the screen | orange, hue 48 |

Each theme has a light and a dark mode. The mode follows the device unless the person chooses one.

## How a theme is built

- `src/themes/<Name>.vue` is the screen: header, items, total, split. It holds the theme's own layout and motion and nothing else. Everything it does goes through `useScreen()`.
- `src/styles/tokens.css` holds the values. The root element carries `data-look`, `data-mode` and `--hue`.
- The sheets (settings, taxes and fees, currency, share), the toasts, the flags, the scrollbar and the OneLine credit are built once in `src/components/` and `src/styles/sheets.css`. They read only the contract below, so they take on each theme without knowing which one is on.

### The contract

Every theme sets these, and shared parts read nothing else:

| Names | For |
|---|---|
| `--bg` `--surface` `--well` `--ink` `--soft` `--line` | grounds, text, hairlines |
| `--acc` `--on-acc` `--acc-edge` `--acc-soft` | the accent and what sits on it |
| `--radius` `--radius-sm` `--bw` `--lift` | corners, border width, the shadow of a raised thing |
| `--font-display` `--font-text` `--caps` `--track` | type |

A theme may add names of its own after those (`--lcd`, `--yellow`, `--case`). Only its own screen reads them.

### The accent

The person chooses a hue per theme with one slider. The theme fixes the lightness and strength in `oklch`, so text on the accent stays readable at every hue:

- `accent` and `calc` use a light accent with dark text on it.
- `till` and `sticker` use a deep accent with white text on it (in dark mode `till` flips to a light accent with dark text).

Never write a literal accent colour in a component. Use `--acc` and `--on-acc`. Text is never set in `--acc` on `--bg` at small sizes, apart from `till`'s sign-off line, which is large.

### Totals always fit

The total sets `--chars` to its length, and its size is worked out from the width of its own box, so a long amount in any currency shrinks to fit and never clips.

## Shared parts

- **Flags.** From `country-flag-icons` (MIT), copied to `public/flags` at build. A currency's flag is the first two letters of its code. Each theme frames it: a coin, a one-ink print, a little sticker, a badge.
- **Scrollbar.** One per theme: an accent pill, a perforated strip, a fat yellow sticker, a knurled wheel. iOS draws its own.
- **The OneLine credit.** "With ♥ from OneLine", from studio-kit, at the end of the list in every theme. It takes the theme's text colour and type, the OneLine mark stays in its own shape.
- **Sheets.** From the bottom on a phone, centred on a wide screen. Focus stays inside and returns to what opened it. Escape closes.

## Motion

`MOTION.md` rules apply. These are the named exceptions for this brand, each a theme's signature and each switched off by reduced motion:

- `accent`: bounce. Items land soft, the total's shape changes, buttons squish.
- `sticker`: bounce. A sticker is slapped on tilted and settles, and the tag jumps when the total changes.
- `till`: no bounce. The slip feeds out when the app opens and a new line slides down from the one above. Stepped motion was tried and read as jerky, so it eases.
- `calc`: keys travel down 4px, with a short vibration where the phone allows.
- Rolling digits on the total in `accent` and `sticker`.

Shared motion, the same in every theme:

- When the app opens, its items arrive one after another (the `is-fresh` class on the root, for about a second). After that, and on a change of theme, things arrive at once.
- Changing theme or mode opens the new look out from the button that was pressed (View Transitions, where the browser has them).
- A sheet rises from the bottom, with a soft overshoot in `accent` and `sticker`.
- One thing moves at a time. Do not stack a stagger on a reveal, or start an animation that its own class removal will cut short.
- Every theme's typefaces are fetched while the app is idle, so changing theme never swaps a face mid-move.
- A changed quantity gives a small jump (`.bump`), an added tax pops in, and the total answers when it is copied.
- The undo bar shows how long it will stay.

## Keyboard

- **Phone.** While a price is being typed, a bar sits on top of the keyboard with the total, the quantity and **Next** (`KeyBar.vue`). The iOS number pad has no return key, so this is how a new line starts without leaving the keys. It appears once the keyboard has finished rising. Settings has the other choice, "Full, with return": the phone's own keyboard on its number page (`type=number`), with no bar. The calculator theme has its own keys and shows neither.
- **Desk.** Each shortcut is printed on the button it presses (`Kbd.vue`), and only where there is a mouse and a keyboard. The full list is in Settings.

## Always

- 44px touch targets, or a 44px hit area around a smaller shape.
- Removing anything offers Undo.
- Amounts come from `src/lib/money.ts` and `src/lib/currency.ts`. Never format money in a component.
- Check a change in all four themes, light and dark, at 390 and 1440 wide: `?demo&look=till&theme=dark` opens any of them with a sample basket and saves nothing.

## Never

- A fifth set of sheets. New themes fill the contract.
- OneLine purple, or the Family Funds green and butter.
- A real brand's receipt, price tag, calculator or console. The themes are kinds of object, not copies of one.

## Adding a theme

1. Read the reference library first and name what you drew on (ONE-144).
2. Add the look to `Look` and `HUES` in `src/composables/useBasket.ts`.
3. Add its block, dark block, scrollbar, flag and credit lines to `tokens.css`.
4. Add `src/themes/<Name>.vue` and register it in `src/App.vue` and the theme list in `SettingsSheet.vue`.
5. Write its motion exception here if it has one.

More theme ideas are parked in LAB-75.
