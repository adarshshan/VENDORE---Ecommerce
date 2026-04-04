import React from "react";
import { type Product } from "../types/Product";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const addToCart = useStore((state) => state.addToCart);
  const openAddToCartModal = useStore((state) => state.openAddToCartModal);
  const wishlist = useStore((state) => state.wishlist);
  const addToWishlist = useStore((state) => state.addToWishlist);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);

  const isInWishlist = wishlist.some((item) => item._id === product._id);

  const isOutOfStock = product?.hasSizes
    ? (product.sizes?.reduce((acc, s) => acc + s.stock, 0) ?? 0) <= 0
    : (product?.stock ?? 0) <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error("Product is out of stock");
      return;
    }

    if (product.hasSizes) {
      // If it has sizes, navigate to details to pick a size instead of adding random one
      navigate(`/product/${product?._id}`);
      toast("Please select a size", { icon: "📏" });
      return;
    }

    addToCart(product);
    openAddToCartModal(product);
    toast.success("Added to cart!");
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isInWishlist) {
        await removeFromWishlist(product._id as string);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(product);
        toast.success("Added to wishlist!");
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product?._id}`)}
      className={`card card-hover group flex flex-col cursor-pointer relative h-full bg-surface ${isOutOfStock ? "opacity-75" : ""}`}
    >
      <div className="relative overflow-hidden aspect-[3/4]">
        <img
          src={product?.images?.[0] as string}
          alt={product?.name}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? "grayscale" : ""}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Status Badge */}
        {isOutOfStock ? (
          <span className="text-[.7rem] absolute top-3 left-3 badge bg-error text-white border-none shadow-lg px-2 rounded-2xl z-10">
            Out of Stock
          </span>
        ) : product?.category ? (
          <span className="text-[.7rem] absolute top-3 left-3 badge bg-accent text-text-inverse border-none shadow-lg px-2 rounded-2xl z-10">
            {typeof product?.category === "object"
              ? product?.category?.name
              : "Category"}
          </span>
        ) : null}

        {/* Wishlist Toggle Button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-1 sm:top-3 right-1 sm:right-3 p-1 sm:p-2 rounded-full bg-surface/20 backdrop-blur-md border border-border/20 text-text-primary hover:bg-surface hover:text-error transition-all duration-300 z-10"
        >
          {isInWishlist ? (
            <FavoriteIcon fontSize="small" className="text-error" />
          ) : (
            <FavoriteBorderIcon fontSize="small" />
          )}
        </button>

        {/* Quick Action Button overlay */}
        {!isOutOfStock && (
          <div className="absolute bottom-4 right-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleAddToCart}
              className="bg-accent text-text-inverse p-3 rounded-full shadow-lg hover:bg-accent-hover transition-colors"
            >
              <AddShoppingCartIcon fontSize="small" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col p-2 sm:px-5">
        <h3 className="text-lg font-bold truncate mb-1 text-text-primary group-hover:text-accent transition-colors capitalize">
          {product?.name}
        </h3>
        <p className="text-sm text-text-secondary line-clamp-2 mb-1 sm:mb-4 leading-relaxed flex-grow capitalize">
          {product?.description}
        </p>

        <div className="mt-auto flex justify-between items-center pt-1 sm:pt-4 border-t border-border">
          <p className="text-xl font-bold text-text-primary">
            ₹{product?.price.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
