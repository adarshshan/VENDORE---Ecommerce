import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import CustomModal from "../components/Modal";
import { Button } from "@mui/material";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-grow p-8">
        {children}
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpen}
          style={{ marginTop: "20px" }}
        >
          Add Product
        </Button>
      </main>
    </div>
  );
};

export default AdminLayout;
