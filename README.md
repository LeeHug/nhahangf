# 🍽️ Hệ Thống Đặt Bàn & Quản Trị Nhà Hàng Cao Cấp (Le Gourmet)

Hệ thống đặt bàn trực tuyến, chọn món trước, xuất vé check-in QR tự động kết hợp **Bảng Điều Hành Nghiệp Vụ Phân Quyền (Admin & Staff Management Hub)** dành cho chuỗi nhà hàng cao cấp.

![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-cyan.svg)

---

## 🌟 Tính Năng Nổi Bật

### 1. Dành Cho Khách Hàng (Customer Booking Journey)
- **Đặt bàn thông minh 4 bước**: Chọn ngày, khung giờ, số lượng khách và sơ đồ vị trí bàn mong muốn trên **48 bàn ăn đa dạng** (Sảnh chính 15 bàn, Phòng VIP 10 phòng, Sân vườn 12 bàn, Ban công Rooftop 11 bàn).
- **Thực đơn gọi món trước (Pre-order Menu)**: Khám phá menu phong phú gồm **24 món ăn & thức uống fine-dining cao cấp** (Bò Wagyu A5, Cua Hoàng Đế Alaska, Bò Black Angus, Gan Ngỗng Foie Gras, Tôm Hùm Truffle, Sò Điệp Hokkaido, Bánh Soufflé Bỉ, Rượu Champagne Dom Pérignon...).
- **Thanh toán cọc & Xuất vé điện tử**: Tự động sinh mã đặt bàn (`#BK-XXXX`) và mã **QR Check-in** độc quyền.
- **Hệ thống Hội viên & Tích điểm**: Tích lũy điểm thưởng theo chi tiêu, phân hạng Silver, Gold, Platinum và áp dụng Voucher khuyến mãi.
- **Tra cứu đặt bàn**: Tra cứu nhanh lịch sử và trạng thái bàn qua Số điện thoại hoặc Mã đặt chỗ.


---

### 2. Dành Cho Nhân Viên Vận Hành (`Staff Operations Hub`)
Tối ưu hóa tốc độ thao tác cho lễ tân, nhân viên phục vụ bàn và thu ngân trong ca trực:
- **Fast Reception & Check-in Desk**: 
  - Tra cứu tức thì khách đặt bàn bằng mã Booking (`#BK-XXXX`) hoặc SĐT.
  - Check-in 1-chạm xác nhận khách đã đến nhà hàng, tự động chuyển trạng thái bàn sang "Đang dùng bữa".
- **Sơ đồ bàn trực quan theo thời gian thực (Live Table Map)**:
  - Hiển thị trực quan trạng thái từng bàn: *Trống (Xanh)*, *Đã đặt trước (Vàng)*, *Đang phục vụ (Tím)*.
- **Gọi món bổ sung tại bàn (Live Table Ordering)**:
  - Nhân viên có thể thêm món phát sinh ngay tại bàn theo yêu cầu của khách, tự động cập nhật tổng bill.
- **Thanh toán & Đóng bàn (Table Checkout)**:
  - Khấu trừ chính xác tiền cọc trước đó, áp dụng voucher giảm giá.
  - Hỗ trợ đa dạng phương thức: Tiền mặt, Chuyển khoản VietQR tự động, Thẻ tín dụng/POS.
  - Xem trước và in hóa đơn thanh toán chi tiết.
- **Tóm tắt ca trực (Shift Summary)**: Tổng kết số lượt bàn đã phục vụ, số lượng khách và doanh thu ghi nhận trong ca.

---

### 3. Màn Hình Điều Phối Bếp & Bar (`Kitchen Display System - KDS`)
Hệ thống hiển thị thời gian thực chuyên dụng cho Bếp Trưởng, Phụ Bếp và Bartender:
- **Phân luồng theo Trạm Chế Biến (Station Routing)**:
  - **Bếp Nóng (Hot Kitchen / Grill)**: Bò Wagyu A5, Bò Angus, Cừu hầm, Hải sản nóng...
  - **Bếp Lạnh & Khai Vị (Cold Kitchen)**: Salad hoàng gia, Hàu tươi, Súp khai vị...
  - **Quầy Bar & Rượu (Bar & Sommelier)**: Rượu vang Grand Cru, Cocktail cao cấp, Nước ép...
  - **Bếp Bánh & Tráng Miệng (Pastry & Dessert)**: Tiramisu, Kem thủ công, Bánh ngọt...
