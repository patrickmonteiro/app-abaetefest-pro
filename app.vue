<!-- app.vue -->
<template>
  <div>
    <!-- NuxtPage renderiza as páginas da pasta pages/ -->
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// Configurações globais do app
useSeoMeta({
  titleTemplate: '%s | Meu App Nuxt',
  description: 'Aplicação Nuxt 3 com DaisyUI, TypeScript, PWA e SSR'
})
</script>

<style>
/* Estilos globais aqui, se necessário */
</style>