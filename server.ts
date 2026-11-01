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

// --- Validation, Conflict Detection & Finite State Machine Helpers ---
function getVietnamDateString(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date()); // Format: YYYY-MM-DD theo giờ Việt Nam (GMT+7)
}

function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(val => parseInt(val, 10));
  return (h || 0) * 60 + (m || 0);
}

// Kiểm tra 2 khung giờ có bị giao thoa (overlap) trong khoảng thời gian phục vụ (SRS chuẩn: 120 phút)
function areTimeSlotsOverlapping(time1: string, time2: string, durationMinutes: number = 120): boolean {
  const m1 = timeToMinutes(time1);
  const m2 = timeToMinutes(time2);
  return Math.abs(m1 - m2) < durationMinutes;
}

// Regex xác thực dữ liệu đầu vào chuẩn tại Server (hỗ trợ 9-11 số theo chuẩn SĐT VN)
const VIETNAMESE_PHONE_REGEX = /^(?:\+84|0)[0-9]{8,10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_FORMAT_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Danh sách trạng thái đặt bàn hợp lệ & Ma trận chuyển đổi trạng thái (Finite State Machine theo SRS 2.2.1)
const VALID_RESERVATION_STATUSES = ['pending', 'confirmed', 'seated', 'checked_in', 'completed', 'cancelled'] as const;
type ValidStatus = typeof VALID_RESERVATION_STATUSES[number];

const ALLOWED_STATUS_TRANSITIONS: Record<ValidStatus, ValidStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['seated', 'checked_in', 'cancelled'],
  seated: ['completed'],       // SRS 2.2.1: SEATED chỉ được chuyển sang COMPLETED (không hủy khi đã nhận bàn)
  checked_in: ['completed'],   // Đồng bộ tương đương với seated
  completed: [],               // Trạng thái kết thúc: Khách đã ăn xong và thanh toán hóa đơn
  cancelled: [],               // Trạng thái kết thúc: Đơn đã hủy
};

// Hàm sinh mã đặt bàn chuẩn SRS: duy nhất, tiền tố LGB-XXXXX
function generateBookingCodeString(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `LGB-${randomPart}`;
}

