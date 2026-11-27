<script setup lang="ts">
// The frame: which theme is on, its colour and mode, and the parts every theme shares.
import { computed, onMounted, onUnmounted, watchEffect } from 'vue'
import { useScreen } from '@/composables/useScreen'
import { useShortcuts } from '@/composables/useShortcuts'
import { useToast } from '@/composables/useToast'
import Accent from '@/themes/Accent.vue'
import Till from '@/themes/Till.vue'
import Sticker from '@/themes/Sticker.vue'
import Calc from '@/themes/Calc.vue'
import SheetHost from '@/components/SheetHost.vue'
import Toasts from '@/components/Toasts.vue'

const { settings, dark } = useScreen()
useShortcuts()
const { addToast } = useToast()

const SCREENS = { accent: Accent, till: Till, sticker: Sticker, calc: Calc }
const screen = computed(() => SCREENS[settings.value.look] ?? Accent)
const hue = computed(() => settings.value.hues[settings.value.look])

// The browser's own bar takes the colour of the top of each theme.
const BAR = { accent: ['#ffffff', '#0b0b0c'], till: ['#24211e', '#000000'], sticker: ['#fff3cf', '#17153b'], calc: ['#ebe5d5', '#1e1d1b'] }
watchEffect(() => {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BAR[settings.value.look][dark.value ? 1 : 0])
})

// The screen is as tall as what is left above the phone keyboard, so the total never hides under it.
const fit = () => document.documentElement.style.setProperty('--vvh', `${window.visualViewport?.height ?? window.innerHeight}px`)
const note = (e: Event) => addToast((e as CustomEvent).detail.message, 'info')
onMounted(() => {
  fit()
  window.visualViewport?.addEventListener('resize', fit)
  window.addEventListener('pwa-update', note)
  window.addEventListener('pwa-ready', note)
})
onUnmounted(() => {
  window.visualViewport?.removeEventListener('resize', fit)
  window.removeEventListener('pwa-update', note)
  window.removeEventListener('pwa-ready', note)
})
</script>

<template>
  <div class="app" :data-look="settings.look" :data-mode="dark ? 'dark' : 'light'" :style="{ '--hue': hue }">
    <component :is="screen" />
    <SheetHost />
    <Toasts />
  </div>
</template>
