import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, cancelOrder } from "../../services/api";
import type { Order } from "../../types/Order";
import CustomModal from "../../components/Modal";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payments";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import Loading from "../../components/Loading";
import CustomButton from "../../components/CustomButton";

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const cancellationReasons = [
    "Ordered by mistake",
    "Delivery takes too long",
    "Found better price elsewhere",
    "Changed my mind",
    "Wrong Devlivery address entered",
    "Others",
  ];

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const fetchOrder = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching order");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!id) return;
    const finalReason =
      selectedReason === "Others" ? customReason : selectedReason;
    if (!finalReason) return;

    try {
      setActionLoading(true);
      await cancelOrder(id, finalReason);
      setIsCancelOpen(false);
      setSelectedReason("");
      setCustomReason("");
      fetchOrder();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error cancelling order");
    } finally {
      setActionLoading(false);
    }
  };

  const isCancelEligible = (order: Order) => {
    if (
      order.status === "Shipped" ||
      order.status === "Delivered" ||
      order.status === "Cancelled" ||
      order.status === "Returned"
    ) {
      return false;
    }
    const orderDate = new Date(order.createdAt);
    const diffTime = Math.abs(Date.now() - orderDate.getTime());
    const diffHours = diffTime / (1000 * 60 * 60);
    return diffHours <= 24;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Delivered":
        return "badge-accent rounded-md";
      case "Cancelled":
        return "bg-error/20 text-error border border-error/30 rounded-md";
      case "Processing":
        return "bg-info/20 text-info border border-info/30 rounded-md";
      case "Shipped":
        return "bg-accent/20 text-accent border border-accent/30 rounded-md";
      default:
        return "badge-outline rounded-md";
    }
  };

  if (loading) return <Loading />;

  if (error || !order)
    return (
      <div className="min-h-screen bg-background py-20 text-center container-custom px-[1rem] sm:px-[5rem]">
        <h2 className="text-3xl font-serif font-bold text-text-primary mb-4">
          Oops! {error || "Order not found"}
        </h2>
        <button
          onClick={() => navigate("/orders")}
          className="btn-primary mt-4"
        >
          Back to My Orders
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-background pb-20 px-[1rem] sm:px-[5rem]">
      <div className="container-custom py-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-8 group"
          >
            <ArrowBackIcon
              fontSize="small"
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-sm font-bold uppercase tracking-widest">
              Back to Orders
            </span>
          </button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-serif font-black text-text-primary">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-text-secondary">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString(undefined, {
                  dateStyle: "long",
                })}
              </p>
            </div>
            <span
              className={`badge px-4 py-1.5 text-sm ${getStatusStyle(order.status)}`}
            >
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Order Items */}
              <div className="card bg-surface p-3 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingBagIcon className="text-accent" />
                  <h3 className="text-xl font-bold text-text-primary">
                    Order Items
                  </h3>
                </div>
                <div className="space-y-6">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-6 items-center border-b border-border pb-6 last:border-0 last:pb-0 group"
                    >
                      <div className="w-20 h-24 bg-surface-light rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-lg font-bold text-text-primary mb-1 truncate">
                          {item.name}
                        </h4>
                        <div className="flex flex-wrap gap-3 text-sm text-text-muted">
                          <span>
                            Qty:{" "}
                            <span className="text-text-primary font-medium">
                              {item.quantity}
                            </span>
                          </span>
                          {item.size && (
                            <span>
                              Size:{" "}
                              <span className="text-text-primary font-medium">
                                {item.size}
                              </span>
                            </span>
                          )}
                          {item.color && (
                            <span>
                              Color:{" "}
                              <span className="text-text-primary font-medium">
                                {item.color}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-accent">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-text-muted">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Notifications */}
              {(order.status === "Cancelled" || order.returnStatus) && (
                <div className="space-y-2 sm:space-y-4">
                  {order.status === "Cancelled" && (
                    <div className="bg-error/10 border border-error/20 p-3 sm:p-6 rounded-2xl">
                      <h4 className="text-error font-bold mb-2">
                        Order Cancelled
                      </h4>
                      <p className="text-sm text-text-secondary">
                        Reason: {order.cancelReason}
                      </p>
                      <p className="text-xs text-text-muted mt-2">
                        Processed on{" "}
                        {order.cancelDate &&
                          new Date(order.cancelDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {order.returnStatus && (
                    <div className="bg-warning/10 border border-warning/20 p-6 rounded-2xl">
                      <h4 className="text-warning font-bold mb-2">
                        Return {order.returnStatus}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        Reason: {order.returnReason}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-8">
              {/* Delivery & Payment */}
              <div className="card bg-surface p-6">
                <div className="space-y-8">
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <LocalShippingIcon
                        fontSize="small"
                        className="text-accent"
                      />
                      <h4 className="text-sm font-bold uppercase tracking-widest text-text-primary">
                        Shipping Address
                      </h4>
                    </div>
                    <div className="text-sm text-text-secondary space-y-1">
                      <p className="font-bold text-text-primary text-base">
                        {order.shippingAddress.fullName}
                      </p>
                      <p>{order.shippingAddress.addressLine1}</p>
                      {order.shippingAddress.addressLine2 && (
                        <p>{order.shippingAddress.addressLine2}</p>
                      )}
                      <p>
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                      <p className="pt-2">
                        Phone: {order.shippingAddress.phone}
                      </p>
                    </div>
                  </section>

                  <section className="border-t border-border pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <PaymentIcon fontSize="small" className="text-accent" />
                      <h4 className="text-sm font-bold uppercase tracking-widest text-text-primary">
                        Payment Information
                      </h4>
                    </div>
                    <div className="text-sm text-text-secondary space-y-2">
                      <div className="flex justify-between">
                        <span>Method:</span>
                        <span className="text-text-primary font-medium">
                          {order.paymentMethod}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span
                          className={`font-bold ${order.isPaid ? "text-success" : "text-error"}`}
                        >
                          {order.isPaid ? "Paid" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* Price Summary */}
              <div className="card bg-surface-light p-6">
                <h4 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-6">
                  Price Summary
                </h4>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal</span>
                    <span className="text-text-primary font-medium">
                      ${order.itemsPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Shipping</span>
                    <span className="text-success font-medium">
                      ${order.shippingPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Tax</span>
                    <span className="text-text-primary font-medium">
                      ${order.taxPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex justify-between items-end">
                      <span className="text-text-primary font-bold">
                        Total Amount
                      </span>
                      <span className="text-2xl font-black text-accent">
                        ${order.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              <div className="space-y-3">
                {isCancelEligible(order) ? (
                  <div className="space-y-2">
                    <p className="text-xs text-text-muted text-center font-medium">
                      Cancellation available within 24 hours of ordering
                    </p>
                    <CustomButton
                      onclick={() => setIsCancelOpen(true)}
                      className="btn-outline text-error border-error/30 hover:bg-error/10 hover:border-error"
                    >
                      Cancel Order
                    </CustomButton>
                  </div>
                ) : (
                  order.status !== "Shipped" &&
                  order.status !== "Delivered" &&
                  order.status !== "Cancelled" &&
                  order.status !== "Returned" && (
                    <div className="bg-surface-light/50 border border-border p-4 rounded-xl text-center">
                      <p className="text-text-muted text-sm font-medium">
                        Cancellation window closed (24h)
                      </p>
                    </div>
                  )
                )}

                {order?.status === "Delivered" && (
                  <button
                    onClick={() =>
                      navigate("/return&exchange", {
                        state: { orderId: order?._id },
                      })
                    }
                    className="btn-primary w-full py-3 !bg-warning !text-text-inverse"
                  >
                    Manage Returns
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <CustomModal
        open={isCancelOpen}
        onClose={() => {
          if (!actionLoading) setIsCancelOpen(false);
        }}
      >
        <div className="bg-surface max-w-lg w-full  overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-error"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-serif font-black text-text-primary">
                  Cancel Order?
                </h2>
                <p className="text-sm text-text-secondary">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <label className="text-sm font-bold uppercase tracking-widest text-text-muted px-1">
                Why are you cancelling?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cancellationReasons.map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedReason(r)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left ${
                      selectedReason === r
                        ? "bg-accent border-accent text-text-inverse shadow-lg shadow-accent/20"
                        : "bg-surface-light border-border text-text-secondary hover:border-accent/50"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {selectedReason === "Others" && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <textarea
                    className="w-full bg-surface-light border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all min-h-[100px]"
                    placeholder="Please tell us more about why you're cancelling..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                disabled={actionLoading}
                onClick={() => setIsCancelOpen(false)}
                className="flex-1 px-6 py-4 rounded-xl font-bold text-text-secondary hover:bg-surface-light transition-colors disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                disabled={
                  !selectedReason ||
                  (selectedReason === "Others" && !customReason) ||
                  actionLoading
                }
                onClick={handleCancelOrder}
                className="flex-[1.5] px-6 py-4 rounded-xl font-bold bg-error text-text-inverse shadow-lg shadow-error/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Cancellation"
                )}
              </button>
            </div>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default OrderDetails;
