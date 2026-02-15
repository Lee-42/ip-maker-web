<template>
  <div class="story-list-container">
    <div class="header">
      <n-button text class="back-button" @click="$emit('back')">
        <template #icon>
          <n-icon size="20">
            <arrow-back />
          </n-icon>
        </template>
        Back
      </n-button>
      <h2 class="title">Stories</h2>
    </div>
    <div class="list">
      <!-- Create New Story Item -->
      <div class="story-item create-item" @click="$emit('create')">
        <n-icon size="20" color="#666">
          <add-circle-outline />
        </n-icon>
        <div class="story-title">New Story</div>
      </div>

      <div
        v-for="story in stories"
        :key="story.id"
        class="story-item"
        :class="{ active: story.id === activeId }"
        @click="$emit('select', story)"
      >
        <div class="story-content-wrapper">
          <div class="story-title">{{ story.title }}</div>
          <div class="story-date">{{ story.date }}</div>
        </div>
        <div class="actions">
          <div class="action-btn edit-btn" @click.stop="$emit('edit', story)">
            <n-icon size="16">
              <create-outline />
            </n-icon>
          </div>
          <div class="action-btn delete-btn" @click.stop="$emit('delete', story)">
            <n-icon size="16">
              <trash-outline />
            </n-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { ArrowBack, AddCircleOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'

interface Story {
  id: number
  title: string
  content: string
  date: string
}

defineProps<{
  stories: Story[]
  activeId: number | null
}>()

defineEmits<{
  (e: 'select', story: Story): void
  (e: 'back'): void
  (e: 'create'): void
  (e: 'edit', story: Story): void
  (e: 'delete', story: Story): void
}>()
</script>

<style scoped>
.story-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button {
  font-size: 14px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.story-item {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 8px;
  color: var(--text-color);
}

.story-item:hover {
  background-color: var(--hover-bg-color);
}

.story-item.active {
  background-color: var(--active-bg-color);
  color: var(--active-text-color);
}

.story-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.story-date {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.create-item {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px dashed var(--border-color);
  background-color: var(--card-bg-color);
}

.create-item:hover {
  border-color: var(--active-text-color);
  background-color: var(--active-bg-color);
  color: var(--active-text-color);
}

.create-item .story-title {
  margin-bottom: 0;
  font-weight: 500;
}

.story-item {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.story-content-wrapper {
  flex: 1;
  min-width: 0;
}

.actions {
  display: none;
  gap: 4px;
}

.story-item:hover .actions {
  display: flex;
}

.action-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: #333;
}

.delete-btn:hover {
  color: #d03050;
  background-color: rgba(208, 48, 80, 0.1);
}
</style>
