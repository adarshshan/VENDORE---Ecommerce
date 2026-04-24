"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import { useStore } from "@/src/store/useStore";

const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const cart = useStore((state) => state.cart);
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { label: "Home", icon: <HomeIcon />, path: "/" },
    { label: "Products", icon: <ShoppingBagIcon />, path: "/products" },
    { label: "Cart", icon: <ShoppingCartIcon />, path: "/cart", badge: cartItemsCount },
    { label: "Profile", icon: <PersonIcon />, path: "/profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                isActive ? "text-accent" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-accent text-text-inverse text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

