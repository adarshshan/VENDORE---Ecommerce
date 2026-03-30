import React, { useEffect, useState } from "react";
import ProductList from "./ProductList";
import ProductCarousel from "../../components/ProductCarousel";
import { getProducts } from "../../services/api";
import type { Product } from "../../types/Product";
import SlickBanner from "../../components/SlickBanner";

const HomePage: React.FC = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const data = await getProducts({ sort: "newest", limit: 15 });
        setNewArrivals(data);
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
        subtitle="Check out our latest collection of premium kids wear"
        products={newArrivals}
        loading={loading}
      />
      <div className="py-3 sm:py-12 bg-background">
        <ProductList />
      </div>
    </div>
  );
};

export default HomePage;
