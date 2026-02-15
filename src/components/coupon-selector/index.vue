<template>
  <div class="coupon-selector">
    <div class="selector-content">
      <!-- 可使用优惠券标题 -->
      <div class="section-header">
        <span class="section-title">Available Coupons</span>
        <img src="@/assets/svgs/icon-ticket.svg" class="ticket-icon" alt="ticket" />
      </div>

      <div class="empty-state loading" v-if="props.isLoading">
        <van-loading size="20" type="spinner" vertical>Loading...</van-loading>
      </div>

      <!-- 无可用优惠券 -->
      <div v-else-if="availableCoupons.length === 0" class="empty-state">
        <img src="@/assets/svgs/icon-coupon-empty.svg" class="empty-image" alt="no data" />
        <span class="empty-text">No Coupons Available</span>
      </div>

      <!-- 可使用优惠券列表 -->
      <coupon-card
        v-else
        v-for="coupon in availableCoupons"
        :key="coupon.id"
        :coupon="coupon"
        :is-selected="selectedCoupon?.id === coupon.id"
        :show-mask="props.reachedLimit"
        @select="handleSelectCoupon"
      />

      <!-- 不可使用优惠券 -->
      <template v-if="unavailableCoupons.length > 0">
        <div class="section-header unavailable-header">
          <span class="section-title">Unavailable Coupons</span>
          <img src="@/assets/svgs/icon-ticket.svg" class="ticket-icon" alt="ticket" />
        </div>

        <!-- 不可使用优惠券列表 -->
        <coupon-card
          v-for="coupon in unavailableCoupons"
          :key="coupon.id"
          :coupon="coupon"
          :show-mask="true"
        />
      </template>

      <!-- 优惠券领取入口 -->
      <template v-if="!props.isLoading && bannerList.length > 0">
        <div class="section-header pt-[16px]">
          <span class="section-title">Get More Coupons</span>
          <img src="@/assets/svgs/icon-ticket.svg" class="ticket-icon" alt="ticket" />
        </div>

        <div class="claim-banner-list">
          <div v-for="item in bannerList" :key="item.id" class="claim-banner">
            <div class="banner-bg">
              <img src="@/assets/bg-coupon.png" alt="coupon" />
            </div>

            <div class="banner-content">
              <p class="banner-name">{{ item.campaignName || item.name }}</p>
              <div class="banner-cover">
                <img :src="item.imageUrl" alt="banner-bg" />
                <div class="claim-button-container">
                  <van-button
                    type="primary"
                    class="claim-button"
                    :disabled="props.reachedLimit"
                    @click="goToClaimCoupons(item.campaignUid)"
                  >
                    <span v-if="props.reachedLimit">Limit Reached</span>
                    <span v-else>Claim</span>
                  </van-button>
                </div>
              </div>
            </div>

            <div
              v-if="item.campaignDescription"
              class="description-container"
              @click="toggleDescription(item.id.toString())"
            >
              <p
                class="banner-description"
                :class="{ expanded: expandedDescriptions[item.id.toString()] }"
              >
                {{ item.campaignDescription }}
              </p>
              <van-icon name="arrow-down" class="arrow-icon" />
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="selector-footer">
      <van-button
        v-if="props.reachedLimit"
        block
        type="default"
        class="cancel-button"
        @click="onConfirm"
      >
        <span>Cancel</span>
      </van-button>
      <van-button v-else block type="primary" class="confirm-button" @click="onConfirm">
        <span class="confirm-button-text">Confirm</span>
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getBannerList } from '@/api/promotion'
import type { UserCoupon, WownowBanner } from '@/types/promotion'
import CouponCard from './coupon-card.vue'
import { useRouter } from 'vue-router'

interface Props {
  reachedLimit: boolean
  unusedCoupons: UserCoupon[]
  currentCoupon: UserCoupon | null
  isVisible: boolean
  isLoading: boolean
}

const props = withDefaults(defineProps<Props>(), {
  reachedLimit: false,
  unusedCoupons: () => [],
  currentCoupon: null,
  isVisible: false,
  isLoading: false,
})

const emit = defineEmits<{ confirm: [coupon: UserCoupon | null] }>()

const router = useRouter()
const bannerList = ref<WownowBanner[]>([])
const selectedCoupon = ref<UserCoupon | null>(props.currentCoupon)
// 管理每个banner的展开状态
const expandedDescriptions = ref<Record<string, boolean>>({})

