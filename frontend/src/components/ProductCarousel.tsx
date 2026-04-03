import React from "react";
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
  const settings = {
    dots: false,
    infinite: products?.length > 4,
    speed: 500,
    slidesToShow: 2, // ✅ mobile first
    slidesToScroll: 1,
    initialSlide: 0,
    adaptiveHeight: false,
    responsive: [
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 1280,
        settings: { slidesToShow: 4 },
      },
      {
        breakpoint: 1440,
        settings: { slidesToShow: 6 },
      },
      {
        breakpoint: 1536,
        settings: { slidesToShow: 7 },
      },
      {
        breakpoint: 2668,
        settings: { slidesToShow: 8 },
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
          <Slider {...settings}>
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
