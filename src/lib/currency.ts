// Currencies: which one to start with, and how an amount is written.

/** Offered first in the picker. The rest come from the browser's own list. */
export const COMMON = ['USD', 'EUR', 'GBP', 'AED', 'CAD', 'SAR', 'PKR', 'INR', 'ZAR', 'AUD'] as const

const FALLBACK = [
  ...COMMON, 'BHD', 'BRL', 'CHF', 'CNY', 'DKK', 'EGP', 'HKD', 'IDR', 'ILS', 'JPY', 'KES', 'KRW', 'KWD',
  'MXN', 'MYR', 'NGN', 'NOK', 'NZD', 'OMR', 'PHP', 'PLN', 'QAR', 'SEK', 'SGD', 'THB', 'TRY',
]

export function allCurrencies(): string[] {
  try {
    const list = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.('currency')
    if (list?.length) return list
  } catch { /* older browser: use the short list */ }
  return [...new Set(FALLBACK)].sort()
}

export function currencyName(code: string, locale?: string): string {
  try {
    return new Intl.DisplayNames(locale, { type: 'currency' }).of(code) ?? code
  } catch {
    return code
  }
}

const decimalsCache = new Map<string, number>()

/** 2 for most, 0 for the yen, 3 for the Kuwaiti dinar. */
export function decimalsOf(code: string): number {
  let d = decimalsCache.get(code)
  if (d === undefined) {
    try {
      d = new Intl.NumberFormat('en', { style: 'currency', currency: code }).resolvedOptions().maximumFractionDigits ?? 2
    } catch {
      d = 2
    }
    decimalsCache.set(code, d)
  }
  return d
}

export interface MoneyParts {
  /** The sign, when negative. */
  sign: string
  symbol: string
  /** True when the symbol is written after the number in this locale. */
  symbolAfter: boolean
  whole: string
  /** With its decimal mark, or empty for a currency with no decimals. */
  fraction: string
}

const formatters = new Map<string, Intl.NumberFormat>()
function formatter(code: string, locale?: string): Intl.NumberFormat {
  const key = `${locale ?? ''}|${code}`
  let f = formatters.get(key)
  if (!f) {
    try {
      f = new Intl.NumberFormat(locale, { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' })
    } catch {
      f = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' })
    }
    formatters.set(key, f)
  }
  return f
}

/** An amount in the smallest unit, written for the currency: 1250 in USD is "$12.50". */
export function formatMinor(minor: number, code: string, locale?: string): string {
  return formatter(code, locale).format(minor / 10 ** decimalsOf(code))
}

/** The same amount in pieces, so a screen can set the decimals small. */
export function moneyParts(minor: number, code: string, locale?: string): MoneyParts {
  const parts = formatter(code, locale).formatToParts(minor / 10 ** decimalsOf(code))
  const out: MoneyParts = { sign: '', symbol: '', symbolAfter: false, whole: '', fraction: '' }
  let seenNumber = false
  for (const p of parts) {
    if (p.type === 'minusSign') out.sign = p.value
    else if (p.type === 'currency') {
      out.symbol = p.value
      out.symbolAfter = seenNumber
    } else if (p.type === 'integer' || p.type === 'group') {
      out.whole += p.value
      seenNumber = true
    } else if (p.type === 'decimal' || p.type === 'fraction') out.fraction += p.value
  }
  return out
}

/** A plain number for the clipboard: "12.50", never "$12.50". */
export function plainMinor(minor: number, code: string): string {
  return (minor / 10 ** decimalsOf(code)).toFixed(decimalsOf(code))
}
