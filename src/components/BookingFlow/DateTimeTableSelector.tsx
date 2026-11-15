import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Armchair, 
  HeartHandshake, 
  Wine, 
  Trees, 
  Building2, 
  Crown,
  ChevronRight,
  Link2,
  PartyPopper,
  Plus,
  UtensilsCrossed,
  Eye
} from 'lucide-react';
import { RestaurantTable, TableArea } from '../../types';
import { 
  isTimeSlotInPast, 
  isValidCalendarDate,
  isWithinOperatingHours,
  getLocalDateString, 
  LUNCH_TIME_SLOTS, 
  DINNER_TIME_SLOTS, 
  ALL_BOOKING_SLOTS 
} from '../../utils/dateTimeUtils';

interface DateTimeTableSelectorProps {
  tables: RestaurantTable[];
  selectedDate: string;
  selectedTime: string;
  guestCount: number;
  selectedArea: TableArea;
  selectedTableId: string;
  selectedMergedTableIds?: string[];
  selectedOccasion: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onGuestCountChange: (count: number) => void;
  onAreaChange: (area: TableArea) => void;
  onTableChange: (tableId: string) => void;
  onToggleMergeTable?: (tableId: string) => void;
  onOccasionChange: (occasion: string) => void;
  onNext: () => void;
  onPreviewMenu?: () => void;
}

