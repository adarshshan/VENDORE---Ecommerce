import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getSellerToken = () => localStorage.getItem("sellerToken");

const sellerApi = axios.create({
  baseURL: `${API_URL}/seller`,
});

sellerApi.interceptors.request.use((config) => {
  const token = getSellerToken();
  if (token) {
    config.headers["X-Seller-Token"] = token;
  }
  return config;
});

export const sellerLogin = async (credentials: any) => {
  const { data } = await sellerApi.post("/login", credentials);
  if (data.success) {
    localStorage.setItem("sellerToken", data.token);
  }
  return data;
};

export const getInventory = async (params: any) => {
  const { data } = await sellerApi.get("/products", { params });
  return data;
};

export const updateQuantity = async (id: string, updateData: any) => {
  const { data } = await sellerApi.put(`/product/${id}/quantity`, updateData);
  return data;
};

export const getSellerOrders = async (params: any) => {
  const { data } = await sellerApi.get("/orders", { params });
  return data;
};

export const bookSellerOrder = async (id: string) => {
  const { data } = await sellerApi.put(`/order/${id}/book`);
  return data;
};

export const sellerLogout = () => {
  localStorage.removeItem("sellerToken");
};

export const isSellerAuthenticated = () => {
  return !!localStorage.getItem("sellerToken");
};
