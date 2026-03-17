import { useState } from 'react';
import { Settings, Package, TrendingUp, AlertTriangle, Plus, LogOut, ShoppingBag, Clock, ChevronDown, ChevronRight, ArrowLeft, ImageIcon, Video, Store, Sparkles, Database } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Product, DailySale, StockGroup, ShiftRecord, ServiceUpgrade, ChapelName, BranchName, BranchProductConfig, Branch } from '../types/inventory';
import { ProductEditor } from './ProductEditor';
import { VideoUploader } from './VideoUploader';
import { BranchSelector } from './BranchSelector';
import { BranchProductConfigComponent } from './BranchProductConfig';
import { MigrationHelper } from './MigrationHelper';
import { toast } from 'sonner';

interface AdminPanelProps {
  products: Product[];
  stockGroups: StockGroup[];
  sales: DailySale[];
  shifts: ShiftRecord[];
  onUpdateInventory: (productId: string, newStock: number) => void;
  onUpdateStockGroup: (groupId: string, newStock: number) => void;
  onRestock: (productId: string) => void;
  onRestockGroup: (groupId: string) => void;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  onCreateProduct: (product: Omit<Product, 'id'>) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateScreensaverVideo: (videoUrl: string) => void;
  screensaverVideoUrl: string | null;
  onLogout: () => void;
  serviceUpgrades: ServiceUpgrade[];
  onCreateServiceUpgrade: (chapel: ChapelName, totalCoffees: number, totalCost: number) => void;
  onRedeemCoffee: (upgradeId: string, quantity: number) => void;
  currentBranch: BranchName;
  onChangeBranch: (branch: BranchName) => void;
  branchConfigs: Record<BranchName, BranchProductConfig>;
  onUpdateBranchConfigs: (configs: Record<BranchName, BranchProductConfig>) => void;
  branches: Branch[];
  onSaveBranches: (branches: Branch[]) => void;
}

