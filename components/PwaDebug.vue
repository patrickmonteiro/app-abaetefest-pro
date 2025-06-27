<template>
  <div class="card bg-error text-error-content shadow-lg mb-4">
    <div class="card-body">
      <h2 class="card-title">🔍 PWA Deep Debug</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <!-- Basic Checks -->
        <div class="bg-base-100 text-base-content p-4 rounded">
          <h3 class="font-bold mb-2">✅ Critérios Básicos:</h3>
          <ul class="space-y-1">
            <li :class="basicChecks.https ? 'text-success' : 'text-error'">
              {{ basicChecks.https ? '✅' : '❌' }} HTTPS/Localhost
            </li>
            <li :class="basicChecks.notInstalled ? 'text-success' : 'text-error'">
              {{ basicChecks.notInstalled ? '✅' : '❌' }} Não instalado
            </li>
            <li :class="basicChecks.serviceWorker ? 'text-success' : 'text-error'">
              {{ basicChecks.serviceWorker ? '✅' : '❌' }} Service Worker
            </li>
            <li :class="basicChecks.manifest ? 'text-success' : 'text-error'">
              {{ basicChecks.manifest ? '✅' : '❌' }} Manifest válido
            </li>
          </ul>
        </div>

        <!-- Browser Info -->
        <div class="bg-base-100 text-base-content p-4 rounded">
          <h3 class="font-bold mb-2">🌐 Navegador:</h3>
          <ul class="space-y-1">
            <li><strong>Browser:</strong> {{ browserInfo.name }}</li>
            <li><strong>Version:</strong> {{ browserInfo.version }}</li>
            <li><strong>Platform:</strong> {{ browserInfo.platform }}</li>
            <li><strong>Supports PWA:</strong> {{ browserInfo.supportsPWA ? 'Sim' : 'Não' }}</li>
          </ul>
        </div>

        <!-- Manifest Details -->
        <div class="bg-base-100 text-base-content p-4 rounded">
          <h3 class="font-bold mb-2">📄 Manifest:</h3>
          <div v-if="manifestInfo.loaded">
            <ul class="space-y-1">
              <li><strong>Name:</strong> {{ manifestInfo.data?.name || 'N/A' }}</li>
              <li><strong>Start URL:</strong> {{ manifestInfo.data?.start_url || 'N/A' }}</li>
              <li><strong>Display:</strong> {{ manifestInfo.data?.display || 'N/A' }}</li>
              <li><strong>Icons:</strong> {{ manifestInfo.data?.icons?.length || 0 }}</li>
            </ul>
          </div>
          <div v-else class="text-error">
            ❌ Manifest não carregado
          </div>
        </div>

        <!-- Install Criteria -->
        <div class="bg-base-100 text-base-content p-4 rounded">
          <h3 class="font-bold mb-2">🎯 Critérios de Instalação:</h3>
          <ul class="space-y-1">
            <li :class="installCriteria.hasMinimumIcons ? 'text-success' : 'text-error'">
              {{ installCriteria.hasMinimumIcons ? '✅' : '❌' }} Ícones 192x192 + 512x512
            </li>
            <li :class="installCriteria.hasValidStartUrl ? 'text-success' : 'text-error'">
              {{ installCriteria.hasValidStartUrl ? '✅' : '❌' }} Start URL válida
            </li>
            <li :class="installCriteria.hasValidDisplay ? 'text-success' : 'text-error'">
              {{ installCriteria.hasValidDisplay ? '✅' : '❌' }} Display standalone
            </li>
            <li :class="installCriteria.hasValidName ? 'text-success' : 'text-error'">
              {{ installCriteria.hasValidName ? '✅' : '❌' }} Nome válido
            </li>
          </ul>
        </div>
      </div>

      <!-- Actions -->
      <div class="card-actions justify-end mt-4">
        <button class="btn btn-sm btn-primary" @click="checkAll">
          🔄 Verificar Tudo
        </button>
        <button class="btn btn-sm btn-secondary" @click="downloadManifest">
          📥 Baixar Manifest
        </button>
        <button class="btn btn-sm btn-accent" @click="forceRefresh">
          🔄 Recarregar
        </button>
      </div>

      <!-- Detailed Logs -->
      <div v-if="detailedLogs.length > 0" class="mt-4">
        <h4 class="font-bold mb-2">📝 Logs Detalhados:</h4>
        <div class="bg-base-300 p-4 rounded max-h-40 overflow-y-auto">
          <pre class="text-xs">{{ detailedLogs.join('\n') }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const basicChecks = ref({
  https: false,
  notInstalled: false,
  serviceWorker: false,
  manifest: false
})

const manifestInfo = ref({
  loaded: false,
  data: null,
  error: null
})

const browserInfo = ref({
  name: 'Unknown',
  version: 'Unknown',
  platform: 'Unknown',
  supportsPWA: false
})

const detailedLogs = ref([])

const installCriteria = computed(() => {
  const manifest = manifestInfo.value.data
  return {
    hasMinimumIcons: manifest?.icons?.some(icon => 
      icon.sizes === '192x192' || icon.sizes === '512x512'
    ) || false,
    hasValidStartUrl: !!manifest?.start_url,
    hasValidDisplay: manifest?.display === 'standalone',
    hasValidName: !!(manifest?.name || manifest?.short_name)
  }
})

const log = (message) => {
  console.log(message)
  detailedLogs.value.push(`${new Date().toLocaleTimeString()}: ${message}`)
}

onMounted(() => {
  if (import.meta.client) {
    // Track page load time
    sessionStorage.setItem('page-load-time', Date.now().toString())
    
    checkAll()
    detectBrowser()
  }
})

const checkAll = async () => {
  log('🔍 Iniciando verificação completa...')
  
  // Check HTTPS
  basicChecks.value.https = location.protocol === 'https:' || location.hostname === 'localhost'
  log(`HTTPS: ${basicChecks.value.https}`)

  // Check if installed
  basicChecks.value.notInstalled = !window.matchMedia('(display-mode: standalone)').matches
  log(`Not installed: ${basicChecks.value.notInstalled}`)

  // Check Service Worker
  await checkServiceWorker()

  // Check Manifest
  await checkManifest()

  // Check if beforeinstallprompt was already fired
  const promptFired = sessionStorage.getItem('beforeinstallprompt-fired')
  log(`beforeinstallprompt already fired this session: ${!!promptFired}`)
  
  // Check user engagement heuristics
  const now = Date.now()
  const pageLoadTime = parseInt(sessionStorage.getItem('page-load-time') || now.toString())
  const timeOnPage = now - pageLoadTime
  log(`Time on page: ${Math.round(timeOnPage / 1000)}s`)
  
  // Chrome requirements check
  if (browserInfo.value.name === 'Chrome') {
    log('🔍 Verificando critérios específicos do Chrome:')
    log(`- Versão Chrome: ${browserInfo.value.version} (mín: 68)`)
    log(`- Tempo na página: ${Math.round(timeOnPage / 1000)}s (mín: 30s para alguns casos)`)
    log(`- User gesture required: true`)
    
    // Check if user has already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    const dismissedTime = localStorage.getItem('pwa-install-dismissed-time')
    if (dismissed) {
      const daysSinceDismissed = dismissedTime ? Math.floor((now - parseInt(dismissedTime)) / (24 * 60 * 60 * 1000)) : 0
      log(`- Usuário rejeitou há ${daysSinceDismissed} dias`)
    }
  }

  log('✅ Verificação completa finalizada')
}

const checkServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      basicChecks.value.serviceWorker = !!registration
      log(`Service Worker: ${!!registration ? 'Registrado' : 'Não registrado'}`)
      
      if (registration) {
        log(`SW State: ${registration.active?.state || 'Unknown'}`)
        log(`SW Scope: ${registration.scope}`)
      }
    } catch (error) {
      log(`Erro verificando SW: ${error.message}`)
      basicChecks.value.serviceWorker = false
    }
  } else {
    log('Service Worker não suportado')
    basicChecks.value.serviceWorker = false
  }
}

