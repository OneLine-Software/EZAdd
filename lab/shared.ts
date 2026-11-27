// What the five directions share: the basket and how the keyboard drives it. Nothing visual.
import { nextTick, ref } from 'vue'
import { useBasket } from '@/composables/useBasket'
import { COMMON } from '@/lib/currency'
import { findCountry, findPlace, taxesFor } from '@/lib/taxPresets'
import { parsePasted, type Item } from '@/lib/money'

export function useLab() {
  const b = useBasket()
  const root = ref<HTMLElement>()
  const active = ref<number | null>(null)

  const focus = async (id: number) => {
    active.value = id
    await nextTick()
    root.value?.querySelector<HTMLInputElement>(`[data-price="${id}"]`)?.focus({ preventScroll: false })
  }
  const add = (afterId?: number) => focus(b.addItem(afterId))

  const onKey = (e: KeyboardEvent, item: Item) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      add(item.id)
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Backspace') {
      e.preventDefault()
      b.removeItem(item.id)
    }
  }
  const onInput = (e: Event, item: Item) => {
    const el = e.target as HTMLInputElement
    const clean = el.value.replace(/[^\d.,-]/g, '')
    if (clean !== el.value) el.value = clean
    item.value = clean
  }
  const onPaste = (e: ClipboardEvent, item: Item) => {
    const text = e.clipboardData?.getData('text') ?? ''
    if (parsePasted(text).length > 1) {
      e.preventDefault()
      b.paste(item.id, text)
    }
  }

  /** The lab's stand-in for the tax picker: adds the preset for the place the device seems to be in. */
  const addPreset = () => {
    const country = findCountry(b.settings.value.country) ?? findCountry('AE')
    const taxes = taxesFor(country, findPlace(country, b.settings.value.place))
    const next = taxes.find((t) => !b.basket.value.taxes.some((x) => x.label === t.label)) ?? { label: 'Service charge', rate: 10 }
    b.addTax({ type: 'percentage', value: String(next.rate), label: next.label })
  }

  /** The lab's stand-in for the currency picker: steps through a few, including one with no decimals and one with three. */
  const CYCLE = [...COMMON.slice(0, 5), 'JPY', 'KWD']
  const nextCurrency = () => {
    const at = CYCLE.indexOf(b.settings.value.currency)
    b.settings.value.currency = CYCLE[(at + 1) % CYCLE.length]
  }

  const shared = ref(false)
  const share = async () => {
    const text = b.receipt()
    try {
      if (navigator.share) await navigator.share({ text })
      else await navigator.clipboard.writeText(text)
      shared.value = true
      setTimeout(() => (shared.value = false), 1800)
    } catch { /* the person closed the share sheet */ }
  }

  const people = (by: number) => (b.basket.value.people = Math.min(20, Math.max(1, b.basket.value.people + by)))
  const taxText = (t: { type: string; value: string; label: string }) =>
    t.type === 'percentage' && !t.label.includes('%') ? `${t.label} ${t.value}%` : t.label

  return { ...b, root, active, focus, add, onKey, onInput, onPaste, addPreset, nextCurrency, share, shared, people, taxText }
}
