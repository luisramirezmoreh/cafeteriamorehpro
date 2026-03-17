-- ============================================
-- MIGRACIONES PARA SISTEMA MULTI-SUCURSAL
-- Versión Segura - Verifica existencia de tablas
-- ============================================

-- 1. Agregar branch_id a products (si la tabla existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
    ALTER TABLE products ADD COLUMN IF NOT EXISTS branch_id TEXT DEFAULT 'zapopan';
    CREATE INDEX IF NOT EXISTS idx_products_branch_id ON products(branch_id);
  END IF;
END $$;

-- 2. Agregar branch_id a stock_groups (si la tabla existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stock_groups') THEN
    ALTER TABLE stock_groups ADD COLUMN IF NOT EXISTS branch_id TEXT DEFAULT 'zapopan';
    CREATE INDEX IF NOT EXISTS idx_stock_groups_branch_id ON stock_groups(branch_id);
  END IF;
END $$;

-- 3. Agregar branch_id a sales (si la tabla existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sales') THEN
    ALTER TABLE sales ADD COLUMN IF NOT EXISTS branch_id TEXT DEFAULT 'zapopan';
    CREATE INDEX IF NOT EXISTS idx_sales_branch_id ON sales(branch_id);
  END IF;
END $$;

-- 4. Agregar branch_id a shifts (si la tabla existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'shifts') THEN
    ALTER TABLE shifts ADD COLUMN IF NOT EXISTS branch_id TEXT DEFAULT 'zapopan';
    CREATE INDEX IF NOT EXISTS idx_shifts_branch_id ON shifts(branch_id);
  END IF;
END $$;

-- 5. Agregar branch_id a cafeteria_state (si la tabla existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cafeteria_state') THEN
    ALTER TABLE cafeteria_state ADD COLUMN IF NOT EXISTS branch_id TEXT DEFAULT 'zapopan';
    CREATE INDEX IF NOT EXISTS idx_cafeteria_state_branch_id ON cafeteria_state(branch_id);
  END IF;
END $$;

-- 6. Agregar branch_id a configuration (si la tabla existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'configuration') THEN
    ALTER TABLE configuration ADD COLUMN IF NOT EXISTS branch_id TEXT DEFAULT 'zapopan';
    CREATE INDEX IF NOT EXISTS idx_configuration_branch_id ON configuration(branch_id);
  END IF;
END $$;

-- 7. Crear tabla service_upgrades
CREATE TABLE IF NOT EXISTS service_upgrades (
  id TEXT PRIMARY KEY,
  chapel TEXT NOT NULL,
  total_coffees INTEGER NOT NULL,
  remaining_coffees INTEGER NOT NULL,
  total_cost NUMERIC(10, 2) NOT NULL,
  timestamp BIGINT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  branch_id TEXT DEFAULT 'zapopan',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_upgrades_branch_id ON service_upgrades(branch_id);
CREATE INDEX IF NOT EXISTS idx_service_upgrades_chapel ON service_upgrades(chapel);
CREATE INDEX IF NOT EXISTS idx_service_upgrades_active ON service_upgrades(is_active);

-- 8. Habilitar Row Level Security (RLS) para service_upgrades
ALTER TABLE service_upgrades ENABLE ROW LEVEL SECURITY;

-- 9. Crear política para permitir todas las operaciones en service_upgrades
DROP POLICY IF EXISTS "Enable all operations for service_upgrades" ON service_upgrades;

CREATE POLICY "Enable all operations for service_upgrades" 
ON service_upgrades 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 10. Verificación final
SELECT 'Migración completada exitosamente!' as status;