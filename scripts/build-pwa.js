// scripts/build-pwa.js - Script para garantir build PWA correto
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando build PWA customizado...');

// Função para verificar se arquivo existe
const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

// Função para copiar arquivo
const copyFile = (src, dest) => {
  if (fileExists(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copiado: ${src} → ${dest}`);
    return true;
  }
  console.warn(`⚠️ Arquivo não encontrado: ${src}`);
  return false;
};

// Função para criar arquivo se não existir
const ensureFile = (filePath, content) => {
  if (!fileExists(filePath)) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content);
    console.log(`✅ Criado: ${filePath}`);
    return true;
  }
  return false;
};

// 1. Executar build normal do Nuxt
console.log('\n📦 Executando build do Nuxt...');
try {
  execSync('npm run generate', { stdio: 'inherit' });
  console.log('✅ Build do Nuxt concluído');
} catch (error) {
  console.error('❌ Erro no build do Nuxt:', error.message);
  process.exit(1);
}

// 2. Verificar estrutura de diretórios
const distDir = path.join(process.cwd(), 'dist');
const publicDir = path.join(process.cwd(), 'public');

if (!fs.existsSync(distDir)) {
  console.error('❌ Diretório dist não encontrado após build');
  process.exit(1);
}

console.log('\n🔍 Verificando arquivos PWA...');

// 3. Verificar manifest
const manifestPaths = [
  path.join(distDir, 'manifest.webmanifest'),
  path.join(distDir, 'manifest.json')
];

let manifestFound = false;
for (const manifestPath of manifestPaths) {
  if (fileExists(manifestPath)) {
    console.log(`✅ Manifest encontrado: ${path.basename(manifestPath)}`);
    
    // Verificar conteúdo do manifest
    try {
      const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const requiredFields = ['name', 'short_name', 'start_url', 'icons'];
      const missingFields = requiredFields.filter(field => !manifestContent[field]);
      
      if (missingFields.length > 0) {
        console.warn(`⚠️ Campos obrigatórios ausentes no manifest: ${missingFields.join(', ')}`);
      } else {
        console.log('✅ Manifest válido com todos os campos obrigatórios');
      }
    } catch (error) {
      console.error('❌ Erro ao ler manifest:', error.message);
    }
    
    manifestFound = true;
    break;
  }
}

if (!manifestFound) {
  console.error('❌ Nenhum manifest encontrado após build');
  
  // Criar manifest de emergência
  const emergencyManifest = {
    name: 'AbaetefestPro - Festival Management',
    short_name: 'AbaetefestPro',
    description: 'Aplicação completa para gerenciamento de festivais com tecnologia PWA',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };
  
  const emergencyManifestPath = path.join(distDir, 'manifest.webmanifest');
  fs.writeFileSync(emergencyManifestPath, JSON.stringify(emergencyManifest, null, 2));
  console.log('🆘 Manifest de emergência criado');
}

// 4. Verificar Service Worker
const swPaths = [
  path.join(distDir, 'sw.js'),
  path.join(distDir, 'service-worker.js')
];

let swFound = false;
for (const swPath of swPaths) {
  if (fileExists(swPath)) {
    console.log(`✅ Service Worker encontrado: ${path.basename(swPath)}`);
    swFound = true;
    break;
  }
}

if (!swFound) {
  console.warn('⚠️ Service Worker não encontrado após build');
}

// 5. Verificar ícones obrigatórios
const requiredIcons = ['192x192', '512x512'];
const optionalIcons = ['72x72', '96x96', '128x128', '144x144', '152x152', '384x384'];
const allIcons = [...requiredIcons, ...optionalIcons];

console.log('\n🎨 Verificando ícones...');

for (const size of allIcons) {
  const iconName = `icon-${size}.png`;
  const publicIconPath = path.join(publicDir, iconName);
  const distIconPath = path.join(distDir, iconName);
  const isRequired = requiredIcons.includes(size);
  
  if (fileExists(publicIconPath)) {
    // Copiar ícone para dist se não existir
    if (!fileExists(distIconPath)) {
      copyFile(publicIconPath, distIconPath);
    } else {
      console.log(`✅ Ícone ${size}: OK`);
    }
  } else {
    const message = `❌ Ícone ${size}: Não encontrado`;
    if (isRequired) {
      console.error(message + ' (OBRIGATÓRIO)');
    } else {
      console.warn(message + ' (opcional)');
    }
  }
}

// 6. Garantir outros arquivos importantes
const importantFiles = [
  { src: 'favicon.ico', required: true },
  { src: 'robots.txt', required: false }
];

console.log('\n📄 Verificando arquivos importantes...');

for (const file of importantFiles) {
  const publicPath = path.join(publicDir, file.src);
  const distPath = path.join(distDir, file.src);
  
  if (fileExists(publicPath)) {
    if (!fileExists(distPath)) {
      copyFile(publicPath, distPath);
    } else {
      console.log(`✅ ${file.src}: OK`);
    }
  } else if (file.required) {
    console.error(`❌ ${file.src}: Obrigatório mas não encontrado`);
  } else {
    console.log(`ℹ️ ${file.src}: Opcional, não encontrado`);
  }
}

// 7. Verificar estrutura _nuxt
const nuxtDir = path.join(distDir, '_nuxt');
if (fs.existsSync(nuxtDir)) {
  const nuxtFiles = fs.readdirSync(nuxtDir);
  console.log(`✅ Diretório _nuxt com ${nuxtFiles.length} arquivos`);
} else {
  console.warn('⚠️ Diretório _nuxt não encontrado');
}

// 8. Criar arquivo de verificação
const verificationData = {
  buildTime: new Date().toISOString(),
  nodeVersion: process.version,
  manifestFound,
  swFound,
  iconsStatus: {
    required: requiredIcons.map(size => ({
      size,
      exists: fileExists(path.join(distDir, `icon-${size}.png`))
    })),
    optional: optionalIcons.map(size => ({
      size,
      exists: fileExists(path.join(distDir, `icon-${size}.png`))
    }))
  }
};

const verificationPath = path.join(distDir, 'pwa-verification.json');
fs.writeFileSync(verificationPath, JSON.stringify(verificationData, null, 2));
console.log('\n📋 Arquivo de verificação criado: pwa-verification.json');

// 9. Relatório final
console.log('\n📊 === RELATÓRIO FINAL ===');
console.log(`✅ Build concluído em: ${distDir}`);
console.log(`📄 Manifest: ${manifestFound ? 'OK' : 'ERRO'}`);
console.log(`⚙️ Service Worker: ${swFound ? 'OK' : 'AVISO'}`);

const requiredIconsOK = requiredIcons.every(size => 
  fileExists(path.join(distDir, `icon-${size}.png`))
);
console.log(`🎨 Ícones obrigatórios: ${requiredIconsOK ? 'OK' : 'ERRO'}`);

const optionalIconsCount = optionalIcons.filter(size =>
  fileExists(path.join(distDir, `icon-${size}.png`))
).length;
console.log(`🎨 Ícones opcionais: ${optionalIconsCount}/${optionalIcons.length}`);

// 10. Comandos de teste sugeridos
console.log('\n🧪 === COMANDOS DE TESTE ===');
console.log('Para testar localmente:');
console.log('  npx http-server dist -p 3000 -o');
console.log('');
console.log('Para validar PWA:');
console.log('  npx lighthouse http://localhost:3000 --only-categories=pwa');
console.log('');
console.log('Para testar manifest:');
console.log('  curl -I http://localhost:3000/manifest.webmanifest');

// 11. Avisos importantes
const hasErrors = !manifestFound || !requiredIconsOK;
if (hasErrors) {
  console.log('\n⚠️ === ATENÇÃO ===');
  if (!manifestFound) {
    console.log('❌ MANIFEST: Não encontrado ou inválido');
    console.log('   Solução: Verificar configuração do @vite-pwa/nuxt');
  }
  if (!requiredIconsOK) {
    console.log('❌ ÍCONES: Faltam ícones obrigatórios (192x192, 512x512)');
    console.log('   Solução: Executar "npm run pwa:icons" e criar os PNGs');
  }
  console.log('');
  console.log('PWA pode não funcionar corretamente até resolver estes problemas!');
  process.exit(1);
} else {
  console.log('\n🎉 === SUCESSO ===');
  console.log('Build PWA concluído com sucesso!');
  console.log('Todos os arquivos obrigatórios estão presentes.');
  console.log('');
  console.log('Próximos passos:');
  console.log('1. Deploy para servidor HTTPS');
  console.log('2. Testar instalação em dispositivos reais');
  console.log('3. Validar com Lighthouse PWA audit');
}

console.log('\n🚀 Build PWA finalizado!');