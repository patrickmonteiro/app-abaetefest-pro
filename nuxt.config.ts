// nuxt.config.ts - Configuração minimalista para Netlify SSR
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  
  devtools: { enabled: true },
  
  vite: {
    plugins: [tailwindcss()],
    css: {
      devSourcemap: false
    }
  },

  css: ["~/assets/app.css"],

  typescript: {
    typeCheck: false,
    strict: false
  },

  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/eslint',
    '@vite-pwa/nuxt'
  ],

  ssr: true,
  
  // Configuração mínima e estável
  nitro: {
    preset: 'netlify',
    // Apenas o essencial
    publicAssets: [
      {
        baseURL: '/',
        dir: 'public'
      }
    ]
    // SEM configurações de rollup que podem causar problemas
  },

  // PWA configuração conservadora
  pwa: {
    registerType: 'autoUpdate',
    
    workbox: {
      globPatterns: [
        '**/*.{js,css,html,png,svg,ico,jpg,jpeg,gif,webp,woff,woff2,ttf,eot}'
      ],
      cleanupOutdatedCaches: true,
      skipWaiting: true,
      clientsClaim: true
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