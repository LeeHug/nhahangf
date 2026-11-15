import { 
  Reservation, 
  RestaurantTable, 
  SentEmailLog, 
  ReservationStatus, 
  UserAccount, 
  UserRole,
  MembershipTier, 
  MenuItem, 
  SelectedDishItem,
  KitchenTicket,
  KitchenTicketItem,
  KitchenStation,
  KitchenItemStatus,
  KitchenTicketPriority,
  DishCategory,
  Ingredient,
  DishRecipeBOM,
  InventoryLog,
  DishCostAnalysis,
  RecipeItemIngredient,
  TableServiceRequest,
  TableServiceRequestType,
  TableServiceStatus,
  CustomerReview,
  CSATSummaryMetrics,
  PointsTransaction
} from '../types';
import { INITIAL_RESERVATIONS, INITIAL_TABLES, INITIAL_EMAIL_LOGS, INITIAL_USERS, MENU_ITEMS, INITIAL_POINTS_TRANSACTIONS } from '../data/mockData';
import { INITIAL_INGREDIENTS, INITIAL_RECIPES, INITIAL_INVENTORY_LOGS } from '../data/inventoryData';
import { INITIAL_CUSTOMER_REVIEWS, INITIAL_TABLE_SERVICE_REQUESTS } from '../data/reviewsAndServiceData';

const RESERVATIONS_KEY = 'restaurant_reservations_v1';
const TABLES_KEY = 'restaurant_tables_v1';
const EMAIL_LOGS_KEY = 'restaurant_email_logs_v1';
const USERS_KEY = 'restaurant_users_v1';
const CURRENT_USER_KEY = 'restaurant_current_user_v1';
const PASSWORDS_KEY = 'restaurant_passwords_v1';
const MENU_ITEMS_KEY = 'restaurant_menu_items_v1';
const KITCHEN_TICKETS_KEY = 'restaurant_kitchen_tickets_v1';
const INGREDIENTS_KEY = 'restaurant_ingredients_v1';
const RECIPE_BOM_KEY = 'restaurant_recipe_bom_v1';
const INVENTORY_LOGS_KEY = 'restaurant_inventory_logs_v1';
const SERVICE_REQUESTS_KEY = 'restaurant_service_requests_v1';
const CUSTOMER_REVIEWS_KEY = 'restaurant_customer_reviews_v1';
const POINTS_TRANSACTIONS_KEY = 'restaurant_points_transactions_v1';



export function getStoredUsers(): UserAccount[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (data) {
      const parsed: UserAccount[] = JSON.parse(data);
      const existingIds = new Set(parsed.map(u => u.id));
      let hasNew = false;
      INITIAL_USERS.forEach(initU => {
        if (!existingIds.has(initU.id)) {
          const { passwordHash, ...user } = initU;
          parsed.push(user);
          hasNew = true;
        }
      });
      if (hasNew) {
        saveStoredUsers(parsed);
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse users from storage', e);
  }
  // Initialize from INITIAL_USERS without exposing passwordHash directly in UserAccount
  const baseUsers: UserAccount[] = INITIAL_USERS.map(({ passwordHash, ...user }) => user);
  saveStoredUsers(baseUsers);
  return baseUsers;
}

export function saveStoredUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to storage', e);
  }
}

function getStoredPasswords(): Record<string, string> {
  const defaultMap: Record<string, string> = {};
  INITIAL_USERS.forEach(u => {
    defaultMap[u.id] = u.passwordHash || '123456';
  });

  try {
    const data = localStorage.getItem(PASSWORDS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return { ...defaultMap, ...parsed };
    }
  } catch (e) {
    console.error('Failed to parse passwords', e);
  }
  return defaultMap;
}

function saveStoredPasswords(passMap: Record<string, string>): void {
  try {
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passMap));
  } catch (e) {
    console.error('Failed to save passwords', e);
  }
}

export function getCurrentUser(): UserAccount | null {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse current user', e);
  }
  return null;
}

export function saveCurrentUser(user: UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error('Failed to save current user', e);
  }
}

export function loginUser(identifier: string, password?: string): { success: boolean; user?: UserAccount; message: string } {
  const users = getStoredUsers();
  const cleanId = (identifier || '').trim().toLowerCase();
  const user = users.find(u => 
    (u.email || '').toLowerCase() === cleanId || 
    (u.phone || '').replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')
  );

  if (!user) {
    return { success: false, message: 'Tài khoản (Email hoặc Số điện thoại) không tồn tại trong hệ thống!' };
  }

  if (user.status === 'inactive') {
    return { success: false, message: 'Tài khoản này đang bị tạm khóa bởi Ban Quản Lý. Vui lòng liên hệ quản trị viên!' };
  }

  // Password verification
  if (!password || password.trim() === '') {
    return { success: false, message: 'Vui lòng nhập mật khẩu đăng nhập!' };
  }

  const passMap = getStoredPasswords();
  const expected = passMap[user.id] || (user as any).passwordHash;
  if (!expected || password !== expected) {
    return { success: false, message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại!' };
  }

  saveCurrentUser(user);
  return { success: true, user, message: `Chào mừng ${user.name} đã đăng nhập thành công!` };
}

export function registerUser(data: {
  name: string;
  email: string;
  phone: string;
  password?: string;
  dietaryPreferences?: string;
}): { success: boolean; user?: UserAccount; message: string } {
  const users = getStoredUsers();
  const cleanEmail = (data.email || '').trim().toLowerCase();
  const cleanPhone = (data.phone || '').trim().replace(/\s+/g, '');

  if (!data.name || !data.name.trim() || !cleanEmail || !cleanPhone) {
    return { success: false, message: 'Vui lòng điền đầy đủ Họ tên, Email và Số điện thoại!' };
  }

  if (!data.password || data.password.length < 6) {
    return { success: false, message: 'Mật khẩu là bắt buộc và phải có tối thiểu 6 ký tự!' };
  }

  if (users.some(u => (u.email || '').toLowerCase() === cleanEmail)) {
    return { success: false, message: 'Email này đã được đăng ký tài khoản! Vui lòng đăng nhập.' };
  }

  if (users.some(u => (u.phone || '').replace(/\s+/g, '') === cleanPhone)) {
    return { success: false, message: 'Số điện thoại này đã được sử dụng cho tài khoản khác!' };
  }

  const newUser: UserAccount = {
    id: `user-${Date.now()}`,
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    role: 'customer',
    loyaltyPoints: 100, // Điểm thưởng chào mừng thành viên mới
    membershipTier: 'Đồng',
    dietaryPreferences: data.dietaryPreferences || '',
    favoriteDishIds: [],
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  saveStoredUsers(updatedUsers);

  // Save password
  const passMap = getStoredPasswords();
  passMap[newUser.id] = data.password;
  saveStoredPasswords(passMap);

  saveCurrentUser(newUser);
  return {
    success: true,
    user: newUser,
    message: `Đăng ký thành viên thành công! Bạn nhận được 100 điểm thưởng chào mừng.`,
  };
}

export function logoutUser(): void {
  saveCurrentUser(null);
  try {
    localStorage.removeItem('restaurant_auth_jwt_token_v1');
  } catch (e) {
    // ignore
  }
}

export function updateUserProfile(userId: string, updates: Partial<UserAccount>): UserAccount | null {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return null;

  const updatedUser: UserAccount = {
    ...users[index],
    ...updates,
  };

  users[index] = updatedUser;
  saveStoredUsers(users);

  const current = getCurrentUser();
  if (current && current.id === userId) {
    saveCurrentUser(updatedUser);
  }

  return updatedUser;
}

export function changeUserPassword(userId: string, oldPass: string, newPass: string): { success: boolean; message: string } {
  const passMap = getStoredPasswords();
  const currentPass = passMap[userId] || '123456';

  if (oldPass !== currentPass) {
    return { success: false, message: 'Mật khẩu hiện tại không chính xác!' };
  }

  passMap[userId] = newPass;
  saveStoredPasswords(passMap);
  return { success: true, message: 'Đổi mật khẩu tài khoản thành công!' };
}

export function resetUserPassword(email: string, newPass: string): { success: boolean; message: string } {
  const users = getStoredUsers();
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, message: 'Vui lòng cung cấp địa chỉ email hợp lệ!' };
  }
  const user = users.find(u => (u.email || '').toLowerCase() === cleanEmail);

  if (!user) {
    return { success: false, message: 'Không tìm thấy tài khoản với email này!' };
  }

  const passMap = getStoredPasswords();
  passMap[user.id] = newPass;
  saveStoredPasswords(passMap);

  return { success: true, message: 'Mật khẩu mới đã được cập nhật thành công! Bạn có thể đăng nhập ngay.' };
}

export function toggleFavoriteDish(userId: string, dishId: string): UserAccount | null {
  const users = getStoredUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return null;

  const currentFavs = user.favoriteDishIds || [];
  const exists = currentFavs.includes(dishId);
  const newFavs = exists ? currentFavs.filter(id => id !== dishId) : [...currentFavs, dishId];

  return updateUserProfile(userId, { favoriteDishIds: newFavs });
}

export function calculateTierFromPoints(points: number): MembershipTier {
  if (points >= 2500) return 'Kim Cương';
  if (points >= 1000) return 'Vàng';
  if (points >= 400) return 'Bạc';
  return 'Đồng';
}

export function addLoyaltyPoints(userId: string, pointsToAdd: number): UserAccount | null {
  const users = getStoredUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return null;

  const newPoints = Math.max(0, (user.loyaltyPoints || 0) + pointsToAdd);
  const newTier: MembershipTier = calculateTierFromPoints(newPoints);

  return updateUserProfile(userId, {
    loyaltyPoints: newPoints,
    membershipTier: newTier,
  });
}

