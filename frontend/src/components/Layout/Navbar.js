import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogOut, History } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getItemCount } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const itemCount = getItemCount();

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/catalogo' },
    { name: 'Anillos', path: '/catalogo/anillos' },
    { name: 'Collares', path: '/catalogo/collares' },
    { name: 'Pulseras', path: '/catalogo/pulseras' },
    { name: 'Aretes', path: '/catalogo/aretes' },
    { name: 'Relojes', path: '/catalogo/relojes' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <nav 
        className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5"
        data-testid="navbar"
      >
        <div className="container-luxury">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link 
              to="/" 
              className="text-2xl font-normal tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
              data-testid="logo-link"
            >
              <span className="text-white">Joyería</span>
              <span className="text-[#D4AF37]"> Rocha</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${isActive(link.path) ? 'nav-active text-[#D4AF37]' : ''}`}
                  data-testid={`nav-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* User menu */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-4">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="nav-link text-[#D4AF37]"
                      data-testid="nav-admin"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/mis-pedidos"
                    className="nav-link flex items-center gap-1"
                    data-testid="nav-orders"
                  >
                    <History size={14} strokeWidth={1.5} />
                    Pedidos
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="nav-link flex items-center gap-1 text-white/50 hover:text-white"
                    data-testid="logout-btn"
                  >
                    <LogOut size={14} strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex nav-link items-center gap-1"
                  data-testid="nav-login"
                >
                  <User size={14} strokeWidth={1.5} />
                  Ingresar
                </Link>
              )}

              {/* Cart */}
              <Link 
                to="/carrito" 
                className="relative p-2 text-white/70 hover:text-white transition-colors"
                data-testid="cart-link"
              >
                <ShoppingBag size={22} strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="cart-badge" data-testid="cart-count">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 text-white/70 hover:text-white"
                onClick={() => setMobileMenuOpen(true)}
                data-testid="mobile-menu-btn"
              >
                <Menu size={24} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] mobile-menu lg:hidden"
            data-testid="mobile-menu"
          >
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-between items-center mb-12">
                <Link 
                  to="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-normal tracking-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  <span className="text-white">Joyería</span>
                  <span className="text-[#D4AF37]"> Rocha</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-white/70 hover:text-white"
                  data-testid="close-mobile-menu"
                >
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-2xl font-light ${isActive(link.path) ? 'text-[#D4AF37]' : 'text-white/70 hover:text-white'}`}
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {link.name}
                  </Link>
                ))}
                
                <div className="border-t border-white/10 pt-6 mt-4">
                  {isAuthenticated ? (
                    <>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-xl font-light text-[#D4AF37] block mb-4"
                        >
                          Panel Admin
                        </Link>
                      )}
                      <Link
                        to="/mis-pedidos"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-xl font-light text-white/70 hover:text-white block mb-4"
                      >
                        Mis Pedidos
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="text-xl font-light text-white/50 hover:text-white"
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xl font-light text-white/70 hover:text-white"
                    >
                      Iniciar Sesión
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
