# 🚀 Comandos Rápidos para Despliegue

## 📝 Prerequisitos

Antes de desplegar, asegúrate de:

1. ✅ Haber configurado Supabase (credenciales en `/src/lib/supabase.ts`)
2. ✅ Tener Node.js instalado en tu computadora
3. ✅ Estar en la carpeta raíz de tu proyecto

---

## 🔧 Opción 1: Vercel (Recomendado)

### Primera vez

```bash
# 1. Instalar Vercel CLI globalmente
npm install -g vercel

# 2. Desplegar (te pedirá login la primera vez)
vercel

# Responde las preguntas:
# ? Set up and deploy "~/cafeteria"? [Y/n] → Y (presiona Enter)
# ? Which scope do you want to deploy to? → Presiona Enter
# ? Link to existing project? [y/N] → N (presiona Enter)
# ? What's your project's name? → cafeteria (o el nombre que quieras)
# ? In which directory is your code located? → ./ (presiona Enter)
# ? Want to modify these settings? [y/N] → N (presiona Enter)

# ✅ Te dará una URL de preview: https://cafeteria-abc123.vercel.app
```

### Para actualizar después de hacer cambios

```bash
# Desplegar a producción
vercel --prod

# ✅ URL de producción: https://cafeteria.vercel.app (sin el hash)
```

### Ver logs

```bash
# Ver todas tus apps desplegadas
vercel list

# Ver logs en tiempo real
vercel logs
```

---

## 🔧 Opción 2: Netlify CLI

### Primera vez

```bash
# 1. Instalar Netlify CLI globalmente
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Construir el proyecto
npm run build

# 4. Desplegar
netlify deploy --prod

# Responde las preguntas:
# ? This folder isn't linked to a site yet → Create & configure a new site
# ? Team: → Selecciona tu equipo
# ? Site name (optional): → cafeteria
# ? Publish directory: → dist

# ✅ Te dará una URL: https://cafeteria.netlify.app
```

### Para actualizar después de hacer cambios

```bash
# Reconstruir
npm run build

# Desplegar
netlify deploy --prod
```

---

## 🔧 Opción 3: GitHub Pages (Gratis pero más pasos)

### Configuración inicial

```bash
# 1. Instalar gh-pages
npm install --save-dev gh-pages

# 2. Agregar scripts a package.json (hazlo manualmente)
# En package.json, agrega:
# "homepage": "https://TU-USUARIO.github.io/cafeteria",
# "predeploy": "npm run build",
# "deploy": "gh-pages -d dist"

# 3. Desplegar
npm run deploy

# ✅ URL: https://TU-USUARIO.github.io/cafeteria
```

### Para actualizar

```bash
npm run deploy
```

---

## 🔧 Opción 4: Subir Manualmente (Cualquier hosting)

### Construir para producción

```bash
# Construir el proyecto
npm run build

# ✅ Se creará la carpeta /dist con todos los archivos
```

### Qué hacer con la carpeta /dist

1. **Compress la carpeta** (opcional pero recomendado)
2. **Sube los archivos** a tu hosting:
   - **Hostinger:** Panel → Archivos → Subir a public_html
   - **000webhost:** File Manager → public_html
   - **Otros:** Busca "public_html" o "www" o "htdocs"

3. **Accede a tu dominio**: `https://tu-dominio.com`

---

## 📱 Configurar en la Tablet

Una vez desplegado, configura la tablet:

### Android (Chrome)

```
1. Abre Chrome en la tablet
2. Ve a la URL de tu app
3. Toca el menú (⋮) arriba a la derecha
4. Selecciona "Añadir a pantalla de inicio"
5. Dale un nombre: "Cafetería"
6. Toca "Añadir"
7. ✅ Ahora tienes un ícono en la pantalla principal
```

### iOS/iPadOS (Safari)

```
1. Abre Safari en el iPad/iPhone
2. Ve a la URL de tu app
3. Toca el botón de compartir (□↑)
4. Desplázate y selecciona "Añadir a pantalla de inicio"
5. Dale un nombre: "Cafetería"
6. Toca "Añadir"
7. ✅ Ahora tienes un ícono en la pantalla principal
```

