/**
 * =========================================================================
 * BỘ ĐIỀU PHỐI KIỂM THỬ TRUNG TÂM (CENTRAL TEST SUITE RUNNER)
 * Dự án: Hệ thống quản lý & đặt bàn nhà hàng Le Gourmet Bistro
 * =========================================================================
 * Cung cấp:
 * 1. Chạy toàn bộ các môi trường test độc lập (Login, Đặt bàn, Order, Nhận bàn, Thanh toán, E2E)
 * 2. Chạy riêng từng môi trường theo nhu cầu
 * 3. Menu tương tác từ bàn phím (Interactive Terminal Menu)
 * 4. Nhập tham số tùy biến từ ngoài vào
 */

import { taoGiaoDienNhap, hoiCauHoi } from './test-env';
import { chayTestDangNhap, chayDangNhapTuBanPhim } from './login.test';
import { chayTestDatBan, chayDatBanTuBanPhim } from './booking.test';
import { chayTestGoiMon, chayGoiMonTuBanPhim } from './order.test';
import { chayTestNhanBan, chayNhanBanTuBanPhim } from './checkin.test';
import { chayTestThanhToan, chayThanhToanTuBanPhim } from './payment.test';
import { chayTestToanTrinhE2E } from './e2e.test';

export async function chayTatCaTestSuites() {
  console.log('\n=================================================================');
  console.log('   KHỞI ĐỘNG HỆ THỐNG KIỂM THỬ TỔNG HỢP: LE GOURMET BISTRO       ');
  console.log('=================================================================');
  console.log('Đang thực thi lần lượt 6 môi trường test chuyên biệt:');
  console.log('1. Đăng nhập & Phân quyền (Login & RBAC)');
  console.log('2. Đặt bàn & Điều phối bàn (Reservation & Seating)');
  console.log('3. Gọi món & Vé bếp KDS (Order & Kitchen)');
  console.log('4. Nhận bàn & Check-in (Table Check-in)');
  console.log('5. Thanh toán & Trả bàn (Checkout & Loyalty)');
  console.log('6. Toàn trình khép kín thực tế A -> Z (E2E)');
  console.log('=================================================================');

  const kq1 = chayTestDangNhap(false);
  const kq2 = chayTestDatBan(false);
  const kq3 = chayTestGoiMon(false);
  const kq4 = chayTestNhanBan(false);
  const kq5 = chayTestThanhToan(false);
  const kq6 = chayTestToanTrinhE2E(false);

  const tongPass = kq1.pass + kq2.pass + kq3.pass + kq4.pass + kq5.pass + kq6.pass;
  const tongFail = kq1.fail + kq2.fail + kq3.fail + kq4.fail + kq5.fail + kq6.fail;
  const tongSo = tongPass + tongFail;
  const tyLe = tongSo > 0 ? Math.round((tongPass / tongSo) * 100) : 0;

  console.log('\n=================================================================');
  console.log('        BẢNG TỔNG HỢP KẾT QUẢ TẤT CẢ MÔI TRƯỜNG KIỂM THỬ         ');
  console.log('=================================================================');
  console.log(`1. Môi trường Đăng nhập : ${kq1.pass}/${kq1.tong} PASS ${kq1.fail === 0 ? '✓' : '✗'}`);
  console.log(`2. Môi trường Đặt bàn   : ${kq2.pass}/${kq2.tong} PASS ${kq2.fail === 0 ? '✓' : '✗'}`);
  console.log(`3. Môi trường Gọi món   : ${kq3.pass}/${kq3.tong} PASS ${kq3.fail === 0 ? '✓' : '✗'}`);
  console.log(`4. Môi trường Nhận bàn  : ${kq4.pass}/${kq4.tong} PASS ${kq4.fail === 0 ? '✓' : '✗'}`);
  console.log(`5. Môi trường Thanh toán: ${kq5.pass}/${kq5.tong} PASS ${kq5.fail === 0 ? '✓' : '✗'}`);
  console.log(`6. Toàn trình E2E (A->Z): ${kq6.pass}/${kq6.tong} PASS ${kq6.fail === 0 ? '✓' : '✗'}`);
  console.log('-----------------------------------------------------------------');
  console.log(`=> TỔNG CỘNG            : ${tongPass}/${tongSo} TEST CASES THÀNH CÔNG (${tyLe}%)`);
  console.log('=================================================================');

  if (tongFail === 0) {
    console.log('🎉 TẤT CẢ CÁC MÔI TRƯỜNG ĐỀU HOÀN THÀNH 100% PASS!\n');
  } else {
    console.log(`⚠️ PHÁT HIỆN ${tongFail} TEST CASE CHƯA ĐẠT!\n`);
  }

  return { tongSo, tongPass, tongFail };
}

