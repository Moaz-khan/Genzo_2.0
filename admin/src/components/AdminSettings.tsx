import React, { useEffect, useState } from 'react';
import { Sliders, Save, CheckCircle } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    free_shipping_threshold: 25000,
    standard_shipping_fee: 450,
    announcement_bar: 'Complimentary nationwide delivery on orders over PKR 25,000',
    support_phone: '+92 300 1234567',
    support_email: 'care@genzosilver.pk',
    studio_location: 'Lahore, Pakistan',
    studio_hours: 'Mon–Sat, 11am–8pm',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    adminApi
      .getSettings()
      .then((res) => {
        if (res.success && res.data) {
          setSettings((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await adminApi.updateSettings(settings);
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update store settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-zinc-400 text-xs">
        Loading studio settings from TiDB...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-wide text-white">Store Settings</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure delivery policies, promo announcements, and atelier concierge details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel rounded-xl border silver-border p-6 space-y-6">
        {savedSuccess && (
          <div className="p-3.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle size={15} />
            <span>Settings saved successfully in TiDB Cloud!</span>
          </div>
        )}

        {/* Shipping & Delivery Rules */}
        <div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sliders size={16} className="text-zinc-400" />
            <span>Delivery & Courier Policy (PKR)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Complimentary Delivery Threshold (PKR)
              </label>
              <input
                type="number"
                value={settings.free_shipping_threshold}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    free_shipping_threshold: Number(e.target.value),
                  }))
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white silver-glow"
              />
              <span className="text-[10px] text-zinc-400 block mt-1">
                Orders equal or exceeding this total get free nationwide delivery.
              </span>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Standard Shipping Rate (PKR)
              </label>
              <input
                type="number"
                value={settings.standard_shipping_fee}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    standard_shipping_fee: Number(e.target.value),
                  }))
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white silver-glow"
              />
              <span className="text-[10px] text-zinc-400 block mt-1">
                Charged when total order is under the complimentary threshold.
              </span>
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="pt-4 border-t border-zinc-800/80">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
            Top Announcement Bar
          </h2>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Banner Text</label>
            <input
              type="text"
              value={settings.announcement_bar}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, announcement_bar: e.target.value }))
              }
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white silver-glow"
            />
          </div>
        </div>

        {/* Studio & Support Details */}
        <div className="pt-4 border-t border-zinc-800/80">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
            Studio & Concierge Contacts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">WhatsApp / Phone Number</label>
              <input
                type="text"
                value={settings.support_phone}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, support_phone: e.target.value }))
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Client Care Email</label>
              <input
                type="email"
                value={settings.support_email}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, support_email: e.target.value }))
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Atelier Location</label>
              <input
                type="text"
                value={settings.studio_location}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, studio_location: e.target.value }))
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Operating Hours</label>
              <input
                type="text"
                value={settings.studio_hours}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, studio_hours: e.target.value }))
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-800">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? 'Updating TiDB Settings...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
