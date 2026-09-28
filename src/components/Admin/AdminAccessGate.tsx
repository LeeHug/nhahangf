import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  LogIn, 
  ArrowLeft, 
  User, 
  KeyRound, 
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  LogOut
} from 'lucide-react';
import { UserAccount } from '../../types';
import { loginUser } from '../../services/storage';

interface AdminAccessGateProps {
  currentUser: UserAccount | null;
  onBackToBooking: () => void;
  onSuccessAdminLogin: (adminUser: UserAccount) => void;
  onLogoutAndSwitch: () => void;
}

export const AdminAccessGate: React.FC<AdminAccessGateProps> = ({
  currentUser,
  onBackToBooking,
  onSuccessAdminLogin,
  onLogoutAndSwitch,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If user is logged in as a normal customer
  const isCustomer = currentUser && currentUser.role === 'customer';

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Vui lòng nhập Email hoặc Số điện thoại của Quản trị viên/Nhân viên!');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu quản trị!');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginUser(identifier.trim(), password);
      setIsLoading(false);

      if (!res.success || !res.user) {
        setErrorMessage(res.message || 'Tài khoản hoặc mật khẩu không chính xác!');
        return;
      }

      // Check role authorization
      if (res.user.role !== 'admin' && res.user.role !== 'staff') {
        setErrorMessage(
          `Tài khoản "${res.user.name}" có vai trò là Khách Hàng (Customer), không được cấp quyền truy cập Khu Quản Trị Nhà Hàng!`
        );
        return;
      }

      // Successful admin login
      onSuccessAdminLogin(res.user);
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-stone-100 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {isCustomer ? (
          /* Case: Logged in but is a Customer (Access Denied) */
          <div className="space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
              <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider border border-rose-500/30">
                403 Forbidden • Hạn Chế Quyền Hạn
              </span>
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-stone-100">
                Khu Vực Quản Trị Nhà Hàng Đã Được Bảo Vệ
              </h2>
              <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
                Tài khoản hiện tại của bạn là <strong className="text-stone-200">{currentUser.name}</strong> (<span className="text-amber-400 font-semibold">Khách Hàng</span>). Bạn không có quyền xem dữ liệu quản trị nội bộ, sơ đồ bàn, báo cáo doanh thu hay chỉnh sửa đặt bàn của khách khác.
              </p>
            </div>

            {/* Account Card */}
            <div className="bg-stone-800/80 border border-stone-700/80 rounded-2xl p-4 max-w-md mx-auto text-left flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-500/40 text-amber-300 font-bold flex items-center justify-center">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-stone-200">{currentUser.name}</p>
                  <p className="text-[11px] text-stone-400">{currentUser.email}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-stone-700 text-stone-300 border border-stone-600">
                Vai trò: Khách hàng
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={onBackToBooking}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay Lại Đặt Bàn Khách Hàng</span>
              </button>
            </div>
          </div>
        ) : (
          /* Case: Guest / Not Logged In (Prompt Admin Login) */
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
                Xác Thực Quyền Quản Lý & Vận Hành
              </span>
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-stone-100">
                Đăng Nhập Cổng Quản Trị Nhà Hàng
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
                Khu vực giới hạn dành riêng cho Ban Quản Lý (Admin) và Nhân Viên (Staff). Vui lòng nhập thông tin xác thực chính thức để truy cập.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  Email hoặc SĐT Quản Trị / Nhân Viên
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Nhập email hoặc số điện thoại quản trị / nhân viên"
                    className="w-full bg-stone-800/90 border border-stone-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  Mật Khẩu
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu (Mặc định: 123456)"
                    className="w-full bg-stone-800/90 border border-stone-700 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
                  <span>{isLoading ? 'Đang xác thực...' : 'Đăng Nhập Cổng Vận Hành'}</span>
                </button>

                <button
                  type="button"
                  onClick={onBackToBooking}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700 text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Về Trang Khách Hàng</span>
                </button>
              </div>
            </form>

            {/* Quick Demo Test Accounts for Admin & Staff */}
            <div className="mt-6 pt-5 border-t border-stone-800">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Tài Khoản Đăng Nhập Thử Nghiệm Nhanh (1-Chạm)</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('admin@legourmet.vn');
                    setPassword('123456');
                  }}
                  className="p-3 rounded-xl bg-stone-800/80 hover:bg-stone-750 border border-amber-500/30 text-stone-200 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-400 group-hover:text-amber-300">Quản Trị Viên (Admin)</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">Toàn Quyền</span>
                  </div>
                  <div className="text-[11px] text-stone-400">Trần Minh Đức • admin@legourmet.vn</div>
                  <div className="text-[10px] text-stone-500 mt-1">Báo cáo doanh thu, nhân sự, thực đơn, cấu hình bàn</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('staff@legourmet.vn');
                    setPassword('123456');
                  }}
                  className="p-3 rounded-xl bg-stone-800/80 hover:bg-stone-750 border border-blue-500/30 text-stone-200 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-blue-400 group-hover:text-blue-300">Nhân Viên (Staff)</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">Tiếp Tân & Bàn</span>
                  </div>
                  <div className="text-[11px] text-stone-400">Nguyễn Văn An • staff@legourmet.vn</div>
                  <div className="text-[10px] text-stone-500 mt-1">Check-in khách, sơ đồ bàn, gọi thêm món, thu ngân bill</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
