<script setup lang="ts">
// E. One accent: black, white and one colour the person chooses. Soft shapes that squish under the thumb.
import { ref, watch } from 'vue'
import { useLab } from '../shared'
import RollDigits from '../RollDigits.vue'

defineProps<{ dark: boolean }>()
const lab = useLab()
const { basket, sums, shares, count, undo, shared, root, fmt, taxText, settings } = lab
const HUES = [265, 150, 95, 40, 350, 215]

const SHAPES = ['44px 64px 52px 72px / 60px 48px 68px 50px', '68px 46px 70px 50px / 48px 66px 52px 64px', '52px 72px 46px 62px / 70px 52px 60px 46px']
const shape = ref(0)
watch(() => sums.value.total, () => (shape.value = (shape.value + 1) % SHAPES.length))
</script>

<template>
  <div ref="root" class="de" :data-theme="dark ? 'dark' : 'light'" :style="{ '--hue': settings.hue }">
    <header class="de-head">
      <svg class="de-mark" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M18 3h12a5 5 0 0 1 5 5v5h5a5 5 0 0 1 5 5v12a5 5 0 0 1-5 5h-5v5a5 5 0 0 1-5 5H18a5 5 0 0 1-5-5v-5H8a5 5 0 0 1-5-5V18a5 5 0 0 1 5-5h5V8a5 5 0 0 1 5-5z" fill="var(--acc)" />
        <path d="M17.5 24h13M24 17.5v13" stroke="var(--on-acc)" stroke-width="4.5" stroke-linecap="round" />
      </svg>
      <h1>ezadd</h1>
      <div class="de-hues" role="group" aria-label="Accent colour">
        <button v-for="h in HUES" :key="h" :style="{ '--hue': h }" :aria-pressed="settings.hue === h" :aria-label="`Accent colour ${h}`" @click="settings.hue = h" />
      </div>
    </header>

    <section class="de-hero" aria-live="polite">
      <i class="de-blob" :style="{ borderRadius: SHAPES[shape] }" aria-hidden="true" />
      <small>total · {{ count }} {{ count === 1 ? 'thing' : 'things' }}</small>
      <RollDigits :text="fmt(sums.total)" />
      <div class="de-split">
        <button aria-label="One person fewer" @click="lab.people(-1)">−</button>
        <span>{{ basket.people === 1 ? 'just me' : `split by ${basket.people}` }}</span>
        <button aria-label="One person more" @click="lab.people(1)">+</button>
        <b v-if="basket.people > 1">{{ fmt(shares[0]) }} each</b>
      </div>
    </section>

    <main class="de-main">
      <TransitionGroup tag="ul" name="de-item" class="de-list">
        <li v-for="(item, i) in basket.items" :key="item.id">
          <input v-model="item.name" class="de-name" :placeholder="`item ${i + 1}`" :aria-label="`Name of item ${i + 1}`" />
          <input
            class="de-price" inputmode="decimal" placeholder="0.00" :value="item.value" :data-price="item.id" :aria-label="`Price of item ${i + 1}`"
            @input="lab.onInput($event, item)" @keydown="lab.onKey($event, item)" @paste="lab.onPaste($event, item)"
          />
          <div class="de-qty">
            <button :aria-label="`One fewer of item ${i + 1}`" @click="lab.setQty(item.id, item.qty - 1)">−</button>
            <b>{{ item.qty }}</b>
            <button :aria-label="`One more of item ${i + 1}`" @click="lab.setQty(item.id, item.qty + 1)">+</button>
          </div>
          <button class="de-del" :aria-label="`Remove item ${i + 1}`" @click="lab.removeItem(item.id)">×</button>
        </li>
      </TransitionGroup>
      <div class="de-chips">
        <button v-for="t in basket.taxes" :key="t.id" class="de-chip de-chip-on" :aria-label="`Remove ${t.label}`" @click="lab.removeTax(t.id)">{{ taxText(t) }} ×</button>
        <button class="de-chip" @click="lab.addPreset()">+ tax or fee</button>
        <button class="de-chip" @click="lab.nextCurrency()">{{ settings.currency }}</button>
        <button class="de-chip" @click="lab.share()">{{ shared ? 'copied' : 'share' }}</button>
        <button class="de-chip" @click="lab.clear()">clear</button>
      </div>
    </main>

    <button class="de-fab" aria-label="Add an item" @click="lab.add()"><span>+</span></button>

    <Transition name="de-snack">
      <div v-if="undo" class="de-snack" role="status">{{ undo.label }} <button @click="undo.run()">undo</button></div>
    </Transition>
  </div>
</template>

