import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcrypt";

export interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface UserDocument extends Document {
  email: string;
  password?: string;
  name: string;
  role: "user" | "admin" | "seller";
  status: "active" | "blocked";
  comparePassword(candidatePassword: string): Promise<boolean>;
  authSource: string;
  addresses: Address[];
  wishlist: Types.ObjectId[];
}

const addressSchema = new Schema<Address>({
  fullName: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["user", "admin", "seller"], default: "user" },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
    authSource: {
      type: String,
      enum: ["self", "google"],
      default: "self",
    },
    addresses: [addressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  const user = this as UserDocument;
  if (!user.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    if (user.password) {
      user.password = await bcrypt.hash(user.password, salt);
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = model<UserDocument>("User", userSchema);
