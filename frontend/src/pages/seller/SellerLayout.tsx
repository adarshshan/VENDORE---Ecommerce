import React, { useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { isSellerAuthenticated, sellerLogout } from "../../services/sellerApi";
import InventoryIcon from "@mui/icons-material/Inventory";
import ListAltIcon from "@mui/icons-material/ListAlt";
import LogoutIcon from "@mui/icons-material/Logout";

const SellerLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isSellerAuthenticated()) {
      navigate("/seller-login");
    }
  }, [navigate]);

  const handleLogout = () => {
    sellerLogout();
    navigate("/seller-login");
  };

  const menuItems = [
    {
      name: "Inventory",
      path: "/seller/inventory",
      icon: <InventoryIcon fontSize="small" />,
    },
    {
      name: "Orders",
      path: "/seller/orders",
      icon: <ListAltIcon fontSize="small" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-surface border-b border-border shadow-sm">
        <div className="container-custom h-16 flex items-center justify-between px-4 sm:px-8">
          <Link
            to="/seller/inventory"
            className="text-xl font-serif font-black text-text-primary tracking-tight"
          >
            ThreadCo{" "}
            <span className="text-accent text-sm font-sans font-bold uppercase ml-1">
              Seller
            </span>
          </Link>

          <nav className="flex items-center gap-4 sm:gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors ${
                  location.pathname === item.path
                    ? "text-accent"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-error/70 hover:text-error transition-colors ml-4 sm:ml-8"
            >
              <LogoutIcon fontSize="small" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-4 sm:py-8 px-4 sm:px-8 animate-in fade-in duration-500">
        <Outlet />
      </main>
    </div>
  );
};

export default SellerLayout;
