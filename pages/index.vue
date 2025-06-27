<template>
  <div class="min-h-screen bg-base-100">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary mb-4">
          AbaetefestPro
        </h1>
        <p class="text-lg text-base-content/70">
          Aplicação PWA com Nuxt 3 + DaisyUI
        </p>
      </div>

      <!-- PWA Debug (remover em produção) -->
      <PWADebug />

      <!-- PWA Deep Debug -->
      <PWADeepDebug />

      <!-- PWA Status Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div class="card bg-base-200 shadow-lg">
          <div class="card-body">
            <h2 class="card-title">
              <Icon name="heroicons:device-phone-mobile" class="h-6 w-6" />
              PWA Status
            </h2>
            <p class="text-sm">{{ pwaStatus }}</p>
            <div class="card-actions justify-end">
              <div class="badge badge-primary">{{ isOnline ? 'Online' : 'Offline' }}</div>
            </div>
          </div>
        </div>

        <div class="card bg-base-200 shadow-lg">
          <div class="card-body">
            <h2 class="card-title">
              <Icon name="heroicons:wifi" class="h-6 w-6" />
              Conexão
            </h2>
            <p class="text-sm">{{ networkStatus }}</p>
            <div class="card-actions justify-end">
              <div :class="connectionClass">{{ connectionType }}</div>
            </div>
          </div>
        </div>

        <div class="card bg-base-200 shadow-lg">
          <div class="card-body">
            <h2 class="card-title">
              <Icon name="heroicons:cog-6-tooth" class="h-6 w-6" />
              Service Worker
            </h2>
            <p class="text-sm">{{ swStatus }}</p>
            <div class="card-actions justify-end">
              <div :class="swClass">{{ swState }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="text-center">
        <button 
          class="btn btn-primary btn-lg mr-4" 
          @click="checkForUpdates"
          :disabled="loading"
        >
          <Icon v-if="loading" name="heroicons:arrow-path" class="h-5 w-5 animate-spin" />
          <Icon v-else name="heroicons:arrow-path" class="h-5 w-5" />
          Verificar Atualizações
        </button>
        
        <button class="btn btn-outline btn-lg mr-4" @click="showPWAInfo">
          <Icon name="heroicons:information-circle" class="h-5 w-5" />
          Info PWA
        </button>

        <button class="btn btn-secondary btn-lg" @click="debugInstall">
          <Icon name="heroicons:wrench-screwdriver" class="h-5 w-5" />
          Debug Install
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const isOnline = ref(true)
const loading = ref(false)
const serviceWorkerRegistration = ref(null)

const pwaStatus = computed(() => {
  if (import.meta.client) {
    return window.matchMedia('(display-mode: standalone)').matches 
      ? 'Instalado como PWA' 
      : 'Executando no navegador'
  }
  return 'Verificando...'
})

const networkStatus = computed(() => {
  if (!import.meta.client) return 'Verificando...'
  return isOnline.value ? 'Conectado à internet' : 'Modo offline'
})

const connectionType = computed(() => {
  if (!import.meta.client) return 'Unknown'
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  return connection ? connection.effectiveType || 'Unknown' : 'Unknown'
})

const connectionClass = computed(() => {
  const type = connectionType.value
  return {
    'badge badge-success': type === '4g',
    'badge badge-warning': type === '3g',
    'badge badge-error': type === '2g' || type === 'slow-2g',
    'badge badge-ghost': type === 'Unknown'
  }
})

const swStatus = computed(() => {
  if (!serviceWorkerRegistration.value) return 'Não instalado'
  return 'Ativo e funcionando'
})

const swState = computed(() => {
  return serviceWorkerRegistration.value ? 'Ativo' : 'Inativo'
})

const swClass = computed(() => {
  return serviceWorkerRegistration.value 
    ? 'badge badge-success' 
    : 'badge badge-error'
})

onMounted(() => {
  // Monitor online/offline status
  if (import.meta.client) {
    isOnline.value = navigator.onLine
    
    window.addEventListener('online', () => {
      isOnline.value = true
    })
    
    window.addEventListener('offline', () => {
      isOnline.value = false
    })

    // Check for service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        serviceWorkerRegistration.value = registration
      })
    }
  }
})

const checkForUpdates = async () => {
  loading.value = true
  
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      await registration.update()
      
      // Show success message
      // You can add a toast notification here
      console.log('Verificação de atualização concluída')
    }
  } catch (error) {
    console.error('Erro ao verificar atualizações:', error)
  } finally {
    loading.value = false
  }
}

const showPWAInfo = () => {
  // You can add a modal with PWA information here
  alert(`
PWA Info:
- Status: ${pwaStatus.value}
- Online: ${isOnline.value ? 'Sim' : 'Não'}
- Service Worker: ${swState.value}
- Conexão: ${connectionType.value}
  `)
}

const debugInstall = () => {
  if (import.meta.client && window.checkPWAStatus) {
    window.checkPWAStatus()
  }
  
  if (import.meta.client && window.triggerPWAInstall) {
    console.log('🧪 Testing manual install trigger...')
    window.triggerPWAInstall().then((result: any) => {
      console.log('Manual install result:', result)
      alert(`Install result: ${JSON.stringify(result, null, 2)}`)
    })
  } else {
    alert('PWA install functions not available')
  }
}

// SEO
useHead({
  title: 'AbaetefestPro - PWA with Nuxt 3',
  meta: [
    { name: 'description', content: 'Progressive Web App desenvolvida com Nuxt 3 e DaisyUI' },
    { property: 'og:title', content: 'AbaetefestPro PWA' },
    { property: 'og:description', content: 'Progressive Web App desenvolvida com Nuxt 3 e DaisyUI' },
    { property: 'og:type', content: 'website' }
  ]
})
</script>