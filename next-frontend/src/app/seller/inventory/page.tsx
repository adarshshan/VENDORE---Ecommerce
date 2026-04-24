"use client";
import React, { useState, useEffect } from "react";
import { getInventory, updateQuantity } from "@/src/services/sellerApi";
import { getCategories } from "@/src/services/api";
import Loading from "@/src/components/Loading";
import SearchIcon from "@mui/icons-material/Search";
import Pagination from "@/src/components/Pagination";
import Modal from "@/src/components/Modal";

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [updateLoading, setUpdateLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories([{ _id: "All", name: "All" }, ...data]);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await getInventory({
        category: activeCategory === "All" ? "" : activeCategory,
        search: debouncedSearch,
        page: currentPage,
        limit: 10,
      });
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error fetching inventory", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [currentPage, activeCategory, debouncedSearch]);

  const handleOpenUpdateModal = (product: any) => {
    setSelectedProduct(product);
    if (product.hasSizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0].size);
      setNewStock(product.sizes[0].stock);
    } else {
      setSelectedSize("");
      setNewStock(product.stock);
    }
    setIsUpdateModalOpen(true);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    const sizeData = selectedProduct.sizes.find((s: any) => s.size === size);
    if (sizeData) {
      setNewStock(sizeData.stock);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct) return;
    try {
      setUpdateLoading(true);
      const updateData: any = {};
      if (selectedProduct.hasSizes) {
        updateData.sizeStock = { size: selectedSize, stock: newStock };
      } else {
        updateData.stock = newStock;
      }

      await updateQuantity(selectedProduct._id, updateData);
      setIsUpdateModalOpen(false);
      fetchInventory();
    } catch (err) {
      console.error("Error updating stock", err);
      alert("Failed to update stock");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading && currentPage === 1 && !debouncedSearch) return <Loading />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between sm:gap-6">
        <h1 className="text-3xl font-serif font-black text-text-primary">
          Inventory
        </h1>

        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            className="w-full bg-surface border border-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => {
              setActiveCategory(cat._id);
              setCurrentPage(1);
            }}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
              activeCategory === cat._id
                ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                : "bg-surface border-border text-text-muted hover:border-accent/50"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-light border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted">
                  Product
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted">
                  Category
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted">
                  Stock
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products?.length > 0 ? (
                products?.map((product) => (
                  <tr
                    key={product?._id}
                    className="hover:bg-surface-light/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 rounded-lg bg-surface-light overflow-hidden flex-shrink-0">
                          <img
                            src={product?.images[0]?.url}
                            alt={product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-text-primary truncate">
                            {product?.name}
                          </p>
                          <p className="text-xs text-text-muted">
                            ₹{product?.price?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">
                        {product?.category?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product?.hasSizes ? (
                        <div className="flex flex-wrap gap-1">
                          {product?.sizes?.map((s: any) => (
                            <span
                              key={s?.size}
                              className="text-[10px] font-bold bg-surface-light border border-border px-1.5 py-0.5 rounded uppercase"
                            >
                              {s?.size}:{" "}
                              <span
                                className={
                                  s?.stock < 5
                                    ? "text-error"
                                    : "text-text-primary"
                                }
                              >
                                {s?.stock}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span
                          className={`text-sm font-bold ${product?.stock < 5 ? "text-error" : "text-text-primary"}`}
                        >
                          {product?.stock} units
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenUpdateModal(product)}
                        className="text-accent text-sm font-bold uppercase tracking-widest hover:underline"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-text-muted"
                  >
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Update Stock Modal */}
      <Modal
        open={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Quantity"
      >
        <div className="bg-surface max-w-md w-full">
          <p className="text-text-secondary text-sm mb-6">
            {selectedProduct?.name}
          </p>

          <div className="space-y-6">
            {selectedProduct?.hasSizes && (
              <div>
                <label className="block text-sm font-bold uppercase tracking-widest text-text-muted mb-2 px-1">
                  Select Size
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {selectedProduct.sizes.map((s: any) => (
                    <button
                      key={s.size}
                      onClick={() => handleSizeChange(s.size)}
                      className={`py-2 rounded-xl text-xs font-bold uppercase border transition-all ${
                        selectedSize === s.size
                          ? "bg-accent border-accent text-white"
                          : "bg-surface-light border-border text-text-muted hover:border-accent/50"
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold uppercase tracking-widest text-text-muted mb-2 px-1">
                New Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                className="w-full bg-surface-light border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                value={newStock}
                onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="flex-1 py-4 font-bold text-text-muted hover:bg-surface-light rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={updateLoading}
                onClick={handleUpdateStock}
                className="flex-[1.5] bg-accent text-white py-4 rounded-xl font-bold shadow-lg shadow-accent/20 hover:opacity-90 transition-all disabled:opacity-50"
              >
                {updateLoading ? "Updating..." : "Update Stock"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;

