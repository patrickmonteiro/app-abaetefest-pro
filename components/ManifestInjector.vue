<template>
  <div>
    <!-- Este componente injeta o manifest manualmente se necessário -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

// Função para garantir que o manifest está linkado
const ensureManifestLink = () => {
  if (!import.meta.client) return

  // Verificar se já existe um link para o manifest
  const existingLink = document.querySelector('link[rel="manifest"]')
  
  if (!existingLink) {
    console.log('🔧 Injetando link do manifest manualmente...')
    
    // Criar link para o manifest
    const manifestLink = document.createElement('link')
    manifestLink.rel = 'manifest'
    manifestLink.href = '/manifest.webmanifest'
    document.head.appendChild(manifestLink)
    
    console.log('✅ Link do manifest injetado')
  } else {
    console.log('✅ Link do manifest já existe:', existingLink.href)
  }
}

// Função para verificar se o manifest está acessível
const testManifestAccessibility = async () => {
  if (!import.meta.client) return

  try {
    console.log('🔍 Testando acessibilidade do manifest...')
    
    const response = await fetch('/manifest.webmanifest')
    
    if (response.ok) {
      const manifest = await response.json()
      console.log('✅ Manifest acessível:', manifest.name)
      
      // Verificar campos obrigatórios
      const requiredFields = ['name', 'short_name', 'start_url', 'icons']
      const missingFields = requiredFields.filter(field => !manifest[field])
      
      if (missingFields.length > 0) {
        console.warn('⚠️ Campos obrigatórios ausentes no manifest:', missingFields)
      } else {
        console.log('✅ Todos os campos obrigatórios estão presentes')
      }
      
      // Verificar ícones obrigatórios
      const hasRequired192 = manifest.icons?.some((icon: any) => icon.sizes === '192x192')
      const hasRequired512 = manifest.icons?.some((icon: any) => icon.sizes === '512x512')
      
      if (!hasRequired192 || !hasRequired512) {
        console.warn('⚠️ Ícones obrigatórios ausentes (192x192 ou 512x512)')
      } else {
        console.log('✅ Ícones obrigatórios presentes')
      }
      
    } else {
      console.error('❌ Manifest não acessível:', response.status, response.statusText)
      
      // Tentar fallback para .json
      try {
        const fallbackResponse = await fetch('/manifest.json')
        if (fallbackResponse.ok) {
          console.log('✅ Manifest .json encontrado como fallback')
        }
      } catch (error) {
        console.error('❌ Nenhum manifest encontrado (.webmanifest ou .json)')
      }
    }
  } catch (error) {
    console.error('❌ Erro ao testar manifest:', error)
  }
}

// Função para verificar ícones
const testIconsAccessibility = async () => {
  if (!import.meta.client) return

  const requiredIcons = ['192x192', '512x512']
  const optionalIcons = ['72x72', '96x96', '128x128', '144x144', '152x152', '384x384']
  
  console.log('🔍 Testando acessibilidade dos ícones...')
  
  for (const size of [...requiredIcons, ...optionalIcons]) {
    try {
      const response = await fetch(`/icon-${size}.png`)
      const isRequired = requiredIcons.includes(size)
      
      if (response.ok) {
        console.log(`✅ Ícone ${size}: OK`)
      } else {
        const message = `❌ Ícone ${size}: ${response.status}`
        if (isRequired) {
          console.error(message + ' (OBRIGATÓRIO)')
        } else {
          console.warn(message + ' (opcional)')
        }
      }
    } catch (error) {
      const message = `❌ Ícone ${size}: Erro de rede`
      if (requiredIcons.includes(size)) {
        console.error(message + ' (OBRIGATÓRIO)')
      } else {
        console.warn(message + ' (opcional)')
      }
    }
  }
}

// Função para debug completo
const runPWADiagnostics = async () => {
  if (!import.meta.client) return

  console.log('🔍 === PWA DIAGNOSTICS ===')
  
  // 1. Verificar protocolo
  console.log('Protocol:', location.protocol)
  console.log('HTTPS OK:', location.protocol === 'https:' || location.hostname === 'localhost')
  
  // 2. Verificar Service Worker
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      console.log('Service Worker:', registration ? 'Registrado' : 'Não registrado')
      
      if (registration) {
        console.log('SW State:', registration.active?.state || 'Unknown')
        console.log('SW Scope:', registration.scope)
      }
    } catch (error) {
      console.error('SW Error:', error)
    }
  } else {
    console.log('Service Worker: Não suportado')
  }
  
  // 3. Verificar se já está instalado
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                     window.navigator.standalone === true ||
                     document.referrer.includes('android-app://')
  console.log('Is Installed:', isInstalled)
  
  // 4. Verificar manifest
  await testManifestAccessibility()
  
  // 5. Verificar ícones
  await testIconsAccessibility()
  
  console.log('🔍 === FIM DIAGNOSTICS ===')
}

onMounted(async () => {
  if (!import.meta.client) return

  // Aguardar DOM estar pronto
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Garantir que o manifest está linkado
  ensureManifestLink()
  
  // Executar diagnósticos em desenvolvimento
  if (import.meta.dev || location.hostname === 'localhost') {
    await runPWADiagnostics()
  } else {
    // Em produção, apenas verificar o manifest
    await testManifestAccessibility()
  }
})

// Tornar função disponível globalmente para debug
if (import.meta.client) {
  window.runPWADiagnostics = runPWADiagnostics
}
</script>