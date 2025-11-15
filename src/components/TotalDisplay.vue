<script setup lang="ts">
import { ref } from 'vue'
import { Clipboard, Check } from 'lucide-vue-next'

interface Props {
  total: number
  subtotal: number
}

const props = defineProps<Props>()

const isCopied = ref(false)

const copyTotal = async () => {
  try {
    await navigator.clipboard.writeText(props.total.toFixed(2))
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<template>
  <div class="bg-primary text-primary-foreground px-6 py-4 shrink-0">
    <div class="flex justify-between items-center gap-3">
      <span class="text-lg font-bold">Total</span>
      <div class="flex items-center gap-2">
        <span class="text-xl font-extrabold">
          ${{ total.toFixed(2) }}
        </span>
        <button
          @click="copyTotal"
          class="p-1.5 hover:bg-white/20 rounded-md transition-colors"
          :title="isCopied ? 'Copied!' : 'Copy total'"
        >
          <Check v-if="isCopied" class="size-4" />
          <Clipboard v-else class="size-4" />
        </button>
      </div>
    </div>
    <div v-if="subtotal !== total" class="text-sm opacity-80 mt-1 text-right">
      Subtotal: ${{ subtotal.toFixed(2) }}
    </div>
  </div>
</template>
