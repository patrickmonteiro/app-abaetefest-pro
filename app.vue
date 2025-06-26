<!-- app.vue -->
<template>
  <div>
    <!-- NuxtPage renderiza as páginas da pasta pages/ -->
    <NuxtPage />
    <PwaUpdateNotification />
  </div>
</template>

<script setup lang="ts">
// Configurações globais do app
// PWA Meta tags e configurações adicionais
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'format-detection', content: 'telephone=no' }
  ]
})

useSeoMeta({
  titleTemplate: '%s | Meu App Nuxt',
  description: 'Aplicação Nuxt 3 com DaisyUI, TypeScript, PWA e SSR'
})
</script>

<style>
/* Estilos globais aqui, se necessário */
</style>