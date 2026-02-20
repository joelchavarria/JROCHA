import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const ProductCard = ({ product, index = 0 }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="product-card group"
      data-testid={`product-card-${product.id}`}
    >
      <Link to={`/producto/${product.id}`}>
        {/* Image container */}
        <div className="relative overflow-hidden aspect-product bg-[#0A0A0A] mb-4">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover product-card-image"
            loading="lazy"
          />
          {product.featured && (
            <span className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37] bg-black/80 px-3 py-1">
              Destacado
            </span>
          )}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white/80 uppercase tracking-widest text-sm">Agotado</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2">
          <p className="caption text-white/40">{product.category_slug}</p>
          <h3 
            className="text-lg font-normal text-white group-hover:text-[#D4AF37] transition-colors"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {product.name}
          </h3>
          <p className="text-white/70 tabular-nums text-lg font-light">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};
