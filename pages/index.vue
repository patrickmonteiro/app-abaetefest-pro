<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <div class="bg-white shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">AbaetefestPro</h1>
            <p class="text-gray-600">Progressive Web App Demo</p>
          </div>
          <div class="flex items-center gap-3">
            <!-- Install Status Badge -->
            <div class="badge" :class="isInstalled ? 'badge-success' : 'badge-outline'">
              {{ isInstalled ? '📱 Instalado' : '🌐 Navegador' }}
            </div>
            <!-- Manual Install Button -->
            <button 
              v-if="!isInstalled" 
              class="btn btn-primary btn-sm"
              @click="manualInstall"
            >
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
              Instalar App
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      <!-- PWA Info Card -->
      <div class="card bg-white shadow-lg">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">
            <Icon name="heroicons:device-phone-mobile" class="w-8 h-8 text-blue-600" />
            Progressive Web App
          </h2>
          
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-bold text-lg mb-3">✨ Recursos</h3>
              <ul class="space-y-2">
                <li class="flex items-center gap-2">
                  <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600" />
                  Funciona offline
                </li>
                <li class="flex items-center gap-2">
                  <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600" />
                  Instalação nativa
                </li>
                <li class="flex items-center gap-2">
                  <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600" />
                  Atualizações automáticas
                </li>
                <li class="flex items-center gap-2">
                  <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600" />
                  Notificações push
                </li>
                <li class="flex items-center gap-2">
                  <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600" />
                  Rápido e responsivo
                </li>
              </ul>
            </div>
            
            <div>
              <h3 class="font-bold text-lg mb-3">🌐 Compatibilidade</h3>
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span>Chrome/Edge</span>
                  <div class="badge badge-success">✅ Completo</div>
                </div>
                <div class="flex justify-between items-center">
                  <span>Safari iOS/macOS</span>
                  <div class="badge badge-info">📱 Manual</div>
                </div>
                <div class="flex justify-between items-center">
                  <span>Samsung Internet</span>
                  <div class="badge badge-success">✅ Completo</div>
                </div>
                <div class="flex justify-between items-center">
                  <span>Firefox</span>
                  <div class="badge badge-warning">⚠️ Limitado</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Browser Detection -->
      <div class="card bg-white shadow-lg">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <Icon name="heroicons:globe-alt" class="w-6 h-6 text-purple-600" />
            Detecção do Navegador
          </h2>
          
          <div class="grid md:grid-cols-3 gap-4">
            <div class="stat bg-base-200 rounded-lg">
              <div class="stat-title">Navegador</div>
              <div class="stat-value text-lg">{{ browserInfo.name }}</div>
              <div class="stat-desc">Versão {{ browserInfo.version }}</div>
            </div>
            
            <div class="stat bg-base-200 rounded-lg">
              <div class="stat-title">Plataforma</div>
              <div class="stat-value text-lg">
                {{ browserInfo.mobile ? '📱 Mobile' : '💻 Desktop' }}
              </div>
              <div class="stat-desc">{{ browserInfo.platform }}</div>
            </div>
            
            <div class="stat bg-base-200 rounded-lg">
              <div class="stat-title">Suporte PWA</div>
              <div class="stat-value text-lg">
                {{ browserInfo.supportsPWA ? '✅' : '❌' }}
              </div>
              <div class="stat-desc">{{ browserInfo.installMethod }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Installation Guide -->
      <div class="card bg-white shadow-lg">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <Icon name="heroicons:book-open" class="w-6 h-6 text-green-600" />
            Como Instalar
          </h2>
          
          <div class="tabs tabs-boxed mb-6">
            <a 
              v-for="method in installMethods" 
              :key="method.id"
              class="tab"
              :class="{ 'tab-active': activeMethod === method.id }"
              @click="activeMethod = method.id"
            >
              {{ method.icon }} {{ method.name }}
            </a>
          </div>
          
          <div v-for="method in installMethods" :key="method.id" class="space-y-4">
            <div v-if="activeMethod === method.id">
              <div class="alert" :class="method.alertClass">
                <Icon :name="method.iconName" class="w-6 h-6" />
                <div>
                  <h3 class="font-bold">{{ method.title }}</h3>
                  <div class="text-sm">{{ method.description }}</div>
                </div>
              </div>
              
              <div class="space-y-3">
                <div v-for="(step, index) in method.steps" :key="index" class="flex gap-3">
                  <div class="badge badge-primary">{{ index + 1 }}</div>
                  <p class="flex-1">{{ step }}</p>
                </div>
              </div>
              
              <div v-if="method.demo" class="mt-4">
                <button class="btn btn-outline btn-sm" @click="triggerDemo(method.id)">
                  {{ method.demo }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PWA Features Demo -->
      <div class="grid md:grid-cols-2 gap-6">
        <div class="card bg-white shadow-lg">
          <div class="card-body">
            <h3 class="card-title">
              <Icon name="heroicons:wifi" class="w-6 h-6 text-blue-600" />
              Status de Conexão
            </h3>
            <div class="mt-4">
              <div class="flex items-center gap-2">
                <div class="badge" :class="isOnline ? 'badge-success' : 'badge-error'">
                  {{ isOnline ? '🟢 Online' : '🔴 Offline' }}
                </div>
                <span class="text-sm text-gray-600">
                  {{ isOnline ? 'Conectado à internet' : 'Modo offline ativo' }}
                </span>
              </div>
              <p class="text-sm mt-2 text-gray-500">
                Este app funciona mesmo sem conexão à internet!
              </p>
            </div>
          </div>
        </div>
        
        <div class="card bg-white shadow-lg">
          <div class="card-body">
            <h3 class="card-title">
              <Icon name="heroicons:cog-6-tooth" class="w-6 h-6 text-purple-600" />
              Service Worker
            </h3>
            <div class="mt-4">
              <div class="flex items-center gap-2">
                <div class="badge" :class="serviceWorkerActive ? 'badge-success' : 'badge-warning'">
                  {{ serviceWorkerActive ? '✅ Ativo' : '⚠️ Inativo' }}
                </div>
                <span class="text-sm text-gray-600">
                  {{ serviceWorkerActive ? 'Cache ativo' : 'Verificando...' }}
                </span>
              </div>
              <p class="text-sm mt-2 text-gray-500">
                Permite funcionamento offline e atualizações em segundo plano.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Debug Panel (Development) -->
      <div v-if="isDev" class="card bg-gray-50 border-2 border-dashed border-gray-300">
        <div class="card-body">
          <h3 class="card-title">
            <Icon name="heroicons:bug-ant" class="w-6 h-6 text-red-600" />
            Debug Panel (Development)
          </h3>
          
          <div class="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 class="font-bold mb-2">PWA Status:</h4>
              <pre class="text-xs bg-gray-100 p-3 rounded overflow-auto">{{ JSON.stringify({
                isInstalled: isInstalled,
                installAvailable: installAvailable,
                promptAvailable: promptAvailable,
                browserSupport: browserInfo.supportsPWA,
                installMethod: browserInfo.installMethod
              }, null, 2) }}</pre>
            </div>
            
            <div>
              <h4 class="font-bold mb-2">Actions:</h4>
              <div class="space-y-2">
                <button class="btn btn-xs btn-primary w-full" @click="checkPWAStatus">
                  Check PWA Status
                </button>
                <button class="btn btn-xs btn-secondary w-full" @click="forceInstallPrompt">
                  Force Install Prompt
                </button>
                <button class="btn btn-xs btn-accent w-full" @click="clearPWAData">
                  Clear PWA Data
                </button>
                <button class="btn btn-xs btn-warning w-full" @click="testOffline">
                  Test Offline Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// SEO
useHead({
  title: 'AbaetefestPro - PWA Demo',
  meta: [
    { name: 'description', content: 'Progressive Web App demo com suporte universal para todos os navegadores' }
  ]
})

// Reactive state
const isInstalled = ref(false)
const isOnline = ref(true)
const serviceWorkerActive = ref(false)
const installAvailable = ref(false)
const promptAvailable = ref(false)
const activeMethod = ref('chrome')

const browserInfo = ref({
  name: 'Unknown',
  version: 'Unknown',
  platform: 'Unknown',
  mobile: false,
  supportsBeforeInstallPrompt: false,
  supportsPWA: false,
  installMethod: 'manual'
})

// Computed
const isDev = computed(() => {
  if (!import.meta.client) return false
  return import.meta.dev || location.hostname === 'localhost'
})

// Installation methods
const installMethods = computed(() => [
  {
    id: 'chrome',
    name: 'Chrome/Edge',
    icon: '🟢',
    iconName: 'heroicons:check-circle',
    alertClass: 'alert-success',
    title: 'Instalação Automática',
    description: 'Chrome e Edge suportam instalação automática via beforeinstallprompt',
    steps: [
      'Aguarde o banner de instalação aparecer automaticamente',
      'Clique em "Instalar" quando solicitado',
      'Ou clique no ícone de instalação na barra de endereços',
      'O app será adicionado à sua área de trabalho/tela inicial'
    ],
    demo: 'Testar Instalação Automática'
  },
  {
    id: 'safari-ios',
    name: 'Safari iOS',
    icon: '📱',
    iconName: 'heroicons:device-phone-mobile',
    alertClass: 'alert-info',
    title: 'Adicionar à Tela Inicial',
    description: 'No Safari iOS, use o botão de compartilhar para instalar',
    steps: [
      'Toque no botão Compartilhar (⬆️) na parte inferior',
      'Role para baixo na lista de opções',
      'Toque em "Adicionar à Tela de Início"',
      'Toque em "Adicionar" no canto superior direito',
      'O ícone aparecerá na sua tela inicial'
    ]
  },
  {
    id: 'safari-mac',
    name: 'Safari macOS',
    icon: '🖥️',
    iconName: 'heroicons:computer-desktop',
    alertClass: 'alert-info',
    title: 'Adicionar ao Dock',
    description: 'No Safari macOS, use o menu de compartilhar',
    steps: [
      'Clique no botão Compartilhar (⬆️) na barra de ferramentas',
      'Selecione "Adicionar ao Dock"',
      'O app aparecerá no seu Dock',
      'Alternativamente: Safari > Arquivo > Adicionar ao Dock'
    ]
  },
  {
    id: 'firefox',
    name: 'Firefox',
    icon: '⚠️',
    iconName: 'heroicons:exclamation-triangle',
    alertClass: 'alert-warning',
    title: 'Suporte Limitado',
    description: 'Firefox tem suporte limitado para instalação de PWAs',
    steps: [
      'Firefox não suporta instalação automática de PWAs',
      'Você pode criar um atalho manual na área de trabalho',
      'Use o menu > Mais ferramentas > Criar atalho',
      'Para melhor experiência, recomendamos Chrome, Edge ou Safari'
    ]
  }
])

// Functions
const detectBrowser = () => {
  if (!import.meta.client) return

  const ua = navigator.userAgent
  let info = {
    name: 'Unknown',
    version: 'Unknown',
    platform: navigator.platform,
    mobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
    supportsBeforeInstallPrompt: false,
    supportsPWA: false,
    installMethod: 'manual'
  }

  if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) {
    info.name = 'Chrome'
    info.supportsBeforeInstallPrompt = true
    info.supportsPWA = true
    info.installMethod = 'beforeinstallprompt'
    activeMethod.value = 'chrome'
    const match = ua.match(/Chrome\/(\d+)/)
    if (match) info.version = match[1]
  } else if (ua.includes('Edg')) {
    info.name = 'Edge'
    info.supportsBeforeInstallPrompt = true
    info.supportsPWA = true
    info.installMethod = 'beforeinstallprompt'
    activeMethod.value = 'chrome'
    const match = ua.match(/Edg\/(\d+)/)
    if (match) info.version = match[1]
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    info.name = 'Safari'
    info.supportsBeforeInstallPrompt = false
    info.supportsPWA = true
    info.installMethod = info.mobile ? 'ios-share' : 'macos-share'
    activeMethod.value = info.mobile ? 'safari-ios' : 'safari-mac'
    const match = ua.match(/Version\/(\d+)/)
    if (match) info.version = match[1]
  } else if (ua.includes('Firefox')) {
    info.name = 'Firefox'
    info.supportsBeforeInstallPrompt = false
    info.supportsPWA = false
    info.installMethod = 'unsupported'
    activeMethod.value = 'firefox'
    const match = ua.match(/Firefox\/(\d+)/)
    if (match) info.version = match[1]
  }

  browserInfo.value = info
}

const checkInstallationStatus = () => {
  if (!import.meta.client) return

  isInstalled.value = window.matchMedia('(display-mode: standalone)').matches ||
                     window.navigator.standalone === true ||
                     document.referrer.includes('android-app://')
}

const checkServiceWorker = async () => {
  if (!import.meta.client || !('serviceWorker' in navigator)) return

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    serviceWorkerActive.value = !!(registration && registration.active)
  } catch (error) {
    console.warn('SW check failed:', error)
    serviceWorkerActive.value = false
  }
}

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

