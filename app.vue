<!-- app.vue -->
<template>
  <div>
    <!-- Garantir que o manifest está injetado -->
    <ManifestInjector />
    
    <!-- NuxtPage renderiza as páginas da pasta pages/ -->
    <NuxtPage />
    
    <!-- Componente de notificação PWA -->
    <PwaUpdateNotification />
  </div>
</template>

<script setup lang="ts">
// Configurações globais do app
useHead({
  htmlAttrs: {
    lang: 'pt-BR'
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: 'AbaetefestPro' },
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'msapplication-TileColor', content: '#3b82f6' },
    { name: 'msapplication-tap-highlight', content: 'no' }
  ],
  link: [
    // O manifest será injetado automaticamente pelo PWA module
    // Mas garantimos com o ManifestInjector como fallback
    { rel: 'apple-touch-icon', sizes: '152x152', href: '/icon-152x152.png' },
    { rel: 'apple-touch-icon', sizes: '192x192', href: '/icon-192x192.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/icon-16x16.png' },
    { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#3b82f6' }
  ]
})

useSeoMeta({
  titleTemplate: '%s | AbaetefestPro',
  description: 'Aplicação completa para gerenciamento de festivais com tecnologia PWA',
  ogDescription: 'Aplicação completa para gerenciamento de festivais com tecnologia PWA',
  ogImage: '/icon-512x512.png',
  twitterCard: 'summary_large_image'
})

// Debug PWA em desenvolvimento
if (import.meta.client && (import.meta.dev || location.hostname === 'localhost')) {
  console.log('🚀 AbaetefestPro PWA - Modo Desenvolvimento')
  console.log('Para diagnosticar PWA, execute: window.runPWADiagnostics()')
}
</script>

<style>
/* Estilos globais para PWA */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-x: hidden;
}

/* Suporte para safe areas (iOS) */
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Otimizações para PWA instalado */
@media (display-mode: standalone) {
  body {
    user-select: none; /* Evitar seleção acidental */
    -webkit-user-select: none;
    -webkit-touch-callout: none; /* Remover callout no iOS */
  }
  
  /* Esconder barra de endereços quando em fullscreen */
  html {
    height: 100vh;
    height: -webkit-fill-available;
  }
}

/* Melhorar performance em dispositivos móveis */
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

/* Loading personalizado para PWA */
.nuxt-loading-indicator {
  background: linear-gradient(90deg, #3b82f6, #1e40af);
  height: 3px;
}
</style>