import { AlertTriangle, CheckCircle, Copy, Database, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';

interface MigrationHelperProps {
  onClose: () => void;
}

const MIGRATION_SQL = `-- ============================================
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

-- 8. Habilitar RLS para service_upgrades
ALTER TABLE service_upgrades ENABLE ROW LEVEL SECURITY;

-- 9. Crear política para service_upgrades
DROP POLICY IF EXISTS "Enable all operations for service_upgrades" ON service_upgrades;

CREATE POLICY "Enable all operations for service_upgrades" 
ON service_upgrades 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 10. Verificación final
SELECT 'Migración completada exitosamente!' as status;`;

export function MigrationHelper({ onClose }: MigrationHelperProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(MIGRATION_SQL);
    toast.success('SQL copiado al portapapeles', {
      icon: '📋',
      duration: 2000
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <Database className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                🔧 Migración Requerida
              </h2>
              <p className="text-gray-600">
                Actualiza tu base de datos para soporte multi-sucursal
              </p>
            </div>
          </div>

          {/* Alert */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-amber-900 mb-2">
                  ⚠️ Las tablas de Supabase necesitan actualizarse
                </h3>
                <p className="text-amber-800 text-sm">
                  Tu aplicación está lista para multi-sucursal, pero falta ejecutar un script SQL en Supabase 
                  para agregar las columnas necesarias.
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-6 mb-8">
            <h3 className="text-xl font-bold">📋 Pasos para Migrar:</h3>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-2">Accede a Supabase</h4>
                  <p className="text-gray-700 mb-3">
                    Ve a tu proyecto en Supabase y abre el <strong>SQL Editor</strong>
                  </p>
                  <Button
                    onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir Supabase Dashboard
                  </Button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-2">Copia el Script SQL</h4>
                  <p className="text-gray-700 mb-3">
                    Haz clic en el botón de abajo para copiar el script de migración
                  </p>
                  <Button
                    onClick={copyToClipboard}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Script SQL
                  </Button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-2">Ejecuta el Script</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>En Supabase, haz clic en <strong>"New query"</strong></li>
                    <li>Pega el script SQL copiado</li>
                    <li>Haz clic en <strong>"RUN"</strong> o presiona Ctrl/Cmd + Enter</li>
                    <li>Espera a ver el mensaje: <strong>"Migración completada exitosamente!"</strong></li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-2">Recarga la Aplicación</h4>
                  <p className="text-gray-700">
                    Una vez ejecutado el script, recarga esta página y todos los errores desaparecerán
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What does it do */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              ¿Qué hace esta migración?
            </h3>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>✅ Agrega la columna <code className="bg-blue-200 px-2 py-1 rounded">branch_id</code> a todas las tablas</li>
              <li>✅ Crea la tabla <code className="bg-blue-200 px-2 py-1 rounded">service_upgrades</code> para paquetes de capuchinos</li>
              <li>✅ Crea índices para búsquedas rápidas por sucursal</li>
              <li>✅ Configura permisos de acceso (RLS)</li>
              <li>⚠️ <strong>NO borra datos existentes</strong> - Todos se asignan a 'zapopan' por defecto</li>
            </ul>
          </div>

          {/* SQL Preview */}
          <div className="mb-6">
            <h3 className="font-bold mb-2">Vista previa del SQL:</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-64">
              <pre>{MIGRATION_SQL}</pre>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={copyToClipboard}
              className="flex-1 bg-purple-600 hover:bg-purple-700 h-14 text-lg"
            >
              <Copy className="w-5 h-5 mr-2" />
              Copiar Script SQL
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="px-8 h-14 text-lg"
            >
              Cerrar
            </Button>
          </div>

          {/* Help */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              💡 <strong>Tip:</strong> Después de ejecutar el script, presiona F5 para recargar la página
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}