const configuredApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1')
  .replace(/\/+$/, '');
const API_BASE_URL = /\/api\/v1$/i.test(configuredApiUrl)
  ? configuredApiUrl
  : `${configuredApiUrl}/api/v1`;

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('genzo_admin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const adminApi = {
  // Authentication
  async login(email: string, password: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success && data.user) {
      if (data.user.role !== 'admin') {
        throw new Error('Access denied: Admin credentials required.');
      }
      localStorage.setItem('genzo_admin_token', data.token);
      localStorage.setItem('genzo_admin_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout(): void {
    localStorage.removeItem('genzo_admin_token');
    localStorage.removeItem('genzo_admin_user');
  },

  getCurrentUser(): any {
    const userStr = localStorage.getItem('genzo_admin_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async verifyAuth(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Dashboard Metrics
  async getStats(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || `Unable to load dashboard statistics (${res.status}).`);
    }
    return data;
  },

  // Orders Management
  async getOrders(params: { status?: string; search?: string } = {}): Promise<any> {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE_URL}/admin/orders?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updateOrder(
    id: number,
    data: { orderStatus?: string; paymentStatus?: string; trackingCode?: string }
  ): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/orders/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteOrder(id: number): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/orders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Products Management
  async getProducts(params: Record<string, any> = {}): Promise<any> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    const fallbackRes = await fetch(`${API_BASE_URL}/products?${query.toString()}`);
    return fallbackRes.json();
  },

  async createProduct(productData: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    return res.json();
  },

  async updateProduct(id: number, productData: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    return res.json();
  },

  async deleteProduct(id: number): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async toggleStock(id: number): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/products/${id}/toggle-stock`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async uploadProductImage(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('genzo_admin_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/admin/upload-product-image`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return res.json();
  },

  // Coupons Management
  async getCoupons(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createCoupon(data: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteCoupon(id: number): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Customers & Community
  async getCustomers(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/customers`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getSubscribers(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/subscribers`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getInquiries(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/inquiries`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updateInquiryStatus(id: number, status: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Store Settings
  async getSettings(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/contact/settings`);
    return res.json();
  },

  async updateSettings(settings: Record<string, any>): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    return res.json();
  },
};
