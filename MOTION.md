# Motion

The motion rules every site OneLine builds follows, for OneLine and for clients. Brand-neutral: nothing here names a colour, a typeface or a scene. The site's own `DESIGN.md` says what its signature is and where it is stricter than this file. A site may tighten any rule here. It may loosen one only with a line in the PR that says which rule and why.

Where these rules come from: the oneline-site motion lab and Zain's feedback on it (2026-11-12 and 2026-11-13), then generalised.

## Principles

1. **Motion is part of the brand, chosen per site.** Every site gets one signature: a moving idea taken from the client's own world (what they make, where they are, how their product behaves). It is picked in `design-pass` the same way a layout is: several directions, live, side by side.
2. **Content first.** Motion never crosses, covers or delays content. A scene lives in an empty box of its own. Text and screenshots are never a canvas.
3. **One loud thing, everything else quiet.** The signature carries the page. The rest is small: a fade, a draw-in, a marker that slides.
4. **No captions.** If a shape or an effect needs explaining, cut it.
5. **Complete at rest.** With motion off, with script off, and in a screenshot, the page shows everything and reads the same.
6. **Calm beats busy.** When a lab direction feels busy on scroll, tone it down before removing it: slower, fewer parts, fades in place of travel.

## Budget per page

| What | Limit |
|---|---|
| Orchestrated entrance | One, above the fold |
| Reveals below the fold | Each block once, on entering the viewport. Never replays |
| Scenes tied to scroll position (pinned) | Two at most |
| Loops | Three at most, each paused while off screen and while the tab is hidden |
| Theatre (a set piece longer than a second) | One, only on the visitor's own action, under three seconds |
| Scenes in one viewport | One |

Inner pages get less than the home page: one strip of the signature, not a scene per section.

## Timing and easing

Durations and curves are tokens (see `TOKENS.md`). Components never write a raw duration.

| Token | Use | Default | Range |
|---|---|---|---|
| `--dur-fast` | hover, press | 150ms | 100 to 200ms |
| `--dur-base` | UI state: menus, tabs, a marker moving | 240ms | 200 to 320ms |
| `--dur-reveal` | a block fading up | 900ms | 600 to 1200ms |
| `--dur-rise` | staged display type (letters, words or lines) | 1150ms | 800 to 1400ms |
| `--dur-page` | a page change (optional) | 500ms | 300 to 600ms |
| `--ease-out` | entering | `cubic-bezier(0.2, 0, 0, 1)` | |
| `--ease-in` | leaving | `cubic-bezier(0.4, 0, 1, 1)` | |

- A reveal moves 12 to 16px at most. Larger travel reads as a template.
- Stagger within a group: 40 to 80ms a step, and the whole group done within 1.5 seconds.
- A cross-fade between themes or scenes takes about half a second.
- Nothing bounces or overshoots unless the brand's `DESIGN.md` asks for it by name.

## What may animate

- DOM: `transform` and `opacity`. Variable-font axes (weight, width) on display type only.
- Line art: SVG strokes drawing in (`stroke-dashoffset`), once.
- Anything with more than about fifty moving parts: one `<canvas>`, not DOM nodes.
- Never animate layout (`width`, `height`, `top`, `left`, margins), `box-shadow`, or `filter` on large areas.
- Gradients do not move.

## Scroll

