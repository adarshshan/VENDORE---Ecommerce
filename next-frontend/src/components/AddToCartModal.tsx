"use client";
import React from "react";
import { Modal, Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { Product } from "@/src/types/Product";

interface AddToCartModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  selectedSize?: string | null;
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({
  open,
  onClose,
  product,
  selectedSize,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!product) return null;

  const style = {
    position: "absolute" as "absolute",
    top: isMobile ? "auto" : "50%",
    bottom: isMobile ? 0 : "auto",
    left: "50%",
    transform: isMobile ? "translateX(-50%)" : "translate(-50%, -50%)",
    width: isMobile ? "100%" : 450,
    bgcolor: "var(--color-surface)",
    border: isMobile ? "none" : "1px solid var(--color-border)",
    borderTopLeftRadius: "24px",
    borderTopRightRadius: "24px",
    borderBottomLeftRadius: isMobile ? 0 : "24px",
    borderBottomRightRadius: isMobile ? 0 : "24px",
    boxShadow: 24,
    p: { xs: 3, sm: 4 },
    outline: "none",
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      aria-labelledby="add-to-cart-modal"
    >
      <Box sx={style}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-success">
            <CheckCircleIcon color="success" />
            <span className="font-bold text-lg">Added to Cart</span>
          </div>
          <IconButton
            onClick={onClose}
            size="small"
            className="text-text-secondary"
          >
            <CloseIcon />
          </IconButton>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-border">
            <img
              src={product?.images?.[0]?.url}
              alt={product?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-bold text-text-primary text-lg capitalize line-clamp-1">
              {product?.name}
            </h3>
            {selectedSize && (
              <p className="text-text-secondary text-sm mt-1">
                Size:{" "}
                <span className="font-bold text-text-primary">
                  {selectedSize}
                </span>
              </p>
            )}
            <p className="font-bold text-accent mt-1">
              ₹{product?.price?.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onClose();
              router.push("/cart");
            }}
            className="w-full py-4 bg-accent hover:bg-accent-hover text-text-inverse font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
          >
            <ShoppingBagIcon fontSize="small" />
            View Shopping Cart
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 bg-surface hover:bg-surface-hover text-text-primary font-bold rounded-xl transition-all duration-300 border border-border"
          >
            Continue Shopping
          </button>
        </div>
      </Box>
    </Modal>
  );
};

export default AddToCartModal;

