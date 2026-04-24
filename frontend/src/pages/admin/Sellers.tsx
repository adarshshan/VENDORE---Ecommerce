import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSellers,
  createSeller,
  blockSeller,
  unblockSeller,
} from "../../services/api";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import Modal from "../../components/Modal";
import CustomButton from "../../components/CustomButton";
import Pagination from "../../components/Pagination";

const Sellers: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["sellers", page],
    queryFn: () => getSellers(page, 10),
  });

  const sellers = data?.sellers || [];
  const totalPages = data?.totalPages || 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const createSellerMutation = useMutation({
    mutationFn: createSeller,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "" });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to create seller");
    },
  });

  const blockSellerMutation = useMutation({
    mutationFn: blockSeller,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
    },
  });

  const unblockSellerMutation = useMutation({
    mutationFn: unblockSeller,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
    },
  });

  const handleBlockSeller = (id: string) => {
    if (window.confirm("Are you sure you want to block this seller?")) {
      blockSellerMutation.mutate(id);
    }
  };

  const handleUnblockSeller = (id: string) => {
    if (window.confirm("Are you sure you want to unblock this seller?")) {
      unblockSellerMutation.mutate(id);
    }
  };

  const handleCreateSeller = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    createSellerMutation.mutate(formData);
  };

  if (isError)
    return <div className="p-4 text-error">Error fetching sellers</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Seller Management
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl hover:bg-accent-dark transition-all"
        >
          <AddIcon /> Create Seller
        </button>
      </div>

      <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-border bg-surface-light">
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary">
                  Name
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary">
                  Email
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary">
                  Status
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-text-secondary text-right">
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
                    Loading sellers...
                  </td>
                </tr>
              ) : sellers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-text-secondary"
                  >
                    No sellers found.
                  </td>
                </tr>
              ) : (
                sellers.map((seller: any) => (
                  <tr
                    key={seller._id}
                    className="hover:bg-surface-light transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {seller.name}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {seller.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          seller.status === "active"
                            ? "bg-success/10 text-success"
                            : "bg-error/10 text-error"
                        }`}
                      >
                        {seller.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {seller.status === "active" ? (
                        <button
                          title="Block Seller"
                          onClick={() => handleBlockSeller(seller._id)}
                          className="text-error p-2 hover:bg-error/10 rounded-lg transition-all"
                        >
                          <BlockIcon />
                        </button>
                      ) : (
                        <button
                          title="Unblock Seller"
                          onClick={() => handleUnblockSeller(seller._id)}
                          className="text-success p-2 hover:bg-success/10 rounded-lg transition-all"
                        >
                          <CheckCircleIcon />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Seller"
      >
        <form
          onSubmit={handleCreateSeller}
          className="space-y-4 pt-4 !text-text-primary"
        >
          {error && (
            <div className="bg-error/10 border border-error/20 text-error p-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2 px-1">
              Name
            </label>
            <input
              type="text"
              required
              className="w-full bg-surface-light border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2 px-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full bg-surface-light border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2 px-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full bg-surface-light border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
          <div className="pt-2">
            <CustomButton
              type="submit"
              disabled={createSellerMutation.isPending}
            >
              {createSellerMutation.isPending ? "Creating..." : "Create Seller"}
            </CustomButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sellers;
