import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { CartProvider } from "./context/CartContext";
import { Layout } from "./components/Layout/Layout";
import { HomePage } from "./pages/HomePage";
import { CatalogPage } from "./pages/CatalogPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { AdminPage } from "./pages/AdminPage";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right" 
          theme="dark"
          toastOptions={{
            style: {
              background: '#0A0A0A',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#FFFFFF'
            }
          }}
        />
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/catalogo" element={<Layout><CatalogPage /></Layout>} />
          <Route path="/catalogo/:category" element={<Layout><CatalogPage /></Layout>} />
          <Route path="/producto/:id" element={<Layout><ProductDetailPage /></Layout>} />
          <Route path="/carrito" element={<Layout><CartPage /></Layout>} />
          <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
          <Route path="/admin" element={<Layout><AdminPage /></Layout>} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
