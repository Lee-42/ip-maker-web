<template>
  <div class="ip-card">
    <div class="ip-card-image-wrapper">
      <n-image
        :src="template.coverUrl"
        class="ip-card-image"
        object-fit="cover"
        preview-disabled
        lazy
      >
        <template #placeholder>
          <div class="image-placeholder">
            <n-icon size="40" color="#ccc">
              <image-outline />
            </n-icon>
          </div>
        </template>
      </n-image>
    </div>
    <div class="ip-card-info">
      <div class="ip-name" :title="template.name">{{ template.name }}</div>
      <div class="ip-meta">
        <div class="ip-date">
          <n-icon size="14" class="icon">
            <calendar-outline />
          </n-icon>
          <span>{{ formatDate(template.createdAt) }}</span>
        </div>
        <div class="ip-creator">
          <n-icon size="14" class="icon">
            <person-outline />
          </n-icon>
          <span>Admin</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WownowTemplate } from '@/types/template'
import { NImage, NIcon } from 'naive-ui'
import { ImageOutline, CalendarOutline, PersonOutline } from '@vicons/ionicons5'

interface Props {
  template: WownowTemplate
}

const props = defineProps<Props>()

const formatDate = (date: Date | string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.ip-card {
  display: flex;
  background: var(--card-bg-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); /* Could var this too if needed */
  transition: transform 0.2s, box-shadow 0.2s, background-color 0.3s;
  cursor: pointer;
  height: 120px;
  border: 1px solid var(--border-color);
}

.ip-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.ip-card-image-wrapper {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.ip-card-image {
  width: 100%;
  height: 100%;
  display: block;
}

/* Deep selector to target n-image internal img */
.ip-card-image :deep(img) {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--hover-bg-color);
}

.ip-card-info {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.ip-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.ip-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ip-date,
.ip-creator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-color-secondary);
}

.icon {
  display: flex;
}
</style>
