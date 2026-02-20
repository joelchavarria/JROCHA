import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';
import { CategoryCard } from '../components/CategoryCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Seed data first
        await axios.post(`${API}/seed`);
        
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${API}/categories`),
          axios.get(`${API}/products?featured=true`)
        ]);
        setCategories(catRes.data);
        setFeaturedProducts(prodRes.data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-[#050505]" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1762195022005-2750cf3809f2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZGlhbW9uZCUyMG5lY2tsYWNlJTIwbW9kZWwlMjBmYXNoaW9ufGVufDB8fHx8MTc3MTYwNzIyNnww&ixlib=rb-4.1.0&q=85"
            alt="Luxury jewelry"
            className="w-full h-full object-cover"
          />
          <div className="hero-overlay absolute inset-0" />
        </div>

        {/* Content */}
        <div className="relative z-10 container-luxury text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <p className="caption text-[#D4AF37] mb-6 flex items-center justify-center gap-2">
              <Sparkles size={14} strokeWidth={1.5} />
              Joyería de Lujo
              <Sparkles size={14} strokeWidth={1.5} />
            </p>
            <h1 
              className="text-5xl md:text-7xl text-white mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Elegancia que<br />
              <span className="text-gold-gradient">Perdura</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl font-light mb-10 max-w-xl mx-auto">
              Descubre nuestra colección exclusiva de joyas artesanales, 
              diseñadas para momentos que trascienden el tiempo.
            </p>
            <Link 
              to="/catalogo" 
              className="btn-primary inline-flex items-center gap-3"
              data-testid="hero-cta"
            >
              Explorar Colección
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="py-24 md:py-32" data-testid="categories-section">
        <div className="container-luxury">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-4">
            <div>
              <p className="caption text-[#D4AF37] mb-4">Colecciones</p>
              <h2 
                className="text-4xl md:text-5xl text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Nuestras Categorías
              </h2>
            </div>
            <Link 
              to="/catalogo" 
              className="btn-secondary inline-flex items-center gap-2"
              data-testid="view-all-categories"
            >
              Ver Todo
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-[4/5] image-skeleton" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {categories.map((category, index) => (
                <CategoryCard key={category.id} category={category} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 md:py-32 border-t border-white/5" data-testid="featured-section">
        <div className="container-luxury">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-4">
            <div>
              <p className="caption text-[#D4AF37] mb-4">Selección Exclusiva</p>
              <h2 
                className="text-4xl md:text-5xl text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Piezas Destacadas
              </h2>
            </div>
            <Link 
              to="/catalogo" 
              className="btn-secondary inline-flex items-center gap-2"
              data-testid="view-all-products"
            >
              Ver Catálogo
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-product image-skeleton" />
                  <div className="h-4 w-20 image-skeleton" />
                  <div className="h-6 w-32 image-skeleton" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 border-t border-white/5">
        <div className="container-luxury">
          <div className="max-w-2xl mx-auto text-center">
            <p className="caption text-[#D4AF37] mb-6">Contáctanos</p>
            <h2 
              className="text-3xl md:text-4xl text-white mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              ¿Buscas algo especial?
            </h2>
            <p className="text-white/60 font-light mb-10">
              Escríbenos por WhatsApp y te ayudaremos a encontrar la joya perfecta para ti o para ese momento especial.
            </p>
            <a
              href="https://wa.me/50689953348?text=Hola,%20me%20interesa%20conocer%20más%20sobre%20sus%20joyas"
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-btn inline-flex items-center gap-3 px-8 py-4 uppercase tracking-widest text-sm font-bold"
              data-testid="cta-whatsapp"
            >
              Escríbenos
              <ArrowRight size={16} strokeWidth={2} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
