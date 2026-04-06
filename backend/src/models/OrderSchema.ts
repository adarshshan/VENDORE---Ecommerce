import { Schema, model, Document, Types } from "mongoose";

export interface OrderItem {
  product: Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  returnStatus?: "None" | "Requested" | "Approved" | "Rejected" | "Refunded";
  returnReason?: string;
  customReturnReason?: string;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderDocument extends Document {
  user: Types.ObjectId;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  createdAt: string;
  deliveredAt?: Date;
  status:
    | "Pending"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "Returned";
  cancelReason?: string;
  cancelDate?: Date;
  returnReason?: string;
  returnStatus?: "Requested" | "Approved" | "Rejected";
  returnDate?: Date;
  refundId?: string;
  refundAmount?: number;
  refundStatus?: string;
  refundDate?: Date;
  sellerBooked: boolean;
  sellerBookedAt?: Date;
}

const orderItemSchema = new Schema<OrderItem>(
  {
    product: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: { type: String },
    color: { type: String },
    returnStatus: {
      type: String,
      enum: ["None", "Requested", "Approved", "Rejected", "Refunded"],
      default: "None",
    },
    returnReason: { type: String },
    customReturnReason: { type: String },
  },
  { _id: false },
);

const shippingAddressSchema = new Schema<ShippingAddress>(
  {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema<OrderDocument>(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: { type: String, required: true, default: "Razorpay" },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false, index: true },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    status: {
      type: String,
      required: true,
      index: true,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Pending",
    },
    cancelReason: { type: String },
    cancelDate: { type: Date },
    returnReason: { type: String },
    returnStatus: {
      type: String,
      enum: ["Requested", "Approved", "Rejected"],
    },
    returnDate: { type: Date },
    refundId: { type: String },
    refundAmount: { type: Number },
    refundStatus: { type: String },
    refundDate: { type: Date },
    sellerBooked: { type: Boolean, default: false, index: true },
    sellerBookedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

export const OrderModel = model<OrderDocument>("Order", orderSchema);
