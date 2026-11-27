<script setup lang="ts">
// The frame: which theme is on, its colour and mode, and the parts every theme shares.
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { useScreen } from '@/composables/useScreen'
import { useShortcuts } from '@/composables/useShortcuts'
import { useToast } from '@/composables/useToast'
import Accent from '@/themes/Accent.vue'
import Till from '@/themes/Till.vue'
import Sticker from '@/themes/Sticker.vue'
import Calc from '@/themes/Calc.vue'
import SheetHost from '@/components/SheetHost.vue'
import Toasts from '@/components/Toasts.vue'
import KeyBar from '@/components/KeyBar.vue'

const { settings, dark } = useScreen()
useShortcuts()
const { addToast } = useToast()

const SCREENS = { accent: Accent, till: Till, sticker: Sticker, calc: Calc }
const screen = computed(() => SCREENS[settings.value.look] ?? Accent)
const hue = computed(() => settings.value.hues?.[settings.value.look] ?? 265)

// The browser's own bar takes the colour of the top of each theme.
const BAR = { accent: ['#ffffff', '#0b0b0c'], till: ['#24211e', '#000000'], sticker: ['#fff3cf', '#17153b'], calc: ['#ebe5d5', '#1e1d1b'] }
watchEffect(() => {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', (BAR[settings.value.look] ?? BAR.accent)[dark.value ? 1 : 0])
})

// The screen is as tall as what is left above the phone keyboard, so the total never hides under it.
const fit = () => {
  document.documentElement.style.setProperty('--vvh', `${window.visualViewport?.height ?? window.innerHeight}px`)
  // iOS slides the page up under the keyboard in place of resizing it. Put it back, so the header and the bar stay where they are.
  if (window.visualViewport && window.visualViewport.offsetTop > 0) window.scrollTo(0, 0)
}

// When the app opens, its items arrive one after another. After that, and on a change of theme, things arrive at once:
// the new look opening out is enough movement for one moment.
const fresh = ref(true)
let freshTimer: ReturnType<typeof setTimeout> | undefined
freshTimer = setTimeout(() => (fresh.value = false), 1100)

// The other themes' typefaces are fetched while nothing else is happening, so a change of theme never
// shows one face and then jumps to another.
const FACES = ['Bricolage Grotesque', 'Martian Mono', 'Instrument Serif', 'Lilita One', 'Nunito', 'Doto', 'Space Grotesk']
const warm = () => FACES.forEach((f) => document.fonts?.load(`${f === 'Instrument Serif' ? 'italic ' : ''}1em "${f}"`).catch(() => {}))
const note = (e: Event) => addToast((e as CustomEvent).detail.message, 'info')
onMounted(() => {
  fit()
  if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 3000 })
  else setTimeout(warm, 1500)
  window.visualViewport?.addEventListener('resize', fit)
  window.visualViewport?.addEventListener('scroll', fit)
  window.addEventListener('pwa-update', note)
  window.addEventListener('pwa-ready', note)
})
onUnmounted(() => {
  clearTimeout(freshTimer)
  window.visualViewport?.removeEventListener('resize', fit)
  window.visualViewport?.removeEventListener('scroll', fit)
  window.removeEventListener('pwa-update', note)
  window.removeEventListener('pwa-ready', note)
})
</script>

<template>
  <div class="app" :class="{ 'is-fresh': fresh }" :data-look="settings.look" :data-mode="dark ? 'dark' : 'light'" :style="{ '--hue': hue }">
    <component :is="screen" :key="settings.look" />
    <KeyBar />
    <SheetHost />
    <Toasts />
  </div>
</template>
