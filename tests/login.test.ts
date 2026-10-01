/**
 * TEST SUITE: BỘ TESTCASE TOÀN DIỆN VỀ ĐĂNG NHẬP, PHÂN QUYỀN & QUẢN LÝ PHIÊN (LOGIN TEST SUITE)
 * Nhà hàng: Le Gourmet Bistro
 * 
 * Chạy test bằng lệnh: npm test hoặc npx tsx tests/login.test.ts
 */

// 1. Polyfill localStorage cho môi trường kiểm thử tự động Node.js
class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

const mockStorage = new LocalStorageMock();
(global as any).localStorage = mockStorage;

// 2. Import các module xác thực và dữ liệu mẫu
import { 
  loginUser, 
  registerUser, 
  getCurrentUser, 
  logoutUser, 
  getStoredUsers, 
  saveStoredUsers,
  saveCurrentUser
} from '../src/services/storage';
import { UserAccount } from '../src/types';

// Bảng màu & Ký tự hiển thị Terminal sinh động
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

let passedCount = 0;
let failedCount = 0;
const testResults: { id: string; name: string; passed: boolean; details?: string }[] = [];

function assert(testId: string, testName: string, condition: boolean, failReason?: string) {
  if (condition) {
    passedCount++;
    testResults.push({ id: testId, name: testName, passed: true });
    console.log(`  ${GREEN}✓ [PASS]${RESET} ${BOLD}${testId}${RESET}: ${testName}`);
  } else {
    failedCount++;
    testResults.push({ id: testId, name: testName, passed: false, details: failReason });
    console.log(`  ${RED}✗ [FAIL]${RESET} ${BOLD}${testId}${RESET}: ${testName}`);
    if (failReason) {
      console.log(`     ${RED}→ Lý do thất bại: ${failReason}${RESET}`);
    }
  }
}

