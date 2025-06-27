// nuxt.config.ts - Modo estático (SEM problemas de function)
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  
  devtools: { enabled: true },
  
  // Configuração Vite
  vite: {
    plugins: [tailwindcss()],
    css: {
      devSourcemap: false
    }
  },

  // CSS
  css: ["~/assets/app.css"],

  // TypeScript
  typescript: {
    typeCheck: false,
    strict: false
  },

  // Módulos essenciais + PWA
  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/eslint',
    '@vite-pwa/nuxt'
  ],

  // Modo estático - SEM SSR, SEM problemas de function
  ssr: false,
  target: 'static',
  
  // Nitro limpo - SEM presets problemáticos
  nitro: {
    prerender: {
      routes: ['/']
    }
  },

  // Configuração PWA (otimizada para estático)
  pwa: {
    registerType: 'autoUpdate',
    
    workbox: {
      navigateFallback: '/',
      navigateFallbackDenylist: [
        /^\/sw\.js$/,
        /^\/workbox-.*\.js$/,
        /^\/manifest\.webmanifest$/,
        /^\/_nuxt\//,
        /^\/api\//
      ],
      globPatterns: [
        '**/*.{js,css,html,png,svg,ico,jpg,jpeg,gif,webp,woff,woff2,ttf,eot}'
      ],
      cleanupOutdatedCaches: true,
      skipWaiting: true,
      clientsClaim: true,
      
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365
            }
          }
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 60 * 60 * 24 * 30
            }
          }
        },
        {
          urlPattern: /\/_nuxt\/.*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'nuxt-assets-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 365
            }
          }
        }
      ]
    },
    
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20
    },
    
    manifest: {
      name: 'AbaetefestPro',
      short_name: 'AbaetefestPro',
      description: 'Aplicação Nuxt 3 com DaisyUI e PWA',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/icons/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png'
        },
        {
          src: '/icons/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png'
        },
        {
          src: '/icons/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png'
        },
        {
          src: '/icons/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png'
        },
        {
          src: '/icons/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png'
        },
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    
    devOptions: {
      enabled: true,
      type: 'module'
    }
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'AbaetefestPro',
      meta: [
        { name: 'description', content: 'Aplicação Nuxt 3 com DaisyUI e PWA' },
        { name: 'theme-color', content: '#ffffff' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/icons/icon-152x152.png' },
        { rel: 'mask-icon', href: '/icons/safari-pinned-tab.svg', color: '#ffffff' }
      ]
    }
  },

  fonts: {
    families: [
      { name: 'Inter', provider: 'google' }
    ]
  }
})