import React, { useState } from 'react';
import { getOffsetDateString } from '../data/testCasesData';
import { Send, Sparkles, X, CheckCircle2, AlertCircle, Clock, Copy, Check } from 'lucide-react';

interface InteractivePlaygroundProps {
  isOpen: boolean;
  onClose: () => void;
  baseUrl: string;
}

export const InteractivePlayground: React.FC<InteractivePlaygroundProps> = ({
  isOpen,
  onClose,
  baseUrl
}) => {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>('POST');
  const [endpoint, setEndpoint] = useState('/api/reservations');
  const [requestBody, setRequestBody] = useState(JSON.stringify({
    tableId: 1,
    customerName: 'Kiểm Thử Thủ Công',
    customerPhone: '0909999888',
    customerEmail: 'manual.tester@test.vn',
    guestCount: 2,
    bookingDate: getOffsetDateString(1),
    bookingTime: '19:00',
    specialRequests: 'Thử nghiệm tính năng sandbox'
  }, null, 2));

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (presetType: string) => {
    switch (presetType) {
      case 'valid_booking':
        setMethod('POST');
        setEndpoint('/api/reservations');
        setRequestBody(JSON.stringify({
          tableId: 2,
          customerName: 'Nguyễn Văn Hợp Lệ',
          customerPhone: '0901234567',
          customerEmail: 'valid@test.vn',
          guestCount: 2,
          bookingDate: getOffsetDateString(2),
          bookingTime: '18:30'
        }, null, 2));
        break;

      case 'conflict_booking':
        setMethod('POST');
        setEndpoint('/api/reservations');
        setRequestBody(JSON.stringify({
          tableId: 2,
          customerName: 'Khách Thử Trùng Lịch',
          customerPhone: '0901234568',
          customerEmail: 'conflict@test.vn',
          guestCount: 2,
          bookingDate: getOffsetDateString(2),
          bookingTime: '18:30'
        }, null, 2));
        break;

      case 'xss_payload':
        setMethod('POST');
        setEndpoint('/api/reservations');
        setRequestBody(JSON.stringify({
          tableId: 3,
          customerName: '<script>alert("XSS")</script>',
          customerPhone: '0901234569',
          customerEmail: 'xss@test.vn',
          guestCount: 2,
          bookingDate: getOffsetDateString(2),
          bookingTime: '19:00'
        }, null, 2));
        break;

      case 'sqli_lookup':
        setMethod('POST');
        setEndpoint('/api/reservations/lookup');
        setRequestBody(JSON.stringify({
          phone: "' OR '1'='1 --"
        }, null, 2));
        break;

      case 'check_availability':
        setMethod('GET');
        setEndpoint(`/api/tables/availability?date=${getOffsetDateString(1)}&time=19:00&guests=4`);
        setRequestBody('');
        break;
    }
  };

  const handleSend = async () => {
    setIsLoading(true);
    setResponse(null);
    const start = performance.now();

    const fullUrl = `${baseUrl.replace(/\/$/, '')}${endpoint}`;

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };

      const options: RequestInit = {
        method,
        headers
      };

      if (method !== 'GET' && method !== 'DELETE' && requestBody.trim()) {
        headers['Content-Type'] = 'application/json';
        options.body = requestBody;
      }

      const res = await fetch(fullUrl, options);
      const latency = Math.round(performance.now() - start);
      setDuration(latency);

      let bodyData: any = null;
      try {
        bodyData = await res.json();
      } catch {
        bodyData = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        body: bodyData,
        headers: Object.fromEntries(res.headers.entries())
      });
    } catch (err: any) {
      const latency = Math.round(performance.now() - start);
      setDuration(latency);
      setResponse({
        status: 0,
        statusText: 'Network Error',
        body: { error: err.message || 'Không thể kết nối tới server' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-100">
                Interactive API Playground — Thử Nghiệm Tuỳ Ý
              </h3>
              <p className="text-xs text-stone-400">
                Gửi request tùy chỉnh trực tiếp vào backend để kiểm tra các trường hợp ngoại lệ theo ý muốn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Bar */}
        <div className="px-6 py-2.5 bg-stone-950/40 border-b border-stone-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-400 text-[11px] font-semibold">Tải mẫu kịch bản nhanh:</span>
          <button
            onClick={() => handleApplyPreset('valid_booking')}
            className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-emerald-400 text-[11px] border border-stone-700"
          >
            Đặt Bàn Chuẩn
          </button>
          <button
            onClick={() => handleApplyPreset('conflict_booking')}
            className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-rose-400 text-[11px] border border-stone-700"
          >
            Thử Trùng Bàn
          </button>
          <button
            onClick={() => handleApplyPreset('xss_payload')}
            className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-purple-400 text-[11px] border border-stone-700"
          >
            XSS Injection
          </button>
          <button
            onClick={() => handleApplyPreset('sqli_lookup')}
            className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-amber-400 text-[11px] border border-stone-700"
          >
            SQLi Tra Cứu
          </button>
          <button
            onClick={() => handleApplyPreset('check_availability')}
            className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-sky-400 text-[11px] border border-stone-700"
          >
            Kiểm Tra Bàn Trống
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* Method + URL Input */}
          <div className="flex items-center gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-amber-400 focus:outline-none"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>

            <div className="flex-1 flex items-center bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 font-mono text-xs">
              <span className="text-stone-400 mr-1 select-none">{baseUrl.replace(/\/$/, '')}</span>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="flex-1 bg-transparent text-stone-100 focus:outline-none"
                placeholder="/api/reservations"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-950/40 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isLoading ? 'Đang gửi...' : 'Gửi Request'}
            </button>
          </div>

          {/* Request Body Editor */}
          {method !== 'GET' && method !== 'DELETE' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-400 block">
                Request JSON Body:
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={7}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 font-mono text-xs text-amber-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          )}

          {/* Response Viewer */}
          {response && (
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-stone-400 font-semibold">Kết quả:</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    response.status >= 200 && response.status < 300
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    HTTP {response.status} {response.statusText}
                  </span>
                  {duration !== null && (
                    <span className="text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {duration}ms
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(response.body, null, 2));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Đã chép' : 'Sao chép kết quả'}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-stone-950 border border-stone-800 font-mono text-xs text-sky-200 overflow-x-auto max-h-72">
                {typeof response.body === 'object'
                  ? JSON.stringify(response.body, null, 2)
                  : String(response.body)}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-800 bg-stone-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
