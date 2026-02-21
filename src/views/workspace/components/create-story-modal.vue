<template>
  <n-modal
    :show="show"
    @update:show="$emit('update:show', $event)"
    preset="card"
    :title="isEdit ? 'Edit Story' : 'Create New Story'"
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
      <n-form-item label="Story Title" path="title">
        <n-input
          v-model:value="formValue.title"
          placeholder="Enter Story Title"
          @keydown.enter.prevent="handleCreate"
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <div class="footer-actions">
        <n-button @click="handleCancel">Cancel</n-button>
        <n-button type="primary" :loading="loading" @click="handleCreate">
          {{ isEdit ? 'Save' : 'Create' }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { NModal, NForm, NFormItem, NInput, NButton, useMessage, type FormInst, type FormRules } from 'naive-ui'
import { createStory, updateStory } from '@/api/story'
import type { Story } from '@/types/story'

const props = defineProps<{
  show: boolean
  ipId: number
  editData?: Story | null
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'success'): void
}>()

const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const isEdit = computed(() => !!props.editData)

const formValue = reactive({
  title: '',
})

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      if (props.editData) {
        formValue.title = props.editData.title
      } else {
        formValue.title = ''
      }
    }
  }
)

const rules: FormRules = {
  title: {
    required: true,
    message: 'Please enter Story Title',
    trigger: 'blur',
  },
}

const handleCancel = () => {
  emit('update:show', false)
}

const handleCreate = async (e?: Event) => {
  e?.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      try {
        let res
        if (isEdit.value && props.editData) {
          res = await updateStory({
            ...props.editData,
            title: formValue.title,
          })
        } else {
          res = await createStory({
            ipId: props.ipId,
            title: formValue.title,
            content: 'Start writing your story here...',
          })
        }
        
        if (res.code === 0) {
          message.success(isEdit.value ? 'Story Updated Successfully' : 'Story Created Successfully')
          emit('success')
          emit('update:show', false)
          formValue.title = ''
        } else {
          message.error(res.message || 'Operation failed')
        }
      } catch (err: any) {
        console.error(err)
        message.error('Operation failed')
      } finally {
        loading.value = false
      }
    } else {
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
