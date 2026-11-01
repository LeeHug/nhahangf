# 🧪 Le Gourmet Bistro — Hệ Thống Automation Testing Độc Lập (100 Test Cases)

> **Mã nguồn kiểm thử tự động độc lập**, tách biệt hoàn toàn khỏi mã nguồn chính của nhà hàng, sở hữu giao diện UI hiện đại trực quan, hỗ trợ chạy tuần tự toàn diện **100 kịch bản kiểm thử** (bao gồm luồng nghiệp vụ hợp lệ, dữ liệu không hợp lệ, giá trị biên, bảo mật SQLi/XSS/IDOR, chống trùng bàn, máy trạng thái đơn đặt và dịch vụ phục vụ tại bàn).

---

## 📋 Mục Lục
1. [Giới Thiệu](#-giới-thiệu)
2. [Cấu Trúc Tách Biệt Độc Lập](#-cấu-trúc-tách-biệt-độc-lập)
3. [Hướng Dẫn Cài Đặt & Chạy Local](#-hướng-dẫn-cài-đặt--chạy-local)
4. [Hướng Dẫn Đẩy Lên GitHub Riêng](#-hướng-dẫn-đẩy-lên-github-riêng)
5. [Phân Nhóm 100 Kịch Bản Kiểm Thử Tuần Tự](#-phân-nhóm-100-kịch-bản-kiểm-thử-tuần-tự)
6. [Tính Năng Nổi Bật Của Giao Diện UI](#-tính-năng-nổi-bật-của-giao-diện-ui)

---

## 🌟 Giới Thiệu
Dự án này là hệ thống kiểm thử tự động toàn diện được thiết kế riêng biệt cho ứng dụng đặt bàn và quản lý nhà hàng ẩm thực Pháp **Le Gourmet Bistro**. 

Hệ thống được xây dựng theo chuẩn kiểm thử phần mềm quốc tế (ISTQB) và chuẩn thực tập tester chuyên nghiệp tại các doanh nghiệp công nghệ (VTI):
- **Phân vùng tương đương (Equivalence Partitioning)**
- **Phân tích giá trị biên (Boundary Value Analysis - BVA)**
- **Kiểm thử tiêu cực (Negative Testing)**
- **Kiểm thử an ninh & bảo mật (Security Fuzzing - SQL Injection, Stored XSS, IDOR, Privilege Escalation, HPP)**
- **Kiểm thử luồng trạng thái máy hữu hạn & Tính lũy đẳng (State Machine Transition & Idempotency Testing)**
- **Kiểm thử xử lý tranh chấp & xung đột tài nguyên (Concurrency & Conflict Prevention)**
- **Dịch vụ tự phục vụ tại bàn (In-Dining Table Service)**

---

## 🏗️ Cấu Trúc Tách Biệt Độc Lập

Thư mục `automation-test-suite` hoạt động hoàn toàn độc lập với `package.json`, `vite.config.ts`, `tsconfig.json` và giao diện riêng:

```text
automation-test-suite/
├── index.html                      # Điểm vào HTML độc lập
├── package.json                    # Quản lý thư viện riêng biệt (React 19, Lucide, Tailwind, Vite)
├── tsconfig.json                   # Cấu hình TypeScript riêng
├── vite.config.ts                  # Cấu hình Vite dev server cổng 5173
├── README.md                       # Tài liệu hướng dẫn chi tiết & bảng đặc tả
└── src/
    ├── main.tsx                    # Điểm khởi chạy React độc lập
    ├── App.tsx                     # Giao diện chính điều phối chạy 100 ca kiểm thử
    ├── index.css                   # Tailwind CSS styling
    ├── types/
    │   └── testTypes.ts            # Định nghĩa cấu trúc dữ liệu, kết quả, HTTP record
    ├── data/
    │   └── testCasesData.ts        # Bộ dữ liệu 100 ca kiểm thử tuần tự (TC-01 -> TC-100)
    ├── services/
    │   └── testRunner.ts           # Động cơ gửi request, đo độ trễ, kiểm tra assertions
    └── components/
        ├── Header.tsx              # Thanh điều khiển, cấu hình URL máy chủ, Ping test
        ├── StatsRibbon.tsx         # Bảng chỉ số KPI: Passed, Failed, Tỷ lệ %, Độ trễ TB
        ├── FilterBar.tsx           # Bộ lọc theo 10 hạng mục, 4 loại test và tìm kiếm
        ├── TestCaseList.tsx        # Danh sách 100 ca kiểm thử tuần tự với huy hiệu trạng thái
        ├── TestCaseDetailModal.tsx  # Xem chi tiết Request/Response JSON và tiêu chí kiểm thử
        ├── TerminalConsole.tsx     # Cửa sổ dòng lệnh mô phỏng log thời gian thực
        ├── TestMatrixExportModal.tsx # Bảng đặc tả xuất báo cáo Markdown / CSV / JSON
        └── InteractivePlayground.tsx # Khu vực thử nghiệm request API tùy ý với các mẫu có sẵn
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Local

### Bước 1: Khởi động máy chủ backend nhà hàng
Mở một cửa sổ Terminal tại thư mục gốc:
```bash
npm run dev
# Máy chủ backend lắng nghe tại: http://localhost:3000
```

### Bước 2: Chạy hệ thống Automation Test Suite
Mở một cửa sổ Terminal thứ hai:
```bash
cd automation-test-suite
npm install
npm run dev
```

Mở trình duyệt truy cập: **`http://localhost:5173`**

Hoặc gõ trực tiếp từ thư mục gốc:
```bash
npm run test:ui
```

### Bước 3: Thực hiện kiểm thử
1. Kiểm tra mục **Target Server**: mặc định kết nối tới `http://localhost:3000`.
2. Bấm nút **"Ping"** để xác nhận kết nối máy chủ.
3. Bấm **"Chạy Tuần Tự Tất Cả (100 TCs)"** để hệ thống chạy tuần tự từ TC-01 đến TC-100.
4. Bấm **"Bảng Đặc Tả"** để xuất báo cáo kiểm thử dạng Markdown hoặc file Excel (CSV) phục vụ báo cáo đồ án / công việc.

---

## 🐙 Hướng Dẫn Đẩy Lên GitHub Riêng Biệt

```bash
# 1. Di chuyển vào thư mục automation
cd automation-test-suite

# 2. Khởi tạo Git repository mới
git init
git add .
git commit -m "feat: complete standalone 100-test-case automation testing suite with interactive UI"

# 3. Đổi tên nhánh sang main
git branch -M main

# 4. Thêm remote tới GitHub repository mới của bạn
git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo-test-automation>.git

# 5. Đẩy toàn bộ mã nguồn lên GitHub
git push -u origin main
```

---

## 📊 Phân Nhóm 100 Kịch Bản Kiểm Thử Tuần Tự

| Nhóm Nghiệp Vụ | Dải Mã TC | Số Lượng | Trọng Tâm Kiểm Thử |
| :--- | :---: | :---: | :--- |
| **1. Hạ Tầng & Kết Nối API** | TC-01 -> TC-07 | 7 TCs | Server Healthcheck, Sơ đồ bàn, Menu công khai, 404 Routing, Reset Sandbox, Kiểm tra MIME Type, Chống Buffer Overflow / Large Payload. |
| **2. Xác Thực & Phân Quyền (RBAC)** | TC-08 -> TC-21 | 14 TCs | Đăng ký hợp lệ, Bỏ trống email, Sai cú pháp email, Mật khẩu ngắn < 6 ký tự, Trùng email, Đăng nhập Admin, Đăng nhập Staff, Sai mật khẩu, Email không tồn tại, Truy cập không Token, Token giả mạo, **Leo thang đặc quyền (Privilege Escalation)**, Xác thực hồ sơ `GET /api/auth/me`, **Kiểm tra lỗ hổng IDOR sửa đổi hồ sơ người khác**. |
| **3. Khả Dụng Bàn & Khung Giờ** | TC-22 -> TC-31 | 10 TCs | Tra cứu hợp lệ, Thiếu tham số date/time/guests, Khách = 0, Khách âm, Vượt sức chứa tối đa nhà hàng (80 khách), Ngày sai định dạng, Giờ ngoài thời gian phục vụ (03:30), **Fuzzing SQLi trong Query tham số**. |
| **4. Đặt Bàn - Xác Thực Đầu Vào & Unicode** | TC-32 -> TC-47 | 16 TCs | Đặt bàn chuẩn, Bỏ trống tên, Mã độc XSS Script trong tên, Bỏ trống SĐT, SĐT chữ, SĐT quá ngắn (<9 số), SĐT quá dài (>12 số), SĐT ký tự đặc biệt, Email sai cú pháp, Vượt sức chứa bàn, Ngày quá khứ, Mã bàn ảo, Yêu cầu bàn VIP, **Stress test Tiếng Việt có dấu & Emoji**, **Ký tự vô hình Zero-Width Space (`\u200B`)**, **Tên cực dài > 255 ký tự**. |
| **5. Chống Trùng Bàn & Overbooking** | TC-48 -> TC-55 | 8 TCs | Đặt bàn mốc, **Chặn trùng giờ chính xác (409 Conflict)**, **Chặn trùng cửa sổ ăn uống 30 phút**, Đặt sau khi bữa trước kết thúc (Cách 2.5 giờ), Đặt cùng giờ ở bàn khác, Đặt sát giờ đóng cửa (21:45), **Giải phóng bàn sau khi hủy cho khách khác đặt**, Nhiều ca trong cùng ngày (Trưa/Chiều/Tối). |
| **6. Đặt Món Trước & Tính Giá Thực Đơn** | TC-56 -> TC-65 | 10 TCs | Món hợp lệ, Mã món ảo, Số lượng món = 0, Số lượng món âm, Tiệc đoàn số lượng lớn (30 phần), Tính toàn vẹn giá tiền, Ghi chú chế biến tùy chỉnh (Medium-Rare), Đặt nhiều món từ nhiều danh mục, Tính tiền cọc giữ bàn (Deposit), Lọc món đang phục vụ (isAvailable). |
| **7. Máy Trạng Thái & Tính Lũy Đẳng** | TC-66 -> TC-77 | 12 TCs | Khởi tạo `pending`, Nhân viên duyệt `confirmed`, Khách đến `seated`, Dùng bữa xong `completed`, Khách hủy `cancelled`, **Chặn chuyển phi logic `cancelled -> seated`**, **Chặn đảo ngược `completed -> pending`**, **Chặn chuyển `completed -> seated`**, Cập nhật mã đơn ảo 404, Admin cập nhật trạng thái bàn, Bảo vệ không token đổi bàn, **Kiểm tra tính lũy đẳng (Idempotency) khi gửi request trùng lặp**. |
| **8. Dịch Vụ Tại Bàn (In-Dining Service)** | TC-78 -> TC-85 | 8 TCs | Gọi nhân viên châm nước/đổi dĩa, Yêu cầu thanh toán chuyển khoản QR tại bàn, Gọi món bổ sung khi đang ăn, Thiếu thông tin số bàn, **Chống Stored XSS trong ghi chú tại bàn**, Yêu cầu chuyển bàn ăn (trong nhà ra ban công), Phản hồi chất lượng món tức thì tới bếp trưởng, Nhân viên truy vấn nhật ký yêu cầu phục vụ. |
| **9. Tra Cứu & Bảo Mật Khách Hàng** | TC-86 -> TC-94 | 9 TCs | Tra cứu SĐT hợp lệ, Tra cứu SĐT chưa có đơn, Bỏ trống SĐT, **Tấn công SQL Injection (`' OR '1'='1`)**, **Cách ly dữ liệu cá nhân**, Tra cứu Booking Code, Tra cứu mã đơn ảo, **Tấn công HTTP Parameter Pollution (HPP)**, **Bảo vệ danh sách người dùng GET /api/users**. |
| **10. Đánh Giá & Nhật Ký Email** | TC-95 -> TC-100 | 6 TCs | Đánh giá 5 sao hợp lệ, Thiếu trường bắt buộc, Rating vượt thang điểm (10 sao), Rating âm, **Bình luận chứa Stored XSS (`<img src=x onerror=...>`)**, Kiểm tra nhật ký email thông báo. |

---

## 💎 Tính Năng Nổi Bật Của Giao Diện UI
- **Chạy tự động tuần tự 1-Click**: Tự động chuyển qua lần lượt 100 kịch bản, hiển thị trực tiếp tiến độ thanh phần trăm, số ca đạt/thất bại và độ trễ phản hồi từng request.
- **Trình giám sát chi tiết Request/Response**: Cho phép xem cụ thể phương thức, URL đầy đủ, Headers, Body gửi đi và Body phản hồi từ server, hỗ trợ sao chép định dạng JSON chuẩn.
- **Bảng đặc tả ISTQB chuẩn**: Trực quan hóa toàn bộ ma trận kiểm thử, hỗ trợ xuất báo cáo định dạng Markdown (cho Github README) và CSV (cho Excel).
- **Interactive Sandbox Playground**: Tích hợp công cụ gửi request tự do với các kịch bản mẫu giúp tester dễ dàng kiểm chứng tức thời các trường hợp biên mới.
