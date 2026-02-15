<template>
  <div class="image-preview-container">
    <!-- 图片预览列表 -->
    <div v-for="(image, index) in images" :key="index" class="image-preview-item">
      <n-image
        :src="image"
        object-fit="cover"
        class="image-preview"
        :preview-disabled="false"
      />
      
      <!-- 右上角删除按钮 -->
      <div class="image-reduce-button" @click.stop="removeImage(index)">
        <n-icon size="16" color="#ffffff">
          <CloseOutline />
        </n-icon>
      </div>
      <!-- 正下方替换按钮 -->
      <div class="image-replace-button" @click.stop="replaceImage(index)">
        <n-icon size="16" color="#ffffff" class="mr-1">
          <RefreshOutline />
        </n-icon>
        <span class="replace-text">replace</span>
      </div>
    </div>

    <!-- 上传按钮 -->
    <n-upload
      v-if="images.length < maxCount"
      abstract
      :show-file-list="false"
      accept="image/png,image/jpeg,image/jpg"
      :multiple="true"
      :max="maxCount - images.length"
      @change="handleFileChange"
    >
      <n-upload-trigger #="{ handleClick }" abstract>
        <div class="upload-button" @click="handleClick">
           <n-icon size="30" color="#C9CDD5">
             <AddOutline />
           </n-icon>
           <div class="upload-count">{{ maxCount - images.length }}/{{ maxCount }}</div>
        </div>
      </n-upload-trigger>
    </n-upload>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ossUploadPresign, uploadToOSS } from '@/api/upload'
import { useMessage, type UploadFileInfo } from 'naive-ui'
import { AddOutline, CloseOutline, RefreshOutline } from '@vicons/ionicons5'

interface Props {
  modelValue: string[]
  maxCount?: number
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  maxCount: 5,
})

const emit = defineEmits<Emits>()
const message = useMessage()
const isUploading = ref(false)

// 使用 computed 来保持响应式
const images = computed(() => props.modelValue)

const uploadFileToOSS = async (file: File): Promise<string> => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']

  // 检查文件大小
  if (file.size > maxSize) {
    throw new Error('Image size cannot exceed 10MB')
  }

  // 检查文件类型
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPG and PNG format images are supported')
  }

  // 获取预签名URL
  const presignResponse = await ossUploadPresign({
    filename: file.name,
    contentType: file.type,
    size: file.size,
  })

  if (presignResponse.code !== 0 || !presignResponse.data) {
    throw new Error(presignResponse.message || 'Failed to get OSS upload credentials')
  }

  // 上传文件到OSS
  await uploadToOSS(file, presignResponse.data.uploadUrl, presignResponse.data.contentType)

  // 返回公开访问URL
  return presignResponse.data.publicUrl
}

const handleFileChange = async (data: { fileList: UploadFileInfo[] }) => {
  const files = data.fileList.filter(f => f.status === 'pending').map(f => f.file) as File[]
  if (!files || files.length === 0) return

  const remainingSlots = props.maxCount - images.value.length

  if (files.length > remainingSlots) {
    message.warning(
      `You can only select up to ${props.maxCount} images`,
    )
    return
  }

  // 显示加载状态
  isUploading.value = true
  const loading = message.loading('Uploading...', { duration: 0 })

  try {
    // 批量上传图片到OSS
    const uploadPromises = files.map((file) => uploadFileToOSS(file))
    const uploadedUrls = await Promise.all(uploadPromises)

    // 更新图片列表
    const newImages = [...images.value, ...uploadedUrls]
    emit('update:modelValue', newImages)
    message.success('Upload successful')
  } catch (error) {
    message.error(error instanceof Error ? error.message : 'Failed to upload')
  } finally {
    loading.destroy()
    isUploading.value = false
    // 清空 fileList 防止重复触发
    data.fileList.length = 0
  }
}

const removeImage = (index: number) => {
  const newImages = images.value.filter((_, i) => i !== index)
  emit('update:modelValue', newImages)
}

// 替换图片
const replaceImage = async (index: number) => {
  // 创建一个临时的 input 元素用于替换
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const files = target.files
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file) return

    // 显示加载状态
    isUploading.value = true
    const loading = message.loading('Uploading...', { duration: 0 })

    try {
      // 上传新图片到OSS
      const uploadedUrl = await uploadFileToOSS(file)

      // 替换指定位置的图片
      const newImages = [...images.value]
      newImages[index] = uploadedUrl
      emit('update:modelValue', newImages)

      message.success('Replacement successful')
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Replacement failed')
    } finally {
      loading.destroy()
      isUploading.value = false
    }
  }
  input.click()
}
</script>

<style scoped>
.image-preview-container {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 12px 0;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
}

/* 上传按钮 */
.upload-button {
  width: 70px;
  height: 70px;
  border-radius: 10px;
  background: #fcfcfc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
  position: relative;
  border: 1px dashed #d9d9d9;
}

.upload-button:hover {
  background: #e8e8e8;
  border-color: #18a058;
}

.upload-count {
  font-size: 10px;
  color: #aaa;
  line-height: 1;
  margin-top: 4px;
}

.image-preview-item {
  position: relative;
  flex-shrink: 0;
  width: 70px;
  height: 70px;
}

.image-preview {
  width: 70px;
  height: 70px;
  border-radius: 10px;
  /* background: #f0f0f0; */
}

/* 右上角删除按钮 */
.image-reduce-button {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  border-radius: 50%;
}

.image-reduce-button:hover {
  background-color: rgba(0,0,0,0.7);
}

/* 正下方替换按钮 - 带渐变遮罩 */
.image-replace-button {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  white-space: nowrap;
  padding: 8px 0 2px 0;
  background: linear-gradient(to top, rgba(30, 30, 30, 0.85), rgba(30, 30, 30, 0.4), transparent);
  border-radius: 0 0 10px 10px; /* matched parent border-radius */
  transition: all 0.2s ease;
  overflow: hidden;
}

.image-replace-button:hover {
  background: linear-gradient(to top, rgba(20, 20, 20, 0.95), rgba(20, 20, 20, 0.5), transparent);
}

.replace-text {
  font-size: 10px;
  color: white;
  line-height: 1;
}

:deep(.n-image img) {
  border-radius: 10px;
  width: 100%;
  height: 100%;
}
</style>
