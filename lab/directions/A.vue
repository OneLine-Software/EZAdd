<script setup lang="ts">
// A. Kitchen ledger: the control. Family Funds' system as it stands, applied to EZAdd.
import { computed } from 'vue'
import { useLab } from '../shared'

defineProps<{ dark: boolean }>()
const lab = useLab()
const { basket, sums, shares, count, undo, shared, root, parts, fmt, taxText } = lab
const total = computed(() => parts(sums.value.total))
</script>

<template>
  <div ref="root" class="da" :data-theme="dark ? 'dark' : 'light'">
    <header class="da-head">
      <svg class="da-mark" viewBox="0 0 48 48" aria-hidden="true">
        <rect x="2" y="5" width="44" height="41" rx="13" fill="var(--edge-main)" />
        <rect x="2" y="2" width="44" height="41" rx="13" fill="var(--green)" />
        <circle cx="24" cy="22.5" r="12" fill="var(--butter)" />
        <path d="M24 16.5v12M18 22.5h12" stroke="var(--ink)" stroke-width="3.4" stroke-linecap="round" />
      </svg>
      <div>
        <h1>EZAdd</h1>
        <p>{{ count }} {{ count === 1 ? 'thing' : 'things' }} in the basket</p>
      </div>
      <button class="da-chip" @click="lab.nextCurrency()">{{ lab.settings.value.currency }}</button>
    </header>

    <main class="da-main">
      <section class="da-card da-figure" aria-live="polite">
        <span class="da-label">Total</span>
        <p class="da-total">
          <span class="da-sym">{{ total.sign }}{{ total.symbolAfter ? '' : total.symbol }}</span>{{ total.whole }}<small>{{ total.fraction }}</small>
          <span v-if="total.symbolAfter" class="da-sym"> {{ total.symbol }}</span>
        </p>
        <p v-if="basket.taxes.length" class="da-sentence">{{ fmt(sums.subtotal) }} before {{ fmt(sums.taxTotal) }} of tax.</p>
        <div class="da-split">
          <span>Split by</span>
          <button aria-label="One person fewer" @click="lab.people(-1)">−</button>
          <b>{{ basket.people }}</b>
          <button aria-label="One person more" @click="lab.people(1)">+</button>
          <span v-if="basket.people > 1" class="da-each">{{ fmt(shares[0]) }} each</span>
        </div>
      </section>

      <section class="da-card da-list">
        <h2>Basket</h2>
        <TransitionGroup tag="ul" name="da-row">
          <li v-for="(item, i) in basket.items" :key="item.id">
            <span class="da-coin">{{ i + 1 }}</span>
            <div class="da-what">
              <input v-model="item.name" class="da-name" :placeholder="`Item ${i + 1}`" :aria-label="`Name of item ${i + 1}`" />
              <span v-if="item.qty !== 1 && item.value" class="da-hint"><span>{{ item.qty }} × {{ item.value }} = </span>{{ fmt(sums.lines[i]) }}</span>
            </div>
            <input
              class="da-price" inputmode="decimal" placeholder="0.00" :value="item.value" :data-price="item.id"
              :aria-label="`Price of item ${i + 1}`"
              @input="lab.onInput($event, item)" @keydown="lab.onKey($event, item)" @paste="lab.onPaste($event, item)"
            />
            <div class="da-qty">
              <button :aria-label="`One fewer of item ${i + 1}`" @click="lab.setQty(item.id, item.qty - 1)">−</button>
              <b>{{ item.qty }}</b>
              <button :aria-label="`One more of item ${i + 1}`" @click="lab.setQty(item.id, item.qty + 1)">+</button>
            </div>
            <button class="da-del" :aria-label="`Remove item ${i + 1}`" @click="lab.removeItem(item.id)">×</button>
          </li>
        </TransitionGroup>
        <div class="da-taxes">
          <button v-for="t in basket.taxes" :key="t.id" class="da-tax" :aria-label="`Remove ${t.label}`" @click="lab.removeTax(t.id)">
            <i />{{ taxText(t) }} <span>×</span>
          </button>
          <button class="da-tax da-tax-add" @click="lab.addPreset()">+ Tax or fee</button>
        </div>
      </section>
    </main>

    <footer class="da-foot">
      <button class="da-key da-key-2" @click="lab.clear()">Clear</button>
      <button class="da-key" @click="lab.share()">{{ shared ? 'Copied' : 'Share' }}</button>
      <button class="da-key da-key-main" @click="lab.add()">+ Add</button>
    </footer>

    <Transition name="da-snack">
      <div v-if="undo" class="da-snack" role="status">{{ undo.label }} <button @click="undo.run()">Undo</button></div>
    </Transition>
  </div>
