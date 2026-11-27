<script setup lang="ts">
// A shortcut shown on the thing it presses. Only where there is a keyboard and a mouse (tokens.css).
defineProps<{ k: string }>()
</script>

<template>
  <kbd class="kbd" aria-hidden="true">{{ k }}</kbd>
</template>
