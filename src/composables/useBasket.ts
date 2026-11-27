// The basket: items, taxes, the split and the settings. One copy for the whole app,
// saved on the device after every change, with one step of undo for anything that removes.

import { computed, ref, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { totals as sumUp, split, parsePasted, type Item, type Tax } from '@/lib/money'
import { decimalsOf, formatMinor, moneyParts, plainMinor } from '@/lib/currency'
import { guessRegion } from '@/lib/region'

export interface Basket {
  items: Item[]
  taxes: Tax[]
  people: number
  nextId: number
}

export interface SavedTax {
  type: Tax['type']
  value: string
  label: string
}

export interface Settings {
  currency: string
  country: string | null
  place: string | null
  /** The accent as a hue, 0 to 360. The look turns it into colours that stay readable. */
  hue: number
  theme: 'system' | 'light' | 'dark'
  myTaxes: SavedTax[]
}

const empty = (): Basket => ({ items: [{ id: 1, name: '', value: '', qty: 1 }], taxes: [], people: 1, nextId: 2 })

const demo = (): Basket => ({
  items: [
    { id: 1, name: 'Flat white', value: '21.00', qty: 2 },
    { id: 2, name: 'Sourdough loaf', value: '28.50', qty: 1 },
    { id: 3, name: 'Eggs, dozen', value: '17.25', qty: 1 },
    { id: 4, name: 'Dates', value: '12.00', qty: 3 },
    { id: 5, name: 'Sparkling water', value: '4.75', qty: 6 },
  ],
  taxes: [{ id: 6, type: 'percentage', value: '5', label: 'VAT' }],
  people: 2,
  nextId: 7,
})

const isDemo = typeof location !== 'undefined' && new URLSearchParams(location.search).has('demo')
const guess = guessRegion()

// In the demo nothing is read from or written to the device, so a visitor's own basket is left alone.
const basket = isDemo ? ref<Basket>(demo()) : useLocalStorage<Basket>('ezadd.basket', empty(), { mergeDefaults: true })
const settings = isDemo
  ? ref<Settings>({ currency: 'AED', country: 'AE', place: null, hue: 265, theme: 'system', myTaxes: [] })
  : useLocalStorage<Settings>(
      'ezadd.settings',
      { currency: guess.currency, country: guess.country, place: guess.place, hue: 265, theme: 'system', myTaxes: [] },
      { mergeDefaults: true },
    )

if (!basket.value.items?.length) basket.value = empty()

export interface Undo {
  label: string
  run: () => void
}
const undo = ref<Undo | null>(null)
let undoTimer: ReturnType<typeof setTimeout> | undefined

function removing(label: string, change: () => void) {
  const before = JSON.stringify(basket.value)
  change()
  clearTimeout(undoTimer)
  undo.value = {
    label,
    run: () => {
      basket.value = JSON.parse(before)
      undo.value = null
    },
  }
  undoTimer = setTimeout(() => (undo.value = null), 6000)
}

const decimals = computed(() => decimalsOf(settings.value.currency))
const sums = computed(() => sumUp(basket.value.items, basket.value.taxes, decimals.value))
const shares = computed(() => split(sums.value.total, basket.value.people))
const count = computed(() => basket.value.items.filter((i) => i.value !== '').reduce((n, i) => n + (i.qty || 0), 0))

const id = () => basket.value.nextId++

function addItem(afterId?: number): number {
  const item: Item = { id: id(), name: '', value: '', qty: 1 }
  const at = afterId === undefined ? -1 : basket.value.items.findIndex((i) => i.id === afterId)
  if (at >= 0) basket.value.items.splice(at + 1, 0, item)
  else basket.value.items.push(item)
  return item.id
}

function removeItem(itemId: number) {
  const item = basket.value.items.find((i) => i.id === itemId)
  if (!item) return
  const change = () => {
    basket.value.items = basket.value.items.filter((i) => i.id !== itemId)
    if (!basket.value.items.length) addItem()
  }
  // An empty line is not worth an undo.
  if (item.value === '' && item.name === '') change()
  else removing(item.name ? `Removed ${item.name}` : 'Removed an item', change)
}

function setQty(itemId: number, qty: number) {
  const item = basket.value.items.find((i) => i.id === itemId)
  if (item) item.qty = Math.min(999, Math.max(0.5, Math.round(qty * 2) / 2))
}

function clear() {
  const used = basket.value.items.some((i) => i.value !== '' || i.name !== '') || basket.value.taxes.length > 0
  const change = () => {
    basket.value = { ...empty(), nextId: basket.value.nextId + 1, items: [{ id: basket.value.nextId, name: '', value: '', qty: 1 }] }
  }
  if (used) removing('Cleared the basket', change)
  else change()
}

/** A pasted column fills this line and adds one line for each further number. Returns how many it read. */
function paste(itemId: number, text: string): number {
  const values = parsePasted(text)
  const at = basket.value.items.findIndex((i) => i.id === itemId)
  if (!values.length || at < 0) return 0
  basket.value.items[at].value = values[0]
  const more = values.slice(1).map((value) => ({ id: id(), name: '', value, qty: 1 }))
  basket.value.items.splice(at + 1, 0, ...more)
  return values.length
}

function addTax(tax: SavedTax, remember = false) {
  const value = String(tax.value).trim()
  if (!value) return
  const label = tax.label.trim() || (tax.type === 'percentage' ? `${value}%` : 'Fee')
  basket.value.taxes.push({ id: id(), type: tax.type, value, label })
  if (remember && !settings.value.myTaxes.some((t) => t.label === label && t.value === value && t.type === tax.type)) {
    settings.value.myTaxes.push({ type: tax.type, value, label })
  }
}

function removeTax(taxId: number) {
  const tax = basket.value.taxes.find((t) => t.id === taxId)
  if (tax) removing(`Removed ${tax.label}`, () => (basket.value.taxes = basket.value.taxes.filter((t) => t.id !== taxId)))
}

function forgetMyTax(index: number) {
  settings.value.myTaxes.splice(index, 1)
}

const fmt = (minor: number) => formatMinor(minor, settings.value.currency)
const parts = (minor: number) => moneyParts(minor, settings.value.currency)
const plain = (minor: number) => plainMinor(minor, settings.value.currency)

/** The basket as a plain-text receipt, for the share sheet or the clipboard. */
function receipt(): string {
  const s = sums.value
  const rows: [string, string][] = []
  basket.value.items.forEach((item, i) => {
    if (item.value === '') return
    const name = item.name || `Item ${i + 1}`
    rows.push([item.qty === 1 ? name : `${name} × ${item.qty}`, fmt(s.lines[i])])
  })
  const width = Math.max(24, ...rows.map(([a, b]) => a.length + b.length + 2))
  const line = ([a, b]: [string, string]) => a + ' '.repeat(Math.max(1, width - a.length - b.length)) + b
  const out = ['EZAdd', '-'.repeat(width), ...rows.map(line)]
  if (basket.value.taxes.length) {
    out.push('-'.repeat(width), line(['Subtotal', fmt(s.subtotal)]))
    basket.value.taxes.forEach((t, i) => out.push(line([t.type === 'percentage' && !t.label.includes('%') ? `${t.label} ${t.value}%` : t.label, fmt(s.taxes[i])])))
  }
  out.push('-'.repeat(width), line(['TOTAL', fmt(s.total)]))
  if (basket.value.people > 1) out.push(line([`Split by ${basket.value.people}`, fmt(shares.value[0])]))
  return out.join('\n')
}

// The theme follows the device unless the person picked one.
const systemDark = ref(false)
if (typeof window !== 'undefined' && window.matchMedia) {
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  systemDark.value = query.matches
  query.addEventListener('change', (e) => (systemDark.value = e.matches))
}
const dark = computed(() => (settings.value.theme === 'system' ? systemDark.value : settings.value.theme === 'dark'))
if (typeof document !== 'undefined') {
  watch(dark, (on) => document.documentElement.classList.toggle('dark', on), { immediate: true })
}

export function useBasket() {
  return {
    basket, settings, isDemo, undo, dark,
    decimals, sums, shares, count,
    addItem, removeItem, setQty, clear, paste, addTax, removeTax, forgetMyTax,
    fmt, parts, plain, receipt,
  }
}
