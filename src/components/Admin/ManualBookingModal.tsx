import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, Armchair, Users, Plus, Check } from 'lucide-react';
import { RestaurantTable, MenuItem, SelectedDishItem } from '../../types';
import { MENU_ITEMS } from '../../data/mockData';
import { formatVND } from '../../services/storage';

interface ManualBookingModalProps {
  tables: RestaurantTable[];
  onClose: () => void;
  onSubmitManualBooking: (data: {
    name: string;
    phone: string;
    email: string;
    date: string;
    time: string;
    tableId: string;
    guestCount: number;
    occasion: string;
    specialRequests: string;
    selectedDishes: SelectedDishItem[];
  }) => void;
}

export const ManualBookingModal: React.FC<ManualBookingModalProps> = ({
  tables,
  onClose,
  onSubmitManualBooking,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('18:30');
  const [tableId, setTableId] = useState(tables[0]?.id || '');
  const [guestCount, setGuestCount] = useState(4);
  const [occasion, setOccasion] = useState('Tiệc tối thân mật');
  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedDishes, setSelectedDishes] = useState<SelectedDishItem[]>([]);

  const handleAddDish = (dish: MenuItem) => {
    const existing = selectedDishes.find((item) => item.dish.id === dish.id);
    if (existing) {
      setSelectedDishes(
        selectedDishes.map((item) =>
          item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setSelectedDishes([...selectedDishes, { dish, quantity: 1 }]);
    }
  };

  const handleRemoveDish = (dishId: string) => {
    setSelectedDishes(selectedDishes.filter((item) => item.dish.id !== dishId));
  };

  const totalPreOrder = selectedDishes.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email || !tableId) return;

    onSubmitManualBooking({
      name,
      phone,
      email,
      date,
      time,
      tableId,
      guestCount,
      occasion,
      specialRequests,
      selectedDishes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-4 flex items-center justify-between border-b border-stone-800">
          <div>
            <h3 className="font-bold text-base">Thêm Đặt Bàn Thủ Công (Tiếp Tân / Hotline)</h3>
            <p className="text-xs text-stone-400">Tạo đơn đặt chỗ và tự động gửi email xác nhận cho khách hàng</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1">Tên khách hàng *</label>
              <input
                type="text"
                required
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1">Số điện thoại *</label>
              <input
                type="tel"
                required
                placeholder="0912 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-stone-700 mb-1">Email nhận xác nhận *</label>
            <input
              type="email"
              required
              placeholder="khachhang@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1">Ngày đến *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1">Giờ đến cụ thể *</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1">Số khách *</label>
              <input
                type="number"
                min={1}
                max={30}
                required
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-stone-700 mb-1">Bàn được phân bổ *</label>
            <select
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.capacity} khách) - Khu {(t.area || '').toUpperCase()} [{t.status}]
                </option>
              ))}
            </select>
          </div>

          {/* Quick select dishes */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold uppercase text-stone-700">Món ăn đặt trước (Tùy chọn)</label>
              <span className="text-xs font-extrabold text-amber-900">{formatVND(totalPreOrder)}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-stone-50 rounded-xl border border-stone-200">
              {MENU_ITEMS.slice(0, 8).map((dish) => {
                const itemInCart = selectedDishes.find((item) => item.dish.id === dish.id);
                return (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => handleAddDish(dish)}
                    className={`px-2.5 py-1 rounded-lg text-xs border transition ${
                      itemInCart
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    + {dish.name} ({formatVND(dish.price)}) {itemInCart ? `(x${itemInCart.quantity})` : ''}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-stone-700 mb-1">Ghi chú & Yêu cầu riêng</label>
            <input
              type="text"
              placeholder="Khách VIP, chuẩn bị nến, nước cam..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-stone-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold cursor-pointer shadow-xs"
            >
              Xác Nhận Tạo Đặt Bàn & Gửi Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
