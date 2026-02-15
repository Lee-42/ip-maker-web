<template>
  <div ref="messagesContainer" class="messages-list">
    <div
      v-for="record in chatRecords"
      :key="record.record_id"
      v-motion
      :initial="{ opacity: 0, y: 20, scale: 0.95 }"
      :enter="{ opacity: 1, y: 0, scale: 1, transition: { duration: 300 } }"
      :class="{
        '': record.role === 'assistant',
      }"
    >
      <!-- 用户消息 -->
      <template v-if="record.role === 'user'">
        <template v-if="record.type === 'text'">
          <div
            class="message-container user-message message-text user-text"
            v-html="renderMarkdown(typeof record.content === 'string' ? record.content : '')"
          ></div>
        </template>
        <template v-else-if="record.type === 'images'">
          <div class="message-container user-message user-images-container">
            <img
              v-for="(imageUrl, index) in record.content"
              :key="index"
              v-motion
              :initial="{ opacity: 0, scale: 0.8 }"
              :enter="{ opacity: 1, scale: 1, transition: { duration: 300, delay: index * 50 } }"
              :src="imageUrl"
              alt="user image"
              class="user-image-preview"
            />
          </div>
        </template>
      </template>

      <!-- AI 消息 -->
      <template v-else>
        <div class="message-container ai-message">
          <div
            v-for="toolCall in record.toolCallList"
            :key="toolCall.toolCallId"
            class="tool-call-container"
          >
            <div v-if="toolCall.callResult" class="call-result-container">
              <template v-if="toolCall.name === 'generateImage'">
                <img
                  v-motion
                  :initial="{ opacity: 0, scale: 0.8 }"
                  :enter="{ opacity: 1, scale: 1, transition: { duration: 400 } }"
                  :src="toolCall.callResult || ''"
                  alt="generated image"
                  @click="handleImageTap(toolCall.callResult)"
                  class="generated-image"
                />
              </template>
              <template v-else>
                <div class="text-result">{{ toolCall.callResult }}</div>
              </template>
            </div>
            <div v-if="toolCall.error" class="error-message">{{ toolCall.error }}</div>
          </div>
          <div
            v-if="record.content"
            class="ai-content"
            v-html="
              renderMarkdown(
                typeof record.content === 'string'
                  ? record.content
                  : Array.isArray(record.content)
                    ? record.content.join('\n')
                    : '',
              )
            "
          ></div>
        </div>
        <div
          v-if="
            record.toolCallList.some((tool) => tool.name === 'generateImage' && tool.callResult)
          "
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: 200 } }"
          class="image-actions"
        >
          <div class="action-icon" @click="emit('redo', record)">
            <img src="@/assets/redo.svg" alt="redo" class="icon-img" />
            <span class="action-text">Again</span>
          </div>
          <div class="action-icon" @click="emit('quote', record)">
            <img src="@/assets/quote.svg" alt="quote" class="icon-img" />
            <span class="action-text">Quote</span>
          </div>
          <div class="order-button" @click="emit('order', record)">
            <img src="@/assets/order.svg" alt="order" class="order-icon" />
            <span class="order-text">Order Now</span>
          </div>
        </div>
      </template>
    </div>

    <!-- AI 正在输入的消息 -->
    <div
      v-if="isAiTyping && aiTypingMessage"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 300 } }"
      class="message-container ai-message"
    >
      <div
        v-for="toolCall in aiTypingMessage.toolCallList"
        :key="toolCall.toolCallId"
        class="tool-call-container"
      >
        <div v-if="toolCall.content" class="typing-text">{{ toolCall.content }}</div>
        <div v-if="toolCall.callResult" class="call-result-container">
          <template v-if="toolCall.name === 'generateImage'">
            <div class="image-result" @click="handleImageTap(toolCall.callResult)">
              <img
                v-motion
                :initial="{ opacity: 0, scale: 0.8 }"
                :enter="{ opacity: 1, scale: 1, transition: { duration: 400 } }"
                :src="toolCall.callResult"
                alt="generated image"
                class="generated-image"
              />
            </div>
          </template>
        </div>
        <div
          v-if="toolCall.name === 'generateImage' && !toolCall.callResult"
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :enter="{ opacity: 1, scale: 1, transition: { duration: 300 } }"
          class="loading-image-container"
          :class="{ blinking: isBlinking }"
        >
          <img src="@/assets/image-gender.png" alt="loading" class="loading-image" />
        </div>
      </div>
      <!-- 渲染文本内容 -->
      <div
        v-if="aiTypingMessage.content"
        class="ai-content"
        v-html="
          renderMarkdown(typeof aiTypingMessage.content === 'string' ? aiTypingMessage.content : '')
        "
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { marked } from 'marked'
import type { ChatRecord } from './types'

