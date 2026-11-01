export type TableArea = 'main' | 'vip' | 'garden' | 'rooftop';

export type TableStatus = 'available' | 'reserved' | 'occupied' | 'cleaning';

export interface RestaurantTable {
  id: string;
  name: string; // e.g. "Bàn M-01", "Phòng VIP Hoàng Gia"
  area: TableArea;
  capacity: number;
  status: TableStatus;
  currentReservationId?: string;
  shape: 'round' | 'rectangle';
  mergedWithTableIds?: string[]; // IDs của các bàn được ghép cùng
  isMergedSecondary?: boolean;    // Cờ đánh dấu bàn phụ thuộc trong cụm bàn ghép
}

export type DishCategory = 'appetizer' | 'main' | 'seafood' | 'dessert' | 'beverage';

export interface WinePairingRecommendation {
  recommendedWineName: string;
  recommendedWineId: string;
  sommelierTastingNotes: string;
  glassPrice?: number;
  bottlePrice?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: DishCategory;
  price: number; // in VND
  image: string;
  description: string;
  isChefSpecial?: boolean;
  dietary?: ('vegetarian' | 'spicy' | 'gluten_free' | 'bestseller')[];
  prepTimeMinutes?: number;
  isAvailable?: boolean;
  winePairing?: WinePairingRecommendation;
  meatDonenessRequired?: boolean; // Cho phép thực khách chọn độ chín: Tái, Tái vừa, Chín vừa, Chín kỹ
}

export interface TastingCourse {
  id: string;
  name: string;
  subtitle: string;
  pricePerPerson: number;
  image: string;
  description: string;
  courseCount: number;
  dishes: { dishId: string; dishName: string; courseRole: string }[];
  winePairingOption?: {
    wineName: string;
    wineId: string;
    extraPricePerPerson: number;
    notes: string;
  };
}

export interface SelectedDishItem {
  dish: MenuItem;
  quantity: number;
  specialNotes?: string;
  meatDoneness?: 'rare' | 'medium_rare' | 'medium' | 'well_done';
}


export type ReservationStatus = 
  | 'pending'    // Chờ xác nhận
  | 'confirmed'  // Đã xác nhận (Email đã gửi)
  | 'seated'     // Đang phục vụ tại bàn
  | 'completed'  // Đã hoàn thành (Thanh toán)
  | 'cancelled'; // Đã hủy

export interface Reservation {
  id: string;
  bookingCode: string; // e.g. "BK-9241"
  userId?: string;     // ID người dùng đặt (nếu có tài khoản)
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  guestCount: number;
  bookingDate: string; // YYYY-MM-DD
  arrivalTime: string; // HH:mm (e.g. "18:30")
  tableId: string;
  tableIds?: string[]; // Hỗ trợ đặt tiệc ghép bàn (ví dụ: ['T-02', 'T-03'])
  tableName: string;
  tableArea: TableArea;

  selectedDishes: SelectedDishItem[];
  preOrderTotal: number; // Tổng tiền món
  voucherCode?: string;
  discountAmount?: number; // Tiền giảm giá voucher
  depositAmount: number; // Tiền cọc (nếu có)
  totalAmount: number;   // Tổng hóa đơn dự kiến
  pointsEarned?: number; // Điểm tích lũy nhận được
  status: ReservationStatus;
  specialRequests?: string;
  occasion?: string;     // Sinh nhật, Kỷ niệm, Tiếp khách, Ăn tối gia đình
  createdAt: string;     // ISO String
  emailConfirmationSent: boolean;
  emailSentAt?: string;
}

export type UserRole = 'customer' | 'admin' | 'staff';
export type MembershipTier = 'Đồng' | 'Bạc' | 'Vàng' | 'Kim Cương';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  position?: string;
  shift?: string;
  status?: 'active' | 'inactive';
  loyaltyPoints: number;
  membershipTier: MembershipTier;
  dietaryPreferences?: string;
  favoriteDishIds: string[];
  createdAt: string;
}

export interface UserVoucher {
  code: string;
  title: string;
  description: string;
  discountPercent?: number; // e.g. 10 => 10%
  discountAmount?: number;  // e.g. 150000 VND
  minOrder: number;
  expiryDate: string;
  tierRequired?: MembershipTier;
}

export interface SentEmailLog {
  id: string;
  toEmail: string;
  toName: string;
  subject: string;
  sentAt: string;
  bookingCode: string;
  reservationId: string;
  type: 'booking_confirmation' | 'status_update' | 'reminder';
  htmlContent: string;
}

export interface RevenueMetric {
  date: string;
  totalRevenue: number;
  bookingCount: number;
  guestCount: number;
}

// ==========================================
// KITCHEN DISPLAY SYSTEM (KDS) TYPES
// ==========================================
export type KitchenStation = 'all' | 'hot_kitchen' | 'cold_kitchen' | 'bar' | 'pastry';

export type KitchenItemStatus = 'pending' | 'cooking' | 'ready' | 'served';

export type KitchenTicketPriority = 'normal' | 'rush' | 'vip';

