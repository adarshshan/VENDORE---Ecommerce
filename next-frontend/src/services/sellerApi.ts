import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const sellerApi = axios.create({
  baseURL: `${API_URL}/seller`,
  withCredentials: true,
});

export const sellerLogin = async (credentials: any) => {
  const { data } = await sellerApi.post("/login", credentials);
  if (data.success) {
    localStorage.setItem("sellerUser", JSON.stringify(data.user));
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
  localStorage.removeItem("sellerUser");
  // Cookies are cleared by the browser if the backend sends a clear cookie instruction,
  // or we can add a logout API call if needed.
};

export const isSellerAuthenticated = () => {
  return !!localStorage.getItem("sellerUser");
};
