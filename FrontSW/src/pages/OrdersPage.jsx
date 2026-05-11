import { useEffect, useState } from "react";
import { createDelivery } from "../services/deliveryService";

import {
  ShoppingCart,
  Check,
  Truck,
  PackageCheck,
  Trash2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  getOrders,
  updateOrderStatus,
  cancelOrder,
} from "../services/orderService";

function OrdersPage() {
  const { auth } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdminOrManager =
    auth?.user?.role === "ADMIN" || auth?.user?.role === "MANAGER";

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders(auth.token, isAdminOrManager);
      const data = response.data;
      setOrders(data.content || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (order) => {
    try {
      await updateOrderStatus(order.id, "SHIPPED", auth.token);

      await createDelivery(
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerId: order.customerId,
          customerEmail: order.customerEmail,
          deliveryAddress: order.shippingAddress || "N/A",
        },
        auth.token
      );

      loadOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Cancel and delete this order?")) return;
    try {
      await cancelOrder(orderId, auth.token);
      loadOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "PENDING":   return "bg-yellow-100 text-yellow-700";
      case "SHIPPED":   return "bg-blue-100 text-blue-700";
      case "ARRIVED":   return "bg-green-100 text-green-700";
      case "CANCELLED": return "bg-red-100 text-red-700";
      default:          return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.25),transparent_40%)]" />
        <div className="flex flex-col items-center gap-5 z-10">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-white/10" />
            <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">Loading Orders</h2>
            <p className="text-gray-400 mt-2">Preparing dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-6 py-5 rounded-3xl backdrop-blur-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div>
            <p className="text-slate-500 font-medium mb-2">Order Management</p>
            <h1 className="text-4xl font-bold text-slate-900">
              {isAdminOrManager ? "Orders" : "My Orders"}
            </h1>
            <p className="text-slate-600 mt-3 max-w-2xl">
              {isAdminOrManager
                ? "Manage customer orders and track shipment progress."
                : "Track your orders and shipment progress."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Total Orders</p>
                <h2 className="text-3xl font-bold mt-2 text-slate-900">{orders.length}</h2>
              </div>
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <ShoppingCart size={22} className="text-slate-700" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Pending</p>
                <h2 className="text-3xl font-bold mt-2 text-slate-900">
                  {orders.filter((o) => o.status === "PENDING").length}
                </h2>
              </div>
              <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Truck size={22} className="text-yellow-700" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Arrived</p>
                <h2 className="text-3xl font-bold mt-2 text-slate-900">
                  {orders.filter((o) => o.status === "ARRIVED").length}
                </h2>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <PackageCheck size={22} className="text-green-700" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {orders.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-lg">
              No orders found.
            </div>
          )}
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">

                <div className="flex gap-5">
                  <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                    <ShoppingCart size={30} className="text-slate-700" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h2 className="text-2xl font-bold text-slate-900">{order.orderNumber}</h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-5">
                      {isAdminOrManager && (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 min-w-[240px]">
                          <p className="text-xs text-slate-500 mb-1">Customer Email</p>
                          <p className="font-medium text-slate-800">{order.customerEmail}</p>
                        </div>
                      )}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 min-w-[180px]">
                        <p className="text-xs text-slate-500 mb-1">Total Amount</p>
                        <p className="font-medium text-slate-800">${order.totalAmount}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 min-w-[180px]">
                        <p className="text-xs text-slate-500 mb-1">Date</p>
                        <p className="font-medium text-slate-800">{order.createdAt?.slice(0, 10)}</p>
                      </div>
                      {order.shippingAddress && (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 min-w-[220px]">
                          <p className="text-xs text-slate-500 mb-1">Shipping Address</p>
                          <p className="font-medium text-slate-800">{order.shippingAddress}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isAdminOrManager && order.status === "PENDING" && (
                  <div className="flex flex-col sm:flex-row xl:flex-col gap-3">
                    <button
                      onClick={() => handleConfirmOrder(order)}
                      className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl transition"
                    >
                      <Check size={18} />
                      Confirm Order
                    </button>
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl transition"
                    >
                      <Trash2 size={18} />
                      Cancel
                    </button>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default OrdersPage;
