<script setup lang="ts">
// A country's flag, or its code where there is no flag to show. Each look frames it its own way (tokens.css).
import { ref, watch } from 'vue'

const props = defineProps<{ code?: string | null; label?: string }>()
const failed = ref(false)
watch(() => props.code, () => (failed.value = false))
</script>

<template>
  <span v-if="code && !failed" class="flag"><img :src="`/flags/${code}.svg`" alt="" loading="lazy" decoding="async" @error="failed = true" /></span>
  <span v-else-if="label" class="flag flag-code">{{ label }}</span>
</template>
