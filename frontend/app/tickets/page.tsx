
"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  X,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Ticket,
  Send,
  Flag,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Priority = "Low" | "Medium" | "High" | "Urgent";

type TicketMessage = {
  id: number;
  ticket_id: number;
  sender: string;
  message: string;
  created_at: string | null;
};

type SupportTicket = {
  id: number;
  customer_id: number;
  customer: {
    id: number;
    name: string;
    email: string;
    location: string | null;
  } | null;
  subject: string;
  category: string;
  status: string;
  priority: Priority;
  date: string;
};

const statusOptions = ["Open", "In Progress", "Resolved", "Closed"];

const priorityOptions: Priority[] = [
  "Low",
  "Medium",
  "High",
  "Urgent",
];

export default function TicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [selectedTicket, setSelectedTicket] =
    useState<SupportTicket | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Status states
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusSuccess, setStatusSuccess] = useState("");

  // Priority states
  const [updatingPriority, setUpdatingPriority] = useState(false);
  const [priorityError, setPriorityError] = useState("");
  const [prioritySuccess, setPrioritySuccess] = useState("");

  // Conversation states
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState("");

  // Fetch tickets from FastAPI
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/ticket/`);

        if (!response.ok) {
          throw new Error("Unable to fetch tickets.");
        }

        const data = await response.json();

        const formattedTickets: SupportTicket[] = data.map(
          (ticket: {
            id: number;
            customer_id: number;
            issue: string;
            category: string | null;
            status: string | null;
            priority: string | null;
            created_at: string | null;
            customer: {
              id: number;
              name: string;
              email: string;
              location: string | null;
            } | null;
          }) => ({
            id: ticket.id,
            customer_id: ticket.customer_id,
            customer: ticket.customer,
            subject: ticket.issue,
            category: ticket.category || "General",
            status: ticket.status || "Open",
            priority: (ticket.priority || "Medium") as Priority,
            date: ticket.created_at
              ? new Date(ticket.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "N/A",
          })
        );

        setTickets(formattedTickets);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Update ticket status
  const updateTicketStatus = async (
    ticketId: number,
    newStatus: string
  ) => {
    try {
      setUpdatingStatus(true);
      setStatusError("");
      setStatusSuccess("");

      const response = await fetch(
        `${API_URL}/ticket/${ticketId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || "Failed to update ticket status."
        );
      }

      const updatedTicket = await response.json();

      setTickets((previous) =>
        previous.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, status: updatedTicket.status }
            : ticket
        )
      );

      setSelectedTicket((previous) =>
        previous && previous.id === ticketId
          ? { ...previous, status: updatedTicket.status }
          : previous
      );

      setStatusSuccess("Ticket status updated successfully.");
    } catch (err) {
      setStatusError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Update ticket priority
  const updateTicketPriority = async (
    ticketId: number,
    newPriority: Priority
  ) => {
    try {
      setUpdatingPriority(true);
      setPriorityError("");
      setPrioritySuccess("");

      const response = await fetch(
        `${API_URL}/ticket/${ticketId}/priority`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priority: newPriority,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || "Failed to update ticket priority."
        );
      }

      setTickets((previous) =>
        previous.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, priority: newPriority }
            : ticket
        )
      );

      setSelectedTicket((previous) =>
        previous && previous.id === ticketId
          ? { ...previous, priority: newPriority }
          : previous
      );

      setPrioritySuccess("Ticket priority updated successfully.");
    } catch (err) {
      setPriorityError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setUpdatingPriority(false);
    }
  };

  // Fetch messages when a ticket is opened
  useEffect(() => {
    if (!selectedTicket) {
      setMessages([]);
      setNewMessage("");
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        setMessageError("");
        setMessages([]);

        const response = await fetch(
          `${API_URL}/ticket/${selectedTicket.id}/messages`
        );

        if (!response.ok) {
          throw new Error("Unable to load conversation.");
        }

        const data: TicketMessage[] = await response.json();

        setMessages(data);
      } catch (err) {
        setMessageError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedTicket?.id]);

  // Send admin reply
  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) {
      return;
    }

    try {
      setSendingMessage(true);
      setMessageError("");

      const response = await fetch(
        `${API_URL}/ticket/${selectedTicket.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: "Admin",
            message: newMessage.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || "Failed to send message."
        );
      }

      const savedMessage: TicketMessage = await response.json();

      setMessages((previous) => [...previous, savedMessage]);
      setNewMessage("");
    } catch (err) {
      setMessageError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSendingMessage(false);
    }
  };

  // Search and filter
  const filteredTickets = tickets.filter((ticket) => {
    const customerName = ticket.customer?.name || "";

    const matchesSearch =
      String(ticket.id).includes(search.toLowerCase()) ||
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      ticket.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" ||
      ticket.priority === priorityFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority
    );
  });

  // Status badge styles
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-700";
      case "In Progress":
        return "bg-yellow-100 text-yellow-700";
      case "Resolved":
        return "bg-green-100 text-green-700";
      case "Closed":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // Priority badge styles
  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case "Low":
        return "bg-slate-100 text-slate-600";
      case "Medium":
        return "bg-blue-100 text-blue-700";
      case "High":
        return "bg-orange-100 text-orange-700";
      case "Urgent":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="space-y-6">

      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Customer Tickets
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Manage customer complaints and support requests.
        </p>
      </div>

      {/* Fetch Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between">
            <p className="text-sm text-slate-500">
              Total Tickets
            </p>
            <Ticket className="text-blue-600" size={22} />
          </div>

          <h2 className="text-2xl font-bold mt-3 text-slate-800">
            {tickets.length}
          </h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between">
            <p className="text-sm text-slate-500">
              Open Tickets
            </p>
            <AlertCircle className="text-red-500" size={22} />
          </div>

          <h2 className="text-2xl font-bold mt-3 text-slate-800">
            {tickets.filter((t) => t.status === "Open").length}
          </h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between">
            <p className="text-sm text-slate-500">
              In Progress
            </p>
            <Clock className="text-yellow-500" size={22} />
          </div>

          <h2 className="text-2xl font-bold mt-3 text-slate-800">
            {tickets.filter((t) => t.status === "In Progress").length}
          </h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between">
            <p className="text-sm text-slate-500">
              Resolved
            </p>
            <CheckCircle className="text-green-600" size={22} />
          </div>

          <h2 className="text-2xl font-bold mt-3 text-slate-800">
            {tickets.filter((t) => t.status === "Resolved").length}
          </h2>
        </div>

      </div>

      {/* Tickets Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        {/* Search and Filters */}
        <div className="p-5 flex flex-col xl:flex-row gap-3 xl:items-center xl:justify-between">

          {/* Search */}
          <div className="relative w-full xl:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search ticket, customer or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white"
          >
            <option value="All">All Status</option>

            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white"
          >
            <option value="All">All Priorities</option>

            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">

          <table className="w-full text-sm text-left">

            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4">Ticket ID</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Subject</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10 text-slate-500"
                  >
                    Loading tickets...
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-slate-50"
                  >

                    <td className="px-5 py-4 font-medium text-blue-600 whitespace-nowrap">
                      TKT-{ticket.id}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800 whitespace-nowrap">
                        {ticket.customer?.name || "Unknown Customer"}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {ticket.customer?.email || "N/A"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-700 min-w-48">
                      {ticket.subject}
                    </td>

                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      {ticket.category}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusStyle(ticket.status)}`}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getPriorityStyle(ticket.priority)}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                      {ticket.date}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setStatusError("");
                          setStatusSuccess("");
                          setPriorityError("");
                          setPrioritySuccess("");
                          setMessageError("");
                          setNewMessage("");
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View ticket"
                      >
                        <Eye size={18} />
                      </button>
                    </td>

                  </tr>
                ))
              )}

              {!loading && filteredTickets.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10 text-slate-500"
                  >
                    No tickets found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-100 text-sm text-slate-500">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </div>

      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (

        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">

            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Ticket Details
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  TKT-{selectedTicket.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                aria-label="Close ticket"
              >
                <X size={20} />
              </button>

            </div>

            {/* Customer Details */}
            <div className="bg-slate-50 rounded-lg p-4 mb-5">

              <h3 className="font-semibold text-slate-800 mb-3">
                Customer Information
              </h3>

              <p className="text-sm text-slate-700">
                {selectedTicket.customer?.name || "Unknown Customer"}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                {selectedTicket.customer?.email || "N/A"}
              </p>

              <p className="text-sm text-slate-500 mt-2">
                Category: {selectedTicket.category}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Created: {selectedTicket.date}
              </p>

            </div>

            {/* Issue, Status and Priority */}
            <div className="mb-5">

              <h3 className="font-semibold text-slate-800">
                {selectedTicket.subject}
              </h3>

              {/* Status */}
              <div className="mt-4">

                <label className="text-xs text-slate-500">
                  Ticket Status
                </label>

                <select
                  value={selectedTicket.status}
                  disabled={updatingStatus}
                  onChange={(e) =>
                    updateTicketStatus(
                      selectedTicket.id,
                      e.target.value
                    )
                  }
                  className="w-full mt-2 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 bg-white disabled:opacity-50"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                {updatingStatus && (
                  <p className="text-xs text-blue-600 mt-2">
                    Updating status...
                  </p>
                )}

                {statusError && (
                  <p className="text-xs text-red-600 mt-2">
                    {statusError}
                  </p>
                )}

                {statusSuccess && (
                  <p className="text-xs text-green-600 mt-2">
                    {statusSuccess}
                  </p>
                )}

              </div>

              {/* Priority */}
              <div className="mt-4">

                <label className="flex items-center gap-2 text-xs text-slate-500">
                  <Flag size={14} />
                  Ticket Priority
                </label>

                <select
                  value={selectedTicket.priority}
                  disabled={updatingPriority}
                  onChange={(e) =>
                    updateTicketPriority(
                      selectedTicket.id,
                      e.target.value as Priority
                    )
                  }
                  className="w-full mt-2 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 bg-white disabled:opacity-50"
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>

                {updatingPriority && (
                  <p className="text-xs text-blue-600 mt-2">
                    Updating priority...
                  </p>
                )}

                {priorityError && (
                  <p className="text-xs text-red-600 mt-2">
                    {priorityError}
                  </p>
                )}

                {prioritySuccess && (
                  <p className="text-xs text-green-600 mt-2">
                    {prioritySuccess}
                  </p>
                )}

              </div>

            </div>

            {/* Conversation */}
            <div className="border-t border-slate-100 pt-5">

              <div className="flex items-center gap-2 mb-4">
                <MessageSquare
                  size={18}
                  className="text-blue-600"
                />

                <h3 className="font-semibold text-slate-800">
                  Conversation
                </h3>
              </div>

              {/* Messages */}
              <div className="space-y-4 max-h-80 overflow-y-auto mb-5">

                {loadingMessages && (
                  <p className="text-sm text-slate-500 text-center py-5">
                    Loading conversation...
                  </p>
                )}

                {!loadingMessages &&
                  messages.length === 0 &&
                  !messageError && (
                    <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-4">
                      No messages yet. Start the conversation by sending a reply.
                    </p>
                  )}

                {!loadingMessages &&
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === "Admin"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      <div
                        className={`max-w-[80%] rounded-xl p-3 ${
                          msg.sender === "Admin"
                            ? "bg-blue-50 border border-blue-100"
                            : "bg-slate-100"
                        }`}
                      >

                        <p className="text-xs font-semibold text-slate-600 mb-1">
                          {msg.sender}
                        </p>

                        <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>

                        <p className="text-[11px] text-slate-400 mt-2">
                          {msg.created_at
                            ? new Date(msg.created_at).toLocaleString("en-IN")
                            : ""}
                        </p>

                      </div>

                    </div>
                  ))}

              </div>

              {/* Message Error */}
              {messageError && (
                <p className="text-sm text-red-600 mb-3">
                  {messageError}
                </p>
              )}

              {/* Admin Reply */}
              <div className="border border-slate-200 rounded-lg p-3">

                <label className="text-xs font-medium text-slate-600">
                  Write a reply
                </label>

                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={3}
                  disabled={sendingMessage}
                  className="w-full mt-2 resize-none outline-none text-sm text-slate-700 placeholder:text-slate-400 disabled:opacity-50"
                />

                <div className="flex justify-end mt-2">

                  <button
                    onClick={sendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={15} />

                    {sendingMessage
                      ? "Sending..."
                      : "Send Reply"}
                  </button>

                </div>

              </div>

            </div>

            {/* Close Button */}
            <div className="flex justify-end mt-5">

              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setStatusError("");
                  setStatusSuccess("");
                  setPriorityError("");
                  setPrioritySuccess("");
                  setMessageError("");
                  setNewMessage("");
                }}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
