<script setup lang="ts">
// B. Till roll: the whole screen is one receipt. Lines print out of the slot in steps; the total is the foot of the slip.
import { computed } from 'vue'
import { useLab } from '../shared'

defineProps<{ dark: boolean }>()
const lab = useLab()
const { basket, sums, shares, count, undo, shared, root, fmt, plain, taxText } = lab
const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
// A barcode drawn from the total, so it changes with the basket and is never a stock image.
const bars = computed(() => [...String(sums.value.total * 7919 + 104729).padEnd(18, '3')].map((d) => 1 + (Number(d) % 4)))
</script>

<template>
  <div ref="root" class="db" :data-theme="dark ? 'dark' : 'light'">
    <header class="db-top">
      <svg class="db-mark" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M8 4h32v36l-4 4-4-4-4 4-4-4-4 4-4-4-4 4-4-4z" fill="var(--paper)" />
        <path d="M24 13v14M17 20h14" stroke="var(--red)" stroke-width="4" />
        <path d="M15 33h18" stroke="var(--ink)" stroke-width="2.5" stroke-dasharray="3 2.5" />
      </svg>
      <h1>EZ<b>+</b>ADD</h1>
      <button @click="lab.nextCurrency()">{{ lab.settings.value.currency }}</button>
      <button @click="lab.share()">{{ shared ? 'COPIED' : 'SHARE' }}</button>
    </header>
    <div class="db-slot" aria-hidden="true" />

    <main class="db-scroll">
      <article class="db-paper">
        <div class="db-title">
          <strong>EZADD</strong>
          <small>{{ today }} · {{ count }} {{ count === 1 ? 'ITEM' : 'ITEMS' }}</small>
        </div>

        <TransitionGroup tag="ul" name="db-line" class="db-lines">
          <li v-for="(item, i) in basket.items" :key="item.id">
            <div class="db-row">
              <input v-model="item.name" class="db-name" :placeholder="`ITEM ${i + 1}`" :aria-label="`Name of item ${i + 1}`" :size="Math.max(6, (item.name || `ITEM ${i + 1}`).length)" />
              <i class="db-dots" />
              <input
                class="db-price" inputmode="decimal" placeholder="0.00" :value="item.value" :data-price="item.id"
                :aria-label="`Price of item ${i + 1}`" :size="Math.max(4, item.value.length)"
                @input="lab.onInput($event, item)" @keydown="lab.onKey($event, item)" @paste="lab.onPaste($event, item)"
              />
            </div>
            <div class="db-sub">
              <button :aria-label="`One fewer of item ${i + 1}`" @click="lab.setQty(item.id, item.qty - 1)">−</button>
              <span>QTY {{ item.qty }}</span>
              <button :aria-label="`One more of item ${i + 1}`" @click="lab.setQty(item.id, item.qty + 1)">+</button>
              <button class="db-void" :aria-label="`Remove item ${i + 1}`" @click="lab.removeItem(item.id)">VOID</button>
              <span v-if="item.qty !== 1 && item.value" class="db-ext">= {{ plain(sums.lines[i]) }}</span>
            </div>
          </li>
        </TransitionGroup>
        <button class="db-add" @click="lab.add()">+ ADD A LINE</button>

        <div class="db-rule" />
        <p class="db-row db-plain"><span>SUBTOTAL</span><i class="db-dots" /><span>{{ plain(sums.subtotal) }}</span></p>
        <p v-for="(t, i) in basket.taxes" :key="t.id" class="db-row db-plain">
          <button :aria-label="`Remove ${t.label}`" @click="lab.removeTax(t.id)">{{ taxText(t).toUpperCase() }} ×</button><i class="db-dots" /><span>{{ plain(sums.taxes[i]) }}</span>
        </p>
        <button class="db-add db-add-tax" @click="lab.addPreset()">+ TAX OR FEE</button>

                <p class="db-total" aria-live="polite"><span>TOTAL</span><strong>{{ fmt(sums.total) }}</strong></p>
        <p class="db-row db-plain db-split">
          <span>SPLIT BY</span>
          <button aria-label="One person fewer" @click="lab.people(-1)">−</button><b>{{ basket.people }}</b><button aria-label="One person more" @click="lab.people(1)">+</button>
          <i class="db-dots" /><span>{{ basket.people > 1 ? fmt(shares[0]) + ' EACH' : '' }}</span>
        </p>

        <div class="db-bars" aria-hidden="true"><i v-for="(w, i) in bars" :key="i" :style="{ width: w + 'px', marginRight: (1 + ((w + i) % 3)) + 'px' }" /></div>
        <p class="db-thanks">Thank you, come again.</p>
      </article>
    </main>

    <footer class="db-foot">
      <button @click="lab.clear()">CLEAR</button>
      <button class="db-feed" @click="lab.add()">+ ADD A LINE</button>
    </footer>

    <Transition name="db-snack">
      <div v-if="undo" class="db-snack" role="status">{{ undo.label.toUpperCase() }} <button @click="undo.run()">UNDO</button></div>
    </Transition>
  </div>
