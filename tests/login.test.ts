/**
 * =========================================================================
 * MÔI TRƯỜNG TEST RIÊNG: ĐĂNG NHẬP & PHÂN QUYỀN (LOGIN & AUTH TEST SUITE)
 * Dự án: Le Gourmet Bistro
 * =========================================================================
 * Cách chạy:
 * 1. Chạy tất cả test case tự động:
 *    npx tsx tests/login.test.ts
 *    hoặc: npm run test:login
 * 
 * 2. Truyền thông tin ngoài vào qua dòng lệnh (CLI):
 *    npx tsx tests/login.test.ts admin@legourmet.vn 123456
 * 
 * 3. Chế độ nhập tay tương tác từ bàn phím:
 *    npx tsx tests/login.test.ts --interactive
 */

import { 
  TestSuiteRunner, 
  resetTestStorage, 
  taoGiaoDienNhap, 
  hoiCauHoi 
} from './test-env';

import { 
  loginUser, 
  registerUser, 
  getCurrentUser, 
  logoutUser, 
  getStoredUsers, 
  saveStoredUsers 
} from '../src/services/storage';

export const runnerLogin = new TestSuiteRunner('MÔI TRƯỜNG TEST: ĐĂNG NHẬP & PHÂN QUYỀN');

export function chayTestDangNhap(tuDongThoat: boolean = true) {
  runnerLogin.datLai();
  resetTestStorage();

  runnerLogin.inTieuDe('BẮT ĐẦU CHẠY MÔI TRƯỜNG TEST: ĐĂNG NHẬP & PHÂN QUYỀN');

  // --- NHÓM 1: CÁC TRƯỜNG HỢP ĐĂNG NHẬP HỢP LỆ (HAPPY PATHS) ---
  runnerLogin.inMuc(1, 'Đăng nhập Quản Trị Viên (Admin) bằng Email');
  const kqAdminEmail = loginUser('admin@legourmet.vn', '123456');
  runnerLogin.kiemTra(
    'Admin đăng nhập thành công với quyền admin và tên Trần Minh Đức',
    kqAdminEmail.success === true && 
    kqAdminEmail.user?.role === 'admin' && 
    kqAdminEmail.user?.name === 'Trần Minh Đức',
    kqAdminEmail.message
  );

  runnerLogin.inMuc(2, 'Đăng nhập Admin bằng Số Điện Thoại');
  const kqAdminSdt = loginUser('0903888999', '123456');
  runnerLogin.kiemTra(
    'Admin đăng nhập thành công bằng SĐT 0903888999',
    kqAdminSdt.success === true && kqAdminSdt.user?.role === 'admin',
    kqAdminSdt.message
  );

  runnerLogin.inMuc(3, 'Đăng nhập Nhân Viên (Staff)');
  const kqStaff = loginUser('staff@legourmet.vn', '123456');
  runnerLogin.kiemTra(
    'Nhân viên Nguyễn Văn An đăng nhập thành công với vai trò staff',
    kqStaff.success === true && kqStaff.user?.role === 'staff',
    kqStaff.message
  );

  runnerLogin.inMuc(4, 'Đăng nhập Khách Hàng (Customer) bằng Email');
  const kqKhach = loginUser('leehung.work03@gmail.com', '123456');
  runnerLogin.kiemTra(
    'Khách hàng Lê Hùng đăng nhập thành công, nhận diện đúng email',
    kqKhach.success === true && kqKhach.user?.role === 'customer',
    kqKhach.message
  );

  runnerLogin.inMuc(5, 'Đăng nhập Khách Hàng bằng Số Điện Thoại');
  const kqKhachSdt = loginUser('0987654321', '123456');
  runnerLogin.kiemTra(
    'Khách hàng đăng nhập thành công bằng SĐT 0987654321',
    kqKhachSdt.success === true && kqKhachSdt.user?.name === 'Lê Hùng',
    kqKhachSdt.message
  );

  // --- NHÓM 2: XỬ LÝ CHUẨN HÓA DỮ LIỆU ĐẦU VÀO ---
  runnerLogin.inMuc(6, 'Email chữ hoa / chữ thường lộn xộn');
  const kqHoaThuong = loginUser('AdMiN@LeGouRmet.VN', '123456');
  runnerLogin.kiemTra(
    'Tự động chuẩn hóa về chữ thường và đăng nhập thành công',
    kqHoaThuong.success === true && kqHoaThuong.user?.email === 'admin@legourmet.vn',
    kqHoaThuong.message
  );

  runnerLogin.inMuc(7, 'Email có khoảng trắng thừa ở hai đầu');
  const kqKhoangTrang = loginUser('   admin@legourmet.vn   ', '123456');
  runnerLogin.kiemTra(
    'Tự động loại bỏ khoảng trắng thừa (trim)',
    kqKhoangTrang.success === true,
    kqKhoangTrang.message
  );

  runnerLogin.inMuc(8, 'Số điện thoại có khoảng trắng phân đoạn (0903 888 999)');
  const kqSdtCach = loginUser('0903 888 999', '123456');
  runnerLogin.kiemTra(
    'Tự động gộp số điện thoại và đăng nhập thành công',
    kqSdtCach.success === true && kqSdtCach.user?.role === 'admin',
    kqSdtCach.message
  );

  // --- NHÓM 3: BẮT LỖI SAI THÔNG TIN (NEGATIVE PATHS) ---
  runnerLogin.inMuc(9, 'Đăng nhập tài khoản không tồn tại trong hệ thống');
  const kqKhongTonTai = loginUser('khong_co_that@gmail.com', '123456');
  runnerLogin.kiemTra(
    'Báo lỗi chính xác khi không tìm thấy tài khoản',
    kqKhongTonTai.success === false && kqKhongTonTai.message.includes('không tồn tại'),
    kqKhongTonTai.message
  );

  runnerLogin.inMuc(10, 'Đăng nhập sai mật khẩu');
  const kqSaiPass = loginUser('admin@legourmet.vn', 'sai_mat_khau_123');
  runnerLogin.kiemTra(
    'Chặn đăng nhập và thông báo mật khẩu không chính xác',
    kqSaiPass.success === false && kqSaiPass.message.includes('không chính xác'),
    kqSaiPass.message
  );

  runnerLogin.inMuc(11, 'Để trống trường mật khẩu');
  const kqTrongPass = loginUser('admin@legourmet.vn', '');
  runnerLogin.kiemTra(
    'Báo lỗi yêu cầu người dùng phải nhập mật khẩu',
    kqTrongPass.success === false && kqTrongPass.message.includes('mật khẩu'),
    kqTrongPass.message
  );

  runnerLogin.inMuc(12, 'Tài khoản bị khóa hoạt động (inactive)');
  const dsHienTai = getStoredUsers();
  saveStoredUsers([
    ...dsHienTai,
    {
      id: 'user-inactive-test',
      name: 'Khách Hàng Tạm Khóa',
      email: 'khoa@legourmet.vn',
      phone: '0912345678',
      role: 'customer',
      status: 'inactive',
      loyaltyPoints: 0,
      membershipTier: 'Bạc',
      favoriteDishIds: [],
      createdAt: new Date().toISOString()
    }
  ]);
  const kqKhoa = loginUser('khoa@legourmet.vn', '123456');
  runnerLogin.kiemTra(
    'Chặn đăng nhập tài khoản đang bị tạm khóa',
    kqKhoa.success === false && kqKhoa.message.includes('tạm khóa'),
    kqKhoa.message
  );

  // --- NHÓM 4: QUẢN LÝ PHIÊN LÀM VIỆC & ĐĂNG XUẤT ---
  runnerLogin.inMuc(13, 'Kiểm tra lưu phiên đăng nhập (getCurrentUser)');
  loginUser('admin@legourmet.vn', '123456');
  const userHienTai = getCurrentUser();
  runnerLogin.kiemTra(
    'getCurrentUser() lấy đúng thông tin người dùng đang đăng nhập',
    userHienTai !== null && userHienTai.email === 'admin@legourmet.vn'
  );

  runnerLogin.inMuc(14, 'Đăng xuất tài khoản (logoutUser)');
  logoutUser();
  const sauLogout = getCurrentUser();
  runnerLogin.kiemTra(
    'Sau khi logout, getCurrentUser() trả về null an toàn',
    sauLogout === null
  );

  // --- NHÓM 5: VÒNG ĐỜI ĐĂNG KÝ MỚI -> ĐĂNG NHẬP ---
  runnerLogin.inMuc(15, 'Đăng ký tài khoản thành viên mới và đăng nhập');
  const emailMoi = `khach_${Date.now()}@gmail.com`;
  const sdtMoi = `09${Math.floor(10000000 + Math.random() * 89999999)}`;
  const passMoi = 'MatKhauMoi@2026';

  const kqDangKy = registerUser({
    name: 'Phạm Hồng Ánh',
    email: emailMoi,
    phone: sdtMoi,
    password: passMoi,
    dietaryPreferences: 'Ăn thanh đạm, ít ngọt'
  });

  const dkOk = kqDangKy.success === true && kqDangKy.user?.loyaltyPoints === 100;
  runnerLogin.kiemTra('Đăng ký tài khoản mới thành công (thưởng 100 điểm ban đầu)', dkOk, kqDangKy.message);

  logoutUser();
  const kqDangNhapMoi = loginUser(emailMoi, passMoi);
  runnerLogin.kiemTra(
    'Đăng nhập thành công với tài khoản và mật khẩu vừa tạo',
    kqDangNhapMoi.success === true && kqDangNhapMoi.user?.email === emailMoi,
    kqDangNhapMoi.message
  );

  // --- NHÓM 6: PHÂN QUYỀN VAI TRÒ (RBAC) ---
  runnerLogin.inMuc(16, 'Kiểm tra phân quyền vai trò (Admin vs Staff vs Customer)');
  const admin = loginUser('admin@legourmet.vn', '123456').user;
  const staff = loginUser('staff@legourmet.vn', '123456').user;
  const cust = loginUser('leehung.work03@gmail.com', '123456').user;

  const rbacHopLe = 
    admin?.role === 'admin' &&
    staff?.role === 'staff' &&
    cust?.role === 'customer';

  runnerLogin.kiemTra(
    'Phân cấp quyền hạn chuẩn xác giữa Admin, Staff và Customer',
    rbacHopLe
  );

  const ketQuaTong = runnerLogin.inTongKet();

  if (tuDongThoat && process.argv[1]?.includes('login.test.ts')) {
    process.exit(ketQuaTong.fail > 0 ? 1 : 0);
  }

  return ketQuaTong;
}

