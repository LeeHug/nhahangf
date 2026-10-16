import React, { useState } from 'react';
import { TestCase } from './testTypes';
import { X, Copy, Download, FileText, Check, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

interface TestMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  tests: TestCase[];
}

export const TestMatrixModal: React.FC<TestMatrixModalProps> = ({
  isOpen,
  onClose,
  tests
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalPassed = tests.filter(t => t.status === 'passed').length;
  const totalFailed = tests.filter(t => t.status === 'failed').length;
  const passRate = tests.length > 0 ? Math.round((totalPassed / tests.length) * 100) : 0;

  const generateMarkdownReport = (): string => {
    let md = `# BÁO CÁO KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (AUTOMATION TEST REPORT)\n`;
    md += `**Hệ Thống:** Website Đặt Bàn & Quản Trị Nhà Hàng Le Gourmet Bistro\n`;
    md += `**Đơn Vị Nghiên Cứu:** Công ty Cổ phần VTI / Đề Tài Khóa Luận Tốt Nghiệp\n`;
    md += `**Thời Gian Xuất Báo Cáo:** ${new Date().toLocaleString('vi-VN')}\n`;
    md += `**Tổng Số Test Cases:** ${tests.length} | **Đạt (Pass):** ${totalPassed} | **Lỗi (Fail):** ${totalFailed} | **Tỷ Lệ Đạt:** ${passRate}%\n\n`;
    md += `## BẢNG MA TRẬN TEST CASE & TEST VIEW POINTS (STLC EXECUTION MATRIX)\n\n`;
    md += `| STT | Mã TC | Phân Hệ | Kỹ Thuật Thiết Kế | Test View Point & Mục Tiêu | Endpoint & Method | Kết Quả Mong Đợi | Kết Quả Thực Tế | Đánh Giá |\n`;
    md += `| :---: | :---: | :---: | :---: | :--- | :--- | :--- | :--- | :---: |\n`;

    tests.forEach((t, index) => {
      const actual = t.responseRecord ? `HTTP ${t.responseRecord.status} (${t.durationMs || 0}ms)` : 'Chưa chạy';
      const statusStr = t.status === 'passed' ? '**PASS** ✅' : t.status === 'failed' ? '**FAIL** ❌' : 'PENDING ⏳';
      md += `| ${index + 1} | ${t.id} | ${t.suiteName} | ${t.technique} | ${t.viewpoint.replace(/\|/g, '-')} | \`${t.httpMethod} ${t.endpoint}\` | ${t.expectedResult.replace(/\|/g, '-')} | ${actual} | ${statusStr} |\n`;
    });

    md += `\n---\n*Báo cáo được khởi tạo tự động bởi Hệ Thống Automation Testing Le Gourmet Bistro.*`;
    return md;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdownReport();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const reportData = {
      project: 'Le Gourmet Bistro',
      topic: 'Nghiên cứu và áp dụng quy trình kiểm thử phần mềm cho website đặt bàn nhà hàng',
      hostOrganization: 'Công ty Cổ phần VTI',
      exportedAt: new Date().toISOString(),
      summary: {
        totalTests: tests.length,
        passed: totalPassed,
        failed: totalFailed,
        passRate: `${passRate}%`
      },
      tests
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_Cao_Kiem_Thu_LeGourmet_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-stone-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                Bảng Đặc Tả Test Case & Test View Points
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Chuẩn VTI & Khóa Luận
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Tổng hợp ma trận kiểm thử STLC, phân vùng tương đương, giá trị biên và chuyển trạng thái
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã Sao Chép Markdown!' : 'Sao Chép Bảng Báo Cáo (Markdown)'}</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs flex items-center gap-1.5 border border-stone-700 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Tải JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Table View */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Summary Metric Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-950/80 p-4 rounded-xl border border-stone-800 text-xs">
            <div>
              <span className="text-stone-400 block">Tổng số Test Case</span>
              <span className="text-lg font-bold text-stone-100">{tests.length} Cases</span>
            </div>
            <div>
              <span className="text-stone-400 block">Số Case Đạt (Passed)</span>
              <span className="text-lg font-bold text-emerald-400">{totalPassed} Passed</span>
            </div>
            <div>
              <span className="text-stone-400 block">Số Case Lỗi (Failed)</span>
              <span className="text-lg font-bold text-rose-400">{totalFailed} Failed</span>
            </div>
            <div>
              <span className="text-stone-400 block">Tỷ Lệ Hoàn Thành (Pass Rate)</span>
              <span className="text-lg font-bold text-amber-400">{passRate}%</span>
            </div>
          </div>

          {/* Test Matrix Table */}
          <div className="border border-stone-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-950 text-stone-400 font-semibold border-b border-stone-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3 text-center">STT</th>
                    <th className="py-3 px-3">Mã TC</th>
                    <th className="py-3 px-4">Nhóm Chức Năng</th>
                    <th className="py-3 px-4">Kỹ Thuật Kiểm Thử</th>
                    <th className="py-3 px-4 min-w-[200px]">Test View Point & Mục Tiêu</th>
                    <th className="py-3 px-3">Endpoint & Method</th>
                    <th className="py-3 px-4 min-w-[200px]">Kết Quả Mong Đợi</th>
                    <th className="py-3 px-3 text-center">Đánh Giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800 text-stone-300">
                  {tests.map((t, index) => (
                    <tr key={t.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="py-3 px-3 text-center text-stone-500 font-mono">{index + 1}</td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">{t.id}</td>
                      <td className="py-3 px-4 text-stone-200 font-medium whitespace-nowrap">{t.suiteName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-stone-800 text-stone-300 border border-stone-700 whitespace-nowrap">
                          {t.technique}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-300 leading-relaxed">{t.viewpoint}</td>
                      <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap">
                        <span className="text-amber-500 font-bold mr-1">{t.httpMethod}</span>
                        <span className="text-stone-400">{t.endpoint}</span>
                      </td>
                      <td className="py-3 px-4 text-stone-300 leading-relaxed text-[11px]">{t.expectedResult}</td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {t.status === 'passed' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> PASS
                          </span>
                        ) : t.status === 'failed' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3" /> FAIL
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-800 text-stone-500">
                            PENDING
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-xs text-stone-400">
          <span>* Bảng ma trận phản ánh đúng cấu trúc STLC và phân vùng kiểm thử của đề tài tốt nghiệp.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
