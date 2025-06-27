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
  if (!process.client) return
  
  await nextTick()
  
  // PWA Update Logic - mais simples e robusto
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      
      if (registration) {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdatePrompt.value = true
                updateSW = () => {
                  newWorker.postMessage({ type: 'SKIP_WAITING' })
                  window.location.reload()
                }
              }
            })
          }
        })
      }
    }
  } catch (error) {
    console.warn('SW update check failed:', error)
  }

  // Install Prompt Logic with better detection
  const handleInstallPrompt = (e) => {
    console.log('📱 Install prompt event triggered!')
    e.preventDefault()
    deferredPrompt = e
    
    // Check if user previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    const lastDismissed = localStorage.getItem('pwa-install-dismissed-time')
    const now = Date.now()
    
    // Show again after 7 days
    if (!dismissed || (lastDismissed && (now - parseInt(lastDismissed)) > 7 * 24 * 60 * 60 * 1000)) {
      setTimeout(() => {
        showInstallPrompt.value = true
      }, 2000) // Show after 2 seconds of page load
    }
  }

  window.addEventListener('beforeinstallprompt', handleInstallPrompt)

  // App installed
  window.addEventListener('appinstalled', () => {
    console.log('🎉 App installed successfully!')
    showInstallPrompt.value = false
    deferredPrompt = null
    localStorage.removeItem('pwa-install-dismissed')
    localStorage.removeItem('pwa-install-dismissed-time')
  })

  // Check if already in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('📱 Already running as PWA')
  }

  // iOS detection and handling
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches

  if (isIOS && !isInStandaloneMode) {
    const iosDismissed = localStorage.getItem('ios-install-dismissed')
    if (!iosDismissed) {
      setTimeout(() => {
        showInstallPrompt.value = true
      }, 5000) // Show iOS prompt after 5 seconds
    }
  }
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