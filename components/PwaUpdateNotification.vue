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
          <h3 class="font-bold">{{ isSafari ? 'Adicionar à Tela Inicial' : 'Instalar App' }}</h3>
          <div class="text-xs">
            {{ isSafari 
              ? 'Toque no botão de compartilhar e selecione "Adicionar à Tela de Início"' 
              : 'Adicione este app à sua tela inicial!' 
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showUpdatePrompt = ref(false)
const showInstallPrompt = ref(false)
let deferredPrompt: any = null
let updateSW: any = null

// Detectar Safari (mais preciso)
const isSafari = computed(() => {
  if (!import.meta.client) return false
  const ua = navigator.userAgent
  return ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('Edg')
})

onMounted(async () => {
  if (!import.meta.client) return
  
  await nextTick()
  
  // PWA Update Logic - usando service worker nativo
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
    
    // Check if user previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    const lastDismissed = localStorage.getItem('pwa-install-dismissed-time')
    const now = Date.now()
    
    // Show again after 7 days
    if (!dismissed || (lastDismissed && (now - parseInt(lastDismissed)) > 7 * 24 * 60 * 60 * 1000)) {
      setTimeout(() => {
        showInstallPrompt.value = true
      }, 2000)
    }
  })

  // Listen for app installed
  window.addEventListener('pwa-installed', () => {
    console.log('🎉 App installed successfully!')
    showInstallPrompt.value = false
    deferredPrompt = null
  })

  // Check if already in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('📱 Already running as PWA')
    return
  }

  // Safari/iOS specific handling
  if (isSafari.value && !window.matchMedia('(display-mode: standalone)').matches) {
    const safariDismissed = localStorage.getItem('safari-install-dismissed')
    const lastDismissed = localStorage.getItem('safari-install-dismissed-time')
    const now = Date.now()
    
    // Show again after 3 days for Safari
    if (!safariDismissed || (lastDismissed && (now - parseInt(lastDismissed)) > 3 * 24 * 60 * 60 * 1000)) {
      setTimeout(() => {
        if (!showInstallPrompt.value) {
          console.log('🍎 Showing Safari install prompt')
          showInstallPrompt.value = true
        }
      }, 5000) // Show after 5 seconds
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
  console.log('🚀 Install button clicked')
  
  // Try global function first
  if (import.meta.client && window.triggerPWAInstall) {
    try {
      const result = await window.triggerPWAInstall()
      console.log('Global install result:', result)
      
      if (result.outcome === 'accepted') {
        console.log('✅ User accepted installation')
        showInstallPrompt.value = false
      } else if (result.outcome === 'dismissed') {
        console.log('❌ User dismissed installation')
        localStorage.setItem('pwa-install-dismissed', 'true')
        localStorage.setItem('pwa-install-dismissed-time', Date.now().toString())
        showInstallPrompt.value = false
      } else if (result.outcome === 'no-prompt') {
        showManualInstructions()
      }
      
      return
    } catch (error) {
      console.error('Global install failed:', error)
    }
  }
  
  // Fallback to component-level deferredPrompt
  console.log('deferredPrompt available:', !!deferredPrompt)
  
  if (deferredPrompt) {
    try {
      console.log('📱 Showing install prompt...')
      
      // Show the prompt
      await deferredPrompt.prompt()
      console.log('Prompt shown successfully')
      
      // Wait for user choice
      const choiceResult = await deferredPrompt.userChoice
      console.log('User choice:', choiceResult)
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted installation')
        showInstallPrompt.value = false
        localStorage.removeItem('pwa-install-dismissed')
      } else {
        console.log('❌ User dismissed installation')
        localStorage.setItem('pwa-install-dismissed', 'true')
        localStorage.setItem('pwa-install-dismissed-time', Date.now().toString())
      }
      
      // Clear the prompt
      deferredPrompt = null
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

const showManualInstructions = () => {
  // Show manual install instructions
  alert(`Para instalar este app:
  
📱 No celular:
• Chrome/Edge: Menu → "Adicionar à tela inicial"
• Safari (iOS): Compartilhar → "Adicionar à Tela de Início"

💻 No computador:
• Chrome: Ícone na barra de endereços
• Edge: Menu → "Apps" → "Instalar este site como app"`)
  
  showInstallPrompt.value = false
}

const dismissInstall = () => {
  console.log('❌ Install prompt dismissed by user')
  showInstallPrompt.value = false
  
  if (isSafari.value) {
    // Remember dismissal for Safari (3 days)
    localStorage.setItem('safari-install-dismissed', 'true')
    localStorage.setItem('safari-install-dismissed-time', Date.now().toString())
  } else {
    // Remember dismissal for other browsers (7 days)
    localStorage.setItem('pwa-install-dismissed', 'true')
    localStorage.setItem('pwa-install-dismissed-time', Date.now().toString())
  }
  
  // Clear the prompt
  deferredPrompt = null
}

const showSafariInstructions = () => {
  showInstallPrompt.value = false
  
  // Show detailed Safari instructions
  alert(`📱 Como adicionar à tela inicial no Safari:

🍎 No Mac:
1. Clique no botão de compartilhar (⬆️) na barra de ferramentas
2. Selecione "Adicionar ao Dock"

📱 No iPhone/iPad:
1. Toque no botão de compartilhar (⬆️)
2. Role para baixo e toque em "Adicionar à Tela de Início"
3. Toque em "Adicionar"

✨ O app aparecerá como um ícone na sua tela inicial!`)
  
  // Remember that user saw instructions
  localStorage.setItem('safari-install-dismissed', 'true')
  localStorage.setItem('safari-install-dismissed-time', Date.now().toString())
}
</script>