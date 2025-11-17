<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { MessageSquare } from 'lucide-vue-next'
import { useApi } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'

const { submitFeedback } = useApi()
const { success, error } = useToast()

const isOpen = ref(false)
const isSubmitting = ref(false)
const name = ref('')
const email = ref('')
const message = ref('')
const rating = ref(5)

const ratingLabels = ['😢', '😕', '😐', '🙂', '😊', '😍']

const handleSubmit = async () => {
  if (!message.value.trim()) {
    error('Please enter your feedback')
    return
  }

  isSubmitting.value = true
  try {
    await submitFeedback({
      name: name.value.trim() || undefined,
      email: email.value.trim() || undefined,
      message: message.value.trim(),
      rating: rating.value
    })
    
    success('Thank you for your feedback!')
    
    // Reset form
    name.value = ''
    email.value = ''
    message.value = ''
    rating.value = 5
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
        <MessageSquare class="size-4" />
        Send Feedback
      </button>
    </PopoverTrigger>
    <PopoverContent class="w-80" align="end">
      <div class="space-y-3">
        <div>
          <h3 class="font-semibold text-sm mb-1">Send Feedback</h3>
          <p class="text-xs text-muted-foreground">How's your experience with EZAdd?</p>
        </div>
        
        <div class="space-y-2">
          <div>
            <label class="text-xs font-medium mb-2 block">Rating</label>
            <div class="space-y-2">
              <Slider
                :model-value="[rating]"
                :min="0"
                :max="5"
                :step="1"
                class="w-full"
                @update:model-value="(value) => value && value[0] !== undefined && (rating = value[0])"
              />
              <div class="flex justify-between items-center">
                <span class="text-xs text-muted-foreground">{{ rating }}/5</span>
                <span class="text-2xl">{{ ratingLabels[rating] }}</span>
              </div>
            </div>
          </div>
          
          <div>
            <label class="text-xs font-medium mb-1 block">Your Feedback *</label>
            <textarea
              v-model="message"
              placeholder="Tell us what you think..."
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              :disabled="isSubmitting"
            />
          </div>
          
          <div>
            <label class="text-xs font-medium mb-1 block">Name (optional)</label>
            <Input
              v-model="name"
              placeholder="Your name"
              class="text-sm"
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
            <p class="text-[10px] text-muted-foreground mt-0.5">For follow-up if needed</p>
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
            {{ isSubmitting ? 'Sending...' : 'Send' }}
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
