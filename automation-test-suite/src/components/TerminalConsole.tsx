import React, { useRef, useEffect, useState } from 'react';
import { ConsoleLogItem } from '../types/testTypes';
import { Terminal, Copy, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface TerminalConsoleProps {
  logs: ConsoleLogItem[];
  onClearLogs: () => void;
  isRunning: boolean;
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({
  logs,
  onClearLogs,
  isRunning
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleCopy = () => {
    const rawText = logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogClass = (type: string) => {
    switch (type) {
      case 'pass': return 'text-emerald-400 font-semibold';
      case 'fail': return 'text-rose-400 font-bold';
      case 'warn': return 'text-amber-400';
      case 'request': return 'text-sky-400';
      case 'response': return 'text-purple-400';
      default: return 'text-stone-300';
    }
  };

  return (
    <div className="bg-stone-950 border-t border-stone-800 shadow-2xl">
      {/* Console Bar Header */}
      <div className="px-4 py-2 border-b border-stone-800/80 flex items-center justify-between bg-stone-900/80 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span className="font-mono font-bold text-stone-200">Execution Stream Console</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-stone-800 text-stone-400">
            {logs.length} logs
          </span>
          {isRunning && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400 animate-pulse ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Streaming...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-[11px] text-stone-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            Auto-scroll
          </label>

          <button
            onClick={handleCopy}
            className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] flex items-center gap-1 transition"
            title="Sao chép toàn bộ log"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Đã chép' : 'Copy'}
          </button>

          <button
            onClick={onClearLogs}
            className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-rose-400 transition"
            title="Xóa sạch log"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-stone-400 hover:text-stone-200 rounded hover:bg-stone-800 transition"
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Logs Viewport */}
      {!isCollapsed && (
        <div
          ref={scrollRef}
          className="p-3 h-48 overflow-y-auto font-mono text-[11px] space-y-1 bg-stone-950/95 scrollbar-thin scrollbar-thumb-stone-800"
        >
          {logs.length === 0 ? (
            <p className="text-stone-600 italic">Chưa có bản ghi thực thi nào. Bấm "Chạy Tuần Tự Tất Cả (70 TCs)" để bắt đầu.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed hover:bg-stone-900/40 px-1 rounded">
                <span className="text-stone-500 select-none flex-shrink-0">[{log.timestamp}]</span>
                <span className={`select-none flex-shrink-0 uppercase text-[10px] px-1 rounded ${
                  log.type === 'pass' ? 'bg-emerald-950 text-emerald-400' :
                  log.type === 'fail' ? 'bg-rose-950 text-rose-400' :
                  log.type === 'request' ? 'bg-sky-950 text-sky-400' :
                  log.type === 'warn' ? 'bg-amber-950 text-amber-400' :
                  'bg-stone-900 text-stone-400'
                }`}>
                  {log.type}
                </span>
                <span className={`flex-1 break-all ${getLogClass(log.type)}`}>
                  {log.text}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
