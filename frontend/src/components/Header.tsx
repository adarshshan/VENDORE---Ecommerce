import { Link, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../store/useStore";
import { IconButton } from "@mui/material";
import { useState } from "react";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DropdownMenu from "./DropdownMenu";
import HeaderDrawer from "./HeaderDrawer";
import ThemeToggle from "./ThemeToggle";

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "Contact Support", path: "/contact" },
    { label: "Returns & Exchanges", path: "/return&exchange" },
  ];

  return (
    <header className="bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-all duration-300 px-[1rem] sm:px-[5rem]">
      <div className="container-custom py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* <div className="md:hidden">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              className="!text-text-primary"
            >
              <MenuIcon />
            </IconButton>
          </div> */}
          <Link
            to="/"
            className="text-2xl md:text-3xl font-serif font-black text-[var(--color-text-Header)] tracking-tighter  hover:text-accent transition-colors"
          >
            VENDORA
          </Link>
        </div>

        <nav className="flex items-center gap-8">
          <div className="hidden md:flex gap-8">
            {navItems?.slice(0, 2).map((item) => (
              <Link
                key={item?.label}
                to={item?.path}
                className={`text-sm font-bold uppercase tracking-wider transition-all duration-200 hover:text-accent ${
                  location.pathname === item?.path
                    ? "text-accent"
                    : "text-text-secondary"
                }`}
              >
                {item?.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <IconButton
              onClick={() => navigate("/wishlist")}
              className="text-text-secondary hover:text-accent transition-colors relative !hidden md:!block"
            >
              <FavoriteIcon className="text-text-primary" />
              {wishlist?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-text-primary text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {wishlist?.length}
                </span>
              )}
            </IconButton>
            <IconButton
              onClick={() => navigate("/cart")}
              className="text-text-secondary hover:text-accent transition-colors relative !hidden md:!block"
            >
              <ShoppingCartIcon className="text-text-primary" />
              {cart?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-text-inverse text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cart?.length}
                </span>
              )}
            </IconButton>
            <ThemeToggle />
            <div className="w-px h-6 bg-border hidden md:block"></div>
            <div className="hidden md:block">
              <DropdownMenu />
            </div>
          </div>
        </nav>
      </div>

      {/* for mobile screens */}
      <HeaderDrawer
        mobileOpen={mobileOpen}
        navItems={navItems}
        handleDrawerToggle={handleDrawerToggle}
      />
    </header>
  );
};

export default Header;
