<script setup lang="ts">
// Shows the open sheet over the screen, keeps focus inside it and gives it back on close.
import { nextTick, ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { useScreen } from '@/composables/useScreen'
import SettingsSheet from './SettingsSheet.vue'
import TaxSheet from './TaxSheet.vue'
import CurrencySheet from './CurrencySheet.vue'
import ShareSheet from './ShareSheet.vue'

const { sheet } = useScreen()
const TITLES = { settings: 'Settings', tax: 'Taxes and fees', currency: 'Currency', share: 'Share this basket' }
const panel = ref<HTMLElement>()
let opener: HTMLElement | null = null

watch(sheet, async (now, before) => {
  if (now && !before) opener = document.activeElement as HTMLElement | null
  if (now) {
    await nextTick()
    panel.value?.querySelector<HTMLElement>('[data-autofocus], .sheet-body button, .sheet-body input')?.focus({ preventScroll: true })
  } else {
    opener?.focus?.({ preventScroll: true })
  }
})

const trap = (e: KeyboardEvent) => {
  if (e.key !== 'Tab' || !panel.value) return
  const els = [...panel.value.querySelectorAll<HTMLElement>('button, input, textarea, select, a[href]')].filter((el) => !el.hasAttribute('disabled') && el.offsetParent)
  if (!els.length) return
  const first = els[0]
  const last = els[els.length - 1]
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
}
</script>

<template>
  <Transition name="sheet">
    <div v-if="sheet" class="sheet-back" @click.self="sheet = null" @keydown="trap">
      <div ref="panel" class="sheet" role="dialog" aria-modal="true" :aria-label="TITLES[sheet]">
        <header class="sheet-head">
          <h2>{{ TITLES[sheet] }}</h2>
          <button type="button" class="icon-btn" aria-label="Close" @click="sheet = null"><X :size="20" /></button>
        </header>
        <div class="sheet-body">
          <SettingsSheet v-if="sheet === 'settings'" />
          <TaxSheet v-else-if="sheet === 'tax'" />
          <CurrencySheet v-else-if="sheet === 'currency'" />
          <ShareSheet v-else-if="sheet === 'share'" />
        </div>
      </div>
    </div>
  </Transition>
</template>
