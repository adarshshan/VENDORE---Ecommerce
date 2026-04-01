import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../../store/useStore";
import { getMyOrders } from "../../services/api";
import type { Order } from "../../types/Order";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PaymentsIcon from "@mui/icons-material/Payments";
import Loading from "../../components/Loading";
import Pagination from "../../components/Pagination";

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useStore();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const data = await getMyOrders(page);
        setOrders(data.orders);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
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

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background py-12 px-[1rem] lg:px-[8rem] xl:px-[20rem]">
      <div className="container-custom ">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-black text-white mb-2">
            Order History
          </h1>
          <p className="text-text-secondary">
            Track and manage your recent purchases.
          </p>
        </div>

        {orders?.length === 0 ? (
          <div className="card bg-surface p-16 text-center max-w-2xl mx-auto border-dashed">
            <div className="bg-surface-light w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <LocalMallIcon
                sx={{ fontSize: 40, color: "var(--color-text-muted)" }}
              />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">
              No orders found
            </h2>
            <p className="text-text-secondary mb-8">
              It looks like you haven't placed any orders yet. Start exploring
              our premium collection.
            </p>
            <Link to="/products" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="w-full md:w-[80%] grid grid-cols-1 gap-3 sm:gap-6">
            {orders?.map((order) => (
              <div
                key={`order-${order?._id}`}
                onClick={() => navigate(`/orders/${order?._id}`)}
                className="card bg-surface p-3 sm:p-4 hover:border-accent/30 transition-all cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-1 sm:space-y-3 flex-grow">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-lg font-bold text-white uppercase tracking-tighter">
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
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
                        <span className="font-bold text-white">
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
                      {order?.items.slice(0, 4).map((item, idx) => (
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
                          +{order?.items?.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
