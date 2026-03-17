import { useState } from 'react';
import { Package, Plus, Minus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

interface CupsCounterProps {
  currentCups: number;
  onUpdateCups: (newCount: number) => void;
}

export function CupsCounter({ currentCups, onUpdateCups }: CupsCounterProps) {
  const [showModal, setShowModal] = useState(false);
  const [tempCups, setTempCups] = useState(currentCups);

  const handleOpenModal = () => {
    setTempCups(currentCups);
    setShowModal(true);
  };

  const handleConfirm = () => {
    onUpdateCups(tempCups);
    setShowModal(false);
  };

  const handleCancel = () => {
    setTempCups(currentCups);
    setShowModal(false);
  };

  return (
    <>
      {/* Botón para mostrar el contador de vasos */}
      <Button
        onClick={handleOpenModal}
        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white w-full h-16 md:h-20 text-base md:text-lg font-semibold"
        size="lg"
      >
        <Package className="w-5 h-5 md:w-6 md:h-6 mr-2" />
        🥤 Vasos: {currentCups}
      </Button>

      {/* Modal para ajustar vasos */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="bg-white p-6 md:p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="w-7 h-7 text-blue-600" />
                Control de Vasos
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-10 w-10 p-0"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 text-base mb-4">
                Ajusta la cantidad de vasos disponibles
              </p>
              
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-blue-600 mb-2">Vasos Actuales</p>
                  <p className="text-5xl font-bold text-blue-700">{currentCups}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setTempCups(Math.max(0, tempCups - 1))}
                  variant="outline"
                  size="lg"
                  className="h-16 w-16 flex-shrink-0"
                >
                  <Minus className="w-6 h-6" />
                </Button>

                <Input
                  type="number"
                  value={tempCups}
                  onChange={(e) => setTempCups(Math.max(0, parseInt(e.target.value) || 0))}
                  className="text-3xl font-bold text-center h-16"
                  min="0"
                />

                <Button
                  onClick={() => setTempCups(tempCups + 1)}
                  variant="outline"
                  size="lg"
                  className="h-16 w-16 flex-shrink-0"
                >
                  <Plus className="w-6 h-6" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 h-14 text-lg font-semibold"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                ✅ Confirmar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
