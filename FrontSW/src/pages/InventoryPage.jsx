import { useEffect, useState } from "react";

import {
  Package,
  Boxes,
  Warehouse,
  Plus,
  Pencil,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  getInventory,
  createInventoryRecord,
  updateStock,
} from "../services/inventoryService";

function InventoryPage() {
  const { auth } = useAuth();

  const [items, setItems] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingItem, setEditingItem] =
    useState(null);

  const [formData, setFormData] =
    useState({
      productId: "",
      product: "",
      amount: "",
    });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);

      const response =
        await getInventory(auth.token);

      const data = response.data;

      setItems(
        data.content || data || []
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);

    setFormData({
      productId: "",
      product: "",
      amount: "",
    });

    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);

    setFormData({
      productId: item.productId,
      product: item.productName,
      amount:
        item.quantityInStock,
    });

    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingItem) {
        const diff = parseInt(formData.amount) - parseInt(editingItem.quantityInStock);
        await updateStock(
          formData.productId,
          diff,
          auth.token
        );
      } else {
        await createInventoryRecord(
          {
            productId:
              formData.productId,
            productName:
              formData.product,
            quantityInStock:
              formData.amount,
          },
          auth.token
        );
      }

      setShowModal(false);

      loadInventory();
    } catch (err) {
      alert(err.message);
    }
  };

  const totalStock = items.reduce(
    (sum, item) =>
      sum +
      (item.quantityInStock || 0),
    0
  );

  const totalReserved = items.reduce(
    (sum, item) =>
      sum +
      (item.reservedQuantity || 0),
    0
  );

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
            <h2 className="text-2xl font-bold text-white">
              Loading Inventory
            </h2>

            <p className="text-gray-400 mt-2">
              Preparing dashboard...
            </p>
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
            <p className="text-slate-500 font-medium mb-2">
              Inventory Management
            </p>

            <h1 className="text-4xl font-bold text-slate-900">
              Inventory
            </h1>

            <p className="text-slate-600 mt-3 max-w-2xl">
              Manage warehouse stock and
              product quantities.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl transition-all shadow-sm"
          >
            <Plus size={18} />
            Add Stock
          </button>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-slate-500 text-sm">
                  Products
                </p>

                <h2 className="text-3xl font-bold mt-2 text-slate-900">
                  {items.length}
                </h2>
              </div>

              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <Package
                  size={22}
                  className="text-slate-700"
                />
              </div>

            </div>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-slate-500 text-sm">
                  Total Stock
                </p>

                <h2 className="text-3xl font-bold mt-2 text-slate-900">
                  {totalStock}
                </h2>
              </div>

              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Boxes
                  size={22}
                  className="text-blue-700"
                />
              </div>

            </div>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-slate-500 text-sm">
                  Reserved
                </p>

                <h2 className="text-3xl font-bold mt-2 text-slate-900">
                  {totalReserved}
                </h2>
              </div>

              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Warehouse
                  size={22}
                  className="text-green-700"
                />
              </div>

            </div>

          </div>

        </div>

        <div className="space-y-5">

          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
            >

              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">

                <div className="flex gap-5">

                  <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Package
                      size={30}
                      className="text-slate-700"
                    />
                  </div>

                  <div>

                    <div className="flex flex-wrap items-center gap-3 mb-3">

                      <h2 className="text-2xl font-bold text-slate-900">
                        {
                          item.productName
                        }
                      </h2>

                    </div>

                    <div className="flex flex-wrap gap-4 mt-5">

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 min-w-[180px]">

                        <p className="text-xs text-slate-500 mb-1">
                          Product SKU
                        </p>

                        <p className="font-medium text-slate-800">
                          {
                            item.productSku
                          }
                        </p>

                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 min-w-[180px]">

                        <p className="text-xs text-slate-500 mb-1">
                          Stock
                        </p>

                        <p className="font-medium text-slate-800">
                          {
                            item.quantityInStock
                          }
                        </p>

                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 min-w-[180px]">

                        <p className="text-xs text-slate-500 mb-1">
                          Reserved
                        </p>

                        <p className="font-medium text-slate-800">
                          {
                            item.reservedQuantity
                          }
                        </p>

                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 min-w-[220px]">

                        <p className="text-xs text-slate-500 mb-1">
                          Warehouse
                        </p>

                        <p className="font-medium text-slate-800">
                          {
                            item.warehouseLocation
                          }
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

                <div className="flex flex-col sm:flex-row xl:flex-col gap-3">

                  <button
                    onClick={() =>
                      openEditModal(item)
                    }
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition"
                  >
                    <Pencil size={18} />
                    Change Amount
                  </button>

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5 z-50">

          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200">

            <div className="flex items-center justify-between p-8 border-b border-slate-100">

              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  {editingItem
                    ? "Change Amount"
                    : "Add Stock"}
                </h2>

                <p className="text-slate-500 mt-2">
                  Fill inventory information.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="h-11 w-11 rounded-xl hover:bg-slate-100 flex items-center justify-center transition"
              >
                <X
                  size={20}
                  className="text-slate-600"
                />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="p-8 space-y-5"
            >

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product ID
                </label>

                <input
                  type="text"
                  name="productId"
                  value={
                    formData.productId
                  }
                  onChange={handleChange}
                  className="w-full border border-slate-200 focus:border-slate-400 outline-none px-4 py-3 rounded-xl transition"
                  required
                  disabled={editingItem}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product
                </label>

                <input
                  type="text"
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  className="w-full border border-slate-200 focus:border-slate-400 outline-none px-4 py-3 rounded-xl transition"
                  required
                  disabled={editingItem}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount
                </label>

                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full border border-slate-200 focus:border-slate-400 outline-none px-4 py-3 rounded-xl transition"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition"
                >
                  {editingItem
                    ? "Save Changes"
                    : "Add Stock"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default InventoryPage;