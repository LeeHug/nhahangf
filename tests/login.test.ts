/**
 * File kiểm thử chức năng Đăng Nhập & Phân Quyền (Tự viết bằng tay)
 * Dự án: Hệ thống quản trị & đặt bàn nhà hàng Le Gourmet Bistro
 * Người thực hiện: Lê Hùng
 * 
 * Cách chạy:
 * 1. Chạy tất cả test case tự động:
 *    npm test
 * 
 * 2. Truyền trực tiếp thông tin từ ngoài vào (CLI parameters):
 *    npm test -- admin@legourmet.vn 123456
 *    hoặc:
 *    npx tsx tests/login.test.ts 0987654321 123456
 * 
 * 3. Chế độ nhập tay tương tác từ bàn phím (Interactive Prompt):
 *    npm run test:nhap
 *    hoặc:
 *    npx tsx tests/login.test.ts --interactive
 */

import readline from 'readline';

// Giả lập localStorage đơn giản để chạy được trên môi trường Node.js
const boNhoTam: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (khoa: string) => boNhoTam[khoa] || null,
  setItem: (khoa: string, giaTri: string) => { boNhoTam[khoa] = String(giaTri); },
  removeItem: (khoa: string) => { delete boNhoTam[khoa]; },
  clear: () => {
    for (const k in boNhoTam) {
      delete boNhoTam[k];
    }
  }
};

import { 
  loginUser, 
  registerUser, 
  getCurrentUser, 
  logoutUser, 
  getStoredUsers, 
  saveStoredUsers 
} from '../src/services/storage';

// Biến đếm số lượng test case
let soTestThanhCong = 0;
let soTestThatBai = 0;

// Hàm in kết quả kiểm tra
function kiemTraKetQua(tenTest: string, dieuKien: boolean, thongDiepLoi: string = '') {
  if (dieuKien) {
    soTestThanhCong++;
    console.log(`[PASS] ${tenTest}`);
  } else {
    soTestThatBai++;
    console.log(`[FAIL] ${tenTest}`);
    if (thongDiepLoi) {
      console.log(`       -> Chi tiết lỗi: ${thongDiepLoi}`);
    }
  }
}

// =========================================================================
// 1. CÁC TEST CASE ĐĂNG NHẬP THÀNH CÔNG (HAPPY PATHS)
// =========================================================================

// Test 1: Đăng nhập bằng Email quản trị viên (Admin)
function test_DangNhap_Admin_Bang_Email() {
  console.log('\n--- Kiểm tra 1: Đăng nhập tài khoản Admin bằng Email ---');
  const email = 'admin@legourmet.vn';
  const matKhau = '123456';

  const ketQua = loginUser(email, matKhau);

  kiemTraKetQua(
    'Admin đăng nhập thành công, nhận diện đúng quyền admin và tên Trần Minh Đức',
    ketQua.success === true && 
    ketQua.user?.role === 'admin' && 
    ketQua.user?.name === 'Trần Minh Đức',
    ketQua.message
  );
}

// Test 2: Đăng nhập Admin bằng Số điện thoại
function test_DangNhap_Admin_Bang_SoDienThoai() {
  console.log('\n--- Kiểm tra 2: Đăng nhập Admin bằng Số điện thoại ---');
  const sdt = '0903888999';
  const matKhau = '123456';

  const ketQua = loginUser(sdt, matKhau);

  kiemTraKetQua(
    'Admin đăng nhập thành công bằng Số điện thoại 0903888999',
    ketQua.success === true && ketQua.user?.role === 'admin',
    ketQua.message
  );
}

// Test 3: Đăng nhập Khách hàng (Customer) bằng Email
function test_DangNhap_KhachHang_Bang_Email() {
  console.log('\n--- Kiểm tra 3: Đăng nhập tài khoản Khách hàng bằng Email ---');
  const email = 'leehung.work03@gmail.com';
  const matKhau = '123456';

  const ketQua = loginUser(email, matKhau);

  kiemTraKetQua(
    'Khách hàng Lê Hùng đăng nhập thành công bằng Email',
    ketQua.success === true && 
    ketQua.user?.role === 'customer' && 
    ketQua.user?.name === 'Lê Hùng',
    ketQua.message
  );
}

