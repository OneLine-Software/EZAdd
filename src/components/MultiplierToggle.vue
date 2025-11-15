<script setup lang="ts">
import { ref, computed } from 'vue'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-vue-next'

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

// Convert multiplier to tab value
const currentTab = computed(() => {
  if (props.multiplier === 2) return '2'
  if (props.multiplier === 3) return '3'
  return '1' // default/none (custom multipliers don't have a tab)
})

const handleTabChange = (value: string | number) => {
  const val = String(value)
  if (val === '2') {
    emit('update:multiplier', 2)
  } else if (val === '3') {
    emit('update:multiplier', 3)
  } else {
    // value === '1' or clicking same tab = turn off
    emit('update:multiplier', 1)
  }
}

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
  <div class="flex flex-col gap-2 w-[25%] lt-sm:w-[40%]">
  <div class="flex items-center gap-2">
    <!-- Multiplier Tabs -->
    <Tabs :model-value="currentTab" @update:model-value="handleTabChange">
      <TabsList class="h-7">
        <TabsTrigger value="2" class="h-6 px-2 text-xs">
          2×
        </TabsTrigger>
      <TabsTrigger value="3" class="h-6 px-2 text-xs">
        3×
      </TabsTrigger>
    </TabsList>
  </Tabs>
  
  <!-- Custom Multiplier Button -->
  <Popover v-model:open="isCustomOpen">
    <PopoverTrigger as-child>
      <button class="h-7 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
        {{ multiplier !== 1 && multiplier !== 2 && multiplier !== 3 ? `${multiplier}×` : 'Custom' }}
      </button>
    </PopoverTrigger>
    <PopoverContent class="w-48" @keydown.enter="setCustomMultiplier">
      <div class="space-y-2">
        <h4 class="font-semibold text-sm">Custom Multiplier</h4>
        <div class="flex items-center gap-2">
          <Input
            v-model="customMultiplier"
            type="text"
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
  
  <!-- Clear Button -->
  <button
    v-if="multiplier !== 1"
    @click="clearMultiplier"
    class="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-sm transition-colors"
  >
    <X class="size-3" />
  </button>
  </div>  
  <!-- Experimental Slider for Multiplier -->
  <div class="w-full mt-2 px-1">
    <Slider
      :model-value="[multiplier]"
      :min="0.5"
      :max="10"
      :step="0.5"
      class="w-full"
      @update:model-value="(value) => value && value[0] && emit('update:multiplier', value[0])"
    />
    <div class="flex justify-between text-[10px] text-muted-foreground mt-0.5">
      <span>1×</span>
      <span>10×</span>
    </div>
  </div>    
</div>
  
  <!-- Multiplied Value Display -->
  <span v-if="multiplier !== 1" class="ml-auto text-sm font-medium tabular-nums text-muted-foreground">
    = ${{ multipliedValue }}
  </span>
</template>
