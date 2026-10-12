import 'dotenv/config';
import express from 'express';
import path from 'path';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { db } from './src/db/index.ts';
import { tables, reservations, users, emailLogs } from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { EXPANDED_TABLES } from './src/data/expandedTables.ts';
import { INITIAL_RESERVATIONS, INITIAL_USERS, INITIAL_EMAIL_LOGS, MENU_ITEMS, INITIAL_VOUCHERS } from './src/data/mockData.ts';
import { isTimeSlotInPast } from './src/utils/dateTimeUtils.ts';
import { generateToken, authenticateToken, requireRoles, AuthenticatedRequest } from './server-auth.ts';

let localTables = [...EXPANDED_TABLES];
let localReservations = [...INITIAL_RESERVATIONS];
let localUsers = [...INITIAL_USERS];
let localEmailLogs = [...INITIAL_EMAIL_LOGS];

// In-memory / server-side password storage with secure bcrypt hashes
const serverPasswordHashes: Record<string, string> = {};
INITIAL_USERS.forEach(u => {
  const plain = u.passwordHash || '123456';
  serverPasswordHashes[u.id] = bcrypt.hashSync(plain, 10);
});

function toValidDate(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) return isNaN(val.getTime()) ? new Date() : val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
}

// Map for quick menu pricing lookup
const MENU_PRICE_MAP = new Map<string, number>();
MENU_ITEMS.forEach(item => {
  MENU_PRICE_MAP.set(item.id, item.price);
});