// Test 4: Đăng nhập Khách hàng bằng Số điện thoại
function test_DangNhap_KhachHang_Bang_SoDienThoai() {
  console.log('\n--- Kiểm tra 4: Đăng nhập Khách hàng bằng Số điện thoại ---');
  const sdt = '0987654321';
  const matKhau = '123456';

  const ketQua = loginUser(sdt, matKhau);

  kiemTraKetQua(
    'Khách hàng đăng nhập thành công bằng SĐT 0987654321',
    ketQua.success === true && ketQua.user?.role === 'customer',
    ketQua.message
  );
}

// Test 5: Đăng nhập Nhân viên phục vụ (Staff)
function test_DangNhap_NhanVien() {
  console.log('\n--- Kiểm tra 5: Đăng nhập tài khoản Nhân viên (Staff) ---');
  const email = 'staff@legourmet.vn';
  const matKhau = '123456';

  const ketQua = loginUser(email, matKhau);

  kiemTraKetQua(
    'Nhân viên Nguyễn Văn An đăng nhập thành công với vai trò staff',
    ketQua.success === true && 
    ketQua.user?.role === 'staff' && 
    ketQua.user?.name === 'Nguyễn Văn An',
    ketQua.message
  );
}

// =========================================================================
// 2. CÁC TEST CASE XỬ LÝ ĐỊNH DẠNG ĐẦU VÀO (CHỮ HOA, KHOẢNG TRẮNG)
// =========================================================================

// Test 6: Không phân biệt chữ hoa thường trong Email
function test_Email_Khong_Phan_Biet_Hoa_Thuong() {
  console.log('\n--- Kiểm tra 6: Nhập Email chữ hoa chữ thường lộn xộn ---');
  const emailHoaThuong = 'AdMin@LeGourmet.VN';
  const matKhau = '123456';

  const ketQua = loginUser(emailHoaThuong, matKhau);

  kiemTraKetQua(
    'Hệ thống tự động chuyển về chữ thường và đăng nhập thành công',
    ketQua.success === true && ketQua.user?.email === 'admin@legourmet.vn',
    ketQua.message
  );
}

// Test 7: Tự động xóa khoảng trắng thừa ở đầu/cuối Email
function test_Xoa_Khoang_Trang_Email() {
  console.log('\n--- Kiểm tra 7: Email có chứa dấu cách ở đầu và cuối ---');
  const emailCoKhoangTrang = '   admin@legourmet.vn   ';
  const matKhau = '123456';

  const ketQua = loginUser(emailCoKhoangTrang, matKhau);

  kiemTraKetQua(
    'Hệ thống tự động trim khoảng trắng thừa',
    ketQua.success === true,
    ketQua.message
  );
}

// Test 8: Số điện thoại có dấu cách phân đoạn (0903 888 999)
function test_SoDienThoai_Co_Dau_Cach() {
  console.log('\n--- Kiểm tra 8: Số điện thoại nhập có khoảng cách giữa các số ---');
  const sdtCoCach = '0903 888 999';
  const matKhau = '123456';

  const ketQua = loginUser(sdtCoCach, matKhau);

  kiemTraKetQua(
    'Tự loại bỏ dấu cách trong số điện thoại và đăng nhập thành công',
    ketQua.success === true && ketQua.user?.name === 'Trần Minh Đức',
    ketQua.message
  );
}

// =========================================================================
// 3. CÁC TEST CASE BẮT LỖI SAI THÔNG TIN (NEGATIVE TEST CASES)
// =========================================================================

// Test 9: Đăng nhập tài khoản không tồn tại
function test_TaiKhoan_Khong_Ton_Tai() {
  console.log('\n--- Kiểm tra 9: Nhập tài khoản không có trong hệ thống ---');
  const emailLa = 'khongcotronghethong@gmail.com';
  const matKhau = '123456';

  const ketQua = loginUser(emailLa, matKhau);

  kiemTraKetQua(
    'Báo lỗi chính xác khi tài khoản không tồn tại',
    ketQua.success === false && ketQua.message.includes('không tồn tại'),
    `Kết quả thực tế: ${ketQua.message}`
  );
}

