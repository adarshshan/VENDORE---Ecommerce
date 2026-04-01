import type { Product } from "./Product";
import type { User } from "./User";

export interface OrderItem {
  product: Product | string;
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

export interface PaymentResult {
  id: string;
  status: string;
  update_time: string;
  email_address: string;
}

export interface Order {
  _id: string;
  user: User | string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: PaymentResult;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status:
    | "Pending"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "Returned";
  createdAt: string;
  updatedAt: string;
  cancelReason?: string;
  cancelDate?: string;
  returnReason?: string;
  returnStatus?: "Requested" | "Approved" | "Rejected";
  returnDate?: string;
  refundId?: string;
  refundAmount?: number;
  refundStatus?: string;
  refundDate?: string;
}
