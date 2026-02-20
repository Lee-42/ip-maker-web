<template>
  <div class="nfc-component">
    <div class="nfc-header">
      <div class="nfc-title">
        <span>NFC</span>
        <img src="@/assets/svgs/icon-link.svg" alt="nfc" />
      </div>
      <div v-if="nfcContent && edit" class="nfc-actions">
        <div class="action-edit" @click="onAddNfc">Modify</div>
        <div class="action-delete" @click="handleShowDeletePopup">Delete</div>
      </div>
    </div>

    <div class="nfc-content">
      <!-- 已有 NFC 内容 -->
      <div v-if="nfcContent">
        <!-- 链接跳转 -->
        <div v-if="nfcContent.type === 'link'" class="nfc-card nfc-link">
          <div class="nfc-link-text">{{ nfcContent.link }}</div>
          <img src="@/assets/svgs/icon-nfc-link.svg" class="nfc-link-icon" alt="link" />
        </div>

        <!-- 创意展示页 -->
        <div v-else-if="nfcContent.type === 'custom'" class="nfc-card nfc-custom">
          <div class="nfc-custom-text">
            <div v-if="nfcContent.text" class="text-content">{{ nfcContent.text }}</div>
            <div v-else class="text-placeholder">{{ defaultNfcTitle }}</div>
          </div>
          <img
            v-if="mediaType === 'image' && nfcContent.attachments[0]"
            :src="nfcContent.attachments[0].url"
            class="nfc-media-thumb"
            alt="media"
          />
          <img
            v-else-if="mediaType === 'video'"
            src="@/assets/video.png"
            class="nfc-media-thumb"
            alt="video"
          />
          <img
            v-else-if="mediaType === 'audio'"
            src="@/assets/audio.png"
            class="nfc-media-thumb"
            alt="audio"
          />
        </div>

        <!-- 专属聊天助理 -->
        <div v-else-if="nfcContent.type === 'agent'" class="nfc-card nfc-agent">
          <div class="nfc-agent-info">
            <div class="agent-name">{{ nfcContent.agent?.name }}</div>
            <div class="agent-description">{{ nfcContent.agent?.description }}</div>
          </div>
          <img
            v-if="nfcContent.agent?.coverUrl && !nfcContent.agent.coverUrlError"
            :src="nfcContent.agent?.coverUrl"
            class="nfc-agent-cover"
            alt="agent"
          />
          <div v-else class="nfc-agent-placeholder">
            <img
              src="@/assets/svgs/icon-nfc-agent.svg"
              class="agent-placeholder-icon"
              alt="agent"
            />
          </div>
        </div>
      </div>

      <!-- 新增 NFC -->
      <n-button v-else secondary type="primary" class="add-nfc-button" @click="onAddNfc">
        <div class="add-nfc-content">
          <span class="add-nfc-text">Add NFC</span>
          <img src="@/assets/svgs/icon-nfc-add.svg" alt="add-nfc" class="w-[28px] h-[28px]" />
        </div>
      </n-button>
    </div>

    <!-- 选择 NFC 类型 -->
    <n-drawer v-model:show="showActionSheet" placement="bottom" :height="300">
      <n-drawer-content title="Select Type" closable>
        <div class="nfc-actions-list">
             <div v-for="action in actions" :key="action.type" class="nfc-action-item" @click="onSelect(action)">
                 <div class="action-name">{{ action.name }}</div>
                 <div class="action-subname">{{ action.subname }}</div>
             </div>
        </div>
      </n-drawer-content>
    </n-drawer>

    <!-- 删除确认弹窗 -->
    <n-modal
      v-model:show="showDeletePopup"
      preset="dialog"
      title='Delete "NFC" content?'
      content="After deletion, it will be removed from the product, you can add it again before placing an order."
      positive-text="Delete"
      negative-text="Cancel"
      @positive-click="confirmDelete"
      @negative-click="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProduceStore } from '@/stores/produce'