// -------------------------------------------------------------------------
// TRƯỜNG HỢP KIỂM TRA THÔNG TIN NGOÀI TRUYỀN VÀO (CUSTOM INPUT)
// -------------------------------------------------------------------------
export function kiemTraDangNhapNgoai(taiKhoan: string, matKhau: string) {
  runnerLogin.inTieuDe('KIỂM TRA ĐĂNG NHẬP VỚI THÔNG TIN TỪ NGOÀI TRUYỀN VÀO');
  console.log(`> Tài khoản (Email/SĐT) : "${taiKhoan}"`);
  console.log(`> Mật khẩu              : "${matKhau ? '******' : '(để trống)'}"\n`);

  const kq = loginUser(taiKhoan, matKhau);

  if (kq.success && kq.user) {
    runnerLogin.kiemTra(`Đăng nhập thành công tài khoản "${taiKhoan}"`, true);
    console.log(`\n  Thông tin người dùng:`);
    console.log(`  - Họ tên          : ${kq.user.name}`);
    console.log(`  - Email           : ${kq.user.email}`);
    console.log(`  - Số điện thoại   : ${kq.user.phone}`);
    console.log(`  - Vai trò (Role)  : ${kq.user.role.toUpperCase()}`);
    console.log(`  - Hạng thành viên : ${kq.user.membershipTier}`);
    console.log(`  - Điểm tích lũy   : ${kq.user.loyaltyPoints} điểm`);
  } else {
    runnerLogin.kiemTra(`Đăng nhập tài khoản "${taiKhoan}"`, false, kq.message);
  }

  runnerLogin.inTongKet();
  return kq;
}

