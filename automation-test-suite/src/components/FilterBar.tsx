import React from 'react';
import { TestCategory, TestStatus, TestType } from '../types/testTypes';
import { CATEGORY_LABELS } from '../data/testCasesData';
import { Search, Filter, Layers } from 'lucide-react';

interface FilterBarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  statusFilter: 'all' | TestStatus;
  onStatusFilterChange: (status: 'all' | TestStatus) => void;
  typeFilter: 'all' | TestType;
  onTypeFilterChange: (type: 'all' | TestType) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  categoryCounts: Record<string, number>;
  totalFiltered: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  searchTerm,
  onSearchTermChange,
  categoryCounts,
  totalFiltered
}) => {
  return (
    <div className="bg-stone-900/60 border-b border-stone-800 p-4 space-y-3">
      {/* Search & Status / Type Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Tìm theo mã TC, tên ca kiểm thử, phương thức hoặc endpoint..."
            className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-400 focus:outline-none focus:border-amber-500/50"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchTermChange('')}
              className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-300 text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-400">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as any)}
              className="bg-transparent text-stone-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-stone-900">Tất cả trạng thái</option>
              <option value="passed" className="bg-stone-900">Đã Đạt (Passed)</option>
              <option value="failed" className="bg-stone-900">Thất Bại (Failed)</option>
              <option value="idle" className="bg-stone-900">Chưa Chạy (Idle)</option>
            </select>
          </div>

          {/* Test Type Filter */}
          <div className="flex items-center gap-1 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800 text-xs">
            <span className="text-stone-400">Loại kiểm thử:</span>
            <select
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value as any)}
              className="bg-transparent text-stone-200 text-xs focus:outline-none cursor-pointer font-medium"
            >
              <option value="all" className="bg-stone-900">Tất cả loại (70 TCs)</option>
              <option value="VALID" className="bg-stone-900 text-emerald-400">Hợp lệ (VALID)</option>
              <option value="INVALID" className="bg-stone-900 text-rose-400">Không hợp lệ (INVALID)</option>
              <option value="BOUNDARY" className="bg-stone-900 text-amber-400">Biên (BOUNDARY)</option>
              <option value="SECURITY" className="bg-stone-900 text-purple-400">Bảo mật (SECURITY)</option>
            </select>
          </div>

          <span className="text-xs text-stone-400 font-mono">
            Hiển thị: <strong className="text-stone-200">{totalFiltered}</strong> TCs
          </span>

        </div>

      </div>

      {/* Category Pills (Horizontal scrollable) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-stone-700">
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
            selectedCategory === 'all'
              ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-950/40'
              : 'bg-stone-950/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 border border-stone-800/80'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tất Cả</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
            selectedCategory === 'all' ? 'bg-stone-950/20 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'
          }`}>
            {categoryCounts['all'] || 70}
          </span>
        </button>

        {Object.entries(CATEGORY_LABELS).map(([key, info]) => {
          if (key === 'all') return null;
          const isSelected = selectedCategory === key;
          const count = categoryCounts[key] || 0;

          return (
            <button
              key={key}
              onClick={() => onSelectCategory(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                isSelected
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-950/40'
                  : 'bg-stone-950/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 border border-stone-800/80'
              }`}
            >
              <span>{info.label}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                isSelected ? 'bg-stone-950/20 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
