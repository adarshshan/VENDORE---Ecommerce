"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/src/services/api";
import type { Address } from "@/src/types/User";
import Loading from "@/src/components/Loading";
import toast from "react-hot-toast";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HomeIcon from "@mui/icons-material/Home";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import CustomModal from "@/src/components/Modal";
import { cn } from "@/src/utils/cn";

const Addresses: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAddresses();
      if (data.success) {
        setAddresses(data.addresses);
      }
    } catch (_error) {
      toast.error("Failed to fetch addresses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const defaultAddress =
    addresses?.find((a) => a.isDefault) ||
    (addresses?.length > 0 ? addresses[0] : null);

  const handleOpenForm = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData(address);
    } else {
      setEditingAddress(null);
      setFormData({
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        isDefault: addresses?.length === 0,
      });
    }
    setIsFormOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddress?._id) {
        const data = await updateAddress(editingAddress?._id, formData);
        if (data?.success) {
          toast.success("Address updated successfully");
          setAddresses(data?.addresses);
        }
      } else {
        const data = await addAddress(formData);
        if (data?.success) {
          toast.success("Address added successfully");
          setAddresses(data?.addresses);
        }
      }
      setIsFormOpen(false);
      setIsSelectorOpen(false);
    } catch (_error) {
      toast.error("Failed to save address");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string | undefined) => {
    e.stopPropagation();
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        const data = await deleteAddress(id);
        if (data?.success) {
          toast.success("Address deleted successfully");
          setAddresses(data?.addresses);
        }
      } catch (_error) {
        toast.error("Failed to delete address");
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const data = await setDefaultAddress(id);
      if (data?.success) {
        toast.success("Default address updated");
        setAddresses(data?.addresses);
        setIsSelectorOpen(false);
      }
    } catch (_error) {
      toast.error("Failed to update default address");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-black text-text-primary mb-2">
            My Address
          </h1>
          <p className="text-text-secondary text-sm md:text-base">
            Your primary delivery address used for orders and shipping
            calculations.
          </p>
        </div>

        {!defaultAddress ? (
          <div className="bg-surface p-12 rounded-3xl border border-border text-center shadow-sm">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6">
              <HomeIcon
                sx={{ fontSize: 40, color: "var(--color-text-muted)" }}
              />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              No Address Saved
            </h2>
            <p className="text-text-secondary mb-8 max-w-sm mx-auto">
              You haven't added any delivery addresses yet.
            </p>
            <button
              onClick={() => handleOpenForm()}
              className="px-8 py-3 bg-accent text-text-inverse rounded-xl font-bold transition-all hover:opacity-90 shadow-lg shadow-accent/20"
            >
              Add New Address
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-surface p-8 rounded-3xl border-2 border-accent ring-4 ring-accent/5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <span className="inline-flex items-center px-3 py-1 bg-accent/10 text-accent text-xs font-black uppercase tracking-widest rounded-full">
                  Primary Default
                </span>
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-black text-text-primary capitalize mb-1">
                      {defaultAddress?.fullName}
                    </h3>
                    <p className="text-accent font-bold">
                      {defaultAddress?.phone}
                    </p>
                  </div>

                  <div className="text-lg text-text-secondary leading-relaxed max-w-md">
                    <p>{defaultAddress?.addressLine1}</p>
                    {defaultAddress?.addressLine2 && (
                      <p>{defaultAddress?.addressLine2}</p>
                    )}
                    <p>
                      {defaultAddress?.city}, {defaultAddress?.state} -{" "}
                      {defaultAddress?.postalCode}
                    </p>
                    <p>{defaultAddress?.country}</p>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-3 justify-end">
                  <button
                    onClick={() => handleOpenForm(defaultAddress)}
                    className="p-4 bg-background hover:bg-surface-hover text-text-secondary hover:text-accent rounded-2xl transition-all border border-border"
                    title="Edit"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, defaultAddress?._id)}
                    className="p-4 bg-background hover:bg-surface-hover text-text-secondary hover:text-error rounded-2xl transition-all border border-border"
                    title="Delete"
                  >
                    <DeleteForeverIcon />
                  </button>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setIsSelectorOpen(true)}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-text-primary text-text-inverse rounded-2xl font-bold transition-all hover:opacity-90 active:scale-[0.98] shadow-lg"
                >
                  <SwapHorizIcon />
                  Change Address
                </button>
                <button
                  onClick={() => handleOpenForm()}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-surface text-text-primary border border-border rounded-2xl font-bold transition-all hover:bg-surface-hover active:scale-[0.98]"
                >
                  <AddIcon />
                  Add New Address
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Address Selector Modal */}
      <CustomModal
        open={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        title="Select Address"
      >
        <div className="max-w-2xl w-full max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar space-y-4">
          {addresses.map((address) => (
            <div
              key={address?._id}
              onClick={() => handleSetDefault(address?._id!)}
              className={cn(
                "group relative p-5 rounded-2xl border-2 transition-all cursor-pointer text-left",
                address?.isDefault || addresses?.length === 1
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
                {address?.isDefault && (
                  <CheckCircleIcon className="text-accent" fontSize="small" />
                )}
              </div>
              <div className="text-sm text-text-secondary">
                <p className="truncate">{address?.addressLine1}</p>
                <p className="truncate">
                  {address?.city}, {address?.state} - {address?.postalCode}
                </p>
              </div>

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenForm(address);
                  }}
                  className="p-1.5 bg-background text-text-muted hover:text-accent rounded-lg border border-border"
                >
                  <EditIcon fontSize="inherit" />
                </button>
                {!address?.isDefault && (
                  <button
                    onClick={(e) => handleDelete(e, address?._id!)}
                    className="p-1.5 bg-background text-text-muted hover:text-error rounded-lg border border-border"
                  >
                    <DeleteForeverIcon fontSize="inherit" />
                  </button>
                )}
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

      {/* Add/Edit Form Modal */}
      <CustomModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingAddress ? "Edit Address" : "Add New Address"}
      >
        <div className="max-w-2xl w-full max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData?.fullName}
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
                  value={formData?.phone}
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
                value={formData?.addressLine1}
                onChange={handleInputChange}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                name="addressLine2"
                value={formData?.addressLine2}
                onChange={handleInputChange}
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
                  value={formData?.city}
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
                  value={formData?.state}
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
                  value={formData?.postalCode}
                  onChange={handleInputChange}
                  required
                  maxLength={6}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isDefault-page"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="w-5 h-5 accent-accent"
              />
              <label
                htmlFor="isDefault-page"
                className="text-sm text-text-secondary cursor-pointer"
              >
                Set as default address
              </label>
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
                className="flex-[2] px-6 py-3.5 rounded-xl font-bold bg-accent text-text-inverse shadow-lg shadow-accent/20 hover:opacity-90 transition-all active:scale-[0.98]"
              >
                {editingAddress ? "Update Address" : "Save Address"}
              </button>
            </div>
          </form>
        </div>
      </CustomModal>
    </div>
  );
};

export default Addresses;
