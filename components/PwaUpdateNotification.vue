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
  await nextTick()
  
  // PWA Update Logic
  if ('serviceWorker' in navigator) {
    try {
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
    } catch (e) {
      console.error('Workbox registration failed:', e)
    }
  }

  // Install Prompt Logic with debugging
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('📱 Install prompt triggered!')
    e.preventDefault()
    deferredPrompt = e
    
    // Check if user previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed !== 'true') {
      showInstallPrompt.value = true
    }
  })

  // Hide install prompt if already installed
  window.addEventListener('appinstalled', () => {
    console.log('🎉 App installed successfully!')
    showInstallPrompt.value = false
    deferredPrompt = null
    localStorage.removeItem('pwa-install-dismissed')
  })

  // Additional check for iOS
  if (isIOS() && !isInStandaloneMode()) {
    // For iOS, show custom install instructions after a delay
    setTimeout(() => {
      if (!localStorage.getItem('ios-install-dismissed')) {
        showInstallPrompt.value = true
      }
    }, 3000)
  }
})

// Helper functions
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

const isInStandaloneMode = () => {
  return window.matchMedia('(display-mode: standalone)').matches
}

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