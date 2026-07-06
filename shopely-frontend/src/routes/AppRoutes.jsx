import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "../components/Layout/AdminLayout";
import ProtectedRoute from "../routes/ProtectedRoute";
import AdminRoute from "../routes/AdminRoutes";
import ScrollToTop from "../components/ScrollToTop";

// Customer pages
import Home from "../pages/customer/Home";
import Shop from "../pages/customer/Shop";
import ProductDetails from "../pages/customer/ProductDetails";
import Checkout from "../pages/customer/Checkout";
import Cart from "../pages/customer/Cart";
import Login from "../pages/customer/Login";
import Register from "../pages/customer/Register";
import Profile from "../pages/customer/Profile";
import OffersPage from "../pages/offers/Offerspage";
import NewArrivals from "../pages/customer/NewArrivals";
import Deals from "../pages/customer/Deals";
import Wishlist from "../pages/customer/Wishlist";
import OrderSummary from "../components/ecommerce/OrderSummary";
import MyOrders from "../pages/customer/MyOders";

// Admin pages
import AdminLogin from "../pages/admin/Adminlogin";
import Dashboard from "../pages/admin/Dashboard";
import Products from "../pages/admin/Products";
import AddProduct from "../pages/admin/AddProduct";
import EditProduct from "../pages/admin/EditProduct";
import Categories from "../pages/admin/Categories";
import Orders from "../pages/admin/Orders";
import Customers from "../pages/admin/Customers";
import Reviews from "../pages/admin/Reviews";
import Coupons from "../pages/admin/Coupons";
import Users from "../pages/admin/Users";
import Reports from "../pages/admin/Reports";
import Settings from "../pages/admin/Settings";

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public customer routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/orders" element={<MyOrders />} />

        <Route path="/new-arrivals" element={<NewArrivals />} />
        <Route path="/deals" element={<Deals />} />

        {/* Protected customer routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile/orders" element={<MyOrders />} />
        </Route>

        {/* Admin login — public */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin routes — protected */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* /admin → /admin/dashboard redirect */}
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/edit/:id" element={<EditProduct />} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="users" element={<Users />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
              <h1 className="text-4xl font-bold text-stone-900">404</h1>
              <p className="mt-2 text-stone-500">Page not found.</p>
            </div>
          }
        />
      </Routes>
    </>
  );
}
