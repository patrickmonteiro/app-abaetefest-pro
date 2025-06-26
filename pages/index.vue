<!-- pages/index.vue -->
<template>
  <div class="min-h-screen bg-base-200">
    <div class="navbar bg-primary text-primary-content">
      <div class="flex-1">
        <a class="btn btn-ghost normal-case text-xl">App AbaetefestPro</a>
      </div>
    </div>

    <div class="hero min-h-screen">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1 class="text-5xl font-bold">Funcionando! 🚀</h1>
          <p class="py-6">Nuxt 3 + DaisyUI + TypeScript está configurado e rodando perfeitamente!</p>
          
          <div class="flex gap-2 justify-center">
            <button class="btn btn-primary">Primary</button>
            <button class="btn btn-secondary">Secondary</button>
            <button class="btn btn-accent">Accent</button>
          </div>
          
          <div class="mt-4">
            <div class="alert alert-success">
              <span>✅ Setup completo com sucesso!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Configurações da página
// definePageMeta({
//   title: 'Home',
//   description: 'Página inicial do meu app Nuxt'
// })

// SEO
useSeoMeta({
  title: 'Meu App Nuxt',
  ogTitle: 'Meu App Nuxt',
  description: 'Aplicação Nuxt 3 com DaisyUI, TypeScript, PWA e SSR',
  ogDescription: 'Aplicação Nuxt 3 com DaisyUI, TypeScript, PWA e SSR',
})
</script>