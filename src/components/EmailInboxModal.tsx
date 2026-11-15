import React, { useState, useEffect, useMemo } from 'react';
import { X, Mail, Search, Trash2, ExternalLink, CalendarClock, Check, AlertTriangle } from 'lucide-react';
import { SentEmailLog, Reservation } from '../types';
import { generateBookingEmailHtml } from '../services/storage';

interface EmailInboxModalProps {
  emailLogs: SentEmailLog[];
  reservations?: Reservation[];
  onClose: () => void;
  onViewEmailDetail: (log: SentEmailLog) => void;
  onDeleteLog?: (logId: string) => void;
  onClearAllLogs?: () => void;
}

export const EmailInboxModal: React.FC<EmailInboxModalProps> = ({
  emailLogs,
  reservations = [],
  onClose,
  onViewEmailDetail,
  onDeleteLog,
  onClearAllLogs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'booking_confirmation' | 'status_update' | 'cancellation'>('all');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(emailLogs[0]?.id || null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const sortedLogs = useMemo(() => {
    return [...(emailLogs || [])].sort(
      (a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime()
    );
  }, [emailLogs]);

  const query = (searchTerm || '').trim().toLowerCase();

  const filteredLogs = useMemo(() => {
    return sortedLogs.filter((log) => {
      if (!log) return false;
      const logType = (log.type || 'booking_confirmation') as string;
      const matchesType =
        typeFilter === 'all' ||
        (typeFilter === 'booking_confirmation' && (logType === 'booking_confirmation' || logType === 'confirmation')) ||
        (typeFilter === 'status_update' && logType === 'status_update') ||
        (typeFilter === 'cancellation' && (logType === 'cancellation' || (log.subject || '').toLowerCase().includes('hủy')));

      if (!matchesType) return false;

      if (!query) return true;
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
  }, [sortedLogs, typeFilter, query]);

  useEffect(() => {
    if (filteredLogs.length === 0) {
      setSelectedLogId(null);
      return;
    }
    const stillExists = selectedLogId && filteredLogs.some((l) => l.id === selectedLogId);
    if (!stillExists) {
      setSelectedLogId(filteredLogs[0].id);
    }
  }, [filteredLogs, selectedLogId]);

  const selectedLog = useMemo(
    () => filteredLogs.find((l) => l.id === selectedLogId) || filteredLogs[0] || null,
    [filteredLogs, selectedLogId]
  );

  const matchedReservation = useMemo(() => {
    if (!selectedLog) return undefined;
    return reservations.find(
      (r) =>
        (selectedLog.reservationId && r.id === selectedLog.reservationId) ||
        (selectedLog.bookingCode && r.bookingCode === selectedLog.bookingCode)
    );
  }, [selectedLog, reservations]);

  const resolvedEmailHtml = useMemo(() => {
    if (!selectedLog) return '';
    const rawBody = (selectedLog.htmlContent || (selectedLog as any).previewBody || '').trim();
    if (rawBody && /<[a-z][\s\S]*>/i.test(rawBody)) {
      return rawBody;
    }
    if (matchedReservation) {
      return generateBookingEmailHtml(matchedReservation);
    }
    const displayName = selectedLog.toName || (selectedLog as any).recipientName || 'Quý Khách';
    const displayEmail = selectedLog.toEmail || (selectedLog as any).recipientEmail || '';
    const displayDate = selectedLog.sentAt ? new Date(selectedLog.sentAt).toLocaleString('vi-VN') : '';
    return `
      <div style="font-family: Arial, sans-serif; color: #1c1917; max-width: 560px; margin: 0 auto;">
        <div style="background: #1c1917; color: #f59e0b; padding: 14px 18px; border-radius: 10px 10px 0 0; text-align: center;">
          <strong style="font-size: 15px; letter-spacing: 1px;">LE GOURMET BISTRO</strong>
        </div>
        <div style="padding: 18px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 10px 10px; background: #ffffff;">
          <p style="margin: 0 0 8px;">Kính gửi <strong>${displayName}</strong> (${displayEmail}),</p>
          <p style="margin: 0 0 12px; font-size: 13px; color: #44403c; line-height: 1.6;">
            ${rawBody || selectedLog.subject || 'Thông báo tự động từ hệ thống đặt bàn Le Gourmet Bistro.'}
          </p>
          <div style="padding: 10px 12px; background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; font-size: 12px; color: #57534e;">
            <div><strong>Mã đặt chỗ:</strong> #${selectedLog.bookingCode || 'N/A'}</div>
            <div style="margin-top: 4px;"><strong>Thời gian gửi:</strong> ${displayDate}</div>
          </div>
        </div>
      </div>
    `;
  }, [selectedLog, matchedReservation]);

  const getTypeBadge = (log: SentEmailLog) => {
    const t = log.type || 'booking_confirmation';
    if (t === 'cancellation' || (log.subject || '').toLowerCase().includes('hủy')) {
      return { label: 'Hủy bàn', cls: 'bg-rose-100 text-rose-700 border-rose-200' };
    }
    if (t === 'status_update') {
      return { label: 'Cập nhật', cls: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
    return { label: 'Xác nhận', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col h-[86vh]">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-4 flex flex-wrap items-center justify-between gap-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Nhật Ký Email Tự Động Đã Gửi (Sent Email Logs)</h3>
              <p className="text-xs text-stone-400">
                Tổng cộng {sortedLogs.length} email hệ thống đã gửi (mới nhất & lịch sử cũ hơn)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {sortedLogs.length > 0 && onClearAllLogs && (
              confirmClearAll ? (
                <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/40 px-2.5 py-1 rounded-lg text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-200">Xác nhận xóa hết?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmClearAll(false);
                      setSelectedLogId(null);
                      onClearAllLogs();
                    }}
                    className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                  >
                    Xóa
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(false)}
                    className="px-2 py-0.5 rounded bg-stone-700 hover:bg-stone-600 text-stone-200 cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(true)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="Xóa toàn bộ lịch sử email đã gửi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Xóa Hết Nhật Ký</span>
                </button>
              )
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
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">
          {/* Left: Email list (5 cols) */}
          <div className="md:col-span-5 border-r border-stone-200 flex flex-col h-full bg-stone-50 min-h-0">
            <div className="p-3 border-b border-stone-200 bg-white space-y-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo email, tên, mã đặt chỗ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50"
                />
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'all', label: `Tất cả (${sortedLogs.length})` },
                  { id: 'booking_confirmation', label: 'Xác nhận' },
                  { id: 'status_update', label: 'Cập nhật' },
                  { id: 'cancellation', label: 'Hủy bàn' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setTypeFilter(chip.id as any)}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                      typeFilter === chip.id
                        ? 'bg-stone-900 text-amber-400'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
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
                  const badge = getTypeBadge(log);
                  const sentDateObj = log.sentAt ? new Date(log.sentAt) : null;
                  const formattedDateTime =
                    sentDateObj && !isNaN(sentDateObj.getTime())
                      ? sentDateObj.toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '';
                  return (
                    <div
                      key={log.id}
                      onClick={() => {
                        setSelectedLogId(log.id);
                        setConfirmDeleteId(null);
                      }}
                      className={`p-3 cursor-pointer transition-colors text-xs relative group ${
                        isSelected
                          ? 'bg-amber-50 border-l-4 border-amber-600'
                          : 'hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-stone-900 truncate">
                            {log.toName || (log as any).recipientName || 'Khách Hàng'}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold shrink-0 ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-stone-400">{formattedDateTime}</span>
                          {onDeleteLog && (
                            confirmDeleteId === log.id ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(null);
                                  onDeleteLog(log.id);
                                }}
                                className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                                title="Xác nhận xóa"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(log.id);
                                }}
                                className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Xóa email này khỏi nhật ký"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )
                          )}
                        </div>
                      </div>
                      <div className="text-[11px] text-amber-800 font-semibold mb-0.5 truncate">
                        #{log.bookingCode || 'BK'} • {log.toEmail || (log as any).recipientEmail || ''}
                      </div>
                      <p className="text-[11px] text-stone-600 line-clamp-1">
                        {log.subject || 'Thông Báo Đặt Bàn'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Selected email preview (7 cols) */}
          <div className="md:col-span-7 flex flex-col h-full bg-white overflow-hidden min-h-0">
            {selectedLog ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden min-h-0">
                {/* Email Meta Bar */}
                <div className="p-4 border-b border-stone-200 bg-stone-50/70 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-stone-900">
                      {selectedLog.subject || 'Thông Báo Đặt Bàn'}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Gửi thành công
                      </span>

                      {matchedReservation && (
                        <button
                          type="button"
                          onClick={() => onViewEmailDetail(selectedLog)}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                          title="Mở trình xem phiếu xác nhận đầy đủ & in ấn"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Mở Phiếu & In</span>
                        </button>
                      )}

                      {onDeleteLog && (
                        confirmDeleteId === selectedLog.id ? (
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDeleteId(null);
                              onDeleteLog(selectedLog.id);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Xác nhận xóa</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(selectedLog.id)}
                            className="px-2.5 py-1 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="Xóa email này khỏi nhật ký"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Xóa</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-stone-600 flex flex-wrap gap-4 pt-1">
                    <span>
                      <strong>Đến:</strong> {selectedLog.toName || (selectedLog as any).recipientName || 'Khách Hàng'} &lt;{selectedLog.toEmail || (selectedLog as any).recipientEmail}&gt;
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="w-3.5 h-3.5 text-amber-700" />
                      <strong>Thời gian:</strong>{' '}
                      {selectedLog.sentAt ? new Date(selectedLog.sentAt).toLocaleString('vi-VN') : ''}
                    </span>
                  </div>
                </div>

                {/* Email Body Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-stone-100/60">
                  <div
                    className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-xs max-w-xl mx-auto text-stone-800 text-sm"
                    dangerouslySetInnerHTML={{ __html: resolvedEmailHtml }}
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
