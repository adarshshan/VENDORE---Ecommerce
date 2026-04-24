"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  getAllOrders,
  updateOrderStatus,
  handleReturnRequest,
} from "@/src/services/api";
import type { Order } from "@/src/types/Order";
import CustomModal from "@/src/components/Modal";
import { format } from "date-fns";
import { Tooltip, CircularProgress } from "@mui/material";
import Pagination from "@/src/components/Pagination";

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  const fetchOrders = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const data = await getAllOrders(pageNum, 10);
      setOrders(data?.orders || []);
      setTotalPages(data?.totalPages || 0);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(page);
  }, [page, fetchOrders]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    if (!window.confirm(`Update status to ${status}?`)) return;
    try {
      await updateOrderStatus(id, status);
      fetchOrders(page);
      if (selectedOrder && selectedOrder?._id === id) {
        setIsDetailsOpen(false); // Close modal on update
      }
    } catch (error) {
      alert("Error updating status");
    }
  };

  const handleItemReturnAction = async (
    orderId: string,
    productId: string,
    status: "Approved" | "Rejected",
  ) => {
    if (!window.confirm(`${status} return request for this item?`)) return;
    try {
      await handleReturnRequest(orderId, status, productId);
      fetchOrders(page);
      setIsDetailsOpen(false);
    } catch (error) {
      alert("Error handling return");
    }
  };

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const hasPendingReturns = (order: Order) => {
    return order?.items?.some((item) => item?.returnStatus === "Requested");
  };

  return (
    <div className="p-6 bg-background min-h-screen text-text-primary">
      <h1 className="text-3xl font-serif font-bold mb-8">Order Management</h1>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-xl">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-light/50 border-b border-border">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">
                ID
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">
                User
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">
                Date
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">
                Total
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">
                Payment
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <CircularProgress size={30} className="!text-accent" />
                </td>
              </tr>
            ) : orders?.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-text-muted font-medium"
                >
                  No orders found.
                </td>
              </tr>
            ) : (
              orders?.map((order) => (
                <tr
                  key={order?._id}
                  className="hover:bg-surface-hover/30 transition-colors group"
                >
                  <Tooltip title={order?._id}>
                    <td className="px-6 py-4 font-mono text-xs text-accent">
                      #
                      {order?._id
                        ?.substring(order?._id.length - 8)
                        .toUpperCase()}
                    </td>
                  </Tooltip>

                  <td className="px-6 py-4">
                    <div className="font-bold">
                      {(order?.user as any)?.name || "Guest"}
                    </div>
                    <div className="text-xs text-text-muted">
                      {(order?.user as any)?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {format(new Date(order?.createdAt), "dd MMM yyyy")}
                  </td>
                  <td className="px-6 py-4 font-bold text-accent">
                    ₹{order?.totalPrice.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${order?.isPaid ? "bg-success/20 text-success border border-success/30" : "bg-error/20 text-error border border-error/30"}`}
                    >
                      {order?.isPaid ? "PAID" : "UNPAID"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tighter ${
                          order?.status === "Delivered"
                            ? "bg-success text-background"
                            : order?.status === "Cancelled"
                              ? "bg-error text-white"
                              : order?.status === "Returned"
                                ? "bg-gray-400 text-black"
                                : order?.status === "Shipped"
                                  ? "bg-indigo-500 text-white"
                                  : "bg-accent text-background"
                        }`}
                      >
                        {order?.status}
                      </span>
                      {hasPendingReturns(order) && (
                        <span
                          className="flex h-2 w-2 rounded-full bg-orange-500 animate-ping"
                          title="Pending Return Request"
                        ></span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openDetails(order)}
                      className="bg-surface-light hover:bg-surface-hover px-4 py-1.5 rounded-lg text-xs font-bold border border-border transition-all active:scale-95"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Order Details Modal */}
      <CustomModal open={isDetailsOpen} onClose={() => setIsDetailsOpen(false)}>
        <div className="w-full overflow-hidden">
          {selectedOrder && (
            <div className="max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-black">
                  Order Details
                </h2>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="text-text-secondary hover:text-text-secondary transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                    Order ID
                  </p>
                  <p className="text-sm font-mono text-accent">
                    {selectedOrder._id}
                  </p>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-3">
                    Customer
                  </p>
                  <p className="text-sm font-bold">
                    {(selectedOrder?.user as any)?.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {(selectedOrder?.user as any)?.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                    Shipping Address
                  </p>
                  <p className="text-xs text-text-secondary">
                    {selectedOrder?.shippingAddress?.addressLine1},{" "}
                    {selectedOrder?.shippingAddress?.city}
                    <br />
                    {selectedOrder?.shippingAddress?.state},{" "}
                    {selectedOrder?.shippingAddress?.postalCode}
                    <br />
                    <span className="font-bold">
                      Phone: {selectedOrder?.shippingAddress?.phone}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4 border-b border-border pb-2">
                  Order Items
                </h3>
                <div className="space-y-4">
                  {selectedOrder?.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-surface-light/30 p-4 rounded-xl border border-border/50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold">{item?.name}</p>
                          <p className="text-xs text-text-secondary">
                            Qty: {item?.quantity} | Size: {item?.size || "N/A"}{" "}
                            | Price: ₹{item?.price}
                          </p>
                        </div>
                        <p className="font-bold text-accent">
                          ₹{(item?.price * item?.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Item Return Handling */}
                      {item?.returnStatus === "Requested" && (
                        <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">
                            Return Requested
                          </p>
                          <p className="text-xs mb-3">
                            Reason:{" "}
                            <span className="font-bold">
                              {item?.returnReason}
                            </span>
                            {item?.customReturnReason && (
                              <span className="block mt-1 italic text-text-muted">
                                "{item?.customReturnReason}"
                              </span>
                            )}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleItemReturnAction(
                                  selectedOrder?._id,
                                  item?.product?.toString(),
                                  "Approved",
                                )
                              }
                              className="bg-success hover:bg-success/80 text-background px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleItemReturnAction(
                                  selectedOrder?._id,
                                  item?.product?.toString(),
                                  "Rejected",
                                )
                              }
                              className="bg-error hover:bg-error/80 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                      {item?.returnStatus &&
                        item?.returnStatus !== "None" &&
                        item?.returnStatus !== "Requested" && (
                          <p
                            className={`text-[10px] font-black uppercase mt-2 ${item?.returnStatus === "Approved" ? "text-success" : "text-error"}`}
                          >
                            Return {item?.returnStatus}
                          </p>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              {/* General Status Management */}
              <div className="border-t border-border pt-6">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4">
                  Update Order Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder?.status === "Processing" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(selectedOrder?._id, "Shipped")
                      }
                      className="bg-accent text-background px-6 py-2 rounded-xl text-xs font-black uppercase hover:opacity-90 transition-all"
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {selectedOrder?.status === "Shipped" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(selectedOrder?._id, "Delivered")
                      }
                      className="bg-success text-background px-6 py-2 rounded-xl text-xs font-black uppercase hover:opacity-90 transition-all"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  {selectedOrder?.status === "Cancelled" && (
                    <div className="w-full p-4 bg-error/10 border border-error/20 rounded-xl">
                      <p className="text-error text-xs font-bold italic">
                        This order was cancelled by the user.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CustomModal>
    </div>
  );
};

export default OrderManagement;

