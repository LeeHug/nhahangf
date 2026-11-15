import React, { useState, useEffect } from 'react';
import { 
  getStoredReservations, 
  getStoredTables, 
  getStoredEmailLogs, 
  addNewReservation, 
  updateReservationStatus, 
  saveStoredTables,
  saveStoredReservations,
  saveStoredEmailLogs,
  formatVND,
  getCurrentUser,
  saveCurrentUser,
  logoutUser,
  toggleFavoriteDish,
  deleteEmailLog,
  clearAllEmailLogs,
  addDishesToReservation,
  checkoutAndSettleReservation,
  getStoredMenuItems
} from './services/storage';
import { apiService } from './services/api';
import { Reservation, RestaurantTable, SentEmailLog, SelectedDishItem, TableArea, ReservationStatus, TableStatus, MenuItem, UserAccount } from './types';
import { Navbar } from './components/Navbar';
import { StepIndicator } from './components/BookingFlow/StepIndicator';
import { DateTimeTableSelector } from './components/BookingFlow/DateTimeTableSelector';
import { MenuSelector } from './components/BookingFlow/MenuSelector';
import { BookingConfirmation } from './components/BookingFlow/BookingConfirmation';
import { PublicMenuPreview } from './components/Menu/PublicMenuPreview';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminAccessGate } from './components/Admin/AdminAccessGate';
import { EmailModal } from './components/EmailModal';
import { EmailInboxModal } from './components/EmailInboxModal';
import { LookupModal } from './components/LookupModal';
import { AuthModal } from './components/Auth/AuthModal';
import { UserProfileModal } from './components/Auth/UserProfileModal';
import { TableSelfServiceModal } from './components/TableService/TableSelfServiceModal';
import { CustomerReviewModal } from './components/Feedback/CustomerReviewModal';
import { Mail, CheckCircle2, Clock, Phone, MapPin, Sparkles, ShieldCheck, Users, BookOpen } from 'lucide-react';
import { getDefaultBookingDateTime, getLocalDateString } from './utils/dateTimeUtils';

