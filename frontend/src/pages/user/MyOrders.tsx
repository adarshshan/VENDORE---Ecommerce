import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../store/useStore";
import { getMyOrders } from "../../services/api";
import type { Order } from "../../types/Order";

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) return <div className="text-center py-10">Loading orders...</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <h2 className="text-3xl font-bold mb-6 text-center">My Orders</h2>
      {orders.length === 0 ? (
        <div className="text-center">
          <p className="mb-4">You have no orders yet.</p>
          <Link to="/products" className="text-blue-500 hover:underline">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border p-4 rounded shadow bg-white flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-lg">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                  <span className={`px-2 py-1 rounded text-xs text-white ${
                    order.status === 'Delivered' ? 'bg-green-500' :
                    order.status === 'Cancelled' ? 'bg-red-500' :
                    order.status === 'Returned' ? 'bg-gray-500' :
                    'bg-blue-500'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p className="text-gray-800 font-semibold mt-1">Total: ${order.totalPrice.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Items: {order.items.length}</p>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col gap-2">
                 <Link 
                   to={`/orders/${order._id}`}
                   className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 text-center text-sm"
                 >
                   View Details
                 </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
