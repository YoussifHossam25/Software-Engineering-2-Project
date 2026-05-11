import { apiRequest } from "./api";

export const loginUser = async (email, password) => {
  return apiRequest("POST", "/api/auth/login", {
    email,
    password,
  });
};

export const registerUser = async (userData) => {
  return apiRequest("POST", "/api/auth/register", userData);
};