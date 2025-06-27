import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // Configuração SSR
  ssr: true,
  
  // Preset para Netlify
  nitro: {
    preset: 'netlify',
    routeRules: {
      '/**': { headers: { 'cache-control': 's-maxage=60' } },
      '/api/**': { headers: { 'cache-control': 'max-age=300' } }
    }
  },
  
  // Módulos
  modules: ['@vite-pwa/nuxt', 'shadcn-nuxt'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },

  // Configuração PWA
  pwa: {
    registerType: 'autoUpdate',
    
    // Configuração do Manifest
    manifest: {
      name: 'Meu PWA SSR',
      short_name: 'PWA-SSR',
      description: 'Aplicação PWA com Server-Side Rendering',
      theme_color: '#2563eb',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      lang: 'pt-BR',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },

    // Configuração do Service Worker
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\..*\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 300
            }
          }
        }
      ]
    },

    // Meta tags
    meta: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      mobileApp: true,
      mobileAppIOS: true,
      appleStatusBarStyle: 'default',
      favicon: true,
      name: 'Meu PWA SSR',
      author: 'Seu Nome',
      description: 'Aplicação PWA com SSR usando Nuxt.js',
      theme_color: '#2563eb',
      lang: 'pt'
    }
  },

  // Configurações CSS
  css: ['~/assets/css/main.css']
})