export function getStoredPointsTransactions(userId?: string): PointsTransaction[] {
  try {
    const data = localStorage.getItem(POINTS_TRANSACTIONS_KEY);
    if (data) {
      const list: PointsTransaction[] = JSON.parse(data);
      if (userId) {
        return list.filter(tx => tx.userId === userId);
      }
      return list;
    }
  } catch (e) {
    console.error('Failed to parse points transactions', e);
  }
  saveStoredPointsTransactions(INITIAL_POINTS_TRANSACTIONS);
  if (userId) {
    return INITIAL_POINTS_TRANSACTIONS.filter(tx => tx.userId === userId);
  }
  return INITIAL_POINTS_TRANSACTIONS;
}

export function saveStoredPointsTransactions(transactions: PointsTransaction[]): void {
  try {
    localStorage.setItem(POINTS_TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save points transactions', e);
  }
}

export function addPointsTransaction(
  tx: Omit<PointsTransaction, 'id' | 'createdAt'>
): PointsTransaction {
  const current = getStoredPointsTransactions();
  const newTx: PointsTransaction = {
    ...tx,
    id: `pt-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newTx, ...current];
  saveStoredPointsTransactions(updated);
  return newTx;
}

export function awardPointsForCompletedReservation(reservation: Reservation): { awarded: boolean; points: number; newTier?: string } {
  if (!reservation.userId || !reservation.pointsEarned || reservation.pointsEarned <= 0) {
    return { awarded: false, points: 0 };
  }

  // Prevent double awarding for the same booking
  const existingLedger = getStoredPointsTransactions(reservation.userId);
  const alreadyAwarded = existingLedger.some(
    tx => tx.type === 'earn' && tx.bookingCode === reservation.bookingCode
  );
  if (alreadyAwarded) {
    return { awarded: false, points: 0 };
  }

  const users = getStoredUsers();
  const user = users.find(u => u.id === reservation.userId);
  if (!user) return { awarded: false, points: 0 };

  const pointsToAdd = reservation.pointsEarned;
  const newPoints = (user.loyaltyPoints || 0) + pointsToAdd;
  const newTier = calculateTierFromPoints(newPoints);

  updateUserProfile(user.id, {
    loyaltyPoints: newPoints,
    membershipTier: newTier,
  });

  addPointsTransaction({
    userId: user.id,
    amount: pointsToAdd,
    type: 'earn',
    description: `Tích lũy hoàn tất dùng bữa #${reservation.bookingCode} (${formatVND(reservation.totalAmount)})`,
    bookingCode: reservation.bookingCode,
    balanceAfter: newPoints,
  });

  return { awarded: true, points: pointsToAdd, newTier };
}

export function refundPointsForCancelledReservation(reservation: Reservation): { refunded: boolean; points: number } {
  if (!reservation.userId || !reservation.pointsRedeemed || reservation.pointsRedeemed <= 0) {
    return { refunded: false, points: 0 };
  }

  // Prevent double refund
  const existingLedger = getStoredPointsTransactions(reservation.userId);
  const alreadyRefunded = existingLedger.some(
    tx => tx.type === 'refund' && tx.bookingCode === reservation.bookingCode
  );
  if (alreadyRefunded) {
    return { refunded: false, points: 0 };
  }

  const users = getStoredUsers();
  const user = users.find(u => u.id === reservation.userId);
  if (!user) return { refunded: false, points: 0 };

  const pointsToRefund = reservation.pointsRedeemed;
  const newPoints = (user.loyaltyPoints || 0) + pointsToRefund;
  const newTier = calculateTierFromPoints(newPoints);

  updateUserProfile(user.id, {
    loyaltyPoints: newPoints,
    membershipTier: newTier,
  });

  addPointsTransaction({
    userId: user.id,
    amount: pointsToRefund,
    type: 'refund',
    description: `Hoàn ${pointsToRefund} điểm từ đơn hủy #${reservation.bookingCode}`,
    bookingCode: reservation.bookingCode,
    balanceAfter: newPoints,
  });

  return { refunded: true, points: pointsToRefund };
}

