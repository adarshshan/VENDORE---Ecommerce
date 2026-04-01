import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { type Product } from "../types/Product";
import ProductCard from "./ProductCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Loading from "./Loading";

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  loading?: boolean;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  subtitle,
  products,
  loading,
}) => {
  const [mounted, setMounted] = useState<boolean>(false);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setWidth(window.innerWidth);

    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted || width === null) return null;

  const settings = {
    dots: false,
    infinite: products?.length > 4,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 2,
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: 4, slidesToScroll: 4 },
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 },
      },

      {
        breakpoint: 480,
        settings: { slidesToShow: 1, slideToScroll: 1 }, // 👈 THIS is key
      },
    ],
  };

  if (loading) return <Loading />;
  if (products?.length === 0) return null;

  return (
    <section className="sm:py-5 px-[1rem] sm:px-[5rem] bg-background overflow-hidden">
      <div className="container-custom mx-auto">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-black mb-2">
              {title}
            </h2>
            {subtitle && <p className="text-text-secondary">{subtitle}</p>}
          </div>
        </div>

        <div className="mx-[-10px]">
          <Slider key={width} {...settings}>
            {products.map((product) => (
              <div key={product?._id} className="px-[10px] h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
