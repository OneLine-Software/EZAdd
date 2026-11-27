import { describe, expect, it } from 'vitest'
import { parseAmount, roundHalfUp, toMinor, totals, split, parsePasted, lineMinor } from '../money'
import { decimalsOf, formatMinor, moneyParts, plainMinor } from '../currency'
import { COUNTRIES, FEES, findCountry, findPlace, taxesFor } from '../taxPresets'
import { guessRegion } from '../region'

const item = (value: string, qty = 1, id = 1) => ({ id, name: '', value, qty })

describe('parseAmount', () => {
  it.each([
    ['12.50', 12.5], ['1,234.50', 1234.5], ['12,5', 12.5], ['1.234,50', 1234.5], ['$ 3', 3], ['-4', -4],
    ['AED 1,000', 1000], ['1,000,000', 1000000], ['', 0], ['abc', 0], ['.5', 0.5], ['1.2.3', 123],
  ])('%s is %s', (text, n) => expect(parseAmount(text)).toBe(n))
})

describe('rounding', () => {
  it('rounds half away from zero', () => {
    expect(roundHalfUp(0.5)).toBe(1)
    expect(roundHalfUp(-0.5)).toBe(-1)
    expect(roundHalfUp(2.4999)).toBe(2)
  })
  it('is not fooled by binary noise', () => {
    expect(toMinor(1.005, 2)).toBe(101)
    expect(toMinor(0.1 + 0.2, 2)).toBe(30)
    expect(toMinor(19.99, 2)).toBe(1999)
  })
})

describe('totals', () => {
  it('adds lines exactly', () => {
    const t = totals([item('0.10'), item('0.20', 1, 2), item('19.99', 3, 3)], [], 2)
    expect(t.lines).toEqual([10, 20, 5997])
    expect(t.total).toBe(6027)
  })
  it('handles half quantities and negatives', () => {
    expect(lineMinor(item('3.33', 0.5), 2)).toBe(167)
    expect(totals([item('10'), item('-2.50', 1, 2)], [], 2).total).toBe(750)
  })
  it('applies each percentage to the subtotal, and flat fees as they are', () => {
    const t = totals(
      [item('100')],
      [
        { id: 1, type: 'percentage', value: '5', label: 'GST' },
        { id: 2, type: 'percentage', value: '9.975', label: 'QST' },
        { id: 3, type: 'flat', value: '2.50', label: 'Bag' },
      ],
      2,
    )
    expect(t.taxes).toEqual([500, 998, 250])
    expect(t.total).toBe(11748)
  })
  it('follows the currency: none for yen, three for the Kuwaiti dinar', () => {
    expect(totals([item('1200')], [{ id: 1, type: 'percentage', value: '10', label: '' }], 0).total).toBe(1320)
    expect(totals([item('1.2345')], [], 3).total).toBe(1235)
  })
})

describe('split', () => {
  it('adds back up to the total', () => {
    expect(split(1000, 3)).toEqual([334, 333, 333])
    expect(split(1000, 3).reduce((a, b) => a + b)).toBe(1000)
    expect(split(999, 1)).toEqual([999])
    expect(split(-1000, 3).reduce((a, b) => a + b)).toBe(-1000)
    expect(split(100, 0)).toEqual([100])
  })
})

describe('paste', () => {
  it('reads a spreadsheet column', () => {
    expect(parsePasted('$12.50\n3\t4.25\r\nTotal\n1,000.00')).toEqual(['12.5', '3', '4.25', '1000'])
  })
})

describe('currency', () => {
  it('knows the decimals', () => {
    expect(decimalsOf('USD')).toBe(2)
    expect(decimalsOf('JPY')).toBe(0)
    expect(decimalsOf('KWD')).toBe(3)
  })
  it('keeps the trailing zero', () => {
    expect(formatMinor(1250, 'USD', 'en-US')).toBe('$12.50')
    expect(plainMinor(1250, 'USD')).toBe('12.50')
    expect(plainMinor(1250, 'JPY')).toBe('1250')
  })
  it('gives the pieces', () => {
    const p = moneyParts(123456, 'USD', 'en-US')
    expect(p).toMatchObject({ symbol: '$', whole: '1,234', fraction: '.56', symbolAfter: false, sign: '' })
    expect(moneyParts(500, 'JPY', 'en-US').fraction).toBe('')
    expect(moneyParts(-500, 'USD', 'en-US').sign).toBe('-')
  })
})

describe('tax presets', () => {
  it('has well-formed rates', () => {
    const codes = new Set<string>()
    for (const c of COUNTRIES) {
      expect(codes.has(c.code), c.code).toBe(false)
      codes.add(c.code)
      expect(decimalsOf(c.currency)).toBeGreaterThanOrEqual(0)
      for (const p of [c, ...(c.places ?? [])]) {
        for (const t of p.taxes) {
          expect(t.label).not.toBe('')
          expect(t.rate, `${c.code} ${p.code}`).toBeGreaterThan(0)
          expect(t.rate, `${c.code} ${p.code}`).toBeLessThan(30)
        }
      }
    }
    expect(findCountry('US')!.places).toHaveLength(51)
    expect(findCountry('CA')!.places).toHaveLength(13)
    expect(FEES.length).toBeGreaterThan(0)
  })
  it('gives a province its own taxes', () => {
    const ca = findCountry('CA')!
    expect(taxesFor(ca, findPlace(ca, 'QC'))).toEqual([{ label: 'GST', rate: 5 }, { label: 'QST', rate: 9.975 }])
    expect(taxesFor(ca, findPlace(ca, 'ON'))).toEqual([{ label: 'HST', rate: 13 }])
    expect(taxesFor(ca)).toEqual([])
    expect(taxesFor(findCountry('AE'))).toEqual([{ label: 'VAT', rate: 5 }])
    expect(taxesFor(findCountry('US'), findPlace(findCountry('US'), 'OR'))).toEqual([])
  })
})

describe('region guess', () => {
  it('reads the clock first, then the language', () => {
    expect(guessRegion('Asia/Dubai', 'en-US')).toEqual({ country: 'AE', place: null, currency: 'AED' })
    expect(guessRegion('America/Toronto', 'en-CA')).toEqual({ country: 'CA', place: 'ON', currency: 'CAD' })
    expect(guessRegion('America/Chicago', 'en-US')).toMatchObject({ country: 'US', place: null, currency: 'USD' })
    expect(guessRegion('Etc/UTC', 'en-GB')).toMatchObject({ country: 'GB', currency: 'GBP' })
    expect(guessRegion('Etc/UTC', 'xx')).toEqual({ country: null, place: null, currency: 'USD' })
  })
})
