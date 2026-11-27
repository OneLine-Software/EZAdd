<script setup lang="ts">
// Two ways to pass a basket on: as a plain receipt, or as a link that opens the same basket.
import { useScreen } from '@/composables/useScreen'

const s = useScreen()
const text = async () => {
  await s.share()
  s.sheet.value = null
}
const link = async () => {
  await s.copyLink()
  s.sheet.value = null
}
</script>

<template>
  <section>
    <pre class="share-receipt">{{ s.receipt() }}</pre>
    <button type="button" class="btn is-main is-wide" data-autofocus @click="text">Send as text</button>
    <p class="note">Opens the share sheet on a phone. On a computer it is copied, ready to paste.</p>
  </section>
  <section>
    <button type="button" class="btn is-wide" @click="link">Copy a link to this basket</button>
    <p class="note">Whoever opens the link sees the same items in their own theme. The basket travels inside the link; nothing is stored anywhere.</p>
  </section>
</template>

<style>
.share-receipt { margin: 0; padding: 14px 16px; max-height: 14rem; overflow: auto; border-radius: var(--radius-sm); background: var(--well); box-shadow: inset 0 0 0 1.5px var(--line); font: 500 0.75rem/1.5 ui-monospace, 'Martian Mono', monospace; white-space: pre; text-transform: none; letter-spacing: 0; }
.app[data-look='accent'] .share-receipt { border-radius: 18px; box-shadow: none; }
</style>
