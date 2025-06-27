<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// Configurações globais do app
useHead({
  htmlAttrs: {
    lang: 'pt-BR'
  },
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico'
    }
  ]
})

// Detectar instalação PWA
onMounted(() => {
  // Registrar service worker manualmente se necessário
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(() => {
      console.log('Service Worker está pronto!')
    })
  }
  
  // Detectar se já está instalado
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    console.log('PWA está instalado!')
  }
})
</script>