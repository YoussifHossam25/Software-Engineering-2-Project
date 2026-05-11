import { apiRequest } from "./api";

export const getDeliveries = async (
  token,
  role,
  userId
) => {
  let endpoint = "/api/deliveries/my-deliveries";

  if (role === "ADMIN" || role === "MANAGER" || role === "DELIVERY") {
    endpoint = "/api/deliveries";
  }

  return apiRequest("GET", endpoint, null, token);
};

export const createDelivery = async (
  deliveryData,
  token
) => {
  return apiRequest(
    "POST",
    "/api/deliveries",
    deliveryData,
    token
  );
};

export const assignDriver = async (
  deliveryId,
  driverData,
  token
) => {
  return apiRequest(
    "PUT",
    `/api/deliveries/${deliveryId}/assign-driver`,
    driverData,
    token
  );
};

export const updateDeliveryStatus =
  async (
    deliveryId,
    statusData,
    token
  ) => {
    return apiRequest(
      "PUT",
      `/api/deliveries/${deliveryId}/status`,
      statusData,
      token
    );
  };