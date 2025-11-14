<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { Kbd } from '@/components/ui/kbd'
import { Plus } from 'lucide-vue-next'
import PriceInput from './PriceInput.vue'
import TaxManager from './TaxManager.vue'
import TotalDisplay from './TotalDisplay.vue'
import SettingsMenu from './SettingsMenu.vue'

interface PriceEntry {
  id: number
  value: string
}

interface TaxEntry {
  id: number
  type: 'percentage' | 'flat'
  value: string
  label: string
}

const prices = ref<PriceEntry[]>([{ id: 1, value: '' }])
let nextPriceId = 2

const taxes = ref<TaxEntry[]>([])
let nextTaxId = 1

const isDark = ref(false)
const themeColor = ref('#000000')

const subtotal = computed(() => {
  return prices.value.reduce((sum, entry) => {
    const num = parseFloat(entry.value) || 0
    return sum + num
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
  prices.value.push({ id: nextPriceId++, value: '' })
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
  // Check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = prefersDark
  if (prefersDark) {
    document.documentElement.classList.add('dark')
  }
  
  // Fix mobile viewport height (accounts for address bar)
  const setVH = () => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }
  setVH()
  window.addEventListener('resize', setVH)
})
</script>

<template>
  <div class="h-screen flex flex-col bg-background overflow-hidden">
    <!-- Header with Settings -->
    <header class="p-4 flex justify-between items-center border-b border-border/40 shrink-0">
      <h1 class="text-2xl font-bold">EZAdd</h1>
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
        <TransitionGroup name="list">
          <PriceInput
            v-for="(entry, index) in prices"
            :key="entry.id"
            :value="entry.value"
            :index="index"
            :can-delete="prices.length > 1"
            @update:value="updatePrice(index, $event)"
            @delete="removeEntry(index)"
            @add-entry="addEntry"
            @focus="() => {}"
          />
        </TransitionGroup>
        
        <!-- Add Entry Button -->
        <button
          @click="addEntry"
          class="w-full py-3 text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 border-t border-dashed border-border/50 mt-2"
        >
          <Plus class="size-4" />
          Add item
          <Kbd class="ml-2 hidden md:inline-flex">⏎</Kbd>
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
