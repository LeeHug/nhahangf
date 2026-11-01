import React, { useState } from 'react';
import { TestCase } from '../types/testTypes';
import { 
  X, 
  Copy, 
  Check, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileCode, 
  Server,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface TestCaseDetailModalProps {
  testCase: TestCase | null;
  onClose: () => void;
  onRunSingle: (tc: TestCase) => void;
  isRunning: boolean;
}

export const TestCaseDetailModal: React.FC<TestCaseDetailModalProps> = ({
  testCase,
  onClose,
  onRunSingle,
  isRunning
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'request' | 'response' | 'assertions'>('details');

  if (!testCase) return null;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-start justify-between bg-stone-950/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                #{String(testCase.sequenceNumber).padStart(2, '0')}
              </span>
              <span className="text-sm font-mono font-bold text-amber-400">
                {testCase.id}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                {testCase.type}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-800 text-stone-200">
                {testCase.httpMethod} {testCase.endpoint}
              </span>
            </div>
            <h3 className="text-base font-bold text-stone-100">
              {testCase.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRunSingle(testCase)}
              disabled={isRunning}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Chạy Ngay
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-stone-800 flex items-center gap-4 bg-stone-950/30">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'details'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Đặc Tả & Kịch Bản
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className={`py-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'request'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            HTTP Request
            {testCase.requestRecord && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
          </button>
          <button
            onClick={() => setActiveTab('response')}
            className={`py-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'response'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            HTTP Response
            {testCase.responseRecord && (
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                testCase.responseRecord.status >= 200 && testCase.responseRecord.status < 300
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}>
                {testCase.responseRecord.status}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('assertions')}
            className={`py-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'assertions'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Tiêu Chí Kiểm Tra ({testCase.assertions.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-2">
                  <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">Kỹ Thuật Kiểm Thử</span>
                  <p className="text-stone-200 font-medium">{testCase.technique}</p>
                </div>
                <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-2">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">Hạng Mục Chức Năng</span>
                  <p className="text-stone-200 font-medium">{testCase.category}</p>
                </div>
              </div>

              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">Mục Đích & Kịch Bản Chi Tiết</span>
                <p className="text-stone-200 leading-relaxed text-xs">{testCase.description}</p>
              </div>

              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">Tiền Điều Kiện (Prerequisites)</span>
                <p className="text-stone-300">{testCase.prerequisites}</p>
              </div>

              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">Dữ Liệu Đầu Vào (Test Data)</span>
                <pre className="text-stone-300 font-mono text-[11px] whitespace-pre-wrap bg-stone-900 p-2.5 rounded border border-stone-800">
                  {testCase.testDataSummary}
                </pre>
              </div>

              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">Kết Quả Mong Đợi (Expected Result)</span>
                <p className="text-emerald-300 font-medium">{testCase.expectedResult}</p>
              </div>
            </div>
          )}

          {/* TAB 2: REQUEST */}
          {activeTab === 'request' && (
            <div className="space-y-4">
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 font-mono text-xs flex items-center justify-between">
                <div>
                  <span className="text-amber-400 font-bold mr-2">{testCase.httpMethod}</span>
                  <span className="text-stone-200">{testCase.requestRecord?.url || testCase.endpoint}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(testCase.requestRecord || {}, null, 2), 'request')}
                  className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] flex items-center gap-1"
                >
                  {copiedType === 'request' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedType === 'request' ? 'Đã chép' : 'Sao chép'}
                </button>
              </div>

              {testCase.requestPayload && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-stone-400">Request Body (JSON):</span>
                  <pre className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 font-mono text-xs text-amber-200/90 overflow-x-auto">
                    {JSON.stringify(testCase.requestPayload, null, 2)}
                  </pre>
                </div>
              )}

              {testCase.requestRecord?.headers && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-stone-400">Request Headers:</span>
                  <pre className="p-3 rounded-xl bg-stone-950 border border-stone-800 font-mono text-[11px] text-stone-300 overflow-x-auto">
                    {JSON.stringify(testCase.requestRecord.headers, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RESPONSE */}
          {activeTab === 'response' && (
            <div className="space-y-4">
              {testCase.responseRecord ? (
                <>
                  <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400">Status:</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        testCase.responseRecord.status >= 200 && testCase.responseRecord.status < 300
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {testCase.responseRecord.status} {testCase.responseRecord.statusText}
                      </span>
                      <span className="text-stone-500">|</span>
                      <span className="text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {testCase.responseRecord.durationMs}ms
                      </span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(JSON.stringify(testCase.responseRecord?.body || {}, null, 2), 'response')}
                      className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] flex items-center gap-1"
                    >
                      {copiedType === 'response' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedType === 'response' ? 'Đã chép' : 'Sao chép JSON'}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-stone-400">Response Body:</span>
                    <pre className="p-4 rounded-xl bg-stone-950 border border-stone-800 font-mono text-xs text-sky-200 overflow-x-auto max-h-80">
                      {typeof testCase.responseRecord.body === 'object'
                        ? JSON.stringify(testCase.responseRecord.body, null, 2)
                        : String(testCase.responseRecord.body)}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="p-10 text-center text-stone-500 text-xs">
                  Chưa có dữ liệu phản hồi. Bấm "Chạy Ngay" để gửi request thực tế tới backend.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ASSERTIONS */}
          {activeTab === 'assertions' && (
            <div className="space-y-3">
              {testCase.assertions.length > 0 ? (
                testCase.assertions.map((assertion, index) => (
                  <div
                    key={index}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                      assertion.passed
                        ? 'bg-emerald-950/15 border-emerald-800/40'
                        : 'bg-rose-950/20 border-rose-800/50'
                    }`}
                  >
                    {assertion.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-stone-100">{assertion.description}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 font-mono text-[11px] text-stone-400">
                        <span>Kỳ vọng: <strong className="text-amber-300">{String(assertion.expected)}</strong></span>
                        <ArrowRight className="w-3 h-3" />
                        <span>Thực tế: <strong className={assertion.passed ? 'text-emerald-400' : 'text-rose-400'}>{String(assertion.actual)}</strong></span>
                      </div>
                      {assertion.error && (
                        <p className="mt-1.5 text-rose-400 font-mono text-[11px] bg-rose-950/50 p-1.5 rounded">
                          {assertion.error}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-stone-500 text-xs">
                  Chưa có kết quả kiểm tra tiêu chí. Hãy bấm "Chạy Ngay" để đánh giá.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between text-xs text-stone-400">
          <div>
            Trạng thái hiện tại:{' '}
            <span className={`font-semibold ${
              testCase.status === 'passed' ? 'text-emerald-400' :
              testCase.status === 'failed' ? 'text-rose-400' :
              testCase.status === 'running' ? 'text-amber-400' : 'text-stone-400'
            }`}>
              {testCase.status.toUpperCase()}
            </span>
            {testCase.lastRun && <span className="ml-2 font-mono">({testCase.lastRun})</span>}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
