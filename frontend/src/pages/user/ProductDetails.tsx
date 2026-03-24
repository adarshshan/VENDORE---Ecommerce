import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "../../types/Product";
import { getProductsById } from "../../services/api";
import { useStore } from "../../store/useStore";

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
    if (product?.images?.[0]) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  if (isLoading) return <div className="text-center py-20">Loading...</div>;
  if (isError || !product) return <div className="text-center py-20 text-red-500">Product not found</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col gap-4 md:w-1/2">
          <Zoom>
            <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
          </Zoom>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images?.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} thumbnail ${index}`}
                className={`w-20 h-20 object-cover rounded cursor-pointer border-2 transition-colors ${
                  selectedImage === image ? "border-pink-500" : "border-transparent hover:border-pink-200"
                }`}
                onClick={() => setSelectedImage(image)}
              />
            ))}
          </div>
        </div>
        
        <div className="flex-1 space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h2>
            <p className="text-2xl font-semibold text-pink-600">${product.price.toFixed(2)}</p>
          </div>
          
          <div className="prose text-gray-600">
            <p>{product.description}</p>
          </div>

          <div className="pt-4">
            <button 
              onClick={() => addToCart(product)}
              className="w-full md:w-auto px-8 py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
