-- ============================================================================
-- MIGRACIÓN MULTI-SUCURSAL PARA SISTEMA DE CAFETERÍA
-- ============================================================================
-- Este script agrega soporte para múltiples sucursales (Zapopan, Vallarta, Oblatos)
-- permitiendo que cada sucursal maneje su inventario, ventas y configuraciones de forma independiente.

-- ============================================================================
-- 1. AGREGAR COLUMNAS BRANCH_ID A TODAS LAS TABLAS
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
-- Nota: Si ya tienes datos, primero respalda la tabla
ALTER TABLE cafeteria_state DROP CONSTRAINT IF EXISTS cafeteria_state_pkey;
ALTER TABLE cafeteria_state ALTER COLUMN id TYPE TEXT;
ALTER TABLE cafeteria_state ADD PRIMARY KEY (id);
ALTER TABLE cafeteria_state ADD COLUMN IF NOT EXISTS branch_id TEXT;

-- Configuración
ALTER TABLE configuration ADD COLUMN IF NOT EXISTS branch_id TEXT;

-- Mejoras de servicio
ALTER TABLE service_upgrades ADD COLUMN IF NOT EXISTS branch_id TEXT;

-- ============================================================================
-- 2. CREAR ÍNDICES PARA MEJORAR RENDIMIENTO DE CONSULTAS POR SUCURSAL
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

-- ============================================================================
-- 3. COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================================

COMMENT ON COLUMN products.branch_id IS 'Sucursal a la que pertenece el producto (zapopan, vallarta, oblatos). NULL = dato antiguo sin sucursal';
COMMENT ON COLUMN products.is_enabled IS 'Indica si el producto está habilitado para venta en esta sucursal';
COMMENT ON COLUMN stock_groups.branch_id IS 'Sucursal del grupo de stock';
COMMENT ON COLUMN sales.branch_id IS 'Sucursal donde se realizó la venta';
COMMENT ON COLUMN shifts.branch_id IS 'Sucursal del turno';
COMMENT ON COLUMN cafeteria_state.branch_id IS 'Sucursal del estado de cafetería';
COMMENT ON COLUMN configuration.branch_id IS 'Sucursal de la configuración (ej: video de screensaver)';
COMMENT ON COLUMN service_upgrades.branch_id IS 'Sucursal de la mejora de servicio';

-- ============================================================================
-- 4. MIGRACIÓN DE DATOS EXISTENTES (OPCIONAL)
-- ============================================================================
-- Si ya tienes datos y quieres asignarlos a una sucursal específica,
-- descomenta y ejecuta las siguientes líneas:

-- Asignar todos los datos existentes a la sucursal "zapopan"
-- UPDATE products SET branch_id = 'zapopan', is_enabled = TRUE WHERE branch_id IS NULL;
-- UPDATE stock_groups SET branch_id = 'zapopan' WHERE branch_id IS NULL;
-- UPDATE sales SET branch_id = 'zapopan' WHERE branch_id IS NULL;
-- UPDATE shifts SET branch_id = 'zapopan' WHERE branch_id IS NULL;
-- UPDATE cafeteria_state SET id = 'zapopan', branch_id = 'zapopan' WHERE id = '1' OR id = 1::TEXT;
-- UPDATE configuration SET branch_id = 'zapopan' WHERE branch_id IS NULL;
-- UPDATE service_upgrades SET branch_id = 'zapopan' WHERE branch_id IS NULL;

-- ============================================================================
-- 5. VERIFICAR LA MIGRACIÓN
-- ============================================================================

-- Verificar que todas las columnas se crearon correctamente
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name IN ('branch_id', 'is_enabled')
ORDER BY table_name, column_name;

-- Ver índices creados
SELECT 
  indexname, 
  tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE '%branch%'
ORDER BY tablename;

-- ============================================================================
-- 6. CONSULTAS ÚTILES PARA ADMINISTRACIÓN
-- ============================================================================

-- Ver productos por sucursal
-- SELECT branch_id, COUNT(*) as total_productos
-- FROM products
-- GROUP BY branch_id;

-- Ver ventas por sucursal (últimos 7 días)
-- SELECT 
--   branch_id,
--   COUNT(*) as total_ventas,
--   SUM(total) as total_ingresos
-- FROM sales
-- WHERE timestamp >= EXTRACT(EPOCH FROM NOW() - INTERVAL '7 days') * 1000
-- GROUP BY branch_id;

-- Ver estado de cafeterías
-- SELECT 
--   branch_id,
--   is_open,
--   initial_money,
--   opened_at
-- FROM cafeteria_state
-- ORDER BY branch_id;

-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================

-- NOTAS IMPORTANTES:
-- 1. Respalda tu base de datos antes de ejecutar este script
-- 2. Las columnas branch_id aceptan NULL para compatibilidad con datos antiguos
-- 3. Los valores válidos para branch_id son: 'zapopan', 'vallarta', 'oblatos'
-- 4. La aplicación filtra automáticamente por sucursal seleccionada
-- 5. El video de screensaver es independiente por sucursal
