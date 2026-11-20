import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { adminApi } from '../services/adminApi';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  completedOrders: number;
  lowStockProducts: number;
  weeklySales: Array<{ date: string; day: string; revenue: number; orderCount: number }>;
  topProducts: Array<{ name: string; category: string; sold: number; price: number }>;
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    paymentMethod: string;
    orderStatus: string;
  }>;
}

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await adminApi.getStats();
      setStats(res.data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load dashboard statistics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleRetry = () => {
    setLoading(true);
    fetchStats();
  };

  const formatPKR = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <div className="w-8 h-8 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
          <span className="text-sm">Loading Atelier Metrics...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md text-center space-y-4">
          <p className="text-sm text-rose-300">{error || 'Dashboard statistics are unavailable.'}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white hover:bg-zinc-800 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-white">Dashboard Overview</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time performance metrics powered by TiDB Cloud Serverless
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs">
            <ShieldCheck size={14} />
            <span>TiDB Connected</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Orders */}
        <div className="glass-panel p-5 rounded-xl border silver-border">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs uppercase font-medium tracking-wider">Total Orders</span>
            <span className="p-2 bg-zinc-900 rounded-lg text-zinc-300">
              <ShoppingBag size={18} />
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats?.totalOrders || 0}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">{stats?.pendingOrders || 0}</span>
            <span>pending review</span>
          </p>
        </div>

        {/* Total Revenue */}
        <div className="glass-panel p-5 rounded-xl border silver-border">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs uppercase font-medium tracking-wider">Total Revenue</span>
            <span className="p-2 bg-zinc-900 rounded-lg text-emerald-400">
              <TrendingUp size={18} />
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatPKR(stats?.totalRevenue || 0)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Verified checkout orders</p>
        </div>

        {/* Total Products */}
        <div className="glass-panel p-5 rounded-xl border silver-border">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs uppercase font-medium tracking-wider">Catalog Pieces</span>
            <span className="p-2 bg-zinc-900 rounded-lg text-zinc-300">
              <Package size={18} />
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats?.totalProducts || 0}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">925 Sterling Silver pieces</p>
        </div>

        {/* Total Customers */}
        <div className="glass-panel p-5 rounded-xl border silver-border">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs uppercase font-medium tracking-wider">Clients Registered</span>
            <span className="p-2 bg-zinc-900 rounded-lg text-zinc-300">
              <Users size={18} />
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats?.totalCustomers || 0}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Inner Circle members</p>
        </div>

        {/* Completed Orders */}
        <div className="glass-panel p-5 rounded-xl border silver-border">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs uppercase font-medium tracking-wider">Completed Orders</span>
            <span className="p-2 bg-zinc-900 rounded-lg text-emerald-400">
              <CheckCircle2 size={18} />
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{stats.completedOrders}</div>
          <p className="text-[11px] text-zinc-400 mt-1">Delivered to customers</p>
        </div>

        {/* Low Stock Products */}
        <div className="glass-panel p-5 rounded-xl border silver-border">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs uppercase font-medium tracking-wider">Low Stock Products</span>
            <span className="p-2 bg-zinc-900 rounded-lg text-amber-400">
              <AlertTriangle size={18} />
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{stats.lowStockProducts}</div>
          <p className="text-[11px] text-zinc-400 mt-1">5 or fewer units remaining</p>
        </div>
      </div>

      {/* Visual Analytics & Top Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Sales Chart — Real Data from TiDB */}
        <div className="lg:col-span-2 glass-panel rounded-xl border silver-border p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-semibold text-white">Sales & Order Cadence</h2>
              <p className="text-xs text-zinc-400">7-Day atelier performance (live from database)</p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded">
              Live Data
            </span>
          </div>

          {stats?.weeklySales && stats.weeklySales.length > 0 ? (() => {
            const maxRev = Math.max(...stats.weeklySales.map((d) => d.revenue), 1);
            return (
              <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-zinc-800/80 pb-2">
                {stats.weeklySales.map((col) => {
                  const pct = maxRev > 0
                    ? Math.max((col.revenue / maxRev) * 100, col.revenue > 0 ? 8 : 3)
                    : 3;
                  return (
                    <div key={col.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <span className="text-[10px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        {col.revenue > 0 ? formatPKR(col.revenue) : '—'}
                      </span>
                      <div
                        style={{ height: `${pct}%` }}
                        className={`w-full max-w-[36px] rounded-t-md transition ${col.revenue > 0 ? 'bg-gradient-to-t from-zinc-700 to-zinc-300 group-hover:from-emerald-700 group-hover:to-emerald-400' : 'bg-zinc-900 border border-zinc-800'}`}
                      />
                      <span className="text-[11px] text-zinc-400 font-medium">{col.day}</span>
                    </div>
                  );
                })}
              </div>
            );
          })() : (
            <div className="h-44 flex items-center justify-center text-zinc-500 text-xs">
              No order data in the last 7 days yet.
            </div>
          )}
        </div>

        {/* Top-Selling Products — Real Data from TiDB */}
        <div className="glass-panel rounded-xl border silver-border p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-white">Top Creations</h2>
            <span className="text-[10px] uppercase font-bold text-zinc-400">By Sales Volume</span>
          </div>
          <div className="space-y-3">
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              stats.topProducts.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800">
                  <div>
                    <strong className="text-white block font-medium">{p.name}</strong>
                    <span className="text-[10px] text-zinc-400">{p.category || 'Product'}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-400 block font-semibold">{formatPKR(p.price)}</span>
                    <span className="text-[10px] text-zinc-400">{p.sold} sold</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-500 text-center py-6">
                No sales data yet. Orders will appear here.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-xl border silver-border p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">Recent Orders</h2>
              <p className="text-xs text-zinc-400">Latest orders placed on the store</p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 font-medium transition"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Payment</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-900/40 transition">
                      <td className="py-3 font-mono font-medium text-zinc-200">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 text-zinc-300">
                        <div>{order.customerName}</div>
                        <div className="text-[10px] text-zinc-400">{order.customerPhone}</div>
                      </td>
                      <td className="py-3 font-medium text-white">
                        {formatPKR(order.totalAmount)}
                      </td>
                      <td className="py-3 uppercase text-[11px] text-zinc-400">
                        {order.paymentMethod}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                            order.orderStatus === 'confirmed'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : order.orderStatus === 'dispatched'
                                ? 'bg-sky-950/60 text-sky-400 border border-sky-800/40'
                                : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                          }`}
                        >
                          {order.orderStatus.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-400">
                      No orders placed yet. Place a test order through the storefront!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Launch & Status (1 col) */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="glass-panel rounded-xl border silver-border p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('products')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 text-xs text-zinc-200 transition"
              >
                <span className="flex items-center gap-2.5">
                  <Package size={16} className="text-zinc-400" />
                  <span>Add New Product Piece</span>
                </span>
                <ArrowRight size={14} className="text-zinc-400" />
              </button>

              <button
                onClick={() => onNavigate('orders')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 text-xs text-zinc-200 transition"
              >
                <span className="flex items-center gap-2.5">
                  <Clock size={16} className="text-amber-400" />
                  <span>Review Pending Payments</span>
                </span>
                <ArrowRight size={14} className="text-zinc-400" />
              </button>

              <button
                onClick={() => onNavigate('settings')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 text-xs text-zinc-200 transition"
              >
                <span className="flex items-center gap-2.5">
                  <TrendingUp size={16} className="text-zinc-400" />
                  <span>Update Delivery Threshold</span>
                </span>
                <ArrowRight size={14} className="text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Database Info Box */}
          <div className="glass-panel rounded-xl border silver-border p-6">
            <h3 className="text-xs uppercase tracking-wider text-zinc-400 font-medium mb-3">
              Infrastructure Status
            </h3>
            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-400">Database Engine</span>
                <span className="font-mono text-zinc-200">TiDB Cloud v8.5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">AWS Region</span>
                <span className="font-mono text-zinc-200">Tokyo (ap-northeast-1)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Database</span>
                <span className="font-mono text-zinc-200">genzo_silver</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Encryption</span>
                <span className="text-emerald-400">TLS v1.2 / bcrypt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
