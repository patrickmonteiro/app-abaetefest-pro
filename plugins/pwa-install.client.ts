// plugins/pwa-install.client.ts
export default defineNuxtPlugin(() => {
  // Global variable to store the prompt
  let globalDeferredPrompt: any = null
  
  // Make it available globally
  if (import.meta.client) {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e: any) => {
      console.log('🎯 beforeinstallprompt event fired!')
      
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
      
      // Clear the prompt
      globalDeferredPrompt = null
      window.__pwaInstallPrompt = null
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('pwa-installed'))
      
      // Clean up localStorage
      localStorage.removeItem('pwa-install-dismissed')
      localStorage.removeItem('pwa-install-dismissed-time')
    })

    // Helper function to trigger install
    window.triggerPWAInstall = async () => {
      const prompt = globalDeferredPrompt || window.__pwaInstallPrompt
      
      if (prompt) {
        try {
          console.log('🚀 Triggering PWA install...')
          
          await prompt.prompt()
          console.log('Prompt triggered successfully')
          
          const choiceResult = await prompt.userChoice
          console.log('User choice result:', choiceResult)
          
          // Clear the prompt regardless of outcome
          globalDeferredPrompt = null
          window.__pwaInstallPrompt = null
          
          return choiceResult
        } catch (error) {
          console.error('Error triggering install:', error)
          return { outcome: 'error', error }
        }
      } else {
        console.warn('No install prompt available')
        return { outcome: 'no-prompt' }
      }
    }

    // Debug helper
    window.checkPWAStatus = () => {
      console.log('PWA Status Check:')
      console.log('- Install prompt available:', !!globalDeferredPrompt)
      console.log('- Is standalone:', window.matchMedia('(display-mode: standalone)').matches)
      console.log('- Is HTTPS:', location.protocol === 'https:')
      console.log('- User agent:', navigator.userAgent)
      console.log('- Service Worker:', 'serviceWorker' in navigator ? 'Available' : 'Not available')
    }
  }
})