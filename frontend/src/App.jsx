import ResultsPage from "./pages/ResultsPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import Home from "./pages/Home";
import SoilChecker from "./pages/SoilChecker";
import EcommerceHome from "./pages/EcommerceHome";
import ProductsPage from "./pages/ProductsPage";
import ProductPage from "./pages/ProductPage";
import ProductNotFound from "./pages/ProductNotFound";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import PaymentPage from "./pages/PaymentPage";
import { Navigate } from "react-router-dom";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import ForgotPassword from "./pages/ForgotPassword";
import { CartProvider } from "./contexts/CartContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { ProductProvider } from "./contexts/ProductContext";
import { UserProvider } from "./contexts/UserContext";
import Notification from "./components/Notification";
import DashboardPage from "./pages/DashboardPage";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductManagement from "./pages/admin/ProductManagement";
import UserManagement from "./pages/admin/UserManagement";
import ProductAnalysis from "./pages/admin/ProductAnalysis";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import OrdersPage from "./pages/OrdersPage";

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <ProductProvider>
          <UserProvider>
            <CartProvider>
              <NotificationProvider>
              <BrowserRouter>
              <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/ecommerce" element={<EcommerceHome />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/product/:cropName" element={<ProductPage />} />
                  <Route path="/product-not-found" element={<ProductNotFound />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/payment" element={<PaymentPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/soil" element={<SoilChecker />} />
                  <Route path="/results" element={<ResultsPage />} />
                </Route>

                {/* Standalone user auth (full-page gradient without navbar) */}
                <Route path="/login" element={<UserLogin />} />
                <Route path="/register" element={<UserRegister />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="products" element={<ProductManagement />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="analytics" element={<ProductAnalysis />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                </Route>
              </Routes>
              <Notification />
            </BrowserRouter>
          </NotificationProvider>
        </CartProvider>
      </UserProvider>
      </ProductProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
