import { useState } from 'react';
import { Store, Package, X, Check, Plus, Edit2, Trash2, Save, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { BranchProductConfig, Product } from '../types/inventory';
import { toast } from 'sonner';

interface BranchProductConfigProps {
  config: BranchProductConfig;
  onUpdateConfig: (config: BranchProductConfig) => void;
  products: Product[];
  onUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  onCreateProduct: (product: Omit<Product, 'id'>) => void;
  onDeleteProduct: (productId: string) => void;
  currentBranch: string;
}

const DEFAULT_CATEGORIES = [
  { id: 'maruchan', name: '🍜 Maruchan' },
  { id: 'papitas', name: '🥔 Papitas' },
  { id: 'capuchinos', name: '☕ Capuchinos' },
  { id: 'otros', name: '🍪 Galletas, Chocolates y Dulces' },
];

export function BranchProductConfigComponent({ 
  config, 
  onUpdateConfig, 
  products,
  onUpdateProduct,
  onCreateProduct,
  onDeleteProduct,
  currentBranch
}: BranchProductConfigProps) {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedPrice, setEditedPrice] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('maruchan');
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const toggleCategory = (categoryId: string) => {
    const isCurrentlyDisabled = config.disabledCategories.includes(categoryId);
    const newDisabledCategories = isCurrentlyDisabled
      ? config.disabledCategories.filter(c => c !== categoryId)
      : [...config.disabledCategories, categoryId];

    onUpdateConfig({
      ...config,
      disabledCategories: newDisabledCategories
    });
  };

  const isCategoryEnabled = (categoryId: string) => {
    return !config.disabledCategories.includes(categoryId);
  };

  const startEditingProduct = (product: Product) => {
    setEditingProduct(product.id);
    setEditedName(product.name);
    setEditedPrice(product.price.toString());
    setEditedCategory(product.category);
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setEditedName('');
    setEditedPrice('');
    setEditedCategory('');
  };

  const saveProduct = (productId: string) => {
    const price = parseFloat(editedPrice);
    if (isNaN(price) || price < 0) {
      toast.error('Precio inválido');
      return;
    }

    if (!editedName.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }

    onUpdateProduct(productId, {
      name: editedName,
      price: price,
      category: editedCategory
    });

    toast.success('Producto actualizado');
    cancelEditing();
  };

  const createNewProduct = () => {
    const price = parseFloat(newProductPrice);
    if (isNaN(price) || price < 0) {
      toast.error('Precio inválido');
      return;
    }

    if (!newProductName.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }

    const newProduct: Omit<Product, 'id'> = {
      name: newProductName,
      price: price,
      category: newProductCategory,
      stock: 0,
      reorderQuantity: 10,
      image: '',
      isEnabled: true
    };

    onCreateProduct(newProduct);
    toast.success('Producto creado');
    
    setNewProductName('');
    setNewProductPrice('');
    setNewProductCategory('maruchan');
    setShowNewProductForm(false);
  };

  const createNewCategory = () => {
    if (!newCategoryId.trim() || !newCategoryName.trim()) {
      toast.error('Complete todos los campos');
      return;
    }

    if (categories.some(cat => cat.id === newCategoryId)) {
      toast.error('Ya existe una categoría con ese ID');
      return;
    }

    setCategories([...categories, { id: newCategoryId, name: newCategoryName }]);
    toast.success('Categoría creada');
    
    setNewCategoryId('');
    setNewCategoryName('');
    setShowNewCategoryForm(false);
  };

  const deleteProduct = (productId: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      onDeleteProduct(productId);
      toast.success('Producto eliminado');
    }
  };

  // Filtrar productos que no pertenecen a grupos de stock
  const individualProducts = products.filter(p => !p.stockGroupId);

  // Agrupar productos por categoría
  const productsByCategory = individualProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Store className="w-8 h-8 text-purple-600" />
          <h2 className="text-3xl font-bold">Productos - {currentBranch.toUpperCase()}</h2>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoría
          </Button>
          <Button 
            onClick={() => setShowNewProductForm(!showNewProductForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Formulario Nueva Categoría */}
      {showNewCategoryForm && (
        <Card className="p-6 bg-purple-50 border-2 border-purple-300">
          <h3 className="text-xl font-bold mb-4">➕ Crear Nueva Categoría</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                ID de Categoría (sin espacios)
              </label>
              <Input
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value.toLowerCase().replace(/\s/g, '_'))}
                placeholder="bebidas"
                className="h-12 text-lg"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Nombre para Mostrar
              </label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="🥤 Bebidas"
                className="h-12 text-lg"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={createNewCategory} className="bg-purple-600 hover:bg-purple-700">
              <Save className="w-4 h-4 mr-2" />
              Crear Categoría
            </Button>
            <Button 
              onClick={() => {
                setShowNewCategoryForm(false);
                setNewCategoryId('');
                setNewCategoryName('');
              }} 
              variant="outline"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {/* Formulario Nuevo Producto */}
      {showNewProductForm && (
        <Card className="p-6 bg-green-50 border-2 border-green-300">
          <h3 className="text-xl font-bold mb-4">➕ Crear Nuevo Producto</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Nombre del Producto
              </label>
              <Input
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Coca-Cola 600ml"
                className="h-12 text-lg"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Precio ($)
              </label>
              <Input
                type="number"
                step="0.01"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                placeholder="15.00"
                className="h-12 text-lg"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Categoría
              </label>
              <select
                value={newProductCategory}
                onChange={(e) => setNewProductCategory(e.target.value)}
                className="w-full h-12 text-lg px-3 rounded-md border border-gray-300"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={createNewProduct} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Crear Producto
            </Button>
            <Button 
              onClick={() => {
                setShowNewProductForm(false);
                setNewProductName('');
                setNewProductPrice('');
                setNewProductCategory('maruchan');
              }} 
              variant="outline"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {/* Configuración de Categorías - Habilitar/Deshabilitar */}
      <div>
        <h3 className="text-2xl font-bold mb-4">
          📦 Secciones Habilitadas/Deshabilitadas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {categories.map(category => {
            const isEnabled = isCategoryEnabled(category.id);
            return (
              <Card
                key={category.id}
                className={`p-4 cursor-pointer transition-all ${
                  isEnabled
                    ? 'bg-green-50 border-2 border-green-500'
                    : 'bg-gray-100 border-2 border-gray-400 opacity-60'
                }`}
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <Package className={`w-12 h-12 ${isEnabled ? 'text-green-600' : 'text-gray-500'}`} />
                  <h4 className="text-lg font-bold">{category.name}</h4>
                  <p className={`text-sm font-semibold ${isEnabled ? 'text-green-700' : 'text-gray-600'}`}>
                    {isEnabled ? '✅ Habilitado' : '❌ Deshabilitado'}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Lista de Productos por Categoría */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">
          🛍️ Productos de Esta Sucursal
        </h3>
        
        {categories.map(category => {
          const categoryProducts = productsByCategory[category.id] || [];
          if (categoryProducts.length === 0) return null;

          return (
            <Card key={category.id} className="p-6">
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                {category.name}
                <span className="text-sm font-normal text-gray-600">
                  ({categoryProducts.length} productos)
                </span>
              </h4>
              
              <div className="space-y-3">
                {categoryProducts.map(product => {
                  const isEditing = editingProduct === product.id;
                  
                  return (
                    <div 
                      key={product.id} 
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
                    >
                      {isEditing ? (
                        <>
                          <div className="flex-1 grid grid-cols-3 gap-3">
                            <Input
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              className="h-12 text-lg"
                              placeholder="Nombre"
                            />
                            <Input
                              type="number"
                              step="0.01"
                              value={editedPrice}
                              onChange={(e) => setEditedPrice(e.target.value)}
                              className="h-12 text-lg"
                              placeholder="Precio"
                            />
                            <select
                              value={editedCategory}
                              onChange={(e) => setEditedCategory(e.target.value)}
                              className="h-12 text-lg px-3 rounded-md border border-gray-300"
                            >
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => saveProduct(product.id)}
                              className="bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Guardar
                            </Button>
                            <Button
                              onClick={cancelEditing}
                              variant="outline"
                              size="sm"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <p className="text-lg font-semibold">{product.name}</p>
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span>💰 ${product.price.toFixed(2)}</span>
                              <span>📦 Stock: {product.stock}</span>
                              <span className={product.isEnabled ? 'text-green-600' : 'text-red-600'}>
                                {product.isEnabled ? '✅ Activo' : '❌ Inactivo'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => startEditingProduct(product)}
                              variant="outline"
                              size="sm"
                              className="bg-blue-50 hover:bg-blue-100 border-blue-300"
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              onClick={() => deleteProduct(product.id)}
                              variant="outline"
                              size="sm"
                              className="bg-red-50 hover:bg-red-100 border-red-300 text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}

        {Object.keys(productsByCategory).length === 0 && (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No hay productos en esta sucursal. <br/>
              Haz clic en "Nuevo Producto" para agregar uno.
            </p>
          </Card>
        )}
      </div>

      <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-6">
        <p className="text-amber-900 text-lg font-semibold mb-2">
          💡 Tips
        </p>
        <ul className="text-amber-800 space-y-1 list-disc list-inside">
          <li>Cada sucursal puede tener productos diferentes con precios distintos</li>
          <li>Deshabilita categorías completas si no las necesitas en esta sucursal</li>
          <li>Puedes crear categorías nuevas para organizar mejor tus productos</li>
          <li>Los productos eliminados no se pueden recuperar</li>
        </ul>
      </div>
    </div>
  );
}