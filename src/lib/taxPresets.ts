// Tax and fee presets, bundled so they work with no connection.
//
// Checked on 2026-11-27 against:
//   United States: Tax Foundation, "State and Local Sales Tax Rates, Midyear 2026" (rates as of 1 July 2026)
//   Canada:        TaxTips.ca, "2026 Sales Tax Rates" (revised 28 August 2026)
//   Europe:        Tax Foundation, "VAT Rates in Europe" (as of January 2026)
// The countries outside those three lists carry their standard national rate from general knowledge.
// They have NOT been checked against a source yet (LAB-74): check each before relying on it.
//
// A preset is a starting point. Every rate can be changed before it is added, because a city,
// a county or a kind of product often has its own. To update: change the number here, change
// the date in CHECKED, and run `npm test` (it checks the shape of this file).

export const CHECKED = '2026-11-27'

export interface PresetTax {
  label: string
  /** Percent. */
  rate: number
}

export interface Place {
  code: string
  name: string
  taxes: PresetTax[]
  /** Shown under the preset: what it leaves out. */
  note?: string
}

export interface Country extends Place {
  currency: string
  /** True where the price on the shelf normally has the tax in it already. */
  included: boolean
  /** States or provinces. When present, the person picks one. */
  places?: Place[]
}

const vat = (code: string, name: string, currency: string, rate: number, label = 'VAT'): Country => ({
  code, name, currency, included: true, taxes: [{ label, rate }],
})

const LOCAL = 'State rate only. Most cities and counties add their own.'
const us = (code: string, name: string, rate: number, note?: string): Place => ({
  code, name, taxes: rate ? [{ label: `${code} sales tax`, rate }] : [],
  note: note ?? (rate ? LOCAL : 'No state sales tax.'),
})

const GST: PresetTax = { label: 'GST', rate: 5 }
const hst = (code: string, name: string, rate: number): Place => ({ code, name, taxes: [{ label: 'HST', rate }] })
const gstPlus = (code: string, name: string, label?: string, rate?: number): Place => ({
  code, name, taxes: label && rate ? [GST, { label, rate }] : [GST],
})

