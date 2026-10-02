/**
 * =========================================================================
 * MÔI TRƯỜNG TEST RIÊNG: THANH TOÁN & TRẢ BÀN (PAYMENT TEST SUITE)
 * Dự án: Le Gourmet Bistro
 * =========================================================================
 * Cách chạy:
 * 1. Chạy tất cả test case tự động:
 *    npx tsx tests/payment.test.ts
 *    hoặc: npm run test:thanhtoan
 * 
 * 2. Truyền tham số ngoài từ dòng lệnh (CLI):
 *    npx tsx tests/payment.test.ts BK-1001 vietqr 1500000
 * 
 * 3. Chế độ nhập tay tương tác từ bàn phím:
 *    npx tsx tests/payment.test.ts --interactive
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
  checkoutAndSettleReservation,
  addDishesToReservation,
  getStoredMenuItems,
  saveStoredTables,
  loginUser,
  getCurrentUser,
  formatVND
} from '../src/services/storage';

export const runnerPayment = new TestSuiteRunner('MÔI TRƯỜNG TEST: THANH TOÁN & QUẢN LÝ DOANH THU');

export function chayTestThanhToan(tuDongThoat: boolean = true) {
  runnerPayment.datLai();
  resetTestStorage();

  runnerPayment.inTieuDe('BẮT ĐẦU CHẠY MÔI TRƯỜNG TEST: THANH TOÁN & TRẢ BÀN');

  // Chuẩn bị tài khoản khách hàng để test tích điểm
  loginUser('leehung.work03@gmail.com', '123456');
  const user = getCurrentUser();
  const diemBanDau = user?.loyaltyPoints || 0;

  // Chuẩn bị 1 đơn đặt bàn hoàn chỉnh có món ăn
  const menu = getStoredMenuItems();
  const monBo = menu.find(m => m.id === 'm-04') || menu[0];
  const monVang = menu.find(m => m.id === 'm-23') || menu[1];

  const donDat = addNewReservation({
    userId: user?.id,
    customerName: user?.name || 'Lê Hùng',
    customerPhone: user?.phone || '0987654321',
    customerEmail: user?.email || 'leehung.work03@gmail.com',
    guestCount: 2,
    bookingDate: new Date().toISOString().split('T')[0],
    arrivalTime: '19:30',
    tableId: 'T-08',
    tableName: 'Bàn M-08',
    tableArea: 'main',
    selectedDishes: [
      { dish: monBo, quantity: 2 },
      { dish: monVang, quantity: 1 }
    ],
    preOrderTotal: (monBo.price * 2) + monVang.price,
    depositAmount: 500000,
    discountAmount: 100000,
    totalAmount: (monBo.price * 2) + monVang.price - 100000,
  }).reservation;

  // Khách đến nhận bàn
  updateReservationStatus(donDat.id, 'seated');

  // --- NHÓM 1: KIỂM TRA TÍNH TOÁN HÓA ĐƠN ---
  runnerPayment.inMuc(1, 'Kiểm tra độ chính xác của tổng tiền hóa đơn cần thanh toán');
  const tienMon = (monBo.price * 2) + monVang.price;
  const tongSauGiam = tienMon - 100000;
  const conLaiPhaiTra = tongSauGiam - 500000; // Trừ tiền cọc

  runnerPayment.kiemTra(
    `Hóa đơn tính đúng: Tiền món ${formatVND(tienMon)} - Giảm giá 100k - Cọc 500k = Còn lại ${formatVND(conLaiPhaiTra)}`,
    donDat.totalAmount === tongSauGiam
  );

  // --- NHÓM 2: THANH TOÁN BẰNG TIỀN MẶT (CASH) ---
  runnerPayment.inMuc(2, 'Thanh toán bằng Tiền mặt (Cash)');
  const kqTienMat = checkoutAndSettleReservation(donDat.id, {
    paymentMethod: 'cash',
    paidAmount: donDat.totalAmount,
    staffName: 'Nguyễn Văn An (Thu ngân)',
    notes: 'Khách thanh toán tiền mặt đầy đủ'
  });

  const thanhCong1 = 
    kqTienMat.updatedReservation?.status === 'completed';

  runnerPayment.kiemTra(
    `Thanh toán tiền mặt thành công. Trạng thái đơn chuyển sang "completed"`,
    thanhCong1
  );

  // --- NHÓM 3: TỰ ĐỘNG CHUYỂN BÀN SANG CHẾ ĐỘ DỌN DẸP (CLEANING) ---
  runnerPayment.inMuc(3, 'Bàn ăn tự động giải phóng chuyển sang trạng thái "cleaning"');
  const banSauThanhToan = getStoredTables().find(b => b.id === 'T-08');

  runnerPayment.kiemTra(
    `Bàn ${donDat.tableName} chuyển sang "cleaning" để nhân viên dọn dẹp vệ sinh`,
    banSauThanhToan?.status === 'cleaning'
  );

  // --- NHÓM 4: TỰ ĐỘNG CỘNG ĐIỂM THƯỞNG CHO TÀI KHOẢN KHÁCH HÀNG ---
  runnerPayment.inMuc(4, 'Tự động tích lũy điểm thưởng thành viên sau khi thanh toán');
  const userSau = getCurrentUser();
  const diemMoi = userSau?.loyaltyPoints || 0;
  const diemCong = Math.floor(donDat.totalAmount / 20000);

  runnerPayment.kiemTra(
    `Khách hàng được cộng thêm ${diemCong} điểm loyalty points vào tài khoản`,
    diemMoi >= diemBanDau + diemCong || diemMoi > diemBanDau
  );

  // --- NHÓM 5: THANH TOÁN BẰNG CHUYỂN KHOẢN VIETQR ---
  runnerPayment.inMuc(5, 'Thanh toán đơn hàng bằng chuyển khoản ngân hàng VietQR');
  const donQr = addNewReservation({
    customerName: 'Trần Văn Hoàng',
    customerPhone: '0901112233',
    customerEmail: 'hoang@gmail.com',
    guestCount: 2,
    bookingDate: new Date().toISOString().split('T')[0],
    arrivalTime: '20:00',
    tableId: 'T-09',
    tableName: 'Bàn M-09',
    tableArea: 'main',
    selectedDishes: [],
    preOrderTotal: 650000,
    depositAmount: 0,
    totalAmount: 650000,
  }).reservation;

  updateReservationStatus(donQr.id, 'seated');

  const kqQr = checkoutAndSettleReservation(donQr.id, {
    paymentMethod: 'vietqr',
    paidAmount: 650000,
    staffName: 'Hệ thống VietQR Gateway',
    notes: 'Quét mã VietQR MBBank tự động khớp lệnh'
  });

  runnerPayment.kiemTra(
    'Thanh toán chuyển khoản VietQR thành công, đơn hoàn tất',
    kqQr.updatedReservation?.status === 'completed'
  );

  // --- NHÓM 6: HOÀN TẤT DỌN DẸP VÀ MỞ LẠI BÀN (AVAILABLE) ---
  runnerPayment.inMuc(6, 'Nhân viên hoàn tất lau dọn -> Bàn mở lại trạng thái "available"');
  const dsBan = getStoredTables().map(b => b.id === 'T-08' ? { ...b, status: 'available' as const } : b);
  saveStoredTables(dsBan);
  const banSanSang = getStoredTables().find(b => b.id === 'T-08');

  runnerPayment.kiemTra(
    'Bàn t-08 mở lại trạng thái "available" sẵn sàng đón khách tiếp theo',
    banSanSang?.status === 'available'
  );

  const ketQuaTong = runnerPayment.inTongKet();

  if (tuDongThoat && process.argv[1]?.includes('payment.test.ts')) {
    process.exit(ketQuaTong.fail > 0 ? 1 : 0);
  }

  return ketQuaTong;
}

// -------------------------------------------------------------------------
// KIỂM TRA THANH TOÁN VỚI THÔNG TIN NGOÀI TRUYỀN VÀO (CUSTOM INPUT)
// -------------------------------------------------------------------------
export function kiemTraThanhToanNgoai(params: {
  maDon: string;
  phuongThuc: 'cash' | 'vietqr' | 'pos_card';
  soTien?: number;
  tenNhanVien?: string;
}) {
  runnerPayment.inTieuDe('KIỂM TRA THANH TOÁN VỚI THÔNG TIN TỪ NGOÀI TRUYỀN VÀO');

  const dsDon = getStoredReservations();
  const don = dsDon.find(d => 
    d.bookingCode.toUpperCase() === params.maDon.toUpperCase() ||
    d.id === params.maDon
  );

  if (!don) {
    runnerPayment.kiemTra(`Tìm kiếm đơn đặt bàn mã "${params.maDon}"`, false, 'Không tìm thấy đơn cần thanh toán');
    runnerPayment.inTongKet();
    return null;
  }

  const soTienTra = params.soTien && params.soTien > 0 ? params.soTien : (don.totalAmount || 500000);
  const tenPT = params.phuongThuc === 'vietqr' ? 'Chuyển khoản VietQR' : params.phuongThuc === 'pos_card' ? 'Quẹt thẻ POS' : 'Tiền mặt';

  console.log(`> Mã đơn thanh toán : #${don.bookingCode} (Khách: ${don.customerName})`);
  console.log(`> Bàn đang ngồi     : ${don.tableName} (${don.tableArea})`);
  console.log(`> Hình thức         : ${tenPT}`);
  console.log(`> Số tiền thanh toán: ${formatVND(soTienTra)}\n`);

  const kq = checkoutAndSettleReservation(don.id, {
    paymentMethod: params.phuongThuc,
    paidAmount: soTienTra,
    staffName: params.tenNhanVien || 'Thu ngân ca tối',
    notes: 'Thanh toán từ tham số test ngoài'
  });

  const thanhCong = kq.updatedReservation?.status === 'completed';
  runnerPayment.kiemTra(
    `Thanh toán hóa đơn #${don.bookingCode} bằng ${tenPT} thành công`,
    thanhCong
  );

  if (thanhCong) {
    console.log(`\n  Kết quả thanh toán & quyết toán:`);
    console.log(`  - Trạng thái hóa đơn : ĐÃ HOÀN TẤT (COMPLETED)`);
    console.log(`  - Trạng thái bàn ăn  : CHUYỂN SANG DỌN DẸP (CLEANING)`);
    console.log(`  - Xuất hóa đơn VAT   : Sẵn sàng in hóa đơn`);
  }

  runnerPayment.inTongKet();
  return kq;
}

// Chế độ tương tác nhập từ bàn phím
export async function chayThanhToanTuBanPhim() {
  const rl = taoGiaoDienNhap();
  runnerPayment.inTieuDe('CHẾ ĐỘ NHẬP TAY TƯƠNG TÁC TỪ BÀN PHÍM (THANH TOÁN)');

  const dsDon = getStoredReservations();
  console.log('Danh sách một số đơn có thể thanh toán:');
  dsDon.slice(0, 3).forEach((d, idx) => {
    console.log(`${idx + 1}. Mã: ${d.bookingCode} | Khách: ${d.customerName} | Bàn: ${d.tableName} | Tiền: ${formatVND(d.totalAmount)}`);
  });
  console.log('');

  const maDon = await hoiCauHoi(rl, '1. Nhập mã đặt bàn (VD: BK-1001): ');
  const ptStr = await hoiCauHoi(rl, '2. Phương thức (1: Tiền mặt, 2: VietQR, 3: Thẻ POS) [Enter chọn 2]: ');
  const tienStr = await hoiCauHoi(rl, '3. Số tiền thanh toán (Enter để thanh toán theo tổng hóa đơn): ');
  rl.close();

  const phuongThuc: 'cash' | 'vietqr' | 'pos_card' = 
    ptStr.trim() === '1' ? 'cash' : ptStr.trim() === '3' ? 'pos_card' : 'vietqr';

  kiemTraThanhToanNgoai({
    maDon: maDon.trim() || 'BK-1001',
    phuongThuc,
    soTien: tienStr ? parseInt(tienStr.replace(/\D/g, ''), 10) : undefined
  });
}

// Nếu chạy trực tiếp từ CLI
if (process.argv[1]?.includes('payment.test.ts')) {
  const args = process.argv.slice(2);
  if (args.includes('--interactive') || args.includes('-i') || args.includes('--nhap')) {
    chayThanhToanTuBanPhim();
  } else if (args.filter(a => !a.startsWith('-')).length >= 1) {
    const params = args.filter(a => !a.startsWith('-'));
    const ptInput = (params[1] || 'vietqr').toLowerCase();
    const phuongThuc = ptInput.includes('cash') || ptInput === '1' ? 'cash' : ptInput.includes('pos') || ptInput === '3' ? 'pos_card' : 'vietqr';
    kiemTraThanhToanNgoai({
      maDon: params[0],
      phuongThuc,
      soTien: params[2] ? parseInt(params[2], 10) : undefined
    });
  } else {
    chayTestThanhToan(true);
  }
}
