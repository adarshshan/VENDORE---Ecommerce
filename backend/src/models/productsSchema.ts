import { Schema, model, Document, Types } from "mongoose";

export interface ProductSize {
  size: string;
  stock: number;
}

export interface ProductVariant {
  size: string;
  color: string;
  stock: number;
}

export interface ProductDocument extends Document {
  name: string;
  brand?: string;
  price: number;
  description: string;
  stock: number; // For products WITHOUT sizes
  hasSizes: boolean;
  category: Types.ObjectId | string;
  subCategory?: string;
  sizes: ProductSize[];
  images: string[];
  variants: ProductVariant[];
  tags?: string[];
  isFeatured: boolean;
  isActive: boolean;
  sellerId?: Types.ObjectId;
  weight: number; // weight in grams
}

const sizeSchema = new Schema<ProductSize>({
  size: { type: String, required: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
}, { _id: false });

const variantSchema = new Schema<ProductVariant>({
  size: { type: String, required: true },
  color: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
}, { _id: false });

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true, index: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    hasSizes: { type: Boolean, default: false },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    subCategory: { type: String, trim: true },
    sizes: { type: [sizeSchema], default: [] },
    images: { type: [String], default: [] },
    variants: [variantSchema],
    tags: { type: [String], index: true },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    weight: { type: Number, default: 500, min: 0 },
  },
  {
    timestamps: true,
  }
);

// Index for search
productSchema.index({ name: "text", description: "text", tags: "text" });

export const ProductModel = model<ProductDocument>("Product", productSchema);
