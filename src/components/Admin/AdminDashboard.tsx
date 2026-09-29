import React, { useState } from 'react';
import { 
  ClipboardList, 
  Armchair, 
  BarChart3, 
  Plus, 
  CalendarClock, 
  DollarSign, 
  Users, 
  Sparkles,
  CheckCircle2,
  UtensilsCrossed,
  ShieldCheck,
  ArrowLeft,
  QrCode,
  Lock,
  Layers,
  Repeat,
  ChefHat,
  Boxes,
  Star,
  Bell
} from 'lucide-react';
import { Reservation, RestaurantTable, ReservationStatus, TableStatus, UserAccount, TableServiceRequest } from '../../types';
import { ReservationList } from './ReservationList';
import { TableStatusMap } from './TableStatusMap';
import { RevenueReportView } from './RevenueReportView';
import { ManualBookingModal } from './ManualBookingModal';
import { StaffOperationsHub } from './StaffOperationsHub';
import { MenuManagementView } from './MenuManagementView';
import { StaffManagementView } from './StaffManagementView';
import { KitchenDisplaySystem } from './KitchenDisplaySystem';
import { InventoryManagementView } from './InventoryManagementView';
import { CustomerFeedbackView } from './CustomerFeedbackView';
import { formatVND, getStoredTableServiceRequests, updateTableServiceRequestStatus } from '../../services/storage';


