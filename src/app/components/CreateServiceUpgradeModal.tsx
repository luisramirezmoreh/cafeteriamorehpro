import { useState } from 'react';
import { X, Coffee, DollarSign, Hash } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ChapelName } from '../types/inventory';
import { toast } from 'sonner';

interface CreateServiceUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUpgrade: (chapel: ChapelName, totalCoffees: number, totalCost: number) => void;
  activeChapels: ChapelName[];
}

const CHAPELS: ChapelName[] = ['Armonía', 'Bonanza', 'Concordia'];

export function CreateServiceUpgradeModal({ 
  isOpen, 
  onClose, 
  onCreateUpgrade,
  activeChapels 
}: CreateServiceUpgradeModalProps) {
  const [selectedChapel, setSelectedChapel] = useState<ChapelName | null>(null);
  const [totalCoffees, setTotalCoffees] = useState('');
  const [totalCost, setTotalCost] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedChapel) {
      toast.error('Selecciona una capilla');
      return;
    }

    const coffees = parseInt(totalCoffees);
    const cost = parseFloat(totalCost);

    if (isNaN(coffees) || coffees <= 0) {
      toast.error('Ingresa una cantidad válida de cafés');
      return;
    }

    if (isNaN(cost) || cost <= 0) {
      toast.error('Ingresa un costo válido');
      return;
    }

    onCreateUpgrade(selectedChapel, coffees, cost);
    
    // Limpiar formulario
    setSelectedChapel(null);
    setTotalCoffees('');
    setTotalCost('');
    onClose();
  };

  const handleClose = () => {
    setSelectedChapel(null);
    setTotalCoffees('');
    setTotalCost('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <Coffee className="w-6 h-6" />
            <h2 className="text-xl font-bold">Nueva Mejora de Servicio</h2>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selector de Capilla */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Selecciona la Capilla
            </label>
            <div className="grid grid-cols-1 gap-3">
              {CHAPELS.map(chapel => {
                const isActive = activeChapels.includes(chapel);
                return (
                  <button
                    key={chapel}
                    type="button"
                    onClick={() => setSelectedChapel(chapel)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedChapel === chapel
                        ? 'border-amber-600 bg-amber-50 shadow-md'
                        : isActive
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50'
                    }`}
                    disabled={isActive}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedChapel === chapel
                            ? 'border-amber-600 bg-amber-600'
                            : 'border-gray-300'
                        }`}>
                          {selectedChapel === chapel && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                        <span className="font-medium text-lg">{chapel}</span>
                      </div>
                      {isActive && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">
                          Ya Activa
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cantidad de Cafés */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Hash className="w-4 h-4 inline mr-1" />
              Cantidad de Cafés Prepagados
            </label>
            <Input
              type="number"
              min="1"
              value={totalCoffees}
              onChange={(e) => setTotalCoffees(e.target.value)}
              placeholder="Ej: 20"
              className="text-lg"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Generalmente entre 15 y 30 cafés</p>
          </div>

          {/* Costo Total */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Costo Total de la Mejora
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              placeholder="Ej: 500.00"
              className="text-lg"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Monto total pagado por el servicio</p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              size="lg"
            >
              Crear Mejora
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
