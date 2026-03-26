import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "../../types/Product";
import { getProductsById } from "../../services/api";
import { useStore } from "../../store/useStore";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VerifiedIcon from "@mui/icons-material/Verified";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import HistoryIcon from "@mui/icons-material/History";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Slider from "react-slick";
import Loading from "../../components/Loading";

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const addToCart = useStore((state) => state.addToCart);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: () => getProductsById(id ?? ""),
    enabled: !!id,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (product?.images?.[0]) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-serif font-bold text-white mb-4">
          Product Not Found
        </h2>
        <p className="text-text-secondary mb-8">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <button onClick={() => navigate("/products")} className="btn-primary">
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 px-[1rem] sm:px-[5rem]">
      <div className="container-custom py-8">
        {/* Breadcrumbs / Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-8 group"
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
                      src={selectedImage}
                      alt={product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Zoom>
              </div>

              <div className="block sm:hidden">
                <ImageSlider images={product.images}></ImageSlider>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="hidden sm:flex  gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    selectedImage === image
                      ? "border-accent scale-95 shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                      : "border-border hover:border-border-light"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumb ${index}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="flex flex-col space-y-8">
            <div>
              <div className="flex items-center text-[var(--color-text-light)] gap-2 mb-4">
                <span className="badge badge-accent">New Arrival</span>
                <span className="text-text-muted text-xs font-bold uppercase tracking-tighter">
                  In Stock
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-black text-[var(--color-text-light)] mb-4 leading-tight capitalize">
                {product?.name}
              </h1>
              <div className="flex items-baseline gap-4">
                <p className="text-3xl font-bold text-white">
                  ₹{product?.price.toFixed(2)}
                </p>
                <p className="text-text-muted line-through text-lg">
                  ₹{(product?.price * 1.2).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-surface-light/50 p-6 rounded-2xl border border-border backdrop-blur-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-3">
                Product Description
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {product?.description ||
                  "No description available for this premium piece."}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => addToCart(product)}
                className="bg-white btn-accent btn-lg flex-grow flex items-center justify-center gap-3 py-2 rounded-md cursor-pointer"
              >
                <ShoppingCartIcon />
                Add to Cart
              </button>
              <button className="bg-red-400 btn-outline btn-lg flex-grow py-2 rounded-md cursor-pointer">
                <FavoriteIcon />
                Add to Wishlist
              </button>
            </div>

            {/* Features/Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-border py-8">
              <div className="flex flex-col items-center text-center space-y-2">
                <VerifiedIcon className="text-accent" />
                <span className="text-xs font-bold text-white uppercase tracking-tighter">
                  Premium Quality
                </span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <LocalShippingIcon className="text-accent" />
                <span className="text-xs font-bold text-white uppercase tracking-tighter">
                  Free Shipping
                </span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <HistoryIcon className="text-accent" />
                <span className="text-xs font-bold text-white uppercase tracking-tighter">
                  14-Day Returns
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
  );
};

export default ProductDetails;

interface ImageSliderInterface {
  images: string[] | undefined;
}
const ImageSlider: React.FC<ImageSliderInterface> = ({ images }) => {
  var settings = {
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
            <div className="w-full aspect-square flex items-center justify-center bg-surface-light">
              <img
                src={item}
                alt={item}
                className="w-full h-full object-cover"
              />
            </div>
          </Zoom>
        ))}
    </Slider>
  );
};
