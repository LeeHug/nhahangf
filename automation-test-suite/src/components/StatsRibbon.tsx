import React from 'react';
import { ExecutionStats } from '../types/testTypes';
import { CheckCircle2, XCircle, Clock, Zap, Activity } from 'lucide-react';

interface StatsRibbonProps {
  stats: ExecutionStats;
  currentRunningIndex: number | null;
  totalCases: number;
}

export const StatsRibbon: React.FC<StatsRibbonProps> = ({
  stats,
  currentRunningIndex,
  totalCases
}) => {
  const executedCount = stats.passed + stats.failed;
  const progressPercent = Math.round((executedCount / totalCases) * 100);

  return (
    <div className="bg-stone-900 border-b border-stone-800 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Total Cases */}
          <div className="bg-stone-950/60 rounded-xl p-3 border border-stone-800/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">Tổng Test Case</p>
              <p className="text-xl font-black text-stone-100 font-mono mt-0.5">{totalCases}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-stone-300">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          {/* Passed */}
          <div className="bg-stone-950/60 rounded-xl p-3 border border-emerald-900/30 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">Đã Đạt (Passed)</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-black text-emerald-400 font-mono">{stats.passed}</span>
                <span className="text-xs text-emerald-500/80">({stats.total > 0 ? Math.round((stats.passed / totalCases) * 100) : 0}%)</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Failed */}
          <div className="bg-stone-950/60 rounded-xl p-3 border border-rose-900/30 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-rose-400 uppercase tracking-wider">Thất Bại (Failed)</p>
              <p className="text-xl font-black text-rose-400 font-mono mt-0.5">{stats.failed}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-400">
              <XCircle className="w-4 h-4" />
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-stone-950/60 rounded-xl p-3 border border-amber-900/30 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">Tỷ Lệ Thành Công</p>
              <p className="text-xl font-black text-amber-400 font-mono mt-0.5">
                {stats.successRate}%
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          {/* Average Latency */}
          <div className="bg-stone-950/60 rounded-xl p-3 border border-stone-800/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">Độ Trễ TB (Latency)</p>
              <p className="text-xl font-black text-stone-200 font-mono mt-0.5">
                {stats.avgDurationMs} <span className="text-xs font-normal text-stone-400">ms</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-stone-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          {/* Execution Progress Bar */}
          <div className="bg-stone-950/60 rounded-xl p-3 border border-stone-800/80 flex flex-col justify-center">
            <div className="flex items-center justify-between text-[11px] font-medium mb-1.5">
              <span className="text-stone-400">Tiến Độ Tuần Tự</span>
              <span className="text-amber-400 font-mono font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-stone-400 mt-1 font-mono">
              <span>{executedCount}/{totalCases} cases</span>
              {currentRunningIndex !== null && (
                <span className="text-amber-400 animate-pulse">Đang chạy TC-{currentRunningIndex + 1}</span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