</template>

<style>
.da {
  --bg: #fbfaf6; --surface: #fff; --muted: #f4f4ee; --ink: #141f19; --soft: #58645b; --line: #e6e7df; --strong: #79837b;
  --green: #066d41; --on-green: #fff; --edge-main: #04321e; --mint: #d6f8e3; --mint-ink: #034d2e; --mint-edge: #96e6b4;
  --butter: #ffe272; --butter-edge: #bc8600; --coral: #a63a2d;
  position: absolute; inset: 0; display: flex; flex-direction: column; background: var(--bg); color: var(--ink);
  font: 500 16px/1.5 'Manrope', sans-serif;
}
.da[data-theme='dark'] {
  --bg: #0c1510; --surface: #141f19; --muted: #1b2720; --ink: #f4f4ee; --soft: #9fa79e; --line: #243229; --strong: #79837b;
  --green: #96e6b4; --on-green: #0c1510; --edge-main: #159157; --mint: #066d41; --mint-ink: #d6f8e3; --mint-edge: #04321e;
  --coral: #ffb6a6;
}
.da button { border: 0; background: none; }
.da input { border: 0; background: none; min-width: 0; outline: none; }
.da :focus-visible { outline: 2px solid var(--green); outline-offset: 2px; }
.da-head { display: flex; align-items: center; gap: 12px; padding: 16px 16px 8px; }
.da-mark { width: 44px; height: 44px; flex: none; }
.da-head h1 { margin: 0; font: 600 1.4rem/1.1 'Fredoka', sans-serif; }
.da-head p { margin: 0; font-size: 0.8125rem; color: var(--soft); }
.da-head > div { flex: 1; }
.da-chip { min-height: 36px; padding: 0 14px; border-radius: 999px; background: var(--mint) !important; color: var(--mint-ink); font-weight: 700; font-size: 0.8125rem; }
.da-main { flex: 1; min-height: 0; overflow-y: auto; padding: 8px 16px 16px; display: grid; gap: 16px; align-content: start; }
.da-card { background: var(--surface); border: 1px solid var(--line); border-radius: 36px; padding: 24px; }
.da-label { font-size: 0.8125rem; font-weight: 600; color: var(--soft); }
.da-total { margin: 2px 0 6px; font: 500 3.2rem/1 'Fredoka', sans-serif; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.da-total small { font-size: 0.5em; color: var(--soft); }
.da-sym { font-size: 0.6em; margin-right: 0.12em; }
.da-sentence { margin: 0 0 12px; font-size: 1rem; }
.da-split { display: flex; align-items: center; gap: 10px; padding-top: 14px; border-top: 1px solid var(--line); font-size: 0.875rem; color: var(--soft); }
.da-split b { min-width: 1.2em; text-align: center; color: var(--ink); font: 500 1.1rem 'Fredoka', sans-serif; }
.da-split button, .da-qty button {
  width: 32px; height: 32px; border-radius: 12px; background: var(--mint); color: var(--mint-ink); font-weight: 700;
  box-shadow: 0 3px 0 var(--mint-edge); transition: transform 150ms, box-shadow 150ms;
}
.da-split button:active, .da-qty button:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--mint-edge); }
.da-each { margin-left: auto; color: var(--ink); font: 500 1.1rem 'Fredoka', sans-serif; }
.da-list h2 { margin: 0 0 6px; font: 600 1.25rem/1.25 'Fredoka', sans-serif; }
.da-list ul { list-style: none; margin: 0; padding: 0; }
.da-list li { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.da-coin { flex: none; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; background: var(--mint); color: var(--mint-ink); font: 500 0.75rem 'Reddit Mono', monospace; }
.da-what { flex: 1; min-width: 0; display: grid; }
.da-name { width: 100%; font-size: 0.9375rem; text-overflow: ellipsis; }
.da-name::placeholder, .da-price::placeholder { color: var(--strong); }
.da-hint { font: 400 0.6875rem/1.3 'Reddit Mono', monospace; color: var(--soft); }
.da-price { width: 4.6em; text-align: right; padding: 6px 10px; border-radius: 14px; background: var(--muted) !important; box-shadow: inset 0 0 0 1px var(--strong); font: 500 1.15rem 'Fredoka', sans-serif; font-variant-numeric: tabular-nums; }
.da-qty { display: flex; align-items: center; gap: 4px; }
.da-qty b { min-width: 1.4em; text-align: center; font: 500 1rem 'Fredoka', sans-serif; }
.da-del { width: 28px; height: 44px; color: var(--soft); font-size: 1.2rem; }
.da-taxes { display: flex; flex-wrap: wrap; gap: 8px; padding-top: 14px; }
.da-tax { display: inline-flex; align-items: center; gap: 6px; min-height: 36px; padding: 0 12px; border-radius: 999px; background: var(--muted) !important; font-size: 0.8125rem; font-weight: 600; }
.da-tax i { width: 8px; height: 8px; border-radius: 50%; background: var(--butter-edge); }
.da-tax span { color: var(--soft); }
.da-tax-add { background: none !important; box-shadow: inset 0 0 0 1px var(--strong); }
.da-foot { display: flex; gap: 10px; padding: 12px 16px 19px; }
.da-key { flex: 1; min-height: 48px; border-radius: 18px; background: var(--butter) !important; color: #141f19; font-weight: 700; box-shadow: 0 3px 0 var(--butter-edge); transition: transform 150ms, box-shadow 150ms; }
.da-key:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--butter-edge); }
.da-key-2 { background: var(--mint) !important; color: var(--mint-ink); box-shadow: 0 3px 0 var(--mint-edge); flex: 0.7; }
.da-key-main { background: var(--green) !important; color: var(--on-green); box-shadow: 0 3px 0 var(--edge-main); flex: 1.3; }
.da-snack { position: absolute; left: 16px; right: 16px; bottom: 84px; display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-radius: 18px; background: var(--ink); color: var(--bg); font-size: 0.875rem; box-shadow: 0 12px 32px #0003; }
.da-snack button { color: var(--butter); font-weight: 700; min-height: 32px; }
.da-row-enter-active, .da-row-leave-active, .da-snack-enter-active, .da-snack-leave-active { transition: opacity 240ms, transform 240ms cubic-bezier(0.2, 0, 0, 1); }
.da-row-enter-from, .da-row-leave-to { opacity: 0; transform: translateY(-8px); }
.da-snack-enter-from, .da-snack-leave-to { opacity: 0; transform: translateY(8px); }
@container stage (max-width: 520px) {
  .da-coin { display: none; }
  .da-card { padding: 22px 20px; }
  .da-price { width: 4.3em; padding: 6px 8px; }
  .da-qty button { width: 30px; }
  .da-qty b { min-width: 1.1em; }
  .da-hint span { display: none; }
}
@container stage (min-width: 900px) {
  .da-main { grid-template-columns: minmax(0, 22rem) minmax(0, 34rem); justify-content: center; gap: 20px; padding-top: 24px; }
  .da-head, .da-foot { width: min(100%, 57.25rem); margin: 0 auto; }
  .da-foot { justify-content: flex-end; }
  .da-key { flex: 0 0 9rem; }
  .da-snack { left: auto; right: 24px; width: 22rem; }
}
@media (prefers-reduced-motion: reduce) { .da * { transition: none !important; } }
</style>
