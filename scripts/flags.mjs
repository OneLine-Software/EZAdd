// Copies the flags the currency and country pickers can show into public/flags/, before dev and build.
// The set is country-flag-icons (MIT). Only the 3x2 SVGs are taken; they are a few kB each.
import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const from = fileURLToPath(new URL('../node_modules/country-flag-icons/3x2/', import.meta.url))
const to = fileURLToPath(new URL('../public/flags/', import.meta.url))
rmSync(to, { recursive: true, force: true })
mkdirSync(to, { recursive: true })
let n = 0
for (const file of readdirSync(from)) {
  if (!/^[A-Z]{2}\.svg$/.test(file)) continue
  cpSync(from + file, to + file)
  n++
}
console.log(`flags: ${n} copied to public/flags`)
