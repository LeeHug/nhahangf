import React, { useState, useMemo } from 'react';
import { 
  TestCase, 
  TestCategory, 
  TestStatus 
} from './testTypes';
import { 
  INITIAL_TEST_CASES, 
  runIndividualTestCase 
} from './testDefinitions';
import { AutomationConsole } from './AutomationConsole';
import { ApiPlayground } from './ApiPlayground';
import { TestMatrixModal } from './TestMatrixModal';
import { 
  Play, 
  RotateCcw, 
  Trash2, 
  FileText, 
  Terminal, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Activity, 
  Filter, 
  Search, 
  Copy, 
  Check, 
  Sliders, 
  ArrowLeft,
  Server,
  Zap,
  Layers,
  BookOpen
} from 'lucide-react';

interface AutomationTestCenterProps {
  onBackToBooking: () => void;
  onGoToAdmin: () => void;
}

export const AutomationTestCenter: React.FC<AutomationTestCenterProps> = ({
  onBackToBooking,
  onGoToAdmin
}) => {
  // Main test case registry state
  const [testCases, setTestCases] = useState<TestCase[]>(INITIAL_TEST_CASES);
  const [activeTab, setActiveTab] = useState<'cases' | 'console' | 'playground'>('cases');
  const [selectedCategory, setSelectedCategory] = useState<TestCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed' | 'idle'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  
  // Execution state
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);
  const [currentlyRunningId, setCurrentlyRunningId] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  
  // Expanded test detail view
  const [expandedTestId, setExpandedTestId] = useState<string | null>('TC-BK-01');
  const [copiedPayloadId, setCopiedPayloadId] = useState<string | null>(null);

  // Terminal log state
  const [logs, setLogs] = useState<{ id: string; timestamp: string; text: string; type: 'info' | 'pass' | 'fail' | 'warn' }[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      text: 'Hệ thống kiểm thử tự động Le Gourmet Bistro đã sẵn sàng kết nối Local Server (http://localhost:3000).',
      type: 'info'
    }
  ]);

  // Modal state
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState<boolean>(false);
  const [resetStatusMsg, setResetStatusMsg] = useState<string | null>(null);

  // Add line to terminal
  const addLog = (text: string, type: 'info' | 'pass' | 'fail' | 'warn' = 'info') => {
    setLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString('vi-VN'),
        text,
        type
      }
    ]);
  };

  // Run a single test case
  const handleRunSingleTest = async (testId: string) => {
    if (isRunningAll) return;
    setCurrentlyRunningId(testId);
    
    // Set to running
    setTestCases(prev => prev.map(t => t.id === testId ? { ...t, status: 'running' } : t));
    
    const targetTest = testCases.find(t => t.id === testId);
    if (!targetTest) return;

    addLog(`Đang chạy lẻ Test Case: [${targetTest.id}] ${targetTest.name}...`, 'info');

    const updated = await runIndividualTestCase(targetTest, '', (msg) => {
      addLog(msg, msg.includes('PASS') ? 'pass' : msg.includes('FAIL') ? 'fail' : 'info');
    });

    setTestCases(prev => prev.map(t => t.id === testId ? updated : t));
    setCurrentlyRunningId(null);
  };

  // Run all test cases in sequence
  const handleRunAllTests = async () => {
    if (isRunningAll) return;
    setIsRunningAll(true);
    setProgressPercent(0);
    addLog(`========================================================================`, 'info');
    addLog(`BẮT ĐẦU CHU KỲ KIỂM THỬ TỰ ĐỘNG TOÀN DIỆN (RUN ALL 24 TEST CASES)`, 'warn');
    addLog(`Môi trường: Local Server | Bộ test: 6 Phân hệ nghiệp vụ & an ninh`, 'info');
    addLog(`========================================================================`, 'info');

    const total = testCases.length;
    let completed = 0;

    for (let i = 0; i < total; i++) {
      const current = testCases[i];
      setCurrentlyRunningId(current.id);
      
      setTestCases(prev => prev.map(t => t.id === current.id ? { ...t, status: 'running' } : t));

      const updated = await runIndividualTestCase(current, '', (msg) => {
        addLog(msg, msg.includes('PASS') ? 'pass' : msg.includes('FAIL') ? 'fail' : 'info');
      });

      setTestCases(prev => prev.map(t => t.id === current.id ? updated : t));
      completed++;
      setProgressPercent(Math.round((completed / total) * 100));
    }

    setCurrentlyRunningId(null);
    setIsRunningAll(false);
    addLog(`========================================================================`, 'info');
    addLog(`HOÀN TẤT CHU KỲ KIỂM THỬ TỰ ĐỘNG! Tỷ lệ Pass: ${passRate}%`, 'pass');
    addLog(`========================================================================`, 'info');
  };

  // Rerun failed tests only
  const handleRerunFailed = async () => {
    if (isRunningAll) return;
    const failedTests = testCases.filter(t => t.status === 'failed');
    if (failedTests.length === 0) {
      addLog('Không có test case nào bị lỗi để chạy lại!', 'pass');
      return;
    }

    setIsRunningAll(true);
    addLog(`🔄 Bắt đầu chạy lại ${failedTests.length} test cases bị lỗi...`, 'warn');

    for (const test of failedTests) {
      setCurrentlyRunningId(test.id);
      setTestCases(prev => prev.map(t => t.id === test.id ? { ...t, status: 'running' } : t));

      const updated = await runIndividualTestCase(test, '', (msg) => {
        addLog(msg, msg.includes('PASS') ? 'pass' : msg.includes('FAIL') ? 'fail' : 'info');
      });

      setTestCases(prev => prev.map(t => t.id === test.id ? updated : t));
    }

    setCurrentlyRunningId(null);
    setIsRunningAll(false);
  };

  // Reset Sandbox Data
  const handleResetSandbox = async () => {
    try {
      addLog('Đang dọn dẹp dữ liệu kiểm thử giả lập (Sandbox)...', 'warn');
      const res = await fetch('/api/test/reset-sandbox', { method: 'POST' });
      const data = await res.json();
      setResetStatusMsg(`Đã xóa sạch ${data.clearedCount || 0} bản ghi test cũ.`);
      addLog(`✔️ Dọn dẹp hoàn tất: ${data.message} (${data.clearedCount} đơn)`, 'pass');
      setTimeout(() => setResetStatusMsg(null), 3000);
    } catch (err: any) {
      addLog(`❌ Lỗi dọn dẹp sandbox: ${err?.message}`, 'fail');
    }
  };

  // Metrics computation
  const totalTests = testCases.length;
  const passedTests = testCases.filter(t => t.status === 'passed').length;
  const failedTests = testCases.filter(t => t.status === 'failed').length;
  const idleTests = testCases.filter(t => t.status === 'idle').length;
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  
  const avgDuration = useMemo(() => {
    const executed = testCases.filter(t => t.durationMs !== undefined);
    if (executed.length === 0) return 0;
    const sum = executed.reduce((acc, t) => acc + (t.durationMs || 0), 0);
    return Math.round(sum / executed.length);
  }, [testCases]);

  // Filtered test cases
  const filteredTests = useMemo(() => {
    return testCases.filter(t => {
      // Category filter
      if (selectedCategory !== 'all' && t.suiteId !== selectedCategory) return false;
      // Status filter
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      // Keyword filter
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.viewpoint.toLowerCase().includes(q) ||
          t.endpoint.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [testCases, selectedCategory, statusFilter, searchKeyword]);

  const handleCopyJson = (obj: any, id: string) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedPayloadId(id);
    setTimeout(() => setCopiedPayloadId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb & Status Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <button
                onClick={onBackToBooking}
                className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Về Giao Diện Đặt Bàn
              </button>
              <span className="text-stone-600">/</span>
              <span className="text-xs text-stone-400">Trung Tâm Kiểm Thử Tự Động</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif-heading text-2xl sm:text-3xl font-extrabold text-stone-100 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 shadow-md">
                  <Terminal className="w-5 h-5 stroke-[2.2]" />
                </div>
                Automation Testing Hub (Le Gourmet)
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Local Server Active (Port 3000)
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 max-w-3xl leading-relaxed">
              Môi trường kiểm thử tự động hóa độc lập dành cho Tester & Developer. Hỗ trợ đầy đủ vòng đời STLC: 
              kiểm tra trùng lặp đặt bàn, phân vùng tương đương dữ liệu, chuyển đổi trạng thái FSM, chống giả mạo giá và bảo mật phân quyền RBAC.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsMatrixModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Bảng Ma Trận & Báo Cáo</span>
            </button>
            <button
              onClick={onGoToAdmin}
              className="px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Xem Quản Trị</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Tests */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-stone-800 flex items-center justify-center text-amber-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">Tổng Test Cases</span>
            <span className="text-2xl font-black text-stone-100 font-mono">{totalTests}</span>
          </div>
        </div>

        {/* Passed */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">Passed (Đạt)</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{passedTests}</span>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">Failed (Lỗi)</span>
            <span className="text-2xl font-black text-rose-400 font-mono">{failedTests}</span>
          </div>
        </div>

        {/* Pass Rate */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">Tỷ Lệ Đạt (Pass)</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{passRate}%</span>
          </div>
        </div>

        {/* Average Latency */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">Độ Trễ Trung Bình</span>
            <span className="text-2xl font-black text-cyan-400 font-mono">{avgDuration}ms</span>
          </div>
        </div>
      </div>

      {/* Main Execution Actions Toolbar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRunAllTests}
              disabled={isRunningAll}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isRunningAll ? `Đang chạy (${progressPercent}%)...` : 'Chạy Toàn Bộ Test (Run All)'}</span>
            </button>

            <button
              onClick={handleRerunFailed}
              disabled={isRunningAll || failedTests === 0}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-rose-300 border border-rose-500/30 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chạy Lại Test Lỗi ({failedTests})</span>
            </button>

            <button
              onClick={handleResetSandbox}
              disabled={isRunningAll}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Xóa dữ liệu test tạm thời"
            >
              <Trash2 className="w-4 h-4 text-stone-400" />
              <span>Dọn Dẹp Sandbox</span>
            </button>

            {resetStatusMsg && (
              <span className="text-xs text-emerald-400 font-medium animate-fade-in flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {resetStatusMsg}
              </span>
            )}
          </div>

          {/* View Mode Switcher (Cases vs Console vs Playground) */}
          <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('cases')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'cases'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Danh Sách Test ({totalTests})</span>
            </button>

            <button
              onClick={() => setActiveTab('console')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 relative ${
                activeTab === 'console'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Console Stream</span>
              {isRunningAll && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('playground')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'playground'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>API Playground</span>
            </button>
          </div>
        </div>

        {/* Live Progress Bar when running */}
        {isRunningAll && (
          <div className="space-y-1.5 pt-2 border-t border-stone-800">
            <div className="flex justify-between text-xs text-stone-300 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                Đang thực thi: {currentlyRunningId || 'Khởi tạo...'}
              </span>
              <span>{progressPercent}% hoàn tất</span>
            </div>
            <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-500 transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Main Tab Content Display */}
      {activeTab === 'console' ? (
        <AutomationConsole
          logs={logs}
          onClearLogs={() => setLogs([])}
          isRunning={isRunningAll}
        />
      ) : activeTab === 'playground' ? (
        <ApiPlayground />
      ) : (
        /* Test Cases List View with Categorized Filter */
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'bg-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                Tất cả ({totalTests})
              </button>
              <button
                onClick={() => setSelectedCategory('booking_conflict')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'booking_conflict'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'bg-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                1. Đặt Bàn & Trùng Lịch
              </button>
              <button
                onClick={() => setSelectedCategory('input_validation')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'input_validation'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'bg-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                2. Ràng Buộc Dữ Liệu
              </button>
              <button
                onClick={() => setSelectedCategory('state_machine')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'state_machine'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'bg-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                3. Vòng Đời Trạng Thái
              </button>
              <button
                onClick={() => setSelectedCategory('menu_pricing')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'menu_pricing'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'bg-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                4. Thực Đơn & Giá Tiền
              </button>
              <button
                onClick={() => setSelectedCategory('security_rbac')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'security_rbac'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'bg-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                5. An Ninh & Quyền
              </button>
              <button
                onClick={() => setSelectedCategory('e2e_flow')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'e2e_flow'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'bg-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                6. E2E Toàn Trình
              </button>
            </div>

            {/* Keyword Search & Status Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Tìm mã hoặc tên test..."
                  className="bg-stone-950 border border-stone-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 w-44 sm:w-56"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="passed">Chỉ xem Passed</option>
                <option value="failed">Chỉ xem Failed</option>
                <option value="idle">Chưa chạy (Idle)</option>
              </select>
            </div>
          </div>

          {/* Test Case Cards List */}
          <div className="space-y-3">
            {filteredTests.length === 0 ? (
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center text-stone-500">
                <Filter className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>Không tìm thấy test case nào phù hợp với bộ lọc hiện tại.</p>
              </div>
            ) : (
              filteredTests.map((test) => {
                const isExpanded = expandedTestId === test.id;
                const isRunningThis = currentlyRunningId === test.id;

                return (
                  <div
                    key={test.id}
                    className={`bg-stone-900 border rounded-2xl transition-all shadow-md overflow-hidden ${
                      test.status === 'passed'
                        ? 'border-emerald-500/30 hover:border-emerald-500/50'
                        : test.status === 'failed'
                        ? 'border-rose-500/40 hover:border-rose-500/60'
                        : 'border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-stone-900/90">
                      <div className="flex items-start gap-3">
                        {/* Status Icon */}
                        <div className="mt-0.5 shrink-0">
                          {test.status === 'passed' ? (
                            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : test.status === 'failed' ? (
                            <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                              <XCircle className="w-4 h-4" />
                            </div>
                          ) : isRunningThis ? (
                            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center animate-spin">
                              <Zap className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-xl bg-stone-800 text-stone-500 flex items-center justify-center">
                              <Clock className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        {/* Title & Metadata */}
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                              {test.id}
                            </span>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                              <span className="text-amber-500 font-bold mr-1">{test.httpMethod}</span>
                              {test.endpoint}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800/80 text-stone-400 border border-stone-700/60">
                              {test.technique}
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2">
                            {test.name}
                          </h4>
                          <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
                            <span className="text-stone-300 font-medium">Mục tiêu:</span> {test.viewpoint}
                          </p>
                        </div>
                      </div>

                      {/* Right Action Controls */}
                      <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                        {test.durationMs !== undefined && (
                          <span className="text-xs font-mono text-stone-400">
                            {test.durationMs}ms
                          </span>
                        )}

                        <button
                          onClick={() => handleRunSingleTest(test.id)}
                          disabled={isRunningAll || isRunningThis}
                          className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Play className="w-3.5 h-3.5 text-amber-400 fill-current" />
                          <span>Chạy Lẻ</span>
                        </button>

                        <button
                          onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                          className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
                          title="Xem chi tiết payload & assertions"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Details Drawer */}
                    {isExpanded && (
                      <div className="p-5 border-t border-stone-800 bg-stone-950/60 space-y-4 text-xs">
                        {/* Prerequisites & Steps */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5 bg-stone-900/80 p-3 rounded-xl border border-stone-800/80">
                            <span className="font-bold text-stone-300 uppercase text-[10px] tracking-wider block text-amber-400">
                              📋 Các Bước Thực Hiện (Test Steps)
                            </span>
                            <ul className="list-decimal list-inside space-y-1 text-stone-300">
                              {test.steps.map((st, i) => (
                                <li key={i} className="leading-relaxed">{st}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-1.5 bg-stone-900/80 p-3 rounded-xl border border-stone-800/80">
                            <span className="font-bold text-stone-300 uppercase text-[10px] tracking-wider block text-amber-400">
                              🎯 Kết Quả Mong Đợi (Expected Outcome)
                            </span>
                            <p className="text-stone-300 leading-relaxed">{test.expectedResult}</p>
                            {test.prerequisites && (
                              <p className="text-stone-500 text-[11px] mt-2 pt-2 border-t border-stone-800">
                                <strong>Tiền điều kiện:</strong> {test.prerequisites}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Assertions Breakdown */}
                        {test.assertions && test.assertions.length > 0 && (
                          <div className="space-y-2">
                            <span className="font-bold text-stone-300 uppercase text-[10px] tracking-wider block">
                              Đánh Giá Các Biểu Thức Kiểm Thử (Assertions)
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              {test.assertions.map((a, idx) => (
                                <div
                                  key={idx}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                                    a.passed
                                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                                      : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {a.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                                    <span>{a.description}</span>
                                  </div>
                                  <div className="font-mono text-[11px] text-stone-400">
                                    Mong đợi: <span className="text-stone-200">{String(a.expected)}</span> | Thực tế: <span className="text-amber-400">{String(a.actual)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Request & Response Live Payload Viewer */}
                        {(test.requestRecord || test.responseRecord) && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                            {/* Request Sent */}
                            {test.requestRecord && (
                              <div className="space-y-1.5 font-mono">
                                <div className="flex items-center justify-between text-[11px] text-stone-400">
                                  <span>Request Payload (Gửi Đi):</span>
                                  <button
                                    onClick={() => handleCopyJson(test.requestRecord?.body, `${test.id}-req`)}
                                    className="hover:text-stone-200 flex items-center gap-1"
                                  >
                                    {copiedPayloadId === `${test.id}-req` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    <span>Chép JSON</span>
                                  </button>
                                </div>
                                <div className="bg-stone-950 rounded-xl p-3 border border-stone-800 text-[11px] text-stone-300 max-h-48 overflow-y-auto">
                                  <div className="text-amber-500 font-bold mb-1">
                                    {test.requestRecord.method} {test.requestRecord.url}
                                  </div>
                                  <pre className="whitespace-pre-wrap break-all text-stone-400">
                                    {JSON.stringify(test.requestRecord.body || {}, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {/* Response Received */}
                            {test.responseRecord && (
                              <div className="space-y-1.5 font-mono">
                                <div className="flex items-center justify-between text-[11px] text-stone-400">
                                  <span>
                                    Server Response: <strong className="text-emerald-400">HTTP {test.responseRecord.status}</strong> ({test.responseRecord.durationMs}ms)
                                  </span>
                                  <button
                                    onClick={() => handleCopyJson(test.responseRecord?.body, `${test.id}-res`)}
                                    className="hover:text-stone-200 flex items-center gap-1"
                                  >
                                    {copiedPayloadId === `${test.id}-res` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    <span>Chép JSON</span>
                                  </button>
                                </div>
                                <div className="bg-stone-950 rounded-xl p-3 border border-stone-800 text-[11px] text-emerald-400 max-h-48 overflow-y-auto">
                                  <pre className="whitespace-pre-wrap break-all">
                                    {JSON.stringify(test.responseRecord.body || {}, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Test Matrix & VTI Report Modal */}
      <TestMatrixModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
        tests={testCases}
      />
    </div>
  );
};
