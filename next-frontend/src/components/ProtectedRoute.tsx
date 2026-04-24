"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/src/store/useStore";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, _hasHydrated } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && !user) {
      router.replace("/login");
    }
  }, [user, _hasHydrated, router]);

  if (!_hasHydrated) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
