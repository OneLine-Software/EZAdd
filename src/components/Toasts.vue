<script setup lang="ts">
// One place for short messages: what was just removed (with Undo), what was copied, and notes from the app itself.
import { computed } from 'vue'
import { useScreen } from '@/composables/useScreen'
import { useToast } from '@/composables/useToast'

const { undo, copied } = useScreen()
const { toasts } = useToast()
const copiedText = computed(() => ({ total: 'Total copied', share: 'One share copied', receipt: 'Receipt ready', link: 'Link copied' })[copied.value ?? 'total'])
</script>

<template>
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-if="undo" key="undo" class="toast" role="status">{{ undo.label }} <button type="button" @click="undo.run()">Undo</button></div>
      <div v-if="copied" key="copied" class="toast" role="status">{{ copiedText }}</div>
      <div v-for="t in toasts" :key="t.id" class="toast" role="status">{{ t.message }}</div>
    </TransitionGroup>
  </div>
</template>
