<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  total: number
}

defineProps<Props>()

const isKeyboardVisible = ref(false)
const keyboardHeight = ref(0)

const updatePosition = () => {
  if (window.visualViewport) {
    const viewport = window.visualViewport
    const windowHeight = window.innerHeight
    const viewportHeight = viewport.height
    
    // If viewport height is less than window height, keyboard is visible
    const calculatedKeyboardHeight = windowHeight - viewportHeight
    keyboardHeight.value = calculatedKeyboardHeight
    
    // Show floating total if keyboard takes significant space (> 100px)
    isKeyboardVisible.value = calculatedKeyboardHeight > 100
  }
}

const handleFocus = () => {
  // Small delay to ensure keyboard is shown and viewport updated
  setTimeout(() => {
    updatePosition()
  }, 300)
}

const handleBlur = () => {
  // Delay to prevent flicker when moving between inputs
  setTimeout(() => {
    const activeElement = document.activeElement
    const isInputFocused = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA'
    if (!isInputFocused) {
      isKeyboardVisible.value = false
      keyboardHeight.value = 0
    }
  }, 100)
}

onMounted(() => {
  document.addEventListener('focusin', handleFocus)
  document.addEventListener('focusout', handleBlur)
  
  // Listen to viewport resize (keyboard show/hide)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updatePosition)
    window.visualViewport.addEventListener('scroll', updatePosition)
  }
})

onUnmounted(() => {
  document.removeEventListener('focusin', handleFocus)
  document.removeEventListener('focusout', handleBlur)
  
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', updatePosition)
    window.visualViewport.removeEventListener('scroll', updatePosition)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="isKeyboardVisible"
        class="floating-total md:hidden"
        :style="{ bottom: `${keyboardHeight + 16}px` }"
      >
        <!-- Glassmorphism Card -->
        <div 
          class="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-2 border-primary/20 shadow-2xl shadow-primary/5 rounded-2xl px-4 py-3 min-w-[120px]"
        >
          <div class="text-[10px] uppercase tracking-wider font-semibold text-primary/70 mb-1">
            Total
          </div>
          <div class="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
            ${{ total.toFixed(2) }}
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.floating-total {
  position: fixed;
  right: 1rem;
  z-index: 9999;
  /* Bottom position is set dynamically via inline style */
}

/* Additional glassmorphism effects */
@supports (backdrop-filter: blur(20px)) {
  .backdrop-blur-xl {
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
  }
}
</style>