// Test 10: Nhập sai mật khẩu
function test_Sai_Mat_Khau() {
  console.log('\n--- Kiểm tra 10: Nhập mật khẩu không chính xác ---');
  const email = 'admin@legourmet.vn';
  const matKhauSai = 'mat_khau_sai_1234';

  const ketQua = loginUser(email, matKhauSai);

  kiemTraKetQua(
    'Chặn đăng nhập và thông báo mật khẩu không chính xác',
    ketQua.success === false && ketQua.message.includes('không chính xác'),
    `Kết quả thực tế: ${ketQua.message}`
  );
}

// Test 11: Để trống ô mật khẩu
function test_De_Trong_Mat_Khau() {
  console.log('\n--- Kiểm tra 11: Bỏ trống trường mật khẩu ---');
  const email = 'admin@legourmet.vn';
  const matKhauRong = '';

  const ketQua = loginUser(email, matKhauRong);

  kiemTraKetQua(
    'Báo lỗi yêu cầu người dùng phải nhập mật khẩu',
    ketQua.success === false && ketQua.message.includes('Vui lòng nhập mật khẩu'),
    `Kết quả thực tế: ${ketQua.message}`
  );
}

// Test 12: Tài khoản bị khóa (status = inactive)
function test_TaiKhoan_Bi_Khoa() {
  console.log('\n--- Kiểm tra 12: Đăng nhập vào tài khoản đang bị tạm khóa ---');
  
  const danhSachHienTai = getStoredUsers();
  const userBiKhoa = {
    id: 'user-test-inactive',
    name: 'Khách Hàng Vi Phạm',
    email: 'bikhoa@gmail.com',
    phone: '0911223344',
    role: 'customer' as const,
    status: 'inactive' as const,
    loyaltyPoints: 0,
    membershipTier: 'Bạc' as const,
    favoriteDishIds: [],
    createdAt: new Date().toISOString()
  };
  saveStoredUsers([...danhSachHienTai, userBiKhoa]);

  const ketQua = loginUser('bikhoa@gmail.com', '123456');

  kiemTraKetQua(
    'Chặn đăng nhập tài khoản bị khóa và báo liên hệ quản trị viên',
    ketQua.success === false && ketQua.message.includes('tạm khóa'),
    `Kết quả thực tế: ${ketQua.message}`
  );
}

// =========================================================================
// 4. KIỂM TRA LƯU PHIÊN ĐĂNG NHẬP & ĐĂNG XUẤT (SESSION & LOGOUT)
// =========================================================================

// Test 13: Lưu phiên đăng nhập
function test_Luu_Phien_Dang_Nhap() {
  console.log('\n--- Kiểm tra 13: Kiểm tra lưu phiên làm việc sau khi login ---');
  
  loginUser('admin@legourmet.vn', '123456');
  const userHienTai = getCurrentUser();

  kiemTraKetQua(
    'getCurrentUser() lấy được đúng tài khoản vừa đăng nhập',
    userHienTai !== null && userHienTai.email === 'admin@legourmet.vn',
    JSON.stringify(userHienTai)
  );
}

// Test 14: Đăng xuất tài khoản
function test_Dang_Xuat() {
  console.log('\n--- Kiểm tra 14: Thực hiện đăng xuất tài khoản ---');
  
  logoutUser();
  const userSauKhiLogout = getCurrentUser();

  kiemTraKetQua(
    'Sau khi đăng xuất, getCurrentUser() trả về null an toàn',
    userSauKhiLogout === null,
    'Vẫn còn dữ liệu phiên sau khi gọi logoutUser'
  );
}

// =========================================================================
// 5. VÒNG ĐỜI: ĐĂNG KÝ THÀNH VIÊN MỚI -> ĐĂNG NHẬP
// =========================================================================

