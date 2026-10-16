import React, { useRef, useEffect } from 'react';
import { Terminal, Copy, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AutomationConsoleProps {
  logs: { id: string; timestamp: string; text: string; type: 'info' | 'pass' | 'fail' | 'warn' }[];
  onClearLogs: () => void;
  isRunning: boolean;
}

export const AutomationConsole: React.FC<AutomationConsoleProps> = ({
  logs,
  onClearLogs,
  isRunning
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopyLogs = () => {
    const raw = logs.map(l => `[${l.timestamp}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(raw);
  };

  return (
    <div className="bg-stone-950 rounded-2xl border border-stone-800 shadow-2xl overflow-hidden font-mono flex flex-col h-[520px]">
      {/* Console Top Toolbar */}
      <div className="bg-stone-900/90 px-4 py-3 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          </div>
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-stone-200">
            Local Test Automation Stream (STLC Test Execution)
          </span>
          {isRunning && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 animate-pulse border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              Đang thực thi...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-stone-100 text-xs flex items-center gap-1 transition-colors"
            title="Sao chép toàn bộ nhật ký"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sao chép</span>
          </button>
          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-950/60 text-stone-300 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors"
            title="Xóa nhật ký"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xóa</span>
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1.5 text-xs text-stone-300 leading-relaxed scrollbar-thin scrollbar-thumb-stone-800">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-stone-600 space-y-2">
            <Terminal className="w-10 h-10 stroke-[1.2]" />
            <p>Chưa có luồng thực thi nào. Bấm "Chạy Toàn Bộ Test" để bắt đầu kiểm thử tự động.</p>
          </div>
        ) : (
          logs.map((item) => {
            let color = 'text-stone-300';
            if (item.type === 'pass') color = 'text-emerald-400 font-semibold';
            if (item.type === 'fail') color = 'text-rose-400 font-semibold';
            if (item.type === 'warn') color = 'text-amber-400 font-semibold';

            return (
              <div key={item.id} className="flex items-start gap-2 hover:bg-stone-900/40 py-0.5 px-1 rounded transition-colors">
                <span className="text-stone-600 shrink-0 select-none">[{item.timestamp}]</span>
                <span className={`break-all ${color}`}>{item.text}</span>
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Footer Info */}
      <div className="bg-stone-900/60 px-4 py-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
        <span>Target: http://localhost:3000 / In-memory & Cloud SQL Sandbox</span>
        <span>Tổng số dòng log: {logs.length}</span>
      </div>
    </div>
  );
};
