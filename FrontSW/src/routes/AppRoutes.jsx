import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "../layouts/Layout";

import ProtectedRoute from "./ProtectedRoute";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

import ProductsPage from "../pages/ProductsPage";
import OrdersPage from "../pages/OrdersPage";
import InventoryPage from "../pages/InventoryPage";
import DeliveriesPage from "../pages/DeliveriesPage";
import UsersPage from "../pages/UsersPage";

import { useAuth } from "../context/AuthContext";

function DefaultRedirect() {
  const { auth } = useAuth();
  const role = auth?.user?.role;
  if (role === "DELIVERY") return <Navigate to="/deliveries" />;
  return <Navigate to="/products" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/products"
          element={<ProductsPage />}
        />

        <Route
          path="/orders"
          element={<OrdersPage />}
        />

        <Route
          path="/inventory"
          element={<InventoryPage />}
        />

        <Route
          path="/deliveries"
          element={<DeliveriesPage />}
        />

        <Route
          path="/users"
          element={<UsersPage />}
        />
      </Route>

      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="*" element={<DefaultRedirect />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;