<script setup lang="ts">
// C. Price sticker: sale colours and fat numerals. Every item is a sticker; the total is the big tag.
import { ref, watch } from 'vue'
import { useLab } from '../shared'
import RollDigits from '../RollDigits.vue'

defineProps<{ dark: boolean }>()
const lab = useLab()
const { basket, sums, shares, count, undo, shared, root, fmt, taxText } = lab

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
    { duration: 380, easing: 'cubic-bezier(0.3, 1.6, 0.5, 1)' },
  )
})
</script>

<template>
  <div ref="root" class="dc" :data-theme="dark ? 'dark' : 'light'">
    <header class="dc-head">
      <svg class="dc-mark" viewBox="0 0 100 100" aria-hidden="true">
        <polygon :points="burst" fill="var(--red)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round" />
        <path d="M50 30v40M30 50h40" stroke="#fff" stroke-width="12" stroke-linecap="round" />
      </svg>
      <h1>EZ<span>Add</span></h1>
      <button class="dc-pill dc-blue" @click="lab.nextCurrency()">{{ lab.settings.value.currency }}</button>
      <button class="dc-pill" @click="lab.share()">{{ shared ? 'Copied!' : 'Share' }}</button>
    </header>

    <main class="dc-main">
      <TransitionGroup tag="ul" name="dc-item" class="dc-list">
        <li v-for="(item, i) in basket.items" :key="item.id" :style="{ '--tilt': (i % 2 ? 0.7 : -0.6) + 'deg' }">
          <div class="dc-what">
            <input v-model="item.name" class="dc-name" :placeholder="`Item ${i + 1}`" :aria-label="`Name of item ${i + 1}`" />
            <div class="dc-qty">
              <button :aria-label="`One fewer of item ${i + 1}`" @click="lab.setQty(item.id, item.qty - 1)">−</button>
              <b>×{{ item.qty }}</b>
              <button :aria-label="`One more of item ${i + 1}`" @click="lab.setQty(item.id, item.qty + 1)">+</button>
              <span v-if="item.qty !== 1 && item.value">{{ fmt(sums.lines[i]) }}</span>
            </div>
          </div>
          <label class="dc-flag">
            <small>each</small>
            <input
              inputmode="decimal" placeholder="0.00" :value="item.value" :data-price="item.id" :aria-label="`Price of item ${i + 1}`"
              @input="lab.onInput($event, item)" @keydown="lab.onKey($event, item)" @paste="lab.onPaste($event, item)"
            />
          </label>
          <button class="dc-del" :aria-label="`Remove item ${i + 1}`" @click="lab.removeItem(item.id)">×</button>
        </li>
      </TransitionGroup>
      <button class="dc-add" @click="lab.add()">+ Stick on another</button>

      <div class="dc-taxes">
        <button v-for="t in basket.taxes" :key="t.id" class="dc-tax" :aria-label="`Remove ${t.label}`" @click="lab.removeTax(t.id)">+ {{ taxText(t) }} ×</button>
        <button class="dc-tax dc-tax-add" @click="lab.addPreset()">+ Tax or fee</button>
        <button class="dc-tax dc-tax-add" @click="lab.clear()">Clear all</button>
      </div>
    </main>

    <footer class="dc-foot">
      <div class="dc-split">
        <span>Split</span>
        <button aria-label="One person fewer" @click="lab.people(-1)">−</button><b>{{ basket.people }}</b><button aria-label="One person more" @click="lab.people(1)">+</button>
        <em v-if="basket.people > 1">{{ fmt(shares[0]) }} each</em>
      </div>
      <div ref="tag" class="dc-tag" aria-live="polite">
        <span class="dc-hole" aria-hidden="true" />
        <small>Total · {{ count }} {{ count === 1 ? 'thing' : 'things' }}</small>
        <RollDigits :text="fmt(sums.total)" />
      </div>
    </footer>

    <Transition name="dc-snack">
      <div v-if="undo" class="dc-snack" role="status">{{ undo.label }} <button @click="undo.run()">Undo</button></div>
    </Transition>
  </div>
</template>

