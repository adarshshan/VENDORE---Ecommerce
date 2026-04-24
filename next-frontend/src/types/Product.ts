export interface ProductSize {
  size: string;
  stock: number;
}

export interface ProductImage {
  url: string;
  public_id: string;
}

export interface Product {
  _id: string | number;
  slug: string;
  name: string;
  brand?: string;
  price: number;
  description?: string;
  stock?: number;
  hasSizes?: boolean;
  category?: { _id: string; name: string };
  categories?: { _id: string; name: string }[];
  sizes?: ProductSize[];
  images?: ProductImage[];
  sellerId?: string;
  weight?: number;
  createdAt?: string;
  updatedAt?: string;
}

