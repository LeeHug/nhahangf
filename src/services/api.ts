import { Reservation, RestaurantTable, SentEmailLog, UserAccount } from '../types';

export const apiService = {
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
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch('/api/reservations');
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
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to sync reservation to SQL', e);
      return null;
    }
  },

  async updateReservationStatus(id: string, status: string): Promise<Reservation | null> {
    try {
      const res = await fetch(`/api/reservations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to update reservation status in SQL', e);
      return null;
    }
  },

  // Users
  async getUsers(): Promise<UserAccount[]> {
    try {
      const res = await fetch('/api/users');
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

  // Email logs
  async getEmailLogs(): Promise<SentEmailLog[]> {
    try {
      const res = await fetch('/api/email-logs');
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