// Chế độ tương tác nhập từ bàn phím
export async function chayDangNhapTuBanPhim() {
  const rl = taoGiaoDienNhap();
  runnerLogin.inTieuDe('CHẾ ĐỘ NHẬP TAY TƯƠNG TÁC TỪ BÀN PHÍM (LOGIN)');
  console.log('Gợi ý tài khoản sẵn có:');
  console.log('1. Admin   : admin@legourmet.vn       | MK: 123456');
  console.log('2. Staff   : staff@legourmet.vn       | MK: 123456');
  console.log('3. Khách   : leehung.work03@gmail.com  | MK: 123456\n');

  const taiKhoan = await hoiCauHoi(rl, 'Nhập Email hoặc Số điện thoại: ');
  const matKhau = await hoiCauHoi(rl, 'Nhập Mật khẩu: ');
  rl.close();

  kiemTraDangNhapNgoai(taiKhoan, matKhau);
}

// Nếu file được gọi trực tiếp bằng CLI
if (process.argv[1]?.includes('login.test.ts')) {
  const args = process.argv.slice(2);
  if (args.includes('--interactive') || args.includes('-i') || args.includes('--nhap')) {
    chayDangNhapTuBanPhim();
  } else if (args.filter(a => !a.startsWith('-')).length >= 2) {
    const params = args.filter(a => !a.startsWith('-'));
    kiemTraDangNhapNgoai(params[0], params[1]);
  } else {
    chayTestDangNhap(true);
  }
}
