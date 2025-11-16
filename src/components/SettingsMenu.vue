<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Settings, Sun, Moon, Github, Download } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

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
const { success, error } = useToast()
const isCaching = ref(false)

const checkCacheStatus = async () => {
  if ('serviceWorker' in navigator && 'caches' in window) {
    const cacheNames = await caches.keys()
    return cacheNames.length > 0
  }
  return false
}

const triggerCache = async () => {
  isCaching.value = true
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      
      // Check if already cached
      const isCached = await checkCacheStatus()
      
      if (isCached) {
        success('App is already cached for offline use!')
      } else {
        // Trigger update to force cache
        await registration.update()
        
        // Wait a bit for caching to happen
        setTimeout(async () => {
          const nowCached = await checkCacheStatus()
          if (nowCached) {
            success('App cached! Now available offline.')
          } else {
            success('Caching in progress... Refresh to complete.')
          }
        }, 2000)
      }
    } else {
      error('Service workers not supported in this browser')
    }
  } catch (err) {
    error('Failed to cache app')
    console.error('Cache error:', err)
  } finally {
    isCaching.value = false
  }
}

// No script loading needed - using direct link
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
        
        <div class="flex flex-col space-y-2 gap-1">
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
        
        <div class="pt-2 border-t">
          <Button
            variant="outline"
            class="w-full justify-center"
            :disabled="isCaching"
            @click="triggerCache"
          >
            <Download class="size-4 mr-2" />
            {{ isCaching ? 'Caching...' : 'Cache for Offline' }}
          </Button>
        </div>
        
        <div class="pt-2 border-t space-y-2">
          <a
            href="https://github.com/OneLine-Software/EZAdd"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600 hover:shadow-lg"
          >
            <Github class="size-4" />
            View on GitHub
          </a>
          
          <a
            href="https://www.buymeacoffee.com/OneLineSoftware"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all bg-gradient-to-br from-primary/90 to-primary text-white hover:from-primary hover:to-primary/80 hover:shadow-lg"
          >
            ☕ Buy me a coffee
          </a>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
