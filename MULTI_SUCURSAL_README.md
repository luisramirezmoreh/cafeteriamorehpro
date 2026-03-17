# Sistema Multi-Sucursal - Cafetería

## 📋 Descripción

El sistema de gestión de inventario ahora soporta **múltiples sucursales** independientes:
- **Zapopan**
- **Vallarta**  
- **Oblatos**

Cada sucursal tiene su propio:
- ✅ Inventario de productos
- ✅ Historial de ventas
- ✅ Turnos y cortes de caja
- ✅ Dinero en caja
- ✅ Video personalizado de screensaver
- ✅ Mejoras de servicio (cafés prepagados)
- ✅ Productos habilitados/deshabilitados

## 🚀 Implementación Completada

### 1. **Tipos y Modelos** (`/src/app/types/inventory.ts`)
- Nuevo tipo `BranchName` con las 3 sucursales
- Interfaz `Branch` para metadatos
- Todos los modelos ahora incluyen `branchId` opcional:
  - `Product.branchId` y `Product.isEnabled`
  - `StockGroup.branchId`
  - `DailySale.branchId`
  - `ShiftRecord.branchId`
  - `CafeteriaState.branchId`
  - `ServiceUpgrade.branchId`

### 2. **Funciones de Supabase** (`/src/lib/supabase-sync.ts`)
- Todas las funciones `load*FromSupabase()` ahora aceptan parámetro `branchId` opcional
- Todas las funciones `sync*ToSupabase()` ahora aceptan parámetro `branchId` opcional
- Filtrado automático por sucursal en queries
- Videos de screensaver separados por sucursal (usando key `screensaver_video_url_{branchId}`)

### 3. **Componente BranchSelector** (`/src/app/components/BranchSelector.tsx`)
- Selector visual de sucursal con 3 botones grandes
- Muestra sucursal activa con indicador verde animado
- **Requiere contraseña de administrador (1062000) para cambiar**
- Modal de confirmación con advertencia clara
- Advertencia sobre datos independientes por sucursal

### 4. **BranchChangeConfirmation** (`/src/app/components/BranchChangeConfirmation.tsx`)
- Modal de confirmación con input de contraseña
- Visualización clara del cambio (sucursal actual → nueva sucursal)
- Validación de contraseña antes de permitir el cambio
- Previene cambios accidentales

### 5. **App.tsx**
- Estado `currentBranch` para sucursal actual
- Función `handleChangeBranch` que:
  - Cambia la sucursal activa
  - Carga datos de la nueva sucursal desde Supabase
  - Si no hay datos, inicializa con productos base
  - Muestra toast de confirmación
- Todas las funciones `save*` ahora pasan el `currentBranch`
- Se guarda la sucursal seleccionada en localStorage

### 6. **AdminPanel.tsx**
- Integra `BranchSelector` en la parte superior
- Recibe props `currentBranch` y `onChangeBranch`
- Muestra datos filtrados por sucursal actual

### 7. **SalesScreen.tsx**
- Filtra productos para mostrar solo los habilitados (`isEnabled !== false`)
- Esto permite habilitar/deshabilitar productos por sucursal

## 📊 Migración de Base de Datos

### Ejecutar en Supabase SQL Editor:

```sql
-- Ver el archivo: SUPABASE_MULTISUCURSAL_MIGRATION.sql
```

Este script:
1. ✅ Agrega columnas `branch_id` a todas las tablas
2. ✅ Agrega columna `is_enabled` a productos
3. ✅ Crea índices para optimizar consultas
4. ✅ Incluye queries opcionales para migrar datos existentes a "zapopan"

## 🎯 Cómo Usar

### Para Administradores:

1. **Seleccionar Sucursal:**
   - Ir al Panel de Administración
   - En la parte superior verás el selector de sucursales
   - Click en el botón de la sucursal deseada
   - El sistema cargará automáticamente los datos de esa sucursal

2. **Habilitar/Deshabilitar Productos por Sucursal:**
   - Ir a "Editar Productos"
   - Cada sucursal puede tener diferentes productos habilitados
   - Los productos deshabilitados no aparecen en Punto de Venta

3. **Video de Screensaver por Sucursal:**
   - Cada sucursal puede subir su propio video
   - El video se guarda específicamente para esa sucursal

