import { apiRequest } from "./api";

export const getProducts = async (
  token,
  isAdmin = false
) => {
  const endpoint = isAdmin
    ? "/api/products/all?size=200"
    : "/api/products?size=200";

  return apiRequest(
    "GET",
    endpoint,
    null,
    token
  );
};

export const createProduct = async (
  productData,
  token
) => {
  return apiRequest(
    "POST",
    "/api/products",
    productData,
    token
  );
};

export const updateProduct = async (
  productId,
  productData,
  token
) => {
  return apiRequest(
    "PUT",
    `/api/products/${productId}`,
    productData,
    token
  );
};

export const deleteProduct = async (
  productId,
  token
) => {
  return apiRequest(
    "DELETE",
    `/api/products/${productId}`,
    null,
    token
  );
};

export const activateProduct = async (
  productId,
  token
) => {
  return apiRequest(
    "PATCH",
    `/api/products/${productId}/activate`,
    null,
    token
  );
};

export const updateStock = async (productId, quantity, token) => {
  return apiRequest(
    "PATCH",
    `/api/products/${productId}/stock`,
    { quantity },
    token
  );
};