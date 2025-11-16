<script setup lang="ts">
import type { SliderRootEmits, SliderRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { SliderRange, SliderRoot, SliderThumb, SliderTrack, useForwardPropsEmits } from "reka-ui"
import { cn } from "@/lib/utils"
import { computed } from "vue"

const props = withDefaults(
  defineProps<SliderRootProps & { 
    class?: HTMLAttributes["class"]
    variant?: 'default' | 'inverted'
  }>(),
  {
    variant: 'default'
  }
)
const emits = defineEmits<SliderRootEmits>()

const delegatedProps = reactiveOmit(props, "class", "variant")

const forwarded = useForwardPropsEmits(delegatedProps, emits)

const isInverted = computed(() => props.variant === 'inverted')
</script>

<template>
  <SliderRoot
    v-slot="{ modelValue }"
    data-slot="slider"
    :class="cn(
      'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
      props.class,
    )"
    v-bind="forwarded"
  >
    <SliderTrack
      data-slot="slider-track"
      :class="isInverted ? 'bg-primary-foreground/20' : 'bg-muted'"
      class="relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
    >
      <SliderRange
        data-slot="slider-range"
        :class="isInverted ? 'bg-primary-foreground dark:bg-primary-foreground' : 'bg-primary dark:bg-primary'"
        class="absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
      />
    </SliderTrack>

    <SliderThumb
      v-for="(_, key) in modelValue"
      :key="key"
      data-slot="slider-thumb"
      :class="isInverted 
        ? 'bg-background dark:bg-background border-2 border-primary-foreground dark:border-primary-foreground ring-primary-foreground/30 shadow-lg' 
        : 'bg-background dark:bg-background border-primary dark:border-primary ring-ring/50 shadow-sm'"
      class="block size-4 shrink-0 rounded-full transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
    />
  </SliderRoot>
</template>
