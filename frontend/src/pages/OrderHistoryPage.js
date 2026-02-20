import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const OrderHistoryPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await axios.get(`${API}/orders/my-history`, {
          withCredentials: true
        });
        setOrders(res.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-NI', {
      style: 'currency',
      currency: 'NIO',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-NI', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-[#D4AF37]" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      paid: 'Pagado',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-[#050505] min-h-screen" data-testid="order-history-page">
        <div className="container-luxury py-24">
          <div className="empty-state">
            <Package size={48} strokeWidth={1} className="text-white/20 mb-6" />
            <h1 
              className="text-3xl text-white mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Inicia sesión
            </h1>
            <p className="text-white/50 mb-8">Debes iniciar sesión para ver tu historial de pedidos</p>
            <Link to="/login" className="btn-primary">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen" data-testid="order-history-page">
      <div className="container-luxury py-12 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-12">
            <h1 
              className="text-3xl md:text-4xl text-white mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Mis Pedidos
            </h1>
            <p className="text-white/50">Hola, {user?.name}</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 image-skeleton" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <Package size={48} strokeWidth={1} className="text-white/20 mb-6" />
              <h2 className="text-xl text-white mb-4">No tienes pedidos aún</h2>
              <p className="text-white/50 mb-8">Explora nuestra colección y realiza tu primer pedido</p>
              <Link to="/catalogo" className="btn-primary">
                Ver Catálogo
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#0A0A0A] border border-white/10 p-6"
                  data-testid={`order-${order.id}`}
                >
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-widest mb-1">
                        Pedido #{order.id.slice(-8)}
                      </p>
                      <p className="text-white/60 text-sm">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1">
                      {getStatusIcon(order.status)}
                      <span className="text-white text-sm">{getStatusLabel(order.status)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-12 h-14 bg-[#050505] overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-white text-sm">{item.name}</p>
                          <p className="text-white/50 text-xs">x{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <p className="text-white/50 text-sm">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} artículos
                    </p>
                    <p className="text-[#D4AF37] font-medium tabular-nums">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
