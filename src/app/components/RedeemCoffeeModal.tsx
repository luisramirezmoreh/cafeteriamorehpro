import { X, Coffee, CheckCircle2, Minus, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { ServiceUpgrade } from '../types/inventory';
import { toast } from 'sonner';
import { useState } from 'react';

interface RedeemCoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeUpgrades: ServiceUpgrade[];
  onRedeem: (upgradeId: string, quantity: number) => void;
}

export function RedeemCoffeeModal({ 
  isOpen, 
  onClose, 
  activeUpgrades,
  onRedeem 
}: RedeemCoffeeModalProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  if (!isOpen) return null;

  const getQuantity = (upgradeId: string) => quantities[upgradeId] || 1;
  
  const setQuantity = (upgradeId: string, value: number) => {
    const upgrade = activeUpgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    const newValue = Math.max(1, Math.min(value, upgrade.remainingCoffees));
    setQuantities({ ...quantities, [upgradeId]: newValue });
  };

  const handleRedeem = (upgradeId: string) => {
    const quantity = getQuantity(upgradeId);
    onRedeem(upgradeId, quantity);
    
    if (quantity === 1) {
      toast.success('Café prepagado redimido', { icon: '☕' });
    } else {
      toast.success(`${quantity} cafés prepagados redimidos`, { icon: '☕' });
    }
    
    // Limpiar cantidad
    setQuantities({ ...quantities, [upgradeId]: 1 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <Coffee className="w-6 h-6" />
            <h2 className="text-xl font-bold">Redimir Café Prepagado</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {activeUpgrades.length === 0 ? (
            <div className="text-center py-12">
              <Coffee className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg mb-2">No hay mejoras activas</p>
              <p className="text-gray-400 text-sm">Crea una nueva mejora para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Selecciona el servicio que está reclamando su café:
              </p>
              
              {activeUpgrades.map(upgrade => (
                <div
                  key={upgrade.id}
                  className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-purple-400 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        Capilla {upgrade.chapel}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Creado: {new Date(upgrade.timestamp).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="bg-purple-50 rounded-lg p-2">
                      <p className="text-xs text-purple-700 font-semibold">Cafés Restantes</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {upgrade.remainingCoffees}
                        <span className="text-sm text-purple-600 ml-1">
                          / {upgrade.totalCoffees}
                        </span>
                      </p>
                    </div>
                    
                    <div className="bg-amber-50 rounded-lg p-2">
                      <p className="text-xs text-amber-700 font-semibold">Costo Total</p>
                      <p className="text-2xl font-bold text-amber-900">
                        ${upgrade.totalCost}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${(upgrade.remainingCoffees / upgrade.totalCoffees) * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* Quantity Selector */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-3">
                    <p className="text-xs text-purple-700 font-semibold mb-2 text-center">
                      Cantidad a Redimir
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuantity(upgrade.id, getQuantity(upgrade.id) - 1);
                        }}
                        variant="outline"
                        size="sm"
                        className="h-10 w-10 rounded-full border-purple-300 hover:bg-purple-100"
                        disabled={getQuantity(upgrade.id) <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <input
                        type="number"
                        min="1"
                        max={upgrade.remainingCoffees}
                        value={getQuantity(upgrade.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          const value = parseInt(e.target.value) || 1;
                          setQuantity(upgrade.id, value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-20 text-center text-2xl font-bold text-purple-900 bg-white border-2 border-purple-300 rounded-lg px-2 py-1"
                      />
                      
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuantity(upgrade.id, getQuantity(upgrade.id) + 1);
                        }}
                        variant="outline"
                        size="sm"
                        className="h-10 w-10 rounded-full border-purple-300 hover:bg-purple-100"
                        disabled={getQuantity(upgrade.id) >= upgrade.remainingCoffees}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Redeem Button */}
                  <Button
                    onClick={() => handleRedeem(upgrade.id)}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3"
                  >
                    <Coffee className="w-4 h-4 mr-2" />
                    Redimir {getQuantity(upgrade.id)} {getQuantity(upgrade.id) === 1 ? 'Café' : 'Cafés'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}