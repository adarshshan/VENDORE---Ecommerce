import React from "react";
import { Modal, Box } from "@mui/material";

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactElement;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "auto",
  minWidth: 400,
  bgcolor: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "16px",
  boxShadow: 24,
  p: 4,
  outline: "none",
};

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onClose,
  title,
  children,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        {title && (
          <h2 id="modal-modal-title" className="text-xl font-bold mb-4 text-text-primary">
            {title}
          </h2>
        )}
        {children}
      </Box>
    </Modal>
  );
};

export default CustomModal;
