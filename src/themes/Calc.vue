<script setup lang="ts">
// Pocket calculator: a device, not a page. An LCD, a paper tape and fat keys of its own, so the phone keyboard never opens.
import { computed, nextTick, watch } from 'vue'
import { Settings } from 'lucide-vue-next'
import { useScreen } from '@/composables/useScreen'
import Flag from '@/components/Flag.vue'
import Credit from '@/components/Credit.vue'
import Kbd from '@/components/Kbd.vue'

const s = useScreen()
const { basket, sums, shares, root, fmt, plain, taxText, active, sheet, settings, copied } = s

const current = computed(() => basket.value.items.find((i) => i.id === active.value) ?? basket.value.items[basket.value.items.length - 1])
watch(() => basket.value.items.length, async () => {
  await nextTick()
  root.value?.querySelector('.ca-tape li[aria-current="true"]')?.scrollIntoView({ block: 'nearest' })
})

// A key ticks under the thumb where the phone can do it. Never with reduced motion.
const tick = () => {
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) navigator.vibrate?.(8)
}
const type = (ch: string) => {
  const item = current.value
  if (!item) return
  tick()
  active.value = item.id
  if (ch === '.' && item.value.includes('.')) return
  if (item.value.replace(/\D/g, '').length >= 9) return
  item.value = item.value === '0' && ch !== '.' ? ch : item.value + ch
}
const back = () => { tick(); if (current.value) current.value.value = current.value.value.slice(0, -1) }
const qty = (by: number) => { tick(); if (current.value) s.setQty(current.value.id, current.value.qty + by) }
const next = () => {
  tick()
  // An empty line is reused, so pressing + twice does not leave a gap.
  if (current.value && current.value.value === '') return
  active.value = s.addItem(current.value?.id)
}
const split = () => { tick(); basket.value.people = basket.value.people >= 6 ? 1 : basket.value.people + 1 }
</script>

<template>
  <div ref="root" class="ca">
    <div class="ca-device">
      <header class="ca-brand">
        <svg class="ca-mark" viewBox="0 0 48 48" aria-hidden="true">
          <rect x="3" y="8" width="42" height="38" rx="10" fill="var(--acc-edge)" />
          <rect x="3" y="3" width="42" height="38" rx="10" fill="var(--acc)" />
          <path d="M24 12v20M14 22h20" stroke="var(--on-acc)" stroke-width="5" stroke-linecap="round" />
        </svg>
        <h1>EZAdd <small>EZ-74</small></h1>
        <i class="ca-solar" aria-hidden="true" />
        <button type="button" class="ca-cur" aria-label="Currency" @click="sheet = 'currency'"><Flag :code="s.flagOf(settings.currency)" /> {{ settings.currency }}</button>
        <button type="button" class="ca-cur ca-set" aria-label="Settings" title="Settings ( , )" @click="sheet = 'settings'"><Settings :size="18" /></button>
      </header>

      <button type="button" class="ca-lcd" :style="{ '--chars': fmt(sums.total).length }" aria-live="polite" title="Copy the total" @click="s.copy('total')">
        <span class="ca-lcd-top">
          <span>SUB {{ plain(sums.subtotal) }}</span>
          <span v-if="basket.taxes.length">TAX {{ plain(sums.taxTotal) }}</span>
          <span v-if="basket.people > 1">÷{{ basket.people }} = {{ plain(shares[0]) }}</span>
        </span>
        <output :key="sums.total" :class="{ 'is-copied': copied === 'total' }">{{ fmt(sums.total) }}</output>
      </button>

      <section class="ca-tape" aria-label="Basket">
        <TransitionGroup tag="ul" name="ca-line" appear>
          <li v-for="(item, i) in basket.items" :key="item.id" :style="{ '--i': i }" :aria-current="item.id === current?.id" @click="active = item.id">
            <span class="ca-n">{{ String(i + 1).padStart(2, '0') }}</span>
            <input v-model="item.name" class="ca-name" :placeholder="`item ${i + 1}`" :aria-label="`Name of item ${i + 1}`" maxlength="40" @focus="active = item.id" />
            <span v-if="item.qty !== 1" :key="item.qty" class="ca-x bump">×{{ item.qty }}</span>
            <input
              class="ca-price" inputmode="none" placeholder="0.00" :value="item.value" :data-price="item.id" :aria-label="`Price of item ${i + 1}`"
              @focus="active = item.id" @input="s.onInput($event, item)" @keydown="s.onKey($event, item)" @paste="s.onPaste($event, item)"
            />
            <button type="button" :aria-label="`Remove item ${i + 1}`" @click.stop="s.removeItem(item.id)">×</button>
          </li>
        </TransitionGroup>
        <p v-if="basket.taxes.length" class="ca-taxline">
          <button v-for="t in basket.taxes" :key="t.id" type="button" :aria-label="`Remove ${t.label}`" @click="s.removeTax(t.id)">{{ taxText(t) }} ×</button>
        </p>
        <Credit />
      </section>

      <section class="ca-keys" aria-label="Keys">
        <button type="button" class="ca-fn" aria-label="Clear the basket" @click="s.clear()">C<Kbd k="⇧⌫" /></button>
        <button type="button" class="ca-fn" @click="sheet = 'tax'">TAX<Kbd k="T" /></button>
        <button type="button" class="ca-fn" aria-label="Split between more people" @click="split()">÷{{ basket.people > 1 ? basket.people : '' }}</button>
        <button type="button" class="ca-fn" @click="sheet = 'share'"><Kbd k="H" />{{ copied === 'receipt' || copied === 'link' ? 'OK' : 'SHARE' }}</button>
        <button v-for="k in ['7', '8', '9']" :key="k" type="button" @click="type(k)">{{ k }}</button>
        <button type="button" class="ca-fn" aria-label="Delete a digit" @click="back()">⌫</button>
        <button v-for="k in ['4', '5', '6']" :key="k" type="button" @click="type(k)">{{ k }}</button>
        <button type="button" class="ca-fn" aria-label="One more of this item" @click="qty(1)">×<sup>+</sup></button>
        <button v-for="k in ['1', '2', '3']" :key="k" type="button" @click="type(k)">{{ k }}</button>
        <button type="button" class="ca-fn" aria-label="One fewer of this item" @click="qty(-1)">×<sup>−</sup></button>
        <button type="button" @click="type('0')">0</button>
        <button type="button" @click="type('.')">.</button>
        <button type="button" class="ca-plus" aria-label="Next item" @click="next()">+<Kbd k="Enter" /></button>
      </section>
    </div>
  </div>
