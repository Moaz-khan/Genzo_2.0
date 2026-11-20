import React, { useEffect, useState } from 'react';
import { MessageSquare, RefreshCw, Phone } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getInquiries();
      if (res.success) {
        setInquiries(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await adminApi.updateInquiryStatus(id, status);
      if (res.success) {
        setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status } : inq)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-white">Client Inquiries</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Questions, concierge requests, and WhatsApp contact messages
          </p>
        </div>
        <button
          onClick={fetchInquiries}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-700/80 text-zinc-300 hover:text-white"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="glass-panel rounded-xl border silver-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 text-xs flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
            <span>Loading inquiries...</span>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs">
            No inquiries recorded yet. Customer messages from the website and WhatsApp will appear here!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-medium">Sender</th>
                  <th className="py-3 px-4 font-medium">Channel</th>
                  <th className="py-3 px-4 font-medium">Subject / Message</th>
                  <th className="py-3 px-4 font-medium">Date Received</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-zinc-900/30 transition">
                    <td className="py-3.5 px-4 text-zinc-200">
                      <div className="font-semibold text-white">{inq.name}</div>
                      <div className="text-[11px] text-zinc-400">{inq.email || inq.phone || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          inq.channel === 'whatsapp'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        {inq.channel === 'whatsapp' ? <Phone size={10} /> : <MessageSquare size={10} />}
                        <span>{inq.channel}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300 max-w-sm">
                      {inq.subject && (
                        <div className="font-medium text-white text-[11px] mb-0.5">{inq.subject}</div>
                      )}
                      <p className="line-clamp-2 text-zinc-400 text-[11px]">{inq.message}</p>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">
                      {new Date(inq.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                        className={`bg-zinc-900 border rounded px-2 py-1 text-[11px] font-medium uppercase ${
                          inq.status === 'resolved'
                            ? 'border-emerald-800 text-emerald-400'
                            : inq.status === 'in_progress'
                              ? 'border-sky-800 text-sky-400'
                              : 'border-amber-800 text-amber-400'
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
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