interface AdminDashboardProps {
  reservations: Reservation[];
  tables: RestaurantTable[];
  currentUser?: UserAccount | null;
  onBackToBooking?: () => void;
  onStatusChange: (reservationId: string, status: ReservationStatus) => void;
  onUpdateTableStatus: (tableId: string, status: TableStatus) => void;
  onOpenEmailPreview: (reservation: Reservation) => void;
  onCreateManualReservation: (data: any) => void;
  onSaveDishesAtTable?: (reservationId: string, dishesToAdd: any[]) => void;
  onConfirmCheckout?: (reservationId: string, paymentDetails: any) => void;
  onSwitchUser?: (newUser: UserAccount) => void;
  initialTab?: 'staff_ops' | 'reservations' | 'tables' | 'kds' | 'inventory' | 'feedback' | 'reports' | 'menu' | 'staff';
  onTabChange?: (tab: 'staff_ops' | 'reservations' | 'tables' | 'kds' | 'inventory' | 'feedback' | 'reports' | 'menu' | 'staff') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  reservations,
  tables,
  currentUser,
  onBackToBooking,
  onStatusChange,
  onUpdateTableStatus,
  onOpenEmailPreview,
  onCreateManualReservation,
  onSaveDishesAtTable,
  onConfirmCheckout,
  initialTab,
  onTabChange,
}) => {
  const isActualAdmin = currentUser?.role === 'admin';
  
  // Simulated view mode toggle for testing (Admin can preview as Staff)
  const [viewMode, setViewMode] = useState<'admin' | 'staff'>(
    initialTab === 'staff' || initialTab === 'reports' || initialTab === 'menu' || initialTab === 'inventory'
      ? 'admin'
      : currentUser?.role === 'staff' ? 'staff' : 'admin'
  );

  const [activeTab, setActiveTab] = useState<
    'staff_ops' | 'reservations' | 'tables' | 'kds' | 'inventory' | 'feedback' | 'reports' | 'menu' | 'staff'
  >(initialTab || (currentUser?.role === 'staff' ? 'staff_ops' : 'reservations'));

  // Sync initialTab if changed externally
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      if (initialTab === 'staff' || initialTab === 'reports' || initialTab === 'menu' || initialTab === 'inventory') {
        setViewMode('admin');
      }
    }
  }, [initialTab]);

  const handleSelectTab = (tab: 'staff_ops' | 'reservations' | 'tables' | 'kds' | 'inventory' | 'feedback' | 'reports' | 'menu' | 'staff') => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  // Live Table Service Requests state
  const [serviceRequests, setServiceRequests] = useState<TableServiceRequest[]>(() => getStoredTableServiceRequests());

  // Listen to live service bell updates
  React.useEffect(() => {
    const handleUpdated = (e: any) => {
      if (e.detail) setServiceRequests(e.detail);
    };
    window.addEventListener('restaurant:service_requests_updated', handleUpdated);
    return () => window.removeEventListener('restaurant:service_requests_updated', handleUpdated);
  }, []);

  const pendingServiceRequests = serviceRequests.filter(r => r.status === 'pending');

  const handleAcknowledgeService = (reqId: string) => {
    const updated = updateTableServiceRequestStatus(reqId, 'acknowledged', currentUser?.name || 'Nhân viên trực');
    setServiceRequests(updated);
  };

  const handleCompleteService = (reqId: string) => {
    const updated = updateTableServiceRequestStatus(reqId, 'completed', currentUser?.name || 'Nhân viên trực');
    setServiceRequests(updated);
  };


  const [showManualModal, setShowManualModal] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Quick stats
  const todayReservations = reservations.filter(r => r.bookingDate === todayStr && r.status !== 'cancelled');
  const todayRevenue = todayReservations.reduce((sum, r) => sum + r.preOrderTotal, 0);
  const seatedTablesCount = tables.filter(t => t.status === 'occupied').length;
  const availableTablesCount = tables.filter(t => t.status === 'available').length;
  const totalGuestsToday = todayReservations.reduce((sum, r) => sum + r.guestCount, 0);

  const isRestrictedForStaff = (tabName: string) => {
    return viewMode === 'staff' && (tabName === 'reports' || tabName === 'menu' || tabName === 'staff');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Admin / Staff Top Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                viewMode === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {viewMode === 'admin' ? 'Bảng Quản Trị Trưởng (Admin Portal)' : 'Bảng Vận Hành Nhân Viên (Staff Desk)'}
                </span>
              </span>

              {currentUser && (
                <span className="text-xs text-stone-400 bg-stone-800/80 px-2.5 py-0.5 rounded-full border border-stone-700/60">
                  Đang đăng nhập: <strong className="text-stone-200">{currentUser.name}</strong> ({currentUser.position || currentUser.role})
                </span>
              )}
            </div>

            <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-stone-100">
              Le Gourmet Bistro Management
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl">
              {viewMode === 'admin'
                ? 'Kiểm soát toàn diện quy trình vận hành nhà hàng, báo cáo tài chính doanh thu, phân bổ bàn, thực đơn và đội ngũ nhân sự.'
                : 'Tiếp đón khách check-in, đổi trạng thái sơ đồ bàn, gọi thêm món tại bàn cho khách và xuất hóa đơn thanh toán trả bàn.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Role View Switcher for easy testing */}
            <div className="flex bg-stone-800 p-1 rounded-2xl border border-stone-700 text-xs">
              <button
                type="button"
                onClick={() => {
                  setViewMode('admin');
                  if (activeTab === 'staff_ops') setActiveTab('reservations');
                }}
                className={`px-3 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'admin'
                    ? 'bg-amber-600 text-stone-950 shadow-md'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Xem giao diện với quyền Quản Trị Viên (Admin)"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin View</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode('staff');
                  setActiveTab('staff_ops');
                }}
                className={`px-3 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'staff'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Xem giao diện với quyền Nhân Viên (Staff Desk)"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Staff View</span>
              </button>
            </div>

            {/* Quick direct access to Account Management */}
            <button
              type="button"
              id="admin-header-account-btn"
              onClick={() => {
                setViewMode('admin');
                handleSelectTab('staff');
              }}
              className={`px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                activeTab === 'staff'
                  ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300'
                  : 'bg-stone-800 hover:bg-stone-750 text-amber-300 border border-amber-500/40 hover:border-amber-400'
              }`}
              title="Xem và quản lý tài khoản nhân viên, khách hàng và phân quyền RBAC"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Quản Lý Tài Khoản</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold">
                RBAC
              </span>
            </button>

            {onBackToBooking && (
              <button
                type="button"
                onClick={onBackToBooking}
                className="px-4 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-stone-100 border border-stone-700 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Về Trang Đặt Bàn</span>
              </button>
            )}

            <button
              type="button"
              id="admin-manual-booking-btn"
              onClick={() => setShowManualModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 cursor-pointer transition shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Thêm Đặt Bàn Thủ Công</span>
            </button>
          </div>
        </div>

        {/* 4 Mini metric strips */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-stone-800 text-xs">
          <div>
            <span className="text-stone-400">Doanh thu dự kiến hôm nay:</span>
            <div className="text-xl font-extrabold text-amber-400 mt-0.5">
              {formatVND(todayRevenue)}
            </div>
          </div>
          <div>
            <span className="text-stone-400">Đơn đặt bàn hôm nay:</span>
            <div className="text-xl font-extrabold text-stone-100 mt-0.5">
              {todayReservations.length} Bàn ({totalGuestsToday} Khách)
            </div>
          </div>
          <div>
            <span className="text-stone-400">Bàn đang phục vụ:</span>
            <div className="text-xl font-extrabold text-blue-400 mt-0.5">
              {seatedTablesCount} Bàn
            </div>
          </div>
          <div>
            <span className="text-stone-400">Bàn sẵn sàng đón khách:</span>
            <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
              {availableTablesCount} / {tables.length} Bàn
            </div>
          </div>
        </div>
      </div>

      {/* Live Table Service Bell Alert Banner */}
      {pendingServiceRequests.length > 0 && (
        <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 border-2 border-rose-300 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-rose-600 flex items-center justify-center font-bold shadow-md">
              <Bell className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-rose-100 flex items-center gap-1.5">
                <span>Chuông Gọi Phục Vụ Tại Bàn ({pendingServiceRequests.length} Yêu Cầu Chờ)</span>
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              </div>
              <div className="text-sm font-extrabold text-white mt-0.5">
                {pendingServiceRequests[0].tableName}: {
                  pendingServiceRequests[0].type === 'water_ice' ? '🧊 Tiếp Nước & Thêm Đá' :
                  pendingServiceRequests[0].type === 'sommelier' ? '🍷 Tư Vấn Rượu Vang' :
                  pendingServiceRequests[0].type === 'cutlery' ? '🥢 Đổi Dao Dĩa & Đĩa Ăn' :
                  pendingServiceRequests[0].type === 'hot_towel' ? '🧼 Khăn Ấm Cao Cấp' :
                  pendingServiceRequests[0].type === 'bill_request' ? '💳 Yêu Cầu Thanh Toán & In Hóa Đơn' :
                  pendingServiceRequests[0].type === 'manager' ? '🛎️ Gặp Quản Lý Nhà Hàng' : '🛎️ Yêu Cầu Phục Vụ'
                }
                {pendingServiceRequests[0].customNote && ` - "${pendingServiceRequests[0].customNote}"`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAcknowledgeService(pendingServiceRequests[0].id)}
              className="px-4 py-2 rounded-xl bg-white text-rose-700 font-bold text-xs hover:bg-rose-50 transition cursor-pointer shadow-xs"
            >
              Tiếp Nhận Ngay
            </button>
            <button
              type="button"
              onClick={() => handleCompleteService(pendingServiceRequests[0].id)}
              className="px-4 py-2 rounded-xl bg-stone-900 text-amber-300 font-bold text-xs hover:bg-stone-800 transition cursor-pointer"
            >
              Đã Xong
            </button>
          </div>
        </div>
      )}

      {/* Main Management Tabs Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        {/* Tab: Staff Operations Hub */}
        <button
          type="button"
          onClick={() => setActiveTab('staff_ops')}
          className={`py-2.5 px-3.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'staff_ops'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Tiếp Tân & Check-in Staff</span>
          <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-900 text-[10px] font-extrabold">
            Hot
          </span>
        </button>

        {/* Tab: Reservations List */}
        <button
          type="button"
          onClick={() => setActiveTab('reservations')}
          className={`py-2.5 px-3.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'reservations'
              ? 'bg-amber-600 text-stone-950 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Danh Sách Đặt Bàn</span>
          <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-stone-200 text-stone-800">
            {reservations.length}
          </span>
        </button>

        {/* Tab: Table Status Map */}
        <button
          type="button"
          onClick={() => setActiveTab('tables')}
          className={`py-2.5 px-3.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'tables'
              ? 'bg-amber-600 text-stone-950 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Armchair className="w-4 h-4" />
          <span>Sơ Đồ Bàn</span>
        </button>

        {/* Tab: Kitchen Display System (KDS) */}
        <button
          type="button"
          onClick={() => setActiveTab('kds')}
          className={`py-2.5 px-3.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'kds'
              ? 'bg-amber-600 text-stone-950 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <ChefHat className="w-4 h-4 text-amber-500" />
          <span>Màn Hình Bếp (KDS)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold">
            Bếp & Bar
          </span>
        </button>

        {/* Tab: Inventory & Recipe BOM (Admin Only) */}
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`py-2.5 px-3.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-amber-600 text-stone-950 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          } ${isRestrictedForStaff('inventory') ? 'opacity-50' : ''}`}
        >
          <Boxes className="w-4 h-4 text-amber-500" />
          <span>Kho & Định Lượng BOM</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold">
            Cost Control
          </span>
          {isRestrictedForStaff('inventory') && <Lock className="w-3 h-3 text-stone-400" />}
        </button>

        {/* Tab: Customer Feedback & CSAT */}
        <button
          type="button"
          onClick={() => setActiveTab('feedback')}
          className={`py-2.5 px-3.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'feedback'
              ? 'bg-amber-600 text-stone-950 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
          <span>Đánh Giá & CSAT</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold">
            4.9★
          </span>
        </button>

        {/* Tab: Revenue Reports (Admin Only) */}

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`py-2.5 px-3.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-amber-600 text-stone-950 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          } ${isRestrictedForStaff('reports') ? 'opacity-50' : ''}`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Báo Cáo Doanh Thu</span>
          {isRestrictedForStaff('reports') && <Lock className="w-3 h-3 text-stone-400" />}
        </button>

        {/* Tab: Menu Management (Admin Only) */}
        <button
          type="button"
          onClick={() => setActiveTab('menu')}
          className={`py-2.5 px-3.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'menu'
              ? 'bg-amber-600 text-stone-950 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          } ${isRestrictedForStaff('menu') ? 'opacity-50' : ''}`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Quản Lý Thực Đơn</span>
          {isRestrictedForStaff('menu') && <Lock className="w-3 h-3 text-stone-400" />}
        </button>

        {/* Tab: Account & Staff Management (Admin Only) */}
        <button
          type="button"
          id="admin-tab-staff-accounts-btn"
          onClick={() => {
            if (viewMode === 'staff') {
              setViewMode('admin');
            }
            handleSelectTab('staff');
          }}
          className={`py-2.5 px-3.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer border ${
            activeTab === 'staff'
              ? 'bg-amber-600 text-stone-950 border-amber-500 shadow-md ring-1 ring-amber-400'
              : 'text-stone-800 bg-amber-500/10 hover:bg-amber-500/20 border-amber-400/50'
          }`}
          title="Module Quản Lý Toàn Bộ Tài Khoản & Phân Quyền RBAC"
        >
          <Users className="w-4 h-4 text-amber-700" />
          <span className="font-extrabold text-stone-900">Quản Lý Tài Khoản</span>
          <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black">
            RBAC
          </span>
        </button>
      </div>

      {/* Role Restriction Banner if staff tries to open admin tabs */}
      {isRestrictedForStaff(activeTab) ? (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 text-center text-stone-100 max-w-xl mx-auto space-y-4 animate-fade-in shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
              Quyền Hạn Hạn Chế Cho Vai Trò Nhân Viên (Staff)
            </span>
            <h3 className="font-serif-heading text-xl font-bold text-stone-100 mt-2">
              Module Dành Riêng Cho Quản Trị Viên (Admin)
            </h3>
            <p className="text-xs text-stone-400 max-w-md mx-auto mt-2 leading-relaxed">
              Bạn đang ở chế độ <strong>Nhân Viên (Staff)</strong>. Các báo cáo tài chính mật, quản lý thực đơn và phân quyền nhân sự chỉ được truy cập bởi tài khoản <strong>Quản Trị Viên (Admin)</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setViewMode('admin')}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span>Chuyển Sang Chế Độ Admin Để Xem</span>
          </button>
        </div>
      ) : (
        /* Active Tab Content */
        <>
          {activeTab === 'staff_ops' && (
            <StaffOperationsHub
              reservations={reservations}
              tables={tables}
              currentUser={currentUser}
              onStatusChange={onStatusChange}
              onUpdateTableStatus={onUpdateTableStatus}
              onSaveDishesAtTable={onSaveDishesAtTable || (() => {})}
              onConfirmCheckout={onConfirmCheckout || (() => {})}
              onOpenManualBooking={() => setShowManualModal(true)}
              onOpenKDS={() => setActiveTab('kds')}
            />
          )}

          {activeTab === 'reservations' && (
            <ReservationList
              reservations={reservations}
              tables={tables}
              onStatusChange={onStatusChange}
              onOpenEmailPreview={onOpenEmailPreview}
              onOpenManualBooking={() => setShowManualModal(true)}
            />
          )}

          {activeTab === 'tables' && (
            <TableStatusMap
              tables={tables}
              reservations={reservations}
              onUpdateTableStatus={onUpdateTableStatus}
            />
          )}

          {activeTab === 'kds' && (
            <KitchenDisplaySystem />
          )}

          {activeTab === 'inventory' && (
            <InventoryManagementView />
          )}

          {activeTab === 'feedback' && (
            <CustomerFeedbackView currentUser={currentUser} />
          )}

          {activeTab === 'reports' && (

            <RevenueReportView reservations={reservations} />
          )}

          {activeTab === 'menu' && (
            <MenuManagementView />
          )}

          {activeTab === 'staff' && (
            <StaffManagementView />
          )}
        </>
      )}

      {/* Manual Booking Modal */}
      {showManualModal && (
        <ManualBookingModal
          tables={tables}
          onClose={() => setShowManualModal(false)}
          onSubmitManualBooking={(data) => {
            onCreateManualReservation(data);
          }}
        />
      )}
    </div>
  );
};
