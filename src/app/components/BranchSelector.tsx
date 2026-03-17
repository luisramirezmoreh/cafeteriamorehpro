import { useState } from 'react';
import { Store, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { BranchName, Branch } from '../types/inventory';
import { BranchChangeConfirmation } from './BranchChangeConfirmation';
import { BranchManager } from './BranchManager';

interface BranchSelectorProps {
  currentBranch: BranchName;
  onSelectBranch: (branch: BranchName) => void;
  branches: Branch[];
  onSaveBranches: (branches: Branch[]) => void;
}

export function BranchSelector({ 
  currentBranch, 
  onSelectBranch, 
  branches,
  onSaveBranches 
}: BranchSelectorProps) {
  const [pendingBranch, setPendingBranch] = useState<BranchName | null>(null);
  const [showManager, setShowManager] = useState(false);

  const handleBranchClick = (branch: BranchName) => {
    if (branch === currentBranch) {
      // Si es la misma sucursal, no hacer nada
      return;
    }
    // Abrir modal de confirmación
    setPendingBranch(branch);
  };

  const handleConfirmChange = () => {
    if (pendingBranch) {
      onSelectBranch(pendingBranch);
      setPendingBranch(null);
    }
  };

  const handleCancelChange = () => {
    setPendingBranch(null);
  };

  return (
    <>
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Store className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-blue-900">Sucursal Actual</h2>
          </div>
          <Button
            onClick={() => setShowManager(true)}
            variant="outline"
            size="sm"
            className="bg-white hover:bg-blue-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Gestionar Sucursales
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {branches.map(branch => (
            <Button
              key={branch.id}
              onClick={() => handleBranchClick(branch.id)}
              variant={currentBranch === branch.id ? 'default' : 'outline'}
              className={`
                h-20 text-lg font-semibold transition-all
                ${currentBranch === branch.id 
                  ? 'text-white shadow-lg scale-105' 
                  : 'hover:bg-blue-50 hover:border-blue-300'
                }
              `}
              style={
                currentBranch === branch.id
                  ? {
                      background: `linear-gradient(135deg, ${branch.color || '#3b82f6'} 0%, ${branch.color || '#3b82f6'}dd 100%)`,
                    }
                  : {}
              }
            >
              <div className="flex flex-col items-center gap-1">
                {currentBranch === branch.id && (
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mb-1" />
                )}
                <span>{branch.displayName}</span>
                {currentBranch === branch.id && (
                  <span className="text-xs opacity-90">Activa</span>
                )}
              </div>
            </Button>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>🔒 Protegido:</strong> Requiere contraseña de administrador para cambiar de sucursal.
            Los inventarios, ventas y dinero son independientes por sucursal.
          </p>
        </div>
      </Card>

      {/* Modal de confirmación con contraseña */}
      {pendingBranch && (
        <BranchChangeConfirmation
          targetBranch={pendingBranch}
          currentBranch={currentBranch}
          onConfirm={handleConfirmChange}
          onCancel={handleCancelChange}
        />
      )}

      {/* Gestor de Sucursales */}
      {showManager && (
        <BranchManager
          branches={branches}
          onSaveBranches={onSaveBranches}
          onClose={() => setShowManager(false)}
        />
      )}
    </>
  );
}