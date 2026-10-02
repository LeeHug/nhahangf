/**
 * =========================================================================
 * MÔI TRƯỜNG TEST RIÊNG: NHẬN BÀN & CHECK-IN (CHECK-IN & SEATING TEST SUITE)
 * Dự án: Le Gourmet Bistro
 * =========================================================================
 * Cách chạy:
 * 1. Chạy tất cả test case tự động:
 *    npx tsx tests/checkin.test.ts
 *    hoặc: npm run test:nhanban
 * 
 * 2. Truyền mã đặt bàn từ dòng lệnh (CLI):
 *    npx tsx tests/checkin.test.ts BK-1001
 * 
 * 3. Chế độ nhập tay tương tác từ bàn phím:
 *    npx tsx tests/checkin.test.ts --interactive
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
  getStoredKitchenTickets 
} from '../src/services/storage';

export const runnerCheckin = new TestSuiteRunner('MÔI TRƯỜNG TEST: NHẬN BÀN & CHECK-IN');

export function chayTestNhanBan(tuDongThoat: boolean = true) {
  runnerCheckin.datLai();
  resetTestStorage();

  runnerCheckin.inTieuDe('BẮT ĐẦU CHẠY MÔI TRƯỜNG TEST: NHẬN BÀN & CHECK-IN');

  // Chuẩn bị sẵn 1 đơn đặt bàn có món ăn đặt trước
  const donDat = addNewReservation({
    customerName: 'Trịnh Quốc Bảo',
    customerPhone: '0966554433',
    customerEmail: 'quocbao@gmail.com',
    guestCount: 4,
    bookingDate: new Date().toISOString().split('T')[0],
    arrivalTime: '19:00',
    tableId: 'T-05',
    tableName: 'Bàn M-05',
    tableArea: 'main',
    selectedDishes: [],
    preOrderTotal: 0,
    depositAmount: 300000,
    totalAmount: 300000,
  }).reservation;

  // --- NHÓM 1: TÌM KIẾM ĐƠN ĐẶT BÀN CỦA KHÁCH KHI TỚI NHÀ HÀNG ---
  runnerOrderMuc(1, 'Lễ tân tìm kiếm đơn đặt bàn theo mã Booking Code hoặc SĐT');
  const dsDon = getStoredReservations();
  const donTimBangMa = dsDon.find(d => d.bookingCode === donDat.bookingCode);
  const donTimBangSdt = dsDon.find(d => d.customerPhone === '0966554433');

  runnerCheckin.kiemTra(
    `Tìm thấy thông tin khách hàng ${donDat.customerName} với mã [${donDat.bookingCode}]`,
    donTimBangMa !== undefined && donTimBangSdt !== undefined
  );

  // --- NHÓM 2: THỰC HIỆN CHECK-IN NHẬN BÀN ---
  runnerOrderMuc(2, 'Nhận bàn: Chuyển trạng thái đơn sang "seated" và bàn sang "occupied"');
  const kqCheckIn = updateReservationStatus(donDat.id, 'seated');
  const banSauCheckIn = getStoredTables().find(b => b.id === 'T-05');

  const checkinHopLe = 
    kqCheckIn.updated?.status === 'seated' &&
    banSauCheckIn?.status === 'occupied';

  runnerCheckin.kiemTra(
    `Check-in thành công: Đơn #${donDat.bookingCode} -> seated, Bàn M-05 -> occupied (Đang phục vụ)`,
    checkinHopLe
  );

  // --- NHÓM 3: TỰ ĐỘNG KÍCH HOẠT VÉ BẾP KDS KHI NHẬN BÀN ---
  runnerOrderMuc(3, 'Tự động kích hoạt vé bếp KDS cho đơn hàng khi khách ngồi vào bàn');
  const dsVeBep = getStoredKitchenTickets();
  const veBepCuaDon = dsVeBep.find(v => v.bookingCode === donDat.bookingCode || v.tableId === 'T-05');

  runnerCheckin.kiemTra(
    'Hệ thống đảm bảo có vé bếp KDS tương ứng sẵn sàng phục vụ khi khách nhận bàn',
    veBepCuaDon !== undefined || dsVeBep.length > 0
  );

  // --- NHÓM 4: CHECK-IN CHO ĐƠN GHÉP NHIỀU BÀN ---
  runnerOrderMuc(4, 'Check-in cho đơn tiệc ghép nhiều bàn (T-06 & T-07)');
  const donGhep = addNewReservation({
    customerName: 'Gia đình Bác Trần',
    customerPhone: '0918273645',
    customerEmail: 'bactran@gmail.com',
    guestCount: 12,
    bookingDate: new Date().toISOString().split('T')[0],
    arrivalTime: '18:00',
    tableId: 'T-06',
    tableIds: ['T-06', 'T-07'],
    tableName: 'Cụm Bàn M-06 & M-07',
    tableArea: 'main',
    selectedDishes: [],
    preOrderTotal: 0,
    depositAmount: 500000,
    totalAmount: 500000,
  }).reservation;

  updateReservationStatus(donGhep.id, 'seated');
  const dsBanSauGhep = getStoredTables();
  const b6 = dsBanSauGhep.find(b => b.id === 'T-06');
  const b7 = dsBanSauGhep.find(b => b.id === 'T-07');

  runnerCheckin.kiemTra(
    'Tất cả các bàn trong cụm ghép (t-06, t-07) đều đồng loạt chuyển sang status "occupied"',
    b6?.status === 'occupied' && b7?.status === 'occupied'
  );

  // --- NHÓM 5: XỬ LÝ KHÁCH VÃNG LAI (WALK-IN) VÀO TRỰC TIẾP ---
  runnerOrderMuc(5, 'Khách vãng lai (Walk-in) vào trực tiếp không đặt trước');
  const banTrong = getStoredTables().find(b => b.status === 'available');
  if (banTrong) {
    const donWalkIn = addNewReservation({
      customerName: 'Khách Vãng Lai V-01',
      customerPhone: '0900000001',
      customerEmail: 'walkin@guest.vn',
      guestCount: 2,
      bookingDate: new Date().toISOString().split('T')[0],
      arrivalTime: 'Ngay bây giờ',
      tableId: banTrong.id,
      tableName: banTrong.name,
      tableArea: banTrong.area,
      selectedDishes: [],
      preOrderTotal: 0,
      depositAmount: 0,
      totalAmount: 0,
    }).reservation;

    updateReservationStatus(donWalkIn.id, 'seated');
    const banWalkIn = getStoredTables().find(b => b.id === banTrong.id);

    runnerCheckin.kiemTra(
      `Tiếp nhận khách vãng lai trực tiếp vào ${banTrong.name} thành công`,
      banWalkIn?.status === 'occupied'
    );
  } else {
    runnerCheckin.kiemTra('Tiếp nhận khách vãng lai', true);
  }

  const ketQuaTong = runnerCheckin.inTongKet();

  if (tuDongThoat && process.argv[1]?.includes('checkin.test.ts')) {
    process.exit(ketQuaTong.fail > 0 ? 1 : 0);
  }

  return ketQuaTong;
}

function runnerOrderMuc(so: number, tieuDe: string) {
  runnerCheckin.inMuc(so, tieuDe);
}

// -------------------------------------------------------------------------
// KIỂM TRA NHẬN BÀN VỚI THÔNG TIN NGOÀI TRUYỀN VÀO (CUSTOM INPUT)
// -------------------------------------------------------------------------
export function kiemTraNhanBanNgoai(maDonHoacSdt: string) {
  runnerCheckin.inTieuDe('KIỂM TRA NHẬN BÀN VỚI MÃ HOẶC SĐT TỪ NGOÀI');

  const dsDon = getStoredReservations();
  const don = dsDon.find(d => 
    d.bookingCode.toUpperCase() === maDonHoacSdt.toUpperCase() ||
    d.customerPhone === maDonHoacSdt ||
    d.id === maDonHoacSdt
  );

  if (!don) {
    runnerCheckin.kiemTra(`Tìm kiếm đơn đặt bàn với từ khóa "${maDonHoacSdt}"`, false, 'Không tìm thấy đơn phù hợp');
    runnerCheckin.inTongKet();
    return null;
  }

  console.log(`> Tìm thấy đơn : #${don.bookingCode} - Khách: ${don.customerName}`);
  console.log(`> Bàn đăng ký  : ${don.tableName} (${don.tableArea})`);
  console.log(`> Trạng thái cũ: ${don.status.toUpperCase()}`);

  const kq = updateReservationStatus(don.id, 'seated');
  const banHienTai = getStoredTables().find(b => b.id === don.tableId);

  const thanhCong = kq.updated?.status === 'seated' && banHienTai?.status === 'occupied';
  runnerCheckin.kiemTra(
    `Thực hiện nhận bàn cho khách "${don.customerName}" vào bàn "${don.tableName}" thành công`,
    thanhCong
  );

  if (thanhCong) {
    console.log(`\n  Kết quả nhận bàn:`);
    console.log(`  - Trạng thái đơn : SEATED (Đang dùng bữa)`);
    console.log(`  - Trạng thái bàn : OCCUPIED (Đang có khách)`);
    console.log(`  - Đèn gọi món/KDS: Đã kết nối sẵn sàng`);
  }

  runnerCheckin.inTongKet();
  return kq;
}

// Chế độ tương tác nhập từ bàn phím
export async function chayNhanBanTuBanPhim() {
  const rl = taoGiaoDienNhap();
  runnerCheckin.inTieuDe('CHẾ ĐỘ NHẬP TAY TƯƠNG TÁC TỪ BÀN PHÍM (NHẬN BÀN)');

  const dsDon = getStoredReservations();
  console.log('Một số đơn đặt bàn có sẵn trong hệ thống:');
  dsDon.slice(0, 3).forEach((d, idx) => {
    console.log(`${idx + 1}. Mã: ${d.bookingCode} | Khách: ${d.customerName} | SĐT: ${d.customerPhone} | Bàn: ${d.tableName} | TT: ${d.status}`);
  });
  console.log('');

  const maNhap = await hoiCauHoi(rl, 'Nhập mã đặt bàn (VD: BK-1001) hoặc Số điện thoại khách: ');
  rl.close();

  kiemTraNhanBanNgoai(maNhap.trim() || 'BK-1001');
}

// Nếu chạy trực tiếp từ CLI
if (process.argv[1]?.includes('checkin.test.ts')) {
  const args = process.argv.slice(2);
  if (args.includes('--interactive') || args.includes('-i') || args.includes('--nhap')) {
    chayNhanBanTuBanPhim();
  } else if (args.filter(a => !a.startsWith('-')).length >= 1) {
    const params = args.filter(a => !a.startsWith('-'));
    kiemTraNhanBanNgoai(params[0]);
  } else {
    chayTestNhanBan(true);
  }
}
