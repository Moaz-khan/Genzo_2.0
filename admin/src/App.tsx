import { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminSidebar from './components/AdminSidebar';
import AdminDashboard from './components/AdminDashboard';
import AdminOrders from './components/AdminOrders';
import AdminProducts from './components/AdminProducts';
import AdminCoupons from './components/AdminCoupons';
import AdminCustomers from './components/AdminCustomers';
import AdminInquiries from './components/AdminInquiries';
import AdminSettings from './components/AdminSettings';
import { adminApi } from './services/adminApi';

export default function App() {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  useEffect(() => {
    const user = adminApi.getCurrentUser();
    const token = localStorage.getItem('genzo_admin_token');

    if (user && token && user.role === 'admin') {
      setAdminUser(user);
    } else {
      adminApi.logout();
      setAdminUser(null);
    }
    setCheckingAuth(false);
  }, []);

  const handleLoginSuccess = (user: any) => {
    setAdminUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    adminApi.logout();
    setAdminUser(null);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0c0d0e] flex items-center justify-center text-zinc-400 text-xs">
        Initializing GENZO Atelier Console...
      </div>
    );
  }

  if (!adminUser) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex bg-[#0c0d0e] text-[#e6e6e6]">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminUser={adminUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen bg-[#0f1011]">
        {activeTab === 'dashboard' && <AdminDashboard onNavigate={setActiveTab} />}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'promotions' && <AdminCoupons />}
        {activeTab === 'customers' && <AdminCustomers />}
        {activeTab === 'inquiries' && <AdminInquiries />}
        {activeTab === 'settings' && <AdminSettings />}
      </main>
    </div>
  );
}