<style>
.dc {
  --bg: #fff3cf; --card: #fff; --ink: #17153b; --soft: #5a5880; --red: #e8292c; --yellow: #ffd91a; --blue: #2447f9; --shadow: #17153b;
  position: absolute; inset: 0; display: flex; flex-direction: column; background: var(--bg); color: var(--ink);
  font: 700 15px/1.4 'Nunito', sans-serif;
  --roll-ease: cubic-bezier(0.3, 1.5, 0.5, 1); --roll-dur: 560ms;
}
.dc[data-theme='dark'] { --bg: #17153b; --card: #26225c; --ink: #fff6dc; --soft: #b7b3e0; --shadow: #000; --blue: #7d93ff; }
.dc button { border: 0; background: none; }
.dc input { border: 0; background: none; outline: none; min-width: 0; font: inherit; }
.dc :focus-visible { outline: 3px solid var(--blue); outline-offset: 2px; }
.dc-head { display: flex; align-items: center; gap: 8px; padding: 12px 16px 6px; }
.dc-mark { width: 46px; height: 46px; transform: rotate(-8deg); flex: none; }
.dc-head h1 { flex: 1; margin: 0; font: 400 1.9rem/1 'Lilita One', sans-serif; transform: rotate(-2deg); transform-origin: left; }
.dc-head h1 span { color: var(--red); }
.dc-pill { min-height: 38px; padding: 0 14px; border: 2.5px solid var(--ink) !important; border-radius: 999px; background: var(--card) !important; font-weight: 900; font-size: 0.8rem; box-shadow: 3px 3px 0 var(--shadow); transition: transform 150ms, box-shadow 150ms; }
.dc-pill:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 var(--shadow); }
.dc-blue { background: var(--blue) !important; color: #fff; }
.dc[data-theme='dark'] .dc-blue { color: #17153b; }
.dc-main { flex: 1; min-height: 0; overflow-y: auto; padding: 10px 16px 16px; }
.dc-list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
.dc-list li { position: relative; display: flex; align-items: center; gap: 10px; padding: 10px 12px 10px 16px; background: var(--card); border: 2.5px solid var(--ink); border-radius: 18px; box-shadow: 4px 4px 0 var(--shadow); transform: rotate(var(--tilt)); }
.dc-what { flex: 1; min-width: 0; display: grid; gap: 4px; }
.dc-name { width: 100%; font-weight: 900; font-size: 1rem; text-overflow: ellipsis; }
.dc-name::placeholder { color: var(--soft); }
.dc-qty { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--soft); }
.dc-qty button, .dc-split button { width: 30px; height: 30px; border: 2.5px solid var(--ink) !important; border-radius: 50%; background: var(--card) !important; font-weight: 900; line-height: 1; transition: transform 150ms cubic-bezier(0.3, 1.6, 0.5, 1); }
.dc-qty button:active, .dc-split button:active { transform: scale(0.82); }
.dc-qty b { min-width: 2em; text-align: center; color: var(--ink); font: 400 1.05rem 'Lilita One', sans-serif; }
.dc-flag { display: grid; justify-items: end; padding: 4px 12px 6px; background: var(--yellow); color: #17153b; border: 2.5px solid #17153b; border-radius: 12px; transform: rotate(2deg); }
.dc-flag small { font-size: 0.6rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; line-height: 1; }
.dc-flag input { width: 3.4em; text-align: right; font: 400 1.5rem/1 'Lilita One', sans-serif; font-variant-numeric: tabular-nums; }
.dc-flag input::placeholder { color: #17153b66; }
.dc-del { position: absolute; top: -10px; right: -8px; width: 28px; height: 28px; border: 2.5px solid var(--ink) !important; border-radius: 50%; background: var(--card) !important; font-weight: 900; line-height: 1; }
.dc-del::after { content: ''; position: absolute; inset: -9px; }
.dc-add { width: 100%; min-height: 52px; margin-top: 14px; border: 2.5px dashed var(--ink) !important; border-radius: 18px; font-weight: 900; }
.dc-taxes { display: flex; flex-wrap: wrap; gap: 8px; padding-top: 14px; }
.dc-tax { min-height: 36px; padding: 0 12px; border-radius: 8px; background: var(--red) !important; color: #fff; font-weight: 900; font-size: 0.8rem; transform: rotate(-1.5deg); }
.dc-tax-add { background: none !important; color: var(--ink); border: 2.5px solid var(--ink) !important; transform: none; }
.dc-foot { padding: 6px 16px 18px; display: grid; gap: 8px; }
.dc-split { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
.dc-split b { min-width: 1.2em; text-align: center; font: 400 1.1rem 'Lilita One', sans-serif; }
.dc-split em { margin-left: auto; font-style: normal; font: 400 1.1rem 'Lilita One', sans-serif; }
.dc-tag { position: relative; display: grid; padding: 10px 18px 8px 44px; background: var(--red); color: #fff; border: 3px solid #17153b; border-radius: 16px; box-shadow: 5px 5px 0 var(--shadow); transform: rotate(-2deg); }
.dc-tag small { font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; }
.dc-tag .roll { justify-content: flex-end; font: 400 clamp(2.4rem, 13cqw, 3.4rem) / 1.15 'Lilita One', sans-serif; text-shadow: 3px 3px 0 #17153b; }
.dc-hole { position: absolute; left: 14px; top: 50%; width: 16px; height: 16px; margin-top: -8px; border-radius: 50%; background: var(--bg); border: 3px solid #17153b; }
.dc-snack { position: absolute; left: 16px; right: 16px; bottom: 150px; display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: var(--ink); color: var(--bg); border-radius: 14px; font-size: 0.85rem; }
.dc-snack button { color: var(--yellow); font-weight: 900; min-height: 32px; }
.dc[data-theme='dark'] .dc-snack button { color: var(--red); }
/* A sticker is slapped on: it arrives big and tilted, and settles with a bounce (asked for by name in LAB-74). */
.dc-item-enter-active { transition: transform 420ms cubic-bezier(0.3, 1.6, 0.5, 1), opacity 160ms; }
.dc-item-leave-active { transition: transform 200ms ease-in, opacity 200ms; }
.dc-item-enter-from { opacity: 0; transform: rotate(-7deg) scale(1.18); }
.dc-item-leave-to { opacity: 0; transform: rotate(6deg) scale(0.8); }
.dc-snack-enter-active, .dc-snack-leave-active { transition: opacity 200ms, transform 200ms; }
.dc-snack-enter-from, .dc-snack-leave-to { opacity: 0; transform: translateY(8px); }
@container stage (min-width: 900px) {
  .dc { display: grid; grid-template-columns: minmax(0, 34rem) minmax(0, 24rem); grid-template-rows: auto 1fr; justify-content: center; column-gap: 40px; padding: 16px 24px; }
  .dc-head { grid-column: 1 / -1; }
  .dc-list { gap: 14px; }
  .dc-foot { align-self: start; padding-top: 24px; gap: 18px; }
  .dc-foot .dc-tag { order: -1; padding-top: 16px; padding-bottom: 14px; }
  .dc-tag .roll { font-size: 4rem; }
  .dc-snack { left: auto; right: 24px; bottom: 24px; width: 22rem; }
}
@media (prefers-reduced-motion: reduce) { .dc * { transition: none !important; } }
</style>
