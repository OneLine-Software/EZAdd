<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Clipboard, Check } from 'lucide-vue-next'
import { Slider } from '@/components/ui/slider'
import { Kbd } from '@/components/ui/kbd'

interface Props {
  total: number
  subtotal: number
}

const props = defineProps<Props>()

const isTotalCopied = ref(false)
const isSplitCopied = ref(false)
const splitBy = ref(1)
const awaitingSplitNumber = ref(false)
let splitTimeout: ReturnType<typeof setTimeout> | null = null

const splitAmount = computed(() => {
  return (props.total / splitBy.value).toFixed(2)
})

const formatNumber = (num: number) => {
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const copyTotal = async () => {
  try {
    await navigator.clipboard.writeText(props.total.toFixed(2))
    isTotalCopied.value = true
    setTimeout(() => {
      isTotalCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  const activeElement = document.activeElement
  const isInputFocused = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA'
  if (isInputFocused) return
  
  // Shift+C to copy total
  if (event.shiftKey && event.key.toLowerCase() === 'c') {
    event.preventDefault()
    copyTotal()
    return
  }
  
  // Shift+S to copy split amount (only when split > 1)
  if (event.shiftKey && event.key.toLowerCase() === 's' && splitBy.value > 1) {
    event.preventDefault()
    copySplit()
    return
  }
  
  // S-{x} for split: press S, then a number within 1s
  if (event.key.toLowerCase() === 's' && !event.shiftKey && !event.metaKey && !event.ctrlKey) {
    event.preventDefault()
    awaitingSplitNumber.value = true
    if (splitTimeout) clearTimeout(splitTimeout)
    splitTimeout = setTimeout(() => {
      awaitingSplitNumber.value = false
    }, 1000)
    return
  }
  
  // If awaiting split number, handle digit keys
  if (awaitingSplitNumber.value && /^[0-9]$/.test(event.key)) {
    event.preventDefault()
    const num = event.key === '0' ? 10 : parseInt(event.key)
    splitBy.value = num
    awaitingSplitNumber.value = false
    if (splitTimeout) clearTimeout(splitTimeout)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (splitTimeout) clearTimeout(splitTimeout)
})

const copySplit = async () => {
  try {
    await navigator.clipboard.writeText(splitAmount.value)
    isSplitCopied.value = true
    setTimeout(() => {
      isSplitCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<template>
  <div class="bg-primary text-primary-foreground px-6 pt-4 pb-4 shrink-0" style="padding-bottom: max(1rem, env(safe-area-inset-bottom));">
    <!-- Split Total Section (moved to top) -->
    <div class="mb-3 pb-3 border-b border-primary-foreground/20">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 flex-1">
          <span class="text-xs font-medium opacity-80 flex items-center gap-1">
            Split by
            <Kbd class="hidden md:inline-flex bg-white/20 text-primary-foreground text-[10px]">S</Kbd>
          </span>
          <Slider
            :model-value="[splitBy]"
            :min="1"
            :max="10"
            :step="1"
            variant="inverted"
            class="flex-1 max-w-[100px]"
            @update:model-value="(value) => value && value[0] && (splitBy = value[0])"
          />
          <span class="text-xs font-medium min-w-[1.5rem] text-center opacity-80">
            {{ splitBy }}
          </span>
        </div>
        
        <!-- Split Amount Display -->
        <div v-if="splitBy > 1" class="flex items-center gap-2">
          <span class="text-lg font-bold">
            ${{ formatNumber(parseFloat(splitAmount)) }}
          </span>
          <button
            @click="copySplit"
            class="p-1 hover:bg-white/20 rounded-md transition-colors flex items-center gap-1"
            :title="isSplitCopied ? 'Copied!' : 'Copy split amount'"
          >
            <Check v-if="isSplitCopied" class="size-3" />
            <Clipboard v-else class="size-3" />
            <Kbd class="hidden md:inline-flex bg-white/20 text-primary-foreground text-[10px]">⇧S</Kbd>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Total Section -->
    <div class="flex justify-between items-center gap-3">
      <span class="text-lg font-bold">Total</span>
      <div class="flex items-center gap-2">
        <span class="text-xl font-extrabold">
          ${{ formatNumber(total) }}
        </span>
        <button
          @click="copyTotal"
          class="p-1.5 hover:bg-white/20 rounded-md transition-colors flex items-center gap-1"
          :title="isTotalCopied ? 'Copied!' : 'Copy total'"
        >
          <Check v-if="isTotalCopied" class="size-4" />
          <Clipboard v-else class="size-4" />
          <Kbd class="hidden md:inline-flex bg-white/20 text-primary-foreground">⇧C</Kbd>
        </button>
      </div>
    </div>
    <div v-if="subtotal !== total" class="text-sm opacity-80 mt-1 text-right">
      Subtotal: ${{ formatNumber(subtotal) }}
    </div>
  </div>
</template>
