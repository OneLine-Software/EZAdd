<script setup lang="ts">
// D. Pocket calculator: a device, not a page. An LCD, a paper tape and fat keys of its own, so the phone keyboard never opens.
import { computed, nextTick, watch } from 'vue'
import { useLab } from '../shared'

defineProps<{ dark: boolean }>()
const lab = useLab()
const { basket, sums, shares, undo, shared, root, fmt, plain, taxText, active } = lab

const current = computed(() => basket.value.items.find((i) => i.id === active.value) ?? basket.value.items[basket.value.items.length - 1])
watch(() => basket.value.items.length, async () => {
  await nextTick()
  root.value?.querySelector('.dd-tape li[aria-current="true"]')?.scrollIntoView({ block: 'nearest' })
})

const type = (ch: string) => {
  const item = current.value
  if (!item) return
  active.value = item.id
  if (ch === '.' && item.value.includes('.')) return
  if (item.value.replace(/\D/g, '').length >= 9) return
  item.value = item.value === '0' && ch !== '.' ? ch : item.value + ch
}
const back = () => current.value && (current.value.value = current.value.value.slice(0, -1))
const qty = (by: number) => current.value && lab.setQty(current.value.id, current.value.qty + by)
const next = () => {
  // An empty line is reused, so pressing + twice does not leave a gap.
  if (current.value && current.value.value === '') return
  active.value = lab.addItem(current.value?.id)
}
const split = () => (basket.value.people = basket.value.people >= 6 ? 1 : basket.value.people + 1)
</script>

<template>
  <div ref="root" class="dd" :data-theme="dark ? 'dark' : 'light'">
    <div class="dd-device">
      <header class="dd-brand">
        <svg class="dd-mark" viewBox="0 0 48 48" aria-hidden="true">
          <rect x="3" y="8" width="42" height="38" rx="10" fill="var(--orange-edge)" />
          <rect x="3" y="3" width="42" height="38" rx="10" fill="var(--orange)" />
          <path d="M24 12v20M14 22h20" stroke="#fff" stroke-width="5" stroke-linecap="round" />
        </svg>
        <h1>EZAdd <small>EZ-74</small></h1>
        <i class="dd-solar" aria-hidden="true" />
        <button class="dd-cur" @click="lab.nextCurrency()">{{ lab.settings.value.currency }}</button>
      </header>

      <section class="dd-lcd" aria-live="polite">
        <div class="dd-lcd-top">
          <span>SUB {{ plain(sums.subtotal) }}</span>
          <span v-if="basket.taxes.length">TAX {{ plain(sums.taxTotal) }}</span>
          <span v-if="basket.people > 1">÷{{ basket.people }} = {{ plain(shares[0]) }}</span>
        </div>
        <output>{{ fmt(sums.total) }}</output>
      </section>

      <section class="dd-tape" aria-label="Basket">
        <TransitionGroup tag="ul" name="dd-line">
          <li v-for="(item, i) in basket.items" :key="item.id" :aria-current="item.id === current?.id" @click="active = item.id">
            <span class="dd-n">{{ String(i + 1).padStart(2, '0') }}</span>
            <input v-model="item.name" class="dd-name" :placeholder="`item ${i + 1}`" :aria-label="`Name of item ${i + 1}`" @focus="active = item.id" />
            <span v-if="item.qty !== 1" class="dd-x">×{{ item.qty }}</span>
            <input
              class="dd-price" inputmode="none" placeholder="0.00" :value="item.value" :data-price="item.id" :aria-label="`Price of item ${i + 1}`"
              @focus="active = item.id" @input="lab.onInput($event, item)" @keydown="lab.onKey($event, item)" @paste="lab.onPaste($event, item)"
            />
            <button :aria-label="`Remove item ${i + 1}`" @click.stop="lab.removeItem(item.id)">×</button>
          </li>
        </TransitionGroup>
        <p class="dd-taxline">
          <button v-for="t in basket.taxes" :key="t.id" :aria-label="`Remove ${t.label}`" @click="lab.removeTax(t.id)">{{ taxText(t) }} ×</button>
        </p>
      </section>

      <section class="dd-keys" aria-label="Keys">
        <button class="dd-fn" @click="lab.clear()">C</button>
        <button class="dd-fn" @click="lab.addPreset()">TAX</button>
        <button class="dd-fn" aria-label="Split between more people" @click="split()">÷{{ basket.people > 1 ? basket.people : '' }}</button>
        <button class="dd-fn" @click="lab.share()">{{ shared ? 'OK' : 'SHARE' }}</button>
        <button v-for="k in ['7', '8', '9']" :key="k" @click="type(k)">{{ k }}</button>
        <button class="dd-fn" aria-label="Delete a digit" @click="back()">⌫</button>
        <button v-for="k in ['4', '5', '6']" :key="k" @click="type(k)">{{ k }}</button>
        <button class="dd-fn" aria-label="One more of this item" @click="qty(1)">×<sup>+</sup></button>
        <button v-for="k in ['1', '2', '3']" :key="k" @click="type(k)">{{ k }}</button>
        <button class="dd-fn" aria-label="One fewer of this item" @click="qty(-1)">×<sup>−</sup></button>
        <button @click="type('0')">0</button>
        <button @click="type('.')">.</button>
        <button class="dd-plus" aria-label="Next item" @click="next()">+</button>
      </section>
    </div>

    <Transition name="dd-snack">
      <div v-if="undo" class="dd-snack" role="status">{{ undo.label }} <button @click="undo.run()">UNDO</button></div>
    </Transition>
  </div>
