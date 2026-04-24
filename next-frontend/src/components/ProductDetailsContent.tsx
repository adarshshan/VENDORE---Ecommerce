"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useQuery } from "@tanstack/react-query";
import type { Product, ProductImage } from "@/src/types/Product";
import { getProductBySlug, getRelatedProducts } from "@/src/services/api";
import { useStore } from "@/src/store/useStore";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VerifiedIcon from "@mui/icons-material/Verified";
import HistoryIcon from "@mui/icons-material/History";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Slider from "react-slick";
import Loading from "@/src/components/Loading";
import ProductCarousel from "@/src/components/ProductCarousel";
import CustomButton from "@/src/components/CustomButton";
import toast from "react-hot-toast";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { getOptimizedImage } from "@/src/utils/imageOptimizer";

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];

const ProductDetailsContent: React.FC = () => {
  const params_data = useParams();
  const slug = params_data?.slug as string;
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const addToCart = useStore((state) => state.addToCart);
  const setBuyNowItem = useStore((state) => state.setBuyNowItem);
  const openAddToCartModal = useStore((state) => state.openAddToCartModal);
  const wishlist = useStore((state) => state.wishlist);
  const addToWishlist = useStore((state) => state.addToWishlist);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery<Product>({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug ?? ""),
    enabled: !!slug,
  });

  const { data: relatedProducts = [], isLoading: isRelatedLoading } = useQuery<
    Product[]
  >({
    queryKey: ["relatedProducts", product?._id],
    queryFn: () => getRelatedProducts(product?._id as string),
    enabled: !!product?._id,
  });

  const isInWishlist = wishlist.some((item) => item?._id === product?._id);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [slug]);

  useEffect(() => {
    if (product?.images?.[0]) {
      setSelectedImage(product?.images[0]?.url);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.hasSizes && !selectedSize) {
      setSizeError(true);
      toast.error("Please select a size");
      return;
    }

    // Stock check
    if (product.hasSizes && selectedSize) {
      const sizeObj = product.sizes?.find((s) => s.size === selectedSize);
      if (!sizeObj || sizeObj.stock <= 0) {
        toast.error("Size is out of stock");
        return;
      }
    } else if (product.stock !== undefined && product.stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    setSizeError(false);
    addToCart(product, 1, selectedSize ?? undefined);
    openAddToCartModal(product, selectedSize);
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (product?.hasSizes && !selectedSize) {
      setSizeError(true);
      toast.error("Please select a size");
      return;
    }

    // Stock check
    if (product?.hasSizes && selectedSize) {
      const sizeObj = product?.sizes?.find((s) => s.size === selectedSize);
      if (!sizeObj || sizeObj?.stock <= 0) {
        toast.error("Size is out of stock");
        return;
      }
    } else if (product?.stock !== undefined && product?.stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    setSizeError(false);
    setBuyNowItem({
      ...product,
      quantity: 1,
      selectedSize: selectedSize ?? undefined,
    } as any);
    router.push("/checkout?type=buyNow");
  };

  const toggleWishlist = async () => {
    if (!product) return;
    try {
      if (isInWishlist) {
        await removeFromWishlist(product?._id as string);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(product);
        toast.success("Added to wishlist!");
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-serif font-bold text-text-primary mb-4">
          Product Not Found
        </h2>
        <p className="text-text-secondary mb-8">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <button onClick={() => router.push("/products")} className="btn-primary">
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-1 sm:pb-20">
      <div className="px-[1rem] sm:px-[20rem]">
        <div className="container-custom py-3 sm:py-8">
          {/* Breadcrumbs / Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-3 sm:mb-8 group"
          >
            <ArrowBackIcon
              fontSize="small"
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-sm font-bold uppercase tracking-widest">
              Back to Collection
            </span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-12 items-start">
            {/* Image Gallery Section */}
            <div className="space-y-4">
              <div className=" card bg-surface overflow-hidden border-border-light shadow-2xl">
                <div className="hidden sm:block">
                  <Zoom>
                    <div className="w-full aspect-square flex items-center justify-center bg-surface-light">
                      <img
                        src={getOptimizedImage(selectedImage, 800)}
                        alt={product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Zoom>
                </div>

                <div className="block sm:hidden">
                  <ImageSlider
                    images={product?.images}
                    toggleWishlist={toggleWishlist}
                    id={product?._id}
                  />
                </div>
              </div>

              {/* Thumbnails */}
              <div className="hidden sm:flex  gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product?.images?.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image?.url)}
                    className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === image?.url
                        ? "border-accent scale-95 shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                        : "border-border hover:border-border-light"
                    }`}
                  >
                    <img
                      src={getOptimizedImage(image?.url, 100)}
                      alt={`${product?.name} thumb ${index}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="flex flex-col space-y-1 sm:space-y-8">
              <div>
                <div className="flex items-center text-text-primary gap-2 mb-1 sm:mb-4">
                  <span className="badge badge-accent">New Arrival</span>
                  {product?.hasSizes ? (
                    selectedSize ? (
                      (() => {
                        const sizeStock =
                          product?.sizes?.find((s) => s.size === selectedSize)
                            ?.stock ?? 0;
                        return sizeStock > 0 ? (
                          sizeStock < 5 ? (
                            <span className="badge bg-orange-500 text-white border-none text-xs font-bold uppercase tracking-tighter px-2 rounded-md">
                              Only {sizeStock} left
                            </span>
                          ) : (
                            <span className="text-success text-xs font-bold uppercase tracking-tighter">
                              In Stock
                            </span>
                          )
                        ) : (
                          <span className="badge bg-red-500 text-text-primary border-none text-xs font-bold uppercase tracking-tighter px-2 !rounded-md">
                            Out of Stock
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-text-muted text-xs font-bold uppercase tracking-tighter">
                        Please Select a Size
                      </span>
                    )
                  ) : product?.stock && product?.stock > 0 ? (
                    product?.stock < 5 ? (
                      <span className="badge bg-orange-500 text-white border-none text-xs font-bold uppercase tracking-tighter px-2 rounded-md">
                        Only {product?.stock} left
                      </span>
                    ) : (
                      <span className="text-success text-xs font-bold uppercase tracking-tighter">
                        In Stock
                      </span>
                    )
                  ) : (
                    <span className="badge bg-red-500 text-white text-sm border-none text-xs font-bold uppercase tracking-tighter px-2 rounded-md">
                      Out of Stock
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black text-text-primary mb-4 leading-tight capitalize">
                  {product?.name}
                </h1>
                <div className="flex items-baseline gap-4 mb-4">
                  <p className="text-2xl sm:text-3xl font-bold text-text-primary">
                    ₹{product?.price.toFixed(2)}
                  </p>
                  <p className="text-text-muted line-through text-lg">
                    ₹{(product?.price * 1.2).toFixed(2)}
                  </p>
                </div>

                {/* Category Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {product?.categories && Array.isArray(product?.categories) ? (
                    product?.categories?.map((cat: any) => (
                      <button
                        key={cat?._id}
                        onClick={() =>
                          router.push(`/products?category=${cat?._id}`)
                        }
                        className="px-3 py-1 bg-surface-light border border-border rounded-full text-xs font-bold text-text-secondary hover:text-accent hover:border-accent transition-all uppercase tracking-wider"
                      >
                        {cat?.name}
                      </button>
                    ))
                  ) : product?.category ? (
                    <button
                      onClick={() =>
                        router.push(
                          `/products?category=${(product?.category as any)._id}`,
                        )
                      }
                      className="px-3 py-1 bg-surface-light border border-border rounded-full text-xs font-bold text-text-secondary hover:text-accent hover:border-accent transition-all uppercase tracking-wider"
                    >
                      {(product?.category as any)?.name}
                    </button>
                  ) : null}
                </div>
              </div>

              {product?.hasSizes && (
                <div className="bg-surface-light/50 px-3 py-2 sm:p-6 rounded-2xl border border-border backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-text-primary">
                      Select Size
                    </h3>
                    {sizeError && (
                      <span className="text-xs font-bold text-red-500 uppercase animate-pulse">
                        Please select a size
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {AVAILABLE_SIZES.map((size) => {
                      const sizeData = product?.sizes?.find(
                        (s) => s.size === size,
                      );
                      const isAvailable = sizeData && sizeData?.stock > 0;
                      const isSelected = selectedSize === size;

                      return (
                        <button
                          key={size}
                          disabled={!isAvailable}
                          onClick={() => {
                            setSelectedSize(size);
                            setSizeError(false);
                          }}
                          className={`
                            min-w-[48px] h-12 rounded-xl text-sm font-bold transition-all duration-300 border-2
                            ${
                              !isAvailable
                                ? "border-border text-text-muted opacity-30 cursor-not-allowed line-through"
                                : isSelected
                                  ? "border-accent bg-accent/10 text-accent shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                                  : "border-border text-text-primary hover:border-border-light hover:bg-surface-hover"
                            }
                          `}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-surface-light/50 p-3 sm:p-6 rounded-2xl border border-border backdrop-blur-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-3">
                  Product Description
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {product?.description ||
                    "No description available for this premium piece."}
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <CustomButton
                  onclick={handleAddToCart}
                  className="bg-surface btn-accent btn-lg flex-grow flex items-center justify-center gap-3 py-2 rounded-md cursor-pointer !text-text-primary"
                >
                  <ShoppingCartIcon />
                  Add to Cart
                </CustomButton>
                <CustomButton
                  onclick={handleBuyNow}
                  className="bg-accent text-text-inverse btn-lg flex-grow flex items-center justify-center gap-3 py-2 rounded-md cursor-pointer shadow-lg shadow-accent/20"
                >
                  <ShoppingCartIcon />
                  Buy Now
                </CustomButton>
              </div>

              {/* Features/Trust Badges */}
              <div className="grid grid-cols-3 gap-4 border-y border-border py-8">
                <div className="flex flex-col items-center text-center space-y-2">
                  <VerifiedIcon className="text-accent" />
                  <span className="text-xs font-bold text-text-primary uppercase tracking-tighter">
                    Premium Quality
                  </span>
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                  <HistoryIcon className="text-accent" />
                  <span className="text-xs font-bold text-text-primary uppercase tracking-tighter">
                    5-Day Returns
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xs text-text-muted text-center italic">
                  Secure payment options available. Fast worldwide shipping.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="sm:px-[15rem] mt-1">
        <ProductCarousel
          title="Related Products"
          subtitle="You might also like these similar items"
          products={relatedProducts}
          loading={isRelatedLoading}
        />
      </div>
    </div>
  );
};

export default ProductDetailsContent;

interface ImageSliderInterface {
  images: ProductImage[] | undefined;
  toggleWishlist: () => Promise<void>;
  id: string | number;
}
const ImageSlider: React.FC<ImageSliderInterface> = ({
  images,
  toggleWishlist,
  id,
}) => {
  const wishlist = useStore((state) => state.wishlist);
  const isInWishlist = wishlist.some((item) => item?._id === id);
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  return (
    <Slider {...settings}>
      {images &&
        images?.length > 0 &&
        images?.map((item, index) => (
          <Zoom key={index}>
            <div className="relative w-full aspect-square flex items-center justify-center bg-surface-light">
              <img
                src={getOptimizedImage(item?.url, 600)}
                alt={item?.url}
                className="w-full h-full object-cover"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist();
                }}
                className="absolute top-3 right-3 p-2 sm:p-2 rounded-full bg-surface/20 backdrop-blur-md border border-border/20 text-text-primary hover:bg-surface hover:text-error transition-all duration-300 z-10"
              >
                {isInWishlist ? (
                  <FavoriteIcon fontSize="medium" className="text-error" />
                ) : (
                  <FavoriteBorderIcon fontSize="small" />
                )}
              </button>
            </div>
          </Zoom>
        ))}
    </Slider>
  );
};
