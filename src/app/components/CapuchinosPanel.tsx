import { useState } from 'react';
import { X, Coffee, Sparkles, Gift, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Product, SaleItem, ServiceUpgrade, ChapelName, CafeteriaState, StockGroup, PaymentMethod } from '../types/inventory';
import { CreateServiceUpgradeModal } from './CreateServiceUpgradeModal';
import { RedeemCoffeeModal } from './RedeemCoffeeModal';
import { CupsCounter } from './CupsCounter';
import { PaymentMethodModal } from './PaymentMethodModal';
import { toast } from 'sonner';

interface CapuchinosPanelProps {
  products: Product[];
  stockGroups: StockGroup[];
  cafeteriaState: CafeteriaState;
  serviceUpgrades: ServiceUpgrade[];
  onClose: () => void;
  onSale: (items: SaleItem[], paymentMethod: PaymentMethod) => void;
  onCreateServiceUpgrade: (chapel: ChapelName, totalCoffees: number, totalCost: number) => void;
  onRedeemCoffee: (upgradeId: string, quantity: number) => void;
  onUpdateCups: (newCount: number) => void;
}

export function CapuchinosPanel({
  products,
  stockGroups,
  cafeteriaState,
  serviceUpgrades,
  onClose,
  onSale,
  onCreateServiceUpgrade,
  onRedeemCoffee,
  onUpdateCups,
}: CapuchinosPanelProps) {
  const [cart, setCart] = useState<Map<string, SaleItem>>(new Map());
  const [showCreateUpgradeModal, setShowCreateUpgradeModal] = useState(false);
  const [showRedeemCoffeeModal, setShowRedeemCoffeeModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);

  // Filtrar solo capuchinos
  const capuchinos = products.filter(p => p.category === 'capuchinos');

  const getProductStock = (product: Product): number => {
    if (product.stockGroupId) {
      const group = stockGroups.find(g => g.id === product.stockGroupId);
      return group?.stock || 0;
    }
    return product.stock;
  };

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
      toast.error(`No hay suficiente stock de capuchinos`);
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
    
    // Cerrar el panel automáticamente después de la venta
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const activeChapels = serviceUpgrades.filter(u => u.isActive).map(u => u.chapel);
  const activeUpgrades = serviceUpgrades.filter(u => u.isActive);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-50 to-orange-50 z-50 flex">
      {/* Panel Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Coffee className="w-12 h-12" />
              <div>
                <h2 className="text-4xl font-bold">☕ Capuchinos</h2>
                <p className="text-amber-100 text-lg mt-1">Menú especializado</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              size="lg"
              className="bg-white text-amber-700 hover:bg-amber-50 h-16 px-8 text-2xl font-bold shadow-lg border-4 border-amber-300"
            >
              <X className="w-6 h-6 mr-3" />
              REGRESAR
            </Button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Productos de Capuchinos */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">🍵 Productos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {capuchinos.map(product => {
                  const stock = getProductStock(product);
                  return (
                    <Card
                      key={product.id}
                      className={`p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 active:scale-95 ${
                        stock <= 0 
                          ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300' 
                          : 'border-amber-200 hover:border-amber-400'
                      }`}
                      onClick={() => stock > 0 && addToCart(product)}
                    >
                      <h3 className="text-lg font-semibold mb-3 line-clamp-2 min-h-[3.5rem]">{product.name}</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-green-600">${product.price}</span>
                        <span className="text-lg text-gray-600 font-medium">📦 {stock}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Control de Vasos */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">🥤 Inventario de Vasos</h3>
              <div className="max-w-md">
                <CupsCounter
                  currentCups={cafeteriaState.currentCups ?? cafeteriaState.initialCups ?? 0}
                  onUpdateCups={onUpdateCups}
                />
              </div>
            </div>

            {/* Mejoras de Servicio */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">✨ Mejoras de Servicio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <Button
                  onClick={() => setShowCreateUpgradeModal(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white h-20 text-xl font-semibold"
                  size="lg"
                >
                  <Sparkles className="w-6 h-6 mr-2" />
                  Aplicar Mejora
                </Button>
                <Button
                  onClick={() => setShowRedeemCoffeeModal(true)}
                  disabled={activeUpgrades.length === 0}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white h-20 text-xl font-semibold disabled:opacity-50"
                  size="lg"
                >
                  <Gift className="w-6 h-6 mr-2" />
                  Redimir Café
                </Button>
              </div>
            </div>

            {/* Mejoras Activas */}
            {activeUpgrades.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">🎁 Mejoras Activas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeUpgrades.map(upgrade => (
                    <Card key={upgrade.id} className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xl font-bold text-purple-900 mb-1">
                            {upgrade.chapel}
                          </p>
                          <p className="text-lg text-purple-700">
                            {upgrade.remainingCoffees} / {upgrade.totalCoffees} cafés
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-amber-700">
                            ${upgrade.totalCost}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Carrito Lateral */}
      <div className="w-96 bg-white border-l shadow-2xl flex flex-col">
        <div className="p-5 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Carrito
          </h2>
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
                        onClick={() => removeFromCart(item.productId)}
                        className="h-10 w-10 p-0 border-2"
                      >
                        <Minus className="w-5 h-5" />
                      </Button>
                      <span className="text-xl font-bold w-10 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const product = capuchinos.find(p => p.id === item.productId);
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

      {/* Modales */}
      <CreateServiceUpgradeModal
        isOpen={showCreateUpgradeModal}
        onClose={() => setShowCreateUpgradeModal(false)}
        onCreateUpgrade={onCreateServiceUpgrade}
        activeChapels={activeChapels}
      />

      <RedeemCoffeeModal
        isOpen={showRedeemCoffeeModal}
        onClose={() => setShowRedeemCoffeeModal(false)}
        activeUpgrades={activeUpgrades}
        onRedeem={onRedeemCoffee}
      />

      <PaymentMethodModal
        isOpen={showPaymentMethodModal}
        onClose={() => setShowPaymentMethodModal(false)}
        total={getTotal()}
        onSelectPayment={(method) => {
          completeSale(method);
          setShowPaymentMethodModal(false);
        }}
      />
    </div>
  );
}