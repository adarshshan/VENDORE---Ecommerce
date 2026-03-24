import React, { useState, useEffect } from "react";
import { useStore } from "../../store/useStore";
import { useNavigate } from "react-router-dom";
import { createRazorpayOrder, verifyPayment, createOrder } from "../../services/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const { cart, clearCart, user } = useStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState(1); // 1: Address, 2: Review & Pay
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: "",
  });

  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    if (cart.length === 0) {
      navigate("/cart");
    }
  }, [cart, navigate]);

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      const data = await createRazorpayOrder(
        cart.map(item => ({ product: item._id, quantity: item.quantity }))
      );
      setOrderData(data);
      setStep(2);
      setIsProcessing(false);
    } catch (error: any) {
      console.error("Error creating razorpay order:", error);
      setErrorMessage(error.response?.data?.message || "Failed to initiate payment");
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    if (!orderData) return;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.amount * 100,
      currency: orderData.currency,
      name: "KIDS-OWN",
      description: "Purchase from KIDS-OWN",
      order_id: orderData.orderId,
      handler: async (response: any) => {
        try {
          setIsProcessing(true);
          // 1. Verify payment on backend
          const verificationResult = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verificationResult.success) {
            // 2. Create actual order in database
            await createOrder({
              orderItems: cart.map(item => ({
                product: item._id,
                name: item.name,
                image: item.images && item.images.length > 0 ? item.images[0] : "",
                price: item.price,
                quantity: item.quantity,
                size: item.selectedSize,
                color: item.selectedColor,
              })),
              shippingAddress,
              paymentMethod: "Razorpay",
              itemsPrice: cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
              taxPrice: orderData.tax,
              shippingPrice: orderData.shipping,
              totalPrice: orderData.amount,
              paymentResult: {
                id: response.razorpay_payment_id,
                status: "succeeded",
                update_time: new Date().toISOString(),
                email_address: user?.email,
              },
            });

            clearCart();
            navigate("/orders");
          }
        } catch (error: any) {
          setErrorMessage("Payment verification failed: " + (error.response?.data?.message || error.message));
        } finally {
          setIsProcessing(false);
        }
      },
      prefill: {
        name: shippingAddress.fullName,
        email: user?.email,
        contact: shippingAddress.phone,
      },
      theme: {
        color: "#EC4899", // pink-500
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
        setErrorMessage(response.error.description);
    });
    rzp.open();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-pink-600">Checkout</h2>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {errorMessage}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleAddressSubmit} className="bg-white p-6 rounded shadow-md space-y-4">
          <h3 className="text-xl font-semibold mb-4">Shipping Address</h3>
          <input
            type="text"
            placeholder="Full Name"
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none"
            value={shippingAddress.fullName}
            onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Address Line 1"
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none"
            value={shippingAddress.addressLine1}
            onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="City"
              required
              className="w-full border p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none"
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
            />
            <input
              type="text"
              placeholder="State"
              required
              className="w-full border p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none"
              value={shippingAddress.state}
              onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Postal Code"
              required
              className="w-full border p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none"
              value={shippingAddress.postalCode}
              onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
            />
            <input
              type="text"
              placeholder="Country"
              required
              className="w-full border p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none"
              value={shippingAddress.country}
              onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
            />
          </div>
          <input
            type="text"
            placeholder="Phone"
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none"
            value={shippingAddress.phone}
            onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
          />
          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full bg-pink-500 text-white py-2 rounded font-semibold hover:bg-pink-600 transition-colors disabled:bg-pink-300"
          >
            {isProcessing ? "Processing..." : "Continue to Payment"}
          </button>
        </form>
      )}

      {step === 2 && orderData && (
        <div className="bg-white p-6 rounded shadow-md">
          <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
          <div className="space-y-2 mb-6 border-b pb-4">
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between">
                <span>{item.name} x {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹{orderData.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>₹{orderData.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>₹{orderData.amount.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 bg-pink-500 text-white py-2 rounded font-semibold hover:bg-pink-600 transition-colors disabled:bg-pink-300"
            >
              {isProcessing ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
