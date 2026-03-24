import React, { useEffect, useState } from "react";
import {
  getAllOrders,
  updateOrderStatus,
  handleReturnRequest,
} from "../../services/api";
import type { Order } from "../../types/Order";
import CustomModal from "../../components/Modal";

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders(page);
      setOrders(data.orders);
      setPage(data.page);
      setTotalPages(data.pages);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    if (!window.confirm(`Update status to ${status}?`)) return;
    try {
      await updateOrderStatus(id, status);
      fetchOrders();
      if (selectedOrder && selectedOrder._id === id) {
        setIsDetailsOpen(false); // Close modal on update
      }
    } catch (error) {
      alert("Error updating status");
    }
  };

  const handleReturnAction = async (
    id: string,
    status: "Approved" | "Rejected",
  ) => {
    if (!window.confirm(`${status} return request?`)) return;
    try {
      await handleReturnRequest(id, status);
      fetchOrders();
      if (selectedOrder && selectedOrder._id === id) {
        setIsDetailsOpen(false);
      }
    } catch (error) {
      alert("Error handling return");
    }
  };

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  if (loading && orders.length === 0) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Order Management</h1>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">User</th>
              <th className="p-3">Date</th>
              <th className="p-3">Total</th>
              <th className="p-3">Paid</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-mono text-sm">
                  {order._id.substring(order._id.length - 6).toUpperCase()}
                </td>
                <td className="p-3">{(order.user as any)?.name || "N/A"}</td>
                <td className="p-3">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3">${order.totalPrice.toFixed(2)}</td>
                <td className="p-3">
                  <span
                    className={
                      order.isPaid ? "text-green-600 font-bold" : "text-red-600"
                    }
                  >
                    {order.isPaid ? "Yes" : "No"}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs text-white ${
                      order.status === "Delivered"
                        ? "bg-green-500"
                        : order.status === "Cancelled"
                          ? "bg-red-500"
                          : order.status === "Returned"
                            ? "bg-gray-500"
                            : order.status === "Shipped"
                              ? "bg-indigo-500"
                              : "bg-blue-500"
                    }`}
                  >
                    {order.status}
                  </span>
                  {order.returnStatus === "Requested" && (
                    <span className="ml-2 px-2 py-1 rounded text-xs bg-orange-500 text-white animate-pulse">
                      Return Req
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => openDetails(order)}
                    className="text-blue-600 hover:underline mr-2"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-3 py-1">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Order Details Modal */}
      <CustomModal open={isDetailsOpen} onClose={() => setIsDetailsOpen(false)}>
        <div className="p-4 w-[600px] max-h-[80vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Order Details</h2>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="text-gray-500 hover:text-black"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p>
                    <strong>ID:</strong> {selectedOrder._id}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>User:</strong> {(selectedOrder.user as any)?.name} (
                    {(selectedOrder.user as any)?.email})
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Address:</strong>
                  </p>
                  <p>
                    {selectedOrder.shippingAddress.addressLine1},{" "}
                    {selectedOrder.shippingAddress.city}
                  </p>
                  <p>
                    {selectedOrder.shippingAddress.state},{" "}
                    {selectedOrder.shippingAddress.postalCode}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {selectedOrder.shippingAddress.phone}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-bold mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between border-b pb-1"
                    >
                      <span>
                        {item.name} (x{item.quantity})
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="text-right font-bold mt-2">
                  Total: ${selectedOrder.totalPrice.toFixed(2)}
                </div>
              </div>

              {/* Status Management */}
              <div className="border-t pt-4">
                <h3 className="font-bold mb-2">Manage Status</h3>

                {/* Standard Flow */}
                <div className="flex gap-2 mb-4">
                  {selectedOrder.status === "Processing" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(selectedOrder._id, "Shipped")
                      }
                      className="bg-indigo-600 text-white px-3 py-1 rounded"
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {selectedOrder.status === "Shipped" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(selectedOrder._id, "Delivered")
                      }
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>

                {/* Return Request Handling */}
                {selectedOrder.returnStatus === "Requested" && (
                  <div className="bg-orange-50 p-3 rounded border border-orange-200">
                    <p className="font-bold text-orange-800 mb-1">
                      Return Requested
                    </p>
                    <p className="text-sm mb-2">
                      Reason: {selectedOrder.returnReason}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleReturnAction(selectedOrder._id, "Approved")
                        }
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Approve Return (Refund)
                      </button>
                      <button
                        onClick={() =>
                          handleReturnAction(selectedOrder._id, "Rejected")
                        }
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {selectedOrder.status === "Cancelled" && (
                  <p className="text-red-600">
                    Order Cancelled. Reason: {selectedOrder.cancelReason}
                  </p>
                )}
                {selectedOrder.status === "Returned" && (
                  <p className="text-gray-600">Order Returned.</p>
                )}
              </div>
            </>
          )}
        </div>
      </CustomModal>
    </div>
  );
};

export default OrderManagement;