export const COUNTRIES: Country[] = [
  {
    code: 'US', name: 'United States', currency: 'USD', included: false, taxes: [],
    places: [
      us('AL', 'Alabama', 4), us('AK', 'Alaska', 0, 'No state sales tax. Some towns charge their own.'),
      us('AZ', 'Arizona', 5.6), us('AR', 'Arkansas', 6.5), us('CA', 'California', 7.25),
      us('CO', 'Colorado', 2.9), us('CT', 'Connecticut', 6.35, 'One rate across the state.'),
      us('DE', 'Delaware', 0), us('DC', 'District of Columbia', 6, 'One rate across the district.'),
      us('FL', 'Florida', 6), us('GA', 'Georgia', 4), us('HI', 'Hawaii', 4), us('ID', 'Idaho', 6),
      us('IL', 'Illinois', 6.25), us('IN', 'Indiana', 7, 'One rate across the state.'), us('IA', 'Iowa', 6),
      us('KS', 'Kansas', 6.5), us('KY', 'Kentucky', 6, 'One rate across the state.'), us('LA', 'Louisiana', 5),
      us('ME', 'Maine', 5.5, 'One rate across the state.'), us('MD', 'Maryland', 6, 'One rate across the state.'),
      us('MA', 'Massachusetts', 6.25, 'One rate across the state.'), us('MI', 'Michigan', 6, 'One rate across the state.'),
      us('MN', 'Minnesota', 6.875), us('MS', 'Mississippi', 7), us('MO', 'Missouri', 4.225),
      us('MT', 'Montana', 0), us('NE', 'Nebraska', 5.5), us('NV', 'Nevada', 6.85),
      us('NH', 'New Hampshire', 0), us('NJ', 'New Jersey', 6.625), us('NM', 'New Mexico', 4.875),
      us('NY', 'New York', 4), us('NC', 'North Carolina', 4.75), us('ND', 'North Dakota', 5),
      us('OH', 'Ohio', 5.75), us('OK', 'Oklahoma', 4.5), us('OR', 'Oregon', 0), us('PA', 'Pennsylvania', 6),
      us('RI', 'Rhode Island', 7, 'One rate across the state.'), us('SC', 'South Carolina', 6),
      us('SD', 'South Dakota', 4.2), us('TN', 'Tennessee', 7), us('TX', 'Texas', 6.25), us('UT', 'Utah', 6.1),
      us('VT', 'Vermont', 6), us('VA', 'Virginia', 5.3), us('WA', 'Washington', 6.5),
      us('WV', 'West Virginia', 6), us('WI', 'Wisconsin', 5), us('WY', 'Wyoming', 4),
    ],
  },
  {
    code: 'CA', name: 'Canada', currency: 'CAD', included: false, taxes: [GST],
    places: [
      gstPlus('AB', 'Alberta'), gstPlus('BC', 'British Columbia', 'PST', 7), gstPlus('MB', 'Manitoba', 'RST', 7),
      hst('NB', 'New Brunswick', 15), hst('NL', 'Newfoundland and Labrador', 15), gstPlus('NT', 'Northwest Territories'),
      hst('NS', 'Nova Scotia', 14), gstPlus('NU', 'Nunavut'), hst('ON', 'Ontario', 13),
      hst('PE', 'Prince Edward Island', 15), gstPlus('QC', 'Quebec', 'QST', 9.975),
      gstPlus('SK', 'Saskatchewan', 'PST', 6), gstPlus('YT', 'Yukon'),
    ],
  },
  vat('AE', 'United Arab Emirates', 'AED', 5),
  vat('SA', 'Saudi Arabia', 'SAR', 15),
  vat('BH', 'Bahrain', 'BHD', 10),
  vat('OM', 'Oman', 'OMR', 5),
  vat('PK', 'Pakistan', 'PKR', 18, 'Sales tax'),
  vat('IN', 'India', 'INR', 18, 'GST'),
  vat('GB', 'United Kingdom', 'GBP', 20),
  vat('IE', 'Ireland', 'EUR', 23),
  vat('DE', 'Germany', 'EUR', 19),
  vat('FR', 'France', 'EUR', 20),
  vat('ES', 'Spain', 'EUR', 21),
  vat('IT', 'Italy', 'EUR', 22),
  vat('NL', 'Netherlands', 'EUR', 21),
  vat('BE', 'Belgium', 'EUR', 21),
  vat('PT', 'Portugal', 'EUR', 23),
  vat('AT', 'Austria', 'EUR', 20),
  vat('GR', 'Greece', 'EUR', 24),
  vat('FI', 'Finland', 'EUR', 25.5),
  vat('SE', 'Sweden', 'SEK', 25),
  vat('DK', 'Denmark', 'DKK', 25),
  vat('NO', 'Norway', 'NOK', 25),
  vat('PL', 'Poland', 'PLN', 23),
  vat('CZ', 'Czechia', 'CZK', 21),
  vat('HU', 'Hungary', 'HUF', 27),
  vat('RO', 'Romania', 'RON', 21),
  vat('CH', 'Switzerland', 'CHF', 8.1),
  vat('TR', 'Türkiye', 'TRY', 20),
  vat('ZA', 'South Africa', 'ZAR', 15),
  vat('EG', 'Egypt', 'EGP', 14),
  vat('NG', 'Nigeria', 'NGN', 7.5),
  vat('KE', 'Kenya', 'KES', 16),
  vat('AU', 'Australia', 'AUD', 10, 'GST'),
  vat('NZ', 'New Zealand', 'NZD', 15, 'GST'),
  vat('SG', 'Singapore', 'SGD', 9, 'GST'),
  vat('JP', 'Japan', 'JPY', 10, 'Consumption tax'),
  vat('KR', 'South Korea', 'KRW', 10),
  vat('PH', 'Philippines', 'PHP', 12),
  vat('TH', 'Thailand', 'THB', 7),
  vat('MX', 'Mexico', 'MXN', 16, 'IVA'),
]

/** Not taxes: what a bill often carries on top. */
export const FEES: PresetTax[] = [
  { label: 'Tip 10%', rate: 10 },
  { label: 'Tip 15%', rate: 15 },
  { label: 'Tip 18%', rate: 18 },
  { label: 'Tip 20%', rate: 20 },
  { label: 'Service charge', rate: 10 },
]

export function findCountry(code?: string | null): Country | undefined {
  return COUNTRIES.find((c) => c.code === code)
}

export function findPlace(country?: Country, code?: string | null): Place | undefined {
  return country?.places?.find((p) => p.code === code)
}

/** The taxes a person in this place would add: the province's when there is one, else the country's. */
export function taxesFor(country?: Country, place?: Place): PresetTax[] {
  return place ? place.taxes : country?.places ? [] : country?.taxes ?? []
}