// Test 15: Đăng ký thành viên mới và đăng nhập
function test_DangKy_Va_DangNhap_TaiKhoanMoi() {
  console.log('\n--- Kiểm tra 15: Vòng đời đăng ký tài khoản mới và đăng nhập ---');
  
  const emailMoi = `khachhang_${Date.now()}@gmail.com`;
  const sdtMoi = `09${Math.floor(10000000 + Math.random() * 89999999)}`;
  const matKhauMoi = 'MatKhauMoi123';

  // Bước 1: Đăng ký
  const kqDangKy = registerUser({
    name: 'Hoàng Minh Tuấn',
    email: emailMoi,
    phone: sdtMoi,
    password: matKhauMoi,
    dietaryPreferences: 'Thích ăn hải sản tươi sống'
  });

  const dkThanhCong = kqDangKy.success === true && kqDangKy.user?.loyaltyPoints === 100;
  kiemTraKetQua('Đăng ký tài khoản mới thành công (được tặng 100 điểm thưởng)', dkThanhCong, kqDangKy.message);

  // Bước 2: Đăng xuất ra rồi đăng nhập lại bằng mật khẩu mới
  logoutUser();
  const kqDangNhap = loginUser(emailMoi, matKhauMoi);
  kiemTraKetQua(
    'Đăng nhập thành công bằng tài khoản và mật khẩu vừa tạo',
    kqDangNhap.success === true && kqDangNhap.user?.email === emailMoi,
    kqDangNhap.message
  );

  // Bước 3: Thử đăng nhập bằng mật khẩu cũ mặc định 123456 -> Phải thất bại
  const kqThuSai = loginUser(emailMoi, '123456');
  kiemTraKetQua(
    'Không cho phép dùng mật khẩu cũ 123456 để đăng nhập vào tài khoản có mật khẩu mới',
    kqThuSai.success === false,
    'Vẫn cho đăng nhập bằng mật khẩu cũ'
  );
}

// Test 16: Chặn đăng ký trùng Email
function test_Chan_Trung_Email() {
  console.log('\n--- Kiểm tra 16: Ngăn chặn đăng ký trùng lặp Email đã có ---');
  
  const kq = registerUser({
    name: 'Người Đăng Ký Trùng',
    email: 'admin@legourmet.vn',
    phone: '0933998877',
    password: 'password123'
  });

  kiemTraKetQua(
    'Hệ thống phát hiện và từ chối đăng ký trùng Email',
    kq.success === false && kq.message.includes('Email này đã được đăng ký'),
    kq.message
  );
}

// =========================================================================
// 6. KIỂM TRA PHÂN QUYỀN VAI TRÒ (RBAC)
// =========================================================================

// Test 17: Kiểm tra phân quyền truy cập giữa các vai trò
function test_KiemTra_PhanQuyen_RBAC() {
  console.log('\n--- Kiểm tra 17: Phân quyền vai trò (Admin vs Staff vs Customer) ---');

  const admin = loginUser('admin@legourmet.vn', '123456').user;
  const adminCoQuyenQuanTri = admin?.role === 'admin' || admin?.role === 'staff';
  const adminCoQuyenNhanSu = admin?.role === 'admin';

  const staff = loginUser('staff@legourmet.vn', '123456').user;
  const staffCoQuyenQuanTri = staff?.role === 'admin' || staff?.role === 'staff';
  const staffCoQuyenNhanSu = staff?.role === 'admin';

  const customer = loginUser('leehung.work03@gmail.com', '123456').user;
  const customerCoQuyenQuanTri = customer?.role === 'admin' || customer?.role === 'staff';

  const hopLe = 
    adminCoQuyenQuanTri === true && adminCoQuyenNhanSu === true &&
    staffCoQuyenQuanTri === true && staffCoQuyenNhanSu === false &&
    customerCoQuyenQuanTri === false;

  kiemTraKetQua(
    'Phân quyền chuẩn xác: Admin có toàn quyền, Staff giới hạn nghiệp vụ bàn, Customer bị chặn',
    hopLe,
    'Phân quyền RBAC bị sai lệch'
  );
}

