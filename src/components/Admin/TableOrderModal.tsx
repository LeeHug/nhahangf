import React, { useState } from 'react';
import { X, Plus, Minus, Utensils, Check, Search, AlertCircle } from 'lucide-react';
import { Reservation, MenuItem, SelectedDishItem, DishCategory } from '../../types';
import { getStoredMenuItems, formatVND } from '../../services/storage';

interface TableOrderModalProps {
  reservation: Reservation;
  onClose: () => void;
  onSaveDishes: (dishesToAdd: { dish: MenuItem; quantity: number; specialNotes?: string }[]) => void;
}

export const TableOrderModal: React.FC<TableOrderModalProps> = ({
  reservation,
  onClose,
  onSaveDishes,
}) => {
  const [menuItems] = useState<MenuItem[]>(() => getStoredMenuItems());
  const [selectedCategory, setSelectedCategory] = useState<DishCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderItems, setOrderItems] = useState<{ [dishId: string]: { dish: MenuItem; quantity: number; specialNotes: string } }>({});

  const categories: { id: DishCategory | 'all'; name: string }[] = [
    { id: 'all', name: 'Tất Cả Món' },
    { id: 'appetizer', name: 'Khai Vị' },
    { id: 'main', name: 'Món Chính' },
    { id: 'seafood', name: 'Hải Sản' },
    { id: 'dessert', name: 'Tráng Miệng' },
    { id: 'beverage', name: 'Đồ Uống & Rượu' },
  ];

  const filteredDishes = menuItems.filter(item => {
    if (item.isAvailable === false) return false;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchTerm.trim() || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUpdateQty = (dish: MenuItem, delta: number) => {
    setOrderItems(prev => {
      const current = prev[dish.id] || { dish, quantity: 0, specialNotes: '' };
      const newQty = current.quantity + delta;
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[dish.id];
        return next;
      }
      return {
        ...prev,
        [dish.id]: { ...current, quantity: newQty },
      };
    });
  };

  const handleUpdateNotes = (dishId: string, notes: string) => {
    setOrderItems(prev => {
      if (!prev[dishId]) return prev;
      return {
        ...prev,
        [dishId]: { ...prev[dishId], specialNotes: notes },
      };
    });
  };

  const totalAddedItems = Object.values(orderItems).reduce((sum, item) => sum + item.quantity, 0);
  const totalAddedAmount = Object.values(orderItems).reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const additions = Object.values(orderItems).filter(item => item.quantity > 0);
    if (additions.length === 0) return;
    onSaveDishes(additions);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-stone-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-850">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                Gọi Món Thêm Tại Bàn • POS Staff
              </span>
              <span className="text-xs text-stone-400">
                Mã: <strong className="text-stone-200">#{reservation.bookingCode}</strong>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-100 mt-1 flex items-center gap-2">
              <span>{reservation.tableName}</span>
              <span className="text-xs font-normal text-stone-400">• Khách: {reservation.customerName} ({reservation.guestCount} người)</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-stone-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories & Search */}
        <div className="p-4 border-b border-stone-800 bg-stone-900/90 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm món gọi thêm..."
              className="w-full bg-stone-800 border border-stone-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-stone-950 font-bold'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-750'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content: Dish Grid & Current Order List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dish Grid (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Chọn Món Vào Hóa Đơn ({filteredDishes.length} món)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredDishes.map(dish => {
                const ordered = orderItems[dish.id]?.quantity || 0;
                return (
                  <div
                    key={dish.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                      ordered > 0
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                        : 'bg-stone-850/60 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-700"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-100 truncate">{dish.name}</h4>
                      <p className="text-xs text-amber-400 font-semibold mt-0.5">{formatVND(dish.price)}</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        {ordered > 0 ? (
                          <div className="flex items-center gap-2 bg-stone-800 px-2 py-1 rounded-lg border border-stone-700">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(dish, -1)}
                              className="text-stone-300 hover:text-amber-400 p-0.5 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-amber-300 w-4 text-center">{ordered}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(dish, 1)}
                              className="text-stone-300 hover:text-amber-400 p-0.5 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(dish, 1)}
                            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-600 text-stone-300 hover:text-stone-950 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Thêm món</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Summary: Items to add */}
          <div className="bg-stone-850 border border-stone-800 rounded-2xl p-4 flex flex-col h-full">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center justify-between">
              <span>Món Chuẩn Bị Báo Bếp</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] text-amber-300">
                {totalAddedItems} phần
              </span>
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[340px] pr-1">
              {Object.values(orderItems).length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-500">
                  <Utensils className="w-8 h-8 mx-auto text-stone-600 mb-2 opacity-50" />
                  <span>Chưa chọn món nào để gọi thêm. Bấm vào thực đơn bên trái để chọn.</span>
                </div>
              ) : (
                Object.values(orderItems).map(item => (
                  <div key={item.dish.id} className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-200 truncate">{item.dish.name}</span>
                      <span className="text-amber-400 font-semibold">{formatVND(item.dish.price * item.quantity)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-400">
                      <span>Đơn giá: {formatVND(item.dish.price)}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.dish, -1)}
                          className="p-1 rounded bg-stone-700 hover:bg-stone-600 text-stone-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-stone-100">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.dish, 1)}
                          className="p-1 rounded bg-stone-700 hover:bg-stone-600 text-stone-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={item.specialNotes}
                      onChange={(e) => handleUpdateNotes(item.dish.id, e.target.value)}
                      placeholder="Ghi chú cho bếp (vd: không cay, ít đường)..."
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-[11px] text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ))
              )}
            </div>

            {/* Bottom Total & Submit */}
            <div className="mt-4 pt-3 border-t border-stone-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">Tiền món gọi thêm:</span>
                <span className="text-base font-bold text-amber-400">{formatVND(totalAddedAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span>Hóa đơn mới dự kiến:</span>
                <span className="font-semibold text-stone-200">
                  {formatVND(reservation.totalAmount + totalAddedAmount)}
                </span>
              </div>

              <button
                type="button"
                disabled={totalAddedItems === 0}
                onClick={handleSubmit}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Xác Nhận Gọi Món & Báo Bếp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
