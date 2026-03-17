import { useState } from 'react';
import { Coffee, AlertCircle, CheckCircle, X, DollarSign, Package, Minus, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Product, StockGroup } from '../types/inventory';
import { toast } from 'sonner';

interface OpenCafeteriaConfirmationProps {
  products: Product[];
  stockGroups: StockGroup[];
  onConfirm: (initialChange: number, initialCups: number) => void;
  onCancel: () => void;
  onUpdateInventory?: (updatedProducts: Product[], updatedStockGroups: StockGroup[]) => void;
}

export function OpenCafeteriaConfirmation({ 
  products, 
  stockGroups, 
  onConfirm, 
  onCancel,
  onUpdateInventory
}: OpenCafeteriaConfirmationProps) {
  const [view, setView] = useState<'summary' | 'inventory'>('summary');
  const [initialChange, setInitialChange] = useState<string>('');
  const [initialCups, setInitialCups] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // Estado para inventario editable
  const [editableProducts, setEditableProducts] = useState<Product[]>(JSON.parse(JSON.stringify(products)));
  const [editableStockGroups, setEditableStockGroups] = useState<StockGroup[]>(JSON.parse(JSON.stringify(stockGroups)));

  const handleConfirm = () => {
    const changeAmount = parseFloat(initialChange);
    const cupsAmount = parseFloat(initialCups);
    
    if (!initialChange || isNaN(changeAmount) || changeAmount < 0) {
      setError('Por favor ingresa una cantidad válida de cambio');
      return;
    }

    if (!initialCups || isNaN(cupsAmount) || cupsAmount < 0) {
      setError('Por favor ingresa una cantidad válida de vasos');
      return;
    }

    onConfirm(changeAmount, cupsAmount);
  };

  const handleInventoryCheck = () => {
    setView('inventory');
  };

  const handleSaveInventory = () => {
    if (onUpdateInventory) {
      // Registrar mermas (diferencias negativas)
      const mermas: string[] = [];
      
      // Verificar productos
      products.forEach((original) => {
        const updated = editableProducts.find(p => p.id === original.id);
        if (updated && !original.stockGroupId) {
          const diff = updated.stock - original.stock;
          if (diff < 0) {
            mermas.push(`${original.name}: ${Math.abs(diff)} unidades`);
          }
        }
      });

      // Verificar grupos de stock
      stockGroups.forEach((original) => {
        const updated = editableStockGroups.find(g => g.id === original.id);
        if (updated) {
          const diff = updated.stock - original.stock;
          if (diff < 0) {
            mermas.push(`${original.name}: ${Math.abs(diff)} unidades`);
          }
        }
      });

      if (mermas.length > 0) {
        toast.warning(`Mermas registradas:\n${mermas.join('\n')}`);
      }

      onUpdateInventory(editableProducts, editableStockGroups);
      toast.success('Inventario actualizado correctamente');
    }
    setView('summary');
  };

  const updateProductStock = (productId: string, newStock: number) => {
    setEditableProducts(prev => 
      prev.map(p => p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p)
    );
  };

  const updateStockGroupStock = (groupId: string, newStock: number) => {
    setEditableStockGroups(prev => 
      prev.map(g => g.id === groupId ? { ...g, stock: Math.max(0, newStock) } : g)
    );
  };

  // Agrupar productos por categoría
  const categoryNames: Record<string, string> = {
    'maruchan': '1º Maruchan',
    'papitas': '2º Papitas',
    'capuchinos': '3º Capuchinos',
    'otros': '4º Galletas, Chocolates y Dulces'
  };

  const groupedProducts = (view === 'inventory' ? editableProducts : products).reduce((acc, product) => {
    if (product.price > 0 || product.id === 'tenedores' || product.id === 'galletas-saladitas') {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
    }
    return acc;
  }, {} as Record<string, Product[]>);

  const sortedCategories = Object.keys(groupedProducts).sort((a, b) => {
    const order = ['maruchan', 'papitas', 'capuchinos', 'otros'];
    return order.indexOf(a) - order.indexOf(b);
  });

  const getProductStock = (product: Product): number => {
    if (product.stockGroupId) {
      const groups = view === 'inventory' ? editableStockGroups : stockGroups;
      const group = groups.find(g => g.id === product.stockGroupId);
      return group?.stock || 0;
    }
    return product.stock;
  };

  const hasLowStock = products.some(p => {
    const stock = getProductStock(p);
    return stock < 5 && p.price > 0;
  }) || stockGroups.some(g => g.stock < 10);

  const displayStockGroups = view === 'inventory' ? editableStockGroups : stockGroups;

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      {/* Header fijo */}
      <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg z-10">
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Coffee className="w-10 h-10" />
            <div>
              <h2 className="text-3xl font-bold">
                {view === 'summary' ? 'Abrir Cafetería' : 'Corregir Inventario'}
              </h2>
              <p className="text-green-100 text-base mt-1">
                {view === 'summary' 
                  ? 'Verifica el inventario antes de comenzar' 
                  : 'Ajusta las cantidades según el inventario físico'}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="lg" 
            onClick={onCancel}
            className="text-white hover:bg-white hover:bg-opacity-20 h-14 w-14"
          >
            <X className="w-8 h-8" />
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {view === 'summary' && (
          <>
            {/* Instrucción principal */}
            <div className="mb-8">
              <div className="flex items-start gap-4 bg-blue-50 border-3 border-blue-300 rounded-xl p-6">
                <AlertCircle className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-blue-900 text-2xl mb-2">
                    Corrobora que esta información es correcta
                  </h3>
                  <p className="text-blue-700 text-lg">
                    Revisa el stock de cada producto antes de iniciar el turno
                  </p>
                </div>
              </div>
            </div>

            {/* Alerta de stock bajo */}
            {hasLowStock && (
              <div className="mb-8">
                <div className="flex items-start gap-4 bg-orange-50 border-3 border-orange-400 rounded-xl p-6">
                  <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-orange-900 text-xl mb-1">
                      ⚠️ Advertencia: Hay productos con stock bajo
                    </h3>
                    <p className="text-orange-700 text-base">
                      Considera reabastecer antes de abrir
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Grupos de stock compartido */}
            {stockGroups.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-3">
                  📦 Stock Compartido
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stockGroups.map(group => (
                    <Card 
                      key={group.id} 
                      className={`p-6 ${
                        group.stock < 10 
                          ? 'bg-orange-50 border-3 border-orange-300' 
                          : 'bg-white border-2 border-gray-200'
                      }`}
                    >
                      <div className="text-center">
                        <h4 className="font-bold text-gray-800 text-xl mb-3">{group.name}</h4>
                        <div className={`text-6xl font-bold ${
                          group.stock < 10 ? 'text-orange-600' : 'text-blue-600'
                        }`}>
                          {group.stock}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Inventario por categorías - Compacto */}
            <div className="space-y-6 mb-8">
              {sortedCategories.map(category => {
                const categoryProducts = groupedProducts[category];
                return (
                  <div key={category}>
                    <h3 className="text-xl font-bold text-gray-700 mb-4 border-b-2 border-gray-300 pb-2">
                      {categoryNames[category] || category}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {categoryProducts.map(product => {
                        const stock = getProductStock(product);
                        const isLowStock = stock < 5;
                        const isComplement = product.id === 'tenedores' || product.id === 'galletas-saladitas';
                        
                        return (
                          <Card 
                            key={product.id}
                            className={`p-4 ${
                              isComplement 
                                ? 'bg-gray-100 border-gray-300'
                                : isLowStock 
                                  ? 'bg-orange-50 border-2 border-orange-300' 
                                  : 'bg-white border-2 border-gray-200'
                            }`}
                          >
                            <div className="text-center">
                              <h4 className="text-base font-bold text-gray-800 mb-3 min-h-[40px] flex items-center justify-center">
                                {product.name}
                              </h4>
                              <div className={`text-5xl font-bold ${
                                isComplement 
                                  ? 'text-gray-600'
                                  : isLowStock 
                                    ? 'text-orange-600' 
                                    : 'text-blue-600'
                              }`}>
                                {stock}
                              </div>
                              {isComplement && (
                                <span className="text-xs text-gray-500 mt-2 block">
                                  Complemento
                                </span>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cambio inicial */}
            <div className="mb-6">
              <div className="flex items-start gap-4 bg-purple-50 border-3 border-purple-300 rounded-xl p-6">
                <DollarSign className="w-8 h-8 text-purple-600 flex-shrink-0 mt-2" />
                <div className="flex-1">
                  <h3 className="font-bold text-purple-900 text-xl mb-3">
                    Tu turno va a empezar con:
                  </h3>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      value={initialChange}
                      onChange={(e) => {
                        setInitialChange(e.target.value);
                        setError('');
                      }}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="text-3xl font-bold text-center h-20 text-purple-700"
                    />
                    <span className="text-3xl font-bold text-purple-700">$ de cambio</span>
                  </div>
                  {error && (
                    <p className="text-red-600 text-base mt-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {error}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tazas iniciales */}
            <div className="mb-6">
              <div className="flex items-start gap-4 bg-purple-50 border-3 border-purple-300 rounded-xl p-6">
                <Package className="w-8 h-8 text-purple-600 flex-shrink-0 mt-2" />
                <div className="flex-1">
                  <h3 className="font-bold text-purple-900 text-xl mb-3">
                    Vasos iniciales:
                  </h3>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      value={initialCups}
                      onChange={(e) => {
                        setInitialCups(e.target.value);
                        setError('');
                      }}
                      placeholder="0"
                      step="1"
                      min="0"
                      className="text-3xl font-bold text-center h-20 text-purple-700"
                    />
                    <span className="text-3xl font-bold text-purple-700">vasos</span>
                  </div>
                  {error && (
                    <p className="text-red-600 text-base mt-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {error}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Botones principales - AL FINAL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Button
                onClick={onCancel}
                variant="outline"
                className="h-24 text-2xl font-bold border-2"
                size="lg"
              >
                ❌ Cancelar
              </Button>
              <Button
                onClick={handleInventoryCheck}
                className="h-24 text-2xl font-bold bg-orange-600 hover:bg-orange-700 text-white"
                size="lg"
              >
                <Package className="w-8 h-8 mr-3" />
                📦 Inventario No Coincide
              </Button>
              <Button
                onClick={handleConfirm}
                className="h-24 text-2xl font-bold bg-green-600 hover:bg-green-700 text-white"
                disabled={!initialChange || !initialCups}
                size="lg"
              >
                <CheckCircle className="w-8 h-8 mr-3" />
                ✅ Confirmar y Abrir
              </Button>
            </div>
          </>
        )}

        {view === 'inventory' && (
          <>
            <Button 
              variant="ghost" 
              onClick={() => setView('summary')} 
              className="mb-6 text-xl h-16 px-8"
              size="lg"
            >
              ← Regresar
            </Button>

            {/* Instrucción de inventario */}
            <div className="mb-8">
              <div className="flex items-start gap-4 bg-amber-50 border-3 border-amber-400 rounded-xl p-6">
                <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-amber-900 text-2xl mb-2">
                    Ajusta el inventario según el conteo físico
                  </h3>
                  <p className="text-amber-700 text-lg">
                    Las diferencias negativas se registrarán como mermas automáticamente
                  </p>
                </div>
              </div>
            </div>

            {/* Grupos de stock compartido - EDITABLE */}
            {editableStockGroups.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-3">
                  📦 Stock Compartido
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {editableStockGroups.map(group => {
                    const original = stockGroups.find(g => g.id === group.id);
                    const diff = original ? group.stock - original.stock : 0;
                    
                    return (
                      <Card 
                        key={group.id} 
                        className={`p-6 ${
                          diff < 0 
                            ? 'bg-red-50 border-3 border-red-400' 
                            : diff > 0
                              ? 'bg-green-50 border-3 border-green-400'
                              : 'bg-gray-50 border-2 border-gray-300'
                        }`}
                      >
                        <div className="mb-4">
                          <h4 className="font-bold text-gray-800 text-xl">{group.name}</h4>
                          <p className="text-sm text-gray-600">
                            Stock original: {original?.stock || 0} unidades
                          </p>
                          {diff !== 0 && (
                            <p className={`text-base font-bold mt-1 ${
                              diff < 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {diff > 0 ? '+' : ''}{diff} unidades {diff < 0 ? '(MERMA)' : ''}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Button
                            onClick={() => updateStockGroupStock(group.id, group.stock - 1)}
                            variant="outline"
                            size="lg"
                            className="h-16 w-16"
                          >
                            <Minus className="w-6 h-6" />
                          </Button>
                          
                          <Input
                            type="number"
                            value={group.stock}
                            onChange={(e) => updateStockGroupStock(group.id, parseInt(e.target.value) || 0)}
                            className="text-3xl font-bold text-center h-16"
                            min="0"
                          />
                          
                          <Button
                            onClick={() => updateStockGroupStock(group.id, group.stock + 1)}
                            variant="outline"
                            size="lg"
                            className="h-16 w-16"
                          >
                            <Plus className="w-6 h-6" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inventario por categorías - EDITABLE */}
            <div className="space-y-8 mb-8">
              {sortedCategories.map(category => {
                const categoryProducts = groupedProducts[category];
                return (
                  <div key={category}>
                    <h3 className="text-2xl font-bold text-gray-700 mb-4 border-b-2 border-gray-300 pb-2">
                      {categoryNames[category] || category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryProducts.map(product => {
                        // Solo productos sin grupo de stock (los del grupo se manejan arriba)
                        if (product.stockGroupId) return null;
                        
                        const original = products.find(p => p.id === product.id);
                        const diff = original ? product.stock - original.stock : 0;
                        
                        return (
                          <Card 
                            key={product.id}
                            className={`p-6 ${
                              diff < 0 
                                ? 'bg-red-50 border-3 border-red-400' 
                                : diff > 0
                                  ? 'bg-green-50 border-3 border-green-400'
                                  : 'bg-gray-50 border-2 border-gray-300'
                            }`}
                          >
                            <div className="mb-4">
                              <h4 className="font-bold text-gray-800 text-lg">{product.name}</h4>
                              <p className="text-sm text-green-600 font-semibold">${product.price}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                Stock original: {original?.stock || 0}
                              </p>
                              {diff !== 0 && (
                                <p className={`text-base font-bold mt-1 ${
                                  diff < 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {diff > 0 ? '+' : ''}{diff} {diff < 0 ? '(MERMA)' : ''}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Button
                                onClick={() => updateProductStock(product.id, product.stock - 1)}
                                variant="outline"
                                size="lg"
                                className="h-14 w-14"
                              >
                                <Minus className="w-5 h-5" />
                              </Button>
                              
                              <Input
                                type="number"
                                value={product.stock}
                                onChange={(e) => updateProductStock(product.id, parseInt(e.target.value) || 0)}
                                className="text-2xl font-bold text-center h-14"
                                min="0"
                              />
                              
                              <Button
                                onClick={() => updateProductStock(product.id, product.stock + 1)}
                                variant="outline"
                                size="lg"
                                className="h-14 w-14"
                              >
                                <Plus className="w-5 h-5" />
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Botón guardar */}
            <div className="sticky bottom-0 bg-white border-t-4 border-gray-200 p-6 -mx-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              <Button
                onClick={handleSaveInventory}
                className="w-full h-28 text-3xl font-bold bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <CheckCircle className="w-10 h-10 mr-4" />
                ✅ Guardar Inventario Corregido
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}