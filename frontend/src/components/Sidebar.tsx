import { useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", path: "/admin" },
    { label: "Products", path: "/admin/product-management" },
    { label: "Sellers", path: "/admin/seller-management" },
    { label: "Customers", path: "/admin/user-management" },
    { label: "Orders", path: "/admin/order-management" },
    { label: "Categories", path: "/admin/category-management" },
    { label: "Banners", path: "/admin/banner-management" },
    { label: "Contact Messages", path: "/admin/contact-management" },
  ];

  return (
    <div className="bg-surface border-r border-border text-text-primary w-64 h-screen sticky top-0 flex flex-col">
      <div className="flex justify-between items-center p-6 border-b border-border">
        <div>
          <h2 className="text-3xl font-serif font-bold ">ThreadCo</h2>
        </div>
        <div className="pb-5 ps-6">
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-col py-4 gap-1">
        {menuItems.map((item) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`py-3 px-6 cursor-pointer text-sm font-medium transition-all duration-200 border-l-4 ${
              location.pathname === item.path
                ? "bg-surface-light border-accent"
                : "border-transparent text-text-secondary hover:bg-surface-light hover:text-text-secondary"
            }`}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
