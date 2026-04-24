export interface Address {
  _id?: string;
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

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role?: "user" | "admin";
  status?: "active" | "blocked";
  token?: string;
  refreshToken?: string;
  addresses?: Address[];
}

