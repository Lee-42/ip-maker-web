<template>
  <div class="chat-page">
    <!-- 背景 -->
    <div class="bg-cover"></div>

    <nav-bar
      title="New Creation"
      :sub-title="subTitle"
      :is-back="true"
      :default-back-behavior="false"
      :scroll-container="scrollContainer"
      :show-placeholder="false"
      @back="onBack"
    >
    </nav-bar>

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
        <template #tools-list>
          <div class="tools-list">
            <style-selector @style-change="handleStyleChange" />
            <prompt-selector :selected-count="prompts.length" @close="handlePromptSelectorClose" />
            <!-- <template-selector :disabled="agentUIRef?.isAiTyping" /> -->
            <!-- <category-selector :selected-name="chatTemplate?.label" /> -->
          </div>
        </template>
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
import NavBar from '@/components/nav-bar.vue'
import PromptSelector from './components/prompt-selector.vue'
import StyleSelector from './components/style-selector.vue'
import type { WownowPromptStyle } from '@/types/template'
import { getProductShape } from '@/utils/common'
import { getChatMessageList, type Message } from '@/api/chat'
import type { APIResponse } from '@/utils/api-client'

const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()
const agentUIRef = ref<InstanceType<typeof AgentUI> | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)
console.log('12312312312')
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

// 构建 subTitle: （产品形状、工艺-横竖版）
// 目前用 template label 来区分产品形状（模板名称是自由定义的，不一定是产品类型）
const subTitle = computed(() => {
  if (!chatTemplate.value) {
    return ''
  }
  const { label, craftType, orientation } = chatTemplate.value

  const productShape = label.split('-').pop() || getProductShape({ label })
  const craftText = craftType ? `、${craftType}` : ''
  const orientationText = orientation === 'landscape' ? '-Horizontal' : ''

  return `(${productShape}${craftText}${orientationText})`
})

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
  // 默认宽高，可以根据实际需求调整
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
  console.log('imageUrl: ', imageUrl)
  if (agentUIRef.value?.isAiTyping) return
  // router.push({
  //   path: '/create/preview',
  //   query: {
  //     src: imageUrl,
  //   },
  // })
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

// 返回
const onBack = async () => {
  const doBack = () => {
    // 中断当前请求
    agentUIRef.value?.abortRequest()
    // 用户确认后执行清空和返回
    chatStore.resetChatStore()
    router.back()
  }

  // 如果没有聊天记录，直接返回
  if (chatStore.chatRecords.length === 0) {
    doBack()
    return
  }

  if (window.confirm('Leaving will clear the current conversation. Continue?')) {
    doBack()
  }
}
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  color: #fff;
  position: relative;
}

/* 背景 */
.bg-cover {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/bg.png');
  background-size: cover;
  background-position: center;
  z-index: -1;
}

.chat-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: calc(env(safe-area-inset-top));
}

.order-button {
  background: #fada39;
  border-color: #fada39;
  color: #000;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 10px;
  height: auto;
}

.order-button:disabled {
  background: #ccc !important;
  border-color: #ccc !important;
  color: #999 !important;
}

.order-button :deep(.van-button__text) {
  color: inherit;
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
  border-bottom: 0.5px solid rgba(170, 170, 170, 0.3);
}

.tools-list > * {
  flex-shrink: 0;
}

.tools-list::-webkit-scrollbar {
  display: none;
}
</style>
