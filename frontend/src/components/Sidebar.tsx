import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="bg-gray-800 text-white w-64 h-screen">
      <h2 className="text-2xl font-bold mb-4 p-4">Admin Menu</h2>

      <div className="flex flex-col">
        <div
          onClick={() => navigate("/admin")}
          className={`py-2 px-3 cursor-pointer hover:bg-gray-500 hover:text-white ${
            location.pathname === "/admin" ? "bg-gray-400 text-white" : ""
          }`}
        >
          Dashboard
        </div>
        <div
          onClick={() => navigate("/admin/product-management")}
          className={`py-2 px-3 cursor-pointer hover:bg-gray-500 hover:text-white ${
            location.pathname === "/admin/product-management"
              ? "bg-gray-400 text-white"
              : ""
          }`}
        >
          Products
        </div>
        <div
          onClick={() => navigate("/admin/user-management")}
          className={`py-2 px-3 cursor-pointer hover:bg-gray-500 hover:text-white ${
            location.pathname === "/admin/user-management"
              ? "bg-gray-400 text-white"
              : ""
          }`}
        >
          Customers
        </div>
        <div
          onClick={() => navigate("/admin/order-management")}
          className={`py-2 px-3 cursor-pointer hover:bg-gray-500 hover:text-white ${
            location.pathname === "/admin/order-management"
              ? "bg-gray-400 text-white"
              : ""
          }`}
        >
          Orders
        </div>
        <div
          onClick={() => navigate("/admin/category-management")}
          className={`py-2 px-3 cursor-pointer hover:bg-gray-500 hover:text-white ${
            location.pathname === "/admin/category-management"
              ? "bg-gray-400 text-white"
              : ""
          }`}
        >
          Categories
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
