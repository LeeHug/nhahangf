import React, { useState, useRef, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  CalendarClock, 
  ShieldCheck, 
  Mail, 
  Search, 
  Sparkles, 
  User, 
  LogIn, 
  LogOut, 
  Gift, 
  Heart, 
  Clock, 
  Award, 
  ChevronDown,
  Bell,
  Users
} from 'lucide-react';
import { UserAccount } from '../types';

interface NavbarProps {
  currentView: 'booking' | 'admin';
  onViewChange: (view: 'booking' | 'admin') => void;
  onOpenLookup: () => void;
  onOpenEmailInbox: () => void;
  unreadEmailsCount: number;
  todayBookingsCount: number;
  currentUser: UserAccount | null;
  onOpenAuthModal: () => void;
  onOpenUserProfile: (tab?: 'history' | 'rewards' | 'favorites' | 'profile') => void;
  onLogout: () => void;
  onOpenTableService?: () => void;
  onOpenAdminTab?: (tab: 'staff' | 'reservations' | 'tables' | 'kds' | 'inventory' | 'feedback' | 'reports' | 'menu') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onOpenLookup,
  onOpenEmailInbox,
  unreadEmailsCount,
  todayBookingsCount,
  currentUser,
  onOpenAuthModal,
  onOpenUserProfile,
  onLogout,
  onOpenTableService,
  onOpenAdminTab,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isAdminOrStaff = currentUser?.role === 'admin' || currentUser?.role === 'staff';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100 shadow-md w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 w-full">
          {/* Brand Logo & Name */}
          <div 
            onClick={() => onViewChange('booking')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 min-w-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-900/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 text-stone-950 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-serif-heading text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-stone-100 whitespace-nowrap">
                  <span className="hidden sm:inline">Le Gourmet Bistro</span>
                  <span className="sm:hidden">Le Gourmet</span>
                </span>
                <span className="hidden 2xl:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                  <Sparkles className="w-2.5 h-2.5 mr-1 text-amber-400" /> Fine Dining
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden 2xl:block whitespace-nowrap leading-none mt-1 tracking-wide">
                Ẩm thực thượng hạng &amp; Đặt bàn trực tuyến
              </p>
            </div>
          </div>

          {/* Main Navigation Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* View Mode Toggle: Đặt Bàn vs Quản Trị Nhà Hàng */}
            <div className="flex bg-stone-800/90 p-0.5 sm:p-1 rounded-xl border border-stone-700/60 shadow-inner">
              <button
                id="nav-booking-mode-btn"
                onClick={() => onViewChange('booking')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  currentView === 'booking'
                    ? 'bg-amber-600 text-stone-950 font-bold shadow-md shadow-amber-900/40'
                    : 'text-stone-300 hover:text-stone-100 hover:bg-stone-700/50'
                }`}
                title="Chế độ Đặt Bàn Trực Tuyến"
              >
                <CalendarClock className="w-4 h-4 shrink-0" />
                <span className="hidden xl:inline whitespace-nowrap">Đặt Bàn</span>
              </button>

              {/* Only show Admin tab in navbar if logged in as Admin/Staff OR actively in admin view */}
              {(isAdminOrStaff || currentView === 'admin') && (
                <button
                  id="nav-admin-mode-btn"
                  onClick={() => onViewChange('admin')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
                    currentView === 'admin'
                      ? 'bg-amber-600 text-stone-950 font-bold shadow-md shadow-amber-900/40'
                      : 'text-stone-300 hover:text-stone-100 hover:bg-stone-700/50'
                  }`}
                  title="Cổng Quản Trị Nhà Hàng (Dành cho Quản lý & Nhân viên)"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="hidden xl:inline whitespace-nowrap">Quản Trị</span>
                  {todayBookingsCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold rounded-full bg-emerald-500 text-stone-950">
                      {todayBookingsCount}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Phục Vụ Tại Bàn button */}
            {onOpenTableService && (
              <button
                id="table-self-service-btn"
                onClick={onOpenTableService}
                className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
                title="Cổng tự phục vụ & gọi nhân viên tại bàn"
              >
                <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
                <span className="hidden xl:inline whitespace-nowrap">Phục Vụ Tại Bàn</span>
              </button>
            )}

            {/* Tra cứu đặt bàn button */}
            <button
              id="lookup-reservation-btn"
              onClick={onOpenLookup}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-stone-100 border border-stone-700/60 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Tra cứu mã đặt bàn"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline whitespace-nowrap">Tra cứu</span>
            </button>