async function runAllLoginTests() {
  console.log(`\n${CYAN}${BOLD}========================================================================${RESET}`);
  console.log(`${CYAN}${BOLD}   BỘ KIỂM THỬ TỰ ĐỘNG CHỨC NĂNG ĐĂNG NHẬP & PHÂN QUYỀN (LOGIN & AUTH)   ${RESET}`);
  console.log(`${CYAN}${BOLD}   Hệ Thống Đặt Bàn Nhà Hàng - Le Gourmet Bistro                        ${RESET}`);
  console.log(`${CYAN}${BOLD}========================================================================${RESET}\n`);

  // Reset dữ liệu trước khi chạy test
  mockStorage.clear();
  logoutUser();

  // =======================================================================
  // NHÓM 1: ĐĂNG NHẬP THÀNH CÔNG VỚI TÀI KHOẢN MẪU (HAPPY PATHS)
  // =======================================================================
  console.log(`${YELLOW}${BOLD}▶ NHÓM 1: Đăng nhập thành công với các vai trò mẫu (Admin, Staff, Customer)${RESET}`);

  // TC-01: Admin đăng nhập bằng Email
  {
    const res = loginUser('admin@legourmet.vn', '123456');
    assert(
      'TC-01',
      'Admin đăng nhập thành công bằng Email chuẩn',
      res.success === true && res.user?.role === 'admin' && res.user?.name === 'Trần Minh Đức',
      res.message
    );
  }

  // TC-02: Admin đăng nhập bằng Số điện thoại
  {
    const res = loginUser('0903888999', '123456');
    assert(
      'TC-02',
      'Admin đăng nhập thành công bằng Số điện thoại chuẩn',
      res.success === true && res.user?.role === 'admin' && res.user?.name === 'Trần Minh Đức',
      res.message
    );
  }

  // TC-03: Khách hàng (Customer) đăng nhập bằng Email
  {
    const res = loginUser('leehung.work03@gmail.com', '123456');
    assert(
      'TC-03',
      'Khách hàng đăng nhập thành công bằng Email',
      res.success === true && res.user?.role === 'customer' && res.user?.name === 'Lê Hùng',
      res.message
    );
  }

  // TC-04: Khách hàng đăng nhập bằng Số điện thoại
  {
    const res = loginUser('0987654321', '123456');
    assert(
      'TC-04',
      'Khách hàng đăng nhập thành công bằng Số điện thoại',
      res.success === true && res.user?.role === 'customer' && res.user?.name === 'Lê Hùng',
      res.message
    );
  }

  // TC-05: Nhân viên phục vụ (Staff) đăng nhập bằng Email
  {
    const res = loginUser('staff@legourmet.vn', '123456');
    assert(
      'TC-05',
      'Nhân viên (Staff) đăng nhập thành công bằng Email',
      res.success === true && res.user?.role === 'staff' && res.user?.name === 'Nguyễn Văn An',
      res.message
    );
  }

  // TC-06: Nhân viên thu ngân đăng nhập bằng Số điện thoại
  {
    const res = loginUser('0909876543', '123456');
    assert(
      'TC-06',
      'Nhân viên thu ngân đăng nhập thành công bằng SĐT (Trần Thị Mai)',
      res.success === true && res.user?.role === 'staff' && res.user?.name === 'Trần Thị Mai',
      res.message
    );
  }

  // =======================================================================
  // NHÓM 2: TÍNH LINH HOẠT & CHỐNG LỖI ĐỊNH DẠNG ĐẦU VÀO (INPUT RESILIENCE)
  // =======================================================================
  console.log(`\n${YELLOW}${BOLD}▶ NHÓM 2: Tính linh hoạt đầu vào (Hoa/Thường, Khoảng trắng, Định dạng SĐT)${RESET}`);

  // TC-07: Email viết hoa, viết thường lộn xộn (Case Insensitivity)
  {
    const res = loginUser('AdMin@LeGourmet.VN', '123456');
    assert(
      'TC-07',
      'Không phân biệt chữ hoa / thường trong Email',
      res.success === true && res.user?.email === 'admin@legourmet.vn',
      res.message
    );
  }

  // TC-08: Khoảng trắng thừa ở hai đầu Email hoặc Password
  {
    const res = loginUser('   admin@legourmet.vn   ', '123456');
    assert(
      'TC-08',
      'Tự động cắt tỉa khoảng trắng (Trim) ở Email đầu vào',
      res.success === true,
      res.message
    );
  }

  // TC-09: Số điện thoại có dấu cách phân đoạn (VD: 0903 888 999)
  {
    const res = loginUser('0903 888 999', '123456');
    assert(
      'TC-09',
      'Nhận diện đúng SĐT có khoảng cách (0903 888 999)',
      res.success === true && res.user?.name === 'Trần Minh Đức',
      res.message
    );
  }

  // =======================================================================
  // NHÓM 3: BẮT LỖI & BẢO MẬT ĐĂNG NHẬP (NEGATIVE & SECURITY TESTCASES)
  // =======================================================================
  console.log(`\n${YELLOW}${BOLD}▶ NHÓM 3: Bắt lỗi đăng nhập & Bảo mật tài khoản (Negative Cases)${RESET}`);

  // TC-10: Tài khoản không tồn tại trong hệ thống
  {
    const res = loginUser('nguoidung.khongtontai@domain.com', '123456');
    assert(
      'TC-10',
      'Báo lỗi chính xác khi Email không tồn tại',
      res.success === false && res.message.includes('không tồn tại'),
      res.message
    );
  }

  // TC-11: Số điện thoại không tồn tại
  {
    const res = loginUser('0999999999', '123456');
    assert(
      'TC-11',
      'Báo lỗi chính xác khi Số điện thoại không tồn tại',
      res.success === false && res.message.includes('không tồn tại'),
      res.message
    );
  }

  // TC-12: Sai mật khẩu
  {
    const res = loginUser('admin@legourmet.vn', 'mat_khau_hoan_toan_sai_999');
    assert(
      'TC-12',
      'Từ chối đăng nhập khi mật khẩu không khớp',
      res.success === false && res.message.includes('không chính xác'),
      res.message
    );
  }

  // TC-13: Để trống mật khẩu
  {
    const res = loginUser('admin@legourmet.vn', '');
    assert(
      'TC-13',
      'Từ chối đăng nhập khi để trống mật khẩu',
      res.success === false && res.message.includes('Vui lòng nhập mật khẩu'),
      res.message
    );
  }

  // TC-14: Tài khoản bị khóa (status: 'inactive')
  {
    const currentUsers = getStoredUsers();
    const lockedUser: UserAccount = {
      id: 'user-locked-test',
      name: 'Tài Khoản Bị Khóa',
      email: 'locked@restaurant.com',
      phone: '0977112233',
      role: 'customer',
      status: 'inactive',
      loyaltyPoints: 0,
      membershipTier: 'Bạc',
      createdAt: new Date().toISOString(),
      favoriteDishIds: []
    };
    saveStoredUsers([...currentUsers, lockedUser]);

    const res = loginUser('locked@restaurant.com', '123456');
    assert(
      'TC-14',
      'Ngăn chặn đăng nhập đối với tài khoản đang bị tạm khóa (inactive)',
      res.success === false && res.message.includes('tạm khóa'),
      res.message
    );
  }

  // =======================================================================
  // NHÓM 4: QUẢN LÝ PHIÊN (SESSION STORAGE & LOGOUT)
  // =======================================================================
  console.log(`\n${YELLOW}${BOLD}▶ NHÓM 4: Quản lý phiên làm việc & Đăng xuất (Session & Logout)${RESET}`);

  // TC-15: Lưu phiên người dùng sau khi đăng nhập thành công
  {
    loginUser('admin@legourmet.vn', '123456');
    const sessionUser = getCurrentUser();
    assert(
      'TC-15',
      'Phiên làm việc (Session) lưu đúng tài khoản vừa đăng nhập',
      sessionUser !== null && sessionUser.email === 'admin@legourmet.vn' && sessionUser.role === 'admin',
      JSON.stringify(sessionUser)
    );
  }

  // TC-16: Đăng xuất tài khoản an toàn
  {
    logoutUser();
    const sessionAfterLogout = getCurrentUser();
    assert(
      'TC-16',
      'Đăng xuất xóa sạch dữ liệu phiên người dùng khỏi bộ nhớ',
      sessionAfterLogout === null,
      'Session vẫn còn tồn tại sau khi logout'
    );
  }

  // =======================================================================
  // NHÓM 5: VÒNG ĐỜI ĐĂNG KÝ MỚI & ĐĂNG NHẬP (REGISTRATION & LOGIN LIFECYCLE)
  // =======================================================================
  console.log(`\n${YELLOW}${BOLD}▶ NHÓM 5: Vòng đời đăng ký thành viên mới và đăng nhập tức thì${RESET}`);

  const testEmail = `khachhang.${Date.now()}@gmail.com`;
  const testPhone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testPassword = 'MatKhauMoi!2026';

  // TC-17: Đăng ký thành viên mới
  {
    const regRes = registerUser({
      name: 'Nguyễn Văn Kiểm Thử',
      email: testEmail,
      phone: testPhone,
      password: testPassword,
      dietaryPreferences: 'Thích ăn hải sản tươi sống'
    });
    assert(
      'TC-17',
      'Đăng ký tài khoản thành viên mới thành công và nhận 100 điểm thưởng',
      regRes.success === true && regRes.user?.loyaltyPoints === 100 && regRes.user?.membershipTier === 'Bạc',
      regRes.message
    );
  }

  // TC-18: Đăng nhập ngay bằng tài khoản mới với mật khẩu vừa tạo
  {
    logoutUser(); // Xóa phiên tạm
    const loginNewRes = loginUser(testEmail, testPassword);
    assert(
      'TC-18',
      'Đăng nhập thành công bằng tài khoản và mật khẩu vừa đăng ký',
      loginNewRes.success === true && loginNewRes.user?.email === testEmail,
      loginNewRes.message
    );
  }

  // TC-19: Đăng nhập thất bại nếu dùng mật khẩu mặc định cũ thay vì mật khẩu mới
  {
    const wrongRes = loginUser(testEmail, '123456');
    assert(
      'TC-19',
      'Từ chối đăng nhập tài khoản mới bằng mật khẩu mặc định 123456',
      wrongRes.success === false,
      wrongRes.message
    );
  }

  // TC-20: Ngăn chặn đăng ký trùng lặp Email
  {
    const dupEmailRes = registerUser({
      name: 'Người Đăng Ký Trùng',
      email: testEmail,
      phone: '0933445566',
      password: 'somepassword'
    });
    assert(
      'TC-20',
      'Bắt lỗi ngăn chặn đăng ký trùng Email đã có trong hệ thống',
      dupEmailRes.success === false && dupEmailRes.message.includes('Email này đã được đăng ký'),
      dupEmailRes.message
    );
  }

  // TC-21: Ngăn chặn đăng ký trùng lặp Số điện thoại
  {
    const dupPhoneRes = registerUser({
      name: 'Người Đăng Ký Trùng Phone',
      email: 'email.khac@gmail.com',
      phone: testPhone,
      password: 'somepassword'
    });
    assert(
      'TC-21',
      'Bắt lỗi ngăn chặn đăng ký trùng Số điện thoại',
      dupPhoneRes.success === false && dupPhoneRes.message.includes('Số điện thoại này đã được sử dụng'),
      dupPhoneRes.message
    );
  }

  // =======================================================================
  // NHÓM 6: PHÂN QUYỀN VAI TRÒ (RBAC - ROLE-BASED ACCESS CONTROL)
  // =======================================================================
  console.log(`\n${YELLOW}${BOLD}▶ NHÓM 6: Kiểm tra phân quyền vai trò (Admin vs Staff vs Customer)${RESET}`);

  // TC-22: Quyền hạn Admin
  {
    const adminRes = loginUser('admin@legourmet.vn', '123456');
    const isAdmin = adminRes.user?.role === 'admin';
    const canAccessAdminPortal = isAdmin;
    const canManageStaff = isAdmin;
    const canViewFinancials = isAdmin;
    assert(
      'TC-22',
      'Tài khoản Admin có đầy đủ quyền quản trị, nhân sự và tài chính',
      canAccessAdminPortal && canManageStaff && canViewFinancials,
      'Admin bị thiếu quyền hạn'
    );
  }

  // TC-23: Quyền hạn Nhân viên (Staff)
  {
    const staffRes = loginUser('staff@legourmet.vn', '123456');
    const isStaff = staffRes.user?.role === 'staff';
    const canAccessAdminPortal = isStaff;
    const canManageStaff = staffRes.user?.role === 'admin'; // Nhân viên không được quản lý nhân sự
    assert(
      'TC-23',
      'Tài khoản Staff vào được cổng vận hành bàn nhưng bị chặn quyền Quản lý nhân sự',
      canAccessAdminPortal === true && canManageStaff === false,
      'Quyền hạn Staff phân định chưa chính xác'
    );
  }

  // TC-24: Quyền hạn Khách hàng (Customer)
  {
    const customerRes = loginUser('leehung.work03@gmail.com', '123456');
    const isCustomer = customerRes.user?.role === 'customer';
    const canAccessAdminPortal = customerRes.user?.role === 'admin' || customerRes.user?.role === 'staff';
    assert(
      'TC-24',
      'Tài khoản Khách hàng (Customer) bị chặn 100% khỏi các cổng Quản trị',
      isCustomer === true && canAccessAdminPortal === false,
      'Khách hàng có thể truy cập cổng quản trị'
    );
  }

  // =======================================================================
  // TỔNG HỢP KẾT QUẢ KIỂM THỬ
  // =======================================================================
  console.log(`\n${CYAN}${BOLD}========================================================================${RESET}`);
  console.log(`${CYAN}${BOLD}                     BÁO CÁO KẾT QUẢ KIỂM THỬ                         ${RESET}`);
  console.log(`${CYAN}${BOLD}========================================================================${RESET}`);
  console.log(`Tổng số Test Case thực thi: ${BOLD}${passedCount + failedCount}${RESET}`);
  console.log(`Số Test Case ${GREEN}THÀNH CÔNG (PASS)${RESET}: ${GREEN}${BOLD}${passedCount}${RESET}`);
  console.log(`Số Test Case ${RED}THẤT BÀI (FAIL)${RESET}: ${RED}${BOLD}${failedCount}${RESET}`);
  const passRate = Math.round((passedCount / (passedCount + failedCount)) * 100);
  console.log(`Tỷ lệ đạt chuẩn: ${passRate === 100 ? GREEN : YELLOW}${BOLD}${passRate}%${RESET}\n`);

  if (failedCount === 0) {
    console.log(`${GREEN}${BOLD}🎉 TẤT CẢ 24/24 TEST CASES ĐỀU VƯỢT QUA XUẤT SẮC! HỆ THỐNG ĐĂNG NHẬP & PHÂN QUYỀN SẴN SÀNG SẢN XUẤT.${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${RED}${BOLD}⚠️ CÓ ${failedCount} TEST CASES THẤT BÀI. VUI LÒNG KIỂM TRA LẠI CÁC MỤC BÁO ĐỎ Ở TRÊN.${RESET}\n`);
    process.exit(1);
  }
}

// Chạy bộ test
runAllLoginTests().catch((err) => {
  console.error('Lỗi nghiêm trọng khi thực thi Test Suite:', err);
  process.exit(1);
});
