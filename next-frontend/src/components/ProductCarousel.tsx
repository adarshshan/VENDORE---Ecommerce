"use client";
import React, { useRef, useState, useEffect } from "react";
import { type Product } from "@/src/types/Product";
import ProductCard from "@/src/components/ProductCard";
import Loading from "@/src/components/Loading";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      // Update arrows
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

      // Update index: Calculate which item is currently in view
      // We use the center of the viewport to determine the current item
      const itemWidth = scrollRef.current.firstElementChild?.clientWidth || 0;
      if (itemWidth > 0) {
        const newIndex = Math.round(scrollLeft / itemWidth) + 1;
        setCurrentIndex(Math.min(newIndex, products.length));
      }
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", updateScrollState);
      // Initial check
      updateScrollState();

      // Recalculate on window resize
      window.addEventListener("resize", updateScrollState);
    }
    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", updateScrollState);
      }
      window.removeEventListener("resize", updateScrollState);
    };
  }, [products.length]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (loading) return <Loading className="min-h-28 sm:min-h-screen" />;
  if (products?.length === 0) return null;

  return (
    <section className="sm:py-8 px-[1rem] sm:px-[5rem] bg-background">
      <div className="container-custom mx-auto">
        <div className="flex justify-between items-end mb-3 sm:mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-black mb-2">
              {title}
            </h2>
            {subtitle && <p className="text-text-secondary">{subtitle}</p>}
          </div>

          {/* Desktop Navigation Arrows */}
          <div className="hidden sm:flex gap-3">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-3 rounded-full border transition-all duration-300 ${
                canScrollLeft
                  ? "border-accent text-accent hover:bg-accent hover:text-text-inverse cursor-pointer"
                  : "border-border text-text-muted opacity-50 cursor-not-allowed"
              }`}
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-3 rounded-full border transition-all duration-300 ${
                canScrollRight
                  ? "border-accent text-accent hover:bg-accent hover:text-text-inverse cursor-pointer"
                  : "border-border text-text-muted opacity-50 cursor-not-allowed"
              }`}
            >
              <ArrowForwardIosIcon fontSize="small" />
            </button>
          </div>
        </div>

        <div className="relative group">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {products?.map((product) => (
              <div
                key={product?._id}
                className="flex-none w-[calc(40%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] xl:w-[calc(16.666%-14px)] 2xl:w-[calc(14.28%-14px)] snap-start h-full"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Position Indicator */}
        <div className="mt-2 sm:mt-6 flex flex-col items-center gap-2">
          <div className="text-sm font-bold tracking-widest text-text-secondary uppercase">
            <span className="text-accent text-lg">{currentIndex}</span>
            <span className="mx-2 text-border">/</span>
            <span>{products?.length}</span>
          </div>

          {/* Progress Bar Style Indicator */}
          <div className="w-32 h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${(currentIndex / products.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;

