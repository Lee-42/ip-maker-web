<template>
  <div class="list-container">
    <!-- 左列 -->
    <div class="waterfall-column">
      <div
        v-for="item in leftColumn"
        :key="item.id"
        class="card-item"
        :class="props.itemClass"
        @click="onClickItem(item.id)"
      >
        <div
          class="card-image-container"
          :class="[
            getProductShape({ label: item.label }).toLocaleLowerCase(),
            { 'rect-landscape': item.orientation === 'landscape' },
          ]"
        >
          <img
            :src="item.coverUrl + '?x-oss-process=image/resize,p_50'"
            :alt="item.name"
            class="card-image"
          />
        </div>

        <div class="card-info">
          <span v-if="props.type === 'asset'" class="card-name">{{ item.id }}</span>
          <span v-else class="card-name">{{ item.name }}</span>
          <div class="card-tags">
            <van-tag round type="primary" color="#ffe60a" text-color="rgba(51, 51, 51, 0.80)">
              {{ item.craftType }}
            </van-tag>
            <van-tag round type="primary" color="#ffe60a" text-color="rgba(51, 51, 51, 0.80)">
              {{ item.materialDescription }}
            </van-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 右列 -->
    <div class="waterfall-column">
      <div
        v-for="item in rightColumn"
        :key="item.id"
        class="card-item"
        :class="props.itemClass"
        @click="onClickItem(item.id)"
      >
        <div
          class="card-image-container"
          :class="[
            getProductShape({ label: item.label }).toLocaleLowerCase(),
            { 'rect-landscape': item.orientation === 'landscape' },
          ]"
        >
          <img
            :src="item.coverUrl + '?x-oss-process=image/resize,p_50'"
            :alt="item.name"
            class="card-image"
          />
        </div>

        <div class="card-info">
          <span v-if="props.type === 'asset'" class="card-name">{{ item.id }}</span>
          <span v-else class="card-name">{{ item.name }}</span>
          <div class="card-tags">
            <van-tag round type="primary" color="#ffe60a" text-color="rgba(51, 51, 51, 0.80)">
              {{ item.craftType }}
            </van-tag>
            <van-tag round type="primary" color="#ffe60a" text-color="rgba(51, 51, 51, 0.80)">
              {{ item.materialDescription }}
            </van-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrientationType } from '@/types/asset'
import { TemplateLabel } from '@/types/template'
import { computed } from 'vue'
import { getProductShape } from '@/utils/common'

interface WaterfallItem {
  id?: number
  name?: string
  coverUrl?: string
  label?: TemplateLabel
  orientation?: OrientationType
  craftType?: string
  materialDescription?: string
}

interface Props {
  list: WaterfallItem[]
  itemClass?: string
  type?: 'asset' | 'template'
}

const props = withDefaults(defineProps<Props>(), {
  list: () => [],
  itemClass: 'bg-[rgba(255,255,255,.85)]',
  type: 'template',
})

const emit = defineEmits<{ select: [event: { id: number }] }>()

const onClickItem = (id: number | undefined) => {
  if (!id) return
  emit('select', { id })
}

// 瀑布流布局：将列表项分配到左右两列
const leftColumn = computed(() => {
  const left: WaterfallItem[] = []
  props.list.forEach((item, index) => {
    if (index % 2 === 0) {
      left.push(item)
    }
  })
  return left
})

const rightColumn = computed(() => {
  const right: WaterfallItem[] = []
  props.list.forEach((item, index) => {
    if (index % 2 === 1) {
      right.push(item)
    }
  })
  return right
})
</script>

<style scoped>
.list-container {
  display: flex;
  gap: 10px;
  padding: 0 15px 15px;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-item {
  width: 100%;
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 20px;
  border: 0.2px solid rgba(0, 0, 0, 0.06);
  box-shadow: 3px 4px 10px 0 rgba(111, 110, 104, 0.05);
}

.card-item:active {
  transform: scale(0.95);
}

.card-image-container {
  overflow: hidden;
  border: 5px solid #f5f5f5;
  box-shadow: 3px 4px 10px 0 rgba(111, 110, 104, 0.15);
  margin: 0 auto;
  border-radius: 10px;
  background-color: #f5f5f5;
}

.card-image-container.circle {
  width: 74%;
  aspect-ratio: 1;
  border-radius: 50%;
  transform: rotate(-10deg) translateY(-15px);
}

.card-image-container.square {
  width: 74%;
  aspect-ratio: 1;
  transform: rotate(-10deg) translateY(-5px);
  margin-bottom: 8px;
}
.card-image-container.rectangle {
  width: 66%;
  aspect-ratio: 110 / 145;
  transform: rotate(-10deg) translateY(-3px);
  margin-bottom: 14px;
}

.card-image-container.rect-landscape {
  width: 87%;
  aspect-ratio: 145 / 110;
  transform: rotate(-10deg) translateY(-5px);
  margin-bottom: 12px;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-info {
  padding: 0 12px 12px;
}

.card-name {
  font-size: 16px;
  font-weight: 600;
  color: #0e0e0e;
  line-height: normal;
}

.card-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding-top: 7px;
}

:deep(.van-tag) {
  padding: 4px 8px;
  font-size: 10px;
}
</style>
