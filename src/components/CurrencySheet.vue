<script setup lang="ts">
// Pick a currency: the common ones first, then every one the browser knows, searchable by code or name.
import { computed, ref } from 'vue'
import { useScreen } from '@/composables/useScreen'
import { COMMON, allCurrencies, currencyName } from '@/lib/currency'
import Flag from './Flag.vue'

const { settings, sheet, flagOf } = useScreen()
const q = ref('')
const all = allCurrencies().map((code) => ({ code, name: currencyName(code, 'en') }))
const common = COMMON.map((code) => all.find((c) => c.code === code) ?? { code, name: currencyName(code, 'en') })

const found = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return null
  return all.filter((c) => c.code.toLowerCase().includes(s) || c.name.toLowerCase().includes(s)).slice(0, 60)
})
const choose = (code: string) => {
  settings.value.currency = code
  sheet.value = null
}
</script>

<template>
  <section>
    <input v-model="q" class="field" type="search" placeholder="Search: dirham, EUR, yen…" aria-label="Search currencies" autocomplete="off" data-autofocus />
  </section>
  <section v-if="found">
    <p v-if="!found.length" class="note">No currency matches “{{ q }}”. Try its three-letter code.</p>
    <ul class="pick">
      <li v-for="c in found" :key="c.code">
        <button type="button" :aria-pressed="settings.currency === c.code" @click="choose(c.code)"><Flag :code="flagOf(c.code)" :label="c.code.slice(0, 2)" /><b>{{ c.code }}</b><span class="name">{{ c.name }}</span></button>
      </li>
    </ul>
  </section>
  <template v-else>
    <section>
      <h3>Common</h3>
      <ul class="pick">
        <li v-for="c in common" :key="c.code">
          <button type="button" :aria-pressed="settings.currency === c.code" @click="choose(c.code)"><Flag :code="flagOf(c.code)" :label="c.code.slice(0, 2)" /><b>{{ c.code }}</b><span class="name">{{ c.name }}</span></button>
        </li>
      </ul>
    </section>
    <section>
      <h3>All currencies</h3>
      <ul class="pick">
        <li v-for="c in all" :key="c.code">
          <button type="button" :aria-pressed="settings.currency === c.code" @click="choose(c.code)"><Flag :code="flagOf(c.code)" :label="c.code.slice(0, 2)" /><b>{{ c.code }}</b><span class="name">{{ c.name }}</span></button>
        </li>
      </ul>
    </section>
  </template>
</template>
