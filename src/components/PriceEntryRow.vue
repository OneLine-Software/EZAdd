<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Kbd } from '@/components/ui/kbd'
import { X } from 'lucide-vue-next'
import MultiplierToggle from './MultiplierToggle.vue'
import { useDeviceDetection } from '@/composables/useDeviceDetection'

interface Props {
  value: string
  multiplier: number
  index: number
  canDelete: boolean
}

interface Emits {
  (e: 'update:value', value: string): void
  (e: 'update:multiplier', value: number): void
  (e: 'delete'): void
  (e: 'add-entry'): void
  (e: 'bulk-paste', values: string[]): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const { isAndroid, isIOS, isMac } = useDeviceDetection()

const deleteShortcutKey = computed(() => isMac.value ? '⌘' : 'Ctrl')

// Use number input for Android and desktop, text for iOS
const inputType = computed(() => {
  if (isIOS.value) return 'text' // iOS doesn't handle number inputs well
  if (isAndroid.value) return 'number'
  return 'number' // Desktop default
})

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    emit('add-entry')
  }
  if ((event.metaKey || event.ctrlKey) && event.key === 'Backspace') {
    event.preventDefault()
    emit('delete')
  }
}

// Parse clipboard text and extract numbers
const parseClipboardNumbers = (text: string): string[] => {
  // Split by newlines and tabs (spreadsheet copy format)
  const parts = text.split(/[\n\t\r]+/).map(s => s.trim()).filter(Boolean)
  
  return parts
    .map(part => {
      // Strip currency symbols, thousand separators, spaces, and other non-numeric chars
      // Keep only digits, decimal points, and minus signs
      const cleaned = part.replace(/[^\d.,-]/g, '').replace(/,/g, '')
      // Handle negative numbers and validate
      const num = parseFloat(cleaned)
      return isNaN(num) ? null : num.toString()
    })
    .filter((v): v is string => v !== null)
}

const handlePaste = (event: ClipboardEvent) => {
  const text = event.clipboardData?.getData('text') || ''
  const numbers = parseClipboardNumbers(text)
  
  // If multiple numbers found, handle as bulk paste
  if (numbers.length > 1) {
    event.preventDefault()
    emit('bulk-paste', numbers)
  }
  // Single number: let default paste behavior handle it (after cleaning)
  else if (numbers.length === 1) {
    event.preventDefault()
    emit('update:value', numbers[0])
  }
}
</script>

<template>
  <div class="border-b border-border/30 last:border-0 py-2">
    <div class="flex items-center gap-2 group">
      <InputGroup>
        <InputGroupInput
          :model-value="value"
          :type="inputType"
          placeholder="0.00"
          class="text-2xl font-bold price-input my-1"
          @update:model-value="emit('update:value', $event)"
          @keydown="handleKeydown"
          @paste="handlePaste"
        />
        
        <!-- Multipliers Inside Input (Block End) -->
        <InputGroupAddon v-if="value" align="block-end">
          <MultiplierToggle
            :value="value"
            :multiplier="multiplier"
            @update:multiplier="emit('update:multiplier', $event)"
          />
        </InputGroupAddon>
      </InputGroup>
      
      <div class="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          class="size-8 text-muted-foreground hover:text-destructive"
          :disabled="!canDelete"
          @click="emit('delete')"
        >
          <X class="size-4" />
        </Button>
        <Kbd class="hidden md:inline-flex text-[10px]">{{ deleteShortcutKey }}⌫</Kbd>
      </div>
    </div>
  </div>
</template>
