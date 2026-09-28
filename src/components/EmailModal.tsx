import React from 'react';
import { X, Printer, Download, Mail, CheckCircle2, Calendar } from 'lucide-react';
import { Reservation } from '../types';
import { generateBookingEmailHtml, downloadIcsCalendar } from '../services/storage';

interface EmailModalProps {
  reservation: Reservation | null;
  onClose: () => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({ reservation, onClose }) => {
  if (!reservation) return null;

  const emailHtml = generateBookingEmailHtml(reservation);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(emailHtml);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Email Client Header Bar */}
        <div className="bg-stone-900 text-stone-100 p-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-stone-100">
                  Hệ Thống Email Tự Động (Automated Mail Dispatcher)
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Đã Gửi Thành Công
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Gửi tới: <strong className="text-amber-400">{reservation.customerEmail}</strong> • Thời gian: {new Date(reservation.emailSentAt || Date.now()).toLocaleTimeString('vi-VN')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadIcsCalendar(reservation)}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-stone-100 text-xs flex items-center gap-1.5 transition"
              title="Tải lịch hẹn .ics"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Thêm vào Lịch</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-stone-100 text-xs flex items-center gap-1.5 transition"
              title="In email"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">In Phiếu</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Email Subject line */}
        <div className="bg-stone-100 px-6 py-2.5 border-b border-stone-200 text-xs text-stone-700 flex flex-wrap items-center justify-between gap-2">
          <div>
            <strong>Tiêu đề:</strong> ✨ Xác nhận đặt bàn thành công #{reservation.bookingCode} - Nhà Hàng Le Gourmet Bistro
          </div>
          <div className="text-[11px] text-stone-500">
            Từ: <em>booking@legourmetbistro.vn</em>
          </div>
        </div>

        {/* Email Content HTML Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50">
          <div 
            className="email-rendered-preview max-w-2xl mx-auto shadow-sm rounded-xl overflow-hidden bg-white"
            dangerouslySetInnerHTML={{ __html: emailHtml }}
          />
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-white border-t border-stone-200 flex justify-between items-center text-xs text-stone-500">
          <span>Khách hàng có thể xuất trình mã #{reservation.bookingCode} tại quầy tiếp tân.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg font-medium text-xs cursor-pointer"
          >
            Đóng Trình Xem
          </button>
        </div>
      </div>
    </div>
  );
};
