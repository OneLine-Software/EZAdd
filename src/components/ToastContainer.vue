<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { X, CheckCircle2, XCircle, Info } from 'lucide-vue-next'

const { toasts, removeToast } = useToast()

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return CheckCircle2
    case 'error': return XCircle
    default: return Info
  }
}

const getColorClasses = (type: string) => {
  switch (type) {
    case 'success': return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100'
    case 'error': return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
    default: return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[10000] flex flex-col gap-2 max-w-sm">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="opacity-0 translate-x-8"
        enter-to-class="opacity-100 translate-x-0"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-8"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm',
            getColorClasses(toast.type)
          ]"
        >
          <component :is="getIcon(toast.type)" class="size-5 shrink-0" />
          <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
          <button
            @click="removeToast(toast.id)"
            class="shrink-0 hover:opacity-70 transition-opacity"
          >
            <X class="size-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
