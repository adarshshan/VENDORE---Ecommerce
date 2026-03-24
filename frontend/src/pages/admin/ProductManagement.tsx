import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/api";
import type { Product } from "../../types/Product";
import ProductForm from "../../components/ProductForm";
import CustomModal from "../../components/Modal";
import { useStore } from "../../store/useStore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const ProductManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { isModalOpen, openModal, closeModal } = useStore();

  const {
    data: products,
    isLoading,
    isError,
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

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

  if (isLoading) return <div>Loading...</div>;
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
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Product Name</th>
              <th className="py-2 px-4 border-b">Price</th>
              <th className="py-2 px-4 border-b">Category</th>
              <th className="py-2 px-4 border-b">Stock</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product._id}>
                <td className="py-2 ps-8 pe-4 border-b">{product.name}</td>
                <td className="py-2 px-4 border-b text-center">
                  ${product.price}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {typeof product.category === 'object' ? product.category.name : 'Uncategorized'}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {product.stock}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="text-green-500 px-2 py-1 rounded mr-2"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(String(product._id))}
                    className="text-red-500 px-2 py-1 rounded"
                  >
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CustomModal open={isModalOpen} onClose={closeModal}>
        <ProductForm
          product={selectedProduct}
          onSave={handleSaveProduct}
          onCancel={closeModal}
        />
      </CustomModal>
    </div>
  );
};

export default ProductManagement;
