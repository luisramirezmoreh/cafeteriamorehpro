# ✅ Checklist de Implementación

Sigue esta lista para asegurarte de que todo esté configurado correctamente.

---

## 📋 Fase 1: Configuración de Supabase

### En Supabase Dashboard

- [ ] 1. Proyecto creado en Supabase
- [ ] 2. SQL ejecutado en **SQL Editor** (6 tablas creadas)
- [ ] 3. Bucket `cafeteria-videos` creado en **Storage**
- [ ] 4. Políticas configuradas para el bucket (permitir todas las operaciones)
- [ ] 5. Credenciales copiadas:
  - [ ] Project URL
  - [ ] anon/public key

### Verificación de Tablas

Ve a **Table Editor** y confirma que veas:

- [ ] ✅ `products`
- [ ] ✅ `stock_groups`
- [ ] ✅ `sales`
- [ ] ✅ `shifts`
- [ ] ✅ `cafeteria_state`
- [ ] ✅ `configuration`

Si falta alguna tabla, regresa al **SQL Editor** y ejecuta el script nuevamente.

---

## 📋 Fase 2: Configuración del Código

### En tu Proyecto

- [ ] 1. Archivo `/src/lib/supabase.ts` editado con tus credenciales
- [ ] 2. Reemplazaste `TU_PROJECT_URL_AQUI` con tu URL real
- [ ] 3. Reemplazaste `TU_ANON_KEY_AQUI` con tu clave real
- [ ] 4. Guardaste el archivo

### Verificación Rápida

Abre `/src/lib/supabase.ts` y verifica que:

```typescript
// ❌ ANTES (incorrecto):
const SUPABASE_URL = 'TU_PROJECT_URL_AQUI';

// ✅ DESPUÉS (correcto):
const SUPABASE_URL = 'https://tuproyecto.supabase.co';
```

---

## 📋 Fase 3: Construcción y Despliegue

### Construcción Local

- [ ] 1. Ejecutaste `npm run build` sin errores
- [ ] 2. Se creó la carpeta `/dist`

### Despliegue (elige una opción)

**Opción A: Vercel**
- [ ] 1. Instalaste Vercel CLI: `npm install -g vercel`
- [ ] 2. Ejecutaste `vercel` en la carpeta del proyecto
- [ ] 3. Respondiste las preguntas de configuración
- [ ] 4. Obtuviste una URL (ejemplo: `https://cafeteria.vercel.app`)

**Opción B: Netlify**
- [ ] 1. Creaste cuenta en Netlify
- [ ] 2. Arrastraste la carpeta `/dist` al sitio
- [ ] 3. Obtuviste una URL

**Opción C: Otro servicio**
- [ ] 1. Desplegaste en tu servicio preferido
- [ ] 2. Obtuviste una URL pública

---

## 📋 Fase 4: Pruebas

### Prueba en tu Computadora

- [ ] 1. Abre la URL en tu navegador
- [ ] 2. La app carga correctamente
- [ ] 3. Presiona F12 y ve a Console
- [ ] 4. NO ves el mensaje "⚠️ SUPABASE NO CONFIGURADO"
- [ ] 5. Ves mensajes como "✅ Productos sincronizados con Supabase"

### Prueba de Funcionalidad

- [ ] 1. Abre la app
- [ ] 2. Presiona "Abrir Cafetería"
- [ ] 3. Ingresa cambio inicial (ejemplo: 100)
- [ ] 4. Confirma
- [ ] 5. Haz una venta de prueba
- [ ] 6. Ve a Supabase → Table Editor → `sales`
- [ ] 7. Confirma que la venta aparece en la tabla ✅

### Prueba de Videos

- [ ] 1. Abre el panel administrativo (clave: 1062000)
- [ ] 2. Ve a la sección de videos
- [ ] 3. Sube un video de prueba (pequeño, máx 10MB)
- [ ] 4. Espera a que se suba
- [ ] 5. Ve a Supabase → Storage → `cafeteria-videos`
- [ ] 6. Confirma que el video está ahí ✅

