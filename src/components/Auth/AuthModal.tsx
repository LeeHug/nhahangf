import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  KeyRound, 
  Mail, 
  Phone, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Crown,
  HeartHandshake,
  Utensils
} from 'lucide-react';
import { UserAccount } from '../../types';
import { loginUser, registerUser, resetUserPassword } from '../../services/storage';
import { apiService } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: UserAccount, message: string) => void;
  initialTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  initialTab = 'login',
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>(initialTab);
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regDietary, setRegDietary] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  
  // Status message state
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleQuickLogin = async (email: string, pass: string = '123456') => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      const serverAuth = await apiService.login(email, pass);
      if (serverAuth.success && serverAuth.user) {
        setIsLoading(false);
        onSuccessLogin(serverAuth.user, serverAuth.message || 'Đăng nhập thành công!');
        onClose();
        return;
      }
      const res = loginUser(email, pass);
      setIsLoading(false);
      if (res.success && res.user) {
        onSuccessLogin(res.user, res.message);
        onClose();
      } else {
        setErrorMessage(res.message);
      }
    } catch (e: any) {
      setIsLoading(false);
      setErrorMessage(e?.message || 'Có lỗi xảy ra.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginIdentifier.trim()) {
      setErrorMessage('Vui lòng nhập Email hoặc Số điện thoại!');
      return;
    }

    setIsLoading(true);
    try {
      const serverAuth = await apiService.login(loginIdentifier, loginPassword || '123456');
      if (serverAuth.success && serverAuth.user) {
        setIsLoading(false);
        onSuccessLogin(serverAuth.user, serverAuth.message || 'Đăng nhập thành công!');
        onClose();
        return;
      }

      const res = loginUser(loginIdentifier, loginPassword || '123456');
      setIsLoading(false);
      if (res.success && res.user) {
        onSuccessLogin(res.user, res.message);
        onClose();
      } else {
        setErrorMessage(serverAuth.message || res.message);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Có lỗi xảy ra.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ Họ tên, Email và Số điện thoại!');
      return;
    }

    if (regPassword && regPassword.length < 6) {
      setErrorMessage('Mật khẩu tối thiểu phải từ 6 ký tự trở lên!');
      return;
    }

    if (regPassword && regPassword !== regPasswordConfirm) {
      setErrorMessage('Mật khẩu xác nhận không khớp nhau!');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = registerUser({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword || '123456',
        dietaryPreferences: regDietary,
      });
      setIsLoading(false);
      if (res.success && res.user) {
        onSuccessLogin(res.user, res.message);
        onClose();
      } else {
        setErrorMessage(res.message);
      }
    }, 400);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!forgotEmail.trim() || !forgotNewPass.trim()) {
      setErrorMessage('Vui lòng nhập email và mật khẩu mới!');
      return;
    }
    if (forgotNewPass.length < 6) {
      setErrorMessage('Mật khẩu mới phải từ 6 ký tự trở lên!');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = resetUserPassword(forgotEmail, forgotNewPass);
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          setActiveTab('login');
          setLoginIdentifier(forgotEmail);
        }, 1200);
      } else {
        setErrorMessage(res.message);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden relative my-6">
        {/* Modal Header */}
        <div className="bg-stone-900 px-6 py-5 text-stone-100 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-heading font-bold text-lg text-amber-300">
                {activeTab === 'login' && 'Đăng Nhập Khách Hàng'}
                {activeTab === 'register' && 'Tạo Tài Khoản Thành Viên'}
                {activeTab === 'forgot' && 'Đặt Lại Mật Khẩu'}
              </h3>
              <p className="text-xs text-stone-400">Le Gourmet Bistro • Đặc quyền thành viên</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-stone-100 bg-stone-50">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'login'
                ? 'border-amber-600 text-amber-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/60'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng Nhập</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'register'
                ? 'border-amber-600 text-amber-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/60'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Đăng Ký Mới</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Notification Banners */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              {/* Quick Demo Logins */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Đăng nhập nhanh 1-Click (Tài khoản mẫu):
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('leehung.work03@gmail.com')}
                    className="p-2 bg-white hover:bg-amber-100/70 border border-amber-300/70 rounded-xl text-left flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <p className="font-bold text-stone-900 group-hover:text-amber-900">Lê Hùng</p>
                      <p className="text-[10px] text-amber-700 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-500" /> Hạng Vàng • 420 điểm
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Chọn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('thuha.nguyen@gmail.com')}
                    className="p-2 bg-white hover:bg-amber-100/70 border border-amber-300/70 rounded-xl text-left flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <p className="font-bold text-stone-900 group-hover:text-amber-900">Nguyễn Thu Hà</p>
                      <p className="text-[10px] text-amber-700 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-stone-400" /> Hạng Bạc • 180 điểm
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Chọn</span>
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email hoặc Số điện thoại
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="login-identifier-input"
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="ví dụ: leehung.work03@gmail.com hoặc 0987654321"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-stone-700">Mật khẩu</label>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('forgot'); setErrorMessage(''); }}
                      className="text-[11px] text-amber-700 hover:text-amber-800 hover:underline"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password-input"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Mật khẩu mặc định: 123456"
                      className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-stone-600">
                    <input type="checkbox" defaultChecked className="rounded text-amber-600 focus:ring-amber-500" />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>
                  <span className="text-stone-400 text-[11px]">Bảo mật SSL 256-bit</span>
                </div>

                <button
                  id="submit-login-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-stone-950 font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Đang đăng nhập...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 stroke-[2.5]" />
                      <span>Đăng Nhập Vào Hệ Thống</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900">
                <HeartHandshake className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold">Đăng ký thành viên Le Gourmet</p>
                  <p className="text-[11px] text-amber-800">Nhận ngay 100 điểm thưởng chào mừng & voucher giảm 10%.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Họ và tên quý khách <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="ví dụ: Nguyễn Văn An"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="register-phone-input"
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Địa chỉ Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="register-email-input"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Mật khẩu</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-9 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-stone-400 hover:text-stone-600"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPasswordConfirm}
                      onChange={(e) => setRegPasswordConfirm(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Sở thích ẩm thực / Dị ứng thức ăn (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={regDietary}
                  onChange={(e) => setRegDietary(e.target.value)}
                  placeholder="ví dụ: Thích ngồi phòng riêng, ăn cay ít, kiêng tôm cua..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                />
              </div>

              <button
                id="submit-register-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-stone-950 font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Đang khởi tạo tài khoản...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 stroke-[2.5]" />
                    <span>Đăng Ký & Nhận 100 Điểm Thưởng</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <p className="text-xs text-stone-600">
                Nhập địa chỉ email tài khoản của bạn để thiết lập mật khẩu đăng nhập mới ngay lập tức.
              </p>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email đã đăng ký
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="ví dụ: leehung.work03@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={forgotNewPass}
                    onChange={(e) => setForgotNewPass(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="flex-1 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  Quay Lại
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] py-2.5 bg-amber-600 hover:bg-amber-700 text-stone-950 font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu Mới'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-stone-50 px-6 py-3.5 border-t border-stone-200/80 text-center text-[11px] text-stone-500">
          Cần hỗ trợ trực tiếp? Vui lòng liên hệ Hotline Lễ Tân: <span className="font-semibold text-stone-800">0903.888.999</span>
        </div>
      </div>
    </div>
  );
};
