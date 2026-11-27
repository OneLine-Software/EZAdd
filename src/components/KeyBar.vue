<script setup lang="ts">
// A bar that sits on top of the phone keyboard while a price is being typed. The number pad on iOS has no
// return key, so this gives one: Next moves to a new line. It also keeps the total in sight above the keys.
import { onMounted, onUnmounted, ref } from 'vue'
import { CornerDownLeft, Minus, Plus } from 'lucide-vue-next'
import { useScreen } from '@/composables/useScreen'

const s = useScreen()
const itemId = ref<number | null>(null)
const touch = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches

// The bar waits until the keyboard has finished coming up, then appears in place. Arriving together with the
// keyboard made two things move at once.
const ready = ref(false)
let wait: ReturnType<typeof setTimeout> | undefined
const show = () => { clearTimeout(wait); ready.value = true }
const watchFocus = () => {
  const el = document.activeElement as HTMLElement | null
  // The calculator has its own keys and never opens the keyboard.
  const id = el?.matches?.('[data-price]:not([inputmode="none"])') ? Number(el.dataset.price) : null
  if (id !== null && itemId.value === null) {
    ready.value = false
    clearTimeout(wait)
    wait = setTimeout(show, 450)
    window.visualViewport?.addEventListener('resize', show, { once: true })
  }
  itemId.value = id
}
onMounted(() => {
  document.addEventListener('focusin', watchFocus)
  document.addEventListener('focusout', () => setTimeout(watchFocus, 0))
})
onUnmounted(() => document.removeEventListener('focusin', watchFocus))

const item = () => s.basket.value.items.find((i) => i.id === itemId.value)
const next = () => itemId.value !== null && s.add(itemId.value)
const qty = (by: number) => {
  const it = item()
  if (it) s.setQty(it.id, it.qty + by)
}
</script>

<template>
  <Transition name="keybar">
    <!-- pointerdown is stopped so the field keeps its focus and the keyboard stays up -->
    <div v-if="touch && ready && itemId !== null && !s.sheet.value && s.settings.value.keys === 'pad'" class="keybar" @pointerdown.prevent @mousedown.prevent>
      <span class="keybar-total" aria-hidden="true">{{ s.fmt(s.sums.value.total) }}</span>
      <span class="keybar-qty">
        <button type="button" aria-label="One fewer" @click="qty(-1)"><Minus :size="18" :stroke-width="3" /></button>
        <b aria-hidden="true">×{{ item()?.qty ?? 1 }}</b>
        <button type="button" aria-label="One more" @click="qty(1)"><Plus :size="18" :stroke-width="3" /></button>
      </span>
      <button type="button" class="keybar-next" @click="next">Next <CornerDownLeft :size="18" :stroke-width="3" aria-hidden="true" /></button>
    </div>
  </Transition>
</template>
