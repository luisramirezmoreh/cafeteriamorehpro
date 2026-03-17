import { useState } from 'react';
import { X, Save, Image as ImageIcon, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Product } from '../types/inventory';
import { toast } from 'sonner';

interface ProductEditorProps {
  products: Product[];
  onUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  onClose: () => void;
}

export function ProductEditor({ products, onUpdateProduct, onClose }: ProductEditorProps) {
  const [editingProducts, setEditingProducts] = useState<Record<string, Partial<Product>>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar productos que se pueden editar (precio > 0 o complementos visibles)
  const editableProducts = products.filter(p => p.id !== 'tenedores');

  // Filtrar por búsqueda
  const filteredProducts = editableProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (productId: string, field: keyof Product, value: string | number) => {
    setEditingProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const handleSave = (productId: string) => {
    const updates = editingProducts[productId];
    if (!updates) return;

    // Validar que el nombre no esté vacío
    if (updates.name !== undefined && updates.name.trim() === '') {
      toast.error('El nombre no puede estar vacío');
      return;
    }

    // Validar que el precio sea válido
    if (updates.price !== undefined && updates.price < 0) {
      toast.error('El precio no puede ser negativo');
      return;
    }

    onUpdateProduct(productId, updates);
    
    // Limpiar el estado de edición para este producto
    setEditingProducts(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });

    toast.success('Producto actualizado');
  };

  const hasChanges = (productId: string) => {
    return editingProducts[productId] !== undefined;
  };

  const getEditValue = (product: Product, field: keyof Product) => {
    const editing = editingProducts[product.id];
    if (editing && editing[field] !== undefined) {
      return editing[field];
    }
    return product[field];
  };

  const categoryNames: Record<string, string> = {
    'maruchan': '1º Maruchan',
    'papitas': '2º Papitas',
    'capuchinos': '3º Capuchinos',
    'otros': '4º Galletas, Chocolates y Dulces'
  };

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const sortedCategories = Object.keys(groupedProducts).sort((a, b) => {
    const order = ['maruchan', 'papitas', 'capuchinos', 'otros'];
    return order.indexOf(a) - order.indexOf(b);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ImageIcon className="w-7 h-7" />
              Editor de Productos
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Personaliza nombre, precio e imagen de cada producto
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {sortedCategories.map(category => {
              const categoryProducts = groupedProducts[category];
              return (
                <div key={category}>
                  <h3 className="text-xl font-bold mb-4 text-gray-700 border-b-2 border-blue-200 pb-2">
                    {categoryNames[category] || category}
                  </h3>
                  <div className="space-y-3">
                    {categoryProducts.map(product => {
                      const editing = hasChanges(product.id);
                      const currentImageUrl = getEditValue(product, 'imageUrl') as string | undefined;

                      return (
                        <Card 
                          key={product.id} 
                          className={`p-4 transition-all ${
                            editing ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
                          }`}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                            {/* Vista previa de imagen */}
                            <div className="md:col-span-2">
                              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300">
                                {currentImageUrl ? (
                                  <img 
                                    src={currentImageUrl} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556910638-7d51318e5f8c?w=400&q=80';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon className="w-12 h-12" />
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 text-center mt-1">
                                ID: {product.id}
                              </p>
                            </div>

                            {/* Campos de edición */}
                            <div className="md:col-span-8 space-y-3">
                              {/* Nombre */}
                              <div>
                                <label className="text-xs text-gray-600 font-semibold">Nombre del Producto</label>
                                <Input
                                  type="text"
                                  value={getEditValue(product, 'name') as string}
                                  onChange={(e) => handleChange(product.id, 'name', e.target.value)}
                                  className="mt-1"
                                  placeholder="Nombre del producto"
                                />
                              </div>

                              {/* Precio */}
                              <div>
                                <label className="text-xs text-gray-600 font-semibold">Precio ($)</label>
                                <Input
                                  type="number"
                                  value={getEditValue(product, 'price') as number}
                                  onChange={(e) => handleChange(product.id, 'price', parseFloat(e.target.value) || 0)}
                                  className="mt-1"
                                  placeholder="0.00"
                                  step="0.01"
                                  min="0"
                                />
                              </div>

                              {/* URL de imagen */}
                              <div>
                                <label className="text-xs text-gray-600 font-semibold">
                                  URL de Imagen (Unsplash, Imgur, etc.)
                                </label>
                                <Input
                                  type="text"
                                  value={currentImageUrl || ''}
                                  onChange={(e) => handleChange(product.id, 'imageUrl', e.target.value)}
                                  className="mt-1"
                                  placeholder="https://images.unsplash.com/photo-..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  💡 Busca imágenes gratis en <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Unsplash.com</a>
                                </p>
                              </div>
                            </div>

                            {/* Botón de guardar */}
                            <div className="md:col-span-2 flex items-center justify-center">
                              <Button
                                onClick={() => handleSave(product.id)}
                                disabled={!editing}
                                className={`w-full ${
                                  editing 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-gray-300'
                                }`}
                                size="lg"
                              >
                                <Save className="w-5 h-5 mr-2" />
                                {editing ? 'Guardar' : 'Sin cambios'}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {Object.keys(editingProducts).length > 0 ? (
              <span className="text-orange-600 font-semibold">
                ⚠️ Tienes {Object.keys(editingProducts).length} producto(s) sin guardar
              </span>
            ) : (
              <span className="text-green-600 font-semibold">
                ✅ Todos los cambios guardados
              </span>
            )}
          </p>
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      </Card>
    </div>
  );
}
