/**
 * =========================================================================
 * MÔI TRƯỜNG TEST RIÊNG: ĐẶT BÀN & QUẢN LÝ BÀN (BOOKING TEST SUITE)
 * Dự án: Le Gourmet Bistro
 * =========================================================================
 * Cách chạy:
 * 1. Chạy tất cả test case tự động:
 *    npx tsx tests/booking.test.ts
 *    hoặc: npm run test:datban
 * 
 * 2. Truyền tham số ngoài từ dòng lệnh (CLI):
 *    npx tsx tests/booking.test.ts "Lê Hùng" 0987654321 4 vip 2026-10-15 19:00
 * 
 * 3. Chế độ nhập tay tương tác từ bàn phím:
 *    npx tsx tests/booking.test.ts --interactive
 */

import { 
  TestSuiteRunner, 
  resetTestStorage, 
  taoGiaoDienNhap, 
  hoiCauHoi 
} from './test-env';

import { 
  getStoredTables, 
  getStoredReservations, 
  addNewReservation, 
  updateReservationStatus, 
  loginUser, 
  getCurrentUser,
  getStoredEmailLogs
} from '../src/services/storage';

export const runnerBooking = new TestSuiteRunner('MÔI TRƯỜNG TEST: ĐẶT BÀN & ĐIỀU PHỐI BÀN');

