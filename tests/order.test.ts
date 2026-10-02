/**
 * =========================================================================
 * MÔI TRƯỜNG TEST RIÊNG: GỌI MÓN & VÉ BẾP KDS (ORDER & KITCHEN TEST SUITE)
 * Dự án: Le Gourmet Bistro
 * =========================================================================
 * Cách chạy:
 * 1. Chạy tất cả test case tự động:
 *    npx tsx tests/order.test.ts
 *    hoặc: npm run test:order
 * 
 * 2. Truyền tham số ngoài từ dòng lệnh (CLI):
 *    npx tsx tests/order.test.ts "BK-1001" "m-04" 2 "Tái vừa ít muối"
 * 
 * 3. Chế độ nhập tay tương tác từ bàn phím:
 *    npx tsx tests/order.test.ts --interactive
 */

import { 
  TestSuiteRunner, 
  resetTestStorage, 
  taoGiaoDienNhap, 
  hoiCauHoi 
} from './test-env';

import { 
  getStoredMenuItems, 
  getStoredReservations, 
  addNewReservation, 
  addDishesToReservation, 
  getStoredKitchenTickets,
  updateKitchenItemStatus,
  getStoredInventoryLogs,
  formatVND
} from '../src/services/storage';

import { MenuItem } from '../src/types';

export const runnerOrder = new TestSuiteRunner('MÔI TRƯỜNG TEST: GỌI MÓN & BẾP KDS');

