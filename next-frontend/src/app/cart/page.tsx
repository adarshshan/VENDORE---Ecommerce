"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useStore } from "@/src/store/useStore";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CustomButton from "@/src/components/CustomButton";
import { getAddresses, validatePincode } from "@/src/services/api";
import type { Address } from "@/src/types/User";
import { cn } from "@/src/utils/cn";

interface CartItemProps {
  item: any;
  removeFromCart: (id: string | number, size?: string, color?: string) => void;
  updateQuantity: (
    id: string | number,
    quantity: number,
    size?: string,
    color?: string,
  ) => void;
}

const CartItem: React.FC<CartItemProps> = React.memo(
  ({ item, removeFromCart, updateQuantity }) => {
    return (
      <div className="card bg-surface p-4 sm:p-6 flex flex-col sm:flex-row sm:row gap-6 items-start sm:items-center group hover:border-border-light transition-all">
        {/* Product Image */}
        <div className="w-full sm:w-32 h-32 sm:h-36 flex-shrink-0 bg-surface-light rounded-lg overflow-hidden border border-border">
          {item?.images && item?.images?.length > 0 ? (
            <img
              src={item?.images[0]?.url}
              alt={item?.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted">
              <ShoppingBagIcon />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="w-full flex-grow min-w-0">
          <div className="w-full flex justify-between items-start mb-0 sm:mb-2">
            <h3 className="text-lg font-bold text-text-primary truncate pr-4">
              <Link
                href={`/product/${item?._id}`}
                className="hover:text-accent transition-colors capitalize"
              >
                {item?.name}
              </Link>
            </h3>
            <button
              onClick={() =>
                removeFromCart(
                  item?._id,
                  item?.selectedSize,
                  item?.selectedColor,
                )
              }
              className="text-text-muted hover:text-error transition-colors p-1 cursor-pointer"
              aria-label="Remove item"
            >
              <DeleteForeverIcon fontSize="small" />
            </button>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-text-secondary mb-4">
            {item?.selectedSize && (
              <span className="bg-surface-light px-2.5 py-1 rounded-md border border-border text-xs font-medium">
                Size:{" "}
                <span className="text-text-primary">{item?.selectedSize}</span>
              </span>
            )}
            {item?.selectedColor && (
              <span className="bg-surface-light px-2.5 py-1 rounded-md border border-border flex items-center gap-2 text-xs font-medium">
                Color:{" "}
                <span
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: item?.selectedColor }}
                ></span>
              </span>
            )}
          </div>

          <div className="w-full flex justify-between items-center md:items-end">
            {/* Quantity Controls */}
            <div className="flex items-center bg-surface-light rounded-xl border border-border overflow-hidden">
              <button
                className="p-2.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors disabled:opacity-30"
                onClick={() =>
                  updateQuantity(
                    item?._id,
                    Math.max(1, item?.quantity - 1),
                    item?.selectedSize,
                    item?.selectedColor,
                  )
                }
                disabled={item?.quantity <= 1}
              >
                <RemoveIcon fontSize="small" />
              </button>
              <span className="w-10 text-center font-bold text-text-primary text-sm">
                {item?.quantity}
              </span>
              <button
                className="p-2.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                onClick={() =>
                  updateQuantity(
                    item?._id,
                    item?.quantity + 1,
                    item?.selectedSize,
                    item?.selectedColor,
                  )
                }
              >
                <AddIcon fontSize="small" />
              </button>
            </div>

            <p className="text-xl font-black text-accent">
              ₹{(item?.price * item?.quantity).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    );
  },
);

const Cart: React.FC = () => {
  const cart = useStore((state) => state.cart);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const updateQuantity = useStore((state) => state.updateQuantity);
  const user = useStore((state) => state.user);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Shipping & Delivery States
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [shippingDetails, setShippingDetails] = useState<{
    loading: boolean;
    deliveryCharge: number;
    estimatedDelivery?: string;
    message?: string;
    valid: boolean;
  }>({
    loading: false,
    deliveryCharge: 0,
    valid: false,
  });

  // Fetch default address
  const fetchDefaultAddress = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getAddresses();
      if (data.success) {
        const defaultAddr = data.addresses.find((a: Address) => a.isDefault);
        setDefaultAddress(defaultAddr || null);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchDefaultAddress();
  }, [fetchDefaultAddress]);

  // Recalculate shipping whenever cart or defaultAddress changes
  useEffect(() => {
    if (defaultAddress?.postalCode && cart.length > 0) {
      const calculateShipping = async () => {
        try {
          setShippingDetails((prev) => ({
            ...prev,
            loading: true,
            message: "",
          }));
          const data = await validatePincode(
            defaultAddress.postalCode,
            cart.map((item) => ({
              productId: item._id,
              quantity: item.quantity,
            })),
          );

          if (data.success) {
            setShippingDetails({
              loading: false,
              deliveryCharge: data.deliveryCharge,
              estimatedDelivery: data.estimatedDeliveryDate,
              valid: true,
              message: "",
            });
          } else {
            setShippingDetails({
              loading: false,
              deliveryCharge: 0,
              valid: false,
              message: data.message || "Not serviceable",
            });
          }
        } catch (error) {
          setShippingDetails({
            loading: false,
            deliveryCharge: 0,
            valid: false,
            message: "Failed to calculate shipping",
          });
        }
      };
      calculateShipping();
    } else {
      setShippingDetails({
        loading: false,
        deliveryCharge: 0,
        valid: false,
        message: defaultAddress
          ? ""
          : "Add a default address to calculate delivery",
      });
    }
  }, [cart, defaultAddress]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = pathname + (searchParams.toString() ? "?" + searchParams.toString() : "");
      sessionStorage.setItem("redirectAfterLogin", currentPath);
      window.scrollTo(0, 0);
    }
  }, [pathname, searchParams]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const totalPayable = subtotal + shippingDetails.deliveryCharge;

  const handleCheckout = () => {
    if (!user) {
      router.push("/login");
    } else {
      router.push("/checkout");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-surface p-12 rounded-3xl border border-border max-w-lg mx-auto shadow-sm">
            <div className="bg-background w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBagIcon
                sx={{ fontSize: 40, color: "var(--color-text-muted)" }}
              />
            </div>
            <h2 className="text-3xl font-serif font-black text-text-primary mb-4">
              Your cart is empty
            </h2>
            <p className="text-text-secondary mb-8 text-lg">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              href="/products"
              className="bg-accent text-text-inverse px-8 py-3 rounded-xl font-bold transition-all hover:opacity-90 inline-block shadow-lg shadow-accent/20"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-serif font-black text-text-primary mb-8 md:mb-12">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <CartItem
                key={`${item?._id}-${item?.selectedSize}-${item?.selectedColor}`}
                item={item}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
              />
            ))}

            <button
              onClick={() => router.push("/products")}
              className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors mt-6 font-bold uppercase tracking-wider text-xs"
            >
              <ArrowBackIcon fontSize="small" />
              Continue Shopping
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="space-y-6 sticky top-24">
              {/* Delivery info card */}
              <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <LocationOnIcon className="text-accent" fontSize="small" />
                  <h4 className="font-bold text-text-primary">
                    Delivery Address
                  </h4>
                </div>

                {defaultAddress ? (
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-text-primary truncate">
                      Deliver to: {defaultAddress.fullName}
                    </p>
                    <p className="text-xs text-text-secondary line-clamp-1">
                      {defaultAddress.addressLine1}, {defaultAddress.city} -{" "}
                      {defaultAddress.postalCode}
                    </p>
                    <Link
                      href="/addresses"
                      className="text-xs font-bold text-accent hover:underline inline-block mt-1"
                    >
                      Change Address
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-text-secondary">
                      {user
                        ? "Set a default address to calculate shipping"
                        : "Login to see delivery charges"}
                    </p>
                    <Link
                      href={user ? "/addresses" : "/login"}
                      className="text-xs font-bold text-accent border border-accent/20 px-3 py-1.5 rounded-lg hover:bg-accent/5 transition-colors inline-block"
                    >
                      {user ? "Manage Addresses" : "Login Now"}
                    </Link>
                  </div>
                )}
              </div>

              {/* Summary card */}
              <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm">
                <h3 className="text-xl font-bold text-text-primary mb-6 border-b border-border pb-4">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>Subtotal</span>
                    <span className="text-text-primary font-bold">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>Delivery Charges</span>
                    {shippingDetails.loading ? (
                      <span className="text-accent text-xs animate-pulse font-medium">
                        Calculating...
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "font-bold",
                          shippingDetails.deliveryCharge === 0
                            ? "text-success"
                            : "text-text-primary",
                        )}
                      >
                        {shippingDetails.valid
                          ? shippingDetails.deliveryCharge === 0
                            ? "FREE"
                            : `₹${shippingDetails.deliveryCharge.toFixed(2)}`
                          : "—"}
                      </span>
                    )}
                  </div>

                  {shippingDetails.message && (
                    <p className="text-[10px] text-error font-medium">
                      {shippingDetails.message}
                    </p>
                  )}

                  <div className="flex justify-between text-sm text-text-secondary border-t border-border pt-4">
                    <span>Tax (GST)</span>
                    <span className="text-text-primary font-medium">
                      Included
                    </span>
                  </div>
                </div>

                {shippingDetails.valid && shippingDetails.estimatedDelivery && (
                  <div className="bg-accent/5 p-3 rounded-xl border border-accent/10 mb-6">
                    <p className="text-xs text-accent font-medium text-center">
                      🚚 Estimated Delivery:{" "}
                      <span className="font-bold">
                        {new Date(
                          shippingDetails.estimatedDelivery,
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </p>
                  </div>
                )}

                <div className="border-t border-border pt-4 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-bold text-text-primary">
                      Total
                    </span>
                    <span className="text-3xl font-black text-accent">
                      ₹{totalPayable.toFixed(2)}
                    </span>
                  </div>
                </div>

                <CustomButton
                  onclick={handleCheckout}
                  className="bg-accent text-text-inverse w-full py-4 rounded-xl font-bold shadow-lg shadow-accent/20 hover:opacity-90 transition-all active:scale-[0.98] animate-pulse hover:animate-none"
                >
                  Proceed to Checkout
                </CustomButton>

                <p className="text-center text-[10px] text-text-muted mt-6 uppercase tracking-[0.2em] font-bold">
                  Secure Payment Gateway
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