// =========================================================================
// 7. TRƯỜNG HỢP KIỂM TRA VỚI THÔNG TIN NGOÀI TRUYỀN VÀO (CUSTOM EXTERNAL INPUT)
// =========================================================================

/**
 * Hàm kiểm tra đăng nhập với thông tin người dùng truyền từ bên ngoài vào
 * @param taiKhoan Email hoặc Số điện thoại người dùng nhập
 * @param matKhau Mật khẩu người dùng nhập
 */
export function test_KiemTra_ThongTin_Ngoai(taiKhoan: string, matKhau: string) {
  console.log('\n=================================================================');
  console.log(`  KIỂM TRA ĐĂNG NHẬP VỚI THÔNG TIN TRUYỀN TỪ NGOÀI VÀO`);
  console.log('=================================================================');
  console.log(`> Tài khoản (Email/SĐT) : "${taiKhoan}"`);
  console.log(`> Mật khẩu              : "${matKhau ? '******' : '(để trống)'}"`);

  const ketQua = loginUser(taiKhoan, matKhau);

  if (ketQua.success && ketQua.user) {
    soTestThanhCong++;
    console.log('\n[PASS] ĐĂNG NHẬP THÀNH CÔNG!');
    console.log(`       - Họ và tên       : ${ketQua.user.name}`);
    console.log(`       - Email           : ${ketQua.user.email}`);
    console.log(`       - Số điện thoại   : ${ketQua.user.phone}`);
    console.log(`       - Quyền hạn (Role): ${ketQua.user.role.toUpperCase()}`);
    console.log(`       - Hạng thành viên : ${ketQua.user.membershipTier}`);
    console.log(`       - Điểm tích lũy   : ${ketQua.user.loyaltyPoints} điểm`);
    if (ketQua.user.position) {
      console.log(`       - Vị trí chức vụ  : ${ketQua.user.position}`);
    }
  } else {
    soTestThatBai++;
    console.log('\n[FAIL] ĐĂNG NHẬP THẤT BÀI!');
    console.log(`       - Thông báo từ hệ thống: ${ketQua.message}`);
  }

  return ketQua;
}

// Hàm hỗ trợ nhập tay tương tác từ bàn phím bằng readline
function chayCheDoNhapTayTuBanPhim() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('=================================================================');
  console.log('       CHẾ ĐỘ KIỂM THỬ ĐĂNG NHẬP TỰ NHẬP TAY TỪ BÀN PHÍM         ');
  console.log('=================================================================');
  console.log('Gợi ý một số tài khoản mẫu sẵn có trong hệ thống:');
  console.log(' 1. Admin   : admin@legourmet.vn      | MK: 123456');
  console.log(' 2. SĐT Ad  : 0903888999              | MK: 123456');
  console.log(' 3. KH mẫu  : leehung.work03@gmail.com | MK: 123456');
  console.log(' 4. Staff   : staff@legourmet.vn      | MK: 123456');
  console.log('=================================================================\n');

  rl.question('Nhập Email hoặc Số điện thoại: ', (taiKhoan) => {
    rl.question('Nhập Mật khẩu               : ', (matKhau) => {
      test_KiemTra_ThongTin_Ngoai(taiKhoan.trim(), matKhau);
      rl.close();
      process.exit(soTestThatBai > 0 ? 1 : 0);
    });
  });
}

