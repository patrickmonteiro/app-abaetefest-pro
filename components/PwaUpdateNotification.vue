<template>
  <div v-if="showUpdatePrompt" class="fixed bottom-4 left-4 right-4 z-50">
    <div class="alert alert-info shadow-lg">
      <div>
        <Icon name="heroicons:arrow-path" class="h-6 w-6" />
        <div>
          <h3 class="font-bold">Nova versão disponível!</h3>
          <div class="text-xs">Uma atualização do app está pronta para instalação.</div>
        </div>
      </div>
      <div class="flex-none">
        <button class="btn btn-sm btn-ghost" @click="dismissUpdate">
          Depois
        </button>
        <button class="btn btn-sm btn-primary" @click="updateApp">
          Atualizar
        </button>
      </div>
    </div>
  </div>

  <!-- Install Prompt -->
  <div v-if="showInstallPrompt" class="fixed bottom-4 left-4 right-4 z-50">
    <div class="alert alert-success shadow-lg">
      <div>
        <Icon name="heroicons:device-phone-mobile" class="h-6 w-6" />
        <div>
          <h3 class="font-bold">Instalar App</h3>
          <div class="text-xs">Adicione este app à sua tela inicial!</div>
        </div>
      </div>
      <div class="flex-none">
        <button class="btn btn-sm btn-ghost" @click="dismissInstall">
          Não
        </button>
        <button class="btn btn-sm btn-success" @click="installApp">
          Instalar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showUpdatePrompt = ref(false)
const showInstallPrompt = ref(false)
let deferredPrompt = null
let updateSW = null

onMounted(async () => {
  // PWA Update Logic
  if ('serviceWorker' in navigator) {
    const { Workbox } = await import('workbox-window')
    const wb = new Workbox('/sw.js')
    
    wb.addEventListener('waiting', () => {
      showUpdatePrompt.value = true
      updateSW = () => {
        wb.addEventListener('controlling', () => {
          window.location.reload()
        })
        wb.messageSkipWaiting()
      }
    })
    
    wb.register()
  }

  // Install Prompt Logic
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    showInstallPrompt.value = true
  })

  // Hide install prompt if already installed
  window.addEventListener('appinstalled', () => {
    showInstallPrompt.value = false
    deferredPrompt = null
  })
})

const updateApp = () => {
  showUpdatePrompt.value = false
  if (updateSW) updateSW()
}

const dismissUpdate = () => {
  showUpdatePrompt.value = false
}

const installApp = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      showInstallPrompt.value = false
    }
    
    deferredPrompt = null
  }
}

const dismissInstall = () => {
  showInstallPrompt.value = false
  // Remember user dismissed (optional)
  localStorage.setItem('pwa-install-dismissed', 'true')
}
</script>