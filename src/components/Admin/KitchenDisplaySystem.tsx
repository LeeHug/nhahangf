import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, 
  UtensilsCrossed, 
  Wine, 
  IceCream, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  ChefHat, 
  Zap, 
  Play, 
  Check, 
  RotateCcw,
  Sparkles,
  Users,
  Search,
  Filter
} from 'lucide-react';
import { 
  KitchenTicket, 
  KitchenTicketItem, 
  KitchenStation, 
  KitchenItemStatus, 
  KitchenTicketPriority 
} from '../../types';
import { 
  getStoredKitchenTickets, 
  updateKitchenItemStatus, 
  bumpAllItemsInTicket, 
  toggleTicketPriority, 
  playKitchenChime 
} from '../../services/storage';

interface KitchenDisplaySystemProps {
  onRefreshParentReservations?: () => void;
}

export const KitchenDisplaySystem: React.FC<KitchenDisplaySystemProps> = ({
  onRefreshParentReservations
}) => {
  const [tickets, setTickets] = useState<KitchenTicket[]>([]);
  const [selectedStation, setSelectedStation] = useState<KitchenStation>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'ready' | 'history'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Reload tickets
  const refreshTickets = () => {
    const loaded = getStoredKitchenTickets();
    setTickets(loaded);
  };

  useEffect(() => {
    refreshTickets();
    // Live timer ticking every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Sound chime wrapper
  const triggerChime = (type: 'ready' | 'order_arrival' | 'urgent') => {
    if (soundEnabled) {
      playKitchenChime(type);
    }
  };

  // Item status handler
  const handleItemStatusChange = (ticketId: string, itemId: string, nextStatus: KitchenItemStatus) => {
    const updated = updateKitchenItemStatus(ticketId, itemId, nextStatus);
    setTickets(updated);
    if (nextStatus === 'ready') {
      triggerChime('ready');
    }
    if (onRefreshParentReservations) onRefreshParentReservations();
  };

  // Ticket bump all items handler
  const handleBumpTicket = (ticketId: string, targetStatus: KitchenItemStatus) => {
    const updated = bumpAllItemsInTicket(ticketId, targetStatus);
    setTickets(updated);
    if (targetStatus === 'ready') {
      triggerChime('ready');
    }
    if (onRefreshParentReservations) onRefreshParentReservations();
  };

  // Toggle rush/vip priority
  const handleTogglePriority = (ticketId: string) => {
    const updated = toggleTicketPriority(ticketId);
    setTickets(updated);
  };

  // Calculate elapsed time in minutes
  const getElapsedMinutes = (isoString: string): number => {
    const diffMs = currentTime.getTime() - new Date(isoString).getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
  };

  // Format elapsed time string
  const formatElapsedTime = (isoString: string): { text: string; level: 'normal' | 'warning' | 'urgent' } => {
    const minutes = getElapsedMinutes(isoString);
    let level: 'normal' | 'warning' | 'urgent' = 'normal';
    if (minutes >= 20) level = 'urgent';
    else if (minutes >= 10) level = 'warning';

    const seconds = Math.floor((currentTime.getTime() - new Date(isoString).getTime()) / 1000) % 60;
    const formatted = `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
    return { text: formatted, level };
  };

  // Station badges & icons helper
  const getStationInfo = (station: KitchenStation) => {
    switch (station) {
      case 'hot_kitchen':
        return { label: 'Bếp Nóng', icon: Flame, color: 'text-amber-400 bg-amber-950/40 border-amber-800/60' };
      case 'cold_kitchen':
        return { label: 'Bếp Lạnh', icon: UtensilsCrossed, color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/60' };
      case 'bar':
        return { label: 'Quầy Bar', icon: Wine, color: 'text-purple-400 bg-purple-950/40 border-purple-800/60' };
      case 'pastry':
        return { label: 'Bếp Bánh', icon: IceCream, color: 'text-pink-400 bg-pink-950/40 border-pink-800/60' };
      default:
        return { label: 'Tất Cả', icon: ChefHat, color: 'text-stone-300 bg-stone-800 border-stone-700' };
    }
  };

  // Filtered tickets logic
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Station filtering: check if ticket has at least one item matching the station
      if (selectedStation !== 'all') {
        const hasStationItem = ticket.items.some(item => item.station === selectedStation);
        if (!hasStationItem) return false;
      }

      // Search query (table name, booking code, customer name, dish name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchMeta = 
          ticket.tableName.toLowerCase().includes(q) ||
          ticket.bookingCode.toLowerCase().includes(q) ||
          ticket.customerName.toLowerCase().includes(q);
        const matchDish = ticket.items.some(i => i.name.toLowerCase().includes(q));
        if (!matchMeta && !matchDish) return false;
      }

      // Status filtering:
      const allServed = ticket.items.every(i => i.status === 'served');
      const allReadyOrServed = ticket.items.every(i => i.status === 'ready' || i.status === 'served');
      const hasReady = ticket.items.some(i => i.status === 'ready');

      if (statusFilter === 'history') {
        return allServed;
      }
      if (statusFilter === 'ready') {
        return !allServed && (allReadyOrServed || hasReady);
      }
      // 'active': has items that are pending or cooking
      return !allServed;
    });
  }, [tickets, selectedStation, statusFilter, searchQuery]);

  // Overall system metrics
  const metrics = useMemo(() => {
    let activeTicketsCount = 0;
    let cookingItemsCount = 0;
    let readyItemsCount = 0;
    let overdueTicketsCount = 0;
    let totalPrepTimes: number[] = [];

    tickets.forEach(ticket => {
      const isComplete = ticket.items.every(i => i.status === 'served');
      if (!isComplete) {
        activeTicketsCount++;
        const elapsed = getElapsedMinutes(ticket.createdAt);
        if (elapsed >= 20) overdueTicketsCount++;
      }

      ticket.items.forEach(item => {
        if (item.status === 'cooking') cookingItemsCount++;
        if (item.status === 'ready') readyItemsCount++;
        if (item.readyAt && item.startedAt) {
          const diffMin = Math.round((new Date(item.readyAt).getTime() - new Date(item.startedAt).getTime()) / (1000 * 60));
          if (diffMin > 0 && diffMin < 60) totalPrepTimes.push(diffMin);
        }
      });
    });

    const avgPrep = totalPrepTimes.length > 0 
      ? Math.round(totalPrepTimes.reduce((a, b) => a + b, 0) / totalPrepTimes.length) 
      : 14;

    return {
      activeTicketsCount,
      cookingItemsCount,
      readyItemsCount,
      overdueTicketsCount,
      avgPrep,
    };
  }, [tickets, currentTime]);

  return (
    <div className="bg-stone-950 text-stone-100 rounded-3xl p-4 sm:p-6 shadow-2xl border border-stone-800 space-y-6">
      {/* KDS Header Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-amber-950/50">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-heading text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Kitchen Display System (KDS)
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Real-Time
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Màn hình điều phối chế biến theo trạm Bếp Nóng, Bếp Lạnh, Quầy Bar & Bếp Bánh
            </p>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Live Clock */}
          <div className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 font-mono flex items-center gap-1.5 font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentTime.toLocaleTimeString('vi-VN')}</span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) triggerChime('order_arrival');
            }}
            className={`px-3 py-2 rounded-xl font-medium flex items-center gap-1.5 transition border cursor-pointer ${
              soundEnabled
                ? 'bg-amber-600/20 border-amber-600/40 text-amber-300 hover:bg-amber-600/30'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
            title="Bật/Tắt chuông báo bếp khi có món ra"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Chuông: Bật' : 'Chuông: Tắt'}</span>
          </button>

          {/* Test Sound */}
          <button
            type="button"
            onClick={() => triggerChime('ready')}
            className="px-2.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white transition cursor-pointer"
            title="Thử âm thanh chuông ra món"
          >
            Thử Chuông 🔔
          </button>

          {/* Manual Refresh */}
          <button
            type="button"
            onClick={refreshTickets}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white transition cursor-pointer"
            title="Tải lại danh sách vé bếp"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white transition cursor-pointer"
            title="Bật chế độ toàn màn hình cho trạm Bếp"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Metric KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3.5">
          <div className="text-[11px] text-stone-400">Vé đang xử lý</div>
          <div className="text-xl font-black text-amber-400 mt-0.5 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>{metrics.activeTicketsCount}</span>
          </div>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3.5">
          <div className="text-[11px] text-stone-400">Món đang nấu</div>
          <div className="text-xl font-black text-blue-400 mt-0.5 flex items-center gap-1.5">
            <UtensilsCrossed className="w-4 h-4 text-blue-400" />
            <span>{metrics.cookingItemsCount}</span>
          </div>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3.5">
          <div className="text-[11px] text-stone-400">Đã xong (Chờ bưng)</div>
          <div className="text-xl font-black text-emerald-400 mt-0.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{metrics.readyItemsCount}</span>
          </div>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3.5">
          <div className="text-[11px] text-stone-400">Vé quá giờ (&gt; 20p)</div>
          <div className={`text-xl font-black mt-0.5 flex items-center gap-1.5 ${metrics.overdueTicketsCount > 0 ? 'text-red-400 animate-pulse' : 'text-stone-400'}`}>
            <AlertTriangle className="w-4 h-4" />
            <span>{metrics.overdueTicketsCount}</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-stone-900/90 border border-stone-800 rounded-2xl p-3.5">
          <div className="text-[11px] text-stone-400">Thời gian ra món TB</div>
          <div className="text-xl font-black text-purple-400 mt-0.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>~{metrics.avgPrep} phút</span>
          </div>
        </div>
      </div>

      {/* Filter Navigation Row: Station Tabs & Status Segmented Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Stations Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-stone-900 p-1.5 rounded-2xl border border-stone-800 text-xs">
          {(['all', 'hot_kitchen', 'cold_kitchen', 'bar', 'pastry'] as KitchenStation[]).map(station => {
            const info = getStationInfo(station);
            const Icon = info.icon;
            const isSelected = selectedStation === station;

            return (
              <button
                key={station}
                type="button"
                onClick={() => setSelectedStation(station)}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600 text-stone-950 font-bold shadow-md shadow-amber-950/40'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{info.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status Segmented Control & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm bàn, mã hoặc món..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-stone-900 border border-stone-800 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/60 w-44 sm:w-56"
            />
          </div>

          <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-2xl border border-stone-800 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-stone-800 text-amber-400 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Đang Nấu ({metrics.activeTicketsCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ready')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                statusFilter === 'ready'
                  ? 'bg-stone-800 text-emerald-400 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Chờ Bưng ({metrics.readyItemsCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('history')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                statusFilter === 'history'
                  ? 'bg-stone-800 text-stone-200 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Đã Phục Vụ
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Grid Area */}
      {filteredTickets.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-stone-900/50 border border-stone-800/80 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-stone-800 flex items-center justify-center text-stone-400">
            <ChefHat className="w-8 h-8" />
          </div>
          <h3 className="font-serif-heading text-lg font-bold text-stone-200">
            Không có món nào trong hàng đợi
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Hiện tại trạm bếp được chọn không có đơn đặt món nào đang chờ chế biến. Các món mới khi được đặt hoặc gọi tại bàn sẽ tự động hiển thị ở đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredTickets.map(ticket => {
            const elapsed = formatElapsedTime(ticket.createdAt);
            const allItemsServed = ticket.items.every(i => i.status === 'served');
            const allItemsReady = ticket.items.every(i => i.status === 'ready' || i.status === 'served');
            const hasCookingOrPending = ticket.items.some(i => i.status === 'pending' || i.status === 'cooking');

            // Filter items displayed if a specific station is chosen
            const displayItems = selectedStation === 'all' 
              ? ticket.items 
              : ticket.items.filter(i => i.station === selectedStation);

            return (
              <div 
                key={ticket.id}
                className={`rounded-3xl border flex flex-col justify-between transition-all duration-200 overflow-hidden shadow-xl ${
                  ticket.priority === 'rush'
                    ? 'bg-stone-900/95 border-red-500/80 shadow-red-950/30 ring-1 ring-red-500/50'
                    : ticket.priority === 'vip'
                    ? 'bg-stone-900/95 border-amber-500/80 shadow-amber-950/30 ring-1 ring-amber-500/40'
                    : 'bg-stone-900/90 border-stone-800 hover:border-stone-700'
                }`}
              >
                {/* Ticket Top Header Bar */}
                <div className={`p-4 border-b ${
                  elapsed.level === 'urgent'
                    ? 'bg-red-950/40 border-red-900/60'
                    : elapsed.level === 'warning'
                    ? 'bg-amber-950/30 border-amber-900/40'
                    : 'bg-stone-850 border-stone-800'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-white tracking-wide">
                          {ticket.tableName}
                        </span>
                        <span className="text-xs text-stone-400 font-mono">
                          #{ticket.bookingCode}
                        </span>
                      </div>
                      <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-2">
                        <span>{ticket.customerName}</span>
                        <span>·</span>
                        <span>{ticket.guestCount} khách</span>
                        <span>·</span>
                        <span className="capitalize">{ticket.tableArea}</span>
                      </div>
                    </div>

                    {/* Timer & Priority Badge */}
                    <div className="flex flex-col items-end gap-1.5">
                      {/* Priority Tag Toggle */}
                      <button
                        type="button"
                        onClick={() => handleTogglePriority(ticket.id)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer border ${
                          ticket.priority === 'rush'
                            ? 'bg-red-600 text-white border-red-500 animate-pulse'
                            : ticket.priority === 'vip'
                            ? 'bg-amber-500 text-stone-950 border-amber-400'
                            : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                        }`}
                        title="Bấm để đổi độ ưu tiên: Thường ➔ GẤP (Rush) ➔ VIP"
                      >
                        {ticket.priority === 'rush' ? '⚡ RUSH / GẤP' : ticket.priority === 'vip' ? '👑 VIP' : 'THƯỜNG'}
                      </button>

                      {/* Elapsed Timer */}
                      <div className={`text-xs font-mono font-bold flex items-center gap-1 ${
                        elapsed.level === 'urgent'
                          ? 'text-red-400 font-black animate-pulse'
                          : elapsed.level === 'warning'
                          ? 'text-amber-400'
                          : 'text-stone-300'
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span>{elapsed.text}</span>
                      </div>
                    </div>
                  </div>

                  {ticket.notes && (
                    <div className="mt-2.5 p-2 rounded-xl bg-stone-950/60 border border-stone-800 text-[11px] text-amber-300/90 leading-tight">
                      <strong>Ghi chú:</strong> {ticket.notes}
                    </div>
                  )}
                </div>

                {/* Ticket Dish Items List */}
                <div className="p-4 space-y-2.5 flex-1 overflow-y-auto max-h-[360px]">
                  {displayItems.map((item) => {
                    const stationInfo = getStationInfo(item.station);
                    const StationIcon = stationInfo.icon;
                    const isServed = item.status === 'served';
                    const isReady = item.status === 'ready';
                    const isCooking = item.status === 'cooking';

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          isServed
                            ? 'bg-stone-950/40 border-stone-900 opacity-50'
                            : isReady
                            ? 'bg-emerald-950/30 border-emerald-800/80 ring-1 ring-emerald-500/30'
                            : isCooking
                            ? 'bg-amber-950/20 border-amber-800/60'
                            : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 flex-1">
                            {/* Quantity Block */}
                            <span className={`w-7 h-7 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                              isReady
                                ? 'bg-emerald-600 text-white'
                                : isCooking
                                ? 'bg-amber-600 text-stone-950'
                                : 'bg-stone-800 text-stone-200'
                            }`}>
                              {item.quantity}x
                            </span>

                            <div className="space-y-0.5">
                              <h4 className={`text-sm font-bold text-white leading-snug ${
                                isServed ? 'line-through text-stone-500' : ''
                              }`}>
                                {item.name}
                              </h4>

                              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border ${stationInfo.color}`}>
                                  <StationIcon className="w-2.5 h-2.5" />
                                  <span>{stationInfo.label}</span>
                                </span>

                                {item.specialNotes && (
                                  <span className="text-amber-400/90 font-medium italic">
                                    ★ {item.specialNotes}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Individual Item Action Pill Button */}
                          <div className="shrink-0 flex items-center gap-1">
                            {item.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleItemStatusChange(ticket.id, item.id, 'cooking')}
                                className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-[11px] font-black tracking-wide cursor-pointer transition flex items-center gap-1 shadow-sm"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Nấu</span>
                              </button>
                            )}

                            {item.status === 'cooking' && (
                              <button
                                type="button"
                                onClick={() => handleItemStatusChange(ticket.id, item.id, 'ready')}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black tracking-wide cursor-pointer transition flex items-center gap-1 shadow-sm"
                              >
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>Ra Món</span>
                              </button>
                            )}

                            {item.status === 'ready' && (
                              <button
                                type="button"
                                onClick={() => handleItemStatusChange(ticket.id, item.id, 'served')}
                                className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black tracking-wide cursor-pointer transition flex items-center gap-1 shadow-sm"
                              >
                                <UtensilsCrossed className="w-3 h-3" />
                                <span>Lên Bàn</span>
                              </button>
                            )}

                            {item.status === 'served' && (
                              <button
                                type="button"
                                onClick={() => handleItemStatusChange(ticket.id, item.id, 'ready')}
                                className="p-1.5 rounded-xl text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition cursor-pointer"
                                title="Thu hồi lại trạng thái Ready"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Ticket Bottom Multi-Action Control Footer */}
                <div className="p-3.5 bg-stone-950/80 border-t border-stone-800/80 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-stone-400">
                    {ticket.serverName ? `Phục vụ: ${ticket.serverName}` : 'Hàng đợi chung'}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Start All in ticket */}
                    {hasCookingOrPending && (
                      <button
                        type="button"
                        onClick={() => handleBumpTicket(ticket.id, 'cooking')}
                        className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold transition cursor-pointer border border-stone-700"
                        title="Bắt đầu nấu tất cả các món trong vé"
                      >
                        Nấu Toàn Bộ
                      </button>
                    )}

                    {/* Bump All to Ready */}
                    {!allItemsReady && (
                      <button
                        type="button"
                        onClick={() => handleBumpTicket(ticket.id, 'ready')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition cursor-pointer shadow-md shadow-emerald-950/40 flex items-center gap-1"
                        title="Báo tất cả món trong vé đã nấu xong, sẵn sàng bưng ra bàn"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Bếp Ra Món 🔔</span>
                      </button>
                    )}

                    {/* All ready -> Mark All Served */}
                    {allItemsReady && !allItemsServed && (
                      <button
                        type="button"
                        onClick={() => handleBumpTicket(ticket.id, 'served')}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition cursor-pointer shadow-md shadow-blue-950/40 flex items-center gap-1"
                        title="Xác nhận tất cả món đã mang lên bàn cho khách"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã Lên Bàn Xong</span>
                      </button>
                    )}

                    {/* Served -> Recall button */}
                    {allItemsServed && (
                      <button
                        type="button"
                        onClick={() => handleBumpTicket(ticket.id, 'ready')}
                        className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                        title="Thu hồi vé về trạng thái Ra Món"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Thu Hồi</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
