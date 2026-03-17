import { useState } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { toast } from 'sonner';

interface LoginScreenProps {
  onLogin: () => void;
  onCancel?: () => void;
}

const ADMIN_PASSWORD = '1062000';

export function LoginScreen({ onLogin, onCancel }: LoginScreenProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
      toast.success('Acceso concedido');
    } else {
      toast.error('Clave incorrecta');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center p-4">
      {onCancel && (
        <Button
          onClick={onCancel}
          variant="ghost"
          size="lg"
          className="absolute top-4 left-4 text-white hover:bg-white hover:bg-opacity-20"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          Regresar
        </Button>
      )}
      
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl mb-2">Panel de Administración</h1>
          <p className="text-sm text-gray-600">Ingresa la clave para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Ingresa la clave"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-center text-lg"
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" size="lg">
            Ingresar
          </Button>
        </form>
      </Card>
    </div>
  );
}