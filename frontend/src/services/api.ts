import axios from "axios";
import type { Product } from "../types/Product";
import type { User } from "../types/User";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const getProducts = async (): Promise<Product[]> => {
  const response = await axios.get(`${VITE_API_URL}/products`);
  console.log("API response data:", response.data);
  return response.data;
};

export const getProductsById = async (id: string): Promise<Product> => {
  const response = await axios.get(`${VITE_API_URL}/products/${id}`);
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
