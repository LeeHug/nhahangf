import React, { useState } from 'react';
import { X, Search, CheckCircle, Clock, Calendar, Users, Armchair, AlertCircle, Eye, Download, QrCode, Receipt } from 'lucide-react';
import { Reservation } from '../types';
import { formatVND, downloadIcsCalendar } from '../services/storage';
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
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCheckInRes, setSelectedCheckInRes] = useState<Reservation | null>(null);

  const matchedReservations = (reservations || []).filter((r) => {
    if (!r) return false;
    if (!query.trim()) return false;
    const cleanQuery = (query || '').trim().toLowerCase().replace('#', '');
    return (
      (r.bookingCode || '').toLowerCase().includes(cleanQuery) ||
      (r.customerPhone || '').includes(cleanQuery) ||
      (r.customerEmail || '').toLowerCase().includes(cleanQuery)
    );
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
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
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">Tra Cứu Thông Tin Đặt Bàn</h3>
              <p className="text-xs text-stone-500">Nhập mã đặt chỗ (VD: BK-1003) hoặc số điện thoại</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="Nhập mã đặt bàn (BK-...) hoặc SĐT khách..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {hasSearched && matchedReservations.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-stone-300" />
              <p>Không tìm thấy đặt bàn nào khớp với từ khóa "{query}".</p>
              <p className="text-stone-500">Vui lòng kiểm tra lại mã đặt chỗ hoặc số điện thoại.</p>
            </div>
          ) : (
            matchedReservations.map((res) => (
              <div
                key={res.id}
                className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <div>
                    <span className="text-base font-extrabold text-stone-900">
                      #{res.bookingCode}
                    </span>
                    <span className="text-xs text-stone-500 ml-2 font-medium">
                      ({res.customerName} - {res.customerPhone})
                    </span>
                  </div>
                  {getStatusBadge(res.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>{res.arrivalTime}, {new Date(res.bookingDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Armchair className="w-3.5 h-3.5 text-amber-700" />
                    <span>{res.tableName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-700" />
                    <span>{res.guestCount} Khách {res.occasion ? `• ${res.occasion}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-stone-900">Tiền món: {formatVND(res.preOrderTotal)}</span>
                  </div>
                </div>

                {res.selectedDishes && res.selectedDishes.length > 0 && (
                  <div className="text-[11px] bg-white p-2 rounded-lg border border-stone-200/80 text-stone-700 space-y-0.5">
                    <span className="font-bold text-stone-800">Món đã đặt trước:</span>
                    <p className="line-clamp-2">
                      {res.selectedDishes.map((d) => `${d.dish.name} (x${d.quantity})`).join(', ')}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCheckInRes(res)}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Phiếu Check-in & Bill</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenEmailPreview(res)}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Xem Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadIcsCalendar(res)}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Lịch (.ics)</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Dedicated Check-In Bill Pass Modal */}
        {selectedCheckInRes && (
          <CheckInBillModal
            reservation={selectedCheckInRes}
            onClose={() => setSelectedCheckInRes(null)}
            onOpenEmailPreview={onOpenEmailPreview}
          />
        )}
      </div>
    </div>
  );
};
