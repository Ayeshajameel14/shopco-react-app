
import { Routes, Route, Outlet } from "react-router-dom";

import { CartProvider } from "./context/CartContext";
import { ProductsProvider } from "./context/ProductsContext";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import Home from "./pages/Home/Home";
import Shop from "./pages/Shop/Shop";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import Cart from "./pages/Cart/Cart";

import Signup from "./pages/Signup/Signup";
import Login from "./pages/Login/Login";
import Checkout from "./pages/Checkout/Checkout";
import MyOrders from "./pages/MyOrders/MyOrders";

import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AdminLayout from "./components/AdminLayout/AdminLayout";

import Orders from "./pages/AdminDashboard/Orders/Orders";
import Products from "./pages/AdminDashboard/Products/Products";
import Customers from "./pages/AdminDashboard/Customers/Customers";
import Settings from "./pages/AdminDashboard/Settings/Settings";
import Analytics from "./pages/AdminDashboard/Analytics/Analytics";
// Customer website layout
function CustomerLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ProductsProvider>
          <Routes>
            {/* Customer website routes */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />

              <Route
                path="/product/:id"
                element={<ProductDetails />}
              />

              <Route path="/cart" element={<Cart />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/my-orders" element={<MyOrders />} />
            </Route>

            {/* Admin dashboard routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="products" element={<Products />} />
              <Route path="customers" element={<Customers />} />
              <Route path="settings" element={<Settings />} />
              <Route path="/admin/analytics" element={<Analytics />} />
            </Route>

            {/* Unknown routes */}
            <Route
              path="*"
              element={
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <h2>404 - Page Not Found</h2>
                  <a href="/">Go to Home</a>
                </div>
              }
            />
          </Routes>
        </ProductsProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
