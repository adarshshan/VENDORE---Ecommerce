import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import MobileBottomNav from "../components/MobileBottomNav";
import AddToCartModal from "../components/AddToCartModal";
import { useStore } from "../store/useStore";

const AppLayout = () => {
  const hasHydrated = useStore((state) => state._hasHydrated);
  const isAddToCartModalOpen = useStore((state) => state.isAddToCartModalOpen);
  const lastAddedProduct = useStore((state) => state.lastAddedProduct);
  const lastAddedSize = useStore((state) => state.lastAddedSize);
  const closeAddToCartModal = useStore((state) => state.closeAddToCartModal);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow sm:pb-16 md:pb-0">
        <Outlet />
      </main>
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
};

export default AppLayout;
