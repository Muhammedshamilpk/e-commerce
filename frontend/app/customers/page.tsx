
"use client";

import { useState } from "react";
import {
  Search,
  Eye,
  X,
  Users,
  ShoppingBag,
  IndianRupee,
  UserCheck,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

type CustomerOrder = {
  id: string;
  product: string;
  date: string;
  amount: number;
  status: string;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joined: string;
  status: string;
  orders: CustomerOrder[];
};

const initialCustomers: Customer[] = [
  {
    id: "CUS-1001",
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "+91 9876543210",
    address: "Kochi, Kerala",
    joined: "12 Aug 2026",
    status: "Active",
    orders: [
      {
        id: "ORD-1001",
        product: "RO Water Purifier",
        date: "04 Nov 2026",
        amount: 12500,
        status: "Delivered",
      },
      {
        id: "ORD-1006",
        product: "Water Filter",
        date: "15 Sep 2026",
        amount: 2500,
        status: "Delivered",
      },
    ],
  },
  {
    id: "CUS-1002",
    name: "Priya Nair",
    email: "priya@gmail.com",
    phone: "+91 9876543211",
    address: "Thrissur, Kerala",
    joined: "20 Aug 2026",
    status: "Active",
    orders: [
      {
        id: "ORD-1002",
        product: "Water Softener",
        date: "03 Nov 2026",
        amount: 8900,
        status: "Processing",
      },
    ],
  },
  {
    id: "CUS-1003",
    name: "Arun Kumar",
    email: "arun@gmail.com",
    phone: "+91 9876543212",
    address: "Kozhikode, Kerala",
    joined: "05 Sep 2026",
    status: "Active",
    orders: [
      {
        id: "ORD-1003",
        product: "Shower Filter",
        date: "03 Nov 2026",
        amount: 4800,
        status: "Shipped",
      },
      {
        id: "ORD-1007",
        product: "RO Membrane",
        date: "12 Oct 2026",
        amount: 3500,
        status: "Delivered",
      },
      {
        id: "ORD-1008",
        product: "Water Filter",
        date: "20 Sep 2026",
        amount: 1800,
        status: "Delivered",
      },
    ],
  },
  {
    id: "CUS-1004",
    name: "Sneha Menon",
    email: "sneha@gmail.com",
    phone: "+91 9876543213",
    address: "Kannur, Kerala",
    joined: "15 Sep 2026",
    status: "Active",
    orders: [
      {
        id: "ORD-1004",
        product: "RO Membrane",
        date: "02 Nov 2026",
        amount: 3500,
        status: "Delivered",
      },
    ],
  },
  {
    id: "CUS-1005",
    name: "Vishnu Raj",
    email: "vishnu@gmail.com",
    phone: "+91 9876543214",
    address: "Ernakulam, Kerala",
    joined: "25 Sep 2026",
    status: "Inactive",
    orders: [
      {
        id: "ORD-1005",
        product: "Water Purifier Filter",
        date: "01 Nov 2026",
        amount: 3600,
        status: "Cancelled",
      },
    ],
  },
  {
    id: "CUS-1006",
    name: "Anjali Krishnan",
    email: "anjali@gmail.com",
    phone: "+91 9876543215",
    address: "Palakkad, Kerala",
    joined: "02 Oct 2026",
    status: "Active",
    orders: [],
  },
];

export default function CustomersPage() {
  const [customers, setCustomers] =
    useState<Customer[]>(initialCustomers);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  // Calculate customer spending
  const getTotalSpent = (customer: Customer) =>
    customer.orders.reduce(
      (total, order) => total + order.amount,
      0
    );

  // Search and Filter
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone.includes(search) ||
      customer.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Update Customer Status
  const updateCustomerStatus = (
    id: string,
    status: string
  ) => {
    setCustomers((previous) =>
      previous.map((customer) =>
        customer.id === id
          ? { ...customer, status }
          : customer
      )
    );

    setSelectedCustomer((previous) =>
      previous && previous.id === id
        ? { ...previous, status }
        : previous
    );
  };

  return (
    <div className="space-y-6">

      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Customers
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage customer accounts and purchase history.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">
              Total Customers
            </p>
            <Users size={22} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mt-3">
            {customers.length}
          </h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">
              Active Customers
            </p>
            <UserCheck size={22} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mt-3">
            {customers.filter((c) => c.status === "Active").length}
          </h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">
              Total Orders
            </p>
            <ShoppingBag size={22} className="text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mt-3">
            {customers.reduce(
              (total, customer) => total + customer.orders.length,
              0
            )}
          </h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">
              Total Revenue
            </p>
            <IndianRupee size={22} className="text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mt-3">
            ₹{customers.reduce(
              (total, customer) =>
                total + getTotalSpent(customer),
              0
            ).toLocaleString("en-IN")}
          </h2>
        </div>

      </div>

      {/* Customer Table */}
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
              placeholder="Search name, email, phone or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 bg-white"
          >
            <option value="All">All Customers</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

        </div>

        {/* Customers Table */}
        <div className="overflow-x-auto">

          <table className="w-full text-sm text-left">

            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Customer ID</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Orders</th>
                <th className="px-5 py-4">Total Spent</th>
                <th className="px-5 py-4">Joined Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-slate-50"
                >

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                        {customer.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)}
                      </div>

                      <div>
                        <p className="font-medium text-slate-800 whitespace-nowrap">
                          {customer.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {customer.email}
                        </p>
                      </div>

                    </div>
                  </td>

                  <td className="px-5 py-4 text-blue-600 font-medium whitespace-nowrap">
                    {customer.id}
                  </td>

                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                    {customer.phone}
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {customer.orders.length}
                  </td>

                  <td className="px-5 py-4 font-medium text-slate-800 whitespace-nowrap">
                    ₹{getTotalSpent(customer).toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                    {customer.joined}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        customer.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="View customer"
                    >
                      <Eye size={18} />
                    </button>
                  </td>

                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10 text-slate-500"
                  >
                    No customers found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        <div className="p-4 border-t border-slate-100 text-sm text-slate-500">
          Showing {filteredCustomers.length} of {customers.length} customers
        </div>

      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (

        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Customer Details
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedCustomer.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                aria-label="Close customer details"
              >
                <X size={20} />
              </button>

            </div>

            {/* Customer Profile */}
            <div className="bg-slate-50 rounded-xl p-5 mb-5">

              <div className="flex items-center gap-4 mb-5">

                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
                  {selectedCustomer.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {selectedCustomer.id}
                  </p>
                </div>

              </div>

              <div className="space-y-3">

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={17} className="text-slate-400" />
                  {selectedCustomer.email}
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={17} className="text-slate-400" />
                  {selectedCustomer.phone}
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <MapPin size={17} className="text-slate-400" />
                  {selectedCustomer.address}
                </div>

              </div>

            </div>

            {/* Customer Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-6">

              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-500">
                  Total Orders
                </p>
                <h3 className="text-xl font-bold text-slate-800 mt-2">
                  {selectedCustomer.orders.length}
                </h3>
              </div>

              <div className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-500">
                  Total Spent
                </p>
                <h3 className="text-xl font-bold text-slate-800 mt-2">
                  ₹{getTotalSpent(selectedCustomer).toLocaleString("en-IN")}
                </h3>
              </div>

            </div>

            {/* Account Information */}
            <div className="border-b border-slate-100 pb-5 mb-5">

              <h3 className="font-semibold text-slate-800 mb-3">
                Account Information
              </h3>

              <p className="text-sm text-slate-500 mb-3">
                Joined Date: {selectedCustomer.joined}
              </p>

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Account Status
              </label>

              <select
                value={selectedCustomer.status}
                onChange={(e) =>
                  updateCustomerStatus(
                    selectedCustomer.id,
                    e.target.value
                  )
                }
                className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-700 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

            </div>

            {/* Order History */}
            <div>

              <h3 className="font-semibold text-slate-800 mb-4">
                Order History
              </h3>

              {selectedCustomer.orders.length > 0 ? (

                <div className="overflow-x-auto">

                  <table className="w-full text-sm text-left">

                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Product</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {selectedCustomer.orders.map((order) => (
                        <tr key={order.id}>

                          <td className="p-3 text-blue-600 whitespace-nowrap">
                            {order.id}
                          </td>

                          <td className="p-3 text-slate-600">
                            {order.product}
                            <p className="text-xs text-slate-400 mt-1">
                              {order.date}
                            </p>
                          </td>

                          <td className="p-3 font-medium text-slate-800 whitespace-nowrap">
                            ₹{order.amount.toLocaleString("en-IN")}
                          </td>

                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.status === "Delivered"
                                ? "bg-green-100 text-green-700"
                                : order.status === "Cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }`}>
                              {order.status}
                            </span>
                          </td>

                        </tr>
                      ))}

                    </tbody>

                  </table>

                </div>

              ) : (
                <p className="text-sm text-slate-500 py-5 text-center bg-slate-50 rounded-lg">
                  This customer has not placed any orders yet.
                </p>
              )}

            </div>

            {/* Footer */}
            <div className="flex justify-end mt-6">

              <button
                onClick={() => setSelectedCustomer(null)}
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
