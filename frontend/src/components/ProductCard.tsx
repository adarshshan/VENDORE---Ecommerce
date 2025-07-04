import { Link } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const getImageUrl = (name: string) =>
    new URL(`../assets/testingImages/${name}`, import.meta.url).href;

  return (
    <div className="border rounded-lg p-4 shadow-md hover:shadow-lg transition">
      <img
        src={getImageUrl(product.image)}
        alt={product.name}
        className="w-full h-48 object-cover rounded"
      />
      <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
      <p className="text-gray-600">${product.price.toFixed(2)}</p>
      <Link
        to={`/product/${product.id}`}
        className="mt-2 inline-block bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
      >
        View Details
      </Link>
    </div>
  );
};

export default ProductCard;
