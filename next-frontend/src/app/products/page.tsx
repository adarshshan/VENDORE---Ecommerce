import React from "react";
import ProductList from "@/src/components/ProductList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Men & Women Clothing Online | ThreadCo Collections",
  description: "Browse our extensive collection of premium men's and women's fashion. From trendy jerseys to elegant apparel, find your perfect style at ThreadCo.",
  alternates: {
    canonical: "https://threadco.online/products",
  },
};

export default function Page() {
  return <ProductList />;
}

