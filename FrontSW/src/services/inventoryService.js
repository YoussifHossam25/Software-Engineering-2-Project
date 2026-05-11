import { apiRequest } from "./api";

export const getInventory = async (
  token
) => {
  return apiRequest(
    "GET",
    "/api/inventory?size=200",
    null,
    token
  );
};

export const createInventoryRecord =
  async (
    inventoryData,
    token
  ) => {
    return apiRequest(
      "POST",
      "/api/inventory",
      inventoryData,
      token
    );
  };

export const addStock = async (
  productId,
  quantity,
  token
) => {
  return apiRequest(
    "POST",
    `/api/inventory/product/${productId}/add-stock?quantity=${quantity}`,
    null,
    token
  );
};

export const updateStock = async (
  productId,
  quantity,
  token
) => {
  return apiRequest(
    "POST",
    `/api/inventory/product/${productId}/add-stock?quantity=${quantity}`,
    null,
    token
  );
};