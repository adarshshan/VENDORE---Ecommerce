import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface UserDocument extends Document {
  email: string;
  password?: string;
  name: string;
  role: "user" | "admin";
  status: "active" | "blocked";
  comparePassword(candidatePassword: string): Promise<boolean>;
  authSource: string;
}

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
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
    authSource: {
      type: String,
      enum: ["self", "google"],
      default: "self",
    },
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
