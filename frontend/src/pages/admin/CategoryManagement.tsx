import React, { useState, useEffect } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/api";
import { TextField, Typography, MenuItem } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomModal from "../../components/Modal";
import Pagination from "../../components/Pagination";

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Active",
  });

  const fetchCategories = async (pageNum?: number) => {
    setIsLoading(true);
    try {
      const data = await getCategories(undefined, pageNum, 10);
      if (data.categories) {
        setCategories(data.categories);
        setTotalPages(data.totalPages);
      } else {
        setCategories(data);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching categories", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(page);
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleOpen = (category: any = null) => {
    if (category) {
      setEditMode(true);
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        status: category.status,
      });
    } else {
      setEditMode(false);
      setSelectedCategory(null);
      setFormData({ name: "", description: "", status: "Active" });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ name: "", description: "", status: "Active" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode && selectedCategory) {
        await updateCategory(selectedCategory._id, formData);
      } else {
        await createCategory(formData);
      }
      fetchCategories();
      handleClose();
    } catch (error: any) {
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id);
        fetchCategories();
      } catch (error: any) {
        alert(error.response?.data?.message || "Delete failed");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <button
          onClick={() => handleOpen()}
          className="bg-accent text-text-inverse px-4 py-2 rounded font-bold hover:bg-accent-hover transition-colors"
        >
          Add Category
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-light">
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-text-secondary"
                >
                  Loading Categories...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-text-secondary"
                >
                  No Categories found.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr
                  key={cat._id}
                  className="bg-surface hover:bg-surface-light transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary">
                      {cat.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary">
                      {cat.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs text-white ${cat.status === "Active" ? "bg-success" : "bg-error"}`}
                    >
                      {cat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleOpen(cat)}
                      className="text-success px-2 py-1 rounded mr-2"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="text-error px-2 py-1 rounded"
                    >
                      <DeleteIcon />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <CustomModal open={open} onClose={handleClose}>
        <div className="w-full max-w-md bg-transparent text-text-primary">
          <Typography variant="h5" className="font-bold mb-6 text-center">
            {editMode ? "Edit Category" : "Add Category"}
          </Typography>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              InputProps={{
                className: "text-text-primary border border-border",
              }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              InputProps={{
                className: "text-text-primary border border-border",
              }}
            />
            <TextField
              select
              label="Status"
              fullWidth
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              InputProps={{
                className: "text-text-primary border border-border",
              }}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
            <div className="flex justify-end mt-6 gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="border-text-secondary text-text-secondary hover:text-text-primary hover:bg-surface-hover font-bold py-2 px-4 rounded-md border transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-accent hover:bg-accent-hover text-text-inverse font-bold py-2 px-4 rounded-md transition-colors"
              >
                {editMode ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </CustomModal>
    </div>
  );
};

export default CategoryManagement;