// Action handlers
const manualInstall = async () => {
  if (import.meta.client && window.triggerPWAInstall) {
    try {
      const result = await window.triggerPWAInstall()
      console.log('Manual install result:', result)
    } catch (error) {
      console.error('Manual install failed:', error)
    }
  }
}

const triggerDemo = (methodId: string) => {
  switch (methodId) {
    case 'chrome':
      manualInstall()
      break
    default:
      alert(`Demo para ${methodId} - Esta seria a demonstração das instruções específicas do navegador.`)
  }
}

const checkPWAStatus = () => {
  if (import.meta.client && window.checkPWAStatus) {
    window.checkPWAStatus()
  }
}

const forceInstallPrompt = () => {
  // Trigger custom event to force show install prompt
  window.dispatchEvent(new CustomEvent('pwa-install-available', {
    detail: { prompt: null, method: 'manual' }
  }))
}

const clearPWAData = () => {
  if (!isDev.value) return
  
  // Clear all PWA storage
  localStorage.removeItem('pwa-install-dismissed')
  localStorage.removeItem('pwa-install-dismissed-time')
  localStorage.removeItem('safari-install-dismissed')
  localStorage.removeItem('safari-install-dismissed-time')
  
  alert('PWA data cleared! Page will reload.')
  setTimeout(() => window.location.reload(), 1000)
}

const testOffline = () => {
  alert('Para testar modo offline:\n\n1. Abra DevTools (F12)\n2. Vá para Network tab\n3. Marque "Offline"\n4. Recarregue a página\n\nO app deve continuar funcionando!')
}

// Lifecycle
onMounted(() => {
  if (!import.meta.client) return

  detectBrowser()
  checkInstallationStatus()
  checkServiceWorker()
  updateOnlineStatus()

  // Listen for online/offline events
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  // Listen for PWA events
  window.addEventListener('pwa-install-available', () => {
    installAvailable.value = true
  })

  window.addEventListener('pwa-installed', () => {
    isInstalled.value = true
    installAvailable.value = false
  })
})

onUnmounted(() => {
  if (!import.meta.client) return

  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>