<script setup lang="ts">
// Price sticker: sale colours and fat numerals. Every item is a sticker; the total is the big tag.
import { ref, watch } from 'vue'
import { Settings } from 'lucide-vue-next'
import { useScreen } from '@/composables/useScreen'
import RollDigits from '@/components/RollDigits.vue'
import Flag from '@/components/Flag.vue'
import Credit from '@/components/Credit.vue'
import Kbd from '@/components/Kbd.vue'

const s = useScreen()
const { basket, sums, shares, things, root, fmt, taxText, settings, sheet } = s

// A 16-point burst, drawn once.
const burst = Array.from({ length: 32 }, (_, i) => {
  const r = i % 2 ? 40 : 48
  const a = (i / 32) * Math.PI * 2
  return `${(50 + r * Math.sin(a)).toFixed(1)},${(50 - r * Math.cos(a)).toFixed(1)}`
}).join(' ')

// The tag jumps when the total changes.
const tag = ref<HTMLElement>()
watch(() => sums.value.total, () => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  tag.value?.animate(
    [{ transform: 'rotate(-2deg) scale(1)' }, { transform: 'rotate(-4deg) scale(1.06)' }, { transform: 'rotate(-2deg) scale(1)' }],
    { duration: 380, easing: 'cubic-bezier(0.3, 1.3, 0.5, 1)' },
  )
})
</script>

<template>
  <div ref="root" class="st">
    <header class="st-head">
      <svg class="st-mark" viewBox="0 0 100 100" aria-hidden="true">
        <polygon :points="burst" fill="var(--acc)" stroke="var(--navy)" stroke-width="3" stroke-linejoin="round" />
        <path d="M50 30v40M30 50h40" stroke="#fff" stroke-width="12" stroke-linecap="round" />
      </svg>
      <h1>EZ<span>Add</span></h1>
      <button type="button" class="st-pill st-blue" aria-label="Currency" @click="sheet = 'currency'"><Flag :code="s.flagOf(settings.currency)" /> {{ settings.currency }}<Kbd k="M" /></button>
      <button type="button" class="st-pill st-round" aria-label="Settings" title="Settings ( , )" @click="sheet = 'settings'"><Settings :size="20" :stroke-width="2.6" /></button>
    </header>

    <main class="st-main">
      <TransitionGroup tag="ul" name="st-item" class="st-list" appear>
        <li v-for="(item, i) in basket.items" :key="item.id" :style="{ '--tilt': (i % 2 ? 0.7 : -0.6) + 'deg', '--i': i }">
          <div class="st-what">
            <input v-model="item.name" class="st-name" :placeholder="`Item ${i + 1}`" :aria-label="`Name of item ${i + 1}`" maxlength="40" />
            <div class="st-qty">
              <button type="button" :aria-label="`One fewer of item ${i + 1}`" @click="s.setQty(item.id, item.qty - 1)">−</button>
              <b :key="item.qty" class="bump">×{{ item.qty }}</b>
              <button type="button" :aria-label="`One more of item ${i + 1}`" @click="s.setQty(item.id, item.qty + 1)">+</button>
              <span v-if="item.qty !== 1 && item.value">{{ fmt(sums.lines[i]) }}</span>
            </div>
          </div>
          <label class="st-flag">
            <small>each</small>
            <input
              :style="{ width: Math.min(5.4, Math.max(3.4, item.value.length * 0.6 + 0.2)) + 'em' }" v-bind="s.priceKeys.value" placeholder="0.00" :value="item.value" :data-price="item.id" :aria-label="`Price of item ${i + 1}`"
              @input="s.onInput($event, item)" @keydown="s.onKey($event, item)" @paste="s.onPaste($event, item)"
            />
          </label>
          <button type="button" class="st-del" :aria-label="`Remove item ${i + 1}`" @click="s.removeItem(item.id)">×</button>
        </li>
      </TransitionGroup>
      <button type="button" class="st-add" @click="s.add()">+ Stick on another <Kbd k="N" /></button>

      <div class="st-taxes">
        <button v-for="t in basket.taxes" :key="t.id" type="button" class="st-tax" :aria-label="`Remove ${t.label}`" @click="s.removeTax(t.id)">+ {{ taxText(t) }} ×</button>
        <button type="button" class="st-tax st-tax-add" @click="sheet = 'tax'">+ Tax or fee<Kbd k="T" /></button>
        <button type="button" class="st-tax st-tax-add" @click="sheet = 'share'">Share<Kbd k="H" /></button>
        <button type="button" class="st-tax st-tax-add" @click="s.clear()">Clear all<Kbd k="⇧⌫" /></button>
      </div>
      <Credit />
    </main>

    <footer class="st-foot">
      <div class="st-split">
        <span>Split <Kbd k="S 2–9" /></span>
        <button type="button" aria-label="One person fewer" @click="s.people(-1)">−</button><b>{{ basket.people }}</b><button type="button" aria-label="One person more" @click="s.people(1)">+</button>
        <em v-if="basket.people > 1">{{ fmt(shares[0]) }} each</em>
      </div>
      <button ref="tag" type="button" class="st-tag" :style="{ '--chars': fmt(sums.total).length }" aria-live="polite" title="Copy the total" @click="s.copy('total')">
        <span class="st-hole" aria-hidden="true" />
        <small>Total · {{ things }} <Kbd k="⇧C copies" /></small>
        <RollDigits :text="fmt(sums.total)" />
      </button>
    </footer>
  </div>
