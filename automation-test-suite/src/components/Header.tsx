import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Trash2, 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Globe, 
  Server
} from 'lucide-react';

interface HeaderProps {
  baseUrl: string;
  onBaseUrlChange: (url: string) => void;
  isRunning: boolean;
  onRunAllSequential: () => void;
  onStop: () => void;
  onRerunFailed: () => void;
  onResetSandbox: () => void;
  onOpenMatrix: () => void;
  onOpenPlayground: () => void;
  serverPingStatus: { checked: boolean; ok: boolean; message: string; latencyMs: number } | null;
  onPingServer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  baseUrl,
  onBaseUrlChange,
  isRunning,
  onRunAllSequential,
  onStop,
  onRerunFailed,
  onResetSandbox,
  onOpenMatrix,
  onOpenPlayground,
  serverPingStatus,
  onPingServer
}) => {
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState(baseUrl);

  const handleApplyUrl = () => {
    onBaseUrlChange(tempUrl);
    setIsEditingUrl(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30 text-stone-950 font-black text-xl">
              LG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-stone-100 tracking-tight">
                  Le Gourmet Bistro — QA Automation Suite
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Tách Riêng Độc Lập
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  100 Test Cases
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Hệ thống kiểm thử tự động toàn diện: Đặt bàn, Chống trùng, Xác thực RBAC, Trạng thái, Dịch vụ tại bàn, Bảo mật dữ liệu
              </p>
            </div>
          </div>

          {/* Target Host Config & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Target Server Input */}
            <div className="flex items-center gap-1.5 bg-stone-950/80 px-2.5 py-1 rounded-lg border border-stone-800 text-xs">
              <Server className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-stone-400">Target:</span>
              {isEditingUrl ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    className="bg-stone-900 border border-amber-500/50 rounded px-2 py-0.5 text-xs text-stone-100 font-mono w-44 focus:outline-none"
                    placeholder="http://localhost:3000"
                  />
                  <button
                    onClick={handleApplyUrl}
                    className="px-2 py-0.5 rounded bg-amber-500 text-stone-950 font-semibold text-[11px]"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => { setTempUrl(baseUrl); setIsEditingUrl(false); }}
                    className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 text-[11px]"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingUrl(true)}
                  className="font-mono text-amber-300 hover:underline max-w-[170px] truncate"
                  title="Bấm để đổi URL máy chủ"
                >
                  {baseUrl}
                </button>
              )}

              {/* Ping status badge */}
              <button
                onClick={onPingServer}
                className="ml-1 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 hover:bg-stone-800 transition"
                title="Kiểm tra kết nối tới Server"
              >
                {serverPingStatus ? (
                  serverPingStatus.ok ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> {serverPingStatus.latencyMs}ms
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-400 font-medium">
                      <XCircle className="w-3 h-3" /> Mất kết nối
                    </span>
                  )
                ) : (
                  <span className="text-stone-400 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Ping
                  </span>
                )}
              </button>
            </div>

            {/* Run / Stop Actions */}
            {isRunning ? (
              <button
                onClick={onStop}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-lg shadow-rose-950/40"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                Dừng Kiểm Thử
              </button>
            ) : (
              <button
                onClick={onRunAllSequential}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs transition shadow-lg shadow-amber-950/40"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Chạy Tuần Tự Tất Cả (100 TCs)
              </button>
            )}

            <button
              onClick={onRerunFailed}
              disabled={isRunning}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition disabled:opacity-50"
              title="Chỉ chạy lại các trường hợp bị lỗi"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              Chạy Lại Lỗi
            </button>

            <button
              onClick={onResetSandbox}
              disabled={isRunning}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition disabled:opacity-50"
              title="Dọn dẹp các đơn đặt test cũ để chạy mới"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              Reset DB Test
            </button>

            <button
              onClick={onOpenMatrix}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition"
              title="Mở Bảng Đặc Tả Kiểm Thử và Xuất Báo Cáo"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              Bảng Đặc Tả
            </button>

            <button
              onClick={onOpenPlayground}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-medium transition"
              title="Mở API Playground thử nghiệm thủ công"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Playground
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
