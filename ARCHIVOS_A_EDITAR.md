# 📂 Archivos que Debes Editar

## ⚠️ SOLO TIENES QUE EDITAR 1 ARCHIVO

---

## ✏️ ARCHIVO A EDITAR

### `/src/lib/supabase.ts`

**¿Por qué?** Aquí es donde pones tus credenciales de Supabase.

**¿Qué editar?**

```typescript
// ❌ ANTES (viene así por defecto):
const SUPABASE_URL = 'TU_PROJECT_URL_AQUI';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_AQUI';

// ✅ DESPUÉS (con tus credenciales):
const SUPABASE_URL = 'https://abcdefgh.supabase.co';  // ← Tu URL aquí
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';  // ← Tu key aquí
```

**¿Dónde consigo esas credenciales?**
1. Ve a [Supabase](https://app.supabase.com)
2. Selecciona tu proyecto
3. Settings ⚙️ → API
4. Copia:
   - **Project URL** (pégalo en `SUPABASE_URL`)
   - **anon public** (pégalo en `SUPABASE_ANON_KEY`)

---

## 🚫 ARCHIVOS QUE NO DEBES TOCAR

Estos archivos ya están configurados y funcionan perfectamente:

### Supabase

- ❌ `/src/lib/supabase-sync.ts` - Funciones de sincronización (ya funciona)

### Componentes Principales

- ❌ `/src/app/App.tsx` - App principal (ya funciona)
- ❌ `/src/app/components/SalesScreen.tsx` - Pantalla de ventas (ya funciona)
- ❌ `/src/app/components/AdminPanel.tsx` - Panel admin (ya funciona)
- ❌ `/src/app/components/VideoUploader.tsx` - Subida de videos (ya funciona)

### Tipos e Inventario

- ❌ `/src/app/types/inventory.ts` - Definiciones de productos (ya funciona)

### Configuración

- ❌ `/package.json` - Dependencias (ya funciona)
- ❌ `/vite.config.ts` - Configuración de build (ya funciona)

---

## 📖 ARCHIVOS DE DOCUMENTACIÓN (PARA LEER)

Estos archivos son **guías** para ayudarte:

### Guías de Inicio

- 📄 `/INICIO_RAPIDO.md` - **LEE ESTO PRIMERO** (5 minutos)
- 📄 `/INSTRUCCIONES_SUPABASE.md` - Instrucciones completas
- 📄 `/CHECKLIST.md` - Lista de verificación paso a paso

### Guías de Despliegue

- 📄 `/COMANDOS_DEPLOY.md` - Comandos para desplegar en Vercel/Netlify
- 📄 `/README_IMPLEMENTACION.md` - Resumen completo del sistema

### SQL

- 📄 `/supabase-setup.sql` - Script SQL para crear las tablas en Supabase

---

## 🎯 Resumen Visual

```
📦 Tu Proyecto
│
├── 📂 src/
│   ├── 📂 lib/
│   │   ├── ✏️ supabase.ts              ← EDITA ESTE (tus credenciales)
│   │   └── ❌ supabase-sync.ts         ← NO TOCAR (ya funciona)
│   │
│   └── 📂 app/
│       ├── ❌ App.tsx                   ← NO TOCAR (ya funciona)
│       ├── 📂 components/
│       │   ├── ❌ SalesScreen.tsx      ← NO TOCAR (ya funciona)
│       │   ├── ❌ AdminPanel.tsx       ← NO TOCAR (ya funciona)
│       │   └── ❌ VideoUploader.tsx    ← NO TOCAR (ya funciona)
│       │
│       └── 📂 types/
│           └── ❌ inventory.ts          ← NO TOCAR (ya funciona)
│
├── 📄 INICIO_RAPIDO.md                  ← LEE ESTO PRIMERO
├── 📄 INSTRUCCIONES_SUPABASE.md         ← Instrucciones detalladas
├── 📄 COMANDOS_DEPLOY.md                ← Comandos de despliegue
├── 📄 CHECKLIST.md                      ← Lista de verificación
└── 📄 supabase-setup.sql                ← SQL para Supabase
```

---

## ✅ Checklist Rápido

Antes de desplegar, verifica:

- [ ] ¿Editaste `/src/lib/supabase.ts` con tus credenciales?
- [ ] ¿Guardaste el archivo después de editarlo?
- [ ] ¿Ejecutaste el SQL en Supabase?
- [ ] ¿Creaste el bucket `cafeteria-videos`?

Si respondiste **SÍ** a todo, estás listo para desplegar! 🚀

---

## 💡 Ejemplo de Edición Correcta

### ❌ INCORRECTO (no funcionará):

```typescript
// /src/lib/supabase.ts
const SUPABASE_URL = 'TU_PROJECT_URL_AQUI';  // ← Aún dice "TU_PROJECT_URL_AQUI"
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_AQUI';  // ← Aún dice "TU_ANON_KEY_AQUI"
```

### ✅ CORRECTO (funcionará):

```typescript
// /src/lib/supabase.ts
const SUPABASE_URL = 'https://xyzabc123.supabase.co';  // ← URL real
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjc4ODY0ODAwLCJleHAiOjE5OTQ0NDA4MDB9.abc123xyz456def789';  // ← Key real
```

---

## 🔍 Cómo Verificar que Editaste Correctamente

Después de editar `/src/lib/supabase.ts`:

1. Abre el archivo
2. Busca las líneas con `const SUPABASE_URL` y `const SUPABASE_ANON_KEY`
3. Verifica que:
   - NO digan `TU_PROJECT_URL_AQUI` ni `TU_ANON_KEY_AQUI`
   - SÍ contengan URLs y claves reales de Supabase
   - La URL empiece con `https://` y termine con `.supabase.co`
   - La key empiece con `eyJ`

Si ves eso, ¡está correcto! ✅

---

## 🆘 Si Algo Sale Mal

### Error: "SUPABASE NO CONFIGURADO"

**Causa:** No editaste `/src/lib/supabase.ts` o no guardaste el archivo.

**Solución:**
1. Abre `/src/lib/supabase.ts`
2. Reemplaza las credenciales
3. Presiona **Ctrl+S** (Windows) o **Cmd+S** (Mac) para guardar
4. Vuelve a desplegar: `vercel --prod`

### Error: "Cannot connect to Supabase"

**Causa:** Las credenciales son incorrectas.

**Solución:**
1. Ve a Supabase → Settings → API
2. Copia de nuevo las credenciales
3. Pégalas en `/src/lib/supabase.ts`
4. Asegúrate de que no haya espacios extra al inicio o al final
5. Guarda y redesplega

---

## 📞 Necesitas Ayuda?

Si después de editar `/src/lib/supabase.ts` algo no funciona:

1. **Verifica la consola del navegador:**
   - Presiona F12
   - Ve a la pestaña "Console"
   - Busca errores en rojo

2. **Revisa Supabase:**
   - Ve a Table Editor
   - Verifica que las 6 tablas existan
   - Ve a Storage
   - Verifica que el bucket `cafeteria-videos` exista

3. **Lee las guías:**
   - `/INICIO_RAPIDO.md` - Paso a paso
   - `/CHECKLIST.md` - Verificación completa

---

¡Eso es todo! Solo edita `/src/lib/supabase.ts` y estarás listo. 🎉
