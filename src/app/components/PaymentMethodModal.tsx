import { CreditCard, Banknote, X } from 'lucide-react';
import { Button } from './ui/button';
import { PaymentMethod } from '../types/inventory';

interface PaymentMethodModalProps {
  isOpen: boolean;
  total: number;
  onSelectPayment: (method: PaymentMethod) => void;
  onClose: () => void;
}

export function PaymentMethodModal({ isOpen, total, onSelectPayment, onClose }: PaymentMethodModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Método de Pago</h2>
            <p className="text-blue-100 mt-1 text-lg">Total: ${total.toFixed(2)}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X size={32} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <p className="text-gray-600 text-center text-xl mb-8">
            Selecciona el método de pago utilizado
          </p>

          <div className="grid grid-cols-1 gap-6">
            {/* Botón Efectivo */}
            <button
              onClick={() => onSelectPayment('efectivo')}
              className="group relative overflow-hidden rounded-xl border-3 border-green-500 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center justify-center gap-6">
                <div className="bg-green-500 text-white rounded-full p-6 group-hover:scale-110 transition-transform">
                  <Banknote size={56} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <h3 className="text-3xl font-bold text-green-800 mb-2">Efectivo</h3>
                  <p className="text-green-600 text-lg">Pago en efectivo</p>
                </div>
              </div>
            </button>

            {/* Botón Tarjeta */}
            <button
              onClick={() => onSelectPayment('tarjeta')}
              className="group relative overflow-hidden rounded-xl border-3 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center justify-center gap-6">
                <div className="bg-blue-500 text-white rounded-full p-6 group-hover:scale-110 transition-transform">
                  <CreditCard size={56} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <h3 className="text-3xl font-bold text-blue-800 mb-2">Tarjeta</h3>
                  <p className="text-blue-600 text-lg">Pago con tarjeta</p>
                </div>
              </div>
            </button>
          </div>

          {/* Botón Cancelar */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full mt-6 h-16 text-xl"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
