import React, { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, RefreshCw, X, Check, AlertCircle } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [form, setForm] = useState({
    code: '',
    discount_type: 'percent',
    discount_value: 10,
    min_order_amount: 5000,
    max_discount: 3000,
    expires_at: '',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCoupons();
      if (res.success && Array.isArray(res.data)) {
        setCoupons(res.data);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load coupons from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminApi.createCoupon(form);
      if (res.success) {
        showToast(`Promo voucher ${form.code.toUpperCase()} activated!`);
        setModalOpen(false);
        setForm({
          code: '',
          discount_type: 'percent',
          discount_value: 10,
          min_order_amount: 5000,
          max_discount: 3000,
          expires_at: '',
        });
        fetchCoupons();
      } else {
        showToast(res.message || 'Error creating coupon', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating coupon', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!window.confirm(`Delete coupon code ${code}?`)) return;
    try {
      const res = await adminApi.deleteCoupon(id);
      if (res.success) {
        showToast(`Coupon ${code} removed.`);
        fetchCoupons();
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to delete coupon.', 'error');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-xs flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-950 border border-emerald-700 text-emerald-200'
              : 'bg-rose-950 border border-rose-700 text-rose-200'
          }`}
        >
          {toast.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-white">Promotions & Vouchers</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage discount codes, percentage vouchers, and minimum spend rules in TiDB
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCoupons}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-700/80 text-zinc-300 hover:text-white"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition"
          >
            <Plus size={14} />
            <span>Create Promo Voucher</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl border silver-border overflow-hidden bg-zinc-950/40">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw size={18} className="animate-spin text-zinc-400" />
            <span>Loading active promotion records...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs">
            No active promotional codes found. Create your first voucher.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 font-medium">Coupon Code</th>
                  <th className="py-3.5 px-4 font-medium">Discount Type</th>
                  <th className="py-3.5 px-4 font-medium">Value</th>
                  <th className="py-3.5 px-4 font-medium">Min Order</th>
                  <th className="py-3.5 px-4 font-medium">Max Cap</th>
                  <th className="py-3.5 px-4 font-medium">Usage Count</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-900/40 transition">
                    <td className="py-3.5 px-4 font-bold text-white tracking-wider flex items-center gap-2">
                      <Tag size={13} className="text-emerald-400" />
                      <span>{c.code}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 capitalize font-sans">
                      {c.discount_type}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                      {c.discount_type === 'percent' ? `${c.discount_value}% OFF` : `PKR ${c.discount_value}`}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 font-sans">
                      PKR {Number(c.min_order_amount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 font-sans">
                      {c.max_discount ? `PKR ${Number(c.max_discount).toLocaleString()}` : 'No cap'}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      {c.usage_count} orders
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id, c.code)}
                        className="p-1.5 hover:bg-rose-950/60 hover:text-rose-400 text-zinc-500 rounded transition"
                        title="Delete voucher"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121315] border border-zinc-700/80 rounded-2xl max-w-md w-full p-6 text-xs text-zinc-300 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-semibold text-white">Create Promotional Voucher</h3>
                <p className="text-[11px] text-zinc-400">Configure discount parameters for checkout</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
                  Coupon Code *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. VIP20 or EID15"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 rounded text-white font-mono tracking-wider outline-none focus:border-white uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 rounded text-white outline-none focus:border-white"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (PKR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
                    Value *
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 rounded text-white outline-none focus:border-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
                    Min Order Spend (PKR)
                  </label>
                  <input
                    type="number"
                    value={form.min_order_amount}
                    onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 rounded text-white outline-none focus:border-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
                    Max Discount Cap (PKR)
                  </label>
                  <input
                    type="number"
                    placeholder="Optional"
                    value={form.max_discount || ''}
                    onChange={(e) => setForm({ ...form, max_discount: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 rounded text-white outline-none focus:border-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded bg-white text-black font-semibold uppercase tracking-wider text-xs hover:bg-zinc-200 transition mt-2"
              >
                {submitting ? 'Creating...' : 'Activate Voucher Code'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
