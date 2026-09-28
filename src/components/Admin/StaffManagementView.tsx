import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  Phone, 
  Mail, 
  Sparkles, 
  Check, 
  X, 
  Lock, 
  AlertCircle,
  KeyRound,
  Shield,
  Edit,
  Trash2,
  Gift,
  Search,
  Filter,
  Download,
  Crown,
  Award,
  Heart,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { UserAccount, UserRole, MembershipTier, Reservation } from '../../types';
import { 
  getStoredUsers, 
  getCurrentUser,
  getStoredReservations,
  adminCreateAccount, 
  adminUpdateUser, 
  adminResetUserPassword, 
  deleteUserAccount, 
  updateUserStatus, 
  adjustUserLoyaltyPoints,
  formatVND
} from '../../services/storage';

export const StaffManagementView: React.FC = () => {
  const currentUser = getCurrentUser();
  const [users, setUsers] = useState<UserAccount[]>(() => getStoredUsers());
  const reservations: Reservation[] = useMemo(() => getStoredReservations(), []);

  // Main Tab
  const [activeTab, setActiveTab] = useState<'all' | 'staff_team' | 'customers' | 'roles_matrix'>('all');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'staff' | 'customer'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [tierFilter, setTierFilter] = useState<'all' | MembershipTier>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [resetPassUser, setResetPassUser] = useState<UserAccount | null>(null);
  const [adjustPointsUser, setAdjustPointsUser] = useState<UserAccount | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserAccount | null>(null);

  // Form states for Add / Edit
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('staff');
  const [formPosition, setFormPosition] = useState('Nhân Viên Phục Vụ Bàn');
  const [formShift, setFormShift] = useState('Ca Chiều - Tối (15:00 - 23:00)');
  const [formTier, setFormTier] = useState<MembershipTier>('Bạc');
  const [formPoints, setFormPoints] = useState(100);
  const [formDietary, setFormDietary] = useState('');
  const [formPassword, setFormPassword] = useState('123456');

  // Specific Action Forms
  const [newPasswordInput, setNewPasswordInput] = useState('123456');
  const [pointsDeltaInput, setPointsDeltaInput] = useState<number>(100);
  const [pointsReasonInput, setPointsReasonInput] = useState('Tri ân khách hàng thân thiết');

  // Feedback notifications
  const [bannerAlert, setBannerAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setBannerAlert({ type, message });
    setTimeout(() => setBannerAlert(null), 4000);
  };

  const refreshUsers = () => {
    setUsers(getStoredUsers());
  };

  // KPIs
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const staffCount = users.filter(u => u.role === 'staff').length;
  const customerCount = users.filter(u => u.role === 'customer').length;
  const activeCount = users.filter(u => u.status !== 'inactive').length;
  const inactiveCount = users.filter(u => u.status === 'inactive').length;

  // Pre-calculate customer stats: bookings count & spent amount
  const customerBookingStats = useMemo(() => {
    const stats: Record<string, { count: number; totalSpent: number }> = {};
    users.forEach(u => {
      const userBookings = reservations.filter(r => 
        (r.userId && r.userId === u.id) ||
        r.customerEmail.toLowerCase() === u.email.toLowerCase() ||
        r.customerPhone.replace(/\s+/g, '') === u.phone.replace(/\s+/g, '')
      );
      const spent = userBookings.reduce((sum, r) => sum + (r.status === 'completed' || r.status === 'seated' ? r.totalAmount : 0), 0);
      stats[u.id] = { count: userBookings.length, totalSpent: spent };
    });
    return stats;
  }, [users, reservations]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Tab filter
      if (activeTab === 'staff_team' && u.role === 'customer') return false;
      if (activeTab === 'customers' && u.role !== 'customer') return false;

      // Role filter
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;

      // Status filter
      if (statusFilter === 'active' && u.status === 'inactive') return false;
      if (statusFilter === 'inactive' && u.status !== 'inactive') return false;

      // Tier filter (for customers or all)
      if (tierFilter !== 'all' && u.membershipTier !== tierFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchPhone = u.phone.includes(q);
        const matchPosition = (u.position || '').toLowerCase().includes(q);
        const matchId = u.id.toLowerCase().includes(q);
        return matchName || matchEmail || matchPhone || matchPosition || matchId;
      }

      return true;
    });
  }, [users, activeTab, roleFilter, statusFilter, tierFilter, searchQuery]);

  // Handle Toggle Active/Inactive Status
  const handleToggleStatus = (targetUser: UserAccount) => {
    if (targetUser.id === currentUser?.id) {
      showAlert('Bạn không thể tự khóa tài khoản Quản trị viên đang đăng nhập!', 'error');
      return;
    }
    const nextStatus = targetUser.status === 'inactive' ? 'active' : 'inactive';
    const updated = updateUserStatus(targetUser.id, nextStatus);
    setUsers(updated);
    showAlert(
      nextStatus === 'active' 
        ? `Đã kích hoạt mở khóa tài khoản "${targetUser.name}".` 
        : `Đã tạm khóa tài khoản "${targetUser.name}". Người dùng này không thể đăng nhập.`
    );
  };

  // Open Create Modal
  const handleOpenAddModal = (presetRole: UserRole = 'staff') => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole(presetRole);
    setFormPosition(
      presetRole === 'admin' 
        ? 'Quản Trị Viên Hệ Thống' 
        : presetRole === 'staff' 
        ? 'Nhân Viên Phục Vụ Bàn' 
        : 'Khách Hàng Thân Thiết'
    );
    setFormShift(presetRole === 'staff' ? 'Ca Chiều - Tối (15:00 - 23:00)' : 'Toàn thời gian (Full-time)');
    setFormTier('Bạc');
    setFormPoints(presetRole === 'customer' ? 100 : 500);
    setFormDietary('');
    setFormPassword('123456');
    setShowAddModal(true);
  };

  // Submit Create Account
  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim()) {
      showAlert('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'error');
      return;
    }

    const res = adminCreateAccount({
      name: formName,
      email: formEmail,
      phone: formPhone,
      role: formRole,
      position: formPosition,
      shift: formShift,
      membershipTier: formTier,
      loyaltyPoints: formPoints,
      dietaryPreferences: formDietary,
      password: formPassword,
    });

    if (!res.success) {
      showAlert(res.message, 'error');
      return;
    }

    refreshUsers();
    setShowAddModal(false);
    showAlert(res.message, 'success');
  };

  // Open Edit Modal
  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormRole(user.role);
    setFormPosition(user.position || '');
    setFormShift(user.shift || 'Toàn thời gian (Full-time)');
    setFormTier(user.membershipTier || 'Bạc');
    setFormPoints(user.loyaltyPoints || 0);
    setFormDietary(user.dietaryPreferences || '');
  };

  // Submit Edit User
  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const res = adminUpdateUser(editingUser.id, {
      name: formName,
      email: formEmail,
      phone: formPhone,
      role: formRole,
      position: formPosition,
      shift: formShift,
      membershipTier: formTier,
      loyaltyPoints: formPoints,
      dietaryPreferences: formDietary,
    });

    if (!res.success) {
      showAlert(res.message, 'error');
      return;
    }

    refreshUsers();
    setEditingUser(null);
    showAlert(res.message, 'success');
  };

  // Submit Reset Password
  const handleSubmitResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassUser) return;
    if (!newPasswordInput.trim()) {
      showAlert('Vui lòng nhập mật khẩu mới!', 'error');
      return;
    }

    const res = adminResetUserPassword(resetPassUser.id, newPasswordInput.trim());
    if (res.success) {
      showAlert(res.message, 'success');
      setResetPassUser(null);
      setNewPasswordInput('123456');
    } else {
      showAlert(res.message, 'error');
    }
  };

  // Submit Adjust Points
  const handleSubmitAdjustPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustPointsUser) return;

    const res = adjustUserLoyaltyPoints(adjustPointsUser.id, pointsDeltaInput, pointsReasonInput);
    if (res.success) {
      showAlert(res.message, 'success');
      refreshUsers();
      setAdjustPointsUser(null);
      setPointsDeltaInput(100);
    } else {
      showAlert(res.message, 'error');
    }
  };

  // Submit Delete Account
  const handleConfirmDelete = () => {
    if (!deleteConfirmUser) return;
    const res = deleteUserAccount(deleteConfirmUser.id);
    if (res.success) {
      showAlert(res.message, 'success');
      refreshUsers();
      setDeleteConfirmUser(null);
    } else {
      showAlert(res.message, 'error');
    }
  };

  // Export Users to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Họ Và Tên', 'Email', 'Số Điện Thoại', 'Vai Trò', 'Vị Trí', 'Ca Làm Việc', 'Hạng Hội Viên', 'Điểm Thưởng', 'Trạng Thái', 'Ngày Tạo'];
    const rows = filteredUsers.map(u => [
      u.id,
      `"${u.name.replace(/"/g, '""')}"`,
      u.email,
      u.phone,
      u.role === 'admin' ? 'Quản Trị Viên' : u.role === 'staff' ? 'Nhân Viên' : 'Khách Hàng',
      `"${(u.position || '').replace(/"/g, '""')}"`,
      `"${(u.shift || '').replace(/"/g, '""')}"`,
      u.membershipTier,
      u.loyaltyPoints,
      u.status === 'inactive' ? 'Tạm Khóa' : 'Hoạt Động',
      new Date(u.createdAt).toLocaleDateString('vi-VN')
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_Sach_Tai_Khoan_LeGourmet_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showAlert('Đã xuất thành công danh sách tài khoản định dạng CSV!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 text-stone-100 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Phân Hệ Quản Trị Cấp Cao (Admin Executive)</span>
          </div>
          <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-amber-100">
            Quản Lý Toàn Bộ Tài Khoản & Phân Quyền
          </h2>
          <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
            Kiểm soát tập trung toàn bộ danh sách Quản trị viên, Đội ngũ nhân viên vận hành các ca và Khách hàng hội viên VIP. Cấp mật khẩu, điều chỉnh điểm thưởng và thiết lập quyền truy cập bảo mật.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            title="Xuất danh sách sang file Excel / CSV"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Xuất CSV</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddModal('staff')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer transition"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm Tài Khoản Mới</span>
          </button>
        </div>
      </div>

      {/* Real-time Alert Banner */}
      {bannerAlert && (
        <div className={`p-4 rounded-2xl flex items-center justify-between shadow-md text-xs font-bold animate-fade-in ${
          bannerAlert.type === 'success' 
            ? 'bg-emerald-500 text-white border border-emerald-400' 
            : 'bg-rose-500 text-white border border-rose-400'
        }`}>
          <div className="flex items-center gap-2">
            {bannerAlert.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{bannerAlert.message}</span>
          </div>
          <button type="button" onClick={() => setBannerAlert(null)} className="opacity-80 hover:opacity-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold">
            <span>TỔNG TÀI KHOẢN</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-stone-900">{totalUsers}</span>
            <span className="text-xs text-stone-500 ml-1.5 font-medium">tài khoản</span>
          </div>
          <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{activeCount} đang hoạt động</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-amber-700 font-bold">
            <span>QUẢN TRỊ VIÊN (ADMIN)</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-amber-700">{adminCount}</span>
            <span className="text-xs text-stone-500 ml-1.5 font-medium">chủ & quản lý</span>
          </div>
          <div className="text-[11px] text-stone-500 font-medium">
            Toàn quyền vận hành & tài chính
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-blue-700 font-bold">
            <span>NHÂN VIÊN (STAFF)</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-blue-700">{staffCount}</span>
            <span className="text-xs text-stone-500 ml-1.5 font-medium">nhân sự sảnh & bếp</span>
          </div>
          <div className="text-[11px] text-stone-500 font-medium">
            Tiếp tân, phục vụ, thu ngân, KDS
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-purple-700 font-bold">
            <span>KHÁCH HÀNG THÀNH VIÊN</span>
            <Crown className="w-4 h-4 text-purple-600" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-purple-700">{customerCount}</span>
            <span className="text-xs text-stone-500 ml-1.5 font-medium">thực khách</span>
          </div>
          <div className="text-[11px] text-purple-700 font-medium">
            Tích lũy điểm & hạng VIP
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-rose-700 font-bold">
            <span>TÀI KHOẢN TẠM KHÓA</span>
            <Lock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-rose-700">{inactiveCount}</span>
            <span className="text-xs text-stone-500 ml-1.5 font-medium">bị chặn truy cập</span>
          </div>
          <div className="text-[11px] text-stone-500 font-medium">
            Có thể mở khóa bất kỳ lúc nào
          </div>
        </div>
      </div>

      {/* Navigation Tabs Switcher */}
      <div className="flex flex-wrap bg-white p-1.5 rounded-2xl border border-stone-200 shadow-xs gap-1.5 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setActiveTab('all');
            setRoleFilter('all');
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition ${
            activeTab === 'all'
              ? 'bg-amber-600 text-stone-950 shadow-xs'
              : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Tất Cả ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('staff_team');
            setRoleFilter('all');
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition ${
            activeTab === 'staff_team'
              ? 'bg-amber-600 text-stone-950 shadow-xs'
              : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Đội Ngũ Nhân Sự ({adminCount + staffCount})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('customers');
            setRoleFilter('customer');
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition ${
            activeTab === 'customers'
              ? 'bg-amber-600 text-stone-950 shadow-xs'
              : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Khách Hàng & VIP ({customerCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roles_matrix')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition ${
            activeTab === 'roles_matrix'
              ? 'bg-amber-600 text-stone-950 shadow-xs'
              : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Ma Trận Quyền Hạn (RBAC)</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR (Active for Tab 1, 2, 3) */}
      {activeTab !== 'roles_matrix' && (
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Role Filter (only if on 'all' tab) */}
            {activeTab === 'all' && (
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Chỉ Quản Trị Viên (Admin)</option>
                <option value="staff">Chỉ Nhân Viên (Staff)</option>
                <option value="customer">Chỉ Khách Hàng (Customer)</option>
              </select>
            )}

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã tạm khóa</option>
            </select>

            {/* Membership Tier Filter */}
            {(activeTab === 'customers' || activeTab === 'all') && (
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as any)}
                className="bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Tất cả hạng VIP</option>
                <option value="Kim Cương">💎 Kim Cương</option>
                <option value="Vàng">🥇 Vàng</option>
                <option value="Bạc">🥈 Bạc</option>
              </select>
            )}

            {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all' || tierFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                  setTierFilter('all');
                }}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 px-2 py-1 cursor-pointer"
              >
                Đặt lại
              </button>
            )}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, email, SĐT, chức vụ..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 focus:bg-white focus:border-amber-600 rounded-xl text-xs text-stone-900 focus:outline-hidden transition font-medium"
            />
          </div>
        </div>
      )}

      {/* USER LIST CARDS (GRID VIEW) */}
      {activeTab !== 'roles_matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-500 text-sm space-y-3">
              <Users className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="font-bold text-stone-700">Không tìm thấy tài khoản nào khớp với bộ lọc.</p>
              <p className="text-xs text-stone-400">Vui lòng thử tìm kiếm với từ khóa khác hoặc đặt lại bộ lọc.</p>
            </div>
          ) : (
            filteredUsers.map(user => {
              const isAdmin = user.role === 'admin';
              const isStaff = user.role === 'staff';
              const isCustomer = user.role === 'customer';
              const isActive = user.status !== 'inactive';
              const stats = customerBookingStats[user.id] || { count: 0, totalSpent: 0 };
              const isSelf = user.id === currentUser?.id;

              return (
                <div
                  key={user.id}
                  className={`bg-white rounded-3xl border p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                    !isActive 
                      ? 'border-rose-200 bg-rose-50/20 opacity-80' 
                      : isAdmin 
                      ? 'border-amber-300 hover:border-amber-500 shadow-amber-900/5' 
                      : 'border-stone-200 hover:border-amber-400'
                  }`}
                >
                  <div>
                    {/* Top Row: Avatar + Name + Role Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-stone-200 shadow-xs"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-2xl font-extrabold flex items-center justify-center text-sm shadow-xs ${
                            isAdmin 
                              ? 'bg-amber-500 text-stone-950' 
                              : isStaff 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-stone-800 text-amber-300'
                          }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-stone-900 text-sm">{user.name}</h3>
                            {isSelf && (
                              <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                                Bạn
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold mt-0.5 text-stone-600">
                            {user.position || (isAdmin ? 'Tổng Quản Lý' : isStaff ? 'Nhân Viên Sảnh' : 'Khách Hàng')}
                          </p>
                        </div>
                      </div>

                      {/* Role Pill */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                        isAdmin 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                          : isStaff 
                          ? 'bg-blue-100 text-blue-900 border border-blue-300' 
                          : 'bg-purple-100 text-purple-900 border border-purple-300'
                      }`}>
                        {isAdmin ? 'Quản Trị' : isStaff ? 'Nhân Viên' : 'Khách Hàng'}
                      </span>
                    </div>

                    {/* Contact Info & Details */}
                    <div className="mt-4 space-y-1.5 text-xs text-stone-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="font-mono">{user.phone}</span>
                      </div>

                      {/* Staff Specific: Shift */}
                      {(isAdmin || isStaff) && (
                        <div className="flex items-center gap-2 text-stone-700">
                          <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{user.shift || 'Toàn thời gian (Full-time)'}</span>
                        </div>
                      )}

                      {/* Customer Specific: Tier, Loyalty Points & Bookings */}
                      {isCustomer && (
                        <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 mt-2">
                          <div className="bg-stone-50 p-2 rounded-xl border border-stone-150">
                            <span className="text-[10px] text-stone-400 block font-bold">HẠNG THÀNH VIÊN</span>
                            <span className="font-extrabold text-amber-700 text-xs flex items-center gap-1">
                              <Crown className="w-3 h-3 text-amber-500" />
                              {user.membershipTier} ({user.loyaltyPoints}đ)
                            </span>
                          </div>
                          <div className="bg-stone-50 p-2 rounded-xl border border-stone-150">
                            <span className="text-[10px] text-stone-400 block font-bold">LỊCH SỬ ĐẶT BÀN</span>
                            <span className="font-extrabold text-stone-800 text-xs">
                              {stats.count} lượt {stats.totalSpent > 0 && `• ${formatVND(stats.totalSpent)}`}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Dietary Preferences if any */}
                      {user.dietaryPreferences && (
                        <div className="text-[11px] text-stone-500 bg-amber-50/60 p-2 rounded-xl border border-amber-200/50 mt-1 line-clamp-2">
                          <strong className="text-amber-800">Ghi chú:</strong> {user.dietaryPreferences}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status Bar */}
                  <div className="pt-3 border-t border-stone-100 flex flex-col gap-2.5">
                    {/* Status indicator */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="text-[11px] font-semibold text-stone-600">
                          {isActive ? 'Đang hoạt động' : 'Tạm khóa truy cập'}
                        </span>
                      </div>

                      <span className="text-[10px] text-stone-400">
                        Tạo ngày {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    {/* Action buttons toolbar */}
                    <div className="flex items-center justify-between gap-1.5 pt-1">
                      {/* Left: Quick Actions (Edit, Password, Points) */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setResetPassUser(user);
                            setNewPasswordInput('123456');
                          }}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
                          title="Cấp lại mật khẩu"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                        </button>

                        {isCustomer && (
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustPointsUser(user);
                              setPointsDeltaInput(100);
                              setPointsReasonInput('Tặng điểm thành viên thân thiết');
                            }}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition cursor-pointer"
                            title="Điều chỉnh điểm thưởng VIP"
                          >
                            <Gift className="w-3.5 h-3.5 text-amber-600" />
                          </button>
                        )}

                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmUser(user)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Right: Lock / Unlock Button */}
                      {!isSelf && (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          className={`text-[11px] font-bold px-3 py-1 rounded-xl cursor-pointer transition ${
                            isActive
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {isActive ? 'Khóa Tài Khoản' : 'Mở Khóa'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 4: RBAC ROLES & PERMISSIONS MATRIX */}
      {activeTab === 'roles_matrix' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h3 className="font-serif-heading font-bold text-xl text-stone-900">
              Ma Trận Phân Quyền & Bảo Mật Hệ Thống (RBAC Matrix)
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
              Quy định rõ ràng phạm vi phân quyền, bảo vệ tài chính mật và phân định chức trách vận hành giữa Quản Trị Viên (Admin), Nhân Viên Vận Hành (Staff) và Khách Hàng Hội Viên (Customer).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-700 uppercase text-[11px] font-extrabold border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4">Chức Năng Nghiệp Vụ</th>
                  <th className="py-3.5 px-4 text-center">Quản Trị Viên (Admin)</th>
                  <th className="py-3.5 px-4 text-center">Nhân Viên (Staff)</th>
                  <th className="py-3.5 px-4 text-center">Khách Hàng (Customer)</th>
                  <th className="py-3.5 px-4">Quy Định Bảo Mật & Giám Sát</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-stone-900">Đặt Bàn Online & Thực Đơn Chọn Trước</td>
                  <td className="py-3.5 px-4 text-center"><span className="text-emerald-600 font-bold">✓ Toàn quyền</span></td>
                  <td className="py-3.5 px-4 text-center"><span className="text-emerald-600 font-bold">✓ Toàn quyền</span></td>
                  <td className="py-3.5 px-4 text-center"><span className="text-emerald-600 font-bold">✓ Toàn quyền</span></td>
                  <td className="py-3.5 px-4 text-stone-500">Mọi đối tượng đều có thể đặt bàn và nhận mã vé QR</td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-bold text-stone-900">Quét Mã QR & Check-in Khách Vào Bàn</td>
                  <td className="py-3.5 px-4 text-center"><span className="text-emerald-600 font-bold">✓ Toàn quyền</span></td>
                  <td className="py-3.5 px-4 text-center"><span className="text-emerald-600 font-bold">✓ Toàn quyền</span></td>
                  <td className="py-3.5 px-4 text-center"><span className="text-rose-500 font-bold">✕ Không được</span></td>
                  <td className="py-3.5 px-4 text-stone-500">Lễ tân và nhân viên phục vụ xác nhận khách đến quầy</td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-bold text-stone-900">Điều Phối Sơ Đồ Bàn (Table Map Live)</td>
                  <td className="py-3.5 px-4 text-center"><span className="text-emerald-600 font-bold">✓ Toàn quyền</span></td>
                  <td className="py-3.5 px-4 text-center"><span className="text-emerald-600 font-bold">✓ Toàn quyền</span></td>
                  <td className="py-3.5 px-4 text-center"><span className="text-rose-500 font-bold">✕ Không được</span></td>
                  <td className="py-3.5 px-4 text-stone-500">Cập nhật bàn: Trống, Đang dùng bữa, Cần dọn dẹp</td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-bold text-stone-900">Màn Hình Điều Phối Bếp (KDS Station)</td>
                  <td className="py-3.5 px-4 text-center"><span className="text-emerald-600 font-bold">✓ Toàn quyền</span></td>
                  <td className="py-3.5 px-4 text-center"><span className="text-emerald-600 font-bold">✓ Toàn quyền</span></td>
                  <td className="py-3.5 px-4 text-center"><span className="text-rose-500 font-bold">✕ Không được</span></td>
                  <td className="py-3.5 px-4 text-stone-500">Bếp trưởng, phụ bếp và bartender điều phối ra món</td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-bold text-stone-900">Quản Lý Kho & Định Lượng BOM Cost Control</td>
                  <td className="py-3.5 px-4 text-center"><span className="text-emerald-600 font-bold">✓ Toàn quyền</span></td>
                  <td className="py-3.5 px-4 text-center"><span className="text-rose-500 font-bold">✕ Không được</span></td>
                  <td className="py-3.5 px-4 text-center"><span className="text-rose-500 font-bold">✕ Không được</span></td>
                  <td className="py-3.5 px-4 text-stone-500">Chỉ Quản lý được quản trị chi phí giá vốn và nhập kho</td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-bold text-stone-900">Báo Cáo Doanh Thu Tài Chính Mật</td>
                  <td className="py-3.5 px-4 text-center"><span className="text-emerald-600 font-bold">✓ Toàn quyền</span></td>
                  <td className="py-3.5 px-4 text-center"><span className="text-rose-500 font-bold">✕ Không được</span></td>
                  <td className="py-3.5 px-4 text-center"><span className="text-rose-500 font-bold">✕ Không được</span></td>
                  <td className="py-3.5 px-4 text-stone-500">Bảo mật tuyệt đối doanh thu ngày, tháng và biểu đồ kinh doanh</td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-bold text-stone-900">Quản Lý Thực Đơn & Điều Chỉnh Giá</td>
                  <td className="py-3.5 px-4 text-center"><span className="text-emerald-600 font-bold">✓ Toàn quyền</span></td>
                  <td className="py-3.5 px-4 text-center"><span className="text-rose-500 font-bold">✕ Không được</span></td>
                  <td className="py-3.5 px-4 text-center"><span className="text-rose-500 font-bold">✕ Không được</span></td>
                  <td className="py-3.5 px-4 text-stone-500">Thêm món mới, sửa mô tả món ăn, thay đổi đơn giá bán</td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-bold text-stone-900">Quản Trị Toàn Bộ Tài Khoản & Mật Khẩu</td>
                  <td className="py-3.5 px-4 text-center"><span className="text-emerald-600 font-bold">✓ Toàn quyền</span></td>
                  <td className="py-3.5 px-4 text-center"><span className="text-rose-500 font-bold">✕ Không được</span></td>
                  <td className="py-3.5 px-4 text-center"><span className="text-rose-500 font-bold">✕ Không được</span></td>
                  <td className="py-3.5 px-4 text-stone-500">Chỉ Quản trị viên trưởng có quyền thêm, sửa, xóa, khóa tài khoản</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: ADD ACCOUNT MODAL (ADMIN / STAFF / CUSTOMER)           */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl text-stone-100 space-y-5 my-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <UserPlus className="w-5 h-5 stroke-[2.5]" />
                <span>Tạo Tài Khoản Mới Cho Hệ Thống</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-200 cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate} className="space-y-4 text-xs">
              {/* Role selection tab buttons */}
              <div>
                <label className="block text-stone-300 font-bold mb-1.5">1. Chọn loại tài khoản cần tạo:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormRole('staff');
                      setFormPosition('Nhân Viên Phục Vụ Bàn');
                    }}
                    className={`py-2 px-3 rounded-xl font-bold border transition cursor-pointer text-center ${
                      formRole === 'staff'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-750'
                    }`}
                  >
                    Nhân Viên (Staff)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormRole('admin');
                      setFormPosition('Quản Trị Viên Hệ Thống');
                    }}
                    className={`py-2 px-3 rounded-xl font-bold border transition cursor-pointer text-center ${
                      formRole === 'admin'
                        ? 'bg-amber-600 text-stone-950 border-amber-500 shadow-sm'
                        : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-750'
                    }`}
                  >
                    Quản Trị (Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormRole('customer');
                      setFormPosition('Khách Hàng Hội Viên');
                    }}
                    className={`py-2 px-3 rounded-xl font-bold border transition cursor-pointer text-center ${
                      formRole === 'customer'
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                        : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-750'
                    }`}
                  >
                    Khách Hàng (VIP)
                  </button>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-3 pt-1 border-t border-stone-800">
                <label className="block text-stone-300 font-bold">2. Thông tin cá nhân & Đăng nhập:</label>
                <div>
                  <label className="block text-stone-400 mb-1">Họ và Tên (*):</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="VD: Lê Hoàng Nam"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 mb-1">Email đăng nhập (*):</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="nam.le@legourmet.vn"
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-100 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1">Số điện thoại (*):</label>
                    <input
                      type="tel"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="0912345678"
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-100 focus:outline-hidden focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Mật khẩu khởi tạo (*):</label>
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-100 font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Conditional fields: Staff & Admin */}
              {(formRole === 'staff' || formRole === 'admin') && (
                <div className="space-y-3 pt-2 border-t border-stone-800">
                  <label className="block text-stone-300 font-bold">3. Thông tin nghiệp vụ & Ca trực:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-400 mb-1">Vị trí / Chức danh:</label>
                      <input
                        type="text"
                        required
                        value={formPosition}
                        onChange={(e) => setFormPosition(e.target.value)}
                        placeholder="VD: Tiếp Tân & Lễ Tân / Sommelier"
                        className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-400 mb-1">Ca làm việc phân công:</label>
                      <select
                        value={formShift}
                        onChange={(e) => setFormShift(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-hidden focus:border-amber-500"
                      >
                        <option value="Ca Sáng - Trưa (10:00 - 16:30)">Ca Sáng - Trưa (10:00 - 16:30)</option>
                        <option value="Ca Chiều - Tối (15:00 - 23:00)">Ca Chiều - Tối (15:00 - 23:00)</option>
                        <option value="Toàn thời gian (Full-time)">Toàn thời gian (Full-time)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional fields: Customer VIP */}
              {formRole === 'customer' && (
                <div className="space-y-3 pt-2 border-t border-stone-800">
                  <label className="block text-stone-300 font-bold">3. Thiết lập hội viên VIP & Điểm thưởng:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-400 mb-1">Hạng thành viên:</label>
                      <select
                        value={formTier}
                        onChange={(e) => setFormTier(e.target.value as any)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-hidden focus:border-amber-500 font-bold text-amber-400"
                      >
                        <option value="Bạc">🥈 Hạng Bạc (Silver)</option>
                        <option value="Vàng">🥇 Hạng Vàng (Gold)</option>
                        <option value="Kim Cương">💎 Hạng Kim Cương (Diamond VIP)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-400 mb-1">Điểm thưởng ban đầu:</label>
                      <input
                        type="number"
                        min="0"
                        value={formPoints}
                        onChange={(e) => setFormPoints(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-hidden focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1">Sở thích ẩm thực & lưu ý dị ứng (tùy chọn):</label>
                    <input
                      type="text"
                      value={formDietary}
                      onChange={(e) => setFormDietary(e.target.value)}
                      placeholder="VD: Dị ứng đậu phộng, thích vang đỏ Bordeaux, ăn chay ngày rằm..."
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 font-medium cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold cursor-pointer shadow-lg"
                >
                  Xác Nhận Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT ACCOUNT MODAL                                    */}
      {/* ============================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl text-stone-100 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Edit className="w-4 h-4 stroke-[2.5]" />
                <span>Chỉnh Sửa Thông Tin: {editingUser.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-stone-400 hover:text-stone-200 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Họ và Tên (*):</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2 text-stone-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Email (*):</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2 text-stone-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Số điện thoại (*):</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2 text-stone-100 focus:outline-hidden focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Vai trò quyền hạn:</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-hidden focus:border-amber-500 font-bold text-amber-300"
                  >
                    <option value="admin">Quản Trị Viên (Admin)</option>
                    <option value="staff">Nhân Viên Vận Hành (Staff)</option>
                    <option value="customer">Khách Hàng (Customer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Vị trí / Chức vụ:</label>
                  <input
                    type="text"
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    placeholder="VD: Tiếp Tân & Lễ Tân"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {formRole !== 'customer' ? (
                <div>
                  <label className="block text-stone-400 mb-1">Ca làm việc:</label>
                  <select
                    value={formShift}
                    onChange={(e) => setFormShift(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="Ca Sáng - Trưa (10:00 - 16:30)">Ca Sáng - Trưa (10:00 - 16:30)</option>
                    <option value="Ca Chiều - Tối (15:00 - 23:00)">Ca Chiều - Tối (15:00 - 23:00)</option>
                    <option value="Toàn thời gian (Full-time)">Toàn thời gian (Full-time)</option>
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 mb-1">Hạng hội viên:</label>
                    <select
                      value={formTier}
                      onChange={(e) => setFormTier(e.target.value as any)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-hidden focus:border-amber-500 font-bold text-amber-400"
                    >
                      <option value="Bạc">🥈 Hạng Bạc</option>
                      <option value="Vàng">🥇 Hạng Vàng</option>
                      <option value="Kim Cương">💎 Hạng Kim Cương</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-400 mb-1">Điểm tích lũy:</label>
                    <input
                      type="number"
                      value={formPoints}
                      onChange={(e) => setFormPoints(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-stone-400 mb-1">Ghi chú sở thích ẩm thực / Dị ứng:</label>
                <textarea
                  rows={2}
                  value={formDietary}
                  onChange={(e) => setFormDietary(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 font-medium cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold cursor-pointer shadow-lg"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: RESET PASSWORD MODAL                                   */}
      {/* ============================================================== */}
      {resetPassUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-2xl text-stone-100 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <span>Cấp Lại Mật Khẩu Đăng Nhập</span>
              </div>
              <button
                type="button"
                onClick={() => setResetPassUser(null)}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700 text-xs">
              <p className="text-stone-300">
                Tài khoản: <strong className="text-amber-300">{resetPassUser.name}</strong> ({resetPassUser.email})
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Vai trò: <strong className="uppercase">{resetPassUser.role}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmitResetPassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Mật khẩu mới cấp cho người dùng:</label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 font-mono text-sm focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNewPasswordInput('123456')}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  ⚡ Đặt về mật khẩu mặc định (123456)
                </button>
                <span className="text-stone-600">•</span>
                <button
                  type="button"
                  onClick={() => setNewPasswordInput(`LG@${Math.floor(1000 + Math.random() * 9000)}`)}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  🎲 Sinh mật khẩu ngẫu nhiên
                </button>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setResetPassUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 font-medium cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold cursor-pointer shadow-lg"
                >
                  Cập Nhật Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: ADJUST LOYALTY POINTS (VIP REWARDS)                   */}
      {/* ============================================================== */}
      {adjustPointsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-2xl text-stone-100 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Gift className="w-5 h-5 text-amber-500" />
                <span>Điều Chỉnh Điểm Thưởng VIP</span>
              </div>
              <button
                type="button"
                onClick={() => setAdjustPointsUser(null)}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-stone-800/80 p-3.5 rounded-xl border border-stone-700 text-xs space-y-1">
              <p className="text-stone-300">
                Khách hàng: <strong className="text-amber-300">{adjustPointsUser.name}</strong>
              </p>
              <div className="flex items-center gap-3 text-stone-400">
                <span>Hạng: <strong className="text-amber-400 font-bold">{adjustPointsUser.membershipTier}</strong></span>
                <span>•</span>
                <span>Điểm hiện tại: <strong className="text-amber-400 font-mono font-bold">{adjustPointsUser.loyaltyPoints}đ</strong></span>
              </div>
            </div>

            <form onSubmit={handleSubmitAdjustPoints} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">
                  Số điểm điều chỉnh (Nhập số dương để cộng, số âm để trừ):
                </label>
                <input
                  type="number"
                  required
                  value={pointsDeltaInput}
                  onChange={(e) => setPointsDeltaInput(parseInt(e.target.value, 10) || 0)}
                  placeholder="VD: 200 hoặc -100"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 font-mono text-base font-bold focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Lý do điều chỉnh điểm:</label>
                <input
                  type="text"
                  required
                  value={pointsReasonInput}
                  onChange={(e) => setPointsReasonInput(e.target.value)}
                  placeholder="VD: Tri ân sinh nhật / Bồi hoàn dịch vụ"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setAdjustPointsUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 font-medium cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold cursor-pointer shadow-lg"
                >
                  Xác Nhận Lưu Điểm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: CONFIRM DELETE MODAL                                   */}
      {/* ============================================================== */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-stone-900 border border-rose-900/60 rounded-3xl p-6 w-full max-w-md shadow-2xl text-stone-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h4 className="font-bold text-base text-rose-200">Xác Nhận Xóa Tài Khoản</h4>
                <span className="text-[11px] text-stone-400">Hành động này không thể hoàn tác</span>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed bg-stone-800/80 p-3 rounded-xl border border-stone-700">
              Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của <strong>"{deleteConfirmUser.name}"</strong> ({deleteConfirmUser.email}) khỏi hệ thống nhà hàng không?
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 font-medium text-xs cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-lg"
              >
                Đồng Ý Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
