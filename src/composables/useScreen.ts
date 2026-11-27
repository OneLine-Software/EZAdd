// What the four themes share: the basket, how the keyboard drives it, and which sheet is open. Nothing visual.
import { computed, nextTick, ref } from 'vue'
import { useBasket } from './useBasket'
import { parsePasted, type Item } from '@/lib/money'

export type Sheet = 'settings' | 'tax' | 'currency' | 'share' | null
const sheet = ref<Sheet>(null)
const active = ref<number | null>(null)
const copied = ref<'total' | 'share' | 'receipt' | 'link' | null>(null)
let copiedTimer: ReturnType<typeof setTimeout> | undefined

export function useScreen() {
  const b = useBasket()
  const root = ref<HTMLElement>()

  const focus = async (id: number) => {
    active.value = id
    await nextTick()
    const el = (root.value ?? document).querySelector<HTMLInputElement>(`[data-price="${id}"]`)
    el?.focus()
    el?.scrollIntoView({ block: 'nearest' })
  }
  const add = (afterId?: number) => {
    // An empty last line is reused, so pressing add twice does not leave a gap.
    const last = b.basket.value.items[b.basket.value.items.length - 1]
    if (afterId === undefined && last && last.value === '' && last.name === '') return focus(last.id)
    return focus(b.addItem(afterId))
  }

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
    // Digits and separators only, and a minus only in front.
    // A number field hands back nothing while what is in it is not yet a number (a lone minus, say): leave it be.
    if (el.type === 'number' && el.value === '' && el.validity?.badInput) return
    const clean = el.value.replace(/[^\d.,-]/g, '').replace(/(?!^)-/g, '')
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

  const flash = (what: 'total' | 'share' | 'receipt' | 'link') => {
    copied.value = what
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => (copied.value = null), 1800)
  }
  const copy = async (what: 'total' | 'share') => {
    const minor = what === 'total' ? b.sums.value.total : b.shares.value[0]
    try {
      await navigator.clipboard.writeText(b.plain(minor))
      flash(what)
    } catch { /* no clipboard here: nothing to say */ }
  }
  /** Sends the basket as a plain-text receipt: the share sheet on a phone, the clipboard elsewhere. */
  const share = async () => {
    const text = b.receipt()
    try {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) await navigator.share({ text })
      else await navigator.clipboard.writeText(text)
      flash('receipt')
    } catch { /* the person closed the share sheet */ }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(b.link())
      flash('link')
    } catch { /* no clipboard here */ }
  }

  const people = (by: number) => (b.basket.value.people = Math.min(20, Math.max(1, b.basket.value.people + by)))
  const taxText = (t: { type: string; value: string; label: string }) =>
    t.type === 'percentage' && !t.label.includes('%') ? `${t.label} ${t.value}%` : t.label
  /** The country a currency is shown with: its code's first two letters, as ISO 4217 builds them. EUR is the European Union. */
  const flagOf = (currency: string) => (currency.startsWith('X') ? null : currency.slice(0, 2))
  /** How a price field asks for a keyboard. `type=number` is what makes an iPhone open the number page of its full keyboard. */
  const priceKeys = computed(() => (b.settings.value.keys === 'full' ? { type: 'number', step: 'any' } : { type: 'text', inputmode: 'decimal' as const }))
  const things = computed(() => `${b.count.value} ${b.count.value === 1 ? 'thing' : 'things'}`)

  return { ...b, root, active, sheet, copied, focus, add, onKey, onInput, onPaste, copy, share, copyLink, people, taxText, flagOf, things, priceKeys }
}
