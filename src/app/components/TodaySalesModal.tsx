import { useState } from 'react';
import { X, TrendingUp, Package, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Product, DailySale, StockGroup, ShiftRecord, CafeteriaState } from '../types/inventory';
import { toast } from 'sonner';

interface TodaySalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  stockGroups: StockGroup[];
  sales: DailySale[];
  cafeteriaState: CafeteriaState;
  onEndShift: (shiftRecord: ShiftRecord) => void;
  onCorte: (shiftRecord: ShiftRecord, changeMoney: number) => void;
}

export function TodaySalesModal({
  isOpen,
  onClose,
  products,
  stockGroups,
  sales,
  cafeteriaState,
  onEndShift,
  onCorte
}: TodaySalesModalProps) {
  const today = new Date().toISOString().split('T')[0];
  
  const [view, setView] = useState<'summary' | 'endShift' | 'corte'>('summary');
  const [shiftName, setShiftName] = useState('');
  const [shiftType, setShiftType] = useState<'matutino' | 'vespertino' | 'nocturno' | ''>(''); // Ninguno seleccionado por defecto
  const [reportedCash, setReportedCash] = useState(''); // Efectivo reportado
  const [reportedCard, setReportedCard] = useState(''); // Tarjeta reportada
  const [changeMoney, setChangeMoney] = useState('');
  const [password, setPassword] = useState('');

  // Actualizar nombre cuando cambia el tipo de turno
  const updateShiftName = (type: 'matutino' | 'vespertino' | 'nocturno') => {
    setShiftType(type);
    const turnoLabel = type === 'matutino' ? 'Matutino' : type === 'vespertino' ? 'Vespertino' : 'Nocturno';
    setShiftName(`${today} - Turno ${turnoLabel}`);
  };

  if (!isOpen) return null;

  // Calcular ventas de hoy por método de pago
  const todaySales = sales.filter(sale => sale.date === today);
  
  // Separar ventas por método de pago
  const cashSales = todaySales.filter(sale => sale.paymentMethod === 'efectivo' || !sale.paymentMethod); // Compatibilidad con ventas viejas sin paymentMethod
  const cardSales = todaySales.filter(sale => sale.paymentMethod === 'tarjeta');
  
  const totalCash = cashSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalCard = cardSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalMoney = totalCash + totalCard;
  
  const expectedCash = totalCash + cafeteriaState.initialMoney; // Efectivo esperado incluye cambio inicial
  const expectedCard = totalCard; // Tarjeta no incluye cambio inicial

  // Calcular diferencias de inventario
  const getStockDifferences = () => {
    if (!cafeteriaState.initialStock) return [];

    const differences: Array<{
      name: string;
      initial: number;
      current: number;
      sold: number;
    }> = [];

    // Productos individuales
    products.forEach(product => {
      if (product.stockGroupId) return; // Los que tienen grupo se manejan aparte
      
      const initialProduct = cafeteriaState.initialStock!.products.find(p => p.id === product.id);
      if (initialProduct && initialProduct.stock !== product.stock) {
        differences.push({
          name: product.name,
          initial: initialProduct.stock,
          current: product.stock,
          sold: initialProduct.stock - product.stock
        });
      }
    });

    // Grupos de stock
    stockGroups.forEach(group => {
      const initialGroup = cafeteriaState.initialStock!.stockGroups.find(g => g.id === group.id);
      if (initialGroup && initialGroup.stock !== group.stock) {
        differences.push({
          name: group.name,
          initial: initialGroup.stock,
          current: group.stock,
          sold: initialGroup.stock - group.stock
        });
      }
    });

    return differences;
  };

  const handleEndShift = () => {
    if (!shiftName.trim()) {
      toast.error('Por favor ingresa un nombre para el turno');
      return;
    }
    if (!reportedCash || parseFloat(reportedCash) < 0) {
      toast.error('Por favor ingresa el dinero en efectivo reportado');
      return;
    }

    const now = Date.now();
    const shiftRecord: ShiftRecord = {
      id: `shift-${now}`,
      name: shiftName,
      shiftType,
      startTime: cafeteriaState.currentShiftStartTime || cafeteriaState.openedAt || now,
      endTime: now,
      startStock: cafeteriaState.initialStock || { products, stockGroups },
      endStock: {
        products: JSON.parse(JSON.stringify(products)),
        stockGroups: JSON.parse(JSON.stringify(stockGroups))
      },
      expectedMoney: expectedCash,
      reportedMoney: parseFloat(reportedCash),
      expectedCard: expectedCard,
      reportedCard: parseFloat(reportedCard) || 0,
      isCorte: false
    };

    onEndShift(shiftRecord);
    toast.success('Turno entregado exitosamente');
    onClose();
  };

  const handleCorte = () => {
    if (password !== '1062000') {
      toast.error('Contraseña incorrecta');
      return;
    }
    if (!shiftName.trim()) {
      toast.error('Por favor ingresa un nombre para el turno');
      return;
    }
    if (!reportedCash || parseFloat(reportedCash) < 0) {
      toast.error('Por favor ingresa el dinero en efectivo reportado');
      return;
    }

    const changeAmount = changeMoney ? parseFloat(changeMoney) : 0;
    if (changeAmount < 0) {
      toast.error('El cambio no puede ser negativo');
      return;
    }

    const now = Date.now();
    const shiftRecord: ShiftRecord = {
      id: `shift-${now}`,
      name: shiftName,
      shiftType,
      startTime: cafeteriaState.currentShiftStartTime || cafeteriaState.openedAt || now,
      endTime: now,
      startStock: cafeteriaState.initialStock || { products, stockGroups },
      endStock: {
        products: JSON.parse(JSON.stringify(products)),
        stockGroups: JSON.parse(JSON.stringify(stockGroups))
      },
      expectedMoney: expectedCash,
      reportedMoney: parseFloat(reportedCash),
      expectedCard: expectedCard,
      reportedCard: parseFloat(reportedCard) || 0,
      isCorte: true,
      changeMoney: changeAmount
    };

    onCorte(shiftRecord, changeAmount);
    toast.success('Corte realizado exitosamente. Cafetería cerrada.');
    onClose();
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stockDifferences = getStockDifferences();

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      {/* Header fijo */}
      <div className="sticky top-0 bg-white border-b shadow-md z-10">
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="w-8 h-8" />
            {view === 'summary' ? 'Venta de Hoy' : view === 'endShift' ? 'Entregar Turno' : 'Finalizar Ventas'}
          </h2>
          <Button variant="ghost" size="lg" onClick={onClose} className="h-14 w-14">
            <X className="w-8 h-8" />
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {view === 'summary' && (
          <>
            {/* BOTONES PRINCIPALES ARRIBA */}
            {cafeteriaState.isOpen && (
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Button
                  onClick={() => setView('endShift')}
                  className="h-32 text-3xl font-bold bg-blue-600 hover:bg-blue-700 shadow-lg"
                  size="lg"
                >
                  <CheckCircle className="w-10 h-10 mr-4" />
                  Entregar Turno
                </Button>
                <Button
                  onClick={() => {
                    // Auto-llenar campos con valores esperados
                    setReportedCash(expectedCash.toFixed(2));
                    setReportedCard(expectedCard.toFixed(2));
                    setView('corte');
                  }}
                  className="h-32 text-3xl font-bold bg-purple-600 hover:bg-purple-700 shadow-lg"
                  size="lg"
                >
                  <DollarSign className="w-10 h-10 mr-4" />
                  Finalizar Ventas
                </Button>
              </div>
            )}

            {!cafeteriaState.isOpen && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-8">
                <p className="text-red-700 text-center text-xl font-semibold">
                  ⚠️ La cafetería está cerrada. No se pueden realizar ventas.
                </p>
              </div>
            )}

            {cafeteriaState.isOpen && cafeteriaState.openedAt && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-5 mb-8">
                <div className="flex items-center gap-3 text-green-700 text-lg">
                  <Clock className="w-6 h-6" />
                  <span className="font-semibold">Turno iniciado: {formatDateTime(cafeteriaState.openedAt)}</span>
                </div>
              </div>
            )}

            {/* Resumen de Dinero - Más compacto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 bg-green-50 border-2 border-green-300">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-7 h-7 text-green-600" />
                  <h3 className="text-lg text-gray-600 font-semibold">Efectivo en Caja</h3>
                </div>
                <p className="text-4xl font-bold text-green-700 mb-3">${expectedCash.toFixed(2)}</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>💵 Cambio inicial: ${cafeteriaState.initialMoney.toFixed(2)}</p>
                  <p>💰 Ventas: ${totalCash.toFixed(2)} ({cashSales.length})</p>
                </div>
              </Card>

              <Card className="p-6 bg-blue-50 border-2 border-blue-300">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-7 h-7 text-blue-600" />
                  <h3 className="text-lg text-gray-600 font-semibold">Tickets de Tarjeta</h3>
                </div>
                <p className="text-4xl font-bold text-blue-700 mb-3">${expectedCard.toFixed(2)}</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>💳 Ventas: ${totalCard.toFixed(2)} ({cardSales.length})</p>
                </div>
              </Card>

              <Card className="p-6 bg-purple-50 border-2 border-purple-300">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-7 h-7 text-purple-600" />
                  <h3 className="text-lg text-gray-600 font-semibold">Total Ventas</h3>
                </div>
                <p className="text-4xl font-bold text-purple-700 mb-3">${totalMoney.toFixed(2)}</p>
                <div className="text-sm text-gray-600">
                  <p>{todaySales.length} transacciones</p>
                </div>
              </Card>
            </div>

            {/* Cambios en Inventario - Más compacto */}
            {stockDifferences.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="w-6 h-6 text-gray-700" />
                  <h3 className="text-xl font-semibold">Cambios en Inventario</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stockDifferences.map((diff, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                      <span className="font-medium">{diff.name}</span>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-600">Inicial: {diff.initial}</span>
                        <span className="text-red-600 font-semibold">-{diff.sold}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        {view === 'endShift' && (
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => setView('summary')} 
              className="mb-6 text-xl h-16 px-8"
              size="lg"
            >
              ← Regresar
            </Button>

            {/* Selección de Turno - ARRIBA DE TODO */}
            <div className="bg-amber-50 border-4 border-amber-400 rounded-xl p-8 mb-6">
              <label className="block text-2xl font-bold mb-6 text-amber-900 text-center">
                ⚠️ Selecciona el Tipo de Turno (Obligatorio)
              </label>
              <div className="grid grid-cols-3 gap-6 mb-4">
                <Button
                  variant={shiftType === 'matutino' ? 'default' : 'outline'}
                  onClick={() => {
                    updateShiftName('matutino');
                    setReportedCash(expectedCash.toFixed(2));
                    setReportedCard(expectedCard.toFixed(2));
                  }}
                  className="h-32 text-2xl font-bold"
                  size="lg"
                >
                  ☀️ Turno Matutino
                </Button>
                <Button
                  variant={shiftType === 'vespertino' ? 'default' : 'outline'}
                  onClick={() => {
                    updateShiftName('vespertino');
                    setReportedCash(expectedCash.toFixed(2));
                    setReportedCard(expectedCard.toFixed(2));
                  }}
                  className="h-32 text-2xl font-bold"
                  size="lg"
                >
                  🌅 Turno Vespertino
                </Button>
                <Button
                  variant={shiftType === 'nocturno' ? 'default' : 'outline'}
                  onClick={() => {
                    updateShiftName('nocturno');
                    setReportedCash(expectedCash.toFixed(2));
                    setReportedCard(expectedCard.toFixed(2));
                  }}
                  className="h-32 text-2xl font-bold"
                  size="lg"
                >
                  🌙 Turno Nocturno
                </Button>
              </div>
              {!shiftType && (
                <p className="text-red-600 text-2xl font-bold mt-4 text-center animate-pulse">
                  👆 Debes seleccionar un turno para continuar
                </p>
              )}
            </div>

            {/* Formulario compacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Efectivo */}
              <div className="bg-green-50 border-3 border-green-300 rounded-xl p-6">
                <label className="block text-xl font-bold mb-4 text-green-900">💵 Efectivo</label>
                <Input
                  className="h-32 font-bold text-center"
                  style={{ fontSize: '4rem' }}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={reportedCash}
                  onChange={(e) => setReportedCash(e.target.value)}
                />
                <p className="text-lg text-green-700 mt-3 font-semibold text-center">
                  ✅ Esperado: ${expectedCash.toFixed(2)}
                </p>
              </div>

              {/* Tarjeta */}
              <div className="bg-blue-50 border-3 border-blue-300 rounded-xl p-6">
                <label className="block text-xl font-bold mb-4 text-blue-900">💳 Tarjeta</label>
                <Input
                  className="h-32 font-bold text-center"
                  style={{ fontSize: '4rem' }}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={reportedCard}
                  onChange={(e) => setReportedCard(e.target.value)}
                />
                <p className="text-lg text-blue-700 mt-3 font-semibold text-center">
                  ✅ Esperado: ${expectedCard.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Nombre del Turno - Auto-llenado */}
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-3">Nombre del Turno (Auto-generado)</label>
              <Input
                className="h-16 text-xl bg-gray-100"
                value={shiftName}
                readOnly
              />
            </div>

            {/* Botón de Confirmación GRANDE */}
            <Button 
              onClick={handleEndShift} 
              disabled={!shiftType}
              className="w-full h-28 text-3xl font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl" 
              size="lg"
            >
              {shiftType ? '✅ Confirmar Entrega de Turno' : '⚠️ Selecciona un turno primero'}
            </Button>
          </div>
        )}

        {view === 'corte' && (
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => setView('summary')} 
              className="mb-6 text-xl h-16 px-8"
              size="lg"
            >
              ← Regresar
            </Button>

            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6">
              <p className="text-yellow-900 text-xl font-semibold text-center">
                ⚠️ Al finalizar ventas, se cerrará la cafetería y se registrará el turno
              </p>
            </div>

            {/* Selección de Turno - ARRIBA DE TODO */}
            <div className="bg-amber-50 border-4 border-amber-400 rounded-xl p-8 mb-6">
              <label className="block text-2xl font-bold mb-6 text-amber-900 text-center">
                ⚠️ Selecciona el Tipo de Turno (Obligatorio)
              </label>
              <div className="grid grid-cols-3 gap-6 mb-4">
                <Button
                  variant={shiftType === 'matutino' ? 'default' : 'outline'}
                  onClick={() => {
                    updateShiftName('matutino');
                    if (!reportedCash) setReportedCash(expectedCash.toFixed(2));
                    if (!reportedCard) setReportedCard(expectedCard.toFixed(2));
                  }}
                  className="h-32 text-2xl font-bold"
                  size="lg"
                >
                  ☀️ Turno Matutino
                </Button>
                <Button
                  variant={shiftType === 'vespertino' ? 'default' : 'outline'}
                  onClick={() => {
                    updateShiftName('vespertino');
                    if (!reportedCash) setReportedCash(expectedCash.toFixed(2));
                    if (!reportedCard) setReportedCard(expectedCard.toFixed(2));
                  }}
                  className="h-32 text-2xl font-bold"
                  size="lg"
                >
                  🌅 Turno Vespertino
                </Button>
                <Button
                  variant={shiftType === 'nocturno' ? 'default' : 'outline'}
                  onClick={() => {
                    updateShiftName('nocturno');
                    if (!reportedCash) setReportedCash(expectedCash.toFixed(2));
                    if (!reportedCard) setReportedCard(expectedCard.toFixed(2));
                  }}
                  className="h-32 text-2xl font-bold"
                  size="lg"
                >
                  🌙 Turno Nocturno
                </Button>
              </div>
              {!shiftType && (
                <p className="text-red-600 text-2xl font-bold mt-4 text-center animate-pulse">
                  👆 Debes seleccionar un turno para continuar
                </p>
              )}
            </div>

            {/* Formulario en grid compacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Efectivo */}
              <div className="bg-green-50 border-3 border-green-300 rounded-xl p-6">
                <label className="block text-xl font-bold mb-4 text-green-900">💵 Efectivo Reportado</label>
                <Input
                  className="h-32 font-bold text-center"
                  style={{ fontSize: '4rem' }}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={reportedCash}
                  onChange={(e) => setReportedCash(e.target.value)}
                />
                <p className="text-lg text-green-700 mt-3 font-semibold text-center">
                  ✅ Esperado: ${expectedCash.toFixed(2)}
                </p>
              </div>

              {/* Tarjeta */}
              <div className="bg-blue-50 border-3 border-blue-300 rounded-xl p-6">
                <label className="block text-xl font-bold mb-4 text-blue-900">💳 Tarjeta Reportada</label>
                <Input
                  className="h-32 font-bold text-center"
                  style={{ fontSize: '4rem' }}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={reportedCard}
                  onChange={(e) => setReportedCard(e.target.value)}
                />
                <p className="text-lg text-blue-700 mt-3 font-semibold text-center">
                  ✅ Esperado: ${expectedCard.toFixed(2)}
                </p>
              </div>

              {/* Cambio a Dejar */}
              <div className="bg-purple-50 border-3 border-purple-300 rounded-xl p-6">
                <label className="block text-xl font-bold mb-4 text-purple-900">💰 Cambio a Dejar</label>
                <Input
                  className="h-32 font-bold text-center"
                  style={{ fontSize: '4rem' }}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={changeMoney}
                  onChange={(e) => setChangeMoney(e.target.value)}
                />
                <p className="text-sm text-purple-700 mt-3 text-center">
                  Cambio inicial para el próximo turno
                </p>
              </div>

              {/* Contraseña */}
              <div className="bg-red-50 border-3 border-red-300 rounded-xl p-6">
                <label className="block text-xl font-bold mb-4 text-red-900">🔒 Contraseña</label>
                <Input
                  className="h-32 font-bold text-center"
                  style={{ fontSize: '4rem' }}
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-sm text-red-700 mt-3 text-center">
                  Contraseña de administrador
                </p>
              </div>
            </div>

            {/* Nombre del Turno */}
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-3">Nombre del Turno (Auto-generado)</label>
              <Input
                className="h-16 text-xl bg-gray-100"
                value={shiftName}
                readOnly
              />
            </div>

            {/* Botón de Confirmación GRANDE */}
            <Button 
              onClick={handleCorte}
              disabled={!shiftType}
              className="w-full h-28 text-3xl font-bold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl" 
              size="lg"
            >
              {shiftType ? '✅ Confirmar Finalizar Ventas' : '⚠️ Selecciona un turno primero'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}