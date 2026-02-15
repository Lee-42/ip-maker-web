<template>
  <div class="coupon-card">
    <div v-if="showMask" class="coupon-mask"></div>

    <div class="coupon-bg">
      <img src="@/assets/bg-coupon.png" alt="coupon" />
    </div>

    <div class="coupon-content" @click="onSelectCoupon">
      <div class="coupon-info">
        <!-- 满减券显示金额 -->
        <template v-if="coupon.type === 'cash'">
          <div class="coupon-amount">
            <span class="amount-symbol">$</span>
            <span class="amount-value">{{ coupon.discountAmount }}</span>
            <span class="threshold-text">Spend {{ coupon.thresholdAmount }} to use</span>
          </div>
        </template>

        <!-- 折扣券显示百分比 -->
        <template v-else-if="coupon.type === 'discount'">
          <span class="discount-value">{{ 100 - coupon.discountRate }}%</span>
          <span class="discount-text">Off</span>
        </template>

        <!-- 免单券显示免费 -->
        <template v-else>
          <div class="coupon-amount">
            <span class="amount-symbol">$</span>
            <span class="amount-value">0</span>
            <span class="free-text">Free</span>
          </div>
        </template>

        <div class="coupon-name">{{ coupon.name }}</div>
      </div>

      <!-- 选中状态指示器 -->
      <div class="select-indicator" :class="{ selected: props.isSelected }">
        <img
          v-if="props.isSelected"
          src="@/assets/svgs/icon-checked-fill.svg"
          alt="selected"
          class="check-icon"
        />
      </div>
    </div>

    <div class="coupon-rules">
      <van-collapse v-if="unavailableReason" v-model="activeNames" :border="false">
        <van-collapse-item name="1" :border="false">
          <template #title>
            <span class="text-[#232323]">Not available: {{ unavailableReason }}</span>
          </template>
          <div class="coupon-description">
            {{ coupon.description || 'No usage instructions available' }}
          </div>
        </van-collapse-item>
      </van-collapse>

      <van-collapse v-else v-model="activeNames" :border="false">
        <van-collapse-item name="1" :border="false">
          <template #title>
            <div class="coupon-rule-title">
              <span v-if="isValid" class="validity-text">Date: Exp: {{ formatCouponDate(coupon.validEnd) }}</span>
              <span v-else class="validity-text">{{ formatCouponDate(coupon.validStart) }} Available</span>
              <span class="rule-text">Activity Rules</span>
            </div>
          </template>
          <div class="coupon-description">
            {{ coupon.description || 'No usage instructions available' }}
          </div>
        </van-collapse-item>
      </van-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UserCoupon } from '@/types/promotion'
import { formatCouponDate } from '@/utils/common'

interface Props {
  coupon: UserCoupon
  showMask?: boolean
  isSelected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showMask: false,
  isSelected: false
})

const emit = defineEmits<{
  select: [coupon: UserCoupon]
}>()

const activeNames = ref<string[]>([])

const isValid = computed(() => {
  const today = Date.now()
  const validStart = new Date(props.coupon.validStart.replace(/-/g, '/')).getTime()
  return today >= validStart
})

const unavailableReason = computed(() => {
  if (props.coupon.unavailableReasons && props.coupon.unavailableReasons.length > 0) {
    return props.coupon.unavailableReasons.join('；')
  }
  return ''
})

const onSelectCoupon = () => {
  if (!props.showMask) {
    emit('select', props.coupon)
  }
}
</script>

<style scoped>
.coupon-card {
  background: #fff;
  border-radius: 16px;
  margin-top: 12px;
  position: relative;
}

.coupon-mask {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  z-index: 1;
}

.coupon-bg {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 120px;
  z-index: 0;
}
.coupon-bg img {
  width: 100%;
  height: auto;
}

.coupon-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 8px 12px;
  cursor: pointer;
  position: relative;
}

/* 锯齿 */
.coupon-content:before,
.coupon-content:after {
  content: '';
  display: block;
  width: 16px;
  height: 16px;
  background: #f5f5f5;
  border-radius: 50%;
  position: absolute;
  bottom: -8px;
}
.coupon-content:before {
  left: -8px;
}
.coupon-content:after {
  right: -8px;
}

.coupon-info {
  flex: 1;
}

.coupon-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  line-height: 28px;
  word-wrap: break-word;
}

.coupon-rule-title {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.validity-text {
  font-size: 13px;
  color: #787878;
}

.rule-text {
  font-size: 13px;
  color: #787878;
  flex-shrink: 0;
}

.coupon-description {
  font-size: 13px;
  color: #aaa;
  margin-top: 6px;
  word-wrap: break-word;
}

.coupon-amount {
  color: #ee3154;
}

.amount-symbol {
  font-size: 14px;
  font-weight: 600;
  margin-right: 4px;
}

.amount-value {
  font-size: 24px;
  font-weight: 600;
  line-height: 40px;
  margin-right: 4px;
}

.threshold-text,
.free-text {
  font-size: 12px;
  font-weight: 500;
  color: #ee3154;
  line-height: normal;
}

.discount-value {
  color: #ee3154;
  font-size: 24px;
  font-weight: 600;
  line-height: 40px;
  margin-right: 4px;
}

.discount-text {
  color: #ee3154;
  font-size: 13px;
  font-weight: 500;
  line-height: normal;
}

.select-indicator {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid #e2e2e2;
  transition: all 0.2s;
}

.select-indicator.selected {
  background: #fada39;
  border-color: #fada39;
}

.check-icon {
  width: 100%;
  height: 100%;
}

.coupon-divider {
  width: 100%;
  height: 1px;
  background: #e2e2e2;
  margin-bottom: 12px;
}

.coupon-rules {
  position: relative;
  padding: 8px 0;
  margin: 0 12px;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.coupon-rules :deep(.van-collapse) {
  background: transparent;
}

.coupon-rules :deep(.van-cell) {
  padding: 0;
  font-size: 13px;
  background: transparent;
}

.coupon-rules :deep(.van-collapse-item__content) {
  background-color: transparent;
  padding: 0;
  font-size: 13px;
  color: #9c9c9c;
}

.coupon-rules :deep(.van-cell__title) {
  color: #9c9c9c;
}
</style>