</template>

<style>
.db {
  --desk: #d8d2c4; --case: #24211e; --on-case: #f3eee2; --paper: #fffdf6; --ink: #1f1c18; --soft: #6f695d; --red: #c22f1d; --shade: #0002;
  position: absolute; inset: 0; display: flex; flex-direction: column; background: var(--desk); color: var(--ink);
  font: 500 13px/1.5 'Martian Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums;
}
.db[data-theme='dark'] { --desk: #0e0d0c; --case: #000; --paper: #1e1c19; --ink: #efe8d8; --soft: #a39b8b; --red: #ff7a66; --shade: #0008; }
.db button { border: 0; background: none; }
.db input { border: 0; background: none; outline: none; min-width: 0; font: inherit; }
.db :focus-visible { outline: 2px solid var(--red); outline-offset: 2px; }
.db-top { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: var(--case); color: var(--on-case); }
.db-mark { width: 34px; height: 34px; }
.db-top h1 { flex: 1; margin: 0; font-size: 1.05rem; font-weight: 800; letter-spacing: 0.08em; }
.db-top h1 b { color: var(--red); }
.db[data-theme='light'] .db-top h1 b { color: #ff7a66; }
.db-top button { min-height: 36px; padding: 0 10px; border: 1px solid #fff5; border-radius: 4px; font-size: 0.7rem; letter-spacing: 0.08em; }
.db-slot { height: 10px; background: linear-gradient(#000, #000) center / calc(100% - 24px) 4px no-repeat var(--case); }
.db-scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 0 12px 28px; }
.db-paper { max-width: 30rem; margin: 0 auto; padding: 18px 18px 30px; background: var(--paper); box-shadow: 0 10px 24px var(--shade);
  --tooth: 9px;
  mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) bottom / var(--tooth) 51% repeat-x, linear-gradient(#000 0 0) top / 100% 50% no-repeat;
}
.db-title { display: grid; justify-items: center; gap: 2px; padding-bottom: 12px; border-bottom: 1.5px dashed var(--soft); }
.db-title strong { font-size: 1.5rem; font-weight: 800; letter-spacing: 0.32em; margin-right: -0.32em; }
.db-title small { font-size: 0.68rem; color: var(--soft); letter-spacing: 0.06em; }
.db-lines { list-style: none; margin: 0; padding: 8px 0 0; }
.db-lines li { padding: 6px 0; }
.db-row { display: flex; align-items: baseline; gap: 6px; margin: 0; }
.db-dots { flex: 1; min-width: 12px; border-bottom: 2px dotted var(--soft); transform: translateY(-3px); opacity: 0.7; }
.db-name { text-transform: uppercase; font-weight: 600; max-width: 62%; text-overflow: ellipsis; }
.db-name::placeholder, .db-price::placeholder { color: var(--soft); opacity: 0.8; }
.db-price { text-align: right; font-weight: 700; font-size: 1.05rem; max-width: 40%; }
.db-sub { display: flex; align-items: center; gap: 4px; font-size: 0.68rem; color: var(--soft); letter-spacing: 0.04em; }
.db-sub button { min-width: 30px; min-height: 30px; border: 1.5px solid currentColor; border-radius: 3px; font-weight: 700; color: var(--ink); }
.db-sub span { padding: 0 4px; }
.db-sub .db-void { border: 0; color: var(--red); margin-left: 6px; }
.db-ext { margin-left: auto; color: var(--ink); }
.db-add { width: 100%; min-height: 40px; margin: 6px 0; border: 1.5px dashed var(--soft) !important; border-radius: 3px; font-size: 0.72rem; letter-spacing: 0.1em; color: var(--soft); }
.db-add-tax { border: 0 !important; text-align: left; min-height: 32px; margin: 0; }
.db-rule { border-top: 1.5px dashed var(--soft); margin: 8px 0; }
.db-rule-2 { border-top: 3px double var(--ink); }
.db-plain { font-size: 0.78rem; padding: 3px 0; }
.db-plain button { min-height: 28px; font-size: inherit; }
.db-total { position: sticky; bottom: 0; z-index: 1; display: flex; justify-content: space-between; align-items: baseline; margin: 8px 0 4px; padding: 4px 0 2px; background: var(--paper); border-top: 3px double var(--ink); }
.db-total span { font-weight: 800; letter-spacing: 0.2em; }
.db-total strong { font-size: 2.1rem; font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; }
.db-split { align-items: center; }
.db-split button { width: 30px; height: 30px; border: 1.5px solid var(--ink); border-radius: 3px; font-weight: 700; }
.db-split b { min-width: 1.4em; text-align: center; }
.db-bars { display: flex; justify-content: center; height: 38px; margin: 18px 0 6px; }
.db-bars i { background: var(--ink); height: 100%; }
.db-thanks { margin: 0; text-align: center; font: italic 400 1.35rem/1.2 'Instrument Serif', serif; color: var(--red); }
.db-foot { display: flex; gap: 10px; padding: 10px 16px 16px; background: var(--case); }
.db-foot button { flex: 1; min-height: 48px; border-radius: 6px; background: #3a3632 !important; color: var(--on-case); font-size: 0.74rem; font-weight: 700; letter-spacing: 0.1em; box-shadow: 0 4px 0 #000; transition: transform 100ms steps(2), box-shadow 100ms steps(2); }
.db-foot button:active { transform: translateY(3px); box-shadow: 0 1px 0 #000; }
.db-foot .db-feed { flex: 2; background: var(--red) !important; color: #fff; }
.db[data-theme='dark'] .db-feed { color: #1e1c19; }
.db-snack { position: absolute; left: 16px; right: 16px; bottom: 86px; display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--ink); color: var(--paper); font-size: 0.72rem; letter-spacing: 0.06em; border-radius: 4px; }
.db-snack button { color: inherit; font-weight: 800; text-decoration: underline; min-height: 32px; }
/* Printing: a new line feeds out in steps, the way a thermal printer moves paper. */
.db-line-enter-active { transition: transform 360ms steps(6), opacity 120ms; }
.db-line-leave-active { transition: opacity 160ms; }
.db-line-enter-from { opacity: 0; transform: translateY(-22px); }
.db-line-leave-to { opacity: 0; }
.db-snack-enter-active, .db-snack-leave-active { transition: opacity 160ms; }
.db-snack-enter-from, .db-snack-leave-to { opacity: 0; }
@container stage (min-width: 900px) {
  .db-scroll { padding-bottom: 48px; }
  .db-paper { padding: 26px 30px 40px; font-size: 14px; }
  .db-foot { justify-content: center; }
  .db-foot button { flex: 0 0 12rem; }
  .db-foot .db-feed { flex: 0 0 18rem; }
  .db-snack { left: auto; right: 24px; width: 24rem; }
}
@media (prefers-reduced-motion: reduce) { .db * { transition: none !important; } }
</style>
