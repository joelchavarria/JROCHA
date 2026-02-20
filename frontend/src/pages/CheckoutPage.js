import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, CreditCard, ChevronRight, CheckCircle, Copy } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCart();
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API}/settings`);
        setSettings(res.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/carrito');
    }
  }, [items, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'NIO',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createOrderMessage = () => {
    let message = `¡Hola! Me gustaría realizar el siguiente pedido:\n\n`;
    message += `*Cliente:* ${formData.name}\n`;
    message += `*Teléfono:* ${formData.phone}\n`;
    if (formData.email) message += `*Email:* ${formData.email}\n`;
    message += `*Dirección:* ${formData.address}\n\n`;
    message += `*Productos:*\n`;
    
    items.forEach(item => {
      message += `• ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}\n`;
    });
    
    message += `\n*Total:* ${formatPrice(getTotal())}\n`;
    
    if (formData.notes) {
      message += `\n*Notas:* ${formData.notes}`;
    }
    
    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save order to database
      await axios.post(`${API}/orders`, {
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email,
        customer_address: formData.address,
        items: items,
        total: getTotal(),
        notes: formData.notes
      });

      // Open WhatsApp
      const whatsappNumber = settings?.whatsapp_number || '0050581171182';
      // Remove leading zeros and country code formatting
      const cleanNumber = whatsappNumber.replace(/^00/, '').replace(/^505/, '505');
      const message = createOrderMessage();
      window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
      
      toast.success('¡Pedido enviado! Te contactaremos pronto.');
      clearCart();
      navigate('/');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Error al procesar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#050505] min-h-screen" data-testid="checkout-page">
      {/* Breadcrumb */}
      <section className="pt-12 pb-8">
        <div className="container-luxury">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="breadcrumb-link">Inicio</Link>
            <ChevronRight size={14} className="text-white/30" />
            <Link to="/carrito" className="breadcrumb-link">Carrito</Link>
            <ChevronRight size={14} className="text-white/30" />
            <span className="text-white">Checkout</span>
          </nav>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 
              className="text-3xl md:text-4xl text-white mb-12"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Finalizar Pedido
            </h1>

            <div className="grid lg:grid-cols-3 gap-12">
              {/* Form */}
              <div className="lg:col-span-2 space-y-12">
                {/* Customer Info */}
                <div>
                  <h2 className="caption text-[#D4AF37] mb-8">Información de Contacto</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="form-label">Nombre completo *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input-elegant"
                        placeholder="Tu nombre"
                        required
                        data-testid="checkout-name"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Teléfono *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input-elegant"
                        placeholder="8888-8888"
                        required
                        data-testid="checkout-phone"
                      />
                    </div>
                    <div className="form-group md:col-span-2">
                      <label className="form-label">Email (opcional)</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="input-elegant"
                        placeholder="tu@email.com"
                        data-testid="checkout-email"
                      />
                    </div>
                    <div className="form-group md:col-span-2">
                      <label className="form-label">Dirección de entrega *</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="input-elegant min-h-[100px] resize-none"
                        placeholder="Dirección completa para la entrega"
                        required
                        data-testid="checkout-address"
                      />
                    </div>
                    <div className="form-group md:col-span-2">
                      <label className="form-label">Notas adicionales</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        className="input-elegant min-h-[80px] resize-none"
                        placeholder="Instrucciones especiales, dedicatorias, etc."
                        data-testid="checkout-notes"
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Info */}
                <div>
                  <h2 className="caption text-[#D4AF37] mb-8 flex items-center gap-2">
                    <CreditCard size={16} strokeWidth={1.5} />
                    Información para Transferencia
                  </h2>
                  
                  <div className="bg-[#0A0A0A] border border-white/10 p-6 md:p-8">
                    {settings ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                          <span className="text-white/50">Banco</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white">{settings.bank_info.bank_name}</span>
                            <button 
                              onClick={() => copyToClipboard(settings.bank_info.bank_name)}
                              className="text-white/30 hover:text-[#D4AF37]"
                            >
                              <Copy size={14} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                          <span className="text-white/50">Número de cuenta</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white tabular-nums">{settings.bank_info.account_number}</span>
                            <button 
                              onClick={() => copyToClipboard(settings.bank_info.account_number)}
                              className="text-white/30 hover:text-[#D4AF37]"
                            >
                              <Copy size={14} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                          <span className="text-white/50">Titular</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white">{settings.bank_info.account_holder}</span>
                            <button 
                              onClick={() => copyToClipboard(settings.bank_info.account_holder)}
                              className="text-white/30 hover:text-[#D4AF37]"
                            >
                              <Copy size={14} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <span className="text-white/50">Cédula</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white">{settings.bank_info.cedula}</span>
                            <button 
                              onClick={() => copyToClipboard(settings.bank_info.cedula)}
                              className="text-white/30 hover:text-[#D4AF37]"
                            >
                              <Copy size={14} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-white/50">Cargando información...</p>
                    )}
                    
                    <p className="text-white/40 text-sm mt-6">
                      Realiza la transferencia y envía el comprobante por WhatsApp junto con tu pedido.
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="checkout-summary p-8 sticky top-28">
                  <h2 className="caption text-white/50 mb-6">Tu Pedido</h2>

                  {/* Items */}
                  <div className="space-y-4 mb-8 max-h-64 overflow-y-auto">
                    {items.map(item => (
                      <div key={item.product_id} className="flex gap-4">
                        <div className="w-16 h-20 bg-[#050505] flex-shrink-0 overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm">{item.name}</p>
                          <p className="text-white/50 text-xs">Cantidad: {item.quantity}</p>
                          <p className="text-white/70 text-sm tabular-nums mt-1">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-6 mb-8">
                    <div className="flex justify-between text-white text-lg">
                      <span>Total</span>
                      <span className="tabular-nums font-medium">{formatPrice(getTotal())}</span>
                    </div>
                  </div>

                  {/* WhatsApp Button */}
                  <button
                    onClick={handleWhatsAppOrder}
                    disabled={isSubmitting}
                    className="whatsapp-btn w-full flex items-center justify-center gap-3 px-6 py-4 uppercase tracking-widest text-sm font-bold disabled:opacity-50"
                    data-testid="whatsapp-order-btn"
                  >
                    <MessageCircle size={18} strokeWidth={1.5} />
                    {isSubmitting ? 'Enviando...' : 'Ordenar por WhatsApp'}
                  </button>

                  <div className="mt-6 text-center">
                    <p className="text-white/40 text-xs flex items-center justify-center gap-1">
                      <CheckCircle size={12} strokeWidth={1.5} />
                      Tu pedido será confirmado por WhatsApp
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