// Menu tương tác từ bàn phím
export async function hienThiMenuTuongTac() {
  const rl = taoGiaoDienNhap();

  console.log('\n=================================================================');
  console.log('      MENU ĐIỀU KHIỂN HỆ THỐNG TEST LE GOURMET BISTRO            ');
  console.log('=================================================================');
  console.log(' [1] Chạy toàn bộ các môi trường test tự động (All Suites)');
  console.log(' [2] Môi trường Đăng Nhập & Phân Quyền (Login)');
  console.log(' [3] Môi trường Đặt Bàn (Booking)');
  console.log(' [4] Môi trường Gọi Món (Order & KDS)');
  console.log(' [5] Môi trường Nhận Bàn (Check-in)');
  console.log(' [6] Môi trường Thanh Toán (Payment & Loyalty)');
  console.log(' [7] Toàn trình phục vụ thực tế từ A đến Z (E2E)');
  console.log(' [8] Nhập thông tin tùy biến từ ngoài vào bàn phím');
  console.log(' [0] Thoát');
  console.log('=================================================================');

  const luaChon = await hoiCauHoi(rl, 'Nhập lựa chọn của bạn (0 - 8): ');
  rl.close();

  switch (luaChon.trim()) {
    case '1':
      await chayTatCaTestSuites();
      break;
    case '2':
      chayTestDangNhap(false);
      break;
    case '3':
      chayTestDatBan(false);
      break;
    case '4':
      chayTestGoiMon(false);
      break;
    case '5':
      chayTestNhanBan(false);
      break;
    case '6':
      chayTestThanhToan(false);
      break;
    case '7':
      chayTestToanTrinhE2E(false);
      break;
    case '8':
      await menuNhapThongTinNgoai();
      break;
    case '0':
      console.log('Tạm biệt!');
      process.exit(0);
      break;
    default:
      console.log('Lựa chọn không hợp lệ, thực thi chạy toàn bộ mặc định:');
      await chayTatCaTestSuites();
      break;
  }
}

async function menuNhapThongTinNgoai() {
  const rl = taoGiaoDienNhap();
  console.log('\n--- BẠN MUỐN NHẬP THÔNG TIN NGOÀI CHO MÔI TRƯỜNG NÀO? ---');
  console.log(' 1. Đăng nhập (Nhập Email/SĐT và Mật khẩu)');
  console.log(' 2. Đặt bàn (Nhập Tên, SĐT, Số khách, Khu vực, Giờ)');
  console.log(' 3. Gọi món (Nhập Mã món, Số lượng phần)');
  console.log(' 4. Nhận bàn (Nhập Mã booking BK-XXXX hoặc SĐT)');
  console.log(' 5. Thanh toán (Nhập Mã đơn, Hình thức tiền mặt/VietQR/POS)');
  const chon = await hoiCauHoi(rl, 'Chọn môi trường (1 - 5): ');
  rl.close();

  switch (chon.trim()) {
    case '1':
      await chayDangNhapTuBanPhim();
      break;
    case '2':
      await chayDatBanTuBanPhim();
      break;
    case '3':
      await chayGoiMonTuBanPhim();
      break;
    case '4':
      await chayNhanBanTuBanPhim();
      break;
    case '5':
      await chayThanhToanTuBanPhim();
      break;
    default:
      console.log('Đã hủy.');
      break;
  }
}

// Xử lý dòng lệnh CLI
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--interactive') || args.includes('-i') || args.includes('--nhap') || args.includes('--menu')) {
    await hienThiMenuTuongTac();
    return;
  }

  if (args.includes('--login') || args.includes('--dangnhap')) {
    chayTestDangNhap(true);
    return;
  }

  if (args.includes('--booking') || args.includes('--datban')) {
    chayTestDatBan(true);
    return;
  }

  if (args.includes('--order') || args.includes('--goimon')) {
    chayTestGoiMon(true);
    return;
  }

  if (args.includes('--checkin') || args.includes('--nhanban')) {
    chayTestNhanBan(true);
    return;
  }

  if (args.includes('--payment') || args.includes('--thanhtoan')) {
    chayTestThanhToan(true);
    return;
  }

  if (args.includes('--e2e') || args.includes('--toantrinh')) {
    chayTestToanTrinhE2E(true);
    return;
  }

  // Mặc định chạy toàn bộ test
  const kq = await chayTatCaTestSuites();
  process.exit(kq.tongFail > 0 ? 1 : 0);
}

main();
