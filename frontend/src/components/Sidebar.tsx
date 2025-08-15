import React from "react";

const Sidebar: React.FC = () => {
  return (
    <div className="bg-gray-800 text-white w-64 h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Menu</h2>
      <ul>
        <li className="mb-2">
          <a href="#" className="hover:text-gray-300">
            Dashboard
          </a>
        </li>
        <li className="mb-2">
          <a href="#" className="hover:text-gray-300">
            Products
          </a>
        </li>
        <li className="mb-2">
          <a href="#" className="hover:text-gray-300">
            Orders
          </a>
        </li>
        <li className="mb-2">
          <a href="#" className="hover:text-gray-300">
            Customers
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
