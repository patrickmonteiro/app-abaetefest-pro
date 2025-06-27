<template>
  <div>
    <!-- Update Prompt -->
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
            <h3 class="font-bold">{{ isSafari ? 'Adicionar à Tela Inicial' : 'Instalar App' }}</h3>
            <div class="text-xs">
              {{ isSafari 
                ? 'Toque no botão de compartilhar e selecione "Adicionar à Tela de Início"' 
                : 'Adicione este app à sua tela inicial para uma experiência melhor!' 
              }}
            </div>
          </div>
        </div>
        <div class="flex-none">
          <button class="btn btn-sm btn-ghost" @click="dismissInstall">
            {{ isSafari ? 'Entendi' : 'Não' }}
          </button>
          <button v-if="!isSafari" class="btn btn-sm btn-success" @click="installApp">
            Instalar
          </button>
          <button v-if="isSafari" class="btn btn-sm btn-info" @click="showSafariInstructions">
            Como fazer?
          </button>
        </div>
      </div>
    </div>

    <!-- Debug Panel (only in development) -->
    <div v-if="isDev && showDebugPanel" class="fixed top-4 right-4 z-50">
      <div class="card bg-base-100 shadow-lg w-80">
        <div class="card-body p-4">
          <h4 class="card-title text-sm">🔧 PWA Debug</h4>
          <div class="text-xs space-y-1">
            <div>Prompt Available: {{ promptAvailable ? '✅' : '❌' }}</div>
            <div>Is Standalone: {{ isStandalone ? '✅' : '❌' }}</div>
            <div>Browser: {{ browserName }}</div>
            <div>Previously Dismissed: {{ wasDismissed ? '✅' : '❌' }}</div>
          </div>
          <div class="card-actions justify-end mt-2">
            <button class="btn btn-xs btn-primary" @click="forceShowInstall">
              Force Install
            </button>
            <button class="btn btn-xs btn-ghost" @click="showDebugPanel = false">
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Debug Toggle (only in development) -->
    <button 
      v-if="isDev && !showDebugPanel" 
      class="fixed top-4 right-4 z-50 btn btn-xs btn-outline opacity-50 hover:opacity-100"
      @click="showDebugPanel = true"
    >
      🔧
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

const showUpdatePrompt = ref(false)
const showInstallPrompt = ref(false)
const showDebugPanel = ref(false)
const promptAvailable = ref(false)
const isStandalone = ref(false)
const browserName = ref('Unknown')
const wasDismissed = ref(false)

let deferredPrompt: any = null
let updateSW: any = null

// Development check
const isDev = computed(() => {
  if (!import.meta.client) return false
  return import.meta.dev || location.hostname === 'localhost'
})

// Detectar Safari (mais preciso)
const isSafari = computed(() => {
  if (!import.meta.client) return false
  const ua = navigator.userAgent
  return ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('Edg')
})

const checkBrowserSupport = () => {
  if (!import.meta.client) return false
  
  const ua = navigator.userAgent
  
  // Chrome/Chromium based browsers
  if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) {
    browserName.value = 'Chrome'
    return true
  }
  
  // Edge
  if (ua.includes('Edg')) {
    browserName.value = 'Edge'
    return true
  }
  
  // Safari (supports PWA but not beforeinstallprompt)
  if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browserName.value = 'Safari'
    return true
  }
  
  // Firefox (limited PWA support)
  if (ua.includes('Firefox')) {
    browserName.value = 'Firefox'
    return false
  }
  
  return false
}

const checkDismissalStatus = () => {
  if (!import.meta.client) return false
  
  const dismissed = localStorage.getItem('pwa-install-dismissed')
  const dismissedTime = localStorage.getItem('pwa-install-dismissed-time')
  const safariDismissed = localStorage.getItem('safari-install-dismissed')
  const safariDismissedTime = localStorage.getItem('safari-install-dismissed-time')
  
  const now = Date.now()
  
  // Check Chrome/Edge dismissal (7 days)
  if (dismissed && dismissedTime) {
    const daysSince = (now - parseInt(dismissedTime)) / (24 * 60 * 60 * 1000)
    if (daysSince < 7) {
      wasDismissed.value = true
      return true
    }
  }
  
  // Check Safari dismissal (3 days)
  if (safariDismissed && safariDismissedTime) {
    const daysSince = (now - parseInt(safariDismissedTime)) / (24 * 60 * 60 * 1000)
    if (daysSince < 3) {
      wasDismissed.value = true
      return true
    }
  }
  
  return false
}

