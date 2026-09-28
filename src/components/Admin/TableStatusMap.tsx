import React, { useState } from 'react';
import { 
  Building2, 
  Crown, 
  Trees, 
  Wine, 
  Armchair, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Sparkles,
  Info
} from 'lucide-react';
import { RestaurantTable, TableArea, TableStatus, Reservation } from '../../types';

interface TableStatusMapProps {
  tables: RestaurantTable[];
  reservations: Reservation[];
  onUpdateTableStatus: (tableId: string, status: TableStatus) => void;
  onSelectReservationForTable?: (reservation: Reservation) => void;
}

export const TableStatusMap: React.FC<TableStatusMapProps> = ({
  tables,
  reservations,
  onUpdateTableStatus,
  onSelectReservationForTable,
}) => {
  const [selectedArea, setSelectedArea] = useState<TableArea | 'all'>('all');
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  // Status counters
  const totalTables = tables.length;
  const availableCount = tables.filter(t => t.status === 'available').length;
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;
  const reservedCount = tables.filter(t => t.status === 'reserved').length;
  const cleaningCount = tables.filter(t => t.status === 'cleaning').length;

  const occupancyRate = Math.round(((occupiedCount + reservedCount) / totalTables) * 100);

  const areas: { id: TableArea | 'all'; name: string; icon: any }[] = [
    { id: 'all', name: 'Toàn Bộ Khu Vực', icon: Sparkles },
    { id: 'main', name: 'Sảnh Chính', icon: Building2 },
    { id: 'vip', name: 'Phòng VIP', icon: Crown },
    { id: 'garden', name: 'Sân Vườn', icon: Trees },
    { id: 'rooftop', name: 'Rooftop', icon: Wine },
  ];

  const filteredTables = selectedArea === 'all' ? tables : tables.filter(t => t.area === selectedArea);

  // Find active reservation for selected table
  const activeReservation = selectedTable
    ? reservations.find(r => r.tableId === selectedTable.id && (r.status === 'confirmed' || r.status === 'seated'))
    : null;

  return (
    <div className="space-y-6">
      {/* Top Occupancy Status Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold block">
            Tổng Số Bàn
          </span>
          <div className="text-2xl font-extrabold text-stone-900 mt-1">{totalTables}</div>
          <span className="text-[11px] text-stone-400">4 phân khu</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[11px] text-emerald-700 uppercase tracking-wider font-semibold block">
            Bàn Sẵn Sàng
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{availableCount}</div>
          <span className="text-[11px] text-emerald-700/70">Đang chờ đón khách</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[11px] text-blue-700 uppercase tracking-wider font-semibold block">
            Đang Phục Vụ
          </span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">{occupiedCount}</div>
          <span className="text-[11px] text-blue-700/70">Khách đang ngồi</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[11px] text-amber-700 uppercase tracking-wider font-semibold block">
            Đã Đặt Trước
          </span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{reservedCount}</div>
          <span className="text-[11px] text-amber-700/70">Sắp đến nhận bàn</span>
        </div>

        <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] text-amber-400 uppercase tracking-wider font-bold block">
            Tỷ Lệ Lấp Đầy
          </span>
          <div className="text-2xl font-extrabold text-stone-100 mt-1">{occupancyRate}%</div>
          <div className="w-full bg-stone-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${occupancyRate}%` }} />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {areas.map((area) => {
          const Icon = area.icon;
          const isSelected = selectedArea === area.id;
          return (
            <button
              key={area.id}
              type="button"
              onClick={() => setSelectedArea(area.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-stone-900 text-amber-400 shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{area.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Visual Floor Grid */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-base text-stone-900">
              Sơ Đồ Phân Phối Bàn Nhà Hàng (Floor Map)
            </h3>
            <p className="text-xs text-stone-500">
              Nhấp vào bàn bất kỳ để cập nhật trạng thái trực tiếp hoặc xem thông tin khách đặt
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs hidden sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Còn trống
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Đang phục vụ
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Đã đặt trước
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-stone-300 inline-block"></span> Đang dọn bàn
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredTables.map((table) => {
            const isSelected = selectedTable?.id === table.id;
            
            // Color styles per status
            let statusColor = 'border-emerald-300 bg-emerald-50/60 text-emerald-950 hover:border-emerald-500';
            let badgeText = 'Trống';
            let badgeBg = 'bg-emerald-100 text-emerald-800';

            if (table.status === 'occupied') {
              statusColor = 'border-blue-300 bg-blue-50/60 text-blue-950 hover:border-blue-500';
              badgeText = 'Đang phục vụ';
              badgeBg = 'bg-blue-100 text-blue-800';
            } else if (table.status === 'reserved') {
              statusColor = 'border-amber-300 bg-amber-50/60 text-amber-950 hover:border-amber-500';
              badgeText = 'Đã đặt';
              badgeBg = 'bg-amber-100 text-amber-800';
            } else if (table.status === 'cleaning') {
              statusColor = 'border-stone-300 bg-stone-100 text-stone-700 hover:border-stone-400';
              badgeText = 'Đang dọn';
              badgeBg = 'bg-stone-200 text-stone-700';
            }

            return (
              <div
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between h-36 ${statusColor} ${
                  isSelected ? 'ring-3 ring-amber-500 scale-[1.03] shadow-md' : 'shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                      {table.id}
                    </span>
                    <h4 className="font-bold text-sm text-stone-900 line-clamp-1">{table.name}</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeBg}`}>
                    {badgeText}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-600 mt-2">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{table.capacity} ghế</span>
                  </div>
                  <Armchair className="w-4 h-4 opacity-70" />
                </div>

                <div className="pt-2 border-t border-stone-200/60 text-[10px] font-medium text-stone-500 truncate">
                  {table.currentReservationId ? `Đơn: #${table.currentReservationId}` : 'Sẵn sàng xếp khách'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Table Action Drawer/Card */}
      {selectedTable && (
        <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 sm:p-6 shadow-md animate-fade-in flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                Chi Tiết Bàn: {selectedTable.id}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-800 text-stone-200">
                Sức chứa {selectedTable.capacity} khách
              </span>
            </div>
            <h3 className="font-serif-heading text-lg sm:text-xl font-bold text-stone-100">
              {selectedTable.name}
            </h3>

            {activeReservation ? (
              <div className="text-xs text-stone-300 flex flex-wrap items-center gap-3 pt-1">
                <span>Khách: <strong className="text-stone-100">{activeReservation.customerName}</strong> ({activeReservation.customerPhone})</span>
                <span>•</span>
                <span>Giờ hẹn: <strong className="text-amber-400">{activeReservation.arrivalTime}</strong></span>
                <span>•</span>
                <span>Mã: <strong>#{activeReservation.bookingCode}</strong></span>
              </div>
            ) : (
              <p className="text-xs text-stone-400">Hiện chưa có khách đặt hẹn vào khung giờ này.</p>
            )}
          </div>

          {/* Table Status Quick Switcher */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs text-stone-400 mr-1 hidden sm:inline">Đổi trạng thái bàn:</span>
            <button
              type="button"
              onClick={() => onUpdateTableStatus(selectedTable.id, 'available')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedTable.status === 'available'
                  ? 'bg-emerald-500 text-stone-950 font-extrabold'
                  : 'bg-stone-800 text-emerald-400 hover:bg-stone-700'
              }`}
            >
              Trống (Sẵn sàng)
            </button>
            <button
              type="button"
              onClick={() => onUpdateTableStatus(selectedTable.id, 'occupied')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedTable.status === 'occupied'
                  ? 'bg-blue-500 text-stone-950 font-extrabold'
                  : 'bg-stone-800 text-blue-400 hover:bg-stone-700'
              }`}
            >
              Đang có khách
            </button>
            <button
              type="button"
              onClick={() => onUpdateTableStatus(selectedTable.id, 'reserved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedTable.status === 'reserved'
                  ? 'bg-amber-500 text-stone-950 font-extrabold'
                  : 'bg-stone-800 text-amber-400 hover:bg-stone-700'
              }`}
            >
              Đã giữ chỗ
            </button>
            <button
              type="button"
              onClick={() => onUpdateTableStatus(selectedTable.id, 'cleaning')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedTable.status === 'cleaning'
                  ? 'bg-stone-200 text-stone-950 font-extrabold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              Đang dọn bàn
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
