import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Bell, 
  Plus, 
  Minus, 
  Utensils, 
  Wine, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Search, 
  ChevronRight,
  Flame,
  Award,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { 
  RestaurantTable, 
  Reservation, 
  MenuItem, 
  TableServiceRequest, 
  TableServiceRequestType, 
  DishCategory 
} from '../../types';
import { 
  formatVND, 
  getStoredMenuItems, 
  getStoredReservations, 
  getStoredTables, 
  getStoredTableServiceRequests, 
  createTableServiceRequest,
  addDishesToReservation,
  playServiceBellChime
} from '../../services/storage';

interface TableSelfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTableId?: string;
  initialReservation?: Reservation | null;
  onOpenReviewModal?: (reservation: Reservation) => void;
  onDishesAdded?: () => void;
}

export const TableSelfServiceModal: React.FC<TableSelfServiceModalProps> = ({
  isOpen,
  onClose,
  initialTableId,
  initialReservation,
  onOpenReviewModal,
  onDishesAdded,
}) => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>(initialTableId || 'T-01');
  const [activeTab, setActiveTab] = useState<'service_bell' | 'order_dishes' | 'running_tab'>('service_bell');
  
  // Custom note for service bell
  const [customRequestNote, setCustomRequestNote] = useState<string>('');
  const [requestSentSuccess, setRequestSentSuccess] = useState<string | null>(null);

  // Self-ordering states
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<DishCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<{ [dishId: string]: { dish: MenuItem; quantity: number; notes: string } }>({});
  const [orderSubmittedSuccess, setOrderSubmittedSuccess] = useState<boolean>(false);

  // Service requests of this table
  const [serviceRequests, setServiceRequests] = useState<TableServiceRequest[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTables(getStoredTables());
      setReservations(getStoredReservations());
      setMenuItems(getStoredMenuItems());
      setServiceRequests(getStoredTableServiceRequests());

      if (initialTableId) {
        setSelectedTableId(initialTableId);
      }
    }
  }, [isOpen, initialTableId]);

  // Listen to live service requests updates
  useEffect(() => {
    const handleUpdated = (e: any) => {
      if (e.detail) {
        setServiceRequests(e.detail);
      }
    };
    window.addEventListener('restaurant:service_requests_updated', handleUpdated);
    return () => window.removeEventListener('restaurant:service_requests_updated', handleUpdated);
  }, []);

  if (!isOpen) return null;

  const currentTable = tables.find(t => t.id === selectedTableId) || tables[0];
  const activeReservation = reservations.find(r => 
    r.tableId === selectedTableId && (r.status === 'seated' || r.status === 'confirmed')
  ) || initialReservation;

  const tableRequests = serviceRequests.filter(r => r.tableId === selectedTableId);

  // Quick service bell options
  const serviceOptions: { type: TableServiceRequestType; title: string; subtitle: string; icon: string }[] = [
    { type: 'water_ice', title: 'Tiếp Nước & Thêm Đá', subtitle: 'Phục vụ nước lọc tinh khiết và đá viên', icon: '🧊' },
    { type: 'sommelier', title: 'Tư Vấn Rượu Vang', subtitle: 'Chuyên gia Sommelier hỗ trợ mở & chọn rượu', icon: '🍷' },
    { type: 'cutlery', title: 'Đổi Dao Dĩa & Chén Đĩa', subtitle: 'Thay bộ đồ ăn mới cho món tiếp theo', icon: '🥢' },
    { type: 'hot_towel', title: 'Khăn Ấm Cao Cấp', subtitle: 'Khăn ấm hương sả chanh thư giãn', icon: '🧼' },
    { type: 'bill_request', title: 'In Hóa Đơn & Thanh Toán', subtitle: 'Chuẩn bị hóa đơn và máy POS tại bàn', icon: '💳' },
    { type: 'manager', title: 'Gặp Quản Lý Nhà Hàng', subtitle: 'Hỗ trợ yêu cầu đặc biệt & dịch vụ VIP', icon: '🛎️' },
  ];

  const handleCallService = (type: TableServiceRequestType, customNoteText?: string) => {
    const note = customNoteText || customRequestNote;
    const req = createTableServiceRequest({
      tableId: currentTable.id,
      tableName: currentTable.name,
      tableArea: currentTable.area,
      reservationId: activeReservation?.id,
      bookingCode: activeReservation?.bookingCode,
      type,
      customNote: note || undefined,
    });

    setServiceRequests(getStoredTableServiceRequests());
    setRequestSentSuccess(`Yêu cầu "${serviceOptions.find(o => o.type === type)?.title || 'Phục vụ'}" đã được gửi tới nhân viên sảnh!`);
    setCustomRequestNote('');
    playServiceBellChime();

    setTimeout(() => {
      setRequestSentSuccess(null);
    }, 4500);
  };

  // Cart operations
  const updateCartQty = (dish: MenuItem, delta: number) => {
    setCart(prev => {
      const existing = prev[dish.id];
      const currentQty = existing ? existing.quantity : 0;
      const nextQty = currentQty + delta;
      if (nextQty <= 0) {
        const copy = { ...prev };
        delete copy[dish.id];
        return copy;
      }
      return {
        ...prev,
        [dish.id]: {
          dish,
          quantity: nextQty,
          notes: existing?.notes || '',
        },
      };
    });
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

  const handleSendOrderToKitchen = () => {
    if (cartItems.length === 0) return;

    if (activeReservation) {
      const dishesToAdd = cartItems.map(item => ({
        dish: item.dish,
        quantity: item.quantity,
        specialNotes: item.notes || 'Gọi thêm tại bàn',
      }));

      addDishesToReservation(activeReservation.id, dishesToAdd);
      setReservations(getStoredReservations());
      setTables(getStoredTables());
    }

    setCart({});
    setOrderSubmittedSuccess(true);
    if (onDishesAdded) onDishesAdded();

    setTimeout(() => {
      setOrderSubmittedSuccess(false);
      setActiveTab('running_tab');
    }, 2000);
  };

  // Filtered menu
  const filteredDishes = menuItems.filter(dish => {
    const matchesCategory = selectedCategory === 'all' || dish.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/85 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-stone-100 p-5 sm:p-6 pb-5 border-b border-stone-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                    Cổng Tự Phục Vụ Tại Bàn
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif-heading text-amber-100">
                  {currentTable?.name || 'Bàn Ăn'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Table Switcher */}
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="bg-stone-800 text-amber-300 text-xs font-semibold px-3 py-2 rounded-xl border border-stone-700 cursor-pointer focus:outline-hidden"
              >
                {tables.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.area.toUpperCase()})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-stone-400 hover:text-white bg-stone-800/80 hover:bg-stone-800 transition cursor-pointer"
                title="Đóng cổng phục vụ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Reservation Info Bar */}
          <div className="mt-4 pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between text-xs text-stone-300 gap-2">
            <div className="flex items-center gap-4">
              <span>Mã bàn: <strong className="text-amber-300">{currentTable?.id}</strong></span>
              <span>Khu vực: <strong className="text-stone-100 uppercase">{currentTable?.area}</strong></span>
              {activeReservation ? (
                <>
                  <span>Khách: <strong className="text-stone-100">{activeReservation.customerName}</strong></span>
                  <span>Mã đặt: <strong className="text-amber-300 font-mono">{activeReservation.bookingCode}</strong></span>
                </>
              ) : (
                <span className="text-amber-400/80 italic">(Khách gọi trực tiếp tại bàn)</span>
              )}
            </div>

            {activeReservation && onOpenReviewModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReviewModal(activeReservation);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Đánh Giá Bữa Ăn</span>
              </button>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('service_bell')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'service_bell'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-stone-800/70 text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Chuông Gọi Phục Vụ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('order_dishes')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'order_dishes'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-stone-800/70 text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Gọi Thêm Món & Rượu</span>
              {cartItems.length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {cartItems.reduce((acc, c) => acc + c.quantity, 0)}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('running_tab')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'running_tab'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-stone-800/70 text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Hóa Đơn & Món Đã Phục Vụ</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {requestSentSuccess && (
          <div className="bg-emerald-500 text-white px-5 py-2.5 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{requestSentSuccess}</span>
            </div>
            <span className="text-[11px] opacity-80">Âm thanh chuông báo đã kích hoạt</span>
          </div>
        )}

        {/* Tab 1: Service Bell */}
        {activeTab === 'service_bell' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div>
              <h3 className="text-base font-bold text-stone-900 mb-1">
                Yêu Cầu Nhân Viên Phục Vụ Nhanh (1-Chạm)
              </h3>
              <p className="text-xs text-stone-500">
                Nhấn vào nút tương ứng, tín hiệu chuông sẽ reo và gửi ngay lập tức tới bộ phận sảnh & phục vụ bàn.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {serviceOptions.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => handleCallService(opt.type)}
                  className="p-4 rounded-2xl border-2 border-stone-200 hover:border-amber-500 hover:bg-amber-50/50 bg-white text-left transition-all duration-200 group shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                      {opt.icon}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                      Bấm Gọi
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm group-hover:text-amber-900">
                      {opt.title}
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">
                      {opt.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Request Box */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <label className="text-xs font-bold text-stone-700 block">
                Yêu cầu khác hoặc ghi chú riêng cho nhân viên bàn:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customRequestNote}
                  onChange={(e) => setCustomRequestNote(e.target.value)}
                  placeholder="Ví dụ: Cần thêm 2 ghế trẻ em, mở rượu vang để thở trước 15 phút..."
                  className="flex-1 text-sm bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleCallService('other', customRequestNote)}
                  disabled={!customRequestNote.trim()}
                  className="py-2.5 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-amber-300 font-bold text-xs transition cursor-pointer"
                >
                  Gửi Yêu Cầu
                </button>
              </div>
            </div>

            {/* Recent service calls of this table */}
            {tableRequests.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Lịch Sử Bấm Chuông Bàn Này ({tableRequests.length})
                  </h4>
                  <span className="text-[11px] text-stone-600">Tự động cập nhật trạng thái</span>
                </div>

                <div className="space-y-2">
                  {tableRequests.slice(0, 5).map((req) => (
                    <div
                      key={req.id}
                      className="p-3 rounded-xl bg-white border border-stone-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">
                          {serviceOptions.find(o => o.type === req.type)?.icon || '🛎️'}
                        </span>
                        <div>
                          <strong className="text-stone-900">
                            {serviceOptions.find(o => o.type === req.type)?.title || 'Yêu cầu phục vụ'}
                          </strong>
                          {req.customNote && (
                            <span className="text-stone-500 block text-[11px]">
                              "{req.customNote}"
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        {req.status === 'pending' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 animate-spin" /> Đang chờ nhân viên
                          </span>
                        )}
                        {req.status === 'acknowledged' && (
                          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Đã tiếp nhận ({req.assignedStaffName || 'Nhân viên sảnh'})
                          </span>
                        )}
                        {req.status === 'completed' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Đã hoàn tất
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Order Dishes Directly */}
        {activeTab === 'order_dishes' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Menu List */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 border-r border-stone-200">
              {/* Category Pills & Search */}
              <div className="flex flex-col sm:flex-row gap-2 justify-between">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {(['all', 'appetizer', 'main', 'seafood', 'dessert', 'beverage'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition ${
                        selectedCategory === cat
                          ? 'bg-stone-900 text-amber-300'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {cat === 'all' ? 'Tất Cả' :
                       cat === 'appetizer' ? 'Khai Vị' :
                       cat === 'main' ? 'Món Chính' :
                       cat === 'seafood' ? 'Hải Sản' :
                       cat === 'dessert' ? 'Tráng Miệng' : 'Rượu & Đồ Uống'}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm món, rượu vang..."
                    className="pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden w-full sm:w-48"
                  />
                </div>
              </div>

              {/* Dish Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredDishes.map((dish) => {
                  const inCartQty = cart[dish.id]?.quantity || 0;
                  return (
                    <div
                      key={dish.id}
                      className="p-3 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 transition flex gap-3 shadow-xs"
                    >
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-stone-900 line-clamp-1">
                            {dish.name}
                          </h4>
                          <span className="text-amber-700 font-extrabold text-xs block mt-0.5">
                            {formatVND(dish.price)}
                          </span>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            {dish.description}
                          </p>
                        </div>

                        {/* Quantity picker */}
                        <div className="flex items-center justify-end gap-1.5 mt-2">
                          {inCartQty > 0 ? (
                            <div className="flex items-center gap-2 bg-stone-100 px-2 py-0.5 rounded-lg border border-stone-300">
                              <button
                                type="button"
                                onClick={() => updateCartQty(dish, -1)}
                                className="text-stone-700 hover:text-rose-600 font-bold text-xs cursor-pointer p-0.5"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-bold text-stone-900 min-w-[16px] text-center">
                                {inCartQty}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(dish, 1)}
                                className="text-stone-700 hover:text-emerald-600 font-bold text-xs cursor-pointer p-0.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => updateCartQty(dish, 1)}
                              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Thêm Món</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart Panel */}
            <div className="w-full md:w-80 bg-stone-50 p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-stone-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-amber-600" />
                    <span>Món Gọi Thêm ({cartItems.reduce((acc, c) => acc + c.quantity, 0)})</span>
                  </h4>
                  {cartItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCart({})}
                      className="text-[11px] text-rose-600 hover:underline cursor-pointer font-semibold"
                    >
                      Xóa giỏ
                    </button>
                  )}
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-10 text-stone-400 text-xs">
                    Chưa có món nào được chọn.<br />Vui lòng bấm "Thêm Món" từ thực đơn bên trái.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div
                        key={item.dish.id}
                        className="p-2.5 rounded-xl bg-white border border-stone-200 text-xs space-y-1.5"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-stone-900 block">{item.dish.name}</strong>
                            <span className="text-amber-700 font-bold">{formatVND(item.dish.price)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.dish, -1)}
                              className="w-5 h-5 rounded-md bg-stone-100 flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <span className="font-bold w-4 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.dish, 1)}
                              className="w-5 h-5 rounded-md bg-stone-100 flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCart(prev => ({
                              ...prev,
                              [item.dish.id]: { ...prev[item.dish.id], notes: val },
                            }));
                          }}
                          placeholder="Ghi chú (tái vừa, không hành...)"
                          className="w-full text-[11px] bg-stone-50 border border-stone-200 rounded-lg px-2 py-1"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              <div className="pt-4 border-t border-stone-200 space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-stone-700">Tạm tính gọi thêm:</span>
                  <span className="text-amber-700 text-base font-extrabold">{formatVND(cartTotal)}</span>
                </div>

                <button
                  type="button"
                  onClick={handleSendOrderToKitchen}
                  disabled={cartItems.length === 0}
                  className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <Utensils className="w-4 h-4" />
                  <span>Gửi Món Xuống Bếp & Quầy Bar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Running Tab / Hóa Đơn & Món Đã Gọi */}
        {activeTab === 'running_tab' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-2">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Danh Sách Món Đang Phục Vụ Tại {currentTable?.name}
                </h3>
                <p className="text-xs text-stone-500">
                  Toàn bộ món ăn đã đặt trước và món gọi thêm đã được chuyển xuống bếp.
                </p>
              </div>

              {activeReservation && (
                <div className="bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-900">
                  Tổng Hóa Đơn Tạm Tính: <span className="text-amber-700 font-extrabold text-sm ml-1">{formatVND(activeReservation.totalAmount)}</span>
                </div>
              )}
            </div>

            {activeReservation && activeReservation.selectedDishes && activeReservation.selectedDishes.length > 0 ? (
              <div className="space-y-2.5">
                {activeReservation.selectedDishes.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.dish.image}
                        alt={item.dish.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-stone-900">{item.dish.name}</h4>
                        <span className="text-[11px] text-stone-500">
                          {formatVND(item.dish.price)} x {item.quantity}
                          {item.meatDoneness && ` • Độ chín: ${item.meatDoneness}`}
                        </span>
                        {item.specialNotes && (
                          <span className="text-[10px] text-amber-700 block italic">
                            Ghi chú: {item.specialNotes}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-stone-900 text-xs">
                        {formatVND(item.dish.price * item.quantity)}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold block flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3 h-3" /> Đã gửi bếp
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-500 text-xs">
                Chưa có món ăn nào được ghi nhận cho bàn này.<br />
                Chuyển qua tab "Gọi Thêm Món & Rượu" để gọi món trực tiếp.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
