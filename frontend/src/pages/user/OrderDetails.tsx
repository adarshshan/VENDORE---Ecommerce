import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getOrderById, cancelOrder, requestReturn } from "../../services/api";
import type { Order } from "../../types/Order";
import CustomModal from "../../components/Modal";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payments";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
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
    if (!id || !reason) return;
    try {
      setActionLoading(true);
      await cancelOrder(id, reason);
      setIsCancelOpen(false);
      setReason("");
      fetchOrder();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error cancelling order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnOrder = async () => {
    if (!id || !reason) return;
    try {
      setActionLoading(true);
      await requestReturn(id, reason);
      setIsReturnOpen(false);
      setReason("");
      fetchOrder();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error requesting return");
    } finally {
      setActionLoading(false);
    }
  };

  const isReturnEligible = (order: Order) => {
    if (order.status !== "Delivered") return false;
    if (order.returnStatus) return false;
    const deliveryDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date();
    const diffTime = Math.abs(Date.now() - deliveryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Delivered': return 'badge-accent';
      case 'Cancelled': return 'bg-error/20 text-error border border-error/30';
      case 'Processing': return 'bg-info/20 text-info border border-info/30';
      case 'Shipped': return 'bg-accent/20 text-accent border border-accent/30';
      default: return 'badge-outline';
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen bg-background py-20 text-center container-custom">
      <h2 className="text-3xl font-serif font-bold text-white mb-4">Oops! {error || "Order not found"}</h2>
      <button onClick={() => navigate("/orders")} className="btn-primary mt-4">Back to My Orders</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container-custom py-8">
        <button 
          onClick={() => navigate("/orders")} 
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-8 group"
        >
          <ArrowBackIcon fontSize="small" className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Orders</span>
        </button>

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-serif font-black text-white">Order #{order._id.slice(-8).toUpperCase()}</h1>
              <p className="text-text-secondary">Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
            </div>
            <span className={`badge px-4 py-1.5 text-sm ${getStatusStyle(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Order Items */}
              <div className="card bg-surface p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingBagIcon className="text-accent" />
                  <h3 className="text-xl font-bold text-white">Order Items</h3>
                </div>
                <div className="space-y-6">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-6 items-center border-b border-border pb-6 last:border-0 last:pb-0 group">
                      <div className="w-20 h-24 bg-surface-light rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-lg font-bold text-white mb-1 truncate">{item.name}</h4>
                        <div className="flex flex-wrap gap-3 text-sm text-text-muted">
                          <span>Qty: <span className="text-white font-medium">{item.quantity}</span></span>
                          {item.size && <span>Size: <span className="text-white font-medium">{item.size}</span></span>}
                          {item.color && <span>Color: <span className="text-white font-medium">{item.color}</span></span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-accent">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-xs text-text-muted">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Notifications */}
              {(order.status === 'Cancelled' || order.returnStatus) && (
                <div className="space-y-4">
                  {order.status === 'Cancelled' && (
                    <div className="bg-error/10 border border-error/20 p-6 rounded-2xl">
                      <h4 className="text-error font-bold mb-2">Order Cancelled</h4>
                      <p className="text-sm text-text-secondary">Reason: {order.cancelReason}</p>
                      <p className="text-xs text-text-muted mt-2">Processed on {order.cancelDate && new Date(order.cancelDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {order.returnStatus && (
                    <div className="bg-warning/10 border border-warning/20 p-6 rounded-2xl">
                      <h4 className="text-warning font-bold mb-2">Return {order.returnStatus}</h4>
                      <p className="text-sm text-text-secondary">Reason: {order.returnReason}</p>
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
                      <LocalShippingIcon fontSize="small" className="text-accent" />
                      <h4 className="text-sm font-bold uppercase tracking-widest text-white">Shipping Address</h4>
                    </div>
                    <div className="text-sm text-text-secondary space-y-1">
                      <p className="font-bold text-white text-base">{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.addressLine1}</p>
                      {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.country}</p>
                      <p className="pt-2">Phone: {order.shippingAddress.phone}</p>
                    </div>
                  </section>

                  <section className="border-t border-border pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <PaymentIcon fontSize="small" className="text-accent" />
                      <h4 className="text-sm font-bold uppercase tracking-widest text-white">Payment Information</h4>
                    </div>
                    <div className="text-sm text-text-secondary space-y-2">
                      <div className="flex justify-between">
                        <span>Method:</span>
                        <span className="text-white font-medium">{order.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`font-bold ${order.isPaid ? "text-success" : "text-error"}`}>
                          {order.isPaid ? "Paid" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* Price Summary */}
              <div className="card bg-surface-light p-6">
                <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Price Summary</h4>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal</span>
                    <span className="text-white font-medium">${order.itemsPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Shipping</span>
                    <span className="text-success font-medium">${order.shippingPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Tax</span>
                    <span className="text-white font-medium">${order.taxPrice.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex justify-between items-end">
                      <span className="text-white font-bold">Total Amount</span>
                      <span className="text-2xl font-black text-accent">${order.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              <div className="space-y-3">
                {order.status !== "Shipped" && order.status !== "Delivered" && order.status !== "Cancelled" && order.status !== "Returned" && (
                  <button 
                    onClick={() => setIsCancelOpen(true)}
                    className="btn-outline w-full py-3 text-error border-error/30 hover:bg-error/10 hover:border-error"
                  >
                    Cancel Order
                  </button>
                )}
                
                {isReturnEligible(order) && (
                  <button 
                    onClick={() => setIsReturnOpen(true)}
                    className="btn-primary w-full py-3 !bg-warning !text-black"
                  >
                    Request Return
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <CustomModal open={isCancelOpen} onClose={() => setIsCancelOpen(false)}>
        <div className="bg-surface p-8 max-w-md w-full border border-border rounded-3xl">
          <h2 className="text-2xl font-serif font-bold text-white mb-4">Cancel Order</h2>
          <p className="text-text-secondary mb-6">Please let us know why you need to cancel this order. This action cannot be undone.</p>
          <label className="label">Reason for Cancellation</label>
          <textarea
            className="input min-h-[100px] mb-6"
            placeholder="Tell us more..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex gap-4">
            <button onClick={() => setIsCancelOpen(false)} className="btn-secondary flex-1">Keep Order</button>
            <button 
              onClick={handleCancelOrder} 
              disabled={!reason || actionLoading}
              className="btn-primary !bg-error !text-white flex-1 disabled:opacity-50"
            >
              {actionLoading ? "Processing..." : "Confirm Cancel"}
            </button>
          </div>
        </div>
      </CustomModal>

      {/* Return Modal */}
      <CustomModal open={isReturnOpen} onClose={() => setIsReturnOpen(false)}>
        <div className="bg-surface p-8 max-w-md w-full border border-border rounded-3xl">
          <h2 className="text-2xl font-serif font-bold text-white mb-4">Request Return</h2>
          <p className="text-text-secondary mb-6">We're sorry the item didn't work out. Please provide a reason for your return.</p>
          <label className="label">Reason for Return</label>
          <textarea
            className="input min-h-[100px] mb-6"
            placeholder="Tell us more..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex gap-4">
             <button onClick={() => setIsReturnOpen(false)} className="btn-secondary flex-1">Cancel</button>
             <button 
               onClick={handleReturnOrder} 
               disabled={!reason || actionLoading}
               className="btn-primary !bg-warning !text-black flex-1 disabled:opacity-50"
             >
               {actionLoading ? "Processing..." : "Submit Request"}
             </button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default OrderDetails;