- Scroll belongs to the visitor: no hijacking, no smoothing library, no snap that fights the wheel.
- A pinned scene scrubs with the scroll position and releases cleanly. It has a plain fallback (see Reduced motion).
- A fixed background scene moves rigidly with the page: no lag, no streaks. Changing from one scene to the next is a fade out and a fade in, so nothing flies across content.
- Parallax is off by default. A brand may use it inside its one scene, never on text or content blocks.
- Pointer effects stay local and small: a scene may react within about 80px of the pointer. No cursor trails, no custom cursors.
- Motion tied to the scroll runs on the browser's own timelines, in CSS: `animation-timeline: view()` or `scroll()`, behind `@supports (animation-timeline: view())`. No scroll handler, and a `transform` or `opacity` animation on a timeline runs off the main thread. Scroll timelines are Baseline as of November 2026 (Chrome, Safari 26, Firefox). Scrub and Lattice work this way.
- Where timelines are missing, the effect does not happen and the page is complete at rest: a scrubbed section is not pinned and every word is lit, the light rests. No script fallback, unless the effect carries meaning.
- Script drives scroll motion only where a timeline cannot: a canvas (Field) or geometry worked out again on every frame (Pattern's sweep). Its handler is passive, waits for the next frame and reads no layout inside it.
- Reveals stay on `IntersectionObserver`. A view timeline scrubs, so a reveal on one would play backwards on the way up. Scroll-triggered animations (`animation-trigger`) do play-once in CSS, but only Chrome has them so far: move Reveal to them when they are Baseline.

## Page changes

A site of several pages changes page with a cross-document view transition (the Page change block, `blocks/page.css`). Normal links and normal page loads: no router and no script.

- The page cross-fades, in about half a second (`--dur-page`, `--ease-out`). Nothing flies across content.
- Two named pieces at most move from the old page to the new: the bar's marker (the kit names it), and one thing the visitor opened, such as a card's picture that becomes the next page's hero. A name is unique on its page: name the one card on the list and its hero, never every card.
- The new page's entrance plays as usual under the cross-fade. It is still the page's one entrance.
- Reduced motion: no transition, the page just changes. The same in a browser without cross-page view transitions (Firefox so far; Chrome and Safari 18.2 or later have them).
- Link `page.css` before any script in the head. The browser decides at the new page's first frame, and a head script can let it draw that frame before the links after the script are read. With the link after the head script, Chrome skipped the transition on two of three phone runs (`tests/README.md`, Native timelines and page changes).
- Whatever the bar shows must be in place on that first frame without script, or it morphs to the wrong place. The nav spy's marker sits on the page's own link by anchor positioning until its script runs.

## Video and generated media

- Autoplaying video is off by default. A brand may use one muted, looping, `playsinline` clip as its scene when: it has a poster frame, it pauses off screen, it never carries meaning that text does not, and reduced motion shows the poster only.
- Generated images and video follow `GENERATED-MEDIA.md`: atmosphere and abstraction only, never a stand-in for a client's real products, food, people or premises, and every clip encoded with design-library's `tools/web-video.mjs`. No tool is approved for client work yet, so until one is a client site uses real photos, real screenshots and code-drawn motion only. Touching up a client's real photos with `brand-capture`'s `touchup.mjs` (no model: light, colour, framing, a plain background) is not generated media; its rules, and the check every edited file passes, are in `brand-capture/references/photos.md`.

## Reduced motion and no script

- `prefers-reduced-motion: reduce`: everything visible, nothing pinned, no loops, no entrance. A scene shows one still frame. Numbers and text that a scene would draw appear as plain text. Video shows its poster.
- Duration tokens collapse to `0.01ms` under the media query, so CSS transitions end at once without a second code path.
- `<html>` carries `rm` when motion is reduced and `js` when script runs with full motion. Every hidden-until-revealed style is scoped under `.js`, so without script nothing is hidden.

## Performance

- Motion never blocks first paint: the entrance text is in the HTML and readable before any script runs. Motion causes no layout shift; a scene's box is sized in CSS.
- One canvas per page, fixed, with the device pixel ratio capped at 2. It stops drawing while off screen and while the tab is hidden.
- Viewport checks use `IntersectionObserver`. Scroll-linked motion runs on a scroll or view timeline (see Scroll); a scroll handler is the last resort.
- No animation library by default. The building blocks are plain TypeScript and CSS. Adding one (for timeline scrubbing the blocks cannot do) is a decision recorded in the PR with its weight.
- Target: motion script under 20 KB gzipped per page, and smooth scrolling on a mid-range phone. Measure both in the PR that adds a scene: the design library's phone pass (`node tools/perf.mjs <url> --runs=3` in OneLine-Software/design-library) gives the script weight, dropped frames while scrolling, layout shift and what is left without script, on a throttled mid-range Android profile.

## Languages and direction

- Motion follows the reading direction: wipes start from the inline start, arrows and directional icons mirror in RTL.
- Lines that are sized by script get more height in Arabic, and far more in Urdu; test every language that ships.

### Joining scripts

Arabic, Persian, Urdu, Pashto, Sindhi, Sorani Kurdish and Uyghur (`ar`, `fa`, `ur`, `ps`, `sd`, `ckb`, `ug`, and any tag with `-Arab`). The letters join, and the browser picks each letter's shape from its neighbours. Most Latin type tricks break that. The type rules that go with these are in `TOKENS.md`.

| Rule | Why |
|---|---|
| Never split a word into letters. Stage by line or by word | A letter in its own box is shaped alone and drops to its unjoined form |
| Fade with `opacity` on the element, never with a see-through text colour | Chrome and Firefox paint a see-through colour letter by letter, so the overlaps at the joins show as dark patches. Safari does not, but the page has to look right in all three. Tested: `tests/README.md` |
| Never wrap part of a word in an element that changes weight, size, padding, border or display. A colour-only span is fine | Firefox and Safari break the word into separate pieces at that point. Chrome keeps the join but the two strokes no longer match. Tested |
| No CSS text stroke (`-webkit-text-stroke`). Outlined text is drawn as SVG outlines of the joined word | The stroke outlines each letter by itself, so every join shows a seam, in every browser. Tested |
| No live text on an SVG path. Use outlines | Safari cannot render Arabic on a `textPath` (WebKit bug 279050) |
| Never animate `letter-spacing`, and never stretch a word by adding tatweel (ـ) | Safari pulls every letter apart and breaks all the joins. Chrome and Firefox ignore tracking between joined letters. Tested. Tatweel changes the text itself |

What does work, and is the whole allowed set:

1. **By line or by word.** Joining never crosses a space, so a word is a safe unit. Rise does lines.
2. **A mask wipe from the inline start.** A `clip-path` inset or a gradient mask across the line box. The text stays live and nothing is split. In RTL it starts at the right.
3. **One signature word as outlines, revealed by a stroked mask.** The word is a filled SVG path, and a centreline drawn along each pen stroke, in writing order, is animated as the mask. This is hand work per word, so it is for a logo or one headline word. Give it `role="img"` and an `aria-label`, and have an Arabic reader check the drawing.
4. **Variable font axes, on a whole word or line.** Weight, and a stretch axis where the font has one. Readex Pro's `HEXP` stretches Arabic by lengthening the joins, the same in Chrome, Firefox and Safari (tested: `tests/README.md`). An axis changes the line's width, so hold the line in a box of fixed size or use it with Fit.

### Urdu in Nastaliq

Urdu is a joining script, so all of the above holds. Nastaliq adds its own trouble: a word climbs above the line, hangs below it and passes its own sides, so every box that hides part of a line has to be bigger. The type rules and the measured figures are in `TOKENS.md`, Urdu in Nastaliq. Set `lang="ur"`: the blocks go by it.

| Rule | Why |
|---|---|
| Rise by line only. The kit's Rise moves an Urdu line whole | It joins, and a line staged word by word would need a mask per word |
| The Rise mask is taller and clips above and below only. `motion.css` does this for `.ln` in Urdu: a line height of 2.2, padding of 0.6 of the type size above and 0.4 below | With the Latin mask the tops and the tails are cut. With this one nothing is, in the three fonts and three browsers tested |
| A wipe runs from the inline start (the right) across a box padded the same way, never across the bare line box | The same reach: a `clip-path` on the line itself cuts what a tight mask would. This follows from the measured reach. A wipe itself was not tested |
| Fit holds an Urdu line to 0.07 of the viewport height on desktop and 0.08 on a phone, and keeps room at its sides | The line is 2.2 times its type size, so the same share of the screen means smaller type. Letters pass the sides of a word by up to 0.44 of the type size |
| Nothing else stretches or tracks it. No weight animation on Gulzar, which has one weight | Urdu does not use tatweel, and a faked bold is not a weight |

### Devanagari, Bengali, Gurmukhi and Tamil

The unit is the syllable. One syllable is often several code points, some drawn before, above or below the consonant they belong to. The type rules are in `TOKENS.md`. Set `lang` (`hi`, `mr`, `ne`, `bn`, `as`, `pa`, `ta`).

| Rule | Why |
|---|---|
| Rise by word or by line. The kit's Rise moves the whole line for any text with a letter outside Latin, Greek and Cyrillic | Split by code point, every word tested fell apart: vowel signs stood alone on dotted circles and the word grew by a third to double its width |
| If a design must move smaller pieces, split only with `Intl.Segmenter` and look at the conjuncts in the font that ships | Its pieces kept each tested word whole, and Chrome, Firefox and Safari's engine cut the five tested words the same way. A piece can still be smaller than a syllable in a word we did not test. Results: `tests/README.md` |
| In Devanagari, Bengali and Gurmukhi, prefer the word even then | The letters of a word hang from one headline. Pieces that move apart break that line while they move |
| The Rise mask pads 0.3 of the type size above and below. `motion.css` does this for `.ln` in these languages | The marks above and below pass a tight line box by up to 0.19 and 0.14 |

## Patterns

A geometric pattern or a pierced screen as a scene: the Pattern and Lattice blocks, or anything a site draws itself.

- It sits in its own empty box. It is never a background to body text or a headline, and nothing is set on it.
- It counts against the budget above. A pattern that builds itself is one reveal. A pattern that changes with a pinned scroll is one pinned scene. Light that moves across a screen with the scroll is one scene.
- A pattern used as texture, in a border or a band, is a small repeated image and does not move.
- With reduced motion and with no script the finished pattern is there, still. So the finished pattern is in the HTML, not only drawn by script.
- Move a masked layer with `transform`. Never slide a mask, and never drive one from a custom property the masked layers inherit: both paint the whole layer again on every frame. Measured: `tests/README.md`, Pattern and Lattice.
- The client's `DESIGN.md` names the pattern's tradition, place and period, and a pattern chosen for one client is never reused for another (`CULTURE.md`).

## Never

- Motion over text or screenshots.
- Numbers counting up.
- Scroll hijacking, cursor trails, custom cursors.
- Tilt cards, glowing borders, floating blobs, sparkles.
- Reveals that replay on scroll back.
- A loop that runs off screen.
- An effect with no reduced-motion behaviour.

## Verify

- Reduced motion on: everything visible, nothing pinned, no loops.
- Script off: all content visible.
- 390px and 1440px, every theme and language the site ships.
- Scroll the full page on a phone: no jank, nothing crossing content.
- A browser without scroll timelines (Safari 18 or older): every scrubbed scene complete and still.
- Open a link between two pages on a phone in Chrome and Safari: one cross-fade, the named pieces land where they belong.
- The budget table above, counted for the page.
