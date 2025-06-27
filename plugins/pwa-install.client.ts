// plugins/pwa-install.client.ts - Suporte Universal para todos os navegadores
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  // Global variables
  let globalDeferredPrompt: any = null
  let browserInfo: any = {}

  // Extend Window interface
  declare global {
    interface Window {
      __pwaInstallPrompt: any
      triggerPWAInstall: () => Promise<any>
      checkPWAStatus: () => void
      __pwaInstallAvailable: boolean
    }
  }

  // Detectar navegador e suas capacidades
  const detectBrowser = () => {
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

    // Chrome (Desktop/Android)
    if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) {
      info.name = 'Chrome'
      info.supportsBeforeInstallPrompt = true
      info.supportsPWA = true
      info.installMethod = 'beforeinstallprompt'
      const match = ua.match(/Chrome\/(\d+)/)
      if (match) info.version = match[1]
    }
    // Edge
    else if (ua.includes('Edg')) {
      info.name = 'Edge'
      info.supportsBeforeInstallPrompt = true
      info.supportsPWA = true
      info.installMethod = 'beforeinstallprompt'
      const match = ua.match(/Edg\/(\d+)/)
      if (match) info.version = match[1]
    }
    // Samsung Internet
    else if (ua.includes('SamsungBrowser')) {
      info.name = 'Samsung Internet'
      info.supportsBeforeInstallPrompt = true
      info.supportsPWA = true
      info.installMethod = 'beforeinstallprompt'
      const match = ua.match(/SamsungBrowser\/(\d+)/)
      if (match) info.version = match[1]
    }
    // Safari (iOS/macOS)
    else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      info.name = 'Safari'
      info.supportsBeforeInstallPrompt = false
      info.supportsPWA = true
      info.installMethod = info.mobile ? 'ios-share' : 'macos-share'
      const match = ua.match(/Version\/(\d+)/)
      if (match) info.version = match[1]
    }
    // Firefox
    else if (ua.includes('Firefox')) {
      info.name = 'Firefox'
      info.supportsBeforeInstallPrompt = false
      info.supportsPWA = false
      info.installMethod = 'unsupported'
      const match = ua.match(/Firefox\/(\d+)/)
      if (match) info.version = match[1]
    }

    browserInfo = info
    console.log('🌐 Browser detectado:', info)
    return info
  }

  // Verificar se PWA já está instalado
  const isInstalled = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://')
  }

  // Verificar critérios PWA
  const checkPWACriteria = async () => {
    const criteria = {
      https: location.protocol === 'https:' || location.hostname === 'localhost',
      notInstalled: !isInstalled(),
      serviceWorker: false,
      manifest: false,
      manifestValid: false,
      requiredIcons: false
    }

    // Check Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        criteria.serviceWorker = !!registration
      } catch (error) {
        console.warn('SW check failed:', error)
      }
    }

    // Check Manifest
    try {
      const response = await fetch('/manifest.webmanifest')
      if (response.ok) {
        const manifest = await response.json()
        criteria.manifest = true
        criteria.manifestValid = !!(manifest.name && manifest.start_url && manifest.icons?.length > 0)
        criteria.requiredIcons = manifest.icons?.some((icon: any) => icon.sizes === '192x192') &&
                                manifest.icons?.some((icon: any) => icon.sizes === '512x512')
      }
    } catch (error) {
      console.warn('Manifest check failed:', error)
    }

    return criteria
  }

  // Função universal para mostrar prompt de instalação
  const showInstallPrompt = () => {
    const method = browserInfo.installMethod

    switch (method) {
      case 'beforeinstallprompt':
        // Chrome, Edge, Samsung Internet
        if (globalDeferredPrompt) {
          return triggerBeforeInstallPrompt()
        } else {
          return showManualInstructions()
        }

      case 'ios-share':
        // Safari iOS
        return showIOSInstructions()

      case 'macos-share':
        // Safari macOS
        return showMacOSInstructions()

      case 'unsupported':
        // Firefox, outros
        return showUnsupportedMessage()

      default:
        return showGenericInstructions()
    }
  }

  // Trigger do beforeinstallprompt (Chrome/Edge)
  const triggerBeforeInstallPrompt = async () => {
    if (!globalDeferredPrompt) {
      return { outcome: 'no-prompt' }
    }

    try {
      console.log('🚀 Triggering beforeinstallprompt...')
      await globalDeferredPrompt.prompt()
      const choiceResult = await globalDeferredPrompt.userChoice
      
      globalDeferredPrompt = null
      window.__pwaInstallPrompt = null
      window.__pwaInstallAvailable = false

      return choiceResult
    } catch (error) {
      console.error('Error triggering install:', error)
      return { outcome: 'error', error }
    }
  }

  // Instruções para iOS
  const showIOSInstructions = () => {
    const instructions = `📱 Para instalar no iPhone/iPad:

1. Toque no botão Compartilhar (⬆️) na parte inferior da tela
2. Role para baixo e toque em "Adicionar à Tela de Início"
3. Toque em "Adicionar" no canto superior direito
4. O app aparecerá na sua tela inicial!

✨ Depois disso, você pode abrir o app diretamente da tela inicial.`

    if (window.confirm(instructions + '\n\nEntendeu as instruções?')) {
      return { outcome: 'accepted' }
    }
    return { outcome: 'dismissed' }
  }

  // Instruções para macOS
  const showMacOSInstructions = () => {
    const instructions = `🖥️ Para instalar no Mac (Safari):

1. Clique no botão Compartilhar (⬆️) na barra de ferramentas
2. Selecione "Adicionar ao Dock"
3. O app aparecerá no seu Dock!

✨ Você também pode acessar em: Safari > Arquivo > Adicionar ao Dock`

    if (window.confirm(instructions + '\n\nEntendeu as instruções?')) {
      return { outcome: 'accepted' }
    }
    return { outcome: 'dismissed' }
  }

  // Instruções genéricas
  const showGenericInstructions = () => {
    const instructions = `📱 Para instalar este app:

💻 Desktop:
• Chrome: Clique no ícone de instalação na barra de endereços
• Edge: Menu (⋯) → Apps → "Instalar este site como um app"
• Safari: Compartilhar → "Adicionar ao Dock"

📱 Mobile:
• Chrome/Edge: Menu → "Adicionar à tela inicial" 
• Safari: Compartilhar → "Adicionar à Tela de Início"
• Samsung Internet: Menu → "Adicionar página à" → "Tela inicial"`

    if (window.confirm(instructions + '\n\nEntendeu as instruções?')) {
      return { outcome: 'accepted' }
    }
    return { outcome: 'dismissed' }
  }

  // Mensagem para navegadores não suportados
  const showUnsupportedMessage = () => {
    const message = `⚠️ Instalação não disponível no Firefox

O Firefox tem suporte limitado para instalação de PWAs.

💡 Para uma melhor experiência, recomendamos usar:
• Chrome
• Edge  
• Safari

Você ainda pode usar o app normalmente no navegador!`

    alert(message)
    return { outcome: 'unsupported' }
  }

  // Mostrar instruções manuais como fallback
  const showManualInstructions = () => {
    return showGenericInstructions()
  }

  // Setup inicial
  const init = async () => {
    // Detectar navegador
    detectBrowser()

    // Verificar se já está instalado
    if (isInstalled()) {
      console.log('📱 App já está instalado')
      return
    }

    // Verificar critérios PWA
    const criteria = await checkPWACriteria()
    console.log('📋 Critérios PWA:', criteria)

    // Se suporta beforeinstallprompt, aguardar evento
    if (browserInfo.supportsBeforeInstallPrompt) {
      console.log('⏳ Aguardando beforeinstallprompt...')
      
      // Timeout para detectar se o evento não vai disparar
      setTimeout(() => {
        if (!globalDeferredPrompt && !window.__pwaInstallAvailable) {
          console.log('⚠️ beforeinstallprompt não disparou, usando fallback')
          window.__pwaInstallAvailable = true
          window.dispatchEvent(new CustomEvent('pwa-install-available', {
            detail: { prompt: null, method: 'manual' }
          }))
        }
      }, 5000) // 5 segundos timeout
    } else {
      // Para navegadores sem beforeinstallprompt, marcar como disponível
      console.log('📱 Navegador sem beforeinstallprompt, usando método alternativo')
      window.__pwaInstallAvailable = true
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('pwa-install-available', {
          detail: { prompt: null, method: browserInfo.installMethod }
        }))
      }, 2000)
    }
  }

  // Event listeners
  window.addEventListener('beforeinstallprompt', (e: any) => {
    console.log('🎯 beforeinstallprompt fired!')
    e.preventDefault()
    
    globalDeferredPrompt = e
    window.__pwaInstallPrompt = e
    window.__pwaInstallAvailable = true
    
    window.dispatchEvent(new CustomEvent('pwa-install-available', {
      detail: { prompt: e, method: 'beforeinstallprompt' }
    }))
  })

  window.addEventListener('appinstalled', (e) => {
    console.log('🎉 App installed!')
    globalDeferredPrompt = null
    window.__pwaInstallPrompt = null
    window.__pwaInstallAvailable = false
    
    window.dispatchEvent(new CustomEvent('pwa-installed'))
  })

  // Global functions
  window.triggerPWAInstall = showInstallPrompt
  
  window.checkPWAStatus = async () => {
    console.log('🔍 PWA Status:')
    console.log('- Browser:', browserInfo)
    console.log('- Install available:', window.__pwaInstallAvailable)
    console.log('- Prompt available:', !!globalDeferredPrompt)
    console.log('- Is installed:', isInstalled())
    
    const criteria = await checkPWACriteria()
    console.log('- PWA Criteria:', criteria)
  }

  // Initialize
  init()
})