<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Bem-vindo ao PWA SSR</h1>
    
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Status da Conexão -->
      <div class="bg-white p-4 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-2">Status da Conexão</h2>
        <p :class="isOnline ? 'text-green-600' : 'text-red-600'">
          {{ isOnline ? '🟢 Online' : '🔴 Offline' }}
        </p>
      </div>

      <!-- Dados do Servidor -->
      <div class="bg-white p-4 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-2">Dados SSR</h2>
        <p>Renderizado em: {{ renderTime }}</p>
        <p>User Agent: {{ userAgent?.slice(0, 50) }}...</p>
      </div>

      <!-- Lista de Posts -->
      <div class="bg-white p-4 rounded-lg shadow md:col-span-2">
        <h2 class="text-xl font-semibold mb-4">Posts (Cache API)</h2>
        <div v-if="pending" class="text-gray-500">Carregando...</div>
        <div v-else-if="error" class="text-red-500">Erro ao carregar</div>
        <div v-else class="space-y-2">
          <div
            v-for="post in posts?.slice(0, 5)"
            :key="post.id"
            class="border-l-4 border-blue-500 pl-3"
          >
            <h3 class="font-medium">{{ post.title }}</h3>
            <p class="text-gray-600 text-sm">{{ post.body.slice(0, 100) }}...</p>
          </div>
        </div>
        <button
          @click="refresh()"
          class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Atualizar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Meta tags para SEO
useHead({
  title: 'Home - PWA SSR',
  meta: [
    { name: 'description', content: 'Página inicial do PWA com SSR' }
  ]
})

// Status online/offline
const isOnline = ref(true)

// Dados renderizados no servidor
const renderTime = new Date().toLocaleString('pt-BR')
const userAgent = process.server ? useRequestHeaders()['user-agent'] : navigator?.userAgent

// Dados da API com cache
const { data: posts, pending, error, refresh } = await useFetch('https://jsonplaceholder.typicode.com/posts')

onMounted(() => {
  // Monitorar status da conexão
  isOnline.value = navigator.onLine
  
  window.addEventListener('online', () => {
    isOnline.value = true
  })
  
  window.addEventListener('offline', () => {
    isOnline.value = false
  })
})
</script>