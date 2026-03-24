import React from "react";
import { useStore } from "../../store/useStore";
import { useNavigate } from "react-router-dom";

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity } = useStore();
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      navigate("/login");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Cart</h2>
      {cart.length === 0 ? (
        <div className="text-center">
          <p className="mb-4">Your cart is empty</p>
          <button 
            onClick={() => navigate("/products")}
            className="text-pink-500 hover:text-pink-600 underline"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="bg-white rounded shadow-sm p-4">
          {cart.map((item) => (
            <div key={`${item._id}-${item.selectedSize}-${item.selectedColor}`} className="flex flex-col sm:flex-row justify-between items-center border-b py-4 gap-4">
              <div className="flex items-center gap-4 flex-grow">
                {item.images && item.images.length > 0 && (
                  <img src={item.images[0]} alt={item.name} className="w-16 h-16 object-cover rounded" />
                )}
                <div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    {item.selectedSize && `Size: ${item.selectedSize} `}
                    {item.selectedColor && `Color: ${item.selectedColor}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded">
                  <button 
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                    onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1), item.selectedSize, item.selectedColor)}
                  >
                    -
                  </button>
                  <span className="px-3">{item.quantity}</span>
                  <button 
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                    onClick={() => updateQuantity(item._id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                  >
                    +
                  </button>
                </div>
                
                <p className="font-semibold w-24 text-right">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                
                <button 
                  onClick={() => removeFromCart(item._id, item.selectedSize, item.selectedColor)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="flex flex-col items-end mt-6">
            <p className="text-xl font-bold mb-4">Total: ${total.toFixed(2)}</p>
            <div className="flex gap-4">
              <button 
                onClick={() => navigate("/products")}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Continue Shopping
              </button>
              <button 
                onClick={handleCheckout}
                className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 shadow-md"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
