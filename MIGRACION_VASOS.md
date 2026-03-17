# 🔧 Migración: Sistema de Vasos para Capuchinos

## ⚠️ IMPORTANTE: Actualizar Supabase

Este sistema ahora incluye:
1. **Control de inventario de vasos** - Cada vez que se vende un capuchino, se descuenta automáticamente 1 vaso
2. **Desactivación de mejoras de servicio al cerrar** - Al hacer "Entregar Turno" o "Hacer Corte", todas las mejoras activas se desactivan automáticamente

---

## 📝 SQL para Ejecutar en Supabase

Ve a tu proyecto de Supabase → **SQL Editor** → Pega y ejecuta el siguiente código:

```sql
-- Agregar columnas para control de vasos en la tabla cafeteria_state
ALTER TABLE cafeteria_state 
ADD COLUMN IF NOT EXISTS initial_cups INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_cups INTEGER DEFAULT 0;

-- Comentarios para documentar las columnas
COMMENT ON COLUMN cafeteria_state.initial_cups IS 'Número de vasos al inicio del turno';
COMMENT ON COLUMN cafeteria_state.current_cups IS 'Número de vasos actuales (se descuenta con cada capuchino vendido)';
```

---

## ✅ Cómo Funciona

### 1️⃣ **Sistema de Vasos**

**Al Abrir Cafetería:**
- El sistema pregunta cuántos vasos hay disponibles
- Se debe contar manualmente y escribir el número
- Este número se guarda como `initial_cups` y `current_cups`

**Al Vender un Capuchino:**
- Automáticamente se descuenta 1 vaso de `current_cups`
- Si no hay suficientes vasos, **NO permite la venta** y muestra un error

**Control Manual:**
- Hay un botón **"🥤 Vasos"** debajo de las mejoras de servicio en la sección de Capuchinos
- Al hacer clic, se abre un modal que permite ajustar la cantidad manualmente (agregar o quitar vasos)

### 2️⃣ **Mejoras de Servicio**

**Al Cerrar Cafetería (Entregar Turno o Hacer Corte):**
- Todas las mejoras de servicio activas (Armonía, Bonanza, Concordia) se desactivan automáticamente
- La próxima vez que abras la cafetería, NO estarán activas
- Esto evita que las promos se mantengan activas indefinidamente

---

## 🎯 Ventajas del Sistema

✅ **Control exacto** del inventario de vasos  
✅ **Evita quedarse sin vasos** durante el turno  
✅ **Ajuste manual** de vasos en tiempo real  
✅ **Desactivación automática** de mejoras al cerrar  
✅ **Registro histórico** de cuántos vasos se usaron  
✅ **Sincronización automática** con Supabase (nube)  

---

## 🚀 Después de la Migración

1. ✅ Ejecuta el SQL en Supabase
2. ✅ El código ya está actualizado
3. ✅ Prueba abriendo la cafetería y registrando vasos
4. ✅ Prueba cerrando la cafetería y verifica que las mejoras se desactivan

---

## 📸 Flujo de Uso

### **Apertura de Cafetería:**
```
1. Click "Abrir Cafetería"
   ↓
2. Ingresar dinero de cambio inicial
   ↓
3. Ingresar número de vasos (NUEVO)
   ↓
4. Click "Confirmar y Abrir"
```

### **Durante el Turno:**
```
1. Al vender capuchino → Se descuenta 1 vaso automáticamente
   ↓
2. Si necesitas ajustar vasos → Click en "🥤 Vasos: X"
   ↓
3. Ajusta con +/- y confirma
```

### **Cierre de Cafetería:**
```
1. Click "Entregar Turno" o "Hacer Corte"
   ↓
2. Todas las mejoras de servicio se desactivan automáticamente
   ↓
3. La cafetería se cierra y las promos ya NO estarán activas
```

---

## ❓ Preguntas Frecuentes

**¿Los vasos NO se pueden vender solos?**  
✅ Correcto. Los vasos solo se usan para capuchinos y NO aparecen en la pantalla de ventas como producto individual.

**¿Puedo agregar vasos manualmente durante el turno?**  
✅ Sí! Usa el botón "🥤 Vasos" en la sección de Capuchinos.

**¿Qué pasa si tengo una mejora activa y cierro la cafetería?**  
✅ La mejora se desactiva automáticamente. No aparecerá la próxima vez que abras.

---

¿Dudas? Revisa la consola del navegador (F12) para ver logs de sincronización con Supabase.