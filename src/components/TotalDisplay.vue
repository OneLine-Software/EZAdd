<script setup lang="ts">
interface Props {
  total: number
  subtotal: number
}

defineProps<Props>()
</script>

<template>
  <div class="bg-primary text-primary-foreground px-6 py-4 shrink-0">
    <div class="flex justify-between items-center">
      <span class="text-lg font-bold">Total</span>
      <span class="text-xl font-extrabold">
        ${{ total.toFixed(2) }}
      </span>
    </div>
    <div v-if="subtotal !== total" class="text-sm opacity-80 mt-1 text-right">
      Subtotal: ${{ subtotal.toFixed(2) }}
    </div>
  </div>
</template>
