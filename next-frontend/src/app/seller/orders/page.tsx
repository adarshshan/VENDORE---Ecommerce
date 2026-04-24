"use client";
import React, { useState, useEffect } from "react";
import { getSellerOrders, bookSellerOrder } from "@/src/services/sellerApi";
import Loading from "@/src/components/Loading";
import Pagination from "@/src/components/Pagination";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("All"); // All, Not Booked, Booked

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const params: any = {
        page: currentPage,
        limit: 10,
      };

      if (activeTab === "Booked") params.isBooked = "true";
      if (activeTab === "Not Booked") params.isBooked = "false";

      const data = await getSellerOrders(params);
      setOrders(data.orders);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error fetching orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, activeTab]);

  const handleBook = async (id: string) => {
    try {
      await bookSellerOrder(id);
      fetchOrders();
    } catch (err) {
      alert("Failed to book order");
    }
  };

  if (loading && currentPage === 1) return <Loading />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between sm:gap-6">
        <h1 className="text-3xl font-serif font-black text-text-primary">
          Orders
        </h1>

        {/* Booking Tabs */}
        <div className="flex bg-surface p-1 rounded-2xl border border-border">
          {["All", "Not Booked", "Booked"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? "bg-accent text-white shadow-md shadow-accent/10"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order._id}
              className={`bg-surface border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow ${order.sellerBooked ? "border-success/30 bg-success/[0.02]" : ""}`}
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="space-y-4 flex-grow">
                  <div className="flex items-center justify-between lg:justify-start lg:gap-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        Order ID
                      </p>
                      <p className="text-sm font-black text-text-primary">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        Date
                      </p>
                      <p className="text-sm text-text-secondary">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        Status
                      </p>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-warning/10 text-warning`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        Booking
                      </p>
                      {order.sellerBooked ? (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-success/10 text-success">
                          Booked ✅
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-surface-light border border-border text-text-muted">
                          Not Booked
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        Items
                      </p>
                      {!order.sellerBooked && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-error/10 text-error animate-pulse">
                          Pending Packing
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-surface-light/50 p-3 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-12 rounded bg-surface border border-border overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-text-primary">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-text-muted">
                                {item.size && `Size: ${item.size}`}{" "}
                                {item.color && `| Color: ${item.color}`}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs font-black text-accent">
                            x{item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:w-64 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-6 gap-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                      Customer
                    </p>
                    <p className="text-sm font-bold text-text-primary">
                      {order.user?.name || "Guest User"}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {order.user?.email}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {!order.sellerBooked ? (
                      <button
                        onClick={() => handleBook(order._id)}
                        className="w-full flex items-center justify-center gap-2 bg-accent text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg shadow-accent/20"
                      >
                        <BookmarkBorderIcon fontSize="small" />
                        Mark as Booked
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full flex items-center justify-center gap-2 bg-success/20 text-success py-3 rounded-xl text-xs font-bold uppercase tracking-widest cursor-default"
                      >
                        <BookmarkIcon fontSize="small" />
                        Booked ✅
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-surface border border-border rounded-3xl py-20 text-center">
            <p className="text-text-muted font-bold">No orders found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default Orders;

