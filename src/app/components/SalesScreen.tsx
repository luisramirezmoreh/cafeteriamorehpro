import { useState, useEffect, useRef, useMemo } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Settings, Coffee, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Product, SaleItem, StockGroup, DailySale, ShiftRecord, CafeteriaState, ServiceUpgrade, ChapelName, PaymentMethod, BranchName, BranchProductConfig } from '../types/inventory';
import { TodaySalesModal } from './TodaySalesModal';
import { Screensaver } from './Screensaver';
import { PaymentMethodModal } from './PaymentMethodModal';
import { CapuchinosPanel } from './CapuchinosPanel';
import { toast } from 'sonner';

interface SalesScreenProps {
  products: Product[];
  stockGroups: StockGroup[];
  sales: DailySale[];
  shifts: ShiftRecord[];
  cafeteriaState: CafeteriaState;
  onSale: (items: SaleItem[], paymentMethod: PaymentMethod) => void;
  onOpenSettings: () => void;
  onOpenCafeteria: () => void;
  onCloseCafeteria: (changeMoney?: number) => void;
  onSaveShift: (shifts: ShiftRecord[]) => void;
  screensaverVideoUrl?: string | null;
  serviceUpgrades: ServiceUpgrade[];
  onCreateServiceUpgrade: (chapel: ChapelName, totalCoffees: number, totalCost: number) => void;
  onRedeemCoffee: (upgradeId: string, quantity: number) => void;
  onUpdateCups: (newCount: number) => void;
  currentBranch: BranchName;
  branchConfig: BranchProductConfig;
}

