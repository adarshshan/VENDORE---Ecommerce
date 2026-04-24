import axios from "axios";
import type { Product } from "@/src/types/Product";
import type { Address, User } from "@/src/types/User";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

axios.defaults.withCredentials = true;

// Add a request interceptor
if (typeof window !== "undefined") {
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
            const currentPath =
              window.location.pathname + window.location.search;
            sessionStorage.setItem("redirectAfterLogin", currentPath);

            // Clear local storage and state
            localStorage.removeItem("user");

            window.location.href = "/login";
          }
        }
      }
      return Promise.reject(error);
    },
  );
}

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
  hasMore: boolean;
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
    `${NEXT_PUBLIC_API_URL}/products?${params.toString()}`,
  );
  return response.data;
};

export const getProductsById = async (id: string): Promise<Product> => {
  const response = await axios.get(`${NEXT_PUBLIC_API_URL}/products/${id}`);
  return response.data;
};

export const getProductBySlug = async (slug: string): Promise<Product> => {
  const response = await axios.get(
    `${NEXT_PUBLIC_API_URL}/products/slug/${slug}`,
  );
  return response.data;
};

export const getRelatedProducts = async (
  productId: string,
): Promise<Product[]> => {
  const response = await axios.get(
    `${NEXT_PUBLIC_API_URL}/products/related/${productId}`,
  );
  return response.data;
};

