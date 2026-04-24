"use client";
import React, { useState, useEffect } from "react";
import {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerVisibility,
} from "@/src/services/api";
import { TextField, Typography, Switch, FormControlLabel } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomModal from "@/src/components/Modal";
import { type Banner } from "@/src/types/Banner";
import toast from "react-hot-toast";

const BannerManagement: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    link: "",
    priority: 0,
    isActive: true,
  });

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const data = await getAllBanners();
      if (data.success) {
        setBanners(data.banners);
      }
    } catch (error) {
      console.error("Error fetching banners", error);
      toast.error("Failed to load banners");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpen = (banner: Banner | null = null) => {
    if (banner) {
      setEditMode(true);
      setSelectedBanner(banner);
      setFormData({
        title: banner.title,
        link: banner.link || "",
        priority: banner.priority,
        isActive: banner.isActive,
      });
      setImagePreview(banner.image);
    } else {
      setEditMode(false);
      setSelectedBanner(null);
      setFormData({ title: "", link: "", priority: 0, isActive: true });
      setImagePreview(null);
    }
    setImageFile(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ title: "", link: "", priority: 0, isActive: true });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editMode && !imageFile) {
      toast.error("Please select an image");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("link", formData.link);
    data.append("priority", formData.priority.toString());
    data.append("isActive", formData.isActive.toString());
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      let response;
      if (editMode && selectedBanner) {
        response = await updateBanner(selectedBanner._id, data);
      } else {
        response = await createBanner(data);
      }

      if (response.success) {
        toast.success(
          `Banner ${editMode ? "updated" : "created"} successfully`,
        );
        fetchBanners();
        handleClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        const response = await deleteBanner(id);
        if (response.success) {
          toast.success("Banner deleted successfully");
          fetchBanners();
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleToggleVisibility = async (id: string) => {
    try {
      const response = await toggleBannerVisibility(id);
      if (response.success) {
        toast.success("Visibility toggled");
        setBanners(banners.map((b) => (b._id === id ? response.banner : b)));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Toggle failed");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Banner Management
        </h1>
        <button
          onClick={() => handleOpen()}
          className="bg-accent text-text-inverse px-4 py-2 rounded font-bold hover:bg-accent-hover transition-colors"
        >
          Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-text-secondary">
            Loading Banners...
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-full text-center py-12 text-text-secondary">
            No Banners found.
          </div>
        ) : (
          banners.map((banner) => (
            <div
              key={banner._id}
              className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-40">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => handleOpen(banner)}
                    className="p-2 bg-white/80 hover:bg-white text-success rounded-full shadow-sm"
                  >
                    <EditIcon fontSize="small" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="p-2 bg-white/80 hover:bg-white text-error rounded-full shadow-sm"
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-text-primary truncate flex-1 mr-2">
                    {banner.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${banner.isActive ? "bg-success/20 text-success" : "bg-error/20 text-error"}`}
                  >
                    {banner.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-text-secondary text-sm mb-4 truncate">
                  {banner.link || "No redirect link"}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-xs">
                    Priority: {banner.priority}
                  </span>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={banner.isActive}
                        onChange={() => handleToggleVisibility(banner._id)}
                        size="small"
                        color="primary"
                      />
                    }
                    label={
                      <span className="text-xs text-text-secondary">
                        Visible
                      </span>
                    }
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <CustomModal open={open} onClose={handleClose}>
        <div className="w-full max-w-lg bg-transparent text-text-primary">
          <Typography variant="h5" className="font-bold mb-6 text-center">
            {editMode ? "Edit Banner" : "Add New Banner"}
          </Typography>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="Banner Title"
              fullWidth
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Summer Sale 2024"
            />
            <TextField
              label="Redirect Link (URL)"
              fullWidth
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              placeholder="/products?category=summer"
            />
            <div className="flex gap-4">
              <TextField
                label="Priority"
                type="number"
                fullWidth
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: parseInt(e.target.value) || 0,
                  })
                }
                helperText="Lower numbers appear first"
              />
              <div className="flex items-center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">
                Banner Image
              </label>
              <div
                className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-accent transition-colors"
                onClick={() =>
                  document.getElementById("banner-image-input")?.click()
                }
              >
                {imagePreview ? (
                  <div className="relative inline-block w-full h-32">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md">
                      <span className="text-white text-xs font-bold">
                        Change Image
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <p className="text-text-secondary">Click to upload image</p>
                    <p className="text-[10px] text-text-secondary mt-1">
                      Recommended: 1920x600 for best quality
                    </p>
                  </div>
                )}
                <input
                  id="banner-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className="flex justify-end mt-8 gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="border-text-secondary text-text-secondary hover:text-text-primary hover:bg-surface-hover font-bold py-2 px-6 rounded-md border transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-accent hover:bg-accent-hover text-text-inverse font-bold py-2 px-6 rounded-md transition-colors"
              >
                {editMode ? "Update Banner" : "Create Banner"}
              </button>
            </div>
          </form>
        </div>
      </CustomModal>
    </div>
  );
};

export default BannerManagement;

