<template>
  <div class="home-page">
    <div class="content-container">
      <h1 class="page-title">My IPs</h1>
      <div v-if="loading" class="loading-state">
        <n-spin size="large" />
      </div>
      <div v-else-if="error" class="error-state">
        <n-empty description="Failed to load IPs">
          <template #extra>
            <n-button size="small" @click="fetchTemplates">Retry</n-button>
          </template>
        </n-empty>
      </div>
      <div v-else-if="templates.length === 0" class="empty-state">
        <n-empty description="No IPs found" />
      </div>
      <div v-else class="ip-grid">
        <!-- Create IP Card -->
        <div class="grid-item create-card" @click="showCreateModal = true">
          <div class="create-content">
            <n-icon size="40" color="#ccc">
              <add-circle-outline />
            </n-icon>
            <span class="create-text">Create New IP</span>
          </div>
        </div>
        <!-- IP Cards -->
        <div v-for="template in templates" :key="template.id" class="grid-item">
          <ip-card :template="template" @click="handleCardClick(template)" />
        </div>
      </div>
    </div>
    
    <create-ip-modal
      v-model:show="showCreateModal"
      @success="handleCreateSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NSpin, NEmpty, NButton, NIcon } from 'naive-ui'
import { AddCircleOutline } from '@vicons/ionicons5'
import { getTemplates } from '@/api/template'
import type { WownowTemplate } from '@/types/template'
import IpCard from './components/ip-card.vue'
import CreateIpModal from './components/create-ip-modal.vue'

const router = useRouter()
const templates = ref<WownowTemplate[]>([])
const loading = ref(false)
const error = ref(false)
const showCreateModal = ref(false)

const fetchTemplates = async () => {
  loading.value = true
  error.value = false
  try {
    const res = await getTemplates({ page: 1, pageSize: 100 }) // Fetch enough for demo
    if (res.code === 0 && res.data?.list) {
      templates.value = res.data.list
    } else {
      error.value = true
    }
  } catch (err) {
    console.error(err)
    error.value = true
  } finally {
    loading.value = false
  }
}

const handleCardClick = (template: WownowTemplate) => {
  router.push(`/workspace/${template.id}`)
}

const handleCreateSuccess = (newIp: { name: string; coverUrl: string }) => {
  // Since we don't have a real create API, we'll manually add it to the list locally
  // In a real app, we would reload the list or the API would return the full object
  const mockTemplate: WownowTemplate = {
    id: Date.now(), // Mock ID
    name: newIp.name,
    coverUrl: newIp.coverUrl,
    createdAt: new Date(),
    // ... fill other required fields with defaults
    description: '',
    styleId: 0,
    shapeSize: '',
    materialDescription: '',
    threeDimensionUrls: [],
    sceneDescription: '',
    recommendCoverUrl: '',
    prompt: '',
    processOptions: [],
    type: '',
    craftType: '',
    taskType: '',
    label: '' as any,
    isRecommended: false,
    isDeleted: false,
    status: 1,
    sort: 0,
    updatedAt: new Date(),
    categoryName: '',
    styleName: '',
    orientation: 'horizontal' as any,
    aspectRatio: '',
    position: 'home_page',
    info: null,
  }
  
  templates.value.unshift(mockTemplate)
}

onMounted(() => {
  fetchTemplates()
})
</script>

<style scoped>
/* ... existing styles ... */
.create-card {
  height: 120px;
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: var(--card-bg-color);
  transition: all 0.2s;
}

.create-card:hover {
  border-color: var(--active-text-color);
  background-color: var(--active-bg-color);
}

.create-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.create-text {
  font-size: 14px;
  color: var(--text-color-secondary);
  font-weight: 500;
}
.home-page {
  min-height: 100vh;
  background-color: var(--body-bg-color);
  padding: 24px;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 24px;
}

.ip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
