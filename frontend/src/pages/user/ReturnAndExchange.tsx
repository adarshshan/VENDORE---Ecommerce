import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getMyOrders, requestReturn } from "../../services/api";
import CustomButton from "../../components/CustomButton";
import Loading from "../../components/Loading";
import { format } from "date-fns";
import { type Order } from "../../types/Order";
import { Alert, Snackbar } from "@mui/material";

const ReturnAndExchange = () => {
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string>(
    location.state?.orderId || "",
  );
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    severity: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getMyOrders();
      // Filter for delivered orders only
      const deliveredOrders = data?.orders?.filter(
        (order: any) => order.status === "Delivered",
      );
      setOrders(deliveredOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const isEligible = (deliveredAt: string | undefined) => {
    if (!deliveredAt) return false;
    const deliveryDate = new Date(deliveredAt);
    const diffTime = Date.now() - deliveryDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 5;
  };

  const getReturnDeadline = (deliveredAt: string | undefined) => {
    if (!deliveredAt) return "";
    const deadline = new Date(deliveredAt);
    deadline.setDate(deadline.getDate() + 5);
    return format(deadline, "PPP");
  };

  const handleReturnRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedProduct || !reason) {
      setToast({
        message: "Please fill all required fields",
        severity: "error",
      });
      return;
    }

    if (reason === "Other" && !customReason) {
      setToast({
        message: "Please provide a custom reason",
        severity: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      await requestReturn({
        orderId: selectedOrder,
        productId: selectedProduct,
        reason,
        customReason: reason === "Other" ? customReason : undefined,
      });
      setToast({
        message: "Return request submitted successfully!",
        severity: "success",
      });
      setSelectedOrder("");
      setSelectedProduct("");
      setReason("");
      setCustomReason("");
      fetchOrders(); // Refresh to show updated status
    } catch (error: any) {
      setToast({
        message:
          error.response?.data?.message || "Failed to submit return request",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-background py-10 text-text-primary px-[1rem] lg:px-[8rem] xl:px-[20rem]">
      <h2 className="text-3xl font-serif font-bold mb-8 text-center">
        Return & Exchange
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Policy Section */}
        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-xl border border-border">
            <h4 className="text-accent font-bold mb-4">Our Policy</h4>
            <ul className="space-y-4 text-sm text-text-secondary">
              <li className="flex gap-3">
                <span className="text-accent">✓</span>
                <p>
                  Cancellations are allowed within{" "}
                  <span className="text-text-primary font-bold">24 hours</span>{" "}
                  of placing the order.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">✓</span>
                <p>
                  Returns are allowed within{" "}
                  <span className="text-text-primary font-bold">5 days</span>{" "}
                  after delivery.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">✓</span>
                <p>Only unused products with original tags are eligible.</p>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">✓</span>
                <p>
                  Damaged or incorrect products are eligible for a full refund.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="text-error">✕</span>
                <p>
                  Returns are not accepted for size or color variation issues.
                </p>
              </li>
            </ul>
          </div>

          <div className="bg-surface-light p-6 rounded-xl border border-border italic text-sm text-text-muted">
            "Please provide a proper unboxing video clearly showing the package,
            the opening process, and any damage for quick approval."
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-surface p-8 rounded-2xl border border-border shadow-2xl">
          <h4 className="text-xl font-bold mb-6 text-text-primary">
            Submit Request
          </h4>

          <form onSubmit={handleReturnRequest} className="space-y-5">
            {/* Select Order */}
            <div>
              <label className="block text-sm font-medium mb-2 text-text-secondary">
                Select Order
              </label>
              <select
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
                value={selectedOrder}
                onChange={(e) => {
                  setSelectedOrder(e.target.value);
                  setSelectedProduct("");
                }}
                required
              >
                <option value="">Choose a delivered order</option>
                {orders.map((order) => (
                  <option key={order._id as string} value={order._id as string}>
                    Order #{order._id as string} (
                    {format(new Date(order.createdAt), "dd MMM")})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Product */}
            {selectedOrder && (
              <div>
                <label className="block text-sm font-medium mb-2 text-text-secondary">
                  Select Product
                </label>
                <select
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  required
                >
                  <option value="">Select an item to return</option>
                  {orders
                    .find((o) => o._id === selectedOrder)
                    ?.items.map((item) => (
                      <option
                        key={item.product.toString()}
                        value={item.product.toString()}
                        disabled={item.returnStatus !== "None"}
                      >
                        {item.name}{" "}
                        {item.returnStatus !== "None"
                          ? `(${item.returnStatus})`
                          : ""}
                      </option>
                    ))}
                </select>

                {selectedOrder && (
                  <div className="mt-2">
                    {(() => {
                      const order = orders.find((o) => o._id === selectedOrder);
                      const eligible = isEligible(order?.deliveredAt);
                      return (
                        <p
                          className={`text-xs ${eligible ? "text-accent" : "text-error"}`}
                        >
                          {eligible
                            ? `Eligible for return until: ${getReturnDeadline(order?.deliveredAt)}`
                            : "Return window closed for this order."}
                        </p>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Reason Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-2 text-text-secondary">
                Reason for Return
              </label>
              <select
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              >
                <option value="">Select a reason</option>
                <option value="Damaged product">Damaged product</option>
                <option value="Wrong Product Delivered">
                  Wrong Product Delivered
                </option>
                <option value="Quality not as Expected">
                  Quality not as Expected
                </option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Custom Reason */}
            {reason === "Other" && (
              <div>
                <label className="block text-sm font-medium mb-2 text-text-secondary">
                  Custom Reason
                </label>
                <textarea
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors min-h-[100px]"
                  placeholder="Please describe the issue..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="pt-4">
              <CustomButton
                type="submit"
                className="w-full py-4 rounded-xl font-bold uppercase tracking-wider"
                disabled={
                  !!(
                    submitting ||
                    (selectedOrder &&
                      !isEligible(
                        orders.find((o) => o?._id === selectedOrder)
                          ?.deliveredAt,
                      ))
                  )
                }
              >
                {submitting ? "Submitting..." : "Submit Return Request"}
              </CustomButton>
            </div>
          </form>
        </div>
      </div>

      <Snackbar
        open={!!toast}
        autoHideDuration={6000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast(null)}
          severity={toast?.severity}
          sx={{ width: "100%" }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ReturnAndExchange;
