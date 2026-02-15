<template>
  <div class="chat-interface">
    <MessageList
      ref="messageListRef"
      :chat-records="chatStore.chatRecords"
      :is-ai-typing="isAiTyping"
      :ai-typing-message="aiTypingMessage"
      :is-blinking="isBlinking"
      @image-tap="handleImageTap"
      @redo="handleRedo"
      @quote="handleQuote"
      @order="handleOrder"
    />
    <StarterPrompts
      :prompts="starterPrompts"
      :is-hidden="chatStore.chatRecords.length > 0"
      @select="handleStarterPrompt"
    />

    <div class="input-container">
      <div v-if="$slots['tools-list']">
        <slot name="tools-list" />
      </div>
      <ImageUpload v-model="chatStore.uploadImages" />
      <div class="input-row">
        <RichInput
          ref="richInputRef"
          placeholder="Describe your creation"
          :maxlength="500"
          :rows="1"
          @enter="sendMessage"
        />
        <div class="action-buttons-container">
          <div class="send-button" :class="{ disabled: !canSend }" @click="sendMessage">
            <img v-if="canSend" src="@/assets/send.svg" alt="send" class="send-icon" />
            <img v-else src="@/assets/unsend.svg" alt="unsend" class="send-icon" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue'
import type {
  ChatRecord,
  ChatBody,
  ToolCall,
  GenerateImageOptions,
  ToolCallType,
  EventData,
} from './types'
import { MessageType, Role } from './types'
import RichInput from './rich-input.vue'
import ImageUpload from './image-upload.vue'
import MessageList from './message-list.vue'
import StarterPrompts from './starter-prompts.vue'
import { useChatStore } from '@/stores/chat'
import { generateUUID } from '@/utils/common'

interface Props {
  token: string
  apiUrl: string
  generateImageOptions: GenerateImageOptions
  starterPrompts?: { title: string; action: string }[]
  onChatRecordsChange?: (records: ChatRecord[]) => void
  onImageTap?: (imageUrl: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  starterPrompts: () => [],
})

const chatStore = useChatStore()

const isAiTyping = ref(false)
const aiTypingMessage = ref<ChatRecord | null>(null)
const currentAiMessageRef = ref('')
const isBlinking = ref(false)
const messageListRef = ref<InstanceType<typeof MessageList> | null>(null)
const richInputRef = ref<InstanceType<typeof RichInput> | null>(null)

let blinkTimer: number | null = null
let abortController: AbortController | null = null
let currentReader: ReadableStreamDefaultReader<Uint8Array> | null = null

const canSend = computed(() => {
  return chatStore.richInput.text.trim().length > 0 && !isAiTyping.value
})

const sendMessageWithOptions = (
  text: string,
  images: string[] = [],
  generateImageOptions?: GenerateImageOptions,
) => {
  const newRecords: ChatRecord[] = [
    {
      record_id: generateUUID(),
      content: text,
      toolCallList: [],
      role: Role.USER,
      type: 'text',
      body: null,
    },
  ]

  if (images.length > 0) {
    newRecords.unshift({
      record_id: generateUUID(),
      content: images,
      toolCallList: [],
      role: Role.USER,
      type: 'images',
      body: null,
    })
  }

  chatStore.chatRecords = [...chatStore.chatRecords, ...newRecords]

  const body: ChatBody = {
    id: chatStore.CHAT_ID,
    message: {
      id: generateUUID(),
      role: 'user',
      parts: [
        {
          type: 'text',
          text: text,
        },
      ],
    },
    selectedChatModel: 'chat-model',
    selectedVisibilityType: 'private',
    generateImageOptions: generateImageOptions || props.generateImageOptions,
  }

  if (images.length > 0) {
    body.message.parts.unshift({
      type: 'file',
      url: images,
      mediaType: 'image',
    })
  }

  startEventSource(body)
}

const sendMessage = () => {
  if (canSend.value) {
    const text = chatStore.richInput.text.trim()
    const images = [...chatStore.uploadImages]

    chatStore.setRichInput({ text: '', html: '' })
    chatStore.setUploadImages([])
    sendMessageWithOptions(text, images)
  }
}

