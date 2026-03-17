# ⚡ Guía de Inicio Rápido - 5 Minutos

Sigue estos pasos en orden para tener tu sistema funcionando en la tablet.

---

## 📋 Paso 1: Configurar Supabase (2 minutos)

### A. Crear las tablas

1. Ve a tu proyecto en [Supabase](https://app.supabase.com)
2. Clic en **SQL Editor** (menú lateral)
3. Clic en **+ New Query**
4. Abre el archivo `/supabase-setup.sql` de este proyecto
5. **Copia TODO el contenido** y pégalo en el editor
6. Clic en **Run** (botón abajo a la derecha)
7. ✅ Deberías ver "Success" y una lista de 6 tablas

### B. Crear el bucket de videos

1. Clic en **Storage** (menú lateral)
2. Clic en **+ New bucket**
3. Nombre: `cafeteria-videos`
4. **Desmarca** "Private bucket"
5. Clic en **Create bucket**
6. Clic en el bucket recién creado
7. Ve a la pestaña **Policies**
8. Clic en **New Policy** → **For full customization**
9. Nombre: `Allow all operations`
10. Marca TODAS las operaciones (SELECT, INSERT, UPDATE, DELETE)
11. Target roles: `public`
12. En "Policy definition" escribe: `true`
13. Clic en **Review** → **Save policy**

### C. Copiar credenciales

1. Clic en **Settings** ⚙️ (menú lateral)
2. Clic en **API**
3. Copia estos 2 valores (los necesitarás en el siguiente paso):
   - **Project URL** (ejemplo: `https://abcdefgh.supabase.co`)
   - **anon public** (la clave larga que empieza con `eyJ...`)

---

## 📋 Paso 2: Configurar el Código (1 minuto)

1. Abre el archivo `/src/lib/supabase.ts` en tu editor de código
2. Busca estas líneas:

```typescript
const SUPABASE_URL = 'TU_PROJECT_URL_AQUI';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_AQUI';
```

3. Reemplázalas con tus credenciales:

```typescript
const SUPABASE_URL = 'https://abcdefgh.supabase.co'; // ← Tu Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // ← Tu anon key
```

4. **Guarda el archivo** (Ctrl+S o Cmd+S)

---

## 📋 Paso 3: Desplegar (2 minutos)

### Opción A: Vercel (Más fácil)

Abre la terminal en la carpeta de tu proyecto y ejecuta:

```bash
npm install -g vercel
vercel
```

Responde las preguntas:
- ¿Set up and deploy? → **Y** (Enter)
- ¿Link to existing project? → **N** (Enter)
- ¿Project name? → **cafeteria** (o el nombre que quieras)
- ¿In which directory? → **./** (Enter)
- ¿Want to modify? → **N** (Enter)

✅ Te dará una URL como: `https://cafeteria-abc123.vercel.app`

**Para actualizar después:**
```bash
vercel --prod
```

### Opción B: Netlify

```bash
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod
```

Responde:
- ¿Create & configure new site? → **Sí**
- ¿Site name? → **cafeteria**
- ¿Publish directory? → **dist**

✅ Te dará una URL como: `https://cafeteria.netlify.app`

---

## 📋 Paso 4: Configurar la Tablet (30 segundos)

### Android (Chrome)

1. Abre **Chrome** en la tablet
2. Ve a la **URL** que obtuviste en el paso 3
3. Toca el menú **⋮** (arriba a la derecha)
4. Toca **"Añadir a pantalla de inicio"**
5. Toca **"Añadir"**
6. ✅ Ahora tienes un ícono "Cafetería" en la pantalla principal

### iOS/iPadOS (Safari)

1. Abre **Safari** en el iPad
2. Ve a la **URL** que obtuviste en el paso 3
3. Toca el botón **□↑** (compartir)
4. Desplázate y toca **"Añadir a pantalla de inicio"**
5. Toca **"Añadir"**
6. ✅ Ahora tienes un ícono "Cafetería" en la pantalla principal

---

## 📋 Paso 5: Verificar (30 segundos)

1. **Abre la app** desde el ícono en la tablet
2. Presiona **"Abrir Cafetería"**
3. Revisa el inventario en el modal
4. Ingresa cambio inicial: **100**
5. Presiona **"Confirmar y Abrir"**
6. Haz una **venta de prueba**:
   - Selecciona "Maruchan Camarón" (1x)
   - Presiona "Completar Venta"
7. Ve a **Supabase** → **Table Editor** → tabla **sales**
8. ✅ **Deberías ver la venta** registrada

---

## ✅ ¡Listo!

Tu sistema está funcionando. Ahora puedes:

- 🛒 Hacer ventas
- 📊 Ver reportes
- 🔄 Controlar turnos
- 🎥 Subir videos personalizados (Panel Admin → clave: 1062000)

---

## 🆘 ¿Algo Salió Mal?

### Error: "SUPABASE NO CONFIGURADO"

- Verifica que editaste `/src/lib/supabase.ts` con tus credenciales reales
- Guarda el archivo
- Ejecuta `vercel --prod` de nuevo

### Error: No se guardan las ventas

- Ve a Supabase → Table Editor
- Verifica que veas las 6 tablas: `products`, `stock_groups`, `sales`, `shifts`, `cafeteria_state`, `configuration`
- Si no las ves, ejecuta el SQL del Paso 1 nuevamente

### Error: No puedo subir videos

- Ve a Supabase → Storage
- Verifica que el bucket `cafeteria-videos` exista y sea público
- Verifica que tenga políticas que permitan INSERT

### La app no carga en la tablet

- Verifica que la tablet tenga internet
- Intenta en modo incógnito
- Limpia el caché del navegador

---

## 📚 Documentación Completa

Si necesitas más detalles:

- **Instrucciones completas:** Lee `/INSTRUCCIONES_SUPABASE.md`
- **Comandos de despliegue:** Lee `/COMANDOS_DEPLOY.md`
- **Checklist detallado:** Lee `/CHECKLIST.md`
- **Resumen del sistema:** Lee `/README_IMPLEMENTACION.md`

---

## 🎓 Uso Diario

### Abrir Cafetería (Inicio del día)

1. Abrir app
2. Presionar "Abrir Cafetería"
3. Verificar inventario
4. Ingresar cambio inicial
5. Confirmar

### Hacer Ventas

1. Seleccionar productos
2. Ajustar cantidades con + / -
3. Presionar "Completar Venta"

### Entregar Turno

1. Presionar "Entregar Turno"
2. Ingresar dinero reportado
3. Revisar diferencias
4. Confirmar

### Cerrar Cafetería (Fin del día)

1. Presionar "Hacer Corte"
2. Ingresar dinero a dejar como cambio
3. Confirmar
4. Revisar reporte del día

### Panel Administrativo

- Presionar ⚙️ (esquina superior derecha)
- Ingresar clave: **1062000**
- Gestionar inventario, precios y videos

---

¡Disfruta tu nuevo sistema de cafetería! ☕🎉
