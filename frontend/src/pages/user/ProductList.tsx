import { useQuery } from "@tanstack/react-query";
import type { Product } from "../../types/Product";
import { getProducts } from "../../services/api";
import ProductCard from "../../components/ProductCard";

const ProductList: React.FC = () => {
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery<Product[]>({ queryKey: ["products"], queryFn: getProducts });
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Our Products</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6 px-2">
        {products && products?.length > 0 ? (
          products?.map((product) => (
            <ProductCard key={product?._id} product={product} />
          ))
        ) : (
          <div>
            {isError}
            {isLoading && "loading"}
            No Data
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
