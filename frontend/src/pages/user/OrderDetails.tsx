import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById, cancelOrder, requestReturn } from "../../services/api";
import type { Order } from "../../types/Order";
import CustomModal from "../../components/Modal";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal State
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
      fetchOrder(); // Refresh data
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
      fetchOrder(); // Refresh data
    } catch (err: any) {
      alert(err.response?.data?.message || "Error requesting return");
    } finally {
      setActionLoading(false);
    }
  };

  const isReturnEligible = (order: Order) => {
    if (order.status !== "Delivered") return false;
    if (order.returnStatus) return false; // Already requested
    const deliveryDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date();
    const diffTime = Math.abs(Date.now() - deliveryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!order) return <div className="text-center py-10">Order not found</div>;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link to="/orders" className="flex items-center text-gray-600 mb-6 hover:text-black">
        <ArrowBackIcon className="mr-2" /> Back to Orders
      </Link>

      <div className="bg-white rounded shadow p-6 mb-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">Order #{order._id.slice(-8).toUpperCase()}</h1>
            <p className="text-gray-500 text-sm">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
             <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                order.status === 'Returned' ? 'bg-gray-100 text-gray-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {order.status}
              </span>
          </div>
        </div>

        {/* Cancel/Return Status Banners */}
        {order.status === 'Cancelled' && (
           <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
             <strong>Cancelled:</strong> {order.cancelReason} on {order.cancelDate && new Date(order.cancelDate).toLocaleDateString()}
             {order.refundStatus && <div className="mt-1">Refund Status: {order.refundStatus}</div>}
           </div>
        )}
        {order.returnStatus && (
           <div className="bg-orange-50 text-orange-700 p-3 rounded mb-4">
             <strong>Return Status:</strong> {order.returnStatus}
             <div className="text-sm mt-1">Reason: {order.returnReason}</div>
           </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <div className="text-gray-600">
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p>Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Payment Info</h3>
            <p>Method: {order.paymentMethod}</p>
            <p>Status: <span className={order.isPaid ? "text-green-600" : "text-red-600"}>{order.isPaid ? "Paid" : "Pending"}</span></p>
            {order.paymentResult && <p className="text-sm text-gray-500 mt-1">ID: {order.paymentResult.id}</p>}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-semibold mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-4 last:border-0">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity} {item.size && `| Size: ${item.size}`} {item.color && `| Color: ${item.color}`}</p>
                  </div>
                </div>
                <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>${order.itemsPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Shipping</span>
            <span>${order.shippingPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Tax</span>
            <span>${order.taxPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
            <span>Total</span>
            <span>${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        {order.status !== "Shipped" && order.status !== "Delivered" && order.status !== "Cancelled" && order.status !== "Returned" && (
          <button 
            onClick={() => setIsCancelOpen(true)}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
          >
            Cancel Order
          </button>
        )}
        
        {isReturnEligible(order) && (
          <button 
            onClick={() => setIsReturnOpen(true)}
            className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition"
          >
            Request Return
          </button>
        )}
      </div>

      {/* Cancel Modal */}
      <CustomModal open={isCancelOpen} onClose={() => setIsCancelOpen(false)}>
        <div className="p-4 w-96">
          <h2 className="text-xl font-bold mb-4">Cancel Order</h2>
          <p className="mb-4 text-gray-600">Are you sure you want to cancel this order? This action cannot be undone.</p>
          <textarea
            className="w-full border p-2 rounded mb-4"
            placeholder="Reason for cancellation..."
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsCancelOpen(false)} className="px-4 py-2 border rounded">Close</button>
            <button 
              onClick={handleCancelOrder} 
              disabled={!reason || actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
            >
              {actionLoading ? "Processing..." : "Confirm Cancel"}
            </button>
          </div>
        </div>
      </CustomModal>

      {/* Return Modal */}
      <CustomModal open={isReturnOpen} onClose={() => setIsReturnOpen(false)}>
        <div className="p-4 w-96">
          <h2 className="text-xl font-bold mb-4">Request Return</h2>
          <p className="mb-4 text-gray-600">Why are you returning this item?</p>
          <textarea
            className="w-full border p-2 rounded mb-4"
            placeholder="Reason for return..."
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
             <button onClick={() => setIsReturnOpen(false)} className="px-4 py-2 border rounded">Close</button>
             <button 
               onClick={handleReturnOrder} 
               disabled={!reason || actionLoading}
               className="px-4 py-2 bg-orange-600 text-white rounded disabled:opacity-50"
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
