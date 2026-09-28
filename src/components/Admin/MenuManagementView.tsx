import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Plus, 
  Search, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Edit3, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign,
  X
} from 'lucide-react';
import { MenuItem, DishCategory } from '../../types';
import { getStoredMenuItems, saveStoredMenuItems, toggleMenuItemStock, updateMenuItem, addMenuItem, formatVND } from '../../services/storage';

export const MenuManagementView: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => getStoredMenuItems());
  const [selectedCategory, setSelectedCategory] = useState<DishCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New dish form
  const [newDishName, setNewDishName] = useState('');
  const [newDishCategory, setNewDishCategory] = useState<DishCategory>('main');
  const [newDishPrice, setNewDishPrice] = useState<number>(180000);
  const [newDishImage, setNewDishImage] = useState('');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishPrepTime, setNewDishPrepTime] = useState<number>(15);
  const [newDishIsChefSpecial, setNewDishIsChefSpecial] = useState(false);

  const categories: { id: DishCategory | 'all'; name: string }[] = [
    { id: 'all', name: 'Tất Cả Danh Mục' },
    { id: 'appetizer', name: 'Khai Vị' },
    { id: 'main', name: 'Món Chính' },
    { id: 'seafood', name: 'Hải Sản' },
    { id: 'dessert', name: 'Tráng Miệng' },
    { id: 'beverage', name: 'Đồ Uống & Rượu' },
  ];

  const filteredItems = menuItems.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const handleToggleStock = (dishId: string) => {
    const updated = toggleMenuItemStock(dishId);
    setMenuItems(updated);
  };

  const handleSaveEdit = (dishId: string, updates: Partial<MenuItem>) => {
    const updated = updateMenuItem(dishId, updates);
    setMenuItems(updated);
    setEditingItem(null);
  };

  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim()) return;

    const newItem: MenuItem = {
      id: `m-custom-${Date.now()}`,
      name: newDishName.trim(),
      category: newDishCategory,
      price: Number(newDishPrice) || 100000,
      image: newDishImage.trim() || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      description: newDishDesc.trim() || 'Món ăn thượng hạng chế biến từ nguyên liệu tươi mới mỗi ngày.',
      prepTimeMinutes: Number(newDishPrepTime) || 15,
      isChefSpecial: newDishIsChefSpecial,
      dietary: newDishIsChefSpecial ? ['bestseller'] : [],
      isAvailable: true,
    };

    const updated = addMenuItem(newItem);
    setMenuItems(updated);
    setShowAddModal(false);

    // Reset form
    setNewDishName('');
    setNewDishDesc('');
    setNewDishImage('');
    setNewDishPrice(180000);
  };

  const inStockCount = menuItems.filter(i => i.isAvailable !== false).length;
  const outOfStockCount = menuItems.filter(i => i.isAvailable === false).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 text-stone-100 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <UtensilsCrossed className="w-4 h-4" />
            <span>Quản Lý Thực Đơn & Trạng Thái Kho Món (Admin)</span>
          </div>
          <h2 className="font-serif-heading text-xl sm:text-2xl font-bold text-stone-100">
            Danh Mục Món Ăn Nhà Hàng
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Cập nhật giá bán, trạng thái còn hàng / tạm hết món, và thêm món mới vào thực đơn đặt trước của khách.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs bg-stone-850 px-3 py-2 rounded-2xl border border-stone-800">
            <span className="text-emerald-400 font-bold">{inStockCount} Còn Món</span>
            <span className="text-stone-600">•</span>
            <span className="text-rose-400 font-bold">{outOfStockCount} Tạm Hết</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Thêm Món Mới</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên món hoặc mô tả..."
            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-stone-950 font-bold shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(dish => {
          const isAvail = dish.isAvailable !== false;
          return (
            <div
              key={dish.id}
              className={`bg-white rounded-3xl border overflow-hidden shadow-xs transition-all flex flex-col justify-between ${
                isAvail ? 'border-stone-200 hover:border-amber-400' : 'border-rose-200 bg-rose-50/20'
              }`}
            >
              <div>
                <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${
                      !isAvail ? 'grayscale opacity-60' : ''
                    }`}
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-900/80 text-amber-300 backdrop-blur-xs uppercase">
                      {dish.category}
                    </span>
                    {dish.isChefSpecial && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 flex items-center gap-1 shadow-sm">
                        <Flame className="w-3 h-3 fill-stone-950" /> Đặc Sắc
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-sm ${
                      isAvail ? 'bg-emerald-500 text-stone-950' : 'bg-rose-600 text-white'
                    }`}>
                      {isAvail ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{isAvail ? 'Còn Món' : 'Tạm Hết'}</span>
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-stone-900 text-sm leading-snug">{dish.name}</h3>
                    <span className="font-extrabold text-amber-600 text-sm whitespace-nowrap">
                      {formatVND(dish.price)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{dish.description}</p>
                  <div className="text-[11px] text-stone-400 flex items-center gap-2 pt-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>Thời gian chuẩn bị: ~{dish.prepTimeMinutes || 15} phút</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Controls */}
              <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleToggleStock(dish.id)}
                  className={`flex-1 py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                    isAvail
                      ? 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                      : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                  }`}
                >
                  {isAvail ? (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Báo Tạm Hết</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Bật Còn Hàng</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setEditingItem(dish)}
                  className="py-1.5 px-3 rounded-xl bg-white hover:bg-stone-200 text-stone-700 font-medium border border-stone-200 flex items-center gap-1 cursor-pointer transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Dish Price Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-2xl text-stone-100 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-100">Chỉnh Sửa Món: {editingItem.name}</h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Giá bán (VND):</label>
                <input
                  type="number"
                  defaultValue={editingItem.price}
                  id="edit-dish-price"
                  step={5000}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Thời gian chế biến (phút):</label>
                <input
                  type="number"
                  defaultValue={editingItem.prepTimeMinutes || 15}
                  id="edit-dish-preptime"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Mô tả món ăn:</label>
                <textarea
                  defaultValue={editingItem.description}
                  id="edit-dish-desc"
                  rows={3}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 font-medium text-xs cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const newPrice = Number((document.getElementById('edit-dish-price') as HTMLInputElement)?.value) || editingItem.price;
                  const newPrep = Number((document.getElementById('edit-dish-preptime') as HTMLInputElement)?.value) || editingItem.prepTimeMinutes;
                  const newDesc = (document.getElementById('edit-dish-desc') as HTMLTextAreaElement)?.value || editingItem.description;
                  handleSaveEdit(editingItem.id, { price: newPrice, prepTimeMinutes: newPrep, description: newDesc });
                }}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs cursor-pointer shadow-md"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Dish Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl text-stone-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Thêm Món Ăn Mới Vào Thực Đơn</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDish} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Tên món ăn (*):</label>
                <input
                  type="text"
                  required
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  placeholder="VD: Cá Hồi Na Uy Áp Chảo Xốt Chanh Leo..."
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Danh mục (*):</label>
                  <select
                    value={newDishCategory}
                    onChange={(e) => setNewDishCategory(e.target.value as DishCategory)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="appetizer">Khai Vị</option>
                    <option value="main">Món Chính</option>
                    <option value="seafood">Hải Sản</option>
                    <option value="dessert">Tráng Miệng</option>
                    <option value="beverage">Đồ Uống & Rượu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Giá bán (VND) (*):</label>
                  <input
                    type="number"
                    required
                    step={5000}
                    value={newDishPrice}
                    onChange={(e) => setNewDishPrice(Number(e.target.value))}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Đường dẫn ảnh món (URL):</label>
                <input
                  type="url"
                  value={newDishImage}
                  onChange={(e) => setNewDishImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Mô tả nguyên liệu & hương vị:</label>
                <textarea
                  rows={3}
                  value={newDishDesc}
                  onChange={(e) => setNewDishDesc(e.target.value)}
                  placeholder="Mô tả nguyên liệu tươi, cách chế biến đặc biệt..."
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-800/80 border border-stone-700">
                <span className="text-stone-300 font-medium">Đánh dấu Món Đặc Sắc Bếp Trưởng (Chef's Special)</span>
                <input
                  type="checkbox"
                  checked={newDishIsChefSpecial}
                  onChange={(e) => setNewDishIsChefSpecial(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 font-medium cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold cursor-pointer shadow-lg"
                >
                  Lưu & Thêm Món
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
