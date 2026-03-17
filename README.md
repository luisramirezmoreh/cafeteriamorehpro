# ☕ Sistema de Gestión de Inventario - Cafetería Multi-sucursal

Sistema completo de punto de venta y gestión de inventario para cafeterías con múltiples sucursales, conectado a Supabase para almacenamiento en la nube.

## 🌟 Características Principales

### 📱 Panel de Ventas (Intendencia)
- ✅ Interface optimizada para tablets
- ✅ Carrito de compras con cálculo automático
- ✅ Control de turnos (abrir/cerrar cafetería)
- ✅ Panel especializado para Capuchinos
- ✅ Sistema de vasos con descuento automático
- ✅ Mejoras de servicio para capillas
- ✅ Métodos de pago (efectivo/transferencia)
- ✅ Protector de pantalla con video personalizado

### 🔐 Panel Administrativo (Clave: 1062000)
- ✅ Gestión completa de inventario
- ✅ Historial de ventas y turnos
- ✅ Reabastecimiento por paquetes
- ✅ Editor de productos (crear/editar/eliminar)
- ✅ Configuración multi-sucursal
- ✅ Subida de videos personalizados
- ✅ Reportes de corte de caja

### 🏢 Sistema Multi-Sucursal
- ✅ 3 sucursales: Zapopan, Vallarta, Oblatos
- ✅ Inventario independiente por sucursal
- ✅ Ventas separadas por ubicación
- ✅ Configuración de productos habilitados/deshabilitados por sucursal

### ☁️ Sincronización en la Nube
- ✅ Almacenamiento permanente en Supabase
- ✅ Sincronización automática de ventas
- ✅ Backup de inventarios
- ✅ Acceso desde múltiples dispositivos

## 🚀 Tecnologías

- **Frontend:** React 18 + TypeScript
- **Estilos:** Tailwind CSS v4
- **Base de datos:** Supabase (PostgreSQL)
- **UI Components:** Radix UI + shadcn/ui
- **Notificaciones:** Sonner
- **Build:** Vite
- **Hosting:** Vercel

## 📦 Instalación Local

### Prerrequisitos
- Node.js >= 18.0.0
- Cuenta de Supabase (gratuita)

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
cd TU_REPOSITORIO
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

4. **Ejecutar migraciones en Supabase**

Ve a tu proyecto en Supabase → SQL Editor → New Query

Ejecuta en orden:
- `EJECUTAR_ESTE_SQL_COMPLETO.sql` (migración inicial)
- `MIGRACION_VASOS.md` (sistema de vasos)

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

6. **Abrir en el navegador**
```
http://localhost:5173
```

## 🔧 Comandos Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 📱 Uso del Sistema

### Iniciar Turno
1. Click en "Abrir Cafetería"
2. Ingresar dinero inicial de cambio
3. Contar vasos disponibles
4. Confirmar inventario inicial

### Realizar Venta
1. Seleccionar productos (click en tarjetas)
2. Verificar carrito lateral
3. Click en "Completar Venta"
4. Seleccionar método de pago

### Panel de Capuchinos
1. Click en el botón "☕ Capuchinos"
2. Agregar productos al carrito
3. Aplicar/redimir mejoras de servicio
4. Ajustar inventario de vasos
5. Completar venta (regresa automáticamente)

### Cerrar Turno
1. Click en "Entregar Turno"
2. Registrar información del encargado
3. Se genera reporte automático

### Corte de Caja
1. Click en "Cerrar Cafetería"
2. Ingresar dinero final de caja
3. Sistema calcula diferencias
4. Mejoras de servicio se desactivan

## 🔐 Acceso Administrativo

**Clave:** `1062000`

Funciones disponibles:
- Ver historial completo de ventas
- Editar inventarios
reabastecer productos
- Crear/editar/eliminar productos
- Cambiar entre sucursales
- Configurar productos por sucursal
- Subir videos personalizados

## 🏢 Sucursales

| Sucursal | Capuchinos | Estado |
|----------|-----------|---------|
| Zapopan  | ✅ Habilitado | Activa |
| Vallarta | ❌ Deshabilitado | Activa |
| Oblatos  | ❌ Deshabilitado | Activa |

## 📊 Estructura de Datos

### Productos
- ID único
- Nombre y precio
- Stock actual
- Cantidad de reorden
- Categoría
- Grupo de stock (opcional)

### Ventas
- Items vendidos
- Total
- Método de pago
- Timestamp
- Sucursal

### Turnos
- Encargado
- Dinero inicial/final
- Productos vendidos
- Timestamp inicio/fin
- Sucursal

## 🐛 Solución de Problemas

### El build falla en Vercel
- Verifica que `package.json` esté en la raíz
- Confirma que `.gitignore` incluye `node_modules`
- Revisa que las variables de entorno estén configuradas

### No se guardan los datos
- Verifica la conexión a Supabase
- Revisa las variables de entorno
- Confirma que ejecutaste las migraciones SQL

### Los capuchinos no descuentan vasos
- Asegúrate de haber ejecutado `MIGRACION_VASOS.md`
- Verifica que `currentCups` tenga valor en cafeteria_state

## 📝 Documentación Adicional

- [`GUIA_DEPLOYMENT.md`](GUIA_DEPLOYMENT.md) - Cómo subir cambios a GitHub/Vercel
- [`MIGRACION_VASOS.md`](MIGRACION_VASOS.md) - Sistema de control de vasos
- [`MULTI_SUCURSAL_README.md`](MULTI_SUCURSAL_README.md) - Configuración multi-sucursal
- [`INSTRUCCIONES_SUPABASE.md`](INSTRUCCIONES_SUPABASE.md) - Setup de Supabase

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

## 👤 Autor

Sistema desarrollado para gestión de cafeterías institucionales

---

**Versión:** 2.0.0  
**Última actualización:** Marzo 2026
