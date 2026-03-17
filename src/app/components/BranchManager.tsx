import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, Store, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Branch } from '../types/inventory';
import { toast } from 'sonner';

interface BranchManagerProps {
  branches: Branch[];
  onSaveBranches: (branches: Branch[]) => void;
  onClose: () => void;
}

const DEFAULT_COLORS = [
  '#3b82f6', // Azul
  '#10b981', // Verde
  '#f59e0b', // Naranja
  '#ef4444', // Rojo
  '#8b5cf6', // Morado
  '#ec4899', // Rosa
  '#06b6d4', // Cian
  '#84cc16', // Lima
];

export function BranchManager({ branches, onSaveBranches, onClose }: BranchManagerProps) {
  const [localBranches, setLocalBranches] = useState<Branch[]>(branches);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newBranch, setNewBranch] = useState<Partial<Branch>>({
    displayName: '',
    color: DEFAULT_COLORS[0],
  });

  const handleCreateBranch = () => {
    if (!newBranch.displayName?.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    const id = newBranch.displayName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Verificar que el ID no exista
    if (localBranches.some(b => b.id === id)) {
      toast.error('Ya existe una sucursal con ese nombre');
      return;
    }

    const branch: Branch = {
      id,
      name: id,
      displayName: newBranch.displayName.trim(),
      color: newBranch.color || DEFAULT_COLORS[0],
      isDefault: false,
    };

    setLocalBranches([...localBranches, branch]);
    setNewBranch({ displayName: '', color: DEFAULT_COLORS[0] });
    setIsCreating(false);
    toast.success(`Sucursal "${branch.displayName}" creada`);
  };

  const handleUpdateBranch = (id: string, updates: Partial<Branch>) => {
    setLocalBranches(
      localBranches.map(b =>
        b.id === id ? { ...b, ...updates } : b
      )
    );
  };

  const handleDeleteBranch = (id: string) => {
    const branch = localBranches.find(b => b.id === id);
    if (branch?.isDefault) {
      toast.error('No se pueden eliminar sucursales por defecto');
      return;
    }

    if (confirm(`¿Eliminar sucursal "${branch?.displayName}"?\n\n⚠️ ADVERTENCIA: Se eliminarán todos los datos asociados (inventarios, ventas, turnos).`)) {
      setLocalBranches(localBranches.filter(b => b.id !== id));
      toast.success(`Sucursal "${branch?.displayName}" eliminada`);
    }
  };

  const handleSave = () => {
    onSaveBranches(localBranches);
    toast.success('Configuración de sucursales guardada', {
      icon: '✅',
      duration: 2000,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Store className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Gestionar Sucursales
                </h2>
                <p className="text-sm text-gray-600">
                  Crear, editar y eliminar sucursales
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Lista de Sucursales */}
          <div className="space-y-3 mb-6">
            {localBranches.map(branch => (
              <Card
                key={branch.id}
                className="p-4 border-2"
                style={{ borderColor: branch.color }}
              >
                {editingId === branch.id ? (
                  // Modo edición
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nombre de la sucursal
                      </label>
                      <input
                        type="text"
                        value={branch.displayName}
                        onChange={e =>
                          handleUpdateBranch(branch.id, {
                            displayName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Sucursal Centro"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Color
                      </label>
                      <div className="flex gap-2">
                        {DEFAULT_COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() =>
                              handleUpdateBranch(branch.id, { color })
                            }
                            className={`w-10 h-10 rounded-full border-2 ${
                              branch.color === color
                                ? 'border-gray-900 scale-110'
                                : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingId(null)}
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Guardar
                      </Button>
                      <Button
                        onClick={() => setEditingId(null)}
                        variant="outline"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Modo vista
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: branch.color }}
                      />
                      <div>
                        <h3 className="font-bold text-lg">
                          {branch.displayName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ID: {branch.id}
                          {branch.isDefault && (
                            <span className="ml-2 text-blue-600 font-medium">
                              (Por defecto)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingId(branch.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {!branch.isDefault && (
                        <Button
                          onClick={() => handleDeleteBranch(branch.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Crear Nueva Sucursal */}
          {isCreating ? (
            <Card className="p-4 border-2 border-dashed border-gray-300 bg-gray-50">
              <h3 className="font-bold mb-4">Nueva Sucursal</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nombre de la sucursal *
                  </label>
                  <input
                    type="text"
                    value={newBranch.displayName || ''}
                    onChange={e =>
                      setNewBranch({ ...newBranch, displayName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Sucursal Centro"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <div className="flex gap-2">
                    {DEFAULT_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewBranch({ ...newBranch, color })}
                        className={`w-10 h-10 rounded-full border-2 ${
                          newBranch.color === color
                            ? 'border-gray-900 scale-110'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateBranch} className="flex-1">
                    <Check className="w-4 h-4 mr-2" />
                    Crear Sucursal
                  </Button>
                  <Button
                    onClick={() => {
                      setIsCreating(false);
                      setNewBranch({ displayName: '', color: DEFAULT_COLORS[0] });
                    }}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Button
              onClick={() => setIsCreating(true)}
              variant="outline"
              className="w-full h-14 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear Nueva Sucursal
            </Button>
          )}

          {/* Warning */}
          <div className="mt-6 bg-amber-50 border border-amber-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">⚠️ Importante:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Cada sucursal tiene su propio inventario, ventas y turnos</li>
                  <li>Al eliminar una sucursal, se eliminan todos sus datos</li>
                  <li>Las sucursales por defecto no se pueden eliminar</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-6">
            <Button onClick={handleSave} className="flex-1 h-12">
              Guardar Cambios
            </Button>
            <Button onClick={onClose} variant="outline" className="px-8 h-12">
              Cancelar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
