import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  deleteUser,
  blockUser,
  unblockUser,
} from "../../services/api";
import type { User } from "../../types/User";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data: users,
    isLoading,
    isError,
  } = useQuery<User[]>({ queryKey: ["users"], queryFn: getUsers });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const unblockUserMutation = useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleDeleteUser = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(id);
    }
  };

  const handleBlockUser = (id: string) => {
    if (window.confirm("Are you sure you want to block this user?")) {
      blockUserMutation.mutate(id);
    }
  };

  const handleUnblockUser = (id: string) => {
    if (window.confirm("Are you sure you want to unblock this user?")) {
      unblockUserMutation.mutate(id);
    }
  };

  if (isError) return <div>Error fetching users</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-light">
              <th className="px-6 py-4 text-sm font-semibold text-text-secondary">
                Name
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-text-secondary">
                Email
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-text-secondary">
                Role
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-text-secondary">
                Status
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-text-secondary">
                Actions
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
                  Loading contacts...
                </td>
              </tr>
            ) : users?.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-text-secondary"
                >
                  No Users found.
                </td>
              </tr>
            ) : (
              users?.map((user) => (
                <tr
                  key={user?._id}
                  className="bg-[var(--color-surface)] hover:bg-surface-light transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{user?.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{user?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{user?.role}</div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{user?.status}</div>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteUser(String(user?._id))}
                      className="text-green-500 px-2 py-1 rounded mr-2"
                    >
                      <DeleteIcon />
                    </button>
                    {user?.status === "active" ? (
                      <button
                        title="Block User"
                        onClick={() => handleBlockUser(String(user?._id))}
                        className="text-red-500 px-2 py-1 rounded"
                      >
                        <BlockIcon />
                      </button>
                    ) : (
                      <button
                        title="Unblock User"
                        onClick={() => handleUnblockUser(String(user?._id))}
                        className="text-red-500 px-2 py-1 rounded"
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
  );
};

export default UserManagement;
