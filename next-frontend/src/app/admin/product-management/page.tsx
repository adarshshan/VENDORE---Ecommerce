"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/src/services/api";
import type { Product } from "@/src/types/Product";
import ProductForm from "@/src/components/ProductForm";
import CustomModal from "@/src/components/Modal";
import Pagination from "@/src/components/Pagination";
import { useStore } from "@/src/store/useStore";

const ProductManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const { isModalOpen, openModal, closeModal } = useStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", page],
    queryFn: () => getProducts({ page, limit: 10 }),
  });

  const products = data?.products || [];
  const totalPages = data?.totalPages || 0;

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
      setSelectedProduct(null);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    openModal();
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    openModal();
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleSaveProduct = (productData: FormData) => {
    if (selectedProduct) {
      productData.append("_id", String(selectedProduct?._id));
      updateProductMutation.mutate(productData);
    } else {
      createProductMutation.mutate(productData);
    }
  };

  if (isError) return <div>Error fetching products</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <button
          onClick={handleAddProduct}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Product
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-light">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product Name
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-text-secondary"
                >
                  Loading Products...
                </td>
              </tr>
            ) : products?.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-text-secondary"
                >
                  No Products found.
                </td>
              </tr>
            ) : (
              products?.map((product) => (
                <tr
                  key={product?._id}
                  onClick={() => handleEditProduct(product)}
                  className="bg-[var(--color-surface)] hover:bg-surface-light transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium">{product?.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">
                      ₹{product?.price.toLocaleString("en-IN")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">
                      {product?.categories?.[0]?.name ?? "Uncategorized"}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-medium">
                      {product?.hasSizes
                        ? product?.sizes?.reduce((acc, s) => acc + s.stock, 0)
                        : (product?.stock ?? 0)}
                    </div>
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
      <CustomModal open={isModalOpen} onClose={closeModal}>
        <ProductForm
          product={selectedProduct}
          onSave={handleSaveProduct}
          onCancel={closeModal}
          handleDeleteProduct={handleDeleteProduct}
        />
      </CustomModal>
    </div>
  );
};

export default ProductManagement;