export interface KitchenTicketItem {
  id: string;
  dishId: string;
  name: string;
  category: DishCategory;
  station: KitchenStation;
  quantity: number;
  specialNotes?: string;
  status: KitchenItemStatus;
  orderedAt: string;
  startedAt?: string;
  readyAt?: string;
  servedAt?: string;
}

export interface KitchenTicket {
  id: string;
  reservationId?: string;
  bookingCode: string;
  tableId: string;
  tableName: string;
  tableArea: TableArea;
  customerName: string;
  guestCount: number;
  orderType: 'dine_in' | 'pre_order';
  priority: KitchenTicketPriority;
  createdAt: string; // ISO
  items: KitchenTicketItem[];
  serverName?: string;
  notes?: string;
}

// ==========================================
// RECIPE BOM & INVENTORY MANAGEMENT TYPES
// ==========================================
export type IngredientCategory = 
  | 'meat' 
  | 'seafood' 
  | 'dairy' 
  | 'produce' 
  | 'spices_sauces' 
  | 'beverage_wine' 
  | 'dry_goods';

export type IngredientUnit = 'g' | 'kg' | 'ml' | 'l' | 'pcs' | 'bottle';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  unit: IngredientUnit;
  currentStock: number;
  minStockLevel: number; // Ngưỡng cảnh báo an toàn
  costPerUnit: number; // Đơn giá vốn tính theo 1 unit VND
  supplier?: string;
  lastImportDate?: string;
}

export interface RecipeItemIngredient {
  ingredientId: string;
  amount: number; // Định lượng tiêu hao cho 1 phần ăn
  isCrucial?: boolean; // Nguyên liệu cốt lõi (hết là tự động tạm khóa món)
}

export interface DishRecipeBOM {
  dishId: string; // ID món ăn tương ứng MenuItem.id
  ingredients: RecipeItemIngredient[];
  preparationNotes?: string;
}

export type InventoryLogType = 
  | 'order_deduction' 
  | 'stock_import' 
  | 'manual_adjustment' 
  | 'spoilage_waste';

export interface InventoryLog {
  id: string;
  timestamp: string; // ISO
  type: InventoryLogType;
  ingredientId: string;
  ingredientName: string;
  quantityChanged: number; // Giá trị âm khi trừ kho, dương khi nhập
  remainingStock: number;
  unit: IngredientUnit;
  referenceDishName?: string;
  referenceBookingCode?: string;
  performedBy?: string;
  notes?: string;
}

export interface DishCostAnalysis {
  dishId: string;
  dishName: string;
  category: DishCategory;
  sellingPrice: number;
  costOfGoodsSold: number; // Giá vốn định lượng
  foodCostPercentage: number; // (COGS / sellingPrice) * 100
  grossProfitMargin: number; // sellingPrice - COGS
  maxPortionsAvailable: number; // Số phần tối đa chế biến được từ kho hiện tại
  isCrucialMissing: boolean;
  limitingIngredientName?: string;
}

// ==========================================
// TABLE SERVICE REQUEST (SMART QR SERVICE BELL)
// ==========================================
export type TableServiceRequestType = 
  | 'water_ice'       // Tiếp nước đá / Nước lọc
  | 'sommelier'       // Gặp Sommelier tư vấn rượu vang
  | 'cutlery'         // Đổi dao dĩa / Đổi chén đĩa mới
  | 'hot_towel'       // Khăn ấm cao cấp
  | 'bill_request'    // Yêu cầu thanh toán & In hóa đơn
  | 'manager'         // Gặp Quản lý nhà hàng
  | 'other';          // Yêu cầu khác

export type TableServiceStatus = 'pending' | 'acknowledged' | 'completed';

export interface TableServiceRequest {
  id: string;
  tableId: string;
  tableName: string;
  tableArea: TableArea;
  reservationId?: string;
  bookingCode?: string;
  type: TableServiceRequestType;
  customNote?: string;
  status: TableServiceStatus;
  createdAt: string; // ISO
  acknowledgedAt?: string;
  completedAt?: string;
  assignedStaffName?: string;
}

// ==========================================
// CUSTOMER FEEDBACK & CSAT / NPS REPUTATION
// ==========================================
export interface CustomerReview {
  id: string;
  reservationId: string;
  bookingCode: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  tableId: string;
  tableName: string;
  overallRating: number;   // 1 to 5 stars
  foodRating: number;      // 1 to 5 stars
  serviceRating: number;   // 1 to 5 stars
  ambianceRating: number;  // 1 to 5 stars
  npsScore: number;        // 0 to 10
  favoriteDishName?: string;
  comment: string;
  createdAt: string;       // ISO
  staffResponse?: string;
  respondedAt?: string;
  respondedBy?: string;
  compensationVoucherCode?: string;
}

export interface CSATSummaryMetrics {
  totalReviews: number;
  averageOverall: number;
  averageFood: number;
  averageService: number;
  averageAmbiance: number;
  npsScore: number; // % Promoters (9-10) - % Detractors (0-6)
  ratingDistribution: { [stars: number]: number };
  promoterCount: number;
  passiveCount: number;
  detractorCount: number;
}


