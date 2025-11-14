<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Settings, Sun, Moon } from 'lucide-vue-next'

interface Props {
  isDark: boolean
  themeColor: string
}

interface Emits {
  (e: 'toggle-dark-mode'): void
  (e: 'update-theme', color: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const colors = ['#000000', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="ghost" size="icon">
        <Settings class="size-5" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-64">
      <div class="space-y-4">
        <div>
          <h3 class="font-semibold mb-2">Settings</h3>
        </div>
        
        <div class="flex items-center justify-between">
          <span class="text-sm">Dark Mode</span>
          <Button
            variant="outline"
            size="icon"
            @click="emit('toggle-dark-mode')"
          >
            <Sun v-if="isDark" class="size-4" />
            <Moon v-else class="size-4" />
          </Button>
        </div>
        
        <div class="space-y-2">
          <label class="text-sm font-medium">Theme Color</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="color in colors"
              :key="color"
              :style="{ backgroundColor: color }"
              class="size-8 rounded-full border-2 transition-transform hover:scale-110"
              :class="{ 'ring-2 ring-offset-2': themeColor === color }"
              @click="emit('update-theme', color)"
            />
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
