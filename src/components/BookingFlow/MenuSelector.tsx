import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Trash2, 
  MessageSquare,
  Flame,
  Leaf,
  Check,
  Heart,
  Wine,
  Crown,
  ChefHat
} from 'lucide-react';
import { MenuItem, DishCategory, SelectedDishItem, TastingCourse } from '../../types';
import { formatVND, getStoredMenuItems } from '../../services/storage';
import { TASTING_COURSES } from '../../data/tastingCoursesData';

interface MenuSelectorProps {


  selectedDishes: SelectedDishItem[];
  onUpdateQuantity: (dish: MenuItem, delta: number) => void;
  onUpdateNote: (dishId: string, note: string) => void;
  onClearDishes: () => void;
  onPrev: () => void;
  onNext: () => void;
  favoriteDishIds?: string[];
  onToggleFavorite?: (dishId: string) => void;
}

export const MenuSelector: React.FC<MenuSelectorProps> = ({
  selectedDishes,
  onUpdateQuantity,
  onUpdateNote,
  onClearDishes,
  onPrev,
  onNext,
  favoriteDishIds = [],
  onToggleFavorite,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');
  const [editingNoteDishId, setEditingNoteDishId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [orderAtTableMode, setOrderAtTableMode] = useState<boolean>(false);

  const categories: { id: string; name: string; icon: string }[] = [
    { id: 'all', name: 'Tất Cả Món', icon: '🍽️' },
    { id: 'tasting_course', name: 'Set Menu Thưởng Thức', icon: '👑' },
    { id: 'appetizer', name: 'Khai Vị', icon: '🥗' },
    { id: 'main', name: 'Món Chính Đặc Sắc', icon: '🥩' },
    { id: 'seafood', name: 'Hải Sản Cao Cấp', icon: '🦞' },
    { id: 'dessert', name: 'Tráng Miệng', icon: '🍮' },
    { id: 'beverage', name: 'Đồ Uống & Vang', icon: '🍷' },
  ];

  // Get current menu items from storage (including 10 new diverse dishes and live stock availability)
  const allDishes = getStoredMenuItems();

  const [includeWinePairingMap, setIncludeWinePairingMap] = useState<Record<string, boolean>>({
    'course-royal': true,
    'course-ocean': true,
    'course-romantic': true,
  });

  const handleSelectTastingCourse = (course: TastingCourse, includeWine: boolean) => {
    course.dishes.forEach(cd => {
      const found = allDishes.find(d => d.id === cd.dishId);
      if (found) {
        onUpdateQuantity(found, 1);
      }
    });

    if (includeWine && course.winePairingOption) {
      const wineItem = allDishes.find(d => d.id === course.winePairingOption?.wineId);
      if (wineItem) {
        onUpdateQuantity(wineItem, 1);
      }
    }
  };


  // Filter items
  const filteredDishes = allDishes.filter((dish) => {
    const matchesCategory = activeCategory === 'all' || dish.category === activeCategory;
    const query = (searchQuery || '').trim().toLowerCase();
    const matchesSearch = !query ||
                          (dish.name || '').toLowerCase().includes(query) ||
                          (dish.description || '').toLowerCase().includes(query);
    const matchesDietary = 
      dietaryFilter === 'all' 
        ? true 
        : dietaryFilter === 'favorites'
          ? favoriteDishIds.includes(dish.id)
          : (dish.dietary && dish.dietary.includes(dietaryFilter as any));
    return matchesCategory && matchesSearch && matchesDietary;
  });


  // Calculate cart total
  const totalItemsCount = selectedDishes.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = selectedDishes.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

  const handleOpenNoteModal = (dishId: string, currentNote?: string) => {
    setEditingNoteDishId(dishId);
    setTempNote(currentNote || '');
  };

  const handleSaveNote = () => {
    if (editingNoteDishId) {
      onUpdateNote(editingNoteDishId, tempNote);
      setEditingNoteDishId(null);
      setTempNote('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Option: Pre-order vs Order at Table Banner */}
      <div className="bg-gradient-to-r from-amber-900/10 via-amber-800/5 to-transparent border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-lg shrink-0">
            ✨
          </div>
          <div>
            <h4 className="font-bold text-stone-900 text-sm sm:text-base">
              Đặt món trước để được phục vụ nóng sốt ngay khi vừa đến bàn
            </h4>
            <p className="text-xs text-stone-500">
              Đầu bếp sẽ căn chuẩn thời gian đến của bạn để lên món hoàn hảo nhất, không phải chờ đợi.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!orderAtTableMode) {
              onClearDishes();
            }
            setOrderAtTableMode(!orderAtTableMode);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
            orderAtTableMode
              ? 'bg-stone-900 text-amber-300 border-stone-900'
              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
          }`}
        >
          {orderAtTableMode ? '✓ Tôi muốn chọn món tại bàn' : 'Chỉ đặt bàn, gọi món tại quầy'}
        </button>
      </div>

      {orderAtTableMode ? (
        /* If user prefers to order at table */
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-3xl">
            📋
          </div>
          <h3 className="text-xl font-bold text-stone-900">Quý khách đã chọn gọi món trực tiếp tại nhà hàng</h3>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Nhân viên phục vụ sẽ mang thực đơn cao cấp tới bàn của bạn ngay khi bạn đến. Quý khách có thể chuyển sang bước tiếp theo để điền thông tin và nhận email xác nhận giữ chỗ.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setOrderAtTableMode(false)}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50"
            >
              Xem thực đơn chọn món trước
            </button>
            <button
              type="button"
              onClick={onNext}
              className="px-6 py-2.5 rounded-xl bg-amber-600 text-stone-950 text-xs font-bold hover:bg-amber-500 flex items-center gap-1.5"
            >
              <span>Tiếp tục xác nhận đặt chỗ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Regular Menu Selection Flow */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Menu Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Search and Dietary Badges */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm món ăn theo tên (Wagyu, tôm hùm, sườn cừu, nấm bào ngư...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
                />
              </div>

              {/* Categories horizontal list */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                      activeCategory === cat.id
                        ? 'bg-amber-600 text-stone-950 shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* Dietary filters */}
              <div className="flex items-center gap-2 pt-1 border-t border-stone-100 text-xs">
                <span className="text-stone-400 font-medium">Bộ lọc:</span>
                <button
                  type="button"
                  onClick={() => setDietaryFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-medium text-[11px] ${
                    dietaryFilter === 'all' ? 'bg-stone-800 text-stone-100' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setDietaryFilter('bestseller')}
                  className={`px-2.5 py-1 rounded-md font-medium text-[11px] flex items-center gap-1 ${
                    dietaryFilter === 'bestseller' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                  }`}
                >
                  <Sparkles className="w-3 h-3" /> Món Bán Chạy
                </button>
                <button
                  type="button"
                  onClick={() => setDietaryFilter('vegetarian')}
                  className={`px-2.5 py-1 rounded-md font-medium text-[11px] flex items-center gap-1 ${
                    dietaryFilter === 'vegetarian' ? 'bg-emerald-600 text-stone-100' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  <Leaf className="w-3 h-3" /> Món Chay
                </button>
                {favoriteDishIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDietaryFilter('favorites')}
                    className={`px-2.5 py-1 rounded-md font-medium text-[11px] flex items-center gap-1 ${
                      dietaryFilter === 'favorites' ? 'bg-rose-600 text-white font-bold' : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                    }`}
                  >
                    <Heart className="w-3 h-3 fill-current" /> Đã Thích ({favoriteDishIds.length})
                  </button>
                )}
              </div>
            </div>

            {/* Dish Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredDishes.map((dish) => {
                const cartItem = selectedDishes.find((item) => item.dish.id === dish.id);
                const quantityInCart = cartItem ? cartItem.quantity : 0;
                const isFavorite = favoriteDishIds.includes(dish.id);

                return (
                  <div
                    key={dish.id}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image with badges */}
                      <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                            dish.isAvailable === false ? 'grayscale opacity-60' : ''
                          }`}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        {dish.isAvailable === false && (
                          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-2xs flex items-center justify-center">
                            <span className="px-3 py-1 rounded-full bg-red-950/90 text-red-300 border border-red-700 text-xs font-black uppercase tracking-wider shadow-lg">
                              Tạm Hết Món
                            </span>
                          </div>
                        )}
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                          {dish.isChefSpecial && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 shadow-sm flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> Chef Signature
                            </span>
                          )}
                          {dish.dietary?.includes('bestseller') && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-sm flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5" /> Bán chạy
                            </span>
                          )}
                          {dish.dietary?.includes('vegetarian') && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white shadow-sm flex items-center gap-0.5">
                              <Leaf className="w-2.5 h-2.5" /> Thuần chay
                            </span>
                          )}
                        </div>


                        {onToggleFavorite && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(dish.id);
                            }}
                            className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-all z-10 ${
                              isFavorite
                                ? 'bg-rose-500 text-white shadow-md'
                                : 'bg-stone-900/60 text-stone-300 hover:text-white hover:bg-stone-900/80'
                            }`}
                            title={isFavorite ? 'Bỏ thích món' : 'Lưu vào món yêu thích'}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                          </button>
                        )}

                        {dish.prepTimeMinutes && (
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-[11px] text-stone-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>{dish.prepTimeMinutes} phút</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-stone-900 group-hover:text-amber-700 transition-colors">
                            {dish.name}
                          </h4>
                        </div>
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Price & Controls */}
                    <div className="p-4 pt-0 border-t border-stone-100 flex items-center justify-between mt-2">
                      <div className="font-extrabold text-sm text-amber-900">
                        {formatVND(dish.price)}
                      </div>

                      {dish.isAvailable === false ? (
                        <button
                          type="button"
                          disabled
                          className="px-3 py-1.5 bg-stone-200 text-stone-400 rounded-xl text-xs font-bold cursor-not-allowed"
                        >
                          Tạm hết
                        </button>
                      ) : quantityInCart === 0 ? (
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(dish, 1)}
                          className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm</span>
                        </button>
                      ) : (

                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(dish, -1)}
                              className="w-7 h-7 rounded-lg bg-white text-stone-700 font-bold hover:bg-stone-200 flex items-center justify-center text-xs cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center font-bold text-xs text-stone-900">
                              {quantityInCart}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(dish, 1)}
                              className="w-7 h-7 rounded-lg bg-amber-600 text-stone-950 font-bold hover:bg-amber-500 flex items-center justify-center text-xs cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenNoteModal(dish.id, cartItem?.specialNotes)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-stone-100 transition-colors"
                            title="Thêm ghi chú món"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart Sidebar Column (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs sticky top-28 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Món Đã Chọn Trước</h3>
                    <p className="text-[11px] text-stone-500">Sẵn sàng khi bạn tới bàn</p>
                  </div>
                </div>

                {selectedDishes.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearDishes}
                    className="text-[11px] text-stone-400 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Xóa tất cả
                  </button>
                )}
              </div>

              {selectedDishes.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-stone-400">Bạn chưa chọn món nào trong thực đơn.</p>
                  <p className="text-[11px] text-stone-500">
                    Bấm nút <strong>+ Thêm</strong> trên từng món để bổ sung vào thực đơn bữa ăn.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {selectedDishes.map((item) => (
                    <div
                      key={item.dish.id}
                      className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-bold text-stone-800">
                        <span className="line-clamp-1">{item.dish.name}</span>
                        <span className="text-amber-900 shrink-0">{formatVND(item.dish.price * item.quantity)}</span>
                      </div>

                      <div className="flex items-center justify-between text-stone-500 text-[11px]">
                        <span>{formatVND(item.dish.price)} x {item.quantity}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.dish, -1)}
                            className="w-5 h-5 rounded bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-700"
                          >
                            -
                          </button>
                          <span className="font-bold text-stone-800 w-4 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.dish, 1)}
                            className="w-5 h-5 rounded bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-stone-950 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {item.specialNotes && (
                        <div className="text-[11px] text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded italic">
                          Ghi chú: {item.specialNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Bill breakdown */}
              <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Số lượng món:</span>
                  <span className="font-bold text-stone-800">{totalItemsCount} phần</span>
                </div>
                <div className="flex justify-between text-stone-900 font-extrabold text-sm pt-1 border-t border-dashed border-stone-200">
                  <span>Tạm tính món ăn:</span>
                  <span className="text-amber-900 text-base">{formatVND(totalPrice)}</span>
                </div>
                <p className="text-[10px] text-stone-400 italic">
                  * Giá đã bao gồm thuế phí nhà hàng. Có thể điều chỉnh hoặc gọi thêm khi dùng bữa.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  id="btn-goto-step-3"
                  type="button"
                  onClick={onNext}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-900/20 cursor-pointer transition-all"
                >
                  <span>{selectedDishes.length > 0 ? 'Xác Nhận & Điền Thông Tin' : 'Tiếp Tục (Chọn món tại bàn)'}</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>

                <button
                  type="button"
                  onClick={onPrev}
                  className="w-full py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Quay lại chọn ngày & bàn</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Edit Modal */}
      {editingNoteDishId && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h4 className="font-bold text-stone-900 text-sm">Ghi Chú Yêu Cầu Cho Món Ăn</h4>
            <textarea
              rows={3}
              placeholder="Ví dụ: Ít cay, không hành, làm chín kỹ, dọn kèm tương ớt..."
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingNoteDishId(null)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-600 hover:bg-stone-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-4 py-1.5 rounded-lg bg-amber-600 text-stone-950 text-xs font-bold hover:bg-amber-500"
              >
                Lưu ghi chú
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
