<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Lightbulb } from 'lucide-vue-next'
import { useApi } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'

const { submitFeatureRequest } = useApi()
const { success, error } = useToast()

const isOpen = ref(false)
const isSubmitting = ref(false)
const title = ref('')
const description = ref('')
const email = ref('')

const handleSubmit = async () => {
  if (!title.value.trim()) {
    error('Please enter a title')
    return
  }

  isSubmitting.value = true
  try {
    await submitFeatureRequest({
      title: title.value.trim(),
      description: description.value.trim() || undefined,
      email: email.value.trim() || undefined
    })
    
    success('Feature request submitted! Thank you!')
    
    // Reset form
    title.value = ''
    description.value = ''
    email.value = ''
    isOpen.value = false
  } catch (err) {
    error('Failed to submit. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <button class="flex items-center gap-2 text-sm hover:text-primary transition-colors w-full text-left">
        <Lightbulb class="size-4" />
        Request a Feature
      </button>
    </PopoverTrigger>
    <PopoverContent class="w-80" align="end">
      <div class="space-y-3">
        <div>
          <h3 class="font-semibold text-sm mb-1">Request a Feature</h3>
          <p class="text-xs text-muted-foreground">Share your ideas to improve EZAdd!</p>
        </div>
        
        <div class="space-y-2">
          <div>
            <label class="text-xs font-medium mb-1 block">Title *</label>
            <Input
              v-model="title"
              placeholder="e.g., Add export feature"
              class="text-sm"
              :disabled="isSubmitting"
            />
          </div>
          
          <div>
            <label class="text-xs font-medium mb-1 block">Description</label>
            <textarea
              v-model="description"
              placeholder="Tell us more about your idea..."
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              :disabled="isSubmitting"
            />
          </div>
          
          <div>
            <label class="text-xs font-medium mb-1 block">Email (optional)</label>
            <Input
              v-model="email"
              type="email"
              placeholder="your@email.com"
              class="text-sm"
              :disabled="isSubmitting"
            />
            <p class="text-[10px] text-muted-foreground mt-0.5">We'll update you if we implement it!</p>
          </div>
        </div>
        
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            class="flex-1"
            @click="isOpen = false"
            :disabled="isSubmitting"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            class="flex-1"
            @click="handleSubmit"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit' }}
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
