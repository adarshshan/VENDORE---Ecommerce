import React from 'react';
import { Modal, Box } from '@mui/material';

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactElement;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'auto',
  minWidth: 400,
  bgcolor: 'background.paper',
  borderRadius: '16px',
  boxShadow: 24,
  p: 4,
};

const CustomModal: React.FC<CustomModalProps> = ({ open, onClose, children }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        {children}
      </Box>
    </Modal>
  );
};

export default CustomModal;