- **Vòng đời trạng thái món ăn**:
  - `Pending` (Chờ làm) ➔ `Cooking` (Đang nấu) ➔ `Ready` (Bếp ra món - Chờ bưng) ➔ `Served` (Đã lên bàn).
- **Đồng hồ đo thời gian (Elapsed Timers) & Cảnh báo trễ**:
  - Mã màu trực quan: Xanh lá (< 10 phút), Cam cảnh báo (10 - 20 phút), Đỏ nhấp nháy khẩn cấp (> 20 phút).
- **Hệ thống âm thanh chuông bếp (Web Audio API Synthesizer)**:
  - Tự động phát âm thanh chuông báo chuẩn nhà hàng (Dinner Bell Chime) khi có món ra hoặc có đơn đặt bàn mới.
- **Thao tác 1-chạm & Chế độ Fullscreen**:
  - Nút "Bếp Ra Món 🔔", "Nấu Toàn Bộ", "Đã Lên Bàn", Đổi độ ưu tiên vé (Thường / Gấp / VIP).
  - Tối ưu cảm ứng và hiển thị toàn màn hình (Fullscreen) trên tablet hoặc màn hình cảm ứng gắn trạm bếp.

---

### 4. Quản Lý Kho & Định Lượng Món Ăn (`Recipe BOM & Inventory Control`)
Hệ thống chuyển đổi từ phần mềm đặt bàn thuần túy sang phần mềm **Quản trị Chi phí Nhà Hàng Toàn Diện (Cost Control Suite)**:
- **Định lượng nguyên liệu (Bill of Materials - BOM)**:
  - Khi khách gọi **1 phần Bò Wagyu Nướng Đá Muối A5**, hệ thống tự động trừ kho chính xác: **250g Thăn bò Wagyu**, **20g Bơ lạt**, **5g Nấm Truffle đen**.
  - Trình chỉnh sửa cấu trúc định lượng món ăn linh hoạt, đánh dấu các nguyên vật liệu cốt lõi (`isCrucial`).
- **Cảnh báo chạm ngưỡng an toàn (Low Stock Alert)**:
  - Tự động nhận diện và cảnh báo mức tồn kho sắp hết (Màu vàng/đỏ).
  - Tự động khóa món trên thực đơn khi thiếu nguyên liệu chính để bảo vệ uy tín nhà hàng.
  - Tự động kích hoạt mở khóa lại món trên Menu ngay khi nhân viên thực hiện thao tác nhập thêm hàng vào kho.
- **Báo cáo Giá Vốn Hàng Bán & Tỷ Suất Lợi Nhuận (Food Cost Percentage)**:
  - Giúp chủ nhà hàng nắm bắt chính xác giá vốn (COGS), biên lợi nhuận gộp trên từng đĩa thức ăn.
  - Phân loại tỷ lệ Food Cost % theo chuẩn Fine Dining quốc tế (dưới 30% siêu lợi nhuận, 30% - 40% chuẩn mực, trên 40% món cao cấp cần kiểm soát).
  - Thống kê năng lực phục vụ tối đa (Max Portions Available) dựa trên lượng tồn kho thực tế.
- **Sổ Nhật Ký Biến Động Kho (Inventory Movement Audit Logs)**:
  - Ghi nhận chi tiết từng lần xuất kho khi có khách đặt bàn hoặc gọi món tại bàn, tham chiếu theo mã đặt bàn và tên món.
  - Ghi nhận các phiếu nhập hàng bổ sung từ nhà cung ứng.

---

### 5. Cổng Tự Phục Vụ Tại Bàn & Chuông Gọi Phục Vụ Số (`Smart Table Self-Service & Waiter Call`)
Trải nghiệm công nghệ cao ngay tại bàn tiệc dành cho thực khách:
- **Chuông gọi phục vụ 1-chạm (One-Touch Service Bell)**:
  - 🧊 *Tiếp nước & Thêm đá*
  - 🍷 *Tư vấn rượu vang cùng chuyên gia Sommelier*
  - 🥢 *Đổi dao dĩa & đĩa ăn cho món mới*
  - 🧼 *Khăn ấm cao cấp hương sả chanh*
  - 💳 *Yêu cầu in hóa đơn & thanh toán*
  - 🛎️ *Gặp Quản lý sảnh*
  - Gửi yêu cầu tùy chỉnh trực tiếp.
