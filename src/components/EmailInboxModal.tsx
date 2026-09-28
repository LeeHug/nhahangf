import React, { useState } from 'react';
import { X, Mail, Search, Eye, Calendar, ExternalLink, Trash2 } from 'lucide-react';
import { SentEmailLog } from '../types';

interface EmailInboxModalProps {
  emailLogs: SentEmailLog[];
  onClose: () => void;
  onViewEmailDetail: (log: SentEmailLog) => void;
  onDeleteLog?: (logId: string) => void;
  onClearAllLogs?: () => void;
}

export const EmailInboxModal: React.FC<EmailInboxModalProps> = ({
  emailLogs,
  onClose,
  onViewEmailDetail,
  onDeleteLog,
  onClearAllLogs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<SentEmailLog | null>(emailLogs[0] || null);

  const query = (searchTerm || '').trim().toLowerCase();

  const filteredLogs = (emailLogs || []).filter((log) => {
    if (!log) return false;
    const toName = (log.toName || (log as any).recipientName || '').toLowerCase();
    const toEmail = (log.toEmail || (log as any).recipientEmail || '').toLowerCase();
    const bookingCode = (log.bookingCode || '').toLowerCase();
    const subject = (log.subject || '').toLowerCase();

    return (
      toName.includes(query) ||
      toEmail.includes(query) ||
      bookingCode.includes(query) ||
      subject.includes(query)
    );
  });

  const handleDelete = (e: React.MouseEvent, logId: string) => {
    e.stopPropagation();
    if (window.confirm('Quý khách có chắc chắn muốn xóa bản ghi email xác nhận này khỏi nhật ký?')) {
      if (selectedLog?.id === logId) {
        const remaining = emailLogs.filter(l => l.id !== logId);
        setSelectedLog(remaining[0] || null);
      }
      onDeleteLog?.(logId);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Cảnh báo: Bạn có chắc chắn muốn xóa TOÀN BỘ nhật ký email đã gửi không? Hành động này không thể hoàn tác.')) {
      setSelectedLog(null);
      onClearAllLogs?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Nhật Ký Email Tự Động Đã Gửi (Sent Email Logs)</h3>
              <p className="text-xs text-stone-400">Tổng cộng {emailLogs.length} email hệ thống đã chuyển giao tự động tới khách hàng</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {emailLogs.length > 0 && onClearAllLogs && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                title="Xóa toàn bộ lịch sử email đã gửi"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xóa Hết Nhật Ký</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body with 2-panel layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left: Email list (5 cols) */}
          <div className="md:col-span-5 border-r border-stone-200 flex flex-col h-full bg-stone-50">
            <div className="p-3 border-b border-stone-200 bg-white">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo email, tên, mã đặt chỗ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
              {filteredLogs.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-400">
                  Không tìm thấy email nào phù hợp.
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const isSelected = selectedLog?.id === log.id;
                  return (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`p-3 cursor-pointer transition-colors text-xs relative group ${
                        isSelected
                          ? 'bg-amber-50 border-l-4 border-amber-600'
                          : 'hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-stone-900">{log.toName || (log as any).recipientName || 'Khách Hàng'}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-stone-400">
                            {log.sentAt ? new Date(log.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                          {onDeleteLog && (
                            <button
                              type="button"
                              onClick={(e) => handleDelete(e, log.id)}
                              className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Xóa email này khỏi nhật ký"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-[11px] text-amber-800 font-semibold mb-0.5">
                        #{log.bookingCode || 'BK'} • {log.toEmail || (log as any).recipientEmail || ''}
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-1">{log.subject || 'Thông Báo Đặt Bàn'}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Selected email preview (7 cols) */}
          <div className="md:col-span-7 flex flex-col h-full bg-white overflow-hidden">
            {selectedLog ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Email Meta Bar */}
                <div className="p-4 border-b border-stone-200 bg-stone-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-stone-900">{selectedLog.subject || 'Thông Báo Đặt Bàn'}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Gửi thành công
                      </span>
                      {onDeleteLog && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, selectedLog.id)}
                          className="px-2.5 py-1 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="Xóa email này khỏi nhật ký"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Xóa</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-stone-600 flex flex-wrap gap-4 pt-1">
                    <span><strong>Đến:</strong> {selectedLog.toName || (selectedLog as any).recipientName || 'Khách Hàng'} &lt;{selectedLog.toEmail || (selectedLog as any).recipientEmail}&gt;</span>
                    <span><strong>Thời gian:</strong> {selectedLog.sentAt ? new Date(selectedLog.sentAt).toLocaleString('vi-VN') : ''}</span>
                  </div>
                </div>

                {/* Email Body Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-stone-100/50">
                  <div
                    className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs max-w-xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: selectedLog.htmlContent || (selectedLog as any).previewBody || '' }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-xs text-stone-400">
                Chọn một email ở danh sách bên trái để xem nội dung chi tiết.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
