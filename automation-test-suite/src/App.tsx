import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TestCase, ExecutionStats, ConsoleLogItem, TestStatus, TestType } from './types/testTypes';
import { INITIAL_TEST_CASES } from './data/testCasesData';
import { executeTestCase, pingServer, resetServerSandbox, TestExecutionContext } from './services/testRunner';
import { Header } from './components/Header';
import { StatsRibbon } from './components/StatsRibbon';
import { FilterBar } from './components/FilterBar';
import { TestCaseList } from './components/TestCaseList';
import { TestCaseDetailModal } from './components/TestCaseDetailModal';
import { TerminalConsole } from './components/TerminalConsole';
import { TestMatrixExportModal } from './components/TestMatrixExportModal';
import { InteractivePlayground } from './components/InteractivePlayground';

export const App: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>(INITIAL_TEST_CASES);
  const [baseUrl, setBaseUrl] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      return window.location.origin;
    }
    return 'http://localhost:3000';
  });

  const [isRunning, setIsRunning] = useState(false);
  const [currentRunningIndex, setCurrentRunningIndex] = useState<number | null>(null);
  const [runningCaseId, setRunningCaseId] = useState<string | null>(null);
  const cancelRequestedRef = useRef(false);

  const [logs, setLogs] = useState<ConsoleLogItem[]>([]);
  const [serverPingStatus, setServerPingStatus] = useState<{ checked: boolean; ok: boolean; message: string; latencyMs: number } | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TestStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | TestType>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<TestCase | null>(null);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);

  // Initial Ping
  useEffect(() => {
    handlePingServer();
    addLog(`Khởi tạo Automation Hub với ${INITIAL_TEST_CASES.length} test cases tuần tự. Máy chủ đích: ${baseUrl}`, 'info');
  }, []);

  const addLog = (text: string, type: 'info' | 'pass' | 'fail' | 'warn' | 'request' | 'response') => {
    const newLog: ConsoleLogItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      text,
      type
    };
    setLogs((prev) => [...prev.slice(-300), newLog]);
  };

  const handlePingServer = async () => {
    addLog(`Đang ping kiểm tra kết nối máy chủ tại ${baseUrl}...`, 'info');
    const result = await pingServer(baseUrl);
    setServerPingStatus({
      checked: true,
      ok: result.ok,
      message: result.statusText,
      latencyMs: result.latencyMs
    });
    if (result.ok) {
      addLog(`Kết nối thành công tới ${baseUrl} (${result.latencyMs}ms)`, 'pass');
    } else {
      addLog(`Không thể ping tới ${baseUrl}: ${result.statusText}`, 'fail');
    }
  };

  const handleResetSandbox = async () => {
    addLog('Đang gửi lệnh Reset Sandbox để dọn dẹp dữ liệu kiểm thử...', 'warn');
    const ok = await resetServerSandbox(baseUrl);
    if (ok) {
      addLog('Đã dọn dẹp sandbox thành công! Cơ sở dữ liệu sẵn sàng cho lượt test mới.', 'pass');
      setTestCases((prev) => prev.map(tc => ({ ...tc, status: 'idle', durationMs: undefined, assertions: [], errorMessage: undefined })));
    } else {
      addLog('Không thể reset sandbox (có thể endpoint chưa sẵn sàng)', 'fail');
    }
  };

  // Execution Statistics
  const stats: ExecutionStats = useMemo(() => {
    const total = testCases.length;
    const passed = testCases.filter(t => t.status === 'passed').length;
    const failed = testCases.filter(t => t.status === 'failed').length;
    const running = testCases.filter(t => t.status === 'running').length;
    const idle = testCases.filter(t => t.status === 'idle').length;
    const skipped = testCases.filter(t => t.status === 'skipped').length;

    const completed = passed + failed;
    const successRate = completed > 0 ? Math.round((passed / completed) * 100) : 0;

    const durations = testCases.filter(t => t.durationMs !== undefined).map(t => t.durationMs as number);
    const avgDurationMs = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    const totalDurationSeconds = Math.round(durations.reduce((a, b) => a + b, 0) / 1000);

    return {
      total,
      passed,
      failed,
      running,
      skipped,
      idle,
      successRate,
      avgDurationMs,
      totalDurationSeconds
    };
  }, [testCases]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: testCases.length };
    testCases.forEach(tc => {
      counts[tc.category] = (counts[tc.category] || 0) + 1;
    });
    return counts;
  }, [testCases]);

  // Filtered Test Cases
  const filteredTestCases = useMemo(() => {
    return testCases.filter(tc => {
      if (selectedCategory !== 'all' && tc.category !== selectedCategory) return false;
      if (statusFilter !== 'all' && tc.status !== statusFilter) return false;
      if (typeFilter !== 'all' && tc.type !== typeFilter) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchId = tc.id.toLowerCase().includes(query);
        const matchTitle = tc.title.toLowerCase().includes(query);
        const matchTechnique = tc.technique.toLowerCase().includes(query);
        const matchEndpoint = tc.endpoint.toLowerCase().includes(query);
        const matchDesc = tc.description.toLowerCase().includes(query);
        if (!matchId && !matchTitle && !matchTechnique && !matchEndpoint && !matchDesc) return false;
      }

      return true;
    });
  }, [testCases, selectedCategory, statusFilter, typeFilter, searchTerm]);

  // Sequential execution of all test cases
  const handleRunAllSequential = async () => {
    if (isRunning) return;

    setIsRunning(true);
    cancelRequestedRef.current = false;
    addLog(`>>> BẮT ĐẦU CHUỖI KIỂM THỬ TUẦN TỰ (${testCases.length} TEST CASES) <<<`, 'info');

    let context: TestExecutionContext = { baseUrl };

    for (let i = 0; i < testCases.length; i++) {
      if (cancelRequestedRef.current) {
        addLog(`Đã dừng kiểm thử theo yêu cầu người dùng tại bước ${i + 1}/${testCases.length}`, 'warn');
        break;
      }

      const tc = testCases[i];
      setCurrentRunningIndex(i);
      setRunningCaseId(tc.id);

      // Set status to running
      setTestCases(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'running' } : item));

      // Run
      const { updatedCase, nextContext } = await executeTestCase(tc, context, (text, type) => addLog(text, type));
      context = nextContext;

      // Update state with result
      setTestCases(prev => prev.map((item, idx) => idx === i ? updatedCase : item));

      // Synchronize modal if this case is currently open
      if (selectedCaseForDetail?.id === tc.id) {
        setSelectedCaseForDetail(updatedCase);
      }

      // Small delay between tests for smooth UI progression
      await new Promise(res => setTimeout(res, 80));
    }

    setCurrentRunningIndex(null);
    setRunningCaseId(null);
    setIsRunning(false);
    addLog(`>>> KẾT THÚC CHUỖI KIỂM THỬ TUẦN TỰ <<<`, 'info');
  };

  // Run single test case
  const handleRunSingle = async (tc: TestCase) => {
    if (isRunning) return;
    setRunningCaseId(tc.id);
    addLog(`Chạy riêng lẻ ${tc.id}: ${tc.title}`, 'info');

    setTestCases(prev => prev.map(item => item.id === tc.id ? { ...item, status: 'running' } : item));

    const { updatedCase } = await executeTestCase(tc, { baseUrl }, (text, type) => addLog(text, type));

    setTestCases(prev => prev.map(item => item.id === tc.id ? updatedCase : item));
    if (selectedCaseForDetail?.id === tc.id) {
      setSelectedCaseForDetail(updatedCase);
    }
    setRunningCaseId(null);
  };

  // Rerun failed cases
  const handleRerunFailed = async () => {
    if (isRunning) return;
    const failedCases = testCases.filter(t => t.status === 'failed');
    if (failedCases.length === 0) {
      addLog('Không có test case nào bị lỗi để chạy lại!', 'pass');
      return;
    }

    setIsRunning(true);
    cancelRequestedRef.current = false;
    addLog(`>>> BẮT ĐẦU CHẠY LẠI ${failedCases.length} TEST CASES THẤT BẠI <<<`, 'warn');

    let context: TestExecutionContext = { baseUrl };

    for (const tc of failedCases) {
      if (cancelRequestedRef.current) break;
      setRunningCaseId(tc.id);
      setTestCases(prev => prev.map(item => item.id === tc.id ? { ...item, status: 'running' } : item));

      const { updatedCase, nextContext } = await executeTestCase(tc, context, (text, type) => addLog(text, type));
      context = nextContext;

      setTestCases(prev => prev.map(item => item.id === tc.id ? updatedCase : item));
      if (selectedCaseForDetail?.id === tc.id) {
        setSelectedCaseForDetail(updatedCase);
      }
      await new Promise(res => setTimeout(res, 80));
    }

    setRunningCaseId(null);
    setIsRunning(false);
    addLog(`>>> HOÀN TẤT CHẠY LẠI CÁC CASE LỖI <<<`, 'info');
  };

  const handleStop = () => {
    cancelRequestedRef.current = true;
    setIsRunning(false);
    setCurrentRunningIndex(null);
    setRunningCaseId(null);
    addLog('Đang yêu cầu dừng tiến trình kiểm thử...', 'warn');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        baseUrl={baseUrl}
        onBaseUrlChange={(url) => {
          setBaseUrl(url);
          addLog(`Đã đổi địa chỉ máy chủ API đích sang: ${url}`, 'info');
        }}
        isRunning={isRunning}
        onRunAllSequential={handleRunAllSequential}
        onStop={handleStop}
        onRerunFailed={handleRerunFailed}
        onResetSandbox={handleResetSandbox}
        onOpenMatrix={() => setIsMatrixOpen(true)}
        onOpenPlayground={() => setIsPlaygroundOpen(true)}
        serverPingStatus={serverPingStatus}
        onPingServer={handlePingServer}
      />

      {/* KPI Stats Ribbon */}
      <StatsRibbon
        stats={stats}
        currentRunningIndex={currentRunningIndex}
        totalCases={testCases.length}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl flex-1 flex flex-col">
          
          {/* Filters & Search */}
          <FilterBar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            categoryCounts={categoryCounts}
            totalFiltered={filteredTestCases.length}
          />

          {/* Test Case List */}
          <div className="flex-1 overflow-y-auto">
            <TestCaseList
              testCases={filteredTestCases}
              onRunSingle={handleRunSingle}
              onSelectCase={setSelectedCaseForDetail}
              runningCaseId={runningCaseId}
            />
          </div>

        </div>
      </main>

      {/* Real-time Streaming CLI Terminal Console */}
      <TerminalConsole
        logs={logs}
        onClearLogs={() => setLogs([])}
        isRunning={isRunning}
      />

      {/* Modals */}
      <TestCaseDetailModal
        testCase={selectedCaseForDetail}
        onClose={() => setSelectedCaseForDetail(null)}
        onRunSingle={handleRunSingle}
        isRunning={isRunning}
      />

      <TestMatrixExportModal
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
        testCases={testCases}
      />

      <InteractivePlayground
        isOpen={isPlaygroundOpen}
        onClose={() => setIsPlaygroundOpen(false)}
        baseUrl={baseUrl}
      />
    </div>
  );
};
export default App;
