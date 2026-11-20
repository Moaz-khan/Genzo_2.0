import React, { useEffect, useState } from 'react';
import { Users, Mail, RefreshCw, ShoppingBag, Download } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [view, setView] = useState<'customers' | 'subscribers'>('customers');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [custRes, subRes] = await Promise.all([
        adminApi.getCustomers(),
        adminApi.getSubscribers(),
      ]);
      if (custRes.success) setCustomers(custRes.data);
      if (subRes.success) setSubscribers(subRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatPKR = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleExportCSV = () => {
    if (view === 'customers') {
      if (customers.length === 0) return alert('No customers to export.');
      const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Orders Count', 'Total Spent (PKR)'];
      const rows = customers.map((c) => [
        c.id,
        `"${(c.full_name || '').replace(/"/g, '""')}"`,
        `"${c.email || ''}"`,
        `"${c.phone || ''}"`,
        c.orders_count || 0,
        c.total_spent || 0,
      ]);
      const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csv));
      link.setAttribute('download', `genzo_clients_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      if (subscribers.length === 0) return alert('No subscribers to export.');
      const headers = ['Email', 'Subscribed At', 'Status'];
      const rows = subscribers.map((s) => [
        `"${s.email || ''}"`,
        `"${new Date(s.subscribed_at).toLocaleDateString()}"`,
        `"${s.status || 'active'}"`,
      ]);
      const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csv));
      link.setAttribute('download', `genzo_newsletter_subscribers_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-white">Clientèle & Community</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Registered customer profiles and newsletter subscribers in TiDB
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-700/80 text-zinc-300 hover:text-white"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => setView('customers')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition ${
                view === 'customers' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users size={14} />
              <span>Registered Clients ({customers.length})</span>
            </button>
            <button
              onClick={() => setView('subscribers')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition ${
                view === 'subscribers' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Mail size={14} />
              <span>Inner Circle Subscribers ({subscribers.length})</span>
            </button>
          </div>
          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-xl border silver-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 text-xs flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
            <span>Loading user records...</span>
          </div>
        ) : view === 'customers' ? (
          customers.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 text-xs">
              No registered clients yet. New users will appear here when they sign up!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-medium">Customer Name</th>
                    <th className="py-3 px-4 font-medium">Email Address</th>
                    <th className="py-3 px-4 font-medium">Phone Number</th>
                    <th className="py-3 px-4 font-medium">Orders Placed</th>
                    <th className="py-3 px-4 font-medium">Lifetime Spend</th>
                    <th className="py-3 px-4 font-medium">Member Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-900/30 transition">
                      <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center font-semibold text-[11px] text-zinc-300">
                          {c.fullName?.[0] || 'C'}
                        </div>
                        <span>{c.fullName}</span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-300 font-mono text-[11px]">{c.email}</td>
                      <td className="py-3.5 px-4 text-zinc-400">{c.phone || '—'}</td>
                      <td className="py-3.5 px-4 text-zinc-300">
                        <span className="inline-flex items-center gap-1">
                          <ShoppingBag size={12} className="text-zinc-500" />
                          <span>{c.orderCount} order(s)</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">
                        {formatPKR(c.totalSpent)}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs">
            No newsletter subscribers registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-medium">Subscriber Email</th>
                  <th className="py-3 px-4 font-medium">Membership Status</th>
                  <th className="py-3 px-4 font-medium">Subscribed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-900/30 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-zinc-200">{s.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 uppercase">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">
                      {new Date(s.subscribedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
