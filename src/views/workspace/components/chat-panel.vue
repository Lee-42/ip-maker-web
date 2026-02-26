<template>
  <div class="chat-panel">
    <div class="chat-content">
      <AgentUI
        ref="agentUIRef"
        :token="token || ''"
        :api-url="apiUrl"
        :generate-image-options="generateImageOptions"
        :starter-prompts="starterPrompts"
        @chat-records-change="handleChatRecordsChange"
        @image-tap="handleImageTap"
      >
        <!-- <template #tools-list>
          <div class="tools-list">
            <style-selector @style-change="handleStyleChange" />
            <prompt-selector :selected-count="prompts.length" @close="handlePromptSelectorClose" />
          </div>
        </template> -->
      </AgentUI>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import AgentUI from '@/components/agent-ui/index.vue'
import type { ChatRecord, GenerateImageOptions } from '@/components/agent-ui/types'
import { COIN_NEGATIVE_PROMPT, IPMAKER_CHAT_URL, productTypeOptions } from '@/lib/constants'
import { TemplateLabel } from '@/types/template'
import { OrientationType } from '@/types/asset'
import { getChatMessageList, type Message } from '@/api/chat'
import type { APIResponse } from '@/utils/api-client'
import { mapToChatRecord } from '@/utils/chat'

// const router = useRouter() // Router is not used for back navigation in panel
const authStore = useAuthStore()
const chatStore = useChatStore()
const agentUIRef = ref<InstanceType<typeof AgentUI> | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)

// 加载聊天记录的逻辑
const loadChatMessages = (chatId: string) => {
  if (!chatId) return

  getChatMessageList({ id: chatId })
    .then((res: APIResponse<Message[]>) => {
      const records: ChatRecord[] = res.data?.map(mapToChatRecord) || []
      console.log('records: ', records)
      chatStore.setChatRecord(records)

      // 等待 DOM 完全渲染后再滚动到底部
      setTimeout(() => {
        nextTick(() => {
          scrollContainer.value = agentUIRef.value?.getScrollContainer() || null
          if (chatStore.chatRecords.length > 0) {
            agentUIRef.value?.scrollToBottom()
          }
        })
      }, 100)
    })
    .catch((err) => {
      console.error('Failed to load chat messages:', err)
    })
}

// 监听 CHAT_ID 变化，自动拉取对应的聊天记录
watch(
  () => chatStore.CHAT_ID,
  (newChatId) => {
    if (newChatId) {
      loadChatMessages(newChatId)
    }
  },
  { immediate: true },
)

// 组件挂载时不再执行硬编码请求，交由 watch({ immediate: true }) 处理
onMounted(() => {
  // DOM 渲染后的初始滚动等逻辑依然保留，如果在没完全渲染好时也可以进行滚动尝试
  setTimeout(() => {
    nextTick(() => {
      if (!scrollContainer.value) {
        scrollContainer.value = agentUIRef.value?.getScrollContainer() || null
      }
      if (chatStore.chatRecords.length > 0) {
        agentUIRef.value?.scrollToBottom()
      }
    })
  }, 100)
})

const token = computed(() => authStore.token)
const chatTemplate = computed(() => chatStore.chatTemplate)
const promptStyle = computed(() => chatStore.promptStyle)
const templatePrompt = computed(() => chatStore.templatePrompt)
const apiUrl = IPMAKER_CHAT_URL + '/v1/chat'

// 根据 chatTemplate 计算 generateImageOptions
const generateImageOptions = computed((): GenerateImageOptions => {
  if (!chatTemplate.value) {
    // 如果没有模板，返回默认值
    return {
      width: 1024,
      height: 1024,
      stylePrompt: '',
      negativePrompt: '',
    }
  }

  // 根据 label 判断是否需要 negativePrompt
  const negativePrompt =
    chatTemplate.value.label === TemplateLabel.FlatCoin ||
    chatTemplate.value.label === TemplateLabel.ReliefCoin
      ? COIN_NEGATIVE_PROMPT
      : ''

  // 根据 orientation 计算宽高（横屏时交换宽高）
  let width = 1024
  let height = 1024

  // 根据 orientation 调整宽高
  if (chatTemplate.value.orientation === OrientationType.LANDSCAPE) {
    width = 1024
    height = 768
  } else {
    width = 768
    height = 1024
  }

  const options: GenerateImageOptions = {
    templateId: chatTemplate.value.id,
    defaultPrompt: chatTemplate.value.prompt,
    productType:
      productTypeOptions.find((item) => item.value === chatTemplate.value?.label)?.label || '',
    width,
    height,
    stylePrompt: promptStyle.value?.prompt || '',
    templatePrompt: templatePrompt.value?.prompt || '',
    negativePrompt,
    ratio: chatTemplate.value.aspectRatio,
  }
  return options
})

// 开场提示词
const starterPrompts = [
  { title: '"Draw a cute animal"', action: '"Draw a cute animal"' },
  {
    title: '"Generate an oil painting of the scenery of Lake Baikal for me."',
    action: '"Generate an oil painting of the scenery of Lake Baikal for me."',
  },
  {
    title:
      '"The young girl in a yellow dress is catching butterflies in the garden, with a sunny afternoon as the backdrop."',
    action:
      '"The young girl in a yellow dress is catching butterflies in the garden, with a sunny afternoon as the backdrop."',
  },
]

// 处理聊天记录变化
const handleChatRecordsChange = (records: ChatRecord[]) => {
  const assistantOutputs = records
    .filter((record) => record.role === 'assistant')
    .flatMap((record) =>
      record.toolCallList
        .filter((tool) => tool.name === 'generateImage' && tool.callResult)
        .map((tool) => ({
          id: `${record.record_id}-${tool.toolCallId}`,
          content:
            typeof record.content === 'string'
              ? record.content
              : Array.isArray(record.content)
                ? record.content.join('\n')
                : '',
          imageUrl: tool.callResult || '',
          styleId: chatStore.lastStyle?.id || null,
        })),
    )
    .filter((item) => item.imageUrl)
  console.log('assistantOutputs: ', assistantOutputs)
  chatStore.setOutputList(assistantOutputs)
  chatStore.setChatRecord(records)
  chatStore.setLastStyle(null)
}

// 处理图片点击
const handleImageTap = (imageUrl: string) => {
  if (agentUIRef.value?.isAiTyping) return
  // Handle image tap (e.g., preview or insert into story)
  console.log('Image tapped:', imageUrl)
}
</script>

<style scoped>
.chat-panel {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: var(--card-bg-color);
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.tools-list {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-end;
  gap: 8px;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 12px;
  border-bottom: 0.5px solid var(--border-color);
}

.tools-list > * {
  flex-shrink: 0;
}

.tools-list::-webkit-scrollbar {
  display: none;
}
</style>
