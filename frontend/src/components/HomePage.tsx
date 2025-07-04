import { Link } from "react-router-dom";
import ProductList from "./ProductList";

const HomePage: React.FC = () => {
  return (
    <div>
      <section className="bg-pink-100 py-16">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to KIDS-OWN</h1>
          <p className="text-lg mb-6">
            Discover the cutest dresses and accessories for your kids!
          </p>
          <Link
            to="/products"
            className="bg-pink-500 text-white px-6 py-3 rounded hover:bg-pink-600"
          >
            Shop Now
          </Link>
        </div>
      </section>
      <ProductList />
    </div>
  );
};

export default HomePage;
