# 📱 Sistema de Gestión de Inventario - Cafetería

## 🎯 ¿Qué Acabamos de Hacer?

Hemos integrado **Supabase** (base de datos en la nube) en tu sistema de cafetería para tener almacenamiento permanente y confiable.

---

## 📦 Lo Que Incluye Ahora

### ✅ Backend con Supabase

- **Base de datos PostgreSQL** para productos, ventas, turnos
- **Almacenamiento de archivos** para videos de diapositivas
- **Sincronización automática** con localStorage como backup
- **100% Gratis** para tu caso de uso

### ✅ Características del Sistema

1. **Inventario Inteligente**
   - Control de stock por producto y grupos compartidos
   - Sistema de reabastecimiento automático
   - Descuento automático de complementos (tenedores, galletas saladitas para Maruchan)

2. **Gestión de Ventas**
   - Registro de todas las ventas en tiempo real
   - Cálculo automático de totales
   - Historial completo de transacciones

3. **Control de Turnos**
   - Apertura/cierre de cafetería con confirmación
   - Registro de dinero en caja
   - Cortes de turno con reportes

4. **Personalización**
   - Subida de videos personalizados
   - Almacenamiento permanente en Supabase

---

## 🚀 Pasos para Implementar (RESUMEN)

### 1️⃣ Configurar Supabase (5 minutos)

1. Edita `/src/lib/supabase.ts`
2. Reemplaza las credenciales con las tuyas
3. Guarda el archivo

### 2️⃣ Construir la Aplicación (1 minuto)

```bash
npm run build
```

### 3️⃣ Desplegar en Vercel (2 minutos)

```bash
npm install -g vercel
vercel
```

### 4️⃣ Abrir en la Tablet

1. Abre el navegador en tu tablet
2. Ve a la URL que te dio Vercel
3. Añade a pantalla de inicio
4. ¡Listo!

---

## 📂 Archivos Importantes

### Configuración de Supabase

- `/src/lib/supabase.ts` - **EDITA ESTE ARCHIVO** con tus credenciales
- `/src/lib/supabase-sync.ts` - Funciones de sincronización (no tocar)

### Componentes Principales

- `/src/app/App.tsx` - Aplicación principal
- `/src/app/components/SalesScreen.tsx` - Pantalla de ventas
- `/src/app/components/AdminPanel.tsx` - Panel administrativo
- `/src/app/components/VideoUploader.tsx` - Subida de videos

### Documentación

- `/INSTRUCCIONES_SUPABASE.md` - **LEE ESTO PRIMERO** - Instrucciones detalladas
- `/README_IMPLEMENTACION.md` - Este archivo (resumen)

---

## 🔧 Estructura de la Base de Datos

### Tablas Creadas en Supabase

| Tabla | Descripción |
|-------|-------------|
| `products` | Productos individuales del inventario |
| `stock_groups` | Grupos de stock compartido (papitas, galletas) |
| `sales` | Registro de todas las ventas |
| `shifts` | Registro de turnos y cortes |
| `cafeteria_state` | Estado actual de la cafetería (abierta/cerrada) |
| `configuration` | Configuraciones (URL del video, etc.) |

### Bucket de Storage

| Bucket | Descripción |
|--------|-------------|
| `cafeteria-videos` | Videos de pantalla de inicio |

---

## 💡 Cómo Funciona la Sincronización

```
┌─────────────┐
│   TABLET    │
│  (Browser)  │
└──────┬──────┘
       │
       ├─→ localStorage (caché rápido)
       │
       └─→ Supabase (fuente de verdad)
              │
              ├─→ PostgreSQL (datos)
              └─→ Storage (videos)
```

1. **Cuando haces una venta:**
   - Se guarda en localStorage (instantáneo)
   - Se sincroniza con Supabase (en segundo plano)

2. **Cuando abres la app:**
   - Primero intenta cargar de Supabase
   - Si no hay internet, usa localStorage
   - Si localStorage está vacío, usa datos iniciales

