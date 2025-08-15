import React from 'react';
import { Modal, Box, Alert, AlertTitle } from '@mui/material';

interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  message: string;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const AlertModal: React.FC<AlertModalProps> = ({ open, onClose, message }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="alert-modal-title"
      aria-describedby="alert-modal-description"
    >
      <Box sx={style}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {message}
        </Alert>
      </Box>
    </Modal>
  );
};

export default AlertModal;
