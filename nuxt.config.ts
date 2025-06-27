// nuxt.config.ts - Configuração corrigida para deploy no Netlify
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
  
  // Nitro configurado para Netlify
  nitro: {
    preset: 'netlify',
    prerender: {
      routes: ['/']
    }
  },

  // Configuração PWA CORRIGIDA para Netlify
  pwa: {
    // Registro automático do manifest no Netlify
    registerWebManifestInRouteRules: true,
    
    registerType: 'autoUpdate',
    
    // Configuração específica para build estático
    filename: 'sw.js',
    
    // Workbox configurado para Netlify
    workbox: {
      globDirectory: 'dist',
      navigateFallback: '/',
      navigateFallbackDenylist: [
        /^\/sw\.js$/,
        /^\/workbox-.*\.js$/,
        /^\/manifest\.webmanifest$/,
        /^\/_nuxt\//,
        /^\/api\//,
        /^\/admin/,
        /\.map$/
      ],
      globPatterns: [
        '**/*.{js,css,html,png,svg,ico,jpg,jpeg,gif,webp,woff,woff2,ttf,eot}'
      ],
      cleanupOutdatedCaches: true,
      skipWaiting: true,
      clientsClaim: true,
      
      // Configuração específica para assets estáticos
      modifyURLPrefix: {
        '/_nuxt/': '/_nuxt/'
      },
      
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365
            },
            cacheKeyWillBeUsed: async ({ request }) => {
              return `${request.url}?v=1`
            }
          }
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
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
    
    // Manifest OTIMIZADO para produção
    manifest: {
      id: '/',
      name: 'AbaetefestPro - Festival Management',
      short_name: 'AbaetefestPro',
      description: 'Aplicação completa para gerenciamento de festivais com tecnologia PWA',
      theme_color: '#3b82f6',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait-primary',
      scope: '/',
      start_url: '/?utm_source=pwa',
      lang: 'pt-BR',
      categories: ['entertainment', 'music', 'events'],
      
      // Ícones OBRIGATÓRIOS com paths absolutos
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
      ],
      
      // Configurações adicionais para PWA
      screenshots: [
        {
          src: '/screenshot-wide.png',
          sizes: '1280x720',
          type: 'image/png',
          form_factor: 'wide'
        },
        {
          src: '/screenshot-narrow.png',
          sizes: '720x1280',
          type: 'image/png',
          form_factor: 'narrow'
        }
      ]
    },
    
    devOptions: {
      enabled: true,
      type: 'module'
    }
  },

  // Configuração app com links corretos para manifest
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
        // Manifest link será injetado automaticamente pelo PWA module
        { rel: 'apple-touch-icon', href: '/icon-152x152.png' },
        { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#3b82f6' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // Route rules para garantir que o manifest seja servido corretamente
  routeRules: {
    '/manifest.webmanifest': { 
      headers: { 
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=0, must-revalidate'
      } 
    },
    '/sw.js': { 
      headers: { 
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=0, must-revalidate'
      } 
    }
  },

  fonts: {
    families: [
      { name: 'Inter', provider: 'google' }
    ]
  }
})