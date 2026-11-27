// The money maths, kept apart from the screen so it can be tested.
// Everything is counted in the currency's smallest unit (cents, fils), as whole numbers,
// so 0.1 + 0.2 is 0.3 and a total never shows a stray cent.

export interface Item {
  id: number
  name: string
  /** What was typed, kept as typed ("12.50"). */
  value: string
  qty: number
}

export interface Tax {
  id: number
  type: 'percentage' | 'flat'
  /** A percentage, or an amount in the currency's main unit. */
  value: string
  label: string
}

export interface Totals {
  lines: number[]
  subtotal: number
  taxes: number[]
  taxTotal: number
  total: number
}

/** Reads what a person typed or pasted: "12.50", "1,234.5", "12,5", "$ 3", "-4". */
export function parseAmount(text: string): number {
  let s = String(text ?? '').replace(/[^\d.,-]/g, '')
  if (!s) return 0
  const negative = s.startsWith('-')
  s = s.replace(/-/g, '')
  const dot = s.lastIndexOf('.')
  const comma = s.lastIndexOf(',')
  if (dot >= 0 && comma >= 0) {
    // The later mark is the decimal point; the other groups thousands.
    s = dot > comma ? s.replace(/,/g, '') : s.replace(/\./g, '').replace(',', '.')
  } else if (comma >= 0) {
    // One comma followed by one or two digits is a decimal comma ("12,5"). Otherwise it groups.
    const tail = s.length - comma - 1
    s = s.indexOf(',') === comma && tail > 0 && tail <= 2 ? s.replace(',', '.') : s.replace(/,/g, '')
  } else if (dot >= 0 && s.indexOf('.') !== dot) {
    s = s.replace(/\./g, '')
  }
  const n = parseFloat(s)
  if (!isFinite(n)) return 0
  return negative ? -n : n
}

/** Rounds half away from zero, after trimming binary noise (1.005 * 100 is 100.49999…). */
export function roundHalfUp(n: number): number {
  const clean = Number(n.toPrecision(12))
  return clean < 0 ? -Math.round(-clean) : Math.round(clean)
}

export function toMinor(amount: number, decimals: number): number {
  return roundHalfUp(amount * 10 ** decimals)
}

export function fromMinor(minor: number, decimals: number): number {
  return minor / 10 ** decimals
}

export function lineMinor(item: Pick<Item, 'value' | 'qty'>, decimals: number): number {
  return roundHalfUp(parseAmount(item.value) * (item.qty || 0) * 10 ** decimals)
}

export function taxMinor(tax: Pick<Tax, 'type' | 'value'>, subtotal: number, decimals: number): number {
  const v = parseAmount(tax.value)
  return tax.type === 'percentage' ? roundHalfUp((subtotal * v) / 100) : toMinor(v, decimals)
}

export function totals(items: Item[], taxes: Tax[], decimals: number): Totals {
  const lines = items.map((i) => lineMinor(i, decimals))
  const subtotal = lines.reduce((a, b) => a + b, 0)
  const taxAmounts = taxes.map((t) => taxMinor(t, subtotal, decimals))
  const taxTotal = taxAmounts.reduce((a, b) => a + b, 0)
  return { lines, subtotal, taxes: taxAmounts, taxTotal, total: subtotal + taxTotal }
}

/**
 * Splits a total between people so the shares add up to it exactly.
 * When it does not divide evenly, the first few people pay one unit more.
 */
export function split(total: number, people: number): number[] {
  const n = Math.max(1, Math.floor(people))
  const sign = total < 0 ? -1 : 1
  const abs = Math.abs(total)
  const base = Math.floor(abs / n)
  const extra = abs - base * n
  return Array.from({ length: n }, (_, i) => sign * (base + (i < extra ? 1 : 0)))
}

/** Numbers out of a pasted block: one per line or cell, as a spreadsheet copies them. */
export function parsePasted(text: string): string[] {
  return text
    .split(/[\n\t\r]+/)
    .map((s) => s.trim())
    .filter((s) => /\d/.test(s))
    .map((s) => parseAmount(s))
    .filter((n) => isFinite(n))
    .map((n) => String(n))
}
