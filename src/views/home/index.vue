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
            <n-button size="small" @click="fetchIps">Retry</n-button>
          </template>
        </n-empty>
      </div>
      <div v-else class="ip-grid">
        <!-- Create IP Card -->
        <div class="grid-item create-card" @click="openCreateModal">
          <div class="create-content">
            <n-icon size="40" color="#ccc">
              <add-circle-outline />
            </n-icon>
            <span class="create-text">Create New IP</span>
          </div>
        </div>
        <!-- IP Cards -->
        <div v-for="item in ips" :key="item.id" class="grid-item">
          <ip-card
            :ip="item"
            @click="handleCardClick(item)"
            @edit="openEditModal"
            @delete="handleDelete"
          />
        </div>
      </div>

      <div class="pagination-container" v-if="ips.length > 0 && total > 0">
        <n-pagination
          v-model:page="page"
          :page-count="Math.ceil(total / pageSize)"
          :page-size="pageSize"
          @update:page="handlePageChange"
        />
      </div>
    </div>

    <create-ip-modal
      v-model:show="showCreateModal"
      :edit-data="editingIp"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NSpin, NEmpty, NButton, NIcon, NPagination, useDialog, useMessage } from 'naive-ui'
import { AddCircleOutline } from '@vicons/ionicons5'
import { getIpList, deleteIp } from '@/api/ip'
import type { IP } from '@/types/ip'
import IpCard from './components/ip-card.vue'
import CreateIpModal from './components/create-ip-modal.vue'

const router = useRouter()
const dialog = useDialog()
const message = useMessage()

const ips = ref<IP[]>([])
const loading = ref(false)
const error = ref(false)

const showCreateModal = ref(false)
const editingIp = ref<IP | null>(null)

const page = ref(1)
const pageSize = ref(11)
const total = ref(0)

const fetchIps = async () => {
  loading.value = true
  error.value = false
  try {
    const res = await getIpList({ page: page.value, pageSize: pageSize.value, pagination: true })
    if (res.code === 0 && res.data) {
      ips.value = res.data.list || []
      total.value = res.data.total || 0
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

const handlePageChange = (p: number) => {
  page.value = p
  fetchIps()
}

const handleCardClick = (ip: IP) => {
  router.push(`/workspace/${ip.id}`)
}

const openCreateModal = () => {
  editingIp.value = null
  showCreateModal.value = true
}

const openEditModal = (ip: IP) => {
  editingIp.value = ip
  showCreateModal.value = true
}

const handleDelete = (ip: IP) => {
  dialog.warning({
    title: 'Confirm Delete',
    content: `Are you sure you want to delete IP "${ip.name}"?`,
    positiveText: 'Confirm',
    negativeText: 'Cancel',
    onPositiveClick: async () => {
      try {
        const res = await deleteIp(ip.id)
        if (res.code === 0) {
          message.success('Delete successfully')
          if (ips.value.length === 1 && page.value > 1) {
            page.value -= 1
          }
          fetchIps()
        } else {
          message.error(res.message || 'Delete failed')
        }
      } catch (err: any) {
        console.error(err)
        message.error(err.message || 'Delete failed')
      }
    },
  })
}

const handleSuccess = () => {
  fetchIps()
}

onMounted(() => {
  fetchIps()
})
</script>

<style scoped>
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

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>
