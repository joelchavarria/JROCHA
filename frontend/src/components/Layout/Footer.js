import { Link } from 'react-router-dom';
import { MessageCircle, MapPin } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] border-t border-white/5 py-16 md:py-24" data-testid="footer">
      <div className="container-luxury">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div>
            <Link 
              to="/" 
              className="text-3xl font-normal tracking-tight mb-6 inline-block"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span className="text-white">Joyería</span>
              <span className="text-[#D4AF37]"> Rocha</span>
            </Link>
            <p className="text-white/50 font-light leading-relaxed mb-4 flex items-center gap-2">
              <MapPin size={16} strokeWidth={1.5} className="text-[#D4AF37]" />
              Granada, Nicaragua
            </p>
            <p className="text-white/50 font-light leading-relaxed mb-6">
              Joyería de lujo artesanal. Cada pieza cuenta una historia única de elegancia y sofisticación.
            </p>
            <a
              href="https://wa.me/50589953348"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#25D366] hover:text-[#128C7E] transition-colors"
              data-testid="footer-whatsapp"
            >
              <MessageCircle size={18} strokeWidth={1.5} />
              <span className="text-sm uppercase tracking-widest font-medium">WhatsApp</span>
            </a>
          </div>

          {/* Categories */}
          <div>
            <h4 className="caption text-white/50 mb-6">Categorías</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/catalogo/anillos" className="text-white/70 hover:text-white transition-colors font-light">Anillos</Link>
              <Link to="/catalogo/collares" className="text-white/70 hover:text-white transition-colors font-light">Collares</Link>
              <Link to="/catalogo/pulseras" className="text-white/70 hover:text-white transition-colors font-light">Pulseras</Link>
              <Link to="/catalogo/aretes" className="text-white/70 hover:text-white transition-colors font-light">Aretes</Link>
              <Link to="/catalogo/relojes" className="text-white/70 hover:text-white transition-colors font-light">Relojes</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="caption text-white/50 mb-6">Contacto</h4>
            <div className="space-y-3 text-white/70 font-light">
              <p>WhatsApp: +505 8995-3348</p>
              <p>Granada, Nicaragua</p>
              <p>Horario: Lunes a Sábado</p>
              <p>9:00 AM - 6:00 PM</p>
            </div>
            <a
              href="https://www.instagram.com/joyeria_rocha_/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/50 hover:text-[#D4AF37] transition-colors mt-4"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              @joyeria_rocha_
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-sm">
            © {currentYear} Joyería Rocha. Todos los derechos reservados.
          </p>
          <p className="text-white/30 text-sm">
            Granada, Nicaragua
          </p>
        </div>
      </div>
    </footer>
  );
};