interface Props {
  chatRecords: ChatRecord[]
  isAiTyping: boolean
  aiTypingMessage: ChatRecord | null
  isBlinking: boolean
}

interface Emits {
  (e: 'imageTap', imageUrl: string): void
  (e: 'redo', record: ChatRecord): void
  (e: 'quote', record: ChatRecord): void
  (e: 'order', record: ChatRecord): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const messagesContainer = ref<HTMLElement | null>(null)

const handleImageTap = (imageUrl: string | null) => {
  if (imageUrl) {
    emit('imageTap', imageUrl)
  }
}

const renderMarkdown = (content: string): string => {
  if (!content) return ''
  try {
    // 解析 markdown
    const html = marked.parse(content, {
      breaks: true,
    }) as string

    // 移除所有图片标签
    return html.replace(/<img[^>]*>/gi, '')
  } catch (error) {
    console.error('Markdown render error:', error)
    return content
  }
}

// 滚动到底部
watch(
  [() => props.chatRecords, () => props.aiTypingMessage],
  () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  },
  { deep: true },
)

// 暴露容器引用供父组件使用
defineExpose({
  messagesContainer,
})
</script>

<style scoped>
.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  /* padding-top: calc(var(--wn-navbar-height) + 12px); Removed navbar dependency */
  padding-bottom: 8px;
}

.message-container {
  margin: 20px 0;
  padding: 10px;
  border-radius: 15px;
  margin-bottom: 8px;
  width: fit-content;
}

.user-message {
  align-self: flex-end;
  background: var(--user-message-bg);
  max-width: 90%;
  margin-left: auto;
}

.ai-message {
  align-self: flex-start;
  background: var(--ai-message-bg);
}

.user-text {
  color: var(--text-color);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.user-images-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4px;
  border-radius: 10px;
}

.user-image-preview {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  background: var(--input-bg-color);
  object-fit: cover;
}

.ai-content {
  color: var(--text-color);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.ai-content :deep(p) {
  margin: 0;
  color: var(--text-color);
}

.ai-content :deep(code) {
  background: var(--code-bg);
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 14px;
}

.call-result-container {
  display: inline-block;
}

.generated-image {
  width: 160px;
  max-width: 160px;
  height: auto;
  border-radius: 12px;
  cursor: pointer;
  display: block;
}

.image-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
  padding: 5px 8px;
  box-sizing: content-box;
}

.action-icon:hover {
  opacity: 0.7;
}

.icon-img {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.action-text {
  font-size: 14px;
  color: var(--text-color);
  font-weight: 600;
}

.order-button {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 5px 8px;
  background: var(--input-bg-color);
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.order-button:hover {
  opacity: 0.8;
}

.order-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.order-text {
  font-size: 14px;
  color: var(--text-color);
  font-weight: 600;
}

.text-result {
  color: var(--text-color);
}

.error-message {
  color: #ff4444;
  font-size: 14px;
}

.typing-text {
  color: var(--text-color);
  font-size: 16px;
  margin-bottom: 10px;
}

.typing-text::after {
  content: '';
  animation: ellipsis 2s infinite;
  display: inline-block;
  width: 1.2em;
  text-align: left;
  vertical-align: bottom;
}

@keyframes ellipsis {
  0% {
    content: '';
  }
  25% {
    content: '.';
  }
  50% {
    content: '..';
  }
  75% {
    content: '...';
  }
}

.loading-image-container {
  background: var(--input-bg-color);
  border-radius: 12px;
  width: 160px;
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.8s;
}

.loading-image-container.blinking {
  background-color: var(--hover-bg-color);
}

.loading-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
}
</style>
