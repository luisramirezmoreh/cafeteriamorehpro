# 🚀 Guía de Deployment - GitHub + Vercel

## ⚠️ IMPORTANTE: Cómo subir cambios correctamente a GitHub

### ❌ NO HACER:
- ❌ NO borrar archivos uno por uno en GitHub
- ❌ NO subir archivos individualmente desde la interfaz web
- ❌ NO borrar el repositorio completo y volver a crear

### ✅ HACER (Método correcto):

## 📋 Pasos para subir cambios a GitHub

### 1. **Verificar que tienes Git configurado en tu computadora**

Abre la terminal/consola en la carpeta de tu proyecto y ejecuta:

```bash
git --version
```

Si no tienes Git instalado, descárgalo de: https://git-scm.com/

### 2. **Inicializar repositorio local (solo la primera vez)**

Si no tienes un repositorio inicializado:

```bash
git init
git branch -M main
```

### 3. **Conectar con tu repositorio de GitHub**

Reemplaza `TU_USUARIO` y `TU_REPOSITORIO` con tus datos:

```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
```

Si ya existe, actualiza la URL:

```bash
git remote set-url origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
```

### 4. **Verificar qué archivos se van a subir**

```bash
git status
```

Esto te mostrará los archivos modificados. **NUNCA deberías ver `node_modules/` en esta lista**.

### 5. **Agregar todos los cambios**

```bash
git add .
```

### 6. **Crear un commit con mensaje descriptivo**

```bash
git commit -m "Implementar panel de capuchinos y sistema de vasos"
```

### 7. **Subir cambios a GitHub**

Primera vez:
```bash
git push -u origin main
```

Siguientes veces:
```bash
git push
```

---

## 🔧 Si ya tienes problemas en GitHub

### Opción 1: Forzar push (⚠️ Cuidado - borra el historial)

```bash
git push -f origin main
```

### Opción 2: Crear branch nuevo y hacer merge

```bash
git checkout -b fix-deployment
git add .
git commit -m "Fix deployment issues"
git push origin fix-deployment
```

Luego en GitHub, crea un Pull Request y haz merge.

---

## 🔥 Solución de emergencia: Empezar desde cero

Si todo está muy roto, puedes:

1. **Crear un nuevo repositorio en GitHub**
2. **En tu computadora local, ejecutar:**

```bash
# Remover conexión con repositorio anterior
git remote remove origin

# Conectar con el nuevo repositorio
git remote add origin https://github.com/TU_USUARIO/NUEVO_REPOSITORIO.git

# Subir todo
git add .
git commit -m "Initial commit - Sistema completo de cafetería"
git branch -M main
git push -u origin main
```

3. **En Vercel:**
   - Ve a Settings → Git
   - Cambia el repositorio conectado al nuevo

---

## 📦 Configurar Vercel correctamente

### 1. Variables de Entorno en Vercel

Ve a tu proyecto en Vercel → Settings → Environment Variables

Agrega:
- `VITE_SUPABASE_URL` = tu URL de Supabase
- `VITE_SUPABASE_ANON_KEY` = tu clave anónima de Supabase

### 2. Build Settings

Debería estar automáticamente:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3. Root Directory

Debe estar en blanco o en `/` (raíz del proyecto)

---

## ✅ Checklist antes de hacer push

- [ ] Archivo `.gitignore` existe y tiene `node_modules` listado
- [ ] No hay carpeta `node_modules` visible en `git status`
- [ ] Todos los archivos `.tsx` están en `/src`
- [ ] `package.json` existe y tiene todas las dependencias
- [ ] `index.html` existe en la raíz
- [ ] `vite.config.ts` existe
- [ ] Variables de entorno están en Vercel (no en GitHub)

---

## 🆘 Errores comunes

### Error: "package.json not found"
- El archivo `package.json` debe estar en la **raíz** del repositorio
- Verifica que no esté dentro de una subcarpeta

### Error: "Cannot find module"
- Falta instalar dependencias
- Vercel debe ejecutar `npm install` automáticamente
- Verifica que todas las dependencias estén en `package.json`

### Error: Build fails con TypeScript
- Verifica que `tsconfig.json` exista
- Asegúrate de que no haya errores de tipos en el código

### Error: "VITE_SUPABASE_URL is not defined"
- Las variables de entorno deben estar en Vercel
- No subas archivos `.env` a GitHub (están en `.gitignore`)

---

## 📞 Necesitas ayuda?

Si sigues teniendo problemas:

1. Copia el mensaje de error completo de Vercel
2. Ejecuta `git status` y comparte el resultado
3. Verifica que tu `.gitignore` contenga `node_modules`

---

## 🎯 Flujo de trabajo ideal

```bash
# 1. Hacer cambios en tu código
# 2. Verificar cambios
git status

# 3. Agregar cambios
git add .

# 4. Commit
git commit -m "Descripción clara de los cambios"

# 5. Push
git push

# 6. Vercel hace deploy automáticamente ✨
```

¡Eso es todo! 🎉
