// Keyboard shortcuts for a desk. They are off while a field has focus, apart from Escape.
import { onMounted, onUnmounted } from 'vue'
import { useScreen } from './useScreen'

export function useShortcuts() {
  const s = useScreen()
  let awaitingSplit: ReturnType<typeof setTimeout> | undefined

  const onKey = (e: KeyboardEvent) => {
    const el = document.activeElement as HTMLElement | null
    const typing = el?.tagName === 'INPUT' || el?.tagName === 'TEXTAREA' || el?.tagName === 'SELECT'
    if (e.key === 'Escape') {
      if (s.sheet.value) s.sheet.value = null
      else el?.blur()
      return
    }
    if (e.shiftKey && e.key === 'Backspace' && !s.sheet.value) {
      e.preventDefault()
      s.clear()
      return
    }
    if (typing || s.sheet.value || e.metaKey || e.ctrlKey || e.altKey) return
    const key = e.key.toLowerCase()
    if (awaitingSplit && /^[0-9]$/.test(key)) {
      e.preventDefault()
      s.basket.value.people = key === '0' ? 10 : Number(key)
      clearTimeout(awaitingSplit)
      awaitingSplit = undefined
      return
    }
    if (e.shiftKey && key === 'c') { e.preventDefault(); s.copy('total') }
    else if (e.shiftKey && key === 's') { e.preventDefault(); if (s.basket.value.people > 1) s.copy('share') }
    else if (key === 'n') { e.preventDefault(); s.add() }
    else if (key === 't') { e.preventDefault(); s.sheet.value = 'tax' }
    else if (key === 'h') { e.preventDefault(); s.sheet.value = 'share' }
    else if (key === 'm') { e.preventDefault(); s.sheet.value = 'currency' }
    else if (key === 'u') { e.preventDefault(); s.undo.value?.run() }
    else if (key === ',') { e.preventDefault(); s.sheet.value = 'settings' }
    else if (key === 's') {
      e.preventDefault()
      clearTimeout(awaitingSplit)
      awaitingSplit = setTimeout(() => (awaitingSplit = undefined), 1200)
    }
  }
  onMounted(() => window.addEventListener('keydown', onKey))
  onUnmounted(() => window.removeEventListener('keydown', onKey))
}

export const SHORTCUTS: [string, string][] = [
  ['Enter', 'Next item, while typing a price'],
  ['N', 'New item'],
  ['T', 'Taxes and fees'],
  ['M', 'Currency'],
  ['H', 'Share'],
  ['S then 2 to 9', 'Split between that many'],
  ['Shift C', 'Copy the total'],
  ['Shift S', 'Copy one share'],
  ['U', 'Undo the last removal'],
  ['Ctrl or ⌘ Backspace', 'Remove the item being typed'],
  ['Shift Backspace', 'Clear the basket'],
  [',', 'Settings'],
  ['Esc', 'Close'],
]
