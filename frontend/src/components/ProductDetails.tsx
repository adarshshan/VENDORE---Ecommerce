import { useParams } from "react-router-dom";
import products from "../data/products.json";

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="container mx-auto py-8 text-center">
        Product not found
      </div>
    );
  }
  const getImageUrl = (name: string) =>
    new URL(`../assets/testingImages/${name}`, import.meta.url).href;

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="w-full md:w-1/2 h-96 object-cover rounded"
        />
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
