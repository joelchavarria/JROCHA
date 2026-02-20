import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartPage = () => {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'NIO',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#050505] min-h-screen" data-testid="cart-page">
        <div className="container-luxury py-24">
          <div className="empty-state">
            <ShoppingBag size={48} strokeWidth={1} className="text-white/20 mb-6" />
            <h1 
              className="text-3xl text-white mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Tu carrito está vacío
            </h1>
            <p className="text-white/50 mb-8">Explora nuestra colección y encuentra la joya perfecta</p>
            <Link to="/catalogo" className="btn-primary inline-flex items-center gap-2">
              Ver Catálogo
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen" data-testid="cart-page">
      <div className="container-luxury py-12 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-12">
            <h1 
              className="text-3xl md:text-4xl text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Tu Carrito
            </h1>
            <button
              onClick={clearCart}
              className="text-white/40 hover:text-red-500 text-sm uppercase tracking-widest transition-colors"
              data-testid="clear-cart-btn"
            >
              Vaciar carrito
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item, index) => (
                <motion.div
                  key={item.product_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6 pb-6 border-b border-white/10"
                  data-testid={`cart-item-${item.product_id}`}
                >
                  {/* Image */}
                  <Link to={`/producto/${item.product_id}`} className="w-24 h-32 flex-shrink-0 bg-[#0A0A0A] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link 
                        to={`/producto/${item.product_id}`}
                        className="text-white hover:text-[#D4AF37] transition-colors"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {item.name}
                      </Link>
                      <p className="text-white/60 mt-1 tabular-nums">{formatPrice(item.price)}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="qty-btn w-8 h-8"
                          data-testid={`cart-qty-decrease-${item.product_id}`}
                        >
                          <Minus size={14} strokeWidth={1.5} />
                        </button>
                        <span className="text-white w-8 text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="qty-btn w-8 h-8"
                          data-testid={`cart-qty-increase-${item.product_id}`}
                        >
                          <Plus size={14} strokeWidth={1.5} />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-white/40 hover:text-red-500 transition-colors p-2"
                        data-testid={`cart-remove-${item.product_id}`}
                      >
                        <Trash2 size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right">
                    <p className="text-white tabular-nums font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="checkout-summary p-8 sticky top-28">
                <h2 className="caption text-white/50 mb-6">Resumen del Pedido</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatPrice(getTotal())}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Envío</span>
                    <span>Por coordinar</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6 mb-8">
                  <div className="flex justify-between text-white text-lg">
                    <span>Total</span>
                    <span className="tabular-nums font-medium">{formatPrice(getTotal())}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  data-testid="proceed-checkout-btn"
                >
                  Proceder al Pago
                  <ArrowRight size={16} strokeWidth={2} />
                </Link>

                <Link
                  to="/catalogo"
                  className="btn-secondary w-full flex items-center justify-center gap-2 mt-4"
                >
                  Seguir Comprando
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