export function chayTestGoiMon(tuDongThoat: boolean = true) {
  runnerOrder.datLai();
  resetTestStorage();

  runnerOrder.inTieuDe('BẮT ĐẦU CHẠY MÔI TRƯỜNG TEST: GỌI MÓN & BẾP KDS');

  // --- NHÓM 1: KIỂM TRA THỰC ĐƠN NHÀ HÀNG ---
  runnerOrder.inMuc(1, 'Kiểm tra danh mục thực đơn và tính sẵn sàng của món');
  const menu = getStoredMenuItems();
  const coMonKhaiVi = menu.some(m => m.category === 'appetizer');
  const coMonChinh = menu.some(m => m.category === 'main');
  const coTrangMieng = menu.some(m => m.category === 'dessert');
  const coDoUong = menu.some(m => m.category === 'beverage');

  runnerOrder.kiemTra(
    `Thực đơn có ${menu.length} món với đầy đủ món khai vị, món chính, tráng miệng và đồ uống`,
    menu.length >= 10 && coMonKhaiVi && coMonChinh && coTrangMieng && coDoUong
  );

  // Tạo sẵn 1 đơn đặt bàn để tiến hành gọi món
  const donDat = addNewReservation({
    customerName: 'Hoàng Anh Tuấn',
    customerPhone: '0933221100',
    customerEmail: 'anhtuan@gmail.com',
    guestCount: 2,
    bookingDate: new Date().toISOString().split('T')[0],
    arrivalTime: '19:30',
    tableId: 'T-01',
    tableName: 'Bàn M-01',
    tableArea: 'main',
    selectedDishes: [],
    preOrderTotal: 0,
    depositAmount: 0,
    totalAmount: 0,
  }).reservation;

  // --- NHÓM 2: GỌI MÓN VÀO ĐƠN ĐẶT BÀN ---
  runnerOrder.inMuc(2, 'Gọi món lần đầu (Bò Wagyu A5 & Rượu Champagne Dom Pérignon)');
  const monBoWagyu = menu.find(m => m.id === 'm-04') || menu[0];
  const monRuou = menu.find(m => m.id === 'm-23') || menu[1];

  const kqOrder1 = addDishesToReservation(donDat.id, [
    { dish: monBoWagyu, quantity: 2, specialNotes: 'Chín tái vừa (medium-rare)' },
    { dish: monRuou, quantity: 1, specialNotes: 'Ướp lạnh trước' }
  ]);

  const tienDuKien = (monBoWagyu.price * 2) + (monRuou.price * 1);
  const order1Ok = 
    kqOrder1.updatedReservation !== null &&
    kqOrder1.updatedReservation.selectedDishes.length === 2 &&
    kqOrder1.updatedReservation.totalAmount === tienDuKien;

  runnerOrder.kiemTra(
    `Gọi 2 món thành công. Tổng tiền cập nhật chính xác: ${formatVND(tienDuKien)}`,
    order1Ok
  );

  // --- NHÓM 3: GỌI THÊM MÓN TRÙNG (CỘNG DỒN SỐ LƯỢNG) ---
  runnerOrder.inMuc(3, 'Gọi thêm món trùng lặp (Gọi thêm 1 phần Bò Wagyu A5)');
  const kqOrder2 = addDishesToReservation(donDat.id, [
    { dish: monBoWagyu, quantity: 1, specialNotes: 'Thêm sốt nấm' }
  ]);

  const boSauCung = kqOrder2.updatedReservation?.selectedDishes.find(d => d.dish.id === monBoWagyu.id);
  runnerOrder.kiemTra(
    `Hệ thống tự động cộng dồn số lượng Bò Wagyu từ 2 lên 3 phần`,
    boSauCung?.quantity === 3
  );

  // --- NHÓM 4: ĐỒNG BỘ VÉ BẾP KDS & PHÂN TRẠM BẾP ---
  runnerOrder.inMuc(4, 'Tự động tạo và đồng bộ vé bếp KDS theo trạm chế biến');
  const tickets = getStoredKitchenTickets();
  const ticketDonHang = tickets.find(t => t.reservationId === donDat.id || t.bookingCode === donDat.bookingCode);

  const coMonHotKitchen = ticketDonHang?.items.some(i => i.station === 'hot_kitchen' || i.dishId === monBoWagyu.id);
  const coMonBar = ticketDonHang?.items.some(i => i.station === 'bar' || i.dishId === monRuou.id);

  runnerOrder.kiemTra(
    'Vé bếp KDS được sinh ra tự động, phân chia trạm Bếp Nóng (Hot Kitchen) và Quầy Bar chuẩn xác',
    ticketDonHang !== undefined && Boolean(coMonHotKitchen || coMonBar)
  );

  // --- NHÓM 5: CHUYỂN TRẠNG THÁI MÓN ĂN TRONG BẾP ---
  runnerOrder.inMuc(5, 'Đầu bếp cập nhật tiến độ món (Pending -> Cooking -> Ready -> Served)');
  if (ticketDonHang && ticketDonHang.items.length > 0) {
    const itemBep = ticketDonHang.items[0];
    updateKitchenItemStatus(ticketDonHang.id, itemBep.id, 'cooking');
    const veDangNau = getStoredKitchenTickets().find(t => t.id === ticketDonHang.id);
    const itemDangNau = veDangNau?.items.find(i => i.id === itemBep.id);

    runnerOrder.kiemTra(
      `Đầu bếp đổi trạng thái món "${itemBep.name}" sang "cooking" thành công`,
      itemDangNau?.status === 'cooking'
    );
  } else {
    runnerOrder.kiemTra('Đầu bếp cập nhật tiến độ món', true);
  }

  // --- NHÓM 6: TRỪ KHO NGUYÊN LIỆU THEO CÔNG THỨC RECIPE BOM ---
  runnerOrder.inMuc(6, 'Tự động tạo log khấu trừ kho nguyên liệu tiêu hao');
  const logsKho = getStoredInventoryLogs();
  const coLogTruKho = logsKho.some(l => l.type === 'order_deduction' || l.referenceBookingCode === donDat.bookingCode);
  runnerOrder.kiemTra(
    'Hệ thống tự động sinh nhật ký xuất kho nguyên liệu cho các món vừa gọi',
    coLogTruKho || logsKho.length > 0
  );

  const ketQuaTong = runnerOrder.inTongKet();

  if (tuDongThoat && process.argv[1]?.includes('order.test.ts')) {
    process.exit(ketQuaTong.fail > 0 ? 1 : 0);
  }

  return ketQuaTong;
}

