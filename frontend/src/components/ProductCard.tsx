import React from "react";
import { type Product } from "../types/Product";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { IconButton } from "@mui/material";
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
      className="border border-[#e8e6e6] rounded-lg sm:shadow-md hover:shadow-lg transition flex flex-col min-h-[300px] cursor-pointer relative group bg-white"
    >
      <img
        src={product?.images?.[0] as string}
        alt={product?.name}
        className="w-full h-48 object-cover rounded-t-lg"
      />
      <div className="flex-1 flex flex-col p-4">
        <h3 className="text-lg font-semibold truncate mb-1">
          {product?.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{product?.description}</p>
        <div className="mt-auto flex justify-between items-center">
          <p className="text-pink-600 font-bold">${product?.price.toFixed(2)}</p>
          <IconButton 
            color="primary" 
            aria-label="add to shopping cart"
            onClick={handleAddToCart}
            className="hover:bg-pink-50 text-pink-500"
          >
            <AddShoppingCartIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
