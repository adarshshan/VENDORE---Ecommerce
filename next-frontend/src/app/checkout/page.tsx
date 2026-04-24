"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useStore } from "@/src/store/useStore";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  createRazorpayOrder,
  verifyPayment,
  createOrder,
  validatePincode,
  getAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
} from "@/src/services/api";
import type { Address } from "@/src/types/User";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import CustomButton from "@/src/components/CustomButton";
import OrderSuccessModal from "@/src/components/OrderSuccessModal";
import CustomModal from "@/src/components/Modal";
import Loading from "@/src/components/Loading";
import toast from "react-hot-toast";
import { cn } from "@/src/utils/cn";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const cart = useStore((state) => state.cart);
  const buyNowItem = useStore((state) => state.buyNowItem);
  const setBuyNowItem = useStore((state) => state.setBuyNowItem);
  const clearCart = useStore((state) => state.clearCart);
  const user = useStore((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Detect Mode
  const isBuyNow = searchParams.get("type") === "buyNow";

  // Use either buyNowItem or cart items
  const checkoutItems = useMemo(() => {
    if (isBuyNow) {
      return buyNowItem ? [buyNowItem] : [];
    }
    return cart;
  }, [isBuyNow, buyNowItem, cart]);

  // Step state: 1: Address Selection, 2: Review & Pay
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | undefined>();

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Modal state
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [formData, setFormData] = useState<Partial<Address>>({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  // Shipping & Order Details
  const [pincodeStatus, setPincodeStatus] = useState<{
    loading: boolean;
    valid: boolean | null;
    message: string;
    deliveryCharge: number;
    estimatedDelivery?: string;
  }>({
    loading: false,
    valid: null,
    message: "",
    deliveryCharge: 0,
  });
  const [orderData, setOrderData] = useState<any>(null);

  // 1. Fetch Addresses
  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoadingAddresses(true);
      const data = await getAddresses();
      if (data.success) {
        setAddresses(data.addresses);

        // Auto-select default or first address
        if (data.addresses.length > 0) {
          const defaultAddr =
            data.addresses.find((a) => a.isDefault) || data.addresses[0];
          setSelectedAddress(defaultAddr);
        }
      }
    } catch (_error) {
      toast.error("Failed to fetch saved addresses");
    } finally {
      setIsLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // 2. Validate Pincode and Calculate Shipping whenever selected address changes
  useEffect(() => {
    if (selectedAddress?.postalCode && checkoutItems.length > 0) {
      const pin = selectedAddress.postalCode;
      const validate = async () => {
        try {
          setPincodeStatus((prev) => ({ ...prev, loading: true, message: "" }));
          const data = await validatePincode(
            pin,
            checkoutItems.map((item) => ({
              productId: item._id,
              quantity: item.quantity,
            })),
          );

          if (data.success) {
            setPincodeStatus({
              loading: false,
              valid: true,
              message: `Serviceable in ${data.city}, ${data.state}`,
              deliveryCharge: data.deliveryCharge,
              estimatedDelivery: data.estimatedDeliveryDate,
            });
          } else {
            setPincodeStatus({
              loading: false,
              valid: false,
              message: data.message || "Pincode not serviceable",
              deliveryCharge: 0,
            });
          }
        } catch (error: any) {
          setPincodeStatus({
            loading: false,
            valid: false,
            message: "Shipping calculation failed. Please try again.",
            deliveryCharge: 0,
          });
        }
      };
      validate();
    }
  }, [selectedAddress, checkoutItems]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Handle Address Modals
  const handleOpenForm = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData(address);
    } else {
      setEditingAddress(null);
      setFormData({
        fullName: user?.name || "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        isDefault: addresses.length === 0,
      });
    }
    setIsFormOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      let data;
      if (editingAddress?._id) {
        data = await updateAddress(editingAddress._id, formData);
        if (data.success) {
          toast.success("Address updated");
          setAddresses(data.addresses);
          const updated = data.addresses.find(
            (a: any) => a._id === editingAddress._id,
          );
          setSelectedAddress(updated ?? null);
        }
      } else {
        data = await addAddress(formData);
        if (data.success) {
          toast.success("Address added");
          setAddresses(data.addresses);
          const newAddr = data.addresses[data.addresses.length - 1];
          setSelectedAddress(newAddr);
        }
      }
      setIsFormOpen(false);
      setIsSelectorOpen(false);
    } catch (_error) {
      toast.error("Failed to save address");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectAddress = async (address: Address) => {
    setSelectedAddress(address);
    setIsSelectorOpen(false);
    // Optionally set as default in background
    if (!address.isDefault) {
      try {
        await setDefaultAddress(address._id!);
        // Refresh to update default icons
        const data = await getAddresses();
        if (data.success) setAddresses(data.addresses);
      } catch (_e) {}
    }
  };

  // Step transitions
  const proceedToPayment = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }
    if (!pincodeStatus.valid) {
      toast.error("Selected address is not serviceable");
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage("");
      const data = await createRazorpayOrder(
        checkoutItems.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          size: item.selectedSize,
        })),
        selectedAddress.postalCode,
      );
      setOrderData(data);
      setStep(2);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to initiate payment.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!orderData || !selectedAddress) return;

    if (!window.Razorpay) {
      const loadScript = (src: string) => {
        return new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = src;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const res = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js",
      );
      if (!res) {
        setErrorMessage("Razorpay SDK failed to load.");
        return;
      }
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount * 100,
      currency: orderData.currency,
      name: "ThreadCo",
      description: "Secure Purchase",
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
            const newOrder = await createOrder({
              orderItems: checkoutItems.map((item) => ({
                product: item._id,
                name: item.name,
                image: item.images?.[0]?.url || "",
                price: item.price,
                quantity: item.quantity,
                size: item.selectedSize,
                color: item.selectedColor,
              })),
              shippingAddress: selectedAddress,
              estimatedDeliveryDate: pincodeStatus.estimatedDelivery,
              paymentMethod: "Razorpay",
              itemsPrice: checkoutItems.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0,
              ),
              shippingPrice: pincodeStatus.deliveryCharge,
              totalPrice: orderData.amount,
              paymentResult: {
                id: response.razorpay_payment_id,
                status: "succeeded",
                update_time: new Date().toISOString(),
                email_address: user?.email,
              },
            });

            setPlacedOrderId(newOrder?._id);
            if (isBuyNow) {
              setBuyNowItem(null);
            } else {
              clearCart();
            }
            setShowSuccessModal(true);
          }
        } catch (error: any) {
          setErrorMessage("Payment verification failed.");
        } finally {
          setIsProcessing(false);
        }
      },
      prefill: {
        name: selectedAddress.fullName,
        email: user?.email,
        contact: selectedAddress.phone,
      },
      theme: { color: "#38bdf8" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const subtotal = checkoutItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const totalPayable = subtotal + pincodeStatus.deliveryCharge;

  if (isLoadingAddresses) return <Loading />;

  return (
    <div className="min-h-screen bg-background pb-20 px-[1rem] sm:px-[5rem]">
      <OrderSuccessModal
        open={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/");
        }}
        orderId={placedOrderId}
        totalAmount={orderData?.amount || totalPayable}
      />

      <div className="max-w-7xl mx-auto py-8 md:py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-black text-text-primary mb-4">
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
                Address
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
          <div className="bg-error/10 border border-error/20 text-error px-6 py-4 rounded-xl mb-8">
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <LocalShippingIcon className="text-accent" />
                    <h3 className="text-xl font-bold text-text-primary">
                      Shipping Address
                    </h3>
                  </div>
                </div>

                {!selectedAddress ? (
                  <div className="bg-surface p-12 rounded-3xl border-2 border-dashed border-border text-center">
                    <p className="text-text-secondary mb-6">
                      No delivery address selected.
                    </p>
                    <button
                      onClick={() => handleOpenForm()}
                      className="px-8 py-3 bg-accent text-text-inverse rounded-xl font-bold transition-all hover:opacity-90 shadow-lg shadow-accent/20"
                    >
                      Add New Address
                    </button>
                  </div>
                ) : (
                  <div className="bg-surface p-6 rounded-2xl border-1 border-accent bg-accent/5 ring-1 ring-accent/10 shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-black text-text-primary capitalize">
                          {selectedAddress?.fullName}
                        </h4>
                        <p className="text-accent font-bold">
                          {selectedAddress?.phone}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 bg-accent text-text-inverse text-[10px] font-black uppercase tracking-widest rounded">
                        Deliver To
                      </span>
                    </div>

                    <div className="text-text-secondary text-sm space-y-1 mb-6">
                      <p>{selectedAddress?.addressLine1}</p>
                      {selectedAddress?.addressLine2 && (
                        <p>{selectedAddress?.addressLine2}</p>
                      )}
                      <p>
                        {selectedAddress?.city}, {selectedAddress?.state} -{" "}
                        {selectedAddress?.postalCode}
                      </p>
                    </div>

                    <div className="flex flex-row gap-3 pt-4 border-t border-border">
                      <button
                        onClick={() => setIsSelectorOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-text-primary text-text-inverse rounded-xl font-bold text-sm transition-all hover:opacity-90"
                      >
                        <SwapHorizIcon fontSize="small" />
                        <span className="text-nowrap">Change Address</span>
                      </button>
                      <button
                        onClick={() => handleOpenForm(selectedAddress)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-surface text-text-primary border border-border rounded-xl font-bold text-sm transition-all hover:bg-surface-hover"
                      >
                        <EditIcon fontSize="small" />
                        Edit Address
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-6">
                  <CustomButton
                    onclick={proceedToPayment}
                    disabled={
                      isProcessing ||
                      !selectedAddress ||
                      pincodeStatus.valid === false
                    }
                    className={
                      isProcessing ||
                      !selectedAddress ||
                      pincodeStatus.valid === false
                        ? ""
                        : "!animate-pulse  hover:!animate-none"
                    }
                  >
                    {isProcessing ? "Processing..." : "Continue to Payment"}
                  </CustomButton>
                </div>
              </div>
            ) : (
              <div className="card bg-surface px-6 sm:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <PaymentIcon className="text-accent" />
                  <h3 className="text-xl font-bold text-text-primary">
                    Payment Selection
                  </h3>
                </div>

                <div className="bg-surface-light border border-border p-6 rounded-2xl mb-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-accent/20 p-2 rounded-lg">
                      <AssignmentIcon className="text-accent" />
                    </div>
                    <div>
                      <p className="text-text-primary font-bold">
                        Razorpay Secure Payment
                      </p>
                      <p className="text-xs text-text-secondary">
                        Cards, Netbanking, UPI & Wallets
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setStep(1)}
                    disabled={isProcessing}
                    className="flex-1 px-6 py-3.5 rounded-xl font-bold text-text-secondary hover:bg-surface-light transition-colors border border-border"
                  >
                    Back to Address
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="flex-[2] px-6 py-3.5 bg-accent text-text-inverse rounded-xl font-bold shadow-lg shadow-accent/20 hover:opacity-90 transition-all active:scale-[0.98] animate-pulse hover:animate-none"
                  >
                    {isProcessing ? "Verifying..." : "Pay Securely Now"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="card bg-surface px-6 sm:p-6 sticky top-24">
              <h3 className="text-lg font-bold text-text-primary mb-6 border-b border-border pb-4">
                Order Summary
              </h3>

              <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {checkoutItems.map((item) => (
                  <div
                    key={`${item._id}-${item.selectedSize}`}
                    className="flex gap-4 items-center"
                  >
                    <div className="w-14 h-14 rounded-lg bg-background overflow-hidden flex-shrink-0 border border-border">
                      <img
                        src={item.images?.[0]?.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-bold text-text-primary truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        Qty: {item.quantity} • {item.selectedSize}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-text-primary">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Subtotal</span>
                  <span className="text-text-primary font-bold">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Delivery Charges</span>
                  {pincodeStatus.loading ? (
                    <span className="text-accent text-xs animate-pulse">
                      Calculating...
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "font-bold",
                        pincodeStatus.deliveryCharge === 0
                          ? "text-success"
                          : "text-text-primary",
                      )}
                    >
                      {pincodeStatus.deliveryCharge === 0
                        ? "FREE"
                        : `₹${pincodeStatus.deliveryCharge.toFixed(2)}`}
                    </span>
                  )}
                </div>
                {pincodeStatus.valid && (
                  <div className="bg-accent/5 p-3 rounded-xl border border-accent/10 mt-2">
                    <p className="text-xs text-accent font-medium text-center">
                      🚚 Estimated Delivery:{" "}
                      <span className="font-bold">
                        {new Date(
                          pincodeStatus.estimatedDelivery!,
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-end">
                  <span className="text-text-primary font-bold">
                    Total Payable
                  </span>
                  <span className="text-3xl font-black text-accent">
                    ₹{totalPayable.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selector Modal */}
      <CustomModal
        open={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        title="Select Shipping Address"
      >
        <div className="max-w-2xl w-full max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar space-y-4">
          {addresses?.map((address) => (
            <div
              key={address?._id}
              onClick={() => handleSelectAddress(address)}
              className={cn(
                "relative p-5 rounded-2xl border-2 transition-all cursor-pointer text-left",
                selectedAddress?._id === address?._id
                  ? "border-accent bg-accent/5"
                  : "border-border bg-surface hover:border-accent/40",
              )}
            >
              <div className="flex justify-between items-start mb-2 pr-12">
                <div>
                  <h4 className="font-bold text-text-primary capitalize">
                    {address?.fullName}
                  </h4>
                  <p className="text-xs text-accent font-bold">
                    {address?.phone}
                  </p>
                </div>
                {selectedAddress?._id === address._id && (
                  <CheckCircleIcon className="text-accent" fontSize="small" />
                )}
              </div>
              <div className="text-sm text-text-secondary">
                <p className="truncate">{address.addressLine1}</p>
                <p className="truncate">
                  {address.city}, {address.state} - {address.postalCode}
                </p>
              </div>
            </div>
          ))}
          <button
            onClick={() => handleOpenForm()}
            className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-text-muted font-bold hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2"
          >
            <AddIcon fontSize="small" />
            Add New Address
          </button>
        </div>
      </CustomModal>

      {/* Add/Edit Modal */}
      <CustomModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingAddress ? "Edit Address" : "Add New Address"}
      >
        <div className="max-w-2xl w-full max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
          <form onSubmit={handleAddressSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                Address Line 1
              </label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleInputChange}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  Pincode
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                  maxLength={6}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 sticky bottom-0 bg-surface">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 px-6 py-3.5 rounded-xl font-bold text-text-secondary hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-[2] px-6 py-3.5 rounded-xl font-bold bg-accent text-text-inverse shadow-lg shadow-accent/20 hover:opacity-90"
              >
                {isProcessing ? "Saving..." : "Save Address"}
              </button>
            </div>
          </form>
        </div>
      </CustomModal>
    </div>
  );
};

export default Checkout;

