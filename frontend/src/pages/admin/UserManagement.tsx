import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, deleteUser, blockUser, unblockUser } from "../../services/api";
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

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching users</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user._id}>
                <td className="py-2 ps-8 pe-4 border-b">{user.name}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.role}</td>
                <td className="py-2 px-4 border-b text-center">
                  {user.status}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    title="Delete"
                    onClick={() => handleDeleteUser(String(user._id))}
                    className="text-red-500 px-2 py-1 rounded"
                  >
                    <DeleteIcon />
                  </button>
                  {user.status === "active" ? (
                    <button
                      title="Block User"
                      onClick={() => handleBlockUser(String(user._id))}
                      className="text-yellow-500 px-2 py-1 rounded ml-2"
                    >
                      <BlockIcon />
                    </button>
                  ) : (
                    <button
                      title="Unblock User"
                      onClick={() => handleUnblockUser(String(user._id))}
                      className="text-blue-500 px-2 py-1 rounded ml-2"
                    >
                      <CheckCircleIcon />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
