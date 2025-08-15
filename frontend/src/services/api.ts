import axios from 'axios';
import type { Product } from '../types/Product';

const API_URL = 'http://localhost:3000/api';

export const getProducts = async (): Promise<Product[]> => {
  const response = await axios.get(`${API_URL}/products`);
  return response.data;
};

export const createProduct = async (productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  const response = await axios.post(`${API_URL}/products`, productData);
  return response.data;
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  const response = await axios.put(`${API_URL}/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/products/${id}`);
};