const startEventSource = (body: ChatBody) => {
  // 关闭之前的连接（如果有的话）
  if (abortController) {
    abortController.abort()
  }

  if (currentReader) {
    currentReader.cancel().catch(() => {
      // 忽略取消错误
    })
    currentReader = null
  }

  chatStore.setLastSSEBody(body)

  // 创建新的 AbortController
  abortController = new AbortController()
  const signal = abortController.signal

  // 使用 fetch 处理流式响应（EventSource 不支持 POST）
  fetch(props.apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${props.token}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(body),
    signal,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.body
    })
    .then((body) => {
      if (!body) {
        setIsAiTyping(false)
        return
      }

      const reader = body.getReader()
      currentReader = reader
      const decoder = new TextDecoder()
      let buffer = ''

      const readStream = (): void => {
        reader
          .read()
          .then(({ done, value }) => {
            // 检查是否已被中断
            if (signal.aborted) {
              setIsAiTyping(false)
              return
            }

            if (done) {
              setIsAiTyping(false)
              currentReader = null
              return
            }

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // 保留最后一个不完整的行

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                if (data === '[DONE]') {
                  setIsAiTyping(false)
                  currentReader = null
                  return
                }

                if (data) {
                  try {
                    const parsed = JSON.parse(data)
                    handleEventData(parsed)
                  } catch {
                    // 忽略解析错误
                    console.warn('Failed to parse SSE data:', data)
                  }
                }
              }
            }
            readStream()
          })
          .catch((error) => {
            // 忽略中断错误
            if (error.name === 'AbortError' || signal.aborted) {
              setIsAiTyping(false)
              currentReader = null
              return
            }
            console.error('Stream read error:', error)
            setIsAiTyping(false)
            currentReader = null
          })
      }
      readStream()
    })
    .catch((error) => {
      console.log('中断错误: ', error)
      // 忽略中断错误
      if (error.name === 'AbortError' || signal.aborted) {
        setIsAiTyping(false)
        return
      }
      console.error('Fetch error:', error)
      setIsAiTyping(false)
    })
}

const handleEventData = (data: EventData) => {
  const { type, delta, toolCallId, toolName, inputTextDelta, input, output } = data
  console.log('handleEventData', data)
  switch (type) {
    case MessageType.START:
      setIsAiTyping(true)
      currentAiMessageRef.value = ''
      setAiTypingMessage({
        record_id: generateUUID(),
        content: '',
        toolCallList: [],
        role: Role.ASSISTANT,
        body: null,
      })
      break
    case MessageType.TEXT_DELTA:
      currentAiMessageRef.value += delta || ''
      setAiTypingMessage((prev) => {
        if (!prev) return null
        return {
          ...prev,
          content: prev.content + (delta || ''),
        }
      })
      break
    case MessageType.TOOL_INPUT_START:
      startBlinkAnimation()
      setAiTypingMessage((prev) => {
        if (!prev) return null
        const newToolCall: ToolCall = {
          toolCallId: toolCallId || '',
          content: 'Generating image',
          name: (toolName as ToolCallType) || 'generateImage',
          callResult: null,
          error: null,
          callParams: '',
          rawParams: '',
          rawResult: '',
        }
        return {
          ...prev,
          toolCallList: [...prev.toolCallList, newToolCall],
        }
      })
      break
    case MessageType.TOOL_INPUT_DELTA:
      setAiTypingMessage((prev) => {
        if (!prev) return null
        const toolCallList = prev.toolCallList.map((tool) => {
          if (tool.toolCallId === toolCallId) {
            return {
              ...tool,
              callParams: tool.callParams + (inputTextDelta || ''),
            }
          }
          return tool
        })
        return {
          ...prev,
          toolCallList,
        }
      })
      break
    case MessageType.TOOL_INPUT_AVAILABLE:
      setAiTypingMessage((prev) => {
        if (!prev) return null
        const toolCallList = prev.toolCallList.map((tool) => {
          if (tool.toolCallId === toolCallId) {
            return {
              ...tool,
              callParams:
                (typeof input === 'object' && input?.prompt) ||
                (typeof input === 'string' ? input : '') ||
                '',
            }
          }
          return tool
        })
        return {
          ...prev,
          toolCallList,
        }
      })
      break
    case MessageType.TOOL_OUTPUT_AVAILABLE:
      stopBlinkAnimation()
      setAiTypingMessage((prev) => {
        if (!prev) return null
        const toolCallList = prev.toolCallList.map((tool) => {
          if (tool.toolCallId === toolCallId) {
            return {
              ...tool,
              callResult:
                (typeof output === 'object' && output?.imageUrl) ||
                (typeof output === 'string' ? output : '') ||
                '',
            }
          }
          return tool
        })
        return {
          ...prev,
          toolCallList,
        }
      })
      break
    case MessageType.TOOL_OUTPUT_ERROR:
      setAiTypingMessage((prev) => {
        if (!prev) return null
        const toolCallList = prev.toolCallList.map((tool) => {
          if (tool.toolCallId === toolCallId) {
            return {
              ...tool,
              error: 'Image generation failed, please resend the content',
              content: '',
            }
          }
          return tool
        })
        return {
          ...prev,
          toolCallList,
        }
      })
      break
    case MessageType.FINISH:
      setIsAiTyping(false)
      setAiTypingMessage((prevAiMessage) => {
        if (!prevAiMessage) return null
        // 从 chatStore 获取 body 并插入到最后一条 AI 消息中
        const messageWithBody = {
          ...prevAiMessage,
          body: chatStore.lastSSEBody,
        }
        chatStore.chatRecords = [...chatStore.chatRecords, messageWithBody]
        if (props.onChatRecordsChange) {
          nextTick(() => {
            chatStore.setLastSSEBody(null)
            props.onChatRecordsChange?.(chatStore.chatRecords)
          })
        }
        return null
      })
      currentAiMessageRef.value = ''
      break
  }
}

