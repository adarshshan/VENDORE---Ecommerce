import React from "react";
import ProductList from "@/src/components/ProductList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Collection | ThreadCo",
  description: "Discover the latest trends in men's fashion and stylish clothing for women.",
};

export default function Page() {
  return <ProductList />;
}

