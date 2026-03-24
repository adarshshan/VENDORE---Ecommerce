import { Schema, model, Document } from "mongoose";

export interface ProductVariant {
  size: string;
  color: string;
  stock: number;
}

export interface ProductDocument extends Document {
  name: string;
  price: number;
  description: string;
  stock: number; // Total stock (sum of variants or standalone)
  category: string;
  subCategory?: string;
  images: string[];
  variants: ProductVariant[];
  tags?: string[];
  isFeatured: boolean;
  isActive: boolean;
}

const variantSchema = new Schema<ProductVariant>({
  size: { type: String, required: true },
  color: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
}, { _id: false });

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: String, required: true, trim: true, index: true },
    subCategory: { type: String, trim: true },
    images: { type: [String], default: [] },
    variants: [variantSchema],
    tags: { type: [String], index: true },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Index for search
productSchema.index({ name: "text", description: "text", tags: "text" });

export const ProductModel = model<ProductDocument>("Product", productSchema);