interface Props {
  edit?: boolean
}

withDefaults(defineProps<Props>(), {
  edit: true,
})

const router = useRouter()
const produceStore = useProduceStore()

const showActionSheet = ref(false)
const showDeletePopup = ref(false)

const actions = [
  {
    name: 'External Link',
    type: 'link',
    subname: 'Point NFC to any specified URL or social media profile',
  },
  {
    name: 'Creative Display Page',
    type: 'custom',
    subname: 'Easily upload images, text, and videos to generate a dedicated page for NFC reading',
  },
  {
    name: 'AI Agent Store',
    type: 'agent',
    subname: 'Point NFC to a specific AI Chat Assistant',
  },
]

const nfcContent = computed(() => produceStore.nfcContent)

const mediaType = computed(() => {
  if (
    nfcContent.value &&
    nfcContent.value.type === 'custom' &&
    nfcContent.value.attachments.length > 0 &&
    nfcContent.value.attachments[0]
  ) {
    return nfcContent.value.attachments[0].contentType.split('/')[0]
  }
  return ''
})

const defaultNfcTitle = computed(() => {
  return `IPMAKER (${new Date().toLocaleDateString('en-US')})`
})

const onAddNfc = () => {
  showActionSheet.value = true
}

const onClose = () => {
  showActionSheet.value = false
}

const onSelect = (action: { type: string }) => {
  const type = action.type
  if (type === 'link') {
    router.push('/nfc/link')
  } else if (type === 'custom') {
    router.push('/nfc/custom')
  } else if (type === 'agent') {
    router.push('/nfc/agent')
  }
  showActionSheet.value = false
}

const handleShowDeletePopup = () => {
  showDeletePopup.value = true
}

const cancelDelete = () => {
  showDeletePopup.value = false
}

const confirmDelete = () => {
  produceStore.clearNfc()
  showDeletePopup.value = false
}
</script>

<style scoped>
.nfc-component {
}

.nfc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.nfc-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #777;
}

.nfc-icon {
  width: 16px;
  height: 16px;
}

.nfc-actions {
  display: flex;
  gap: 16px;
}

.action-edit {
  font-size: 14px;
  color: #000;
  cursor: pointer;
}

.action-delete {
  font-size: 14px;
  color: #e63232;
  cursor: pointer;
}

.nfc-content {
}

.nfc-card {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

/* 链接跳转 */
.nfc-link {
  align-items: center;
}

.nfc-link-text {
  font-size: 14px;
  color: #000;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nfc-link-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

/* 创意展示页 */
.nfc-custom {
  align-items: flex-start;
}

.nfc-custom-text {
  flex: 1;
  flex-shrink: 0;
}

.text-content {
  font-size: 14px;
  color: #000;
  line-height: 20px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.text-placeholder {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.5);
  height: 40px;
  line-height: 20px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.nfc-media-thumb {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  object-fit: cover;
  flex-shrink: 0;
}

/* 专属聊天助理 */
.nfc-agent {
  align-items: flex-start;
}

.nfc-agent-info {
  flex: 1;
  flex-shrink: 0;
}

.agent-name {
  font-size: 16px;
  font-weight: 500;
  color: #000;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-bottom: 4px;
}

.agent-description {
  font-size: 14px;
  color: #000;
  line-height: 20px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.nfc-agent-cover {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  object-fit: cover;
  flex-shrink: 0;
}

.nfc-agent-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.agent-placeholder-icon {
  width: 60%;
  height: 60%;
  opacity: 0.8;
}

/* 新增 NFC 按钮 */
.add-nfc-button {
  width: 168px;
  height: 68px;
  background: #f5f5f5;
  border-radius: 16px;
  padding: 8px 15px;
  border: none;
}

.add-nfc-button :deep(.van-button__text) {
  width: 100%;
}

.add-nfc-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.add-nfc-text {
  font-size: 16px;
  color: #333;
}
</style>
