import axios from "axios";
import type { Product } from "../types/Product";
import type { User } from "../types/User";

const VITE_API_URL = import.meta.env.VITE_API_URL;

axios.defaults.withCredentials = true;

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  limit?: number;
}

export const getProducts = async (
  filters?: ProductFilters,
): Promise<Product[]> => {
  const params = new URLSearchParams();
  if (filters) {
    if (filters.category) params.append("category", filters.category);
    if (filters.minPrice)
      params.append("minPrice", filters.minPrice.toString());
    if (filters.maxPrice)
      params.append("maxPrice", filters.maxPrice.toString());
    if (filters.search) params.append("search", filters?.search);
    if (filters.sort) params.append("sort", filters?.sort);
    if (filters.limit) params.append("limit", filters?.limit.toString());
  }

  const response = await axios.get(
    `${VITE_API_URL}/products?${params.toString()}`,
  );
  return response.data;
};

export const getProductsById = async (id: string): Promise<Product> => {
  const response = await axios.get(`${VITE_API_URL}/products/${id}`);
  return response.data;
};

export const getRelatedProducts = async (
  productId: string,
): Promise<Product[]> => {
  const response = await axios.get(
    `${VITE_API_URL}/products/related/${productId}`,
  );
  return response.data;
};

export const createProduct = async (
  productData: FormData,
): Promise<Product> => {
  const response = await axios.post(`${VITE_API_URL}/products`, productData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateProduct = async (
  productData: FormData,
): Promise<Product> => {
  const id = productData.get("_id") as string;
  const response = await axios.put(
    `${VITE_API_URL}/products/${id}`,
    productData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await axios.delete(`${VITE_API_URL}/products/${id}`);
};

export const getUsers = async (): Promise<User[]> => {
  const response = await axios.get(`${VITE_API_URL}/users`);
  return response.data;
};

// User management functions can go here as needed
// createUser removed in favor of Google-only authentication

export const updateUser = async (userData: Partial<User>): Promise<User> => {
  const response = await axios.put(
    `${VITE_API_URL}/users/${userData._id}`,
    userData,
  );
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await axios.delete(`${VITE_API_URL}/users/${id}`);
};

export const blockUser = async (id: string): Promise<User> => {
  const response = await axios.put(`${VITE_API_URL}/users/${id}/block`);
  return response.data;
};

export const unblockUser = async (id: string): Promise<User> => {
  const response = await axios.put(`${VITE_API_URL}/users/${id}/unblock`);
  return response.data;
};

export const googleAuth = async (
  credential: string,
  client_id: string,
): Promise<{
  success: boolean;
  user: User;
  accessToken: string;
  refreshToken: string;
  message: string;
}> => {
  const response = await axios.post(`${VITE_API_URL}/users/google-auth`, {
    credential,
    client_id,
  });
  return response.data;
};

// Category API
export const getCategories = async (status?: string) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  const response = await axios.get(
    `${VITE_API_URL}/categories?${params.toString()}`,
  );
  return response.data;
};

export const createCategory = async (categoryData: any) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const config = {
    headers: { Authorization: `Bearer ${user.token}` },
  };
  const response = await axios.post(
    `${VITE_API_URL}/categories`,
    categoryData,
    config,
  );
  return response.data;
};

export const updateCategory = async (id: string, categoryData: any) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const config = {
    headers: { Authorization: `Bearer ${user.token}` },
  };
  const response = await axios.put(
    `${VITE_API_URL}/categories/${id}`,
    categoryData,
    config,
  );
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const config = {
    headers: { Authorization: `Bearer ${user.token}` },
  };
  const response = await axios.delete(
    `${VITE_API_URL}/categories/${id}`,
    config,
  );
  return response.data;
};

// Order & Payment
export const createRazorpayOrder = async (items: any[]) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };
  const response = await axios.post(
    `${VITE_API_URL}/orders/create-razorpay-order`,
    { items },
    config,
  );
  return response.data;
};

export const verifyPayment = async (paymentData: any) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };
  const response = await axios.post(
    `${VITE_API_URL}/orders/verify-payment`,
    paymentData,
    config,
  );
  return response.data;
};

export const createOrder = async (orderData: any) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };
  const response = await axios.post(
    `${VITE_API_URL}/orders`,
    orderData,
    config,
  );
  return response.data;
};

export const getMyOrders = async () => {
  const response = await axios.get(`${VITE_API_URL}/orders/myorders`);
  return response.data;
};

export const getOrderById = async (id: string) => {
  const response = await axios.get(`${VITE_API_URL}/orders/${id}`);
  return response.data;
};

export const cancelOrder = async (id: string, reason: string) => {
  const response = await axios.post(`${VITE_API_URL}/orders/${id}/cancel`, {
    reason,
  });
  return response.data;
};

export const requestReturn = async (id: string, reason: string) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };
  const response = await axios.post(
    `${VITE_API_URL}/orders/${id}/return`,
    { reason },
    config,
  );
  return response.data;
};

// Admin Order API
export const getAllOrders = async (page: number = 1) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };
  const response = await axios.get(
    `${VITE_API_URL}/orders?pageNumber=${page}`,
    config,
  );
  return response.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };
  const response = await axios.put(
    `${VITE_API_URL}/orders/${id}/status`,
    { status },
    config,
  );
  return response.data;
};

export const handleReturnRequest = async (id: string, status: string) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };
  const response = await axios.put(
    `${VITE_API_URL}/orders/${id}/return`,
    { status },
    config,
  );
  return response.data;
};

// Contact API
export const submitContact = async (contactData: any) => {
  const response = await axios.post(`${VITE_API_URL}/contact`, contactData);
  return response.data;
};

export const getAllContacts = async () => {
  const response = await axios.get(`${VITE_API_URL}/contact`);
  return response.data;
};

export const updateContactStatus = async (id: string, status: string) => {
  const response = await axios.patch(`${VITE_API_URL}/contact/${id}`, {
    status,
  });
  return response.data;
};

// Wishlist API
export const getWishlist = async (): Promise<{ wishlist: Product[] }> => {
  const response = await axios.get(`${VITE_API_URL}/wishlist`);
  return response.data;
};

export const addToWishlist = async (
  productId: string,
): Promise<{ wishlist: Product[] }> => {
  const response = await axios.post(`${VITE_API_URL}/wishlist/add`, {
    productId,
  });
  return response.data;
};

export const removeFromWishlist = async (
  productId: string,
): Promise<{ wishlist: Product[] }> => {
  const response = await axios.delete(
    `${VITE_API_URL}/wishlist/remove/${productId}`,
  );
  return response.data;
};
