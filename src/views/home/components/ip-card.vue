<template>
  <div class="ip-card">
    <div class="ip-card-image-wrapper">
      <n-image
        :src="ip.avatar"
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
      <div class="ip-header">
        <div class="ip-name" :title="ip.name">{{ ip.name }}</div>
        <div class="ip-actions" @click.stop>
          <n-button text style="margin-right: 8px" @click="$emit('edit', ip)">
            <template #icon>
              <n-icon><create-outline /></n-icon>
            </template>
          </n-button>
          <n-button text type="error" @click="$emit('delete', ip)">
            <template #icon>
              <n-icon><trash-outline /></n-icon>
            </template>
          </n-button>
        </div>
      </div>
      <div class="ip-meta">
        <div class="ip-date">
          <n-icon size="14" class="icon">
            <calendar-outline />
          </n-icon>
          <span>{{ formatDate(ip.createdAt) }}</span>
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
import type { IP } from '@/types/ip'
import { NImage, NIcon, NButton } from 'naive-ui'
import { ImageOutline, CalendarOutline, PersonOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'

interface Props {
  ip: IP
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'edit', ip: IP): void
  (e: 'delete', ip: IP): void
}>()

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
  position: relative;
}

.ip-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.ip-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.ip-actions {
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  margin-left: 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  padding: 2px;
}

.ip-card:hover .ip-actions {
  opacity: 1;
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
  flex: 1;
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
