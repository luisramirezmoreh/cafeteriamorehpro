import { useState, useEffect } from 'react';
import { Product } from '../types/inventory';

interface ScreensaverProps {
  products: Product[];
  onDismiss: () => void;
  videoUrl?: string | null;
}

interface ProductImage {
  productId: string;
  imageUrl: string;
}

const PRODUCT_IMAGES: ProductImage[] = [
  { productId: 'maruchan-camaron', imageUrl: 'https://images.unsplash.com/photo-1761125065373-05a8e2f85cd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { productId: 'maruchan-camaron-pikin', imageUrl: 'https://images.unsplash.com/photo-1637024698421-533d83c7b883?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { productId: 'maruchan-camaron-habanero', imageUrl: 'https://images.unsplash.com/photo-1637024698421-533d83c7b883?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { productId: 'maruchan-pollo', imageUrl: 'https://images.unsplash.com/photo-1761125065373-05a8e2f85cd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  
  { productId: 'papitas-chetos-naranjas', imageUrl: 'https://images.unsplash.com/photo-1699666397768-0126340e880a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { productId: 'papitas-chetos-flaming', imageUrl: 'https://images.unsplash.com/photo-1699666397768-0126340e880a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { productId: 'papitas-ruffles', imageUrl: 'https://images.unsplash.com/photo-1694101493190-acc6c4418ad7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { productId: 'papitas-sabritas', imageUrl: 'https://images.unsplash.com/photo-1694101493190-acc6c4418ad7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { productId: 'papitas-rancheritos', imageUrl: 'https://images.unsplash.com/photo-1694101493190-acc6c4418ad7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { productId: 'papitas-doritos', imageUrl: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { productId: 'papitas-tostitos', imageUrl: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { productId: 'papitas-fritos', imageUrl: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  
  { productId: 'capuchino-normal', imageUrl: 'https://images.unsplash.com/photo-1638202448050-bddae16dd9be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { productId: 'capuchino-moka', imageUrl: 'https://images.unsplash.com/photo-1689697971955-9368177cd795?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { productId: 'capuchino-vainilla', imageUrl: 'https://images.unsplash.com/photo-1683122925249-8b15d807db4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { productId: 'capuchino-irlandesa', imageUrl: 'https://images.unsplash.com/photo-1638202448050-bddae16dd9be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { productId: 'capuchino-chocolate', imageUrl: 'https://images.unsplash.com/photo-1660190345473-43d3bc721c14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  
  { productId: 'galleta-principes', imageUrl: 'https://images.unsplash.com/photo-1685166836342-bfab63e8a095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { productId: 'galleta-trikitrakes', imageUrl: 'https://images.unsplash.com/photo-1740993382264-e758f0ddb4b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { productId: 'galleta-plativolos', imageUrl: 'https://images.unsplash.com/photo-1685166836342-bfab63e8a095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { productId: 'chocolate-canasta', imageUrl: 'https://images.unsplash.com/photo-1702743692629-b11e94c63b0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { productId: 'pinguinos', imageUrl: 'https://images.unsplash.com/photo-1672081880854-ea09c1e9ac44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
  { productId: 'gansitos', imageUrl: 'https://images.unsplash.com/photo-1672081880854-ea09c1e9ac44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080' },
];

export function Screensaver({ products, onDismiss, videoUrl }: ScreensaverProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  // Si hay video personalizado, mostrar el video
  if (videoUrl) {
    return (
      <div 
        className="fixed inset-0 z-[100] bg-black cursor-pointer overflow-hidden"
        onClick={onDismiss}
        onTouchStart={onDismiss}
      >
        {/* Video de fondo */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>

        {/* Mensaje "Presiona para iniciar" */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white bg-opacity-90 backdrop-blur-sm px-8 py-3 rounded-full shadow-2xl animate-pulse">
            <p className="text-gray-800 text-lg md:text-xl font-semibold">
              Presiona para iniciar
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Filtrar solo productos que se venden (precio > 0 y que no sean complementos)
  const displayProducts = products.filter(p => 
    p.price > 0 && 
    p.id !== 'tenedores' && 
    p.id !== 'galletas-saladitas'
  );

  useEffect(() => {
    const slideInterval = setInterval(() => {
      // Iniciar fade out
      setFadeState('out');
      
      // Después de 1 segundo, cambiar imagen y hacer fade in
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % displayProducts.length);
        setFadeState('in');
      }, 1000);
    }, 10000); // Cambiar cada 10 segundos

    return () => clearInterval(slideInterval);
  }, [displayProducts.length]);

  if (displayProducts.length === 0) return null;

  const currentProduct = displayProducts[currentIndex];
  
  // Priorizar imagen personalizada del producto, luego las predefinidas
  const imageData = PRODUCT_IMAGES.find(img => img.productId === currentProduct.id);
  const imageUrl = currentProduct.imageUrl || imageData?.imageUrl || 'https://images.unsplash.com/photo-1556910638-7d51318e5f8c?w=1200&q=80';

  return (
    <div 
      className="fixed inset-0 z-[100] bg-[#1a3a3a] cursor-pointer overflow-hidden"
      onClick={onDismiss}
      onTouchStart={onDismiss}
    >
      {/* Contenedor principal con transición */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${
          fadeState === 'in' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Sección superior - dividida en dos */}
        <div className="absolute top-0 left-0 right-0 h-[60%] flex">
          {/* Lado izquierdo - Beige con texto */}
          <div className="w-[45%] bg-[#f5f1e8] flex items-center justify-center relative overflow-hidden">
            <div className="text-center px-8 z-10">
              <p className="text-2xl md:text-3xl tracking-[0.3em] mb-4 text-[#2d5555] font-serif opacity-80">
                A LA VENTA
              </p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#1a3a3a] leading-tight uppercase">
                {currentProduct.name}
              </h1>
            </div>
          </div>

          {/* Lado derecho - Verde oscuro con precio */}
          <div className="w-[55%] bg-[#1a3a3a] flex items-center justify-start relative overflow-hidden">
            {/* Efecto de humo de fondo */}
            <div 
              className="absolute inset-0 opacity-10 bg-cover bg-center animate-slow-drift"
              style={{ 
                backgroundImage: `url(https://images.unsplash.com/photo-1601205037140-f4af313efb6a?w=1200&q=80)`,
                filter: 'brightness(1.5)'
              }}
            />
            
            <div className="relative z-10 pl-8 md:pl-16">
              <p className="text-8xl md:text-9xl lg:text-[12rem] font-serif text-white tracking-tight">
                {currentProduct.price}
                <span className="text-7xl md:text-8xl lg:text-[10rem]">$</span>
              </p>
            </div>

            {/* Imagen del producto con animación flotante */}
            <div 
              className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[120%] h-[120%] flex items-center justify-center animate-float"
            >
              <img 
                src={imageUrl}
                alt={currentProduct.name}
                className="max-w-[70%] max-h-[90%] object-contain drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556910638-7d51318e5f8c?w=600&q=80';
                }}
              />
            </div>
          </div>
        </div>

        {/* Sección inferior - Madera */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[40%] bg-cover bg-center flex items-center justify-start px-12 md:px-24"
          style={{ 
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.1)), url(https://images.unsplash.com/photo-1626890757788-af964c61b239?w=1200&q=80)`
          }}
        >
          <div className="text-white">
            <p className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-wide drop-shadow-2xl">
              ORDENA EN CAFETERÍA
            </p>
          </div>
        </div>
      </div>

      {/* Mensaje "Presiona para iniciar" - siempre visible */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm px-8 py-3 rounded-full shadow-2xl animate-pulse">
          <p className="text-gray-800 text-lg md:text-xl font-semibold">
            Presiona para iniciar
          </p>
        </div>
      </div>

      {/* Indicador de progreso */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white bg-opacity-20 z-50">
        <div 
          className="h-full bg-white transition-all"
          style={{ 
            width: fadeState === 'in' ? '100%' : '0%',
            transition: fadeState === 'in' ? 'width 10s linear' : 'width 0.5s linear'
          }}
        />
      </div>
    </div>
  );
}