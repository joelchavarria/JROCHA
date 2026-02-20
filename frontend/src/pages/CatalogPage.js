import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CatalogPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(category || '');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API}/categories`);
        setCategories(res.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setSelectedCategory(category || '');
  }, [category]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = selectedCategory 
          ? `${API}/products?category=${selectedCategory}`
          : `${API}/products`;
        const res = await axios.get(url);
        setProducts(res.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  const currentCategory = categories.find(c => c.slug === selectedCategory);

  return (
    <div className="bg-[#050505] min-h-screen" data-testid="catalog-page">
      {/* Header */}
      <section className="pt-12 pb-8 border-b border-white/5">
        <div className="container-luxury">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8">
            <Link to="/" className="breadcrumb-link">Inicio</Link>
            <ChevronRight size={14} className="text-white/30" />
            <Link to="/catalogo" className={`breadcrumb-link ${!selectedCategory ? 'text-white' : ''}`}>
              Catálogo
            </Link>
            {selectedCategory && (
              <>
                <ChevronRight size={14} className="text-white/30" />
                <span className="text-white capitalize">{selectedCategory}</span>
              </>
            )}
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 
              className="text-4xl md:text-5xl text-white mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {currentCategory ? currentCategory.name : 'Todas las Joyas'}
            </h1>
            {currentCategory && (
              <p className="text-white/60 font-light max-w-xl">
                {currentCategory.description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <div className="container-luxury py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar - Categories Filter */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-28">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal size={16} strokeWidth={1.5} className="text-[#D4AF37]" />
                <span className="caption">Categorías</span>
              </div>
              
              <nav className="space-y-1">
                <Link
                  to="/catalogo"
                  className={`block py-3 px-4 transition-all ${
                    !selectedCategory 
                      ? 'text-[#D4AF37] bg-white/5' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  data-testid="filter-all"
                >
                  Todas las Joyas
                </Link>
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/catalogo/${cat.slug}`}
                    className={`block py-3 px-4 transition-all ${
                      selectedCategory === cat.slug 
                        ? 'text-[#D4AF37] bg-white/5' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                    data-testid={`filter-${cat.slug}`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <p className="text-white/50 text-sm">
                {products.length} producto{products.length !== 1 ? 's' : ''}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-product image-skeleton" />
                    <div className="h-4 w-20 image-skeleton" />
                    <div className="h-6 w-32 image-skeleton" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <p className="text-white/50 text-lg mb-4">No hay productos en esta categoría</p>
                <Link to="/catalogo" className="btn-secondary">
                  Ver todas las joyas
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
