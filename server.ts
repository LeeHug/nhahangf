import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { tables, reservations, users, emailLogs } from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { EXPANDED_TABLES } from './src/data/expandedTables.ts';
import { INITIAL_RESERVATIONS, INITIAL_USERS, INITIAL_EMAIL_LOGS } from './src/data/mockData.ts';

import 'dotenv/config';

async function seedDatabaseIfEmpty() {
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
  } catch (err) {
    console.error('Seed error (ignoring if DB ready):', err);
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
        return res.json(EXPANDED_TABLES);
      }
      res.json(allTables);
    } catch (error) {
      console.error('Failed to get tables from SQL:', error);
      res.json(EXPANDED_TABLES);
    }
  });

  app.put('/api/tables/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = await db.update(tables).set(updates).where(eq(tables.id, id)).returning();
      res.json(updated[0] || updates);
    } catch (error) {
      console.error('Failed to update table in SQL:', error);
      res.status(500).json({ error: 'Failed to update table' });
    }
  });

  // API: Reservations
  app.get('/api/reservations', async (req, res) => {
    try {
      const allRes = await db.select().from(reservations).orderBy(desc(reservations.createdAt));
      res.json(allRes);
    } catch (error) {
      console.error('Failed to get reservations from SQL:', error);
      res.json(INITIAL_RESERVATIONS);
    }
  });

  app.post('/api/reservations', async (req, res) => {
    try {
      const newRes = req.body;
      const inserted = await db.insert(reservations).values(newRes).returning();
      
      // Update table status
      if (newRes.tableId) {
        await db.update(tables)
          .set({ status: 'reserved', currentReservationId: newRes.bookingCode })
          .where(eq(tables.id, newRes.tableId));
      }

      res.status(201).json(inserted[0] || newRes);
    } catch (error) {
      console.error('Failed to create reservation in SQL:', error);
      res.status(500).json({ error: 'Failed to save reservation' });
    }
  });

  app.patch('/api/reservations/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await db.update(reservations).set({ status }).where(eq(reservations.id, id)).returning();
      res.json(updated[0]);
    } catch (error) {
      console.error('Failed to update reservation status in SQL:', error);
      res.status(500).json({ error: 'Failed to update reservation status' });
    }
  });

  // API: Users
  app.get('/api/users', async (req, res) => {
    try {
      const allUsers = await db.select().from(users);
      res.json(allUsers);
    } catch (error) {
      console.error('Failed to get users from SQL:', error);
      res.json(INITIAL_USERS);
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const userData = req.body;
      const inserted = await db.insert(users).values(userData).returning();
      res.status(201).json(inserted[0] || userData);
    } catch (error) {
      console.error('Failed to create user in SQL:', error);
      res.status(500).json({ error: 'Failed to save user' });
    }
  });

  app.patch('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = await db.update(users).set(updates).where(eq(users.id, id)).returning();
      res.json(updated[0] || updates);
    } catch (error) {
      console.error('Failed to update user in SQL:', error);
      res.status(500).json({ error: 'Failed to update user' });
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
      console.error('Failed to get email logs from SQL:', error);
      res.json(INITIAL_EMAIL_LOGS);
    }
  });

  app.post('/api/email-logs', async (req, res) => {
    try {
      const log = req.body;
      const inserted = await db.insert(emailLogs).values(log).returning();
      res.status(201).json(inserted[0] || log);
    } catch (error) {
      console.error('Failed to save email log to SQL:', error);
      res.status(500).json({ error: 'Failed to save email log' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
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
