// nuxt.config.ts - Com PWA configurado
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
    typeCheck: false
  },

  // Módulos essenciais + PWA
  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/eslint',
    '@vite-pwa/nuxt' // ← PWA Module
  ],

  // Configuração SSR
  ssr: true,
  
  // Configuração para Netlify
  nitro: {
    preset: 'netlify'
  },

  // Configuração PWA
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      cleanupOutdatedCaches: true,
      skipWaiting: true,
      clientsClaim: true
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20 // Check for updates every 20 seconds
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
      enabled: true, // Enable PWA in development
      type: 'module'
    }
  },

  // SEO básico
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

  // Configuração de fontes
  fonts: {
    families: [
      { name: 'Inter', provider: 'google' }
    ]
  }
})