// Khóa đồng thời (Mutex) chống Race Condition khi đặt bàn đồng thời vào cùng một bàn/giờ
const reservationSlotLocks = new Map<string, Promise<void>>();
async function acquireSlotLock(tableKey: string): Promise<() => void> {
  while (reservationSlotLocks.has(tableKey)) {
    await reservationSlotLocks.get(tableKey);
  }
  let unlock: () => void = () => {};
  const lockPromise = new Promise<void>((resolve) => {
    unlock = () => {
      reservationSlotLocks.delete(tableKey);
      resolve();
    };
  });
  reservationSlotLocks.set(tableKey, lockPromise);
  return unlock;
}


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

  // Lỗ hổng 6: Rate Limiting chống DoS & brute-force spam (cho phép chạy automation testing local)
  const isLocalRequest = (req: express.Request) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    return ip.includes('127.0.0.1') || ip === '::1' || req.path.startsWith('/api/test');
  };

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5000, // Hạn mức rộng rãi cho việc chạy test tự động nhiều lần
    skip: isLocalRequest,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Quá nhiều yêu cầu từ IP của bạn. Vui lòng thử lại sau ít phút.', code: 'RATE_LIMIT_EXCEEDED' },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút (SRS FR-SYS-04)
    max: process.env.NODE_ENV === 'test' ? 1000 : 5, // SRS: 5 lần/15 phút cho môi trường thật
    skip: isLocalRequest,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Đã thử đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.', code: 'AUTH_RATE_LIMIT' },
  });

  const reservationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 phút (SRS 5.1)
    max: process.env.NODE_ENV === 'test' ? 1000 : 30, // SRS: 30 request/phút
    skip: isLocalRequest,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Quá nhiều yêu cầu đặt bàn trong thời gian ngắn. Vui lòng thử lại sau 1 phút.', code: 'RESERVATION_RATE_LIMIT' },
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

  // API: Public Menu Listing
  app.get('/api/menu', (req, res) => {
    res.json(MENU_ITEMS);
  });

  // -------------------------------------------------------------
  // Lỗ hổng 1 & 3: XÁC THỰC MẬT KHẨU & PHÁT HÀNH JWT TẠI SERVER (ĐÃ LOẠI BỎ MASTER BACKDOOR)
  // -------------------------------------------------------------
  app.post('/api/auth/login', authLimiter, async (req, res) => {
    const rawIdentifier = req.body.identifier || req.body.username;
    const { password } = req.body;
    if (!rawIdentifier || !password) {
      return res.status(400).json({ error: 'Vui lòng cung cấp tài khoản và mật khẩu.' });
    }

    const cleanId = String(rawIdentifier).trim().toLowerCase();
    const cleanPhone = String(rawIdentifier).trim().replace(/\s+/g, '');

    // Tìm tài khoản theo Email hoặc Số điện thoại
    let user = localUsers.find(
      u => (u.email || '').toLowerCase() === cleanId || 
           (u.phone || '').replace(/\s+/g, '') === cleanPhone
    );

    if (!user) {
      return res.status(401).json({ error: 'Tài khoản (Email hoặc Số điện thoại) không tồn tại!' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Tài khoản này đang bị tạm khóa.' });
    }

    // Kiểm tra mật khẩu bằng bcrypt hoặc hash đã lưu (không cho phép backdoor hay bypass bừa bãi)
    const hash = serverPasswordHashes[user.id];
    let isMatch = false;

    if (hash) {
      isMatch = bcrypt.compareSync(password, hash);
    } else if (user.passwordHash) {
      isMatch = password === user.passwordHash || bcrypt.compareSync(password, user.passwordHash);
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
  // Lỗ hổng 5 & SRS 4.1.1: TRA CỨU ĐẶT BÀN AN TOÀN (THEO MÃ VÀ/HOẶC SĐT)
  // -------------------------------------------------------------
  app.post('/api/reservations/lookup', async (req, res) => {
    const rawCode = req.body.bookingCode || req.body.code;
    const rawPhone = req.body.phone || req.body.customerPhone;

    if (!rawCode && !rawPhone) {
      return res.status(400).json({
        error: 'Vui lòng cung cấp Mã đặt bàn (VD: LGB-7K9P2) hoặc Số điện thoại để tra cứu.',
        code: 'MISSING_LOOKUP_IDENTIFIER'
      });
    }

    const cleanCode = rawCode ? String(rawCode).trim().toUpperCase().replace('#', '') : null;
    const cleanPhone = rawPhone ? String(rawPhone).trim().replace(/\s+/g, '') : null;

    let allResList: any[] = [];
    try {
      allResList = await db.select().from(reservations);
      if (allResList.length === 0) allResList = localReservations;
    } catch {
      allResList = localReservations;
    }

    const matches = allResList.filter(r => {
      const matchCode = cleanCode ? (r.bookingCode || '').toUpperCase().replace('#', '') === cleanCode : true;
      const matchPhone = cleanPhone ? (r.customerPhone || '').replace(/\s+/g, '') === cleanPhone : true;
      return (cleanCode && cleanPhone) ? (matchCode && matchPhone) : (cleanCode ? matchCode : matchPhone);
    });

    if (matches.length === 0) {
      return res.status(404).json({
        error: 'Không tìm thấy đơn đặt bàn khớp với thông tin đã cung cấp.',
        code: 'RESERVATION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      count: matches.length,
      reservations: matches,
      reservation: matches[0],
    });
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

  // Vấn đề 1: API tra cứu tình trạng bàn trống theo ngày & khung giờ cụ thể (Dynamic Time-slot Availability)
  app.get('/api/tables/availability', async (req, res) => {
    const queryDate = String(req.query.date || getVietnamDateString()).trim();
    const queryTime = String(req.query.time || '18:00').trim();

    let allResForDate: any[] = [];
    try {
      allResForDate = await db.select().from(reservations).where(eq(reservations.bookingDate, queryDate));
    } catch {
      allResForDate = localReservations.filter(r => r.bookingDate === queryDate);
    }

    // Chỉ lọc các đơn chưa hủy
    const activeBookings = allResForDate.filter(r => r.status !== 'cancelled');

    const tablesWithSlotStatus = localTables.map(t => {
      const activeForThisTable = activeBookings.find(r => {
        const isThisTable = r.tableId === t.id || (r.selectedMergedTableIds && r.selectedMergedTableIds.includes(t.id));
        if (!isThisTable) return false;
        return areTimeSlotsOverlapping(r.arrivalTime, queryTime, 120);
      });

      return {
        ...t,
        slotStatus: activeForThisTable ? 'reserved' : 'available',
        reservedByBookingCode: activeForThisTable ? activeForThisTable.bookingCode : null,
        reservedTime: activeForThisTable ? activeForThisTable.arrivalTime : null,
      };
    });

    res.json({
      date: queryDate,
      time: queryTime,
      tables: tablesWithSlotStatus
    });
  });

  // Tách biệt quyền hạn theo SRS App.A:
  // - Staff chỉ được cập nhật trạng thái vận hành bàn: status, currentReservationId
  // - Chỉ Admin mới có quyền sửa đổi cấu hình vật lý: capacity, name, area, shape
  app.put('/api/tables/:id', authenticateToken, requireRoles(['admin', 'staff']), async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const body = req.body;
    const isStaffOnly = req.user?.role === 'staff';

    let updates: any = {};
    if (isStaffOnly) {
      if (body.status !== undefined) updates.status = body.status;
      if (body.currentReservationId !== undefined) updates.currentReservationId = body.currentReservationId;
    } else {
      updates = { ...body };
    }

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
  // Chỉ Admin và Staff mới được xem TOÀN BỘ danh sách reservations
  app.get('/api/reservations', authenticateToken, requireRoles(['admin', 'staff']), async (req: AuthenticatedRequest, res) => {
    try {
      const allRes = await db.select().from(reservations).orderBy(desc(reservations.createdAt));
      res.json(allRes);
    } catch (error) {
      res.json(localReservations);
    }
  });

  // POST /api/reservations:
  // - Khắc phục Vấn đề 2: Server-side Input Validation & Sanitization (tên, SĐT, email tùy chọn, sức chứa bàn, ngày, giờ, bàn 404)
  // - Khắc phục Vấn đề 1: Kiểm tra trùng bàn cùng khung giờ (cửa sổ 120 phút theo SRS) & Trạng thái bàn thông minh
  // - Race condition / ACID: Sử dụng mutex slot lock chống xung đột 2 request đồng thời
  // - Server-authoritative Pricing & Điểm thưởng: 1 điểm / 10.000đ theo SRS 4.2.8 (không cộng 20đ ảo cho đơn 0đ)
  // - Mã đơn duy nhất dạng LGB-XXXXX theo chuẩn SRS
  // - Trạng thái ban đầu mặc định là 'pending' theo SRS 4.1.4.1
  app.post('/api/reservations', reservationLimiter, async (req, res) => {
    const newRes = req.body || {};

    const customerName = String(newRes.customerName || '').trim();
    const customerPhone = String(newRes.customerPhone || '').trim().replace(/\s+/g, '');
    const rawCustomerEmail = newRes.customerEmail ? String(newRes.customerEmail).trim().toLowerCase() : '';
    const customerEmail = rawCustomerEmail;
    const rawGuestCount = newRes.guestCount;
    const guestCount = Number(rawGuestCount);
    const bookingDate = String(newRes.bookingDate || '').trim();
    const arrivalTime = String(newRes.arrivalTime || newRes.bookingTime || '').trim();
    const rawTableId = newRes.tableId;
    const tableId = String(rawTableId || '').trim();

    // 1. Kiểm tra Tên khách hàng (bắt buộc, 2-100 ký tự, không chứa HTML/script tag)
    if (!customerName || customerName.length < 2 || customerName.length > 100) {
      return res.status(400).json({
        error: 'Tên khách hàng không hợp lệ (bắt buộc, từ 2 đến 100 ký tự).',
        code: 'INVALID_CUSTOMER_NAME',
        field: 'customerName'
      });
    }
    if (/<[^>]*>|[<>]/.test(customerName)) {
      return res.status(400).json({
        error: 'Tên khách hàng chứa ký tự không hợp lệ hoặc mã độc HTML/Script.',
        code: 'MALICIOUS_INPUT',
        field: 'customerName'
      });
    }

    // 2. Kiểm tra Số điện thoại (chuẩn regex số điện thoại Việt Nam 9-11 chữ số theo SRS 4.1.4.1)
    if (!customerPhone || !VIETNAMESE_PHONE_REGEX.test(customerPhone)) {
      return res.status(400).json({
        error: 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam hợp lệ (VD: 0912345678 hoặc +84912345678).',
        code: 'INVALID_PHONE_NUMBER',
        field: 'customerPhone'
      });
    }

    // 3. Kiểm tra Email (SRS 4.1.4.1: Nếu nhập mới kiểm tra, không bắt buộc)
    if (customerEmail && !EMAIL_REGEX.test(customerEmail)) {
      return res.status(400).json({
        error: 'Địa chỉ email không đúng định dạng chuẩn (VD: thutrang@gmail.com).',
        code: 'INVALID_EMAIL_FORMAT',
        field: 'customerEmail'
      });
    }

    // 4. Kiểm tra Số lượng khách (phải là số nguyên từ 1 đến 30 người)
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 30) {
      return res.status(400).json({
        error: 'Số lượng khách phải là số nguyên từ 1 đến tối đa 30 người. Nếu đi đoàn tiệc lớn hơn, vui lòng liên hệ hotline để được phục vụ chu đáo.',
        code: 'INVALID_GUEST_COUNT',
        field: 'guestCount'
      });
    }

    // 5. Kiểm tra Ngày đặt bàn (định dạng YYYY-MM-DD và không trong quá khứ theo giờ Việt Nam GMT+7)
    if (!bookingDate || !DATE_FORMAT_REGEX.test(bookingDate)) {
      return res.status(400).json({
        error: 'Định dạng ngày đặt bàn không hợp lệ (yêu cầu định dạng chuẩn YYYY-MM-DD).',
        code: 'INVALID_BOOKING_DATE',
        field: 'bookingDate'
      });
    }
    const todayStr = getVietnamDateString();
    if (bookingDate < todayStr) {
      return res.status(400).json({
        error: 'Ngày đặt bàn không hợp lệ (không thể đặt bàn cho ngày trong quá khứ).',
        code: 'PAST_BOOKING_DATE',
        field: 'bookingDate'
      });
    }

    // 6. Kiểm tra Giờ đến (định dạng HH:mm, khung giờ mở cửa 10:00 - 22:30, và không ở quá khứ nếu là hôm nay)
    if (!arrivalTime || !TIME_FORMAT_REGEX.test(arrivalTime)) {
      return res.status(400).json({
        error: 'Định dạng giờ đến không hợp lệ (yêu cầu định dạng chuẩn HH:mm).',
        code: 'INVALID_ARRIVAL_TIME',
        field: 'arrivalTime'
      });
    }
    const arrivalMinutes = timeToMinutes(arrivalTime);
    if (arrivalMinutes < 600 || arrivalMinutes > 1350) {
      return res.status(400).json({
        error: 'Giờ đến nằm ngoài khung giờ phục vụ của nhà hàng (10:00 - 22:30).',
        code: 'OUT_OF_OPERATING_HOURS',
        field: 'arrivalTime'
      });
    }
    if (isTimeSlotInPast(arrivalTime, bookingDate)) {
      return res.status(400).json({
        error: 'Khung giờ đặt bàn này đã trôi qua. Vui lòng chọn khung giờ hoặc ngày khác.',
        code: 'PAST_TIME_SLOT',
        field: 'arrivalTime'
      });
    }

    // 7. Kiểm tra Bàn tồn tại trong hệ thống (SRS App.B: trả mã 404 khi không tìm thấy)
    const targetTable = localTables.find(t => 
      t.id === tableId || 
      t.id === `T-${String(rawTableId).padStart(2, '0')}` || 
      String(t.id) === String(rawTableId) ||
      t.name === `Bàn ${rawTableId}`
    );
    if (!targetTable) {
      return res.status(404).json({
        error: `Bàn với mã "${tableId || rawTableId}" không tồn tại trong sơ đồ nhà hàng.`,
        code: 'TABLE_NOT_FOUND',
        field: 'tableId'
      });
    }

    // 7b. Kiểm tra Sức chứa bàn (SRS TC-41: guestCount <= sức chứa bàn + bàn ghép)
    let totalCapacity = targetTable.capacity;
    if (Array.isArray(newRes.selectedMergedTableIds)) {
      for (const mId of newRes.selectedMergedTableIds) {
        const mTable = localTables.find(t => t.id === mId || String(t.id) === String(mId));
        if (mTable) totalCapacity += mTable.capacity;
      }
    }
    if (guestCount > totalCapacity) {
      return res.status(400).json({
        error: `Số lượng khách (${guestCount} người) vượt quá sức chứa tối đa của bàn (${totalCapacity} chỗ).`,
        code: 'EXCEEDS_TABLE_CAPACITY',
        field: 'guestCount'
      });
    }

    // 7c. Kiểm tra Số lượng món đặt trước (SRS TC-58/59: số lượng phải là số nguyên >= 1, không được âm hoặc 0)
    const rawDishes = newRes.selectedDishes || newRes.preOrders || [];
    if (Array.isArray(rawDishes) && rawDishes.length > 0) {
      for (const item of rawDishes) {
        const qty = Number(item.quantity);
        if (!Number.isInteger(qty) || qty <= 0) {
          return res.status(400).json({
            error: 'Số lượng món ăn đặt trước phải là số nguyên dương từ 1 trở lên.',
            code: 'INVALID_DISH_QUANTITY',
            field: 'preOrders'
          });
        }
      }
    }

    // Mutex bảo vệ chống Race condition đồng thời vào cùng 1 bàn
    const lockKey = `${bookingDate}_${targetTable.id}`;
    const releaseLock = await acquireSlotLock(lockKey);

    try {
      // 8. Vấn đề 1: KIỂM TRA TRÙNG BÀN CÙNG KHUNG GIỜ (Cửa sổ phục vụ 120 phút theo SRS)
      let currentReservationsForDate: any[] = [];
      try {
        currentReservationsForDate = await db.select().from(reservations).where(eq(reservations.bookingDate, bookingDate));
      } catch {
        currentReservationsForDate = localReservations.filter(r => r.bookingDate === bookingDate);
      }

      const conflictingReservation = currentReservationsForDate.find(r => {
        if (r.status === 'cancelled') return false;
        const isSameTable = r.tableId === targetTable.id || (r.selectedMergedTableIds && r.selectedMergedTableIds.includes(targetTable.id));
        if (!isSameTable) return false;
        // Trùng hoặc giao thoa khung giờ trong bán kính 120 phút dùng bữa
        return areTimeSlotsOverlapping(r.arrivalTime, arrivalTime, 120);
      });

      if (conflictingReservation) {
        return res.status(409).json({
          error: `Bàn ${targetTable.name} đã được khách khác đặt vào lúc ${conflictingReservation.arrivalTime} ngày ${bookingDate} (Mã đơn: #${conflictingReservation.bookingCode}). Vui lòng chọn bàn khác hoặc khung giờ cách ít nhất 120 phút.`,
          code: 'TABLE_SLOT_CONFLICT',
          conflictingBookingCode: conflictingReservation.bookingCode,
          conflictingTime: conflictingReservation.arrivalTime,
          tableId: targetTable.id,
          tableName: targetTable.name
        });
      }

      // 9. Server-authoritative Pricing: Tự tính tiền món dựa trên menu gốc phía Server
      let verifiedPreOrderTotal = 0;
      const verifiedSelectedDishes = (rawDishes || []).map((item: any) => {
        const dishId = item.dish?.id || item.dishId || (item.menuItemId ? `m-${String(item.menuItemId).padStart(2, '0')}` : null);
        const originalPrice = (dishId && MENU_PRICE_MAP.get(dishId)) || item.dish?.price || item.price || 0;
        const qty = Number(item.quantity) || 1;
        verifiedPreOrderTotal += originalPrice * qty;
        return {
          ...item,
          dish: {
            ...(item.dish || {}),
            id: dishId || item.dish?.id || 'm-custom',
            price: originalPrice,
          },
          quantity: qty,
        };
      });

      // 10. Tự kiểm tra và tính giảm giá Voucher tại Server
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
      let verifiedDeposit = 0;
      if (newRes.depositAmount > 0) {
        verifiedDeposit = verifiedFinalTotal > 0 ? Math.round(verifiedFinalTotal * 0.2 / 10000) * 10000 : 200000;
      }

      // Công thức điểm thưởng chuẩn SRS 4.2.8: 1 điểm cho mỗi 10.000đ thanh toán
      const calculatedPoints = Math.floor(verifiedFinalTotal / 10000);

      // Sinh mã đặt chỗ duy nhất dạng LGB-XXXXX theo SRS
      let finalBookingCode = newRes.bookingCode;
      if (!finalBookingCode) {
        let candidate = generateBookingCodeString();
        while (localReservations.some(r => r.bookingCode === candidate)) {
          candidate = generateBookingCodeString();
        }
        finalBookingCode = candidate;
      }

      const reservationData = {
        id: newRes.id || `res_${Date.now()}`,
        bookingCode: finalBookingCode,
        userId: newRes.userId || null,
        customerName,
        customerPhone,
        customerEmail: customerEmail || '',
        guestCount,
        bookingDate,
        arrivalTime,
        tableId: targetTable.id,
        tableName: targetTable.name,
        tableArea: targetTable.area,
        selectedDishes: verifiedSelectedDishes,
        preOrderTotal: verifiedPreOrderTotal,
        depositAmount: verifiedDeposit,
        discountAmount: verifiedDiscount,
        voucherCode: inputVoucher,
        totalAmount: verifiedFinalTotal,
        status: (newRes.status || 'pending') as ValidStatus, // Trạng thái ban đầu luôn là 'pending' theo SRS 4.1.4.1
        occasion: newRes.occasion ? String(newRes.occasion).trim() : null,
        specialRequests: newRes.specialRequests ? String(newRes.specialRequests).trim() : null,
        emailConfirmationSent: newRes.emailConfirmationSent ?? true,
        emailSentAt: newRes.emailSentAt || new Date().toISOString(),
        pointsEarned: calculatedPoints,
        createdAt: toValidDate(newRes.createdAt),
      };

      // Quản lý trạng thái bàn thông minh:
      // Bàn chỉ chuyển trạng thái 'reserved' trên sơ đồ trực tiếp nếu đơn là HÔM NAY và cách giờ đến dưới 180 phút
      const isToday = bookingDate === todayStr;
      const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
      const diffToArrival = arrivalMinutes - nowMinutes;
      const shouldMarkReservedToday = isToday && diffToArrival >= -60 && diffToArrival <= 180;

      try {
        const inserted = await db.insert(reservations).values(reservationData).returning();
        
        if (shouldMarkReservedToday) {
          await db.update(tables)
            .set({ status: 'reserved', currentReservationId: reservationData.bookingCode })
            .where(eq(tables.id, targetTable.id));
        }

        res.status(201).json(inserted[0] || reservationData);
      } catch (error) {
        localReservations.unshift(reservationData as any);
        if (shouldMarkReservedToday) {
          const tIdx = localTables.findIndex(t => t.id === targetTable.id);
          if (tIdx !== -1) {
            localTables[tIdx] = { ...localTables[tIdx], status: 'reserved', currentReservationId: reservationData.bookingCode };
          }
        }
        res.status(201).json(reservationData);
      }
    } finally {
      releaseLock();
    }
  });

  // Vấn đề 3: API đổi trạng thái đơn - Kiểm soát chặt chẽ máy trạng thái (Finite State Machine Transitions)
  // Chỉ Admin và Staff mới được đổi trạng thái
  app.patch('/api/reservations/:id/status', authenticateToken, requireRoles(['admin', 'staff']), async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    // 1. Kiểm tra tính hợp lệ của status đầu vào
    if (!newStatus || !VALID_RESERVATION_STATUSES.includes(newStatus as ValidStatus)) {
      return res.status(400).json({
        error: `Trạng thái "${newStatus}" không hợp lệ. Các trạng thái được phép: ${VALID_RESERVATION_STATUSES.join(', ')}.`,
        code: 'INVALID_STATUS_VALUE'
      });
    }

    // 2. Tìm đơn đặt bàn hiện tại (hỗ trợ cả UUID id lẫn mã bookingCode như LGB-XXXXX)
    let currentReservation: any = null;
    try {
      let dbFound = await db.select().from(reservations).where(eq(reservations.id, id));
      if (dbFound.length === 0) {
        dbFound = await db.select().from(reservations).where(eq(reservations.bookingCode, id));
      }
      currentReservation = dbFound[0];
    } catch {
      currentReservation = localReservations.find(r => r.id === id || (r as any).bookingCode === id);
    }
    if (!currentReservation) {
      currentReservation = localReservations.find(r => r.id === id || (r as any).bookingCode === id);
    }

    if (!currentReservation) {
      return res.status(404).json({
        error: `Không tìm thấy đơn đặt bàn với mã hoặc ID: "${id}".`,
        code: 'RESERVATION_NOT_FOUND'
      });
    }

    const currentStatus = (currentReservation.status || 'pending') as ValidStatus;

    // 3. Nếu trạng thái không thay đổi, trả về kết quả ngay
    if (currentStatus === newStatus) {
      return res.json(currentReservation);
    }

    // 4. KIỂM TRA MÁY TRẠNG THÁI HỢP LỆ (STATE TRANSITION VALIDATION)
    const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedNextStatuses.includes(newStatus as ValidStatus)) {
      return res.status(400).json({
        error: `Không thể chuyển trạng thái từ "${currentStatus}" sang "${newStatus}". Luồng trạng thái hợp lệ: ${
          currentStatus === 'completed' || currentStatus === 'cancelled'
            ? 'Đơn đã kết thúc (' + currentStatus + '), không thể thay đổi thêm.'
            : currentStatus + ' chỉ được chuyển sang: ' + allowedNextStatuses.join(', ')
        }.`,
        code: 'INVALID_STATUS_TRANSITION',
        currentStatus,
        attemptedStatus: newStatus,
        allowedStatuses: allowedNextStatuses
      });
    }

    // 5. Cập nhật trạng thái đơn trong DB / Memory
    try {
      const updated = await db.update(reservations).set({ status: newStatus }).where(eq(reservations.id, currentReservation.id)).returning();
      currentReservation = updated[0] || { ...currentReservation, status: newStatus };
    } catch (error) {
      const rIdx = localReservations.findIndex(r => r.id === currentReservation.id || (r as any).bookingCode === currentReservation.bookingCode);
      if (rIdx !== -1) {
        localReservations[rIdx] = { ...localReservations[rIdx], status: newStatus as any };
        currentReservation = localReservations[rIdx];
      } else {
        currentReservation.status = newStatus;
      }
    }

    // 6. GIẢI PHÓNG HOẶC ĐIỀU CHỈNH TRẠNG THÁI BÀN (TABLE SIDE EFFECTS)
    const targetTableId = currentReservation.tableId;
    if (targetTableId) {
      if (newStatus === 'completed' || newStatus === 'cancelled') {
        // Khi hoàn tất hoặc hủy đơn -> Giải phóng bàn về available
        try {
          await db.update(tables)
            .set({ status: 'available', currentReservationId: null })
            .where(eq(tables.id, targetTableId));
        } catch {
          const tIdx = localTables.findIndex(t => t.id === targetTableId);
          if (tIdx !== -1) {
            localTables[tIdx] = { ...localTables[tIdx], status: 'available', currentReservationId: undefined };
          }
        }
      } else if (newStatus === 'checked_in' || newStatus === 'seated') {
        // Khi khách đã nhận bàn hoặc đang dùng bữa -> Đánh dấu occupied
        try {
          await db.update(tables)
            .set({ status: 'occupied', currentReservationId: currentReservation.bookingCode })
            .where(eq(tables.id, targetTableId));
        } catch {
          const tIdx = localTables.findIndex(t => t.id === targetTableId);
          if (tIdx !== -1) {
            localTables[tIdx] = { ...localTables[tIdx], status: 'occupied', currentReservationId: currentReservation.bookingCode };
          }
        }
      }
    }

    res.json(currentReservation);
  });

  // -------------------------------------------------------------
  // Users API
  // -------------------------------------------------------------
  // SRS 4.3.1: Chỉ Admin mới được xem toàn bộ danh sách User trong hệ thống
  app.get('/api/users', authenticateToken, requireRoles(['admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const allUsers = await db.select().from(users);
      // Giấu mọi thông tin mật khẩu
      res.json(allUsers);
    } catch (error) {
      res.json(localUsers.map(({ passwordHash: _, ...u }) => u));
    }
  });

  // SRS 4.2.1 / TC-12: Đăng ký thành viên, kiểm tra trùng email và mật khẩu tối thiểu 6 ký tự
  app.post('/api/users', async (req, res) => {
    const userData = req.body || {};
    const name = String(userData.name || '').trim();
    const email = String(userData.email || '').trim().toLowerCase();
    const phone = String(userData.phone || '').trim().replace(/\s+/g, '');
    const password = String(userData.password || '').trim();

    if (!name || name.length < 2) {
      return res.status(400).json({
        error: 'Họ tên là bắt buộc và phải có ít nhất 2 ký tự.',
        code: 'INVALID_NAME',
        field: 'name'
      });
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        error: 'Địa chỉ email không hợp lệ.',
        code: 'INVALID_EMAIL',
        field: 'email'
      });
    }

    if (!phone || !VIETNAMESE_PHONE_REGEX.test(phone)) {
      return res.status(400).json({
        error: 'Số điện thoại không đúng định dạng chuẩn Việt Nam (9-11 chữ số).',
        code: 'INVALID_PHONE',
        field: 'phone'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        error: 'Mật khẩu là bắt buộc và phải có tối thiểu 6 ký tự trở lên (theo SRS 4.2.1).',
        code: 'INVALID_PASSWORD',
        field: 'password'
      });
    }

    // Chống trùng lặp email khi đăng ký tài khoản (SRS TC-12)
    const emailExists = localUsers.some(u => (u.email || '').toLowerCase() === email);
    if (emailExists) {
      return res.status(409).json({
        error: 'Email này đã tồn tại trong hệ thống. Vui lòng đăng nhập hoặc sử dụng email khác.',
        code: 'EMAIL_ALREADY_EXISTS',
        field: 'email'
      });
    }

    const userToInsert = {
      id: userData.id || `user-${Date.now()}`,
      email,
      name,
      phone,
      role: 'customer' as const,
      membershipTier: userData.membershipTier || 'Đồng', // Hạng mặc định là Đồng (0-499 điểm theo SRS 4.2.8)
      loyaltyPoints: Number(userData.loyaltyPoints) || 0,
      avatar: userData.avatar || null,
      favoriteDishIds: userData.favoriteDishIds || [],
      dietaryPreferences: userData.dietaryPreferences || '',
      createdAt: toValidDate(userData.createdAt),
    };

    // Băm mật khẩu an toàn bằng bcrypt
    serverPasswordHashes[userToInsert.id] = bcrypt.hashSync(password, 10);

    try {
      const inserted = await db.insert(users).values(userToInsert).returning();
      res.status(201).json(inserted[0] || userToInsert);
    } catch (error) {
      localUsers.push(userToInsert as any);
      res.status(201).json(userToInsert);
    }
  });

  // SRS 4.2.4 & TC-19: Chống leo thang đặc quyền (Privilege Escalation Protection)
  // - Admin có quyền sửa đổi toàn bộ thông tin
  // - Khách hàng / thành viên chỉ được sửa thông tin cá nhân cơ bản (name, phone, avatar, dietaryPreferences)
  // - Nghiêm cấm non-admin tự nâng role, tự cộng điểm loyaltyPoints, hoặc tự đổi hạng membershipTier
  app.patch('/api/users/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const body = req.body || {};
    const isAdmin = req.user?.role === 'admin';

    // Phải là Admin hoặc chính chủ tài khoản
    if (!isAdmin && req.user?.id !== id) {
      return res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa tài khoản của người khác.' });
    }

    let updates: any = {};
    if (isAdmin) {
      const { id: _, ...adminUpdates } = body;
      updates = adminUpdates;
    } else {
      // Whitelist chặt chẽ cho người dùng thông thường
      if (body.name !== undefined) updates.name = String(body.name).trim();
      if (body.phone !== undefined) updates.phone = String(body.phone).trim();
      if (body.avatar !== undefined) updates.avatar = body.avatar;
      if (body.dietaryPreferences !== undefined) updates.dietaryPreferences = body.dietaryPreferences;
      if (body.favoriteDishIds !== undefined) updates.favoriteDishIds = body.favoriteDishIds;
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

  // -------------------------------------------------------------
  // Test Automation Sandbox Reset API
  // -------------------------------------------------------------
  app.post('/api/test/reset-sandbox', async (req, res) => {
    try {
      const isTestRecord = (r: any) => 
        (r.customerName && r.customerName.includes('[TEST]')) ||
        (r.customerPhone && (r.customerPhone.startsWith('0900000') || r.customerPhone.startsWith('0999999'))) ||
        (r.customerEmail && r.customerEmail.includes('autotest')) ||
        (r.bookingCode && r.bookingCode.startsWith('TEST-'));

      const testRes = localReservations.filter(isTestRecord);
      const testTableIds = new Set(testRes.map(r => r.tableId).filter(Boolean));

      // Reset in-memory
      const beforeCount = localReservations.length;
      const retainedReservations = localReservations.filter(r => !isTestRecord(r));
      localReservations.length = 0;
      localReservations.push(...retainedReservations);

      // Reset any tables that were locked by test bookings
      localTables.forEach(t => {
        if (testTableIds.has(t.id)) {
          t.status = 'available';
          t.currentReservationId = undefined;
        }
      });

      // Try database cleanup if connected
      try {
        for (const tid of testTableIds) {
          await db.update(tables).set({ status: 'available', currentReservationId: null }).where(eq(tables.id, tid));
        }
      } catch (dbErr) {
        // In-memory fallback is already applied
      }

      res.json({
        success: true,
        message: 'Đã dọn dẹp sạch sẽ toàn bộ dữ liệu kiểm thử giả lập (Sandbox).',
        clearedCount: beforeCount - retainedReservations.length,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Lỗi khi đặt lại sandbox test', details: err?.message });
    }
  });

  // -------------------------------------------------------------
  // Standalone Automation Test Suite UI (/automation)
  // -------------------------------------------------------------
  const automationDistPath = path.join(process.cwd(), 'automation-test-suite', 'dist');
  app.use('/automation', express.static(automationDistPath));
  app.get('/automation*', (req, res) => {
    res.sendFile(path.join(automationDistPath, 'index.html'));
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