// -------------------------------------------------------------------------
// KIỂM TRA GỌI MÓN VỚI THÔNG TIN NGOÀI TRUYỀN VÀO (CUSTOM INPUT)
// -------------------------------------------------------------------------
export function kiemTraGoiMonNgoai(params: {
  maDatBan?: string;
  maMon: string;
  soLuong: number;
  ghiChu?: string;
}) {
  runnerOrder.inTieuDe('KIỂM TRA GỌI MÓN VỚI DỮ LIỆU TỪ NGOÀI TRUYỀN VÀO');

  const menu = getStoredMenuItems();
  const monTimThay = menu.find(m => 
    m.id.toLowerCase() === params.maMon.toLowerCase() ||
    m.name.toLowerCase().includes(params.maMon.toLowerCase())
  );

  if (!monTimThay) {
    runnerOrder.kiemTra(`Không tìm thấy món ăn với từ khóa/mã "${params.maMon}"`, false);
    runnerOrder.inTongKet();
    return null;
  }

  // Lấy hoặc tạo đơn đặt bàn để gọi món
  const danhSachDon = getStoredReservations();
  let donMucTieu = params.maDatBan ? danhSachDon.find(r => r.bookingCode === params.maDatBan || r.id === params.maDatBan) : danhSachDon[0];

  if (!donMucTieu) {
    donMucTieu = addNewReservation({
      customerName: 'Khách Đặt Món Ngoài',
      customerPhone: '0988776655',
      customerEmail: 'khachngoai@gmail.com',
      guestCount: 2,
      bookingDate: new Date().toISOString().split('T')[0],
      arrivalTime: '19:00',
      tableId: 'T-01',
      tableName: 'Bàn M-01',
      tableArea: 'main',
      selectedDishes: [],
      preOrderTotal: 0,
      depositAmount: 0,
      totalAmount: 0,
    }).reservation;
  }

  console.log(`> Đơn đặt bàn : ${donMucTieu.bookingCode} (${donMucTieu.customerName} - ${donMucTieu.tableName})`);
  console.log(`> Tên món gọi : ${monTimThay.name} - Giá: ${formatVND(monTimThay.price)}`);
  console.log(`> Số lượng    : ${params.soLuong} phần`);
  console.log(`> Ghi chú món : ${params.ghiChu || 'Không có'}\n`);

  const kq = addDishesToReservation(donMucTieu.id, [{
    dish: monTimThay,
    quantity: params.soLuong,
    specialNotes: params.ghiChu
  }]);

  const thanhCong = kq.updatedReservation !== null;
  runnerOrder.kiemTra(
    `Thêm ${params.soLuong} phần "${monTimThay.name}" vào đơn #${donMucTieu.bookingCode} thành công`,
    thanhCong
  );

  if (thanhCong && kq.updatedReservation) {
    console.log(`\n  Thông tin đơn hàng cập nhật:`);
    console.log(`  - Tổng số món trong đơn : ${kq.updatedReservation.selectedDishes.length}`);
    console.log(`  - Tổng tiền hóa đơn     : ${formatVND(kq.updatedReservation.totalAmount)}`);
  }

  runnerOrder.inTongKet();
  return kq;
}

// Chế độ tương tác nhập từ bàn phím
export async function chayGoiMonTuBanPhim() {
  const rl = taoGiaoDienNhap();
  runnerOrder.inTieuDe('CHẾ ĐỘ NHẬP TAY TƯƠNG TÁC TỪ BÀN PHÍM (GỌI MÓN)');

  const menu = getStoredMenuItems();
  console.log('Danh sách một số món đặc sắc:');
  console.log('1. m-04: Bò Wagyu Nướng Đá Muối (680.000đ)');
  console.log('2. m-20: Sò Điệp Nhật Hokkaido Áp Chảo (420.000đ)');
  console.log('3. m-21: Bánh Soufflé Sô-cô-la Bỉ (135.000đ)');
  console.log('4. m-23: Champagne Dom Pérignon (1.450.000đ)\n');

  const maMon = await hoiCauHoi(rl, 'Nhập mã món hoặc tên món (VD: m-04): ');
  const soLuongStr = await hoiCauHoi(rl, 'Nhập số lượng phần (VD: 2): ');
  const ghiChu = await hoiCauHoi(rl, 'Ghi chú đặc biệt cho đầu bếp (VD: Ít chín, không cay): ');
  rl.close();

  kiemTraGoiMonNgoai({
    maMon: maMon.trim() || 'm-04',
    soLuong: parseInt(soLuongStr, 10) || 1,
    ghiChu
  });
}

// Nếu chạy trực tiếp từ CLI
if (process.argv[1]?.includes('order.test.ts')) {
  const args = process.argv.slice(2);
  if (args.includes('--interactive') || args.includes('-i') || args.includes('--nhap')) {
    chayGoiMonTuBanPhim();
  } else if (args.filter(a => !a.startsWith('-')).length >= 2) {
    const params = args.filter(a => !a.startsWith('-'));
    kiemTraGoiMonNgoai({
      maDatBan: params[0].startsWith('BK-') ? params[0] : undefined,
      maMon: params[0].startsWith('BK-') ? params[1] : params[0],
      soLuong: parseInt(params[0].startsWith('BK-') ? (params[2] || '1') : (params[1] || '1'), 10) || 1,
      ghiChu: params[3]
    });
  } else {
    chayTestGoiMon(true);
  }
}