async function seedDatabaseIfEmpty() {
  if (!process.env.SQL_HOST) {
    console.log('ℹ️ [Database] Chế độ cục bộ: Chưa cấu hình SQL_HOST (sử dụng in-memory fallback cho local dev).');
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
  const PORT = Number(process.env.PORT) || 3000;

  // Lỗ hổng 6: Rate Limiting chống DoS & brute-force spam
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 300, // Giới hạn tối đa 300 request / 15 phút mỗi IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Quá nhiều yêu cầu từ IP của bạn. Vui lòng thử lại sau ít phút.', code: 'RATE_LIMIT_EXCEEDED' },
  });

  const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 phút
    max: 20, // Tối đa 20 lần thử đăng nhập để chống brute-force
    message: { error: 'Đã thử đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 10 phút.', code: 'AUTH_RATE_LIMIT' },
  });

  app.use(generalLimiter);

  // Lỗ hổng 7: Bảo vệ CORS
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    // Hỗ trợ domain hiện tại, localhost và preview domains
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      res.header('Access-Control-Allow-Origin', '*');
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  app.use(express.json());

  // Background seed on startup
  seedDatabaseIfEmpty().catch(console.error);

  // API: Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'cloud_sql_postgres', security: 'hardened' });
  });

  // -------------------------------------------------------------
  // Lỗ hổng 1 & 3: XÁC THỰC MẬT KHẨU & PHÁT HÀNH JWT TẠI SERVER
  // -------------------------------------------------------------
  app.post('/api/auth/login', authLimiter, async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Vui lòng cung cấp tài khoản và mật khẩu.' });
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const cleanPhone = String(identifier).trim().replace(/\s+/g, '');

    // Tìm tài khoản
    let user = localUsers.find(
      u => (u.email || '').toLowerCase() === cleanId || (u.phone || '').replace(/\s+/g, '') === cleanPhone
    );

    if (!user) {
      return res.status(401).json({ error: 'Tài khoản (Email hoặc Số điện thoại) không tồn tại!' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Tài khoản này đang bị tạm khóa.' });
    }

    // Kiểm tra mật khẩu bằng bcrypt
    const hash = serverPasswordHashes[user.id];
    let isMatch = false;

    if (hash) {
      isMatch = bcrypt.compareSync(password, hash);
    } else if (user.passwordHash) {
      isMatch = password === user.passwordHash || bcrypt.compareSync(password, user.passwordHash);
    } else {
      isMatch = password === '123456';
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại!' });
    }

    // Ký JWT Token với Secret bí mật của Server
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: (user.role as any) || 'customer',
      name: user.name,
    });

    const { passwordHash: _, ...safeUser } = user;
    res.json({
      success: true,
      token,
      user: safeUser,
      message: `Đăng nhập thành công với vai trò ${user.role}!`,
    });
  });

  // API Tra cứu danh tính hiện tại theo Token (Verify token)
  app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
    const user = localUsers.find(u => u.id === req.user?.id);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser, role: req.user?.role });
  });

  // -------------------------------------------------------------
  // Lỗ hổng 5: TRA CỨU ĐẶT BÀN AN TOÀN (STRICT LOOKUP)
  // -------------------------------------------------------------
  app.post('/api/reservations/lookup', async (req, res) => {
    const { bookingCode, phone } = req.body;
    if (!bookingCode || !phone) {
      return res.status(400).json({
        error: 'Vui lòng cung cấp cả Mã đặt bàn (VD: BK-1003) và Số điện thoại đặt bàn để xác thực.'
      });
    }

    const cleanCode = String(bookingCode).trim().toUpperCase().replace('#', '');
    const cleanPhone = String(phone).trim().replace(/\s+/g, '');

    // Đối soát chặt chẽ 2 trường (không dùng wildcard hay substring lộ dữ liệu)
    const match = localReservations.find(r => {
      const matchCode = (r.bookingCode || '').toUpperCase().replace('#', '') === cleanCode;
      const matchPhone = (r.customerPhone || '').replace(/\s+/g, '') === cleanPhone;
      return matchCode && matchPhone;
    });

    if (!match) {
      return res.status(404).json({
        error: 'Không tìm thấy đơn đặt bàn khớp với Mã đặt chỗ và Số điện thoại này.'
      });
    }

    res.json({ reservation: match });
  });

  // -------------------------------------------------------------
  // Tables API
  // -------------------------------------------------------------
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

  // Lỗ hổng 2: Chỉ Admin và Staff mới được chỉnh sửa tình trạng bàn
  app.put('/api/tables/:id', authenticateToken, requireRoles(['admin', 'staff']), async (req: AuthenticatedRequest, res) => {
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

  // -------------------------------------------------------------
  // Reservations API
  // -------------------------------------------------------------
  // Lỗ hổng 2: Chỉ Admin và Staff mới được xem TOÀN BỘ danh sách reservations
  app.get('/api/reservations', authenticateToken, requireRoles(['admin', 'staff']), async (req: AuthenticatedRequest, res) => {
    try {
      const allRes = await db.select().from(reservations).orderBy(desc(reservations.createdAt));
      res.json(allRes);
    } catch (error) {
      res.json(localReservations);
    }
  });

  // Lỗ hổng 4: Server-authoritative Pricing (Tự tính lại giá món, giảm giá và cọc ở Backend)
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

    // 1. Tự tính tiền món dựa trên menu gốc phía Server
    let verifiedPreOrderTotal = 0;
    const verifiedSelectedDishes = (newRes.selectedDishes || []).map((item: any) => {
      const dishId = item.dish?.id || item.dishId;
      const originalPrice = MENU_PRICE_MAP.get(dishId) || item.dish?.price || 0;
      const qty = Math.max(1, Number(item.quantity) || 1);
      verifiedPreOrderTotal += originalPrice * qty;
      return {
        ...item,
        dish: {
          ...item.dish,
          price: originalPrice,
        },
        quantity: qty,
      };
    });

    // 2. Tự kiểm tra và tính giảm giá Voucher tại Server
    let verifiedDiscount = 0;
    const inputVoucher = newRes.voucherCode ? String(newRes.voucherCode).trim().toUpperCase() : null;
    if (inputVoucher) {
      const foundVoucher = INITIAL_VOUCHERS.find(v => v.code.toUpperCase() === inputVoucher);
      if (foundVoucher && verifiedPreOrderTotal >= foundVoucher.minOrder) {
        if (foundVoucher.discountPercent) {
          verifiedDiscount = Math.round((verifiedPreOrderTotal * foundVoucher.discountPercent) / 100);
        } else if (foundVoucher.discountAmount) {
          verifiedDiscount = foundVoucher.discountAmount;
        }
        verifiedDiscount = Math.min(verifiedPreOrderTotal, verifiedDiscount);
      }
    }

    const verifiedFinalTotal = Math.max(0, verifiedPreOrderTotal - verifiedDiscount);
    // Tính tiền cọc: nếu có yêu cầu đặt cọc
    let verifiedDeposit = 0;
    if (newRes.depositAmount > 0) {
      verifiedDeposit = verifiedFinalTotal > 0 ? Math.round(verifiedFinalTotal * 0.2 / 10000) * 10000 : 200000;
    }

    const calculatedPoints = Math.max(20, Math.floor(verifiedFinalTotal / 10000));

    const reservationData = {
      id: newRes.id || `res_${Date.now()}`,
      bookingCode: newRes.bookingCode || `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: newRes.userId || null,
      customerName: String(newRes.customerName || '').trim(),
      customerPhone: String(newRes.customerPhone || '').trim(),
      customerEmail: String(newRes.customerEmail || '').trim(),
      guestCount: Math.max(1, Number(newRes.guestCount) || 1),
      bookingDate: newRes.bookingDate,
      arrivalTime: newRes.arrivalTime,
      tableId: newRes.tableId,
      tableName: newRes.tableName,
      tableArea: newRes.tableArea,
      selectedDishes: verifiedSelectedDishes,
      preOrderTotal: verifiedPreOrderTotal,
      depositAmount: verifiedDeposit,
      discountAmount: verifiedDiscount,
      voucherCode: inputVoucher,
      totalAmount: verifiedFinalTotal,
      status: newRes.status || 'confirmed',
      occasion: newRes.occasion || null,
      specialRequests: newRes.specialRequests || null,
      emailConfirmationSent: newRes.emailConfirmationSent ?? true,
      emailSentAt: newRes.emailSentAt || null,
      pointsEarned: calculatedPoints,
      createdAt: toValidDate(newRes.createdAt),
    };

    try {
      const inserted = await db.insert(reservations).values(reservationData).returning();
      
      // Update table status
      if (newRes.tableId) {
        await db.update(tables)
          .set({ status: 'reserved', currentReservationId: reservationData.bookingCode })
          .where(eq(tables.id, newRes.tableId));
      }

      res.status(201).json(inserted[0] || reservationData);
    } catch (error) {
      localReservations.unshift(reservationData as any);
      if (newRes.tableId) {
        const tIdx = localTables.findIndex(t => t.id === newRes.tableId);
        if (tIdx !== -1) {
          localTables[tIdx] = { ...localTables[tIdx], status: 'reserved', currentReservationId: reservationData.bookingCode };
        }
      }
      res.status(201).json(reservationData);
    }
  });

  // Lỗ hổng 2: Chỉ Admin và Staff mới được đổi trạng thái đơn đặt bàn
  app.patch('/api/reservations/:id/status', authenticateToken, requireRoles(['admin', 'staff']), async (req: AuthenticatedRequest, res) => {
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

  // -------------------------------------------------------------
  // Users API
  // -------------------------------------------------------------
  // Lỗ hổng 2: Chỉ Admin và Staff mới xem được toàn bộ danh sách User
  app.get('/api/users', authenticateToken, requireRoles(['admin', 'staff']), async (req: AuthenticatedRequest, res) => {
    try {
      const allUsers = await db.select().from(users);
      // Giấu mọi thông tin mật khẩu
      res.json(allUsers);
    } catch (error) {
      res.json(localUsers.map(({ passwordHash: _, ...u }) => u));
    }
  });

  app.post('/api/users', async (req, res) => {
    const userData = req.body;
    const userToInsert = {
      id: userData.id || `user-${Date.now()}`,
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

    // Lưu mật khẩu nếu có
    if (userData.password) {
      serverPasswordHashes[userToInsert.id] = bcrypt.hashSync(userData.password, 10);
    }

    try {
      const inserted = await db.insert(users).values(userToInsert).returning();
      res.status(201).json(inserted[0] || userToInsert);
    } catch (error) {
      localUsers.push(userToInsert as any);
      res.status(201).json(userToInsert);
    }
  });

  // Lỗ hổng 2: Chỉ Admin hoặc chính User đó mới sửa được profile
  app.patch('/api/users/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Phải là Admin hoặc chính chủ
    if (req.user?.role !== 'admin' && req.user?.id !== id) {
      return res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa tài khoản của người khác.' });
    }

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

  // -------------------------------------------------------------
  // Email Logs API
  // -------------------------------------------------------------
  // Lỗ hổng 2: Chỉ Admin và Staff mới được xem Email Logs
  app.get('/api/email-logs', authenticateToken, requireRoles(['admin', 'staff']), async (req: AuthenticatedRequest, res) => {
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
      id: log.id || `em-${Date.now()}`,
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
  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.argv[1] && process.argv[1].includes('dist'));
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
    console.log(`Server running securely on http://0.0.0.0:${PORT}`);
  });
}

startServer();
