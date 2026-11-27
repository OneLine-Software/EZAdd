// Draws the app icons from the EZAdd mark (src/components/Mark.vue). Run by hand after the mark changes: node scripts/icons.mjs
// Needs Playwright with Chromium; it is not a dependency of the app.
import { createRequire } from 'node:module'
import { readFileSync, rmSync, writeFileSync } from 'node:fs'

// Playwright is found wherever it is installed (set NODE_PATH for a global one).
const { chromium } = createRequire(import.meta.url)('playwright')

const INK = '#0b0b0c'
const ACC = '#9ac8ff' // the default accent, oklch(0.84 0.15 265) as a browser shows it in sRGB
const mark = (bg, scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${bg ? `<rect width="48" height="48" fill="${INK}"/>` : ''}<g transform="translate(24 24) scale(${scale}) translate(-24 -24)"><path d="M18 3h12a5 5 0 0 1 5 5v5h5a5 5 0 0 1 5 5v12a5 5 0 0 1-5 5h-5v5a5 5 0 0 1-5 5H18a5 5 0 0 1-5-5v-5H8a5 5 0 0 1-5-5V18a5 5 0 0 1 5-5h5V8a5 5 0 0 1 5-5z" fill="${ACC}"/><path d="M17.5 24h13M24 17.5v13" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" fill="none"/></g></svg>`

writeFileSync('public/favicon.svg', mark(false, 1))
const browser = await chromium.launch()
const shot = async (file, size, svg) => {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  await page.setContent(`<style>*{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`)
  await page.screenshot({ path: file, omitBackground: true })
  await page.close()
}
await shot('public/pwa-192x192.png', 192, mark(true, 0.7))
await shot('public/pwa-512x512.png', 512, mark(true, 0.7))
await shot('public/pwa-maskable-512x512.png', 512, mark(true, 0.56))
await shot('public/apple-touch-icon.png', 180, mark(true, 0.7))
await shot('public/favicon-32.png', 32, mark(false, 1))
await browser.close()

// favicon.ico for old browsers: one 32px PNG in an ICO wrapper.
const png = readFileSync('public/favicon-32.png')
const head = Buffer.alloc(22)
head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4); head[6] = 32; head[7] = 32; head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12); head.writeUInt32LE(png.length, 14); head.writeUInt32LE(22, 18)
writeFileSync('public/favicon.ico', Buffer.concat([head, png]))
rmSync('public/favicon-32.png')
