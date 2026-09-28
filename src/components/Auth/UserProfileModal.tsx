import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Armchair, 
  Award, 
  Gift, 
  Heart, 
  Lock, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Sparkles, 
  Download, 
  Trash2, 
  ChevronRight, 
  Plus,
  Utensils,
  Eye,
  ShieldCheck,
  Tag,
  QrCode
} from 'lucide-react';
import { UserAccount, Reservation, MenuItem } from '../../types';
import { INITIAL_VOUCHERS, MENU_ITEMS } from '../../data/mockData';
import { CheckInBillModal } from '../BookingFlow/CheckInBillModal';
import { 
  formatVND, 
  updateUserProfile, 
  changeUserPassword, 
  downloadIcsCalendar, 
  updateReservationStatus,
  toggleFavoriteDish 
} from '../../services/storage';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  reservations: Reservation[];
  onUserUpdated: (updatedUser: UserAccount) => void;
  onLogout: () => void;
  onSelectReservationForPreview?: (reservation: Reservation) => void;
  onAddDishToCart?: (dish: MenuItem) => void;
  initialTab?: 'history' | 'rewards' | 'favorites' | 'profile';
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  reservations,
  onUserUpdated,
  onLogout,
  onSelectReservationForPreview,
  onAddDishToCart,
  initialTab = 'history',
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'rewards' | 'favorites' | 'profile'>(initialTab);

  // Profile edit state
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone);
  const [editDietary, setEditDietary] = useState(currentUser.dietaryPreferences || '');
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Voucher copied state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Selected reservation for Check-in bill
  const [selectedCheckInRes, setSelectedCheckInRes] = useState<Reservation | null>(null);

  // Filter reservations matching user
  const userEmail = (currentUser?.email || '').trim().toLowerCase();
  const userPhone = (currentUser?.phone || '').replace(/\s+/g, '');

  const userReservations = (reservations || []).filter((r) => {
    if (!r) return false;
    const matchId = Boolean(currentUser?.id && r.userId === currentUser.id);
    const matchEmail = Boolean(userEmail && (r.customerEmail || '').trim().toLowerCase() === userEmail);
    const matchPhone = Boolean(userPhone && (r.customerPhone || '').replace(/\s+/g, '') === userPhone);
    return matchId || matchEmail || matchPhone;
  });

  // Favorite dishes
  const favoriteDishes = MENU_ITEMS.filter(item => (currentUser.favoriteDishIds || []).includes(item.id));

  if (!isOpen) return null;

  // Handle profile info update
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    if (!editName.trim() || !editPhone.trim()) {
      setProfileMessage({ type: 'error', text: 'Họ tên và số điện thoại không được để trống!' });
      return;
    }

    const updated = updateUserProfile(currentUser.id, {
      name: editName.trim(),
      phone: editPhone.trim(),
      dietaryPreferences: editDietary.trim(),
    });

    if (updated) {
      onUserUpdated(updated);
      setProfileMessage({ type: 'success', text: 'Cập nhật thông tin tài khoản thành công!' });
      setTimeout(() => setProfileMessage(null), 3000);
    }
  };

  // Handle password change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!oldPassword || !newPassword) {
      setPasswordMessage({ type: 'error', text: 'Vui lòng nhập mật khẩu cũ và mật khẩu mới!' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu mới tối thiểu phải từ 6 ký tự!' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
      return;
    }

    const res = changeUserPassword(currentUser.id, oldPassword, newPassword);
    if (res.success) {
      setPasswordMessage({ type: 'success', text: res.message });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(null), 3500);
    } else {
      setPasswordMessage({ type: 'error', text: res.message });
    }
  };

  // Handle cancel reservation
  const handleCancelReservation = (reservationId: string) => {
    if (window.confirm('Quý khách có chắc chắn muốn hủy đơn đặt bàn này không?')) {
      const res = updateReservationStatus(reservationId, 'cancelled');
      if (res.updated) {
        // Trigger rerender via reload or storage event
        window.dispatchEvent(new Event('storage'));
      }
    }
  };

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleFavorite = (dishId: string) => {
    const updated = toggleFavoriteDish(currentUser.id, dishId);
    if (updated) {
      onUserUpdated(updated);
    }
  };

  // Calculate tier progress
  const points = currentUser.loyaltyPoints || 0;
  let nextTierName = 'Vàng';
  let pointsToNext = Math.max(0, 400 - points);
  let progressPercent = Math.min(100, Math.round((points / 400) * 100));

  if (currentUser.membershipTier === 'Vàng') {
    nextTierName = 'Kim Cương';
    pointsToNext = Math.max(0, 1500 - points);
    progressPercent = Math.min(100, Math.round(((points - 400) / 1100) * 100));
  } else if (currentUser.membershipTier === 'Kim Cương') {
    nextTierName = 'Đẳng Cấp Tối Thượng';
    pointsToNext = 0;
    progressPercent = 100;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden relative my-4 flex flex-col max-h-[92vh]">
        
        {/* Top Header Card with User info */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-stone-100 p-6 border-b border-stone-800 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-amber-600 text-stone-950 font-serif-heading font-bold text-2xl flex items-center justify-center border-2 border-amber-400/40 shadow-lg">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-stone-950 border border-stone-900 shadow">
                  {currentUser.membershipTier}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif-heading text-xl sm:text-2xl font-bold text-stone-100">
                    {currentUser.name}
                  </h2>
                  {currentUser.role === 'admin' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      Quản Trị Viên
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-stone-500" /> {currentUser.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-stone-500" /> {currentUser.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Points pill */}
            <div className="bg-stone-800/90 border border-amber-500/30 rounded-2xl p-3 sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2">
              <div className="text-left sm:text-right">
                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold block">
                  Điểm Tích Lũy
                </span>
                <span className="text-2xl font-extrabold text-white font-serif-heading">
                  {currentUser.loyaltyPoints.toLocaleString('vi-VN')} <span className="text-sm font-sans font-normal text-stone-300">điểm</span>
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                <Award className="w-3 h-3 text-amber-400" /> Hạng {currentUser.membershipTier}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 shrink-0 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-amber-600 text-amber-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Lịch Sử Đặt Bàn ({userReservations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'rewards'
                ? 'border-amber-600 text-amber-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Gift className="w-4 h-4 text-amber-600" />
            <span>Thành Viên & Ưu Đãi</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'border-amber-600 text-amber-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Món Yêu Thích ({favoriteDishes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-amber-600 text-amber-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Hồ Sơ & Bảo Mật</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: RESERVATION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {userReservations.length === 0 ? (
                <div className="text-center py-12 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-400 flex items-center justify-center mx-auto">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif-heading font-bold text-base text-stone-800">
                    Chưa Có Lịch Sử Đặt Bàn Nào
                  </h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Tài khoản của quý khách chưa có đơn đặt bàn nào tại Le Gourmet Bistro. Hãy đặt bàn ngay để trải nghiệm ẩm thực thượng hạng!
                  </p>
                  <button
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-stone-950 font-bold rounded-xl text-xs shadow transition-all"
                  >
                    <span>Đặt Bàn Ngay</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {userReservations.map((res) => {
                    const statusConfig = {
                      confirmed: { label: 'Đã xác nhận', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                      pending: { label: 'Chờ duyệt', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
                      seated: { label: 'Đang phục vụ', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
                      completed: { label: 'Đã hoàn tất', bg: 'bg-stone-100 text-stone-700 border-stone-200' },
                      cancelled: { label: 'Đã hủy', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
                    }[res.status] || { label: res.status, bg: 'bg-stone-100 text-stone-700 border-stone-200' };

                    return (
                      <div
                        key={res.id}
                        className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm hover:border-amber-300 transition-all space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg text-xs">
                              #{res.bookingCode}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusConfig.bg}`}>
                              {statusConfig.label}
                            </span>
                            {res.pointsEarned && res.pointsEarned > 0 && (
                              <span className="text-[11px] text-amber-800 font-bold bg-amber-100/80 px-2 py-0.5 rounded-full">
                                +{res.pointsEarned} điểm
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-stone-500">
                            Ngày tạo: {new Date(res.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        </div>

                        {/* Booking Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="bg-stone-50 p-2.5 rounded-xl">
                            <span className="text-stone-400 block text-[10px]">Ngày & Giờ Đến</span>
                            <span className="font-bold text-stone-800 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3.5 h-3.5 text-amber-600" />
                              {res.bookingDate} lúc {res.arrivalTime}
                            </span>
                          </div>

                          <div className="bg-stone-50 p-2.5 rounded-xl">
                            <span className="text-stone-400 block text-[10px]">Bàn & Số Khách</span>
                            <span className="font-bold text-stone-800 flex items-center gap-1 mt-0.5">
                              <Armchair className="w-3.5 h-3.5 text-amber-600" />
                              {res.tableName} ({res.guestCount} người)
                            </span>
                          </div>

                          <div className="bg-stone-50 p-2.5 rounded-xl">
                            <span className="text-stone-400 block text-[10px]">Món Chọn Trước</span>
                            <span className="font-bold text-stone-800 block mt-0.5">
                              {res.selectedDishes?.length > 0 
                                ? `${res.selectedDishes.length} món (${formatVND(res.preOrderTotal)})`
                                : 'Chọn tại bàn'}
                            </span>
                          </div>

                          <div className="bg-stone-50 p-2.5 rounded-xl">
                            <span className="text-stone-400 block text-[10px]">Tổng Hóa Đơn Dự Kiến</span>
                            <span className="font-bold text-amber-700 block mt-0.5 text-sm font-mono">
                              {formatVND(res.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Special requests if any */}
                        {res.specialRequests && (
                          <p className="text-xs text-stone-600 italic bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                            Yêu cầu: "{res.specialRequests}"
                          </p>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedCheckInRes(res)}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Phiếu Check-in & Bill</span>
                            </button>

                            {onSelectReservationForPreview && (
                              <button
                                onClick={() => onSelectReservationForPreview(res)}
                                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-stone-600" />
                                <span>Xem Vé Email</span>
                              </button>
                            )}

                            <button
                              onClick={() => downloadIcsCalendar(res)}
                              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Tải lịch hẹn lưu vào Apple Calendar / Google Calendar"
                            >
                              <Download className="w-3.5 h-3.5 text-stone-600" />
                              <span>Lưu Lịch (.ics)</span>
                            </button>
                          </div>

                          {(res.status === 'pending' || res.status === 'confirmed') && (
                            <button
                              onClick={() => handleCancelReservation(res.id)}
                              className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hủy Đặt Bàn</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LOYALTY & REWARDS */}
          {activeTab === 'rewards' && (
            <div className="space-y-6">
              {/* Tier Status Card */}
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                      <Award className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <div>
                      <h4 className="font-serif-heading font-bold text-base text-stone-900">
                        Cấp Bậc Thành Viên: Hạng {currentUser.membershipTier}
                      </h4>
                      <p className="text-xs text-stone-600">
                        Quý khách đang sở hữu <strong className="text-amber-700 font-bold">{points} điểm</strong> tích lũy
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {currentUser.membershipTier !== 'Kim Cương' ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-stone-600 font-medium">
                      <span>Tiến độ lên hạng {nextTierName}</span>
                      <span>Còn {pointsToNext} điểm nữa</span>
                    </div>
                    <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-100/60 rounded-xl text-xs text-amber-900 font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Quý khách đã đạt hạng <strong>Kim Cương</strong> cao nhất với đặc quyền ưu tiên tối đa!</span>
                  </div>
                )}

                {/* Member Perks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-800 block mb-1">🎁 Tích Điểm Tự Động</span>
                    <span className="text-stone-500 text-[11px]">Tích lũy 1 điểm cho mỗi 10.000đ hóa đơn đặt món.</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-800 block mb-1">🍷 Quà Tặng Sinh Nhật</span>
                    <span className="text-stone-500 text-[11px]">Tặng rượu vang hoặc món tráng miệng khi tổ chức sinh nhật.</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-800 block mb-1">⭐ Ưu Tiên Giữ Bàn VIP</span>
                    <span className="text-stone-500 text-[11px]">Ưu tiên chọn bàn đẹp view sông và phòng VIP riêng tư.</span>
                  </div>
                </div>
              </div>

              {/* Vouchers list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif-heading font-bold text-base text-stone-900 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-600" />
                    Mã Ưu Đãi Đang Áp Dụng Cho Thành Viên
                  </h4>
                  <span className="text-xs text-stone-500">Áp dụng trực tiếp tại bước xác nhận đặt bàn</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INITIAL_VOUCHERS.map((voucher) => (
                    <div
                      key={voucher.code}
                      className="bg-white border border-stone-200 hover:border-amber-300 rounded-2xl p-4 shadow-sm space-y-2.5 relative transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-900 font-mono font-bold text-xs border border-amber-500/30">
                            {voucher.code}
                          </span>
                          <h5 className="font-bold text-stone-900 text-xs sm:text-sm mt-1.5">
                            {voucher.title}
                          </h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyVoucher(voucher.code)}
                          className="p-1.5 text-stone-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Sao chép mã"
                        >
                          {copiedCode === voucher.code ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-stone-500 leading-relaxed">
                        {voucher.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-100 pt-2">
                        <span>Hạn dùng: {voucher.expiryDate}</span>
                        {voucher.tierRequired && (
                          <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                            Hạng {voucher.tierRequired}+
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FAVORITE DISHES */}
          {activeTab === 'favorites' && (
            <div className="space-y-4">
              {favoriteDishes.length === 0 ? (
                <div className="text-center py-12 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-400 flex items-center justify-center mx-auto">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif-heading font-bold text-base text-stone-800">
                    Chưa Có Món Yêu Thích Nào Được Lưu
                  </h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Khi xem thực đơn, nhấn vào biểu tượng trái tim để lưu lại những món ăn yêu thích giúp quý khách đặt nhanh cho lần tới!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {favoriteDishes.map((dish) => (
                    <div
                      key={dish.id}
                      className="bg-white border border-stone-200 rounded-2xl p-3.5 flex gap-3 shadow-sm hover:border-amber-300 transition-all relative group"
                    >
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h5 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                              {dish.name}
                            </h5>
                            <button
                              type="button"
                              onClick={() => handleToggleFavorite(dish.id)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                              title="Bỏ thích"
                            >
                              <Heart className="w-4 h-4 fill-rose-500" />
                            </button>
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            {dish.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100">
                          <span className="font-bold text-amber-700 text-xs font-mono">
                            {formatVND(dish.price)}
                          </span>

                          {onAddDishToCart && (
                            <button
                              type="button"
                              onClick={() => {
                                onAddDishToCart(dish);
                                onClose();
                              }}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-stone-950 font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3 stroke-[3]" />
                              <span>Thêm món</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE & SECURITY */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Edit Form */}
              <div className="bg-stone-50/70 border border-stone-200 rounded-2xl p-5 space-y-4">
                <h4 className="font-serif-heading font-bold text-base text-stone-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-600" />
                  Thông Tin Cá Nhân
                </h4>

                {profileMessage && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {profileMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{profileMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Địa chỉ Email (Cố định gắn với tài khoản)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Ghi chú khẩu vị ẩm thực / Dị ứng thức ăn
                    </label>
                    <textarea
                      rows={2}
                      value={editDietary}
                      onChange={(e) => setEditDietary(e.target.value)}
                      placeholder="ví dụ: Không ăn hành, dị ứng đậu phộng, thích vị trí yên tĩnh..."
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-stone-950 font-bold rounded-xl text-xs shadow transition-all"
                  >
                    Lưu Thay Đổi Thông Tin
                  </button>
                </form>
              </div>

              {/* Password Change Form */}
              <div className="bg-stone-50/70 border border-stone-200 rounded-2xl p-5 space-y-4">
                <h4 className="font-serif-heading font-bold text-base text-stone-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" />
                  Đổi Mật Khẩu Đăng Nhập
                </h4>

                {passwordMessage && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {passwordMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{passwordMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Mặc định: 123456"
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Mật khẩu mới</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự"
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu"
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="py-2 px-4 bg-stone-800 hover:bg-stone-900 text-stone-100 font-semibold rounded-xl text-xs transition-all"
                  >
                    Cập Nhật Mật Khẩu
                  </button>
                </form>
              </div>

              {/* Logout Button */}
              <div className="pt-2 border-t border-stone-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Quý khách có chắc muốn đăng xuất khỏi tài khoản không?')) {
                      onLogout();
                      onClose();
                    }
                  }}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng Xuất Tài Khoản</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Check-In Bill Modal for History */}
        {selectedCheckInRes && (
          <CheckInBillModal
            reservation={selectedCheckInRes}
            onClose={() => setSelectedCheckInRes(null)}
            onOpenEmailPreview={onSelectReservationForPreview}
          />
        )}
      </div>
    </div>
  );
};
