<script setup lang="ts">
// One accent: black, white and one colour the person chooses. Soft shapes that squish under the thumb.
import { ref, watch } from 'vue'
import { Settings } from 'lucide-vue-next'
import { useScreen } from '@/composables/useScreen'
import RollDigits from '@/components/RollDigits.vue'
import Mark from '@/components/Mark.vue'
import Flag from '@/components/Flag.vue'
import Credit from '@/components/Credit.vue'
import Kbd from '@/components/Kbd.vue'

const s = useScreen()
const { basket, sums, shares, things, root, fmt, taxText, settings, sheet, copied } = s

const SHAPES = ['44px 64px 52px 72px / 60px 48px 68px 50px', '68px 46px 70px 50px / 48px 66px 52px 64px', '52px 72px 46px 62px / 70px 52px 60px 46px']
const shape = ref(0)
watch(() => sums.value.total, () => (shape.value = (shape.value + 1) % SHAPES.length))
</script>

<template>
  <div ref="root" class="ac">
    <header class="ac-head">
      <Mark class="ac-mark" />
      <h1>ezadd</h1>
      <button type="button" class="ac-chip" aria-label="Currency" @click="sheet = 'currency'"><Flag :code="s.flagOf(settings.currency)" /> {{ settings.currency }}<Kbd k="M" /></button>
      <button type="button" class="ac-icon" aria-label="Settings" title="Settings ( , )" @click="sheet = 'settings'"><Settings :size="22" /></button>
    </header>

    <section class="ac-hero" :style="{ '--chars': fmt(sums.total).length }">
      <i class="ac-blob" :style="{ borderRadius: SHAPES[shape] }" aria-hidden="true" />
      <small>total · {{ things }} <Kbd k="⇧C copies" /></small>
      <button type="button" class="ac-total" :class="{ 'is-copied': copied === 'total' }" aria-live="polite" title="Copy the total" @click="s.copy('total')"><RollDigits :text="fmt(sums.total)" /></button>
      <div class="ac-split">
        <button type="button" aria-label="One person fewer" @click="s.people(-1)">−</button>
        <span>{{ basket.people === 1 ? 'just me' : `split by ${basket.people}` }} <Kbd k="S 2–9" /></span>
        <button type="button" aria-label="One person more" @click="s.people(1)">+</button>
        <b v-if="basket.people > 1">{{ fmt(shares[0]) }} each</b>
      </div>
    </section>

    <main class="ac-main">
      <TransitionGroup tag="ul" name="ac-item" class="ac-list" appear>
        <li v-for="(item, i) in basket.items" :key="item.id" :style="{ '--i': i }">
          <input v-model="item.name" class="ac-name" :placeholder="`item ${i + 1}`" :aria-label="`Name of item ${i + 1}`" maxlength="40" />
          <input
            class="ac-price" :style="{ width: Math.min(6, Math.max(3.8, item.value.length * 0.62 + 0.3)) + 'em' }" inputmode="decimal" placeholder="0.00" :value="item.value" :data-price="item.id" :aria-label="`Price of item ${i + 1}`"
            @input="s.onInput($event, item)" @keydown="s.onKey($event, item)" @paste="s.onPaste($event, item)"
          />
          <div class="ac-qty">
            <button type="button" :aria-label="`One fewer of item ${i + 1}`" @click="s.setQty(item.id, item.qty - 1)">−</button>
            <b :key="item.qty" class="bump">{{ item.qty }}</b>
            <button type="button" :aria-label="`One more of item ${i + 1}`" @click="s.setQty(item.id, item.qty + 1)">+</button>
          </div>
          <button type="button" class="ac-del" :aria-label="`Remove item ${i + 1}`" @click="s.removeItem(item.id)">×</button>
        </li>
      </TransitionGroup>
      <div class="ac-chips">
        <button v-for="t in basket.taxes" :key="t.id" type="button" class="ac-chip ac-chip-on" :aria-label="`Remove ${t.label}`" @click="s.removeTax(t.id)">{{ taxText(t) }} ×</button>
        <button type="button" class="ac-chip" @click="sheet = 'tax'">+ tax or fee<Kbd k="T" /></button>
        <button type="button" class="ac-chip" @click="sheet = 'share'">share<Kbd k="H" /></button>
        <button type="button" class="ac-chip" @click="s.clear()">clear<Kbd k="⇧⌫" /></button>
      </div>
      <Credit />
    </main>

    <button type="button" class="ac-fab" aria-label="Add an item" @click="s.add()"><span>+</span><Kbd k="N" /></button>
  </div>
</template>

