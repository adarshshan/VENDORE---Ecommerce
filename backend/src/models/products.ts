import { ObjectId } from "mongodb";

export interface Product {
  _id?: ObjectId;
  name: string;
  price: number;
  description: string;
  stock: number;
  discount?: number;
}
