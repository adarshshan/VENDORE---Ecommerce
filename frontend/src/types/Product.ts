export interface ProductSize {
  size: string;
  stock: number;
}

export interface Product {
  _id: string | number;
  name: string;
  brand?: string;
  price: number;
  description?: string;
  stock?: number;
  hasSizes?: boolean;
  category?: { _id: string; name: string };
  sizes?: ProductSize[];
  images?: string[];
  sellerId?: string;
  weight?: number;
  createdAt?: string;
  updatedAt?: string;
}
