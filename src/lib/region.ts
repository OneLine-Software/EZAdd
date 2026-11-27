// A first guess at where the person is, from the device clock and language.
// Nothing leaves the device. It only picks the starting currency and tax preset; both can be changed.

import { findCountry } from './taxPresets'

const ZONES: Record<string, string> = {
  'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Bahrain': 'BH', 'Asia/Muscat': 'OM', 'Asia/Karachi': 'PK',
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Berlin': 'DE',
  'Europe/Paris': 'FR', 'Europe/Madrid': 'ES', 'Europe/Rome': 'IT', 'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE',
  'Europe/Lisbon': 'PT', 'Europe/Vienna': 'AT', 'Europe/Athens': 'GR', 'Europe/Helsinki': 'FI', 'Europe/Stockholm': 'SE',
  'Europe/Copenhagen': 'DK', 'Europe/Oslo': 'NO', 'Europe/Warsaw': 'PL', 'Europe/Prague': 'CZ', 'Europe/Budapest': 'HU',
  'Europe/Bucharest': 'RO', 'Europe/Zurich': 'CH', 'Europe/Istanbul': 'TR', 'Africa/Johannesburg': 'ZA',
  'Africa/Cairo': 'EG', 'Africa/Lagos': 'NG', 'Africa/Nairobi': 'KE', 'Pacific/Auckland': 'NZ', 'Asia/Singapore': 'SG',
  'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR', 'Asia/Manila': 'PH', 'Asia/Bangkok': 'TH', 'America/Mexico_City': 'MX',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US',
  'America/Phoenix': 'US', 'America/Anchorage': 'US', 'Pacific/Honolulu': 'US', 'America/Detroit': 'US',
  'America/Boise': 'US',
}

/** Canadian zones name the province well enough to pick it. United States zones cross states, so they do not. */
const CA_ZONES: Record<string, string> = {
  'America/Toronto': 'ON', 'America/Vancouver': 'BC', 'America/Edmonton': 'AB', 'America/Winnipeg': 'MB',
  'America/Halifax': 'NS', 'America/St_Johns': 'NL', 'America/Regina': 'SK', 'America/Montreal': 'QC',
  'America/Moncton': 'NB', 'America/Whitehorse': 'YT', 'America/Yellowknife': 'NT', 'America/Iqaluit': 'NU',
}

export interface Guess {
  country: string | null
  place: string | null
  currency: string
}

export function guessRegion(timeZone?: string, language?: string): Guess {
  let tz = timeZone
  let lang = language
  try {
    tz ??= Intl.DateTimeFormat().resolvedOptions().timeZone
    lang ??= navigator.language
  } catch { /* no clock or language: fall through to the default */ }

  let country: string | null = null
  let place: string | null = null
  if (tz && CA_ZONES[tz]) {
    country = 'CA'
    place = CA_ZONES[tz]
  } else if (tz && ZONES[tz]) {
    country = ZONES[tz]
  } else if (tz?.startsWith('Australia/')) {
    country = 'AU'
  } else if (tz?.startsWith('America/Indiana') || tz?.startsWith('America/Kentucky')) {
    country = 'US'
  } else {
    const region = lang?.split('-')[1]?.toUpperCase()
    if (region && findCountry(region)) country = region
  }
  return { country, place, currency: findCountry(country)?.currency ?? 'USD' }
}
