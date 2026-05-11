import { apiRequest } from "./api";

export const getUsers = async (token) => {
  return apiRequest(
    "GET",
    "/api/users?size=200",
    null,
    token
  );
};

export const createUser = async (
  body,
  token
) => {
  return apiRequest(
    "POST",
    "/api/users",
    body,
    token
  );
};

export const updateUser = async (
  id,
  body,
  token
) => {
  return apiRequest(
    "PUT",
    `/api/users/${id}`,
    body,
    token
  );
};

export const deleteUser = async (
  id,
  token
) => {
  return apiRequest(
    "DELETE",
    `/api/users/${id}`,
    null,
    token
  );
};