---

## 🔍 Verificar que Funciona

### En el navegador de tu computadora

```bash
# 1. Abre la URL desplegada
# 2. Presiona F12 (o Ctrl+Shift+I en Windows, Cmd+Opt+I en Mac)
# 3. Ve a la pestaña "Console"
# 4. Busca mensajes como:

✅ "Productos sincronizados con Supabase"
✅ "Grupos de stock sincronizados con Supabase"

# Si ves esos mensajes, ¡está funcionando!

# Si ves:
❌ "SUPABASE NO CONFIGURADO"
# → Necesitas editar /src/lib/supabase.ts con tus credenciales
```

### Prueba completa

```
1. Abre la app
2. Presiona "Abrir Cafetería"
3. Ingresa cambio inicial: 100
4. Confirma
5. Haz una venta de prueba
6. Ve a Supabase → Table Editor → tabla "sales"
7. ✅ Deberías ver la venta registrada
```

---

## ⚙️ Variables de Entorno (Avanzado)

Si quieres usar variables de entorno en lugar de hardcodear las credenciales:

### Crear archivo .env.local

```bash
# Crea un archivo llamado .env.local en la raíz del proyecto
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

### Modificar /src/lib/supabase.ts

```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'TU_PROJECT_URL_AQUI';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU_ANON_KEY_AQUI';
```

### En Vercel

```bash
# Agregar variables de entorno
vercel env add VITE_SUPABASE_URL
# Pega tu URL cuando te lo pida

vercel env add VITE_SUPABASE_ANON_KEY
# Pega tu clave cuando te lo pida

# Redesplegar
vercel --prod
```

### En Netlify

```bash
# Interfaz web:
# 1. Ve a tu sitio en Netlify
# 2. Site settings → Environment variables
# 3. Add a variable: VITE_SUPABASE_URL
# 4. Add a variable: VITE_SUPABASE_ANON_KEY
# 5. Redesplegar: netlify deploy --prod
```

---

## 🐛 Solución de Problemas Comunes

### Error: "command not found: vercel"

```bash
# Instala Vercel globalmente
npm install -g vercel

# Si sigue sin funcionar, usa npx
npx vercel
```

### Error: "command not found: npm"

```bash
# Necesitas instalar Node.js
# Ve a https://nodejs.org y descarga la versión LTS
# Instala y reinicia tu terminal
```

### Error al construir: "Cannot find module"

```bash
# Instala las dependencias
npm install

# Luego intenta construir de nuevo
npm run build
```

### La app carga pero no se conecta a Supabase

```bash
# 1. Verifica que editaste /src/lib/supabase.ts
# 2. Verifica que las credenciales sean correctas
# 3. Reconstruye y redesplega:
npm run build
vercel --prod  # o netlify deploy --prod
```

---

## 📊 Comparación de Servicios

| Servicio | Velocidad | Facilidad | Gratis | URL Personalizable |
|----------|-----------|-----------|--------|-------------------|
| **Vercel** | ⚡⚡⚡ | 😊 Muy fácil | ✅ Sí | ✅ Sí |
| **Netlify** | ⚡⚡⚡ | 😊 Fácil | ✅ Sí | ✅ Sí |
| **GitHub Pages** | ⚡⚡ | 😐 Medio | ✅ Sí | ⚠️ Limitado |
| **Hosting Manual** | ⚡ | 😓 Difícil | ⚠️ Depende | ✅ Sí |

**Recomendación:** Usa **Vercel** para la mejor experiencia.

---

## 🎯 Resumen de Comandos Esenciales

```bash
# VERCEL (Recomendado)
npm install -g vercel
vercel                    # Primera vez
vercel --prod            # Actualizar

# NETLIFY
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod

# CONSTRUCCIÓN LOCAL
npm run build            # Crea carpeta /dist
```

---

## ✅ Siguiente Paso

Una vez desplegado:

1. 📱 Configura la tablet (añade a pantalla de inicio)
2. 🧪 Haz pruebas con ventas reales
3. 🎥 Sube tu video personalizado
4. 👥 Capacita a tu personal

¡Listo para usar tu sistema de cafetería! 🎉☕
