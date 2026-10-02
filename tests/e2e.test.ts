/**
 * =========================================================================
 * MÔI TRƯỜNG TEST TOÀN TRÌNH KHÉP KÍN (END-TO-END FULL LIFECYCLE TEST)
 * Dự án: Hệ thống quản lý nhà hàng Le Gourmet Bistro
 * =========================================================================
 * Mô phỏng 1 chu trình phục vụ khách hàng thực tế 100% từ A -> Z:
 * Giai đoạn 1: Đăng nhập tài khoản khách hàng
 * Giai đoạn 2: Đặt bàn trước (Booking) tại phòng VIP
 * Giai đoạn 3: Gọi trước món ăn đặc sắc (Pre-order Wagyu & Champagne)
 * Giai đoạn 4: Khách đến nhà hàng -> Check-in nhận bàn
 * Giai đoạn 5: Khách gọi thêm tráng miệng tại bàn -> Bếp KDS chế biến
 * Giai đoạn 6: Khách yêu cầu thanh toán VietQR -> Quyết toán, tích điểm & dọn bàn
 * 
 * Cách chạy:
 * npx tsx tests/e2e.test.ts
 * hoặc: npm run test:e2e
 */

import { 
  TestSuiteRunner, 
  resetTestStorage 
} from './test-env';

import { 
  loginUser, 
  getCurrentUser, 
  addNewReservation, 
  getStoredTables, 
  addDishesToReservation, 
  getStoredMenuItems, 
  updateReservationStatus, 
  getStoredKitchenTickets, 
  updateKitchenItemStatus, 
  checkoutAndSettleReservation, 
  saveStoredTables,
  formatVND
} from '../src/services/storage';

export const runnerE2E = new TestSuiteRunner('MÔI TRƯỜNG TEST TOÀN TRÌNH KHÉP KÍN (E2E)');

