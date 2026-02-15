<template>
  <div class="prompt-button" :class="{ disabled: props.disabled }" @click="show = true">
    <img
      src="@/assets/prompt.svg"
      alt="prompt"
      class="prompt-icon"
      :style="{ opacity: props.disabled ? 0.5 : 1 }"
    />
    <span class="prompt-text" :style="{ color: props.disabled ? '#999999' : '#333333' }">
      Prompt
    </span>
  </div>
  <van-popup v-model:show="show" position="bottom" class="prompt-popup" teleport="body">
    <div class="prompt-popup-content" @click.stop>
      <!-- Header -->
      <div class="popup-header">
        <h3 class="popup-title">Prompt</h3>
        <van-icon name="cross" class="close-icon" @click="show = false" />
      </div>

      <!-- Content -->
      <div class="popup-body">
        <div v-for="category in promptTags" :key="category.key" class="category-section">
          <h4 class="category-title">{{ category.category }}</h4>
          <div class="prompt-items">
            <div
              v-for="item in category.items"
              :key="item.name"
              class="prompt-item"
              :class="{ active: isSelected(item) }"
              @click="toggleItem(item)"
            >
              {{ item.name }}
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="popup-footer">
        <van-button
          type="primary"
          block
          class="use-button"
          :disabled="selectedCount === 0"
          @click="handleUse"
        >
          <span class="use-button-text">Use Prompt({{ selectedCount }})</span>
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import promptTags, { type PromptTagItem } from './prompts'
import { useChatStore } from '@/stores/chat'

const emit = defineEmits<{
  (e: 'close'): void
}>()

interface Props {
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const chatStore = useChatStore()
const { prompts } = storeToRefs(chatStore)

const show = ref(false)
const selectedItems = ref<Set<string>>(new Set())

// 从 store 同步选中状态到本地
const syncFromStore = () => {
  selectedItems.value.clear()
  prompts.value.forEach((prompt: PromptTagItem) => {
    selectedItems.value.add(prompt.prompt)
  })
}

// 监听弹窗打开，从 store 同步选中状态
watch(show, (newVal) => {
  if (newVal) {
    // 弹窗打开时，从 store 同步选中状态
    syncFromStore()
  } else {
    emit('close')
  }
})

// 计算选中数量
const selectedCount = computed(() => selectedItems.value.size)

// 判断 item 是否被选中
const isSelected = (item: PromptTagItem): boolean => {
  // 使用 prompt 作为唯一标识
  return selectedItems.value.has(item.prompt)
}

// 切换 item 选中状态，并实时更新 store
const toggleItem = (item: PromptTagItem) => {
  if (selectedItems.value.has(item.prompt)) {
    selectedItems.value.delete(item.prompt)
  } else {
    selectedItems.value.add(item.prompt)
  }
  // 实时更新 store
  const items = getSelectedItems()
  chatStore.setPrompts(items)
}

// 获取所有选中的 items
const getSelectedItems = (): PromptTagItem[] => {
  const items: PromptTagItem[] = []
  for (const category of promptTags) {
    for (const item of category.items) {
      if (selectedItems.value.has(item.prompt)) {
        items.push(item)
      }
    }
  }
  return items
}

// 处理使用按钮点击（store 已经在 toggleItem 中更新，这里只需要关闭弹窗）
const handleUse = () => {
  show.value = false
}
</script>

<style scoped>
.prompt-button {
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px 10px;
  gap: 4px;
  cursor: pointer;
  transition: background 0.2s;
  align-self: flex-start;
  background: white;
}

.prompt-button:not(.disabled):hover {
  background: rgba(255, 255, 255, 0.1);
}

.prompt-button.disabled {
  cursor: not-allowed;
}

.prompt-icon {
  width: 15px;
  height: 15px;
}

.prompt-text {
  font-size: 14px;
  font-weight: 400;
}

/* Popup Styles */
.prompt-popup {
  max-height: 85vh;
}

.prompt-popup-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 85vh;
  background: #ffffff;
}

/* Header */
.popup-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 20px;
  position: relative;
  border-bottom: 1px solid #f0f0f0;
}

.popup-title {
  font-size: 16px;
  font-weight: 600;
  color: #0a0a0a;
  text-align: center;
  margin: 0;
}

.close-icon {
  font-size: 20px;
  color: #999999;
  cursor: pointer;
  transition: color 0.2s;
  position: absolute;
  right: 20px;
}

.close-icon:hover {
  color: #333333;
}

/* Body */
.popup-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.category-section {
  margin-bottom: 24px;
}

.category-title {
  font-size: 14px;
  font-weight: 400;
  color: #777777;
  margin: 0 0 12px 0;
}

.subcategory-section {
  margin-bottom: 16px;
}

.prompt-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.prompt-item {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 400;
  color: #333333;
  background: #f5f5f5;
  cursor: pointer;
  border: 1px solid transparent;
}

.prompt-item:hover {
  background: #eeeeee;
}

.prompt-item.active {
  background: #fff599;
  color: #000000;
  border-color: #fff599;
}

/* Footer */
.popup-footer {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background: #ffffff;
}

.use-button {
  height: 44px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
}

.use-button-text {
  font-size: 14px;
  font-weight: 500;
  color: #000000;
}
</style>
