-- ============================================================================
-- SQL COMPLETO PARA SISTEMA MULTI-SUCURSAL
-- ============================================================================
-- COPIA TODO ESTE ARCHIVO Y PÉGALO EN SUPABASE SQL EDITOR
-- Luego presiona "Run" para ejecutar
-- ============================================================================

-- ============================================================================
-- PASO 1: CREAR TABLA service_upgrades SI NO EXISTE
-- ============================================================================

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

-- ============================================================================
-- PASO 2: AGREGAR COLUMNAS branch_id A TODAS LAS TABLAS
-- ============================================================================

-- Productos: Agregar branch_id e is_enabled
ALTER TABLE products ADD COLUMN IF NOT EXISTS branch_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT TRUE;

-- Grupos de stock
ALTER TABLE stock_groups ADD COLUMN IF NOT EXISTS branch_id TEXT;

-- Ventas
ALTER TABLE sales ADD COLUMN IF NOT EXISTS branch_id TEXT;

-- Turnos
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS branch_id TEXT;

-- Estado de cafetería (cambiar id a TEXT para soportar IDs por sucursal)
ALTER TABLE cafeteria_state DROP CONSTRAINT IF EXISTS cafeteria_state_pkey;
ALTER TABLE cafeteria_state ALTER COLUMN id TYPE TEXT;
ALTER TABLE cafeteria_state ADD PRIMARY KEY (id);
ALTER TABLE cafeteria_state ADD COLUMN IF NOT EXISTS branch_id TEXT;

-- Configuración
ALTER TABLE configuration ADD COLUMN IF NOT EXISTS branch_id TEXT;

-- Mejoras de servicio
ALTER TABLE service_upgrades ADD COLUMN IF NOT EXISTS branch_id TEXT;

-- ============================================================================
-- PASO 3: CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_branch ON products(branch_id);
CREATE INDEX IF NOT EXISTS idx_products_enabled ON products(is_enabled);
CREATE INDEX IF NOT EXISTS idx_stock_groups_branch ON stock_groups(branch_id);
CREATE INDEX IF NOT EXISTS idx_sales_branch ON sales(branch_id);
CREATE INDEX IF NOT EXISTS idx_sales_timestamp ON sales(timestamp);
CREATE INDEX IF NOT EXISTS idx_shifts_branch ON shifts(branch_id);
CREATE INDEX IF NOT EXISTS idx_shifts_start_time ON shifts(start_time);
CREATE INDEX IF NOT EXISTS idx_cafeteria_state_branch ON cafeteria_state(branch_id);
CREATE INDEX IF NOT EXISTS idx_configuration_branch ON configuration(branch_id);
CREATE INDEX IF NOT EXISTS idx_service_upgrades_branch ON service_upgrades(branch_id);
CREATE INDEX IF NOT EXISTS idx_service_upgrades_chapel ON service_upgrades(chapel_name);
CREATE INDEX IF NOT EXISTS idx_service_upgrades_active ON service_upgrades(is_active);

-- ============================================================================
-- PASO 4: MIGRAR DATOS EXISTENTES A SUCURSAL ZAPOPAN
-- ============================================================================

-- Asignar todos los productos existentes a Zapopan
UPDATE products 
SET branch_id = 'zapopan', 
    is_enabled = TRUE 
WHERE branch_id IS NULL;

-- Asignar grupos de stock a Zapopan
UPDATE stock_groups 
SET branch_id = 'zapopan' 
WHERE branch_id IS NULL;

-- Asignar ventas a Zapopan
UPDATE sales 
SET branch_id = 'zapopan' 
WHERE branch_id IS NULL;

-- Asignar turnos a Zapopan
UPDATE shifts 
SET branch_id = 'zapopan' 
WHERE branch_id IS NULL;

-- Asignar configuración a Zapopan
UPDATE configuration 
SET branch_id = 'zapopan' 
WHERE branch_id IS NULL;

-- Asignar mejoras de servicio a Zapopan
UPDATE service_upgrades 
SET branch_id = 'zapopan' 
WHERE branch_id IS NULL;

