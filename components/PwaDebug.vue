<template>
  <div class="card bg-base-200 shadow-lg mb-4">
    <div class="card-body">
      <h2 class="card-title">🔍 PWA Debug Info</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h3 class="font-bold mb-2">Critérios de Instalação:</h3>
          <ul class="space-y-1">
            <li :class="checks.https ? 'text-success' : 'text-error'">
              {{ checks.https ? '✅' : '❌' }} HTTPS: {{ checks.https }}
            </li>
            <li :class="checks.manifest ? 'text-success' : 'text-error'">
              {{ checks.manifest ? '✅' : '❌' }} Manifest: {{ checks.manifest }}
            </li>
            <li :class="checks.serviceWorker ? 'text-success' : 'text-error'">
              {{ checks.serviceWorker ? '✅' : '❌' }} Service Worker: {{ checks.serviceWorker }}
            </li>
            <li :class="checks.icons ? 'text-success' : 'text-error'">
              {{ checks.icons ? '✅' : '❌' }} Ícones: {{ checks.icons }}
            </li>
            <li :class="checks.notInstalled ? 'text-success' : 'text-error'">
              {{ checks.notInstalled ? '✅' : '❌' }} Não instalado: {{ checks.notInstalled }}
            </li>
          </ul>
        </div>
        
        <div>
          <h3 class="font-bold mb-2">Status Atual:</h3>
          <ul class="space-y-1">
            <li>
              <strong>Display Mode:</strong> {{ displayMode }}
            </li>
            <li>
              <strong>User Agent:</strong> {{ isMobile ? 'Mobile' : 'Desktop' }}
            </li>
            <li>
              <strong>Browser:</strong> {{ browserInfo }}
            </li>
            <li>
              <strong>Prompt Available:</strong> {{ promptAvailable ? 'Sim' : 'Não' }}
            </li>
            <li>
              <strong>Already Prompted:</strong> {{ alreadyPrompted ? 'Sim' : 'Não' }}
            </li>
          </ul>
        </div>
      </div>

      <div class="card-actions justify-end mt-4">
        <button 
          class="btn btn-sm btn-primary" 
          @click="forcePrompt"
          :disabled="!canForcePrompt"
        >
          Forçar Prompt
        </button>
        <button class="btn btn-sm btn-outline" @click="checkManifest">
          Verificar Manifest
        </button>
        <button class="btn btn-sm btn-ghost" @click="resetPrompt">
          Reset
        </button>
      </div>

      <!-- Manifest Info -->
      <div v-if="manifestData" class="mt-4 p-4 bg-base-300 rounded">
        <h4 class="font-bold mb-2">Manifest Data:</h4>
        <pre class="text-xs overflow-x-auto">{{ JSON.stringify(manifestData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const checks = ref({
  https: false,
  manifest: false,
  serviceWorker: false,
  icons: false,
  notInstalled: false
})

const promptAvailable = ref(false)
const alreadyPrompted = ref(false)
const manifestData = ref(null)
let deferredPrompt = null

const displayMode = computed(() => {
  if (!import.meta.client) return 'Unknown'
  
  if (window.matchMedia('(display-mode: standalone)').matches) return 'Standalone (PWA)'
  if (window.matchMedia('(display-mode: fullscreen)').matches) return 'Fullscreen'
  if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'Minimal UI'
  return 'Browser'
})

const isMobile = computed(() => {
  if (!mport.meta.client) return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
})

const browserInfo = computed(() => {
  if (!mport.meta.client) return 'Unknown'
  
  const ua = navigator.userAgent
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  return 'Other'
})

const canForcePrompt = computed(() => {
  return promptAvailable.value && deferredPrompt && !alreadyPrompted.value
})

onMounted(async () => {
  if (!mport.meta.client) return

  await nextTick()
  performChecks()
  setupPromptListeners()
})

const performChecks = async () => {
  // Check HTTPS
  checks.value.https = location.protocol === 'https:' || location.hostname === 'localhost'

  // Check if already installed
  checks.value.notInstalled = !window.matchMedia('(display-mode: standalone)').matches

  // Check Service Worker
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      checks.value.serviceWorker = !!registration
    } catch (e) {
      checks.value.serviceWorker = false
    }
  }

  // Check for prompt history
  alreadyPrompted.value = localStorage.getItem('pwa-install-dismissed') === 'true'

  // Check manifest
  await checkManifest()
}

const setupPromptListeners = () => {
  // Listen for install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('📱 beforeinstallprompt fired!')
    e.preventDefault()
    deferredPrompt = e
    promptAvailable.value = true
  })

  // Listen for app installed
  window.addEventListener('appinstalled', () => {
    console.log('🎉 App installed!')
    promptAvailable.value = false
    deferredPrompt = null
  })
}

const checkManifest = async () => {
  try {
    const response = await fetch('/manifest.webmanifest')
    if (response.ok) {
      manifestData.value = await response.json()
      checks.value.manifest = true
      
      // Check icons
      checks.value.icons = manifestData.value.icons && manifestData.value.icons.length > 0
    } else {
      checks.value.manifest = false
      console.error('Manifest not found or invalid')
    }
  } catch (e) {
    checks.value.manifest = false
    console.error('Error fetching manifest:', e)
  }
}

const forcePrompt = async () => {
  if (deferredPrompt) {
    console.log('🚀 Forcing install prompt...')
    deferredPrompt.prompt()
    
    const { outcome } = await deferredPrompt.userChoice
    console.log('👤 User choice:', outcome)
    
    if (outcome === 'accepted') {
      promptAvailable.value = false
    }
    
    deferredPrompt = null
  } else {
    console.log('❌ No deferred prompt available')
    alert('Prompt de instalação não disponível. Verifique os critérios PWA.')
  }
}

const resetPrompt = () => {
  localStorage.removeItem('pwa-install-dismissed')
  alreadyPrompted.value = false
  console.log('🔄 Prompt reset - recarregue a página')
}
</script>