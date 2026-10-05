import 'dotenv/config';
import express from 'express';
import path from 'path';
import { db } from './src/db/index.ts';
import { tables, reservations, users, emailLogs } from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { EXPANDED_TABLES } from './src/data/expandedTables.ts';
import { INITIAL_RESERVATIONS, INITIAL_USERS, INITIAL_EMAIL_LOGS } from './src/data/mockData.ts';
import { isTimeSlotInPast } from './src/utils/dateTimeUtils.ts';

let localTables = [...EXPANDED_TABLES];
let localReservations = [...INITIAL_RESERVATIONS];
let localUsers = [...INITIAL_USERS];
let localEmailLogs = [...INITIAL_EMAIL_LOGS];

function toValidDate(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) return isNaN(val.getTime()) ? new Date() : val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
}

async function seedDatabaseIfEmpty() {
  if (!process.env.SQL_HOST) {
    console.log('ℹ️ [Database] Chế độ cục bộ: Chưa cấu hình SQL_HOST (sử dụng mock/in-memory fallback cho local dev).');
    return;
  }
  try {
    const existingTables = await db.select().from(tables);
    if (existingTables.length === 0) {
      console.log('Seeding tables into Cloud SQL...');
      for (const t of EXPANDED_TABLES) {
        await db.insert(tables).values({
          id: t.id,
          name: t.name,
          area: t.area,
          capacity: t.capacity,
          status: t.status,
          currentReservationId: t.currentReservationId || null,
          shape: t.shape,
        }).onConflictDoNothing();
      }
    }

    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      console.log('Seeding initial users into Cloud SQL...');
      for (const u of INITIAL_USERS) {
        await db.insert(users).values({
          id: u.id,
          email: u.email,
          name: u.name,
          phone: u.phone,
          membershipTier: u.membershipTier,
          loyaltyPoints: u.loyaltyPoints,
          avatar: u.avatar || null,
          favoriteDishIds: u.favoriteDishIds || [],
          dietaryPreferences: u.dietaryPreferences || '',
          createdAt: toValidDate(u.createdAt),
        }).onConflictDoNothing();
      }
    }

    const existingReservations = await db.select().from(reservations);
    if (existingReservations.length === 0) {
      console.log('Seeding initial reservations into Cloud SQL...');
      for (const r of INITIAL_RESERVATIONS) {
        await db.insert(reservations).values({
          id: r.id,
          bookingCode: r.bookingCode,
          userId: r.userId || null,
          customerName: r.customerName,
          customerPhone: r.customerPhone,
          customerEmail: r.customerEmail,
          guestCount: r.guestCount,
          bookingDate: r.bookingDate,
          arrivalTime: r.arrivalTime,
          tableId: r.tableId,
          tableName: r.tableName,
          tableArea: r.tableArea,
          selectedDishes: r.selectedDishes || [],
          preOrderTotal: r.preOrderTotal || 0,
          depositAmount: r.depositAmount || 0,
          discountAmount: r.discountAmount || 0,
          voucherCode: r.voucherCode || null,
          totalAmount: r.totalAmount || 0,
          status: r.status,
          occasion: r.occasion || null,
          specialRequests: r.specialRequests || null,
          emailConfirmationSent: r.emailConfirmationSent ?? true,
          emailSentAt: r.emailSentAt || null,
          pointsEarned: r.pointsEarned || 0,
          createdAt: toValidDate(r.createdAt),
        }).onConflictDoNothing();
      }
    }

    const existingEmails = await db.select().from(emailLogs);
    if (existingEmails.length === 0) {
      console.log('Seeding initial email logs into Cloud SQL...');
      for (const e of INITIAL_EMAIL_LOGS) {
        await db.insert(emailLogs).values({
          id: e.id,
          recipientEmail: e.toEmail,
          recipientName: e.toName,
          bookingCode: e.bookingCode,
          sentAt: e.sentAt,
          subject: e.subject,
          status: 'delivered',
          type: e.type,
          previewBody: e.htmlContent,
        }).onConflictDoNothing();
      }
    }
  } catch (err: any) {
    if (err?.cause?.code === 'ECONNREFUSED' || err?.code === 'ECONNREFUSED') {
      console.log('ℹ️ [Database] Chế độ cục bộ: Không kết nối được PostgreSQL (đang dùng fallback in-memory).');
    } else {
      console.warn('Seed notice:', err?.message || err);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Background seed on startup
  seedDatabaseIfEmpty().catch(console.error);

  // API: Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'cloud_sql_postgres' });
  });

  // API: Tables
  app.get('/api/tables', async (req, res) => {
    try {
      const allTables = await db.select().from(tables);
      if (allTables.length === 0) {
        return res.json(localTables);
      }
      res.json(allTables);
    } catch (error) {
      res.json(localTables);
    }
  });

  app.put('/api/tables/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const updated = await db.update(tables).set(updates).where(eq(tables.id, id)).returning();
      res.json(updated[0] || updates);
    } catch (error) {
      const idx = localTables.findIndex(t => t.id === id);
      if (idx !== -1) {
        localTables[idx] = { ...localTables[idx], ...updates };
        return res.json(localTables[idx]);
      }
      res.json(updates);
    }
  });

  // API: Reservations
  app.get('/api/reservations', async (req, res) => {
    try {
      const allRes = await db.select().from(reservations).orderBy(desc(reservations.createdAt));
      res.json(allRes);
    } catch (error) {
      res.json(localReservations);
    }
  });

  app.post('/api/reservations', async (req, res) => {
    const newRes = req.body;

    // Validate past time slots for same-day bookings
    if (newRes.bookingDate && newRes.arrivalTime) {
      if (isTimeSlotInPast(newRes.arrivalTime, newRes.bookingDate)) {
        return res.status(400).json({
          error: 'Khung giờ đặt bàn này đã trôi qua. Vui lòng chọn khung giờ hoặc ngày khác.'
        });
      }
    }

    const reservationData = {
      id: newRes.id,
      bookingCode: newRes.bookingCode,
      userId: newRes.userId || null,
      customerName: newRes.customerName,
      customerPhone: newRes.customerPhone,
      customerEmail: newRes.customerEmail,
      guestCount: Number(newRes.guestCount) || 1,
      bookingDate: newRes.bookingDate,
      arrivalTime: newRes.arrivalTime,
      tableId: newRes.tableId,
      tableName: newRes.tableName,
      tableArea: newRes.tableArea,
      selectedDishes: newRes.selectedDishes || [],
      preOrderTotal: Number(newRes.preOrderTotal) || 0,
      depositAmount: Number(newRes.depositAmount) || 0,
      discountAmount: Number(newRes.discountAmount) || 0,
      voucherCode: newRes.voucherCode || null,
      totalAmount: Number(newRes.totalAmount) || 0,
      status: newRes.status || 'confirmed',
      occasion: newRes.occasion || null,
      specialRequests: newRes.specialRequests || null,
      emailConfirmationSent: newRes.emailConfirmationSent ?? true,
      emailSentAt: newRes.emailSentAt || null,
      pointsEarned: Number(newRes.pointsEarned) || 0,
      createdAt: toValidDate(newRes.createdAt),
    };

    try {
      const inserted = await db.insert(reservations).values(reservationData).returning();
      
      // Update table status
      if (newRes.tableId) {
        await db.update(tables)
          .set({ status: 'reserved', currentReservationId: newRes.bookingCode })
          .where(eq(tables.id, newRes.tableId));
      }

      res.status(201).json(inserted[0] || newRes);
    } catch (error) {
      const resItem = { ...reservationData, id: reservationData.id || `res_${Date.now()}` };
      localReservations.unshift(resItem as any);
      if (newRes.tableId) {
        const tIdx = localTables.findIndex(t => t.id === newRes.tableId);
        if (tIdx !== -1) {
          localTables[tIdx] = { ...localTables[tIdx], status: 'reserved', currentReservationId: newRes.bookingCode };
        }
      }
      res.status(201).json(resItem);
    }
  });

  app.patch('/api/reservations/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const updated = await db.update(reservations).set({ status }).where(eq(reservations.id, id)).returning();
      res.json(updated[0]);
    } catch (error) {
      const rIdx = localReservations.findIndex(r => r.id === id || (r as any).bookingCode === id);
      if (rIdx !== -1) {
        localReservations[rIdx] = { ...localReservations[rIdx], status: status as any };
        return res.json(localReservations[rIdx]);
      }
      res.json({ id, status });
    }
  });

  // API: Users
  app.get('/api/users', async (req, res) => {
    try {
      const allUsers = await db.select().from(users);
      res.json(allUsers);
    } catch (error) {
      res.json(localUsers);
    }
  });

  app.post('/api/users', async (req, res) => {
    const userData = req.body;
    const userToInsert = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      membershipTier: userData.membershipTier || 'Bạc',
      loyaltyPoints: Number(userData.loyaltyPoints) || 0,
      avatar: userData.avatar || null,
      favoriteDishIds: userData.favoriteDishIds || [],
      dietaryPreferences: userData.dietaryPreferences || '',
      createdAt: toValidDate(userData.createdAt),
    };
    try {
      const inserted = await db.insert(users).values(userToInsert).returning();
      res.status(201).json(inserted[0] || userData);
    } catch (error) {
      localUsers.push(userToInsert as any);
      res.status(201).json(userToInsert);
    }
  });

  app.patch('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const updated = await db.update(users).set(updates).where(eq(users.id, id)).returning();
      res.json(updated[0] || updates);
    } catch (error) {
      const uIdx = localUsers.findIndex(u => u.id === id);
      if (uIdx !== -1) {
        localUsers[uIdx] = { ...localUsers[uIdx], ...updates };
        return res.json(localUsers[uIdx]);
      }
      res.json(updates);
    }
  });

  // API: Email Logs
  app.get('/api/email-logs', async (req, res) => {
    try {
      const logs = await db.select().from(emailLogs).orderBy(desc(emailLogs.sentAt));
      const formatted = logs.map((l) => ({
        id: l.id,
        toEmail: l.recipientEmail || '',
        toName: l.recipientName || '',
        recipientEmail: l.recipientEmail || '',
        recipientName: l.recipientName || '',
        bookingCode: l.bookingCode || '',
        sentAt: l.sentAt || '',
        subject: l.subject || '',
        type: l.type || 'confirmation',
        htmlContent: l.previewBody || '',
        previewBody: l.previewBody || '',
        status: l.status || 'delivered',
      }));
      res.json(formatted);
    } catch (error) {
      res.json(localEmailLogs);
    }
  });

  app.post('/api/email-logs', async (req, res) => {
    const log = req.body;
    const formattedLog = {
      id: log.id,
      recipientEmail: log.recipientEmail || log.toEmail || '',
      recipientName: log.recipientName || log.toName || '',
      bookingCode: log.bookingCode || '',
      sentAt: typeof log.sentAt === 'string' ? log.sentAt : new Date().toISOString(),
      subject: log.subject || '',
      status: log.status || 'delivered',
      type: log.type || 'confirmation',
      previewBody: log.previewBody || log.htmlContent || '',
    };
    try {
      const inserted = await db.insert(emailLogs).values(formattedLog).returning();
      res.status(201).json(inserted[0] || formattedLog);
    } catch (error) {
      localEmailLogs.unshift(formattedLog as any);
      res.status(201).json(formattedLog);
    }
  });

  // Vite middleware for development (only when not running from bundled dist)
  const isProduction = process.env.NODE_ENV === 'production' || __dirname.includes('dist');
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