</template>

<style>
.dd {
  --page: #cdc6b4; --body: #ebe5d5; --ink: #1d1b18; --soft: #6e685b; --lcd: #b7c6ab; --lcd-ink: #17231a; --tape: #fffdf6; --tape-line: #1d1b1814;
  --key: #34322f; --key-ink: #f6f1e4; --key-edge: #121110; --fn: #faf5e8; --fn-ink: #1d1b18; --fn-edge: #b5ad98; --orange: #f0641e; --orange-edge: #a53c08;
  position: absolute; inset: 0; display: flex; background: var(--page); color: var(--ink); font: 500 15px/1.3 'Space Grotesk', sans-serif;
}
.dd[data-theme='dark'] {
  --page: #090908; --body: #1e1d1b; --ink: #f2ecdf; --soft: #a39c8c; --lcd: #a6b89b; --tape: #2a2825; --tape-line: #ffffff14;
  --key: #45423e; --key-edge: #000; --fn: #2f2d2a; --fn-ink: #f2ecdf; --fn-edge: #000;
}
.dd button { border: 0; background: none; }
.dd input { border: 0; background: none; outline: none; min-width: 0; font: inherit; }
.dd :focus-visible { outline: 3px solid var(--orange); outline-offset: 2px; }
.dd-device { flex: 1; display: grid; grid-template-rows: auto auto minmax(0, 1fr) auto; gap: 10px; padding: 12px 14px 16px; background: var(--body); min-height: 0; }
.dd-brand { display: flex; align-items: center; gap: 10px; }
.dd-mark { width: 34px; height: 34px; flex: none; }
.dd-brand h1 { flex: 1; margin: 0; font-size: 1.15rem; font-weight: 700; letter-spacing: -0.02em; }
.dd-brand h1 small { font-size: 0.6rem; font-weight: 500; letter-spacing: 0.14em; color: var(--soft); margin-left: 4px; }
.dd-solar { width: 64px; height: 20px; border-radius: 3px; background: repeating-linear-gradient(90deg, #2b2320 0 14px, #4a3a33 14px 16px); }
.dd-cur { min-height: 36px; padding: 0 10px; border-radius: 6px; box-shadow: inset 0 0 0 1.5px var(--soft); font-weight: 700; font-size: 0.75rem; letter-spacing: 0.06em; }
.dd-lcd { display: grid; gap: 2px; padding: 8px 14px 6px; border-radius: 10px; background: var(--lcd); color: var(--lcd-ink); box-shadow: inset 0 3px 0 #0003, inset 0 0 0 2px #0002; font-family: 'Doto', monospace; font-weight: 900; }
.dd-lcd-top { display: flex; gap: 14px; font-size: 0.82rem; min-height: 1.2em; }
.dd-lcd output { display: block; text-align: right; font-size: clamp(2.3rem, 13cqw, 3.4rem); line-height: 1; letter-spacing: -0.02em; white-space: nowrap; }
.dd-tape { min-height: 0; overflow-y: auto; border-radius: 6px; background: var(--tape); padding: 2px 10px; box-shadow: 0 2px 0 #0002; }
.dd-tape ul { list-style: none; margin: 0; padding: 0; }
.dd-tape li { display: flex; align-items: center; gap: 8px; min-height: 40px; border-bottom: 1px solid var(--tape-line); font-size: 0.9rem; }
.dd-tape li[aria-current='true'] { box-shadow: inset 3px 0 0 var(--orange); margin-left: -10px; padding-left: 10px; }
.dd-n { font: 700 0.7rem 'Doto', monospace; color: var(--soft); }
.dd-name { flex: 1; text-overflow: ellipsis; }
.dd-name::placeholder, .dd-price::placeholder { color: var(--soft); }
.dd-x { font-weight: 700; color: var(--orange); }
.dd-price { width: 4.6em; text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; }
.dd-tape li[aria-current='true'] .dd-price { caret-color: var(--orange); }
.dd-tape li button { width: 28px; height: 40px; color: var(--soft); }
.dd-taxline { margin: 0; display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 0; }
.dd-taxline button { min-height: 28px; padding: 0 8px; border-radius: 4px; box-shadow: inset 0 0 0 1.5px var(--soft); font-size: 0.75rem; font-weight: 700; }
.dd-keys { display: grid; grid-template-columns: repeat(4, 1fr); gap: 9px 8px; padding-bottom: 5px; }
.dd-keys button { min-height: 50px; border-radius: 14px; background: var(--key); color: var(--key-ink); font-size: 1.35rem; font-weight: 700; box-shadow: 0 5px 0 var(--key-edge); transition: transform 90ms, box-shadow 90ms; touch-action: manipulation; }
.dd-keys button:active { transform: translateY(4px); box-shadow: 0 1px 0 var(--key-edge); }
.dd-keys .dd-fn { background: var(--fn); color: var(--fn-ink); box-shadow: 0 5px 0 var(--fn-edge); font-size: 0.85rem; letter-spacing: 0.04em; }
.dd-keys .dd-fn:active { box-shadow: 0 1px 0 var(--fn-edge); }
.dd-keys .dd-fn:nth-child(n + 5) { font-size: 1.2rem; }
.dd-keys .dd-plus { grid-column: span 2; background: var(--orange); color: #fff; font-size: 1.8rem; box-shadow: 0 5px 0 var(--orange-edge); }
.dd-keys .dd-plus:active { box-shadow: 0 1px 0 var(--orange-edge); }
.dd-snack { position: absolute; left: 14px; right: 14px; top: 64px; display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: 8px; background: var(--ink); color: var(--body); font-size: 0.85rem; }
.dd-snack button { color: var(--orange); font-weight: 700; min-height: 32px; }
.dd-line-enter-active { transition: opacity 160ms, transform 200ms cubic-bezier(0.2, 0, 0, 1); }
.dd-line-leave-active { transition: opacity 120ms; }
.dd-line-enter-from { opacity: 0; transform: translateY(8px); }
.dd-line-leave-to { opacity: 0; }
.dd-snack-enter-active, .dd-snack-leave-active { transition: opacity 160ms; }
.dd-snack-enter-from, .dd-snack-leave-to { opacity: 0; }
@container stage (min-width: 900px) {
  .dd { align-items: center; justify-content: center; }
  .dd-device { flex: none; width: 52rem; height: min(100% - 48px, 40rem); grid-template-columns: 1fr 23rem; grid-template-rows: auto auto 1fr; column-gap: 24px; padding: 24px; border-radius: 32px; box-shadow: 0 10px 0 #0003, 0 30px 60px #0003; }
  .dd-brand { grid-column: 1 / -1; }
  .dd-tape { grid-column: 1; grid-row: 2 / 4; }
  .dd-lcd { grid-column: 2; }
  .dd-keys { grid-column: 2; align-content: end; }
  .dd-keys button { min-height: 58px; }
  .dd-snack { left: auto; right: 24px; top: 24px; width: 22rem; }
}
@media (prefers-reduced-motion: reduce) { .dd * { transition: none !important; } }
</style>