export function getStoredReservations(): Reservation[] {
  try {
    const data = localStorage.getItem(RESERVATIONS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse reservations from storage', e);
  }
  return INITIAL_RESERVATIONS;
}

export function saveStoredReservations(reservations: Reservation[]): void {
  try {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
  } catch (e) {
    console.error('Failed to save reservations to storage', e);
  }
}

export function getStoredTables(): RestaurantTable[] {
  try {
    const data = localStorage.getItem(TABLES_KEY);
    if (data) {
      const parsed: RestaurantTable[] = JSON.parse(data);
      // If previously stored fewer tables (e.g. 15), merge with new expanded tables
      if (parsed.length < INITIAL_TABLES.length) {
        const existingMap = new Map(parsed.map(t => [t.id, t]));
        const merged = INITIAL_TABLES.map(t => existingMap.get(t.id) || t);
        saveStoredTables(merged);
        return merged;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse tables from storage', e);
  }
  return INITIAL_TABLES;
}

export function saveStoredTables(tables: RestaurantTable[]): void {
  try {
    localStorage.setItem(TABLES_KEY, JSON.stringify(tables));
  } catch (e) {
    console.error('Failed to save tables to storage', e);
  }
}

export function getStoredEmailLogs(): SentEmailLog[] {
  try {
    const data = localStorage.getItem(EMAIL_LOGS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse email logs from storage', e);
  }
  return INITIAL_EMAIL_LOGS;
}

export function saveStoredEmailLogs(logs: SentEmailLog[]): void {
  try {
    localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save email logs to storage', e);
  }
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function generateBookingEmailHtml(reservation: Reservation): string {
  const dishesHtml = reservation.selectedDishes && reservation.selectedDishes.length > 0
    ? reservation.selectedDishes.map(item => `
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0; color: #1c1917; font-weight: 500;">
          ${item.dish.name}
          ${item.specialNotes ? `<br><small style="color: #78716c; font-style: italic;">Ghi chú: ${item.specialNotes}</small>` : ''}
        </td>
        <td style="padding: 10px 0; text-align: center; color: #57534e;">x${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right; color: #1c1917; font-weight: 600;">${formatVND(item.dish.price * item.quantity)}</td>
      </tr>
    `).join('')
    : '<tr><td colspan="3" style="padding: 12px 0; color: #78716c; text-align: center;">Khách hàng sẽ chọn món trực tiếp tại nhà hàng.</td></tr>';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Xác Nhận Đặt Bàn - Le Gourmet Bistro</title>
</head>
<body style="margin:0; padding:0; background-color: #fafaf9; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #292524;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e7e5e4;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #1c1917 0%, #292524 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
        <div style="font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: #e2a03f; font-weight: 700; margin-bottom: 6px;">LE GOURMET BISTRO</div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">${reservation.status === 'confirmed' ? 'Xác Nhận Đặt Bàn Thành Công' : 'Tiếp Nhận Yêu Cầu Đặt Bàn'}</h1>
        <p style="margin: 8px 0 0; color: #a8a29e; font-size: 14px;">Mã đặt chỗ: <strong style="color: #f59e0b; font-size: 16px; letter-spacing: 1px;">#${reservation.bookingCode}</strong></p>
      </td>
    </tr>

    <!-- Greeting -->
    <tr>
      <td style="padding: 24px 24px 12px;">
        <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #44403c;">
          Kính gửi <strong>${reservation.customerName}</strong>,
        </p>
        <p style="margin: 10px 0 0; font-size: 14px; line-height: 1.6; color: #57534e;">
          Cảm ơn quý khách đã tin tưởng và lựa chọn Le Gourmet Bistro. ${reservation.status === 'confirmed' ? 'Yêu cầu đặt bàn của quý khách đã được hệ thống ghi nhận và xác nhận thành công với các thông tin chi tiết dưới đây:' : 'Yêu cầu đặt chỗ của quý khách đã được tiếp nhận thành công vào hệ thống và đang chờ nhà hàng xếp bàn. Thông tin chi tiết lịch hẹn như sau:'}
        </p>
      </td>
    </tr>

    <!-- Booking Details Card -->
    <tr>
      <td style="padding: 12px 24px;">
        <table width="100%" style="background-color: #f5f5f4; border-radius: 8px; padding: 16px; border: 1px solid #e7e5e4;">
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #78716c; width: 40%;">Thời gian đến:</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #0c0a09;">
              ${reservation.arrivalTime} ngày ${new Date(reservation.bookingDate).toLocaleDateString('vi-VN')}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #78716c;">Số lượng khách:</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #1c1917;">${reservation.guestCount} Người</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #78716c;">Vị trí bàn:</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #d97706;">${reservation.tableName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #78716c;">Số điện thoại:</td>
            <td style="padding: 6px 0; font-size: 14px; color: #1c1917;">${reservation.customerPhone}</td>
          </tr>
          ${reservation.occasion ? `
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #78716c;">Dịp đặc biệt:</td>
            <td style="padding: 6px 0; font-size: 14px; color: #1c1917;">${reservation.occasion}</td>
          </tr>` : ''}
          ${reservation.specialRequests ? `
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #78716c;">Yêu cầu riêng:</td>
            <td style="padding: 6px 0; font-size: 14px; color: #1c1917; font-style: italic;">${reservation.specialRequests}</td>
          </tr>` : ''}
        </table>
      </td>
    </tr>

    <!-- Pre-ordered Dishes -->
    <tr>
      <td style="padding: 12px 24px;">
        <h3 style="margin: 0 0 12px; font-size: 15px; font-weight: 700; color: #1c1917; text-transform: uppercase; letter-spacing: 0.5px;">
          📋 Danh Sách Món Ăn Đặt Trước
        </h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #e7e5e4; color: #78716c; font-size: 12px; text-transform: uppercase;">
              <th style="padding: 8px 0; text-align: left;">Món ăn</th>
              <th style="padding: 8px 0; text-align: center; width: 60px;">SL</th>
              <th style="padding: 8px 0; text-align: right; width: 120px;">Tạm tính</th>
            </tr>
          </thead>
          <tbody>
            ${dishesHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 14px 0 6px; text-align: right; color: #78716c; font-size: 13px;">Tổng tiền món:</td>
              <td style="padding: 14px 0 6px; text-align: right; font-weight: 700; color: #1c1917; font-size: 15px;">${formatVND(reservation.preOrderTotal)}</td>
            </tr>
            ${reservation.depositAmount > 0 ? `
            <tr>
              <td colspan="2" style="padding: 4px 0 6px; text-align: right; color: #059669; font-size: 13px;">Đã đặt cọc giữ chỗ:</td>
              <td style="padding: 4px 0 6px; text-align: right; font-weight: 600; color: #059669; font-size: 14px;">- ${formatVND(reservation.depositAmount)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 4px 0 10px; text-align: right; color: #78716c; font-size: 13px;">Dự kiến thanh toán còn lại:</td>
              <td style="padding: 4px 0 10px; text-align: right; font-weight: 700; color: #b45309; font-size: 15px;">${formatVND(Math.max(0, reservation.preOrderTotal - reservation.depositAmount))}</td>
            </tr>` : ''}
          </tfoot>
        </table>
      </td>
    </tr>

    <!-- Restaurant Location & Note -->
    <tr>
      <td style="padding: 16px 24px; background-color: #fffbeb; border-top: 1px dashed #fde68a; border-bottom: 1px dashed #fde68a;">
        <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
          📍 <strong>Địa chỉ nhà hàng:</strong> 128 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh<br>
          📞 <strong>Hotline hỗ trợ 24/7:</strong> 0903.888.999 / 028.3822.8888<br>
          ⏰ <em>Lưu ý: Bàn của quý khách sẽ được giữ trong vòng 20 phút kể từ giờ hẹn. Vui lòng liên hệ hotline nếu quý khách đến trễ.</em>
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 24px; text-align: center; color: #a8a29e; font-size: 12px; background-color: #fafaf9;">
        <p style="margin: 0 0 6px;">Email này được gửi tự động từ hệ thống đặt bàn Le Gourmet Bistro.</p>
        <p style="margin: 0;">© 2026 Le Gourmet Bistro. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function downloadIcsCalendar(reservation: Reservation): void {
  // Format date-time for ICS
  const dateParts = reservation.bookingDate.split('-');
  const timeParts = reservation.arrivalTime.split(':');
  
  if (dateParts.length < 3 || timeParts.length < 2) return;
  
  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];
  const hour = timeParts[0].padStart(2, '0');
  const minute = timeParts[1].padStart(2, '0');

  // End time: + 2 hours
  const startIso = `${year}${month}${day}T${hour}${minute}00`;
  const endHour = String(Math.min(23, parseInt(hour, 10) + 2)).padStart(2, '0');
  const endIso = `${year}${month}${day}T${endHour}${minute}00`;

  const dishesSummary = reservation.selectedDishes.map(d => `${d.dish.name} (x${d.quantity})`).join(', ');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Le Gourmet Bistro//Booking Reservation//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:booking-${reservation.bookingCode}-${Date.now()}@legourmetbistro.vn`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:Bữa Tối Tại Le Gourmet Bistro - Mã #${reservation.bookingCode}`,
    `DESCRIPTION:Đặt bàn cho ${reservation.guestCount} khách tại ${reservation.tableName}.\\nMón đã chọn: ${dishesSummary || 'Chọn tại bàn'}.\\nHotline: 0903.888.999`,
    'LOCATION:128 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `DatBan-${reservation.bookingCode}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function addNewReservation(
  newReservationData: Omit<Reservation, 'id' | 'bookingCode' | 'createdAt' | 'emailConfirmationSent' | 'emailSentAt' | 'status'>
): { reservation: Reservation; emailLog: SentEmailLog } {
  const currentReservations = getStoredReservations();
  const currentTables = getStoredTables();
  const currentEmailLogs = getStoredEmailLogs();

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const bookingCode = `BK-${randomDigits}`;
  const now = new Date().toISOString();

  const newReservation: Reservation = {
    ...newReservationData,
    id: `res-${Date.now()}`,
    bookingCode,
    status: (newReservationData as any).status || (newReservationData.depositAmount && newReservationData.depositAmount > 0 ? 'confirmed' : 'pending'),
    createdAt: now,
    emailConfirmationSent: true,
    emailSentAt: now,
  };

  // If reservation has userId or matches a registered user email, calculate loyalty points
  const users = getStoredUsers();
  let matchedUser = newReservation.userId ? users.find(u => u.id === newReservation.userId) : null;
  if (!matchedUser && newReservation.customerEmail) {
    const targetEmail = (newReservation.customerEmail || '').trim().toLowerCase();
    matchedUser = users.find(u => (u.email || '').toLowerCase() === targetEmail) || null;
  }

  if (matchedUser) {
    newReservation.userId = matchedUser.id;
    // Điểm thưởng DỰ KIẾN nhận được sau khi dùng bữa xong (1 điểm / 10.000đ)
    const points = Math.max(0, Math.floor(newReservation.totalAmount / 10000));
    newReservation.pointsEarned = points;

    // Nếu khách dùng điểm giảm giá: trừ điểm ngay tại thời điểm đặt bàn và ghi sổ cái
    if (newReservation.pointsRedeemed && newReservation.pointsRedeemed > 0) {
      const actualRedeemed = Math.min(newReservation.pointsRedeemed, matchedUser.loyaltyPoints || 0);
      newReservation.pointsRedeemed = actualRedeemed;
      const newPoints = Math.max(0, (matchedUser.loyaltyPoints || 0) - actualRedeemed);
      const newTier = calculateTierFromPoints(newPoints);
      updateUserProfile(matchedUser.id, {
        loyaltyPoints: newPoints,
        membershipTier: newTier,
      });
      addPointsTransaction({
        userId: matchedUser.id,
        amount: -actualRedeemed,
        type: 'redeem',
        description: `Tiêu ${actualRedeemed} điểm giảm ${formatVND(newReservation.pointsDiscount || actualRedeemed * 100)} đơn #${newReservation.bookingCode}`,
        bookingCode: newReservation.bookingCode,
        balanceAfter: newPoints,
      });
    }
  }

  // Update table status to reserved or occupied if date is today
  const isToday = newReservation.bookingDate === new Date().toISOString().split('T')[0];
  const targetTableIds = new Set(
    newReservation.tableIds && newReservation.tableIds.length > 0
      ? newReservation.tableIds
      : [newReservation.tableId]
  );

  const updatedTables = currentTables.map(table => {
    if (targetTableIds.has(table.id)) {
      return {
        ...table,
        status: isToday ? ('reserved' as const) : table.status,
        currentReservationId: newReservation.bookingCode,
        mergedWithTableIds: Array.from(targetTableIds).filter(id => id !== table.id),
      };
    }
    return table;
  });


  // Create Email Log
  const emailHtml = generateBookingEmailHtml(newReservation);
  const emailLog: SentEmailLog = {
    id: `em-${Date.now()}`,
    toEmail: newReservation.customerEmail,
    toName: newReservation.customerName,
    subject: newReservation.status === 'confirmed'
      ? `✨ Xác nhận đặt bàn thành công #${bookingCode} - Nhà Hàng Le Gourmet Bistro`
      : `⏳ Tiếp nhận yêu cầu đặt bàn #${bookingCode} (Đang chờ xác nhận) - Nhà Hàng Le Gourmet Bistro`,
    sentAt: now,
    bookingCode,
    reservationId: newReservation.id,
    type: 'booking_confirmation',
    htmlContent: emailHtml,
  };

  const updatedReservations = [newReservation, ...currentReservations];
  const updatedEmailLogs = [emailLog, ...currentEmailLogs];

  saveStoredReservations(updatedReservations);
  saveStoredTables(updatedTables);
  saveStoredEmailLogs(updatedEmailLogs);

  // Automatically deduct inventory stock based on Recipe BOM
  if (newReservation.selectedDishes && newReservation.selectedDishes.length > 0) {
    deductInventoryForDishes(newReservation.selectedDishes, newReservation.bookingCode);
  }

  return { reservation: newReservation, emailLog };

}

export function updateReservationStatus(reservationId: string, newStatus: ReservationStatus): { updated: Reservation | null; emailLog?: SentEmailLog } {
  const currentReservations = getStoredReservations();
  const currentTables = getStoredTables();
  const currentEmailLogs = getStoredEmailLogs();

  const targetIndex = currentReservations.findIndex(res => res.id === reservationId);
  if (targetIndex === -1) {
    return { updated: null };
  }

  const targetReservation: Reservation = {
    ...currentReservations[targetIndex],
    status: newStatus,
  };

  const updatedReservations = [...currentReservations];
  updatedReservations[targetIndex] = targetReservation;

  // Update table state
  const targetTableIds = new Set(
    targetReservation.tableIds && targetReservation.tableIds.length > 0
      ? targetReservation.tableIds
      : [targetReservation.tableId]
  );

  const updatedTables = currentTables.map(tbl => {
    if (targetTableIds.has(tbl.id)) {
      if (newStatus === 'seated') return { ...tbl, status: 'occupied' as const };
      if (newStatus === 'completed') return { ...tbl, status: 'cleaning' as const, mergedWithTableIds: undefined };
      if (newStatus === 'cancelled') return { ...tbl, status: 'available' as const, currentReservationId: undefined, mergedWithTableIds: undefined };
      if (newStatus === 'confirmed') return { ...tbl, status: 'reserved' as const };
    }
    return tbl;
  });


  let statusEmailLog: SentEmailLog | undefined;

  // Send status update notification email if cancelled or seated
  if (newStatus === 'cancelled') {
    const cancelHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Thông Báo Hủy Đặt Bàn #${targetReservation.bookingCode}</h2>
        <p>Kính gửi quý khách ${targetReservation.customerName},</p>
        <p>Đơn đặt bàn mã <strong>#${targetReservation.bookingCode}</strong> vào ngày ${targetReservation.bookingDate} lúc ${targetReservation.arrivalTime} đã được hủy theo yêu cầu.</p>
        <p>Nếu quý khách có nhu cầu đặt lại bàn, vui lòng liên hệ hotline 0903.888.999.</p>
      </div>
    `;
    statusEmailLog = {
      id: `em-${Date.now()}`,
      toEmail: targetReservation.customerEmail,
      toName: targetReservation.customerName,
      subject: `[Thông báo] Đã hủy đặt bàn #${targetReservation.bookingCode} - Le Gourmet Bistro`,
      sentAt: new Date().toISOString(),
      bookingCode: targetReservation.bookingCode,
      reservationId: targetReservation.id,
      type: 'status_update',
      htmlContent: cancelHtml,
    };
    saveStoredEmailLogs([statusEmailLog, ...currentEmailLogs]);
  }

  saveStoredReservations(updatedReservations);
  saveStoredTables(updatedTables);

  // Automatically ensure kitchen ticket is active for KDS when guest is seated
  if (newStatus === 'seated') {
    ensureKitchenTicketForCheckIn(targetReservation);
  }

  // Tự động cộng điểm vào ví khi hoàn tất (Mục 4) hoặc hoàn điểm khi hủy đơn
  if (newStatus === 'completed') {
    awardPointsForCompletedReservation(targetReservation);
  } else if (newStatus === 'cancelled') {
    refundPointsForCancelledReservation(targetReservation);
  }

  return { updated: targetReservation, emailLog: statusEmailLog };
}

export function cancelStoredReservation(
  idOrCode: string,
  reason: string = 'Khách hàng tự hủy trực tuyến',
  notes?: string
): { success: boolean; reservation?: Reservation; message: string; refundInfo?: any } {
  const currentReservations = getStoredReservations();
  const currentTables = getStoredTables();
  const currentEmailLogs = getStoredEmailLogs();

  const targetIndex = currentReservations.findIndex(
    r => r.id === idOrCode || r.bookingCode === idOrCode
  );

  if (targetIndex === -1) {
    return { success: false, message: `Không tìm thấy đơn đặt bàn #${idOrCode}` };
  }

  const res = currentReservations[targetIndex];
  if (res.status === 'cancelled') {
    return { success: false, message: 'Đơn đặt bàn này đã được hủy trước đó.', reservation: res };
  }
  if (res.status === 'seated' || res.status === 'completed') {
    return { success: false, message: `Đơn đang ở trạng thái "${res.status}", không thể tự hủy.` };
  }

  const cancelledReservation: Reservation = {
    ...res,
    status: 'cancelled',
    cancellationReason: reason,
    cancellationNotes: notes,
    cancelledAt: new Date().toISOString(),
  };

  const updatedReservations = [...currentReservations];
  updatedReservations[targetIndex] = cancelledReservation;

  const targetTableIds = new Set(
    res.tableIds && res.tableIds.length > 0 ? res.tableIds : [res.tableId]
  );

  const updatedTables = currentTables.map(tbl => {
    if (targetTableIds.has(tbl.id)) {
      return { ...tbl, status: 'available' as const, currentReservationId: undefined, mergedWithTableIds: undefined };
    }
    return tbl;
  });

  const depositAmount = res.depositAmount || 0;
  const cancelHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1c1917; background-color: #fafaf9; border-radius: 12px; border: 1px solid #e7e5e4;">
      <h2 style="color: #b91c1c; font-size: 18px;">Thông Báo Xác Nhận Hủy Đặt Bàn #${res.bookingCode}</h2>
      <p>Kính gửi quý khách <strong>${res.customerName}</strong>,</p>
      <p>Đơn đặt bàn của quý khách đã được hủy thành công theo yêu cầu.</p>
      <p>Lý do: ${reason} ${notes ? `(${notes})` : ''}</p>
      ${depositAmount > 0 ? `<p style="color: #065f46;">Khoản cọc <strong>${depositAmount.toLocaleString('vi-VN')} đ</strong> sẽ được hoàn trả theo chính sách 100%.</p>` : ''}
    </div>
  `;

  const cancelEmailLog: SentEmailLog = {
    id: `em-cancel-${Date.now()}`,
    toEmail: res.customerEmail,
    toName: res.customerName,
    subject: `[Thông báo] Đã hủy đặt bàn #${res.bookingCode} - Le Gourmet Bistro`,
    sentAt: new Date().toISOString(),
    bookingCode: res.bookingCode,
    reservationId: res.id,
    type: 'status_update',
    htmlContent: cancelHtml,
  };

  saveStoredReservations(updatedReservations);
  saveStoredTables(updatedTables);
  saveStoredEmailLogs([cancelEmailLog, ...currentEmailLogs]);

  // Hoàn lại điểm thưởng đã tiêu (nếu có) vào ví khách hàng (Mục 1 & 4)
  refundPointsForCancelledReservation(cancelledReservation);

  return {
    success: true,
    reservation: cancelledReservation,
    message: `Đã hủy thành công đơn đặt bàn #${res.bookingCode}`,
    refundInfo: depositAmount > 0 ? { refundEligible: true, depositAmount } : null,
  };
}


export function deleteEmailLog(logId: string): SentEmailLog[] {
  const logs = getStoredEmailLogs();
  const updatedLogs = logs.filter(l => l.id !== logId);
  saveStoredEmailLogs(updatedLogs);
  return updatedLogs;
}

export function clearAllEmailLogs(): SentEmailLog[] {
  saveStoredEmailLogs([]);
  return [];
}

// ==========================================
// MENU ITEMS STORAGE & MANAGEMENT
// ==========================================
export function getStoredMenuItems(): MenuItem[] {
  try {
    const data = localStorage.getItem(MENU_ITEMS_KEY);
    if (data) {
      const parsed: MenuItem[] = JSON.parse(data);
      if (parsed && parsed.length > 0) {
        // If MENU_ITEMS has new items not yet in storage, merge them
        const existingIds = new Set(parsed.map(i => i.id));
        const missingItems = MENU_ITEMS.filter(item => !existingIds.has(item.id)).map(item => ({
          ...item,
          isAvailable: item.isAvailable ?? true
        }));
        if (missingItems.length > 0) {
          const merged = [...parsed, ...missingItems];
          saveStoredMenuItems(merged);
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse menu items from storage', e);
  }
  const defaultItems = MENU_ITEMS.map(item => ({ ...item, isAvailable: item.isAvailable ?? true }));
  saveStoredMenuItems(defaultItems);
  return defaultItems;
}


export function saveStoredMenuItems(items: MenuItem[]): void {
  try {
    localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save menu items to storage', e);
  }
}

export function toggleMenuItemStock(dishId: string): MenuItem[] {
  const items = getStoredMenuItems();
  const updated = items.map(item => {
    if (item.id === dishId) {
      return { ...item, isAvailable: item.isAvailable === false ? true : false };
    }
    return item;
  });
  saveStoredMenuItems(updated);
  return updated;
}

export function updateMenuItem(dishId: string, updates: Partial<MenuItem>): MenuItem[] {
  const items = getStoredMenuItems();
  const updated = items.map(item => (item.id === dishId ? { ...item, ...updates } : item));
  saveStoredMenuItems(updated);
  return updated;
}

export function addMenuItem(newItem: MenuItem): MenuItem[] {
  const items = getStoredMenuItems();
  const updated = [newItem, ...items];
  saveStoredMenuItems(updated);
  return updated;
}

// ==========================================
// TABLE SERVICE / ADD DISHES AT TABLE / CHECKOUT
// ==========================================
export function addDishesToReservation(
  reservationId: string, 
  dishesToAdd: { dish: MenuItem; quantity: number; specialNotes?: string }[]
): { updatedReservation: Reservation | null; updatedTables: RestaurantTable[] } {
  const currentReservations = getStoredReservations();
  const currentTables = getStoredTables();

  const targetIndex = currentReservations.findIndex(r => r.id === reservationId);
  if (targetIndex === -1) {
    return { updatedReservation: null, updatedTables: currentTables };
  }

  const reservation = currentReservations[targetIndex];
  const existingDishes = [...(reservation.selectedDishes || [])];

  dishesToAdd.forEach(addition => {
    const existingIndex = existingDishes.findIndex(d => d.dish.id === addition.dish.id);
    if (existingIndex >= 0) {
      existingDishes[existingIndex] = {
        ...existingDishes[existingIndex],
        quantity: existingDishes[existingIndex].quantity + addition.quantity,
        specialNotes: addition.specialNotes || existingDishes[existingIndex].specialNotes,
      };
    } else {
      existingDishes.push(addition);
    }
  });

  const newPreOrderTotal = existingDishes.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const discount = reservation.discountAmount || 0;
  const newTotal = Math.max(0, newPreOrderTotal - discount);

  const updatedReservation: Reservation = {
    ...reservation,
    selectedDishes: existingDishes,
    preOrderTotal: newPreOrderTotal,
    totalAmount: newTotal,
  };

  const updatedReservations = [...currentReservations];
  updatedReservations[targetIndex] = updatedReservation;
  saveStoredReservations(updatedReservations);

  // Sync new ordered dishes to Kitchen Display System (KDS)
  syncDishesToKitchenTicket(updatedReservation, dishesToAdd);

  // Automatically deduct inventory stock based on Recipe BOM
  deductInventoryForDishes(dishesToAdd, updatedReservation.bookingCode, 'Gọi thêm món tại bàn');

  return { updatedReservation, updatedTables: currentTables };

}

export function checkoutAndSettleReservation(
  reservationId: string,
  paymentDetails: {
    paymentMethod: 'cash' | 'vietqr' | 'pos_card';
    paidAmount: number;
    staffName?: string;
    notes?: string;
  }
): { updatedReservation: Reservation | null; updatedTables: RestaurantTable[] } {
  const currentReservations = getStoredReservations();
  const currentTables = getStoredTables();

  const targetIndex = currentReservations.findIndex(r => r.id === reservationId);
  if (targetIndex === -1) {
    return { updatedReservation: null, updatedTables: currentTables };
  }

  const reservation = currentReservations[targetIndex];
  const updatedReservation: Reservation = {
    ...reservation,
    status: 'completed',
  };

  const updatedReservations = [...currentReservations];
  updatedReservations[targetIndex] = updatedReservation;
  saveStoredReservations(updatedReservations);

  // Table becomes 'cleaning'
  const targetTableIds = new Set(
    reservation.tableIds && reservation.tableIds.length > 0
      ? reservation.tableIds
      : [reservation.tableId]
  );

  const updatedTables = currentTables.map(t => {
    if (targetTableIds.has(t.id)) {
      return { ...t, status: 'cleaning' as const, mergedWithTableIds: undefined };
    }
    return t;
  });
  saveStoredTables(updatedTables);


  // Tự động tích lũy điểm thưởng và ghi sổ cái khi thu ngân hoàn tất thanh toán (Mục 4)
  awardPointsForCompletedReservation(updatedReservation);

  return { updatedReservation, updatedTables };
}

// ==========================================
// STAFF MANAGEMENT FUNCTIONS
// ==========================================
export function createStaffAccount(data: {
  name: string;
  email: string;
  phone: string;
  role: 'staff' | 'admin';
  position: string;
  shift: string;
  password?: string;
}): { success: boolean; staff?: UserAccount; message: string } {
  const users = getStoredUsers();
  const cleanEmail = (data.email || '').trim().toLowerCase();
  const cleanPhone = (data.phone || '').trim().replace(/\s+/g, '');

  if (users.some(u => (u.email || '').toLowerCase() === cleanEmail)) {
    return { success: false, message: 'Email này đã tồn tại trong hệ thống!' };
  }

  if (users.some(u => (u.phone || '').replace(/\s+/g, '') === cleanPhone)) {
    return { success: false, message: 'Số điện thoại này đã được sử dụng!' };
  }

  const newStaff: UserAccount = {
    id: `staff-${Date.now()}`,
    name: data.name.trim(),
    email: cleanEmail,
    phone: data.phone.trim(),
    role: data.role,
    position: data.position.trim(),
    shift: data.shift.trim(),
    status: 'active',
    loyaltyPoints: 500,
    membershipTier: 'Bạc',
    favoriteDishIds: [],
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newStaff];
  saveStoredUsers(updatedUsers);

  const passMap = getStoredPasswords();
  passMap[newStaff.id] = data.password || '123456';
  saveStoredPasswords(passMap);

  return { success: true, staff: newStaff, message: `Tạo tài khoản nhân viên ${newStaff.name} thành công!` };
}

export function updateStaffStatus(staffId: string, status: 'active' | 'inactive'): UserAccount[] {
  return updateUserStatus(staffId, status);
}

export function updateUserStatus(userId: string, status: 'active' | 'inactive'): UserAccount[] {
  const users = getStoredUsers();
  const updated = users.map(u => (u.id === userId ? { ...u, status } : u));
  saveStoredUsers(updated);

  const current = getCurrentUser();
  if (current && current.id === userId) {
    saveCurrentUser({ ...current, status });
  }

  return updated;
}

export function adminCreateAccount(data: {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  position?: string;
  shift?: string;
  membershipTier?: MembershipTier;
  loyaltyPoints?: number;
  dietaryPreferences?: string;
  password?: string;
  avatar?: string;
}): { success: boolean; user?: UserAccount; message: string } {
  const users = getStoredUsers();
  const cleanEmail = (data.email || '').trim().toLowerCase();
  const cleanPhone = (data.phone || '').trim().replace(/\s+/g, '');

  if (users.some(u => (u.email || '').toLowerCase() === cleanEmail)) {
    return { success: false, message: 'Email này đã tồn tại trong hệ thống!' };
  }

  if (users.some(u => (u.phone || '').replace(/\s+/g, '') === cleanPhone)) {
    return { success: false, message: 'Số điện thoại này đã được sử dụng!' };
  }

  const defaultAvatar = data.role === 'admin'
    ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'
    : data.role === 'staff'
    ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

  const newUser: UserAccount = {
    id: `${data.role}-${Date.now()}`,
    name: data.name.trim(),
    email: cleanEmail,
    phone: data.phone.trim(),
    role: data.role,
    position: data.position?.trim() || (data.role === 'admin' ? 'Quản Trị Viên' : data.role === 'staff' ? 'Nhân Viên Phục Vụ' : 'Khách Hàng'),
    shift: data.shift?.trim() || (data.role === 'staff' ? 'Ca Chiều - Tối (15:00 - 23:00)' : 'Toàn thời gian (Full-time)'),
    status: 'active',
    loyaltyPoints: data.loyaltyPoints !== undefined ? data.loyaltyPoints : (data.role === 'customer' ? 100 : 500),
    membershipTier: data.membershipTier || (data.role === 'admin' ? 'Kim Cương' : 'Bạc'),
    dietaryPreferences: data.dietaryPreferences || '',
    avatar: data.avatar || defaultAvatar,
    favoriteDishIds: [],
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [newUser, ...users];
  saveStoredUsers(updatedUsers);

  const passMap = getStoredPasswords();
  passMap[newUser.id] = data.password || '123456';
  saveStoredPasswords(passMap);

  return { 
    success: true, 
    user: newUser, 
    message: `Tạo tài khoản ${data.role === 'admin' ? 'Quản trị viên' : data.role === 'staff' ? 'Nhân viên' : 'Khách hàng'} "${newUser.name}" thành công!` 
  };
}

export function adminUpdateUser(userId: string, updates: Partial<UserAccount>): { success: boolean; user?: UserAccount; message: string } {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) {
    return { success: false, message: 'Không tìm thấy tài khoản cần chỉnh sửa!' };
  }

  // Check email uniqueness if email updated
  if (updates.email) {
    const cleanEmail = updates.email.trim().toLowerCase();
    const emailConflict = users.find(u => u.id !== userId && (u.email || '').toLowerCase() === cleanEmail);
    if (emailConflict) {
      return { success: false, message: 'Email này đang thuộc về một tài khoản khác!' };
    }
    updates.email = cleanEmail;
  }

  // Check phone uniqueness if phone updated
  if (updates.phone) {
    const cleanPhone = updates.phone.trim().replace(/\s+/g, '');
    const phoneConflict = users.find(u => u.id !== userId && (u.phone || '').replace(/\s+/g, '') === cleanPhone);
    if (phoneConflict) {
      return { success: false, message: 'Số điện thoại này đang thuộc về một tài khoản khác!' };
    }
    updates.phone = cleanPhone;
  }

  const updatedUser: UserAccount = {
    ...users[index],
    ...updates,
  };

  users[index] = updatedUser;
  saveStoredUsers(users);

  const current = getCurrentUser();
  if (current && current.id === userId) {
    saveCurrentUser(updatedUser);
  }

  return { success: true, user: updatedUser, message: `Cập nhật thông tin tài khoản "${updatedUser.name}" thành công!` };
}

export function adminResetUserPassword(userId: string, newPass: string): { success: boolean; message: string } {
  const users = getStoredUsers();
  const user = users.find(u => u.id === userId);
  if (!user) {
    return { success: false, message: 'Không tìm thấy tài khoản!' };
  }

  const passMap = getStoredPasswords();
  passMap[userId] = newPass.trim() || '123456';
  saveStoredPasswords(passMap);

  return { success: true, message: `Đã cấp mật khẩu mới thành công cho tài khoản "${user.name}"!` };
}

export function deleteUserAccount(userId: string): { success: boolean; message: string } {
  const current = getCurrentUser();
  if (current && current.id === userId) {
    return { success: false, message: 'Không thể xóa tài khoản Quản trị viên bạn đang dùng để đăng nhập!' };
  }

  const users = getStoredUsers();
  const target = users.find(u => u.id === userId);
  if (!target) {
    return { success: false, message: 'Tài khoản không tồn tại!' };
  }

  const updatedUsers = users.filter(u => u.id !== userId);
  saveStoredUsers(updatedUsers);

  // Clean password
  const passMap = getStoredPasswords();
  delete passMap[userId];
  saveStoredPasswords(passMap);

  return { success: true, message: `Đã xóa tài khoản "${target.name}" khỏi hệ thống thành công.` };
}

export function adjustUserLoyaltyPoints(userId: string, deltaPoints: number, reason?: string): { success: boolean; user?: UserAccount; message: string } {
  const users = getStoredUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return { success: false, message: 'Không tìm thấy người dùng!' };

  const currentPoints = user.loyaltyPoints || 0;
  const newPoints = Math.max(0, currentPoints + deltaPoints);

  let newTier: MembershipTier = user.membershipTier;
  if (newPoints >= 1500) {
    newTier = 'Kim Cương';
  } else if (newPoints >= 400) {
    newTier = 'Vàng';
  } else {
    newTier = 'Bạc';
  }

  const updated = updateUserProfile(userId, {
    loyaltyPoints: newPoints,
    membershipTier: newTier,
  });

  const sign = deltaPoints >= 0 ? `+${deltaPoints}` : `${deltaPoints}`;
  return {
    success: true,
    user: updated || undefined,
    message: `Đã điều chỉnh ${sign} điểm cho ${user.name} (${reason || 'Thao tác Admin'}). Tổng điểm hiện tại: ${newPoints}đ (Hạng ${newTier}).`
  };
}

// ==========================================
// KITCHEN DISPLAY SYSTEM (KDS) LOGIC
// ==========================================

export function mapCategoryToKitchenStation(category: DishCategory): KitchenStation {
  switch (category) {
    case 'appetizer':
      return 'cold_kitchen';
    case 'seafood':
    case 'main':
      return 'hot_kitchen';
    case 'dessert':
      return 'pastry';
    case 'beverage':
      return 'bar';
    default:
      return 'hot_kitchen';
  }
}

/**
 * Audio Chime Synthesizer using Web Audio API
 * Plays gentle restaurant chime tones (Bếp ra món / Đơn hàng mới)
 */
export function playKitchenChime(type: 'order_arrival' | 'ready' | 'urgent' = 'ready'): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'ready') {
      // 2-tone pleasant dinner bell (E5 -> B5)
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(987.77, now + 0.15); // B5
      gain2.gain.setValueAtTime(0.35, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.8);
    } else if (type === 'order_arrival') {
      // Rising 3-note order chime (C5 -> E5 -> G5)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const start = ctx.currentTime + idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.4);
      });
    } else if (type === 'urgent') {
      // Double urgent tap
      const now = ctx.currentTime;
      [0, 0.2].forEach(delay => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now + delay);
        gain.gain.setValueAtTime(0.15, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.15);
      });
    }
  } catch (err) {
    // Graceful fallback if Web Audio is blocked by browser policy
  }
}

