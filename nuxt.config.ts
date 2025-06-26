// nuxt.config.ts - Versão final corrigida
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
    typeCheck: false // Desabilitar para build mais rápido
  },

  // Módulos essenciais
  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/eslint'
  ],

  // Configuração SSR
  ssr: true,
  
  // Configuração para Netlify
  nitro: {
    preset: 'netlify'
  },

  // SEO básico
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

  // Configuração DaisyUI (se necessário personalizar)
  tailwindcss: {
    config: {
      plugins: ['daisyui'],
      daisyui: {
        themes: ['light', 'dark', 'cupcake']
      }
    }
  }
})