export function chayTestToanTrinhE2E(tuDongThoat: boolean = true) {
  runnerE2E.datLai();
  resetTestStorage();

  runnerE2E.inTieuDe('BẮT ĐẦU CHẠY TEST TOÀN TRÌNH KHÉP KÍN (E2E WORKFLOW)');

  // -----------------------------------------------------------------------
  // GIAI ĐOẠN 1: ĐĂNG NHẬP KHÁCH HÀNG
  // -----------------------------------------------------------------------
  runnerE2E.inMuc('1/6', 'Khách hàng đăng nhập vào hệ thống ứng dụng');
  const kqLogin = loginUser('leehung.work03@gmail.com', '123456');
  const user = getCurrentUser();
  const diemKhoiDau = user?.loyaltyPoints || 0;

  runnerE2E.kiemTra(
    `Khách hàng "${user?.name}" đăng nhập thành công. Điểm tích lũy hiện có: ${diemKhoiDau} điểm`,
    kqLogin.success && user !== null
  );

  // -----------------------------------------------------------------------
  // GIAI ĐOẠN 2: ĐẶT BÀN TRƯỚC (BOOKING)
  // -----------------------------------------------------------------------
  runnerE2E.inMuc('2/6', 'Khách chọn phòng VIP và đặt bàn tiệc tối');
  const dsBan = getStoredTables();
  const banVip = dsBan.find(b => b.area === 'vip' && b.capacity >= 4) || dsBan[0];
  const homNay = new Date().toISOString().split('T')[0];

  const donDat = addNewReservation({
    userId: user?.id,
    customerName: user?.name || 'Lê Hùng',
    customerPhone: user?.phone || '0987654321',
    customerEmail: user?.email || 'leehung.work03@gmail.com',
    guestCount: 4,
    bookingDate: homNay,
    arrivalTime: '19:30',
    tableId: banVip.id,
    tableName: banVip.name,
    tableArea: banVip.area,
    selectedDishes: [],
    preOrderTotal: 0,
    depositAmount: 500000,
    totalAmount: 500000,
    occasion: 'Tiếp đón đối tác quan trọng'
  }).reservation;

  const banSauDat = getStoredTables().find(b => b.id === banVip.id);
  runnerE2E.kiemTra(
    `Đặt bàn thành công mã [${donDat.bookingCode}] tại "${banVip.name}". Bàn chuyển status "reserved"`,
    donDat.bookingCode.startsWith('BK-') && banSauDat?.status === 'reserved'
  );

  // -----------------------------------------------------------------------
  // GIAI ĐOẠN 3: GỌI MÓN TRƯỚC (PRE-ORDER)
  // -----------------------------------------------------------------------
  runnerE2E.inMuc('3/6', 'Khách gọi trước món Bò Wagyu A5 và Champagne Dom Pérignon');
  const menu = getStoredMenuItems();
  const boWagyu = menu.find(m => m.id === 'm-04') || menu[0];
  const champagne = menu.find(m => m.id === 'm-23') || menu[1];

  const kqOrderTruoc = addDishesToReservation(donDat.id, [
    { dish: boWagyu, quantity: 4, specialNotes: 'Độ chín: Medium Rare' },
    { dish: champagne, quantity: 2, specialNotes: 'Ướp xô đá sẵn khi vào bàn' }
  ]);

  const tienOrderTruoc = (boWagyu.price * 4) + (champagne.price * 2);
  runnerE2E.kiemTra(
    `Thêm 4 phần Wagyu + 2 chai Champagne. Tổng tiền cập nhật: ${formatVND(tienOrderTruoc)}`,
    kqOrderTruoc.updatedReservation?.totalAmount === tienOrderTruoc
  );

  // -----------------------------------------------------------------------
  // GIAI ĐOẠN 4: KHÁCH ĐẾN NHÀ HÀNG & CHECK-IN NHẬN BÀN
  // -----------------------------------------------------------------------
  runnerE2E.inMuc('4/6', 'Khách tới nhà hàng, lễ tân quét mã check-in nhận bàn VIP');
  updateReservationStatus(donDat.id, 'seated');
  const banKhiKhachNgoi = getStoredTables().find(b => b.id === banVip.id);
  const veBep = getStoredKitchenTickets().find(t => t.bookingCode === donDat.bookingCode);

  runnerE2E.kiemTra(
    `Check-in thành công: Bàn "${banVip.name}" -> OCCUPIED. Vé bếp KDS đã mở sẵn sàng`,
    banKhiKhachNgoi?.status === 'occupied' && veBep !== undefined
  );

  // -----------------------------------------------------------------------
  // GIAI ĐOẠN 5: GỌI THÊM MÓN TẠI BÀN & BẾP HOÀN TẤT CHẾ BIẾN
  // -----------------------------------------------------------------------
  runnerE2E.inMuc('5/6', 'Khách gọi thêm 4 phần Bánh Soufflé Bỉ tại bàn & Bếp ra món');
  const soufffe = menu.find(m => m.id === 'm-21') || menu[2];
  const kqOrderThem = addDishesToReservation(donDat.id, [
    { dish: soufffe, quantity: 4, specialNotes: 'Phục vụ kèm kem tươi Bourbon' }
  ]);

  // Đầu bếp cập nhật món hoàn tất phục vụ
  const veHienTai = getStoredKitchenTickets().find(t => t.bookingCode === donDat.bookingCode);
  if (veHienTai && veHienTai.items.length > 0) {
    updateKitchenItemStatus(veHienTai.id, veHienTai.items[0].id, 'ready');
    updateKitchenItemStatus(veHienTai.id, veHienTai.items[0].id, 'served');
  }

  const tongCuoiCung = tienOrderTruoc + (soufffe.price * 4);
  runnerE2E.kiemTra(
    `Gọi thêm tráng miệng thành công. Tổng bill chốt: ${formatVND(tongCuoiCung)}`,
    kqOrderThem.updatedReservation?.totalAmount === tongCuoiCung
  );

  // -----------------------------------------------------------------------
  // GIAI ĐOẠN 6: THANH TOÁN VIETQR, TÍCH ĐIỂM & HOÀN TẤT DỌN BÀN
  // -----------------------------------------------------------------------
  runnerE2E.inMuc('6/6', 'Khách thanh toán chuyển khoản VietQR, cộng điểm thưởng và bàn dọn dẹp');
  const kqThanhToan = checkoutAndSettleReservation(donDat.id, {
    paymentMethod: 'vietqr',
    paidAmount: tongCuoiCung,
    staffName: 'Lê Thu Thảo (Thu ngân)',
    notes: 'Khách VIP thanh toán chuyển khoản thành công'
  });

  const banSauThanhToan = getStoredTables().find(b => b.id === banVip.id);
  const userSauCung = getCurrentUser();
  const diemSauCung = userSauCung?.loyaltyPoints || 0;

  // Dọn dẹp bàn xong
  const dsBanCapNhat = getStoredTables().map(b => b.id === banVip.id ? { ...b, status: 'available' as const } : b);
  saveStoredTables(dsBanCapNhat);
  const banSanSang = getStoredTables().find(b => b.id === banVip.id);

  const e2eThanhCong = 
    kqThanhToan.updatedReservation?.status === 'completed' &&
    banSauThanhToan?.status === 'cleaning' &&
    diemSauCung > diemKhoiDau &&
    banSanSang?.status === 'available';

  runnerE2E.kiemTra(
    `Hoàn tất chu trình: Đơn chốt COMPLETED -> Tích điểm khách hàng (+${diemSauCung - diemKhoiDau} điểm) -> Bàn sẵn sàng đón lượt khách mới`,
    e2eThanhCong
  );

  const ketQuaTong = runnerE2E.inTongKet();

  if (tuDongThoat && process.argv[1]?.includes('e2e.test.ts')) {
    process.exit(ketQuaTong.fail > 0 ? 1 : 0);
  }

  return ketQuaTong;
}

if (process.argv[1]?.includes('e2e.test.ts')) {
  chayTestToanTrinhE2E(true);
}