export function AdminPanel({ 
  products, 
  stockGroups, 
  sales,
  shifts,
  onUpdateInventory, 
  onUpdateStockGroup,
  onRestock, 
  onRestockGroup,
  onUpdateProduct,
  onCreateProduct,
  onDeleteProduct,
  onUpdateScreensaverVideo,
  screensaverVideoUrl,
  onLogout,
  serviceUpgrades,
  onCreateServiceUpgrade,
  onRedeemCoffee,
  currentBranch,
  onChangeBranch,
  branchConfigs,
  onUpdateBranchConfigs,
  branches,
  onSaveBranches
}: AdminPanelProps) {
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [editingGroupStock, setEditingGroupStock] = useState<Record<string, number>>({});
  const [expandedCortes, setExpandedCortes] = useState<Set<number>>(new Set());
  const [showProductEditor, setShowProductEditor] = useState(false);
  const [showMigrationHelper, setShowMigrationHelper] = useState(false);

  // Agrupar turnos por corte
  const groupShiftsByCorte = () => {
    const cortes: ShiftRecord[][] = [];
    let currentCorte: ShiftRecord[] = [];

    // Procesar turnos en orden cronológico
    const sortedShifts = [...shifts].sort((a, b) => a.startTime - b.startTime);

    sortedShifts.forEach((shift) => {
      currentCorte.push(shift);
      
      // Si el turno es un corte, cerrar el grupo actual
      if (shift.isCorte) {
        cortes.push([...currentCorte]);
        currentCorte = [];
      }
    });

    // Si hay turnos pendientes sin corte, agregarlos como un grupo incompleto
    if (currentCorte.length > 0) {
      cortes.push(currentCorte);
    }

    return cortes.reverse(); // Mostrar más recientes primero
  };

  const toggleCorte = (index: number) => {
    const newExpanded = new Set(expandedCortes);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCortes(newExpanded);
  };

  const getTodayTotal = () => {
    const today = new Date().toISOString().split('T')[0];
    return sales
      .filter(sale => sale.date === today)
      .reduce((sum, sale) => sum + sale.total, 0);
  };

  const getTodaySalesCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return sales.filter(sale => sale.date === today).length;
  };

  const getLowStockProducts = () => {
    return products.filter(p => !p.stockGroupId && p.stock <= p.reorderQuantity * 0.3 && p.price > 0);
  };

  const getLowStockGroups = () => {
    return stockGroups.filter(g => g.stock <= g.reorderQuantity * 0.3);
  };

  const handleStockChange = (productId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setEditingStock({ ...editingStock, [productId]: numValue });
  };

  const handleGroupStockChange = (groupId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setEditingGroupStock({ ...editingGroupStock, [groupId]: numValue });
  };

  const handleUpdateStock = (productId: string) => {
    const newStock = editingStock[productId];
    if (newStock !== undefined && newStock >= 0) {
      onUpdateInventory(productId, newStock);
      const updatedEditing = { ...editingStock };
      delete updatedEditing[productId];
      setEditingStock(updatedEditing);
      toast.success('Inventario actualizado');
    }
  };

  const handleUpdateGroupStock = (groupId: string) => {
    const newStock = editingGroupStock[groupId];
    if (newStock !== undefined && newStock >= 0) {
      onUpdateStockGroup(groupId, newStock);
      const updatedEditing = { ...editingGroupStock };
      delete updatedEditing[groupId];
      setEditingGroupStock(updatedEditing);
      toast.success('Inventario de paquete actualizado');
    }
  };

  const handleRestock = (productId: string) => {
    onRestock(productId);
    toast.success('Producto reabastecido');
  };

  const handleRestockGroup = (groupId: string) => {
    onRestockGroup(groupId);
    toast.success('Paquete reabastecido');
  };

  const categoryNames: Record<string, string> = {
    maruchan: 'Maruchan',
    papitas: 'Papitas',
    capuchinos: 'Capuchinos',
    otros: 'Galletas, Chocolates y Dulces',
  };

  const categoryOrder = ['maruchan', 'papitas', 'capuchinos', 'otros'];

  const individualProducts = products.filter(p => !p.stockGroupId);
  const groupedProducts = individualProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const sortedCategories = categoryOrder.filter(cat => groupedProducts[cat]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-purple-600 text-white p-4 shadow-lg flex justify-between items-center">
        <h1 className="text-2xl flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Panel de Administración
        </h1>
        <Button variant="secondary" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>

      <div className="p-6">
        {/* Selector de Sucursal */}
        <div className="mb-6">
          <BranchSelector
            currentBranch={currentBranch}
            onSelectBranch={onChangeBranch}
            branches={branches}
            onSaveBranches={onSaveBranches}
          />
        </div>

        {/* Botones de acción */}
        <div className="mb-6 flex gap-3">
          <Button 
            onClick={() => setShowProductEditor(true)}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <ImageIcon className="w-5 h-5 mr-2" />
            Editar Productos
          </Button>
          <Button 
            onClick={onLogout} 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Regresar a Punto de Venta
          </Button>
        </div>
        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">
              <TrendingUp className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="inventory">
              <Package className="w-4 h-4 mr-2" />
              Inventario
            </TabsTrigger>
            <TabsTrigger value="sales">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Ventas
            </TabsTrigger>
            <TabsTrigger value="shifts">
              <Clock className="w-4 h-4 mr-2" />
              Turnos
            </TabsTrigger>
            <TabsTrigger value="upgrades">
              <Sparkles className="w-4 h-4 mr-2" />
              Mejoras
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="w-4 h-4 mr-2" />
              Video
            </TabsTrigger>
            <TabsTrigger value="branch-config">
              <Store className="w-4 h-4 mr-2" />
              Productos por Sucursal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <h3 className="text-sm text-gray-600 mb-2">Ventas de Hoy</h3>
                <p className="text-3xl text-green-600">${getTodayTotal().toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">{getTodaySalesCount()} transacciones</p>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm text-gray-600 mb-2">Total de Productos</h3>
                <p className="text-3xl text-blue-600">{products.filter(p => p.price > 0).length}</p>
                <p className="text-xs text-gray-500 mt-1">productos activos</p>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm text-gray-600 mb-2">Alertas de Stock Bajo</h3>
                <p className="text-3xl text-red-600">{getLowStockProducts().length + getLowStockGroups().length}</p>
                <p className="text-xs text-gray-500 mt-1">requieren reabastecimiento</p>
              </Card>
            </div>

            {(getLowStockProducts().length > 0 || getLowStockGroups().length > 0) && (
              <Card className="p-6">
                <h3 className="flex items-center gap-2 text-lg mb-4">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Productos con Stock Bajo
                </h3>
                <div className="space-y-2">
                  {getLowStockGroups().map(group => (
                    <div key={group.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="text-sm">{group.name}</p>
                        <p className="text-xs text-gray-600">Stock actual: {group.stock} / Reabastecimiento: {group.reorderQuantity}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestockGroup(group.id)}
                        className="border-orange-500 text-orange-700 hover:bg-orange-100"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Reabastecer
                      </Button>
                    </div>
                  ))}
                  {getLowStockProducts().map(product => (
                    <div key={product.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="text-sm">{product.name}</p>
                        <p className="text-xs text-gray-600">Stock actual: {product.stock} / Reabastecimiento: {product.reorderQuantity}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestock(product.id)}
                        className="border-orange-500 text-orange-700 hover:bg-orange-100"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Reabastecer
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="text-lg mb-4">Historial de Ventas (Últimas 10)</h3>
              <div className="space-y-2">
                {sales.slice(-10).reverse().map(sale => (
                  <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm">{new Date(sale.timestamp).toLocaleString('es-MX')}</p>
                      <p className="text-xs text-gray-600">{sale.items.length} productos</p>
                    </div>
                    <p className="text-green-600">${sale.total.toFixed(2)}</p>
                  </div>
                ))}
                {sales.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No hay ventas registradas</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            {/* Paquetes de Stock Compartido */}
            {stockGroups.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6">Paquetes de Reabastecimiento</h3>
                <div className="space-y-3">
                  {stockGroups.map(group => (
                    <div key={group.id} className="flex items-center gap-4 p-5 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="flex-1">
                        <p className="text-lg font-semibold">{group.name}</p>
                        <p className="text-base text-gray-600">
                          Paquete de {group.reorderQuantity} unidades
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          value={editingGroupStock[group.id] !== undefined ? editingGroupStock[group.id] : group.stock}
                          onChange={(e) => handleGroupStockChange(group.id, e.target.value)}
                          className="w-28 h-14 text-xl text-center font-bold"
                          min="0"
                        />
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handleUpdateGroupStock(group.id)}
                          disabled={editingGroupStock[group.id] === undefined}
                          className="h-14 px-6 text-base"
                        >
                          Actualizar
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handleRestockGroup(group.id)}
                          className="h-14 px-6 text-base bg-green-50 hover:bg-green-100 border-green-500 text-green-700"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          +{group.reorderQuantity}
                        </Button>
                      </div>
                      {group.stock <= group.reorderQuantity * 0.3 && (
                        <AlertTriangle className="w-7 h-7 text-orange-500" />
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Productos Individuales */}
            {sortedCategories.map(category => {
              const categoryProducts = groupedProducts[category];
              return (
                <Card key={category} className="p-6">
                  <h3 className="text-xl font-bold mb-6">{categoryNames[category] || category}</h3>
                  <div className="space-y-3">
                    {categoryProducts.map(product => (
                      <div key={product.id} className="flex items-center gap-4 p-5 bg-gray-50 rounded-lg border-2 border-gray-200">
                        <div className="flex-1">
                          <p className="text-lg font-semibold">{product.name}</p>
                          <p className="text-base text-gray-600">
                            Precio: ${product.price} | Reabastecimiento: {product.reorderQuantity} unidades
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            value={editingStock[product.id] !== undefined ? editingStock[product.id] : product.stock}
                            onChange={(e) => handleStockChange(product.id, e.target.value)}
                            className="w-28 h-14 text-xl text-center font-bold"
                            min="0"
                          />
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => handleUpdateStock(product.id)}
                            disabled={editingStock[product.id] === undefined}
                            className="h-14 px-6 text-base"
                          >
                            Actualizar
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => handleRestock(product.id)}
                            className="h-14 px-6 text-base bg-green-50 hover:bg-green-100 border-green-500 text-green-700"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            +{product.reorderQuantity}
                          </Button>
                        </div>
                        {product.stock <= product.reorderQuantity * 0.3 && product.price > 0 && (
                          <AlertTriangle className="w-7 h-7 text-orange-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="shifts" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Historial de Cortes
              </h3>
              
              {shifts.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No hay turnos registrados</p>
              ) : (
                <div className="space-y-4">
                  {groupShiftsByCorte().map((corte, corteIndex) => {
                    const firstShift = corte[0];
                    const lastShift = corte[corte.length - 1];
                    const isExpanded = expandedCortes.has(corteIndex);
                    
                    // Calcular totales del corte
                    const totalExpected = corte.reduce((sum, shift) => sum + shift.expectedMoney, 0);
                    const totalReported = corte.reduce((sum, shift) => sum + shift.reportedMoney, 0);
                    const totalDifference = totalReported - totalExpected;
                    const totalDuration = lastShift.endTime - firstShift.startTime;
                    const totalHours = Math.floor(totalDuration / (1000 * 60 * 60));
                    const totalMinutes = Math.floor((totalDuration % (1000 * 60 * 60)) / (1000 * 60));

                    return (
                      <div key={corteIndex} className="border-2 border-purple-300 rounded-lg overflow-hidden">
                        {/* Botón de Corte */}
                        <button
                          onClick={() => toggleCorte(corteIndex)}
                          className={`w-full p-4 text-left transition-colors ${
                            lastShift.isCorte 
                              ? 'bg-purple-100 hover:bg-purple-200' 
                              : 'bg-yellow-100 hover:bg-yellow-200 border-2 border-yellow-400'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {isExpanded ? (
                                  <ChevronDown className="w-6 h-6 text-purple-600" />
                                ) : (
                                  <ChevronRight className="w-6 h-6 text-purple-600" />
                                )}
                                <h4 className="font-bold text-lg">
                                  {lastShift.isCorte ? '🔒 Corte de Caja' : '⚠️ Sesión Sin Corte'}
                                </h4>
                                <span className="px-3 py-1 bg-white rounded-full text-sm font-semibold">
                                  {corte.length} {corte.length === 1 ? 'turno' : 'turnos'}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-600">
                                    <span className="font-semibold">Inicio:</span> {new Date(firstShift.startTime).toLocaleString('es-MX')}
                                  </p>
                                  <p className="text-gray-600">
                                    <span className="font-semibold">Fin:</span> {new Date(lastShift.endTime).toLocaleString('es-MX')}
                                  </p>
                                  <p className="text-gray-600">
                                    <span className="font-semibold">Duración total:</span> {totalHours}h {totalMinutes}m
                                  </p>
                                </div>
                                
                                <div className="flex gap-2">
                                  <div className="flex-1 bg-white p-2 rounded">
                                    <p className="text-xs text-gray-600">Total Esperado</p>
                                    <p className="text-lg font-bold text-blue-600">${totalExpected.toFixed(2)}</p>
                                  </div>
                                  <div className="flex-1 bg-white p-2 rounded">
                                    <p className="text-xs text-gray-600">Total Reportado</p>
                                    <p className="text-lg font-bold text-green-600">${totalReported.toFixed(2)}</p>
                                  </div>
                                  {totalDifference !== 0 && (
                                    <div className={`flex-1 p-2 rounded border-2 ${totalDifference > 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                                      <p className="text-xs text-gray-600">Diferencia</p>
                                      <p className={`text-lg font-bold ${totalDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {totalDifference > 0 ? '+' : ''}{totalDifference.toFixed(2)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Turnos Expandidos */}
                        {isExpanded && (
                          <div className="bg-white p-4 space-y-3 border-t-2 border-purple-200">
                            {corte.map((shift, shiftIndex) => {
                              const difference = shift.reportedMoney - shift.expectedMoney;
                              const duration = shift.endTime - shift.startTime;
                              const hours = Math.floor(duration / (1000 * 60 * 60));
                              const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

                              return (
                                <Card key={shift.id} className={`p-4 ${shift.isCorte ? 'border-purple-300 bg-purple-50' : 'border-blue-300 bg-blue-50'}`}>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h5 className="font-semibold mb-2 flex items-center gap-2">
                                        <span className="text-gray-500">#{shiftIndex + 1}</span>
                                        {shift.name}
                                      </h5>
                                      <div className="space-y-1 text-sm">
                                        <p className="text-sm flex items-center justify-between mb-1">
                                          <span className="text-gray-600">Tipo:</span>
                                          <span className={`px-2 py-0.5 rounded ${
                                            shift.shiftType === 'matutino' ? 'bg-yellow-100 text-yellow-700' : 
                                            shift.shiftType === 'vespertino' ? 'bg-orange-100 text-orange-700' : 
                                            'bg-blue-900 text-white'
                                          }`}>
                                            {shift.shiftType === 'matutino' ? '☀️ Matutino' : 
                                             shift.shiftType === 'vespertino' ? '🌅 Vespertino' : 
                                             '🌙 Nocturno'}
                                          </span>
                                        </p>
                                        <p>
                                          <span className="text-gray-600">Inicio:</span> {new Date(shift.startTime).toLocaleString('es-MX')}
                                        </p>
                                        <p>
                                          <span className="text-gray-600">Fin:</span> {new Date(shift.endTime).toLocaleString('es-MX')}
                                        </p>
                                        <p>
                                          <span className="text-gray-600">Duración:</span> {hours}h {minutes}m
                                        </p>
                                        {shift.isCorte && (
                                          <p className="text-purple-700 font-semibold">
                                            🔒 CORTE DE CAJA
                                            {shift.changeMoney && shift.changeMoney > 0 && (
                                              <span className="ml-2 text-sm">(Cambio dejado: ${shift.changeMoney.toFixed(2)})</span>
                                            )}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="bg-white p-3 rounded">
                                        <p className="text-xs text-gray-600">Dinero Esperado</p>
                                        <p className="text-xl text-blue-600">${shift.expectedMoney.toFixed(2)}</p>
                                      </div>
                                      <div className="bg-white p-3 rounded">
                                        <p className="text-xs text-gray-600">Dinero Reportado</p>
                                        <p className="text-xl text-green-600">${shift.reportedMoney.toFixed(2)}</p>
                                      </div>
                                      {difference !== 0 && (
                                        <div className={`bg-white p-3 rounded border-2 ${difference > 0 ? 'border-green-300' : 'border-red-300'}`}>
                                          <p className="text-xs text-gray-600">Diferencia</p>
                                          <p className={`text-xl ${difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {difference > 0 ? '+' : ''}{difference.toFixed(2)}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Cambios de inventario */}
                                  <details className="mt-4">
                                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                                      Ver cambios de inventario
                                    </summary>
                                    <div className="mt-2 bg-white p-3 rounded space-y-1 text-sm">
                                      {shift.startStock.products.map(startProduct => {
                                        const endProduct = shift.endStock.products.find(p => p.id === startProduct.id);
                                        if (!endProduct || startProduct.stock === endProduct.stock) return null;
                                        
                                        return (
                                          <div key={startProduct.id} className="flex justify-between border-b pb-1">
                                            <span>{startProduct.name}</span>
                                            <span>
                                              {startProduct.stock} → {endProduct.stock} 
                                              <span className="text-red-600 ml-2">(-{startProduct.stock - endProduct.stock})</span>
                                            </span>
                                          </div>
                                        );
                                      })}
                                      {shift.startStock.stockGroups.map(startGroup => {
                                        const endGroup = shift.endStock.stockGroups.find(g => g.id === startGroup.id);
                                        if (!endGroup || startGroup.stock === endGroup.stock) return null;
                                        
                                        return (
                                          <div key={startGroup.id} className="flex justify-between border-b pb-1">
                                            <span>{startGroup.name}</span>
                                            <span>
                                              {startGroup.stock} → {endGroup.stock}
                                              <span className="text-red-600 ml-2">(-{startGroup.stock - endGroup.stock})</span>
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </details>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg mb-4">Historial de Ventas</h3>
              <div className="space-y-2">
                {sales.slice().reverse().map(sale => (
                  <div key={sale.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{new Date(sale.timestamp).toLocaleString('es-MX')}</p>
                      <p className="text-xs text-gray-600">{sale.items.length} productos</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {sale.items.map(item => `${item.productName} (${item.quantity})`).join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">${sale.total.toFixed(2)}</p>
                      {sale.paymentMethod && (
                        <p className="text-xs text-gray-500 mt-1">
                          {sale.paymentMethod === 'efectivo' ? '💵 Efectivo' : '💳 Tarjeta'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {sales.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No hay ventas registradas</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="upgrades" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg mb-4">Mejoras de Servicio (Paquetes Prepagados)</h3>
              <div className="space-y-3">
                {serviceUpgrades.map(upgrade => (
                  <div 
                    key={upgrade.id} 
                    className={`p-4 rounded-lg border-2 ${
                      upgrade.isActive 
                        ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-300' 
                        : 'bg-gray-100 border-gray-300 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg">Capilla {upgrade.chapel}</p>
                        <p className="text-sm text-gray-600">
                          Creado: {new Date(upgrade.timestamp).toLocaleDateString('es-MX')}
                        </p>
                        <p className="text-sm mt-1">
                          {upgrade.remainingCoffees} / {upgrade.totalCoffees} cafés restantes
                        </p>
                        {!upgrade.isActive && (
                          <p className="text-xs text-red-600 font-semibold mt-1">✅ Completado</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-amber-700">${upgrade.totalCost}</p>
                        <p className="text-xs text-gray-500">Total pagado</p>
                      </div>
                    </div>
                    <div className="mt-3 bg-white rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all"
                        style={{ width: `${(upgrade.remainingCoffees / upgrade.totalCoffees) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {serviceUpgrades.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No hay mejoras registradas</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg mb-4">Configuración de Pantalla de Ahorro de Energía</h3>
              <VideoUploader
                onVideoUpdate={onUpdateScreensaverVideo}
                currentVideoUrl={screensaverVideoUrl}
              />
            </Card>
          </TabsContent>

          <TabsContent value="branch-config" className="space-y-4">
            <BranchProductConfigComponent
              config={branchConfigs[currentBranch]}
              onUpdateConfig={(config) => {
                const newConfigs = { ...branchConfigs, [currentBranch]: config };
                onUpdateBranchConfigs(newConfigs);
              }}
              products={products}
              onUpdateProduct={onUpdateProduct}
              onCreateProduct={onCreateProduct}
              onDeleteProduct={onDeleteProduct}
              currentBranch={currentBranch}
            />
          </TabsContent>
        </Tabs>
      </div>

      {showProductEditor && (
        <ProductEditor
          products={products}
          onUpdateProduct={onUpdateProduct}
          onClose={() => setShowProductEditor(false)}
        />
      )}

      {showMigrationHelper && (
        <MigrationHelper
          onClose={() => setShowMigrationHelper(false)}
        />
      )}
    </div>
  );
}