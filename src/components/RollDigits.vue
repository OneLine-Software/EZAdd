<script setup lang="ts">
// A number whose digits roll to their new value. Mechanics only: it takes the type and colour around it.
import { computed } from 'vue'

const props = defineProps<{ text: string }>()
const chars = computed(() => [...props.text])
</script>

<template>
  <span class="roll" role="text" :aria-label="text">
    <template v-for="(ch, i) in chars" :key="chars.length - i">
      <span v-if="/\d/.test(ch)" class="roll-d" aria-hidden="true">
        <span class="roll-s" :style="{ transform: `translateY(${-Number(ch) * 10}%)` }">
          <span v-for="n in 10" :key="n">{{ n - 1 }}</span>
        </span>
      </span>
      <span v-else aria-hidden="true">{{ ch }}</span>
    </template>
  </span>
</template>

<style>
.roll { display: inline-flex; align-items: flex-end; line-height: 1.15; font-variant-numeric: tabular-nums; white-space: pre; }
.roll > span { display: inline-block; height: 1.15em; }
.roll-d { overflow: hidden; text-align: center; }
.roll-s { display: block; transition: transform var(--roll-dur, 520ms) var(--roll-ease, cubic-bezier(0.2, 0, 0, 1)); will-change: transform; }
.roll-s > span { display: block; height: 1.15em; }
@media (prefers-reduced-motion: reduce) { .roll-s { transition: none; } }
</style>