/**
 * Builds realistic initial kitchen tickets from existing reservations
 */
function generateInitialKitchenTickets(): KitchenTicket[] {
  const reservations = getStoredReservations();
  const seatedOrConfirmed = reservations.filter(r => 
    (r.status === 'seated' || r.status === 'confirmed') && 
    r.selectedDishes && 
    r.selectedDishes.length > 0
  );

  const initialTickets: KitchenTicket[] = [];

  seatedOrConfirmed.forEach((res, index) => {
    // Generate different elapsed times: 4 mins ago, 12 mins ago, 24 mins ago
    const minutesAgo = index === 0 ? 8 : index === 1 ? 16 : 24;
    const createdAt = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

    const items: KitchenTicketItem[] = res.selectedDishes.map((item, itemIdx) => {
      let status: KitchenItemStatus = 'cooking';
      if (index === 0 && itemIdx === 0) status = 'ready'; // Ready to be served!
      else if (index === 0 && itemIdx > 0) status = 'cooking';
      else if (index === 1 && itemIdx === 0) status = 'cooking';
      else if (index === 1) status = 'pending';
      else status = 'cooking';

      return {
        id: `kitem-${res.id}-${itemIdx}-${item.dish.id}`,
        dishId: item.dish.id,
        name: item.dish.name,
        category: item.dish.category,
        station: mapCategoryToKitchenStation(item.dish.category),
        quantity: item.quantity,
        specialNotes: item.specialNotes || (item.dish.category === 'main' ? 'Chế biến phong cách Fine Dining' : undefined),
        status,
        orderedAt: createdAt,
        startedAt: status !== 'pending' ? createdAt : undefined,
        readyAt: status === 'ready' ? new Date().toISOString() : undefined,
      };
    });

    initialTickets.push({
      id: `kt-${res.id}`,
      reservationId: res.id,
      bookingCode: res.bookingCode,
      tableId: res.tableId,
      tableName: res.tableName,
      tableArea: res.tableArea,
      customerName: res.customerName,
      guestCount: res.guestCount,
      orderType: res.status === 'seated' ? 'dine_in' : 'pre_order',
      priority: index === 2 ? 'rush' : res.tableArea === 'vip' ? 'vip' : 'normal',
      createdAt,
      items,
      serverName: 'Trần Văn Hoàng (Bàn VIP & Tầng 1)',
      notes: res.specialRequests || (res.tableArea === 'vip' ? 'Khách VIP ưu tiên phục vụ' : undefined),
    });
  });

  return initialTickets;
}

