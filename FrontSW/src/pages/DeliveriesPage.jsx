import { useEffect, useState } from "react";

import {
  Truck,
  PackageCheck,
  Check,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  getDeliveries,
  updateDeliveryStatus,
} from "../services/deliveryService";

function DeliveriesPage() {
  const { auth } = useAuth();

  const [deliveries, setDeliveries] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      setLoading(true);

      const response =
        await getDeliveries(
          auth.token,
          auth.user.role,
          auth.user.id
        );

      const data = response.data;

      setDeliveries(
        data.content || data || []
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickOrder = async (deliveryId) => {
    try {
      await updateDeliveryStatus(deliveryId, { status: "SHIPPED" }, auth.token);
      loadDeliveries();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDone = async (deliveryId) => {
    try {
      await updateDeliveryStatus(deliveryId, { status: "ARRIVED" }, auth.token);
      loadDeliveries();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "SHIPPED":
        return "bg-blue-100 text-blue-700";

      case "ARRIVED":
        return "bg-green-100 text-green-700";

      default:
        return "bg-slate-100 text-slate-700";
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
            <h2 className="text-2xl font-bold text-white">
              Loading Deliveries
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
              Delivery Management
            </p>

            <h1 className="text-4xl font-bold text-slate-900">
              Deliveries
            </h1>

            <p className="text-slate-600 mt-3 max-w-2xl">
              Track shipments and manage
              delivery progress.
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-slate-500 text-sm">
                  Total Deliveries
                </p>

                <h2 className="text-3xl font-bold mt-2 text-slate-900">
                  {deliveries.length}
                </h2>
              </div>

              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <Truck
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
                  Shipped
                </p>

                <h2 className="text-3xl font-bold mt-2 text-slate-900">
                  {
                    deliveries.filter(
                      (d) =>
                        d.status ===
                        "SHIPPED"
                    ).length
                  }
                </h2>
              </div>

              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Truck
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
                  Arrived
                </p>

                <h2 className="text-3xl font-bold mt-2 text-slate-900">
                  {
                    deliveries.filter(
                      (d) =>
                        d.status ===
                        "ARRIVED"
                    ).length
                  }
                </h2>
              </div>

              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <PackageCheck
                  size={22}
                  className="text-green-700"
                />
              </div>

            </div>

          </div>

        </div>

        <div className="space-y-5">

          {deliveries.map(
            (delivery) => (
              <div
                key={delivery.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
              >

                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">

                  <div className="flex gap-5">

                    <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Truck
                        size={30}
                        className="text-slate-700"
                      />
                    </div>

                    <div>

                      <div className="flex flex-wrap items-center gap-3 mb-3">

                        <h2 className="text-2xl font-bold text-slate-900">
                          {
                            delivery.deliveryNumber
                          }
                        </h2>

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                            delivery.status
                          )}`}
                        >
                          {
                            delivery.status
                          }
                        </span>

                      </div>

                      <div className="flex flex-wrap gap-4 mt-5">

                        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 min-w-[220px]">

                          <p className="text-xs text-slate-500 mb-1">
                            Order Number
                          </p>

                          <p className="font-medium text-slate-800">
                            {
                              delivery.orderNumber
                            }
                          </p>

                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 min-w-[240px]">

                          <p className="text-xs text-slate-500 mb-1">
                            Customer Email
                          </p>

                          <p className="font-medium text-slate-800">
                            {
                              delivery.customerEmail
                            }
                          </p>

                        </div>


                      </div>

                    </div>

                  </div>

                  {auth.user.role === "DELIVERY" && (
                    <div className="flex flex-col sm:flex-row xl:flex-col gap-3">
                      {delivery.status === "PENDING" && (
                        <button
                          onClick={() => handlePickOrder(delivery.id)}
                          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition"
                        >
                          <Truck size={18} />
                          Pick Order
                        </button>
                      )}
                      {delivery.status === "SHIPPED" && (
                        <button
                          onClick={() => handleDone(delivery.id)}
                          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl transition"
                        >
                          <Check size={18} />
                          Done
                        </button>
                      )}
                    </div>
                  )}

                </div>

              </div>
            )
          )}

        </div>

      </div>
    </div>
  );
}

export default DeliveriesPage;
