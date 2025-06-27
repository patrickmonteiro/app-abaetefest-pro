// plugins/pwa-error-handler.client.ts
export default defineNuxtPlugin(() => {
  // Handle unhandled promise rejections (SW errors)
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason
    
    // Check if it's a SW related error
    if (error && typeof error === 'object') {
      const errorStr = error.toString()
      
      // SW preload errors - não são críticos
      if (errorStr.includes('non-preached-url') || 
          errorStr.includes('workbox') ||
          errorStr.includes('sw.js')) {
        console.warn('SW Warning (non-critical):', error)
        event.preventDefault() // Prevent showing in console as error
        return
      }
    }
    
    // For other errors, let them bubble up
    console.error('Unhandled promise rejection:', error)
  })

  // Enhanced SW registration with error handling
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('✅ SW registered successfully')
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 New SW version available')
              // You can trigger update notification here
            }
          })
        }
      })
    }).catch((error) => {
      console.warn('SW registration failed (non-critical):', error)
    })
  }
})