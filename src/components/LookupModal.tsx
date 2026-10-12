import React, { useState } from 'react';
import { X, Search, CheckCircle, Clock, Calendar, Users, Armchair, AlertCircle, Eye, Download, QrCode, Receipt, ShieldCheck } from 'lucide-react';
import { Reservation } from '../types';
import { formatVND, downloadIcsCalendar } from '../services/storage';
import { apiService } from '../services/api';
import { CheckInBillModal } from './BookingFlow/CheckInBillModal';

interface LookupModalProps {
  reservations: Reservation[];
  onClose: () => void;
  onOpenEmailPreview: (reservation: Reservation) => void;
}

export const LookupModal: React.FC<LookupModalProps> = ({
  reservations,
  onClose,
  onOpenEmailPreview,
}) => {
  const [bookingCode, setBookingCode] = useState('');
  const [phone, setPhone] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [matchedReservation, setMatchedReservation] = useState<Reservation | null>(null);
  const [selectedCheckInRes, setSelectedCheckInRes] = useState<Reservation | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setErrorMessage('');
    setMatchedReservation(null);

    const cleanCode = bookingCode.trim().toUpperCase().replace('#', '');
    const cleanPhone = phone.trim().replace(/\s+/g, '');

    if (!cleanCode || !cleanPhone) {
      setErrorMessage('Vui lòng nhập đầy đủ cả Mã Đặt Chỗ và Số Điện Thoại để xác thực bảo mật.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Thử gọi API xác thực strict phía server
      const serverResult = await apiService.lookupReservation(cleanCode, cleanPhone);
      if (serverResult) {
        setMatchedReservation(serverResult);
        setIsLoading(false);
        return;
      }

      // 2. Fallback đối soát local: BẮT BUỘC KHỚP CHÍNH XÁC CẢ 2 TRƯỜNG (Strict 2-factor match)
      // Chống hoàn toàn hành vi dò quét bằng substring số điện thoại
      const localMatch = (reservations || []).find((r) => {
        if (!r) return false;
        const rCode = (r.bookingCode || '').toUpperCase().replace('#', '');
        const rPhone = (r.customerPhone || '').replace(/\s+/g, '');
        return rCode === cleanCode && rPhone === cleanPhone;
      });

      if (localMatch) {
        setMatchedReservation(localMatch);
      } else {
        setErrorMessage('Không tìm thấy đơn đặt bàn khớp với Mã đặt chỗ và Số điện thoại này. Vui lòng kiểm tra lại!');
      }
    } catch (err) {
      setErrorMessage('Đã xảy ra lỗi khi tra cứu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Đã Xác Nhận</span>;
      case 'seated':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Đang Dùng Bữa</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Đã Hoàn Thành</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-200 text-stone-600">Đã Hủy</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-800">Chờ Xử Lý</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-stone-200 overflow-hidden space-y-4 p-5 sm:p-6 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">Tra Cứu Thông Tin Đặt Bàn</h3>
              <p className="text-xs text-stone-500">Bảo mật thông tin: Yêu cầu xác thực đồng thời Mã đặt chỗ & SĐT</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Notification */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            Để bảo vệ thông tin riêng tư của khách hàng, hệ thống chỉ hiển thị chi tiết khi bạn cung cấp đúng cả <strong>Mã đặt bàn</strong> và <strong>Số điện thoại</strong> đã đăng ký.
          </span>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Mã Đặt Bàn (Booking Code) *
              </label>
              <input
                type="text"
                required
                placeholder="VD: BK-1003"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Số Điện Thoại Khách Hàng *
              </label>
              <input
                type="tel"
                required
                placeholder="VD: 0987654321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'Đang xác thực và tra cứu...' : 'Xác Thực & Tra Cứu Đơn Đặt Bàn'}</span>
          </button>
        </form>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {hasSearched && errorMessage && (
            <div className="p-6 text-center text-xs text-rose-600 space-y-2 bg-rose-50/60 border border-rose-200 rounded-xl">
              <AlertCircle className="w-7 h-7 mx-auto text-rose-500" />
              <p className="font-semibold text-sm">{errorMessage}</p>
            </div>
          )}

          {matchedReservation && (
            <div
              key={matchedReservation.id}
              className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <div>
                  <span className="text-base font-extrabold text-stone-900">
                    #{matchedReservation.bookingCode}
                  </span>
                  <span className="text-xs text-stone-600 ml-2 font-medium">
                    ({matchedReservation.customerName} - {matchedReservation.customerPhone})
                  </span>
                </div>
                {getStatusBadge(matchedReservation.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-stone-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>{matchedReservation.arrivalTime}, {new Date(matchedReservation.bookingDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Armchair className="w-3.5 h-3.5 text-amber-700" />
                  <span>{matchedReservation.tableName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-700" />
                  <span>{matchedReservation.guestCount} Khách {matchedReservation.occasion ? `• ${matchedReservation.occasion}` : ''}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-stone-900">Tiền món: {formatVND(matchedReservation.preOrderTotal)}</span>
                </div>
              </div>

              {matchedReservation.selectedDishes && matchedReservation.selectedDishes.length > 0 && (
                <div className="text-[11px] bg-white p-2 rounded-lg border border-stone-200/80 text-stone-700 space-y-0.5">
                  <span className="font-bold text-stone-800">Món đã đặt trước:</span>
                  <p className="line-clamp-2">
                    {matchedReservation.selectedDishes.map((d) => `${d.dish.name} (x${d.quantity})`).join(', ')}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedCheckInRes(matchedReservation)}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Phiếu Check-in & Bill</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenEmailPreview(matchedReservation)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadIcsCalendar(matchedReservation)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Lịch .ics</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Check-in Modal integration */}
        {selectedCheckInRes && (
          <CheckInBillModal
            reservation={selectedCheckInRes}
            onClose={() => setSelectedCheckInRes(null)}
          />
        )}
      </div>
    </div>
  );
};
