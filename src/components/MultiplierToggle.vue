<script setup lang="ts">
import { ref, computed } from 'vue'
import { Slider } from '@/components/ui/slider'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  multiplier: number
  value: string
}

interface Emits {
  (e: 'update:multiplier', value: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const customMultiplier = ref('')
const isCustomOpen = ref(false)

const multipliedValue = computed(() => {
  const num = parseFloat(props.value) || 0
  return (num * props.multiplier).toFixed(2)
})

const setCustomMultiplier = () => {
  const value = parseFloat(customMultiplier.value)
  if (value && value > 0) {
    emit('update:multiplier', value)
    isCustomOpen.value = false
    customMultiplier.value = ''
  }
}

const clearMultiplier = () => {
  emit('update:multiplier', 1)
}
</script>

<template>
  <div class="flex flex-col gap-1 w-full">
    <!-- Slider Row -->
    <div class="flex items-center gap-1">
      <!-- Multiplier Display -->
      <span class="text-xs font-medium text-muted-foreground min-w-8">
        {{ multiplier }}×
      </span>
      <div class="w-36 shrink-0">
        <Slider
          :model-value="[multiplier]"
          :min="0.5"
          :max="10"
          :step="0.5"
          class="w-full"
          @update:model-value="(value) => value && value[0] && emit('update:multiplier', value[0])"
        />
      </div>
      <!-- Multiplied Value Display -->
      <span v-if="multiplier !== 1" class="text-sm ml-auto font-medium text-muted-foreground">
        =&nbsp;{{ multipliedValue }}
      </span>
    </div>
    
    <!-- Controls Row -->
    <div class="flex items-center gap-2">
      <!-- Custom Multiplier Button -->
      <Popover v-model:open="isCustomOpen">
        <PopoverTrigger as-child>
          <button class="h-6 text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
            Custom
          </button>
        </PopoverTrigger>
        <PopoverContent class="w-48" @keydown.enter="setCustomMultiplier">
          <div class="space-y-2">
            <h4 class="font-semibold text-sm">Custom Multiplier</h4>
            <div class="flex items-center gap-2">
              <Input
                v-model="customMultiplier"
                type="number"
                inputmode="decimal"
                placeholder="2.5"
                class="flex-1"
                autofocus
              />
              <span class="text-sm text-muted-foreground">×</span>
            </div>
            <Button @click="setCustomMultiplier" size="sm" class="w-full">
              Set
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      <!-- Reset Button -->
      <button
        v-if="multiplier !== 1"
        @click="clearMultiplier"
        class="h-6 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
      >
        Reset
      </button>
    </div>
  </div>
</template>