3. **Cuando subes un video:**
   - Se sube a Supabase Storage
   - Se guarda la URL en la base de datos
   - Persiste permanentemente

---

## 🎓 Flujo de Trabajo Diario

### Apertura de Cafetería

1. Personal abre la tablet
2. Presiona "Abrir Cafetería"
3. Revisa el inventario en el modal
4. Ingresa el dinero de cambio inicial
5. Confirma → Sistema registra hora, stock y dinero

### Durante el Día

1. Se hacen ventas normales
2. Cada venta actualiza automáticamente:
   - Stock de productos
   - Dinero en caja
   - Historial de ventas

### Entrega de Turno

1. Personal saliente presiona "Entregar Turno"
2. Sistema muestra:
   - Dinero esperado vs. dinero reportado
   - Diferencias de inventario
3. Se registra el turno en Supabase

### Cierre de Cafetería (Corte)

1. Personal presiona "Hacer Corte"
2. Ingresa dinero que deja como cambio
3. Sistema:
   - Cierra la cafetería
   - Registra el corte
   - Reinicia el contador de caja

---

## 🔐 Panel Administrativo

**Clave de acceso:** `1062000`

### Funcionalidades

1. **Gestión de Inventario**
   - Actualizar stock manualmente
   - Reabastecer productos
   - Ver alertas de stock bajo

2. **Reportes**
   - Ventas del día
   - Historial de turnos
   - Diferencias de dinero

3. **Personalización**
   - Subir videos personalizados
   - Configurar precios
   - Ajustar cantidades de reabastecimiento

---

## 📊 Categorías de Productos

| Categoría | Productos | Precio |
|-----------|-----------|--------|
| **Maruchan** | 4 tipos + tenedores + galletas saladitas | $30 |
| **Papitas** | 6 tipos (stock compartido) | $25 |
| **Capuchinos** | 5 variedades | $25 |
| **Otros** | Galletas (3), Chocolates, Pingüinos, Gansitos | $5-$20 |

---

## ⚠️ Notas Importantes

### Lógica Especial de Maruchan

Cuando vendes 1 Maruchan, el sistema automáticamente descuenta:
- 1 Maruchan del inventario
- 1 Tenedor del inventario
- 1 Sobre de galletas saladitas del inventario

### Stock Compartido

Las **papitas** y **galletas** comparten stock:
- Al reabastecer "Papitas (Paquete Surtido)", se agregan 50 unidades al stock compartido
- Cualquier venta de papitas (Chetos, Ruffles, etc.) descuenta del mismo stock
- Igual para las galletas (Príncipes, Trikitrakes, Plativolos)

---

## 🆘 Soporte

### Verificar que Supabase Funciona

1. Abre la aplicación
2. Presiona F12 (o Ctrl+Shift+I) para abrir DevTools
3. Ve a la pestaña "Console"
4. Busca mensajes como:
   - ✅ "Productos sincronizados con Supabase"
   - ✅ "Venta sincronizada con Supabase"
   - ❌ "Error al sincronizar..." (si algo falla)

### Logs Útiles

El sistema imprime en consola:
- ✅ Éxito al sincronizar
- ❌ Errores de conexión
- ⚠️ Advertencias de configuración

### Ver Datos en Supabase

1. Ve a [app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Table Editor**
4. Haz clic en cualquier tabla para ver los datos

---

## 🎉 ¡Todo Configurado!

Ahora tienes:
- ✅ Sistema profesional de cafetería
- ✅ Base de datos en la nube
- ✅ Almacenamiento permanente
- ✅ Acceso desde múltiples dispositivos
- ✅ Backup automático
- ✅ Completamente gratis (plan gratuito de Supabase)

**Siguiente paso:** Lee `/INSTRUCCIONES_SUPABASE.md` para configurar tus credenciales y desplegar la app.
