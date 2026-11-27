<script setup lang="ts">
// Till roll: the whole screen is one receipt. Lines print out of the slot in steps; the total is the foot of the slip.
import { computed } from 'vue'
import { Settings } from 'lucide-vue-next'
import { useScreen } from '@/composables/useScreen'
import Flag from '@/components/Flag.vue'
import Credit from '@/components/Credit.vue'
import Kbd from '@/components/Kbd.vue'

const s = useScreen()
const { basket, sums, shares, things, root, fmt, plain, taxText, active, sheet, settings, copied } = s
const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
// A barcode drawn from the total, so it changes with the basket and is never a stock picture.
const bars = computed(() => [...String(Math.abs(sums.value.total) * 7919 + 104729).padEnd(18, '3')].map((d) => 1 + (Number(d) % 4)))
</script>

<template>
  <div ref="root" class="tl">
    <header class="tl-top">
      <svg class="tl-mark" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M8 4h32v36l-4 4-4-4-4 4-4-4-4 4-4-4-4 4-4-4z" fill="var(--surface)" />
        <path d="M24 13v14M17 20h14" stroke="var(--acc)" stroke-width="4" />
        <path d="M15 33h18" stroke="var(--ink)" stroke-width="2.5" stroke-dasharray="3 2.5" />
      </svg>
      <h1>EZ<b>+</b>ADD</h1>
      <button type="button" aria-label="Currency" @click="sheet = 'currency'"><Flag :code="s.flagOf(settings.currency)" /> {{ settings.currency }}<Kbd k="M" /></button>
      <button type="button" aria-label="Settings" title="Settings ( , )" @click="sheet = 'settings'"><Settings :size="18" /></button>
    </header>
    <div class="tl-slot" aria-hidden="true" />

    <main class="tl-scroll">
      <article class="tl-paper">
        <div class="tl-title">
          <strong>EZADD</strong>
          <small>{{ today }} · {{ things }}</small>
        </div>

        <TransitionGroup tag="ul" name="tl-line" class="tl-lines" appear>
          <li v-for="(item, i) in basket.items" :key="item.id" :class="{ 'is-active': active === item.id }" :style="{ '--i': i }">
            <div class="tl-row">
              <input v-model="item.name" class="tl-name" :placeholder="`Item ${i + 1}`" :aria-label="`Name of item ${i + 1}`" :size="Math.max(7, (item.name || `Item ${i + 1}`).length + 1)" maxlength="40" @focus="active = item.id" />
              <i class="tl-dots" />
              <span v-if="item.qty !== 1" class="tl-x">{{ item.qty }} ×</span>
              <input
                class="tl-price" v-bind="s.priceKeys.value" placeholder="0.00" :value="item.value" :data-price="item.id"
                :aria-label="`Price of item ${i + 1}`" :size="Math.max(4, item.value.length)"
                @focus="active = item.id" @input="s.onInput($event, item)" @keydown="s.onKey($event, item)" @paste="s.onPaste($event, item)"
              />
            </div>
            <div v-if="active === item.id || (item.qty !== 1 && item.value)" class="tl-sub">
              <template v-if="active === item.id">
                <button type="button" :aria-label="`One fewer of item ${i + 1}`" @click="s.setQty(item.id, item.qty - 1)">−</button>
                <span>Qty {{ item.qty }}</span>
                <button type="button" :aria-label="`One more of item ${i + 1}`" @click="s.setQty(item.id, item.qty + 1)">+</button>
                <button type="button" class="tl-void" :aria-label="`Remove item ${i + 1}`" @click="s.removeItem(item.id)">Void</button>
              </template>
              <span v-if="item.qty !== 1 && item.value" class="tl-ext">= {{ plain(sums.lines[i]) }}</span>
            </div>
          </li>
        </TransitionGroup>

        <div class="tl-rule" />
        <p class="tl-row tl-plain"><span>Subtotal</span><i class="tl-dots" /><span>{{ plain(sums.subtotal) }}</span></p>
        <p v-for="(t, i) in basket.taxes" :key="t.id" class="tl-row tl-plain">
          <button type="button" :aria-label="`Remove ${t.label}`" @click="s.removeTax(t.id)">{{ taxText(t) }} ×</button><i class="tl-dots" /><span>{{ plain(sums.taxes[i]) }}</span>
        </p>
        <button type="button" class="tl-link" @click="sheet = 'tax'">+ Tax or fee<Kbd k="T" /></button>

        <button type="button" class="tl-total" :class="{ 'is-copied': copied === 'total' }" :style="{ '--chars': fmt(sums.total).length }" aria-live="polite" title="Copy the total" @click="s.copy('total')"><span>Total <Kbd k="⇧C" /></span><strong>{{ fmt(sums.total) }}</strong></button>
        <p class="tl-row tl-plain tl-split">
          <span>Split by <Kbd k="S 2–9" /></span>
          <button type="button" aria-label="One person fewer" @click="s.people(-1)">−</button><b>{{ basket.people }}</b><button type="button" aria-label="One person more" @click="s.people(1)">+</button>
          <i class="tl-dots" /><span v-if="basket.people > 1">{{ fmt(shares[0]) }} each</span>
        </p>

        <div class="tl-bars" aria-hidden="true"><i v-for="(w, i) in bars" :key="i" :style="{ width: w + 'px', marginRight: (1 + ((w + i) % 3)) + 'px' }" /></div>
        <p class="tl-thanks">Thank you, come again.</p>
        <Credit />
      </article>
    </main>

    <footer class="tl-foot">
      <button type="button" @click="s.clear()">Clear<Kbd k="⇧⌫" /></button>
      <button type="button" @click="sheet = 'share'">Share<Kbd k="H" /></button>
      <button type="button" class="tl-feed" @click="s.add()">+ Add a line<Kbd k="N" /></button>
    </footer>
  </div>
