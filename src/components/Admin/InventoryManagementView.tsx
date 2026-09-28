import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  ArrowDownRight, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  PackagePlus, 
  Eye, 
  Lock, 
  Unlock, 
  Sparkles, 
  ChefHat, 
  Clock, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { 
  Ingredient, 
  DishRecipeBOM, 
  InventoryLog, 
  DishCostAnalysis, 
  MenuItem, 
  IngredientCategory,
  RecipeItemIngredient
} from '../../types';
import { 
  getStoredIngredients, 
  getStoredRecipeBOMs, 
  getStoredInventoryLogs, 
  getStoredMenuItems, 
  getDishCostAnalyses, 
  importInventoryStock, 
  updateIngredient, 
  addIngredient, 
  updateRecipeBOM,
  formatVND 
} from '../../services/storage';

export const InventoryManagementView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'warehouse' | 'recipes' | 'food_cost' | 'logs'>('warehouse');
  const [ingredients, setIngredients] = useState<Ingredient[]>(getStoredIngredients());
  const [recipes, setRecipes] = useState<DishRecipeBOM[]>(getStoredRecipeBOMs());
  const [logs, setLogs] = useState<InventoryLog[]>(getStoredInventoryLogs());
  const [menuItems, setMenuItems] = useState<MenuItem[]>(getStoredMenuItems());
  const [costAnalyses, setCostAnalyses] = useState<DishCostAnalysis[]>(getDishCostAnalyses());

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockLevelFilter, setStockLevelFilter] = useState<'all' | 'safe' | 'low' | 'empty'>('all');

  // Modal States
  const [selectedIngredientForImport, setSelectedIngredientForImport] = useState<Ingredient | null>(null);
  const [importQuantity, setImportQuantity] = useState<number>(1000);
  const [importNotes, setImportNotes] = useState('');
  const [editingRecipeDish, setEditingRecipeDish] = useState<MenuItem | null>(null);
  const [editingRecipeItems, setEditingRecipeItems] = useState<RecipeItemIngredient[]>([]);
  const [editingRecipeNotes, setEditingRecipeNotes] = useState('');

  // New Ingredient Modal State
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  const [newIngName, setNewIngName] = useState('');
  const [newIngCategory, setNewIngCategory] = useState<IngredientCategory>('meat');
  const [newIngUnit, setNewIngUnit] = useState<'g' | 'kg' | 'ml' | 'l' | 'pcs' | 'bottle'>('g');
  const [newIngStock, setNewIngStock] = useState<number>(1000);
  const [newIngMinStock, setNewIngMinStock] = useState<number>(300);
  const [newIngCost, setNewIngCost] = useState<number>(500);
  const [newIngSupplier, setNewIngSupplier] = useState('');

  // Reload all data
  const refreshAll = () => {
    setIngredients(getStoredIngredients());
    setRecipes(getStoredRecipeBOMs());
    setLogs(getStoredInventoryLogs());
    setMenuItems(getStoredMenuItems());
    setCostAnalyses(getDishCostAnalyses());
  };

  // KPI Metrics Calculation
  const kpis = useMemo(() => {
    const totalAssetValue = ingredients.reduce((sum, item) => sum + item.currentStock * item.costPerUnit, 0);
    const lowStockCount = ingredients.filter(item => item.currentStock <= item.minStockLevel && item.currentStock > 0).length;
    const emptyStockCount = ingredients.filter(item => item.currentStock <= 0).length;

    const validAnalyses = costAnalyses.filter(a => a.sellingPrice > 0);
    const avgFoodCost = validAnalyses.length > 0
      ? Math.round(validAnalyses.reduce((sum, a) => sum + a.foodCostPercentage, 0) / validAnalyses.length * 10) / 10
      : 32.5;

    const lockedDishesCount = menuItems.filter(m => m.isAvailable === false).length;

    return {
      totalAssetValue,
      lowStockCount,
      emptyStockCount,
      avgFoodCost,
      lockedDishesCount,
    };
  }, [ingredients, costAnalyses, menuItems]);

  // Filtered Ingredients
  const filteredIngredients = useMemo(() => {
    return ingredients.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;

      let matchStock = true;
      if (stockLevelFilter === 'empty') matchStock = item.currentStock <= 0;
      else if (stockLevelFilter === 'low') matchStock = item.currentStock > 0 && item.currentStock <= item.minStockLevel;
      else if (stockLevelFilter === 'safe') matchStock = item.currentStock > item.minStockLevel;

      return matchSearch && matchCategory && matchStock;
    });
  }, [ingredients, searchTerm, categoryFilter, stockLevelFilter]);

  // Handle Stock Import Submit
  const handleConfirmImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredientForImport || importQuantity <= 0) return;

    importInventoryStock(selectedIngredientForImport.id, importQuantity, importNotes);
    refreshAll();
    setSelectedIngredientForImport(null);
    setImportQuantity(1000);
    setImportNotes('');
  };

  // Handle Add New Ingredient Submit
  const handleCreateIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName.trim()) return;

    const newIng: Ingredient = {
      id: `ing-${Date.now()}`,
      name: newIngName.trim(),
      category: newIngCategory,
      unit: newIngUnit,
      currentStock: Number(newIngStock) || 0,
      minStockLevel: Number(newIngMinStock) || 0,
      costPerUnit: Number(newIngCost) || 0,
      supplier: newIngSupplier.trim() || 'Nhà cung ứng chỉ định',
      lastImportDate: new Date().toISOString().split('T')[0],
    };

    addIngredient(newIng);
    refreshAll();
    setShowAddIngredientModal(false);
    setNewIngName('');
    setNewIngStock(1000);
    setNewIngMinStock(300);
    setNewIngCost(500);
    setNewIngSupplier('');
  };

  // Open Recipe Editor for a Dish
  const handleOpenRecipeEditor = (dish: MenuItem) => {
    const existing = recipes.find(r => r.dishId === dish.id);
    setEditingRecipeDish(dish);
    if (existing) {
      setEditingRecipeItems([...existing.ingredients]);
      setEditingRecipeNotes(existing.preparationNotes || '');
    } else {
      setEditingRecipeItems([]);
      setEditingRecipeNotes('');
    }
  };

  // Save Recipe BOM
  const handleSaveRecipeBOM = () => {
    if (!editingRecipeDish) return;
    updateRecipeBOM(editingRecipeDish.id, editingRecipeItems, editingRecipeNotes);
    refreshAll();
    setEditingRecipeDish(null);
  };

  const getCategoryBadge = (cat: IngredientCategory) => {
    switch (cat) {
      case 'meat':
        return { label: 'Thịt Bò & Cừu', bg: 'bg-rose-950/40 text-rose-300 border-rose-800/60' };
      case 'seafood':
        return { label: 'Hải Sản Tươi', bg: 'bg-cyan-950/40 text-cyan-300 border-cyan-800/60' };
      case 'dairy':
        return { label: 'Bơ & Phô Mai', bg: 'bg-amber-950/40 text-amber-300 border-amber-800/60' };
      case 'produce':
        return { label: 'Rau Nấm & Củ', bg: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60' };
      case 'beverage_wine':
        return { label: 'Rượu Vang & Bar', bg: 'bg-purple-950/40 text-purple-300 border-purple-800/60' };
      case 'dry_goods':
        return { label: 'Hạt & Hàng Khô', bg: 'bg-stone-800 text-stone-300 border-stone-700' };
      default:
        return { label: 'Gia Vị Xốt', bg: 'bg-amber-900/30 text-amber-200 border-amber-800' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Summary */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-950/50">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-heading text-xl sm:text-2xl font-bold text-white">
                  Quản Lý Kho & Định Lượng Món Ăn
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-950/60 text-amber-400 border border-amber-800/60">
                  Cost Control Suite
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Kiểm soát định lượng Bill of Materials (BOM), tự động trừ kho theo món, cảnh báo an toàn & tỷ suất Food Cost %
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshAll}
              className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 text-xs transition cursor-pointer flex items-center gap-1.5"
              title="Đồng bộ lại kho"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Đồng Bộ</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddIngredientModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-950/40"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Thêm Nguyên Liệu</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-stone-950/70 border border-stone-800/90 rounded-2xl p-4">
            <div className="text-[11px] text-stone-400 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Tổng Giá Trị Tồn Kho</span>
            </div>
            <div className="text-xl font-black text-amber-400 mt-1">
              {formatVND(kpis.totalAssetValue)}
            </div>
            <div className="text-[10px] text-stone-500 mt-1">
              {ingredients.length} nguyên vật liệu đang theo dõi
            </div>
          </div>

          <div className="bg-stone-950/70 border border-stone-800/90 rounded-2xl p-4">
            <div className="text-[11px] text-stone-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Cảnh Báo Chạm Ngưỡng</span>
            </div>
            <div className={`text-xl font-black mt-1 flex items-center gap-1.5 ${
              kpis.lowStockCount > 0 ? 'text-amber-400' : 'text-stone-300'
            }`}>
              <span>{kpis.lowStockCount} mặt hàng</span>
              {kpis.emptyStockCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-red-950 text-red-400 border border-red-800">
                  {kpis.emptyStockCount} đã hết!
                </span>
              )}
            </div>
            <div className="text-[10px] text-stone-500 mt-1">
              Cần đặt hàng nhà cung ứng bổ sung
            </div>
          </div>

          <div className="bg-stone-950/70 border border-stone-800/90 rounded-2xl p-4">
            <div className="text-[11px] text-stone-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Food Cost TB Toàn Menu</span>
            </div>
            <div className="text-xl font-black text-emerald-400 mt-1">
              {kpis.avgFoodCost}%
            </div>
            <div className="text-[10px] text-emerald-500/80 mt-1">
              Chuẩn vàng Fine Dining (28% - 35%)
            </div>
          </div>

          <div className="bg-stone-950/70 border border-stone-800/90 rounded-2xl p-4">
            <div className="text-[11px] text-stone-400 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Món Bị Khóa (Hết Nguyên Liệu)</span>
            </div>
            <div className={`text-xl font-black mt-1 ${
              kpis.lockedDishesCount > 0 ? 'text-rose-400' : 'text-stone-300'
            }`}>
              {kpis.lockedDishesCount} món ăn
            </div>
            <div className="text-[10px] text-stone-500 mt-1">
              Tự động khóa trên Menu khi hết cốt lõi
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-t border-stone-800 pt-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSubTab('warehouse')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'warehouse'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-md shadow-amber-950/30'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Kho Hàng & Tồn Kho ({ingredients.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('recipes')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'recipes'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-md shadow-amber-950/30'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Định Lượng Món (Recipe BOM)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('food_cost')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'food_cost'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-md shadow-amber-950/30'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Giá Vốn & Tỷ Suất Lợi Nhuận (Food Cost %)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('logs')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'logs'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-md shadow-amber-950/30'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Nhật Ký Trừ / Nhập Kho ({logs.length})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: KHO NGUYÊN LIỆU (WAREHOUSE & STOCK) */}
      {/* ======================================================== */}
      {activeSubTab === 'warehouse' && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-800 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm tên nguyên liệu, nhà cung cấp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/60 w-56 sm:w-64"
                />
              </div>

              {/* Category Select */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 focus:outline-none focus:border-amber-500/60"
              >
                <option value="all">Tất Cả Nhóm Hàng</option>
                <option value="meat">Thịt Bò & Cừu</option>
                <option value="seafood">Hải Sản Tươi</option>
                <option value="dairy">Bơ & Phô Mai</option>
                <option value="produce">Rau Củ & Nấm</option>
                <option value="beverage_wine">Rượu Vang & Bar</option>
                <option value="dry_goods">Hạt & Hàng Khô</option>
              </select>

              {/* Stock Status Select */}
              <select
                value={stockLevelFilter}
                onChange={(e) => setStockLevelFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 focus:outline-none focus:border-amber-500/60"
              >
                <option value="all">Mọi Mức Tồn Kho</option>
                <option value="safe">Tồn Kho An Toàn</option>
                <option value="low">Chạm Ngưỡng Báo Động</option>
                <option value="empty">Đã Hết Hàng (0)</option>
              </select>
            </div>

            <div className="text-stone-400">
              Hiển thị <strong>{filteredIngredients.length}</strong> / {ingredients.length} nguyên liệu
            </div>
          </div>

          {/* Table List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                <tr>
                  <th className="py-3 px-3">Tên Nguyên Liệu</th>
                  <th className="py-3 px-3">Nhóm Hàng</th>
                  <th className="py-3 px-3 text-center">Tồn Kho Hiện Tại</th>
                  <th className="py-3 px-3 text-center">Mức Tối Thiểu</th>
                  <th className="py-3 px-3">Tình Trạng</th>
                  <th className="py-3 px-3 text-right">Đơn Giá Vốn</th>
                  <th className="py-3 px-3 text-right">Tổng Giá Trị</th>
                  <th className="py-3 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {filteredIngredients.map(ing => {
                  const badge = getCategoryBadge(ing.category);
                  const isDepleted = ing.currentStock <= 0;
                  const isLow = !isDepleted && ing.currentStock <= ing.minStockLevel;
                  const percentOfMin = Math.min(100, Math.round((ing.currentStock / (ing.minStockLevel * 2)) * 100));

                  return (
                    <tr key={ing.id} className="hover:bg-stone-850/50 transition">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white text-sm">
                          {ing.name}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          NCC: {ing.supplier || 'Nhà cung cấp ngoại nhập'}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-semibold ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <div className="font-black text-sm text-stone-100">
                          {ing.currentStock.toLocaleString('vi-VN')} {ing.unit}
                        </div>
                        {/* Visual stock health meter */}
                        <div className="w-24 mx-auto bg-stone-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              isDepleted ? 'bg-red-500' : isLow ? 'bg-amber-400' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.max(8, percentOfMin)}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono text-stone-400">
                        {ing.minStockLevel.toLocaleString('vi-VN')} {ing.unit}
                      </td>

                      <td className="py-3.5 px-3">
                        {isDepleted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-950/80 text-red-400 border border-red-800 animate-pulse">
                            <AlertCircle className="w-3 h-3" />
                            <span>HẾT HÀNG (0)</span>
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Sắp Hết Cần Nhập</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/50 text-emerald-400 border border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>An Toàn</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-medium text-stone-300">
                        {formatVND(ing.costPerUnit)} / {ing.unit}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-400">
                        {formatVND(ing.currentStock * ing.costPerUnit)}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedIngredientForImport(ing);
                            setImportQuantity(ing.minStockLevel || 1000);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/40 font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ml-auto"
                          title="Nhập thêm hàng vào kho"
                        >
                          <PackagePlus className="w-3.5 h-3.5" />
                          <span>Nhập Thêm</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: ĐỊNH LƯỢNG MÓN ĂN (RECIPE BOM) */}
      {/* ======================================================== */}
      {activeSubTab === 'recipes' && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-800 text-xs">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-amber-400" />
                <span>Bảng Định Lượng Nguyên Liệu (Bill of Materials - BOM) Theo Món</span>
              </h3>
              <p className="text-stone-400 text-[11px] mt-0.5">
                Khi khách hàng đặt món, hệ thống sẽ tự động trừ các thành phần này trong kho theo đúng tỷ lệ định lượng.
              </p>
            </div>
            <div className="text-amber-400/90 font-medium">
              💡 Ví dụ chuẩn: 1 phần Bò Wagyu A5 trừ 250g Thăn bò, 20g Bơ lạt, 5g Nấm Truffle
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {menuItems.map(dish => {
              const recipe = recipes.find(r => r.dishId === dish.id);
              const analysis = costAnalyses.find(a => a.dishId === dish.id);
              const hasCrucialMissing = analysis?.isCrucialMissing;

              return (
                <div 
                  key={dish.id} 
                  className={`bg-stone-950 border rounded-2xl p-4 space-y-3 transition-all ${
                    dish.isAvailable === false
                      ? 'border-red-800/80 bg-red-950/10'
                      : 'border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img 
                        src={dish.image} 
                        alt={dish.name} 
                        className="w-12 h-12 rounded-xl object-cover border border-stone-800 shrink-0" 
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">
                            {dish.name}
                          </h4>
                          {dish.isAvailable === false && (
                            <span className="px-1.5 py-0.2 rounded-md bg-red-950 text-red-400 border border-red-800 text-[9px] font-black uppercase">
                              Tự Động Khóa (Hết Nguyên Liệu)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-amber-400 font-bold mt-0.5">
                          {formatVND(dish.price)}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenRecipeEditor(dish)}
                      className="px-2.5 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                    >
                      <Edit3 className="w-3 h-3 text-amber-400" />
                      <span>Sửa BOM</span>
                    </button>
                  </div>

                  {/* Recipe BOM Ingredients breakdown */}
                  <div className="bg-stone-900/90 rounded-xl p-3 border border-stone-850 space-y-1.5">
                    <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold flex items-center justify-between">
                      <span>Nguyên liệu định lượng cho 1 phần:</span>
                      <span className="text-emerald-400">
                        Làm được tối đa: <strong>{analysis?.maxPortionsAvailable ?? 0} phần</strong>
                      </span>
                    </div>

                    {recipe && recipe.ingredients.length > 0 ? (
                      <div className="space-y-1 text-xs">
                        {recipe.ingredients.map(item => {
                          const ing = ingredients.find(i => i.id === item.ingredientId);
                          const isShort = ing && ing.currentStock < item.amount;

                          return (
                            <div key={item.ingredientId} className="flex items-center justify-between py-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  item.isCrucial ? 'bg-amber-400' : 'bg-stone-500'
                                }`} />
                                <span className={isShort ? 'text-red-400 font-semibold line-through' : 'text-stone-300'}>
                                  {ing?.name || 'Nguyên liệu chưa xác định'}
                                </span>
                                {item.isCrucial && (
                                  <span className="text-[9px] text-amber-400 px-1 py-0.2 rounded bg-amber-950/60 border border-amber-900">
                                    Cốt lõi
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-stone-200 font-bold">
                                {item.amount} {ing?.unit}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-stone-500 italic text-[11px] py-1">
                        Chưa cấu hình định lượng BOM chi tiết cho món này. Bấm "Sửa BOM" để thiết lập.
                      </div>
                    )}
                  </div>

                  {/* Bottom Cost snippet */}
                  {analysis && (
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-850 text-stone-400">
                      <span>
                        Giá vốn định lượng: <strong className="text-stone-200">{formatVND(analysis.costOfGoodsSold)}</strong>
                      </span>
                      <span>
                        Tỷ lệ Food Cost: <strong className="text-amber-400">{analysis.foodCostPercentage}%</strong>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: BÁO CÁO GIÁ VỐN & TỶ SUẤT LỢI NHUẬN (FOOD COST %) */}
      {/* ======================================================== */}
      {activeSubTab === 'food_cost' && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-800 text-xs">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>Báo Cáo Giá Vốn Hàng Bán (Cost of Goods Sold) & Tỷ Suất Lợi Nhuận Gộp</span>
              </h3>
              <p className="text-stone-400 text-[11px] mt-0.5">
                Giúp chủ nhà hàng định giá món ăn chuẩn xác, kiểm soát biên lợi nhuận gộp trên từng đĩa thức ăn.
              </p>
            </div>
            {/* Legend for food cost % */}
            <div className="flex items-center gap-2 text-[10px]">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                &lt; 30%: Siêu Lợi Nhuận
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                30% - 40%: Chuẩn Mực
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                &gt; 40%: Món Cao Cấp Cần Quản Trị
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                <tr>
                  <th className="py-3 px-3">Tên Món Ăn</th>
                  <th className="py-3 px-3 text-right">Giá Bán Niêm Yết</th>
                  <th className="py-3 px-3 text-right">Giá Vốn (COGS)</th>
                  <th className="py-3 px-3 text-center">Tỷ Lệ Food Cost %</th>
                  <th className="py-3 px-3 text-right">Lợi Nhuận Gộp / Phần</th>
                  <th className="py-3 px-3 text-center">Phần Có Thể Nấu</th>
                  <th className="py-3 px-3">Đánh Giá & Khuyến Nghị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {costAnalyses.map(analysis => {
                  let badgeColor = 'bg-amber-950/70 text-amber-300 border-amber-800';
                  let recommendation = 'Tỷ lệ lợi nhuận cân bằng tốt';

                  if (analysis.foodCostPercentage < 25) {
                    badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
                    recommendation = 'Lợi nhuận gộp rất cao, nên đẩy mạnh bán';
                  } else if (analysis.foodCostPercentage > 45) {
                    badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-800';
                    recommendation = 'Món cao cấp, kiểm soát chặt hao hụt nguyên liệu';
                  }

                  return (
                    <tr key={analysis.dishId} className="hover:bg-stone-850/50 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-sm">
                          {analysis.dishName}
                        </div>
                        <div className="text-[10px] text-stone-400 uppercase">
                          {analysis.category}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-stone-200">
                        {formatVND(analysis.sellingPrice)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-stone-300">
                        {formatVND(analysis.costOfGoodsSold)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-black text-xs border ${badgeColor}`}>
                          {analysis.foodCostPercentage}%
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                        +{formatVND(analysis.grossProfitMargin)}
                      </td>

                      <td className="py-3 px-3 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-mono ${
                          analysis.maxPortionsAvailable <= 5 ? 'text-red-400 bg-red-950/40' : 'text-stone-200'
                        }`}>
                          {analysis.maxPortionsAvailable} phần
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[11px] text-stone-400">
                        {recommendation}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 4: NHẬT KÝ TRỪ & NHẬP KHO (INVENTORY LOGS) */}
      {/* ======================================================== */}
      {activeSubTab === 'logs' && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-800 text-xs">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span>Nhật Ký Biến Động Kho Hàng Thời Gian Thực</span>
              </h3>
              <p className="text-stone-400 text-[11px] mt-0.5">
                Ghi nhận từng hành vi trừ kho khi khách đặt bàn hoặc gọi món tại bàn, và các lượt nhập hàng từ nhà cung cấp.
              </p>
            </div>
            <div className="text-stone-400">
              Tổng số bản ghi: <strong>{logs.length}</strong> giao dịch
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                <tr>
                  <th className="py-3 px-3">Thời Gian</th>
                  <th className="py-3 px-3">Loại Biến Động</th>
                  <th className="py-3 px-3">Nguyên Liệu</th>
                  <th className="py-3 px-3 text-center">Số Lượng</th>
                  <th className="py-3 px-3 text-center">Tồn Sau Giao Dịch</th>
                  <th className="py-3 px-3">Tham Chiếu Món / Đặt Bàn</th>
                  <th className="py-3 px-3">Người / Tác Nhân Thực Hiện</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {logs.map(log => {
                  const isDeduction = log.type === 'order_deduction';
                  const dateFormatted = new Date(log.timestamp).toLocaleString('vi-VN');

                  return (
                    <tr key={log.id} className="hover:bg-stone-850/50 transition">
                      <td className="py-3 px-3 font-mono text-stone-400 text-[11px]">
                        {dateFormatted}
                      </td>

                      <td className="py-3 px-3">
                        {isDeduction ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800">
                            <ArrowDownRight className="w-3 h-3" />
                            <span>Trừ Đơn Hàng</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Nhập Kho</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-bold text-white">
                        {log.ingredientName}
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-black">
                        <span className={isDeduction ? 'text-rose-400' : 'text-emerald-400'}>
                          {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged} {log.unit}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-stone-300">
                        {log.remainingStock} {log.unit}
                      </td>

                      <td className="py-3 px-3 text-stone-300">
                        {log.referenceDishName ? (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-stone-100">{log.referenceDishName}</span>
                            {log.referenceBookingCode && (
                              <span className="ml-1.5 px-1.5 py-0.2 rounded bg-stone-800 text-[10px] font-mono text-amber-400">
                                #{log.referenceBookingCode}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-stone-500 italic">{log.notes || 'Nhập kho thông thường'}</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-stone-400 text-[11px]">
                        {log.performedBy || 'Hệ thống'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: NHẬP THÊM HÀNG VÀO KHO (IMPORT STOCK MODAL) */}
      {/* ======================================================== */}
      {selectedIngredientForImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Nhập Thêm Hàng Vào Kho
                  </h3>
                  <p className="text-xs text-stone-400">
                    {selectedIngredientForImport.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIngredientForImport(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmImport} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-stone-950 border border-stone-850 flex items-center justify-between">
                <div>
                  <div className="text-stone-400 text-[11px]">Tồn kho hiện tại:</div>
                  <div className="font-mono text-sm font-bold text-stone-100">
                    {selectedIngredientForImport.currentStock} {selectedIngredientForImport.unit}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-stone-400 text-[11px]">Đơn giá vốn:</div>
                  <div className="font-mono text-sm font-bold text-amber-400">
                    {formatVND(selectedIngredientForImport.costPerUnit)} / {selectedIngredientForImport.unit}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Số lượng nhập thêm ({selectedIngredientForImport.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  value={importQuantity}
                  onChange={(e) => setImportQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm font-mono focus:outline-none focus:border-amber-500/60"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Ghi chú nhập hàng / Mã số hóa đơn:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lô hàng nhập ngày 25/09 từ NCC Nhật Việt"
                  value={importNotes}
                  onChange={(e) => setImportNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-[11px] leading-relaxed">
                💡 <strong>Gợi ý:</strong> Khi bạn nhập số lượng mới lớn hơn 0, nếu món ăn nào trước đó bị khóa tự động do thiếu nguyên liệu này, hệ thống sẽ tự động kích hoạt mở khóa lại trên thực đơn.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedIngredientForImport(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold transition cursor-pointer shadow-md shadow-amber-950/40 flex items-center gap-1.5"
                >
                  <PackagePlus className="w-4 h-4 stroke-[2.5]" />
                  <span>Xác Nhận Nhập Kho</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: THÊM NGUYÊN LIỆU MỚI (ADD INGREDIENT MODAL) */}
      {/* ======================================================== */}
      {showAddIngredientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Thêm Nguyên Vật Liệu Mới Vào Kho
                  </h3>
                  <p className="text-xs text-stone-400">
                    Khởi tạo danh mục nguyên liệu phục vụ định lượng BOM
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddIngredientModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIngredient} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Tên nguyên liệu:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Thăn Bò Wagyu A5 Miyazaki, Sườn Cừu Úc..."
                  value={newIngName}
                  onChange={(e) => setNewIngName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/60"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    Nhóm phân loại:
                  </label>
                  <select
                    value={newIngCategory}
                    onChange={(e) => setNewIngCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="meat">Thịt Bò & Cừu</option>
                    <option value="seafood">Hải Sản Tươi</option>
                    <option value="dairy">Bơ & Phô Mai</option>
                    <option value="produce">Rau Củ & Nấm</option>
                    <option value="beverage_wine">Rượu Vang & Bar</option>
                    <option value="dry_goods">Hạt & Hàng Khô</option>
                    <option value="spices_sauces">Gia Vị Xốt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    Đơn vị tính:
                  </label>
                  <select
                    value={newIngUnit}
                    onChange={(e) => setNewIngUnit(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="g">Gram (g)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="ml">Mililit (ml)</option>
                    <option value="l">Lít (L)</option>
                    <option value="pcs">Con / Quả / Trái (pcs)</option>
                    <option value="bottle">Chai 750ml (bottle)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    Số lượng nhập ban đầu:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newIngStock}
                    onChange={(e) => setNewIngStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 font-mono focus:outline-none focus:border-amber-500/60"
                    required
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    Ngưỡng báo động:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newIngMinStock}
                    onChange={(e) => setNewIngMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 font-mono focus:outline-none focus:border-amber-500/60"
                    required
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    Đơn giá vốn (VND):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newIngCost}
                    onChange={(e) => setNewIngCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 font-mono focus:outline-none focus:border-amber-500/60"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Nhà cung cấp / Đơn vị phân phối:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Công ty Nhập Khẩu Nhật Việt Gourmet..."
                  value={newIngSupplier}
                  onChange={(e) => setNewIngSupplier(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddIngredientModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold transition cursor-pointer shadow-md shadow-amber-950/40 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Tạo Nguyên Liệu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: TRÌNH CHỈNH SỬA RECIPE BOM CHO MÓN ĂN */}
      {/* ======================================================== */}
      {editingRecipeDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <img 
                  src={editingRecipeDish.image} 
                  alt={editingRecipeDish.name} 
                  className="w-12 h-12 rounded-xl object-cover border border-stone-700" 
                />
                <div>
                  <h3 className="font-bold text-white text-base">
                    Định Lượng BOM: {editingRecipeDish.name}
                  </h3>
                  <p className="text-xs text-amber-400 font-bold">
                    Giá bán: {formatVND(editingRecipeDish.price)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecipeDish(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-200 uppercase text-[11px] tracking-wide">
                  Danh sách nguyên liệu cấu thành 1 phần:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (ingredients.length > 0) {
                      setEditingRecipeItems([
                        ...editingRecipeItems,
                        { ingredientId: ingredients[0].id, amount: 100, isCrucial: true },
                      ]);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-600/40 font-bold hover:bg-amber-600/30 transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Thành Phần</span>
                </button>
              </div>

              {editingRecipeItems.length === 0 ? (
                <div className="p-4 rounded-xl bg-stone-950 text-center text-stone-400 border border-dashed border-stone-800">
                  Món này chưa có định lượng nguyên liệu. Bấm "Thêm Thành Phần" ở trên để chọn nguyên liệu.
                </div>
              ) : (
                <div className="space-y-2">
                  {editingRecipeItems.map((item, idx) => {
                    const ing = ingredients.find(i => i.id === item.ingredientId);

                    return (
                      <div key={idx} className="p-3 rounded-2xl bg-stone-950 border border-stone-800 flex items-center gap-2">
                        {/* Select Ingredient */}
                        <div className="flex-1">
                          <select
                            value={item.ingredientId}
                            onChange={(e) => {
                              const updated = [...editingRecipeItems];
                              updated[idx].ingredientId = e.target.value;
                              setEditingRecipeItems(updated);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-750 text-stone-200 text-xs font-semibold focus:outline-none"
                          >
                            {ingredients.map(ingOption => (
                              <option key={ingOption.id} value={ingOption.id}>
                                {ingOption.name} ({ingOption.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Amount */}
                        <div className="w-24">
                          <div className="relative">
                            <input
                              type="number"
                              min="0.1"
                              step="any"
                              value={item.amount}
                              onChange={(e) => {
                                const updated = [...editingRecipeItems];
                                updated[idx].amount = Number(e.target.value);
                                setEditingRecipeItems(updated);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-750 text-stone-100 font-mono text-center text-xs font-bold"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-stone-400">
                              {ing?.unit}
                            </span>
                          </div>
                        </div>

                        {/* Crucial Toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...editingRecipeItems];
                            updated[idx].isCrucial = !updated[idx].isCrucial;
                            setEditingRecipeItems(updated);
                          }}
                          className={`px-2 py-1.5 rounded-xl font-bold text-[10px] uppercase border transition cursor-pointer ${
                            item.isCrucial
                              ? 'bg-amber-950 text-amber-300 border-amber-700'
                              : 'bg-stone-900 text-stone-500 border-stone-800 hover:text-stone-300'
                          }`}
                          title="Nếu nguyên liệu cốt lõi hết trong kho, hệ thống tự động khóa món trên menu"
                        >
                          {item.isCrucial ? '★ Cốt lõi' : 'Phụ'}
                        </button>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRecipeItems(editingRecipeItems.filter((_, i) => i !== idx));
                          }}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-900 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Ghi chú chế biến & tiêu chuẩn bếp trưởng:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Cắt thăn bò dày 2.5cm, tẩm bơ lạt đun chảy..."
                  value={editingRecipeNotes}
                  onChange={(e) => setEditingRecipeNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              {/* Realtime BOM Cost Calc */}
              <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-800/40 flex items-center justify-between text-xs">
                <div>
                  <span className="text-stone-400">Giá vốn tính theo BOM: </span>
                  <strong className="text-white font-mono">
                    {formatVND(
                      editingRecipeItems.reduce((sum, item) => {
                        const ing = ingredients.find(i => i.id === item.ingredientId);
                        return sum + (ing ? item.amount * ing.costPerUnit : 0);
                      }, 0)
                    )}
                  </strong>
                </div>
                <div>
                  <span className="text-stone-400">Food Cost Dự Kiến: </span>
                  <strong className="text-amber-400 font-bold">
                    {editingRecipeDish.price > 0
                      ? Math.round(
                          (editingRecipeItems.reduce((sum, item) => {
                            const ing = ingredients.find(i => i.id === item.ingredientId);
                            return sum + (ing ? item.amount * ing.costPerUnit : 0);
                          }, 0) /
                            editingRecipeDish.price) *
                            100
                        )
                      : 0}
                    %
                  </strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingRecipeDish(null)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSaveRecipeBOM}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold transition cursor-pointer shadow-md shadow-amber-950/40 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lưu Định Lượng BOM</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
