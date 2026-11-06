
"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  X,
  ShoppingCart,
  IndianRupee,
  Clock,
  CheckCircle,
  Truck,
} from "lucide-react";

// Frontend order structure
type Order = {
  id: string;
  customer: string;
  email: string;
  product: string;
  quantity: number;
  date: string;
  amount: number;
  payment: string;
  status: string;
  address: string;
};

// Data structure received from FastAPI
type APIOrder = {
  id: number;
  customer_id: number;
  product_id: number;
  quantity: number;
  order_date: string | null;
  status: string;
  total_amount: number;
  customer: {
    id: number;
    name: string;
    email: string;
    location: string | null;
  } | null;
  product: {
    id: number;
    name: string;
  } | null;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const statusOptions = [
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/order/`);

        if (!response.ok) {
          throw new Error("Failed to fetch orders from the server.");
        }

        const data: APIOrder[] = await response.json();

        // Convert backend data into frontend format
        const formattedOrders: Order[] = data.map((order) => ({
          id: `ORD-${String(order.id).padStart(4, "0")}`,

          customer: order.customer?.name || "Unknown Customer",

          email: order.customer?.email || "N/A",

          product: order.product?.name || "Unknown Product",

          quantity: order.quantity,

          date: order.order_date
            ? new Date(order.order_date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "N/A",

          amount: Number(order.total_amount || 0),

          // Payment status is not currently available in the Order model.
          payment: "N/A",

          status: order.status,

          address: order.customer?.location || "N/A",
        }));

        setOrders(formattedOrders);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while fetching orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Search and Filter
  const filteredOrders = orders.filter((order) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      order.id.toLowerCase().includes(searchText) ||
      order.customer.toLowerCase().includes(searchText) ||
      order.product.toLowerCase().includes(searchText);

    const matchesStatus =
      filterStatus === "All" || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Update Order Status (currently updates frontend state only)
  const updateStatus = (id: string, status: string) => {
    setOrders((previous) =>
      previous.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );

    setSelectedOrder((previous) =>
      previous && previous.id === id
        ? { ...previous, status }
        : previous
    );
  };

  // Status Styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";

      case "Processing":
        return "bg-yellow-100 text-yellow-700";

      case "Shipped":
        return "bg-blue-100 text-blue-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="p-6 text-slate-600">
        Loading orders...
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600 font-medium">{error}</p>
        <p className="text-sm text-slate-500 mt-2">
          Please check whether your FastAPI backend is running.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Orders
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Manage and track all customer orders.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* Total Orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">Total Orders</p>
            <ShoppingCart className="text-blue-600" size={22} />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mt-3">
            {orders.length}
          </h2>
        </div>

        {/* Processing */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">Processing</p>
            <Clock className="text-yellow-500" size={22} />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mt-3">
            {orders.filter((o) => o.status === "Processing").length}
          </h2>
        </div>

        {/* Shipped */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">Shipped</p>
            <Truck className="text-blue-600" size={22} />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mt-3">
            {orders.filter((o) => o.status === "Shipped").length}
          </h2>
        </div>

        {/* Delivered */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">Delivered</p>
            <CheckCircle className="text-green-600" size={22} />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mt-3">
            {orders.filter((o) => o.status === "Delivered").length}
          </h2>
        </div>

      </div>

      {/* Revenue Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-3">

          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <IndianRupee size={22} />
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Total Order Value
            </p>

            <h2 className="text-2xl font-bold text-slate-800">
              ₹
              {orders
                .reduce((sum, order) => sum + order.amount, 0)
                .toLocaleString("en-IN")}
            </h2>
          </div>

        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        {/* Search and Filter */}
        <div className="p-5 flex flex-col sm:flex-row gap-3 sm:justify-between">

          <div className="relative w-full sm:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search order ID or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 bg-white"
          >
            <option value="All">All Orders</option>

            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">

            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">

                  <td className="px-5 py-4 font-medium text-blue-600">
                    {order.id}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">
                      {order.customer}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {order.email}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {order.product}

                    <p className="text-xs text-slate-400">
                      Qty: {order.quantity}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                    {order.date}
                  </td>

                  <td className="px-5 py-4 font-medium text-slate-800 whitespace-nowrap">
                    ₹{order.amount.toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-slate-500">
                      {order.payment}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="View order details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>

                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10 text-slate-500"
                  >
                    No orders found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>
        </div>

        <div className="p-4 border-t border-slate-100 text-sm text-slate-500">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>

      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-100 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">

            {/* Modal Heading */}
            <div className="flex justify-between items-center mb-6">

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Order Details
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {selectedOrder.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                aria-label="Close order details"
              >
                <X size={20} />
              </button>

            </div>

            {/* Customer Details */}
            <div className="border-b border-slate-100 pb-4 space-y-2">

              <h3 className="font-semibold text-slate-800">
                Customer Information
              </h3>

              <p className="text-sm text-slate-600">
                {selectedOrder.customer}
              </p>

              <p className="text-sm text-slate-500">
                {selectedOrder.email}
              </p>

              <p className="text-sm text-slate-500">
                {selectedOrder.address}
              </p>

            </div>

            {/* Product Details */}
            <div className="border-b border-slate-100 py-4 space-y-2">

              <h3 className="font-semibold text-slate-800">
                Product Information
              </h3>

              <p className="text-sm text-slate-600">
                {selectedOrder.product}
              </p>

              <p className="text-sm text-slate-500">
                Quantity: {selectedOrder.quantity}
              </p>

              <p className="text-sm font-semibold text-slate-800">
                Amount: ₹
                {selectedOrder.amount.toLocaleString("en-IN")}
              </p>

            </div>

            {/* Payment Information */}
            <div className="py-4 border-b border-slate-100">

              <h3 className="font-semibold text-slate-800 mb-2">
                Payment Information
              </h3>

              <p className="text-sm text-slate-600">
                Payment Status: {selectedOrder.payment}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Order Date: {selectedOrder.date}
              </p>

            </div>

            {/* Update Status */}
            <div className="pt-4">

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Update Order Status
              </label>

              <select
                value={selectedOrder.status}
                onChange={(e) =>
                  updateStatus(selectedOrder.id, e.target.value)
                }
                className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-700 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <p className="text-xs text-slate-400 mt-2">
                Status changes are currently temporary and will not be saved to the database.
              </p>

            </div>

            {/* Done Button */}
            <div className="flex justify-end mt-6">

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                Done
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
