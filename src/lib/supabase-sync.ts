import { supabase, isSupabaseConfigured } from './supabase';
import { Product, StockGroup, DailySale, ShiftRecord, CafeteriaState, ServiceUpgrade, BranchName } from '../app/types/inventory';

// ==================== PRODUCTOS ====================

export async function syncProductsToSupabase(products: Product[], branchId?: BranchName) {
  if (!isSupabaseConfigured() || !supabase) return;
  
  try {
    // Eliminar productos de la sucursal actual
    if (branchId) {
      await supabase.from('products').delete().eq('branch_id', branchId);
    } else {
      await supabase.from('products').delete().is('branch_id', null);
    }
    
    // Insertar los nuevos productos
    const dbProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      reorder_quantity: p.reorderQuantity,
      stock_group_id: p.stockGroupId || null,
      image_url: p.imageUrl || null,
      branch_id: p.branchId || branchId || null,
      is_enabled: p.isEnabled !== undefined ? p.isEnabled : true
    }));
    
    const { error } = await supabase.from('products').insert(dbProducts);
    if (error) throw error;
    
    console.log('✅ Productos sincronizados con Supabase', branchId ? `(${branchId})` : '');
  } catch (error) {
    console.error('❌ Error al sincronizar productos:', error);
  }
}

export async function loadProductsFromSupabase(branchId?: BranchName): Promise<Product[] | null> {
  if (!isSupabaseConfigured()) return null;
  
  try {
    let query = supabase.from('products').select('*');
    
    if (branchId) {
      query = query.eq('branch_id', branchId);
    } else {
      query = query.is('branch_id', null);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    if (!data || data.length === 0) return null;
    
    return data.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      reorderQuantity: p.reorder_quantity,
      stockGroupId: p.stock_group_id,
      imageUrl: p.image_url,
      branchId: p.branch_id,
      isEnabled: p.is_enabled !== undefined ? p.is_enabled : true
    }));
  } catch (error) {
    console.error('❌ Error al cargar productos:', error);
    return null;
  }
}

// ==================== GRUPOS DE STOCK ====================

export async function syncStockGroupsToSupabase(stockGroups: StockGroup[], branchId?: BranchName) {
  if (!isSupabaseConfigured()) return;
  
  try {
    // Eliminar grupos de stock de la sucursal actual
    if (branchId) {
      await supabase.from('stock_groups').delete().eq('branch_id', branchId);
    } else {
      await supabase.from('stock_groups').delete().is('branch_id', null);
    }
    
    const dbStockGroups = stockGroups.map(g => ({
      id: g.id,
      name: g.name,
      stock: g.stock,
      reorder_quantity: g.reorderQuantity,
      branch_id: g.branchId || branchId || null
    }));
    
    const { error } = await supabase.from('stock_groups').insert(dbStockGroups);
    if (error) throw error;
    
    console.log('✅ Grupos de stock sincronizados con Supabase', branchId ? `(${branchId})` : '');
  } catch (error) {
    console.error('❌ Error al sincronizar grupos de stock:', error);
  }
}