            {/* Email Logs Button - Only visible on wide desktop (>= 1280px) to authenticated Admin/Staff */}
            {isAdminOrStaff && onOpenEmailInbox && (
              <button
                id="email-inbox-btn"
                onClick={onOpenEmailInbox}
                className="hidden 2xl:flex p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-stone-100 border border-stone-700/60 transition-colors relative items-center gap-1.5 text-xs font-medium"
                title="Hộp thư email tự động đã gửi (Chỉ Ban Quản Lý)"
              >
                <Mail className="w-4 h-4 text-amber-400" />
                <span className="whitespace-nowrap">Nhật Ký Email</span>
                {unreadEmailsCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center">
                    {unreadEmailsCount}
                  </span>
                )}
              </button>
            )}

            {/* USER ACCOUNT SECTION */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  id="user-menu-trigger-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 border border-amber-500/40 transition-all text-xs font-medium text-stone-200 shrink-0 cursor-pointer"
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-amber-400/40 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-600 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* User text details: shown cleanly on 2xl, compact on xl, icon-only on < xl */}
                  <div className="hidden xl:block text-left max-w-[130px] 2xl:max-w-[170px]">
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-stone-100 leading-tight whitespace-nowrap truncate" title={currentUser.name}>
                        {currentUser.name}
                      </p>
                      {isAdminOrStaff && (
                        <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[8px] font-extrabold uppercase shrink-0">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-amber-400 flex items-center gap-1 leading-tight whitespace-nowrap truncate">
                      <span>{currentUser.membershipTier}</span> • <span>{currentUser.loyaltyPoints}đ</span>
                    </p>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-0.5" />
                </button>

                {/* Dropdown Menu - fully responsive positioning */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl py-2 z-50 text-stone-200 animate-fade-in divide-y divide-stone-800">
                    <div className="px-4 py-3 bg-stone-850/60">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-stone-100 truncate">{currentUser.name}</p>
                        {isAdminOrStaff && (
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-amber-500 text-stone-950 uppercase">
                            Quản Trị
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 truncate">{currentUser.email}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-700/60">
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <Award className="w-3 h-3" /> Hạng {currentUser.membershipTier}
                        </span>
                        <span className="text-stone-300 font-bold">{currentUser.loyaltyPoints} điểm</span>
                      </div>
                    </div>

                    {/* Admin Mode Shortcut if Admin/Staff */}
                    {isAdminOrStaff && (
                      <div className="p-1.5 bg-amber-500/10 border-b border-stone-800 space-y-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onViewChange('admin');
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-amber-600/25 hover:bg-amber-600/35 text-amber-300 flex items-center justify-between text-xs font-bold transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-amber-400" />
                            <span>Vào Bảng Quản Trị Nhà Hàng</span>
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 text-[9px] font-extrabold uppercase">
                            Admin
                          </span>
                        </button>

                        {currentUser.role === 'admin' && onOpenAdminTab && (
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onOpenAdminTab('staff');
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 flex items-center justify-between text-xs font-bold transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-amber-400" />
                              <span>Quản Lý Tài Khoản (RBAC)</span>
                            </span>
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 text-[9px] font-extrabold">
                              Xem ngay
                            </span>
                          </button>
                        )}

                        {onOpenEmailInbox && (
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onOpenEmailInbox();
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 flex items-center justify-between text-xs font-medium transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-amber-400" />
                              <span>Nhật Ký Email Tự Động</span>
                            </span>
                            {unreadEmailsCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[9px] font-extrabold">
                                {unreadEmailsCount}
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    <div className="py-1 text-xs">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenUserProfile('history');
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-stone-800 flex items-center gap-2.5 text-stone-300 hover:text-white transition-colors"
                      >
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Lịch sử đặt bàn của tôi</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenUserProfile('rewards');
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-stone-800 flex items-center gap-2.5 text-stone-300 hover:text-white transition-colors"
                      >
                        <Gift className="w-4 h-4 text-amber-400" />
                        <span>Thành viên & Ưu đãi voucher</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenUserProfile('favorites');
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-stone-800 flex items-center gap-2.5 text-stone-300 hover:text-white transition-colors"
                      >
                        <Heart className="w-4 h-4 text-rose-400" />
                        <span>Món ăn yêu thích đã lưu</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenUserProfile('profile');
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-stone-800 flex items-center gap-2.5 text-stone-300 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4 text-amber-400" />
                        <span>Hồ sơ & Đổi mật khẩu</span>
                      </button>
                    </div>

                    <div className="py-1 text-xs">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-stone-800/80 text-rose-400 hover:text-rose-300 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất tài khoản</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="open-auth-modal-btn"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2] shrink-0" />
                <span>Đăng Nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