onMounted(async () => {
  if (!import.meta.client) return
  
  await nextTick()
  
  // Check if already in standalone mode
  isStandalone.value = window.matchMedia('(display-mode: standalone)').matches
  if (isStandalone.value) {
    console.log('📱 Already running as PWA')
    return
  }
  
  // Check browser support
  const supportsPWA = checkBrowserSupport()
  if (!supportsPWA && !isSafari.value) {
    console.log('❌ Browser does not support PWA installation')
    return
  }
  
  // Check dismissal status
  if (checkDismissalStatus()) {
    console.log('⏰ Installation prompt was recently dismissed')
    return
  }
  
  // PWA Update Logic
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

  // Listen for install prompt availability
  window.addEventListener('pwa-install-available', (event: any) => {
    console.log('📱 PWA install available!')
    deferredPrompt = event.detail.prompt
    promptAvailable.value = true
    
    // Show install prompt after a delay (only if not dismissed recently)
    if (!checkDismissalStatus()) {
      setTimeout(() => {
        showInstallPrompt.value = true
      }, 3000) // 3 second delay
    }
  })

  // Listen for app installed
  window.addEventListener('pwa-installed', () => {
    console.log('🎉 App installed successfully!')
    showInstallPrompt.value = false
    deferredPrompt = null
    promptAvailable.value = false
  })

  // Safari/iOS specific handling
  if (isSafari.value && !isStandalone.value && !checkDismissalStatus()) {
    setTimeout(() => {
      if (!showInstallPrompt.value && !promptAvailable.value) {
        console.log('🍎 Showing Safari install prompt')
        showInstallPrompt.value = true
      }
    }, 8000) // Show after 8 seconds for Safari
  }

  // Manual trigger for testing (development only)
  if (isDev.value) {
    // Check every 5 seconds if prompt becomes available
    const checkInterval = setInterval(() => {
      if (window.triggerPWAInstall) {
        promptAvailable.value = !!deferredPrompt
      }
    }, 5000)
    
    // Clean up interval after 30 seconds
    setTimeout(() => clearInterval(checkInterval), 30000)
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
  console.log('🚀 Install button clicked')
  
  // Try global function first
  if (import.meta.client && window.triggerPWAInstall) {
    try {
      const result = await window.triggerPWAInstall()
      console.log('Install result:', result)
      
      if (result.outcome === 'accepted') {
        console.log('✅ User accepted installation')
        showInstallPrompt.value = false
        localStorage.removeItem('pwa-install-dismissed')
        localStorage.removeItem('pwa-install-dismissed-time')
      } else if (result.outcome === 'dismissed') {
        console.log('❌ User dismissed installation')
        handleDismissal()
      } else if (result.outcome === 'no-prompt') {
        console.log('⚠️ No prompt available, showing manual instructions')
        showManualInstructions()
      }
      
      return
    } catch (error) {
      console.error('Global install failed:', error)
    }
  }
  
  // Fallback to component-level deferredPrompt
  if (deferredPrompt) {
    try {
      console.log('📱 Showing install prompt...')
      
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      console.log('User choice:', choiceResult)
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted installation')
        showInstallPrompt.value = false
        localStorage.removeItem('pwa-install-dismissed')
      } else {
        console.log('❌ User dismissed installation')
        handleDismissal()
      }
      
      deferredPrompt = null
      promptAvailable.value = false
      showInstallPrompt.value = false
      
    } catch (error) {
      console.error('Error during installation:', error)
      showManualInstructions()
    }
  } else {
    console.warn('❌ No deferred prompt available')
    showManualInstructions()
  }
}

const handleDismissal = () => {
  showInstallPrompt.value = false
  wasDismissed.value = true
  
  if (isSafari.value) {
    localStorage.setItem('safari-install-dismissed', 'true')
    localStorage.setItem('safari-install-dismissed-time', Date.now().toString())
  } else {
    localStorage.setItem('pwa-install-dismissed', 'true')
    localStorage.setItem('pwa-install-dismissed-time', Date.now().toString())
  }
  
  deferredPrompt = null
  promptAvailable.value = false
}

const showManualInstructions = () => {
  const instructions = isSafari.value 
    ? `Para adicionar à tela inicial:

🍎 No Mac (Safari):
1. Clique no botão de compartilhar (⬆️)
2. Selecione "Adicionar ao Dock"

📱 No iPhone/iPad:
1. Toque no botão de compartilhar (⬆️)
2. Role para baixo e toque em "Adicionar à Tela de Início"
3. Toque em "Adicionar"`
    : `Para instalar este app:

📱 No celular:
• Chrome/Edge: Menu → "Adicionar à tela inicial"
• Safari (iOS): Compartilhar → "Adicionar à Tela de Início"

💻 No computador:
• Chrome: Ícone de instalação na barra de endereços
• Edge: Menu → "Apps" → "Instalar este site como app"`

  alert(instructions)
  handleDismissal()
}

const dismissInstall = () => {
  console.log('❌ Install prompt dismissed by user')
  handleDismissal()
}

const showSafariInstructions = () => {
  showManualInstructions()
}

// Development helpers
const forceShowInstall = () => {
  if (!isDev.value) return
  
  // Clear dismissal flags
  localStorage.removeItem('pwa-install-dismissed')
  localStorage.removeItem('pwa-install-dismissed-time')
  localStorage.removeItem('safari-install-dismissed')
  localStorage.removeItem('safari-install-dismissed-time')
  
  wasDismissed.value = false
  showInstallPrompt.value = true
  
  console.log('🔧 Forcing install prompt display')
}