---

## 📋 Fase 5: Configuración en Tablet

### En la Tablet

- [ ] 1. Abriste el navegador (Chrome, Safari, etc.)
- [ ] 2. Fuiste a la URL desplegada
- [ ] 3. La app carga correctamente
- [ ] 4. Añadiste a pantalla de inicio:
  - **Android:** Menú → "Añadir a pantalla de inicio"
  - **iOS:** Compartir → "Añadir a pantalla de inicio"
- [ ] 5. Ahora tienes un ícono en la pantalla principal

### Prueba Final

- [ ] 1. Abre la app desde el ícono
- [ ] 2. Haz una venta de prueba
- [ ] 3. Cierra la app completamente
- [ ] 4. Vuelve a abrirla
- [ ] 5. Confirma que los datos persisten ✅

---

## 🎯 Resultado Final

Si marcaste ✅ en TODOS los puntos anteriores:

### 🎉 ¡FELICIDADES!

Tu sistema está:
- ✅ Completamente funcional
- ✅ Conectado a Supabase
- ✅ Desplegado en la nube
- ✅ Accesible desde tu tablet
- ✅ Con almacenamiento permanente

---

## ❌ Si Algo Falló

### Problema: Mensaje "SUPABASE NO CONFIGURADO"

**Solución:**
1. Revisa `/src/lib/supabase.ts`
2. Asegúrate de haber reemplazado las credenciales
3. Guarda el archivo
4. Ejecuta `npm run build` nuevamente
5. Despliega con `vercel --prod`

### Problema: No se guardan las ventas en Supabase

**Solución:**
1. Ve a Supabase → Table Editor
2. Haz clic en `sales`
3. Ve a la pestaña "Policies"
4. Asegúrate de que haya una política que permita INSERT

### Problema: No se suben los videos

**Solución:**
1. Ve a Supabase → Storage
2. Haz clic en `cafeteria-videos`
3. Ve a "Policies"
4. Crea una nueva política:
   - Operación: INSERT
   - Target roles: public
   - Policy: `true`

### Problema: La app no carga en la tablet

**Solución:**
1. Verifica que la tablet tenga internet
2. Intenta en modo incógnito
3. Limpia caché del navegador
4. Verifica que la URL esté correcta

---

## 📞 ¿Necesitas Más Ayuda?

### Recursos Útiles

- **Documentación completa:** Lee `/INSTRUCCIONES_SUPABASE.md`
- **Resumen del sistema:** Lee `/README_IMPLEMENTACION.md`
- **Console del navegador:** Presiona F12 para ver logs
- **Supabase Dashboard:** [app.supabase.com](https://app.supabase.com)

### Logs del Sistema

Para ver si algo falla, abre la consola del navegador (F12) y busca:
- 🟢 Mensajes verdes con ✅ = Todo bien
- 🔴 Mensajes rojos con ❌ = Hay un error
- 🟡 Mensajes amarillos con ⚠️ = Advertencias

---

## 🚀 Próximos Pasos

Una vez que todo funcione:

1. **Capacita a tu personal**
   - Muéstrales cómo hacer ventas
   - Enséñales a abrir/cerrar cafetería
   - Explica el panel administrativo

2. **Prueba en condiciones reales**
   - Usa el sistema durante un día completo
   - Verifica que todo funcione como esperas
   - Ajusta precios o productos si es necesario

3. **Configura backups adicionales** (opcional)
   - Supabase hace backups automáticos
   - Pero puedes exportar datos manualmente desde Table Editor

4. **Personaliza tu sistema**
   - Sube tus propias diapositivas en video
   - Ajusta precios según tu cafetería
   - Modifica cantidades de reabastecimiento

---

¡Buena suerte con tu sistema de cafetería! 🎉☕
