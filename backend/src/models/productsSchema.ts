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

export interface ProductImage {
  url: string;
  public_id: string;
}

export interface ProductDocument extends Document {
  name: string;
  brand?: string;
  price: number;
  description: string;
  slug: string;
  stock: number; // For products WITHOUT sizes
  hasSizes: boolean;
  category?: Types.ObjectId | string; // Deprecated, kept for migration/compatibility
  categories: (Types.ObjectId | string)[];
  subCategory?: string;
  sizes: ProductSize[];
  images: ProductImage[];
  variants: ProductVariant[];
  tags?: string[];
  isFeatured: boolean;
  isActive: boolean;
  sellerId?: Types.ObjectId;
  weight: number; // weight in grams
  updatedAt?: string;
}

const sizeSchema = new Schema<ProductSize>(
  {
    size: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
);

const variantSchema = new Schema<ProductVariant>(
  {
    size: { type: String, required: true },
    color: { type: String, required: true },
    stock: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const productImageSchema = new Schema<ProductImage>(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { _id: false },
);

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true, index: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    hasSizes: { type: Boolean, default: false },
    category: { type: Schema.Types.ObjectId, ref: "Category", index: true }, // Keep temporarily for migration
    categories: {
      type: [{ type: Schema.Types.ObjectId, ref: "Category" }],
      required: true,
      index: true,
      default: [],
    },
    subCategory: { type: String, trim: true },
    sizes: { type: [sizeSchema], default: [] },
    images: { type: [productImageSchema], default: [] },
    variants: [variantSchema],
    tags: { type: [String], index: true },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    weight: { type: Number, default: 500, min: 0 },
  },
  {
    timestamps: true,
  },
);

// Pre-save hook to generate slug
productSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // If slug is empty (e.g. name only has special characters), use a fallback or timestamp
    if (!this.slug) {
      this.slug = `product-${Date.now()}`;
    }
  }
  next();
});

// Index for search
productSchema.index({ name: "text", description: "text", tags: "text" });

export const ProductModel = model<ProductDocument>("Product", productSchema);
