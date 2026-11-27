<script setup lang="ts">
// Settings: the theme, its accent, light or dark, the currency, then feedback, shortcuts and who made it.
import { computed, nextTick, ref } from 'vue'
import { Github, Coffee } from 'lucide-vue-next'
import { useScreen } from '@/composables/useScreen'
import { HUES, type Look } from '@/composables/useBasket'
import { SHORTCUTS } from '@/composables/useShortcuts'
import { useApi } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'
import { currencyName } from '@/lib/currency'
import Flag from './Flag.vue'
import Credit from './Credit.vue'

const s = useScreen()
const { settings } = s
const LOOKS: { key: Look; name: string; line: string }[] = [
  { key: 'accent', name: 'One accent', line: 'Black, white and your colour' },
  { key: 'till', name: 'Till roll', line: 'One long receipt' },
  { key: 'sticker', name: 'Price sticker', line: 'Sale tags and fat numbers' },
  { key: 'calc', name: 'Pocket calculator', line: 'Its own keys and screen' },
]
const hue = computed({
  get: () => settings.value.hues[settings.value.look],
  set: (v: number) => (settings.value.hues[settings.value.look] = v),
})
// The new look opens out from the button that was pressed, where the browser can do that.
const swap = (e: MouseEvent, change: () => void) => {
  const doc = document as Document & { startViewTransition?: (cb: () => Promise<void> | void) => unknown }
  if (!doc.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return change()
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  document.documentElement.style.setProperty('--vt-x', `${r.left + r.width / 2}px`)
  document.documentElement.style.setProperty('--vt-y', `${r.top + r.height / 2}px`)
  doc.startViewTransition(async () => { change(); await nextTick() })
}
const touch = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches
const isOwn = computed(() => hue.value === HUES[settings.value.look])

// Feedback goes to the app's own small API (Cloudflare Pages Functions).
const { submitFeedback, submitFeatureRequest } = useApi()
const toast = useToast()
const form = ref<'idea' | 'feedback' | null>(null)
const sending = ref(false)
const title = ref('')
const message = ref('')
const email = ref('')
const rating = ref(5)
const send = async () => {
  if (form.value === 'idea' ? !title.value.trim() : !message.value.trim()) return
  sending.value = true
  try {
    if (form.value === 'idea') await submitFeatureRequest({ title: title.value.trim(), description: message.value.trim() || undefined, email: email.value.trim() || undefined })
    else await submitFeedback({ message: message.value.trim(), email: email.value.trim() || undefined, rating: rating.value })
    toast.success('Sent. Thank you.')
    title.value = message.value = ''
    form.value = null
  } catch {
    toast.error('That did not send. Check your connection and try again.')
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <section>
    <h3>Theme</h3>
    <div class="set-looks" role="group" aria-label="Theme">
      <button v-for="l in LOOKS" :key="l.key" type="button" class="set-look" :data-look-chip="l.key" :aria-pressed="settings.look === l.key" @click="swap($event, () => (settings.look = l.key))">
        <i aria-hidden="true"><b>12</b></i>
        <span><strong>{{ l.name }}</strong><small>{{ l.line }}</small></span>
      </button>
    </div>
  </section>

  <section>
    <h3>Accent colour</h3>
    <input id="set-hue" v-model.number="hue" class="set-hue" type="range" min="0" max="359" step="1" aria-label="Accent colour, by hue" />
    <div class="row">
      <span class="set-swatch" aria-hidden="true">Aa 12.50</span>
      <button type="button" class="btn" :disabled="isOwn" @click="hue = HUES[settings.look]">{{ isOwn ? 'This theme’s own colour' : 'Back to this theme’s own' }}</button>
    </div>
    <p class="note">Each theme keeps its own accent. Text on it stays readable whichever colour you pick.</p>
  </section>

  <section>
    <h3>Light or dark</h3>
    <div class="row" role="group" aria-label="Light or dark">
      <button v-for="m in (['system', 'light', 'dark'] as const)" :key="m" type="button" class="btn" :class="{ 'is-on': settings.theme === m }" :aria-pressed="settings.theme === m" @click="swap($event, () => (settings.theme = m))">
        {{ m === 'system' ? 'Follow the device' : m === 'light' ? 'Light' : 'Dark' }}
      </button>
    </div>
  </section>

  <section v-if="touch">
    <h3>Keyboard for prices</h3>
    <div class="row" role="group" aria-label="Keyboard for prices">
      <button type="button" class="btn" :class="{ 'is-on': settings.keys === 'pad' }" :aria-pressed="settings.keys === 'pad'" @click="settings.keys = 'pad'">Number pad</button>
      <button type="button" class="btn" :class="{ 'is-on': settings.keys === 'full' }" :aria-pressed="settings.keys === 'full'" @click="settings.keys = 'full'">Full, with return</button>
    </div>
    <p class="note">{{ settings.keys === 'pad' ? 'Big number keys, with a Next button in a bar above them.' : 'The phone’s own keyboard on its number page. Return starts the next item.' }}</p>
  </section>

  <section>
    <h3>Currency</h3>
    <button type="button" class="btn is-wide set-cur" @click="s.sheet.value = 'currency'">
      <Flag :code="s.flagOf(settings.currency)" :label="settings.currency.slice(0, 2)" /> <b>{{ settings.currency }}</b> <span>{{ currencyName(settings.currency, 'en') }}</span> <small>Change</small>
    </button>
  </section>

  <section>
    <h3>Tell me what you think</h3>
    <div v-if="!form" class="row">
      <button type="button" class="btn" @click="form = 'idea'">Ask for a feature</button>
      <button type="button" class="btn" @click="form = 'feedback'">Send feedback</button>
    </div>
    <form v-else class="set-form" @submit.prevent="send">
      <input v-if="form === 'idea'" id="fb-title" v-model="title" class="field" placeholder="The feature, in a few words" aria-label="Feature" maxlength="120" required />
      <div v-else class="row" role="group" aria-label="How is EZAdd, from 1 to 5">
        <button v-for="n in 5" :key="n" type="button" class="btn" :class="{ 'is-on': rating === n }" :aria-pressed="rating === n" @click="rating = n">{{ n }}</button>
        <span class="note">out of 5</span>
      </div>
      <textarea id="fb-message" v-model="message" class="field" :placeholder="form === 'idea' ? 'Anything that helps explain it (optional)' : 'What works, what does not'" :aria-label="form === 'idea' ? 'Details' : 'Feedback'" :required="form === 'feedback'" />
      <input id="fb-email" v-model="email" class="field" type="email" placeholder="Email, if you want a reply (optional)" aria-label="Email, optional" autocomplete="email" />
      <div class="row">
        <button type="submit" class="btn is-main" :disabled="sending">{{ sending ? 'Sending…' : 'Send' }}</button>
        <button type="button" class="btn" @click="form = null">Cancel</button>
      </div>
    </form>
  </section>

  <section class="set-keys">
    <h3>Keyboard</h3>
    <dl>
      <template v-for="[key, what] in SHORTCUTS" :key="key"><dt>{{ key }}</dt><dd>{{ what }}</dd></template>
    </dl>
  </section>

  <section>
    <div class="row">
      <a class="btn" href="https://github.com/OneLine-Software/EZAdd" target="_blank" rel="noopener"><Github :size="18" /> The code</a>
      <a class="btn" href="https://www.buymeacoffee.com/OneLineSoftware" target="_blank" rel="noopener"><Coffee :size="18" /> Buy me a coffee</a>
    </div>
    <p class="note">Your basket and settings stay on this device. EZAdd works with no connection once it has loaded.</p>
    <Credit />
  </section>
</template>

<style>
.set-looks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.set-look { display: grid; gap: 8px; padding: 8px; border: 0; border-radius: 16px; background: none; color: inherit; text-align: start; box-shadow: inset 0 0 0 1.5px var(--line); font: inherit; text-transform: none; letter-spacing: 0; }
.set-look[aria-pressed='true'] { box-shadow: inset 0 0 0 3px var(--ink); }
.set-look span { display: grid; padding: 0 4px 2px; }
.set-look strong { font-weight: 800; font-size: 0.875rem; }
.set-look small { font-size: 0.75rem; color: var(--soft); }
/* Each chip is a tiny picture of its theme, in that theme's own fixed colours, so it reads the same from any theme. */
.set-look i { display: grid; place-items: center; height: 64px; border-radius: 10px; font-style: normal; overflow: hidden; }
.set-look i b { display: grid; place-items: center; font-size: 1.5rem; line-height: 1; }
[data-look-chip='accent'] i { background: #fff; box-shadow: inset 0 0 0 1px #0002; }
[data-look-chip='accent'] i b { width: 74%; height: 70%; border-radius: 22px 30px 24px 32px; background: oklch(0.84 0.15 265); color: #0b0b0c; font: 800 1.5rem 'Bricolage Grotesque', sans-serif; letter-spacing: -0.05em; }
[data-look-chip='till'] i { background: #d8d2c4; align-items: start; }
[data-look-chip='till'] i b { width: 62%; height: 120%; background: #fffdf6; color: #1f1c18; font: 800 1.2rem 'Martian Mono', monospace; border-bottom: 2px dashed #6b655a; }
[data-look-chip='sticker'] i { background: #fff3cf; }
[data-look-chip='sticker'] i b { padding: 6px 14px; border: 2.5px solid #17153b; border-radius: 10px; background: oklch(0.58 0.23 25); color: #fff; font: 400 1.5rem 'Lilita One', sans-serif; transform: rotate(-4deg); box-shadow: 3px 3px 0 #17153b; }
[data-look-chip='calc'] i { background: #ebe5d5; }
[data-look-chip='calc'] i b { width: 70%; padding: 6px 10px; justify-items: end; border-radius: 6px; background: #b7c6ab; color: #17231a; font: 900 1.4rem 'Doto', monospace; box-shadow: inset 0 2px 0 #0003; }
.set-hue { width: 100%; height: 44px; appearance: none; -webkit-appearance: none; background: none; }
.set-hue::-webkit-slider-runnable-track { height: 16px; border-radius: 999px; background: linear-gradient(90deg in oklch longer hue, oklch(0.8 0.15 0), oklch(0.8 0.15 359)); }
.set-hue::-moz-range-track { height: 16px; border-radius: 999px; background: linear-gradient(90deg in oklch longer hue, oklch(0.8 0.15 0), oklch(0.8 0.15 359)); }
.set-hue::-webkit-slider-thumb { -webkit-appearance: none; width: 30px; height: 30px; margin-top: -7px; border-radius: 50%; background: var(--acc); border: 3px solid var(--ink); }
.set-hue::-moz-range-thumb { width: 24px; height: 24px; border-radius: 50%; background: var(--acc); border: 3px solid var(--ink); }
.set-swatch { display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border-radius: var(--radius-sm); background: var(--acc); color: var(--on-acc); font: 700 1rem var(--font-display); }
.sheet .btn:disabled { opacity: 0.6; cursor: default; }
.set-cur { justify-content: flex-start !important; }
.set-cur span:not(.flag) { flex: 1; text-align: start; font-weight: 500; text-transform: none; letter-spacing: 0; }
.set-form { display: grid; gap: 10px; }
.set-keys dl { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 6px 14px; font-size: 0.8125rem; text-transform: none; letter-spacing: 0; }
.set-keys dt { font-weight: 700; white-space: nowrap; }
.set-keys dd { margin: 0; color: var(--soft); }
@media (pointer: coarse) { .set-keys { display: none !important; } }
.sheet a.btn { text-decoration: none; }
</style>
