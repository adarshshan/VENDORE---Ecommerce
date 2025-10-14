import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "../../types/Product";
import { getProductsById } from "../../services/api";

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState<string | undefined>();

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: () => getProductsById(id ?? ""),
    enabled: !!id, // Ensure the query runs only when `id` is available
  });

  useEffect(() => {
    if (product?.images?.[0]) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">Loading...</div>;
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto py-8 text-center">
        Product not found
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4 sm:py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col gap-4 md:w-1/2">
          <Zoom>
            <div className="w-full h-96">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover rounded"
              />
            </div>
          </Zoom>
          <div className="flex gap-2">
            {product.images?.map((image, index) => (
              <img
                key={index}
                src={image as string}
                alt={`${product.name} thumbnail ${index}`}
                className={`w-20 h-20 object-cover rounded cursor-pointer ${
                  selectedImage === image ? "border-2 border-pink-500" : ""
                }`}
                onClick={() => setSelectedImage(image as string)}
              />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
          <p className="text-gray-600 mb-4">${product.price.toFixed(2)}</p>
          <p className="text-gray-700 mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <button className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
