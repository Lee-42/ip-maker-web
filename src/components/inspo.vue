<template>
  <div class="inspo-trigger">
    <n-button type="primary" secondary @click="showDrawer = true"> Inspo </n-button>

    <n-drawer v-model:show="showDrawer" :width="500" placement="right">
      <n-drawer-content title="灵感列表" closable>
        <!-- 搜索与过滤 -->
        <div class="filter-section">
          <n-input
            v-model:value="searchKeyword"
            placeholder="搜索灵感..."
            clearable
            @update:value="handleSearch"
            style="flex: 1"
          />
          <n-select
            v-model:value="statusFilter"
            :options="statusOptions"
            placeholder="全部状态"
            clearable
            @update:value="handleSearch"
            style="width: 140px; margin-left: 12px"
          />
        </div>

        <n-divider style="margin: 16px 0" />

        <!-- 列表 -->
        <div class="list-container">
          <n-spin :show="loading">
            <n-empty v-if="!loading && inspoList.length === 0" description="暂无灵感数据" />
            <n-list v-else hoverable clickable style="background: transparent">
              <n-list-item v-for="item in inspoList" :key="item.id">
                <template #suffix>
                  <n-button size="small" type="error" disabled>删除</n-button>
                </template>
                <n-thing :title="item.title">
                  <template #description>
                    <n-space size="small" align="center" style="margin-bottom: 8px">
                      <n-tag :type="item.status === 1 ? 'success' : 'warning'" size="small">
                        {{ item.status === 1 ? '已生产' : '未生产' }}
                      </n-tag>
                      <span class="time">{{ formatDate(item.createdAt) }}</span>
                    </n-space>
                  </template>
                  <div class="inspo-content">
                    <template v-if="item.type === 'image'">
                      <n-image
                        :src="item.content"
                        width="120"
                        style="border-radius: 4px; overflow: hidden"
                      />
                    </template>
                    <template v-else>
                      {{ item.content }}
                    </template>
                  </div>
                </n-thing>
              </n-list-item>
            </n-list>
          </n-spin>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper" v-if="total > 0">
          <n-pagination
            v-model:page="currentPage"
            v-model:page-size="pageSize"
            :item-count="total"
            :page-sizes="[10, 20, 30]"
            show-size-picker
            @update:page="fetchData"
            @update:page-size="handlePageSizeChange"
          />
        </div>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  NButton,
  NDrawer,
  NDrawerContent,
  NInput,
  NSelect,
  NDivider,
  NList,
  NListItem,
  NThing,
  NTag,
  NSpace,
  NImage,
  NSpin,
  NEmpty,
  NPagination,
} from 'naive-ui'
import { getInspoList, type Inspo } from '@/api/inspo'

const showDrawer = ref(false)

// 过滤和搜索
const searchKeyword = ref('')
const statusFilter = ref<number | null>(null)
const statusOptions = [
  { label: '未生产', value: 0 },
  { label: '已生产', value: 1 },
]

// 分页与数据
const loading = ref(false)
const inspoList = ref<Inspo[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getInspoList({
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchKeyword.value || undefined,
      status: statusFilter.value !== null ? statusFilter.value : undefined,
    })

    if (res.data) {
      inspoList.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取灵感列表失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchData()
}

// 格式化时间
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return dateString.replace('T', ' ').split('.')[0]
}

// 抽屉打开时重新请求数据
watch(showDrawer, (val) => {
  if (val) {
    fetchData()
  }
})
</script>

<style scoped>
.inspo-trigger {
  display: inline-flex;
}
.filter-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.list-container {
  min-height: 200px;
}
.time {
  font-size: 12px;
  color: #999;
}
.inspo-content {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  margin-top: 4px;
  word-break: break-all;
}
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
