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
      <story-content v-if="currentStory" :story="currentStory" />
      <div v-else class="empty-story">
        <n-empty description="Select a story to view details" />
      </div>
    </div>
    <div class="resize-handle" @mousedown="startResize"></div>
    <div class="right-column" :style="{ width: rightColumnWidth + 'px' }">
      <chat-panel />
    </div>

    <create-story-modal
      v-model:show="showCreateModal"
      :initial-title="editingStory?.title"
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

// Mock Data
interface Story {
  id: number
  title: string
  content: string
  date: string
}

const mockStories: Story[] = [
  {
    id: 1,
    title: 'The Origin of the IP',
    content: 'This IP was created in 2023 with the vision of...',
    date: '2023-01-15',
  },
  {
    id: 2,
    title: 'Character Development',
    content: 'The main character evolved through several iterations...',
    date: '2023-02-20',
  },
  {
    id: 3,
    title: 'World Building',
    content: 'The world represents a futuristic utopia where...',
    date: '2023-03-10',
  },
]

const route = useRoute()
const router = useRouter()
const stories = ref<Story[]>(mockStories)
const currentStoryId = ref<number | null>(null)

const currentStory = computed(() =>
  stories.value.find((s) => s.id === currentStoryId.value)
)

const handleStorySelect = (story: Story) => {
  currentStoryId.value = story.id
}

const handleBack = () => {
  router.push('/home')
}

onMounted(() => {
  // Select first story by default
  if (stories.value.length > 0 && stories.value[0]) {
    currentStoryId.value = stories.value[0].id
  }
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
    onPositiveClick: () => {
      const index = stories.value.findIndex((s) => s.id === story.id)
      if (index > -1) {
        stories.value.splice(index, 1)
        if (currentStoryId.value === story.id) {
          const nextStory = stories.value.length > 0 ? stories.value[0] : null
          currentStoryId.value = nextStory ? nextStory.id : null
        }
        message.success('Story deleted')
      }
    },
  })
}

const handleCreateSuccess = (title: string) => {
  if (editingStory.value) {
    // Edit mode
    const story = stories.value.find((s) => s.id === editingStory.value!.id)
    if (story) {
      story.title = title
    }
  } else {
    // Create mode
    const newStory: Story = {
      id: Date.now(),
      title: title,
      content: 'Start writing your story here...',
      date: new Date().toISOString().split('T')[0] || new Date().toDateString(),
    }
    stories.value.unshift(newStory)
    currentStoryId.value = newStory.id
  }
  editingStory.value = null
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
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Prevent flex item from overflowing */
}

.resize-handle {
  width: 4px;
  background-color: transparent;
  cursor: col-resize;
  transition: background-color 0.2s;
  z-index: 10;
  border-left: 1px solid var(--border-color);
}

.resize-handle:hover,
.resize-handle:active {
  background-color: var(--resize-handle-hover);
}

.right-column {
  background-color: var(--card-bg-color);
  /* border-left is handled by resize-handle visual or kept here if prefer double border */
}

.empty-story {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
