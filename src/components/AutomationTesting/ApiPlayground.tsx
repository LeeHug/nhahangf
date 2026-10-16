import React, { useState } from 'react';
import { Send, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { getRelativeDate } from './testDefinitions';

export const ApiPlayground: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'create_booking' | 'check_table' | 'patch_status'>('create_booking');
  const [customerName, setCustomerName] = useState('[TEST] Nguyễn Văn Thử Nghiệm');
  const [customerPhone, setCustomerPhone] = useState('0912345678');
  const [customerEmail, setCustomerEmail] = useState('tester.local@legourmet.vn');
  const [guestCount, setGuestCount] = useState<number>(4);
  const [bookingDate, setBookingDate] = useState<string>(getRelativeDate(2));
  const [arrivalTime, setArrivalTime] = useState<string>('18:30');
  const [tableId, setTableId] = useState<string>('T-01');
  const [targetStatus, setTargetStatus] = useState<string>('checked_in');
  const [reservationIdInput, setReservationIdInput] = useState<string>('BK-1001');

  // Response state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleDispatch = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseBody(null);
    const start = performance.now();

    try {
      if (selectedEndpoint === 'create_booking') {
        const payload = {
          customerName,
          customerPhone,
          customerEmail,
          guestCount: Number(guestCount),
          bookingDate,
          arrivalTime,
          tableId,
          selectedDishes: [
            { dish: { id: 'dish-01', name: 'Bò Wagyu A5', price: 1650000 }, quantity: 1 }
          ]
        };

        const res = await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({ message: 'Không thể parse JSON' }));
        setResponseStatus(res.status);
        setResponseBody(data);
      } else if (selectedEndpoint === 'check_table') {
        const res = await fetch(`/api/tables/availability?date=${bookingDate}&time=${arrivalTime}`);
        const data = await res.json().catch(() => ({}));
        setResponseStatus(res.status);
        setResponseBody(data);
      } else if (selectedEndpoint === 'patch_status') {
        const res = await fetch(`/api/reservations/${reservationIdInput}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: targetStatus })
        });
        const data = await res.json().catch(() => ({}));
        setResponseStatus(res.status);
        setResponseBody(data);
      }
    } catch (err: any) {
      setResponseStatus(500);
      setResponseBody({ error: err?.message || 'Lỗi kết nối tới local server' });
    } finally {
      setResponseTime(Math.round(performance.now() - start));
      setIsLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (responseBody) {
      navigator.clipboard.writeText(JSON.stringify(responseBody, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Hộp Thử Nghiệm API Trực Tiếp (Interactive API Playground)
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Gửi yêu cầu kiểm thử tùy biến trực tiếp đến Local Server để xác thực phản hồi thời gian thực.
          </p>
        </div>

        {/* Endpoint Selector Tabs */}
        <div className="flex bg-stone-800 p-1 rounded-xl text-xs font-medium border border-stone-700/60">
          <button
            onClick={() => setSelectedEndpoint('create_booking')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedEndpoint === 'create_booking'
                ? 'bg-amber-600 text-stone-950 font-bold shadow'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            POST /api/reservations
          </button>
          <button
            onClick={() => setSelectedEndpoint('check_table')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedEndpoint === 'check_table'
                ? 'bg-amber-600 text-stone-950 font-bold shadow'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            GET /api/tables/availability
          </button>
          <button
            onClick={() => setSelectedEndpoint('patch_status')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedEndpoint === 'patch_status'
                ? 'bg-amber-600 text-stone-950 font-bold shadow'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            PATCH /status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Request Input Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Cấu Hình Tham Số Kiểm Thử (Payload)
          </div>

          {selectedEndpoint === 'create_booking' && (
            <div className="space-y-3 bg-stone-950/60 p-4 rounded-xl border border-stone-800 text-xs">
              <div>
                <label className="block text-stone-400 mb-1 font-semibold">Tên Khách Hàng</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-400 mb-1 font-semibold">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1 font-semibold">Số Lượng Khách</label>
                  <input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-semibold">Email Khách</label>
                <input
                  type="text"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-stone-400 mb-1 font-semibold">Ngày Đến</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2 py-2 text-stone-100 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1 font-semibold">Giờ Đến</label>
                  <input
                    type="text"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2 py-2 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1 font-semibold">Mã Bàn</label>
                  <input
                    type="text"
                    value={tableId}
                    onChange={(e) => setTableId(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2 py-2 text-stone-100 focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedEndpoint === 'check_table' && (
            <div className="space-y-3 bg-stone-950/60 p-4 rounded-xl border border-stone-800 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-400 mb-1 font-semibold">Ngày Kiểm Tra</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2 py-2 text-stone-100 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1 font-semibold">Khung Giờ</label>
                  <input
                    type="text"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2 py-2 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedEndpoint === 'patch_status' && (
            <div className="space-y-3 bg-stone-950/60 p-4 rounded-xl border border-stone-800 text-xs">
              <div>
                <label className="block text-stone-400 mb-1 font-semibold">Mã Đơn Hoặc ID Đặt Bàn</label>
                <input
                  type="text"
                  value={reservationIdInput}
                  onChange={(e) => setReservationIdInput(e.target.value)}
                  placeholder="BK-XXXX hoặc id..."
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-semibold">Trạng Thái Muốn Chuyển Đổi</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="pending">pending (Chờ xử lý)</option>
                  <option value="confirmed">confirmed (Đã xác nhận)</option>
                  <option value="checked_in">checked_in (Khách đã nhận bàn)</option>
                  <option value="completed">completed (Hoàn tất bữa ăn)</option>
                  <option value="cancelled">cancelled (Hủy đơn)</option>
                  <option value="invalid_fake_state">invalid_fake_state (Trạng thái phi chuẩn test lỗi)</option>
                </select>
              </div>
            </div>
          )}

          <button
            onClick={handleDispatch}
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang gửi yêu cầu...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Gửi Kiểm Thử Tức Thì Đến Server</span>
              </>
            )}
          </button>
        </div>

        {/* Live Response Output Viewer */}
        <div className="lg:col-span-7 bg-stone-950 rounded-xl border border-stone-800 p-4 font-mono flex flex-col h-[380px]">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-400 font-bold">Phản Hồi (Server Response):</span>
              {responseStatus !== null && (
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    responseStatus >= 200 && responseStatus < 300
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : responseStatus === 409
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  HTTP {responseStatus}
                </span>
              )}
              {responseTime !== null && (
                <span className="text-stone-500 text-[11px]">({responseTime}ms)</span>
              )}
            </div>

            {responseBody && (
              <button
                onClick={handleCopyResponse}
                className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{copied ? 'Đã chép' : 'Chép JSON'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto text-xs text-stone-300 leading-relaxed scrollbar-thin scrollbar-thumb-stone-800">
            {responseBody ? (
              <pre className="text-emerald-400 whitespace-pre-wrap break-all">
                {JSON.stringify(responseBody, null, 2)}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-stone-600 text-xs text-center px-6">
                Bấm nút "Gửi Kiểm Thử Tức Thì Đến Server" để nhận kết quả JSON và mã phản hồi thực tế từ backend.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
