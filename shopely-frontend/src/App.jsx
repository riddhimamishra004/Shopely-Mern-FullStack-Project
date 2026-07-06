import { BrowserRouter, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./context/CartContext";
import { ProductProvider } from "./context/ProductContext";
import { WishlistProvider } from "./context/WishlistContext";
import { OrderProvider } from "./context/OrderContext";

import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import AppRoutes from "./routes/AppRoutes";

function Layout() {
  const location = useLocation();

  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col">
      {!isAdmin && <Navbar />}

      <main className="flex-1">
        <AppRoutes />
      </main>

      {!isAdmin && <Footer />}

      <Toaster />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <WishlistProvider>
              <OrderProvider>
                <Layout />
              </OrderProvider>
            </WishlistProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;