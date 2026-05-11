import { useEffect, useState } from "react";

import {
  Pencil,
  Trash2,
  Plus,
  Check,
  Package,
  Boxes,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  activateProduct,
  updateStock,
} from "../services/productService";

import { createOrder } from "../services/orderService";

function ProductsPage() {
  const { auth } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    description: "",
    stockQuantity: "0",
  });

  const [stockModal, setStockModal] = useState(null);
  const [stockAmount, setStockAmount] = useState("");
  const [updatingStock, setUpdatingStock] = useState(false);

  const [orderModal, setOrderModal] = useState(null);
  const [orderForm, setOrderForm] = useState({ quantity: 1, shippingAddress: "" });
  const [ordering, setOrdering] = useState(false);

  const isAdminOrManager =
    auth.user.role === "ADMIN" || auth.user.role === "MANAGER";

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts(auth.token, isAdminOrManager);
      const data = response.data;
      setProducts(data.content || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: "", sku: "", category: "", price: "", description: "", stockQuantity: "0" });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      description: product.description,
      stockQuantity: product.stockQuantity ?? "0",
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity) || 0,
      };
      if (editingProduct) {
        await updateProduct(editingProduct.id, body, auth.token);
      } else {
        await createProduct(body, auth.token);
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this product?")) return;
    try {
      await deleteProduct(id, auth.token);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateProduct(id, auth.token);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const openStockModal = (product) => {
    setStockModal(product);
    setStockAmount(String(product.stockQuantity ?? 0));
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    setUpdatingStock(true);
    try {
      await updateStock(stockModal.id, parseInt(stockAmount), auth.token);
      setStockModal(null);
      loadProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingStock(false);
    }
  };

  const handleOrderClick = (product) => {
    setOrderModal(product);
    setOrderForm({ quantity: 1, shippingAddress: "" });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrdering(true);
    try {
      await createOrder({
        items: [{ productId: orderModal.id, quantity: parseInt(orderForm.quantity) }],
        shippingAddress: orderForm.shippingAddress,
      }, auth.token);
      setOrderModal(null);
      alert("Order placed successfully!");
      loadProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setOrdering(false);
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
            <h2 className="text-2xl font-bold text-white">Loading Products</h2>
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
            <p className="text-slate-500 font-medium mb-2">Product Management</p>
            <h1 className="text-4xl font-bold text-slate-900">Products</h1>
            {isAdminOrManager && (
              <p className="text-slate-600 mt-3 max-w-2xl">
                Manage your products, pricing, categories, and stock from one place.
              </p>
            )}
          </div>
          {isAdminOrManager && (
            <button
              onClick={openCreateModal}
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl transition-all shadow-sm"
            >
              <Plus size={18} />
              Create Product
            </button>
          )}
        </div>

        {isAdminOrManager && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Total Products</p>
                  <h2 className="text-3xl font-bold mt-2 text-slate-900">{products.length}</h2>
                </div>
                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Package size={22} className="text-slate-700" />
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Active Products</p>
                  <h2 className="text-3xl font-bold mt-2 text-slate-900">
                    {products.filter((p) => p.active).length}
                  </h2>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Check size={22} className="text-green-700" />
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Out of Stock</p>
                  <h2 className="text-3xl font-bold mt-2 text-slate-900">
                    {products.filter((p) => (p.stockQuantity ?? 0) <= 0).length}
                  </h2>
                </div>
                <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <Boxes size={22} className="text-red-700" />
                </div>
              </div>
            </div>
          </div>
        )}

        {!isAdminOrManager && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Package size={26} className="text-slate-700" />
                  </div>
                  <span className="text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">{product.name}</h2>
                <p className="text-slate-600 leading-relaxed mb-6">{product.description}</p>
                <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                  <div>
                    <p className="text-sm text-slate-500">Price</p>
                    <p className="text-2xl font-bold text-slate-900">${product.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">SKU</p>
                    <p className="font-medium text-slate-700">{product.sku}</p>
                  </div>
                </div>
                <div className="mt-4">
                  {(product.stockQuantity ?? 0) <= 0 ? (
                    <div className="w-full text-center py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-500 font-medium text-sm">
                      Out of Stock
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOrderClick(product)}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-white font-medium transition"
                    >
                      Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {isAdminOrManager && (
          <div className="space-y-5">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">

                  <div className="flex gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Package size={30} className="text-slate-700" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h2 className="text-2xl font-bold text-slate-900">{product.name}</h2>
                        {product.active ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Active</span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">Inactive</span>
                        )}
                        {(product.stockQuantity ?? 0) <= 0 ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">Out of Stock</span>
                        ) : (
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                            Stock: {product.stockQuantity}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 leading-relaxed max-w-3xl">{product.description}</p>
                      <div className="flex flex-wrap gap-4 mt-5">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 min-w-[140px]">
                          <p className="text-xs text-slate-500 mb-1">Price</p>
                          <p className="font-bold text-lg text-slate-900">${product.price}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 min-w-[140px]">
                          <p className="text-xs text-slate-500 mb-1">SKU</p>
                          <p className="font-medium text-slate-800">{product.sku}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 min-w-[140px]">
                          <p className="text-xs text-slate-500 mb-1">Category</p>
                          <p className="font-medium text-slate-800">{product.category}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row xl:flex-col gap-3">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition"
                    >
                      <Pencil size={18} />
                      Edit
                    </button>
                    <button
                      onClick={() => openStockModal(product)}
                      className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl transition"
                    >
                      <Boxes size={18} />
                      Update Stock
                    </button>
                    {product.active ? (
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl transition"
                      >
                        <Trash2 size={18} />
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(product.id)}
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl transition"
                      >
                        <Check size={18} />
                        Activate
                      </button>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {orderModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Place Order</h2>
                <p className="text-slate-500 mt-1">{orderModal.name} — ${orderModal.price} each</p>
              </div>
              <button onClick={() => setOrderModal(null)} className="h-11 w-11 rounded-xl hover:bg-slate-100 flex items-center justify-center transition">
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            <form onSubmit={handlePlaceOrder} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantity <span className="text-slate-400">(max {orderModal.stockQuantity ?? "?"})</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={orderModal.stockQuantity ?? 9999}
                  value={orderForm.quantity}
                  onChange={e => setOrderForm({ ...orderForm, quantity: e.target.value })}
                  className="w-full border border-slate-200 focus:border-slate-400 outline-none px-4 py-3 rounded-xl transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Shipping Address</label>
                <input
                  type="text"
                  placeholder="Enter your shipping address"
                  value={orderForm.shippingAddress}
                  onChange={e => setOrderForm({ ...orderForm, shippingAddress: e.target.value })}
                  className="w-full border border-slate-200 focus:border-slate-400 outline-none px-4 py-3 rounded-xl transition"
                  required
                />
              </div>
              <div className="pt-2 bg-slate-50 rounded-2xl p-4">
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${(orderModal.price * (parseInt(orderForm.quantity) || 0)).toFixed(2)}
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setOrderModal(null)} className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
                  Cancel
                </button>
                <button type="submit" disabled={ordering} className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition disabled:opacity-50">
                  {ordering ? "Placing..." : "Confirm Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {stockModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Update Stock</h2>
                <p className="text-slate-500 mt-1">{stockModal.name}</p>
              </div>
              <button onClick={() => setStockModal(null)} className="h-11 w-11 rounded-xl hover:bg-slate-100 flex items-center justify-center transition">
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            <form onSubmit={handleUpdateStock} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={stockAmount}
                  onChange={e => setStockAmount(e.target.value)}
                  className="w-full border border-slate-200 focus:border-slate-400 outline-none px-4 py-3 rounded-xl transition"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setStockModal(null)} className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
                  Cancel
                </button>
                <button type="submit" disabled={updatingStock} className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition disabled:opacity-50">
                  {updatingStock ? "Saving..." : "Save Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  {editingProduct ? "Edit Product" : "Create Product"}
                </h2>
                <p className="text-slate-500 mt-2">Fill in the product details below.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="h-11 w-11 rounded-xl hover:bg-slate-100 flex items-center justify-center transition">
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-slate-200 focus:border-slate-400 outline-none px-4 py-3 rounded-xl transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">SKU</label>
                  <input
                    type="text"
                    name="sku"
                    placeholder="Enter SKU"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full border border-slate-200 focus:border-slate-400 outline-none px-4 py-3 rounded-xl transition disabled:bg-slate-100"
                    required
                    disabled={!!editingProduct}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-slate-200 focus:border-slate-400 outline-none px-4 py-3 rounded-xl transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Price</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border border-slate-200 focus:border-slate-400 outline-none px-4 py-3 rounded-xl transition"
                    required
                  />
                </div>
              </div>
              {!editingProduct && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Initial Stock Quantity</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    placeholder="0"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    className="w-full border border-slate-200 focus:border-slate-400 outline-none px-4 py-3 rounded-xl transition"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  name="description"
                  placeholder="Write product description..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-slate-200 focus:border-slate-400 outline-none px-4 py-3 rounded-xl transition resize-none"
                  rows="5"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition">
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