export function getStoredKitchenTickets(): KitchenTicket[] {
  try {
    const data = localStorage.getItem(KITCHEN_TICKETS_KEY);
    if (data) {
      const parsed: KitchenTicket[] = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse kitchen tickets', e);
  }

  const initial = generateInitialKitchenTickets();
  saveStoredKitchenTickets(initial);
  return initial;
}

export function saveStoredKitchenTickets(tickets: KitchenTicket[]): void {
  try {
    localStorage.setItem(KITCHEN_TICKETS_KEY, JSON.stringify(tickets));
  } catch (e) {
    console.error('Failed to save kitchen tickets', e);
  }
}

/**
 * Updates status of a single item in a ticket
 */
export function updateKitchenItemStatus(
  ticketId: string, 
  itemId: string, 
  newStatus: KitchenItemStatus
): KitchenTicket[] {
  const tickets = getStoredKitchenTickets();
  const updated = tickets.map(ticket => {
    if (ticket.id !== ticketId) return ticket;

    const updatedItems = ticket.items.map(item => {
      if (item.id !== itemId) return item;
      const nowIso = new Date().toISOString();
      return {
        ...item,
        status: newStatus,
        startedAt: newStatus === 'cooking' && !item.startedAt ? nowIso : item.startedAt,
        readyAt: newStatus === 'ready' ? nowIso : item.readyAt,
        servedAt: newStatus === 'served' ? nowIso : item.servedAt,
      };
    });

    return {
      ...ticket,
      items: updatedItems,
    };
  });

  saveStoredKitchenTickets(updated);

  if (newStatus === 'ready') {
    playKitchenChime('ready');
  }

  return updated;
}

/**
 * Advances all non-served items in ticket to target status ('cooking', 'ready', or 'served')
 */
export function bumpAllItemsInTicket(
  ticketId: string, 
  targetStatus: KitchenItemStatus
): KitchenTicket[] {
  const tickets = getStoredKitchenTickets();
  const nowIso = new Date().toISOString();

  const updated = tickets.map(ticket => {
    if (ticket.id !== ticketId) return ticket;

    const updatedItems = ticket.items.map(item => {
      if (item.status === 'served') return item;
      return {
        ...item,
        status: targetStatus,
        startedAt: targetStatus === 'cooking' && !item.startedAt ? nowIso : item.startedAt,
        readyAt: targetStatus === 'ready' ? nowIso : item.readyAt,
        servedAt: targetStatus === 'served' ? nowIso : item.servedAt,
      };
    });

    return {
      ...ticket,
      items: updatedItems,
    };
  });

  saveStoredKitchenTickets(updated);

  if (targetStatus === 'ready') {
    playKitchenChime('ready');
  }

  return updated;
}

/**
 * Toggles priority of a ticket (normal -> rush -> vip -> normal)
 */
export function toggleTicketPriority(ticketId: string): KitchenTicket[] {
  const tickets = getStoredKitchenTickets();
  const updated = tickets.map(ticket => {
    if (ticket.id !== ticketId) return ticket;
    let nextPriority: KitchenTicketPriority = 'normal';
    if (ticket.priority === 'normal') nextPriority = 'rush';
    else if (ticket.priority === 'rush') nextPriority = 'vip';
    else nextPriority = 'normal';

    return { ...ticket, priority: nextPriority };
  });

  saveStoredKitchenTickets(updated);
  return updated;
}

/**
 * Appends new ordered dishes at a table directly to the kitchen ticket
 */
export function syncDishesToKitchenTicket(
  reservation: Reservation, 
  newDishes: { dish: MenuItem; quantity: number; specialNotes?: string }[]
): KitchenTicket[] {
  const tickets = getStoredKitchenTickets();
  const existingTicketIndex = tickets.findIndex(t => t.reservationId === reservation.id);
  const nowIso = new Date().toISOString();

  const newTicketItems: KitchenTicketItem[] = newDishes.map((d, idx) => ({
    id: `kitem-add-${reservation.id}-${Date.now()}-${idx}`,
    dishId: d.dish.id,
    name: d.dish.name,
    category: d.dish.category,
    station: mapCategoryToKitchenStation(d.dish.category),
    quantity: d.quantity,
    specialNotes: d.specialNotes || 'Món gọi bổ sung tại bàn',
    status: 'pending',
    orderedAt: nowIso,
  }));

  if (existingTicketIndex >= 0) {
    const existingTicket = tickets[existingTicketIndex];
    tickets[existingTicketIndex] = {
      ...existingTicket,
      items: [...existingTicket.items, ...newTicketItems],
    };
  } else {
    tickets.unshift({
      id: `kt-${reservation.id}`,
      reservationId: reservation.id,
      bookingCode: reservation.bookingCode,
      tableId: reservation.tableId,
      tableName: reservation.tableName,
      tableArea: reservation.tableArea,
      customerName: reservation.customerName,
      guestCount: reservation.guestCount,
      orderType: 'dine_in',
      priority: reservation.tableArea === 'vip' ? 'vip' : 'normal',
      createdAt: nowIso,
      items: newTicketItems,
      serverName: 'Nhân viên phục vụ bàn',
      notes: reservation.specialRequests,
    });
  }

  saveStoredKitchenTickets(tickets);
  playKitchenChime('order_arrival');
  return tickets;
}

/**
 * Creates or resets a ticket when a reservation checks in
 */
export function ensureKitchenTicketForCheckIn(reservation: Reservation): KitchenTicket[] {
  const tickets = getStoredKitchenTickets();
  const existing = tickets.find(t => t.reservationId === reservation.id);
  if (existing) {
    // Update orderType to dine_in and status
    const updated = tickets.map(t => t.reservationId === reservation.id ? { ...t, orderType: 'dine_in' as const } : t);
    saveStoredKitchenTickets(updated);
    return updated;
  }

  if (reservation.selectedDishes && reservation.selectedDishes.length > 0) {
    const nowIso = new Date().toISOString();
    const items: KitchenTicketItem[] = reservation.selectedDishes.map((item, idx) => ({
      id: `kitem-checkin-${reservation.id}-${idx}`,
      dishId: item.dish.id,
      name: item.dish.name,
      category: item.dish.category,
      station: mapCategoryToKitchenStation(item.dish.category),
      quantity: item.quantity,
      specialNotes: item.specialNotes,
      status: 'pending',
      orderedAt: nowIso,
    }));

    const newTicket: KitchenTicket = {
      id: `kt-${reservation.id}`,
      reservationId: reservation.id,
      bookingCode: reservation.bookingCode,
      tableId: reservation.tableId,
      tableName: reservation.tableName,
      tableArea: reservation.tableArea,
      customerName: reservation.customerName,
      guestCount: reservation.guestCount,
      orderType: 'dine_in',
      priority: reservation.tableArea === 'vip' ? 'vip' : 'normal',
      createdAt: nowIso,
      items,
      serverName: 'Lễ tân tiếp đón',
      notes: reservation.specialRequests,
    };

    tickets.unshift(newTicket);
    saveStoredKitchenTickets(tickets);
    playKitchenChime('order_arrival');
  }

  return tickets;
}

// ==========================================
// INVENTORY & RECIPE BOM COST CONTROL LOGIC
// ==========================================

export function getStoredIngredients(): Ingredient[] {
  try {
    const data = localStorage.getItem(INGREDIENTS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map(i => i.id));
        const missing = INITIAL_INGREDIENTS.filter(i => !existingIds.has(i.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          saveStoredIngredients(merged);
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse ingredients', e);
  }
  saveStoredIngredients(INITIAL_INGREDIENTS);
  return INITIAL_INGREDIENTS;
}

export function saveStoredIngredients(ingredients: Ingredient[]): void {
  try {
    localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(ingredients));
  } catch (e) {
    console.error('Failed to save ingredients', e);
  }
}

export function getStoredRecipeBOMs(): DishRecipeBOM[] {
  try {
    const data = localStorage.getItem(RECIPE_BOM_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingDishIds = new Set(parsed.map(r => r.dishId));
        const missing = INITIAL_RECIPES.filter(r => !existingDishIds.has(r.dishId));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          saveStoredRecipeBOMs(merged);
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse recipes', e);
  }
  saveStoredRecipeBOMs(INITIAL_RECIPES);
  return INITIAL_RECIPES;
}


export function saveStoredRecipeBOMs(recipes: DishRecipeBOM[]): void {
  try {
    localStorage.setItem(RECIPE_BOM_KEY, JSON.stringify(recipes));
  } catch (e) {
    console.error('Failed to save recipes', e);
  }
}

export function getStoredInventoryLogs(): InventoryLog[] {
  try {
    const data = localStorage.getItem(INVENTORY_LOGS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse inventory logs', e);
  }
  saveStoredInventoryLogs(INITIAL_INVENTORY_LOGS);
  return INITIAL_INVENTORY_LOGS;
}

export function saveStoredInventoryLogs(logs: InventoryLog[]): void {
  try {
    localStorage.setItem(INVENTORY_LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save inventory logs', e);
  }
}

/**
 * Deducts ingredients in warehouse based on Recipe BOM for ordered dishes.
 * If crucial ingredients run out, automatically flags and disables dish on menu.
 */
export function deductInventoryForDishes(
  dishes: { dish: MenuItem; quantity: number }[],
  bookingCode?: string,
  performedBy: string = 'Hệ thống tự động trừ theo BOM'
): { success: boolean; deductedLogs: InventoryLog[]; lockedDishes: string[] } {
  if (!dishes || dishes.length === 0) {
    return { success: true, deductedLogs: [], lockedDishes: [] };
  }

  const ingredients = getStoredIngredients();
  const recipes = getStoredRecipeBOMs();
  const logs = getStoredInventoryLogs();
  const nowIso = new Date().toISOString();

  const newLogs: InventoryLog[] = [];
  const lockedDishes: string[] = [];

  dishes.forEach(({ dish, quantity }) => {
    if (quantity <= 0) return;
    const recipe = recipes.find(r => r.dishId === dish.id);
    if (!recipe) return;

    recipe.ingredients.forEach(item => {
      const ingIndex = ingredients.findIndex(i => i.id === item.ingredientId);
      if (ingIndex === -1) return;

      const ing = ingredients[ingIndex];
      const deductAmount = item.amount * quantity;
      const newStock = Math.max(0, ing.currentStock - deductAmount);

      ingredients[ingIndex] = {
        ...ing,
        currentStock: newStock,
      };

      const log: InventoryLog = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: nowIso,
        type: 'order_deduction',
        ingredientId: ing.id,
        ingredientName: ing.name,
        quantityChanged: -deductAmount,
        remainingStock: newStock,
        unit: ing.unit,
        referenceDishName: `${dish.name} (x${quantity})`,
        referenceBookingCode: bookingCode,
        performedBy,
      };

      newLogs.push(log);
    });
  });

  saveStoredIngredients(ingredients);
  saveStoredInventoryLogs([...newLogs, ...logs]);

  // Check crucial ingredients and auto-lock dishes on menu if insufficient
  const menuItems = getStoredMenuItems();
  let menuUpdated = false;

  recipes.forEach(recipe => {
    // Check if any crucial ingredient has insufficient stock for 1 portion
    const crucialMissing = recipe.ingredients.some(ri => {
      if (!ri.isCrucial) return false;
      const ing = ingredients.find(i => i.id === ri.ingredientId);
      return !ing || ing.currentStock < ri.amount;
    });

    const targetDish = menuItems.find(m => m.id === recipe.dishId);
    if (targetDish) {
      if (crucialMissing && targetDish.isAvailable !== false) {
        targetDish.isAvailable = false;
        lockedDishes.push(targetDish.name);
        menuUpdated = true;
      }
    }
  });

  if (menuUpdated) {
    saveStoredMenuItems(menuItems);
  }

  return { success: true, deductedLogs: newLogs, lockedDishes };
}

/**
 * Imports replenishment stock for an ingredient
 */
export function importInventoryStock(
  ingredientId: string, 
  quantityToAdd: number, 
  notes?: string, 
  performedBy: string = 'Quản Lý Bếp'
): Ingredient[] {
  const ingredients = getStoredIngredients();
  const logs = getStoredInventoryLogs();
  const targetIndex = ingredients.findIndex(i => i.id === ingredientId);

  if (targetIndex === -1 || quantityToAdd <= 0) return ingredients;

  const target = ingredients[targetIndex];
  const newStock = target.currentStock + quantityToAdd;
  const nowIso = new Date().toISOString();

  ingredients[targetIndex] = {
    ...target,
    currentStock: newStock,
    lastImportDate: nowIso.split('T')[0],
  };

  const newLog: InventoryLog = {
    id: `log-import-${Date.now()}`,
    timestamp: nowIso,
    type: 'stock_import',
    ingredientId: target.id,
    ingredientName: target.name,
    quantityChanged: quantityToAdd,
    remainingStock: newStock,
    unit: target.unit,
    performedBy,
    notes: notes || 'Nhập bổ sung nguyên vật liệu định kỳ',
  };

  saveStoredIngredients(ingredients);
  saveStoredInventoryLogs([newLog, ...logs]);

  // Check if any locked dishes can now be re-enabled
  checkAndReenableDishes(ingredients);

  return ingredients;
}

/**
 * Updates an ingredient details
 */
export function updateIngredient(ingredientId: string, updates: Partial<Ingredient>): Ingredient[] {
  const ingredients = getStoredIngredients();
  const updated = ingredients.map(i => i.id === ingredientId ? { ...i, ...updates } : i);
  saveStoredIngredients(updated);
  checkAndReenableDishes(updated);
  return updated;
}

/**
 * Adds a new ingredient to warehouse
 */
export function addIngredient(newIngredient: Ingredient): Ingredient[] {
  const ingredients = getStoredIngredients();
  const updated = [newIngredient, ...ingredients];
  saveStoredIngredients(updated);
  return updated;
}

/**
 * Updates or sets Recipe BOM for a dish
 */
export function updateRecipeBOM(dishId: string, ingredients: RecipeItemIngredient[], notes?: string): DishRecipeBOM[] {
  const recipes = getStoredRecipeBOMs();
  const existingIdx = recipes.findIndex(r => r.dishId === dishId);

  if (existingIdx >= 0) {
    recipes[existingIdx] = {
      ...recipes[existingIdx],
      ingredients,
      preparationNotes: notes ?? recipes[existingIdx].preparationNotes,
    };
  } else {
    recipes.push({
      dishId,
      ingredients,
      preparationNotes: notes,
    });
  }

  saveStoredRecipeBOMs(recipes);
  return recipes;
}

/**
 * Re-evaluates whether locked dishes now have enough crucial ingredients to be available
 */
function checkAndReenableDishes(ingredients: Ingredient[]) {
  const recipes = getStoredRecipeBOMs();
  const menuItems = getStoredMenuItems();
  let changed = false;

  recipes.forEach(recipe => {
    const crucialSatisfied = recipe.ingredients.every(ri => {
      if (!ri.isCrucial) return true;
      const ing = ingredients.find(i => i.id === ri.ingredientId);
      return ing && ing.currentStock >= ri.amount;
    });

    const targetDish = menuItems.find(m => m.id === recipe.dishId);
    if (targetDish && crucialSatisfied && targetDish.isAvailable === false) {
      targetDish.isAvailable = true;
      changed = true;
    }
  });

  if (changed) {
    saveStoredMenuItems(menuItems);
  }
}

/**
 * Calculates Cost of Goods Sold (COGS), Food Cost %, Profit Margins, and Max Portions
 */
export function getDishCostAnalyses(): DishCostAnalysis[] {
  const menuItems = getStoredMenuItems();
  const recipes = getStoredRecipeBOMs();
  const ingredients = getStoredIngredients();

  return menuItems.map(dish => {
    const recipe = recipes.find(r => r.dishId === dish.id);

    if (!recipe || recipe.ingredients.length === 0) {
      // Default estimate 30% if no explicit BOM defined yet
      const estimatedCost = Math.round(dish.price * 0.3);
      return {
        dishId: dish.id,
        dishName: dish.name,
        category: dish.category,
        sellingPrice: dish.price,
        costOfGoodsSold: estimatedCost,
        foodCostPercentage: 30,
        grossProfitMargin: dish.price - estimatedCost,
        maxPortionsAvailable: 50,
        isCrucialMissing: false,
      };
    }

    let cogs = 0;
    let maxPortions = 999;
    let isCrucialMissing = false;
    let limitingIngredientName: string | undefined;

    recipe.ingredients.forEach(item => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      if (ing) {
        cogs += item.amount * ing.costPerUnit;

        const portionsWithThis = Math.floor(ing.currentStock / item.amount);
        if (portionsWithThis < maxPortions) {
          maxPortions = portionsWithThis;
          limitingIngredientName = ing.name;
        }

        if (item.isCrucial && ing.currentStock < item.amount) {
          isCrucialMissing = true;
        }
      }
    });

    const foodCostPercentage = dish.price > 0 ? (cogs / dish.price) * 100 : 0;
    const grossProfitMargin = dish.price - cogs;

    return {
      dishId: dish.id,
      dishName: dish.name,
      category: dish.category,
      sellingPrice: dish.price,
      costOfGoodsSold: Math.round(cogs),
      foodCostPercentage: Math.round(foodCostPercentage * 10) / 10,
      grossProfitMargin: Math.round(grossProfitMargin),
      maxPortionsAvailable: Math.max(0, maxPortions === 999 ? 0 : maxPortions),
      isCrucialMissing,
      limitingIngredientName,
    };
  });
}

// ==========================================
// TABLE SERVICE REQUEST (SMART QR SERVICE BELL)
// ==========================================

export function playServiceBellChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Brass Service Bell harmonic tones (high bell ding)
    const playBellTone = (freq: number, start: number, duration: number, gainVal: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(gainVal, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // First ding
    playBellTone(1046.5, now, 0.8, 0.4); // C6
    playBellTone(2093.0, now, 0.6, 0.15); // C7 harmonic
    playBellTone(3135.9, now, 0.4, 0.08); // G7 shimmer

    // Second pleasant ding 120ms later
    playBellTone(1318.5, now + 0.12, 1.2, 0.45); // E6
    playBellTone(2637.0, now + 0.12, 0.9, 0.2); // E7
    playBellTone(3951.0, now + 0.12, 0.5, 0.1); // B7
  } catch (e) {
    // AudioContext might be blocked until user gesture, ignore silently
  }
}

export function getStoredTableServiceRequests(): TableServiceRequest[] {
  try {
    const data = localStorage.getItem(SERVICE_REQUESTS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse service requests from storage', e);
  }
  saveStoredTableServiceRequests(INITIAL_TABLE_SERVICE_REQUESTS);
  return INITIAL_TABLE_SERVICE_REQUESTS;
}

export function saveStoredTableServiceRequests(requests: TableServiceRequest[]): void {
  try {
    localStorage.setItem(SERVICE_REQUESTS_KEY, JSON.stringify(requests));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('restaurant:service_requests_updated', { detail: requests }));
    }
  } catch (e) {
    console.error('Failed to save service requests to storage', e);
  }
}

export function createTableServiceRequest(params: {
  tableId: string;
  tableName: string;
  tableArea: any;
  reservationId?: string;
  bookingCode?: string;
  type: TableServiceRequestType;
  customNote?: string;
}): TableServiceRequest {
  const current = getStoredTableServiceRequests();
  const newRequest: TableServiceRequest = {
    id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    tableId: params.tableId,
    tableName: params.tableName,
    tableArea: params.tableArea,
    reservationId: params.reservationId,
    bookingCode: params.bookingCode,
    type: params.type,
    customNote: params.customNote,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const updated = [newRequest, ...current];
  saveStoredTableServiceRequests(updated);
  playServiceBellChime();
  return newRequest;
}

export function updateTableServiceRequestStatus(
  requestId: string,
  status: TableServiceStatus,
  staffName?: string
): TableServiceRequest[] {
  const current = getStoredTableServiceRequests();
  const now = new Date().toISOString();
  const updated = current.map(req => {
    if (req.id === requestId) {
      return {
        ...req,
        status,
        assignedStaffName: staffName || req.assignedStaffName,
        acknowledgedAt: status === 'acknowledged' ? now : req.acknowledgedAt,
        completedAt: status === 'completed' ? now : req.completedAt,
      };
    }
    return req;
  });
  saveStoredTableServiceRequests(updated);
  return updated;
}

// ==========================================
// CUSTOMER FEEDBACK & CSAT / NPS REPUTATION
// ==========================================

export function getStoredCustomerReviews(): CustomerReview[] {
  try {
    const data = localStorage.getItem(CUSTOMER_REVIEWS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse customer reviews from storage', e);
  }
  saveStoredCustomerReviews(INITIAL_CUSTOMER_REVIEWS);
  return INITIAL_CUSTOMER_REVIEWS;
}

export function saveStoredCustomerReviews(reviews: CustomerReview[]): void {
  try {
    localStorage.setItem(CUSTOMER_REVIEWS_KEY, JSON.stringify(reviews));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('restaurant:reviews_updated', { detail: reviews }));
    }
  } catch (e) {
    console.error('Failed to save customer reviews to storage', e);
  }
}

export function submitCustomerReview(
  reviewData: Omit<CustomerReview, 'id' | 'createdAt'>
): CustomerReview {
  const current = getStoredCustomerReviews();
  const newReview: CustomerReview = {
    ...reviewData,
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newReview, ...current];
  saveStoredCustomerReviews(updated);
  return newReview;
}

export function respondToCustomerReview(
  reviewId: string,
  staffResponse: string,
  staffName: string,
  compensationVoucherCode?: string
): CustomerReview[] {
  const current = getStoredCustomerReviews();
  const updated = current.map(rev => {
    if (rev.id === reviewId) {
      return {
        ...rev,
        staffResponse,
        respondedAt: new Date().toISOString(),
        respondedBy: staffName,
        compensationVoucherCode: compensationVoucherCode || rev.compensationVoucherCode,
      };
    }
    return rev;
  });
  saveStoredCustomerReviews(updated);
  return updated;
}

export function calculateCSATMetrics(reviewsList?: CustomerReview[]): CSATSummaryMetrics {
  const reviews = reviewsList || getStoredCustomerReviews();
  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageOverall: 5.0,
      averageFood: 5.0,
      averageService: 5.0,
      averageAmbiance: 5.0,
      npsScore: 100,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      promoterCount: 0,
      passiveCount: 0,
      detractorCount: 0,
    };
  }

  let sumOverall = 0;
  let sumFood = 0;
  let sumService = 0;
  let sumAmbiance = 0;

  let promoterCount = 0; // 9-10
  let passiveCount = 0;  // 7-8
  let detractorCount = 0; // 0-6

  const distribution: { [stars: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviews.forEach(r => {
    sumOverall += r.overallRating;
    sumFood += r.foodRating;
    sumService += r.serviceRating;
    sumAmbiance += r.ambianceRating;

    const roundedStars = Math.min(5, Math.max(1, Math.round(r.overallRating)));
    distribution[roundedStars] = (distribution[roundedStars] || 0) + 1;

    if (r.npsScore >= 9) promoterCount++;
    else if (r.npsScore >= 7) passiveCount++;
    else detractorCount++;
  });

  const total = reviews.length;
  const npsScore = Math.round(((promoterCount - detractorCount) / total) * 100);

  return {
    totalReviews: total,
    averageOverall: Math.round((sumOverall / total) * 10) / 10,
    averageFood: Math.round((sumFood / total) * 10) / 10,
    averageService: Math.round((sumService / total) * 10) / 10,
    averageAmbiance: Math.round((sumAmbiance / total) * 10) / 10,
    npsScore,
    ratingDistribution: distribution,
    promoterCount,
    passiveCount,
    detractorCount,
  };
}

