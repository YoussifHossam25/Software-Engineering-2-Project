import { apiRequest } from "./api";

export const getOrders = async (
  token,
  isAdmin = false
) => {
  const endpoint = isAdmin
    ? "/api/orders"
    : "/api/orders/my-orders";

  return apiRequest(
    "GET",
    endpoint,
    null,
    token
  );
};

export const createOrder = async (
  orderData,
  token
) => {
  return apiRequest(
    "POST",
    "/api/orders",
    orderData,
    token
  );
};

export const updateOrderStatus = async (
  orderId,
  status,
  token
) => {
  return apiRequest(
    "PUT",
    `/api/orders/${orderId}/status`,
    { status },
    token
  );
};

export const cancelOrder = async (
  orderId,
  token
) => {
  return apiRequest(
    "DELETE",
    `/api/orders/${orderId}`,
    null,
    token
  );
};