<style>
.de {
  --bg: #fff; --ink: #0b0b0c; --soft: #6b6b70; --line: #0b0b0c1a;
  --acc: oklch(0.84 0.15 var(--hue)); --on-acc: #0b0b0c; --acc-soft: oklch(0.955 0.035 var(--hue));
  position: absolute; inset: 0; display: flex; flex-direction: column; background: var(--bg); color: var(--ink);
  font: 500 16px/1.4 'Bricolage Grotesque', sans-serif;
  --squish: cubic-bezier(0.3, 1.7, 0.5, 1); --roll-ease: var(--squish); --roll-dur: 600ms;
}
.de[data-theme='dark'] { --bg: #0b0b0c; --ink: #f6f6f4; --soft: #a0a0a6; --line: #ffffff24; --acc-soft: oklch(0.27 0.05 var(--hue)); }
.de button { border: 0; background: none; }
.de input { border: 0; background: none; outline: none; min-width: 0; font: inherit; }
.de :focus-visible { outline: 3px solid var(--ink); outline-offset: 2px; }
.de-head { display: flex; align-items: center; gap: 10px; padding: 14px 16px 4px; }
.de-mark { width: 40px; height: 40px; flex: none; }
.de-head h1 { flex: 1; margin: 0; font-size: 1.7rem; font-weight: 800; letter-spacing: -0.05em; line-height: 1; }
.de-hues { display: flex; gap: 2px; }
.de-hues button { width: 28px; height: 44px; display: grid; place-items: center; }
.de-hues button::before { content: ''; width: 20px; height: 20px; border-radius: 50%; background: oklch(0.84 0.15 var(--hue)); transition: transform 240ms var(--squish); }
.de-hues button[aria-pressed='true']::before { transform: scale(1.3); box-shadow: 0 0 0 2.5px var(--bg), 0 0 0 4.5px var(--ink); }
.de-hero { position: relative; display: grid; justify-items: start; padding: 22px 28px 22px; margin: 4px 16px 0; color: var(--on-acc); isolation: isolate; }
.de-blob { position: absolute; inset: 0; z-index: -1; background: var(--acc); transition: border-radius 700ms var(--squish), background-color 300ms; }
.de-hero small { font-weight: 600; opacity: 0.75; }
.de-hero .roll { font-size: clamp(3rem, 17cqw, 4.6rem); font-weight: 800; letter-spacing: -0.05em; }
.de-split { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.9rem; width: 100%; }
.de-split b { margin-left: auto; font-weight: 800; }
.de-split button, .de-qty button { width: 32px; height: 32px; border-radius: 50%; background: var(--on-acc) !important; color: var(--acc); font-weight: 800; line-height: 1; transition: transform 220ms var(--squish); }
.de-split button:active, .de-qty button:active { transform: scale(0.78, 0.9); }
.de-main { flex: 1; min-height: 0; overflow-y: auto; padding: 14px 16px 96px; }
.de-list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; }
.de-list li { display: flex; align-items: center; gap: 8px; padding: 8px 8px 8px 20px; background: var(--acc-soft); border-radius: 999px; }
.de-name { flex: 1; font-weight: 600; text-overflow: ellipsis; }
.de-name::placeholder, .de-price::placeholder { color: var(--soft); }
.de-price { width: 3.6em; text-align: right; font-weight: 800; font-size: 1.2rem; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.de-qty { display: flex; align-items: center; gap: 2px; padding: 2px; border-radius: 999px; background: var(--bg); }
.de-qty button { background: var(--ink) !important; color: var(--bg); width: 30px; height: 30px; }
.de-qty b { min-width: 1.5em; text-align: center; font-weight: 800; }
.de-del { width: 30px; height: 44px; color: var(--soft); font-size: 1.2rem; }
.de-chips { display: flex; flex-wrap: wrap; gap: 8px; padding-top: 14px; }
.de-chip { min-height: 38px; padding: 0 14px; border-radius: 999px; box-shadow: inset 0 0 0 1.5px var(--ink); font-weight: 600; font-size: 0.875rem; transition: transform 220ms var(--squish); }
.de-chip:active { transform: scale(0.92); }
.de-chip-on { background: var(--ink) !important; color: var(--bg); }
.de-fab { position: absolute; right: 18px; bottom: 20px; width: 68px; height: 68px; border-radius: 46% 54% 52% 48% / 52% 46% 54% 48%; background: var(--ink) !important; color: var(--bg); font-size: 2.2rem; font-weight: 500; line-height: 1; box-shadow: 0 10px 24px #0003; transition: transform 260ms var(--squish), border-radius 400ms var(--squish); }
.de-fab:active { transform: scale(1.14, 0.84); border-radius: 54% 46% 44% 56% / 44% 56% 46% 54%; }
.de-fab span { display: block; transition: transform 300ms var(--squish); }
.de-fab:active span { transform: rotate(90deg); }
.de-snack { position: absolute; left: 16px; right: 100px; bottom: 28px; display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; border-radius: 999px; background: var(--ink); color: var(--bg); font-size: 0.875rem; font-weight: 600; }
.de-snack button { color: var(--acc); font-weight: 800; min-height: 32px; }
.de[data-theme='light'] .de-snack button { color: oklch(0.9 0.14 var(--hue)); }
/* An item drops in and lands soft; it squashes on the way out. Bounce is this direction's signature (LAB-74). */
.de-item-enter-active { transition: transform 460ms var(--squish), opacity 140ms; }
.de-item-leave-active { transition: transform 200ms ease-in, opacity 200ms; }
.de-item-enter-from { opacity: 0; transform: translateY(-26px) scale(0.9, 1.12); }
.de-item-leave-to { opacity: 0; transform: scale(0.7, 0.4); }
.de-snack-enter-active, .de-snack-leave-active { transition: opacity 200ms, transform 300ms var(--squish); }
.de-snack-enter-from, .de-snack-leave-to { opacity: 0; transform: translateY(12px) scale(0.9); }
@container stage (min-width: 900px) {
  .de { display: grid; grid-template-columns: minmax(0, 28rem) minmax(0, 34rem); grid-template-rows: auto 1fr; justify-content: center; column-gap: 32px; padding: 16px 24px; }
  .de-head { grid-column: 1 / -1; padding-inline: 0; }
  .de-hero { margin: 24px 0 0; padding: 56px 44px; align-self: start; }
  .de-hero .roll { font-size: 6rem; }
  .de-main { padding-top: 24px; }
  .de-fab { right: calc(50% - 31rem); bottom: 32px; }
  .de-snack { left: auto; right: calc(50% - 25rem); width: 22rem; }
}
@media (prefers-reduced-motion: reduce) { .de * { transition: none !important; } }
</style>
