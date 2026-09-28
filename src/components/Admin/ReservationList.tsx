import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Mail, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Utensils, 
  ChevronDown, 
  Calendar,
  AlertCircle,
  QrCode
} from 'lucide-react';
import { Reservation, ReservationStatus, RestaurantTable } from '../../types';
import { formatVND } from '../../services/storage';
import { CheckInBillModal } from '../BookingFlow/CheckInBillModal';

interface ReservationListProps {
  reservations: Reservation[];
  tables: RestaurantTable[];
  onStatusChange: (reservationId: string, status: ReservationStatus) => void;
  onOpenEmailPreview: (reservation: Reservation) => void;
  onOpenManualBooking: () => void;
}

export const ReservationList: React.FC<ReservationListProps> = ({
  reservations,
  tables,
  onStatusChange,
  onOpenEmailPreview,
  onOpenManualBooking,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all'); // all, today, tomorrow, this_week
  const [viewingDishesReservation, setViewingDishesReservation] = useState<Reservation | null>(null);
  const [selectedCheckInRes, setSelectedCheckInRes] = useState<Reservation | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const filteredReservations = (reservations || []).filter((r) => {
    if (!r) return false;
    // Search
    const query = (searchTerm || '').trim().toLowerCase();
    const matchesSearch =
      !query ||
      (r.customerName || '').toLowerCase().includes(query) ||
      (r.customerPhone || '').includes(searchTerm) ||
      (r.bookingCode || '').toLowerCase().includes(query) ||
      (r.tableName || '').toLowerCase().includes(query);

    // Status
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    // Date
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = r.bookingDate === todayStr;
    } else if (dateFilter === 'tomorrow') {
      matchesDate = r.bookingDate === tomorrowStr;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Đã Xác Nhận</span>;
      case 'seated':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">Đang Phục Vụ</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Hoàn Thành</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-200 text-stone-600">Đã Hủy</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700">Chờ Xử Lý</span>;
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Mã Đặt Chỗ', 'Khách Hàng', 'Số Điện Thoại', 'Email', 'Ngày', 'Giờ Đến', 'Bàn', 'Số Khách', 'Tổng Tiền Món (VND)', 'Tiền Cọc (VND)', 'Trạng Thái', 'Dịp'];
    
    const rows = filteredReservations.map((r) => [
      r.bookingCode,
      `"${r.customerName}"`,
      `"${r.customerPhone}"`,
      r.customerEmail,
      r.bookingDate,
      r.arrivalTime,
      `"${r.tableName}"`,
      r.guestCount,
      r.preOrderTotal,
      r.depositAmount,
      r.status,
      `"${r.occasion || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DanhSachDatBan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Action Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT, mã đặt bàn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
          />
        </div>

        {/* Filters and Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-stone-300 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">Tất cả ngày</option>
            <option value="today">Hôm nay</option>
            <option value="tomorrow">Ngày mai</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-stone-300 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="seated">Đang phục vụ</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Xuất CSV</span>
          </button>

          {/* Manual Add Booking Button */}
          <button
            type="button"
            onClick={onOpenManualBooking}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Đặt Bàn Mới</span>
          </button>
        </div>
      </div>

      {/* Reservation Data Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-600 uppercase tracking-wider font-semibold border-b border-stone-200 text-[11px]">
                <th className="py-3 px-4">Mã & Khách Hàng</th>
                <th className="py-3 px-4">Thời Gian Đến</th>
                <th className="py-3 px-4">Bàn & Khu Vực</th>
                <th className="py-3 px-4">Món Đặt Trước</th>
                <th className="py-3 px-4">Doanh Thu Dự Kiến</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-center">Email Tự Động</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    <AlertCircle className="w-6 h-6 mx-auto mb-1 text-stone-300" />
                    Không tìm thấy dữ liệu đặt bàn nào phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => {
                  const hasDishes = res.selectedDishes && res.selectedDishes.length > 0;
                  return (
                    <tr key={res.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-stone-900 text-sm">
                          #{res.bookingCode}
                        </div>
                        <div className="font-medium text-stone-800">{res.customerName}</div>
                        <div className="text-[11px] text-stone-500">{res.customerPhone}</div>
                      </td>

                      {/* Arrival Date & Time */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{res.arrivalTime}</span>
                        </div>
                        <div className="text-stone-500 text-[11px]">
                          {new Date(res.bookingDate).toLocaleDateString('vi-VN')}
                        </div>
                        {res.occasion && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
                            {res.occasion}
                          </span>
                        )}
                      </td>

                      {/* Table Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-800">{res.tableName}</div>
                        <div className="text-[11px] text-stone-500">
                          {res.guestCount} người lớn
                        </div>
                      </td>

                      {/* Dishes summary */}
                      <td className="py-3.5 px-4">
                        {hasDishes ? (
                          <button
                            type="button"
                            onClick={() => setViewingDishesReservation(res)}
                            className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-medium flex items-center gap-1 transition"
                          >
                            <Utensils className="w-3 h-3 text-amber-600" />
                            <span>{res.selectedDishes.length} món đã chọn</span>
                          </button>
                        ) : (
                          <span className="text-stone-400 italic text-[11px]">Gọi tại bàn</span>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900 text-sm">
                          {formatVND(res.preOrderTotal)}
                        </div>
                        {res.depositAmount > 0 && (
                          <div className="text-[10px] text-emerald-700 font-medium">
                            Cọc: {formatVND(res.depositAmount)}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {getStatusBadge(res.status)}
                          <select
                            value={res.status}
                            onChange={(e) => onStatusChange(res.id, e.target.value as ReservationStatus)}
                            className="block w-full text-[10px] px-1.5 py-1 rounded border border-stone-200 bg-white text-stone-700 cursor-pointer"
                          >
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="seated">Đang phục vụ</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Hủy bàn</option>
                          </select>
                        </div>
                      </td>

                      {/* Automated Email Confirmation status */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onOpenEmailPreview(res)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 text-[11px] font-medium transition cursor-pointer"
                          title="Xem email xác nhận hệ thống đã gửi cho khách"
                        >
                          <Mail className="w-3 h-3 text-amber-600" />
                          <span>Đã gửi</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedCheckInRes(res)}
                            className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="Xem & In phiếu check-in / bill cho khách"
                          >
                            <QrCode className="w-3 h-3 text-amber-600" />
                            <span>Phiếu</span>
                          </button>

                          {res.status === 'confirmed' && (
                            <button
                              type="button"
                              onClick={() => onStatusChange(res.id, 'seated')}
                              className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold transition cursor-pointer"
                              title="Khách đã đến nhận bàn"
                            >
                              Nhận bàn
                            </button>
                          )}
                          {res.status === 'seated' && (
                            <button
                              type="button"
                              onClick={() => onStatusChange(res.id, 'completed')}
                              className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold transition"
                              title="Khách dùng bữa xong & thanh toán"
                            >
                              Hoàn thành
                            </button>
                          )}
                          {res.status !== 'cancelled' && res.status !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => onStatusChange(res.id, 'cancelled')}
                              className="p-1 rounded text-stone-400 hover:text-red-600 transition"
                              title="Hủy đặt bàn"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dishes Inspection Modal */}
      {viewingDishesReservation && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h4 className="font-bold text-sm text-stone-900">
                  Món Ăn Đặt Trước #{viewingDishesReservation.bookingCode}
                </h4>
                <p className="text-xs text-stone-500">
                  Khách: {viewingDishesReservation.customerName} ({viewingDishesReservation.tableName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingDishesReservation(null)}
                className="p-1 rounded-lg text-stone-400 hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {viewingDishesReservation.selectedDishes.map((item) => (
                <div
                  key={item.dish.id}
                  className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1"
                >
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>{item.dish.name}</span>
                    <span className="text-amber-900">{formatVND(item.dish.price * item.quantity)}</span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Số lượng: x{item.quantity} ({formatVND(item.dish.price)}/phần)
                  </div>
                  {item.specialNotes && (
                    <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded italic">
                      Yêu cầu chế biến: {item.specialNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-xs">
              <span className="text-stone-500">Tổng tiền món:</span>
              <span className="text-base font-extrabold text-amber-900">
                {formatVND(viewingDishesReservation.preOrderTotal)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setViewingDishesReservation(null)}
              className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-xl text-xs font-bold cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Check-In Bill Pass Modal */}
      {selectedCheckInRes && (
        <CheckInBillModal
          reservation={selectedCheckInRes}
          onClose={() => setSelectedCheckInRes(null)}
          onOpenEmailPreview={onOpenEmailPreview}
        />
      )}
    </div>
  );
};
