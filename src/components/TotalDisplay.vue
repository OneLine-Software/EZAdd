<script setup lang="ts">
import { ref, computed } from 'vue'
import { Clipboard, Check } from 'lucide-vue-next'
import { Slider } from '@/components/ui/slider'

interface Props {
  total: number
  subtotal: number
}

const props = defineProps<Props>()

const isCopied = ref(false)
const splitBy = ref(1)

const splitAmount = computed(() => {
  return (props.total / splitBy.value).toFixed(2)
})

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

const copySplit = async () => {
  try {
    await navigator.clipboard.writeText(splitAmount.value)
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
    
    <!-- Split Total Section -->
    <div class="mt-3 pt-3 border-t border-primary-foreground/20">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 flex-1">
          <span class="text-xs font-medium opacity-80">Split by</span>
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
            ${{ splitAmount }}
          </span>
          <button
            @click="copySplit"
            class="p-1 hover:bg-white/20 rounded-md transition-colors"
            :title="isCopied ? 'Copied!' : 'Copy split amount'"
          >
            <Check v-if="isCopied" class="size-3" />
            <Clipboard v-else class="size-3" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