</template>

<style>
.st { position: absolute; inset: 0; display: flex; flex-direction: column; font: 700 15px/1.4 var(--font-text); --roll-ease: cubic-bezier(0.3, 1.25, 0.5, 1); --roll-dur: 560ms; }
.st button { border: 0; background: none; }
.st input { border: 0; background: none; outline: none; min-width: 0; font: inherit; }
.st :focus-visible { outline: 3px solid var(--blue); outline-offset: 2px; }
.st-head { display: flex; align-items: center; gap: 8px; padding: calc(12px + env(safe-area-inset-top, 0px)) 16px 6px; }
.st-mark { width: 46px; height: 46px; transform: rotate(-8deg); flex: none; }
.st-head h1 { flex: 1; margin: 0; font: 400 1.9rem/1 var(--font-display); transform: rotate(-2deg); transform-origin: left; }
.st-head h1 span { color: var(--acc); }
.st-pill { display: inline-flex; align-items: center; gap: 8px; min-height: 42px; padding: 0 14px; border: 2.5px solid var(--line) !important; border-radius: 999px; background: var(--surface) !important; font-weight: 900; font-size: 0.8rem; box-shadow: 3px 3px 0 var(--shadow); transition: transform 150ms, box-shadow 150ms; }
.st-pill:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 var(--shadow); }
.st-round { width: 42px; padding: 0; justify-content: center; }
.st-blue { background: var(--blue) !important; color: var(--on-blue); }
.st-main { flex: 1; min-height: 0; overflow: hidden auto; padding: 12px 16px 16px; }
.st-list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
.st-list li { position: relative; display: flex; align-items: center; gap: 10px; padding: 10px 12px 10px 16px; background: var(--surface); border: 2.5px solid var(--line); border-radius: 18px; box-shadow: 4px 4px 0 var(--shadow); transform: rotate(var(--tilt)); }
.st-what { flex: 1; min-width: 0; display: grid; gap: 4px; }
.st-name { width: 100%; font-weight: 900; font-size: 1rem; text-overflow: ellipsis; }
.st-qty { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--soft); }
.st-qty button, .st-split button { position: relative; width: 32px; height: 32px; border: 2.5px solid var(--line) !important; border-radius: 50%; background: var(--surface) !important; color: var(--ink); font-weight: 900; line-height: 1; transition: transform 150ms var(--spring); }
.st-qty button::after, .st-split button::after { content: ''; position: absolute; inset: -6px; }
.st-qty button:active, .st-split button:active { transform: scale(0.82); }
.st-qty b { min-width: 2em; text-align: center; color: var(--ink); font: 400 1.05rem var(--font-display); }
.st-flag { display: grid; justify-items: end; padding: 4px 12px 6px; background: var(--yellow); color: var(--navy); border: 2.5px solid var(--navy); border-radius: 12px; transform: rotate(2deg); }
.st-flag small { font-size: 0.6rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; line-height: 1; }
.st-flag input { text-align: right; font: 400 1.5rem/1 var(--font-display); font-variant-numeric: tabular-nums; color: inherit; }
.st .st-flag input::placeholder { color: #17153b80; }
.st-del { position: absolute; top: -10px; right: -8px; width: 28px; height: 28px; border: 2.5px solid var(--line) !important; border-radius: 50%; background: var(--surface) !important; color: var(--ink); font-weight: 900; line-height: 1; }
.st-del::after { content: ''; position: absolute; inset: -9px; }
.st-add { width: 100%; min-height: 52px; margin-top: 14px; border: 2.5px dashed var(--line) !important; border-radius: 18px; font-weight: 900; color: var(--ink); }
.st-taxes { display: flex; flex-wrap: wrap; gap: 8px; padding: 14px 0 20px; }
.st-tax { display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 12px; border-radius: 8px; background: var(--acc) !important; color: var(--on-acc); font-weight: 900; font-size: 0.8rem; transform: rotate(-1.5deg); }
.st-tax-add { background: none !important; color: var(--ink); border: 2.5px solid var(--line) !important; transform: none; }
.st-foot { padding: 6px 16px calc(18px + env(safe-area-inset-bottom, 0px)); display: grid; gap: 8px; }
.st-split { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
.st-split b { min-width: 1.2em; text-align: center; font: 400 1.1rem var(--font-display); }
.st-split em { margin-left: auto; font: normal 400 1.1rem var(--font-display); }
.st-tag { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); container-type: inline-size; text-align: left; padding: 10px 18px 8px 44px; background: var(--acc) !important; color: var(--on-acc); border: 3px solid var(--navy) !important; border-radius: 16px; box-shadow: 5px 5px 0 var(--shadow); transform: rotate(-2deg); font: inherit; }
.st-tag small { font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; }
.st-tag .roll { justify-content: flex-end; font: 400 min(3.4rem, calc(100cqw / (var(--chars) * 0.6))) / 1.15 var(--font-display); text-shadow: 3px 3px 0 var(--navy); }
.st-hole { position: absolute; left: 14px; top: 50%; width: 16px; height: 16px; margin-top: -8px; border-radius: 50%; background: var(--bg); border: 3px solid var(--navy); }
.st-tax:not(.st-tax-add) { animation: st-slap 420ms var(--spring) both; }
@keyframes st-slap { from { opacity: 0; transform: rotate(-6deg) scale(1.15); } }
.is-fresh .st-item-enter-active { transition-delay: calc(min(var(--i, 0), 8) * 45ms); }
.is-fresh .st-tag { animation: st-swing 600ms var(--spring) 120ms both; transform-origin: 22px 50%; }
@keyframes st-swing { from { opacity: 0; transform: rotate(-9deg) translateY(16px); } }
.is-fresh .st-mark { animation: st-spin 900ms var(--spring) both; }
@keyframes st-spin { from { transform: rotate(-90deg) scale(0.6); opacity: 0; } }
.st-pill:hover .flag { transform: rotate(6deg) scale(1.1); }
.st .flag { transition: transform 200ms var(--spring); }
/* A sticker is slapped on: it arrives big and tilted, and settles with a bounce. Bounce is a named exception here (DESIGN.md). */
.st-item-enter-active { transition: transform 420ms var(--spring), opacity 160ms; }
.st-item-leave-active { transition: transform 200ms ease-in, opacity 200ms; }
.st-item-enter-from { opacity: 0; transform: rotate(-4deg) scale(1.08); }
.st-item-leave-to { opacity: 0; transform: rotate(6deg) scale(0.8); }
@container stage (min-width: 900px) {
  .st { display: grid; grid-template-columns: minmax(0, 34rem) minmax(0, 24rem); grid-template-rows: auto 1fr; justify-content: center; column-gap: 40px; padding: 16px 24px; }
  .st-head { grid-column: 1 / -1; }
  .st-list { gap: 14px; }
  .st-foot { align-self: start; padding-top: 24px; gap: 18px; }
  .st-foot .st-tag { order: -1; padding-top: 16px; padding-bottom: 14px; }
  .st-tag .roll { font-size: min(4rem, calc(100cqw / (var(--chars) * 0.6))); }
}
</style>
