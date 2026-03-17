import { useState } from 'react';
import { Building2, Lock, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { BranchName } from '../types/inventory';

interface BranchChangeConfirmationProps {
  targetBranch: BranchName;
  currentBranch: BranchName;
  onConfirm: () => void;
  onCancel: () => void;
}

const ADMIN_PASSWORD = '1062000';

export function BranchChangeConfirmation({
  targetBranch,
  currentBranch,
  onConfirm,
  onCancel
}: BranchChangeConfirmationProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== ADMIN_PASSWORD) {
      setError('Contraseña incorrecta');
      setPassword('');
      return;
    }

    setIsLoading(true);
    onConfirm();
  };

  const getBranchDisplayName = (branch: BranchName) => {
    return branch.toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Confirmar Cambio de Sucursal</h2>
            <p className="text-sm text-gray-500">Ingresa la clave de administrador</p>
          </div>
        </div>

        {/* Advertencia */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-800 mb-1">
                Cambio de Sucursal
              </p>
              <p className="text-yellow-700">
                Estás a punto de cambiar de <span className="font-bold">{getBranchDisplayName(currentBranch)}</span> a{' '}
                <span className="font-bold">{getBranchDisplayName(targetBranch)}</span>.
              </p>
              <p className="text-yellow-700 mt-2">
                Esto cargará todos los datos (inventario, ventas, turnos) de la sucursal {getBranchDisplayName(targetBranch)}.
              </p>
            </div>
          </div>
        </div>

        {/* Visualización del cambio */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-lg">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-blue-900">{getBranchDisplayName(currentBranch)}</span>
          </div>
          <div className="text-2xl text-gray-400">→</div>
          <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-lg">
            <Building2 className="w-4 h-4 text-green-600" />
            <span className="font-bold text-green-900">{getBranchDisplayName(targetBranch)}</span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña de Administrador
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Ingresa la clave"
              className={`text-center text-2xl tracking-wider ${error ? 'border-red-500' : ''}`}
              autoFocus
              disabled={isLoading}
            />
            {error && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading || !password}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Cambiando...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Confirmar Cambio
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Nota de seguridad */}
        <p className="text-xs text-gray-500 text-center mt-4">
          🔒 Solo personal autorizado puede cambiar de sucursal
        </p>
      </div>
    </div>
  );
}
