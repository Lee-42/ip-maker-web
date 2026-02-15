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

const props = defineProps<{
  show: boolean
  initialTitle?: string
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'success', title: string): void
}>()

const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const isEdit = computed(() => !!props.initialTitle)

const formValue = reactive({
  title: '',
})

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      formValue.title = props.initialTitle || ''
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

const handleCreate = (e?: Event) => {
  e?.preventDefault()
  formRef.value?.validate((errors) => {
    if (!errors) {
      loading.value = true
      // Simulate API call
      setTimeout(() => {
        message.success(isEdit.value ? 'Story Updated Successfully' : 'Story Created Successfully')
        emit('success', formValue.title)
        emit('update:show', false)
        loading.value = false
        // Reset form
        formValue.title = ''
      }, 500)
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