export const DateTimeTableSelector: React.FC<DateTimeTableSelectorProps> = ({
  tables,
  selectedDate,
  selectedTime,
  guestCount,
  selectedArea,
  selectedTableId,
  selectedMergedTableIds = [],
  selectedOccasion,
  onDateChange,
  onTimeChange,
  onGuestCountChange,
  onAreaChange,
  onTableChange,
  onToggleMergeTable,
  onOccasionChange,
  onNext,
  onPreviewMenu,
}) => {
  const [customTimeInput, setCustomTimeInput] = useState('');
  const [customTimeError, setCustomTimeError] = useState('');

  // Quick dates using local client timezone
  const todayStr = getLocalDateString(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getLocalDateString(tomorrow);

  const isToday = selectedDate === todayStr;
  const isPastDate = selectedDate < todayStr;

  // Check if a slot is in the past for selectedDate (10-minute preparation buffer)
  const isSlotInPast = (slotStr: string, bufferMinutes = 10) => {
    return isTimeSlotInPast(slotStr, selectedDate, bufferMinutes);
  };

  const allLunchPast = isToday && LUNCH_TIME_SLOTS.every(slot => isSlotInPast(slot, 10));
  const allDinnerPast = isToday && DINNER_TIME_SLOTS.every(slot => isSlotInPast(slot, 10));
  const allSlotsTodayPast = isToday && allLunchPast && allDinnerPast;

  // Check if currently selectedTime is strictly in the past (0-min buffer)
  const isSelectedTimeInvalid = isSlotInPast(selectedTime, 0);

  // Auto-switch selectedTime to the first available valid slot if selectedTime is in the past for today
  useEffect(() => {
    if (isToday && isSlotInPast(selectedTime, 10)) {
      const nextAvailableSlot = ALL_BOOKING_SLOTS.find(slot => !isSlotInPast(slot, 10));
      if (nextAvailableSlot) {
        onTimeChange(nextAvailableSlot);
      }
    }
  }, [selectedDate, isToday, selectedTime]);

  const occasions = [
    { id: 'family', label: 'Bữa Ăn Gia Đình', icon: '👨‍👩‍👧‍👦' },
    { id: 'date', label: 'Hẹn Hò Lãng Mạn', icon: '🕯️' },
    { id: 'birthday', label: 'Tiệc Sinh Nhật', icon: '🎂' },
    { id: 'business', label: 'Gặp Gỡ Đối Tác', icon: '🤝' },
    { id: 'gathering', label: 'Họp Mặt Bạn Bè', icon: '🥂' },
  ];

  const areas: { id: TableArea; name: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'main', name: 'Sảnh Chính Sang Trọng', desc: 'Không gian ấm cúng, nhạc hòa tấu êm dịu', icon: Building2 },
    { id: 'vip', name: 'Phòng VIP Đẳng Cấp', desc: 'Riêng tư tuyệt đối, có phục vụ riêng', icon: Crown },
    { id: 'garden', name: 'Sân Vườn Lãng Mạn', desc: 'Gió thoáng mát rượi, cây xanh và hồ cá', icon: Trees },
    { id: 'rooftop', name: 'Ban Công Rooftop', desc: 'Tầm nhìn bao trọn thành phố về đêm lung linh', icon: Wine },
  ];

  // Filter tables by selected area
  const areaTables = tables.filter(t => t.area === selectedArea);

  // Check if selected table is valid
  const currentTable = tables.find(t => t.id === selectedTableId);
  const primaryCap = currentTable ? currentTable.capacity : 0;
  const mergedCap = (selectedMergedTableIds || []).reduce((sum, tid) => {
    const t = tables.find(tbl => tbl.id === tid);
    return sum + (t ? t.capacity : 0);
  }, 0);
  const totalCombinedCapacity = primaryCap + mergedCap;

  const isDateValid = isValidCalendarDate(selectedDate);
  const isTimeOperatingValid = isWithinOperatingHours(selectedTime);

  const handleCustomTimeSubmit = () => {
    setCustomTimeError('');
    if (!customTimeInput) return;
    if (!isWithinOperatingHours(customTimeInput)) {
      setCustomTimeError(`Giờ đến (${customTimeInput}) nằm ngoài khung giờ phục vụ của nhà hàng (10:00 - 22:30). Vui lòng chọn khung giờ hợp lệ!`);
      return;
    }
    if (isSlotInPast(customTimeInput, 0)) {
      setCustomTimeError(`Giờ đến (${customTimeInput}) đã qua thời điểm hiện tại của ngày ${selectedDate}. Vui lòng chọn giờ sau thời điểm này!`);
      return;
    }
    onTimeChange(customTimeInput);
    setCustomTimeInput('');
  };

  const isFormValid = isDateValid && !isPastDate && selectedTime && isTimeOperatingValid && !isSelectedTimeInvalid && guestCount > 0 && selectedTableId;

  return (
    <div className="space-y-8">
      {/* Banner Xem Trước Thực Đơn Dành Cho Thực Khách */}
      {onPreviewMenu && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/15 to-amber-500/10 border border-amber-300/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-sm">
              <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <span>Khám Phá Thực Đơn Thượng Hạng Trước Khi Đặt Bàn</span>
                <span className="hidden md:inline px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">Xem trước miễn phí</span>
              </h4>
              <p className="text-xs text-stone-600 mt-0.5">
                Tham khảo trọn bộ thực đơn món lẻ, Set Menu Hoàng Gia, hình ảnh chi tiết và bảng giá mà không cần hoàn tất đặt bàn.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onPreviewMenu}
            className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Xem Thực Đơn Ngay</span>
          </button>
        </div>
      )}

      {/* 1. Chọn ngày & thời gian đến cụ thể */}
      <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">Chọn Ngày & Thời Gian Đến Cụ Thể</h3>
            <p className="text-xs text-stone-500">Đặt lịch chính xác giúp nhà hàng giữ bàn và chuẩn bị chu đáo nhất</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Cột chọn ngày */}
          <div className="md:col-span-5 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              <Calendar className="w-3.5 h-3.5 inline mr-1 text-amber-600" />
              Ngày đặt bàn
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onDateChange(todayStr)}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  selectedDate === todayStr
                    ? 'bg-amber-600 text-stone-950 border-amber-600 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                Hôm Nay ({new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})
              </button>
              <button
                type="button"
                onClick={() => onDateChange(tomorrowStr)}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  selectedDate === tomorrowStr
                    ? 'bg-amber-600 text-stone-950 border-amber-600 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                Ngày Mai ({tomorrow.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})
              </button>
            </div>

            <div>
              <input
                id="booking-date-input"
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800 text-sm bg-white"
              />
            </div>
          </div>

          {/* Cột chọn giờ đến */}
          <div className="md:col-span-7 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              <Clock className="w-3.5 h-3.5 inline mr-1 text-amber-600" />
              Giờ đến chính xác
            </label>

            {/* Khung giờ trưa */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  ☀️ Buổi Trưa (11:00 - 14:00)
                </span>
                {allLunchPast && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Đã qua giờ trưa hôm nay
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {LUNCH_TIME_SLOTS.map((time) => {
                  const isPast = isSlotInPast(time);
                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={isPast}
                      onClick={() => {
                        setCustomTimeError('');
                        onTimeChange(time);
                      }}
                      title={isPast ? `Khung giờ ${time} đã qua trong ngày hôm nay` : `Chọn giờ đến lúc ${time}`}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all ${
                        isPast
                          ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed line-through opacity-45 select-none'
                          : selectedTime === time
                          ? 'bg-amber-600 text-stone-950 border-amber-600 shadow-xs scale-105'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100 cursor-pointer'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Khung giờ tối */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  🌙 Buổi Tối (17:00 - 21:30)
                </span>
                {allDinnerPast && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Đã qua giờ tối hôm nay
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {DINNER_TIME_SLOTS.map((time) => {
                  const isPast = isSlotInPast(time);
                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={isPast}
                      onClick={() => {
                        setCustomTimeError('');
                        onTimeChange(time);
                      }}
                      title={isPast ? `Khung giờ ${time} đã qua trong ngày hôm nay` : `Chọn giờ đến lúc ${time}`}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all ${
                        isPast
                          ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed line-through opacity-45 select-none'
                          : selectedTime === time
                          ? 'bg-amber-600 text-stone-950 border-amber-600 shadow-xs scale-105'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100 cursor-pointer'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Banner cảnh báo nếu hôm nay đã qua hết các khung giờ */}
            {allSlotsTodayPast && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-stone-900">
                      Hôm nay ({new Date().toLocaleDateString('vi-VN')}) đã qua tất cả các khung giờ nhận đặt bàn trực tuyến.
                    </p>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Quý khách vui lòng chọn Ngày Mai hoặc liên hệ Hotline để được hỗ trợ bàn trống tức thì.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onDateChange(tomorrowStr);
                    onTimeChange('18:30');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  👉 Chuyển sang Ngày Mai ({tomorrow.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})
                </button>
              </div>
            )}

            {/* Giờ tùy chọn */}
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 whitespace-nowrap">Giờ khác:</span>
                <input
                  type="time"
                  min="10:00"
                  max="22:30"
                  value={customTimeInput}
                  onChange={(e) => {
                    setCustomTimeInput(e.target.value);
                    setCustomTimeError('');
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleCustomTimeSubmit}
                  disabled={!customTimeInput}
                  className="px-3 py-1.5 bg-stone-800 text-stone-100 text-xs rounded-lg hover:bg-stone-700 disabled:opacity-50 cursor-pointer font-medium"
                >
                  Áp dụng
                </button>
                {selectedTime && (
                  <span className={`text-xs font-medium ml-auto px-2.5 py-1 rounded-md border ${
                    isSelectedTimeInvalid
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    Đã chọn: <strong>{selectedTime}</strong>
                    {isSelectedTimeInvalid && ' (⚠️ Đã qua giờ!)'}
                  </span>
                )}
              </div>
              {customTimeError && (
                <p className="text-[11px] text-rose-600 mt-1.5 font-medium flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{customTimeError}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Số lượng khách & Dịp dùng bữa */}
      <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">Số Lượng Khách & Dịp Đặc Biệt</h3>
            <p className="text-xs text-stone-500">Giúp nhà hàng sắp xếp vị trí ngồi và chuẩn bị không gian phù hợp</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Guest Count Counter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">
              <Users className="w-3.5 h-3.5 inline mr-1 text-amber-600" />
              Số lượng người dùng bữa
            </label>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50 p-1">
                <button
                  type="button"
                  onClick={() => onGuestCountChange(Math.max(1, guestCount - 1))}
                  className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-lg font-bold text-stone-700 hover:bg-stone-100 active:scale-95 transition"
                >
                  -
                </button>
                <div className="w-16 text-center font-extrabold text-xl text-stone-900">
                  {guestCount}
                </div>
                <button
                  type="button"
                  onClick={() => onGuestCountChange(Math.min(30, guestCount + 1))}
                  className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-lg font-bold text-stone-700 hover:bg-stone-100 active:scale-95 transition"
                >
                  +
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[2, 4, 6, 8, 12].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onGuestCountChange(num)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      guestCount === num
                        ? 'bg-amber-600 text-stone-950 border-amber-600 shadow-xs'
                        : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    {num} người
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              * Đối với đoàn từ 15 người trở lên, nhà hàng sẽ ưu tiên bố trí phòng tiệc riêng hoặc ghép dãy bàn dài.
            </p>
          </div>

          {/* Occasions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">
              <Sparkles className="w-3.5 h-3.5 inline mr-1 text-amber-600" />
              Dịp đặc biệt (Tùy chọn)
            </label>

            <div className="flex flex-wrap gap-2">
              {occasions.map((occ) => {
                const isSelected = selectedOccasion === occ.label;
                return (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => onOccasionChange(isSelected ? '' : occ.label)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-stone-900 text-amber-300 border-stone-900 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>{occ.icon}</span>
                    <span>{occ.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-1 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Chọn Khu Vực & Chọn Bàn Cụ Thể */}
      <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-6 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">Chọn Khu Vực & Chọn Bàn Ưng Ý</h3>
              <p className="text-xs text-stone-500">Khám phá các không gian đặc trưng và chọn vị trí bạn thích nhất</p>
            </div>
          </div>
        </div>

        {/* 4 Area Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {areas.map((area) => {
            const Icon = area.icon;
            const isSelected = selectedArea === area.id;
            return (
              <div
                key={area.id}
                onClick={() => {
                  onAreaChange(area.id);
                  // Auto-select first available table in this area if possible
                  const firstAvailable = tables.find(t => t.area === area.id && t.status === 'available');
                  if (firstAvailable) {
                    onTableChange(firstAvailable.id);
                  }
                }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50/50 shadow-xs scale-[1.02]'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-amber-600 text-stone-950' : 'bg-stone-200 text-stone-700'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      Đang chọn
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-stone-900">{area.name}</h4>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">{area.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Interactive Table Grid for the selected area */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4">
          {/* Smart Banquet & Table Merge Banner */}
          {(guestCount > 6 || selectedMergedTableIds.length > 0) && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-stone-950 flex items-center justify-center font-bold text-sm shrink-0">
                  <Link2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h5 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                    <span>Tính năng Ghép Bàn & Đặt Tiệc Đoàn</span>
                    <span className="px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                      {guestCount} khách
                    </span>
                  </h5>
                  <p className="text-stone-600 text-[11px] mt-0.5">
                    Đã chọn: <strong>{1 + selectedMergedTableIds.length} bàn</strong> • Tổng sức chứa hiện tại: <strong className={totalCombinedCapacity >= guestCount ? 'text-emerald-700 font-bold' : 'text-amber-800'}>{totalCombinedCapacity} chỗ ngồi</strong>
                  </p>
                </div>
              </div>

              {totalCombinedCapacity >= guestCount ? (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1 self-start sm:self-auto">
                  <Check className="w-3.5 h-3.5" /> Đủ chỗ cho đoàn
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1 self-start sm:self-auto animate-pulse">
                  <Plus className="w-3.5 h-3.5" /> Bấm bàn thứ 2 để ghép thêm
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Danh Sách Bàn Tại {areas.find(a => a.id === selectedArea)?.name}:
            </span>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Còn trống
              </span>
              <span className="flex items-center gap-1.5 text-stone-400">
                <span className="w-3 h-3 rounded-full bg-stone-300 inline-block"></span> Đã có khách
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {areaTables.map((table) => {
              const isPrimary = selectedTableId === table.id;
              const isMergedSecondary = selectedMergedTableIds.includes(table.id);
              const isSelected = isPrimary || isMergedSecondary;
              const isOccupied = table.status === 'occupied' || table.status === 'reserved';
              const fitsGuests = totalCombinedCapacity >= guestCount || table.capacity >= guestCount;

              return (
                <div
                  key={table.id}
                  onClick={() => {
                    if (isOccupied) return;
                    if (isMergedSecondary && onToggleMergeTable) {
                      onToggleMergeTable(table.id);
                    } else if (selectedTableId && selectedTableId !== table.id && onToggleMergeTable && (guestCount > 6 || selectedMergedTableIds.length > 0)) {
                      onToggleMergeTable(table.id);
                    } else {
                      onTableChange(table.id);
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all relative ${
                    isPrimary
                      ? 'bg-amber-600 text-stone-950 border-amber-600 shadow-md font-semibold ring-2 ring-amber-400/40'
                      : isMergedSecondary
                      ? 'bg-amber-500/20 text-stone-950 border-amber-500 shadow-xs font-semibold ring-2 ring-amber-500/50'
                      : isOccupied
                      ? 'bg-stone-200/70 border-stone-200 text-stone-400 cursor-not-allowed opacity-75'
                      : 'bg-white border-stone-200 text-stone-800 hover:border-amber-400 hover:shadow-xs cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Armchair className={`w-4 h-4 ${isPrimary ? 'text-stone-950' : isMergedSecondary ? 'text-amber-700' : isOccupied ? 'text-stone-400' : 'text-amber-600'}`} />
                      <span className="text-sm font-bold">{table.name}</span>
                    </div>
                    {isPrimary && (
                      <span className="px-2 py-0.5 rounded-full bg-stone-950 text-amber-400 font-extrabold text-[10px]">
                        ★ Bàn Chính
                      </span>
                    )}
                    {isMergedSecondary && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-600 text-stone-950 font-extrabold text-[10px] flex items-center gap-0.5">
                        <Link2 className="w-3 h-3" /> Bàn Ghép
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className={isSelected ? 'text-stone-900 font-medium' : 'text-stone-500'}>
                      Sức chứa: <strong>{table.capacity} khách</strong>
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        isSelected
                          ? 'bg-stone-950/20 text-stone-950 font-bold'
                          : isOccupied
                          ? 'bg-stone-300 text-stone-600'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isOccupied ? 'Đã đặt trước' : 'Sẵn sàng'}
                    </span>
                  </div>

                  {/* Merge action trigger for large parties */}
                  {!isOccupied && !isPrimary && onToggleMergeTable && selectedTableId && (
                    <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleMergeTable(table.id);
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
                          isMergedSecondary
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        }`}
                      >
                        <Link2 className="w-2.5 h-2.5" />
                        <span>{isMergedSecondary ? 'Bỏ Ghép Bàn Này' : '+ Ghép Bàn Này'}</span>
                      </button>
                    </div>
                  )}

                  {!fitsGuests && !isOccupied && selectedMergedTableIds.length === 0 && (
                    <div className="mt-1.5 text-[10px] text-amber-900 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Bàn {table.capacity} chỗ (bạn chọn {guestCount} người - nên ghép bàn)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* Alert if current selectedTime is in the past */}
      {isSelectedTimeInvalid && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 animate-fade-in shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-rose-900">
              Khung giờ đã chọn ({selectedTime}) không hợp lệ vì đã trôi qua thời điểm hiện tại của ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}!
            </p>
            <p className="text-rose-700 mt-0.5">
              Quý khách vui lòng chọn một khung giờ hợp lệ bên trên (chưa bị gạch ngang) hoặc chuyển sang ngày mai để tiếp tục quy trình đặt bàn.
            </p>
          </div>
        </div>
      )}

      {/* Summary Banner & Next Step Button */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div>
          <div className="text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
            Thông Tin Lịch Hẹn Đã Chọn
          </div>
          <div className="text-base sm:text-lg font-bold flex flex-wrap items-center gap-2">
            <span>{selectedTime}</span>
            <span className="text-stone-500">•</span>
            <span>{new Date(selectedDate).toLocaleDateString('vi-VN')}</span>
            <span className="text-stone-500">•</span>
            <span>{guestCount} Khách</span>
            <span className="text-stone-500">•</span>
            <span className="text-amber-400">{currentTable?.name || 'Chưa chọn bàn'}</span>
          </div>
        </div>

        <button
          id="btn-goto-step-2"
          type="button"
          disabled={!isFormValid}
          onClick={onNext}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <span>Tiếp Tục: Chọn Món Ngon</span>
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
