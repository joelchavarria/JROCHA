import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Minus, Plus, ShoppingBag, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API}/products/${id}`);
        setProduct(res.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!product.in_stock) return;
    addItem(product, quantity);
    toast.success(`${product.name} agregado al carrito`);
  };

  const handleWhatsAppInquiry = () => {
    const message = `Hola, me interesa el producto: ${product.name} (${formatPrice(product.price)})`;
    window.open(`https://wa.me/50581171182?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="bg-[#050505] min-h-screen pt-12">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-product image-skeleton" />
            <div className="space-y-6">
              <div className="h-8 w-32 image-skeleton" />
              <div className="h-12 w-64 image-skeleton" />
              <div className="h-24 w-full image-skeleton" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[#050505] min-h-screen pt-12">
        <div className="container-luxury empty-state">
          <p className="text-white/50 text-lg mb-4">Producto no encontrado</p>
          <Link to="/catalogo" className="btn-secondary">
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen" data-testid="product-detail-page">
      {/* Breadcrumb */}
      <section className="pt-12 pb-8">
        <div className="container-luxury">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="breadcrumb-link">Inicio</Link>
            <ChevronRight size={14} className="text-white/30" />
            <Link to="/catalogo" className="breadcrumb-link">Catálogo</Link>
            <ChevronRight size={14} className="text-white/30" />
            <Link to={`/catalogo/${product.category_slug}`} className="breadcrumb-link capitalize">
              {product.category_slug}
            </Link>
            <ChevronRight size={14} className="text-white/30" />
            <span className="text-white truncate max-w-[150px]">{product.name}</span>
          </nav>
        </div>
      </section>

      {/* Product Content */}
      <section className="pb-24">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Main Image */}
              <div className="aspect-product bg-[#0A0A0A] mb-4 overflow-hidden">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  data-testid="main-product-image"
                />
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 overflow-hidden gallery-thumbnail ${selectedImage === idx ? 'active' : ''}`}
                      data-testid={`thumbnail-${idx}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:py-8"
            >
              <p className="caption text-[#D4AF37] mb-4 capitalize">{product.category_slug}</p>
              
              <h1 
                className="text-3xl md:text-4xl text-white mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
                data-testid="product-name"
              >
                {product.name}
              </h1>

              <p className="text-3xl text-white tabular-nums mb-8" data-testid="product-price">
                {formatPrice(product.price)}
              </p>

              <p className="text-white/60 font-light leading-relaxed mb-10" data-testid="product-description">
                {product.description}
              </p>

              {/* Quantity Selector */}
              <div className="mb-8">
                <p className="caption text-white/50 mb-4">Cantidad</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="qty-btn"
                    data-testid="qty-decrease"
                  >
                    <Minus size={16} strokeWidth={1.5} />
                  </button>
                  <span className="text-white text-lg w-12 text-center tabular-nums" data-testid="qty-value">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="qty-btn"
                    data-testid="qty-increase"
                  >
                    <Plus size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className={`btn-primary w-full flex items-center justify-center gap-3 ${!product.in_stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                  data-testid="add-to-cart-btn"
                >
                  <ShoppingBag size={18} strokeWidth={1.5} />
                  {product.in_stock ? 'Agregar al Carrito' : 'Agotado'}
                </button>

                <button
                  onClick={handleWhatsAppInquiry}
                  className="btn-secondary w-full flex items-center justify-center gap-3"
                  data-testid="whatsapp-inquiry-btn"
                >
                  <MessageCircle size={18} strokeWidth={1.5} />
                  Consultar por WhatsApp
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="space-y-4 text-sm text-white/50">
                  <p>• Envío coordinado vía WhatsApp</p>
                  <p>• Pago por transferencia bancaria</p>
                  <p>• Garantía de autenticidad</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};
