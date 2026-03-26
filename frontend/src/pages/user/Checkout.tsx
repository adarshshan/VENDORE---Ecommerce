import React, { useState, useEffect } from "react";
import { useStore } from "../../store/useStore";
import { useNavigate } from "react-router-dom";
import {
  createRazorpayOrder,
  verifyPayment,
  createOrder,
} from "../../services/api";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CustomButton from "../../components/Button";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const cart = useStore((state) => state.cart);
  const clearCart = useStore((state) => state.clearCart);
  const user = useStore((state) => state.user);

  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState(1); // 1: Address, 2: Review & Pay
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Initialize name from user once available
  useEffect(() => {
    if (user && !shippingAddress.fullName) {
      setShippingAddress((prev) => ({ ...prev, fullName: user.name }));
    }
  }, [user]);

  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    if (cart.length === 0) {
      navigate("/cart");
    }
  }, [cart.length, navigate]);

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      setErrorMessage("");
      const data = await createRazorpayOrder(
        cart.map((item) => ({ product: item._id, quantity: item.quantity })),
      );
      setOrderData(data);
      setStep(2);
      setIsProcessing(false);
    } catch (error: any) {
      console.error("Error creating razorpay order:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to initiate payment. Please check your network.",
      );
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
      description: "Secure Purchase from KIDS-OWN",
      order_id: orderData.orderId,
      handler: async (response: any) => {
        try {
          setIsProcessing(true);
          const verificationResult = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verificationResult?.success) {
            await createOrder({
              orderItems: cart?.map((item) => ({
                product: item._id,
                name: item.name,
                image:
                  item.images && item.images.length > 0 ? item.images[0] : "",
                price: item.price,
                quantity: item.quantity,
                size: item.selectedSize,
                color: item.selectedColor,
              })),
              shippingAddress,
              paymentMethod: "Razorpay",
              itemsPrice: cart?.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0,
              ),
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
          setErrorMessage(
            "Payment verification failed: " +
              (error.response?.data?.message || error.message),
          );
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
        color: "#38bdf8", // accent Sky-400
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response: any) {
      setErrorMessage(response.error.description);
    });
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-background pb-20 px-[1rem] sm:px-[5rem]">
      <div className="container-custom py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-black text-white mb-4">
              Checkout
            </h1>
            <div className="flex items-center justify-center gap-4 sm:gap-8">
              <div
                className={`flex items-center gap-2 ${step === 1 ? "text-accent" : "text-text-muted"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 1 ? "border-accent bg-accent/10" : "border-text-muted"}`}
                >
                  1
                </div>
                <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
                  Shipping
                </span>
              </div>
              <div className="h-px w-8 sm:w-16 bg-border"></div>
              <div
                className={`flex items-center gap-2 ${step === 2 ? "text-accent" : "text-text-muted"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 2 ? "border-accent bg-accent/10" : "border-text-muted"}`}
                >
                  2
                </div>
                <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
                  Payment
                </span>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-error/10 border border-error/20 text-error px-6 py-4 rounded-xl mb-8 flex items-center gap-3">
              <span className="text-sm font-medium">{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              {step === 1 ? (
                <div className="card bg-surface p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <LocalShippingIcon className="text-accent" />
                    <h3 className="text-xl font-bold text-[var(--color-text-light)]">
                      Shipping Information
                    </h3>
                  </div>

                  <form
                    onSubmit={handleAddressSubmit}
                    className="space-y-6 text-[var(--color-text-light)]"
                  >
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                          Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="Your full name"
                          required
                          className="w-full bg-surface-light border border-border hover:border-border-light focus:border-accent focus:ring-1 focus:ring-accent outline-none px-4 py-3 rounded-xl transition-all"
                          value={shippingAddress.fullName}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              fullName: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                          Address Line 1
                        </label>
                        <input
                          type="text"
                          placeholder="House / Street / Apartment"
                          required
                          className="w-full bg-surface-light border border-border hover:border-border-light focus:border-accent focus:ring-1 focus:ring-accent outline-none px-4 py-3 rounded-xl transition-all"
                          value={shippingAddress.addressLine1}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              addressLine1: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                            City
                          </label>
                          <input
                            type="text"
                            placeholder="City"
                            required
                            className="w-full bg-surface-light border border-border hover:border-border-light focus:border-accent focus:ring-1 focus:ring-accent outline-none px-4 py-3 rounded-xl transition-all"
                            value={shippingAddress.city}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                city: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                            State / Province
                          </label>
                          <input
                            type="text"
                            placeholder="State"
                            required
                            className="w-full bg-surface-light border border-border hover:border-border-light focus:border-accent focus:ring-1 focus:ring-accent outline-none px-4 py-3 rounded-xl transition-all"
                            value={shippingAddress.state}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                state: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            placeholder="6-digit code"
                            required
                            className="w-full bg-surface-light border border-border hover:border-border-light focus:border-accent focus:ring-1 focus:ring-accent outline-none px-4 py-3 rounded-xl transition-all"
                            value={shippingAddress.postalCode}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                postalCode: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                            Country
                          </label>
                          <input
                            type="text"
                            placeholder="Country"
                            required
                            className="w-full bg-surface-light border border-border hover:border-border-light focus:border-accent focus:ring-1 focus:ring-accent outline-none px-4 py-3 rounded-xl transition-all"
                            value={shippingAddress.country}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                country: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="Your contact number"
                          required
                          className="w-full bg-surface-light border border-border hover:border-border-light focus:border-accent focus:ring-1 focus:ring-accent outline-none px-4 py-3 rounded-xl transition-all"
                          value={shippingAddress.phone}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="pt-6">
                      <CustomButton type="submit" disabled={isProcessing}>
                        {isProcessing ? "Processing..." : "Continue to Payment"}
                      </CustomButton>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="card bg-surface p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <PaymentIcon className="text-accent" />
                    <h3 className="text-xl font-bold text-white">
                      Payment Selection
                    </h3>
                  </div>

                  <div className="bg-surface-light border border-border p-6 rounded-2xl mb-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-accent/20 p-2 rounded-lg">
                        <AssignmentIcon className="text-accent" />
                      </div>
                      <div>
                        <p className="text-white font-bold">
                          Razorpay Secure Payment
                        </p>
                        <p className="text-xs text-text-secondary">
                          Cards, Netbanking, UPI & Wallets
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <CustomButton
                      onclick={() => setStep(1)}
                      disabled={isProcessing}
                      className="text-accent"
                    >
                      Back
                    </CustomButton>

                    <CustomButton
                      onclick={handlePayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Verifying..." : "Pay Securely Now"}
                    </CustomButton>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-5">
              <div className="card bg-surface p-6 sticky top-24">
                <h3 className="text-lg font-bold text-white mb-6 border-b border-border pb-4">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin">
                  {cart.map((item) => (
                    <div
                      key={`${item._id}-${item.selectedSize}`}
                      className="flex gap-4 items-center"
                    >
                      <div className="w-12 h-12 rounded bg-surface-light overflow-hidden flex-shrink-0">
                        <img
                          src={item.images?.[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          Qty: {item.quantity} • {item.selectedSize}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-white">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>Items Price</span>
                    <span className="text-white font-mono">
                      ₹
                      {cart
                        .reduce(
                          (acc, item) => acc + item.price * item.quantity,
                          0,
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                  {orderData && (
                    <>
                      <div className="flex justify-between text-sm text-text-secondary">
                        <span>Tax</span>
                        <span className="text-white font-mono">
                          ₹{orderData?.tax?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-text-secondary">
                        <span>Shipping</span>
                        <span className="text-success font-mono font-bold">
                          ₹{orderData.shipping.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-end">
                    <span className="text-white font-bold">Total Payable</span>
                    <span className="text-2xl font-black text-accent font-mono">
                      ₹
                      {(
                        orderData?.amount ||
                        cart.reduce(
                          (acc, item) => acc + item.price * item.quantity,
                          0,
                        )
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