- **Âm thanh chuông báo Web Audio API (High Harmonic Bell)**:
  - Tự động reo chuông và hiển thị banner cảnh báo đỏ nổi bật trên bảng vận hành của Nhân viên & Admin khi có bàn gọi.
- **Tự gọi thêm món & rượu vang tại bàn (Self-Ordering)**:
  - Thực khách có thể tự do xem menu, chọn thêm rượu vang hoặc món tráng miệng trực tiếp từ điện thoại.
  - Tự động trừ kho nguyên liệu BOM và bắn vé vào màn hình KDS Bếp tức thì.
- **Hóa đơn tạm tính trực tiếp (Live Running Tab)**:
  - Theo dõi toàn bộ món ăn đã lên bàn và tổng số tiền theo thời gian thực.

---

### 6. Quản Trị Trải Nghiệm Khách Hàng & Chỉ Số CSAT / NPS 5 Sao (`Customer Feedback & Intelligence`)
Nâng chuẩn văn hóa phục vụ của nhà hàng lên tầm quốc tế:
- **Khảo sát đánh giá đa chiều**:
  - Chấm điểm 1 - 5 sao: *Mức độ hài lòng chung*, *Chất lượng ẩm thực & độ tươi ngon*, *Cung cách phục vụ*, *Không gian & âm nhạc*.
  - Chỉ số **NPS (Net Promoter Score)** thang điểm 0 - 10 đo lường độ trung thành và khả năng giới thiệu cho bạn bè, đối tác.
  - Tự động tặng ngay **E-Voucher giảm 10% (Mã: `LEVIP10`)** tri ân thực khách sau khi gửi đánh giá.
- **Admin CSAT Intelligence Suite**:
  - Thống kê thời gian thực điểm CSAT trung bình (ví dụ: 4.85 / 5.0 ⭐).
  - Phân tích NPS: Tỷ lệ khách hàng Ủng hộ (Promoters), Trung lập (Passives), và Cần quan tâm (Detractors).
  - Phân loại đánh giá theo số sao (5★, 4★, ≤ 3★) và trạng thái chưa phản hồi.
  - **Tính năng chăm sóc VIP chủ động**: Soạn phản hồi chính thức từ Ban Quản lý kèm nút tặng E-Voucher bồi hoàn (`VIPCARE150` trị giá 150.000đ) để giữ chân khách hàng.

---

### 7. Dành Cho Ban Quản Lý (`Admin Executive Suite`)

Hệ thống báo cáo và quản trị toàn diện dành cho Quản lý nhà hàng:
- **Báo cáo Doanh thu & Kinh doanh (Executive Analytics)**:
  - Thống kê doanh thu theo ngày, tuần, tháng kèm biểu đồ tăng trưởng.
  - Tỷ lệ lấp đầy bàn (Occupancy Rate) theo từng khung giờ cao điểm.
  - Danh sách Top 5 món ăn bán chạy nhất.
  - Xuất báo cáo dữ liệu định dạng CSV / Excel.
- **Quản lý Thực đơn (Menu Management)**:
  - Bật / tắt trạng thái Còn hàng / Tạm hết món tức thì.
  - Phân loại danh mục món ăn (Appetizer, Main, Seafood, Dessert, Beverage).
