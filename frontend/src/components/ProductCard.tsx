import React from "react";
import { type Product } from "../types/Product";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const addToCart = useStore((state) => state.addToCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div
      onClick={() => navigate(`/product/${product?._id}`)}
      className="card card-hover group flex flex-col cursor-pointer relative h-full bg-surface"
    >
      <div className="relative overflow-hidden aspect-[3/4]">
        <img
          src={product?.images?.[0] as string}
          alt={product?.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Quick Action Button overlay */}
        <div className="absolute bottom-4 right-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleAddToCart}
            className="bg-white text-black p-3 rounded-full shadow-lg hover:bg-accent hover:text-white transition-colors"
          >
            <AddShoppingCartIcon fontSize="small" />
          </button>
        </div>
      </div>

      {product?.category && (
        <span className="absolute top-3 left-3 badge badge-primary shadow-lg backdrop-blur-sm bg-white/90 px-2 rounded-2xl">
          {" "}
          {typeof product?.category === "object"
            ? product?.category?.name
            : "Category"}
        </span>
      )}

      <div className="flex-1 flex flex-col p-2 sm:p-5">
        <h3 className="text-lg font-bold truncate mb-1 text-white group-hover:text-accent transition-colors capitalize">
          {product?.name}
        </h3>
        <p className="text-sm text-text-secondary line-clamp-2 mb-4 leading-relaxed flex-grow capitalize">
          {product?.description}
        </p>

        <div className="mt-auto flex justify-between items-center pt-2 sm:pt-4 border-t border-border">
          <p className="text-xl font-bold text-white">
            ₹{product?.price.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
