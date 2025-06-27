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

    <!-- Universal Install Prompt -->
    <div v-if="showInstallPrompt" class="fixed bottom-4 left-4 right-4 z-50">
      <div class="alert shadow-lg" :class="alertClass">
        <div>
          <Icon :name="iconName" class="h-6 w-6" />
          <div>
            <h3 class="font-bold">{{ installTitle }}</h3>
            <div class="text-xs">{{ installMessage }}</div>
          </div>
        </div>
        <div class="flex-none">
          <button class="btn btn-sm btn-ghost" @click="dismissInstall">
            {{ browserInfo.installMethod === 'unsupported' ? 'OK' : 'Não agora' }}
          </button>
          <button 
            v-if="browserInfo.installMethod !== 'unsupported'" 
            class="btn btn-sm" 
            :class="buttonClass"
            @click="installApp"
          >
            {{ installButtonText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Debug Panel (development only) -->
    <div v-if="isDev && showDebugPanel" class="fixed top-4 right-4 z-50">
      <div class="card bg-base-100 shadow-lg w-96">
        <div class="card-body p-4">
          <h4 class="card-title text-sm flex items-center gap-2">
            🔧 PWA Debug 
            <div class="badge badge-sm" :class="browserInfo.supportsPWA ? 'badge-success' : 'badge-error'">
              {{ browserInfo.name }}
            </div>
          </h4>
          
          <div class="text-xs space-y-2">
            <!-- Browser Info -->
            <div class="bg-base-200 p-2 rounded">
              <div class="font-bold">Browser:</div>
              <div>{{ browserInfo.name }} {{ browserInfo.version }}</div>
              <div>Platform: {{ browserInfo.platform }}</div>
              <div>Install Method: {{ browserInfo.installMethod }}</div>
              <div>beforeinstallprompt: {{ browserInfo.supportsBeforeInstallPrompt ? '✅' : '❌' }}</div>
            </div>

            <!-- PWA Status -->
            <div class="bg-base-200 p-2 rounded">
              <div class="font-bold">PWA Status:</div>
              <div>Install Available: {{ installAvailable ? '✅' : '❌' }}</div>
              <div>Is Installed: {{ isInstalled ? '✅' : '❌' }}</div>
              <div>Prompt Available: {{ promptAvailable ? '✅' : '❌' }}</div>
              <div>Was Dismissed: {{ wasDismissed ? '✅' : '❌' }}</div>
            </div>

            <!-- Quick Actions -->
            <div class="flex gap-2">
              <button class="btn btn-xs btn-primary" @click="forceShowInstall">
                Force Show
              </button>
              <button class="btn btn-xs btn-secondary" @click="checkStatus">
                Check Status
              </button>
              <button class="btn btn-xs btn-accent" @click="clearStorage">
                Clear Storage
              </button>
            </div>
          </div>
          
          <button class="btn btn-xs btn-ghost absolute top-2 right-2" @click="showDebugPanel = false">
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Debug Toggle -->
    <button 
      v-if="isDev && !showDebugPanel" 
      class="fixed top-4 right-4 z-50 btn btn-xs btn-outline opacity-50 hover:opacity-100"
      @click="showDebugPanel = true"
      title="PWA Debug"
    >
      🔧
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

// Reactive state
const showUpdatePrompt = ref(false)
const showInstallPrompt = ref(false)
const showDebugPanel = ref(false)
const installAvailable = ref(false)
const isInstalled = ref(false)
const promptAvailable = ref(false)
const wasDismissed = ref(false)

const browserInfo = ref({
  name: 'Unknown',
  version: 'Unknown',
  platform: 'Unknown',
  mobile: false,
  supportsBeforeInstallPrompt: false,
  supportsPWA: false,
  installMethod: 'manual'
})

let updateSW: any = null
let installMethod = 'manual'

// Development check
const isDev = computed(() => {
  if (!import.meta.client) return false
  return import.meta.dev || location.hostname === 'localhost'
})

// Dynamic UI based on browser/method
const alertClass = computed(() => {
  switch (browserInfo.value.installMethod) {
    case 'unsupported':
      return 'alert-warning'
    case 'beforeinstallprompt':
      return 'alert-success'
    case 'ios-share':
    case 'macos-share':
      return 'alert-info'
    default:
      return 'alert-success'
  }
})

const iconName = computed(() => {
  switch (browserInfo.value.installMethod) {
    case 'unsupported':
      return 'heroicons:exclamation-triangle'
    case 'ios-share':
      return 'heroicons:share'
    case 'macos-share':
      return 'heroicons:share'
    default:
      return 'heroicons:device-phone-mobile'
  }
})

const installTitle = computed(() => {
  switch (browserInfo.value.installMethod) {
    case 'unsupported':
      return 'PWA não suportado'
    case 'ios-share':
      return 'Adicionar à Tela Inicial'
    case 'macos-share':
      return 'Adicionar ao Dock'
    case 'beforeinstallprompt':
      return 'Instalar App'
    default:
      return 'Instalar App'
  }
})

const installMessage = computed(() => {
  switch (browserInfo.value.installMethod) {
    case 'unsupported':
      return 'Firefox tem suporte limitado para PWAs. Use Chrome, Edge ou Safari para instalar.'
    case 'ios-share':
      return 'Use o botão compartilhar (⬆️) e selecione "Adicionar à Tela de Início"'
    case 'macos-share':
      return 'Use o botão compartilhar (⬆️) e selecione "Adicionar ao Dock"'
    case 'beforeinstallprompt':
      return 'Instale este app para uma experiência melhor!'
    default:
      return 'Adicione este app à sua tela inicial!'
  }
})

const installButtonText = computed(() => {
  switch (browserInfo.value.installMethod) {
    case 'ios-share':
    case 'macos-share':
      return 'Ver instruções'
    case 'beforeinstallprompt':
      return 'Instalar'
    default:
      return 'Como instalar'
  }
})

const buttonClass = computed(() => {
  switch (browserInfo.value.installMethod) {
    case 'ios-share':
    case 'macos-share':
      return 'btn-info'
    case 'beforeinstallprompt':
      return 'btn-success'
    default:
      return 'btn-primary'
  }
})

// Utility functions
const detectBrowser = () => {
  if (!import.meta.client) return

  const ua = navigator.userAgent
  const info = {
    name: 'Unknown',
    version: 'Unknown',
    platform: navigator.platform,
    mobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
    supportsBeforeInstallPrompt: false,
    supportsPWA: false,
    installMethod: 'manual'
  }

  // Detection logic (same as plugin)
  if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) {
    info.name = 'Chrome'
    info.supportsBeforeInstallPrompt = true
    info.supportsPWA = true
    info.installMethod = 'beforeinstallprompt'
    const match = ua.match(/Chrome\/(\d+)/)
    if (match) info.version = match[1]
  } else if (ua.includes('Edg')) {
    info.name = 'Edge'
    info.supportsBeforeInstallPrompt = true
    info.supportsPWA = true
    info.installMethod = 'beforeinstallprompt'
    const match = ua.match(/Edg\/(\d+)/)
    if (match) info.version = match[1]
  } else if (ua.includes('SamsungBrowser')) {
    info.name = 'Samsung Internet'
    info.supportsBeforeInstallPrompt = true
    info.supportsPWA = true
    info.installMethod = 'beforeinstallprompt'
    const match = ua.match(/SamsungBrowser\/(\d+)/)
    if (match) info.version = match[1]
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    info.name = 'Safari'
    info.supportsBeforeInstallPrompt = false
    info.supportsPWA = true
    info.installMethod = info.mobile ? 'ios-share' : 'macos-share'
    const match = ua.match(/Version\/(\d+)/)
    if (match) info.version = match[1]
  } else if (ua.includes('Firefox')) {
    info.name = 'Firefox'
    info.supportsBeforeInstallPrompt = false
    info.supportsPWA = false
    info.installMethod = 'unsupported'
    const match = ua.match(/Firefox\/(\d+)/)
    if (match) info.version = match[1]
  }

  browserInfo.value = info
  installMethod = info.installMethod
}

const checkInstallationStatus = () => {
  if (!import.meta.client) return false
  
  isInstalled.value = window.matchMedia('(display-mode: standalone)').matches ||
                     window.navigator.standalone === true ||
                     document.referrer.includes('android-app://')
  
  return isInstalled.value
}

const checkDismissalStatus = () => {
  if (!import.meta.client) return false
  
  const dismissed = localStorage.getItem('pwa-install-dismissed')
  const dismissedTime = localStorage.getItem('pwa-install-dismissed-time')
  const safariDismissed = localStorage.getItem('safari-install-dismissed')
  const safariDismissedTime = localStorage.getItem('safari-install-dismissed-time')
  
  const now = Date.now()
  
  // Check standard dismissal (7 days)
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

// Main functions
onMounted(async () => {
  if (!import.meta.client) return
  
  await nextTick()
  
  // Detect browser capabilities
  detectBrowser()
  
  // Check if already installed
  if (checkInstallationStatus()) {
    console.log('📱 App já está instalado')
    return
  }
  
  // Check if recently dismissed
  if (checkDismissalStatus()) {
    console.log('⏰ Install prompt foi dispensado recentemente')
    return
  }
  
  // Setup service worker update listener
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

  // Listen for install availability
  window.addEventListener('pwa-install-available', (event: any) => {
    console.log('📱 PWA install available!', event.detail)
    installAvailable.value = true
    promptAvailable.value = !!event.detail.prompt
    
    // Show prompt after delay if not dismissed
    if (!checkDismissalStatus()) {
      const delay = browserInfo.value.installMethod === 'beforeinstallprompt' ? 3000 : 8000
      setTimeout(() => {
        showInstallPrompt.value = true
      }, delay)
    }
  })

  // Listen for app installed
  window.addEventListener('pwa-installed', () => {
    console.log('🎉 App instalado com sucesso!')
    showInstallPrompt.value = false
    installAvailable.value = false
    promptAvailable.value = false
    isInstalled.value = true
  })
  
  // For browsers without beforeinstallprompt, show manual prompt
  if (!browserInfo.value.supportsBeforeInstallPrompt && browserInfo.value.supportsPWA) {
    setTimeout(() => {
      if (!installAvailable.value && !checkDismissalStatus()) {
        installAvailable.value = true
        showInstallPrompt.value = true
      }
    }, 10000) // 10 seconds for Safari
  }
})

// Action handlers
const updateApp = () => {
  showUpdatePrompt.value = false
  if (updateSW) updateSW()
}

const dismissUpdate = () => {
  showUpdatePrompt.value = false
}

const installApp = async () => {
  console.log('🚀 Install button clicked, method:', installMethod)
  
  if (import.meta.client && window.triggerPWAInstall) {
    try {
      const result = await window.triggerPWAInstall()
      console.log('Install result:', result)
      
      if (result.outcome === 'accepted') {
        handleInstallSuccess()
      } else if (result.outcome === 'dismissed') {
        handleInstallDismissal()
      }
      
    } catch (error) {
      console.error('Install failed:', error)
      handleInstallDismissal()
    }
  } else {
    handleInstallDismissal()
  }
}

const handleInstallSuccess = () => {
  console.log('✅ Install success')
  showInstallPrompt.value = false
  localStorage.removeItem('pwa-install-dismissed')
  localStorage.removeItem('pwa-install-dismissed-time')
  localStorage.removeItem('safari-install-dismissed')
  localStorage.removeItem('safari-install-dismissed-time')
}

const handleInstallDismissal = () => {
  console.log('❌ Install dismissed')
  showInstallPrompt.value = false
  wasDismissed.value = true
  
  const now = Date.now().toString()
  if (browserInfo.value.installMethod === 'ios-share' || browserInfo.value.installMethod === 'macos-share') {
    localStorage.setItem('safari-install-dismissed', 'true')
    localStorage.setItem('safari-install-dismissed-time', now)
  } else {
    localStorage.setItem('pwa-install-dismissed', 'true')
    localStorage.setItem('pwa-install-dismissed-time', now)
  }
}

const dismissInstall = () => {
  handleInstallDismissal()
}

// Debug helpers
const forceShowInstall = () => {
  if (!isDev.value) return
  
  // Clear all dismissal flags
  localStorage.removeItem('pwa-install-dismissed')
  localStorage.removeItem('pwa-install-dismissed-time')
  localStorage.removeItem('safari-install-dismissed')
  localStorage.removeItem('safari-install-dismissed-time')
  
  wasDismissed.value = false
  installAvailable.value = true
  showInstallPrompt.value = true
  
  console.log('🔧 Forcing install prompt display')
}

const checkStatus = () => {
  if (!isDev.value) return
  
  if (import.meta.client && window.checkPWAStatus) {
    window.checkPWAStatus()
  }
  
  console.log('🔍 Component Status:')
  console.log('- Install Available:', installAvailable.value)
  console.log('- Show Install Prompt:', showInstallPrompt.value)
  console.log('- Is Installed:', isInstalled.value)
  console.log('- Was Dismissed:', wasDismissed.value)
  console.log('- Browser Info:', browserInfo.value)
}

const clearStorage = () => {
  if (!isDev.value) return
  
  // Clear all PWA related storage
  localStorage.removeItem('pwa-install-dismissed')
  localStorage.removeItem('pwa-install-dismissed-time')
  localStorage.removeItem('safari-install-dismissed')
  localStorage.removeItem('safari-install-dismissed-time')
  sessionStorage.removeItem('beforeinstallprompt-fired')
  sessionStorage.removeItem('beforeinstallprompt-time')
  sessionStorage.removeItem('page-load-time')
  
  // Reset component state
  wasDismissed.value = false
  installAvailable.value = false
  showInstallPrompt.value = false
  promptAvailable.value = false
  
  console.log('🗑️ All PWA storage cleared')
  
  // Reload page to restart detection
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}
</script>