// plugins/pwa-install.client.ts
export default defineNuxtPlugin(() => {
  // Global variable to store the prompt
  let globalDeferredPrompt: any = null
  
  if (import.meta.client) {
    // Extend Window interface
    declare global {
      interface Window {
        __pwaInstallPrompt: any
        triggerPWAInstall: () => Promise<any>
        checkPWAStatus: () => void
      }
    }

    // Debug PWA installation requirements
    const logPWARequirements = () => {
      console.log('🔍 Verificando requisitos PWA:')
      console.log('- HTTPS/localhost:', location.protocol === 'https:' || location.hostname === 'localhost')
      console.log('- Service Worker:', 'serviceWorker' in navigator)
      console.log('- Not standalone:', !window.matchMedia('(display-mode: standalone)').matches)
      console.log('- User agent:', navigator.userAgent)
      
      // Check manifest
      fetch('/manifest.webmanifest')
        .then(response => response.json())
        .then(manifest => {
          console.log('- Manifest válido:', !!manifest.name && !!manifest.start_url)
          console.log('- Manifest icons:', manifest.icons?.length || 0)
          console.log('- Required icons (192x192):', manifest.icons?.some((icon: any) => icon.sizes === '192x192'))
          console.log('- Required icons (512x512):', manifest.icons?.some((icon: any) => icon.sizes === '512x512'))
        })
        .catch(error => {
          console.error('- Manifest error:', error)
        })
    }

    // Log requirements on load
    logPWARequirements()

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e: any) => {
      console.log('🎯 beforeinstallprompt event fired!')
      console.log('Event details:', e)
      
      // Track that it fired
      sessionStorage.setItem('beforeinstallprompt-fired', 'true')
      sessionStorage.setItem('beforeinstallprompt-time', Date.now().toString())
      
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      
      // Stash the event so it can be triggered later
      globalDeferredPrompt = e
      
      // Make it available globally
      window.__pwaInstallPrompt = e
      
      // Dispatch custom event for components to listen
      window.dispatchEvent(new CustomEvent('pwa-install-available', {
        detail: { prompt: e }
      }))
      
      console.log('✅ Install prompt saved and ready')
    })

    // Listen for app installed
    window.addEventListener('appinstalled', (e) => {
      console.log('🎉 PWA was installed successfully!')
      console.log('Install event:', e)
      
      // Clear the prompt
      globalDeferredPrompt = null
      window.__pwaInstallPrompt = null
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('pwa-installed'))
      
      // Clean up localStorage
      localStorage.removeItem('pwa-install-dismissed')
      localStorage.removeItem('pwa-install-dismissed-time')
      localStorage.removeItem('safari-install-dismissed')
      localStorage.removeItem('safari-install-dismissed-time')
    })

    // Helper function to trigger install
    window.triggerPWAInstall = async () => {
      const prompt = globalDeferredPrompt || window.__pwaInstallPrompt
      
      console.log('🚀 Attempting to trigger PWA install...')
      console.log('Prompt available:', !!prompt)
      
      if (prompt) {
        try {
          console.log('📱 Showing install prompt...')
          
          // Show the prompt
          const promptResult = await prompt.prompt()
          console.log('Prompt result:', promptResult)
          
          // Wait for user choice
          const choiceResult = await prompt.userChoice
          console.log('User choice result:', choiceResult)
          
          // Clear the prompt regardless of outcome
          globalDeferredPrompt = null
          window.__pwaInstallPrompt = null
          
          // Track user choice
          if (choiceResult.outcome === 'accepted') {
            console.log('✅ User accepted installation')
            localStorage.removeItem('pwa-install-dismissed')
          } else {
            console.log('❌ User dismissed installation')
            localStorage.setItem('pwa-install-dismissed', 'true')
            localStorage.setItem('pwa-install-dismissed-time', Date.now().toString())
          }
          
          return choiceResult
        } catch (error) {
          console.error('Error triggering install:', error)
          return { outcome: 'error', error }
        }
      } else {
        console.warn('❌ No install prompt available')
        console.log('Possible reasons:')
        console.log('- App already installed')
        console.log('- Not meeting PWA criteria')
        console.log('- User previously dismissed')
        console.log('- Browser doesn\'t support beforeinstallprompt')
        
        return { outcome: 'no-prompt' }
      }
    }

    // Debug helper
    window.checkPWAStatus = () => {
      console.log('🔍 PWA Status Check:')
      console.log('- Install prompt available:', !!globalDeferredPrompt)
      console.log('- Is standalone:', window.matchMedia('(display-mode: standalone)').matches)
      console.log('- Is HTTPS:', location.protocol === 'https:')
      console.log('- User agent:', navigator.userAgent)
      console.log('- Service Worker:', 'serviceWorker' in navigator ? 'Available' : 'Not available')
      console.log('- beforeinstallprompt fired this session:', !!sessionStorage.getItem('beforeinstallprompt-fired'))
      
      // Check dismissal status
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      const dismissedTime = localStorage.getItem('pwa-install-dismissed-time')
      if (dismissed && dismissedTime) {
        const daysSince = Math.floor((Date.now() - parseInt(dismissedTime)) / (24 * 60 * 60 * 1000))
        console.log(`- Previously dismissed ${daysSince} days ago`)
      }
      
      logPWARequirements()
    }

    // Enhanced detection for different browsers
    const detectBrowserSupport = () => {
      const ua = navigator.userAgent
      let browserInfo = {
        name: 'Unknown',
        version: 'Unknown',
        supportsPWA: false,
        supportsBeforeInstallPrompt: false
      }

      if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) {
        browserInfo.name = 'Chrome'
        browserInfo.supportsPWA = true
        browserInfo.supportsBeforeInstallPrompt = true
        const match = ua.match(/Chrome\/(\d+)/)
        if (match) browserInfo.version = match[1]
      } else if (ua.includes('Edg')) {
        browserInfo.name = 'Edge'
        browserInfo.supportsPWA = true
        browserInfo.supportsBeforeInstallPrompt = true
        const match = ua.match(/Edg\/(\d+)/)
        if (match) browserInfo.version = match[1]
      } else if (ua.includes('Firefox')) {
        browserInfo.name = 'Firefox'
        browserInfo.supportsPWA = false
        browserInfo.supportsBeforeInstallPrompt = false
        const match = ua.match(/Firefox\/(\d+)/)
        if (match) browserInfo.version = match[1]
      } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
        browserInfo.name = 'Safari'
        browserInfo.supportsPWA = true // Safari supports PWA but not beforeinstallprompt
        browserInfo.supportsBeforeInstallPrompt = false
        const match = ua.match(/Version\/(\d+)/)
        if (match) browserInfo.version = match[1]
      }

      console.log('🌐 Browser Detection:', browserInfo)
      return browserInfo
    }

    // Run browser detection
    detectBrowserSupport()

    // Wait for DOM to be ready, then check requirements
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(logPWARequirements, 1000)
      })
    } else {
      setTimeout(logPWARequirements, 1000)
    }
  }
})