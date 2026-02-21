<template>
  <div class="workspace-page">
    <div class="left-column">
      <story-list
        :stories="stories"
        :active-id="currentStoryId"
        @select="handleStorySelect"
        @back="handleBack"
        @create="handleCreateStory"
        @edit="handleEditStory"
        @delete="handleDeleteStory"
      />
    </div>
    <div class="middle-column">
      <div class="column-header">
        <h2 class="column-title">Writer</h2>
      </div>
      <div class="column-content">
        <story-content v-if="currentStory" :story="currentStory" />
        <div v-else class="empty-story">
          <n-empty description="Select a story to view details" />
        </div>
      </div>
    </div>
    <div class="resize-handle" @mousedown="startResize"></div>
    <div class="right-column" :style="{ width: rightColumnWidth + 'px' }">
      <div class="column-header">
        <h2 class="column-title">Painter</h2>
      </div>
      <div class="column-content">
        <chat-panel />
      </div>
    </div>

    <create-story-modal
      v-model:show="showCreateModal"
      :ip-id="ipId"
      :edit-data="editingStory"
      @success="handleCreateSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NEmpty, useMessage, useDialog } from 'naive-ui'
import StoryList from './components/story-list.vue'
import StoryContent from './components/story-content.vue'
import ChatPanel from './components/chat-panel.vue'
import CreateStoryModal from './components/create-story-modal.vue'
import { getStoryList, deleteStory } from '@/api/story'
import type { Story } from '@/types/story'

const route = useRoute()
const router = useRouter()
const ipId = Number(route.params.id)

const stories = ref<Story[]>([])
const currentStoryId = ref<number | null>(null)
const loading = ref(false)

const currentStory = computed(() =>
  stories.value.find((s) => s.id === currentStoryId.value)
)

const handleStorySelect = (story: Story) => {
  currentStoryId.value = story.id
}

const handleBack = () => {
  router.push('/home')
}

const fetchStories = async () => {
  loading.value = true
  try {
    const res = await getStoryList({ ipId, page: 1, pageSize: 100, pagination: false })
    if (res.code === 0 && res.data) {
      stories.value = res.data.list || []
      if (!currentStoryId.value && stories.value.length > 0) {
        currentStoryId.value = stories.value[0].id
      } else if (currentStoryId.value && !stories.value.find(s => s.id === currentStoryId.value)) {
        currentStoryId.value = stories.value.length > 0 ? stories.value[0].id : null
      }
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStories()
})

// Create/Edit Story Logic
const message = useMessage()
const dialog = useDialog()
const showCreateModal = ref(false)
const editingStory = ref<Story | null>(null)

const handleCreateStory = () => {
  editingStory.value = null
  showCreateModal.value = true
}

const handleEditStory = (story: Story) => {
  editingStory.value = story
  showCreateModal.value = true
}

const handleDeleteStory = (story: Story) => {
  dialog.warning({
    title: 'Delete Story',
    content: `Are you sure you want to delete "${story.title}"?`,
    positiveText: 'Delete',
    negativeText: 'Cancel',
    onPositiveClick: async () => {
      try {
        const res = await deleteStory(story.id)
        if (res.code === 0) {
          message.success('Story deleted')
          if (currentStoryId.value === story.id) {
            currentStoryId.value = null
          }
          fetchStories()
        } else {
          message.error(res.message || 'Delete failed')
        }
      } catch (err) {
        console.error(err)
        message.error('Delete failed')
      }
    },
  })
}

const handleCreateSuccess = () => {
  fetchStories()
}

// Resizable Columns Logic
const rightColumnWidth = ref(600)
const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)

const startResize = (e: MouseEvent) => {
  isResizing.value = true
  startX.value = e.clientX
  startWidth.value = rightColumnWidth.value
  document.addEventListener('mousemove', doResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const doResize = (e: MouseEvent) => {
  if (!isResizing.value) return
  const diff = startX.value - e.clientX
  const newWidth = startWidth.value + diff
  // Min width 300px, Max width 800px or logic based on window width
  if (newWidth >= 300 && newWidth <= 800) {
    rightColumnWidth.value = newWidth
  }
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', doResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}
</script>

<style scoped>
.workspace-page {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--body-bg-color);
  overflow: hidden;
  color: var(--text-color);
}

.left-column {
  width: 300px; /* Adjusted width */
  background-color: var(--card-bg-color);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.middle-column {
  flex: 1;
  background-color: var(--card-bg-color);
  display: flex;
  flex-direction: column;
  min-width: 0; /* Prevent flex item from overflowing */
  border-right: 1px solid var(--border-color);
}

.right-column {
  background-color: var(--card-bg-color);
  display: flex;
  flex-direction: column;
}

.column-header {
  height: 60px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.column-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.column-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  position: relative;
}

.resize-handle {
  width: 4px;
  background-color: transparent;
  cursor: col-resize;
  transition: background-color 0.2s;
  z-index: 10;
  border-left: 1px solid var(--border-color);
  margin-left: -1px; /* Overlap border */
}

.resize-handle:hover,
.resize-handle:active {
  background-color: var(--resize-handle-hover);
}

.empty-story {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
