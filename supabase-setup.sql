-- ==========================================
-- SCRIPT DE CONFIGURACIÓN DE SUPABASE
-- Sistema de Gestión de Inventario - Cafetería
-- ==========================================

-- Ejecuta este script completo en Supabase SQL Editor
-- (Ve a tu proyecto → SQL Editor → New Query → Pega este código → Run)

-- ==========================================
-- CREAR TABLAS
-- ==========================================

-- Tabla de productos
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  stock INTEGER NOT NULL,
  reorder_quantity INTEGER NOT NULL,
  stock_group_id TEXT,
  image_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de grupos de stock compartido
CREATE TABLE stock_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stock INTEGER NOT NULL,
  reorder_quantity INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE sales (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de turnos/cortes
CREATE TABLE shifts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  shift_type TEXT NOT NULL,
  start_time BIGINT NOT NULL,
  end_time BIGINT NOT NULL,
  start_stock JSONB NOT NULL,
  end_stock JSONB NOT NULL,
  expected_money NUMERIC NOT NULL,
  reported_money NUMERIC NOT NULL,
  is_corte BOOLEAN NOT NULL,
  change_money NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de estado de cafetería
CREATE TABLE cafeteria_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  is_open BOOLEAN NOT NULL DEFAULT false,
  opened_at BIGINT,
  current_shift_start_time BIGINT,
  initial_stock JSONB,
  initial_money NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insertar estado inicial
INSERT INTO cafeteria_state (id, is_open, initial_money) 
VALUES (1, false, 0)
ON CONFLICT (id) DO NOTHING;

-- Tabla para configuración (como la URL del video)
CREATE TABLE configuration (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- HABILITAR ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafeteria_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- CREAR POLÍTICAS (PERMITIR TODO)
-- ==========================================

-- Políticas para products
CREATE POLICY "Enable all for products" ON products FOR ALL USING (true) WITH CHECK (true);

-- Políticas para stock_groups
CREATE POLICY "Enable all for stock_groups" ON stock_groups FOR ALL USING (true) WITH CHECK (true);

-- Políticas para sales
CREATE POLICY "Enable all for sales" ON sales FOR ALL USING (true) WITH CHECK (true);

-- Políticas para shifts
CREATE POLICY "Enable all for shifts" ON shifts FOR ALL USING (true) WITH CHECK (true);

-- Políticas para cafeteria_state
CREATE POLICY "Enable all for cafeteria_state" ON cafeteria_state FOR ALL USING (true) WITH CHECK (true);

-- Políticas para configuration
CREATE POLICY "Enable all for configuration" ON configuration FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- ==========================================

CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_timestamp ON sales(timestamp);
CREATE INDEX idx_shifts_start_time ON shifts(start_time);
CREATE INDEX idx_products_category ON products(category);

-- ==========================================
-- FUNCIONES AUXILIARES (OPCIONAL)
-- ==========================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_groups_updated_at BEFORE UPDATE ON stock_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cafeteria_state_updated_at BEFORE UPDATE ON cafeteria_state
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuration_updated_at BEFORE UPDATE ON configuration
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- VERIFICACIÓN
-- ==========================================

-- Consulta para verificar que todas las tablas se crearon correctamente
SELECT 
    tablename, 
    schemaname 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'stock_groups', 'sales', 'shifts', 'cafeteria_state', 'configuration')
ORDER BY tablename;

-- ==========================================
-- ✅ SCRIPT COMPLETADO
-- ==========================================

-- Deberías ver un mensaje de éxito y 6 tablas listadas en el resultado.
-- 
-- Siguiente paso:
-- 1. Ve a Storage → Create new bucket
-- 2. Nombre: cafeteria-videos
-- 3. Desmarca "Private bucket"
-- 4. Create bucket
-- 5. Ve al bucket → Policies → New Policy → Allow all operations