const availableCoupons = computed(() => {
  return props.unusedCoupons.filter(
    (c) => c.unavailableReasons === undefined || c.unavailableReasons.length === 0,
  )
})

const unavailableCoupons = computed(() => {
  return props.unusedCoupons.filter(
    (c) => c.unavailableReasons !== undefined && c.unavailableReasons.length > 0,
  )
})

const fetchBannerList = async () => {
  try {
    const res = await getBannerList('pay_page')
    if (res.code === 0 && res.data) {
      bannerList.value = res.data.list || []
    }
  } catch (error) {
    console.error('Failed to fetch banner list: ', error)
  }
}

const goToClaimCoupons = (campaignUid: string) => {
  router.push(`/campaign/${campaignUid}`)
}

const handleSelectCoupon = (targetCoupon: UserCoupon) => {
  selectedCoupon.value = selectedCoupon.value?.id === targetCoupon.id ? null : targetCoupon
}

// 切换描述展开状态
const toggleDescription = (itemId: string) => {
  expandedDescriptions.value[itemId] = !expandedDescriptions.value[itemId]
}

const onConfirm = () => {
  emit('confirm', selectedCoupon.value)
}

watch([() => props.currentCoupon, () => props.isVisible], ([newCoupon, isVisible]) => {
  if (isVisible) {
    selectedCoupon.value = newCoupon
  }
})

onMounted(() => {
  fetchBannerList()
})
</script>

<style scoped>
.coupon-selector {
  background: #f5f5f5;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.selector-content {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.section-header {
  display: flex;
  gap: 8px;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.ticket-icon {
  width: 16px;
  height: 16px;
}

.unavailable-header {
  padding-top: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.empty-state.loading {
  padding: 80px 0;
}

.empty-image {
  width: 94px;
  height: 95px;
  object-fit: contain;
}

.empty-text {
  font-size: 14px;
  color: #333;
}

.selector-footer {
  padding: 12px 15px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.cancel-button {
  width: 100%;
  border-radius: 16px;
  height: 54px;
  border: none;
  background: #e0e0e0;
  font-size: 16px;
  font-weight: 500;
}

.confirm-button {
  width: 100%;
  border-radius: 16px;
  height: 54px;
  border: none;
}

.confirm-button-text {
  font-size: 16px;
  font-weight: 500;
  color: #000;
}

.claim-banner-list {
  padding: 12px 0;
}

.claim-banner {
  background-color: #fff;
  border-radius: 16px;
  position: relative;
}

.banner-bg {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 35%;
  z-index: 0;
}

.banner-bg img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.banner-content {
  padding: 8px 12px;
  position: relative;
}

/* 锯齿 */
.banner-content:before,
.banner-content:after {
  content: '';
  display: block;
  width: 16px;
  height: 16px;
  background: #f5f5f5;
  border-radius: 50%;
  position: absolute;
  bottom: 28%;
}
.banner-content:before {
  left: -8px;
}
.banner-content:after {
  right: -8px;
}

.banner-name {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  padding-bottom: 8px;
}

.banner-cover {
  height: 92px;
  border-radius: 20px;
  background-color: #f5f5f5;
  position: relative;
  overflow: hidden;
}

.banner-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.claim-button-container {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
}

.claim-button {
  border-radius: 10px;
  height: 38px;
  font-size: 14px;
  color: #0a0a0a;
  padding: 8px 12px;
  border: none;
  font-weight: 500;
  box-shadow: 0px 4px 50px 0px #00000026;
}

:deep(.van-button--disabled) {
  background-color: #e5e5e5;
  color: #aaa;
  opacity: 1;
}

.description-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin: 0 12px;
  padding: 8px 0;
  font-size: 13px;
  color: #787878;
  gap: 8px;
  position: relative;
  cursor: pointer;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}

.banner-description {
  flex: 1;
  word-wrap: break-word;
  line-height: 1.4;
  /* 默认折叠状态：只显示一行 */
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.5s ease-out;
  max-height: 1.4em;
}

/* 展开状态：显示所有内容 */
.banner-description.expanded {
  -webkit-line-clamp: unset;
  line-clamp: unset;
  display: block;
  max-height: 300px;
}

.arrow-icon {
  flex-shrink: 0;
  transition: transform 0.3s ease-out;
  margin-top: 2px;
  transform-origin: center;
}

/* 展开状态时旋转180度 */
.banner-description.expanded + .arrow-icon {
  transform: rotate(-180deg);
}
</style>
