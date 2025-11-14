<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Toggle } from '@/components/ui/toggle'
import { X, Plus } from 'lucide-vue-next'

interface TaxEntry {
  id: number
  type: 'percentage' | 'flat'
  value: string
  label: string
}

interface Props {
  taxes: TaxEntry[]
  totalTaxAmount: number
}

interface Emits {
  (e: 'add-tax', tax: Omit<TaxEntry, 'id'>): void
  (e: 'remove-tax', id: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const taxType = ref<'percentage' | 'flat'>('percentage')
const taxValue = ref<string>('')
const taxLabel = ref<string>('')
const isPopoverOpen = ref(false)

const addTax = () => {
  if (!taxValue.value) return
  
  const label = taxLabel.value || (taxType.value === 'percentage' ? `${taxValue.value}%` : `+$${taxValue.value}`)
  
  emit('add-tax', {
    type: taxType.value,
    value: taxValue.value,
    label
  })
  
  // Reset form
  taxValue.value = ''
  taxLabel.value = ''
  isPopoverOpen.value = false
}

const handleKeydown = (event: KeyboardEvent) => {
  // Cmd+Enter to add tax
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault()
    addTax()
  }
}

const handleGlobalKeydown = (event: KeyboardEvent) => {
  // 'T' key to open tax popover (when not typing in an input)
  if (event.key === 't' || event.key === 'T') {
    const target = event.target as HTMLElement
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
      event.preventDefault()
      isPopoverOpen.value = true
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <div class="px-4 py-3 border-t border-border/40 shrink-0">
    <div class="flex items-center gap-2 flex-wrap">
      <span class="text-sm text-muted-foreground">
        {{ taxes.length === 0 ? 'Tax' : taxes.length === 1 ? 'Tax' : 'Taxes' }}:
      </span>
      
      <!-- Existing tax badges -->
      <Badge
        v-for="tax in taxes"
        :key="tax.id"
        variant="secondary"
        class="cursor-pointer hover:bg-destructive/10 group"
        @click="emit('remove-tax', tax.id)"
      >
        {{ tax.label }}
        <X class="size-3 ml-1 opacity-50 group-hover:opacity-100" />
      </Badge>
      
      <!-- Add tax popover -->
      <Popover v-model:open="isPopoverOpen">
        <PopoverTrigger as-child>
          <Badge variant="outline" class="cursor-pointer hover:bg-accent gap-1">
            <Plus class="size-3" />
            Add {{ taxes.length > 0 ? 'another' : 'tax' }}
            <Kbd class="ml-1 hidden md:inline-flex">T</Kbd>
          </Badge>
        </PopoverTrigger>
        <PopoverContent class="w-72" @keydown="handleKeydown">
          <div class="space-y-4">
            <div>
              <h4 class="font-semibold mb-3">Add Tax</h4>
              
              <div class="flex gap-2 mb-3">
                <Toggle
                  :pressed="taxType === 'percentage'"
                  @click="taxType = 'percentage'"
                  class="flex-1"
                >
                  Percentage
                </Toggle>
                <Toggle
                  :pressed="taxType === 'flat'"
                  @click="taxType = 'flat'"
                  class="flex-1"
                >
                  Flat Fee
                </Toggle>
              </div>
              
              <div class="space-y-2">
                <Input
                  v-model="taxValue"
                  type="text"
                  inputmode="decimal"
                  :placeholder="taxType === 'percentage' ? 'Enter %' : 'Enter $'"
                />
                <Input
                  v-model="taxLabel"
                  type="text"
                  placeholder="Label (optional)"
                />
                <Button @click="addTax" class="w-full" size="sm">
                  Add Tax
                  <div class="hidden md:flex items-center gap-1 ml-2">
                    <Kbd>⌘</Kbd>
                    <Kbd>⏎</Kbd>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <span v-if="totalTaxAmount > 0" class="ml-auto text-sm">
        +${{ totalTaxAmount.toFixed(2) }}
      </span>
    </div>
  </div>
</template>
