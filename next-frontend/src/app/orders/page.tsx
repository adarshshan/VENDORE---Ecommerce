"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/src/store/useStore";
import { getMyOrders } from "@/src/services/api";
import type { Order } from "@/src/types/Order";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PaymentsIcon from "@mui/icons-material/Payments";
import Loading from "@/src/components/Loading";
import { CircularProgress } from "@mui/material";

const MyOrders = () => {
  const { user } = useStore();
  const router = useRouter();

  // Infinite Scroll States
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastOrderElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingMore, hasMore]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        if (page === 1) setIsLoading(true);
        else setIsFetchingMore(true);

        const data = await getMyOrders(page);
        
        if (page === 1) {
          setOrders(data?.orders || []);
        } else {
          setOrders(prev => [...prev, ...(data?.orders || [])]);
        }
        
        setHasMore(data?.hasMore);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    };

    fetchOrders();
  }, [user, page]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-success/20 text-success border-success/30 px-2 rounded-md";
      case "Cancelled":
        return "bg-error/20 text-error border-error/30 px-2 rounded-md";
      case "Processing":
        return "bg-info/20 text-info border-info/30 px-2 rounded-md";
      case "Shipped":
        return "bg-accent/20 text-accent border-accent/30 px-2 rounded-md";
      default:
        return "bg-surface-light text-text-secondary border-border px-2 rounded-md";
    }
  };

  if (isLoading && page === 1) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-12 px-[1rem] lg:px-[8rem] xl:px-[20rem]">
      <div className="container-custom">
        <div className="mb-4 sm:mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-black mb-2">
            Order History
          </h1>
          <p className="text-text-secondary">
            Track and manage your recent purchases.
          </p>
        </div>

        {orders?.length === 0 && !isLoading ? (
          <div className="card bg-surface p-16 text-center max-w-2xl mx-auto border-dashed">
            <div className="bg-surface-light w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <LocalMallIcon
                sx={{ fontSize: 40, color: "var(--color-text-muted)" }}
              />
            </div>
            <h2 className="text-2xl font-serif font-bold text-text-primary mb-4">
              No orders found
            </h2>
            <p className="text-text-secondary mb-8">
              It looks like you haven't placed any orders yet. Start exploring
              our premium collection.
            </p>
            <Link href="/products" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="w-full md:w-[80%] grid grid-cols-1 gap-3 sm:gap-6">
            {orders?.map((order, index) => {
              const isLast = orders.length === index + 1;
              return (
                <div
                  key={`order-${order?._id}`}
                  ref={isLast ? lastOrderElementRef : null}
                  onClick={() => router.push(`/orders/${order?._id}`)}
                  className="card bg-surface p-3 sm:p-4 hover:border-accent/30 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col md:flex-row justify-between sm:gap-6">
                    <div className="space-y-1 sm:space-y-3 flex-grow">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-lg font-bold text-text-primary uppercase tracking-tighter">
                          Order #
                          {order?._id
                            .substring(order?._id?.length - 8)
                            .toUpperCase()}
                        </span>
                        <span
                          className={`badge border ${getStatusStyle(order?.status)}`}
                        >
                          {order?.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <CalendarTodayIcon sx={{ fontSize: 16 }} />
                          <span>
                            {new Date(order?.createdAt).toLocaleDateString(
                              undefined,
                              { dateStyle: "long" },
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <PaymentsIcon sx={{ fontSize: 16 }} />
                          <span className="font-bold text-text-primary">
                            ₹{order?.totalPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <LocalMallIcon sx={{ fontSize: 16 }} />
                          <span>
                            {order?.items?.length}{" "}
                            {order?.items?.length === 1 ? "Item" : "Items"}
                          </span>
                        </div>
                      </div>

                      {/* Preview Images */}
                      <div className="flex gap-2 pt-2">
                        {order?.items?.slice(0, 4).map((item, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-10 rounded border border-border overflow-hidden bg-surface-light"
                          >
                            <img
                              src={item?.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {order?.items?.length > 4 && (
                          <div className="w-10 h-10 rounded border border-border bg-surface-light flex items-center justify-center text-[10px] font-bold text-text-muted">
                            {order?.items?.length - 4}+
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Fetching More Loader */}
            <div className="h-20 flex items-center justify-center mt-4">
              {isFetchingMore && <CircularProgress size={24} className="!text-accent" />}
              {!hasMore && orders.length > 0 && (
                <p className="text-text-muted text-sm font-bold uppercase tracking-widest">
                  End of your order history
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;