export function chayTestDatBan(tuDongThoat: boolean = true) {
  runnerBooking.datLai();
  resetTestStorage();

  runnerBooking.inTieuDe('BẮT ĐẦU CHẠY MÔI TRƯỜNG TEST: ĐẶT BÀN');

  // --- NHÓM 1: KIỂM TRA SƠ ĐỒ VÀ TRẠNG THÁI BÀN BAN ĐẦU ---
  runnerBooking.inMuc(1, 'Lấy danh sách bàn ban đầu và kiểm tra khu vực');
  const danhSachBan = getStoredTables();
  const coBanSanhChinh = danhSachBan.some(b => b.area === 'main');
  const coBanVip = danhSachBan.some(b => b.area === 'vip');
  const coBanSanVuon = danhSachBan.some(b => b.area === 'garden');
  const coBanRooftop = danhSachBan.some(b => b.area === 'rooftop');

  runnerBooking.kiemTra(
    'Hệ thống có đầy đủ các khu vực: Sảnh chính, VIP, Sân vườn, Rooftop',
    danhSachBan.length > 0 && coBanSanhChinh && coBanVip && coBanSanVuon && coBanRooftop
  );

  // --- NHÓM 2: ĐẶT BÀN THÀNH CÔNG (HAPPY PATHS) ---
  runnerBooking.inMuc(2, 'Tạo đơn đặt bàn đơn lẻ (Tiệc 2 người tại Sảnh Chính)');
  const banSanhChinh = danhSachBan.find(b => b.area === 'main' && b.capacity >= 2) || danhSachBan[0];
  const ngayDat = new Date().toISOString().split('T')[0];

  const donDat1 = addNewReservation({
    customerName: 'Nguyễn Thu Trang',
    customerPhone: '0912345678',
    customerEmail: 'thutrang@gmail.com',
    guestCount: 2,
    bookingDate: ngayDat,
    arrivalTime: '19:00',
    tableId: banSanhChinh.id,
    tableName: banSanhChinh.name,
    tableArea: banSanhChinh.area,
    selectedDishes: [],
    preOrderTotal: 0,
    depositAmount: 200000,
    totalAmount: 200000,
    specialRequests: 'Bàn cạnh cửa sổ thoáng mát'
  });

  const taoThanhCong = 
    donDat1.reservation.id.startsWith('res-') &&
    donDat1.reservation.bookingCode.startsWith('BK-') &&
    donDat1.reservation.status === 'confirmed';

  runnerBooking.kiemTra(
    `Tạo đơn đặt bàn thành công mã [${donDat1.reservation.bookingCode}], trạng thái confirmed`,
    taoThanhCong
  );

  runnerBooking.inMuc(3, 'Kiểm tra trạng thái bàn sau khi đặt ngày hôm nay');
  const banSauDat = getStoredTables().find(b => b.id === banSanhChinh.id);
  runnerBooking.kiemTra(
    `Bàn ${banSanhChinh.name} tự động chuyển sang trạng thái "reserved" kèm mã đơn`,
    banSauDat?.status === 'reserved' && banSauDat.currentReservationId === donDat1.reservation.bookingCode
  );

  runnerBooking.inMuc(4, 'Tự động tạo email xác nhận đặt bàn');
  const emailLogs = getStoredEmailLogs();
  const emailXacNhan = emailLogs.find(e => e.bookingCode === donDat1.reservation.bookingCode);
  runnerBooking.kiemTra(
    'Hệ thống tự động sinh log email xác nhận gửi đến khách hàng',
    emailXacNhan !== undefined && emailXacNhan.toEmail === 'thutrang@gmail.com'
  );

  // --- NHÓM 3: ĐẶT BÀN VỚI TÀI KHOẢN THÀNH VIÊN & TÍCH ĐIỂM ---
  runnerBooking.inMuc(5, 'Thành viên đã đăng nhập đặt bàn được tích điểm thưởng');
  loginUser('leehung.work03@gmail.com', '123456');
  const userTruoc = getCurrentUser();
  const diemTruoc = userTruoc?.loyaltyPoints || 0;

  const donDatThanhVien = addNewReservation({
    userId: userTruoc?.id,
    customerName: userTruoc?.name || 'Lê Hùng',
    customerPhone: userTruoc?.phone || '0987654321',
    customerEmail: userTruoc?.email || 'leehung.work03@gmail.com',
    guestCount: 4,
    bookingDate: ngayDat,
    arrivalTime: '20:00',
    tableId: 'T-02',
    tableName: 'Bàn M-02',
    tableArea: 'main',
    selectedDishes: [],
    preOrderTotal: 800000,
    depositAmount: 500000,
    totalAmount: 800000,
  });

  const userSau = getCurrentUser();
  const diemSau = userSau?.loyaltyPoints || 0;
  runnerBooking.kiemTra(
    `Thành viên đặt đơn 800.000đ được tích điểm thưởng tự động (+${donDatThanhVien.reservation.pointsEarned} điểm)`,
    diemSau > diemTruoc && (donDatThanhVien.reservation.pointsEarned || 0) >= 20
  );

  // --- NHÓM 4: ĐẶT TIỆC GHÉP BÀN ĐÔNG NGƯỜI (MULTI-TABLE MERGING) ---
  runnerBooking.inMuc(6, 'Đặt tiệc đoàn đông người ghép 2 bàn cùng lúc');
  const donGhepBan = addNewReservation({
    customerName: 'Công Ty Công Nghệ VTI',
    customerPhone: '0977889900',
    customerEmail: 'party@vti.com.vn',
    guestCount: 16,
    bookingDate: ngayDat,
    arrivalTime: '18:30',
    tableId: 'T-03',
    tableIds: ['T-03', 'T-04'],
    tableName: 'Cụm Bàn M-03 & M-04',
    tableArea: 'main',
    selectedDishes: [],
    preOrderTotal: 0,
    depositAmount: 1000000,
    totalAmount: 1000000,
    occasion: 'Liên hoan công ty'
  });

  const dsBanSauGhep = getStoredTables();
  const ban3 = dsBanSauGhep.find(b => b.id === 'T-03');
  const ban4 = dsBanSauGhep.find(b => b.id === 'T-04');

  runnerBooking.kiemTra(
    'Cả 2 bàn ghép t-03 và t-04 đều được gán mã đặt bàn và chuyển status reserved',
    ban3?.status === 'reserved' && ban4?.status === 'reserved' &&
    donGhepBan.reservation.tableIds?.length === 2
  );

  // --- NHÓM 5: HỦY ĐẶT BÀN VÀ GIẢI PHÓNG BÀN ---
  runnerBooking.inMuc(7, 'Hủy đơn đặt bàn và tự động giải phóng bàn trở về available');
  const kqHuy = updateReservationStatus(donDat1.reservation.id, 'cancelled');
  const banSauHuy = getStoredTables().find(b => b.id === banSanhChinh.id);

  runnerBooking.kiemTra(
    'Đơn đặt chuyển sang cancelled và bàn ăn tự động mở lại status "available"',
    kqHuy.updated?.status === 'cancelled' && banSauHuy?.status === 'available'
  );

  const ketQuaTong = runnerBooking.inTongKet();

  if (tuDongThoat && process.argv[1]?.includes('booking.test.ts')) {
    process.exit(ketQuaTong.fail > 0 ? 1 : 0);
  }

  return ketQuaTong;
}

