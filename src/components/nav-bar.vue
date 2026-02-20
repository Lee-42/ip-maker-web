<template>
  <div>
    <div
      class="nav-bar"
      :style="{
        backgroundColor: bgColor,
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
      }"
    >
      <div class="nav-content">
        <div class="nav-left" @click="handleBack">
          <van-icon v-if="isBack" :name="iconName" size="20" :color="'#000000'" class="back-icon" />
        </div>
        <div class="nav-title-wrapper" :class="{ scrolled: isScrolled }">
          <div v-if="title" class="nav-title">{{ title }}</div>
          <div v-if="subTitle" class="nav-subtitle">{{ subTitle }}</div>
        </div>
        <div class="nav-right">
          <slot name="right"></slot>
        </div>
      </div>
    </div>
    <div v-if="showPlaceholder" class="nav-placeholder"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  isBack?: boolean
  title?: string
  subTitle?: string
  defaultBackBehavior?: boolean
  iconName?: string
  scrollContainer?: HTMLElement | null
  showPlaceholder?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isBack: false,
  title: 'IPMAKER',
  subTitle: '',
  defaultBackBehavior: true,
  iconName: 'arrow-left',
  scrollContainer: null,
  showPlaceholder: true,
})

const emit = defineEmits<{
  back: []
}>()

const router = useRouter()
const bgColor = ref('transparent')
const isScrolled = ref(false)
let currentScrollElement: HTMLElement | Window | null = null

const handleBack = () => {
  if (props.defaultBackBehavior) {
    const backHistory = router.options.history.state.back as string | undefined

    if (backHistory) {
      router.back()
    } else {
      router.replace('/home')
    }
  } else {
    emit('back')
  }
}

const handleScroll = () => {
  let scrollTop = 0

  // 如果有自定义滚动容器，使用自定义容器的 scrollTop
  if (props.scrollContainer) {
    scrollTop = props.scrollContainer.scrollTop
  } else {
    // 否则使用 window 的滚动位置
    scrollTop = window.scrollY || document.documentElement.scrollTop
  }

  const scrolled = scrollTop > 0
  const newBgColor = scrolled ? 'rgba(255, 255, 255, 0.7)' : 'transparent'

  if (bgColor.value !== newBgColor) {
    bgColor.value = newBgColor
  }
  if (isScrolled.value !== scrolled) {
    isScrolled.value = scrolled
  }
}

// 移除之前的滚动监听器
const removeScrollListener = () => {
  if (currentScrollElement) {
    currentScrollElement.removeEventListener('scroll', handleScroll)
    currentScrollElement = null
  }
}

// 添加滚动监听器
const addScrollListener = () => {
  removeScrollListener()

  if (props.scrollContainer) {
    // 监听自定义滚动容器
    props.scrollContainer.addEventListener('scroll', handleScroll)
    currentScrollElement = props.scrollContainer
  } else {
    // 监听 window 滚动
    window.addEventListener('scroll', handleScroll)
    currentScrollElement = window
  }
}

// 监听 scrollContainer 的变化
watch(
  () => props.scrollContainer,
  () => {
    addScrollListener()
  },
)

onMounted(() => {
  addScrollListener()
})

onUnmounted(() => {
  removeScrollListener()
})
</script>

<style scoped>
.nav-bar {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 999;
  transition: background-color 0.15s ease;
  height: calc(44px + env(safe-area-inset-top));
  padding-top: env(safe-area-inset-top);
}

.nav-content {
  display: flex;
  align-items: center;
  height: 44px;
  position: relative;
  padding: 0 16px;
}

.nav-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  cursor: pointer;
}

.back-icon {
  flex-shrink: 0;
}

.nav-right {
  position: absolute;
  right: 16px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.nav-title-wrapper {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  min-width: 75%;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
}

.nav-title {
  font-size: 16px;
  color: #000000;
  font-weight: 500;
  transition: color 0.15s ease;
}

.nav-title-wrapper.scrolled .nav-title {
  color: #000;
}

.nav-subtitle {
  font-size: 12px;
  color: #333333;
  transition: color 0.15s ease;
}

.nav-title-wrapper.scrolled .nav-subtitle {
  color: #666;
}

.nav-placeholder {
  height: calc(44px + env(safe-area-inset-top));
}
</style>
