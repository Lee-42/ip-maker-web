<template>
  <n-modal
    :show="show"
    @update:show="$emit('update:show', $event)"
    preset="card"
    :title="isEdit ? 'Edit IP' : 'Create New IP'"
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
      <n-form-item label="Description" path="description">
        <n-input type="textarea" v-model:value="formValue.description" placeholder="Enter Description" />
      </n-form-item>
      <n-form-item label="IP Avatar" path="avatar">
        <image-upload v-model="formValue.avatar" :max-count="1" />
      </n-form-item>
    </n-form>
    <template #footer>
      <div class="footer-actions">
        <n-button @click="handleCancel">Cancel</n-button>
        <n-button type="primary" :loading="loading" @click="handleSubmit">Submit</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { NModal, NForm, NFormItem, NInput, NButton, useMessage, type FormInst, type FormRules } from 'naive-ui'
import ImageUpload from '@/components/agent-ui/image-upload.vue'
import { createIp, updateIp } from '@/api/ip'
import type { IP } from '@/types/ip'

const props = defineProps<{
  show: boolean
  editData?: IP | null
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'success'): void
}>()

const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const isEdit = computed(() => !!props.editData?.id)

const formValue = reactive({
  name: '',
  description: '',
  avatar: [] as string[],
})

const rules: FormRules = {
  name: {
    required: true,
    message: 'Please enter IP Name',
    trigger: 'blur',
  },
  avatar: {
    required: false,
    type: 'array',
    message: 'Please upload an image',
    trigger: 'change',
    // validator: (_: any, value: string[]) => {
    //   if (!value || value.length === 0) {
    //     return new Error('Please upload an image')
    //   }
    //   return true
    // },
  },
}

watch(
  () => props.show,
  (show) => {
    if (show) {
      if (props.editData && props.editData.id) {
        formValue.name = props.editData.name || ''
        formValue.description = props.editData.description || ''
        formValue.avatar = props.editData.avatar ? [props.editData.avatar] : []
      } else {
        formValue.name = ''
        formValue.description = ''
        formValue.avatar = []
      }
    }
  }
)

const handleCancel = () => {
  emit('update:show', false)
}

const handleSubmit = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      try {
        const payload = {
          name: formValue.name,
          description: formValue.description,
          avatar: formValue.avatar[0] || '',
        }
        
        if (isEdit.value && props.editData) {
          const res = await updateIp({ ...payload, id: props.editData.id })
          if (res.code === 0) {
            message.success('IP Updated Successfully')
            emit('success')
            emit('update:show', false)
          } else {
            message.error(res.msg || 'Failed to update IP')
          }
        } else {
          const res = await createIp(payload as any)
          if (res.code === 0) {
            message.success('IP Created Successfully')
            emit('success')
            emit('update:show', false)
          } else {
            message.error(res.msg || 'Failed to create IP')
          }
        }
      } catch (err: any) {
        message.error(isEdit.value ? 'Failed to update IP' : 'Failed to create IP')
        console.error(err)
      } finally {
        loading.value = false
      }
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
