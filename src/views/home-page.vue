<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
  {
    title: 'PC Web App',
    desc: 'Optimized for desktop experience',
    icon: '💻',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Modern Tech Stack',
    desc: 'Vue 3, TypeScript, Tailwind CSS',
    icon: '⚡️',
    color: 'bg-yellow-100 text-yellow-600',
  },
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <span class="text-2xl">🚀</span>
          <h1 class="text-xl font-bold tracking-tight">WowNow Web App</h1>
        </div>
        <nav>
          <!-- Navigation placeholders -->
        </nav>
      </div>
    </header>

    <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Welcome to IP Marker
        </h2>
        <p class="mt-5 max-w-xl mx-auto text-xl text-gray-500">
          A powerful web application for managing and marking IPs.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
        >
          <div class="flex items-center">
            <div :class="['flex-shrink-0 rounded-md p-3', feature.color]">
              <span class="text-2xl">{{ feature.icon }}</span>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dt class="text-lg font-medium text-gray-900 truncate">
                {{ feature.title }}
              </dt>
              <dd class="mt-1 text-base text-gray-500">
                {{ feature.desc }}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-500">
          &copy; {{ new Date().getFullYear() }} IP Marker. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Scoped styles if needed, mostly using Tailwind now */
</style>
