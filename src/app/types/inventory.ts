export type BranchName = string; // Ahora soporta sucursales dinámicas

export interface Branch {
  id: string;
  name: string;
  displayName: string;
  color?: string; // Color personalizado para la UI
  isDefault?: boolean; // Si es una sucursal por defecto (no se puede eliminar)
}

export const DEFAULT_BRANCHES: Branch[] = [
  { id: 'zapopan', name: 'zapopan', displayName: 'Zapopan', color: '#3b82f6', isDefault: true },
  { id: 'vallarta', name: 'vallarta', displayName: 'Vallarta', color: '#10b981', isDefault: true },
  { id: 'oblatos', name: 'oblatos', displayName: 'Oblatos', color: '#f59e0b', isDefault: true },
];

// Esta variable se actualizará dinámicamente desde Supabase
export let BRANCHES: Branch[] = [...DEFAULT_BRANCHES];

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  reorderQuantity: number;
  stockGroupId?: string; // Para productos que comparten stock
  imageUrl?: string; // URL de imagen personalizada
  branchId?: BranchName; // Sucursal a la que pertenece
  isEnabled?: boolean; // Si el producto está habilitado para esta sucursal
}

export interface StockGroup {
  id: string;
  name: string;
  stock: number;
  reorderQuantity: number;
  branchId?: BranchName; // Sucursal a la que pertenece
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export type PaymentMethod = 'efectivo' | 'tarjeta';

export interface DailySale {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
  timestamp: number;
  paymentMethod: PaymentMethod; // Método de pago usado
  branchId?: BranchName; // Sucursal donde se realizó la venta
}

export interface ShiftRecord {
  id: string;
  name: string; // Ej: "2026-02-20 - Turno Matutino"
  shiftType: 'matutino' | 'vespertino' | 'nocturno' | '';
  startTime: number;
  endTime: number;
  startStock: { products: Product[]; stockGroups: StockGroup[] };
  endStock: { products: Product[]; stockGroups: StockGroup[] };
  expectedMoney: number; // Dinero esperado en efectivo (mantener para compatibilidad)
  reportedMoney: number; // Dinero reportado en efectivo (mantener para compatibilidad)
  expectedCard: number; // Total esperado en tarjeta
  reportedCard: number; // Total reportado en tarjeta (cantidad de tickets)
  isCorte: boolean; // Si fue un corte (cierra cafetería y deja caja en 0)
  changeMoney?: number; // Dinero dejado como cambio después del corte
  branchId?: BranchName; // Sucursal del turno
}

export interface CafeteriaState {
  isOpen: boolean;
  openedAt?: number;
  currentShiftStartTime?: number;
  initialStock?: { products: Product[]; stockGroups: StockGroup[] };
  initialMoney: number; // Dinero inicial del turno (cambio dejado del corte anterior)
  initialCups?: number; // Número de vasos al inicio del turno
  currentCups?: number; // Número de vasos actuales
  branchId?: BranchName; // Sucursal de este estado
}

export interface BranchProductConfig {
  branchId: BranchName;
  disabledCategories: string[]; // Categorías completas deshabilitadas (ej: 'capuchinos')
  disabledProducts: string[]; // Productos individuales deshabilitados (ej: 'maruchan-pollo')
}

export type ChapelName = 'Armonía' | 'Bonanza' | 'Concordia';

export interface ServiceUpgrade {
  id: string;
  chapel: ChapelName;
  totalCoffees: number;
  remainingCoffees: number;
  totalCost: number;
  timestamp: number;
  isActive: boolean;
  branchId?: BranchName; // Sucursal de esta mejora
}

export const INITIAL_STOCK_GROUPS: StockGroup[] = [
  { id: 'stock-papitas', name: 'Papitas (Paquete Surtido)', stock: 50, reorderQuantity: 50 },
  { id: 'stock-galletas', name: 'Galletas (Paquete Surtido)', stock: 30, reorderQuantity: 30 },
];

export const INITIAL_PRODUCTS: Product[] = [
  // Maruchan - 4 tipos a $30
  { id: 'maruchan-camaron', name: 'Maruchan Camarón', category: 'maruchan', price: 30, stock: 12, reorderQuantity: 12 },
  { id: 'maruchan-camaron-pikin', name: 'Maruchan Camarón Pikín', category: 'maruchan', price: 30, stock: 12, reorderQuantity: 12 },
  { id: 'maruchan-camaron-habanero', name: 'Maruchan Camarón Habanero', category: 'maruchan', price: 30, stock: 12, reorderQuantity: 12 },
  { id: 'maruchan-pollo', name: 'Maruchan Pollo', category: 'maruchan', price: 30, stock: 12, reorderQuantity: 12 },
  
  // Complementos para Maruchan (incluidos en categoría maruchan)
  { id: 'tenedores', name: 'Tenedores', category: 'maruchan', price: 0, stock: 25, reorderQuantity: 25 },
  { id: 'galletas-saladitas', name: 'Galletas Saladitas (Extra)', category: 'maruchan', price: 5, stock: 30, reorderQuantity: 30 },
  
  // Papitas - 8 tipos a $25 - Comparten stock
  { id: 'papitas-chetos-naranjas', name: 'Chetos Naranjas', category: 'papitas', price: 25, stock: 0, reorderQuantity: 50, stockGroupId: 'stock-papitas' },
  { id: 'papitas-chetos-flaming', name: 'Chetos Flaming Hot', category: 'papitas', price: 25, stock: 0, reorderQuantity: 50, stockGroupId: 'stock-papitas' },
  { id: 'papitas-ruffles', name: 'Ruffles', category: 'papitas', price: 25, stock: 0, reorderQuantity: 50, stockGroupId: 'stock-papitas' },
  { id: 'papitas-sabritas', name: 'Sabritas', category: 'papitas', price: 25, stock: 0, reorderQuantity: 50, stockGroupId: 'stock-papitas' },
  { id: 'papitas-rancheritos', name: 'Rancheritos', category: 'papitas', price: 25, stock: 0, reorderQuantity: 50, stockGroupId: 'stock-papitas' },
  { id: 'papitas-doritos', name: 'Doritos', category: 'papitas', price: 25, stock: 0, reorderQuantity: 50, stockGroupId: 'stock-papitas' },
  { id: 'papitas-tostitos', name: 'Tostitos', category: 'papitas', price: 25, stock: 0, reorderQuantity: 50, stockGroupId: 'stock-papitas' },
  { id: 'papitas-fritos', name: 'Fritos', category: 'papitas', price: 25, stock: 0, reorderQuantity: 50, stockGroupId: 'stock-papitas' },
  
  // Capuchinos - 5 tipos a $25
  { id: 'capuchino-normal', name: 'Capuchino', category: 'capuchinos', price: 25, stock: 100, reorderQuantity: 1 },
  { id: 'capuchino-moka', name: 'Moka', category: 'capuchinos', price: 25, stock: 100, reorderQuantity: 1 },
  { id: 'capuchino-vainilla', name: 'Vainilla', category: 'capuchinos', price: 25, stock: 100, reorderQuantity: 1 },
  { id: 'capuchino-irlandesa', name: 'Crema Irlandesa', category: 'capuchinos', price: 25, stock: 100, reorderQuantity: 1 },
  { id: 'capuchino-chocolate', name: 'Chocolate', category: 'capuchinos', price: 25, stock: 100, reorderQuantity: 1 },
  
  // Galletas, Chocolates y Dulces - todos en la misma categoría
  { id: 'galleta-principes', name: 'Príncipes', category: 'otros', price: 20, stock: 0, reorderQuantity: 30, stockGroupId: 'stock-galletas' },
  { id: 'galleta-trikitrakes', name: 'Trikitrakes', category: 'otros', price: 20, stock: 0, reorderQuantity: 30, stockGroupId: 'stock-galletas' },
  { id: 'galleta-plativolos', name: 'Plativolos', category: 'otros', price: 20, stock: 0, reorderQuantity: 30, stockGroupId: 'stock-galletas' },
  { id: 'chocolate-canasta', name: 'Chocolate Canasta', category: 'otros', price: 5, stock: 50, reorderQuantity: 50 },
  { id: 'pinguinos', name: 'Pingüinos', category: 'otros', price: 15, stock: 6, reorderQuantity: 6 },
  { id: 'gansitos', name: 'Gansitos', category: 'otros', price: 15, stock: 6, reorderQuantity: 6 },
];