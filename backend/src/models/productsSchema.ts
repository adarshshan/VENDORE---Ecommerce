import { Schema, model, Document } from "mongoose";

export interface ProductDocument extends Document {
  name: string;
  price: number;
  description: string;
  stock: number;
  category: string;
  image?: string;
}

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    image: { type: String, required: false },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

export const ProductModel = model<ProductDocument>("Product", productSchema);
