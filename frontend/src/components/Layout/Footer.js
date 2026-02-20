import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

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
              <span className="text-white">Lumina</span>
              <span className="text-[#D4AF37]">&</span>
              <span className="text-white">Co.</span>
            </Link>
            <p className="text-white/50 font-light leading-relaxed mb-6">
              Joyería de lujo artesanal. Cada pieza cuenta una historia única de elegancia y sofisticación.
            </p>
            <a
              href="https://wa.me/50689953348"
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
              <p>WhatsApp: +506 8995-3348</p>
              <p>Horario: Lunes a Sábado</p>
              <p>9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-sm">
            © {currentYear} Lumina & Co. Todos los derechos reservados.
          </p>
          <p className="text-white/30 text-sm">
            Joyería de Lujo
          </p>
        </div>
      </div>
    </footer>
  );
};
