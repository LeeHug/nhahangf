import React, { useState } from 'react';
import { X, Check, Printer, QrCode, CreditCard, Banknote, ShieldCheck, Sparkles, Receipt } from 'lucide-react';
import { Reservation, RestaurantTable } from '../../types';
import { formatVND } from '../../services/storage';

interface TableCheckoutModalProps {
  reservation: Reservation;
  table?: RestaurantTable;
  staffName?: string;
  onClose: () => void;
  onConfirmCheckout: (paymentDetails: {
    paymentMethod: 'cash' | 'vietqr' | 'pos_card';
    paidAmount: number;
    staffName?: string;
    notes?: string;
  }) => void;
}

export const TableCheckoutModal: React.FC<TableCheckoutModalProps> = ({
  reservation,
  table,
  staffName = 'Nhân viên thu ngân',
  onClose,
  onConfirmCheckout,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'vietqr' | 'pos_card'>('cash');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Financial calculations
  const dishesTotal = reservation.preOrderTotal || 0;
  const depositPaid = reservation.depositAmount || 0;
  const discount = reservation.discountAmount || 0;
  const finalAmountToPay = Math.max(0, dishesTotal - discount - depositPaid);

  const pointsToEarn = Math.floor(finalAmountToPay / 20000);

  const handleComplete = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirmCheckout({
        paymentMethod,
        paidAmount: finalAmountToPay,
        staffName,
        notes,
      });
      setIsProcessing(false);
    }, 400);
  };

  const handlePrintBill = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl text-stone-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Thanh Toán & Trả Bàn • POS Thu Ngân
                </span>
                <span className="text-xs text-stone-400">#{reservation.bookingCode}</span>
              </div>
              <h2 className="text-lg font-bold text-stone-100 mt-0.5">
                Hóa Đơn Bàn: {reservation.tableName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintBill}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-stone-100 text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="In hóa đơn thanh toán"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline font-medium">In Bill</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-stone-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Customer & Table details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-stone-850 border border-stone-800 text-xs">
            <div>
              <span className="text-stone-400 block">Khách hàng:</span>
              <span className="font-bold text-stone-100">{reservation.customerName}</span>
            </div>
            <div>
              <span className="text-stone-400 block">Số điện thoại:</span>
              <span className="font-medium text-stone-200">{reservation.customerPhone}</span>
            </div>
            <div>
              <span className="text-stone-400 block">Số khách:</span>
              <span className="font-bold text-stone-100">{reservation.guestCount} Người</span>
            </div>
            <div>
              <span className="text-stone-400 block">Giờ đến / Bàn:</span>
              <span className="font-medium text-amber-400">{reservation.arrivalTime} • {reservation.tableName}</span>
            </div>
          </div>

          {/* Dishes Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Chi Tiết Món Ăn & Đồ Uống Sử Dụng
            </h3>
            <div className="border border-stone-800 rounded-2xl overflow-hidden bg-stone-850/50">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-800/80 text-stone-400 text-[11px] uppercase border-b border-stone-800">
                  <tr>
                    <th className="py-2.5 px-3">Tên Món</th>
                    <th className="py-2.5 px-3 text-center">SL</th>
                    <th className="py-2.5 px-3 text-right">Đơn Giá</th>
                    <th className="py-2.5 px-3 text-right">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 text-stone-200">
                  {(!reservation.selectedDishes || reservation.selectedDishes.length === 0) ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-stone-500 italic">
                        Khách không đặt món trước.
                      </td>
                    </tr>
                  ) : (
                    reservation.selectedDishes.map((item, idx) => (
                      <tr key={idx} className="hover:bg-stone-800/40">
                        <td className="py-2 px-3 font-medium">
                          {item.dish.name}
                          {item.specialNotes && (
                            <span className="block text-[10px] text-stone-400 italic">
                              Ghi chú: {item.specialNotes}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-amber-400">x{item.quantity}</td>
                        <td className="py-2 px-3 text-right text-stone-400">{formatVND(item.dish.price)}</td>
                        <td className="py-2 px-3 text-right font-semibold text-stone-100">
                          {formatVND(item.dish.price * item.quantity)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown Calculation */}
          <div className="p-4 rounded-2xl bg-stone-850 border border-stone-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-stone-300">
              <span>Tổng tiền món ăn:</span>
              <span className="font-semibold text-stone-100">{formatVND(dishesTotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex items-center justify-between text-emerald-400">
                <span>Ưu đãi Voucher ({reservation.voucherCode || 'Áp dụng'}):</span>
                <span>-{formatVND(discount)}</span>
              </div>
            )}

            {depositPaid > 0 && (
              <div className="flex items-center justify-between text-amber-400">
                <span>Tiền cọc đã thanh toán trước:</span>
                <span>-{formatVND(depositPaid)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-stone-100 block">Số Tiền Thực Thu:</span>
                <span className="text-[10px] text-stone-400">Đã khấu trừ tiền cọc & khuyến mãi</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-amber-400">
                  {formatVND(finalAmountToPay)}
                </span>
                {pointsToEarn > 0 && (
                  <span className="block text-[10px] text-emerald-400">
                    +Tích lũy {pointsToEarn} điểm thành viên
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
              Phương Thức Thanh Toán Của Khách
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'cash'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                    : 'bg-stone-850 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-xs font-bold">Tiền Mặt</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('vietqr')}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'vietqr'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                    : 'bg-stone-850 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-xs font-bold">Chuyển Khoản VietQR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('pos_card')}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'pos_card'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                    : 'bg-stone-850 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs font-bold">Thẻ Ngân Hàng POS</span>
              </button>
            </div>

            {/* VietQR Display if selected */}
            {paymentMethod === 'vietqr' && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-4 text-xs animate-fade-in">
                <div className="w-16 h-16 bg-white p-1 rounded-xl shrink-0 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-stone-900" />
                </div>
                <div>
                  <p className="font-bold text-amber-300">Quét Mã VietQR Chuyển Khoản Tức Thì</p>
                  <p className="text-stone-300 text-[11px] mt-0.5">
                    Ngân hàng: <strong>Vietcombank (VCB)</strong> • STK: <strong>9903888999</strong>
                  </p>
                  <p className="text-stone-400 text-[10px] mt-0.5">
                    Nội dung: <strong>{reservation.bookingCode} {reservation.customerPhone}</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-stone-400 block mb-1">Ghi chú thanh toán (nếu có):</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Khách lấy hóa đơn VAT công ty..."
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-850 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-medium cursor-pointer transition"
          >
            Đóng Lại
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleComplete}
            className="w-full sm:flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 cursor-pointer transition disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isProcessing ? 'Đang hoàn tất...' : 'Xác Nhận Đã Thanh Toán & Giải Phóng Bàn'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
