<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { X } from 'lucide-vue-next'
import MultiplierToggle from './MultiplierToggle.vue'

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
}

defineProps<Props>()
const emit = defineEmits<Emits>()

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
</script>

<template>
  <div class="border-b border-border/30 last:border-0 py-2">
    <div class="flex items-center gap-2 group">
      <InputGroup>
        <InputGroupInput
          :model-value="value"
          type="text"
          placeholder="0.00"
          class="text-xl price-input mb-3"
          @update:model-value="emit('update:value', $event)"
          @keydown="handleKeydown"
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