// -------------------------------------------------------------------------
// KIỂM TRA ĐẶT BÀN VỚI THÔNG TIN NGOÀI TRUYỀN VÀO (CUSTOM INPUT)
// -------------------------------------------------------------------------
export function kiemTraDatBanNgoai(params: {
  tenKhach: string;
  sdt: string;
  email?: string;
  soKhach: number;
  khuVuc?: string;
  ngay?: string;
  gio?: string;
  ghiChu?: string;
}) {
  runnerBooking.inTieuDe('KIỂM TRA ĐẶT BÀN VỚI THÔNG TIN NGOÀI TRUYỀN VÀO');

  const ngayDat = params.ngay || new Date().toISOString().split('T')[0];
  const gioDat = params.gio || '19:00';
  const khuVucChon = (params.khuVuc || 'main') as any;

  console.log(`> Tên khách hàng : "${params.tenKhach}"`);
  console.log(`> Số điện thoại  : "${params.sdt}"`);
  console.log(`> Số lượng khách : ${params.soKhach} người`);
  console.log(`> Khu vực yêu cầu: ${khuVucChon.toUpperCase()}`);
  console.log(`> Thời gian đến  : ${gioDat} ngày ${ngayDat}`);

  // Tìm bàn phù hợp
  const dsBan = getStoredTables();
  const banPhuHop = dsBan.find(b => b.area === khuVucChon && b.capacity >= params.soKhach) || dsBan[0];

  const kq = addNewReservation({
    customerName: params.tenKhach,
    customerPhone: params.sdt,
    customerEmail: params.email || `${params.sdt}@guest.vn`,
    guestCount: Number(params.soKhach),
    bookingDate: ngayDat,
    arrivalTime: gioDat,
    tableId: banPhuHop.id,
    tableName: banPhuHop.name,
    tableArea: banPhuHop.area,
    selectedDishes: [],
    preOrderTotal: 0,
    depositAmount: 0,
    totalAmount: 0,
    specialRequests: params.ghiChu || 'Đặt từ tham số ngoài'
  });

  const thanhCong = kq.reservation && kq.reservation.status === 'confirmed';
  runnerBooking.kiemTra(`Tạo thành công đơn đặt bàn cho khách "${params.tenKhach}"`, thanhCong);

  if (thanhCong) {
    console.log(`\n  Chi tiết đặt bàn tạo thành công:`);
    console.log(`  - Mã đặt bàn (Booking Code): ${kq.reservation.bookingCode}`);
    console.log(`  - Tên bàn phân bổ          : ${kq.reservation.tableName} (${kq.reservation.tableArea})`);
    console.log(`  - Trạng thái đơn           : ${kq.reservation.status.toUpperCase()}`);
    console.log(`  - Email thông báo          : Đã gửi mô phỏng tới ${kq.reservation.customerEmail}`);
  }

  runnerBooking.inTongKet();
  return kq;
}

// Chế độ tương tác nhập từ bàn phím
export async function chayDatBanTuBanPhim() {
  const rl = taoGiaoDienNhap();
  runnerBooking.inTieuDe('CHẾ ĐỘ NHẬP TAY TƯƠNG TÁC TỪ BÀN PHÍM (ĐẶT BÀN)');

  const tenKhach = await hoiCauHoi(rl, '1. Nhập tên khách hàng (VD: Lê Hùng): ');
  const sdt = await hoiCauHoi(rl, '2. Nhập số điện thoại (VD: 0987654321): ');
  const soKhachStr = await hoiCauHoi(rl, '3. Nhập số lượng khách (VD: 4): ');
  const khuVuc = await hoiCauHoi(rl, '4. Nhập khu vực (main / vip / garden / rooftop) [Enter để chọn main]: ');
  const gio = await hoiCauHoi(rl, '5. Nhập giờ đến (VD: 19:30) [Enter để chọn 19:00]: ');
  const ghiChu = await hoiCauHoi(rl, '6. Nhập ghi chú đặc biệt: ');
  rl.close();

  kiemTraDatBanNgoai({
    tenKhach: tenKhach || 'Khách Nhập Ngoài',
    sdt: sdt || '0901234567',
    soKhach: parseInt(soKhachStr, 10) || 2,
    khuVuc: khuVuc.trim() || 'main',
    gio: gio.trim() || '19:00',
    ghiChu
  });
}

// Nếu chạy trực tiếp từ CLI
if (process.argv[1]?.includes('booking.test.ts')) {
  const args = process.argv.slice(2);
  if (args.includes('--interactive') || args.includes('-i') || args.includes('--nhap')) {
    chayDatBanTuBanPhim();
  } else if (args.filter(a => !a.startsWith('-')).length >= 3) {
    const params = args.filter(a => !a.startsWith('-'));
    kiemTraDatBanNgoai({
      tenKhach: params[0],
      sdt: params[1],
      soKhach: parseInt(params[2], 10) || 2,
      khuVuc: params[3] || 'main',
      ngay: params[4],
      gio: params[5]
    });
  } else {
    chayTestDatBan(true);
  }
}
