import React from "react";
import { Modal, Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";

interface OrderSuccessModalProps {
  open: boolean;
  onClose: () => void;
  orderId?: string;
  totalAmount?: number;
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  open,
  onClose,
  orderId,
  totalAmount,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    p: { xs: 4, sm: 6 },
    outline: "none",
    textAlign: "center",
  };

  const handleGoToOrders = () => {
    onClose();
    navigate("/orders");
  };

  const handleContinueShopping = () => {
    onClose();
    navigate("/");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      aria-labelledby="order-success-modal"
    >
      <Box sx={style}>
        <div className="flex justify-end absolute top-4 right-4">
          <IconButton
            onClick={onClose}
            size="small"
            className="text-text-secondary"
          >
            <CloseIcon />
          </IconButton>
        </div>

        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircleIcon sx={{ fontSize: 60 }} className="text-success" />
          </div>
        </div>

        <h2 className="text-2xl font-serif font-black text-text-primary mb-2">
          Order Placed!
        </h2>
        <p className="text-text-secondary mb-8">
          Your order has been placed successfully. Thank you for shopping with
          us!
        </p>

        {(orderId || totalAmount) && (
          <div className="bg-surface-light border border-border p-4 rounded-2xl mb-8 text-left space-y-2">
            {orderId && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Order ID:</span>
                <span className="text-text-primary font-mono font-bold truncate ml-4">
                  #{orderId.slice(-8).toUpperCase()}
                </span>
              </div>
            )}
            {totalAmount && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Total Amount:</span>
                <span className="text-accent font-bold">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoToOrders}
            className="w-full py-4 bg-accent hover:bg-accent-hover text-text-inverse font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-accent/20 cursor-pointer"
          >
            <AssignmentIcon fontSize="small" />
            Go to My Orders
          </button>
          <button
            onClick={handleContinueShopping}
            className="w-full py-4 bg-surface hover:bg-surface-hover text-text-primary font-bold rounded-xl transition-all duration-300 border border-border cursor-pointer flex items-center justify-center gap-2"
          >
            <ShoppingBagIcon fontSize="small" />
            Continue Shopping
          </button>
        </div>

        <p className="mt-6 text-xs text-text-muted italic">
          A confirmation email will be sent to your inbox shortly.
        </p>
      </Box>
    </Modal>
  );
};

export default OrderSuccessModal;
