import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  MessageSquare,
  Sliders,
  LogOut,
  ExternalLink,
  Shield,
  Tag,
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  adminUser: any;
  onLogout: () => void;
  orderMetrics?: { totalOrders: number; pendingOrders: number };
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  adminUser,
  onLogout,
  orderMetrics,
}: AdminSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
    { id: 'products', label: 'Products Catalog', icon: <Package size={18} /> },
    { id: 'promotions', label: 'Promotions & Vouchers', icon: <Tag size={18} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={18} /> },
    { id: 'inquiries', label: 'Inquiries & WhatsApp', icon: <MessageSquare size={18} /> },
    { id: 'settings', label: 'Store Settings', icon: <Sliders size={18} /> },
  ];

  return (
    <aside className="w-64 bg-[#0e1011] border-r border-zinc-800/80 flex flex-col shrink-0 min-h-screen">
      {/* Brand */}
      <div className="p-6 border-b border-zinc-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-zinc-900 border border-zinc-700 flex items-center justify-center">
          <span className="brand-font text-base font-bold text-zinc-100">G</span>
        </div>
        <div>
          <span className="brand-font text-base tracking-wider font-semibold text-white block">
            GENZO
          </span>
          <span className="text-[10px] tracking-widest uppercase text-zinc-400 block -mt-1">
            SILVER ADMIN
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="p-4 space-y-1.5 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold px-3 mb-2">
          Management
        </div>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-zinc-400'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="pt-6">
          <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold px-3 mb-2">
            Storefront
          </div>
          <a
            href="http://localhost:8443"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} />
              <span>Live Storefront</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-400">:8443</span>
          </a>
        </div>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400 text-xs font-bold">
              <Shield size={14} />
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-medium text-white block truncate">
                {adminUser?.fullName || 'Atelier Master'}
              </span>
              <span className="text-[10px] text-zinc-400 block truncate">
                {adminUser?.email || 'admin@genzosilver.pk'}
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign out"
            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 rounded-md transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
