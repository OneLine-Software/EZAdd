<script setup lang="ts">
// The lab index: five directions on one basket. Pick a letter, or look at all five side by side.
import { ref, watch } from 'vue'
import A from './directions/A.vue'
import B from './directions/B.vue'
import C from './directions/C.vue'
import D from './directions/D.vue'
import E from './directions/E.vue'
import { useBasket } from '@/composables/useBasket'

const DIRECTIONS = [
  { key: 'a', is: A, name: 'Kitchen ledger', line: 'The control: Family Funds as it is. Milk, mint and butter, keys on a solid edge.', ref: 'Family Funds DESIGN.md' },
  { key: 'b', is: B, name: 'Till roll', line: 'The whole screen is one receipt. Each line prints out of the slot; the total is the foot of the slip.', ref: 'A shop receipt; a thermal printer' },
  { key: 'c', is: C, name: 'Price sticker', line: 'Sale colours and fat numerals. Every item is a sticker, the total is a starburst.', ref: 'Supermarket shelf tags and sale stickers' },
  { key: 'd', is: D, name: 'Pocket calculator', line: 'A device, not a page: an LCD, a paper tape and fat keys of its own.', ref: 'Braun ET66; Casio desk calculators' },
  { key: 'e', is: E, name: 'One accent', line: 'Black, white and one colour you choose. Soft shapes that squish under the thumb.', ref: 'The current plus mark, grown up' },
]

const fromHash = () => (location.hash.replace('#', '') || 'all')
const view = ref(fromHash())
window.addEventListener('hashchange', () => (view.value = fromHash()))
const go = (key: string) => {
  view.value = key
  try { history.replaceState(null, '', `#${key}`) } catch { /* a sandboxed page: the view still changes */ }
}

// The lab always opens on the same filled basket, so the five are compared on the same content.
const { basket, settings } = useBasket()
if (!basket.value.items.some((i) => i.value !== '')) {
  basket.value = {
    items: [
      { id: 1, name: 'Flat white', value: '21.00', qty: 2 },
      { id: 2, name: 'Sourdough loaf', value: '28.50', qty: 1 },
      { id: 3, name: 'Eggs, dozen', value: '17.25', qty: 1 },
      { id: 4, name: 'Dates', value: '12.00', qty: 3 },
    ],
    taxes: [{ id: 5, type: 'percentage', value: '5', label: 'VAT' }],
    people: 2,
    nextId: 6,
  }
}

const query = window.matchMedia('(prefers-color-scheme: dark)')
const dark = ref(new URLSearchParams(location.search).get('theme') === 'dark' || (query.matches && new URLSearchParams(location.search).get('theme') !== 'light'))
query.addEventListener('change', (e) => (dark.value = e.matches))
watch(dark, () => (settings.value.theme = 'system'))
</script>

<template>
  <div class="lab" :data-theme="dark ? 'dark' : 'light'">
    <nav class="lab-bar" aria-label="Lab">
      <strong>EZAdd lab</strong>
      <button :aria-pressed="view === 'all'" @click="go('all')"><span>All five</span></button>
      <button v-for="d in DIRECTIONS" :key="d.key" :aria-pressed="view === d.key" @click="go(d.key)">
        <span>{{ d.key.toUpperCase() }}</span>
      </button>
      <span class="sp" />
      <button @click="dark = !dark"><span>{{ dark ? 'Dark' : 'Light' }}</span></button>
    </nav>

    <div v-if="view === 'all'" class="lab-all">
      <figure v-for="d in DIRECTIONS" :key="d.key">
        <div class="stage"><component :is="d.is" :dark="dark" /></div>
        <figcaption>
          <b>{{ d.key.toUpperCase() }}. {{ d.name }}</b>
          {{ d.line }} <br /><i>Reference: {{ d.ref }}</i><br />
          <button @click="go(d.key)">Open {{ d.key.toUpperCase() }} full size</button>
        </figcaption>
      </figure>
    </div>

    <div v-else class="lab-one">
      <template v-for="d in DIRECTIONS" :key="d.key">
        <template v-if="view === d.key">
          <div class="lab-note"><b>{{ d.key.toUpperCase() }}. {{ d.name }}.</b> {{ d.line }} <i>Reference: {{ d.ref }}.</i></div>
          <div class="stage"><component :is="d.is" :dark="dark" /></div>
        </template>
      </template>
    </div>
  </div>
</template>
