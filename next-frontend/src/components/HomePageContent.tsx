"use client";

import React, { useEffect, useState } from "react";
import ProductList from "@/src/components/ProductList";
import ProductCarousel from "@/src/components/ProductCarousel";
import { getProducts } from "@/src/services/api";
import { type Product } from "@/src/types/Product";
import SlickBanner from "@/src/components/SlickBanner";

const HomePageContent: React.FC = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const data = await getProducts({ sort: "newest", limit: 15 });
        setNewArrivals(data.products);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden">
        <SlickBanner />
      </section>
      <ProductCarousel
        title="New Arrivals"
        subtitle="Explore our latest collection of premium men's and women's wear"
        products={newArrivals}
        loading={loading}
      />
      <div className="py-3 sm:py-12 bg-background">
        <ProductList />
      </div>
    </div>
  );
};

export default HomePageContent;