export async function loadStockGroupsFromSupabase(branchId?: BranchName): Promise<StockGroup[] | null> {
  if (!isSupabaseConfigured()) return null;
  
  try {
    let query = supabase.from('stock_groups').select('*');
    
    if (branchId) {
      query = query.eq('branch_id', branchId);
    } else {
      query = query.is('branch_id', null);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    if (!data || data.length === 0) return null;
    
    return data.map(g => ({
      id: g.id,
      name: g.name,
      stock: g.stock,
      reorderQuantity: g.reorder_quantity,
      branchId: g.branch_id
    }));
  } catch (error) {
    console.error('❌ Error al cargar grupos de stock:', error);
    return null;
  }
}

// ==================== VENTAS ====================

export async function syncSaleToSupabase(sale: DailySale) {
  if (!isSupabaseConfigured()) return;
  
  try {
    const dbSale = {
      id: sale.id,
      date: sale.date,
      items: sale.items,
      total: sale.total,
      timestamp: sale.timestamp,
      branch_id: sale.branchId || null
    };
    
    const { error } = await supabase.from('sales').insert(dbSale);
    if (error) throw error;
    
    console.log('✅ Venta sincronizada con Supabase', sale.branchId ? `(${sale.branchId})` : '');
  } catch (error) {
    console.error('❌ Error al sincronizar venta:', error);
  }
}

export async function loadSalesFromSupabase(branchId?: BranchName): Promise<DailySale[] | null> {
  if (!isSupabaseConfigured()) return null;
  
  try {
    let query = supabase
      .from('sales')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    if (!data) return null;
    
    return data.map(s => ({
      id: s.id,
      date: s.date,
      items: s.items,
      total: s.total,
      timestamp: s.timestamp,
      branchId: s.branch_id
    }));
  } catch (error) {
    console.error('❌ Error al cargar ventas:', error);
    return null;
  }
}

// ==================== TURNOS ====================

export async function syncShiftToSupabase(shift: ShiftRecord) {
  if (!isSupabaseConfigured()) return;
  
  try {
    const dbShift = {
      id: shift.id,
      name: shift.name,
      shift_type: shift.shiftType,
      start_time: shift.startTime,
      end_time: shift.endTime,
      start_stock: shift.startStock,
      end_stock: shift.endStock,
      expected_money: shift.expectedMoney,
      reported_money: shift.reportedMoney,
      is_corte: shift.isCorte,
      change_money: shift.changeMoney || null,
      branch_id: shift.branchId || null
    };
    
    const { error } = await supabase.from('shifts').insert(dbShift);
    if (error) throw error;
    
    console.log('✅ Turno sincronizado con Supabase', shift.branchId ? `(${shift.branchId})` : '');
  } catch (error) {
    console.error('❌ Error al sincronizar turno:', error);
  }
}

export async function loadShiftsFromSupabase(branchId?: BranchName): Promise<ShiftRecord[] | null> {
  if (!isSupabaseConfigured()) return null;
  
  try {
    let query = supabase
      .from('shifts')
      .select('*')
      .order('start_time', { ascending: false });
    
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    if (!data) return null;
    
    return data.map(s => ({
      id: s.id,
      name: s.name,
      shiftType: s.shift_type,
      startTime: s.start_time,
      endTime: s.end_time,
      startStock: s.start_stock,
      endStock: s.end_stock,
      expectedMoney: s.expected_money,
      reportedMoney: s.reported_money,
      isCorte: s.is_corte,
      changeMoney: s.change_money,
      branchId: s.branch_id
    }));
  } catch (error) {
    console.error('❌ Error al cargar turnos:', error);
    return null;
  }
}

// ==================== ESTADO DE CAFETERÍA ====================

export async function syncCafeteriaStateToSupabase(state: CafeteriaState, branchId?: BranchName) {
  if (!isSupabaseConfigured() || !supabase) return;
  
  try {
    const stateId = branchId || 'default';
    const dbState = {
      id: stateId,
      is_open: state.isOpen,
      opened_at: state.openedAt || null,
      current_shift_start_time: state.currentShiftStartTime || null,
      initial_stock: state.initialStock || null,
      initial_money: state.initialMoney,
      initial_cups: state.initialCups || null,
      current_cups: state.currentCups || null,
      branch_id: state.branchId || branchId || null
    };
    
    const { error } = await supabase
      .from('cafeteria_state')
      .upsert(dbState);
    
    if (error) throw error;
    
    console.log('✅ Estado de cafetería sincronizado con Supabase', branchId ? `(${branchId})` : '');
  } catch (error) {
    console.error('❌ Error al sincronizar estado de cafetería:', error);
  }
}

export async function loadCafeteriaStateFromSupabase(branchId?: BranchName): Promise<CafeteriaState | null> {
  if (!isSupabaseConfigured()) return null;
  
  try {
    const stateId = branchId || 'default';
    const { data, error } = await supabase
      .from('cafeteria_state')
      .select('*')
      .eq('id', stateId)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    return {
      isOpen: data.is_open,
      openedAt: data.opened_at,
      currentShiftStartTime: data.current_shift_start_time,
      initialStock: data.initial_stock,
      initialMoney: data.initial_money,
      initialCups: data.initial_cups,
      currentCups: data.current_cups,
      branchId: data.branch_id
    };
  } catch (error) {
    console.error('❌ Error al cargar estado de cafetería:', error);
    return null;
  }
}

// ==================== CONFIGURACIÓN (VIDEO URL) ====================

export async function syncConfigValueToSupabase(key: string, value: string, branchId?: BranchName) {
  if (!isSupabaseConfigured()) return;
  
  try {
    const configKey = branchId ? `${key}_${branchId}` : key;
    const { error } = await supabase
      .from('configuration')
      .upsert({ 
        key: configKey, 
        value,
        branch_id: branchId || null
      });
    
    if (error) throw error;
    
    console.log(`✅ Configuración ${configKey} sincronizada con Supabase`);
  } catch (error) {
    console.error(`❌ Error al sincronizar configuración ${key}:`, error);
  }
}

export async function loadConfigValueFromSupabase(key: string, branchId?: BranchName): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  
  try {
    const configKey = branchId ? `${key}_${branchId}` : key;
    const { data, error } = await supabase
      .from('configuration')
      .select('value')
      .eq('key', configKey)
      .single();
    
    if (error) throw error;
    
    return data?.value || null;
  } catch (error) {
    console.error(`❌ Error al cargar configuración ${key}:`, error);
    return null;
  }
}

// ==================== MEJORAS DE SERVICIO ====================

export async function syncServiceUpgradesToSupabase(upgrades: ServiceUpgrade[], branchId?: BranchName) {
  if (!isSupabaseConfigured()) return;
  
  try {
    // Eliminar mejoras de la sucursal actual
    if (branchId) {
      await supabase.from('service_upgrades').delete().eq('branch_id', branchId);
    } else {
      await supabase.from('service_upgrades').delete().is('branch_id', null);
    }
    
    // Insertar las nuevas mejoras
    const dbUpgrades = upgrades.map(u => ({
      id: u.id,
      chapel: u.chapel,
      total_coffees: u.totalCoffees,
      remaining_coffees: u.remainingCoffees,
      total_cost: u.totalCost,
      timestamp: u.timestamp,
      is_active: u.isActive,
      branch_id: u.branchId || branchId || null
    }));
    
    if (dbUpgrades.length > 0) {
      const { error } = await supabase.from('service_upgrades').insert(dbUpgrades);
      if (error) throw error;
    }
    
    console.log('✅ Mejoras de servicio sincronizadas con Supabase', branchId ? `(${branchId})` : '');
  } catch (error) {
    console.error('❌ Error al sincronizar mejoras de servicio:', error);
  }
}

export async function loadServiceUpgradesFromSupabase(branchId?: BranchName): Promise<ServiceUpgrade[] | null> {
  if (!isSupabaseConfigured()) return null;
  
  try {
    let query = supabase
      .from('service_upgrades')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    if (!data) return null;
    
    return data.map(u => ({
      id: u.id,
      chapel: u.chapel,
      totalCoffees: u.total_coffees,
      remainingCoffees: u.remaining_coffees,
      totalCost: u.total_cost,
      timestamp: u.timestamp,
      isActive: u.is_active,
      branchId: u.branch_id
    }));
  } catch (error) {
    console.error('❌ Error al cargar mejoras de servicio:', error);
    return null;
  }
}