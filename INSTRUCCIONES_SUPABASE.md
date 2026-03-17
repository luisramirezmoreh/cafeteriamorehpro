# 🚀 Instrucciones para Ejecutar Migración en Supabase

## ⚠️ IMPORTANTE: Debes ejecutar el SQL en Supabase para que funcione

Los errores que ves indican que las columnas `branch_id` aún no existen en tu base de datos.

---

## 📋 Paso 1: Verificar Tabla `service_upgrades`

**Primero, verifica si la tabla `service_upgrades` existe:**

1. Ve a Supabase → Tu proyecto → SQL Editor
2. Copia y pega este comando:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'service_upgrades';
```

3. Ejecuta (Run)

### ¿Qué hacer según el resultado?

- **Si devuelve `service_upgrades`** → La tabla existe, continúa al Paso 2
- **Si no devuelve nada** → La tabla NO existe, ejecuta primero el SQL de creación (ver abajo)

---

## 📋 Si la tabla `service_upgrades` NO existe:

Ejecuta este SQL primero para crearla:

```sql
-- Crear tabla service_upgrades
CREATE TABLE IF NOT EXISTS service_upgrades (
  id TEXT PRIMARY KEY,
  chapel_name TEXT NOT NULL,
  package_type TEXT NOT NULL,
  coffee_count INTEGER NOT NULL,
  coffee_used INTEGER DEFAULT 0,
  price_paid REAL NOT NULL,
  created_at BIGINT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_service_upgrades_chapel ON service_upgrades(chapel_name);
CREATE INDEX IF NOT EXISTS idx_service_upgrades_active ON service_upgrades(is_active);
```

---

## 📋 Paso 2: Ejecutar Migración Multi-Sucursal

1. Ve a Supabase → SQL Editor
2. Copia TODO el contenido del archivo `SUPABASE_MULTISUCURSAL_MIGRATION.sql`
3. Pega en el editor SQL
4. Click en **Run** (ejecutar)

---

## 📋 Paso 3: Migrar Datos Existentes (IMPORTANTE)

Si ya tienes datos en las tablas (productos, ventas, turnos), necesitas asignarlos a una sucursal.

**Ejecuta este SQL para asignar todos los datos actuales a ZAPOPAN:**

```sql
-- Asignar datos existentes a sucursal ZAPOPAN
UPDATE products SET branch_id = 'zapopan', is_enabled = TRUE WHERE branch_id IS NULL;
UPDATE stock_groups SET branch_id = 'zapopan' WHERE branch_id IS NULL;
UPDATE sales SET branch_id = 'zapopan' WHERE branch_id IS NULL;
UPDATE shifts SET branch_id = 'zapopan' WHERE branch_id IS NULL;
UPDATE configuration SET branch_id = 'zapopan' WHERE branch_id IS NULL;

-- Actualizar estado de cafetería (necesita un ID único por sucursal)
-- Primero, eliminar registros antiguos si existen
DELETE FROM cafeteria_state WHERE id IN ('1', '0');

-- Crear registros para cada sucursal con estado inicial
INSERT INTO cafeteria_state (id, branch_id, is_open, initial_money, opened_at, opened_by)
VALUES 
  ('zapopan', 'zapopan', false, 0, 0, ''),
  ('vallarta', 'vallarta', false, 0, 0, ''),
  ('oblatos', 'oblatos', false, 0, 0, '')
ON CONFLICT (id) DO NOTHING;

-- Si tienes service_upgrades (mejoras de servicio)
UPDATE service_upgrades SET branch_id = 'zapopan' WHERE branch_id IS NULL;
```

---

## 📋 Paso 4: Verificar que Todo Funcionó

Ejecuta este SQL para verificar:

```sql
-- Verificar que todas las columnas se crearon
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name IN ('branch_id', 'is_enabled')
ORDER BY table_name, column_name;
```

Deberías ver algo como:

```
table_name          | column_name | data_type
--------------------|-------------|----------
cafeteria_state     | branch_id   | text
configuration       | branch_id   | text
products            | branch_id   | text
products            | is_enabled  | boolean
sales               | branch_id   | text
service_upgrades    | branch_id   | text
shifts              | branch_id   | text
stock_groups        | branch_id   | text
```

---

## 📋 Paso 5: Recargar la Aplicación

1. Cierra el navegador
2. Abre de nuevo tu aplicación
3. Los errores deberían desaparecer
4. Deberías ver el selector de sucursales funcionando

---

## 🔧 Troubleshooting

### Error: "table cafeteria_state already has data"

Si ves este error al ejecutar el INSERT, ejecuta:

```sql
-- Ver qué hay en cafeteria_state
SELECT * FROM cafeteria_state;

-- Si hay datos antiguos, actualízalos:
UPDATE cafeteria_state 
SET branch_id = 'zapopan' 
WHERE branch_id IS NULL;
```

### Error: "could not find table service_upgrades"

Ejecuta primero el SQL de creación de tabla que está en la sección arriba.

### La app sigue mostrando errores después de ejecutar el SQL

1. Ve a Supabase → Table Editor
2. Verifica manualmente que las columnas `branch_id` existen en cada tabla
3. Fuerza recarga en el navegador (Ctrl + Shift + R o Cmd + Shift + R)
4. Revisa la consola del navegador para ver errores más específicos

---

## ✅ Checklist Final

- [ ] Verificar si tabla `service_upgrades` existe
- [ ] Si no existe, crearla con el SQL provisto
- [ ] Ejecutar `SUPABASE_MULTISUCURSAL_MIGRATION.sql` completo
- [ ] Ejecutar SQL de migración de datos (asignar a Zapopan)
- [ ] Ejecutar SQL de verificación
- [ ] Recargar aplicación en el navegador
- [ ] Verificar que no hay errores en consola
- [ ] Probar cambiar de sucursal

---

## 📞 Si Todo Falla

Si después de seguir todos los pasos sigues viendo errores:

1. Toma screenshot de la consola del navegador
2. Ejecuta este SQL y copia el resultado:

```sql
-- Ver estructura de todas las tablas
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('products', 'sales', 'shifts', 'stock_groups', 'cafeteria_state', 'configuration', 'service_upgrades')
ORDER BY table_name, ordinal_position;
```

3. Comparte esa información para diagnóstico más específico

---

**⏱️ Tiempo estimado: 5-10 minutos**

**💾 RECUERDA: Haz un backup de tu base de datos antes de ejecutar cualquier SQL**
