# 🔧 Instrucciones para Migración Multi-Sucursal en Supabase

## ⚠️ IMPORTANTE: Debes ejecutar estas migraciones SQL en Supabase

Tu aplicación está lista para multi-sucursal, pero las tablas de Supabase necesitan actualizarse.

## 📋 Pasos para Migrar

### 1. Accede a Supabase
- Ve a [https://supabase.com](https://supabase.com)
- Inicia sesión en tu proyecto
- Abre el **SQL Editor** (icono de terminal en el menú lateral)

### 2. Ejecuta el Script de Migración
- Haz clic en "New query" (Nueva consulta)
- Copia **TODO** el contenido del archivo `supabase-migrations.sql`
- Pega el contenido en el editor SQL
- Haz clic en **"RUN"** (Ejecutar) o presiona `Ctrl/Cmd + Enter`

### 3. Verifica que la Migración fue Exitosa
Deberías ver:
```
✅ Migración completada exitosamente!
```

Y una lista de todas las tablas con la columna `branch_id` agregada.

## 🎯 ¿Qué hace esta migración?

1. ✅ Agrega la columna `branch_id` a todas las tablas:
   - `products`
   - `stock_groups`
   - `sales`
   - `shifts`
   - `cafeteria_state`
   - `configuration`

2. ✅ Crea la tabla `service_upgrades` (para paquetes de capuchinos)

3. ✅ Crea índices para búsquedas rápidas por sucursal

4. ✅ Configura permisos (RLS policies)

## 🚀 Después de la Migración

1. Recarga tu aplicación
2. Todos los errores de "column does not exist" desaparecerán
3. El sistema multi-sucursal funcionará completamente

## 🆘 Si algo sale mal

Si ya ejecutaste el script y aún ves errores:

1. **Refresca el Schema Cache de Supabase:**
   - Ve a Settings → Database → Refresh schema cache

2. **Verifica que las columnas existen:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'products' AND column_name = 'branch_id';
   ```

3. **Si la tabla service_upgrades no se creó:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'service_upgrades';
   ```

## 📞 Notas Importantes

- ⚠️ **Esta migración NO borra datos existentes**
- ⚠️ Todos los datos actuales se asignarán automáticamente a la sucursal 'zapopan' (valor por defecto)
- ✅ Después de migrar, podrás crear datos separados para Vallarta y Oblatos
- ✅ El sistema sincronizará automáticamente los datos con las columnas `branch_id`

---

**¿Listo?** Copia el contenido de `supabase-migrations.sql` y ejecútalo en el SQL Editor de Supabase. 🚀
