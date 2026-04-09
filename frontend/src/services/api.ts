import axios from "axios";
import type { Product } from "../types/Product";
import type { User } from "../types/User";

const VITE_API_URL = import.meta.env.VITE_API_URL;

axios.defaults.withCredentials = true;

// Add a request interceptor
axios.interceptors.request.use(
  (config) => {
    // Get access token from zustand storage (localStorage)
    const storage = localStorage.getItem("threadco-storage");
    if (storage) {
      try {
        const parsedStorage = JSON.parse(storage);
        const accessToken = parsedStorage.state?.user?.token; // Assuming token is stored here
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch (e) {
        console.error("Error parsing storage for auth token", e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const message = error.response.data?.message || "";

      // Check if it's an authorization error (excluding actual login attempts)
      if (
        message.toLowerCase().includes("not authorized") ||
        message.toLowerCase().includes("session expired") ||
        message.toLowerCase().includes("token expired")
      ) {
        // Avoid redirecting if we are already on the login page
        if (!window.location.pathname.includes("/login")) {
          // Save current path for redirect after login
          const currentPath = window.location.pathname + window.location.search;
          sessionStorage.setItem("redirectAfterLogin", currentPath);

          // Clear local storage and state
          localStorage.removeItem("user");
          // Note: We can't directly call useStore.getState().logout() here due to circular dependency
          // but removing from localStorage will help on next reload/mount

          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  limit?: number;
  page?: number;
}

export const getProducts = async (
  filters?: ProductFilters,
): Promise<{
  products: Product[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}> => {
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
    if (filters.page) params.append("page", filters?.page.toString());
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

export const getUsers = async (
  page: number = 1,
  limit: number = 10,
): Promise<{
  users: User[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}> => {
  const response = await axios.get(
    `${VITE_API_URL}/users?page=${page}&limit=${limit}`,
  );
  return response.data;
};

// User management functions can go here as needed
// createUser removed in favor of Google-only authentication

export const updateUser = async (userData: Partial<User>): Promise<User> => {
  const response = await axios.put(
    `${VITE_API_URL}/users/${userData?._id}`,
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

// Seller management
export const getSellers = async (): Promise<{
  success: boolean;
  sellers: User[];
}> => {
  const response = await axios.get(`${VITE_API_URL}/admin/sellers`);
  return response.data;
};

export const createSeller = async (
  sellerData: any,
): Promise<{ success: boolean; message: string; seller: User }> => {
  const response = await axios.post(
    `${VITE_API_URL}/admin/seller/create`,
    sellerData,
  );
  return response.data;
};

export const blockSeller = async (
  id: string,
): Promise<{ success: boolean; message: string; seller: User }> => {
  const response = await axios.put(`${VITE_API_URL}/admin/seller/${id}/block`);
  return response.data;
};

export const unblockSeller = async (
  id: string,
): Promise<{ success: boolean; message: string; seller: User }> => {
  const response = await axios.put(
    `${VITE_API_URL}/admin/seller/${id}/unblock`,
  );
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
  const response = await axios.post(`${VITE_API_URL}/categories`, categoryData);
  return response.data;
};

export const updateCategory = async (id: string, categoryData: any) => {
  const response = await axios.put(
    `${VITE_API_URL}/categories/${id}`,
    categoryData,
  );
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await axios.delete(`${VITE_API_URL}/categories/${id}`);
  return response.data;
};

// Order & Payment
export const createRazorpayOrder = async (items: any[]) => {
  const response = await axios.post(
    `${VITE_API_URL}/orders/create-razorpay-order`,
    { items },
  );
  return response.data;
};

export const verifyPayment = async (paymentData: any) => {
  const response = await axios.post(
    `${VITE_API_URL}/orders/verify-payment`,
    paymentData,
  );
  return response.data;
};

export const createOrder = async (orderData: any) => {
  const response = await axios.post(`${VITE_API_URL}/orders`, orderData);
  return response.data;
};

export const getMyOrders = async (
  page: number = 1,
  limit: number = 10,
): Promise<{
  orders: any[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}> => {
  const response = await axios.get(
    `${VITE_API_URL}/orders/myorders?page=${page}&limit=${limit}`,
  );
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

export const requestReturn = async (returnParams: {
  orderId: string;
  productId: string;
  reason: string;
  customReason?: string;
}) => {
  const response = await axios.post(
    `${VITE_API_URL}/orders/return-request`,
    returnParams,
  );
  return response.data;
};

// Admin Order API
export const getAllOrders = async (
  page: number = 1,
  limit: number = 10,
): Promise<{
  orders: any[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}> => {
  const response = await axios.get(
    `${VITE_API_URL}/orders?page=${page}&limit=${limit}`,
  );
  return response.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const response = await axios.put(`${VITE_API_URL}/orders/${id}/status`, {
    status,
  });
  return response.data;
};

export const handleReturnRequest = async (
  id: string,
  status: string,
  productId: string,
) => {
  const response = await axios.put(`${VITE_API_URL}/orders/${id}/return`, {
    status,
    productId,
  });
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

// Search API
export const getSearchSuggestions = async (
  query: string,
): Promise<{
  products: Product[];
  categories: { name: string; slug: string }[];
  brands: { name: string }[];
}> => {
  const response = await axios.get(
    `${VITE_API_URL}/search/suggestions?q=${query}`,
  );
  return response.data;
};

// Shipping API
export const validatePincode = async (pincode: string) => {
  const response = await axios.post(
    `${VITE_API_URL}/shipping/validate-pincode`,
    {
      pincode,
    },
  );
  return response.data;
};