export default function App() {
  // Global Data States
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [emailLogs, setEmailLogs] = useState<SentEmailLog[]>([]);

  // Self-Service & Feedback Modals
  const [isTableServiceOpen, setIsTableServiceOpen] = useState<boolean>(false);
  const [isGlobalReviewOpen, setIsGlobalReviewOpen] = useState<boolean>(false);
  const [selectedReviewReservation, setSelectedReviewReservation] = useState<Reservation | null>(null);

  // User Account State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState<boolean>(false);
  const [userProfileTab, setUserProfileTab] = useState<'history' | 'rewards' | 'favorites' | 'profile'>('history');

  // Navigation State
  const [currentView, setCurrentView] = useState<'booking' | 'menu' | 'admin'>('booking');
  const [adminActiveTab, setAdminActiveTab] = useState<
    'staff_ops' | 'reservations' | 'tables' | 'kds' | 'inventory' | 'feedback' | 'reports' | 'menu' | 'staff'
  >('reservations');

  // Customer Booking Flow States - initialize with smart available date & slot
  const defaultSlot = getDefaultBookingDateTime();
  const todayStr = getLocalDateString(new Date());
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxAccessibleStep, setMaxAccessibleStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>(defaultSlot.date);
  const [selectedTime, setSelectedTime] = useState<string>(defaultSlot.time);
  const [guestCount, setGuestCount] = useState<number>(4);
  const [selectedArea, setSelectedArea] = useState<TableArea>('main');
  const [selectedTableId, setSelectedTableId] = useState<string>('T-01');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('Bữa Ăn Gia Đình');
  const [selectedDishes, setSelectedDishes] = useState<SelectedDishItem[]>([]);

  // Modals & Overlays
  const [emailPreviewReservation, setEmailPreviewReservation] = useState<Reservation | null>(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isEmailInboxOpen, setIsEmailInboxOpen] = useState(false);

  // Real-time Toast notification
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type?: string } | null>(null);

  // Load Initial Data from Cloud SQL / LocalStorage fallback
  useEffect(() => {
    const loadedReservations = getStoredReservations();
    const loadedTables = getStoredTables();
    const loadedEmails = getStoredEmailLogs();
    const loadedUser = getCurrentUser();

    setReservations(loadedReservations);
    setTables(loadedTables);
    if (loadedUser) {
      setCurrentUser(loadedUser);
    }

    // Verify session with server if token exists
    apiService.verifyCurrentUser().then(verified => {
      if (verified) {
        setCurrentUser(verified);
        saveCurrentUser(verified);
      }
    }).catch(() => {});

    // Fetch live data from Cloud SQL backend
    async function syncCloudSql() {
      try {
        const [cloudTables, cloudReservations, cloudEmails] = await Promise.all([
          apiService.getTables(),
          apiService.getReservations(),
          apiService.getEmailLogs(),
        ]);

        if (cloudTables && cloudTables.length > 0) {
          setTables(cloudTables);
          saveStoredTables(cloudTables);
        }
        if (cloudReservations && cloudReservations.length > 0) {
          setReservations(cloudReservations);
          saveStoredReservations(cloudReservations);
        }
        if (cloudEmails && cloudEmails.length > 0) {
          setEmailLogs(cloudEmails);
          saveStoredEmailLogs(cloudEmails);
        }
      } catch (err) {
        console.warn('Cloud SQL async fetch error (using local storage fallback):', err);
      }
    }

    syncCloudSql();

    const handleSyncStorage = () => {
      setReservations(getStoredReservations());
      setTables(getStoredTables());
      setEmailLogs(getStoredEmailLogs());
      const syncedUser = getCurrentUser();
      if (syncedUser) {
        setCurrentUser(syncedUser);
      }
    };
    window.addEventListener('storage', handleSyncStorage);
    return () => window.removeEventListener('storage', handleSyncStorage);
  }, []);

  const triggerToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // User Auth Handlers
  const handleLoginSuccess = async (user: UserAccount) => {
    saveCurrentUser(user);
    setCurrentUser(user);
    triggerToast(
      `Chào Mừng Trở Lại!`,
      `Đăng nhập thành công với tài khoản ${user.name} (Hạng ${user.membershipTier} - ${user.loyaltyPoints} điểm).`
    );

    // Đồng bộ trực tiếp dữ liệu từ PostgreSQL cho tài khoản Admin & Staff
    if (user.role === 'admin' || user.role === 'staff') {
      try {
        const [resList, emailList, tableList] = await Promise.all([
          apiService.getReservations(),
          apiService.getEmailLogs(),
          apiService.getTables(),
        ]);
        if (resList && resList.length > 0) setReservations(resList);
        if (emailList && emailList.length > 0) setEmailLogs(emailList);
        if (tableList && tableList.length > 0) setTables(tableList);
      } catch (err) {
        console.warn('Sync live data from SQL on login notice:', err);
      }
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    triggerToast('Đã Đăng Xuất', 'Tài khoản của quý khách đã được đăng xuất an toàn.');
  };

  const handleOpenUserProfile = (tab: 'history' | 'rewards' | 'favorites' | 'profile' = 'history') => {
    setUserProfileTab(tab);
    setIsUserProfileOpen(true);
  };

  const handleToggleFavorite = (dishId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      triggerToast('Yêu Cầu Đăng Nhập', 'Vui lòng đăng nhập hoặc đăng ký tài khoản để lưu món ăn yêu thích!');
      return;
    }

    const updated = toggleFavoriteDish(currentUser.id, dishId);
    if (updated) {
      setCurrentUser(updated);
      const isFav = updated.favoriteDishIds.includes(dishId);
      triggerToast(
        isFav ? 'Đã Lưu Yêu Thích ❤️' : 'Đã Bỏ Yêu Thích',
        isFav ? 'Món ăn đã được thêm vào danh sách yêu thích của bạn.' : 'Món ăn đã được xóa khỏi danh sách yêu thích.'
      );
    }
  };

  // Dish Selection Handlers
  const handleUpdateQuantity = (dish: MenuItem, delta: number) => {
    setSelectedDishes((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return prev.filter((item) => item.dish.id !== dish.id);
        }
        return prev.map((item) =>
          item.dish.id === dish.id ? { ...item, quantity: newQty } : item
        );
      } else if (delta > 0) {
        return [...prev, { dish, quantity: delta }];
      }
      return prev;
    });
  };

  const handleUpdateNote = (dishId: string, note: string) => {
    setSelectedDishes((prev) =>
      prev.map((item) => (item.dish.id === dishId ? { ...item, specialNotes: note } : item))
    );
  };

  const handleClearDishes = () => {
    setSelectedDishes([]);
  };

  // Step Navigation Handlers
  const goToStep = (step: number) => {
    setCurrentStep(step);
    if (step > maxAccessibleStep) {
      setMaxAccessibleStep(step);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Booking Submission
  const handleSubmitBooking = async (customerData: {
    name: string;
    phone: string;
    email: string;
    specialRequests: string;
    depositAmount: number;
    userId?: string;
    voucherCode?: string;
    discountAmount?: number;
    pointsRedeemed?: number;
    pointsDiscount?: number;
  }): Promise<Reservation> => {
    const selectedTable = tables.find((t) => t.id === selectedTableId);
    const preOrderTotal = selectedDishes.reduce(
      (sum, item) => sum + item.dish.price * item.quantity,
      0
    );
    const computedFinalTotal = Math.max(
      0,
      preOrderTotal - (customerData.discountAmount || 0) - (customerData.pointsDiscount || 0)
    );

    // 1. Ưu tiên lưu trực tiếp vào cơ sở dữ liệu PostgreSQL thông qua Backend API
    let savedReservation: Reservation | null = null;
    try {
      const serverCreated = await apiService.createReservation({
        customerName: customerData.name,
        customerPhone: customerData.phone,
        customerEmail: customerData.email,
        guestCount,
        bookingDate: selectedDate,
        arrivalTime: selectedTime,
        tableId: selectedTableId,
        tableName: selectedTable?.name || 'Bàn Tiêu Chuẩn',
        tableArea: selectedArea,
        selectedDishes,
        preOrderTotal,
        depositAmount: customerData.depositAmount,
        totalAmount: computedFinalTotal,
        specialRequests: customerData.specialRequests,
        occasion: selectedOccasion,
        userId: customerData.userId || currentUser?.id,
        voucherCode: customerData.voucherCode,
        discountAmount: customerData.discountAmount,
        pointsRedeemed: customerData.pointsRedeemed,
        pointsDiscount: customerData.pointsDiscount,
      } as any);

      if (serverCreated) {
        savedReservation = serverCreated;
      }
    } catch (err) {
      console.warn('Backend PostgreSQL creation error, fallback to local storage:', err);
    }

    if (savedReservation) {
      // Cập nhật state với bản ghi đã lưu trong PostgreSQL
      const currentList = getStoredReservations();
      const updatedList = [savedReservation, ...currentList.filter(r => r.id !== savedReservation!.id && r.bookingCode !== savedReservation!.bookingCode)];
      saveStoredReservations(updatedList);
      setReservations(updatedList);
      setTables(getStoredTables());

      const activeSessionUser = getCurrentUser() || currentUser;
      if (activeSessionUser) {
        const redeemed = savedReservation.pointsRedeemed || customerData.pointsRedeemed || 0;
        const updatedUser = redeemed > 0
          ? { ...activeSessionUser, loyaltyPoints: Math.max(0, (activeSessionUser.loyaltyPoints || 0) - redeemed) }
          : activeSessionUser;
        setCurrentUser(updatedUser);
        saveCurrentUser(updatedUser);
      }

      triggerToast(
        `✨ Đã Gửi Yêu Cầu Đặt Bàn #${savedReservation.bookingCode}`,
        `Hệ thống đã lưu vào cơ sở dữ liệu PostgreSQL và chuyển giao thông báo đến ${customerData.email}.`
      );

      return savedReservation;
    }

    // 2. Chế độ fallback nếu máy chủ chưa bật PostgreSQL
    const { reservation, emailLog } = addNewReservation({
      customerName: customerData.name,
      customerPhone: customerData.phone,
      customerEmail: customerData.email,
      guestCount,
      bookingDate: selectedDate,
      arrivalTime: selectedTime,
      tableId: selectedTableId,
      tableName: selectedTable?.name || 'Bàn Tiêu Chuẩn',
      tableArea: selectedArea,
      selectedDishes,
      preOrderTotal,
      depositAmount: customerData.depositAmount,
      totalAmount: computedFinalTotal,
      specialRequests: customerData.specialRequests,
      occasion: selectedOccasion,
      userId: customerData.userId || currentUser?.id,
      voucherCode: customerData.voucherCode,
      discountAmount: customerData.discountAmount,
      pointsRedeemed: customerData.pointsRedeemed,
      pointsDiscount: customerData.pointsDiscount,
    });

    // Update state and safely preserve logged-in user session
    setReservations(getStoredReservations());
    setTables(getStoredTables());
    setEmailLogs(getStoredEmailLogs());
    const activeSessionUser = getCurrentUser() || currentUser;
    if (activeSessionUser) {
      setCurrentUser(activeSessionUser);
      saveCurrentUser(activeSessionUser);
    }

    // Sync to Cloud SQL database in background
    apiService.createReservation(reservation).catch(console.error);
    apiService.createEmailLog(emailLog).catch(console.error);

    triggerToast(
      `✨ Đã Gửi Email Tự Động #${reservation.bookingCode}`,
      `Vé xác nhận kèm thực đơn đã được chuyển giao tức thì đến ${customerData.email}.`
    );

    return reservation;
  };

  // Admin Actions
  const handleStatusChange = (reservationId: string, newStatus: ReservationStatus) => {
    const { updated, emailLog } = updateReservationStatus(reservationId, newStatus);
    if (updated) {
      setReservations(getStoredReservations());
      setTables(getStoredTables());
      setEmailLogs(getStoredEmailLogs());
      const syncedUser = getCurrentUser();
      if (syncedUser) {
        setCurrentUser(syncedUser);
      }

      // Sync status change to Cloud SQL
      apiService.updateReservationStatus(reservationId, newStatus).catch(console.error);
      if (emailLog) {
        apiService.createEmailLog(emailLog).catch(console.error);
      }

      if (emailLog) {
        triggerToast(
          `Thông Báo Cập Nhật Trạng Thái`,
          `Email thông báo đã được gửi đến khách hàng ${updated.customerEmail}.`
        );
      }
    }
  };

  const handleUpdateTableStatus = (tableId: string, newStatus: TableStatus) => {
    const updated = tables.map((t) => (t.id === tableId ? { ...t, status: newStatus } : t));
    setTables(updated);
    saveStoredTables(updated);
    apiService.updateTable(tableId, { status: newStatus }).catch(console.error);
  };

  const handleManualBooking = (data: {
    name: string;
    phone: string;
    email: string;
    date: string;
    time: string;
    tableId: string;
    guestCount: number;
    occasion: string;
    specialRequests: string;
    selectedDishes: SelectedDishItem[];
  }) => {
    const table = tables.find((t) => t.id === data.tableId);
    const preOrderTotal = data.selectedDishes.reduce(
      (sum, item) => sum + item.dish.price * item.quantity,
      0
    );

    const { reservation } = addNewReservation({
      customerName: data.name,
      customerPhone: data.phone,
      customerEmail: data.email,
      guestCount: data.guestCount,
      bookingDate: data.date,
      arrivalTime: data.time,
      tableId: data.tableId,
      tableName: table?.name || 'Bàn Đặt Trước',
      tableArea: table?.area || 'main',
      selectedDishes: data.selectedDishes,
      preOrderTotal,
      depositAmount: 0,
      totalAmount: preOrderTotal,
      specialRequests: data.specialRequests,
      occasion: data.occasion,
    });

    setReservations(getStoredReservations());
    setTables(getStoredTables());
    setEmailLogs(getStoredEmailLogs());

    triggerToast(
      `Đã Tạo Đặt Bàn Thủ Công #${reservation.bookingCode}`,
      `Email xác nhận đặt chỗ đã gửi tự động tới ${data.email}.`
    );
  };

  const handleSaveDishesAtTable = (reservationId: string, dishesToAdd: any[]) => {
    const { updatedReservation } = addDishesToReservation(reservationId, dishesToAdd);
    if (updatedReservation) {
      setReservations(getStoredReservations());
      setTables(getStoredTables());
      triggerToast(
        'Đã Gọi Thêm Món Vào Bàn',
        `Món ăn bổ sung đã được ghi nhận vào hóa đơn bàn #${updatedReservation.bookingCode} và báo cho bộ phận bếp.`
      );
    }
  };

  const handleConfirmCheckout = async (reservationId: string, paymentDetails: any) => {
    const prevReservation = reservations.find(r => r.id === reservationId);
    const { updatedReservation } = checkoutAndSettleReservation(reservationId, paymentDetails);
    if (updatedReservation) {
      setReservations(getStoredReservations());
      setTables(getStoredTables());
      setCurrentUser(getCurrentUser());
      triggerToast(
        'Thanh Toán Hoàn Tất',
        `Bàn #${updatedReservation.bookingCode} (${updatedReservation.tableName}) đã thanh toán thành công và chuyển sang dọn dẹp.`
      );

      // Đồng bộ trạng thái hoàn tất lên Backend/PostgreSQL theo đúng Finite State Machine
      const targetId = updatedReservation.bookingCode || reservationId;
      const prevStatus = prevReservation?.status || 'seated';
      if (prevStatus === 'pending') {
        await apiService.updateReservationStatus(targetId, 'confirmed');
        await apiService.updateReservationStatus(targetId, 'seated');
      } else if (prevStatus === 'confirmed') {
        await apiService.updateReservationStatus(targetId, 'seated');
      }
      await apiService.updateReservationStatus(targetId, 'completed');
    }
  };

  const handleResetBooking = () => {
    setCurrentStep(1);
    setMaxAccessibleStep(1);
    setSelectedDishes([]);
  };

  const todayBookingsCount = reservations.filter(
    (r) => r.bookingDate === todayStr && r.status !== 'cancelled'
  ).length;

  const selectedTable = tables.find((t) => t.id === selectedTableId);
  const isAdminOrStaff = currentUser?.role === 'admin' || currentUser?.role === 'staff';

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-amber-200 selection:text-stone-900 w-full overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLookup={() => setIsLookupOpen(true)}
        onOpenEmailInbox={() => {
          if (isAdminOrStaff) {
            setIsEmailInboxOpen(true);
          }
        }}
        unreadEmailsCount={isAdminOrStaff ? emailLogs.length : 0}
        todayBookingsCount={todayBookingsCount}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenUserProfile={handleOpenUserProfile}
        onLogout={handleLogout}
        onOpenTableService={() => setIsTableServiceOpen(true)}
        onOpenAdminTab={(tab) => {
          setAdminActiveTab(tab as any);
          setCurrentView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Real-time Email Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-stone-900 text-stone-100 rounded-2xl p-4 shadow-2xl border border-stone-700 flex items-start gap-3 animate-fade-in">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h5 className="font-bold text-xs sm:text-sm text-stone-100">{toastMessage.title}</h5>
            <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{toastMessage.desc}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-stone-500 hover:text-stone-300 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {currentView === 'booking' ? (
          <div className="space-y-8">
            {/* Hero Greeting for Customer */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Trải Nghiệm Ẩm Thực Tinh Hoa & Đặt Bàn Nhanh Chóng</span>
              </div>
              <h1 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight">
                Đặt Bàn & Chọn Món Trực Tuyến
              </h1>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                Chọn chính xác khung giờ đến, lựa chọn không gian yêu thích và đặt trước món ăn nóng sốt. Hệ thống tự động gửi vé xác nhận qua email ngay sau khi hoàn tất.
              </p>
            </div>

            {/* 3-Step Wizard Indicator */}
            <StepIndicator
              currentStep={currentStep}
              onStepClick={goToStep}
              maxAccessibleStep={maxAccessibleStep}
            />

            {/* Step 1: Date, Time & Table Selection */}
            {currentStep === 1 && (
              <DateTimeTableSelector
                tables={tables}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                guestCount={guestCount}
                selectedArea={selectedArea}
                selectedTableId={selectedTableId}
                selectedOccasion={selectedOccasion}
                onDateChange={setSelectedDate}
                onTimeChange={setSelectedTime}
                onGuestCountChange={setGuestCount}
                onAreaChange={setSelectedArea}
                onTableChange={setSelectedTableId}
                onOccasionChange={setSelectedOccasion}
                onNext={() => goToStep(2)}
                onPreviewMenu={() => {
                  setCurrentView('menu');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* Step 2: Food & Beverage Pre-ordering */}
            {currentStep === 2 && (
              <MenuSelector
                selectedDishes={selectedDishes}
                onUpdateQuantity={handleUpdateQuantity}
                onUpdateNote={handleUpdateNote}
                onClearDishes={handleClearDishes}
                onPrev={() => goToStep(1)}
                onNext={() => goToStep(3)}
                favoriteDishIds={currentUser?.favoriteDishIds || []}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {/* Step 3: Customer Details & Automated Email Confirmation */}
            {currentStep === 3 && (
              <BookingConfirmation
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                guestCount={guestCount}
                table={selectedTable}
                selectedDishes={selectedDishes}
                selectedOccasion={selectedOccasion}
                currentUser={currentUser}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onPrev={() => goToStep(2)}
                onSubmitBooking={handleSubmitBooking}
                onOpenEmailPreview={(res) => setEmailPreviewReservation(res)}
                onResetBooking={handleResetBooking}
              />
            )}
          </div>
        ) : currentView === 'menu' ? (
          /* Public Guest Menu Preview View (Không bắt buộc đặt bàn) */
          <PublicMenuPreview
            onGoToBooking={(initialDish) => {
              if (initialDish) {
                handleUpdateQuantity(initialDish, 1);
              }
              setCurrentView('booking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectCourseAndBook={(course, includeWine) => {
              const allDishes = getStoredMenuItems();
              course.dishes.forEach((cd) => {
                const found = allDishes.find((d) => d.id === cd.dishId);
                if (found) {
                  handleUpdateQuantity(found, 1);
                }
              });
              if (includeWine && course.winePairingOption) {
                const wineItem = allDishes.find((d) => d.id === course.winePairingOption?.wineId);
                if (wineItem) {
                  handleUpdateQuantity(wineItem, 1);
                }
              }
              setCurrentView('booking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            selectedDishes={selectedDishes}
            onUpdateQuantity={handleUpdateQuantity}
            onClearDishes={handleClearDishes}
            currentUser={currentUser}
            onToggleFavorite={handleToggleFavorite}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenTableService={() => setIsTableServiceOpen(true)}
          />
        ) : (
          /* Protected Admin Portal View */
          isAdminOrStaff ? (
            <AdminDashboard
              reservations={reservations}
              tables={tables}
              currentUser={currentUser}
              onBackToBooking={() => {
                setCurrentView('booking');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onStatusChange={handleStatusChange}
              onUpdateTableStatus={handleUpdateTableStatus}
              onOpenEmailPreview={(res) => setEmailPreviewReservation(res)}
              onCreateManualReservation={handleManualBooking}
              onSaveDishesAtTable={handleSaveDishesAtTable}
              onConfirmCheckout={handleConfirmCheckout}
              initialTab={adminActiveTab}
              onTabChange={setAdminActiveTab}
            />
          ) : (
            <AdminAccessGate
              currentUser={currentUser}
              onBackToBooking={() => {
                setCurrentView('booking');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSuccessAdminLogin={(adminUser, targetTab) => {
                setCurrentUser(adminUser);
                if (targetTab) {
                  setAdminActiveTab(targetTab);
                }
                triggerToast('Xác Thực Thành Công', `Xin chào Quản lý ${adminUser.name}. Quyền truy cập quản trị đã được kích hoạt.`);
              }}
              onLogoutAndSwitch={() => {
                handleLogout();
                triggerToast('Đã Đăng Xuất', 'Vui lòng đăng nhập bằng tài khoản Quản trị viên/Nhân viên.');
              }}
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 border-t border-stone-800 text-xs py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-center md:text-left flex-wrap justify-center md:justify-start">
            <span className="font-serif-heading text-lg font-bold text-stone-100">Le Gourmet Bistro</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-stone-400">128 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
          </div>
          <div className="flex items-center gap-x-4 gap-y-2 text-stone-300 flex-wrap justify-center md:justify-end">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Hotline: 0903.888.999</span>
            </span>
            <span className="hidden sm:inline text-stone-600">•</span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Mở cửa: 10:30 - 22:30</span>
            </span>
            <span className="hidden sm:inline text-stone-600">•</span>
            <button
              onClick={() => {
                setCurrentView('menu');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-amber-400 border border-stone-700 transition text-xs whitespace-nowrap cursor-pointer shadow-xs"
              title="Xem trước thực đơn món ăn & bảng giá"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-medium">Thực Đơn</span>
            </button>
            {isAdminOrStaff && (
              <>
                <span className="hidden sm:inline text-stone-600">•</span>
                <button
                  onClick={() => {
                    setCurrentView('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-amber-400 border border-stone-700 hover:border-amber-500/50 transition text-xs whitespace-nowrap cursor-pointer shadow-xs"
                  title="Cổng Quản Trị Dành Cho Ban Quản Lý & Nhân Viên"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-medium">Cổng Quản Trị</span>
                </button>
                <button
                  onClick={() => {
                    setAdminActiveTab('staff');
                    setCurrentView('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/30 transition text-xs font-semibold whitespace-nowrap cursor-pointer shadow-xs"
                  title="Xem module Quản Lý Tài Khoản & Phân Quyền RBAC"
                >
                  <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Quản Lý Tài Khoản</span>
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* User Login / Register / Forgot Password Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccessLogin={(user) => handleLoginSuccess(user)}
      />

      {/* User Dashboard & Profile Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isUserProfileOpen}
          onClose={() => setIsUserProfileOpen(false)}
          currentUser={currentUser}
          reservations={reservations}
          onUserUpdated={(updatedUser: UserAccount) => {
            setCurrentUser(updatedUser);
            triggerToast('Cập Nhật Thành Công', 'Thông tin hồ sơ tài khoản đã được lưu lại.');
          }}
          onLogout={handleLogout}
          initialTab={userProfileTab}
          onSelectReservationForPreview={(res: Reservation) => {
            setIsUserProfileOpen(false);
            setEmailPreviewReservation(res);
          }}
          onAddDishToCart={(dish) => {
            handleUpdateQuantity(dish, 1);
            triggerToast('Đã Thêm Vào Bàn', `Món "${dish.name}" đã được thêm vào thực đơn đặt trước.`);
          }}
        />
      )}

      {/* Email Viewer Modal */}
      {emailPreviewReservation && (
        <EmailModal
          reservation={emailPreviewReservation}
          onClose={() => setEmailPreviewReservation(null)}
        />
      )}

      {/* Sent Emails Log Inbox Modal */}
      {isEmailInboxOpen && (
        <EmailInboxModal
          emailLogs={emailLogs}
          onClose={() => setIsEmailInboxOpen(false)}
          onViewEmailDetail={(log) => {
            const res = reservations.find((r) => r.id === log.reservationId);
            if (res) setEmailPreviewReservation(res);
          }}
          onDeleteLog={(logId) => {
            const updated = deleteEmailLog(logId);
            setEmailLogs(updated);
            triggerToast('Đã Xóa Nhật Ký', 'Bản ghi email đã được xóa thành công.');
          }}
          onClearAllLogs={() => {
            const updated = clearAllEmailLogs();
            setEmailLogs(updated);
            triggerToast('Đã Xóa Tất Cả', 'Toàn bộ nhật ký email gửi tự động đã được làm sạch.');
          }}
        />
      )}

      {/* Reservation Lookup Modal */}
      {isLookupOpen && (
        <LookupModal
          reservations={reservations}
          onClose={() => setIsLookupOpen(false)}
          onOpenEmailPreview={(res) => {
            setIsLookupOpen(false);
            setEmailPreviewReservation(res);
          }}
        />
      )}

      {/* Table Self-Service & Digital Waiter Call Modal */}
      <TableSelfServiceModal
        isOpen={isTableServiceOpen}
        onClose={() => setIsTableServiceOpen(false)}
        onOpenReviewModal={(res) => {
          setSelectedReviewReservation(res);
          setIsGlobalReviewOpen(true);
        }}
        onDishesAdded={() => {
          setReservations(getStoredReservations());
          setTables(getStoredTables());
          triggerToast('Đã Gửi Bếp & Quầy Bar', 'Món ăn gọi thêm tại bàn đã được chuyển xuống bếp và cập nhật hóa đơn.');
        }}
      />

      {/* Customer Review & CSAT Rating Modal */}
      <CustomerReviewModal
        isOpen={isGlobalReviewOpen}
        onClose={() => {
          setIsGlobalReviewOpen(false);
          setSelectedReviewReservation(null);
        }}
        bookingCode={selectedReviewReservation?.bookingCode || 'BK-CURRENT'}
        customerName={selectedReviewReservation?.customerName || currentUser?.name || 'Quý Khách'}
        customerPhone={selectedReviewReservation?.customerPhone || currentUser?.phone || ''}
        tableName={selectedReviewReservation?.tableName || 'Bàn Đang Dùng'}
        tableId={selectedReviewReservation?.tableId || 'T-01'}
        reservationId={selectedReviewReservation?.id || 'res-current'}
        onReviewSubmitted={(review) => {
          triggerToast('Cảm Ơn Đánh Giá!', `Đánh giá ${review.overallRating}★ của bạn đã được gửi. Mã voucher LEVIP10 đã kích hoạt.`);
        }}
      />
    </div>
  );
}
