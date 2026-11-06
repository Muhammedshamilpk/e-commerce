
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  IndianRupee,
  ShoppingCart,
  Package,
  Users,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type MonthlyRevenue = {
  year: number;
  month: number;
  revenue: number;
};

type OrderStatus = {
  status: string;
  count: number;
};

type RecentOrder = {
  id: number;
  customer_id: number;
  product_id: number;
  quantity: number;
  order_date: string | null;
  status: string;
  total_amount: number;
  customer?: {
    name: string;
    email?: string;
    location?: string;
  } | null;
  product?: {
    name: string;
  } | null;
};

type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
};

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const statusColors: Record<string, string> = {
  Delivered: "bg-green-500",
  Processing: "bg-yellow-500",
  Shipped: "bg-blue-500",
  Cancelled: "bg-red-500",
};

const statusBadgeColors: Record<string, string> = {
  Delivered: "bg-green-100 text-green-700",
  Processing: "bg-yellow-100 text-yellow-700",
  Shipped: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatNumber = (number: number) =>
  new Intl.NumberFormat("en-IN").format(number);

const formatDate = (date: string | null) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Dashboard() {
  const [today, setToday] = useState<Date | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });

  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all dashboard data
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const endpoints = [
        `${API_URL}/analytics/total_sales`,
        `${API_URL}/analytics/total_orders`,
        `${API_URL}/analytics/total_products`,
        `${API_URL}/analytics/total_customers`,
        `${API_URL}/analytics/monthly_revenue`,
        `${API_URL}/analytics/order_status`,
        `${API_URL}/order/`,
      ];

      const responses = await Promise.all(
        endpoints.map((url) => fetch(url))
      );

      const failedResponse = responses.find(
        (response) => !response.ok
      );

      if (failedResponse) {
        throw new Error(
          `Unable to load dashboard data (${failedResponse.status})`
        );
      }

      const [
        salesData,
        ordersData,
        productsData,
        customersData,
        revenueData,
        statusData,
        recentOrdersData,
      ] = await Promise.all(
        responses.map((response) => response.json())
      );

      setStats({
        totalRevenue: Number(salesData.total_sales || 0),
        totalOrders: Number(ordersData.total_orders || 0),
        totalProducts: Number(productsData.total_products || 0),
        totalCustomers: Number(customersData.total_customers || 0),
      });

      setMonthlyRevenue(
        Array.isArray(revenueData) ? revenueData : []
      );

      setOrderStatuses(
        Array.isArray(statusData) ? statusData : []
      );

      const sortedOrders = (
        Array.isArray(recentOrdersData) ? recentOrdersData : []
      )
        .sort(
          (a: RecentOrder, b: RecentOrder) =>
            new Date(b.order_date || 0).getTime() -
            new Date(a.order_date || 0).getTime()
        )
        .slice(0, 5);

      setRecentOrders(sortedOrders);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize current date after mounting
  useEffect(() => {
    setToday(new Date());
    loadDashboard();
  }, [loadDashboard]);

  // Prepare the latest 12 months for the chart
  const chartData = today
    ? Array.from({ length: 12 }, (_, index) => {
        const date = new Date(
          today.getFullYear(),
          today.getMonth() - 11 + index,
          1
        );

        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const found = monthlyRevenue.find(
          (item) => item.year === year && item.month === month
        );

        return {
          month: monthNames[date.getMonth()],
          year,
          revenue: found?.revenue || 0,
        };
      })
    : [];

  const maxRevenue = Math.max(
    ...chartData.map((item) => item.revenue),
    1
  );

  // Calculate order status percentages
  const totalStatusOrders = orderStatuses.reduce(
    (total, item) => total + item.count,
    0
  );

  const displayedStatuses = [
    "Delivered",
    "Processing",
    "Shipped",
    "Cancelled",
  ].map((status) => {
    const found = orderStatuses.find(
      (item) => item.status?.toLowerCase() === status.toLowerCase()
    );

    const count = found?.count || 0;

    return {
      name: status,
      count,
      percent:
        totalStatusOrders > 0
          ? (count / totalStatusOrders) * 100
          : 0,
      color: statusColors[status],
    };
  });

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: IndianRupee,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Orders",
      value: formatNumber(stats.totalOrders),
      icon: ShoppingCart,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Products",
      value: formatNumber(stats.totalProducts),
      icon: Package,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Total Customers",
      value: formatNumber(stats.totalCustomers),
      icon: Users,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">

      {/* Welcome Section */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Welcome back, Admin!
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh Data
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>

          <button
            onClick={loadDashboard}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {stat.title}
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-slate-800">
                    {loading ? "..." : stat.value}
                  </h3>
                </div>

                <div className={`rounded-lg p-3 ${stat.color}`}>
                  <Icon size={23} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  Live database data
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales Overview and Order Status */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* Monthly Revenue Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 xl:col-span-2">

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-800">
                Sales Overview
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Monthly delivered-order revenue (last 12 months)
              </p>
            </div>

            <span className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
              Last 12 Months
            </span>
          </div>

          {loading || !today ? (
            <div className="flex h-56 items-center justify-center text-sm text-slate-400">
              Loading sales data...
            </div>
          ) : (
            <>
              <div className="mb-3 text-sm font-semibold text-slate-700">
                Revenue
              </div>

              <div className="flex h-52 items-end gap-2 border-b border-slate-200 px-1 sm:gap-4 sm:px-2">
                {chartData.map((item, index) => (
                  <div
                    key={`${item.year}-${item.month}-${index}`}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div
                      className="flex w-full flex-1 items-end justify-center"
                      title={`${item.month} ${item.year}: ${formatCurrency(item.revenue)}`}
                    >
                      <div
                        className="w-full max-w-10 rounded-t-md bg-blue-500 transition-all hover:bg-blue-600"
                        style={{
                          height:
                            item.revenue > 0
                              ? `${Math.max(
                                  (item.revenue / maxRevenue) * 100,
                                  2
                                )}%`
                              : "0%",
                        }}
                      />
                    </div>

                    <span className="pb-2 text-[10px] text-slate-500 sm:text-xs">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 text-xs text-slate-400">
                Hover over a bar to view its revenue.
              </div>
            </>
          )}
        </div>

        {/* Order Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">

          <h3 className="font-semibold text-slate-800">
            Order Status
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Current order distribution
          </p>

          <div className="mt-7 space-y-6">
            {loading ? (
              <div className="py-10 text-center text-sm text-slate-400">
                Loading order status...
              </div>
            ) : (
              displayedStatuses.map((item) => (
                <div key={item.name}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-600">
                      {item.name}
                    </span>

                    <span className="font-medium text-slate-800">
                      {formatNumber(item.count)}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${item.color}`}
                      style={{
                        width: `${item.percent}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {!loading && (
            <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-400">
              Total orders: {formatNumber(totalStatusOrders)}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

        <div className="flex items-center justify-between p-5">
          <div>
            <h3 className="font-semibold text-slate-800">
              Recent Orders
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Latest customer orders
            </p>
          </div>

          <Link
            href="/orders"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="whitespace-nowrap px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Product</th>
                <th className="whitespace-nowrap px-5 py-3">Date</th>
                <th className="whitespace-nowrap px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    Loading recent orders...
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-blue-600">
                      #{`ORD-${String(order.id).padStart(4, "0")}`}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {order.customer?.name || "Unknown Customer"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {order.product?.name || "Unknown Product"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {formatDate(order.order_date)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">
                      {formatCurrency(Number(order.total_amount || 0))}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                          statusBadgeColors[order.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
