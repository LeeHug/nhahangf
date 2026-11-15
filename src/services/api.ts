import { Reservation, RestaurantTable, SentEmailLog, UserAccount, PointsTransaction } from '../types';

const AUTH_TOKEN_KEY = 'restaurant_auth_jwt_token_v1';

export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function saveStoredAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch (e) {
    console.error('Failed to save auth token', e);
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const apiService = {
  // Auth API
  async login(identifier: string, password?: string): Promise<{ success: boolean; token?: string; user?: UserAccount; message?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Đăng nhập không thành công.' };
      }
      if (data.token) {
        saveStoredAuthToken(data.token);
      }
      if (data.user) {
        try {
          localStorage.setItem('restaurant_current_user_v1', JSON.stringify(data.user));
        } catch (e) {}
      }
      return { success: true, token: data.token, user: data.user, message: data.message };
    } catch (e: any) {
      console.warn('Backend login unavailable, fallback error:', e);
      return { success: false, message: 'Không thể kết nối đến máy chủ xác thực.' };
    }
  },

  async verifyCurrentUser(): Promise<UserAccount | null> {
    const token = getStoredAuthToken();
    if (!token) return null;
    try {
      const res = await fetch('/api/auth/me', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        saveStoredAuthToken(null);
        return null;
      }
      const data = await res.json();
      if (data.user) {
        try {
          localStorage.setItem('restaurant_current_user_v1', JSON.stringify(data.user));
        } catch (e) {}
      }
      return data.user || null;
    } catch (e) {
      return null;
    }
  },

  // Tables
  async getTables(): Promise<RestaurantTable[]> {
    try {
      const res = await fetch('/api/tables');
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      console.warn('Falling back to local storage for tables', e);
      return [];
    }
  },

  async updateTable(id: string, updates: Partial<RestaurantTable>): Promise<RestaurantTable | null> {
    try {
      const res = await fetch(`/api/tables/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to update table on server', e);
      return null;
    }
  },

  // Reservations
  async getReservations(): Promise<Reservation[]> {
    try {
      const res = await fetch('/api/reservations', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      console.warn('Falling back to local storage for reservations', e);
      return [];
    }
  },

  async createReservation(reservation: Reservation): Promise<Reservation | null> {
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservation),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'API error');
      }
      return await res.json();
    } catch (e) {
      console.warn('Failed to sync reservation to SQL', e);
      return null;
    }
  },

  async lookupReservation(bookingCode: string, phone: string): Promise<Reservation | null> {
    try {
      const res = await fetch('/api/reservations/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingCode, phone }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.reservation || null;
    } catch (e) {
      return null;
    }
  },

  async updateReservationStatus(id: string, status: string): Promise<Reservation | null> {
    try {
      const res = await fetch(`/api/reservations/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to update reservation status in SQL', e);
      return null;
    }
  },

  async cancelReservation(
    idOrCode: string,
    params: { reason: string; cancelNotes?: string; customerPhone?: string }
  ): Promise<{ success: boolean; reservation?: Reservation; message: string; refundInfo?: any }> {
    try {
      const res = await fetch(`/api/reservations/${idOrCode}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.error || 'Không thể hủy đơn đặt bàn. Vui lòng kiểm tra lại điều kiện.',
        };
      }
      return {
        success: true,
        reservation: data.reservation,
        message: data.message,
        refundInfo: data.refundInfo,
      };
    } catch (e: any) {
      console.warn('Failed to call cancel reservation API', e);
      return {
        success: false,
        message: 'Lỗi kết nối máy chủ khi thực hiện hủy đặt bàn.',
      };
    }
  },


  // Users
  async getUsers(): Promise<UserAccount[]> {
    try {
      const res = await fetch('/api/users', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      console.warn('Falling back to local storage for users', e);
      return [];
    }
  },

  async syncUser(user: UserAccount): Promise<UserAccount | null> {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to sync user to SQL', e);
      return null;
    }
  },

  async getPointsLedger(userId: string): Promise<PointsTransaction[]> {
    try {
      const res = await fetch(`/api/users/${userId}/points-ledger`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      console.warn('Falling back to local storage for points ledger', e);
      return [];
    }
  },

  // Email logs
  async getEmailLogs(): Promise<SentEmailLog[]> {
    try {
      const res = await fetch('/api/email-logs', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return (data || []).map((item: any) => ({
        id: item.id || '',
        toEmail: item.toEmail || item.recipientEmail || '',
        toName: item.toName || item.recipientName || '',
        bookingCode: item.bookingCode || '',
        sentAt: item.sentAt || '',
        subject: item.subject || '',
        type: item.type || 'confirmation',
        htmlContent: item.htmlContent || item.previewBody || '',
      }));
    } catch (e) {
      console.warn('Falling back to local storage for emails', e);
      return [];
    }
  },

  async createEmailLog(log: SentEmailLog): Promise<SentEmailLog | null> {
    try {
      const res = await fetch('/api/email-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: log.id,
          recipientEmail: log.toEmail,
          recipientName: log.toName,
          bookingCode: log.bookingCode,
          sentAt: log.sentAt,
          subject: log.subject,
          type: log.type,
          previewBody: log.htmlContent,
          status: 'delivered',
        }),
      });
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to save email log to SQL', e);
      return null;
    }
  },
};