const setIsAiTyping = (value: boolean) => {
  isAiTyping.value = value
}

const setAiTypingMessage = (
  message: ChatRecord | null | ((prev: ChatRecord | null) => ChatRecord | null),
) => {
  if (typeof message === 'function') {
    aiTypingMessage.value = message(aiTypingMessage.value)
  } else {
    aiTypingMessage.value = message
  }
}

const startBlinkAnimation = () => {
  isBlinking.value = true
  if (blinkTimer) {
    clearInterval(blinkTimer)
  }
  blinkTimer = window.setInterval(() => {
    isBlinking.value = !isBlinking.value
  }, 800)
}

const stopBlinkAnimation = () => {
  isBlinking.value = false
  if (blinkTimer) {
    clearInterval(blinkTimer)
    blinkTimer = null
  }
}

const handleImageTap = (imageUrl: string | null) => {
  if (imageUrl && props.onImageTap) {
    props.onImageTap(imageUrl)
  }
}

/**
 * 处理重做
 * @param record
 */
const handleRedo = (record: ChatRecord) => {
  const body = record.body as ChatBody
  const text = body.message.parts.find((part) => part.type === 'text')?.text || ''
  const images = body.message.parts.find((part) => part.type === 'file')?.url || []
  const generateImageOptions = body?.generateImageOptions
  sendMessageWithOptions(text, images, generateImageOptions)
}

const handleQuote = (record: ChatRecord) => {
  const currentIndex = chatStore.chatRecords.findIndex((r) => r.record_id === record.record_id)
  if (currentIndex === -1) return

  let lastUserMessage: ChatRecord | null = null
  for (let i = currentIndex - 1; i >= 0; i--) {
    const chatRecord = chatStore.chatRecords[i]
    if (chatRecord && chatRecord.role === Role.USER && chatRecord.type === 'text') {
      lastUserMessage = chatRecord
      break
    }
  }

  if (lastUserMessage && typeof lastUserMessage.content === 'string') {
    const parts = parseTextWithTags(lastUserMessage.content)
    if (richInputRef.value?.setContentWithTags) {
      richInputRef.value.setContentWithTags(parts)
      // setContentWithTags 内部会更新 richInput
    } else {
      // 降级处理：直接设置纯文本
      chatStore.setRichInput({ text: lastUserMessage.content, html: '' })
    }
  }

  const imageToolCall = record.toolCallList.find(
    (tool: ToolCall) => tool.name === 'generateImage' && tool.callResult,
  )

  if (imageToolCall?.callResult) {
    chatStore.setUploadImages([imageToolCall.callResult])
  } else {
    chatStore.setUploadImages([])
  }

  // 聚焦到输入框
  nextTick(() => {
    richInputRef.value?.focus()
    const messagesContainer = messageListRef.value?.messagesContainer
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  })
}

