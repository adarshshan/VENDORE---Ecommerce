"use client";

import React, { useEffect, useState } from "react";
import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer";
import MobileBottomNav from "@/src/components/MobileBottomNav";
import AddToCartModal from "@/src/components/AddToCartModal";
import { useStore } from "@/src/store/useStore";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const hasHydrated = useStore((state) => state._hasHydrated);
  const isAddToCartModalOpen = useStore((state) => state.isAddToCartModalOpen);
  const lastAddedProduct = useStore((state) => state.lastAddedProduct);
  const lastAddedSize = useStore((state) => state.lastAddedSize);
  const closeAddToCartModal = useStore((state) => state.closeAddToCartModal);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !hasHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow sm:pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
      <AddToCartModal
        open={isAddToCartModalOpen}
        onClose={closeAddToCartModal}
        product={lastAddedProduct}
        selectedSize={lastAddedSize}
      />
    </div>
  );
}