<style>
.ac { position: absolute; inset: 0; display: flex; flex-direction: column; font: 500 16px/1.4 var(--font-text); --roll-ease: var(--squish); --roll-dur: 600ms; }
.ac button { border: 0; background: none; }
.ac input { border: 0; background: none; outline: none; min-width: 0; font: inherit; }
.ac :focus-visible { outline: 3px solid var(--ink); outline-offset: 2px; }
.ac-head { display: flex; align-items: center; gap: 10px; padding: calc(12px + env(safe-area-inset-top, 0px)) 16px 4px; }
.ac-mark { width: 40px; height: 40px; flex: none; }
.ac-head h1 { flex: 1; margin: 0; font-size: 1.7rem; font-weight: 800; letter-spacing: -0.05em; line-height: 1; }
.ac-icon { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 50%; transition: transform 300ms var(--squish); }
.ac-icon:active { transform: rotate(60deg) scale(0.9); }
.ac-hero { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); justify-items: start; container-type: inline-size; padding: 22px 26px; margin: 4px 16px 0; color: var(--on-acc); isolation: isolate; }
.ac-blob { position: absolute; inset: 0; z-index: -1; background: var(--acc); transition: border-radius 700ms var(--squish), background-color 300ms; }
.ac-hero small { font-weight: 600; opacity: 0.75; }
.ac-total { color: inherit; font: inherit; max-width: 100%; }
.ac-total .roll { font-size: min(4.6rem, calc(100cqw / (var(--chars) * 0.6))); font-weight: 800; letter-spacing: -0.05em; }
.ac-split { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-weight: 600; font-size: 0.9rem; width: 100%; }
.ac-split b { margin-left: auto; font-weight: 800; }
.ac-split button, .ac-qty button { width: 34px; height: 34px; border-radius: 50%; background: var(--on-acc); color: var(--acc); font-weight: 800; line-height: 1; transition: transform 220ms var(--squish); }
.ac-split button:active, .ac-qty button:active { transform: scale(0.78, 0.9); }
.ac-split button::after, .ac-qty button::after { content: ''; position: absolute; inset: -5px; }
.ac-split button, .ac-qty button { position: relative; }
.ac-main { flex: 1; min-height: 0; overflow-y: auto; padding: 14px 16px 104px; }
.ac-list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; }
.ac-list li { display: flex; align-items: center; gap: 8px; padding: 8px 8px 8px 20px; background: var(--acc-soft); border-radius: 999px; }
.ac-name { flex: 1; font-weight: 600; text-overflow: ellipsis; }
.ac-price { flex: none; text-align: right; font-weight: 800; font-size: 1.2rem; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.ac-qty { display: flex; align-items: center; gap: 2px; padding: 2px; border-radius: 999px; background: var(--bg); }
.ac-qty button { background: var(--ink); color: var(--bg); width: 32px; height: 32px; }
.ac-qty b { min-width: 1.5em; text-align: center; font-weight: 800; }
.ac-del { width: 32px; height: 44px; color: var(--soft); font-size: 1.2rem; }
.ac-chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 14px 0 22px; }
.ac-chip { display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 14px; border-radius: 999px; box-shadow: inset 0 0 0 1.5px var(--ink); font-weight: 600; font-size: 0.875rem; transition: transform 220ms var(--squish); }
.ac-chip:active { transform: scale(0.92); }
.ac-chip-on { background: var(--ink) !important; color: var(--bg); }
.ac-fab { position: absolute; right: 18px; bottom: calc(20px + env(safe-area-inset-bottom, 0px)); width: 68px; height: 68px; border-radius: 46% 54% 52% 48% / 52% 46% 54% 48%; background: var(--ink) !important; color: var(--bg); font-size: 2.2rem; font-weight: 500; line-height: 1; box-shadow: 0 10px 24px #0003; transition: transform 260ms var(--squish), border-radius 400ms var(--squish); }
.ac-fab:active { transform: scale(1.14, 0.84); border-radius: 54% 46% 44% 56% / 44% 56% 46% 54%; }
.ac-fab .kbd { position: absolute; top: -4px; right: -4px; margin: 0; font-size: 0.7rem; background: var(--bg); color: var(--ink); opacity: 1; }
.ac-total.is-copied { animation: ac-copied 520ms var(--squish); }
@keyframes ac-copied { 30% { transform: scale(0.94, 1.06); } 60% { transform: scale(1.05, 0.96); } }
.ac-chip-on { animation: pop-in 420ms var(--squish) both; }
.is-fresh .ac-item-enter-active { transition-delay: calc(var(--i, 0) * 60ms); }
.is-fresh .ac-hero { animation: ac-land 700ms var(--squish) both; }
@keyframes ac-land { from { opacity: 0; transform: scale(0.8, 0.9) translateY(-14px); } }
.is-fresh .ac-fab { animation: pop-in 600ms var(--squish) 380ms both; }
.ac-fab span { display: block; transition: transform 300ms var(--squish); }
.ac-fab:active span { transform: rotate(90deg); }
/* An item drops in and lands soft; it squashes on the way out. Bounce is this theme's signature (DESIGN.md). */
.ac-item-enter-active { transition: transform 460ms var(--squish), opacity 140ms; }
.ac-item-leave-active { transition: transform 200ms ease-in, opacity 200ms; }
.ac-item-enter-from { opacity: 0; transform: translateY(-26px) scale(0.9, 1.12); }
.ac-item-leave-to { opacity: 0; transform: scale(0.7, 0.4); }
@container stage (min-width: 900px) {
  .ac { display: grid; grid-template-columns: minmax(0, 28rem) minmax(0, 34rem); grid-template-rows: auto 1fr; justify-content: center; column-gap: 32px; padding: 16px 24px; }
  .ac-head { grid-column: 1 / -1; padding-inline: 0; }
  .ac-hero { margin: 24px 0 0; padding: 56px 44px; align-self: start; }
  .ac-total .roll { font-size: min(5.6rem, calc(100cqw / (var(--chars) * 0.6))); }
  .ac-main { padding-top: 24px; }
  .ac-fab { right: calc(50% - 31rem); bottom: 32px; }
}
</style>
