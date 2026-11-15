import React, { useState } from 'react';
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  Clock, 
  Utensils, 
  Receipt, 
  Users, 
  CalendarClock, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  Building2, 
  Crown, 
  Trees, 
  Wine,
  Armchair,
  Check,
  Printer,
  ChevronRight,
  ClipboardCheck,
  Send,
  ChefHat,
  Bell,
  Mail
} from 'lucide-react';
import { Reservation, RestaurantTable, TableStatus, ReservationStatus, UserAccount, TableServiceRequest } from '../../types';
import { formatVND, getStoredTableServiceRequests, updateTableServiceRequestStatus } from '../../services/storage';
import { CheckInBillModal } from '../BookingFlow/CheckInBillModal';
import { TableOrderModal } from './TableOrderModal';
import { TableCheckoutModal } from './TableCheckoutModal';

interface StaffOperationsHubProps {
  reservations: Reservation[];
  tables: RestaurantTable[];
  currentUser?: UserAccount | null;
  onStatusChange: (reservationId: string, status: ReservationStatus) => void;
  onUpdateTableStatus: (tableId: string, status: TableStatus) => void;
  onSaveDishesAtTable: (reservationId: string, dishesToAdd: any[]) => void;
  onConfirmCheckout: (reservationId: string, paymentDetails: any) => void;
  onOpenManualBooking: () => void;
  onOpenKDS?: () => void;
  onOpenEmailPreview?: (reservation: Reservation) => void;
  onOpenEmailInbox?: () => void;
}

