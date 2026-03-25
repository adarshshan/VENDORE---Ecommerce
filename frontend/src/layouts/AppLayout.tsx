import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useStore } from "../store/useStore";

const AppLayout = () => {
  const hasHydrated = useStore((state) => state._hasHydrated);

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
      <main className="flex-grow ">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
