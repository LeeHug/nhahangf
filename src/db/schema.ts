import { pgTable, text, integer, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';

// Users table (matching Firebase Auth UID and customer profile)
export const users = pgTable('users', {
  id: text('id').primaryKey(), // user ID or Firebase UID
  uid: text('uid').unique(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  membershipTier: text('membership_tier').notNull().default('Đồng'), // 'Đồng' | 'Bạc' | 'Vàng' | 'Kim Cương'
  loyaltyPoints: integer('loyalty_points').notNull().default(0),
  avatar: text('avatar'),
  favoriteDishIds: jsonb('favorite_dish_ids').$type<string[]>().default([]),
  dietaryPreferences: text('dietary_preferences'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Restaurant Tables (expanded inventory across areas)
export const tables = pgTable('tables', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  area: text('area').notNull(), // 'main' | 'vip' | 'garden' | 'rooftop'
  capacity: integer('capacity').notNull(),
  status: text('status').notNull().default('available'), // 'available' | 'occupied' | 'reserved' | 'cleaning'
  currentReservationId: text('current_reservation_id'),
  shape: text('shape').notNull().default('rectangle'), // 'round' | 'rectangle'
  description: text('description'),
});

// Reservations table
export const reservations = pgTable('reservations', {
  id: text('id').primaryKey(),
  bookingCode: text('booking_code').notNull().unique(),
  userId: text('user_id'),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerEmail: text('customer_email').notNull(),
  guestCount: integer('guest_count').notNull(),
  bookingDate: text('booking_date').notNull(), // YYYY-MM-DD
  arrivalTime: text('arrival_time').notNull(), // HH:MM
  tableId: text('table_id').notNull(),
  tableIds: jsonb('table_ids').$type<string[]>().default([]),
  tableName: text('table_name').notNull(),
  tableArea: text('table_area').notNull(),
  selectedDishes: jsonb('selected_dishes').notNull().default([]), // array of SelectedDishItem
  preOrderTotal: integer('pre_order_total').notNull().default(0),
  depositAmount: integer('deposit_amount').notNull().default(0),
  discountAmount: integer('discount_amount').default(0),
  voucherCode: text('voucher_code'),
  totalAmount: integer('total_amount').notNull().default(0),
  status: text('status').notNull().default('confirmed'), // 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled'
  occasion: text('occasion'),
  specialRequests: text('special_requests'),
  emailConfirmationSent: boolean('email_confirmation_sent').default(true),
  emailSentAt: text('email_sent_at'),
  pointsEarned: integer('points_earned').default(0),
  pointsRedeemed: integer('points_redeemed').default(0),
  pointsDiscount: integer('points_discount').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Sent Email Logs
export const emailLogs = pgTable('email_logs', {
  id: text('id').primaryKey(),
  recipientEmail: text('recipient_email').notNull(),
  recipientName: text('recipient_name').notNull(),
  bookingCode: text('booking_code').notNull(),
  sentAt: text('sent_at').notNull(),
  subject: text('subject').notNull(),
  status: text('status').notNull().default('delivered'),
  type: text('type').notNull().default('confirmation'),
  previewBody: text('preview_body'),
});
