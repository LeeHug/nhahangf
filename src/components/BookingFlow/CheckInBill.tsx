import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Users, 
  Armchair, 
  MapPin, 
  Phone, 
  Mail, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Utensils, 
  Compass, 
  ShieldCheck,
  Share2,
  Info,
  RotateCcw,
  Bell,
  Star
} from 'lucide-react';
import { Reservation } from '../../types';
import { formatVND, downloadIcsCalendar } from '../../services/storage';
import { TableSelfServiceModal } from '../TableService/TableSelfServiceModal';
import { CustomerReviewModal } from '../Feedback/CustomerReviewModal';

interface CheckInBillProps {
  reservation: Reservation;
  onOpenEmailPreview?: (reservation: Reservation) => void;
  onResetBooking?: () => void;
  onClose?: () => void;
  showNewBookingBtn?: boolean;
}

export const CheckInBill: React.FC<CheckInBillProps> = ({
  reservation,
  onOpenEmailPreview,
  onResetBooking,
  onClose,
  showNewBookingBtn = true,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [isSelfServiceOpen, setIsSelfServiceOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const billRef = useRef<HTMLDivElement>(null);

  // Generate authentic scannable QR Code
  useEffect(() => {
    const qrPayload = JSON.stringify({
      app: 'LeGourmetBistro',
      code: reservation.bookingCode,
      name: reservation.customerName,
      phone: reservation.customerPhone,
      date: reservation.bookingDate,
      time: reservation.arrivalTime,
      table: reservation.tableName,
      guests: reservation.guestCount,
      deposit: reservation.depositAmount,
    });

    QRCode.toDataURL(qrPayload, {
      width: 220,
      margin: 1,
      color: {
        dark: '#1c1917', // stone-900
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));
  }, [reservation]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(reservation.bookingCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyShareLink = () => {
    const shareText = `Phiếu đặt bàn Le Gourmet Bistro: #${reservation.bookingCode} | Khách: ${reservation.customerName} | Lúc: ${reservation.arrivalTime} ngày ${reservation.bookingDate} | Bàn: ${reservation.tableName}`;
    navigator.clipboard.writeText(shareText);
    setIsCopiedLink(true);
    setTimeout(() => setIsCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenGoogleMaps = () => {
    window.open('https://maps.google.com/?q=128+Nguyen+Hue+Ben+Nghe+District+1+Ho+Chi+Minh', '_blank');
  };

  // Date formatted
  const formattedDate = (() => {
    try {
      const d = new Date(reservation.bookingDate);
      return d.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return reservation.bookingDate;
    }
  })();

  const subTotal = reservation.preOrderTotal || 0;
  const discount = reservation.discountAmount || 0;
  const depositPaid = reservation.depositAmount || 0;
  const remainingEstimate = Math.max(0, subTotal - discount - depositPaid);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Top action bar - Hidden during print */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900 text-stone-100 p-4 rounded-2xl shadow-md print:hidden">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-amber-400">Phiếu Đặt Bàn Đã Kích Hoạt</span>
          <span className="text-stone-500">•</span>
          <span className="text-stone-300">Sẵn sàng xuất trình khi đến nhà hàng</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="In hoặc Lưu phiếu thành file PDF"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>In Phiếu / PDF</span>
          </button>

          <button
            type="button"
            onClick={() => downloadIcsCalendar(reservation)}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Thêm lịch hẹn vào điện thoại"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Lưu Lịch (.ics)</span>
          </button>

          <button
            type="button"
            onClick={handleCopyShareLink}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Sao chép thông tin phiếu để gửi cho bạn bè"
          >
            {isCopiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isCopiedLink ? 'Đã sao chép' : 'Chia sẻ'}</span>
          </button>
        </div>
      </div>

      {/* THE MAIN CHECK-IN BILL PASS */}
      <div 
        ref={billRef}
        id="printable-checkin-bill"
        className="bg-white text-stone-900 rounded-3xl border border-stone-200 shadow-xl overflow-hidden relative print:border-none print:shadow-none print:rounded-none"
      >
        {/* Top Gold Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

        {/* RESTAURANT HEADER */}
        <div className="p-6 sm:p-8 bg-stone-900 text-stone-100 border-b border-stone-800 relative overflow-hidden">
          {/* Subtle decorative watermark */}
          <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none select-none font-serif text-9xl">
            LG
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left relative z-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Vé Xác Nhận Đặt Bàn & Check-in Điện Tử</span>
              </div>
              <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold tracking-wide text-stone-100">
                LE GOURMET BISTRO
              </h1>
              <p className="text-xs text-stone-400 flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  128 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                </span>
              </p>
              <p className="text-xs text-stone-400 flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-amber-400" /> Hotline: 0903.888.999
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" /> Mở cửa: 10:30 - 22:30
                </span>
              </p>
            </div>

            {/* Official Pass Badge */}
            <div className="flex flex-col items-center sm:items-end justify-center shrink-0">
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Đã Xác Nhận Đặt Bàn</span>
              </div>
              <span className="text-[11px] text-stone-400 mt-1 font-mono">
                Mã hệ thống: #{reservation.id.slice(0, 10)}
              </span>
            </div>
          </div>
        </div>

        {/* PRIMARY CHECK-IN TICKET SECTION (WITH QR & CODE) */}
        <div className="p-6 sm:p-8 bg-stone-50 border-b border-dashed border-stone-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Left Column: Big Code & Instructions */}
            <div className="space-y-4 text-center md:text-left flex-1">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Mã Check-in Quầy Tiếp Tân (Booking Code)
                </span>
                <div className="flex items-center justify-center md:justify-start gap-3 mt-1">
                  <span className="font-mono text-3xl sm:text-4xl font-black text-amber-600 tracking-wider">
                    #{reservation.bookingCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-600 transition shadow-xs cursor-pointer"
                    title="Sao chép mã"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-amber-100/70 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 space-y-1 max-w-md">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Hướng Dẫn Check-in Khi Đến Nhà Hàng:</span>
                </div>
                <p className="leading-relaxed text-[11px] text-amber-900/90">
                  Quý khách chỉ cần xuất trình màn hình này hoặc đọc mã <strong className="font-mono text-amber-950">#{reservation.bookingCode}</strong> tại quầy tiếp tân. Nhân viên lễ tân sẽ lập tức đón tiếp và dẫn lối quý khách đến bàn đã chuẩn bị sẵn.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Giữ bàn tối đa 15 phút
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 font-medium">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  Phục vụ {reservation.guestCount} Khách
                </span>
              </div>
            </div>

            {/* Right Column: Scannable QR Code Box */}
            <div className="flex flex-col items-center justify-center bg-white p-4 sm:p-5 rounded-2xl border-2 border-stone-800 shadow-md shrink-0 text-center">
              <div className="relative p-1 bg-white rounded-xl">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Mã QR Check-in #${reservation.bookingCode}`}
                    className="w-36 h-36 sm:w-40 sm:h-40 object-contain mx-auto"
                  />
                ) : (
                  <div className="w-36 h-36 sm:w-40 sm:h-40 bg-stone-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-stone-400">
                    Đang tạo mã QR...
                  </div>
                )}
                {/* Logo badge in center of QR for luxury feel */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-lg bg-stone-950 text-amber-400 flex items-center justify-center font-serif text-xs font-black shadow-md border border-amber-400/60">
                    LG
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-2">
                Mã QR Check-in Tại Cửa
              </span>
              <span className="text-[11px] font-mono text-stone-900 font-bold">
                {reservation.bookingCode}
              </span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE TABLE SERVICE & REVIEW QUICK ACCESS - Hidden during print */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-stone-100 border-b border-stone-800 print:hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center md:text-left">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    Dịch Vụ Tại Bàn {reservation.tableName}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs text-stone-300 mt-0.5">
                  Bấm chuông gọi phục vụ, gọi thêm rượu vang/món mới hoặc gửi đánh giá trải nghiệm ẩm thực.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setIsSelfServiceOpen(true)}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>Gọi Phục Vụ / Thêm Món</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReviewOpen(true)}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-xs border border-amber-500/40 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Star className="w-4 h-4 fill-amber-400" />
                <span>Đánh Giá Bữa Ăn</span>
              </button>
            </div>
          </div>
        </div>

        {/* RESERVATION KEY DETAILS GRID */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Arrival Time */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="text-[11px] uppercase font-bold text-stone-400 flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Giờ Hẹn Check-in</span>
              </div>
              <div className="text-xl font-extrabold text-stone-900">
                {reservation.arrivalTime}
              </div>
              <div className="text-xs text-stone-600 mt-0.5 capitalize">
                {formattedDate}
              </div>
            </div>

            {/* Table & Area */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="text-[11px] uppercase font-bold text-stone-400 flex items-center gap-1 mb-1">
                <Armchair className="w-3.5 h-3.5 text-amber-600" />
                <span>Bàn Chỉ Định</span>
              </div>
              <div className="text-base font-extrabold text-stone-900 truncate" title={reservation.tableName}>
                {reservation.tableName}
              </div>
              <div className="text-xs text-amber-800 font-semibold mt-0.5">
                Khu vực: {reservation.tableArea || 'Sảnh Chính'}
              </div>
            </div>

            {/* Guest Count & Occasion */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="text-[11px] uppercase font-bold text-stone-400 flex items-center gap-1 mb-1">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                <span>Số Lượng Khách</span>
              </div>
              <div className="text-xl font-extrabold text-stone-900">
                {reservation.guestCount} Khách
              </div>
              <div className="text-xs text-stone-600 mt-0.5">
                {reservation.occasion ? `Dịp: ${reservation.occasion}` : 'Bữa ăn tiêu chuẩn'}
              </div>
            </div>

            {/* Customer Info */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="text-[11px] uppercase font-bold text-stone-400 flex items-center gap-1 mb-1">
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>Khách Đặt Bàn</span>
              </div>
              <div className="text-base font-extrabold text-stone-900 truncate" title={reservation.customerName}>
                {reservation.customerName}
              </div>
              <div className="text-xs text-stone-600 mt-0.5 font-mono">
                {reservation.customerPhone}
              </div>
            </div>
          </div>

          {/* Special Requests Notice if any */}
          {reservation.specialRequests && (
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900">Yêu cầu đặc biệt của quý khách: </span>
                <span className="italic">"{reservation.specialRequests}"</span>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Đội ngũ phục vụ đã ghi nhận và sẽ chuẩn bị chu đáo trước giờ quý khách đến.
                </p>
              </div>
            </div>
          )}

          {/* PRE-ORDERED MENU BILL TABLE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-600" />
                <h3 className="font-serif-heading text-base font-bold text-stone-900">
                  Bảng Kê Thực Đơn Chọn Trước (Pre-order Bill)
                </h3>
              </div>
              <span className="text-xs text-stone-500 font-medium">
                {reservation.selectedDishes?.length || 0} món đã chọn
              </span>
            </div>

            {reservation.selectedDishes && reservation.selectedDishes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px] tracking-wider">
                      <th className="py-2 font-bold">STT</th>
                      <th className="py-2 font-bold">Món Ăn</th>
                      <th className="py-2 font-bold text-center">SL</th>
                      <th className="py-2 font-bold text-right">Đơn Giá</th>
                      <th className="py-2 font-bold text-right">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {reservation.selectedDishes.map((item, idx) => (
                      <tr key={item.dish.id || idx} className="hover:bg-stone-50/60">
                        <td className="py-2.5 text-stone-400 font-mono">{idx + 1}</td>
                        <td className="py-2.5 font-medium text-stone-900">
                          <div className="font-bold">{item.dish.name}</div>
                          <div className="text-[10px] text-stone-400">{item.dish.category}</div>
                        </td>
                        <td className="py-2.5 text-center font-bold text-stone-800">
                          x{item.quantity}
                        </td>
                        <td className="py-2.5 text-right text-stone-600 font-mono">
                          {formatVND(item.dish.price)}
                        </td>
                        <td className="py-2.5 text-right font-bold text-stone-900 font-mono">
                          {formatVND(item.dish.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-stone-50 text-center text-xs text-stone-500">
                Quý khách chưa đặt trước món ăn. Nhân viên sẽ phục vụ cuốn thực đơn cao cấp trực tiếp tại bàn khi quý khách đến.
              </div>
            )}

            {/* BILL TOTALS SUMMARY BOX */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Tổng tiền thực đơn chọn trước:</span>
                <span className="font-bold text-stone-900 font-mono">{formatVND(subTotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Ưu đãi áp dụng ({reservation.voucherCode || 'Voucher'}):</span>
                  <span className="font-bold font-mono">-{formatVND(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Khoản tiền đặt cọc đã ghi nhận:</span>
                <span className="font-bold text-amber-800 font-mono">
                  {depositPaid > 0 ? formatVND(depositPaid) : 'Không yêu cầu cọc'}
                </span>
              </div>

              <div className="border-t border-stone-200 pt-2.5 mt-2 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-stone-900 uppercase tracking-wide block">
                    Dự kiến thanh toán tại bàn:
                  </span>
                  <span className="text-[10px] text-stone-500">
                    (Thanh toán sau khi kết thúc bữa ăn cùng các dịch vụ gọi thêm)
                  </span>
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-amber-600 font-mono">
                  {formatVND(remainingEstimate)}
                </div>
              </div>
            </div>

            {reservation.pointsEarned && reservation.pointsEarned > 0 ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs text-amber-900">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Điểm thưởng tích lũy dự kiến cho bữa ăn này:</span>
                </span>
                <strong className="font-bold text-amber-700">+{reservation.pointsEarned} điểm</strong>
              </div>
            ) : null}
          </div>

          {/* CHECK-IN PROTOCOL STEPS */}
          <div className="border-t border-dashed border-stone-300 pt-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              <span>Quy Trình 3 Bước Check-in Thuận Tiện Tại Nhà Hàng</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-1">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <div className="font-bold text-stone-900">Đến Cửa Nhà Hàng</div>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  Tại số 128 Nguyễn Huệ, xuất trình mã QR hoặc đọc mã <strong className="text-stone-900 font-mono">#{reservation.bookingCode}</strong> cho nhân viên lễ tân.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-1">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <div className="font-bold text-stone-900">Nhận Bàn Chuẩn Bị Sẵn</div>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  Nhân viên kiểm tra hệ thống và dẫn quý khách trực tiếp vào vị trí <strong>{reservation.tableName}</strong> đã bố trí chu đáo.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-1">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <div className="font-bold text-stone-900">Thưởng Thức Ẩm Thực</div>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  Bếp trưởng lập tức chuẩn bị thực đơn đã chọn trước. Quý khách thưởng thức trọn vẹn không gian sang trọng và lãng mạn.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BILL FOOTER */}
        <div className="p-6 bg-stone-100 border-t border-stone-200 text-center text-stone-500 text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-stone-600 font-medium">
            <span>Quý khách cần hỗ trợ?</span>
            <span className="text-amber-800 font-bold">Hotline lễ tân: 0903.888.999</span>
            <span>•</span>
            <span className="text-stone-600">Email: reservation@legourmet.vn</span>
          </div>
          <p className="text-[11px] text-stone-400">
            Cảm ơn Quý khách đã lựa chọn Le Gourmet Bistro. Chúng tôi rất hân hạnh được phục vụ Quý khách!
          </p>
        </div>
      </div>

      {/* BOTTOM ACTION BUTTONS - Hidden during print */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 print:hidden">
        {onOpenEmailPreview && (
          <button
            type="button"
            id="btn-view-bill-email"
            onClick={() => onOpenEmailPreview(reservation)}
            className="px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md transition cursor-pointer"
          >
            <Mail className="w-4 h-4 text-amber-400" />
            <span>Xem Email Xác Nhận Đã Gửi</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleOpenGoogleMaps}
          className="px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs sm:text-sm flex items-center gap-2 border border-stone-300 transition cursor-pointer"
        >
          <Compass className="w-4 h-4 text-amber-600" />
          <span>Chỉ Đường Đến Nhà Hàng</span>
        </button>

        {showNewBookingBtn && onResetBooking && (
          <button
            type="button"
            onClick={onResetBooking}
            className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-amber-900/20 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Đặt Bàn Mới</span>
          </button>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs sm:text-sm transition cursor-pointer"
          >
            Đóng
          </button>
        )}
      </div>

      {/* Table Self-Service & Digital Waiter Bell Modal */}
      <TableSelfServiceModal
        isOpen={isSelfServiceOpen}
        onClose={() => setIsSelfServiceOpen(false)}
        initialTableId={reservation.tableId}
        initialReservation={reservation}
        onOpenReviewModal={() => setIsReviewOpen(true)}
      />

      {/* Customer Review & CSAT Rating Modal */}
      <CustomerReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        bookingCode={reservation.bookingCode}
        customerName={reservation.customerName}
        customerPhone={reservation.customerPhone}
        tableName={reservation.tableName}
        tableId={reservation.tableId}
        reservationId={reservation.id}
      />
    </div>
  );
};
