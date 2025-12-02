<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { Kbd } from '@/components/ui/kbd'
import { Plus, Trash2 } from 'lucide-vue-next'
import PriceEntryRow from './PriceEntryRow.vue'
import TaxManager from './TaxManager.vue'
import TotalDisplay from './TotalDisplay.vue'
import SettingsMenu from './SettingsMenu.vue'
import FloatingTotal from './FloatingTotal.vue'
import { useToast } from '@/composables/useToast'
import LogoDark from '@/assets/EZAdd_dark_logo.svg'
import LogoLight from '@/assets/EZAdd_light_logo.svg'

interface PriceEntry {
  id: number
  value: string
  multiplier: number
}

interface TaxEntry {
  id: number
  type: 'percentage' | 'flat'
  value: string
  label: string
}

const prices = ref<PriceEntry[]>([{ id: 1, value: '', multiplier: 1 }])
let nextPriceId = 2

const taxes = ref<TaxEntry[]>([])
let nextTaxId = 1

const isDark = ref(false)
const themeColor = ref('#000000')
const { success, info } = useToast()

const clearAll = () => {
  prices.value = [{ id: nextPriceId++, value: '', multiplier: 1 }]
  nextTick(() => {
    const input = document.querySelector('.price-input') as HTMLInputElement
    input?.focus()
  })
}

const handleGlobalKeydown = (event: KeyboardEvent) => {
  // Escape to blur current focus
  if (event.key === 'Escape') {
    (document.activeElement as HTMLElement)?.blur()
    return
  }
  
  // Shift+Backspace to clear all
  if (event.shiftKey && event.key === 'Backspace') {
    event.preventDefault()
    clearAll()
    return
  }
  
  // N to add new entry (only when not focused on input)
  const activeElement = document.activeElement
  const isInputFocused = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA'
  if (event.key.toLowerCase() === 'n' && !isInputFocused && !event.metaKey && !event.ctrlKey) {
    event.preventDefault()
    addEntry()
  }
}

const subtotal = computed(() => {
  return prices.value.reduce((sum, entry) => {
    const num = parseFloat(entry.value) || 0
    return sum + (num * entry.multiplier)
  }, 0)
})

const totalTaxAmount = computed(() => {
  return taxes.value.reduce((sum, tax) => {
    const value = parseFloat(tax.value) || 0
    if (tax.type === 'percentage') {
      return sum + (subtotal.value * value) / 100
    }
    return sum + value
  }, 0)
})

const total = computed(() => {
  return subtotal.value + totalTaxAmount.value
})

const addEntry = () => {
  prices.value.push({ id: nextPriceId++, value: '', multiplier: 1 })
  nextTick(() => {
    const inputs = document.querySelectorAll('.price-input')
    const lastInput = inputs[inputs.length - 1] as HTMLInputElement
    lastInput?.focus()
  })
}

const removeEntry = (index: number) => {
  if (prices.value.length > 1) {
    prices.value.splice(index, 1)
    // Focus previous input after deletion
    nextTick(() => {
      const newIndex = Math.max(0, index - 1)
      const inputs = document.querySelectorAll('.price-input')
      const inputToFocus = inputs[newIndex] as HTMLInputElement
      inputToFocus?.focus()
    })
  }
}

const updatePrice = (index: number, value: string) => {
  prices.value[index].value = value
}

const updateMultiplier = (index: number, multiplier: number) => {
  prices.value[index].multiplier = multiplier
}

const addTax = (tax: Omit<TaxEntry, 'id'>) => {
  taxes.value.push({
    id: nextTaxId++,
    ...tax
  })
}

const removeTax = (id: number) => {
  taxes.value = taxes.value.filter(tax => tax.id !== id)
}

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

const updateTheme = (color: string) => {
  themeColor.value = color
  // Convert hex to oklch or hsl for primary color
  document.documentElement.style.setProperty('--primary', color)
}

onMounted(() => {
  // Check and apply system theme preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = prefersDark
  if (prefersDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleThemeChange = (e: MediaQueryListEvent) => {
    isDark.value = e.matches
    if (e.matches) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  mediaQuery.addEventListener('change', handleThemeChange)
  
  // Fix mobile viewport height (accounts for address bar)
  const setVH = () => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }
  setVH()
  window.addEventListener('resize', setVH)
  
  // Listen for PWA events
  window.addEventListener('pwa-ready', ((e: CustomEvent) => {
    success(e.detail.message, 4000)
  }) as EventListener)
  
  window.addEventListener('pwa-update', ((e: CustomEvent) => {
    info(e.detail.message, 5000)
  }) as EventListener)
  
  // Global keyboard shortcuts
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <div class="h-screen flex flex-col bg-background overflow-hidden">
    <!-- Header with Settings -->
    <header class="p-4 flex justify-between items-center border-b border-border/40 shrink-0">
      <div class="flex items-center gap-2">
        <img 
          v-if="isDark" 
          :src="LogoDark" 
          alt="EZAdd Logo" 
          class="h-12 w-auto"
        />
        <img 
          v-else 
          :src="LogoLight" 
          alt="EZAdd Logo" 
          class="h-12 w-auto"
        />
        <h1 class="text-2xl font-bold">EZAdd</h1>
      </div>
      <SettingsMenu
        :is-dark="isDark"
        :theme-color="themeColor"
        @toggle-dark-mode="toggleDarkMode"
        @update-theme="updateTheme"
      />
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-h-0">
      <!-- Price Entries - Scrollable -->
      <div class="flex-1 overflow-y-auto px-4 py-6 space-y-1 min-h-0">
        <!-- Clear All Button -->
        <div class="flex justify-end mb-2">
          <button
            @click="clearAll"
            class="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
            aria-label="Clear all entries"
          >
            <Trash2 class="size-3" />
            Clear all
            <Kbd class="ml-1 hidden md:inline-flex">⇧⌫</Kbd>
          </button>
        </div>
        
        <TransitionGroup name="list">
          <PriceEntryRow
            v-for="(entry, index) in prices"
            :key="entry.id"
            :value="entry.value"
            :multiplier="entry.multiplier"
            :index="index"
            :can-delete="prices.length > 1"
            @update:value="updatePrice(index, $event)"
            @update:multiplier="updateMultiplier(index, $event)"
            @delete="removeEntry(index)"
            @add-entry="addEntry"
          />
        </TransitionGroup>
        
        <!-- Add Entry Button -->
        <button
          @click="addEntry"
          class="w-full py-3 text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 border-t border-dashed border-border/50 mt-2"
        >
          <Plus class="size-4" />
          Add item
          <span class="ml-2 hidden md:inline-flex items-center gap-1 text-xs">
            <Kbd>⏎</Kbd>
            <span class="text-muted-foreground/60">or</span>
            <Kbd>N</Kbd>
          </span>
        </button>
      </div>

      <!-- Tax Section -->
      <TaxManager
        :taxes="taxes"
        :total-tax-amount="totalTaxAmount"
        @add-tax="addTax"
        @remove-tax="removeTax"
      />

      <!-- Total Section - Fixed Bottom -->
      <TotalDisplay
        :total="total"
        :subtotal="subtotal"
      />
    </main>
    
    <!-- Floating Total (Mobile Only, When Keyboard Active) -->
    <FloatingTotal :total="total" />
  </div>
</template>

<style scoped>
/* Smooth transitions for list items */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
