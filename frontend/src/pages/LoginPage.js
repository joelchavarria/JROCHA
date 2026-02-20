import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, loginAdmin, isAuthenticated, isAdmin } = useAuth();
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await loginAdmin(email, password);
    
    if (result.success) {
      toast.success('Bienvenido, Admin');
      navigate('/admin', { replace: true });
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6" data-testid="login-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="block text-center mb-12">
          <h1 
            className="text-3xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <span className="text-white">Joyería</span>
            <span className="text-[#D4AF37]"> Rocha</span>
          </h1>
          <p className="text-white/40 text-sm mt-2">Granada, Nicaragua</p>
        </Link>

        <div className="bg-[#0A0A0A] border border-white/10 p-8">
          <h2 
            className="text-2xl text-white text-center mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {isAdminLogin ? 'Acceso Admin' : 'Iniciar Sesión'}
          </h2>
          <p className="text-white/50 text-center text-sm mb-8">
            {isAdminLogin 
              ? 'Ingresa tus credenciales de administrador' 
              : 'Accede a tu cuenta para ver tu historial de pedidos'}
          </p>

          {isAdminLogin ? (
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label className="form-label flex items-center gap-2">
                  <Mail size={14} strokeWidth={1.5} />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-elegant"
                  placeholder="admin@email.com"
                  required
                  data-testid="admin-email"
                />
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <Lock size={14} strokeWidth={1.5} />
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-elegant"
                  placeholder="••••••••"
                  required
                  data-testid="admin-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                data-testid="admin-login-btn"
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 px-6 hover:bg-gray-100 transition-colors"
                data-testid="google-login-btn"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="uppercase tracking-widest text-sm font-bold">
                  Continuar con Google
                </span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#0A0A0A] text-white/40">o</span>
                </div>
              </div>
            </div>
          )}

          {/* Toggle */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setIsAdminLogin(!isAdminLogin)}
              className="text-[#D4AF37] hover:text-white text-sm transition-colors"
              data-testid="toggle-login-mode"
            >
              {isAdminLogin ? 'Volver al login normal' : '¿Eres administrador?'}
            </button>
          </div>
        </div>

        {/* Back to store */}
        <div className="text-center mt-8">
          <Link 
            to="/" 
            className="text-white/40 hover:text-white text-sm transition-colors"
          >
            ← Volver a la tienda
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
