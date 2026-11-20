import { Product } from '../data/products';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Session management for guest cart & wishlist
const getSessionId = () => {
  let sessionId = localStorage.getItem('genzo_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('genzo_session_id', sessionId);
  }
  return sessionId;
};

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-session-id': getSessionId(),
  };
  const token = localStorage.getItem('genzo_auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // --- Products ---
  async getProducts(params: Record<string, any> = {}): Promise<{ count: number; data: Product[] }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`);
    return res.json();
  },

  async getFeaturedProducts(): Promise<{ data: Product[] }> {
    const res = await fetch(`${API_BASE_URL}/products/featured`);
    return res.json();
  },

  async getProduct(idOrSlug: string | number): Promise<{ data: any }> {
    const res = await fetch(`${API_BASE_URL}/products/${idOrSlug}`);
    return res.json();
  },

  async getFacets(): Promise<{ data: any }> {
    const res = await fetch(`${API_BASE_URL}/products/facets`);
    return res.json();
  },

  // --- Product Reviews ---
  async getProductReviews(productId: number | string): Promise<{
    success: boolean;
    averageRating: number;
    reviewCount: number;
    data: any[];
  }> {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews`);
    return res.json();
  },

  async submitReview(
    productId: number | string,
    payload: { customerName: string; customerEmail?: string; rating: number; reviewText: string }
  ): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // --- Cart ---
  async getCart(): Promise<{ data: any }> {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async addToCart(productId: number, size = 'One size', quantity = 1): Promise<{ data: any }> {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, size, quantity }),
    });
    return res.json();
  },

  async updateCartItem(cartItemId: number, delta: number): Promise<{ data: any }> {
    const res = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ delta }),
    });
    return res.json();
  },

  async removeFromCart(cartItemId: number): Promise<{ data: any }> {
    const res = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- Wishlist ---
  async getWishlist(): Promise<{ productIds: number[]; data: Product[] }> {
    const res = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async toggleWishlist(productId: number): Promise<{ wished: boolean; productIds: number[] }> {
    const res = await fetch(`${API_BASE_URL}/wishlist/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId }),
    });
    return res.json();
  },

  // --- Orders & Vouchers ---
  async validateCoupon(code: string, subtotal: number): Promise<{
    success: boolean;
    message?: string;
    coupon?: {
      code: string;
      discountType: string;
      discountValue: number;
      discountAmount: number;
      newSubtotal: number;
    };
  }> {
    const res = await fetch(`${API_BASE_URL}/orders/validate-coupon`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code, subtotal }),
    });
    return res.json();
  },

  async createOrder(orderPayload: any): Promise<{ success: boolean; data: any; message?: string }> {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderPayload),
    });
    return res.json();
  },

  async uploadReceipt(orderId: number | string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('receipt', file);
    const token = localStorage.getItem('genzo_auth_token');
    const headers: Record<string, string> = {
      'x-session-id': getSessionId(),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/receipt`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return res.json();
  },

  async trackOrder(orderNumber: string, phoneOrEmail?: string): Promise<any> {
    const params = new URLSearchParams();
    params.append('orderNumber', orderNumber.trim());
    if (phoneOrEmail && phoneOrEmail.trim()) {
      if (phoneOrEmail.includes('@')) {
        params.append('email', phoneOrEmail.trim());
      } else {
        params.append('phone', phoneOrEmail.trim());
      }
    }
    const res = await fetch(`${API_BASE_URL}/orders/track?${params.toString()}`);
    return res.json();
  },

  async getMyOrders(): Promise<{ success: boolean; data: any[] }> {
    const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- Authentication ---
  async signup(payload: { fullName: string; email: string; password: string; phone?: string }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('genzo_auth_token', data.token);
    }
    return data;
  },

  async login(payload: { email: string; password: string }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('genzo_auth_token', data.token);
    }
    return data;
  },

  async getMe(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updateProfile(payload: { fullName?: string; phone?: string; currentPassword?: string; newPassword?: string }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async forgotPassword(email: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async resetPassword(payload: { email: string; resetToken: string; newPassword: string }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  logout(): void {
    localStorage.removeItem('genzo_auth_token');
  },

  // --- Newsletter & Contact ---
  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async getStoreSettings(): Promise<{ data: any }> {
    const res = await fetch(`${API_BASE_URL}/contact/settings`);
    return res.json();
  },

  async submitInquiry(payload: {
    name: string;
    email?: string;
    phone?: string;
    subject?: string;
    message: string;
    channel?: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
