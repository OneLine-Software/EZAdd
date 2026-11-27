<script setup lang="ts">
// Taxes and fees: presets for the place you are in, common tips, the ones you saved, and your own.
import { computed, ref } from 'vue'
import { Check, Pencil, Plus, X } from 'lucide-vue-next'
import { useScreen } from '@/composables/useScreen'
import type { SavedTax } from '@/composables/useBasket'
import { CHECKED, COUNTRIES, FEES, findCountry, findPlace, taxesFor, type PresetTax } from '@/lib/taxPresets'
import Flag from './Flag.vue'

const s = useScreen()
const { settings, basket } = s
const view = ref<'main' | 'country' | 'place'>('main')
const q = ref('')

const country = computed(() => findCountry(settings.value.country))
const place = computed(() => findPlace(country.value, settings.value.place))
const presets = computed(() => taxesFor(country.value, place.value))
const where = computed(() => (country.value ? [country.value.name, place.value?.name].filter(Boolean).join(', ') : 'Choose a country'))
const checked = new Date(CHECKED + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

const countries = computed(() => {
  const t = q.value.trim().toLowerCase()
  return [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name)).filter((c) => !t || c.name.toLowerCase().includes(t) || c.code.toLowerCase() === t)
})
const places = computed(() => {
  const t = q.value.trim().toLowerCase()
  return (country.value?.places ?? []).filter((p) => !t || p.name.toLowerCase().includes(t) || p.code.toLowerCase() === t)
})

const chooseCountry = (code: string) => {
  settings.value.country = code
  settings.value.place = null
  q.value = ''
  view.value = findCountry(code)?.places ? 'place' : 'main'
}
const choosePlace = (code: string) => {
  settings.value.place = code
  q.value = ''
  view.value = 'main'
}

const asTax = (p: PresetTax): SavedTax => ({ type: 'percentage', value: String(p.rate), label: p.label })
const toggle = (t: SavedTax) => {
  const on = s.hasTax(t)
  if (on) s.removeTax(on.id)
  else s.addTax(t)
}
const addAll = () => presets.value.map(asTax).filter((t) => !s.hasTax(t)).forEach((t) => s.addTax(t))

// Your own: also where a preset goes to have its rate changed before it is added.
const type = ref<'percentage' | 'flat'>('percentage')
const value = ref('')
const label = ref('')
const remember = ref(false)
const valueField = ref<HTMLInputElement>()
const edit = (t: SavedTax) => {
  type.value = t.type
  value.value = t.value
  label.value = t.label
  valueField.value?.scrollIntoView({ block: 'center' })
  valueField.value?.focus({ preventScroll: true })
  valueField.value?.select()
}
// The currency's own sign for the fixed-amount switch, or its code where it has none.
const sign = computed(() => s.fmt(0).replace(/[\d.,\s]/g, '').slice(0, 3) || settings.value.currency)
const addOwn = () => {
  if (!value.value.trim()) return valueField.value?.focus()
  s.addTax({ type: type.value, value: value.value.trim(), label: label.value }, remember.value)
  value.value = ''
  label.value = ''
}
</script>

