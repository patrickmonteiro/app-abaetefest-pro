// nuxt.config.ts - Forçar comportamento SSR
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

  // Módulos essenciais
  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/eslint'
  ],

  // FORÇAR SSR
  ssr: true,
  experimental: {
    payloadExtraction: false
  },
  
  // Configuração EXPLÍCITA para Netlify
  nitro: {
    preset: 'netlify',
    // Forçar diretórios corretos
    output: {
      dir: '.output',
      serverDir: '.output/server',
      publicDir: '.output/public'
    },
    // Garantir que é server-side
    renderer: '@nuxt/kit',
    // Log detalhado
    logLevel: 4,
    // Prerender apenas a home para garantir estrutura híbrida
    prerender: {
      routes: ['/']
    },
    // Configurações específicas Netlify
    netlify: {
      images: {
        remotePatterns: []
      }
    }
  },

  // Garantir que não é modo SPA
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'AbaetefestPro',
      meta: [
        { name: 'description', content: 'Aplicação Nuxt 3 com DaisyUI' }
      ]
    }
  },

  // Configuração de fontes
  fonts: {
    families: [
      { name: 'Inter', provider: 'google' }
    ]
  },

  // DEBUG: Verificar se está em modo correto
  hooks: {
    'build:before': () => {
      console.log('🚀 Build mode: SSR =', true)
      console.log('🎯 Nitro preset:', 'netlify')
    }
  }
})