import { createClient } from '@supabase/supabase-js';

// 🔧 INSTRUCCIONES: Reemplaza estos valores con tus credenciales de Supabase
// 1. Ve a tu proyecto en Supabase
// 2. Ve a Settings > API
// 3. Copia el "Project URL" y reemplaza el valor de SUPABASE_URL
// 4. Copia el "anon public" key y reemplaza el valor de SUPABASE_ANON_KEY

const SUPABASE_URL = 'https://zijifrfemoazcvwbdyeg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppamlmcmZlbW9hemN2d2JkeWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNzU4MjUsImV4cCI6MjA4ODY1MTgyNX0.pbyiEQh8iEf2c3y4c06YZVsGkgBjcv5P6vK7ouKOA2g';

// Helper para verificar si Supabase está configurado
export const isSupabaseConfigured = () => {
  return SUPABASE_URL !== 'TU_PROJECT_URL_AQUI' && 
         SUPABASE_ANON_KEY !== 'TU_ANON_KEY_AQUI' &&
         SUPABASE_URL.startsWith('https://');
};

// Crear cliente de Supabase solo si está configurado
export const supabase = isSupabaseConfigured() 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Mostrar advertencia si no está configurado
if (!isSupabaseConfigured()) {
  console.warn(
    '⚠️ SUPABASE NO CONFIGURADO\n\n' +
    'El sistema funcionará con localStorage únicamente.\n' +
    'Para habilitar almacenamiento permanente en la nube:\n' +
    '1. Edita /src/lib/supabase.ts\n' +
    '2. Reemplaza las credenciales con las de tu proyecto Supabase\n' +
    '3. Lee /INICIO_RAPIDO.md para más información'
  );
}