-- ============================================================================
-- PASO 5: CONFIGURAR ESTADO DE CAFETERÍA PARA CADA SUCURSAL
-- ============================================================================

-- Primero, actualizar registros existentes
UPDATE cafeteria_state 
SET id = 'zapopan', 
    branch_id = 'zapopan' 
WHERE id IN ('1', '0', 1::TEXT, 0::TEXT);

-- Luego, crear registros para las otras sucursales si no existen
INSERT INTO cafeteria_state (id, branch_id, is_open, initial_money, opened_at, opened_by)
VALUES 
  ('zapopan', 'zapopan', false, 0, 0, ''),
  ('vallarta', 'vallarta', false, 0, 0, ''),
  ('oblatos', 'oblatos', false, 0, 0, '')
ON CONFLICT (id) DO UPDATE SET
  branch_id = EXCLUDED.branch_id,
  is_open = COALESCE(cafeteria_state.is_open, EXCLUDED.is_open),
  initial_money = COALESCE(cafeteria_state.initial_money, EXCLUDED.initial_money);

-- ============================================================================
-- PASO 6: AGREGAR COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================================

COMMENT ON COLUMN products.branch_id IS 'Sucursal: zapopan, vallarta, oblatos';
COMMENT ON COLUMN products.is_enabled IS 'Producto habilitado para venta en esta sucursal';
COMMENT ON COLUMN stock_groups.branch_id IS 'Sucursal del grupo de stock';
COMMENT ON COLUMN sales.branch_id IS 'Sucursal donde se realizó la venta';
COMMENT ON COLUMN shifts.branch_id IS 'Sucursal del turno';
COMMENT ON COLUMN cafeteria_state.branch_id IS 'Sucursal del estado de cafetería';
COMMENT ON COLUMN configuration.branch_id IS 'Sucursal de la configuración';
COMMENT ON COLUMN service_upgrades.branch_id IS 'Sucursal de la mejora de servicio';

-- ============================================================================
-- PASO 7: VERIFICAR QUE TODO SE CREÓ CORRECTAMENTE
-- ============================================================================

-- Ver todas las columnas branch_id e is_enabled creadas
SELECT 
  table_name, 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name IN ('branch_id', 'is_enabled')
ORDER BY table_name, column_name;

-- Ver índices creados
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND (indexname LIKE '%branch%' OR indexname LIKE '%enabled%')
ORDER BY tablename, indexname;

-- Ver cuántos registros hay por sucursal en cada tabla
SELECT 'products' as tabla, branch_id, COUNT(*) as total
FROM products
GROUP BY branch_id
UNION ALL
SELECT 'stock_groups' as tabla, branch_id, COUNT(*) as total
FROM stock_groups
GROUP BY branch_id
UNION ALL
SELECT 'sales' as tabla, branch_id, COUNT(*) as total
FROM sales
GROUP BY branch_id
UNION ALL
SELECT 'shifts' as tabla, branch_id, COUNT(*) as total
FROM shifts
GROUP BY branch_id
UNION ALL
SELECT 'cafeteria_state' as tabla, branch_id, COUNT(*) as total
FROM cafeteria_state
GROUP BY branch_id
UNION ALL
SELECT 'service_upgrades' as tabla, branch_id, COUNT(*) as total
FROM service_upgrades
GROUP BY branch_id
ORDER BY tabla, branch_id;

-- ============================================================================
-- ✅ MIGRACIÓN COMPLETADA
-- ============================================================================

-- SIGUIENTES PASOS:
-- 1. Revisa los resultados de las queries de verificación arriba
-- 2. Recarga tu aplicación (Ctrl + Shift + R)
-- 3. Los errores deberían desaparecer
-- 4. Deberías poder cambiar entre sucursales

-- NOTAS:
-- - Todos tus datos existentes ahora están en la sucursal "zapopan"
-- - Las sucursales "vallarta" y "oblatos" empiezan vacías
-- - Puedes copiar productos de una sucursal a otra desde el panel de admin
-- - Cada sucursal tendrá su propio inventario, ventas y dinero independiente