- **Quản trị Nhân sự & Phân quyền (Staff Management)**:
  - Danh sách nhân viên, thông tin liên hệ, ca trực và chức vụ.
  - Phân quyền nghiêm ngặt giữa Quản trị viên (`admin`) và Nhân viên (`staff`).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend:** [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Icon System:** [Lucide React](https://lucide.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Backend / Dev Server:** [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **Dữ liệu & Đồng bộ:** Quản lý đồng bộ trạng thái lưu trữ thời gian thực (LocalStorage & RESTful API Service sẵn sàng kết nối Cloud SQL / Firestore).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu cầu tiên quyết
- [Node.js](https://nodejs.org/) phiên bản 18 trở lên
- npm (đi kèm sẵn khi cài đặt Node.js)

### Cài đặt
1. **Clone repository về máy:**
   ```bash
   git clone https://github.com/LeeHug/nhahangf.git
   cd nhahangf
   ```

2. **Cài đặt các gói thư viện (dependencies):**
   ```bash
   npm install
   ```

3. **Khởi chạy môi trường phát triển (Development):**
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ hoạt động tại địa chỉ: `http://localhost:3000` (hoặc cổng hiển thị trên terminal).

4. **Build đóng gói sản phẩm (Production):**
   ```bash
   npm run build
   ```

---

## 🔑 Tài Khoản Trải Nghiệm Mẫu (Demo Credentials)

Tại giao diện đăng nhập **Quản Trị**, hệ thống có tích hợp sẵn nút đăng nhập 1-chạm hoặc bạn có thể nhập:

| Vai Trò (Role) | Email Đăng Nhập | Mật Khẩu | Quyền Hạn |
| :--- | :--- | :--- | :--- |
| **Quản Trị Viên (Admin)** | `admin@legourmet.vn` | `123456` | Toàn quyền: Doanh thu, Menu, Nhân sự, Đặt bàn, Vận hành |
| **Nhân Viên Vận Hành (Staff)** | `staff@legourmet.vn` | `123456` | Tiếp tân, Check-in nhanh, Sơ đồ bàn, Gọi món & Thanh toán |
| **Khách Hàng (Customer)** | `lehung@gmail.com` | `123456` | Đặt bàn, Quản lý vé QR cá nhân, Điểm thưởng Platinum |

---

## 📁 Cấu Trúc Thư Mục Chính

```text
├── index.html                  # File HTML chính
├── package.json                # Cấu hình dự án & thư viện
├── vite.config.ts              # Cấu hình Vite bundler
├── server.ts                   # Backend Express server & API endpoints
├── src/
│   ├── main.tsx                # Entry point React
│   ├── App.tsx                 # Điều phối trang, modal & router
│   ├── types.ts                # TypeScript Interfaces & Data Models
│   ├── components/
│   │   ├── Navbar.tsx          # Thanh điều hướng trên cùng
│   │   ├── LookupModal.tsx     # Modal tra cứu đặt chỗ bằng mã/SĐT
│   │   ├── BookingFlow/        # Luồng đặt bàn & chọn món
│   │   │   ├── StepIndicator.tsx
│   │   │   ├── DateTimeTableSelector.tsx
│   │   │   ├── MenuSelector.tsx
│   │   │   └── BookingConfirmation.tsx
│   │   ├── Admin/              # Hệ thống quản trị Admin & Staff
│   │   │   ├── AdminDashboard.tsx      # Dashboard điều phối phân quyền
│   │   │   ├── AdminAccessGate.tsx    # Cổng xác thực quyền hạn
│   │   │   ├── StaffOperationsHub.tsx # Hub vận hành lễ tân & bàn cho Staff
│   │   │   ├── TableOrderModal.tsx    # Modal gọi thêm món tại bàn
│   │   │   ├── TableCheckoutModal.tsx # Modal thanh toán & in bill
│   │   │   ├── TableStatusMap.tsx     # Sơ đồ trạng thái bàn trực quan
│   │   │   ├── ReservationList.tsx    # Danh sách & bộ lọc đặt bàn
│   │   │   ├── RevenueReportView.tsx  # Báo cáo doanh thu & tài chính
│   │   │   ├── MenuManagementView.tsx # Quản lý thực đơn & bật/tắt món
│   │   │   └── StaffManagementView.tsx# Danh sách tài khoản nhân viên
│   │   └── Auth/               # Modal Đăng nhập/Đăng ký & Hồ sơ cá nhân
│   ├── data/
│   │   └── mockData.ts         # Dữ liệu khởi tạo (Bàn, Món ăn, Users mẫu)
│   └── services/
│       ├── api.ts              # API calls
│       └── storage.ts          # Quản lý lưu trữ & nghiệp vụ dữ liệu
```

---

## 📄 Bản Quyền & Giấy Phép
Dự án được phát triển phục vụ học tập và vận hành giải pháp nhà hàng. Phát hành theo giấy phép [MIT License](LICENSE).
