import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Clock, 
  Wine, 
  Heart, 
  Plus, 
  Minus, 
  CalendarCheck, 
  Crown, 
  UtensilsCrossed, 
  Flame, 
  Leaf, 
  Wheat, 
  Eye, 
  ChevronRight, 
  ChefHat, 
  Phone, 
  Award, 
  ArrowRight,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { MenuItem, DishCategory, SelectedDishItem, TastingCourse, UserAccount } from '../../types';
import { formatVND, getStoredMenuItems } from '../../services/storage';
import { TASTING_COURSES } from '../../data/tastingCoursesData';
import { DishDetailModal } from './DishDetailModal';

interface PublicMenuPreviewProps {
  onGoToBooking: (initialDish?: MenuItem) => void;
  onSelectCourseAndBook?: (course: TastingCourse, includeWine: boolean) => void;
  selectedDishes: SelectedDishItem[];
  onUpdateQuantity: (dish: MenuItem, delta: number) => void;
  onClearDishes?: () => void;
  currentUser: UserAccount | null;
  onToggleFavorite?: (dishId: string) => void;
  onOpenAuthModal?: () => void;
  onOpenTableService?: () => void;
}

export const PublicMenuPreview: React.FC<PublicMenuPreviewProps> = ({
  onGoToBooking,
  onSelectCourseAndBook,
  selectedDishes,
  onUpdateQuantity,
  onClearDishes,
  currentUser,
  onToggleFavorite,
  onOpenAuthModal,
  onOpenTableService,
}) => {
  // Category & Filter States
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'prep-time'>('default');

  // Modal State for Dish Inspection
  const [inspectingDish, setInspectingDish] = useState<MenuItem | null>(null);

  // Tasting course wine pairing toggles
  const [tastingCourseWineMap, setTastingCourseWineMap] = useState<Record<string, boolean>>({
    'course-royal': true,
    'course-ocean': true,
    'course-romantic': true,
  });

  // Load all menu items
  const allDishes = getStoredMenuItems();

  const categories: { id: string; name: string; icon: string }[] = [
    { id: 'all', name: 'Tất Cả Món', icon: '🍽️' },
    { id: 'tasting_course', name: 'Set Menu Hoàng Gia', icon: '👑' },
    { id: 'appetizer', name: 'Khai Vị', icon: '🥗' },
    { id: 'main', name: 'Món Chính Đặc Sắc', icon: '🥩' },
    { id: 'seafood', name: 'Hải Sản Cao Cấp', icon: '🦞' },
    { id: 'dessert', name: 'Tráng Miệng', icon: '🍮' },
    { id: 'beverage', name: 'Đồ Uống & Vang', icon: '🍷' },
  ];

  const dietaryOptions: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'Tất cả loại món', icon: '✨' },
    { id: 'chef_special', label: 'Bếp Trưởng Khuyên Dùng', icon: '⭐' },
    { id: 'bestseller', label: 'Bán Chạy Nhất', icon: '🔥' },
    { id: 'vegetarian', label: 'Món Chay', icon: '🌱' },
    { id: 'spicy', label: 'Vị Cay', icon: '🌶️' },
    { id: 'gluten_free', label: 'Không Chứa Gluten', icon: '🌾' },
  ];

  // Filter & Sort Dishes
  const filteredDishes = useMemo(() => {
    let list = allDishes.filter((dish) => {
      // Category filter
      if (activeCategory !== 'all' && activeCategory !== 'tasting_course') {
        if (dish.category !== activeCategory) return false;
      }

      // Search query
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const matchesName = (dish.name || '').toLowerCase().includes(query);
        const matchesDesc = (dish.description || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      // Dietary filter
      if (dietaryFilter === 'chef_special') {
        if (!dish.isChefSpecial) return false;
      } else if (dietaryFilter !== 'all') {
        if (!dish.dietary?.includes(dietaryFilter as any)) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'prep-time') {
      list = [...list].sort((a, b) => (a.prepTimeMinutes || 15) - (b.prepTimeMinutes || 15));
    }

    return list;
  }, [allDishes, activeCategory, searchQuery, dietaryFilter, sortBy]);

  // Helper to get selected quantity of a dish
  const getDishQuantity = (dishId: string): number => {
    const item = selectedDishes.find((sd) => sd.dish.id === dishId);
    return item ? item.quantity : 0;
  };

  // Pre-order total
  const preOrderTotal = selectedDishes.reduce(
    (sum, item) => sum + item.dish.price * item.quantity,
    0
  );

  const totalDishesCount = selectedDishes.reduce((sum, item) => sum + item.quantity, 0);

  // Handle selecting a tasting course
  const handleSelectCourse = (course: TastingCourse) => {
    const includeWine = tastingCourseWineMap[course.id] ?? false;
    if (onSelectCourseAndBook) {
      onSelectCourseAndBook(course, includeWine);
    } else {
      // Fallback: Add all course dishes to selectedDishes and go to booking
      course.dishes.forEach((cd) => {
        const found = allDishes.find((d) => d.id === cd.dishId);
        if (found) {
          onUpdateQuantity(found, 1);
        }
      });
      if (includeWine && course.winePairingOption) {
        const wineItem = allDishes.find((d) => d.id === course.winePairingOption?.wineId);
        if (wineItem) {
          onUpdateQuantity(wineItem, 1);
        }
      }
      onGoToBooking();
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      {/* 1. HERO BANNER: FINE DINING MENU EXPERIENCE */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 text-white shadow-2xl border border-stone-800">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 px-6 sm:px-10 lg:px-14 py-12 sm:py-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Thực Đơn Tinh Hoa Pháp - Á • Xem Trước Không Bắt Buộc Đặt Bàn</span>
            </div>

            <h1 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-stone-100">
              Khám Phá Mỹ Vị Thượng Hạng <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600">
                Le Gourmet Bistro
              </span>
            </h1>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-sans max-w-xl">
              Thực khách có thể tự do xem hình ảnh chi tiết, giá tiền, nguyên liệu hữu cơ và ghi chú kết hợp rượu vang từ Bếp Trưởng. Nếu ưng ý, quý khách có thể chọn món trước và tiến hành đặt bàn bất cứ lúc nào!
            </p>

            {/* Quick Actions in Hero */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={() => onGoToBooking()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-900/30 transition-all hover:scale-105 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4 stroke-[2.3]" />
                <span>Đặt Bàn Trực Tuyến Ngay</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory('tasting_course');
                  document.getElementById('menu-content-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3 rounded-xl bg-stone-800/80 hover:bg-stone-750 text-stone-200 hover:text-white border border-stone-700 font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Xem Set Menu Hoàng Gia</span>
              </button>

              <a
                href="tel:19008888"
                className="px-4 py-3 rounded-xl bg-stone-900/60 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-800 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Hotline: 1900 8888</span>
              </a>
            </div>
          </div>

          {/* Luxury Highlights Box */}
          <div className="grid grid-cols-2 gap-3 w-full lg:w-80 shrink-0">
            <div className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800/80 backdrop-blur-md space-y-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <ChefHat className="w-4 h-4" />
              </div>
              <p className="font-bold text-sm text-stone-100">Bếp Trưởng Pháp</p>
              <p className="text-[11px] text-stone-400">Kinh nghiệm 18 năm fine dining quốc tế</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800/80 backdrop-blur-md space-y-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Crown className="w-4 h-4" />
              </div>
              <p className="font-bold text-sm text-stone-100">Wagyu A5 & Truffle</p>
              <p className="text-[11px] text-stone-400">Nguyên liệu nhập khẩu bay mỗi tuần</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800/80 backdrop-blur-md space-y-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Wine className="w-4 h-4" />
              </div>
              <p className="font-bold text-sm text-stone-100">Hầm Rượu Vang</p>
              <p className="text-[11px] text-stone-400">Hơn 60 dòng vang Bordeaux, Champagne</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800/80 backdrop-blur-md space-y-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="font-bold text-sm text-stone-100">Đặt Trước Tiện Lợi</p>
              <p className="text-[11px] text-stone-400">Bàn chuẩn bị sẵn món khi vừa đến</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY TABS & FILTER BAR */}
      <section id="menu-content-section" className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-2xs cursor-pointer ${
                  isActive
                    ? 'bg-amber-600 text-stone-950 shadow-md shadow-amber-900/20 scale-[1.02]'
                    : 'bg-white text-stone-700 hover:text-stone-950 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                {cat.id !== 'all' && cat.id !== 'tasting_course' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-amber-700 text-stone-950' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {allDishes.filter(d => d.category === cat.id).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search, Dietary Badges & Sort Controls */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm món ăn, bò Wagyu, hải sản, vang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800 placeholder-stone-400 bg-stone-50/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Dietary Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {dietaryOptions.map((opt) => {
              const isSelected = dietaryFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDietaryFilter(opt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-stone-900 text-amber-400 border border-stone-900 shadow-2xs'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="default">Sắp xếp: Bếp Trưởng</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
              <option value="prep-time">Chế biến nhanh nhất</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. SET MENU THƯỞNG THỨC / TASTING COURSES SECTION (When activeCategory is 'all' or 'tasting_course') */}
      {(activeCategory === 'all' || activeCategory === 'tasting_course') && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-xs">
                <Crown className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-serif-heading text-xl sm:text-2xl font-bold text-stone-900">
                  Set Menu Thưởng Thức Hoàng Gia (Tasting Courses)
                </h3>
                <p className="text-xs sm:text-sm text-stone-500">
                  Bộ sưu tập thực đơn trải nghiệm nhiều món, phối vị cùng rượu vang do Bếp trưởng dày công thiết kế
                </p>
              </div>
            </div>
          </div>

          {/* Grid 3 Tasting Courses */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {TASTING_COURSES.map((course) => {
              const includeWine = tastingCourseWineMap[course.id] ?? true;
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl overflow-hidden border border-amber-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group relative"
                >
                  {/* Course Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-stone-950">
                    <img
                      src={course.image}
                      alt={course.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                    
                    <div className="absolute top-3 left-3 bg-amber-500 text-stone-950 px-2.5 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5" />
                      <span>{course.courseCount} Món Tinh Tuyển</span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-[11px] text-amber-300 uppercase tracking-wider font-semibold font-mono">
                        {course.subtitle}
                      </p>
                      <h4 className="font-serif-heading text-lg font-bold leading-snug">
                        {course.name}
                      </h4>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Dish Progression List */}
                    <div className="space-y-2 bg-stone-50 p-3 rounded-2xl border border-stone-150">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                        Trình Tự Phục Vụ Các Món:
                      </span>
                      <ul className="space-y-1.5 text-xs text-stone-700">
                        {course.dishes.map((d, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="font-bold text-amber-700 font-mono text-[11px]">0{idx + 1}.</span>
                            <div className="flex-1 leading-tight">
                              <span className="font-semibold text-stone-900">{d.dishName}</span>
                              <span className="text-[10px] text-stone-500 block italic">({d.courseRole})</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Wine Pairing Checkbox Option */}
                    {course.winePairingOption && (
                      <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeWine}
                            onChange={(e) =>
                              setTastingCourseWineMap((prev) => ({
                                ...prev,
                                [course.id]: e.target.checked,
                              }))
                            }
                            className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                          />
                          <div className="flex-1 text-xs">
                            <span className="font-bold text-stone-900 flex items-center gap-1">
                              <Wine className="w-3.5 h-3.5 text-amber-700" />
                              Kèm {course.winePairingOption.wineName}
                            </span>
                            <span className="text-[11px] text-amber-800 font-semibold block">
                              +{formatVND(course.winePairingOption.extraPricePerPerson)} / khách
                            </span>
                            <span className="text-[10px] text-stone-500 block italic leading-tight mt-0.5">
                              "{course.winePairingOption.notes}"
                            </span>
                          </div>
                        </label>
                      </div>
                    )}

                    {/* Price & Action */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase block font-semibold">Giá tiêu chuẩn</span>
                        <div className="text-lg font-black text-amber-600">
                          {formatVND(
                            course.pricePerPerson +
                              (includeWine && course.winePairingOption
                                ? course.winePairingOption.extraPricePerPerson
                                : 0)
                          )}
                          <span className="text-[11px] font-normal text-stone-500"> /người</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectCourse(course)}
                        className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs hover:scale-105 cursor-pointer"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>Đặt Bàn Với Set Này</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. A LA CARTE DISHES GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h3 className="font-serif-heading text-xl sm:text-2xl font-bold text-stone-900">
              {activeCategory === 'all'
                ? 'Thực Đơn Món Lẻ Tinh Chọn (À La Carte)'
                : categories.find((c) => c.id === activeCategory)?.name || 'Danh Sách Món'}
            </h3>
            <p className="text-xs text-stone-500">
              Hiển thị {filteredDishes.length} món ăn thượng hạng được chuẩn bị nóng sốt
            </p>
          </div>
        </div>

        {filteredDishes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-800 text-base">Không tìm thấy món ăn phù hợp</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Không có món ăn nào khớp với từ khóa "{searchQuery}" hoặc bộ lọc dinh dưỡng hiện tại.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setDietaryFilter('all');
                setActiveCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-stone-900 text-amber-400 font-bold text-xs"
            >
              Xem lại toàn bộ thực đơn
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredDishes.map((dish) => {
              const qty = getDishQuantity(dish.id);
              const isFav = currentUser?.favoriteDishIds?.includes(dish.id) || false;

              return (
                <div
                  key={dish.id}
                  className="bg-white rounded-2xl border border-stone-200 hover:border-amber-300 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Dish Image */}
                  <div 
                    onClick={() => setInspectingDish(dish)}
                    className="relative h-44 w-full overflow-hidden bg-stone-900 cursor-pointer"
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-full bg-stone-900/80 text-amber-300 text-xs font-bold backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                        <Eye className="w-3.5 h-3.5" /> Xem chi tiết
                      </span>
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 z-10 pointer-events-none">
                      {dish.isChefSpecial && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white shadow-sm flex items-center gap-0.5">
                          <ChefHat className="w-3 h-3" /> Đặc Biệt
                        </span>
                      )}
                      {dish.dietary?.includes('bestseller') && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-stone-950 shadow-sm flex items-center gap-0.5">
                          <Flame className="w-3 h-3" /> Hot
                        </span>
                      )}
                      {dish.dietary?.includes('vegetarian') && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-0.5">
                          <Leaf className="w-3 h-3" /> Chay
                        </span>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleFavorite) {
                          onToggleFavorite(dish.id);
                        } else if (onOpenAuthModal) {
                          onOpenAuthModal();
                        }
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md z-10"
                      title={isFav ? 'Bỏ lưu yêu thích' : 'Lưu món yêu thích'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-stone-300'}`} />
                    </button>
                  </div>

                  {/* Dish Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between gap-1">
                        <h4 
                          onClick={() => setInspectingDish(dish)}
                          className="font-serif-heading font-bold text-stone-900 text-base leading-snug hover:text-amber-700 cursor-pointer transition-colors line-clamp-1"
                        >
                          {dish.name}
                        </h4>
                      </div>

                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {dish.description}
                      </p>

                      {/* Prep time & Wine pairing indicator */}
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-500">
                        {dish.prepTimeMinutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {dish.prepTimeMinutes} phút
                          </span>
                        )}
                        {dish.winePairing && (
                          <span 
                            onClick={() => setInspectingDish(dish)}
                            className="text-amber-800 font-medium hover:underline cursor-pointer flex items-center gap-0.5"
                          >
                            <Wine className="w-3 h-3 text-amber-600" /> Vang đi kèm
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & Action Row */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                      <span className="font-black text-base text-amber-700">
                        {formatVND(dish.price)}
                      </span>

                      {/* Add / Stepper or Book Button */}
                      {qty > 0 ? (
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-300 rounded-xl p-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(dish, -1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-900 hover:bg-amber-200 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-bold text-xs text-amber-950">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(dish, 1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold transition-colors shadow-2xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(dish, 1)}
                            className="p-2 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-stone-200 transition-colors text-xs font-bold"
                            title="Thêm trước món này vào danh sách"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onUpdateQuantity(dish, 1);
                              onGoToBooking(dish);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-[11px] flex items-center gap-1 transition-all shadow-2xs"
                            title="Đặt bàn ngay với món này"
                          >
                            <CalendarCheck className="w-3 h-3" />
                            <span>Đặt Bàn</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. STICKY PRE-ORDER FLOATING FOOTER BAR (When customer selected dishes) */}
      {selectedDishes.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-4xl mx-auto bg-stone-950/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-sm shrink-0">
              {totalDishesCount}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-100 text-sm">
                  Quý khách đã chọn trước {totalDishesCount} món
                </span>
                {onClearDishes && (
                  <button
                    type="button"
                    onClick={onClearDishes}
                    className="text-[11px] text-stone-400 hover:text-rose-400 underline"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>
              <p className="text-xs text-amber-400 font-semibold">
                Tạm tính: {formatVND(preOrderTotal)} (Chưa bao gồm giảm giá thành viên)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onGoToBooking()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/40 transition-all hover:scale-105 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 stroke-[2.3]" />
              <span>Tiến Hành Đặt Bàn Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 6. VIP PRIVATE DINING & EVENT BANQUET PROMOTION */}
      <section className="bg-gradient-to-r from-amber-950 via-stone-900 to-stone-950 text-white rounded-3xl p-8 sm:p-10 border border-amber-900/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
            Phòng VIP & Tiệc Doanh Nghiệp
          </span>
          <h3 className="font-serif-heading text-2xl sm:text-3xl font-bold leading-tight">
            Thiết Kế Thực Đơn Riêng Biệt Cho Sự Kiện Của Bạn?
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
            Le Gourmet cung cấp dịch vụ phòng tiệc VIP riêng tư từ 8 đến 40 khách với Bếp trưởng phục vụ trực tiếp tại bàn. Liên hệ ngay để nhận bản phác thảo thực đơn cá nhân hóa.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onGoToBooking()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <CalendarCheck className="w-4 h-4 stroke-[2.2]" />
            <span>Đặt Phòng VIP Trực Tuyến</span>
          </button>
          <a
            href="tel:19008888"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>Hotline 1900 8888</span>
          </a>
        </div>
      </section>

      {/* Dish Detail Inspection Modal */}
      {inspectingDish && (
        <DishDetailModal
          dish={inspectingDish}
          onClose={() => setInspectingDish(null)}
          onSelectAndBook={(dish) => {
            onUpdateQuantity(dish, 1);
            onGoToBooking(dish);
          }}
          quantityInCart={getDishQuantity(inspectingDish.id)}
          onUpdateQuantity={onUpdateQuantity}
          isFavorite={currentUser?.favoriteDishIds?.includes(inspectingDish.id) || false}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </div>
  );
};
