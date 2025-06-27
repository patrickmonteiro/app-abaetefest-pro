// nuxt.config.ts - Configuração PWA corrigida
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

  // Modo estático
  ssr: false,
  
  // Nitro para geração estática
  nitro: {
    prerender: {
      routes: ['/']
    }
  },

  // Configuração PWA CORRIGIDA
  pwa: {
    registerType: 'autoUpdate',
    
    // Workbox configurado corretamente
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
    
    // Manifest CORRIGIDO com todos os campos obrigatórios
    manifest: {
      name: 'AbaetefestPro - Festival Management',
      short_name: 'AbaetefestPro',
      description: 'Aplicação completa para gerenciamento de festivais com tecnologia PWA',
      theme_color: '#3b82f6',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      lang: 'pt-BR',
      categories: ['entertainment', 'music', 'events'],
      
      // Ícones OBRIGATÓRIOS - você precisa criar estes arquivos
      icons: [
        {
          src: '/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
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
        { name: 'description', content: 'Aplicação completa para gerenciamento de festivais' },
        { name: 'theme-color', content: '#3b82f6' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'AbaetefestPro' },
        { name: 'msapplication-TileColor', content: '#3b82f6' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/icon-152x152.png' },
        { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#3b82f6' }
      ]
    }
  },

  fonts: {
    families: [
      { name: 'Inter', provider: 'google' }
    ]
  }
})