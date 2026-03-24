export interface Product {
  _id: string | number;
  name: string;
  price: number;
  description?: string;
  stock?: number;
  category?: { _id: string; name: string };
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}
