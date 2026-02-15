<template>
  <n-modal
    :show="show"
    @update:show="$emit('update:show', $event)"
    preset="card"
    title="Create New IP"
    style="width: 500px"
    :bordered="false"
  >
    <n-form
      ref="formRef"
      :model="formValue"
      :rules="rules"
      label-placement="left"
      label-width="auto"
      require-mark-placement="right-hanging"
    >
      <n-form-item label="IP Name" path="name">
        <n-input v-model:value="formValue.name" placeholder="Enter IP Name" />
      </n-form-item>
      <n-form-item label="IP Image" path="images">
        <image-upload v-model="formValue.images" :max-count="1" />
      </n-form-item>
    </n-form>
    <template #footer>
      <div class="footer-actions">
        <n-button @click="handleCancel">Cancel</n-button>
        <n-button type="primary" :loading="loading" @click="handleCreate">Create</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { NModal, NForm, NFormItem, NInput, NButton, useMessage, type FormInst, type FormRules } from 'naive-ui'
import ImageUpload from '@/components/agent-ui/image-upload.vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'success', data: { name: string; coverUrl: string }): void
}>()

const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const formValue = reactive({
  name: '',
  images: [] as string[],
})

const rules: FormRules = {
  name: {
    required: true,
    message: 'Please enter IP Name',
    trigger: 'blur',
  },
  images: {
    required: true,
    type: 'array',
    message: 'Please upload an image',
    trigger: 'change',
    validator: (_: any, value: string[]) => {
      if (!value || value.length === 0) {
        return new Error('Please upload an image')
      }
      return true
    },
  },
}

const handleCancel = () => {
  emit('update:show', false)
}

const handleCreate = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate((errors) => {
    if (!errors) {
      loading.value = true
      // Simulate API call
      setTimeout(() => {
        const coverUrl = formValue.images[0] || ''
        const newIp = {
          name: formValue.name,
          coverUrl: coverUrl,
        }
        message.success('IP Created Successfully')
        emit('success', newIp)
        emit('update:show', false)
        loading.value = false
        // Reset form
        formValue.name = ''
        formValue.images = []
      }, 1000)
    } else {
      console.log(errors)
      message.error('Please verify input')
    }
  })
}
</script>

<style scoped>
.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