export const createProduct = async (
  productData: FormData,
): Promise<Product> => {
  const response = await axios.post(
    `${NEXT_PUBLIC_API_URL}/products`,
    productData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const updateProduct = async (
  productData: FormData,
): Promise<Product> => {
  const id = productData.get("_id") as string;
  const response = await axios.put(
    `${NEXT_PUBLIC_API_URL}/products/${id}`,
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
  await axios.delete(`${NEXT_PUBLIC_API_URL}/products/${id}`);
};

export const getUsers = async (
  page: number = 1,
  limit: number = 10,
): Promise<{
  users: User[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}> => {
  const response = await axios.get(
    `${NEXT_PUBLIC_API_URL}/users?page=${page}&limit=${limit}`,
  );
  return response.data;
};

export const updateUser = async (userData: Partial<User>): Promise<User> => {
  const response = await axios.put(
    `${NEXT_PUBLIC_API_URL}/users/${userData?._id}`,
    userData,
  );
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await axios.delete(`${NEXT_PUBLIC_API_URL}/users/${id}`);
};

export const blockUser = async (id: string): Promise<User> => {
  const response = await axios.put(`${NEXT_PUBLIC_API_URL}/users/${id}/block`);
  return response.data;
};

export const unblockUser = async (id: string): Promise<User> => {
  const response = await axios.put(
    `${NEXT_PUBLIC_API_URL}/users/${id}/unblock`,
  );
  return response.data;
};

export const getSellers = async (
  page: number = 1,
  limit: number = 10,
): Promise<{
  success: boolean;
  sellers: User[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}> => {
  const response = await axios.get(
    `${NEXT_PUBLIC_API_URL}/admin/sellers?page=${page}&limit=${limit}`,
  );
  return response.data;
};

export const createSeller = async (
  sellerData: any,
): Promise<{ success: boolean; message: string; seller: User }> => {
  const response = await axios.post(
    `${NEXT_PUBLIC_API_URL}/admin/seller/create`,
    sellerData,
  );
  return response.data;
};

export const blockSeller = async (
  id: string,
): Promise<{ success: boolean; message: string; seller: User }> => {
  const response = await axios.put(
    `${NEXT_PUBLIC_API_URL}/admin/seller/${id}/block`,
  );
  return response.data;
};

export const unblockSeller = async (
  id: string,
): Promise<{ success: boolean; message: string; seller: User }> => {
  const response = await axios.put(
    `${NEXT_PUBLIC_API_URL}/admin/seller/${id}/unblock`,
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
  const response = await axios.post(
    `${NEXT_PUBLIC_API_URL}/users/google-auth`,
    {
      credential,
      client_id,
    },
  );
  return response.data;
};

export const getCategories = async (
  status?: string,
  page?: number,
  limit?: number,
): Promise<any> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  const response = await axios.get(
    `${NEXT_PUBLIC_API_URL}/categories?${params.toString()}`,
  );
  return response.data;
};

export const getCategoryBySlug = async (slug: string) => {
  const response = await axios.get(
    `${NEXT_PUBLIC_API_URL}/categories/slug/${slug}`,
  );
  return response.data;
};

export const createCategory = async (categoryData: any) => {
  const response = await axios.post(
    `${NEXT_PUBLIC_API_URL}/categories`,
    categoryData,
  );
  return response.data;
};

export const updateCategory = async (id: string, categoryData: any) => {
  const response = await axios.put(
    `${NEXT_PUBLIC_API_URL}/categories/${id}`,
    categoryData,
  );
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await axios.delete(
    `${NEXT_PUBLIC_API_URL}/categories/${id}`,
  );
  return response.data;
};

export const createRazorpayOrder = async (items: any[], pincode?: string) => {
  const response = await axios.post(
    `${NEXT_PUBLIC_API_URL}/orders/create-razorpay-order`,
    { items, pincode },
  );
  return response.data;
};

export const verifyPayment = async (paymentData: any) => {
  const response = await axios.post(
    `${NEXT_PUBLIC_API_URL}/orders/verify-payment`,
    paymentData,
  );
  return response.data;
};

export const createOrder = async (orderData: any) => {
  const response = await axios.post(`${NEXT_PUBLIC_API_URL}/orders`, orderData);
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
  hasMore: boolean;
}> => {
  const response = await axios.get(
    `${NEXT_PUBLIC_API_URL}/orders/myorders?page=${page}&limit=${limit}`,
  );
  return response.data;
};

export const getOrderById = async (id: string) => {
  const response = await axios.get(`${NEXT_PUBLIC_API_URL}/orders/${id}`);
  return response.data;
};

export const cancelOrder = async (id: string, reason: string) => {
  const response = await axios.post(
    `${NEXT_PUBLIC_API_URL}/orders/${id}/cancel`,
    {
      reason,
    },
  );
  return response.data;
};

export const requestReturn = async (returnParams: {
  orderId: string;
  productId: string;
  reason: string;
  customReason?: string;
}) => {
  const response = await axios.post(
    `${NEXT_PUBLIC_API_URL}/orders/return-request`,
    returnParams,
  );
  return response.data;
};

export const getAllOrders = async (
  page: number = 1,
  limit: number = 10,
): Promise<{
  orders: any[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}> => {
  const response = await axios.get(
    `${NEXT_PUBLIC_API_URL}/orders?page=${page}&limit=${limit}`,
  );
  return response.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const response = await axios.put(
    `${NEXT_PUBLIC_API_URL}/orders/${id}/status`,
    {
      status,
    },
  );
  return response.data;
};

export const handleReturnRequest = async (
  id: string,
  status: string,
  productId: string,
) => {
  const response = await axios.put(
    `${NEXT_PUBLIC_API_URL}/orders/${id}/return`,
    {
      status,
      productId,
    },
  );
  return response.data;
};

export const submitContact = async (contactData: any) => {
  const response = await axios.post(
    `${NEXT_PUBLIC_API_URL}/contact`,
    contactData,
  );
  return response.data;
};

export const getAllContacts = async (
  page: number = 1,
  limit: number = 10,
): Promise<{
  success: boolean;
  data: any[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}> => {
  const response = await axios.get(
    `${NEXT_PUBLIC_API_URL}/contact?page=${page}&limit=${limit}`,
  );
  return response.data;
};

export const updateContactStatus = async (id: string, status: string) => {
  const response = await axios.patch(`${NEXT_PUBLIC_API_URL}/contact/${id}`, {
    status,
  });
  return response.data;
};

export const getWishlist = async (): Promise<{ wishlist: Product[] }> => {
  const response = await axios.get(`${NEXT_PUBLIC_API_URL}/wishlist`);
  return response.data;
};

export const addToWishlist = async (
  productId: string,
): Promise<{ wishlist: Product[] }> => {
  const response = await axios.post(`${NEXT_PUBLIC_API_URL}/wishlist/add`, {
    productId,
  });
  return response.data;
};

export const removeFromWishlist = async (
  productId: string,
): Promise<{ wishlist: Product[] }> => {
  const response = await axios.delete(
    `${NEXT_PUBLIC_API_URL}/wishlist/remove/${productId}`,
  );
  return response.data;
};

export const getAddresses = async (): Promise<{
  success: boolean;
  addresses: Address[];
}> => {
  const response = await axios.get(
    `${NEXT_PUBLIC_API_URL}/users/addresses/all`,
  );
  return response.data;
};

export const addAddress = async (
  address: Partial<Address>,
): Promise<{ success: boolean; addresses: Address[] }> => {
  const response = await axios.post(
    `${NEXT_PUBLIC_API_URL}/users/address`,
    address,
  );
  return response.data;
};

export const updateAddress = async (
  id: string,
  address: Partial<Address>,
): Promise<{ success: boolean; addresses: Address[] }> => {
  const response = await axios.put(
    `${NEXT_PUBLIC_API_URL}/users/address/${id}`,
    address,
  );
  return response.data;
};

export const deleteAddress = async (
  id: string,
): Promise<{ success: boolean; addresses: Address[] }> => {
  const response = await axios.delete(
    `${NEXT_PUBLIC_API_URL}/users/address/${id}`,
  );
  return response.data;
};

export const setDefaultAddress = async (
  id: string,
): Promise<{ success: boolean; addresses: Address[] }> => {
  const response = await axios.put(
    `${NEXT_PUBLIC_API_URL}/users/address/${id}/default`,
  );
  return response.data;
};

export const getSearchSuggestions = async (
  query: string,
): Promise<{
  products: Product[];
  categories: { name: string; slug: string }[];
  brands: { name: string }[];
}> => {
  const response = await axios.get(
    `${NEXT_PUBLIC_API_URL}/search/suggestions?q=${query}`,
  );
  return response.data;
};

export const validatePincode = async (pincode: string, cartItems?: any[]) => {
  const response = await axios.post(
    `${NEXT_PUBLIC_API_URL}/shipping/validate-pincode`,
    {
      pincode,
      cartItems,
    },
  );
  return response.data;
};

import type { Banner } from "@/src/types/Banner";

export const getActiveBanners = async (): Promise<{
  success: boolean;
  banners: Banner[];
}> => {
  const response = await axios.get(`${NEXT_PUBLIC_API_URL}/banners`);
  return response.data;
};

export const getAllBanners = async (): Promise<{
  success: boolean;
  banners: Banner[];
}> => {
  const response = await axios.get(`${NEXT_PUBLIC_API_URL}/banners/admin/all`);
  return response.data;
};

export const createBanner = async (
  formData: FormData,
): Promise<{ success: boolean; banner: Banner }> => {
  const response = await axios.post(
    `${NEXT_PUBLIC_API_URL}/banners/admin`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const updateBanner = async (
  id: string,
  formData: FormData,
): Promise<{ success: boolean; banner: Banner }> => {
  const response = await axios.put(
    `${NEXT_PUBLIC_API_URL}/banners/admin/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const deleteBanner = async (
  id: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete(
    `${NEXT_PUBLIC_API_URL}/banners/admin/${id}`,
  );
  return response.data;
};

export const toggleBannerVisibility = async (
  id: string,
): Promise<{ success: boolean; banner: Banner }> => {
  const response = await axios.put(
    `${NEXT_PUBLIC_API_URL}/banners/admin/${id}/toggle`,
  );
  return response.data;
};
