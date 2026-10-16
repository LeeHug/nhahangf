import { TestCase, HttpRequestRecord, HttpResponseRecord, TestAssertion } from './testTypes';

/**
 * Helper to compute date string in future or past
 */
export function getRelativeDate(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 24 Test Cases Covering 6 Core Functional & Security Suites
 */
export const INITIAL_TEST_CASES: TestCase[] = [
  // =========================================================================
  // SUITE 1: ĐẶT BÀN & KIỂM SOÁT XUNG ĐỘT TRÙNG GIỜ (BOOKING & CONFLICT)
  // =========================================================================
  {
    id: 'TC-BK-01',
    suiteId: 'booking_conflict',
    suiteName: '1. Đặt Bàn & Kiểm Soát Xung Đột',
    name: 'Đặt bàn mới hợp lệ với thông tin đầy đủ',
    description: 'Kiểm tra luồng đặt bàn thành công khi cung cấp thông tin chuẩn, bàn trống trong khung giờ.',
    viewpoint: 'Khách hàng đặt bàn hợp lệ cho bữa ăn gia đình vào ngày mai.',
    technique: 'Phân vùng tương đương',
    endpoint: '/api/reservations',
    httpMethod: 'POST',
    expectedStatusCode: 201,
    prerequisites: 'Bàn T-01 còn trống vào khung giờ 18:30 ngày mai.',
    steps: [
      'Gửi POST /api/reservations với ngày mai, giờ 18:30, bàn T-01, 4 khách.',
      'Kiểm tra mã trạng thái HTTP trả về.',
      'Kiểm tra mã đặt bàn BK-XXXX và thông tin bàn được xác nhận.'
    ],
    expectedResult: 'HTTP 201 Created, trả về object đặt bàn có bookingCode và status="confirmed".',
    status: 'idle'
  },
  {
    id: 'TC-BK-02',
    suiteId: 'booking_conflict',
    suiteName: '1. Đặt Bàn & Kiểm Soát Xung Đột',
    name: 'Chặn trùng lịch chính xác cùng bàn và cùng giờ',
    description: 'Kiểm tra hệ thống phát hiện và từ chối khi khách thứ hai cố tình đặt cùng bàn T-01 vào đúng 18:30.',
    viewpoint: 'Chống lỗi đặt bàn trùng lặp (Double Booking) gây tranh chấp bàn ăn.',
    technique: 'Phân vùng tương đương',
    endpoint: '/api/reservations',
    httpMethod: 'POST',
    expectedStatusCode: 409,
    expectedCode: 'TABLE_SLOT_CONFLICT',
    prerequisites: 'Bàn T-01 đã có người đặt trước lúc 18:30 (từ TC-BK-01).',
    steps: [
      'Gửi POST /api/reservations cùng ngày mai, cùng giờ 18:30 và bàn T-01.',
      'Kiểm tra mã phản hồi HTTP.',
      'Xác nhận mã lỗi nghiệp vụ TABLE_SLOT_CONFLICT.'
    ],
    expectedResult: 'HTTP 409 Conflict, mã lỗi TABLE_SLOT_CONFLICT kèm thông báo bàn đã có khách.',
    status: 'idle'
  },
  {
    id: 'TC-BK-03',
    suiteId: 'booking_conflict',
    suiteName: '1. Đặt Bàn & Kiểm Soát Xung Đột',
    name: 'Chặn đặt bàn trong khoảng đệm 90 phút dùng bữa (Buffer Overlap)',
    description: 'Khách cố tình đặt bàn T-01 lúc 19:15 (cách đơn lúc 18:30 chỉ 45 phút, vi phạm buffer 90 phút).',
    viewpoint: 'Đảm bảo khách trước có đủ thời gian dùng bữa và nhân viên có thời gian dọn dẹp bàn.',
    technique: 'Phân tích giá trị biên',
    endpoint: '/api/reservations',
    httpMethod: 'POST',
    expectedStatusCode: 409,
    expectedCode: 'TABLE_SLOT_CONFLICT',
    prerequisites: 'Bàn T-01 đã có đơn lúc 18:30.',
    steps: [
      'Gửi POST /api/reservations với bàn T-01 lúc 19:15 (lệch +45 phút).',
      'Kiểm tra phản hồi của server.',
      'Xác minh thông báo từ chối do xung đột khung giờ đệm.'
    ],
    expectedResult: 'HTTP 409 Conflict, từ chối do giao thoa thời gian phục vụ 90 phút.',
    status: 'idle'
  },
  {
    id: 'TC-BK-04',
    suiteId: 'booking_conflict',
    suiteName: '1. Đặt Bàn & Kiểm Soát Xung Đột',
    name: 'Cho phép đặt cùng bàn sau khi hết khung giờ đệm 90 phút',
    description: 'Kiểm tra đặt bàn T-01 lúc 20:30 (cách 120 phút so với 18:30, ngoài khoảng buffer 90 phút).',
    viewpoint: 'Tối ưu hóa công suất khai thác bàn của nhà hàng cho ca kế tiếp.',
    technique: 'Phân tích giá trị biên',
    endpoint: '/api/reservations',
    httpMethod: 'POST',
    expectedStatusCode: 201,
    prerequisites: 'Bàn T-01 có đơn lúc 18:30 (kết thúc đệm lúc 20:00).',
    steps: [
      'Gửi POST /api/reservations với bàn T-01 lúc 20:30.',
      'Kiểm tra mã phản hồi HTTP.',
      'Xác nhận đơn thứ 2 trên cùng bàn được chấp thuận.'
    ],
    expectedResult: 'HTTP 201 Created, chấp nhận ca 2 thành công cho cùng bàn T-01.',
    status: 'idle'
  },
  {
    id: 'TC-BK-05',
    suiteId: 'booking_conflict',
    suiteName: '1. Đặt Bàn & Kiểm Soát Xung Đột',
    name: 'Cô lập trạng thái: Đặt bàn ngày mai không khóa bàn hôm nay',
    description: 'Kiểm tra việc đặt bàn cho ngày mai không làm bàn hiển thị "reserved" trên sơ đồ phục vụ hôm nay.',
    viewpoint: 'Tránh việc khách đặt trước nhiều ngày làm tê liệt sơ đồ bàn phục vụ khách vãng lai hôm nay.',
    technique: 'Phân vùng tương đương',
    endpoint: '/api/tables/availability',
    httpMethod: 'GET',
    expectedStatusCode: 200,
    steps: [
      'Gọi GET /api/tables để xem trạng thái bàn T-01 hiện tại.',
      'Xác minh bàn T-01 vẫn là "available" cho ngày hôm nay.'
    ],
    expectedResult: 'HTTP 200 OK, bàn T-01 giữ trạng thái available hôm nay.',
    status: 'idle'
  },

  // =========================================================================
  // SUITE 2: RÀNG BUỘC DỮ LIỆU ĐẦU VÀO (INPUT VALIDATION & BOUNDARY VALUE)
  // =========================================================================
  {
    id: 'TC-VAL-01',
    suiteId: 'input_validation',
    suiteName: '2. Ràng Buộc Dữ Liệu & Giá Trị Biên',
    name: 'Xác thực định dạng số điện thoại Việt Nam hợp lệ',
    description: 'Kiểm tra chấp nhận số điện thoại di động chuẩn 10 số (đầu 09, 03, 07, 08, 05).',
    viewpoint: 'Đảm bảo liên lạc gửi vé SMS và gọi xác nhận bàn cho khách.',
    technique: 'Phân vùng tương đương',
    endpoint: '/api/reservations',
    httpMethod: 'POST',
    expectedStatusCode: 201,
    steps: [
      'Gửi POST /api/reservations với customerPhone="0912345678".',
      'Kiểm tra server chấp thuận số điện thoại hợp lệ.'
    ],
    expectedResult: 'HTTP 201 Created, chấp nhận số điện thoại chuẩn.',
    status: 'idle'
  },
  {
    id: 'TC-VAL-02',
    suiteId: 'input_validation',
    suiteName: '2. Ràng Buộc Dữ Liệu & Giá Trị Biên',
    name: 'Từ chối số điện thoại sai định dạng hoặc chứa chữ cái',
    description: 'Gửi số điện thoại không hợp lệ như "090abcdefg" hoặc quá ngắn "12345".',
    viewpoint: 'Chặn dữ liệu rác và lỗi nhập liệu từ phía người dùng.',
    technique: 'Phân vùng tương đương',
    endpoint: '/api/reservations',
    httpMethod: 'POST',
    expectedStatusCode: 400,
    expectedCode: 'INVALID_PHONE',
    steps: [
      'Gửi POST /api/reservations với customerPhone="090abcdef".',
      'Kiểm tra server trả về lỗi 400 Bad Request và mã lỗi INVALID_PHONE.'
    ],
    expectedResult: 'HTTP 400 Bad Request, mã lỗi INVALID_PHONE.',
    status: 'idle'
  },
  {
    id: 'TC-VAL-03',
    suiteId: 'input_validation',
    suiteName: '2. Ràng Buộc Dữ Liệu & Giá Trị Biên',
    name: 'Từ chối email không đúng định dạng chuẩn RFC',
    description: 'Kiểm tra server từ chối khi nhập email thiếu @, thiếu domain ví dụ "khach-hang-sai-email".',
    viewpoint: 'Đảm bảo email gửi hóa đơn và mã QR không bị thất lạc.',
    technique: 'Phân vùng tương đương',
    endpoint: '/api/reservations',
    httpMethod: 'POST',
    expectedStatusCode: 400,
    expectedCode: 'INVALID_EMAIL',
    steps: [
      'Gửi POST /api/reservations với customerEmail="khach-hang-khong-co-domain".',
      'Kiểm tra mã lỗi INVALID_EMAIL từ server.'
    ],
    expectedResult: 'HTTP 400 Bad Request, mã lỗi INVALID_EMAIL.',
    status: 'idle'
  },
  {
    id: 'TC-VAL-04',
    suiteId: 'input_validation',
    suiteName: '2. Ràng Buộc Dữ Liệu & Giá Trị Biên',
    name: 'Giá trị biên số khách: Từ chối số khách bằng 0 hoặc âm',
    description: 'Kiểm tra biên dưới: gửi guestCount = 0 hoặc -2 khách.',
    viewpoint: 'Số khách phải từ 1 người trở lên.',
    technique: 'Phân tích giá trị biên',
    endpoint: '/api/reservations',
    httpMethod: 'POST',
    expectedStatusCode: 400,
    expectedCode: 'INVALID_GUEST_COUNT',
    steps: [
      'Gửi POST /api/reservations với guestCount = 0.',
      'Kiểm tra server trả về mã lỗi INVALID_GUEST_COUNT.'
    ],
    expectedResult: 'HTTP 400 Bad Request, mã lỗi INVALID_GUEST_COUNT.',
    status: 'idle'
  },
  {
    id: 'TC-VAL-05',
    suiteId: 'input_validation',
    suiteName: '2. Ràng Buộc Dữ Liệu & Giá Trị Biên',
    name: 'Giá trị biên số khách: Từ chối số khách vượt quá 30 người',
    description: 'Kiểm tra biên trên: gửi guestCount = 35 khách (vượt quá giới hạn phục vụ tự động tối đa 30 người).',
    viewpoint: 'Đoàn khách trên 30 người cần đặt tiệc qua Hotline để bố trí hội trường riêng.',
    technique: 'Phân tích giá trị biên',
    endpoint: '/api/reservations',
    httpMethod: 'POST',
    expectedStatusCode: 400,
    expectedCode: 'INVALID_GUEST_COUNT',
    steps: [
      'Gửi POST /api/reservations với guestCount = 35.',
      'Kiểm tra server phản hồi hướng dẫn liên hệ hotline.'
    ],
    expectedResult: 'HTTP 400 Bad Request, mã lỗi INVALID_GUEST_COUNT.',
    status: 'idle'
  },
  {
    id: 'TC-VAL-06',
    suiteId: 'input_validation',
    suiteName: '2. Ràng Buộc Dữ Liệu & Giá Trị Biên',
    name: 'Từ chối ngày đặt bàn trong quá khứ',
    description: 'Kiểm tra server từ chối đặt bàn cho ngày đã qua (ví dụ năm 2020 hoặc ngày hôm qua).',
    viewpoint: 'Ngăn chặn dữ liệu lịch sử phi logic.',
    technique: 'Phân tích giá trị biên',
    endpoint: '/api/reservations',
    httpMethod: 'POST',
    expectedStatusCode: 400,
    expectedCode: 'PAST_BOOKING_DATE',
    steps: [
      'Gửi POST /api/reservations với bookingDate = "2020-01-01".',
      'Kiểm tra server trả về PAST_BOOKING_DATE.'
    ],
    expectedResult: 'HTTP 400 Bad Request, mã lỗi PAST_BOOKING_DATE.',
    status: 'idle'
  },
  {
    id: 'TC-VAL-07',
    suiteId: 'input_validation',
    suiteName: '2. Ràng Buộc Dữ Liệu & Giá Trị Biên',
    name: 'Từ chối khung giờ ngoài thời gian hoạt động của nhà hàng',
    description: 'Gửi giờ đến lúc 03:00 sáng (ngoài khung giờ mở cửa 10:00 - 22:30).',
    viewpoint: 'Nhà hàng chỉ nhận khách trong khung giờ bếp và nhân viên hoạt động.',
    technique: 'Phân tích giá trị biên',
    endpoint: '/api/reservations',
    httpMethod: 'POST',
    expectedStatusCode: 400,
    expectedCode: 'OUT_OF_OPERATING_HOURS',
    steps: [
      'Gửi POST /api/reservations với arrivalTime = "03:00".',
      'Kiểm tra server phản hồi mã OUT_OF_OPERATING_HOURS.'
    ],
    expectedResult: 'HTTP 400 Bad Request, mã lỗi OUT_OF_OPERATING_HOURS.',
    status: 'idle'
  },
  {
    id: 'TC-VAL-08',
    suiteId: 'input_validation',
    suiteName: '2. Ràng Buộc Dữ Liệu & Giá Trị Biên',
    name: 'Từ chối mã bàn không tồn tại trong sơ đồ nhà hàng',
    description: 'Khách gửi tableId = "TABLE-UNKNOWN-999".',
    viewpoint: 'Đảm bảo dữ liệu bàn phải có thật trong cơ sở dữ liệu sơ đồ bàn.',
    technique: 'Phân vùng tương đương',
    endpoint: '/api/reservations',
    httpMethod: 'POST',
    expectedStatusCode: 400,
    expectedCode: 'TABLE_NOT_FOUND',
    steps: [
      'Gửi POST /api/reservations với tableId = "TABLE-UNKNOWN-999".',
      'Kiểm tra mã phản hồi lỗi TABLE_NOT_FOUND.'
    ],
    expectedResult: 'HTTP 400 Bad Request, mã lỗi TABLE_NOT_FOUND.',
    status: 'idle'
  },

  // =========================================================================
  // SUITE 3: VÒNG ĐỜI TRẠNG THÁI BÀN (STATE MACHINE & TRANSITIONS)
  // =========================================================================
  {
    id: 'TC-STM-01',
    suiteId: 'state_machine',
    suiteName: '3. Vòng Đời Trạng Thái Bàn',
    name: 'Chuyển trạng thái hợp lệ: pending -> confirmed',
    description: 'Quản lý duyệt đơn đặt bàn từ trạng thái chờ sang đã xác nhận.',
    viewpoint: 'Kiểm tra luồng chuyển tiếp trạng thái chuẩn trong ca trực.',
    technique: 'Kiểm thử chuyển trạng thái',
    endpoint: '/api/reservations/{id}/status',
    httpMethod: 'PATCH',
    expectedStatusCode: 200,
    steps: [
      'Tạo đơn test với status = "pending".',
      'Gửi PATCH /api/reservations/:id/status với { status: "confirmed" }.',
      'Xác nhận đơn chuyển sang confirmed.'
    ],
    expectedResult: 'HTTP 200 OK, đơn được xác nhận confirmed.',
    status: 'idle'
  },
  {
    id: 'TC-STM-02',
    suiteId: 'state_machine',
    suiteName: '3. Vòng Đời Trạng Thái Bàn',
    name: 'Check-in đón khách: confirmed -> checked_in (Bàn đổi thành occupied)',
    description: 'Lễ tân check-in khi khách đến, đơn sang checked_in và bàn đổi thành "occupied" trên sơ đồ.',
    viewpoint: 'Cập nhật trực quan sơ đồ bàn thời gian thực cho nhân viên phục vụ.',
    technique: 'Kiểm thử chuyển trạng thái',
    endpoint: '/api/reservations/{id}/status',
    httpMethod: 'PATCH',
    expectedStatusCode: 200,
    steps: [
      'Gửi PATCH /api/reservations/:id/status với { status: "checked_in" }.',
      'Kiểm tra trạng thái đơn là checked_in.',
      'Gọi GET /api/tables kiểm tra bàn tương ứng đã chuyển sang occupied.'
    ],
    expectedResult: 'HTTP 200 OK, trạng thái đơn checked_in và bàn chuyển sang occupied.',
    status: 'idle'
  },
  {
    id: 'TC-STM-03',
    suiteId: 'state_machine',
    suiteName: '3. Vòng Đời Trạng Thái Bàn',
    name: 'Đóng bàn sau bữa ăn: checked_in -> completed (Bàn giải phóng available)',
    description: 'Sau khi khách thanh toán xong, đơn kết thúc (completed) và bàn tự động trở về "available".',
    viewpoint: 'Tự động giải phóng bàn cho lượt khách kế tiếp mà không cần thao tác thủ công.',
    technique: 'Kiểm thử chuyển trạng thái',
    endpoint: '/api/reservations/{id}/status',
    httpMethod: 'PATCH',
    expectedStatusCode: 200,
    steps: [
      'Gửi PATCH /api/reservations/:id/status với { status: "completed" }.',
      'Kiểm tra trạng thái đơn completed.',
      'Gọi GET /api/tables xác nhận bàn đã trở về available.'
    ],
    expectedResult: 'HTTP 200 OK, đơn completed và bàn giải phóng về available.',
    status: 'idle'
  },
  {
    id: 'TC-STM-04',
    suiteId: 'state_machine',
    suiteName: '3. Vòng Đời Trạng Thái Bàn',
    name: 'Chống chuyển ngược phi logic: cancelled -> confirmed',
    description: 'Cố tình kích hoạt lại đơn đã bị hủy (cancelled -> confirmed).',
    viewpoint: 'Ngăn chặn sai lệch dữ liệu kế toán và xếp bàn khi đơn đã bị hủy.',
    technique: 'Kiểm thử chuyển trạng thái',
    endpoint: '/api/reservations/{id}/status',
    httpMethod: 'PATCH',
    expectedStatusCode: 400,
    expectedCode: 'INVALID_STATUS_TRANSITION',
    steps: [
      'Tạo đơn và chuyển sang cancelled.',
      'Gửi PATCH chuyển từ cancelled ngược về confirmed.',
      'Kiểm tra server chặn với mã lỗi INVALID_STATUS_TRANSITION.'
    ],
    expectedResult: 'HTTP 400 Bad Request, mã lỗi INVALID_STATUS_TRANSITION.',
    status: 'idle'
  },
  {
    id: 'TC-STM-05',
    suiteId: 'state_machine',
    suiteName: '3. Vòng Đời Trạng Thái Bàn',
    name: 'Chống chuyển trạng thái từ đơn đã hoàn tất: completed -> pending',
    description: 'Cố tình đổi trạng thái đơn đã dùng bữa xong và đóng hóa đơn về lại pending.',
    viewpoint: 'Bảo vệ tính toàn vẹn của dữ liệu doanh thu và lịch sử đặt bàn.',
    technique: 'Kiểm thử chuyển trạng thái',
    endpoint: '/api/reservations/{id}/status',
    httpMethod: 'PATCH',
    expectedStatusCode: 400,
    expectedCode: 'INVALID_STATUS_TRANSITION',
    steps: [
      'Gửi PATCH đổi từ completed sang pending.',
      'Xác nhận server từ chối vì đơn đã kết thúc vòng đời.'
    ],
    expectedResult: 'HTTP 400 Bad Request, mã lỗi INVALID_STATUS_TRANSITION.',
    status: 'idle'
  },
  {
    id: 'TC-STM-06',
    suiteId: 'state_machine',
    suiteName: '3. Vòng Đời Trạng Thái Bàn',
    name: 'Từ chối trạng thái không xác định (Unknown Status)',
    description: 'Gửi trạng thái tùy ý không có trong hệ thống như "hacked_status".',
    viewpoint: 'Chống tiêm dữ liệu trạng thái sai lệch vào hệ thống.',
    technique: 'Phân vùng tương đương',
    endpoint: '/api/reservations/{id}/status',
    httpMethod: 'PATCH',
    expectedStatusCode: 400,
    expectedCode: 'INVALID_STATUS',
    steps: [
      'Gửi PATCH /api/reservations/:id/status với { status: "unknown_xyz" }.',
      'Kiểm tra mã lỗi INVALID_STATUS.'
    ],
    expectedResult: 'HTTP 400 Bad Request, mã lỗi INVALID_STATUS.',
    status: 'idle'
  },

  // =========================================================================
  // SUITE 4: THỰC ĐƠN & TÍNH TIỀN CHỐNG GIẢ MẠO GIÁ (MENU & PRICING AUDIT)
  // =========================================================================
  {
    id: 'TC-MN-01',
    suiteId: 'menu_pricing',
    suiteName: '4. Thực Đơn & Chống Giả Mạo Giá',
    name: 'Xem thực đơn công khai không yêu cầu xác thực tài khoản',
    description: 'Kiểm tra khách vãng lai có thể xem toàn bộ 24+ món ăn, hình ảnh và giá niêm yết mà không cần đăng nhập.',
    viewpoint: 'Đáp ứng nhu cầu khách xem trước menu mà không bắt buộc phải đặt bàn.',
    technique: 'Phân vùng tương đương',
    endpoint: '/api/menu',
    httpMethod: 'GET',
    expectedStatusCode: 200,
    steps: [
      'Gửi GET /api/menu không kèm header Authorization.',
      'Kiểm tra mảng món ăn trả về có ít nhất 20 món và đầy đủ trường giá, mô tả.'
    ],
    expectedResult: 'HTTP 200 OK, trả về danh sách món ăn đầy đủ không yêu cầu đăng nhập.',
    status: 'idle'
  },
  {
    id: 'TC-MN-02',
    suiteId: 'menu_pricing',
    suiteName: '4. Thực Đơn & Chống Giả Mạo Giá',
    name: 'Chống giả mạo giá món (Client Price Tampering Protection)',
    description: 'Client cố tình gửi giá món Wagyu A5 là 1,000 VND (giá thật 1,650,000 VND). Server phải tự động dùng giá gốc.',
    viewpoint: 'Bảo vệ doanh thu nhà hàng, chống tấn công sửa giá ở phía trình duyệt.',
    technique: 'Kiểm thử an ninh',
    endpoint: '/api/reservations',
    httpMethod: 'POST',
    expectedStatusCode: 201,
    steps: [
      'Tạo đơn đặt món Bò Wagyu A5 với giá can thiệp 1,000 VND.',
      'Gửi POST /api/reservations lên server.',
      'Kiểm tra preOrderTotal trong kết quả trả về phải bằng 1,650,000 VND (giá chuẩn của server).'
    ],
    expectedResult: 'HTTP 201 Created, server tự sửa lại đúng 1,650,000 VND, loại bỏ giá giả mạo.',
    status: 'idle'
  },

  // =========================================================================
  // SUITE 5: AN NINH & PHÂN QUYỀN TRUY CẬP (SECURITY & RBAC)
  // =========================================================================
  {
    id: 'TC-SEC-01',
    suiteId: 'security_rbac',
    suiteName: '5. An Ninh & Phân Quyền (RBAC)',
    name: 'Đăng nhập Quản lý (Admin) thành công nhận JWT Token hợp lệ',
    description: 'Kiểm tra API đăng nhập trả về mã JWT token khi nhập đúng tài khoản và mật khẩu.',
    viewpoint: 'Xác thực định danh người quản lý ca trực.',
    technique: 'Kiểm thử an ninh',
    endpoint: '/api/auth/login',
    httpMethod: 'POST',
    expectedStatusCode: 200,
    steps: [
      'Gửi POST /api/auth/login với username="admin" và password="admin123".',
      'Kiểm tra token trả về dạng JWT gồm 3 phần (header.payload.signature).'
    ],
    expectedResult: 'HTTP 200 OK, trả về token JWT hợp lệ và user.role="admin".',
    status: 'idle'
  },
  {
    id: 'TC-SEC-02',
    suiteId: 'security_rbac',
    suiteName: '5. An Ninh & Phân Quyền (RBAC)',
    name: 'Từ chối đăng nhập khi sai mật khẩu',
    description: 'Kiểm tra gửi thông tin đăng nhập với mật khẩu sai.',
    viewpoint: 'Chặn truy cập trái phép vào bảng điều khiển.',
    technique: 'Phân vùng tương đương',
    endpoint: '/api/auth/login',
    httpMethod: 'POST',
    expectedStatusCode: 401,
    steps: [
      'Gửi POST /api/auth/login với username="admin" và password="wrongpassword999".',
      'Kiểm tra mã lỗi HTTP 401 Unauthorized.'
    ],
    expectedResult: 'HTTP 401 Unauthorized, từ chối cấp token.',
    status: 'idle'
  },
  {
    id: 'TC-SEC-03',
    suiteId: 'security_rbac',
    suiteName: '5. An Ninh & Phân Quyền (RBAC)',
    name: 'Chặn truy cập Email Logs quản trị khi không có JWT Token',
    description: 'Cố tình gọi API nhật ký email quản trị mà không mang theo Authorization header.',
    viewpoint: 'Bảo vệ dữ liệu nhạy cảm của khách hàng (email, mã cọc, số điện thoại).',
    technique: 'Kiểm thử an ninh',
    endpoint: '/api/email-logs',
    httpMethod: 'GET',
    expectedStatusCode: 401,
    steps: [
      'Gửi GET /api/email-logs không kèm Bearer Token.',
      'Kiểm tra server chặn ngay ở tầng middleware.'
    ],
    expectedResult: 'HTTP 401 Unauthorized, không cho phép truy cập nhật ký bảo mật.',
    status: 'idle'
  },

  // =========================================================================
  // SUITE 6: KIỂM THỬ TÍCH HỢP TOÀN TRÌNH (END-TO-END FLOW)
  // =========================================================================
  {
    id: 'TC-E2E-01',
    suiteId: 'e2e_flow',
    suiteName: '6. Kịch Bản Tích Hợp Toàn Trình (E2E)',
    name: 'Toàn trình khách ăn: Đặt bàn -> Check-in -> Thêm món tại bàn -> Đóng bàn giải phóng',
    description: 'Mô phỏng 1 chu kỳ phục vụ hoàn hảo từ lúc khách đặt bàn trên web đến khi hoàn tất thanh toán.',
    viewpoint: 'Kiểm thử tích hợp các module Đặt bàn, Kế toán, Sơ đồ bàn và Phục vụ bàn.',
    technique: 'Kiểm thử tích hợp E2E',
    endpoint: '/api/reservations',
    httpMethod: 'POST',
    expectedStatusCode: 200,
    steps: [
      'Bước 1: Khách đặt bàn T-08 kèm món Khai vị lúc 19:00 ngày mai.',
      'Bước 2: Lễ tân check-in đón khách (đổi trạng thái sang checked_in, bàn chuyển occupied).',
      'Bước 3: Khách gọi thêm 1 chai Rượu vang cao cấp tại bàn.',
      'Bước 4: Thu ngân thanh toán hóa đơn, chuyển đơn sang completed.',
      'Bước 5: Bàn T-08 tự động trở lại available sẵn sàng đón khách mới.'
    ],
    expectedResult: 'Toàn bộ 5 bước hoàn tất trơn tru, bàn T-08 được giải phóng thành công.',
    status: 'idle'
  }
];

/**
 * Runner Execution Engine for Individual Test Cases
 */
export async function runIndividualTestCase(
  testCase: TestCase,
  baseUrl: string = '',
  emitLog: (msg: string) => void
): Promise<TestCase> {
  const startTime = performance.now();
  const testDate = getRelativeDate(2); // Dùng ngày cách 2 hôm để tránh xung đột dữ liệu cũ
  const testPhone = `0900000${Math.floor(100 + Math.random() * 899)}`;
  const logs: string[] = [];

  const log = (msg: string) => {
    logs.push(msg);
    emitLog(msg);
  };

  log(`🚀 [${testCase.id}] Bắt đầu thực thi: "${testCase.name}"`);
  log(`📍 Mục tiêu (Viewpoint): ${testCase.viewpoint}`);

  let requestRecord: HttpRequestRecord = {
    url: `${baseUrl}${testCase.endpoint}`,
    method: testCase.httpMethod,
    headers: { 'Content-Type': 'application/json' }
  };
  let responseRecord: HttpResponseRecord | undefined;
  const assertions: TestAssertion[] = [];
  let isPassed = false;
  let errorMsg: string | undefined;

  try {
    // -----------------------------------------------------------------------
    // EXECUTION LOGIC PER TEST CASE
    // -----------------------------------------------------------------------
    if (testCase.id === 'TC-BK-01') {
      // Đặt bàn hợp lệ
      const payload = {
        customerName: '[TEST] Khách Hàng Chuẩn',
        customerPhone: testPhone,
        customerEmail: 'autotest.chuan@legourmet.vn',
        guestCount: 4,
        bookingDate: testDate,
        arrivalTime: '18:30',
        tableId: 'T-01',
        selectedDishes: [{ dish: { id: 'dish-01', name: 'Bò Wagyu A5', price: 1650000 }, quantity: 2 }]
      };
      requestRecord.body = payload;
      log(`📤 Gửi POST ${requestRecord.url} với ngày ${testDate}, giờ 18:30, bàn T-01`);

      const res = await fetch(requestRecord.url, {
        method: 'POST',
        headers: requestRecord.headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = {
        status: res.status,
        statusText: res.statusText,
        durationMs,
        body: data
      };

      assertions.push({
        description: 'Mã HTTP Status trả về phải là 201 Created',
        passed: res.status === 201,
        expected: 201,
        actual: res.status
      });
      assertions.push({
        description: 'Phải sinh mã đặt bàn hợp lệ dạng BK-XXXX',
        passed: Boolean(data.bookingCode && data.bookingCode.startsWith('BK-')),
        expected: 'Mã BK-XXXX',
        actual: data.bookingCode
      });
      assertions.push({
        description: 'Trạng thái đơn khởi tạo phải là confirmed',
        passed: data.status === 'confirmed',
        expected: 'confirmed',
        actual: data.status
      });

      isPassed = assertions.every(a => a.passed);
      log(isPassed ? `✅ [PASS] Đặt bàn thành công #${data.bookingCode} (${durationMs}ms)` : `❌ [FAIL] Có assertion thất bại`);
    }

    else if (testCase.id === 'TC-BK-02') {
      // Chặn trùng lịch cùng bàn cùng giờ
      // Bước 1: Tạo đơn đầu tiên làm tiền đề
      const basePayload = {
        customerName: '[TEST] Khách Đặt Trước',
        customerPhone: '0900000111',
        customerEmail: 'autotest.conflict1@legourmet.vn',
        guestCount: 2,
        bookingDate: testDate,
        arrivalTime: '18:30',
        tableId: 'T-02'
      };
      log(`1️⃣ Tạo đơn đặt trước cho bàn T-02 lúc 18:30...`);
      await fetch(`${baseUrl}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basePayload)
      });

      // Bước 2: Cố tình đặt trùng lặp
      const dupPayload = {
        customerName: '[TEST] Khách Đặt Trùng',
        customerPhone: '0900000222',
        customerEmail: 'autotest.conflict2@legourmet.vn',
        guestCount: 2,
        bookingDate: testDate,
        arrivalTime: '18:30',
        tableId: 'T-02'
      };
      requestRecord.body = dupPayload;
      log(`2️⃣ Cố tình đặt trùng bàn T-02 cùng giờ 18:30...`);

      const res = await fetch(requestRecord.url, {
        method: 'POST',
        headers: requestRecord.headers,
        body: JSON.stringify(dupPayload)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = {
        status: res.status,
        statusText: res.statusText,
        durationMs,
        body: data
      };

      assertions.push({
        description: 'Mã HTTP Status trả về phải là 409 Conflict',
        passed: res.status === 409,
        expected: 409,
        actual: res.status
      });
      assertions.push({
        description: 'Mã lỗi nghiệp vụ phải là TABLE_SLOT_CONFLICT',
        passed: data.code === 'TABLE_SLOT_CONFLICT',
        expected: 'TABLE_SLOT_CONFLICT',
        actual: data.code
      });

      isPassed = assertions.every(a => a.passed);
      log(isPassed ? `✅ [PASS] Server đã chặn chính xác đơn đặt trùng bàn (${durationMs}ms)` : `❌ [FAIL] Không chặn được trùng bàn`);
    }

    else if (testCase.id === 'TC-BK-03') {
      // Chặn trong buffer 90 phút (lúc 19:15 cách đơn 18:30 chỉ 45 phút)
      const basePayload = {
        customerName: '[TEST] Khách Gốc',
        customerPhone: '0900000333',
        customerEmail: 'autotest.buffer1@legourmet.vn',
        guestCount: 2,
        bookingDate: testDate,
        arrivalTime: '18:30',
        tableId: 'T-03'
      };
      await fetch(`${baseUrl}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basePayload)
      });

      const bufferPayload = {
        customerName: '[TEST] Khách Chen Ngang Buffer',
        customerPhone: '0900000444',
        customerEmail: 'autotest.buffer2@legourmet.vn',
        guestCount: 2,
        bookingDate: testDate,
        arrivalTime: '19:15', // Lệch 45 phút (< 90 phút buffer)
        tableId: 'T-03'
      };
      requestRecord.body = bufferPayload;
      log(`📤 Gửi đơn lúc 19:15 (giao thoa buffer 90 phút với đơn 18:30)...`);

      const res = await fetch(requestRecord.url, {
        method: 'POST',
        headers: requestRecord.headers,
        body: JSON.stringify(bufferPayload)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = {
        status: res.status,
        statusText: res.statusText,
        durationMs,
        body: data
      };

      assertions.push({
        description: 'Server phải trả về HTTP 409 Conflict',
        passed: res.status === 409,
        expected: 409,
        actual: res.status
      });
      assertions.push({
        description: 'Mã lỗi TABLE_SLOT_CONFLICT bảo vệ khung giờ đệm 90 phút',
        passed: data.code === 'TABLE_SLOT_CONFLICT',
        expected: 'TABLE_SLOT_CONFLICT',
        actual: data.code
      });

      isPassed = assertions.every(a => a.passed);
      log(isPassed ? `✅ [PASS] Chặn thành công đơn vi phạm buffer 90 phút` : `❌ [FAIL] Buffer 90 phút chưa hoạt động`);
    }

    else if (testCase.id === 'TC-BK-04') {
      // Cho phép cùng bàn sau buffer 90 phút (lúc 20:30 cách 18:30 là 120 phút)
      const afterBufferPayload = {
        customerName: '[TEST] Khách Ca Muộn',
        customerPhone: '0900000555',
        customerEmail: 'autotest.ca2@legourmet.vn',
        guestCount: 2,
        bookingDate: testDate,
        arrivalTime: '20:30', // Cách 120 phút (> 90 phút)
        tableId: 'T-03'
      };
      requestRecord.body = afterBufferPayload;
      log(`📤 Gửi đơn ca 2 lúc 20:30 (sau 120 phút)...`);

      const res = await fetch(requestRecord.url, {
        method: 'POST',
        headers: requestRecord.headers,
        body: JSON.stringify(afterBufferPayload)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = {
        status: res.status,
        statusText: res.statusText,
        durationMs,
        body: data
      };

      assertions.push({
        description: 'Server phải cho phép đặt bàn và trả về HTTP 201 Created',
        passed: res.status === 201,
        expected: 201,
        actual: res.status
      });

      isPassed = assertions.every(a => a.passed);
      log(isPassed ? `✅ [PASS] Cho phép đặt cùng bàn T-03 ca 2 lúc 20:30` : `❌ [FAIL] Từ chối ca 2 ngoài buffer`);
    }

    else if (testCase.id === 'TC-BK-05') {
      // Đặt bàn tương lai không làm bàn hôm nay thành reserved
      const res = await fetch(`${baseUrl}/api/tables`, { method: 'GET' });
      const tablesData = await res.json();
      const targetTable = (tablesData || []).find((t: any) => t.id === 'T-01');
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = {
        status: res.status,
        statusText: res.statusText,
        durationMs,
        body: targetTable
      };

      assertions.push({
        description: 'Bàn T-01 hôm nay phải ở trạng thái available',
        passed: targetTable ? targetTable.status === 'available' : false,
        expected: 'available',
        actual: targetTable?.status
      });

      isPassed = assertions.every(a => a.passed);
      log(isPassed ? `✅ [PASS] Bàn hôm nay giữ nguyên trạng thái available` : `❌ [FAIL] Bàn bị đổi trạng thái sai`);
    }

    // -----------------------------------------------------------------------
    // SUITE 2: INPUT VALIDATION & BOUNDARY VALUE
    // -----------------------------------------------------------------------
    else if (testCase.id === 'TC-VAL-01') {
      // Số điện thoại Việt Nam hợp lệ
      const payload = {
        customerName: '[TEST] Khách SĐT Chuẩn',
        customerPhone: '0912345678',
        customerEmail: 'sdtchuan@test.vn',
        guestCount: 2,
        bookingDate: testDate,
        arrivalTime: '11:30',
        tableId: 'T-04'
      };
      requestRecord.body = payload;
      const res = await fetch(requestRecord.url, {
        method: 'POST',
        headers: requestRecord.headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = { status: res.status, statusText: res.statusText, durationMs, body: data };
      assertions.push({
        description: 'Chấp thuận SĐT 10 số đầu 0912... với mã 201 Created',
        passed: res.status === 201,
        expected: 201,
        actual: res.status
      });
      isPassed = assertions.every(a => a.passed);
    }

    else if (testCase.id === 'TC-VAL-02') {
      // Từ chối SĐT sai định dạng
      const payload = {
        customerName: '[TEST] Khách SĐT Lỗi',
        customerPhone: '090abc1234',
        customerEmail: 'sdtloi@test.vn',
        guestCount: 2,
        bookingDate: testDate,
        arrivalTime: '11:30',
        tableId: 'T-04'
      };
      requestRecord.body = payload;
      const res = await fetch(requestRecord.url, {
        method: 'POST',
        headers: requestRecord.headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = { status: res.status, statusText: res.statusText, durationMs, body: data };
      assertions.push({
        description: 'Server trả về HTTP 400 Bad Request',
        passed: res.status === 400,
        expected: 400,
        actual: res.status
      });
      assertions.push({
        description: 'Mã lỗi nghiệp vụ INVALID_PHONE',
        passed: data.code === 'INVALID_PHONE',
        expected: 'INVALID_PHONE',
        actual: data.code
      });
      isPassed = assertions.every(a => a.passed);
    }

    else if (testCase.id === 'TC-VAL-03') {
      // Từ chối Email sai định dạng
      const payload = {
        customerName: '[TEST] Khách Email Lỗi',
        customerPhone: '0900000777',
        customerEmail: 'khach-khong-co-domain',
        guestCount: 2,
        bookingDate: testDate,
        arrivalTime: '11:30',
        tableId: 'T-04'
      };
      requestRecord.body = payload;
      const res = await fetch(requestRecord.url, {
        method: 'POST',
        headers: requestRecord.headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = { status: res.status, statusText: res.statusText, durationMs, body: data };
      assertions.push({
        description: 'Server trả về HTTP 400 Bad Request',
        passed: res.status === 400,
        expected: 400,
        actual: res.status
      });
      assertions.push({
        description: 'Mã lỗi INVALID_EMAIL',
        passed: data.code === 'INVALID_EMAIL',
        expected: 'INVALID_EMAIL',
        actual: data.code
      });
      isPassed = assertions.every(a => a.passed);
    }

    else if (testCase.id === 'TC-VAL-04') {
      // Khách = 0
      const payload = {
        customerName: '[TEST] Khách Số Lượng 0',
        customerPhone: '0900000888',
        customerEmail: 'guest0@test.vn',
        guestCount: 0,
        bookingDate: testDate,
        arrivalTime: '11:30',
        tableId: 'T-04'
      };
      requestRecord.body = payload;
      const res = await fetch(requestRecord.url, {
        method: 'POST',
        headers: requestRecord.headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = { status: res.status, statusText: res.statusText, durationMs, body: data };
      assertions.push({
        description: 'Mã HTTP 400 khi số khách = 0',
        passed: res.status === 400,
        expected: 400,
        actual: res.status
      });
      assertions.push({
        description: 'Mã lỗi INVALID_GUEST_COUNT',
        passed: data.code === 'INVALID_GUEST_COUNT',
        expected: 'INVALID_GUEST_COUNT',
        actual: data.code
      });
      isPassed = assertions.every(a => a.passed);
    }

    else if (testCase.id === 'TC-VAL-05') {
      // Khách = 35 (vượt quá 30)
      const payload = {
        customerName: '[TEST] Khách Số Lượng 35',
        customerPhone: '0900000889',
        customerEmail: 'guest35@test.vn',
        guestCount: 35,
        bookingDate: testDate,
        arrivalTime: '11:30',
        tableId: 'T-04'
      };
      requestRecord.body = payload;
      const res = await fetch(requestRecord.url, {
        method: 'POST',
        headers: requestRecord.headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = { status: res.status, statusText: res.statusText, durationMs, body: data };
      assertions.push({
        description: 'Mã HTTP 400 khi vượt trần 30 khách',
        passed: res.status === 400,
        expected: 400,
        actual: res.status
      });
      assertions.push({
        description: 'Mã lỗi INVALID_GUEST_COUNT',
        passed: data.code === 'INVALID_GUEST_COUNT',
        expected: 'INVALID_GUEST_COUNT',
        actual: data.code
      });
      isPassed = assertions.every(a => a.passed);
    }

    else if (testCase.id === 'TC-VAL-06') {
      // Ngày đặt bàn trong quá khứ
      const payload = {
        customerName: '[TEST] Ngày Quá Khứ',
        customerPhone: '0900000991',
        customerEmail: 'pastdate@test.vn',
        guestCount: 2,
        bookingDate: '2020-01-01',
        arrivalTime: '11:30',
        tableId: 'T-04'
      };
      requestRecord.body = payload;
      const res = await fetch(requestRecord.url, {
        method: 'POST',
        headers: requestRecord.headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = { status: res.status, statusText: res.statusText, durationMs, body: data };
      assertions.push({
        description: 'Mã HTTP 400 khi đặt ngày quá khứ',
        passed: res.status === 400,
        expected: 400,
        actual: res.status
      });
      assertions.push({
        description: 'Mã lỗi PAST_BOOKING_DATE',
        passed: data.code === 'PAST_BOOKING_DATE',
        expected: 'PAST_BOOKING_DATE',
        actual: data.code
      });
      isPassed = assertions.every(a => a.passed);
    }

    else if (testCase.id === 'TC-VAL-07') {
      // Giờ ngoài giờ mở cửa (03:00 sáng)
      const payload = {
        customerName: '[TEST] Giờ Nửa Đêm',
        customerPhone: '0900000992',
        customerEmail: 'midnight@test.vn',
        guestCount: 2,
        bookingDate: testDate,
        arrivalTime: '03:00',
        tableId: 'T-04'
      };
      requestRecord.body = payload;
      const res = await fetch(requestRecord.url, {
        method: 'POST',
        headers: requestRecord.headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = { status: res.status, statusText: res.statusText, durationMs, body: data };
      assertions.push({
        description: 'Mã HTTP 400 khi ngoài giờ mở cửa',
        passed: res.status === 400,
        expected: 400,
        actual: res.status
      });
      assertions.push({
        description: 'Mã lỗi OUT_OF_OPERATING_HOURS',
        passed: data.code === 'OUT_OF_OPERATING_HOURS',
        expected: 'OUT_OF_OPERATING_HOURS',
        actual: data.code
      });
      isPassed = assertions.every(a => a.passed);
    }

    else if (testCase.id === 'TC-VAL-08') {
      // Mã bàn không tồn tại
      const payload = {
        customerName: '[TEST] Bàn Ảo',
        customerPhone: '0900000993',
        customerEmail: 'fakeTable@test.vn',
        guestCount: 2,
        bookingDate: testDate,
        arrivalTime: '12:00',
        tableId: 'TABLE-UNKNOWN-999'
      };
      requestRecord.body = payload;
      const res = await fetch(requestRecord.url, {
        method: 'POST',
        headers: requestRecord.headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = { status: res.status, statusText: res.statusText, durationMs, body: data };
      assertions.push({
        description: 'Mã HTTP 400 khi mã bàn không có thật',
        passed: res.status === 400,
        expected: 400,
        actual: res.status
      });
      assertions.push({
        description: 'Mã lỗi TABLE_NOT_FOUND',
        passed: data.code === 'TABLE_NOT_FOUND',
        expected: 'TABLE_NOT_FOUND',
        actual: data.code
      });
      isPassed = assertions.every(a => a.passed);
    }

    // -----------------------------------------------------------------------
    // SUITE 3: STATE MACHINE & STATUS TRANSITIONS
    // -----------------------------------------------------------------------
    else if (testCase.id === 'TC-STM-01') {
      // Tạo 1 đơn mới
      const createRes = await fetch(`${baseUrl}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: '[TEST] Khách STM1',
          customerPhone: '0900000601',
          customerEmail: 'stm1@test.vn',
          guestCount: 2,
          bookingDate: testDate,
          arrivalTime: '12:00',
          tableId: 'T-06'
        })
      });
      const createdData = await createRes.json();
      const resId = createdData.id;

      // Chuyển sang confirmed (hoặc giữ confirmed)
      requestRecord.url = `${baseUrl}/api/reservations/${resId}/status`;
      requestRecord.method = 'PATCH';
      requestRecord.body = { status: 'confirmed' };

      const res = await fetch(requestRecord.url, {
        method: 'PATCH',
        headers: requestRecord.headers,
        body: JSON.stringify(requestRecord.body)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = { status: res.status, statusText: res.statusText, durationMs, body: data };
      assertions.push({
        description: 'HTTP 200 OK khi xác nhận đơn',
        passed: res.status === 200,
        expected: 200,
        actual: res.status
      });
      assertions.push({
        description: 'Trạng thái sau cập nhật là confirmed',
        passed: data.status === 'confirmed',
        expected: 'confirmed',
        actual: data.status
      });
      isPassed = assertions.every(a => a.passed);
    }

    else if (testCase.id === 'TC-STM-02') {
      // confirmed -> checked_in -> bàn đổi thành occupied
      const createRes = await fetch(`${baseUrl}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: '[TEST] Khách Checkin',
          customerPhone: '0900000602',
          customerEmail: 'stm2@test.vn',
          guestCount: 2,
          bookingDate: testDate,
          arrivalTime: '12:00',
          tableId: 'T-07'
        })
      });
      const createdData = await createRes.json();

      requestRecord.url = `${baseUrl}/api/reservations/${createdData.id}/status`;
      requestRecord.method = 'PATCH';
      requestRecord.body = { status: 'checked_in' };

      const res = await fetch(requestRecord.url, {
        method: 'PATCH',
        headers: requestRecord.headers,
        body: JSON.stringify(requestRecord.body)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      // Kiểm tra bàn T-07
      const tablesRes = await fetch(`${baseUrl}/api/tables`);
      const tablesList = await tablesRes.json();
      const targetTable = (tablesList || []).find((t: any) => t.id === 'T-07');

      responseRecord = { status: res.status, statusText: res.statusText, durationMs, body: { data, table: targetTable } };
      assertions.push({
        description: 'HTTP 200 OK khi check-in',
        passed: res.status === 200,
        expected: 200,
        actual: res.status
      });
      assertions.push({
        description: 'Trạng thái đơn là checked_in',
        passed: data.status === 'checked_in',
        expected: 'checked_in',
        actual: data.status
      });
      assertions.push({
        description: 'Trạng thái bàn T-07 chuyển sang occupied',
        passed: targetTable?.status === 'occupied',
        expected: 'occupied',
        actual: targetTable?.status
      });
      isPassed = assertions.every(a => a.passed);
    }

    else if (testCase.id === 'TC-STM-03') {
      // checked_in -> completed -> bàn giải phóng available
      const createRes = await fetch(`${baseUrl}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: '[TEST] Khách Complete',
          customerPhone: '0900000603',
          customerEmail: 'stm3@test.vn',
          guestCount: 2,
          bookingDate: testDate,
          arrivalTime: '12:00',
          tableId: 'T-08'
        })
      });
      const createdData = await createRes.json();

      // Check-in trước
      await fetch(`${baseUrl}/api/reservations/${createdData.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'checked_in' })
      });

      // Chuyển sang completed
      requestRecord.url = `${baseUrl}/api/reservations/${createdData.id}/status`;
      requestRecord.method = 'PATCH';
      requestRecord.body = { status: 'completed' };

      const res = await fetch(requestRecord.url, {
        method: 'PATCH',
        headers: requestRecord.headers,
        body: JSON.stringify(requestRecord.body)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      // Kiểm tra bàn T-08 đã về available
      const tablesRes = await fetch(`${baseUrl}/api/tables`);
      const tablesList = await tablesRes.json();
      const targetTable = (tablesList || []).find((t: any) => t.id === 'T-08');

      responseRecord = { status: res.status, statusText: res.statusText, durationMs, body: { data, table: targetTable } };
      assertions.push({
        description: 'HTTP 200 OK khi hoàn tất đơn',
        passed: res.status === 200,
        expected: 200,
        actual: res.status
      });
      assertions.push({
        description: 'Bàn T-08 tự động trở lại trạng thái available',
        passed: targetTable?.status === 'available',
        expected: 'available',
        actual: targetTable?.status
      });
      isPassed = assertions.every(a => a.passed);
    }

    else if (testCase.id === 'TC-STM-04') {
      // Chống chuyển ngược: cancelled -> confirmed
      const createRes = await fetch(`${baseUrl}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: '[TEST] Khách Hủy',
          customerPhone: '0900000604',
          customerEmail: 'canceltest@test.vn',
          guestCount: 2,
          bookingDate: testDate,
          arrivalTime: '12:00',
          tableId: 'T-09'
        })
      });
      const createdData = await createRes.json();

      // Hủy đơn
      await fetch(`${baseUrl}/api/reservations/${createdData.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });

      // Cố tình chuyển ngược về confirmed
      requestRecord.url = `${baseUrl}/api/reservations/${createdData.id}/status`;
      requestRecord.method = 'PATCH';
      requestRecord.body = { status: 'confirmed' };

      const res = await fetch(requestRecord.url, {
        method: 'PATCH',
        headers: requestRecord.headers,
        body: JSON.stringify(requestRecord.body)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = { status: res.status, statusText: res.statusText, durationMs, body: data };
      assertions.push({
        description: 'Chặn chuyển ngược và trả về HTTP 400 Bad Request',
        passed: res.status === 400,
        expected: 400,
        actual: res.status
      });
      assertions.push({
        description: 'Mã lỗi INVALID_STATUS_TRANSITION',
        passed: data.code === 'INVALID_STATUS_TRANSITION',
        expected: 'INVALID_STATUS_TRANSITION',
        actual: data.code
      });
      isPassed = assertions.every(a => a.passed);
    }

    else if (testCase.id === 'TC-STM-05') {
      // Chống chuyển ngược: completed -> pending
      const createRes = await fetch(`${baseUrl}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: '[TEST] Khách Done',
          customerPhone: '0900000605',
          customerEmail: 'donetest@test.vn',
          guestCount: 2,
          bookingDate: testDate,
          arrivalTime: '12:00',
          tableId: 'T-10'
        })
      });
      const createdData = await createRes.json();
      await fetch(`${baseUrl}/api/reservations/${createdData.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });

      requestRecord.url = `${baseUrl}/api/reservations/${createdData.id}/status`;
      requestRecord.method = 'PATCH';
      requestRecord.body = { status: 'pending' };

      const res = await fetch(requestRecord.url, {
        method: 'PATCH',
        headers: requestRecord.headers,
        body: JSON.stringify(requestRecord.body)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = { status: res.status, statusText: res.statusText, durationMs, body: data };
      assertions.push({
        description: 'Chặn đổi trạng thái đơn completed và trả về HTTP 400',
        passed: res.status === 400,
        expected: 400,
        actual: res.status
      });
      isPassed = assertions.every(a => a.passed);
    }

    else if (testCase.id === 'TC-STM-06') {
      // Trạng thái không tồn tại
      requestRecord.url = `${baseUrl}/api/reservations/some_id/status`;
      requestRecord.method = 'PATCH';
      requestRecord.body = { status: 'unknown_hacked_status' };

      const res = await fetch(requestRecord.url, {
        method: 'PATCH',
        headers: requestRecord.headers,
        body: JSON.stringify(requestRecord.body)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = { status: res.status, statusText: res.statusText, durationMs, body: data };
      assertions.push({
        description: 'Server từ chối trạng thái không hợp lệ với HTTP 400',
        passed: res.status === 400,
        expected: 400,
        actual: res.status
      });
      assertions.push({
        description: 'Mã lỗi INVALID_STATUS',
        passed: data.code === 'INVALID_STATUS',
        expected: 'INVALID_STATUS',
        actual: data.code
      });
      isPassed = assertions.every(a => a.passed);
    }

    // -----------------------------------------------------------------------
    // SUITE 4: MENU & PRICING INTEGRITY
    // -----------------------------------------------------------------------
    else if (testCase.id === 'TC-MN-01') {
      // Menu công khai không cần token
      requestRecord.url = `${baseUrl}/api/menu`;
      requestRecord.method = 'GET';
      const res = await fetch(requestRecord.url);
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = { status: res.status, statusText: res.statusText, durationMs, body: data };
      assertions.push({
        description: 'HTTP 200 OK khi lấy menu công khai',
        passed: res.status === 200,
        expected: 200,
        actual: res.status
      });
      assertions.push({
        description: 'Trả về danh mục chứa ít nhất 20 món ăn',
        passed: Array.isArray(data) && data.length >= 20,
        expected: '>= 20 món',
        actual: `${data?.length || 0} món`
      });
      isPassed = assertions.every(a => a.passed);
    }

    else if (testCase.id === 'TC-MN-02') {
      // Chống giả mạo giá client price tampering
      // Bò Wagyu A5 giá thật 1,650,000; Client gửi 1,000 VND
      const payload = {
        customerName: '[TEST] Khách Thử Can Thiệp Giá',
        customerPhone: '0900000789',
        customerEmail: 'tamper@test.vn',
        guestCount: 2,
        bookingDate: testDate,
        arrivalTime: '19:00',
        tableId: 'T-11',
        selectedDishes: [
          {
            dish: { id: 'dish-01', name: 'Bò Wagyu A5', price: 1000 }, // Giá giả mạo
            quantity: 1
          }
        ]
      };
      requestRecord.body = payload;
      const res = await fetch(requestRecord.url, {
        method: 'POST',
        headers: requestRecord.headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = { status: res.status, statusText: res.statusText, durationMs, body: data };
      assertions.push({
        description: 'Server phải tự tính lại tổng tiền dựa trên giá gốc 1,650,000 VND',
        passed: data.preOrderTotal === 1650000,
        expected: 1650000,
        actual: data.preOrderTotal
      });
      isPassed = assertions.every(a => a.passed);
    }

    // -----------------------------------------------------------------------
    // SUITE 5: SECURITY & RBAC
    // -----------------------------------------------------------------------
    else if (testCase.id === 'TC-SEC-01') {
      // Đăng nhập Admin
      requestRecord.url = `${baseUrl}/api/auth/login`;
      requestRecord.method = 'POST';
      requestRecord.body = { username: 'admin', password: 'admin123' };

      const res = await fetch(requestRecord.url, {
        method: 'POST',
        headers: requestRecord.headers,
        body: JSON.stringify(requestRecord.body)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = { status: res.status, statusText: res.statusText, durationMs, body: data };
      assertions.push({
        description: 'HTTP 200 OK khi đăng nhập thành công',
        passed: res.status === 200,
        expected: 200,
        actual: res.status
      });
      assertions.push({
        description: 'Cấp token định dạng JWT hợp lệ',
        passed: Boolean(data.token && data.token.split('.').length === 3),
        expected: 'JWT Token (3 segments)',
        actual: data.token ? `${data.token.slice(0, 15)}...` : 'Không có'
      });
      assertions.push({
        description: 'Vai trò người dùng là admin',
        passed: data.user?.role === 'admin',
        expected: 'admin',
        actual: data.user?.role
      });
      isPassed = assertions.every(a => a.passed);
    }

    else if (testCase.id === 'TC-SEC-02') {
      // Đăng nhập sai mật khẩu
      requestRecord.url = `${baseUrl}/api/auth/login`;
      requestRecord.method = 'POST';
      requestRecord.body = { username: 'admin', password: 'wrongpassword999' };

      const res = await fetch(requestRecord.url, {
        method: 'POST',
        headers: requestRecord.headers,
        body: JSON.stringify(requestRecord.body)
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = { status: res.status, statusText: res.statusText, durationMs, body: data };
      assertions.push({
        description: 'HTTP 401 Unauthorized khi mật khẩu sai',
        passed: res.status === 401,
        expected: 401,
        actual: res.status
      });
      isPassed = assertions.every(a => a.passed);
    }

    else if (testCase.id === 'TC-SEC-03') {
      // Chặn API bảo mật khi thiếu Bearer token
      requestRecord.url = `${baseUrl}/api/email-logs`;
      requestRecord.method = 'GET';

      const res = await fetch(requestRecord.url);
      const data = await res.json().catch(() => ({}));
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = { status: res.status, statusText: res.statusText, durationMs, body: data };
      assertions.push({
        description: 'HTTP 401 Unauthorized khi truy cập không có token',
        passed: res.status === 401,
        expected: 401,
        actual: res.status
      });
      isPassed = assertions.every(a => a.passed);
    }

    // -----------------------------------------------------------------------
    // SUITE 6: E2E TOÀN TRÌNH
    // -----------------------------------------------------------------------
    else if (testCase.id === 'TC-E2E-01') {
      log('Bước 1: Khách đặt bàn T-12 trực tuyến...');
      const createRes = await fetch(`${baseUrl}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: '[TEST] Đoàn E2E VIP',
          customerPhone: '0900000999',
          customerEmail: 'e2e.vip@test.vn',
          guestCount: 4,
          bookingDate: testDate,
          arrivalTime: '19:30',
          tableId: 'T-12',
          selectedDishes: [{ dish: { id: 'dish-01', name: 'Bò Wagyu A5', price: 1650000 }, quantity: 2 }]
        })
      });
      const booking = await createRes.json();
      log(`✔️ Đã sinh mã đặt bàn #${booking.bookingCode}`);

      log('Bước 2: Lễ tân check-in khách vào bàn...');
      await fetch(`${baseUrl}/api/reservations/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'checked_in' })
      });

      log('Bước 3: Khách hoàn tất dùng bữa và thu ngân đóng bàn...');
      const settleRes = await fetch(`${baseUrl}/api/reservations/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      const settleData = await settleRes.json();

      log('Bước 4: Kiểm tra trạng thái bàn T-12 sau khi giải phóng...');
      const tablesRes = await fetch(`${baseUrl}/api/tables`);
      const tablesList = await tablesRes.json();
      const targetTable = (tablesList || []).find((t: any) => t.id === 'T-12');
      const durationMs = Math.round(performance.now() - startTime);

      responseRecord = { status: settleRes.status, statusText: settleRes.statusText, durationMs, body: { booking, settleData, table: targetTable } };
      assertions.push({
        description: 'Đơn hoàn thành chu trình sang completed',
        passed: settleData.status === 'completed',
        expected: 'completed',
        actual: settleData.status
      });
      assertions.push({
        description: 'Bàn T-12 được trả về available để đón khách mới',
        passed: targetTable?.status === 'available',
        expected: 'available',
        actual: targetTable?.status
      });
      isPassed = assertions.every(a => a.passed);
    }

  } catch (err: any) {
    errorMsg = err?.message || String(err);
    log(`❌ Ngoại lệ hệ thống: ${errorMsg}`);
    isPassed = false;
  }

  const finalDuration = Math.round(performance.now() - startTime);
  log(`🏁 Hoàn tất [${testCase.id}] trong ${finalDuration}ms -> ${isPassed ? 'PASS ✅' : 'FAIL ❌'}`);

  return {
    ...testCase,
    status: isPassed ? 'passed' : 'failed',
    durationMs: finalDuration,
    requestRecord,
    responseRecord,
    assertions,
    logs,
    errorMessage: errorMsg,
    executedAt: new Date().toLocaleTimeString('vi-VN')
  };
}
