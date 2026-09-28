import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download, 
  Printer, 
  Users, 
  ShoppingBag, 
  Utensils, 
  PieChart, 
  FileSpreadsheet,
  Award,
  ChevronRight
} from 'lucide-react';
import { Reservation, MenuItem } from '../../types';
import { formatVND } from '../../services/storage';

interface RevenueReportViewProps {
  reservations: Reservation[];
}

export const RevenueReportView: React.FC<RevenueReportViewProps> = ({ reservations }) => {
  const [timeframe, setTimeframe] = useState<'all' | 'today' | 'this_week' | 'this_month'>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter reservations based on timeframe
  const filteredReservations = reservations.filter((r) => {
    if (r.status === 'cancelled') return false; // Exclude cancelled from revenue

    if (timeframe === 'today') {
      return r.bookingDate === todayStr;
    }
    if (timeframe === 'this_week') {
      const resDate = new Date(r.bookingDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return resDate >= weekAgo;
    }
    return true;
  });

  // Financial Metrics
  const totalRevenue = filteredReservations.reduce((sum, r) => sum + r.preOrderTotal, 0);
  const totalDepositCollected = filteredReservations.reduce((sum, r) => sum + r.depositAmount, 0);
  const totalBookings = filteredReservations.length;
  const totalGuests = filteredReservations.reduce((sum, r) => sum + r.guestCount, 0);
  const averageOrderValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
  const averagePerGuest = totalGuests > 0 ? Math.round(totalRevenue / totalGuests) : 0;

  // Revenue by Area
  const areaRevenueMap: Record<string, { name: string; total: number; count: number }> = {
    main: { name: 'Sảnh Chính', total: 0, count: 0 },
    vip: { name: 'Phòng VIP', total: 0, count: 0 },
    garden: { name: 'Sân Vườn', total: 0, count: 0 },
    rooftop: { name: 'Ban Công Rooftop', total: 0, count: 0 },
  };

  filteredReservations.forEach((r) => {
    if (areaRevenueMap[r.tableArea]) {
      areaRevenueMap[r.tableArea].total += r.preOrderTotal;
      areaRevenueMap[r.tableArea].count += 1;
    }
  });

  // Top Selling Dishes
  const dishSalesMap: Record<string, { name: string; quantity: number; totalRevenue: number; price: number }> = {};

  filteredReservations.forEach((r) => {
    r.selectedDishes?.forEach((item) => {
      if (!dishSalesMap[item.dish.id]) {
        dishSalesMap[item.dish.id] = {
          name: item.dish.name,
          quantity: 0,
          totalRevenue: 0,
          price: item.dish.price,
        };
      }
      dishSalesMap[item.dish.id].quantity += item.quantity;
      dishSalesMap[item.dish.id].totalRevenue += item.dish.price * item.quantity;
    });
  });

  const topDishes = Object.values(dishSalesMap).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 6);

  // Group by Date for timeline
  const dateMap: Record<string, { date: string; revenue: number; bookings: number; guests: number }> = {};
  filteredReservations.forEach((r) => {
    if (!dateMap[r.bookingDate]) {
      dateMap[r.bookingDate] = { date: r.bookingDate, revenue: 0, bookings: 0, guests: 0 };
    }
    dateMap[r.bookingDate].revenue += r.preOrderTotal;
    dateMap[r.bookingDate].bookings += 1;
    dateMap[r.bookingDate].guests += r.guestCount;
  });

  const dailyTimeline = Object.values(dateMap).sort((a, b) => b.date.localeCompare(a.date));

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'BÁO CÁO DOANH THU NHÀ HÀNG LE GOURMET BISTRO',
      `Thời điểm xuất: ${new Date().toLocaleString('vi-VN')}`,
      '',
      'Ngày',
      'Số Lượt Đặt Bàn',
      'Số Khách Phục Vụ',
      'Doanh Thu (VND)',
      'Giá Trị TB / Bàn (VND)',
    ];

    const dataRows = dailyTimeline.map((item) => [
      item.date,
      item.bookings,
      item.guests,
      item.revenue,
      item.bookings > 0 ? Math.round(item.revenue / item.bookings) : 0,
    ]);

    const summarySection = [
      '',
      'TỔNG KẾT DOANH THU',
      `Tổng Doanh Thu: ${totalRevenue}`,
      `Tổng Đơn Đặt Bàn: ${totalBookings}`,
      `Tổng Thực Khách: ${totalGuests}`,
      `Giá Trị Đơn Trung Bình (AOV): ${averageOrderValue}`,
      `Tiền Cọc Đã Thu: ${totalDepositCollected}`,
    ];

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...dataRows.map((r) => r.join(',')),
      ...summarySection,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BaoCaoDoanhThu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Professional Printable Financial Statement
  const handlePrintFinancialReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printableHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Báo Cáo Doanh Thu - Le Gourmet Bistro</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1c1917; }
          .header { text-align: center; border-bottom: 2px solid #e7e5e4; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; text-transform: uppercase; margin: 0; }
          .subtitle { color: #78716c; font-size: 14px; margin-top: 5px; }
          .stats-grid { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 15px; }
          .stat-box { border: 1px solid #e7e5e4; padding: 15px; border-radius: 8px; flex: 1; text-align: center; background: #fafaf9; }
          .stat-label { font-size: 12px; color: #78716c; text-transform: uppercase; }
          .stat-value { font-size: 20px; font-weight: bold; color: #b45309; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
          th, td { border: 1px solid #e7e5e4; padding: 10px 12px; text-align: left; }
          th { background-color: #f5f5f4; font-weight: bold; }
          .text-right { text-align: right; }
          .footer { margin-top: 40px; text-align: right; font-size: 12px; color: #78716c; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">BÁO CÁO DOANH THU & ĐẶT BÀN CHI TIẾT</h1>
          <div class="subtitle">Nhà Hàng Le Gourmet Bistro • 128 Nguyễn Huệ, Quận 1, TP.HCM</div>
          <div class="subtitle">Ngày kết xuất: ${new Date().toLocaleString('vi-VN')}</div>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-label">Tổng Doanh Thu Món</div>
            <div class="stat-value">${formatVND(totalRevenue)}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Tổng Lượt Đặt Bàn</div>
            <div class="stat-value">${totalBookings} Bàn</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Số Khách Phục Vụ</div>
            <div class="stat-value">${totalGuests} Khách</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Giá Trị TB / Bàn</div>
            <div class="stat-value">${formatVND(averageOrderValue)}</div>
          </div>
        </div>

        <h3>1. BẢNG CHI TIẾT DOANH THU THEO NGÀY</h3>
        <table>
          <thead>
            <tr>
              <th>Ngày</th>
              <th class="text-right">Lượt Đặt Bàn</th>
              <th class="text-right">Số Khách</th>
              <th class="text-right">Doanh Thu Món</th>
              <th class="text-right">TB / Khách</th>
            </tr>
          </thead>
          <tbody>
            ${dailyTimeline.map(d => `
              <tr>
                <td>${new Date(d.date).toLocaleDateString('vi-VN')}</td>
                <td class="text-right">${d.bookings}</td>
                <td class="text-right">${d.guests}</td>
                <td class="text-right" style="font-weight: bold;">${formatVND(d.revenue)}</td>
                <td class="text-right">${formatVND(d.guests > 0 ? Math.round(d.revenue / d.guests) : 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3 style="margin-top: 30px;">2. TOP MÓN ĂN BÁN CHẠY NHẤT</h3>
        <table>
          <thead>
            <tr>
              <th>Tên Món Ăn</th>
              <th class="text-right">Đơn Giá</th>
              <th class="text-right">Số Lượng Đã Bán</th>
              <th class="text-right">Tổng Doanh Thu</th>
            </tr>
          </thead>
          <tbody>
            ${topDishes.map(dish => `
              <tr>
                <td>${dish.name}</td>
                <td class="text-right">${formatVND(dish.price)}</td>
                <td class="text-right">${dish.quantity}</td>
                <td class="text-right" style="font-weight: bold;">${formatVND(dish.totalRevenue)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Người lập báo cáo: _________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Giám Đốc Điều Hành: _________________________</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printableHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Kỳ Báo Cáo:</span>
          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                timeframe === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Tất Cả
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                timeframe === 'today' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Hôm Nay
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('this_week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                timeframe === 'this_week' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              7 Ngày Gần Nhất
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Xuất Báo Cáo CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrintFinancialReport}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Báo Cáo / PDF</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Tổng Doanh Thu</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-900 mt-2">
            {formatVND(totalRevenue)}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Đã tính {totalBookings} đơn đặt bàn xác nhận</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Giá Trị TB / Bàn (AOV)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2">
            {formatVND(averageOrderValue)}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Trung bình {formatVND(averagePerGuest)} / khách</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Khách Hàng Đã Phục Vụ</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2">
            {totalGuests} Thực Khách
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Tổng cộng {totalBookings} lượt bàn</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Tiền Cọc Đã Tiếp Nhận</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-900 mt-2">
            {formatVND(totalDepositCollected)}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Đảm bảo tỷ lệ đến bàn đạt 98%</p>
        </div>
      </div>

      {/* Grid for Area breakdown & Top Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Top Dishes Leaderboard (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-stone-900">
                Top Món Ăn Mang Lại Doanh Thu Cao Nhất
              </h3>
            </div>
            <span className="text-xs text-stone-400 font-medium">Xếp theo tổng tiền</span>
          </div>

          <div className="space-y-3">
            {topDishes.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">Chưa có dữ liệu món ăn được đặt trước.</p>
            ) : (
              topDishes.map((dish, idx) => {
                const percentage = totalRevenue > 0 ? Math.round((dish.totalRevenue / totalRevenue) * 100) : 0;
                return (
                  <div key={dish.name} className="space-y-1.5 p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          idx === 0 ? 'bg-amber-500 text-stone-950' : idx === 1 ? 'bg-stone-300 text-stone-800' : 'bg-stone-200 text-stone-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-bold text-stone-900">{dish.name}</span>
                        <span className="text-stone-400 text-[11px]">({dish.quantity} phần đã bán)</span>
                      </div>
                      <span className="font-extrabold text-amber-900">{formatVND(dish.totalRevenue)}</span>
                    </div>

                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-600 h-full rounded-full" style={{ width: `${Math.max(5, percentage)}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Revenue by Area (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-stone-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-600" />
              <span>Doanh Thu Theo Phân Khu</span>
            </h3>
            <span className="text-xs text-stone-400">4 khu vực</span>
          </div>

          <div className="space-y-3">
            {Object.entries(areaRevenueMap).map(([key, data]) => {
              const share = totalRevenue > 0 ? Math.round((data.total / totalRevenue) * 100) : 0;
              return (
                <div key={key} className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-800">{data.name}</span>
                    <span className="font-extrabold text-stone-900">{formatVND(data.total)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-500">
                    <span>{data.count} lượt đặt bàn</span>
                    <span className="font-semibold text-amber-800">{share}% tổng doanh thu</span>
                  </div>
                  <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-stone-800 h-full rounded-full" style={{ width: `${share}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-stone-900">Chi Tiết Doanh Thu Theo Ngày</h3>
            <p className="text-xs text-stone-500">Theo dõi dòng tiền và mức độ tăng trưởng lượng khách</p>
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="text-xs text-amber-700 font-bold hover:underline flex items-center gap-1"
          >
            <span>Tải bảng dữ liệu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-600 uppercase font-semibold text-[11px] border-b border-stone-200">
                <th className="py-3 px-4">Ngày</th>
                <th className="py-3 px-4 text-center">Số Lượt Đặt Bàn</th>
                <th className="py-3 px-4 text-center">Số Thực Khách</th>
                <th className="py-3 px-4 text-right">Doanh Thu Món Ăn</th>
                <th className="py-3 px-4 text-right">Doanh Thu TB / Bàn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {dailyTimeline.map((item) => (
                <tr key={item.date} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-stone-900">
                    {new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-stone-800">
                    {item.bookings} bàn
                  </td>
                  <td className="py-3 px-4 text-center text-stone-600">
                    {item.guests} người
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-amber-900">
                    {formatVND(item.revenue)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-stone-700">
                    {formatVND(item.bookings > 0 ? Math.round(item.revenue / item.bookings) : 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
