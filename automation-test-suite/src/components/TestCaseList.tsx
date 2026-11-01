import React from 'react';
import { TestCase } from '../types/testTypes';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Play, 
  Eye, 
  Loader2, 
  Shield, 
  AlertTriangle,
  FileCode,
  Tag
} from 'lucide-react';

interface TestCaseListProps {
  testCases: TestCase[];
  onRunSingle: (tc: TestCase) => void;
  onSelectCase: (tc: TestCase) => void;
  runningCaseId: string | null;
}

export const TestCaseList: React.FC<TestCaseListProps> = ({
  testCases,
  onRunSingle,
  onSelectCase,
  runningCaseId
}) => {
  if (testCases.length === 0) {
    return (
      <div className="p-12 text-center text-stone-400">
        <FileCode className="w-12 h-12 mx-auto text-stone-600 mb-3" />
        <p className="text-sm font-medium">Không tìm thấy test case nào phù hợp với bộ lọc</p>
        <p className="text-xs text-stone-400 mt-1">Vui lòng thử chọn bộ lọc khác hoặc xóa từ khóa tìm kiếm</p>
      </div>
    );
  }

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'POST': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'PUT': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'PATCH': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'DELETE': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default: return 'bg-stone-800 text-stone-300 border-stone-700';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'VALID':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> HỢP LỆ
          </span>
        );
      case 'INVALID':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> KHÔNG HỢP LỆ
          </span>
        );
      case 'BOUNDARY':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> GIÁ TRỊ BIÊN
          </span>
        );
      case 'SECURITY':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-1">
            <Shield className="w-3 h-3" /> BẢO MẬT
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="divide-y divide-stone-800/60">
      {testCases.map((tc) => {
        const isRunning = runningCaseId === tc.id || tc.status === 'running';

        return (
          <div
            key={tc.id}
            className={`p-3.5 hover:bg-stone-900/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 ${
              tc.status === 'passed' ? 'border-l-4 border-l-emerald-500 bg-emerald-950/5' :
              tc.status === 'failed' ? 'border-l-4 border-l-rose-500 bg-rose-950/10' :
              isRunning ? 'border-l-4 border-l-amber-500 bg-amber-950/10' :
              'border-l-4 border-l-transparent'
            }`}
          >
            {/* Left Column: Index, ID, Title, Badges */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {/* Sequence # */}
                <span className="text-[11px] font-mono font-bold text-stone-400 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">
                  #{String(tc.sequenceNumber).padStart(2, '0')}
                </span>

                {/* TC ID */}
                <span className="text-xs font-mono font-bold text-amber-400">
                  {tc.id}
                </span>

                {/* Type Badge */}
                {getTypeBadge(tc.type)}

                {/* HTTP Method */}
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getMethodBadgeClass(tc.httpMethod)}`}>
                  {tc.httpMethod}
                </span>

                {/* Endpoint */}
                <span className="text-xs font-mono text-stone-300 max-w-[280px] sm:max-w-md truncate" title={tc.endpoint}>
                  {tc.endpoint}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
                  <span>{tc.title}</span>
                </h4>
                <p className="text-xs text-stone-400 line-clamp-1">
                  <span className="text-amber-500/80 font-medium">Kỹ thuật:</span> {tc.technique} — <span className="text-stone-400">{tc.description}</span>
                </p>
              </div>

              {/* Failure Error Message if failed */}
              {tc.status === 'failed' && tc.errorMessage && (
                <div className="mt-2 text-xs font-mono text-rose-400 bg-rose-950/40 border border-rose-900/50 rounded px-2.5 py-1 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{tc.errorMessage}</span>
                </div>
              )}
            </div>

            {/* Right Column: Status, Timing, Actions */}
            <div className="flex items-center gap-3 self-end md:self-center flex-shrink-0">
              
              {/* Status Badge */}
              <div className="w-24 text-right">
                {isRunning ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" /> Đang chạy
                  </span>
                ) : tc.status === 'passed' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã Đạt
                  </span>
                ) : tc.status === 'failed' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    <XCircle className="w-3.5 h-3.5" /> Thất Bại
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-stone-400 bg-stone-900 border border-stone-800">
                    Chưa Chạy
                  </span>
                )}
              </div>

              {/* Duration ms */}
              <div className="text-right w-16 hidden sm:block">
                {tc.durationMs !== undefined ? (
                  <span className="text-xs font-mono text-stone-400 flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    {tc.durationMs}ms
                  </span>
                ) : (
                  <span className="text-xs font-mono text-stone-400">—</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onRunSingle(tc)}
                  disabled={isRunning}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition flex items-center gap-1 disabled:opacity-50"
                  title="Chạy riêng ca kiểm thử này"
                >
                  <Play className="w-3 h-3 fill-current text-amber-400" />
                  <span className="hidden sm:inline">Chạy</span>
                </button>

                <button
                  onClick={() => onSelectCase(tc)}
                  className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-medium transition border border-stone-800 flex items-center gap-1"
                  title="Xem chi tiết dữ liệu Request, Response và Tiêu chí kiểm tra"
                >
                  <Eye className="w-3 h-3 text-sky-400" />
                  <span>Chi Tiết</span>
                </button>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};