// =========================================================================
// HÀM CHÍNH ĐIỀU PHỐI CHẠY KIỂM THỬ
// =========================================================================
function chayChuongTrinh() {
  const thamSo = process.argv.slice(2);

  // Trường hợp 1: Người dùng chạy chế độ nhập tương tác từ bàn phím
  if (thamSo.includes('--interactive') || thamSo.includes('-i') || thamSo.includes('--nhap')) {
    chayCheDoNhapTayTuBanPhim();
    return;
  }

  // Trường hợp 2: Người dùng truyền trực tiếp tài khoản & mật khẩu qua dòng lệnh (CLI args)
  // Ví dụ: npm test -- admin@legourmet.vn 123456
  // hoặc: npx tsx tests/login.test.ts 0903888999 123456
  const thamSoKhongCoCo = thamSo.filter(arg => !arg.startsWith('-'));
  if (thamSoKhongCoCo.length >= 2) {
    const taiKhoanNgoai = thamSoKhongCoCo[0];
    const matKhauNgoai = thamSoKhongCoCo[1];
    test_KiemTra_ThongTin_Ngoai(taiKhoanNgoai, matKhauNgoai);
    return;
  }

  // Trường hợp 3: Chạy toàn bộ bộ test tự động mặc định (17 test cases chuẩn + 1 test mẫu dữ liệu ngoài)
  console.log('=================================================================');
  console.log('      BẮT ĐẦU CHẠY KIỂM THỬ CHỨC NĂNG ĐĂNG NHẬP (CODE TAY)      ');
  console.log('=================================================================');

  // Nhóm 1: Đăng nhập thành công
  test_DangNhap_Admin_Bang_Email();
  test_DangNhap_Admin_Bang_SoDienThoai();
  test_DangNhap_KhachHang_Bang_Email();
  test_DangNhap_KhachHang_Bang_SoDienThoai();
  test_DangNhap_NhanVien();

  // Nhóm 2: Xử lý định dạng đầu vào
  test_Email_Khong_Phan_Biet_Hoa_Thuong();
  test_Xoa_Khoang_Trang_Email();
  test_SoDienThoai_Co_Dau_Cach();

  // Nhóm 3: Bắt lỗi thông tin
  test_TaiKhoan_Khong_Ton_Tai();
  test_Sai_Mat_Khau();
  test_De_Trong_Mat_Khau();
  test_TaiKhoan_Bi_Khoa();

  // Nhóm 4: Quản lý phiên
  test_Luu_Phien_Dang_Nhap();
  test_Dang_Xuat();

  // Nhóm 5: Đăng ký & đăng nhập
  test_DangKy_Va_DangNhap_TaiKhoanMoi();
  test_Chan_Trung_Email();

  // Nhóm 6: Phân quyền
  test_KiemTra_PhanQuyen_RBAC();

  // Nhóm 7: Kiểm tra trường hợp truyền thông tin ngoài vào
  console.log('\n--- Kiểm tra 18: Trường hợp truyền tham số dữ liệu ngoài vào ---');
  test_KiemTra_ThongTin_Ngoai('leehung.work03@gmail.com', '123456');

  // Tổng kết
  console.log('\n=================================================================');
  console.log('                    TỔNG KẾT KẾT QUẢ KIỂM THỬ                   ');
  console.log('=================================================================');
  const tongSo = soTestThanhCong + soTestThatBai;
  console.log(`- Tổng số test case thực thi : ${tongSo}`);
  console.log(`- Số test thành công (PASS) : ${soTestThanhCong}`);
  console.log(`- Số test thất bại (FAIL)    : ${soTestThatBai}`);
  console.log(`- Tỷ lệ đạt                  : ${Math.round((soTestThanhCong / tongSo) * 100)}%`);

  console.log('\n-----------------------------------------------------------------');
  console.log('MẸO SỬ DỤNG NHẬP THÔNG TIN TỪ NGOÀI VÀO:');
  console.log('1. Nhập trực tiếp qua dòng lệnh:');
  console.log('   npm test -- <Email_Hoac_SDT> <MatKhau>');
  console.log('   Ví dụ: npm test -- 0903888999 123456');
  console.log('2. Nhập tương tác từ bàn phím:');
  console.log('   npm run test:nhap');
  console.log('-----------------------------------------------------------------');

  if (soTestThatBai === 0) {
    console.log('\n=> KẾT LUẬN: TẤT CẢ CÁC BÀI TEST ĐỀU ĐẠT CHUẨN (100% PASS)!');
    console.log('=================================================================\n');
  } else {
    console.log(`\n=> CẢNH BÁO: CÓ ${soTestThatBai} BÀI TEST THẤT BÀI!`);
    console.log('=================================================================\n');
    process.exit(1);
  }
}

// Bắt đầu chạy
chayChuongTrinh();
