<template>
  <n-popover v-model:show="show" placement="top-start" :show-arrow="false" trigger="manual" :style="{ padding: 0 }">
    <template #trigger>
      <!-- 风格按钮 -->
      <div ref="buttonRef" class="style-button" :class="{ disabled: noStyle }" @click="show = !show">
        <img
          src="@/assets/style.svg"
          alt="style"
          class="style-icon"
          :style="{ opacity: noStyle ? 0.5 : 1 }"
        />
        <span :style="{ color: noStyle ? '#999999' : '#333333' }">Style</span>
      </div>
    </template>

    <!-- 风格选择器内容 -->
    <div class="style-container">
      <div class="style-scroll" ref="scrollRef">
        <div
          v-for="style in filteredStyles"
          :key="style.id"
          class="style-item-wrapper"
          @click="handleStyleClick(style)"
        >
          <div class="style-item">
            <img v-if="style.imageUrl" :src="style.imageUrl" alt="style" class="style-image" />
            <div v-else class="style-placeholder">
              <img
                src="@/assets/svgs/image-placeholder.svg"
                alt="placeholder"
                class="placeholder-image"
              />
            </div>
            <div class="style-name-container">
              <span class="style-name-text">{{ style.name }}</span>
            </div>
          </div>
        </div>
        <div class="style-placeholder-end" />
      </div>
    </div>
  </n-popover>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { getPromptStyles } from '@/api/template'
import { useChatStore } from '@/stores/chat'
import type { WownowPromptStyle } from '@/types/template'
import { useMessage } from 'naive-ui'

interface Props {
  onStyleChange?: (style: WownowPromptStyle) => void
  updateShow?: (show: boolean) => void
}

const props = defineProps<Props>()

const chatStore = useChatStore()
const message = useMessage()
const show = ref(false)
const noStyle = ref(false)
const filteredStyles = ref<WownowPromptStyle[]>([])
const promptStyles = ref<WownowPromptStyle[]>([])

// 获取风格列表
const loadPromptStyles = async () => {
  try {
    const response = await getPromptStyles({ pagination: false })
    if (response.code === 0 && response.data?.list) {
      promptStyles.value = response.data.list
      // 存到 store 里，供后续文本解析使用
      chatStore.setPromptStyles(promptStyles.value)
    } else {
      console.warn('Failed to fetch prompt styles:', response.message)
      message.error('Get style list failed')
    }
  } catch (error) {
    console.error(error)
    message.error('Get style list failed')
  }
}

// 根据模板过滤风格
const filterStyles = () => {
  const template = chatStore.chatTemplate

  if (!template || !promptStyles.value.length) {
    filteredStyles.value = []
    return
  }

  const { craftType, name, styleId } = template

  // 风格ID来源：首页模板详情/资产详情（包括0）
  const initialStyleId = chatStore.assetStyleId !== null ? chatStore.assetStyleId : styleId

  // 如果 store 中已经有指定的风格ID，找到并设置该风格
  if (initialStyleId) {
    const selectedStyle = promptStyles.value.find((s) => s.id === initialStyleId)
    if (selectedStyle) {
      chatStore.setPromptStyle(selectedStyle)
      props.onStyleChange?.(selectedStyle)
    }
    filteredStyles.value = promptStyles.value
    return
  }

  // 圆形纪念币 + 平雕 = 禁用风格选择
  if (name === 'Round Coin' && craftType?.includes('FLat Engrave')) {
    noStyle.value = true
    filteredStyles.value = []
    return
  }

  // 如果是平雕工艺，过滤适合的风格
  if (craftType?.includes('FLat Engrave')) {
    filteredStyles.value = promptStyles.value

    // 设置默认风格为矢量线条风格 (ID: 1330)
    const defaultStyle = promptStyles.value.find((style) => style.id === 1330)
    if (defaultStyle) {
      chatStore.setPromptStyle(defaultStyle)
    }
  } else {
    filteredStyles.value = promptStyles.value
  }
  noStyle.value = false
}

// 监听模板变化
watch(
  () => chatStore.chatTemplate,
  () => {
    filterStyles()
  },
  { immediate: true },
)

// 监听风格列表变化
watch(
  () => promptStyles.value,
  () => {
    filterStyles()
  },
)

// 监听 show 变化，如果 noStyle 为 true，则关闭
watch(show, (newVal) => {
  if (newVal && noStyle.value) {
    show.value = false
  }
})

const closeStyleSelector = () => {
  show.value = false
}

const handleStyleClick = (style: WownowPromptStyle) => {
  chatStore.setPromptStyle(style)
  props.onStyleChange?.(style)
  closeStyleSelector()
}

onMounted(() => {
  loadPromptStyles()
})
</script>

<style scoped>
.style-selector-container {
  position: relative;
}

.style-button {
  border-radius: 8px;
  color: #333;
  font-size: 14px;
  font-weight: 400;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px 10px;
  gap: 4px;
  cursor: pointer;
  transition: background 0.2s;
  background: white;
  align-self: flex-start;
}

.style-button.disabled {
  border-color: #333333;
  cursor: not-allowed;
}

.style-icon {
  width: 14px;
  height: 12px;
}

.style-container {
  padding: 6px 8px;
  background: white;
  border-radius: 8px;
  width: 100vw;
  overflow: auto;
  left: 0;
}

.style-scroll {
  display: flex;
  flex-direction: row;
  gap: 6px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-right: 8px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.style-scroll::-webkit-scrollbar {
  display: none;
}

.style-item-wrapper {
  width: 90px;
  height: 130px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s;
}

.style-item-wrapper:hover {
  transform: scale(1.05);
}

.style-item {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  background: linear-gradient(
    180deg,
    rgba(245, 245, 245, 1) 0%,
    rgba(250, 250, 250, 0.9) 20%,
    rgba(255, 255, 255, 1) 40%,
    rgba(248, 248, 248, 1) 60%,
    rgba(240, 240, 240, 1) 83%,
    rgba(235, 235, 235, 1) 100%
  );
}

.style-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  min-width: 90px;
  min-height: 130px;
  background: #f5f5f5;
}

.style-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
}

.placeholder-image {
  width: 40px;
  height: 40px;
  opacity: 0.5;
}

.style-name-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%);
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

.style-name-text {
  color: white;
  font-size: 12px;
  font-weight: 600;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.style-placeholder-end {
  width: 80px;
  flex-shrink: 0;
}
</style>
