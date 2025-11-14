<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { X } from 'lucide-vue-next'

interface Props {
  value: string
  index: number
  canDelete: boolean
}

interface Emits {
  (e: 'update:value', value: string): void
  (e: 'delete'): void
  (e: 'add-entry'): void
  (e: 'focus'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localValue = ref(props.value)

// Watch for external changes
watch(() => props.value, (newValue) => {
  localValue.value = newValue
})

// Watch for local changes and validate
watch(localValue, (newValue) => {
  // Allow numbers, decimal point, minus sign (only at start), and empty string
  const validPattern = /^-?\d*\.?\d*$/
  
  if (validPattern.test(newValue)) {
    emit('update:value', newValue)
  } else {
    // Reset to previous valid value
    localValue.value = props.value
  }
})

const handleKeydown = (event: KeyboardEvent) => {
  // Enter key - add new entry
  if (event.key === 'Enter') {
    event.preventDefault()
    emit('add-entry')
  }
  // Cmd+Backspace or Ctrl+Backspace - delete current entry
  if ((event.metaKey || event.ctrlKey) && event.key === 'Backspace') {
    event.preventDefault()
    emit('delete')
  }
}
</script>

<template>
  <div class="flex items-center gap-2 py-2 border-b border-border/30 last:border-0 group">
    <Input
      v-model="localValue"
      type="text"
      placeholder="0.00"
      class="price-input flex-1 text-lg border-0 shadow-none focus-visible:ring-0 px-2"
      @keydown="handleKeydown"
      @focus="emit('focus')"
    />
    <div class="flex items-center gap-1">
      <div class="hidden md:group-hover:flex items-center gap-1 text-xs text-muted-foreground mr-1">
        <Kbd>⌘</Kbd>
        <Kbd>⌫</Kbd>
      </div>
      <Button
        variant="ghost"
        size="icon"
        class="size-8 text-muted-foreground hover:text-destructive shrink-0"
        :disabled="!canDelete"
        @click="emit('delete')"
      >
        <X class="size-4" />
      </Button>
    </div>
  </div>
</template>
