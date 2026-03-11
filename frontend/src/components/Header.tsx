import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";

const Header: React.FC = () => {
  const user = useStore((state) => state.user);

  return (
    <header className="bg-pink-500 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          KIDS-OWN
        </Link>
        <nav className="space-x-4">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/products" className="hover:underline">
            Products
          </Link>
          <Link to="/cart" className="hover:underline">
            Cart
          </Link>
          {user ? (
            <span className="font-semibold">{user.name}</span>
          ) : (
            <Link to="/login" className="hover:underline">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
