<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-blue-600 text-white p-4 shadow-lg">
      <div class="container mx-auto">
        <h1 class="text-xl font-bold">PWA SSR App</h1>
        <nav class="mt-2">
          <NuxtLink to="/" class="mr-4 hover:underline">Home</NuxtLink>
          <NuxtLink to="/about" class="mr-4 hover:underline">Sobre</NuxtLink>
          <NuxtLink to="/offline" class="hover:underline">Offline</NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto p-4">
      <slot />
    </main>

    <!-- PWA Install Prompt -->
    <div
      v-if="showInstallPrompt"
      class="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg"
    >
      <p class="mb-2">Instalar este app?</p>
      <div class="space-x-2">
        <button
          @click="installPWA"
          class="bg-white text-blue-600 px-3 py-1 rounded"
        >
          Instalar
        </button>
        <button
          @click="dismissInstall"
          class="bg-blue-700 px-3 py-1 rounded"
        >
          Agora não
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const showInstallPrompt = ref(false)
let deferredPrompt = null

onMounted(() => {
  // Detectar prompt de instalação
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    showInstallPrompt.value = true
  })
})

const installPWA = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    deferredPrompt = null
    showInstallPrompt.value = false
  }
}

const dismissInstall = () => {
  showInstallPrompt.value = false
}
</script>