/**
 * 处理下单生产
 * @param record
 */
const handleOrder = (record: ChatRecord) => {
  const imageToolCall = record.toolCallList.find(
    (tool: ToolCall) => tool.name === 'generateImage' && tool.callResult,
  )
  const imageUrl = imageToolCall?.callResult || null
  if (imageUrl && props.onImageTap) {
    props.onImageTap(imageUrl)
  }
}

const handleStarterPrompt = (prompt: string) => {
  sendMessageWithOptions(prompt)
}

/**
 * 解析文本，提取自定义标签
 * @param text
 * @returns
 */
const parseTextWithTags = (
  text: string,
): Array<{ type: string; content?: string; id?: number; name?: string }> => {
  const parts: Array<{ type: string; content?: string; id?: number; name?: string }> = []

  // 匹配 "创意风格为【xxx】" 和 "模板为【xxx】" 的正则
  const stylePattern = /Creative style is 【([^】]+)】/g
  const templatePattern = /Template is 【([^】]+)】/g

  let lastIndex = 0
  let match: RegExpExecArray | null

  const matches: Array<{ index: number; length: number; type: string; name: string }> = []

  while ((match = stylePattern.exec(text)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'styleTag',
      name: match[1] || '',
    })
  }

  while ((match = templatePattern.exec(text)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'templatePromptTag',
      name: match[1] || '',
    })
  }

  matches.sort((a, b) => a.index - b.index)

  // 构建 parts 数组
  matches.forEach((match) => {
    if (match.index > lastIndex) {
      const textContent = text.substring(lastIndex, match.index)
      if (textContent) {
        parts.push({ type: 'text', content: textContent })
      }
    }

    parts.push({
      type: match.type,
      name: match.name,
    })

    lastIndex = match.index + match.length
  })

  // 添加最后剩余的文本
  if (lastIndex < text.length) {
    const textContent = text.substring(lastIndex)
    if (textContent) {
      parts.push({ type: 'text', content: textContent })
    }
  }

  // 如果没有匹配到任何标签，返回纯文本
  if (parts.length === 0) {
    parts.push({ type: 'text', content: text })
  }

  return parts
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    const messagesContainer = messageListRef.value?.messagesContainer
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  })
}

onUnmounted(() => {
  if (blinkTimer) {
    clearInterval(blinkTimer)
  }
  stopBlinkAnimation()
  // 中断进行中的请求
  if (abortController) {
    abortController.abort()
    abortController = null
  }
  if (currentReader) {
    currentReader.cancel().catch(() => {
      // 忽略取消错误
    })
    currentReader = null
  }
})

// 获取滚动容器
const getScrollContainer = () => {
  return messageListRef.value?.messagesContainer || null
}

// 中断当前请求
const abortRequest = () => {
  if (abortController) {
    abortController.abort()
    abortController = null
  }
  if (currentReader) {
    currentReader.cancel().catch(() => {
      // 忽略取消错误
    })
    currentReader = null
  }
  setIsAiTyping(false)
}

// 聚焦到输入框
const focusInput = () => {
  richInputRef.value?.focus()
}

// 暴露方法和属性供父组件使用
defineExpose({
  isAiTyping,
  scrollToBottom,
  getScrollContainer,
  abortRequest,
  focusInput,
})
</script>

<style scoped>
.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: transparent;
}

.tools-list-slot {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 8px;
  padding-bottom: 8px;
}

.input-container {
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: var(--input-bg-color);
  border-radius: 16px;
  margin: 15px;
  margin-bottom: calc(15px + env(safe-area-inset-bottom));
}

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.action-buttons-container {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.image-upload-button {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.send-button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.send-icon,
.image-add-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.send-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