export const StaffOperationsHub: React.FC<StaffOperationsHubProps> = ({
  reservations,
  tables,
  currentUser,
  onStatusChange,
  onUpdateTableStatus,
  onSaveDishesAtTable,
  onConfirmCheckout,
  onOpenManualBooking,
  onOpenKDS,
  onOpenEmailPreview,
  onOpenEmailInbox,
}) => {
  const [fastSearchQuery, setFastSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'today_all' | 'confirmed' | 'seated' | 'completed'>('today_all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  
  // Modals state
  const [selectedCheckInRes, setSelectedCheckInRes] = useState<Reservation | null>(null);
  const [orderingRes, setOrderingRes] = useState<Reservation | null>(null);
  const [checkoutRes, setCheckoutRes] = useState<Reservation | null>(null);

  // Table Service Requests
  const [serviceRequests, setServiceRequests] = useState<TableServiceRequest[]>(() => getStoredTableServiceRequests());

  React.useEffect(() => {
    const handleUpdated = (e: any) => {
      if (e.detail) setServiceRequests(e.detail);
    };
    window.addEventListener('restaurant:service_requests_updated', handleUpdated);
    return () => window.removeEventListener('restaurant:service_requests_updated', handleUpdated);
  }, []);

  const activeServiceCalls = serviceRequests.filter(r => r.status !== 'completed');

  const handleAcknowledgeCall = (reqId: string) => {
    const updated = updateTableServiceRequestStatus(reqId, 'acknowledged', currentUser?.name || 'Nhân viên trực');
    setServiceRequests(updated);
  };

  const handleCompleteCall = (reqId: string) => {
    const updated = updateTableServiceRequestStatus(reqId, 'completed', currentUser?.name || 'Nhân viên trực');
    setServiceRequests(updated);
  };

  // Shift handover notes
  const [shiftNote, setShiftNote] = useState('');
  const [shiftNotesList, setShiftNotesList] = useState<string[]>([
    'Bàn VIP Hoàng Gia lúc 19:30 có yêu cầu chuẩn bị thêm ghế trẻ em và nến sinh nhật.',
    'Kho đồ uống đã nhập thêm 2 thùng Vang Bordeaux Reserve sẵn sàng cho ca tối.',
  ]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayReservations = reservations.filter(r => r.bookingDate === todayStr && r.status !== 'cancelled');

  // Filtered reservations for today
  const filteredArrivals = todayReservations.filter(r => {
    // Search query
    const q = fastSearchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      r.bookingCode.toLowerCase().includes(q) ||
      r.customerPhone.includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.tableName.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterTab === 'confirmed') return r.status === 'confirmed';
    if (filterTab === 'seated') return r.status === 'seated';
    if (filterTab === 'completed') return r.status === 'completed';
    return true;
  });

  // Fast search single hit (for instant check-in banner)
  const singleMatch = fastSearchQuery.trim().length >= 3
    ? reservations.find(r => 
        (r.bookingCode.toLowerCase() === fastSearchQuery.trim().toLowerCase() ||
         r.bookingCode.toLowerCase() === `#${fastSearchQuery.trim().toLowerCase()}` ||
         r.customerPhone === fastSearchQuery.trim()) &&
        r.status !== 'cancelled'
      )
    : null;

  // Stats for the shift
  const seatedCount = tables.filter(t => t.status === 'occupied').length;
  const availableCount = tables.filter(t => t.status === 'available').length;
  const cleaningCount = tables.filter(t => t.status === 'cleaning').length;
  const completedTodayCount = todayReservations.filter(r => r.status === 'completed').length;
  const shiftRevenue = todayReservations
    .filter(r => r.status === 'completed' || r.status === 'seated')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  // Instant Check-in Action
  const handleFastCheckIn = (res: Reservation) => {
    onStatusChange(res.id, 'seated');
    // Also trigger check-in pass modal to print
    setSelectedCheckInRes({ ...res, status: 'seated' });
  };

  const handleAddShiftNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftNote.trim()) return;
    const author = currentUser?.name || 'Nhân viên trực ca';
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setShiftNotesList([`[${time} - ${author}]: ${shiftNote.trim()}`, ...shiftNotesList]);
    setShiftNote('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Shift Overview Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 text-stone-100 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Cổng Vận Hành Dành Cho Nhân Viên • Staff Service Hub</span>
            </div>
            <h2 className="font-serif-heading text-xl sm:text-2xl font-bold text-stone-100">
              Quầy Tiếp Tân & Điều Phối Bàn Trực Tiếp
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Tiếp đón khách, quét mã QR check-in, cập nhật tình trạng bàn và gọi món tại bàn theo thời gian thực.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenEmailInbox && (
              <button
                type="button"
                onClick={onOpenEmailInbox}
                className="px-3.5 py-2.5 rounded-xl bg-stone-850 hover:bg-stone-750 text-stone-100 font-bold text-xs flex items-center gap-1.5 border border-stone-700/80 shadow-md cursor-pointer transition"
                title="Xem toàn bộ nhật ký email đã gửi (cũ & mới)"
              >
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Hộp Thư Email</span>
              </button>
            )}

            {onOpenKDS && (
              <button
                type="button"
                onClick={onOpenKDS}
                className="px-3.5 py-2.5 rounded-xl bg-stone-850 hover:bg-stone-750 text-amber-400 font-bold text-xs flex items-center gap-1.5 border border-stone-700/80 shadow-md cursor-pointer transition"
                title="Mở màn hình Bếp & Bar (Kitchen Display System)"
              >
                <ChefHat className="w-4 h-4 text-amber-500" />
                <span>Màn Hình Bếp (KDS)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenManualBooking}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition"
            >
              <CalendarClock className="w-4 h-4" />
              <span>Thêm Đặt Bàn Nhanh Tại Quầy</span>
            </button>
          </div>
        </div>

        {/* 4 Shift Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="bg-stone-850/80 p-3 rounded-2xl border border-stone-800">
            <span className="text-stone-400">Khách Đến Hôm Nay:</span>
            <div className="text-lg font-extrabold text-stone-100 mt-0.5">
              {todayReservations.length} lượt bàn
            </div>
          </div>
          <div className="bg-stone-850/80 p-3 rounded-2xl border border-stone-800">
            <span className="text-stone-400">Bàn Đang Phục Vụ:</span>
            <div className="text-lg font-extrabold text-blue-400 mt-0.5">
              {seatedCount} bàn đang ngồi
            </div>
          </div>
          <div className="bg-stone-850/80 p-3 rounded-2xl border border-stone-800">
            <span className="text-stone-400">Bàn Cần Dọn Dẹp:</span>
            <div className="text-lg font-extrabold text-amber-400 mt-0.5">
              {cleaningCount} bàn đang dọn
            </div>
          </div>
          <div className="bg-stone-850/80 p-3 rounded-2xl border border-stone-800">
            <span className="text-stone-400">Doanh Số Phục Vụ Ca:</span>
            <div className="text-lg font-extrabold text-emerald-400 mt-0.5">
              {formatVND(shiftRevenue)}
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE TABLE SERVICE CALLS WIDGET */}
      {activeServiceCalls.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border-2 border-rose-300 shadow-md animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <span>Chuông Yêu Cầu Phục Vụ Tại Bàn</span>
                  <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                    {activeServiceCalls.length} bàn gọi
                  </span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  Thực khách bấm chuông gọi từ cổng tự phục vụ tại bàn hoặc hóa đơn điện tử
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeServiceCalls.map((call) => (
              <div
                key={call.id}
                className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 flex flex-col justify-between text-xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-stone-900 text-sm block">
                      {call.tableName}
                    </span>
                    <span className="text-[11px] font-bold text-rose-700">
                      {call.type === 'water_ice' ? '🧊 Tiếp Nước & Thêm Đá' :
                       call.type === 'sommelier' ? '🍷 Tư Vấn Rượu Vang' :
                       call.type === 'cutlery' ? '🥢 Đổi Dao Dĩa & Đĩa Mới' :
                       call.type === 'hot_towel' ? '🧼 Khăn Ấm Cao Cấp' :
                       call.type === 'bill_request' ? '💳 Yêu Cầu Thanh Toán' :
                       call.type === 'manager' ? '🛎️ Gặp Quản Lý Sảnh' : '🛎️ Yêu Cầu Phục Vụ'}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                    call.status === 'pending'
                      ? 'bg-rose-200 text-rose-800 animate-pulse'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {call.status === 'pending' ? 'Chờ phục vụ' : 'Đang xử lý'}
                  </span>
                </div>

                {call.customNote && (
                  <p className="text-[11px] text-stone-600 italic bg-white p-2 rounded-lg border border-rose-100">
                    "{call.customNote}"
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-rose-200/60">
                  <span className="text-[10px] text-stone-400">
                    {new Date(call.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {call.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleAcknowledgeCall(call.id)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition cursor-pointer"
                      >
                        Tiếp Nhận
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCompleteCall(call.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition cursor-pointer"
                    >
                      Đã Xong
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUICK CHECK-IN SCANNER & SEARCH BAR */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Tiếp Tân Check-in Nhanh (Tra Cứu Mã / SĐT Khách)
              </h3>
              <p className="text-[11px] text-stone-500">
                Nhập mã đặt bàn (ví dụ: <code className="text-amber-700 font-bold font-mono">BK-1001</code>) hoặc SĐT của khách khi đến quầy
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={fastSearchQuery}
            onChange={(e) => setFastSearchQuery(e.target.value)}
            placeholder="Gõ mã đặt bàn (#BK-...), số điện thoại hoặc tên khách để check-in tức thì..."
            className="w-full bg-stone-50 border border-stone-300 focus:border-amber-600 focus:bg-white rounded-2xl pl-12 pr-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition shadow-inner font-medium"
          />
          {fastSearchQuery && (
            <button
              type="button"
              onClick={() => setFastSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs px-2 py-1 rounded-md bg-stone-200"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Instant Single Match Banner */}
        {singleMatch && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-600 text-stone-950 font-extrabold flex items-center justify-center shrink-0 text-base">
                {singleMatch.guestCount}
                <span className="text-[10px] ml-0.5 font-normal">K</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 text-sm">{singleMatch.customerName}</span>
                  <span className="font-mono text-xs font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md">
                    #{singleMatch.bookingCode}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    singleMatch.status === 'seated'
                      ? 'bg-blue-100 text-blue-800'
                      : singleMatch.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {singleMatch.status === 'seated' ? 'Đang Ngồi Bàn' : singleMatch.status === 'completed' ? 'Đã Thanh Toán' : 'Đã Xác Nhận'}
                  </span>
                </div>
                <div className="text-xs text-stone-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>SĐT: <strong>{singleMatch.customerPhone}</strong></span>
                  <span>•</span>
                  <span>Bàn: <strong className="text-amber-900">{singleMatch.tableName}</strong></span>
                  <span>•</span>
                  <span>Giờ hẹn: <strong>{singleMatch.arrivalTime}</strong> (Ngày {singleMatch.bookingDate})</span>
                  <span>•</span>
                  <span>Món đặt trước: <strong>{singleMatch.selectedDishes?.length || 0} món</strong> ({formatVND(singleMatch.preOrderTotal)})</span>
                </div>
                {singleMatch.specialRequests && (
                  <p className="text-[11px] text-rose-700 bg-rose-50 px-2 py-1 rounded-md mt-1 font-medium">
                    ⚠️ Yêu cầu: {singleMatch.specialRequests}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCheckInRes(singleMatch)}
                className="px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-amber-600" />
                <span>Phiếu Check-in Bill</span>
              </button>

              {onOpenEmailPreview && (
                <button
                  type="button"
                  onClick={() => onOpenEmailPreview(singleMatch)}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Xem nội dung email xác nhận của đơn này"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                  <span>Xem Email</span>
                </button>
              )}

              {singleMatch.status === 'confirmed' && (
                <button
                  type="button"
                  onClick={() => handleFastCheckIn(singleMatch)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Xác Nhận Check-in Vào Bàn</span>
                </button>
              )}

              {singleMatch.status === 'seated' && (
                <>
                  <button
                    type="button"
                    onClick={() => setOrderingRes(singleMatch)}
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition"
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Gọi Thêm Món</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutRes(singleMatch)}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Thu Ngân & Trả Bàn</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* TODAY'S ARRIVALS & ACTIVE SERVICE QUEUE */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-stone-900 text-base">
              Lịch Đón Khách & Phục Vụ Hôm Nay ({todayReservations.length} lượt)
            </h3>
          </div>

          {/* Filter subtabs */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterTab('today_all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filterTab === 'today_all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Tất Cả ({todayReservations.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('confirmed')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filterTab === 'confirmed' ? 'bg-amber-600 text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Chờ Đến ({todayReservations.filter(r => r.status === 'confirmed').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('seated')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filterTab === 'seated' ? 'bg-blue-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Đang Ngồi Bàn ({todayReservations.filter(r => r.status === 'seated').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('completed')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filterTab === 'completed' ? 'bg-emerald-600 text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Đã Xong ({todayReservations.filter(r => r.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Table / List */}
        <div className="overflow-x-auto">
          {filteredArrivals.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              <CalendarClock className="w-10 h-10 mx-auto text-stone-300 mb-2" />
              <span>Không tìm thấy lịch đặt bàn nào phù hợp với bộ lọc này hôm nay.</span>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-500 uppercase text-[11px] font-bold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-3">Giờ Hẹn</th>
                  <th className="py-3 px-3">Mã & Khách Hàng</th>
                  <th className="py-3 px-3">Bàn Ăn</th>
                  <th className="py-3 px-3 text-center">Khách</th>
                  <th className="py-3 px-3">Món Ăn & Tiền</th>
                  <th className="py-3 px-3 text-center">Trạng Thái</th>
                  <th className="py-3 px-3 text-right">Thao Tác Phục Vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {filteredArrivals.map((res) => (
                  <tr key={res.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-3 px-3 font-extrabold text-amber-700 whitespace-nowrap">
                      {res.arrivalTime}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-stone-900">{res.customerName}</div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                        <span className="font-mono text-amber-800 font-semibold">#{res.bookingCode}</span>
                        <span>•</span>
                        <span>{res.customerPhone}</span>
                      </div>
                      {res.occasion && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                          🎉 {res.occasion}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-stone-900">{res.tableName}</span>
                      <span className="block text-[11px] text-stone-500 capitalize">{res.tableArea}</span>
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-stone-900">
                      {res.guestCount}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-stone-900">{formatVND(res.totalAmount)}</div>
                      <div className="text-[11px] text-stone-500">
                        {res.selectedDishes?.length || 0} món
                        {res.depositAmount > 0 && ` (Đã cọc: ${formatVND(res.depositAmount)})`}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        res.status === 'seated'
                          ? 'bg-blue-100 text-blue-800'
                          : res.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {res.status === 'seated' ? 'Đang Phục Vụ' : res.status === 'completed' ? 'Đã Thanh Toán' : 'Đã Xác Nhận'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedCheckInRes(res)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
                          title="In phiếu Check-in & Hóa Đơn Khách"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {onOpenEmailPreview && (
                          <button
                            type="button"
                            onClick={() => onOpenEmailPreview(res)}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition cursor-pointer"
                            title="Xem nội dung Email xác nhận"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {res.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleFastCheckIn(res)}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition shadow-xs"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Vào Bàn</span>
                          </button>
                        )}

                        {res.status === 'seated' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setOrderingRes(res)}
                              className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition shadow-xs"
                              title="Thêm món ăn/đồ uống cho khách tại bàn"
                            >
                              <Utensils className="w-3 h-3" />
                              <span>Thêm Món</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setCheckoutRes(res)}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition shadow-xs"
                              title="Thanh toán hóa đơn và giải phóng bàn"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>Thanh Toán</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* DIRECT TABLE FLOOR BOARD FOR STAFF */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Armchair className="w-5 h-5 text-amber-600" />
              <span>Sơ Đồ Bàn Trực Tuyến & Cập Nhật Trạng Thái Nhanh</span>
            </h3>
            <p className="text-xs text-stone-500">
              Bấm trực tiếp vào bàn để đổi trạng thái bàn phục vụ: Trống • Có Khách • Cần Dọn Dẹp
            </p>
          </div>

          {/* Area filters */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1">
            {['all', 'main', 'vip', 'garden', 'rooftop'].map(area => (
              <button
                key={area}
                type="button"
                onClick={() => setSelectedArea(area)}
                className={`px-3 py-1.5 rounded-xl font-medium capitalize cursor-pointer transition whitespace-nowrap ${
                  selectedArea === area
                    ? 'bg-stone-900 text-amber-400 font-bold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {area === 'all' ? 'Toàn Bộ Phân Khu' : area === 'main' ? 'Sảnh Chính' : area === 'vip' ? 'Phòng VIP' : area === 'garden' ? 'Sân Vườn' : 'Rooftop'}
              </button>
            ))}
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {tables
            .filter(t => selectedArea === 'all' || t.area === selectedArea)
            .map(t => {
              const activeRes = reservations.find(r => r.tableId === t.id && (r.status === 'confirmed' || r.status === 'seated'));
              return (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                    t.status === 'occupied'
                      ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                      : t.status === 'cleaning'
                      ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                      : t.status === 'reserved'
                      ? 'bg-stone-100 border-stone-300 text-stone-800'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-stone-900 truncate">{t.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        t.status === 'occupied'
                          ? 'bg-blue-600 text-white'
                          : t.status === 'cleaning'
                          ? 'bg-amber-600 text-stone-950'
                          : t.status === 'reserved'
                          ? 'bg-stone-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {t.status === 'occupied' ? 'Có Khách' : t.status === 'cleaning' ? 'Đang Dọn' : t.status === 'reserved' ? 'Đã Đặt' : 'Sẵn Sàng'}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-500 mb-2 flex items-center justify-between">
                      <span>Sức chứa: <strong>{t.capacity} chỗ</strong></span>
                      <span className="capitalize">{t.area}</span>
                    </div>

                    {activeRes ? (
                      <div className="p-2 rounded-xl bg-white/80 border border-stone-200/80 mb-2">
                        <div className="font-bold text-stone-900 truncate">{activeRes.customerName}</div>
                        <div className="text-[10px] text-stone-500 flex items-center justify-between mt-0.5">
                          <span>#{activeRes.bookingCode}</span>
                          <span className="font-bold text-amber-700">{activeRes.arrivalTime}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-white/40 text-[10px] text-stone-400 italic mb-2">
                        Chưa có khách đặt
                      </div>
                    )}
                  </div>

                  {/* Quick Action Buttons for Staff */}
                  <div className="pt-2 border-t border-stone-200/60 flex items-center gap-1 justify-between">
                    {t.status === 'cleaning' && (
                      <button
                        type="button"
                        onClick={() => onUpdateTableStatus(t.id, 'available')}
                        className="w-full py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Đã Dọn Xong</span>
                      </button>
                    )}

                    {t.status === 'available' && (
                      <button
                        type="button"
                        onClick={() => onUpdateTableStatus(t.id, 'occupied')}
                        className="w-full py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Xếp Khách Vào</span>
                      </button>
                    )}

                    {t.status === 'occupied' && (
                      <div className="flex items-center gap-1 w-full">
                        {activeRes && (
                          <button
                            type="button"
                            onClick={() => setOrderingRes(activeRes)}
                            className="flex-1 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-[10px] cursor-pointer"
                          >
                            + Món
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onUpdateTableStatus(t.id, 'cleaning')}
                          className="flex-1 py-1 rounded bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-[10px] cursor-pointer"
                        >
                          Dọn Bàn
                        </button>
                      </div>
                    )}

                    {t.status === 'reserved' && (
                      <button
                        type="button"
                        onClick={() => onUpdateTableStatus(t.id, 'occupied')}
                        className="w-full py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Khách Nhận Bàn</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* SHIFT HANDOVER & STAFF NOTES */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs">
        <h3 className="font-bold text-stone-900 text-base flex items-center gap-2 mb-2">
          <ClipboardCheck className="w-5 h-5 text-amber-600" />
          <span>Sổ Nhật Ký Bàn Giao Ca Trực (Shift Handover Notes)</span>
        </h3>
        <p className="text-xs text-stone-500 mb-4">
          Ghi chú bàn giao quan trọng giữa nhân viên phục vụ, lễ tân và thu ngân ca sau.
        </p>

        <form onSubmit={handleAddShiftNote} className="flex gap-2 mb-4">
          <input
            type="text"
            value={shiftNote}
            onChange={(e) => setShiftNote(e.target.value)}
            placeholder="Nhập ghi chú bàn giao ca (VD: Bàn Rooftop 04 cần chuẩn bị hoa hồng lúc 20:00)..."
            className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-4 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:bg-white"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ghi Sổ Ca</span>
          </button>
        </form>

        <div className="space-y-2">
          {shiftNotesList.map((note, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {selectedCheckInRes && (
        <CheckInBillModal
          reservation={selectedCheckInRes}
          onClose={() => setSelectedCheckInRes(null)}
          onOpenEmailPreview={onOpenEmailPreview}
        />
      )}

      {orderingRes && (
        <TableOrderModal
          reservation={orderingRes}
          onClose={() => setOrderingRes(null)}
          onSaveDishes={(dishesToAdd) => {
            onSaveDishesAtTable(orderingRes.id, dishesToAdd);
            setOrderingRes(null);
          }}
        />
      )}

      {checkoutRes && (
        <TableCheckoutModal
          reservation={checkoutRes}
          table={tables.find(t => t.id === checkoutRes.tableId)}
          staffName={currentUser?.name || 'Nhân viên thu ngân'}
          onClose={() => setCheckoutRes(null)}
          onConfirmCheckout={(details) => {
            onConfirmCheckout(checkoutRes.id, details);
            setCheckoutRes(null);
          }}
        />
      )}
    </div>
  );
};
