import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const CategoryCard = ({ category, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link 
        to={`/catalogo/${category.slug}`}
        className="category-card group block relative aspect-[4/5] overflow-hidden"
        data-testid={`category-card-${category.slug}`}
      >
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <h3 
            className="text-2xl md:text-3xl text-white mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {category.name}
          </h3>
          <div className="flex items-center gap-2 text-white/70 group-hover:text-[#D4AF37] transition-colors">
            <span className="text-xs uppercase tracking-widest font-medium">Ver colección</span>
            <ArrowRight size={14} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
