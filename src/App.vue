<script setup lang="ts">
// The frame: which theme is on, its colour and mode, and the parts every theme shares.
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
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

// For the first moments of a theme its items arrive one after another. After that a new item arrives at once.
const fresh = ref(true)
let freshTimer: ReturnType<typeof setTimeout> | undefined
const settle = () => { clearTimeout(freshTimer); fresh.value = true; freshTimer = setTimeout(() => (fresh.value = false), 1200) }
watch(() => settings.value.look, settle, { immediate: true })
const note = (e: Event) => addToast((e as CustomEvent).detail.message, 'info')
onMounted(() => {
  fit()
  window.visualViewport?.addEventListener('resize', fit)
  window.visualViewport?.addEventListener('scroll', fit)
  window.addEventListener('pwa-update', note)
  window.addEventListener('pwa-ready', note)
})
onUnmounted(() => {
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
