import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Package, ShoppingCart, Settings, Image, Save, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Product form
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category_slug: '',
    images: '',
    featured: false,
    in_stock: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, orderRes, settingsRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/categories`),
        axios.get(`${API}/orders`),
        axios.get(`${API}/settings`)
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setOrders(orderRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Product handlers
  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category_slug: product.category_slug,
        images: product.images.join('\n'),
        featured: product.featured,
        in_stock: product.in_stock
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category_slug: categories[0]?.slug || '',
        images: '',
        featured: false,
        in_stock: true
      });
    }
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    const productData = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      category_slug: productForm.category_slug,
      images: productForm.images.split('\n').filter(url => url.trim()),
      featured: productForm.featured,
      in_stock: productForm.in_stock
    };

    try {
      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, productData);
        toast.success('Producto actualizado');
      } else {
        await axios.post(`${API}/products`, productData);
        toast.success('Producto creado');
      }
      setShowProductModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar el producto');
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await axios.delete(`${API}/products/${productId}`);
      toast.success('Producto eliminado');
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    }
  };

  // Settings handlers
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/settings`, settings);
      toast.success('Configuración guardada');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error al guardar la configuración');
    }
  };

  // Order status update
  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API}/orders/${orderId}/status?status=${status}`);
      toast.success('Estado actualizado');
      fetchData();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const tabs = [
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  return (
    <div className="bg-[#050505] min-h-screen" data-testid="admin-page">
      <div className="container-luxury py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 
            className="text-3xl md:text-4xl text-white mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Panel de Administración
          </h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm uppercase tracking-widest font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'text-[#D4AF37] bg-white/5' 
                    : 'text-white/50 hover:text-white'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon size={16} strokeWidth={1.5} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-white/50">{products.length} productos</p>
                <button
                  onClick={() => openProductModal()}
                  className="btn-primary flex items-center gap-2 py-3"
                  data-testid="add-product-btn"
                >
                  <Plus size={16} strokeWidth={2} />
                  Agregar Producto
                </button>
              </div>

              {loading ? (
                <div className="grid gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 image-skeleton" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map(product => (
                    <div 
                      key={product.id}
                      className="admin-card p-4 flex items-center gap-4"
                      data-testid={`admin-product-${product.id}`}
                    >
                      <div className="w-16 h-20 bg-[#050505] flex-shrink-0 overflow-hidden">
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white truncate">{product.name}</h3>
                        <p className="text-white/50 text-sm capitalize">{product.category_slug}</p>
                        <p className="text-[#D4AF37] tabular-nums">{formatPrice(product.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {product.featured && (
                          <span className="text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-1">Destacado</span>
                        )}
                        {!product.in_stock && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1">Agotado</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => openProductModal(product)}
                          className="p-2 text-white/50 hover:text-white transition-colors"
                          data-testid={`edit-product-${product.id}`}
                        >
                          <Pencil size={16} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 text-white/50 hover:text-red-500 transition-colors"
                          data-testid={`delete-product-${product.id}`}
                        >
                          <Trash2 size={16} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <p className="text-white/50 mb-6">{orders.length} pedidos</p>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={48} strokeWidth={1} className="text-white/20 mx-auto mb-4" />
                  <p className="text-white/50">No hay pedidos aún</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div 
                      key={order.id}
                      className="admin-card p-6"
                      data-testid={`order-${order.id}`}
                    >
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                        <div>
                          <h3 className="text-white">{order.customer_name}</h3>
                          <p className="text-white/50 text-sm">{order.customer_phone}</p>
                          <p className="text-white/40 text-xs mt-1">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="bg-[#0A0A0A] border border-white/10 text-white text-sm px-3 py-2"
                            data-testid={`order-status-${order.id}`}
                          >
                            <option value="pending">Pendiente</option>
                            <option value="confirmed">Confirmado</option>
                            <option value="paid">Pagado</option>
                            <option value="shipped">Enviado</option>
                            <option value="delivered">Entregado</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-white/50 text-sm mb-2">Productos:</p>
                        <ul className="space-y-1 mb-4">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="text-white/70 text-sm">
                              {item.name} x{item.quantity} - {formatPrice(item.price * item.quantity)}
                            </li>
                          ))}
                        </ul>
                        <div className="flex justify-between items-center">
                          <p className="text-white/50 text-sm">Dirección: {order.customer_address}</p>
                          <p className="text-[#D4AF37] font-medium tabular-nums">{formatPrice(order.total)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && settings && (
            <form onSubmit={handleSettingsSubmit} className="max-w-xl">
              <div className="space-y-8">
                {/* WhatsApp */}
                <div>
                  <h2 className="caption text-[#D4AF37] mb-4">WhatsApp</h2>
                  <div className="form-group">
                    <label className="form-label">Número de WhatsApp</label>
                    <input
                      type="text"
                      value={settings.whatsapp_number}
                      onChange={(e) => setSettings({...settings, whatsapp_number: e.target.value})}
                      className="input-elegant"
                      placeholder="81171182"
                      data-testid="settings-whatsapp"
                    />
                    <p className="text-white/30 text-xs mt-2">Solo números, sin código de país</p>
                  </div>
                </div>

                {/* Bank Info */}
                <div>
                  <h2 className="caption text-[#D4AF37] mb-4">Información Bancaria</h2>
                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="form-label">Nombre del Banco</label>
                      <input
                        type="text"
                        value={settings.bank_info.bank_name}
                        onChange={(e) => setSettings({
                          ...settings, 
                          bank_info: {...settings.bank_info, bank_name: e.target.value}
                        })}
                        className="input-elegant"
                        data-testid="settings-bank-name"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Número de Cuenta</label>
                      <input
                        type="text"
                        value={settings.bank_info.account_number}
                        onChange={(e) => setSettings({
                          ...settings, 
                          bank_info: {...settings.bank_info, account_number: e.target.value}
                        })}
                        className="input-elegant"
                        data-testid="settings-account-number"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Titular de la Cuenta</label>
                      <input
                        type="text"
                        value={settings.bank_info.account_holder}
                        onChange={(e) => setSettings({
                          ...settings, 
                          bank_info: {...settings.bank_info, account_holder: e.target.value}
                        })}
                        className="input-elegant"
                        data-testid="settings-account-holder"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cédula</label>
                      <input
                        type="text"
                        value={settings.bank_info.cedula}
                        onChange={(e) => setSettings({
                          ...settings, 
                          bank_info: {...settings.bank_info, cedula: e.target.value}
                        })}
                        className="input-elegant"
                        data-testid="settings-cedula"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                  data-testid="save-settings-btn"
                >
                  <Save size={16} strokeWidth={2} />
                  Guardar Configuración
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0A0A0A] border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 
                className="text-xl text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-white/50 hover:text-white"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  className="input-elegant"
                  required
                  data-testid="product-form-name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descripción *</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  className="input-elegant min-h-[80px] resize-none"
                  required
                  data-testid="product-form-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Precio (USD) *</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    className="input-elegant"
                    min="0"
                    step="0.01"
                    required
                    data-testid="product-form-price"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Categoría *</label>
                  <select
                    value={productForm.category_slug}
                    onChange={(e) => setProductForm({...productForm, category_slug: e.target.value})}
                    className="input-elegant bg-transparent"
                    required
                    data-testid="product-form-category"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug} className="bg-[#0A0A0A]">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <Image size={14} strokeWidth={1.5} />
                  URLs de Imágenes *
                </label>
                <textarea
                  value={productForm.images}
                  onChange={(e) => setProductForm({...productForm, images: e.target.value})}
                  className="input-elegant min-h-[80px] resize-none text-sm"
                  placeholder="Una URL por línea"
                  required
                  data-testid="product-form-images"
                />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                    className="w-4 h-4 accent-[#D4AF37]"
                    data-testid="product-form-featured"
                  />
                  <span className="text-white/70 text-sm">Destacado</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.in_stock}
                    onChange={(e) => setProductForm({...productForm, in_stock: e.target.checked})}
                    className="w-4 h-4 accent-[#D4AF37]"
                    data-testid="product-form-in-stock"
                  />
                  <span className="text-white/70 text-sm">En Stock</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  data-testid="product-form-submit"
                >
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
