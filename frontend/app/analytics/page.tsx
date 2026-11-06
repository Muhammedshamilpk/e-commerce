
"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

import {
  IndianRupee,
  ShoppingCart,
  Users,
  Package,
  RefreshCw,
  AlertTriangle,
  Ticket,
  TrendingUp,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  ArrowUpRight,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface MonthlyRevenue {
  year: number;
  month: number;
  revenue: number;
}

interface OrderStatus {
  status: string;
  count: number;
}

interface TopProduct {
  product_id: number;
  product_name: string;
  total_sold: number;
}

interface Product {
  id: number;
  name: string;
  stock: number;
}

interface Ticket {
  id: number;
  issue: string;
  status: string;
}

const chartColors = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
];

const statusColors: Record<string, string> = {
  Processing: "#F59E0B",
  Shipped: "#3B82F6",
  Delivered: "#10B981",
  Cancelled: "#EF4444",
};

const formatCurrency = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function AnalyticsPage() {
  const [sales, setSales] = useState(0);
  const [orders, setOrders] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [products, setProducts] = useState(0);

  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatus[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [openTickets, setOpenTickets] = useState<Ticket[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch Analytics Data
  useEffect(() => {
    let cancelled = false;

    const fetchAnalytics = async () => {
      try {
        if (refreshKey === 0) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const endpoints = [
          "total_sales",
          "total_orders",
          "total_customers",
          "total_products",
          "monthly_revenue",
          "order_status",
          "top_products",
          "low_stocks",
          "open_tickets",
        ];

        const responses = await Promise.all(
          endpoints.map((endpoint) =>
            fetch(`${API_URL}/analytics/${endpoint}`)
          )
        );

        if (responses.some((response) => !response.ok)) {
          throw new Error("Unable to fetch analytics data.");
        }

        const [
          salesData,
          ordersData,
          customersData,
          productsData,
          revenueData,
          statusData,
          topData,
          stockData,
          ticketData,
        ] = await Promise.all(
          responses.map((response) => response.json())
        );

        if (cancelled) return;

        setSales(Number(salesData.total_sales || 0));
        setOrders(Number(ordersData.total_orders || 0));
        setCustomers(Number(customersData.total_customers || 0));
        setProducts(Number(productsData.total_products || 0));

        setMonthlyRevenue(
          Array.isArray(revenueData) ? revenueData : []
        );

        setOrderStatus(
          Array.isArray(statusData) ? statusData : []
        );

        setTopProducts(
          Array.isArray(topData) ? topData : []
        );

        setLowStock(
          Array.isArray(stockData.products)
            ? stockData.products
            : []
        );

        setOpenTickets(
          Array.isArray(ticketData.tickets)
            ? ticketData.tickets
            : []
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // Summary Cards
  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(sales),
      icon: IndianRupee,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "Revenue from delivered orders",
    },
    {
      title: "Total Orders",
      value: orders.toLocaleString("en-IN"),
      icon: ShoppingCart,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      description: "Orders recorded in the store",
    },
    {
      title: "Total Customers",
      value: customers.toLocaleString("en-IN"),
      icon: Users,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      description: "Registered customers",
    },
    {
      title: "Total Products",
      value: products.toLocaleString("en-IN"),
      icon: Package,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      description: "Products in your catalogue",
    },
  ];

  // Revenue Chart Data
  const revenueChartData = [...monthlyRevenue]
    .sort(
      (a, b) =>
        a.year - b.year || a.month - b.month
    )
    .map((item) => ({
      month: new Date(
        item.year,
        item.month - 1
      ).toLocaleString("en", {
        month: "short",
        year: "2-digit",
      }),
      revenue: Number(item.revenue || 0),
    }));

  // Order Status Total
  const totalStatusOrders = orderStatus.reduce(
    (sum, item) => sum + Number(item.count || 0),
    0
  );

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-blue-600" size={30} />
          <p className="text-sm font-medium text-slate-500">
            Loading analytics dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-8">
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle size={24} />
          <h2 className="font-semibold">Unable to load analytics</h2>
        </div>

        <p className="mt-3 text-sm text-slate-500">{error}</p>

        <button
          onClick={() => setRefreshKey((prev) => prev + 1)}
          className="mt-5 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-7 bg-slate-50/70 p-4 sm:p-6">

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Analytics Overview
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor your store performance and business activities.
          </p>
        </div>

        <button
          onClick={() => setRefreshKey((prev) => prev + 1)}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>

      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-800">
                    {card.value}
                  </h2>
                </div>

                <div
                  className={`rounded-xl p-3 ${card.iconBg}`}
                >
                  <Icon
                    size={22}
                    className={card.iconColor}
                  />
                </div>

              </div>

              <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3">
                <ArrowUpRight size={14} className="text-slate-400" />

                <p className="text-xs text-slate-400">
                  {card.description}
                </p>
              </div>

            </div>
          );
        })}

      </div>

      {/* Revenue and Order Status */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Monthly Revenue */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Monthly Revenue
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Revenue generated from delivered orders
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-2">
              <TrendingUp size={19} className="text-blue-600" />
            </div>
          </div>

          <div className="h-72">

            {revenueChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No revenue data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueChartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 5,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#3B82F6"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#3B82F6"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#E2E8F0"
                  />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                    dy={10}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                    tickFormatter={(value) =>
                      value >= 1000
                        ? `₹${(value / 1000).toFixed(0)}k`
                        : `₹${value}`
                    }
                    width={65}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 5px 20px rgba(0,0,0,0.06)",
                    }}
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "Revenue",
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fill="url(#revenueGradient)"
                    activeDot={{
                      r: 6,
                      strokeWidth: 3,
                      stroke: "#DBEAFE",
                    }}
                  />

                </AreaChart>
              </ResponsiveContainer>
            )}

          </div>
        </div>

        {/* Order Status */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-800">
              Order Status
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Breakdown of orders by current status
            </p>
          </div>

          {orderStatus.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-sm text-slate-400">
              No order status data available.
            </div>
          ) : (
            <>
              <div className="relative h-60">

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={100}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {orderStatus.map((item, index) => (
                        <Cell
                          key={item.status}
                          fill={
                            statusColors[item.status] ||
                            chartColors[index % chartColors.length]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 5px 20px rgba(0,0,0,0.06)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-800">
                    {totalStatusOrders}
                  </span>

                  <span className="mt-1 text-xs text-slate-400">
                    Total Orders
                  </span>
                </div>

              </div>

              {/* Status Legend */}
              <div className="mt-2 grid grid-cols-2 gap-3">

                {orderStatus.map((item, index) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            statusColors[item.status] ||
                            chartColors[index % chartColors.length],
                        }}
                      />

                      <span className="text-xs font-medium text-slate-600">
                        {item.status}
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-slate-800">
                      {item.count}
                    </span>
                  </div>
                ))}

              </div>
            </>
          )}

        </div>

      </div>

      {/* Top Selling Products */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">

        <div className="mb-6">
          <h2 className="text-base font-semibold text-slate-800">
            Top Selling Products
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Best performing products based on units sold
          </p>
        </div>

        <div className="h-80">

          {topProducts.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No product sales data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 20,
                  left: 15,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  horizontal={false}
                  stroke="#E2E8F0"
                />

                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 12 }}
                  allowDecimals={false}
                />

                <YAxis
                  type="category"
                  dataKey="product_name"
                  width={130}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 5px 20px rgba(0,0,0,0.06)",
                  }}
                />

                <Bar
                  dataKey="total_sold"
                  name="Units Sold"
                  fill="#3B82F6"
                  barSize={25}
                  radius={[0, 6, 6, 0]}
                />

              </BarChart>
            </ResponsiveContainer>
          )}

        </div>

      </div>

      {/* Low Stock and Open Tickets */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Low Stock Products */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-50 p-2.5">
                <AlertTriangle
                  size={20}
                  className="text-orange-600"
                />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  Low Stock Products
                </h2>

                <p className="text-xs text-slate-400">
                  Products that need restocking
                </p>
              </div>
            </div>

            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
              {lowStock.length} Items
            </span>

          </div>

          {lowStock.length === 0 ? (
            <div className="rounded-xl bg-emerald-50 p-4 text-center text-sm text-emerald-700">
              <CheckCircle2
                size={20}
                className="mx-auto mb-2"
              />
              All products have sufficient stock.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">

                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400">
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 text-right font-medium">
                      Available Stock
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {lowStock.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="py-4 font-medium text-slate-700">
                        {product.name}
                      </td>

                      <td className="py-4 text-right">
                        <span className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
                          {product.stock} units
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>

        {/* Open Tickets */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5">
                <Ticket size={20} className="text-blue-600" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  Open Tickets
                </h2>

                <p className="text-xs text-slate-400">
                  Customer support requests
                </p>
              </div>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              {openTickets.length} Tickets
            </span>

          </div>

          {openTickets.length === 0 ? (
            <div className="rounded-xl bg-emerald-50 p-4 text-center text-sm text-emerald-700">
              <CheckCircle2
                size={20}
                className="mx-auto mb-2"
              />
              No open tickets at the moment.
            </div>
          ) : (
            <div className="space-y-1">

              {openTickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
                >
                  <div className="flex min-w-0 items-center gap-3">

                    <div className="rounded-lg bg-slate-100 p-2">
                      <Ticket
                        size={16}
                        className="text-slate-500"
                      />
                    </div>

                    <p className="truncate text-sm font-medium text-slate-700">
                      {ticket.issue}
                    </p>

                  </div>

                  <span className="shrink-0 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                    #{ticket.id}
                  </span>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