</template>

<style>
.ca { position: absolute; inset: 0; display: flex; font: 500 15px/1.3 var(--font-text); }
.ca button { border: 0; background: none; }
.ca input { border: 0; background: none; outline: none; min-width: 0; font: inherit; }
.ca :focus-visible { outline: 3px solid var(--acc); outline-offset: 2px; }
.ca-device { flex: 1; display: grid; grid-template-rows: auto auto minmax(0, 1fr) auto; gap: 10px; padding: calc(12px + env(safe-area-inset-top, 0px)) 14px calc(16px + env(safe-area-inset-bottom, 0px)); background: var(--surface); min-height: 0; }
.ca-brand { display: flex; align-items: center; gap: 10px; }
.ca-mark { width: 34px; height: 34px; flex: none; }
.ca-brand h1 { flex: 1; margin: 0; font-size: 1.15rem; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
.ca-brand h1 small { font-size: 0.6rem; font-weight: 500; letter-spacing: 0.14em; color: var(--soft); margin-left: 4px; }
.ca-solar { width: 48px; height: 20px; border-radius: 3px; background: repeating-linear-gradient(90deg, #2b2320 0 14px, #4a3a33 14px 16px); }
.ca-cur { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 40px; padding: 0 10px; border-radius: 6px; box-shadow: inset 0 0 0 1.5px var(--soft); font-weight: 700; font-size: 0.75rem; letter-spacing: 0.06em; color: var(--ink); }
.ca-set { width: 40px; padding: 0; }
.ca-lcd { display: grid; grid-template-columns: minmax(0, 1fr); container-type: inline-size; gap: 2px; text-align: left; padding: 8px 14px 6px; border-radius: 10px; background: var(--lcd) !important; color: var(--lcd-ink); box-shadow: inset 0 3px 0 #0003, inset 0 0 0 2px #0002; font-family: 'Doto', monospace; font-weight: 900; }
.ca-lcd-top { display: flex; flex-wrap: wrap; gap: 0 14px; font-size: 0.82rem; min-height: 1.2em; }
.ca-lcd output { display: block; text-align: right; font-size: min(3.4rem, calc(100cqw / (var(--chars) * 0.62))); line-height: 1; letter-spacing: -0.02em; white-space: nowrap; }
.ca-tape { min-height: 0; overflow-y: auto; border-radius: 6px; background: var(--tape); padding: 2px 10px 8px; box-shadow: 0 2px 0 #0002; }
.ca-tape ul { list-style: none; margin: 0; padding: 0; }
.ca-tape li { display: flex; align-items: center; gap: 8px; min-height: 42px; border-bottom: 1px solid var(--line); font-size: 0.9rem; }
.ca-tape li[aria-current='true'] { box-shadow: inset 3px 0 0 var(--acc); margin-left: -10px; padding-left: 10px; }
.ca-n { font: 700 0.7rem 'Doto', monospace; color: var(--soft); }
.ca-name { flex: 1; text-overflow: ellipsis; }
.ca-x { font-weight: 700; color: var(--acc-edge); }
.app[data-mode='dark'] .ca-x { color: var(--acc); }
.ca-price { width: 4.6em; text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; caret-color: var(--acc); }
.ca-tape li button { width: 32px; height: 42px; color: var(--soft); }
.ca-taxline { margin: 0; display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 0 2px; }
.ca-taxline button { min-height: 32px; padding: 0 8px; border-radius: 4px; box-shadow: inset 0 0 0 1.5px var(--soft); font-size: 0.75rem; font-weight: 700; color: var(--ink); }
.ca .credit { padding-top: 10px; font-size: 0.72rem; }
.ca-keys { display: grid; grid-template-columns: repeat(4, 1fr); gap: 9px 8px; padding-bottom: 5px; }
.ca-keys button { min-height: 50px; border-radius: 14px; background: var(--key); color: var(--key-ink); font-size: 1.35rem; font-weight: 700; box-shadow: 0 5px 0 var(--key-edge); transition: transform 90ms, box-shadow 90ms; }
.ca-keys button:active { transform: translateY(4px); box-shadow: 0 1px 0 var(--key-edge); }
.ca-keys .ca-fn { background: var(--fn); color: var(--fn-ink); box-shadow: 0 5px 0 var(--fn-edge); font-size: 0.85rem; letter-spacing: 0.04em; }
.ca-keys .ca-fn:active { box-shadow: 0 1px 0 var(--fn-edge); }
.ca-keys .ca-fn:nth-child(n + 5) { font-size: 1.2rem; }
.ca-keys .ca-plus { grid-column: span 2; background: var(--acc); color: var(--on-acc); font-size: 1.8rem; box-shadow: 0 5px 0 var(--acc-edge); }
.ca-keys .ca-plus:active { box-shadow: 0 1px 0 var(--acc-edge); }
/* The screen refreshes like an LCD: a new total blinks in, and the device switches on when the theme opens. */
.ca-lcd output { animation: ca-refresh 160ms steps(2); }
@keyframes ca-refresh { from { opacity: 0.25; } }
.ca-lcd output.is-copied { animation: ca-blink 480ms steps(1) 1; }
@keyframes ca-blink { 0%, 50% { opacity: 0.2; } 25%, 75% { opacity: 1; } }
.is-fresh .ca-lcd { animation: ca-on 700ms steps(5) both; }
@keyframes ca-on { from { filter: brightness(0.45) saturate(0.3); } }
.is-fresh .ca-keys button { animation: ca-keys 420ms var(--ease-out) both; }
.is-fresh .ca-keys button:nth-child(n + 5) { animation-delay: 50ms; }
.is-fresh .ca-keys button:nth-child(n + 9) { animation-delay: 100ms; }
.is-fresh .ca-keys button:nth-child(n + 13) { animation-delay: 150ms; }
.is-fresh .ca-keys button:nth-child(n + 17) { animation-delay: 200ms; }
@keyframes ca-keys { from { opacity: 0; transform: translateY(10px); } }
.is-fresh .ca-line-enter-active { transition-delay: calc(var(--i, 0) * 50ms); }
.ca-taxline button { animation: pop-in 240ms var(--ease-out) both; }
.ca-keys button { position: relative; }
.ca-keys .kbd { position: absolute; top: 4px; right: 5px; font-size: 0.55rem; }
.ca-line-enter-active { transition: opacity 160ms, transform 200ms var(--ease-out); }
.ca-line-leave-active { transition: opacity 120ms; }
.ca-line-enter-from { opacity: 0; transform: translateY(8px); }
.ca-line-leave-to { opacity: 0; }
@container stage (min-width: 900px) {
  .ca { align-items: center; justify-content: center; }
  .ca-device { flex: none; width: 52rem; height: min(100% - 48px, 40rem); grid-template-columns: 1fr 23rem; grid-template-rows: auto auto 1fr; column-gap: 24px; padding: 24px; border-radius: 32px; box-shadow: 0 10px 0 #0003, 0 30px 60px #0003; }
  .ca-brand { grid-column: 1 / -1; }
  .ca-tape { grid-column: 1; grid-row: 2 / 4; }
  .ca-lcd { grid-column: 2; }
  .ca-keys { grid-column: 2; align-content: end; }
  .ca-keys button { min-height: 58px; }
}
</style>