</template>

<style>
.tl { position: absolute; inset: 0; display: flex; flex-direction: column; font: 500 14px/1.5 var(--font-text); font-variant-numeric: tabular-nums; text-transform: uppercase; }
.tl button { border: 0; background: none; text-transform: inherit; }
.tl input { border: 0; background: none; outline: none; min-width: 0; font: inherit; }
.tl :focus-visible { outline: 2px solid var(--acc); outline-offset: 2px; }
.tl-top { display: flex; align-items: center; gap: 8px; padding: calc(10px + env(safe-area-inset-top, 0px)) 16px 10px; background: var(--case); color: var(--on-case); }
.tl-mark { width: 34px; height: 34px; }
.tl-top h1 { flex: 1; margin: 0; font-size: 1.05rem; font-weight: 800; letter-spacing: 0.08em; }
.tl-top h1 b { color: oklch(0.74 0.15 var(--hue)); }
.tl-top button { display: inline-flex; align-items: center; gap: 8px; min-width: 44px; min-height: 40px; justify-content: center; padding: 0 10px; border: 1px solid #fff5; border-radius: 4px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; color: inherit; }
.tl-slot { height: 10px; background: linear-gradient(#000, #000) center / calc(100% - 24px) 4px no-repeat var(--case); }
.tl-scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 0 12px 28px; }
.tl-paper { max-width: 30rem; margin: 0 auto; padding: 20px 22px 34px; background: var(--surface);
  --tooth: 9px;
  mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) bottom / var(--tooth) 51% repeat-x, linear-gradient(#000 0 0) top / 100% 50% no-repeat;
}
.tl-title { display: grid; justify-items: center; gap: 4px; padding-bottom: 14px; border-bottom: 1.5px dashed var(--soft); }
.tl-title strong { font-size: 1.5rem; font-weight: 800; letter-spacing: 0.32em; margin-right: -0.32em; line-height: 1.2; }
.tl-title small { font-size: 0.7rem; color: var(--soft); letter-spacing: 0.06em; }
.tl-lines { list-style: none; margin: 0; padding: 10px 0 4px; }
.tl-lines li { padding: 7px 0; }
.tl-row { display: flex; align-items: baseline; gap: 8px; margin: 0; }
.tl-dots { flex: 1; min-width: 12px; border-bottom: 2px dotted var(--soft); transform: translateY(-4px); opacity: 0.55; }
.tl-name { text-transform: uppercase; font-weight: 600; max-width: 58%; text-overflow: ellipsis; }
.tl-x { font-size: 0.75rem; color: var(--soft); white-space: nowrap; }
.tl-price { text-align: right; font-weight: 700; font-size: 1.1rem; max-width: 40%; }
.tl-sub { display: flex; align-items: center; gap: 6px; padding-top: 6px; font-size: 0.7rem; color: var(--soft); letter-spacing: 0.04em; }
.tl-sub button { min-width: 36px; min-height: 36px; border: 1.5px solid var(--ink); border-radius: 3px; font-weight: 700; color: var(--ink); }
.tl-sub span { padding: 0 4px; }
.tl-sub .tl-void { border-color: transparent; color: var(--acc); padding: 0 8px; margin-left: 4px; }
.tl-ext { margin-left: auto; color: var(--ink); }
.tl-rule { border-top: 1.5px dashed var(--soft); margin: 6px 0 10px; }
.tl-plain { font-size: 0.8rem; padding: 4px 0; }
.tl-plain button { min-height: 32px; font: inherit; color: inherit; }
.tl-link { min-height: 40px; font-size: 0.75rem; letter-spacing: 0.08em; color: var(--soft); font-weight: 600; }
.tl-total { container-type: inline-size; position: sticky; bottom: 0; z-index: 1; width: 100%; display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin: 10px 0 6px; padding: 8px 0 4px; background: var(--surface) !important; border-top: 3px double var(--ink) !important; color: inherit; font: inherit; }
.tl-total span { font-weight: 800; letter-spacing: 0.2em; }
.tl-total strong { font-size: min(2.3rem, calc((100cqw - 96px) / (var(--chars) * 0.6))); font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; white-space: nowrap; }
.tl-split { align-items: center; min-height: 40px; }
.tl-split button { width: 36px; height: 36px; border: 1.5px solid var(--ink); border-radius: 3px; font-weight: 700; }
.tl-split b { min-width: 1.4em; text-align: center; }
.tl-bars { display: flex; justify-content: center; height: 38px; margin: 22px 0 8px; }
.tl-bars i { background: var(--ink); height: 100%; }
.tl-thanks { margin: 0 0 18px; text-align: center; text-transform: none; font: italic 400 1.4rem/1.2 'Instrument Serif', serif; color: var(--acc); }
.tl .credit { display: flex; font-size: 0.68rem; }
.tl-foot { display: flex; gap: 10px; padding: 10px 16px calc(14px + env(safe-area-inset-bottom, 0px)); background: var(--case); }
.tl-foot button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; flex: 1; min-height: 48px; border-radius: 6px; background: var(--case-key); color: var(--on-case); font-size: 0.74rem; font-weight: 700; letter-spacing: 0.1em; box-shadow: 0 4px 0 #000; transition: transform 90ms, box-shadow 90ms; }
.tl-foot button:active { transform: translateY(3px); box-shadow: 0 1px 0 #000; }
.tl-foot .tl-feed { flex: 2.2; background: var(--acc); color: var(--on-acc); }
/* The slip feeds out of the slot when the theme opens, and the total is stamped when it is copied. */
.is-fresh .tl-paper { animation: tl-feed 620ms var(--ease-out) both; }
@keyframes tl-feed { from { transform: translateY(-30%); opacity: 0; } }
.tl-total.is-copied strong { animation: tl-stamp 320ms var(--ease-out); }
@keyframes tl-stamp { 0% { transform: scale(1.12); color: var(--acc); } }
.tl-plain:has(button) { animation: tl-print 220ms var(--ease-out) both; }
@keyframes tl-print { from { opacity: 0; transform: translateY(-6px); } }
.tl-sub { animation: tl-print 180ms var(--ease-out) both; }
.tl-bars i { transition: width 240ms var(--ease-out), margin 240ms var(--ease-out); }
/* Printing: a new line feeds down out of the one above it. */
.tl-line-enter-active { transition: transform 260ms var(--ease-out), opacity 200ms; }
.tl-line-leave-active { transition: opacity 160ms; }
.tl-line-enter-from { opacity: 0; transform: translateY(-12px); }
.tl-line-leave-to { opacity: 0; }
@container stage (min-width: 900px) {
  .tl-scroll { padding-bottom: 48px; }
  .tl-paper { padding: 28px 34px 44px; font-size: 15px; }
  .tl-foot { justify-content: center; }
  .tl-foot button { flex: 0 0 10rem; }
  .tl-foot .tl-feed { flex: 0 0 18rem; }
}
</style>
