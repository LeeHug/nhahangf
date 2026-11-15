import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  Calendar,
  Armchair,
  Phone,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Loader2,
  ArrowRight,
  HeartHandshake
} from 'lucide-react';
import { Reservation } from '../../types';
import { checkCancellationEligibility } from '../../utils/dateTimeUtils';
import { apiService } from '../../services/api';
import { cancelStoredReservation } from '../../services/storage';

interface CancelReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  onCancelledSuccess?: (updatedRes: Reservation) => void;
}

const CANCELLATION_REASONS = [
  'Thay đổi kế hoạch cá nhân',
  'Bận việc đột xuất không thể đến',
  'Đặt nhầm ngày hoặc khung giờ',
  'Đổi địa điểm ăn uống cùng đối tác / gia đình',
  'Lý do sức khỏe',
  'Khác...',
];

export const CancelReservationModal: React.FC<CancelReservationModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onCancelledSuccess,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(CANCELLATION_REASONS[0]);
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    message: string;
    refundInfo?: any;
    updatedRes: Reservation;
  } | null>(null);

  if (!isOpen) return null;

  const eligibility = checkCancellationEligibility(reservation.bookingDate, reservation.arrivalTime, 120);
  const minutesRemaining = eligibility.minutesRemaining;
  const hoursLeft = Math.floor(minutesRemaining / 60);
  const minsLeft = minutesRemaining % 60;

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handleConfirmCancel = async () => {
    if (!eligibility.canCancel) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const fullReason = selectedReason === 'Khác...' && customNotes.trim()
      ? `Khác: ${customNotes.trim()}`
      : selectedReason;

    try {
      // 1. Call server API
      const apiResult = await apiService.cancelReservation(reservation.id || reservation.bookingCode, {
        reason: fullReason,
        cancelNotes: customNotes.trim(),
        customerPhone: reservation.customerPhone,
      });

      if (apiResult.success && apiResult.reservation) {
        // Also update local storage to stay in sync
        cancelStoredReservation(reservation.id, fullReason, customNotes.trim());
        setSuccessData({
          message: apiResult.message,
          refundInfo: apiResult.refundInfo,
          updatedRes: apiResult.reservation,
        });
        if (onCancelledSuccess) {
          onCancelledSuccess(apiResult.reservation);
        }
        window.dispatchEvent(new Event('storage'));
      } else if (apiResult.isServerError) {
        setErrorMessage(apiResult.message || 'Không thể hủy đơn đặt bàn.');
      } else {
        // Local fallback only when API server is unreachable
        const localResult = cancelStoredReservation(reservation.id, fullReason, customNotes.trim());
        if (localResult.success && localResult.reservation) {
          setSuccessData({
            message: localResult.message,
            refundInfo: localResult.refundInfo,
            updatedRes: localResult.reservation,
          });
          if (onCancelledSuccess) {
            onCancelledSuccess(localResult.reservation);
          }
          window.dispatchEvent(new Event('storage'));
        } else {
          setErrorMessage(apiResult.message || localResult.message || 'Không thể hủy đơn đặt bàn.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Đã xảy ra lỗi kết nối. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden z-10 animate-fade-in my-8 text-stone-900">
        
        {/* Top Gold / Burgundy Stripe */}
        <div className="h-2 bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center font-bold shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-heading text-lg font-bold text-stone-900">
                Hủy Yêu Cầu Đặt Bàn
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Mã phiếu: #{reservation.bookingCode}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* SUCCESS SCREEN */}
          {successData ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div className="space-y-1.5">
                <h4 className="font-serif-heading text-xl font-bold text-stone-900">
                  Đã Hủy Đặt Bàn Thành Công
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                  Đơn đặt bàn <strong className="font-mono text-stone-900">#{reservation.bookingCode}</strong> tại bàn <strong>{reservation.tableName}</strong> đã được hủy và giải phóng trên hệ thống.
                </p>
              </div>

              {/* Refund notification card */}
              {successData.refundInfo?.refundEligible && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-1.5 text-xs text-emerald-950">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <HeartHandshake className="w-4 h-4 text-emerald-600" />
                    <span>Chính Sách Hoàn Tiền Đặt Cọc (100%)</span>
                  </div>
                  <p className="leading-relaxed">
                    Khoản tiền đặt cọc <strong>{formatVND(successData.refundInfo.depositAmount)}</strong> sẽ được hoàn trả đầy đủ vào tài khoản thanh toán ban đầu của quý khách trong vòng 24 giờ làm việc.
                  </p>
                </div>
              )}

              {/* Email notice */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs text-stone-600 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Hệ thống đã tự động gửi email thông báo hủy bàn chi tiết tới hòm thư <strong className="text-stone-900">{reservation.customerEmail}</strong>.
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
              >
                Hoàn Tất & Đóng
              </button>
            </div>
          ) : (
            <>
              {/* RESERVATION SUMMARY MINI-CARD */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                  <span className="font-bold text-stone-800">Khách hàng: {reservation.customerName}</span>
                  <span className="font-mono text-stone-600">{reservation.customerPhone}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    <span>{reservation.bookingDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>{reservation.arrivalTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Armchair className="w-3.5 h-3.5 text-amber-700" />
                    <span>{reservation.tableName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-stone-900 font-mono">
                      Cọc: {reservation.depositAmount > 0 ? formatVND(reservation.depositAmount) : '0 đ'}
                    </span>
                  </div>
                </div>
              </div>

              {/* POLICY CHECK EVALUATION */}
              {eligibility.canCancel ? (
                /* CASE 1: ELIGIBLE (>= 120 MINS) */
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-bold">Đủ điều kiện tự hủy trực tuyến</div>
                      <p className="text-emerald-800/90 text-[11px] leading-relaxed">
                        Thời gian đến giờ hẹn còn <strong>{hoursLeft > 0 ? `${hoursLeft} giờ ` : ''}{minsLeft} phút</strong> (yêu cầu trước tối thiểu 120 phút).
                        {reservation.depositAmount > 0 ? ' Khoản cọc sẽ được hoàn lại 100%.' : ''}
                      </p>
                    </div>
                  </div>

                  {/* REASON SELECTION */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
                      Vui lòng cho biết lý do hủy bàn:
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {CANCELLATION_REASONS.map((r) => (
                        <label
                          key={r}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition ${
                            selectedReason === r
                              ? 'bg-amber-50/60 border-amber-400 text-stone-900 font-semibold'
                              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="cancellationReason"
                            value={r}
                            checked={selectedReason === r}
                            onChange={() => setSelectedReason(r)}
                            className="text-amber-600 focus:ring-amber-500 w-4 h-4 accent-amber-600"
                          />
                          <span>{r}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* CUSTOM NOTES */}
                  <div className="space-y-1">
                    <label className="text-xs text-stone-500 block">
                      Ghi chú thêm cho nhà hàng (tùy chọn):
                    </label>
                    <textarea
                      rows={2}
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="Quý khách có góp ý gì để Le Gourmet Bistro phục vụ tốt hơn vào lần sau không?..."
                      className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none resize-none"
                    />
                  </div>

                  {/* ERROR MESSAGE IF ANY */}
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleConfirmCancel}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-900/10 transition cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang Xử Lý Hủy Bàn...</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-4 h-4" />
                          <span>Xác Nhận Hủy Đặt Bàn</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={onClose}
                      className="w-full sm:w-auto py-3 px-5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs sm:text-sm transition cursor-pointer"
                    >
                      Giữ Lại Đặt Bàn
                    </button>
                  </div>
                </div>
              ) : (
                /* CASE 2: INELIGIBLE (< 120 MINS OR PAST) */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Không Thể Tự Hủy Trực Tuyến</span>
                    </div>
                    <p className="leading-relaxed text-rose-900/90 text-xs">
                      {eligibility.reason ||
                        'Theo chính sách Le Gourmet Bistro, yêu cầu hủy bàn cần được thực hiện trước giờ hẹn tối thiểu 120 phút.'}
                    </p>
                    <p className="text-[11px] text-stone-600 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-rose-100">
                      💡 <strong>Lý do:</strong> Đội ngũ đầu bếp đã hoàn tất tiếp nhận và chuẩn bị các nguyên liệu thượng hạng tươi sống cho thực đơn của quý khách. Việc hủy sát giờ gây tổn thất nguyên liệu đã sơ chế.
                    </p>
                  </div>

                  {/* URGENT HOTLINE CARD */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-700" />
                      <span>Cần Hỗ Trợ Đột Xuất?</span>
                    </div>
                    <p className="text-stone-600 leading-relaxed">
                      Nếu có phát sinh bất khả kháng, quý khách vui lòng liên hệ trực tiếp với Quản lý nhà hàng qua Hotline khẩn cấp để được xem xét dời giờ hoặc bảo lưu khoản cọc:
                    </p>
                    <a
                      href="tel:0903888999"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-sm transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Hotline Quản Lý: 0903.888.999 (Nhấn để gọi)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow transition cursor-pointer"
                  >
                    Đã Hiểu & Đóng
                  </button>
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};
