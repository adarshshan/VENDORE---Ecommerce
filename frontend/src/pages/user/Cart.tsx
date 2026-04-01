import React, { useEffect, useMemo } from "react";
import { useStore } from "../../store/useStore";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CustomButton from "../../components/CustomButton";

const Cart: React.FC = () => {
  const cart = useStore((state) => state.cart);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const updateQuantity = useStore((state) => state.updateQuantity);

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const handleCheckout = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      navigate("/login");
    } else {
      navigate("/checkout");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-20 px-[1rem] sm:px-[5rem]">
        <div className="container-custom text-center">
          <div className="bg-surface/50 p-12 rounded-2xl border border-border max-w-lg mx-auto backdrop-blur-sm">
            <div className="bg-surface-light w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBagIcon
                sx={{ fontSize: 40, color: "var(--color-text-muted)" }}
              />
            </div>
            <h2 className="text-3xl font-serif font-bold text-text-primary mb-4">
              Your cart is empty
            </h2>
            <p className="text-text-secondary mb-8 text-lg">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              to="/products"
              className="border border-border btn-primary inline-flex gap-2 items-center text-text-primary p-2 px-3 rounded-md"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-[1rem] lg:px-[8rem] xl:px-[20rem]">
      <div className="container-custom">
        <h1 className="text-3xl md:text-4xl font-serif font-black text-text-primary mb-8">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart &&
              cart?.length > 0 &&
              cart?.map((item) => (
                <div
                  key={`${item?._id}-${item?.selectedSize}-${item?.selectedColor}`}
                  className="card bg-surface p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center group hover:border-border-light transition-all"
                >
                  {/* Product Image */}
                  <div className="w-full sm:w-24 h-32 sm:h-24 flex-shrink-0 bg-surface-light rounded-lg overflow-hidden">
                    {item?.images && item?.images?.length > 0 ? (
                      <img
                        src={item?.images[0]}
                        alt={item?.name}
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
                          to={`/product/${item?._id}`}
                          className="hover:text-accent transition-colors"
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
                        <DeleteOutlineIcon fontSize="small" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-text-secondary mb-4">
                      {item?.selectedSize && (
                        <span className="bg-surface-light px-2 py-1 rounded border border-border">
                          Size:{" "}
                          <span className="text-text-primary font-medium">
                            {item?.selectedSize}
                          </span>
                        </span>
                      )}
                      {item?.selectedColor && (
                        <span className="bg-surface-light px-2 py-1 rounded border border-border flex items-center gap-2">
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
                      <div className="flex items-center bg-surface-light rounded-lg border border-border">
                        <button
                          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-l-lg transition-colors"
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
                        <span className="w-10 text-center font-bold text-text-primary">
                          {item?.quantity}
                        </span>
                        <button
                          className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-r-lg transition-colors"
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

                      <p className="text-xl font-bold text-accent">
                        ₹{(item?.price * item?.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

            <button
              onClick={() => navigate("/products")}
              className="hidden sm:inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mt-4"
            >
              <ArrowBackIcon fontSize="small" />
              Continue Shopping
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card bg-surface p-6 sticky top-24">
              <h3 className="text-xl font-bold text-text-primary mb-6 pb-4 border-b border-border">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span className="text-text-primary font-medium">
                    ₹{total?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Shipping</span>
                  <span className="text-success font-medium">Free</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Tax</span>
                  <span className="text-text-primary font-medium">₹0.00</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-text-primary">
                    Total
                  </span>
                  <span className="text-3xl font-black text-accent">
                    ₹{total?.toFixed(2)}
                  </span>
                </div>
              </div>

              <CustomButton
                onclick={handleCheckout}
                className="btn-primary border border-border opacity-70 hover:opacity-95 font-semibold w-full py-4 text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all text-text-primary"
              >
                Proceed to Checkout
              </CustomButton>

              <p className="text-center text-xs text-text-muted mt-4">
                Secure Checkout - 100% Satisfaction Guaranteed
              </p>
            </div>

            <CustomButton
              onclick={() => navigate("/products")}
              className="sm:hidden w-full mt-6 btn-outline flex items-center justify-center gap-2"
            >
              <ArrowBackIcon fontSize="small" />
              Continue Shopping
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
