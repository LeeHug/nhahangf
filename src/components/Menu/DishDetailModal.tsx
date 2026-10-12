import React from 'react';
import { 
  X, 
  Sparkles, 
  Clock, 
  Wine, 
  Heart, 
  Plus, 
  Minus, 
  CalendarCheck, 
  Flame, 
  Leaf, 
  Wheat, 
  Award,
  CheckCircle2,
  ChefHat
} from 'lucide-react';
import { MenuItem } from '../../types';
import { formatVND } from '../../services/storage';

interface DishDetailModalProps {
  dish: MenuItem | null;
  onClose: () => void;
  onSelectAndBook: (dish: MenuItem) => void;
  quantityInCart: number;
  onUpdateQuantity: (dish: MenuItem, delta: number) => void;
  isFavorite: boolean;
  onToggleFavorite?: (dishId: string) => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  dish,
  onClose,
  onSelectAndBook,
  quantityInCart,
  onUpdateQuantity,
  isFavorite,
  onToggleFavorite,
}) => {
  if (!dish) return null;

  const categoryNames: Record<string, string> = {
    appetizer: 'Khai Vị',
    main: 'Món Chính Đặc Sắc',
    seafood: 'Hải Sản Cao Cấp',
    dessert: 'Tráng Miệng',
    beverage: 'Đồ Uống & Rượu Vang',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-stone-900/70 hover:bg-stone-900 text-stone-200 hover:text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg"
          title="Đóng cửa sổ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dish Hero Image */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-stone-900">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />

          {/* Badges on Top Left */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-stone-950 shadow-md">
              {categoryNames[dish.category] || dish.category}
            </span>
            {dish.isChefSpecial && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-md flex items-center gap-1">
                <ChefHat className="w-3.5 h-3.5" /> Bếp Trưởng Khuyên Dùng
              </span>
            )}
            {dish.dietary?.includes('bestseller') && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-stone-950 shadow-md flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> Bán Chạy Nhất
              </span>
            )}
          </div>

          {/* Title and Price inside Image Bottom */}
          <div className="absolute bottom-4 left-4 right-4 text-white z-10">
            <h3 className="font-serif-heading text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md">
              {dish.name}
            </h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-black text-amber-400 drop-shadow-sm">
                {formatVND(dish.price)}
              </span>
              {dish.prepTimeMinutes && (
                <span className="inline-flex items-center gap-1.5 text-xs text-stone-300 bg-stone-900/70 px-2.5 py-1 rounded-full border border-stone-700">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Chế biến: ~{dish.prepTimeMinutes} phút
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Dietary & Characteristics Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {dish.dietary?.includes('vegetarian') && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Leaf className="w-3.5 h-3.5" /> Món Chay Thanh Đạm (Vegetarian)
              </span>
            )}
            {dish.dietary?.includes('spicy') && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                <Flame className="w-3.5 h-3.5" /> Vị Cay Nồng Đậm Đà
              </span>
            )}
            {dish.dietary?.includes('gluten_free') && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                <Wheat className="w-3.5 h-3.5" /> Không Chứa Gluten (Gluten-Free)
              </span>
            )}
            {dish.meatDonenessRequired && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                🥩 Tùy chỉnh độ chín theo yêu cầu (Rare / Medium / Well)
              </span>
            )}
          </div>

          {/* Detailed Culinary Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Câu Chuyện Món Ăn & Hương Vị
            </h4>
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
              {dish.description}
            </p>
          </div>

          {/* Sommelier Wine Pairing (if present) */}
          {dish.winePairing && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 text-amber-200/40 pointer-events-none">
                <Wine className="w-24 h-24" />
              </div>
              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-600 text-stone-950 flex items-center justify-center font-bold">
                    <Wine className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                      Gợi Ý Phối Rượu Vang Từ Sommelier
                    </span>
                    <h5 className="font-bold text-sm sm:text-base text-stone-900">
                      {dish.winePairing.recommendedWineName}
                    </h5>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed italic">
                  "{dish.winePairing.sommelierTastingNotes}"
                </p>
                {(dish.winePairing.glassPrice || dish.winePairing.bottlePrice) && (
                  <div className="flex items-center gap-3 pt-1 text-xs text-stone-700 font-semibold">
                    {dish.winePairing.glassPrice && (
                      <span>Ly: <strong className="text-amber-800">{formatVND(dish.winePairing.glassPrice)}</strong></span>
                    )}
                    {dish.winePairing.bottlePrice && (
                      <span>Chai: <strong className="text-amber-800">{formatVND(dish.winePairing.bottlePrice)}</strong></span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Restaurant Quality Commitments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-stone-800 block">Nguyên Liệu Tuyển Chọn</span>
                <span className="text-stone-500">Nhập khẩu tươi sống theo tiêu chuẩn ẩm thực cao cấp.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-stone-800 block">Chế Biến Nóng Hổi</span>
                <span className="text-stone-500">Chỉ bắt đầu chế biến khi khách hàng có mặt tại bàn.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Favorite and Pre-Order Quantity Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(dish.id)}
                className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
                  isFavorite
                    ? 'bg-rose-50 text-rose-600 border-rose-300'
                    : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                }`}
                title={isFavorite ? 'Bỏ lưu yêu thích' : 'Lưu vào danh sách yêu thích'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600' : ''}`} />
                <span className="hidden sm:inline">{isFavorite ? 'Đã Lưu' : 'Yêu Thích'}</span>
              </button>
            )}

            {/* Quantity Stepper */}
            <div className="flex items-center gap-1 bg-white border border-stone-300 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => onUpdateQuantity(dish, -1)}
                disabled={quantityInCart <= 0}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                title="Giảm số lượng"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-bold text-sm text-stone-900">
                {quantityInCart}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(dish, 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold transition-colors shadow-2xs"
                title="Tăng số lượng"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Primary Action: Book Table with This Dish */}
          <button
            type="button"
            onClick={() => {
              onSelectAndBook(dish);
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-900/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 stroke-[2.2]" />
            <span>Đặt Bàn Thưởng Thức Món Này</span>
          </button>
        </div>
      </div>
    </div>
  );
};
