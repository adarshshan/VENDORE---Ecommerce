import { Schema, model, Document } from "mongoose";

export interface CategoryDocument extends Document {
  name: string;
  description?: string;
  status: "Active" | "Inactive";
  slug: string;
}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    slug: { type: String, unique: true, lowercase: true, trim: true },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug if needed (can be expanded)
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

export const CategoryModel = model<CategoryDocument>("Category", categorySchema);
