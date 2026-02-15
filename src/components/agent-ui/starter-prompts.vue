<template>
  <div
    v-if="prompts && prompts.length > 0"
    v-motion
    :initial="{ opacity: 0, y: 20 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 250 } }"
    :leave="{ opacity: 0, y: -20, transition: { duration: 200 } }"
    class="starter-prompts-container"
    :class="{ hidden: isHidden }"
  >
    <div
      v-motion
      :initial="{ opacity: 0, y: 10 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: 50 } }"
      class="starter-prompts-title"
    >
      {{ title }}
    </div>
    <div
      v-for="(prompt, index) in prompts"
      :key="index"
      v-motion
      :initial="{ opacity: 0, y: 20, scale: 0.95 }"
      :enter="{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 300, delay: 100 + index * 60 },
      }"
      :hovered="{ scale: 1.02, transition: { duration: 150 } }"
      class="starter-prompt-item"
      @click="emit('select', prompt.action)"
    >
      {{ prompt.title }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface StarterPrompt {
  title: string
  action: string
}

interface Props {
  prompts?: StarterPrompt[]
  title?: string
  isHidden?: boolean
}

interface Emits {
  (e: 'select', action: string): void
}

withDefaults(defineProps<Props>(), {
  prompts: () => [],
  title: 'Welcome! I can help you generate various images, which one do you want to start with?',
  isHidden: false,
})

const emit = defineEmits<Emits>()
</script>

<style scoped>
.starter-prompts-container {
  padding: 12px 16px;
  transition:
    opacity 0.3s,
    height 0.3s,
    margin-bottom 0.3s;
  overflow: hidden;
  padding-bottom: 0;
}

.starter-prompts-container.hidden {
  opacity: 0;
  height: 0;
  margin-bottom: 0;
  padding: 0;
}

.starter-prompts-title {
  font-size: 16px;
  color: #777777;
  margin-bottom: 12px;
  font-weight: 500;
  line-height: 24px;
}

.starter-prompt-item {
  background: #f5f5f5;
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 12px;
  width: 100%;
  color: #333333;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.starter-prompt-item:hover {
  background: #f9f9f9;
}
</style>
