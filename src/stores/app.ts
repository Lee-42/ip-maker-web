import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const keepAliveInclude = ref<string[]>(['Chat'])

  function addKeepAlive(name: string) {
    if (!keepAliveInclude.value.includes(name)) {
      keepAliveInclude.value.push(name)
    }
  }

  function removeKeepAlive(name: string) {
    const index = keepAliveInclude.value.indexOf(name)
    if (index > -1) {
      keepAliveInclude.value.splice(index, 1)
    }
  }

  return { keepAliveInclude, addKeepAlive, removeKeepAlive }
})