### Para Intendencia (Punto de Venta):

1. La tablet se asigna a una sucursal desde el Panel de Administración
2. Solo verán productos habilitados para esa sucursal
3. Las ventas se registran automáticamente para la sucursal actual

## 🔒 Seguridad y Aislamiento de Datos

- ✅ Los datos están **completamente separados** por sucursal
- ✅ Cambiar de sucursal **requiere contraseña de administrador** (1062000)
- ✅ Modal de confirmación con advertencia clara del cambio
- ✅ Previene cambios accidentales de sucursal
- ✅ Las ventas, turnos y stock son independientes
- ✅ Cada sucursal puede ver solo sus propios reportes y estadísticas

## 📱 Sincronización

- ✅ Todos los datos se sincronizan automáticamente con Supabase
- ✅ El sistema funciona con localStorage como fallback
- ✅ Cambiar de sucursal recarga datos desde Supabase
- ✅ La sucursal actual se guarda en localStorage para persistencia

## 🎨 Características Visuales

- Selector de sucursal con diseño moderno
- Indicador visual de sucursal activa (círculo verde animado)
- Nombres en mayúsculas (ZAPOPAN, VALLARTA, OBLATOS)
- Alertas informativos al cambiar de sucursal
- Toast notifications para confirmar cambios

## 📈 Ventajas del Sistema

1. **Escalabilidad:** Fácil agregar nuevas sucursales
2. **Independencia:** Cada sucursal opera de forma autónoma
3. **Centralización:** Todos los datos en la misma base de datos Supabase
4. **Flexibilidad:** Habilitar/deshabilitar productos por sucursal
5. **Personalización:** Videos y configuraciones únicas por sucursal

## 🔄 Flujo de Datos

```
Usuario selecciona sucursal (Admin Panel)
        ↓
App.tsx actualiza currentBranch
        ↓
Se guarda en localStorage
        ↓
Se cargan datos desde Supabase (filtered by branchId)
        ↓
Todas las operaciones usan currentBranch
        ↓
Los datos se sincronizan con branchId
```

## ⚠️ Notas Importantes

1. **Primera vez:** Al seleccionar una sucursal nueva sin datos, se crean automáticamente productos iniciales
2. **Migración:** Datos existentes pueden asignarse a una sucursal con el script SQL
3. **Compatibilidad:** Datos con `branchId = null` son compatibles (datos antiguos)
4. **Videos:** Los screensavers son únicos por sucursal
5. **Mejoras de servicio:** Los cafés prepagados son independientes por sucursal

## 🛠️ Mantenimiento

### Agregar nueva sucursal:

1. Editar `/src/app/types/inventory.ts`:
```typescript
export type BranchName = 'zapopan' | 'vallarta' | 'oblatos' | 'nueva-sucursal';

export const BRANCHES: Branch[] = [
  { id: 'zapopan', name: 'zapopan', displayName: 'Zapopan' },
  { id: 'vallarta', name: 'vallarta', displayName: 'Vallarta' },
  { id: 'oblatos', name: 'oblatos', displayName: 'Oblatos' },
  { id: 'nueva-sucursal', name: 'nueva-sucursal', displayName: 'Nueva Sucursal' },
];
```

2. La aplicación automáticamente mostrará la nueva opción en el selector

## ✅ Testing Checklist

- [ ] Ejecutar migración SQL en Supabase
- [ ] Seleccionar cada sucursal y verificar que se cargan datos correctos
- [ ] Realizar venta en sucursal A y verificar que no aparece en sucursal B
- [ ] Subir video de screensaver diferente en cada sucursal
- [ ] Habilitar/deshabilitar productos y verificar en Punto de Venta
- [ ] Crear mejora de servicio y verificar que es independiente por sucursal
- [ ] Hacer turno y corte en cada sucursal
- [ ] Verificar que el historial de turnos se filtra correctamente

## 📞 Soporte

Si encuentras algún problema:
1. Verifica que ejecutaste el script SQL de migración
2. Revisa la consola del navegador para errores
3. Confirma que Supabase está correctamente configurado
4. Verifica que los índices se crearon correctamente

---

**¡El sistema multi-sucursal está completamente implementado y listo para usar! 🎉**