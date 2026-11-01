import React, { useState } from 'react';
import { TestCase } from '../types/testTypes';
import { X, Copy, Download, Check, FileSpreadsheet, Search } from 'lucide-react';

interface TestMatrixExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  testCases: TestCase[];
}

export const TestMatrixExportModal: React.FC<TestMatrixExportModalProps> = ({
  isOpen,
  onClose,
  testCases
}) => {
  const [copied, setCopied] = useState(false);
  const [filterText, setFilterText] = useState('');

  if (!isOpen) return null;

  const filteredCases = testCases.filter(tc => 
    tc.id.toLowerCase().includes(filterText.toLowerCase()) ||
    tc.title.toLowerCase().includes(filterText.toLowerCase()) ||
    tc.category.toLowerCase().includes(filterText.toLowerCase()) ||
    tc.technique.toLowerCase().includes(filterText.toLowerCase())
  );

  const generateMarkdown = () => {
    let md = '# BẢNG ĐẶC TẢ VÀ BÁO CÁO KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (100 TEST CASES)\n';
    md += `*Hệ thống: Nhà Hàng Le Gourmet Bistro - Ngày xuất: ${new Date().toLocaleString('vi-VN')}*\n\n`;
    md += '| STT | Mã TC | Hạng Mục | Loại Test | Kỹ Thuật Áp Dụng | Mô Tả Kịch Bản | Dữ Liệu Test | Kỳ Vọng HTTP | Trạng Thái |\n';
    md += '| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n';

    testCases.forEach(tc => {
      const statusText = tc.status === 'passed' ? 'PASS' : tc.status === 'failed' ? 'FAIL' : 'IDLE';
      const expectedCode = Array.isArray(tc.expectedStatus) ? tc.expectedStatus.join('/') : tc.expectedStatus;
      const cleanDesc = tc.title.replace(/\|/g, '-');
      const cleanData = tc.testDataSummary.replace(/\|/g, '-').replace(/\n/g, ' ');

      md += `| ${tc.sequenceNumber} | ${tc.id} | ${tc.category} | ${tc.type} | ${tc.technique} | ${cleanDesc} | ${cleanData} | ${expectedCode} | ${statusText} |\n`;
    });

    return md;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const reportData = {
      title: 'Báo Cáo Kiểm Thử Tự Động Le Gourmet Bistro',
      exportedAt: new Date().toISOString(),
      summary: {
        total: testCases.length,
        passed: testCases.filter(t => t.status === 'passed').length,
        failed: testCases.filter(t => t.status === 'failed').length,
        idle: testCases.filter(t => t.status === 'idle').length
      },
      testCases: testCases.map(tc => ({
        stt: tc.sequenceNumber,
        id: tc.id,
        title: tc.title,
        category: tc.category,
        type: tc.type,
        technique: tc.technique,
        endpoint: `${tc.httpMethod} ${tc.endpoint}`,
        expectedStatus: tc.expectedStatus,
        status: tc.status,
        durationMs: tc.durationMs,
        assertions: tc.assertions
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-70-cases-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += 'STT,Ma_TC,Hang_Muc,Loai_Test,Ky_Thuat,Tieu_De,Du_Lieu_Dau_Vao,Ky_Vong_HTTP,Ket_Qua_Thuc_Te,Trang_Thai\n';

    testCases.forEach(tc => {
      const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
      const expectedCode = Array.isArray(tc.expectedStatus) ? tc.expectedStatus.join('/') : tc.expectedStatus;
      const actualCode = tc.responseRecord?.status || '';

      csv += [
        tc.sequenceNumber,
        escape(tc.id),
        escape(tc.category),
        escape(tc.type),
        escape(tc.technique),
        escape(tc.title),
        escape(tc.testDataSummary),
        escape(String(expectedCode)),
        escape(String(actualCode)),
        escape(tc.status.toUpperCase())
      ].join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bang-dac-ta-70-test-cases-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">
                Bảng Đặc Tả Kiểm Thử (Test Specification Matrix — 100 Test Cases)
              </h3>
              <p className="text-xs text-stone-400">
                Chuẩn báo cáo kiểm thử ISTQB / VTI: STT, Mã TC, Hạng mục, Kỹ thuật phân vùng tương đương & giá trị biên, Dữ liệu đầu vào, Kết quả kỳ vọng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Sao chép toàn bộ bảng dưới định dạng Markdown"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              {copied ? 'Đã Chép Markdown' : 'Chép Markdown'}
            </button>

            <button
              onClick={handleDownloadCSV}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Tải file CSV mở bằng Excel"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              Xuất Excel (CSV)
            </button>

            <button
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Tải file JSON báo cáo chi tiết"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Xuất JSON
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search inside matrix */}
        <div className="px-6 py-2.5 bg-stone-950/40 border-b border-stone-800 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Lọc nhanh bảng đặc tả..."
              className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-8 pr-3 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <span className="text-xs text-stone-400 font-mono">
            Hiển thị <strong>{filteredCases.length}</strong> / {testCases.length} ca kiểm thử
          </span>
        </div>

        {/* Matrix Table */}
        <div className="p-6 overflow-auto flex-1 text-xs">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-950/80 text-[11px] font-bold text-stone-400 uppercase tracking-wider sticky top-0">
                <th className="py-2.5 px-3">STT</th>
                <th className="py-2.5 px-3">Mã TC</th>
                <th className="py-2.5 px-3">Loại</th>
                <th className="py-2.5 px-3">Hạng Mục</th>
                <th className="py-2.5 px-3">Kỹ Thuật Test</th>
                <th className="py-2.5 px-3">Mô Tả Kịch Bản</th>
                <th className="py-2.5 px-3">Dữ Liệu Đầu Vào</th>
                <th className="py-2.5 px-3">Kỳ Vọng HTTP</th>
                <th className="py-2.5 px-3 text-right">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-mono text-[11px]">
              {filteredCases.map((tc) => (
                <tr key={tc.id} className="hover:bg-stone-900/60 transition">
                  <td className="py-2.5 px-3 text-stone-400 font-bold">#{tc.sequenceNumber}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-400">{tc.id}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      tc.type === 'VALID' ? 'bg-emerald-500/10 text-emerald-400' :
                      tc.type === 'INVALID' ? 'bg-rose-500/10 text-rose-400' :
                      tc.type === 'BOUNDARY' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-purple-500/10 text-purple-400'
                    }`}>
                      {tc.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-stone-300 font-sans text-xs">{tc.category}</td>
                  <td className="py-2.5 px-3 text-stone-400 font-sans text-xs">{tc.technique}</td>
                  <td className="py-2.5 px-3 text-stone-200 font-sans text-xs max-w-xs">{tc.title}</td>
                  <td className="py-2.5 px-3 text-stone-400 max-w-xs truncate" title={tc.testDataSummary}>
                    {tc.testDataSummary}
                  </td>
                  <td className="py-2.5 px-3 text-stone-300">
                    {Array.isArray(tc.expectedStatus) ? tc.expectedStatus.join(' / ') : tc.expectedStatus}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tc.status === 'passed' ? 'bg-emerald-500/20 text-emerald-400' :
                      tc.status === 'failed' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-stone-800 text-stone-400'
                    }`}>
                      {tc.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between text-xs text-stone-400">
          <span>Tổng cộng 100 kịch bản kiểm thử phủ rộng toàn bộ nghiệp vụ nhà hàng.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
