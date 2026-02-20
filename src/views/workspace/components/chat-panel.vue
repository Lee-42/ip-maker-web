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
import { computed, ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import AgentUI from '@/components/agent-ui/index.vue'
import type { ChatRecord, GenerateImageOptions } from '@/components/agent-ui/types'
import { COIN_NEGATIVE_PROMPT, IPMAKER_CHAT_URL, productTypeOptions } from '@/lib/constants'
import { TemplateLabel } from '@/types/template'
import { OrientationType } from '@/types/asset'
import PromptSelector from '@/views/chat/components/prompt-selector.vue'
import StyleSelector from '@/views/chat/components/style-selector.vue'
import type { WownowPromptStyle } from '@/types/template'
import { getProductShape } from '@/utils/common'

// const router = useRouter() // Router is not used for back navigation in panel
const authStore = useAuthStore()
const chatStore = useChatStore()
const agentUIRef = ref<InstanceType<typeof AgentUI> | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)

// 当页面挂载时（包括从其他页面返回），滚动到底部
onMounted(() => {
  // 等待 DOM 完全渲染
  setTimeout(() => {
    nextTick(() => {
      // 获取滚动容器
      scrollContainer.value = agentUIRef.value?.getScrollContainer() || null

      // 如果有聊天记录，滚动到底部
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
const prompts = computed(() => chatStore.prompts)
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

// 处理风格变化
const handleStyleChange = (style: WownowPromptStyle) => {
  chatStore.setPromptStyle(style)
}

// 处理 prompt selector 关闭
const handlePromptSelectorClose = () => {
  // 只有当选择的 prompts 数量大于 0 时才 focus
  if (prompts.value.length > 0) {
    agentUIRef.value?.focusInput()
  }
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