<template>
  <template v-if="view === 'main'">
    <p class="note tax-how">Tap anything with a + to add it to the basket. Tap it again to take it off.</p>
    <section v-if="basket.taxes.length">
      <h3>On this basket</h3>
      <div class="row">
        <button v-for="(t, i) in basket.taxes" :key="t.id" type="button" class="btn is-on" :aria-label="`Remove ${t.label}`" @click="s.removeTax(t.id)">
          {{ s.taxText(t) }} <small>{{ s.fmt(s.sums.value.taxes[i]) }}</small> <X :size="16" />
        </button>
      </div>
    </section>

    <section>
      <h3>Where you are</h3>
      <button type="button" class="btn is-wide tax-where" data-autofocus @click="view = 'country'">
        <Flag :code="country?.code" /> <span>{{ where }}</span> <small>Change</small>
      </button>
      <button v-if="country?.places" type="button" class="btn is-wide tax-where" @click="view = 'place'">
        <span>{{ place ? place.name : country.code === 'US' ? 'Choose a state' : 'Choose a province' }}</span> <small>{{ place ? 'Change' : 'Needed for a rate' }}</small>
      </button>
      <div v-if="presets.length" class="row">
        <span v-for="p in presets" :key="p.label" class="tax-preset">
          <button type="button" class="btn" :class="{ 'is-on': s.hasTax(asTax(p)) }" :aria-pressed="!!s.hasTax(asTax(p))" @click="toggle(asTax(p))"><component :is="s.hasTax(asTax(p)) ? Check : Plus" :size="16" :stroke-width="3" aria-hidden="true" />{{ p.label }} {{ p.rate }}%</button>
          <button type="button" class="icon-btn" :aria-label="`Change the ${p.label} rate before adding it`" @click="edit(asTax(p))"><Pencil :size="16" /></button>
        </span>
        <button v-if="presets.length > 1 && presets.some((p) => !s.hasTax(asTax(p)))" type="button" class="btn" @click="addAll"><Plus :size="16" :stroke-width="3" aria-hidden="true" />{{ presets.length === 2 ? 'Both' : 'All of them' }}</button>
      </div>
      <p v-if="place?.note" class="note">{{ place.note }}</p>
      <p v-else-if="country?.included" class="note">Prices on the shelf here usually have this in them already. Add it only when a price is shown without it.</p>
      <p v-else-if="country?.places && !place" class="note">Rates differ by {{ country.code === 'US' ? 'state' : 'province' }}.</p>
      <p v-else-if="!country" class="note">Pick a country to see its usual rate.</p>
    </section>

    <section>
      <h3>Tips and fees</h3>
      <div class="row">
        <button v-for="f in FEES" :key="f.label" type="button" class="btn" :class="{ 'is-on': s.hasTax(asTax(f)) }" :aria-pressed="!!s.hasTax(asTax(f))" @click="toggle(asTax(f))">
          <component :is="s.hasTax(asTax(f)) ? Check : Plus" :size="16" :stroke-width="3" aria-hidden="true" />{{ f.label.includes('%') ? f.label : `${f.label} ${f.rate}%` }}
        </button>
      </div>
    </section>

    <section v-if="settings.myTaxes.length">
      <h3>Yours</h3>
      <div class="row">
        <span v-for="(t, i) in settings.myTaxes" :key="i" class="tax-preset">
          <button type="button" class="btn" :class="{ 'is-on': s.hasTax(t) }" :aria-pressed="!!s.hasTax(t)" @click="toggle(t)"><component :is="s.hasTax(t) ? Check : Plus" :size="16" :stroke-width="3" aria-hidden="true" />{{ s.taxText(t) }}<template v-if="t.type === 'flat'"> {{ t.value }}</template></button>
          <button type="button" class="icon-btn" :aria-label="`Forget ${t.label}`" @click="s.forgetMyTax(i)"><X :size="16" /></button>
        </span>
      </div>
    </section>

    <section>
      <h3>Your own</h3>
      <form class="tax-own" @submit.prevent="addOwn">
        <div class="tax-own-fields">
          <div class="tax-kind" role="group" aria-label="Kind">
            <button type="button" :aria-pressed="type === 'percentage'" aria-label="A percent" title="A percent" @click="type = 'percentage'">%</button>
            <button type="button" :aria-pressed="type === 'flat'" aria-label="A fixed amount" title="A fixed amount" @click="type = 'flat'">{{ sign }}</button>
          </div>
          <input id="tax-value" ref="valueField" v-model="value" class="field" inputmode="decimal" :placeholder="type === 'percentage' ? 'Rate, like 8.25' : `Amount in ${settings.currency}`" :aria-label="type === 'percentage' ? 'Rate in percent' : 'Amount'" />
          <input id="tax-label" v-model="label" class="field" placeholder="Name, like City tax" aria-label="Name" maxlength="40" />
        </div>
        <div class="tax-own-end">
          <label class="tax-remember"><input id="tax-remember" v-model="remember" type="checkbox" /> Keep it for next time</label>
          <button type="submit" class="btn is-main"><Plus :size="16" :stroke-width="3" aria-hidden="true" />Add</button>
        </div>
      </form>
    </section>

    <p class="note">Rates for the United States, Canada and Europe were checked on {{ checked }}. Other countries show their standard national rate and have not been checked against a source yet. Every preset is a starting point: a city, a county or a kind of product can have its own, so change any rate with the pencil before adding it.</p>
  </template>

  <template v-else-if="view === 'country'">
    <section>
      <input v-model="q" class="field" type="search" placeholder="Search countries" aria-label="Search countries" autocomplete="off" data-autofocus />
      <ul class="pick">
        <li v-for="c in countries" :key="c.code">
          <button type="button" :aria-pressed="settings.country === c.code" @click="chooseCountry(c.code)"><Flag :code="c.code" /><span class="name" style="color: inherit">{{ c.name }}</span></button>
        </li>
      </ul>
      <p v-if="!countries.length" class="note">No preset for that country yet. Add its rate under “Your own” and keep it.</p>
      <button type="button" class="btn" @click="view = 'main'; q = ''">Back</button>
    </section>
  </template>

  <template v-else>
    <section>
      <input v-model="q" class="field" type="search" :placeholder="country?.code === 'US' ? 'Search states' : 'Search provinces'" aria-label="Search" autocomplete="off" data-autofocus />
      <ul class="pick">
        <li v-for="p in places" :key="p.code">
          <button type="button" :aria-pressed="settings.place === p.code" @click="choosePlace(p.code)">
            <b>{{ p.code }}</b><span class="name" style="color: inherit">{{ p.name }}</span><span class="note">{{ p.taxes.length ? p.taxes.map((t) => `${t.label.replace(p.code + ' ', '')} ${t.rate}%`).join(' + ') : 'none' }}</span>
          </button>
        </li>
      </ul>
      <button type="button" class="btn" @click="view = 'main'; q = ''">Back</button>
    </section>
  </template>
</template>

<style>
.tax-how { margin-bottom: -10px !important; }
.tax-where { justify-content: flex-start !important; }
.tax-where span:not(.flag) { flex: 1; text-align: start; }
.tax-preset { display: inline-flex; gap: 4px; }
.tax-own { display: grid; gap: 10px; }
.tax-own-fields { display: grid; grid-template-columns: auto minmax(0, 1fr) minmax(0, 1.3fr); gap: 8px; }
.tax-kind { display: flex; border: var(--bw) solid var(--line); border-radius: var(--radius-sm); overflow: hidden; background: var(--well); box-shadow: inset 0 0 0 1.5px var(--line); }
.tax-kind button { min-width: 40px; min-height: 46px; padding: 0 8px; border: 0; background: none; color: var(--soft); font: 800 0.9375rem/1 var(--font-text); }
.tax-kind button[aria-pressed='true'] { background: var(--ink); color: var(--surface); }
.tax-own-end { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.tax-remember { display: flex; align-items: center; gap: 10px; min-height: 44px; font-size: 0.875rem; text-transform: none; letter-spacing: 0; color: var(--soft); }
@container stage (max-width: 420px) { .tax-own-fields { grid-template-columns: auto minmax(0, 1fr); } .tax-own-fields #tax-label { grid-column: 1 / -1; } }
.tax-remember input { width: 20px; height: 20px; accent-color: var(--ink); }
</style>
