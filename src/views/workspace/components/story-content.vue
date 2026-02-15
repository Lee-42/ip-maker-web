<template>
  <div class="story-content">
    <h1 class="story-title">{{ story.title }}</h1>
    <div class="story-meta">
      <span class="date">{{ story.date }}</span>
    </div>
    <n-divider />
    <div class="content-body">
      <p>{{ story.content }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NDivider } from 'naive-ui'

interface Story {
  id: number
  title: string
  content: string
  date: string
}

defineProps<{
  story: Story
}>()
</script>

<style scoped>
.story-content {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.story-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.story-meta {
  font-size: 14px;
  color: #999;
}

.content-body {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}
</style>
