# 🚀 Guía Completa: GitHub + Vercel Deploy

## 📋 Archivos creados para el deploy:

✅ `/vercel.json` - Configuración de Vercel
✅ `/index.html` - Punto de entrada HTML
✅ `/src/main.tsx` - Punto de entrada React
✅ `/.gitignore` - Archivos a ignorar en Git

---

## 🔧 Paso 1: Preparar el repositorio local

```bash
# 1. Inicializar Git (si no está inicializado)
git init

# 2. Añadir todos los archivos
git add .

# 3. Hacer el primer commit
git commit -m "feat: Sistema de gestión de inventario multi-sucursal completo"
```

---

## 📤 Paso 2: Crear repositorio en GitHub

1. Ve a https://github.com/new
2. **Nombre del repositorio**: `cafeteria-inventory-system` (o el que prefieras)
3. **Descripción**: "Sistema de gestión de inventario multi-sucursal para cafetería con Supabase"
4. **Visibilidad**: Privado (recomendado) o Público
5. **⚠️ IMPORTANTE**: NO marques:
   - ❌ "Add a README file"
   - ❌ "Add .gitignore"
   - ❌ "Choose a license"
6. Haz clic en **"Create repository"**

---

## 🔗 Paso 3: Conectar repositorio local con GitHub

GitHub te mostrará instrucciones. Usa estas:

```bash
# Conectar con GitHub
git remote add origin https://github.com/TU-USUARIO/cafeteria-inventory-system.git

# Renombrar branch a main
git branch -M main

# Subir el código
git push -u origin main
```

**Reemplaza** `TU-USUARIO` con tu nombre de usuario de GitHub.

---

## 🌐 Paso 4: Deployar en Vercel

### Opción A: Desde el navegador (Recomendado)

1. Ve a https://vercel.com
2. Inicia sesión con tu cuenta de GitHub
3. Haz clic en **"Add New Project"**
4. Selecciona tu repositorio `cafeteria-inventory-system`
5. Vercel detectará automáticamente la configuración gracias a `vercel.json`
6. En **Environment Variables**, agrega:
   ```
   VITE_SUPABASE_URL = tu_supabase_url
   VITE_SUPABASE_ANON_KEY = tu_supabase_anon_key
   ```
7. Haz clic en **"Deploy"**

### Opción B: Desde la terminal

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deployar
vercel

# Para producción
vercel --prod
```

---

## 🔐 Paso 5: Configurar Variables de Entorno en Vercel

1. En el dashboard de Vercel, ve a tu proyecto
2. Settings → Environment Variables
3. Agrega las siguientes variables:

```
VITE_SUPABASE_URL = https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY = tu-anon-key-aqui
```

4. Guarda y **redeploy** el proyecto

---

## 📝 Paso 6: Verificar el Deploy

1. Espera a que termine el build (2-3 minutos)
2. Vercel te dará una URL como: `https://cafeteria-inventory-system.vercel.app`
3. Abre la URL y verifica que todo funcione

---

## 🔄 Actualizar en el futuro

Cada vez que hagas cambios:

```bash
# 1. Añadir cambios
git add .

# 2. Hacer commit
git commit -m "Descripción de los cambios"

# 3. Subir a GitHub
git push

# Vercel automáticamente detectará el push y redesplegará tu app
```

---

## ⚠️ Solución de Problemas

### Error: "Build Failed"
- Verifica que `vercel.json` esté en la raíz del proyecto
- Verifica que `package.json` tenga `"build": "vite build"`
- Revisa los logs de build en Vercel

### Error: "Cannot find module"
- Ejecuta `npm install` localmente
- Verifica que todas las dependencias estén en `package.json`

### Error de Supabase
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que las políticas RLS estén habilitadas en Supabase

### La app no carga
- Abre DevTools (F12) y revisa la consola
- Verifica que la URL de Supabase sea correcta

---

## 🎯 Checklist Final

- [ ] Git inicializado
- [ ] Código subido a GitHub
- [ ] Proyecto creado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso
- [ ] App funcionando en la URL de Vercel
- [ ] Supabase conectado correctamente

---

## 📞 URLs Importantes

- **GitHub**: https://github.com/TU-USUARIO/cafeteria-inventory-system
- **Vercel**: https://vercel.com/dashboard
- **Tu App**: https://cafeteria-inventory-system.vercel.app (cambiará según tu nombre)
- **Supabase**: https://app.supabase.com

---

¡Listo! Tu sistema de cafetería está en la nube 🎉☕