export function SalesScreen({ 
  products, 
  stockGroups, 
  sales,
  shifts,
  cafeteriaState,
  onSale, 
  onOpenSettings,
  onOpenCafeteria,
  onCloseCafeteria,
  onSaveShift,
  screensaverVideoUrl,
  serviceUpgrades,
  onCreateServiceUpgrade,
  onRedeemCoffee,
  onUpdateCups,
  currentBranch,
  branchConfig
}: SalesScreenProps) {
  const [cart, setCart] = useState<Map<string, SaleItem>>(new Map());
  const [showTodaySales, setShowTodaySales] = useState(false);
  const [showScreensaver, setShowScreensaver] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showCapuchinosPanel, setShowCapuchinosPanel] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calcular dinero en caja en tiempo real (solo efectivo)
  const calculateMoneyInCaja = useMemo(() => {
    if (!cafeteriaState.isOpen || !cafeteriaState.currentShiftStartTime) {
      return 0;
    }
    
    // Dinero inicial del turno
    const initialMoney = cafeteriaState.initialMoney || 0;
    
    // Sumar solo las ventas en efectivo del turno actual
    const shiftSales = sales.filter(sale => 
      sale.timestamp >= cafeteriaState.currentShiftStartTime! &&
      (sale.paymentMethod === 'efectivo' || !sale.paymentMethod) // Solo efectivo o ventas viejas sin método
    );
    
    const totalCashSales = shiftSales.reduce((sum, sale) => sum + sale.total, 0);
    
    return initialMoney + totalCashSales;
  }, [cafeteriaState, sales]);

  // Resetear el temporizador de inactividad
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // Deshabilitado el screensaver - se usará video personalizado
    inactivityTimerRef.current = setTimeout(() => {
      setShowScreensaver(true);
    }, 30000);
  };

  // Detectar actividad del usuario
  useEffect(() => {
    const handleActivity = () => {
      if (!showTodaySales) {
        resetInactivityTimer();
      }
    };

    // Eventos para detectar actividad
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Iniciar temporizador
    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [showTodaySales]);

  // Cerrar screensaver
  const handleDismissScreensaver = () => {
    setShowScreensaver(false);
    resetInactivityTimer();
  };

  const getProductStock = (product: Product): number => {
    if (product.stockGroupId) {
      const group = stockGroups.find(g => g.id === product.stockGroupId);
      return group?.stock || 0;
    }
    return product.stock;
  };

  // Filtrar productos disponibles, excluyendo tenedores (no se venden directamente)
  // y mostrando solo productos habilitados para esta sucursal
  const availableProducts = products.filter(p => {
    // Excluir tenedores (no se venden directamente)
    if (p.id === 'tenedores') return false;
    
    // Verificar stock
    if (getProductStock(p) <= 0) return false;
    
    // Verificar si el producto está habilitado
    if (p.isEnabled === false) return false;
    
    // Verificar si la categoría está deshabilitada en la configuración de la sucursal
    if (branchConfig.disabledCategories.includes(p.category)) return false;
    
    // Verificar si el producto específico está deshabilitado en la configuración de la sucursal
    if (branchConfig.disabledProducts.includes(p.id)) return false;
    
    return true;
  });

  const addToCart = (product: Product) => {
    const currentItem = cart.get(product.id);
    const currentQuantity = currentItem?.quantity || 0;
    const availableStock = getProductStock(product);

    // Calcular cuánto del stock del grupo ya está en el carrito
    let totalInCart = 0;
    if (product.stockGroupId) {
      cart.forEach(item => {
        const itemProduct = products.find(p => p.id === item.productId);
        if (itemProduct?.stockGroupId === product.stockGroupId) {
          totalInCart += item.quantity;
        }
      });
    }

    if (totalInCart >= availableStock) {
      toast.error(`No hay suficiente stock de ${product.category}`);
      return;
    }

    const newCart = new Map(cart);
    newCart.set(product.id, {
      productId: product.id,
      productName: product.name,
      quantity: currentQuantity + 1,
      price: product.price,
      total: (currentQuantity + 1) * product.price,
    });
    setCart(newCart);
  };

  const removeFromCart = (productId: string) => {
    const currentItem = cart.get(productId);
    if (!currentItem) return;

    const newCart = new Map(cart);
    if (currentItem.quantity === 1) {
      newCart.delete(productId);
    } else {
      newCart.set(productId, {
        ...currentItem,
        quantity: currentItem.quantity - 1,
        total: (currentItem.quantity - 1) * currentItem.price,
      });
    }
    setCart(newCart);
  };

  const deleteFromCart = (productId: string) => {
    const newCart = new Map(cart);
    newCart.delete(productId);
    setCart(newCart);
  };

  const getTotal = () => {
    return Array.from(cart.values()).reduce((sum, item) => sum + item.total, 0);
  };

  const completeSale = (paymentMethod: PaymentMethod) => {
    if (cart.size === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    const items = Array.from(cart.values());
    onSale(items, paymentMethod);
    setCart(new Map());
    toast.success(`Venta completada: $${getTotal().toFixed(2)}`);
  };

  const handleEndShift = (shiftRecord: ShiftRecord) => {
    const newShifts = [...shifts, shiftRecord];
    onSaveShift(newShifts);
    
    // Reiniciar el turno pero mantener cafetería abierta
    onOpenCafeteria();
    setShowTodaySales(false);
    toast.success('Turno entregado. Nuevo turno iniciado.');
  };

  const handleCorte = (shiftRecord: ShiftRecord, changeMoney: number) => {
    const newShifts = [...shifts, shiftRecord];
    onSaveShift(newShifts);
    onCloseCafeteria(changeMoney);
    setShowTodaySales(false);
  };

  const categoryNames: Record<string, string> = {
    maruchan: 'Maruchan',
    papitas: 'Papitas',
    capuchinos: 'Capuchinos',
    otros: 'Galletas, Chocolates y Dulces',
  };

  const categoryOrder = ['maruchan', 'papitas', 'capuchinos', 'otros'];

  // Agrupar productos por categoría
  const groupedProducts = availableProducts.reduce((acc, product) => {
    // Excluir galletas-saladitas de la lista normal (se muestra en sección especial)
    if (product.id === 'galletas-saladitas') {
      return acc;
    }
    
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const sortedCategories = categoryOrder.filter(cat => groupedProducts[cat]);

  const tenedoresProduct = products.find(p => p.id === 'tenedores');
  const galletasSaladitasProduct = products.find(p => p.id === 'galletas-saladitas');

  // Obtener capillas activas y mejoras activas
  const activeChapels = serviceUpgrades.filter(u => u.isActive).map(u => u.chapel);
  const activeUpgrades = serviceUpgrades.filter(u => u.isActive);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className={`text-white p-4 shadow-lg flex items-center justify-between transition-colors ${
        cafeteriaState.isOpen ? 'bg-green-600' : 'bg-gray-700'
      }`}>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Punto de Venta - Cafetería
          </h1>
          {cafeteriaState.isOpen && (
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg text-lg flex items-center gap-2 border-2 border-white border-opacity-40">
              <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
              <Coffee className="w-5 h-5 text-green-900" />
              <span className="font-bold text-green-900">ABIERTA</span>
            </div>
          )}
          {!cafeteriaState.isOpen && (
            <div className="bg-red-600 bg-opacity-80 px-4 py-2 rounded-lg text-lg flex items-center gap-2 border-2 border-red-400">
              <span className="font-bold">🔒 CERRADA</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {cafeteriaState.isOpen && (
            <Button
              onClick={() => setShowTodaySales(true)}
              variant="secondary"
              size="sm"
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Venta de Hoy
            </Button>
          )}
          <Button
            onClick={onOpenSettings}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-opacity-20 hover:bg-white"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Overlay cuando cafetería está cerrada */}
        {!cafeteriaState.isOpen && (
          <div className="absolute inset-0 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center gap-8 p-4 md:p-8">
            <div className="text-center mb-4 md:mb-8 animate-fade-in">
              <div className="text-7xl md:text-9xl mb-6 animate-bounce">🔒</div>
              <h2 className="text-3xl md:text-5xl text-white font-bold mb-3 md:mb-4 drop-shadow-lg">
                Cafetería Cerrada
              </h2>
              <p className="text-lg md:text-2xl text-gray-300 max-w-md">
                Para comenzar a vender, abre la cafetería
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-6 w-full max-w-md">
              <Button
                onClick={onOpenCafeteria}
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 md:px-16 py-6 md:py-10 text-2xl md:text-4xl h-auto rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-200 border-4 border-green-400"
              >
                <Coffee className="w-10 h-10 md:w-14 md:h-14 mr-3 md:mr-4" />
                Abrir Cafetería
              </Button>

              <div className="w-full h-px bg-gray-600 my-2"></div>

              <Button
                onClick={onOpenSettings}
                variant="outline"
                size="lg"
                className="w-full bg-white hover:bg-gray-100 text-gray-900 px-8 md:px-12 py-4 md:py-6 text-lg md:text-2xl h-auto rounded-xl shadow-xl border-2 border-gray-300 hover:border-gray-400 transition-all"
              >
                <Settings className="w-6 h-6 md:w-8 md:h-8 mr-3" />
                Inventariar
              </Button>
            </div>
          </div>
        )}

        {/* Productos */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6 md:space-y-8">
            {/* Botón especial para Capuchinos - Siempre al inicio */}
            {!branchConfig.disabledCategories.includes('capuchinos') && (
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Menú Especial</h2>
                <Card
                  className="p-8 cursor-pointer hover:shadow-2xl transition-all hover:scale-105 bg-gradient-to-br from-amber-100 to-orange-100 border-4 border-amber-400 hover:border-orange-500 active:scale-95"
                  onClick={() => setShowCapuchinosPanel(true)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-6xl">☕</div>
                      <div>
                        <h3 className="text-3xl font-bold text-amber-900 mb-2">Capuchinos</h3>
                        <p className="text-lg text-amber-700">Click para ver menú completo</p>
                      </div>
                    </div>
                    <div className="text-amber-600">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {sortedCategories.map(category => {
              // Saltar la categoría de capuchinos porque ahora tiene su propio panel
              if (category === 'capuchinos') return null;
              
              const categoryProducts = groupedProducts[category];
              return (
                <div key={category}>
                  <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">{categoryNames[category] || category}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {categoryProducts.map(product => {
                      const stock = getProductStock(product);
                      return (
                        <Card
                          key={product.id}
                          className="p-5 md:p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 border-gray-200 hover:border-green-400 active:scale-95"
                          onClick={() => addToCart(product)}
                        >
                          <h3 className="text-lg md:text-xl font-semibold mb-3 line-clamp-2 min-h-[3.5rem]">{product.name}</h3>
                          <div className="flex justify-between items-center">
                            <span className="text-2xl md:text-3xl font-bold text-green-600">${product.price}</span>
                            <span className="text-base md:text-lg text-gray-600 font-medium">📦 {stock}</span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {/* Mostrar inventario de complementos debajo de Maruchan */}
                  {category === 'maruchan' && (
                    <div className="mt-6 space-y-4">
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        {tenedoresProduct && (
                          <Card className="p-4 md:p-5 bg-gray-100 border-2 border-gray-300">
                            <h3 className="text-base md:text-lg font-semibold mb-2">🍴 {tenedoresProduct.name}</h3>
                            <div className="flex justify-between items-center">
                              <span className="text-sm md:text-base text-gray-600">Incluido con Maruchan</span>
                              <span className="text-base md:text-lg font-bold text-gray-700">📦 {tenedoresProduct.stock}</span>
                            </div>
                          </Card>
                        )}
                        {galletasSaladitasProduct && (
                          <Card className="p-4 md:p-5 bg-gray-100 border-2 border-gray-300">
                            <h3 className="text-base md:text-lg font-semibold mb-2">🍪 Galletas Saladitas</h3>
                            <div className="flex justify-between items-center">
                              <span className="text-sm md:text-base text-gray-600">Incluidas con Maruchan</span>
                              <span className="text-base md:text-lg font-bold text-gray-700">📦 {galletasSaladitasProduct.stock}</span>
                            </div>
                          </Card>
                        )}
                      </div>
                      {galletasSaladitasProduct && galletasSaladitasProduct.stock > 0 && (
                        <Card
                          className="p-5 md:p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-amber-50 border-2 border-amber-300 hover:border-amber-500 active:scale-95"
                          onClick={() => addToCart(galletasSaladitasProduct)}
                        >
                          <h3 className="text-lg md:text-xl font-semibold mb-3">{galletasSaladitasProduct.name}</h3>
                          <div className="flex justify-between items-center">
                            <span className="text-2xl md:text-3xl font-bold text-green-600">${galletasSaladitasProduct.price}</span>
                            <span className="text-base md:text-lg text-gray-600 font-medium">📦 {galletasSaladitasProduct.stock}</span>
                          </div>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Carrito */}
        <div className="w-96 bg-white border-l shadow-lg flex flex-col">
          <div className="p-5 border-b bg-gray-50">
            <h2 className="text-xl font-bold mb-2">Carrito de Compras</h2>
            {cafeteriaState.isOpen && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-base text-green-700 font-semibold">💵 Dinero en Caja:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${calculateMoneyInCaja.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.size === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                <ShoppingCart className="w-16 h-16 mx-auto mb-2 opacity-20" />
                <p className="text-lg">Carrito vacío</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from(cart.values()).map(item => (
                  <Card key={item.productId} className="p-4 border-2">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-base font-semibold flex-1 pr-2">{item.productName}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteFromCart(item.productId)}
                        className="h-9 w-9 p-0 hover:bg-red-100"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item.productId);
                          }}
                          className="h-10 w-10 p-0 border-2"
                        >
                          <Minus className="w-5 h-5" />
                        </Button>
                        <span className="text-xl font-bold w-10 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const product = availableProducts.find(p => p.id === item.productId);
                            if (product) addToCart(product);
                          }}
                          className="h-10 w-10 p-0 border-2"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>
                      <span className="text-xl font-bold text-green-600">${item.total.toFixed(2)}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 border-t bg-gray-50 space-y-4">
            <div className="flex justify-between text-2xl font-bold">
              <span>Total:</span>
              <span className="text-green-600">${getTotal().toFixed(2)}</span>
            </div>
            <Button
              onClick={() => setShowPaymentMethodModal(true)}
              disabled={cart.size === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-16 text-xl font-bold"
              size="lg"
            >
              Completar Venta
            </Button>
          </div>
        </div>
      </div>

      <TodaySalesModal
        isOpen={showTodaySales}
        onClose={() => setShowTodaySales(false)}
        products={products}
        stockGroups={stockGroups}
        sales={sales}
        cafeteriaState={cafeteriaState}
        onEndShift={handleEndShift}
        onCorte={handleCorte}
      />

      {showScreensaver && (
        <Screensaver 
          products={products} 
          onDismiss={handleDismissScreensaver}
          videoUrl={screensaverVideoUrl}
        />
      )}

      <PaymentMethodModal
        isOpen={showPaymentMethodModal}
        onClose={() => setShowPaymentMethodModal(false)}
        total={getTotal()}
        onSelectPayment={(method) => {
          completeSale(method);
          setShowPaymentMethodModal(false);
        }}
      />

      {showCapuchinosPanel && (
        <CapuchinosPanel
          products={products}
          stockGroups={stockGroups}
          cafeteriaState={cafeteriaState}
          serviceUpgrades={serviceUpgrades}
          onClose={() => setShowCapuchinosPanel(false)}
          onSale={onSale}
          onCreateServiceUpgrade={onCreateServiceUpgrade}
          onRedeemCoffee={onRedeemCoffee}
          onUpdateCups={onUpdateCups}
        />
      )}
    </div>
  );
}