import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  Calendar, 
  Clock, 
  Armchair, 
  Users, 
  FileText, 
  ChevronLeft, 
  Sparkles, 
  Download, 
  Eye, 
  RotateCcw,
  Check,
  Tag,
  Gift,
  Award,
  LogIn,
  AlertCircle
} from 'lucide-react';
import { SelectedDishItem, RestaurantTable, Reservation, UserAccount, UserVoucher } from '../../types';
import { INITIAL_VOUCHERS } from '../../data/mockData';
import { formatVND, downloadIcsCalendar } from '../../services/storage';
import { CheckInBill } from './CheckInBill';
import { isTimeSlotInPast } from '../../utils/dateTimeUtils';

interface BookingConfirmationProps {
  selectedDate: string;
  selectedTime: string;
  guestCount: number;
  table: RestaurantTable | undefined;
  selectedDishes: SelectedDishItem[];
  selectedOccasion?: string;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: () => void;
  onPrev: () => void;
  onSubmitBooking: (customerData: {
    name: string;
    phone: string;
    email: string;
    specialRequests: string;
    depositAmount: number;
    userId?: string;
    voucherCode?: string;
    discountAmount?: number;
  }) => Promise<Reservation>;
  onOpenEmailPreview: (reservation: Reservation) => void;
  onResetBooking: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  selectedDate,
  selectedTime,
  guestCount,
  table,
  selectedDishes,
  selectedOccasion,
  currentUser,
  onOpenAuthModal,
  onPrev,
  onSubmitBooking,
  onOpenEmailPreview,
  onResetBooking,
}) => {
  // Pre-fill with user info if logged in, or empty for guest
  const [customerName, setCustomerName] = useState(currentUser ? currentUser.name : '');
  const [customerPhone, setCustomerPhone] = useState(currentUser ? currentUser.phone : '');
  const [customerEmail, setCustomerEmail] = useState(currentUser ? currentUser.email : '');
  const [specialRequests, setSpecialRequests] = useState(
    currentUser?.dietaryPreferences || ''
  );
  const [depositOption, setDepositOption] = useState<'none' | 'deposit'>('deposit');

  // Voucher state
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<UserVoucher | null>(null);
  const [voucherError, setVoucherError] = useState('');

  // Update fields when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name);
      setCustomerPhone(currentUser.phone);
      setCustomerEmail(currentUser.email);
      if (currentUser.dietaryPreferences && !specialRequests) {
        setSpecialRequests(currentUser.dietaryPreferences);
      }
    }
  }, [currentUser]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStepText, setSubmittingStepText] = useState('');
  const [completedReservation, setCompletedReservation] = useState<Reservation | null>(null);
  const [timeValidationError, setTimeValidationError] = useState('');

  const preOrderTotal = selectedDishes.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

  // Voucher discount calculation
  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discountPercent) {
      discountAmount = Math.round((preOrderTotal * appliedVoucher.discountPercent) / 100);
    } else if (appliedVoucher.discountAmount) {
      discountAmount = appliedVoucher.discountAmount;
    }
    // Cannot exceed preOrderTotal
    discountAmount = Math.min(preOrderTotal, discountAmount);
  }

  const finalTotal = Math.max(0, preOrderTotal - discountAmount);
  const depositAmount = depositOption === 'deposit' ? (finalTotal > 0 ? Math.round(finalTotal * 0.2 / 10000) * 10000 : 200000) : 0;
  const estimatedPoints = Math.max(20, Math.floor(finalTotal / 10000));

  const handleApplyVoucher = (voucherToApply?: UserVoucher) => {
    setVoucherError('');
    const inputCode = (voucherInput || '').trim().toUpperCase();
    const target = voucherToApply || INITIAL_VOUCHERS.find(v => (v.code || '').toUpperCase() === inputCode);
    
    if (!target) {
      setVoucherError('Mã ưu đãi không hợp lệ hoặc đã hết hạn!');
      return;
    }

    if (preOrderTotal < target.minOrder) {
      setVoucherError(`Đơn thực đơn chọn trước tối thiểu phải từ ${formatVND(target.minOrder)} để áp dụng mã này!`);
      return;
    }

    if (target.tierRequired && currentUser) {
      if (target.tierRequired === 'Vàng' && currentUser.membershipTier === 'Bạc') {
        setVoucherError('Mã này chỉ áp dụng cho thành viên hạng Vàng và Kim Cương!');
        return;
      }
    }

    setAppliedVoucher(target);
    setVoucherInput(target.code);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput('');
    setVoucherError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTimeValidationError('');
    if (!customerName || !customerPhone || !customerEmail) return;

    if (isTimeSlotInPast(selectedTime, selectedDate, 0)) {
      setTimeValidationError(
        `Khung giờ đặt bàn (${selectedTime} ngày ${selectedDate}) đã qua thời điểm hiện tại. Vui lòng quay lại Bước 1 để chọn khung giờ hợp lệ!`
      );
      return;
    }

    setIsSubmitting(true);
    setSubmittingStepText('Đang ghi nhận yêu cầu đặt bàn...');

    setTimeout(() => {
      setSubmittingStepText(
        currentUser
          ? 'Đang tích lũy điểm thưởng & kích hoạt gửi email...'
          : 'Đang khởi tạo mã đặt bàn & kích hoạt gửi email...'
      );
    }, 600);

    setTimeout(async () => {
      try {
        const res = await onSubmitBooking({
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          specialRequests,
          depositAmount,
          userId: currentUser?.id,
          voucherCode: appliedVoucher?.code,
          discountAmount: discountAmount > 0 ? discountAmount : undefined,
        });
        setCompletedReservation(res);
      } finally {
        setIsSubmitting(false);
      }
    }, 1200);
  };

  // SUCCESS SCREEN: OFFICIAL CHECK-IN BILL PASS
  if (completedReservation) {
    return (
      <div className="animate-fade-in py-2">
        <CheckInBill
          reservation={completedReservation}
          onOpenEmailPreview={onOpenEmailPreview}
          onResetBooking={onResetBooking}
          showNewBookingBtn={true}
        />
      </div>
    );
  }

  // MAIN FORM
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {timeValidationError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-rose-900">{timeValidationError}</p>
              <p className="text-rose-700 mt-0.5">Nhà hàng không nhận đặt bàn cho các khung giờ đã trôi qua trong quá khứ.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onPrev}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Quay Lại Bước 1 Đổi Giờ
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Customer Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
            <div className="border-b border-stone-100 pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-600" />
                  <span>Thông Tin Người Đặt Bàn</span>
                </h3>
                {currentUser && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-700" />
                    <span>Hạng {currentUser.membershipTier}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Email tự động kèm vé điện tử và mã QR sẽ được gửi tới địa chỉ email dưới đây.
              </p>
            </div>

            {/* Member status banner */}
            {currentUser ? (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-stone-50 border border-amber-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-600 text-stone-950 font-bold flex items-center justify-center text-sm">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">
                      Tài khoản: {currentUser.name}
                    </p>
                    <p className="text-[11px] text-stone-600">
                      Điểm tích lũy hiện có: <strong className="text-amber-800">{currentUser.loyaltyPoints} điểm</strong>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded">
                    Tự động tích lũy
                  </span>
                </div>
              </div>
            ) : onOpenAuthModal ? (
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-amber-950">
                  <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Đã có tài khoản? Đăng nhập để tự động điền thông tin và nhận ưu đãi tích điểm!</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shrink-0 flex items-center gap-1 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng nhập</span>
                </button>
              </div>
            ) : null}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Họ và tên khách hàng *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="customer-name-input"
                    type="text"
                    required
                    placeholder="Ví dụ: Lê Hùng"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Số điện thoại liên hệ *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="customer-phone-input"
                      type="tel"
                      required
                      placeholder="0987 654 321"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Email nhận xác nhận tự động *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="customer-email-input"
                      type="email"
                      required
                      placeholder="email@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Yêu cầu đặc biệt cho nhà hàng (Tùy chọn)
                </label>
                <textarea
                  id="special-requests-input"
                  rows={2}
                  placeholder="Ví dụ: Ghế ăn cho bé, hoa tươi bàn ăn, chuẩn bị nến sinh nhật, dị ứng đồ biển..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                />
              </div>

              {/* Voucher & Promotions Input */}
              <div className="pt-2 border-t border-stone-100 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Mã Ưu Đãi & Voucher Thành Viên
                </label>

                {appliedVoucher ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-700" />
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-emerald-950">{appliedVoucher.code}</strong>
                          <span className="text-[11px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-semibold">
                            Đã áp dụng
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800 mt-0.5">{appliedVoucher.title}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1"
                    >
                      Bỏ mã
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Nhập mã voucher (VD: LEGOURMET10)"
                          value={voucherInput}
                          onChange={(e) => {
                            setVoucherInput(e.target.value);
                            setVoucherError('');
                          }}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs uppercase font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyVoucher()}
                        className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-stone-100 text-xs font-bold transition-all"
                      >
                        Áp Dụng
                      </button>
                    </div>

                    {voucherError && (
                      <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{voucherError}</span>
                      </p>
                    )}

                    {/* Fast Click Vouchers */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-stone-400">Mã gợi ý:</span>
                      {INITIAL_VOUCHERS.map((v) => (
                        <button
                          key={v.code}
                          type="button"
                          onClick={() => handleApplyVoucher(v)}
                          className="px-2 py-1 rounded-md bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 border border-stone-200 font-mono text-[10px] font-bold transition-all"
                        >
                          {v.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Deposit and Policy Section */}
          <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Tùy Chọn Giữ Chỗ & Đặt Cọc
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setDepositOption('deposit')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  depositOption === 'deposit'
                    ? 'border-amber-600 bg-amber-50/50 shadow-xs'
                    : 'border-stone-200 bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-stone-900">Đặt cọc giữ bàn ưu tiên</span>
                  {depositOption === 'deposit' && <Check className="w-4 h-4 text-amber-700" />}
                </div>
                <div className="text-base font-extrabold text-amber-900">{formatVND(depositAmount)}</div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Được trừ trực tiếp vào hóa đơn khi thanh toán tại nhà hàng.
                </p>
              </div>

              <div
                onClick={() => setDepositOption('none')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  depositOption === 'none'
                    ? 'border-amber-600 bg-amber-50/50 shadow-xs'
                    : 'border-stone-200 bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-stone-900">Giữ chỗ không cần cọc</span>
                  {depositOption === 'none' && <Check className="w-4 h-4 text-amber-700" />}
                </div>
                <div className="text-base font-extrabold text-stone-700">0 ₫</div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Nhà hàng hỗ trợ giữ bàn tối đa 15 phút kể từ giờ hẹn.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Final Summary Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 shadow-md space-y-5 sticky top-28">
            <div className="border-b border-stone-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold">
                  Bản Tóm Tắt Đặt Chỗ
                </span>
                <h4 className="font-serif-heading text-lg font-bold text-stone-100">Le Gourmet Bistro</h4>
              </div>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>

            {/* Time & Table Info */}
            <div className="space-y-2.5 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Thời gian:</span>
                <strong className="text-stone-100 ml-auto">{selectedTime}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Ngày đến:</span>
                <strong className="text-stone-100 ml-auto">{new Date(selectedDate).toLocaleDateString('vi-VN')}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Armchair className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Bàn & Khu vực:</span>
                <strong className="text-stone-100 ml-auto">{table?.name || 'Chưa chọn'}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Số lượng khách:</span>
                <strong className="text-stone-100 ml-auto">{guestCount} Người</strong>
              </div>
              {selectedOccasion && (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Dịp đặc biệt:</span>
                  <strong className="text-amber-300 ml-auto">{selectedOccasion}</strong>
                </div>
              )}
            </div>

            {/* Pre-ordered Dishes Summary */}
            <div className="border-t border-stone-800 pt-3 space-y-2">
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider flex justify-between">
                <span>Món ăn đã chọn</span>
                <span>{selectedDishes.length} món</span>
              </div>

              {selectedDishes.length === 0 ? (
                <p className="text-xs text-stone-500 italic">Chọn món trực tiếp tại bàn khi đến nhà hàng.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
                  {selectedDishes.map((item) => (
                    <div key={item.dish.id} className="flex justify-between items-center text-stone-300">
                      <span className="line-clamp-1">{item.dish.name} (x{item.quantity})</span>
                      <span className="font-semibold text-stone-200 shrink-0 ml-2">
                        {formatVND(item.dish.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total Calculation */}
            <div className="border-t border-stone-800 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Tổng tiền món dự kiến:</span>
                <span className="text-stone-200 font-bold">{formatVND(preOrderTotal)}</span>
              </div>

              {appliedVoucher && discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Ưu đãi voucher ({appliedVoucher.code}):</span>
                  <span className="font-bold">-{formatVND(discountAmount)}</span>
                </div>
              )}

              {depositAmount > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Tiền cọc giữ bàn (được trừ khi thanh toán):</span>
                  <span className="font-bold">{formatVND(depositAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-100 font-bold text-base pt-2 border-t border-dashed border-stone-700">
                <span>Tổng chi phí ước tính:</span>
                <span className="text-amber-400 text-lg">{formatVND(finalTotal)}</span>
              </div>

              {/* Loyalty points forecast */}
              <div className="pt-2">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-[11px] text-amber-300">
                  <span className="flex items-center gap-1 font-medium">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Điểm tích lũy thành viên:</span>
                  </span>
                  <strong className="font-bold text-amber-300">+{estimatedPoints} điểm</strong>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                id="btn-confirm-booking-final"
                disabled={isSubmitting || !customerName || !customerPhone || !customerEmail}
                className="w-full py-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                    <span>{submittingStepText}</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 stroke-[2.5]" />
                    <span>Xác Nhận Đặt Bàn & Gửi Email Tự Động</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onPrev}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Quay lại chọn món</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