const checkManifest = async () => {
  try {
    log('📄 Carregando manifest...')
    const response = await fetch('/manifest.webmanifest')
    
    if (response.ok) {
      const data = await response.json()
      manifestInfo.value = {
        loaded: true,
        data,
        error: null
      }
      basicChecks.value.manifest = true
      log('✅ Manifest carregado com sucesso')
      log(`Manifest icons: ${data.icons?.length || 0}`)
      log(`Manifest display: ${data.display}`)
      log(`Manifest start_url: ${data.start_url}`)
    } else {
      throw new Error(`HTTP ${response.status}`)
    }
  } catch (error) {
    log(`❌ Erro carregando manifest: ${error.message}`)
    manifestInfo.value = {
      loaded: false,
      data: null,
      error: error.message
    }
    basicChecks.value.manifest = false
  }
}

const detectBrowser = () => {
  const ua = navigator.userAgent
  let name = 'Unknown'
  let version = 'Unknown'
  let supportsPWA = false

  // Mais específico para Chrome no Mac
  if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) {
    name = 'Chrome'
    supportsPWA = true
    const match = ua.match(/Chrome\/(\d+)/)
    if (match) version = match[1]
  } else if (ua.includes('Edg')) {
    name = 'Edge'
    supportsPWA = true
    const match = ua.match(/Edg\/(\d+)/)
    if (match) version = match[1]
  } else if (ua.includes('Firefox')) {
    name = 'Firefox'
    supportsPWA = false // Firefox não suporta bem
    const match = ua.match(/Firefox\/(\d+)/)
    if (match) version = match[1]
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    name = 'Safari'
    supportsPWA = false
    const match = ua.match(/Version\/(\d+)/)
    if (match) version = match[1]
  }

  browserInfo.value = {
    name,
    version,
    platform: navigator.platform,
    supportsPWA
  }

  log(`User Agent: ${ua}`)
  log(`Browser: ${name} ${version} (PWA beforeinstallprompt: ${supportsPWA})`)
  
  if (name === 'Chrome' && !supportsPWA) {
    log('⚠️ Chrome detectado mas sem suporte PWA - verificar critérios')
  }
}

const downloadManifest = async () => {
  try {
    const response = await fetch('/manifest.webmanifest')
    const text = await response.text()
    
    const blob = new Blob([text], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = 'manifest.webmanifest'
    a.click()
    
    URL.revokeObjectURL(url)
    log('📥 Manifest baixado')
  } catch (error) {
    log(`❌ Erro baixando manifest: ${error.message}`)
  }
}

const forceRefresh = () => {
  window.location.reload()
}
</script>