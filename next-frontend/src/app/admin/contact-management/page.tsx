"use client";
import React, { useEffect, useState } from "react";
import { getAllContacts, updateContactStatus } from "@/src/services/api";
import {
  Visibility as ViewIcon,
  CheckCircle as ResolvedIcon,
  Loop as InProgressIcon,
  FiberNew as NewIcon,
} from "@mui/icons-material";
import Pagination from "@/src/components/Pagination";

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "New" | "In Progress" | "Resolved";
  createdAt: string;
}

const ContactManagement: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchContacts(page);
  }, [page]);

  const fetchContacts = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await getAllContacts(pageNum, 10);
      setContacts(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateContactStatus(id, newStatus);
      fetchContacts(page);
      if (selectedContact?._id === id) {
        setSelectedContact((prev) =>
          prev ? { ...prev, status: newStatus as any } : null,
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "text-blue-400 bg-blue-400/10";
      case "In Progress":
        return "text-amber-400 bg-amber-400/10";
      case "Resolved":
        return "text-emerald-400 bg-emerald-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black">Contact Management</h1>
          <p className="text-text-secondary">
            View and respond to customer inquiries
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Contact List */}
        <div className="xl:col-span-2">
          <div className="card bg-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-light">
                    <th className="px-6 py-4 text-sm font-semibold text-text-secondary">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-text-secondary">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-text-secondary">
                      Status
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-text-secondary">
                      Date
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-text-secondary">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-text-secondary"
                      >
                        Loading contacts...
                      </td>
                    </tr>
                  ) : contacts?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-text-secondary"
                      >
                        No contact messages found.
                      </td>
                    </tr>
                  ) : (
                    contacts?.map((contact) => (
                      <tr
                        key={contact?._id}
                        className="hover:bg-surface-light transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium ">{contact?.name}</div>
                          <div className="text-xs text-text-secondary">
                            {contact?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="line-clamp-1">{contact?.subject}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(contact?.status)}`}
                          >
                            {contact?.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {new Date(contact?.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedContact(contact)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                          >
                            <ViewIcon fontSize="small" />
                          </button>
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
        </div>

        {/* Details Panel */}
        <div className="xl:col-span-1">
          {selectedContact ? (
            <div className="card bg-surface p-6 sticky top-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold">Message Details</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedContact.status)}`}
                >
                  {selectedContact.status}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    From
                  </label>
                  <div className="text-white font-medium">
                    {selectedContact?.name}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {selectedContact?.email}
                  </div>
                  {selectedContact?.phone && (
                    <div className="text-sm text-text-secondary">
                      {selectedContact?.phone}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Subject
                  </label>
                  <div className="font-medium text-text-secondary">
                    {selectedContact?.subject}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Message
                  </label>
                  <div className="bg-surface-light p-4 rounded-lg border border-border mt-2 text-text-secondary text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedContact.message}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Update Status
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <button
                      onClick={() =>
                        handleStatusChange(selectedContact._id, "New")
                      }
                      className={`flex flex-col items-center p-2 rounded-lg border border-border transition-all ${selectedContact.status === "New" ? "bg-blue-400/20 border-blue-400 text-blue-400" : "hover:bg-surface-light text-text-secondary"}`}
                    >
                      <NewIcon fontSize="small" />
                      <span className="text-[10px] mt-1 font-bold">New</span>
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(selectedContact._id, "In Progress")
                      }
                      className={`flex flex-col items-center p-2 rounded-lg border border-border transition-all ${selectedContact.status === "In Progress" ? "bg-amber-400/20 border-amber-400 text-amber-400" : "hover:bg-surface-light text-text-secondary"}`}
                    >
                      <InProgressIcon fontSize="small" />
                      <span className="text-[10px] mt-1 font-bold">
                        Progress
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(selectedContact._id, "Resolved")
                      }
                      className={`flex flex-col items-center p-2 rounded-lg border border-border transition-all ${selectedContact.status === "Resolved" ? "bg-emerald-400/20 border-emerald-400 text-emerald-400" : "hover:bg-surface-light text-text-secondary"}`}
                    >
                      <ResolvedIcon fontSize="small" />
                      <span className="text-[10px] mt-1 font-bold">
                        Resolved
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card bg-surface p-12 text-center flex flex-col items-center justify-center border-dashed">
              <div className="bg-surface-light p-4 rounded-full mb-4">
                <ViewIcon className="text-text-muted" fontSize="large" />
              </div>
              <p className="text-text-secondary">
                Select a message to view details and update status
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactManagement;

