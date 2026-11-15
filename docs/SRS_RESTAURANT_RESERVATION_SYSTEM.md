# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SOFTWARE REQUIREMENTS SPECIFICATION - SRS)
## DỰ ÁN: HỆ THỐNG ĐẶT BÀN VÀ QUẢN LÝ NHÀ HÀNG CAO CẤP LE GOURMET BISTRO

**Mã tài liệu:** SRS-LGB-2026-V3.1  
**Phiên bản:** 3.1.0 (Production Baseline - Đồng bộ mã nguồn & kiểm toán bảo mật)  
**Tác giả:** Senior Business Analyst & Senior Software Engineer  
**Ngày cập nhật:** 15/11/2026  
**Trạng thái:** Approved / Synchronized with Latest Codebase  

### Lịch sử phiên bản (Revision History)
| Phiên bản | Ngày | Mô tả thay đổi |
| :--- | :--- | :--- |
| **1.0.0** | 01/10/2026 | Khởi tạo đặc tả đặt bàn cơ bản và sơ đồ thực đơn. |
| **2.0.0** | 25/10/2026 | Bổ sung JWT/Bcrypt, Conflict Detection Engine 120 phút, Finite State Machine và tích hợp kiểm thử tự động. |
| **3.0.0** | 14/11/2026 | Đồng bộ hoàn toàn theo mã nguồn thực tế: tích hợp PostgreSQL + Drizzle ORM, RBAC Staff/Admin, tự hủy 120 phút, Sổ cái điểm thưởng, KDS 4 trạm, Kho BOM, CSAT/NPS. |
| **3.1.0** | 15/11/2026 | Khắc phục & chuẩn hóa toàn diện theo kiểm toán QA/Security: khóa & lưu danh sách bàn ghép (`table_ids`), không fallback `BK-xxxx` khi server trả `4xx/5xx`, chống Mass Assignment khi đăng ký/đặt bàn, bắt buộc JWT khi tiêu điểm & xem sổ cái điểm, bắt buộc SĐT khi hủy đơn, kiểm tra món hợp lệ & hạn voucher (`SWEETWINE`), kiểm tra ngày lịch dương & giờ mở cửa `10:00–22:30`, đồng bộ JWT 24h, `401` vs `403`, `skipSuccessfulRequests` trên Rate Limit, email đặt bàn tùy chọn và tên/SĐT trùng khi đăng ký. |

---

# MỤC LỤC

- [1. Introduction](#1-introduction)
  - [1.1. Purpose (Mục đích tài liệu)](#11-purpose)
  - [1.2. Scope (Phạm vi hệ thống)](#12-scope)
  - [1.3. References (Tài liệu tham chiếu)](#13-references)
- [2. Overall Description](#2-overall-description)
  - [2.1. Use Case Diagram](#21-use-case-diagram)
    - [2.1.1. Actor Diagram Relationship (Mối quan hệ giữa các tác tử)](#211-actor-diagram-relationship-mối-quan-hệ-giữa-các-tác-tử)
    - [2.1.2. Use Case cho Khách Vãng Lai (Unregistered User)](#212-use-case-for-unregistered-user)
    - [2.1.3. Use Case cho Khách Hàng Thành Viên (Member)](#213-use-case-for-user-member)
    - [2.1.4. Use Case cho Quản Trị Viên Hệ Thống (Admin)](#214-use-case-for-admin)
    - [2.1.5. Use Case cho Hệ Thống Tự Động (System)](#215-use-case-for-system)
    - [2.1.6. Use Case cho Nhân Viên / Quản Lý Ca (Staff & Operations)](#216-use-case-for-staff--operations)
  - [2.2. State Diagram (Biểu đồ chuyển trạng thái)](#22-state-diagram-biểu-đồ-chuyển-trạng-thái)
    - [2.2.1. Vòng đời Trạng thái Đơn Đặt Bàn (Reservation Lifecycle)](#221-vòng-đời-trạng-thái-đơn-đặt-bàn-reservation-lifecycle)
    - [2.2.2. Vòng đời Trạng thái Bàn Ăn Thực Tế (Table Status Lifecycle)](#222-vòng-đời-trạng-thái-bàn-ăn-thực-tế-table-status-lifecycle)
  - [2.3. Architectural System (Kiến trúc hệ thống tổng thể)](#23-architectural-system-kiến-trúc-hệ-thống-tổng-thể)
  - [2.4. Component Diagram (Biểu đồ thành phần)](#24-component-diagram-biểu-đồ-thành-phần)
  - [2.5. Design Diagrams (Entity, Persistence, Service)](#25-design-diagrams)
- [3. Database Design](#3-database-design)
  - [3.1. Entity Relationship Diagram (ERD)](#31-entity-relationship-diagram-erd)
  - [3.2. Database Schema Overview](#32-database-schema-overview)
  - [3.3. Detailed Schema Specifications (Bảng PostgreSQL Drizzle ORM)](#33-detailed-schema-specifications)
    - [3.3.1. Bảng `users`](#331-bảng-users)
    - [3.3.2. Bảng `tables`](#332-bảng-tables)
    - [3.3.3. Bảng `reservations`](#333-bảng-reservations)
    - [3.3.4. Bảng `email_logs`](#334-bảng-email_logs)
  - [3.4. Domain & Operational Models (Sổ cái điểm, KDS, Kho BOM, QR Service, CSAT/NPS)](#34-domain--operational-models)
- [4. Functional Requirements (Yêu cầu chức năng chi tiết)](#4-functional-requirements-yêu-cầu-chức-năng-chi-tiết)
  - [4.1. Unregistered User (Khách vãng lai / Khách chưa đăng nhập)](#41-unregistered-user-khách-vãng-lai--khách-chưa-đăng-nhập)
  - [4.2. Member (Khách hàng thành viên)](#42-member-khách-hàng-thành-viên)
  - [4.3. Admin (Quản trị viên hệ thống)](#43-admin-quản-trị-viên-hệ-thống)
  - [4.4. System (Tác tử Hệ thống tự động)](#44-system-tác-tử-hệ-thống-tự-động)
  - [4.5. Staff & Operations (Nhân viên Lễ tân, Phục vụ, Bếp KDS)](#45-staff--operations-nhân-viên-lễ-tân-phục-vụ-bếp-kds)
- [5. Non-functional Requirements (Yêu cầu phi chức năng)](#5-non-functional-requirements-yêu-cầu-phi-chức-năng)
- [6. Appendix (Phụ lục)](#6-appendix-phụ-lục)
  - [Phụ Lục A: Ma Trận Phân Quyền Vai Trò (RBAC Permission Matrix)](#phụ-lục-a-ma-trận-phân-quyền-vai-trò-rbac-permission-matrix)
  - [Phụ Lục B: Bảng Ánh Xạ Mã Lỗi HTTP & Business Error Codes](#phụ-lục-b-bảng-ánh-xạ-mã-lỗi-http--business-error-codes)
- [7. Wiki & Glossary (Thuật ngữ chuyên ngành)](#7-wiki--glossary-thuật-ngữ-chuyên-ngành)

---

# 1. Introduction

## 1.1. Purpose
Tài liệu Đặc tả Yêu cầu Phần mềm (SRS - Software Requirements Specification) này mô tả toàn diện các yêu cầu chức năng, quy tắc nghiệp vụ (Business Rules), phân quyền an ninh (RBAC), yêu cầu phi chức năng, kiến trúc kỹ thuật và thiết kế cơ sở dữ liệu cho **Hệ Thống Đặt Bàn và Quản Lý Nhà Hàng Cao Cấp Le Gourmet Bistro**.

Tài liệu là chuẩn đối chiếu thống nhất cho:
- **Ban Giám Đốc & Vận Hành Nhà Hàng**: Chuẩn hóa quy trình đón khách, đặt cọc, hủy bàn, tích điểm thành viên và điều phối bếp/bàn.
- **Đội ngũ Phát triển (Full-stack Engineers)**: Đối chiếu schema PostgreSQL, hợp đồng RESTful API, logic nghiệp vụ server-side và React UI.
- **Đội ngũ Kiểm thử (QA Engineers)**: Thiết kế kịch bản kiểm thử tích hợp API, bảo mật phân quyền và kiểm thử hồi quy đầu-cuối (E2E).

## 1.2. Scope
Hệ thống **Le Gourmet Bistro Restaurant Management & Reservation Platform** là ứng dụng web Full-stack (React 19 SPA + Express TypeScript Backend + PostgreSQL), vận hành thống nhất trên máy tính để bàn, máy tính bảng lễ tân/bếp và điện thoại di động của thực khách.

### Phạm vi chức năng chính:
1. **Phân hệ Đặt Bàn Trực Tuyến 3 Bước (Online Booking Flow)**:
   - Chọn ngày, khung giờ phục vụ theo múi giờ vận hành `Asia/Ho_Chi_Minh` (GMT+7), số khách và sơ đồ bàn/ghép bàn theo 4 khu vực (`main`, `vip`, `garden`, `rooftop`).
   - Ngăn chặn đặt trùng bàn bằng khóa đồng thời (Slot Mutex) và cửa sổ đệm phục vụ **120 phút**.
   - Đặt món trước (Pre-order Menu), chọn độ chín thịt bò/cừu (`rare`, `medium_rare`, `medium`, `well_done`), gợi ý ghép rượu vang (Sommelier Wine Pairing), chọn Tasting Course, áp dụng mã ưu đãi hợp lệ theo hạng thành viên, quy đổi điểm thưởng trực tiếp và tùy chọn đặt cọc 20%.
   - Giữ nguyên phiên đăng nhập thành viên sau khi hoàn tất đặt bàn; cấp phiếu check-in điện tử kèm QR Code và lưu lịch `.ics`.
2. **Phân hệ Tra Cứu & Khách Hàng Tự Hủy Bàn (Lookup & Self-Service Cancellation)**:
   - Tra cứu đơn bằng SĐT hoặc Mã Booking Code (`LGB-XXXXX`).
   - Chính sách tự hủy trực tuyến trước **120 phút**: tự động giải phóng bàn về `available`, gửi email xác nhận hủy, hiển thị thông báo hoàn 100% tiền cọc trong 24h làm việc và hoàn lại điểm thưởng đã quy đổi (nếu có). Khi quá hạn 120 phút, khóa nút tự hủy và hiển thị hotline quản lý (`0903.888.999`).
3. **Phân hệ Thành Viên, Hạng Thẻ & Sổ Cái Điểm Thưởng (Loyalty System)**:
   - Đăng ký/Đăng nhập bằng Bcrypt + JWT (**24 giờ**), quản lý hồ sơ, đổi mật khẩu, lưu món yêu thích.
   - 4 hạng thành viên (`Đồng`: 0–399, `Bạc`: 400–999, `Vàng`: 1.000–2.499, `Kim Cương`: ≥ 2.500 điểm).
   - Quy đổi điểm trực tiếp khi đặt bàn (`1 điểm = 100đ`, tối đa 30% giá trị thực đơn còn lại sau voucher), điểm thưởng tạm tính chỉ được cộng vào ví khi đơn hoàn tất (`completed`), hoàn điểm khi hủy (`cancelled`), và theo dõi minh bạch qua **Sổ Cái Biến Động Điểm Thưởng**.
4. **Phân hệ Phục Vụ Tại Bàn QR & Đánh Giá Khách Hàng (QR Table Service & CSAT/NPS)**:
   - Chuông gọi phục vụ thông minh tại bàn qua mã QR (tiếp nước, gặp Sommelier, đổi dao dĩa, khăn ấm, yêu cầu thanh toán, gặp quản lý).
   - Đánh giá đa tiêu chí (Tổng quan, Món ăn, Phục vụ, Không gian 1–5 sao & điểm NPS 0–10) sau bữa ăn.
5. **Phân hệ Điều Hành Tiếp Tân, Bếp KDS, Kho BOM & Quản Trị (RBAC Isolated)**:
   - **Staff (`staff`)**: Chỉ truy cập Bàn điều hành tiếp tân (`staff_ops`), Quản lý đơn đặt bàn (`reservations`), Sơ đồ bàn (`tables`), Màn hình bếp (`kds`), Kho & Định lượng BOM (`inventory`), Phản hồi khách hàng (`feedback`). Bị chặn hoàn toàn quyền truy cập Doanh thu, Quản lý Thực đơn và Quản lý Tài khoản/RBAC.
   - **Admin (`admin`)**: Toàn quyền vận hành + Quản lý Thực đơn (`menu`), Báo cáo Doanh thu & Phân tích (`reports`), Quản lý Tài khoản & Phân quyền (`staff`), nhật ký Email (`email_logs`).
6. **Hạ Tầng Dữ Liệu & Sandbox API**:
   - Kết nối PostgreSQL qua Drizzle ORM (`DATABASE_URL` hoặc `SQL_HOST`/`SQL_PORT`/`SQL_USER`/`SQL_PASSWORD`/`SQL_DB_NAME`) với cơ chế fallback in-memory tự động khi chưa cấu hình DB.
   - Endpoint `POST /api/test/reset-sandbox` phục vụ dọn dữ liệu kiểm thử đánh dấu `[TEST]` / `TEST-`.

### Phạm vi không bao gồm (Out of scope):
- Kết nối phần cứng máy in nhiệt qua cổng Serial COM trực tiếp (hệ thống dùng Web Print / PDF chuẩn trình duyệt).
- Tích hợp cổng thanh toán thẻ ngân hàng quốc tế thực tế (hệ thống mô phỏng xác nhận cọc 20% và thanh toán hóa đơn tại quầy).

## 1.3. References
1. *IEEE Std 830-1998*: IEEE Recommended Practice for Software Requirements Specifications.
2. *RFC 7519*: JSON Web Token (JWT) Architecture and Security Standards.
3. *OWASP Top 10 (2021)*: Web Application Security Risks & Remediation Guidelines.
4. *RESTful API Design Rulebook* - Mark Masse (O'Reilly).

---

# 2. Overall Description

## 2.1. Use Case Diagram

### 2.1.1. Actor Diagram Relationship (Mối quan hệ giữa các tác tử)
Hệ thống xác định **5 tác tử (Actors)** chính với ranh giới quyền hạn rõ ràng:
1. **Unregistered User (Khách vãng lai)**: Chưa đăng nhập; có thể xem thực đơn, đặt bàn, áp dụng voucher công khai không yêu cầu hạng, tra cứu đơn và tự hủy trước 120 phút, gửi yêu cầu phục vụ tại bàn qua QR.
2. **Member (Khách hàng thành viên - `role: 'customer'`)**: Kế thừa quyền Unregistered User, cộng thêm quyền đăng nhập JWT, áp dụng voucher theo hạng thành viên (`tierRequired`), đổi điểm giảm giá, theo dõi sổ cái điểm, lưu món yêu thích và đánh giá sau bữa ăn.
3. **Staff (`role: 'staff'`)**: Nhân viên lễ tân, phục vụ, thu ngân & điều phối bếp. Chỉ có quyền vận hành đặt bàn, xếp bàn, nhận khách, checkout, KDS, kho BOM và xử lý phản hồi. **Không kế thừa quyền quản trị Admin**.
4. **Admin (`role: 'admin'`)**: Quản trị viên tối cao; kế thừa toàn bộ quyền vận hành của Staff cộng thêm quyền quản trị Thực đơn/Giá, Báo cáo Doanh thu và Quản lý Tài khoản/Phân quyền RBAC.
5. **System (Tác tử tự động)**: Thực thi kiểm tra xung đột khung giờ 120 phút, khóa đồng thời chống race condition, tính giá/voucher/điểm server-side, chuyển đổi trạng thái bàn, cộng/hoàn điểm và ghi nhật ký email, áp dụng Rate Limit.

```
       +-------------------------+
       |   Unregistered User     |
       +-------------------------+
                    ^
                    | (Extends)
       +-------------------------+
       |     Member (Customer)   |
       +-------------------------+

       +-------------------------+
       |     Staff (Ops/KDS)     |
       +-------------------------+
                    ^
                    | (Extends - Strict RBAC Isolation)
       +-------------------------+
       |    Admin (Management)   |
       +-------------------------+

       +-------------------------+
       |   System (Automated)    |
       +-------------------------+
```

### 2.1.2. Use Case for Unregistered User
- **UC-UNREG-01**: Tra cứu đơn đặt bàn bằng Số điện thoại hoặc Mã Booking Code (`LGB-XXXXX`).
- **UC-UNREG-02**: Xem chi tiết phiếu đặt bàn điện tử & QR Check-in (`CheckInBill`).
- **UC-UNREG-03**: Xem bàn trống theo ngày, khung giờ trưa/tối và số lượng khách.
- **UC-UNREG-04**: Xem thực đơn công khai, độ chín món, gợi ý rượu vang và Tasting Course.
- **UC-UNREG-05**: Đặt bàn trực tuyến 3 bước, chọn món đặt trước và áp dụng voucher công khai (bị chặn dùng voucher VIP).
- **UC-UNREG-06**: Tự hủy đơn đặt bàn trực tuyến trước giờ hẹn tối thiểu 120 phút kèm chọn lý do hủy.
- **UC-UNREG-07**: Gửi yêu cầu phục vụ tại bàn qua mã QR (nước lọc, Sommelier, dao dĩa, khăn ấm, thanh toán, gặp quản lý).
- **UC-UNREG-08**: Đăng ký tài khoản thành viên mới (`POST /api/users`).

### 2.1.3. Use Case for User Member
- **UC-MEM-01**: Đăng nhập (`POST /api/auth/login`) và duy trì phiên JWT qua `localStorage` + `GET /api/auth/me`.
- **UC-MEM-02**: Đăng xuất an toàn, xóa token và thông tin phiên.
- **UC-MEM-03**: Xem & cập nhật hồ sơ cá nhân (Họ tên, SĐT, ghi chú ăn kiêng) và đổi mật khẩu.
- **UC-MEM-04**: Xem thẻ thành viên điện tử, hạng thẻ (`Đồng`/`Bạc`/`Vàng`/`Kim Cương`) và thanh tiến trình thăng hạng.
- **UC-MEM-05**: Xem lịch sử đặt bàn cá nhân, mở lại phiếu Check-in hoặc tự hủy đơn đủ điều kiện.
- **UC-MEM-06**: Lưu/bỏ lưu món ăn yêu thích và đặt nhanh từ danh sách yêu thích.
- **UC-MEM-07**: Áp dụng voucher đặc quyền theo hạng thành viên (`MEMBERVIP` cho hạng Vàng trở lên).
- **UC-MEM-08**: Quy đổi điểm thưởng trực tiếp khi xác nhận đặt bàn (`1 điểm = 100đ`, tối đa 30% hóa đơn sau voucher).
- **UC-MEM-09**: Xem **Sổ Cái Biến Động Điểm Thưởng** (cộng điểm khi hoàn tất, trừ điểm khi đổi, hoàn điểm khi hủy, điểm bonus).
- **UC-MEM-10**: Gửi đánh giá CSAT/NPS sau khi hoàn tất bữa ăn.

### 2.1.4. Use Case for Admin
- **UC-ADM-01**: Quản lý toàn bộ tài khoản người dùng (`GET /api/users`, tạo tài khoản, xem phân quyền RBAC).
- **UC-ADM-02**: Quản trị thực đơn món ăn (thêm, sửa giá, bật/tắt `isAvailable`, xóa món).
- **UC-ADM-03**: Xem báo cáo tài chính, doanh thu theo ngày/khu vực, tỷ lệ lấp đầy bàn và xuất dữ liệu báo cáo.
- **UC-ADM-04**: Chuyển đổi qua lại giữa giao diện **Quản Trị Admin** và **Bàn Vận Hành Tiếp Tân**.
- **UC-ADM-05**: Toàn quyền xem nhật ký email hệ thống (`GET /api/email-logs`) và xử lý toàn bộ nghiệp vụ của Staff.

### 2.1.5. Use Case for System
- **UC-SYS-01**: Kiểm tra xung đột lịch đặt bàn theo cửa sổ **120 phút** và khóa Slot Mutex chống đặt trùng đồng thời.
- **UC-SYS-02**: Tính toán và xác thực lại toàn bộ giá món, voucher, quy đổi điểm và tiền cọc 20% ở server-side (`POST /api/reservations`).
- **UC-SYS-03**: Thực thi máy trạng thái hữu hạn (FSM) cho đơn đặt bàn và tự động đồng bộ trạng thái bàn ăn.
- **UC-SYS-04**: Tự động cộng điểm tích lũy khi đơn chuyển sang `completed` và hoàn điểm đã tiêu khi đơn `cancelled` (đảm bảo idempotent không cộng/hoàn lặp).
- **UC-SYS-05**: Sinh email HTML xác nhận đặt bàn / hủy đặt bàn và lưu vào `email_logs`.
- **UC-SYS-06**: Áp dụng Rate Limit chống Brute-force/Spam và hỗ trợ dọn dữ liệu kiểm thử qua `POST /api/test/reset-sandbox`.

### 2.1.6. Use Case for Staff & Operations
- **UC-STF-01**: Tiếp nhận và xử lý yêu cầu gọi phục vụ tại bàn qua QR (`pending` -> `acknowledged` -> `completed`).
- **UC-STF-02**: Tạo đơn đặt bàn tại quầy/điện thoại (Manual Booking) và gán bàn/ghép bàn cho khách Walk-in.
- **UC-STF-03**: Xem và lọc danh sách đơn đặt bàn, chuyển trạng thái theo FSM (`confirmed` -> `seated`/`checked_in` -> `completed`, hoặc `cancelled`).
- **UC-STF-04**: Gọi thêm món tại bàn, thanh toán/quyết toán hóa đơn (`checkoutAndSettleReservation`) và in phiếu thanh toán.
- **UC-STF-05**: Quản lý sơ đồ bàn trực quan theo 4 khu vực và đổi trạng thái bàn (`available`, `reserved`, `occupied`, `cleaning`).
- **UC-STF-06**: Điều phối **Màn Hình Bếp (KDS)** theo 4 trạm (`hot_kitchen`, `cold_kitchen`, `bar`, `pastry`), cập nhật tiến độ món (`pending` -> `cooking` -> `ready` -> `served`).
- **UC-STF-07**: Quản lý **Kho & Định Lượng BOM** (nhập kho, trừ kho tự động theo công thức món, kiểm soát giá vốn COGS & Food Cost %).
- **UC-STF-08**: Xem và phản hồi đánh giá CSAT/NPS của thực khách.

---

## 2.2. State Diagram (Biểu đồ chuyển trạng thái)

### 2.2.1. Vòng đời Trạng thái Đơn Đặt Bàn (Reservation Lifecycle)
Hệ thống áp dụng Máy trạng thái hữu hạn (Strict Finite State Machine) được kiểm soát tại endpoint `PATCH /api/reservations/:id/status` và `POST /api/reservations/:id/cancel`:

```
                  +-------------------+
                  |      PENDING      | <----+ (Đơn mới tạo trực tuyến)
                  +-------------------+
                    |               |
       (Staff xác nhận)             (Khách tự hủy >=120p / Staff hủy)
                    v               v
            +---------------+   +-------------------+
            |   CONFIRMED   |   |     CANCELLED     | (Trạng thái kết thúc - Hoàn điểm)
            +---------------+   +-------------------+
              |           |
   (Khách đến nhận bàn)   (Hủy trước giờ ăn)
              v           ^
      +---------------------+
      | SEATED / CHECKED_IN |
      +---------------------+
              |
       (Thanh toán & Trả bàn)
              v
      +---------------+
      |   COMPLETED   | (Trạng thái kết thúc - Cộng điểm tích lũy)
      +---------------+
```

**Ma trận chuyển đổi hợp lệ (`ALLOWED_STATUS_TRANSITIONS` trong `server.ts`):**
- `pending` → `confirmed` | `cancelled`
- `confirmed` → `seated` | `checked_in` | `cancelled`
- `seated` → `completed`
- `checked_in` → `completed`
- `completed` → `[]` (Trạng thái kết thúc, cấm chuyển đổi tiếp)
- `cancelled` → `[]` (Trạng thái kết thúc, cấm chuyển đổi tiếp)

Mọi chuyển đổi sai quy tắc (ví dụ `seated` → `cancelled`, `cancelled` → `seated`, `completed` → `pending`) bị server từ chối với **HTTP 400 (`INVALID_STATUS_TRANSITION`)**. Khách tự hủy qua `/api/reservations/:id/cancel` chỉ hợp lệ khi đơn đang `pending` hoặc `confirmed` và thời gian còn lại ≥ 120 phút.

### 2.2.2. Vòng đời Trạng thái Bàn Ăn Thực Tế (Table Status Lifecycle)

```
        +-------------------------------------------------------+
        |                                                       |
        v                                                       |
   +-----------+   (Đơn hôm nay <=180p) +------------+          |
   | AVAILABLE | ---------------------> |  RESERVED  |          |
   +-----------+                        +------------+          |
        |                                     |                 |
(Walk-in / Nhân viên nhận)           (Khách đến nhận bàn)       |
        |                                     |                 |
        +----------------> +------------+ <---+                 |
                           |  OCCUPIED  |                       |
                           +------------+                       |
                                 |                              |
                     (Hoàn tất / Đang dọn)                      |
                                 v                              |
                           +------------+                       |
                           |  CLEANING  | ----------------------+
                           +------------+   (Dọn xong -> AVAILABLE)
```

- Khi tạo đơn đặt bàn cho **ngày tương lai** (> 180 phút trước giờ đến), bàn vẫn giữ nguyên `available` trên sơ đồ live hiện tại để không khóa nhầm khách walk-in; chỉ đánh dấu `reserved` trên sơ đồ khi đơn thuộc **ngày hôm nay** và trong cửa sổ `[-60, +180]` phút so với giờ hiện tại.
- Khi đơn chuyển sang `completed` hoặc `cancelled`, toàn bộ bàn thuộc đơn (bao gồm cả bàn chính và các bàn ghép trong `table_ids`) được tự động giải phóng về `available` và xóa `currentReservationId`.
- Khi Staff/Admin cập nhật trực tiếp trạng thái bàn qua `PUT /api/tables/:id`, hệ thống chỉ chấp nhận 4 trạng thái hợp lệ: `available`, `reserved`, `occupied`, `cleaning` (trả `400 INVALID_TABLE_STATUS` nếu gửi giá trị khác).

---

## 2.3. Architectural System (Kiến trúc hệ thống tổng thể)

Hệ thống vận hành theo kiến trúc **Full-Stack Unified Monorepo** trên cùng cổng HTTP (`Port 3000`):

```
[ PRESENTATION TIER - React 19 + TypeScript + Tailwind CSS v4 ]
   ├── Customer Booking Flow (3 bước: Time/Table -> Menu -> Confirmation)
   ├── Lookup & Self-Service Cancellation (CheckInBill, LookupModal, CancelReservationModal)
   ├── Member Portal & Loyalty Ledger (AuthModal, UserProfileModal)
   ├── Table QR Service Modal (Gọi phục vụ tại bàn)
   └── Role-Isolated Operations Portal (AdminDashboard: Staff Desk / Admin Control)
             |
             | RESTful JSON API + Bearer JWT Auth (/api/*)
             v
[ API GATEWAY & SECURITY TIER - Express.js Server (server.ts) ]
   ├── Express Rate Limiter (General / Auth 5 req/15p / Reservation 30 req/1p)
   ├── CORS & JSON Body Parser
   ├── JWT Verification Middleware (authenticateToken) & RBAC Guard (requireRoles)
   └── Sandbox Reset Utility (/api/test/reset-sandbox)
             |
             v
[ BUSINESS LOGIC & ENGINE TIER ]
   ├── Slot Mutex & 120-min Conflict Detection Engine
   ├── Cancellation 120-min Policy Engine (dateTimeUtils.ts)
   ├── Server-Side Pricing, Tier Voucher & Loyalty Points Engine
   ├── Reservation Finite State Machine (FSM)
   └── KDS, BOM Inventory & Email Log Dispatchers (Client/Shared Storage + Server Sync)
             |
             v
[ DATA ACCESS & PERSISTENCE TIER ]
   ├── Primary: PostgreSQL 15+ via Drizzle ORM (src/db/schema.ts, src/db/index.ts)
   └── Automatic Fallback: In-Memory Stores + Browser localStorage Synchronization
```

---

## 2.4. Component Diagram (Biểu đồ thành phần)

```
+---------------------------------------------------------------------------------+
| Le Gourmet Bistro Application (Vite + Express on Port 3000)                     |
|                                                                                 |
|  +---------------------------+    REST API     +-----------------------------+  |
|  | Client SPA (src/)         | --------------> | Express API (server.ts)     |  |
|  | - Navbar & BookingFlow/   |                 | - server-auth.ts (JWT/RBAC) |  |
|  | - CancelReservationModal  |                 | - /api/auth/*               |  |
|  | - Auth/UserProfileModal   |                 | - /api/tables/*             |  |
|  | - Admin/ (Staff, KDS, BOM)|                 | - /api/reservations/*       |  |
|  | - services/api.ts         |                 | - /api/users/* & ledger     |  |
|  | - services/storage.ts     |                 | - /api/email-logs           |  |
|  +---------------------------+                 +-----------------------------+  |
|                                                              |                  |
|                                                              v                  |
|                                                +-----------------------------+  |
|                                                | Drizzle ORM (src/db/)       |  |
|                                                | - schema.ts                 |  |
|                                                | - Auto DDL & Seeding        |  |
|                                                +-----------------------------+  |
|                                                              |                  |
|                                                (Connected)   v   (Fallback)     |
|                                                +------------+ +--------------+  |
|                                                | PostgreSQL | | In-Memory    |  |
|                                                +------------+ +--------------+  |
+---------------------------------------------------------------------------------+
```

---

## 2.5. Design Diagrams

### 2.5.1. Core Domain Entities
- `UserAccount`: `id`, `name`, `email`, `phone`, `role` (`'customer' | 'staff' | 'admin'`), `loyaltyPoints`, `membershipTier` (`'Đồng' | 'Bạc' | 'Vàng' | 'Kim Cương'`), `favoriteDishIds`, `dietaryPreferences`, `status`.
- `RestaurantTable`: `id`, `name`, `area` (`'main' | 'vip' | 'garden' | 'rooftop'`), `capacity`, `status` (`'available' | 'reserved' | 'occupied' | 'cleaning'`), `currentReservationId`, `shape` (`'round' | 'rectangle'`), `mergedWithTableIds`.
- `Reservation`: `id`, `bookingCode`, `userId`, `customerName`, `customerPhone`, `customerEmail`, `guestCount`, `bookingDate`, `arrivalTime`, `tableId`, `tableIds`, `selectedDishes`, `preOrderTotal`, `voucherCode`, `discountAmount`, `pointsRedeemed`, `pointsDiscount`, `depositAmount`, `totalAmount`, `pointsEarned`, `status`, `cancellationReason`, `cancellationNotes`, `cancelledAt`.
- `PointsTransaction`: `id`, `userId`, `amount`, `type` (`'earn' | 'redeem' | 'refund' | 'bonus'`), `description`, `bookingCode`, `createdAt`, `balanceAfter`.

### 2.5.2. Data Access & Service Layer
- **Backend (`server.ts` & `server-auth.ts`)**: Xử lý xác thực JWT/Bcrypt, RBAC middleware (`requireRoles`), Mutex chống xung đột bàn, kiểm tra giá/voucher/điểm từ server, truy vấn Drizzle PostgreSQL với auto-fallback sang `localTables`, `localReservations`, `localUsers`, `localEmailLogs`, `localPointsTransactions`.
- **Frontend Services (`src/services/api.ts` & `src/services/storage.ts`)**: Giao tiếp API REST kèm Bearer JWT tự động, đồng bộ hóa `localStorage` cho đơn đặt bàn, bàn ăn, ví điểm, sổ cái giao dịch điểm, KDS tickets, nguyên liệu/BOM kho, yêu cầu QR tại bàn và đánh giá CSAT/NPS.

---

# 3. Database Design

## 3.1. Entity Relationship Diagram (ERD)

```
 +--------------------+      1:N      +-------------------------+
 |       USERS        | ------------> |      RESERVATIONS       |
 | PK: id (text)      |               | PK: id (text)           |
 | UQ: uid (text)     |               | UQ: booking_code (text) |
 |     email          |               | FK: user_id (opt)       |
 |     name, phone    |               | FK: table_id (text)     |
 |     membership_tier|               |     selected_dishes     |
 |     loyalty_points |               |     pre_order_total     |
 |     favorite_dishes|               |     discount_amount     |
 +--------------------+               |     points_redeemed     |
           |                          |     points_discount     |
           | 1:N (Ledger)             |     deposit_amount      |
           v                          |     total_amount        |
 +--------------------+               |     points_earned       |
 | POINTS_TRANSACTIONS|               |     status              |
 +--------------------+               +-------------------------+
                                                   |
 +--------------------+      1:N (Logical)         | N:1
 |       TABLES       | <--------------------------+
 | PK: id (text)      |
 |     name, area     |               +-------------------------+
 |     capacity       |               |       EMAIL_LOGS        |
 |     status, shape  |               | PK: id (text)           |
 | current_res_id     |               |     booking_code        |
 +--------------------+               |     recipient_email     |
                                      |     subject, type       |
                                      |     preview_body        |
                                      +-------------------------+
```

## 3.2. Database Schema Overview
Cơ sở dữ liệu PostgreSQL được định nghĩa bằng **Drizzle ORM** tại `src/db/schema.ts` và cấu hình qua `src/db/drizzle.config.ts` / `src/db/index.ts`:
- Hỗ trợ kết nối qua biến môi trường `DATABASE_URL` (chuẩn URI cho Neon/Supabase/Docker) hoặc bộ thông số `SQL_HOST`, `SQL_PORT`, `SQL_USER`, `SQL_PASSWORD`, `SQL_DB_NAME`.
- Khi khởi động (`seedDatabaseIfEmpty()`), server tự động chạy câu lệnh nâng cấp schema an toàn (`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS points_redeemed / points_discount`) và khởi tạo dữ liệu mẫu ban đầu nếu các bảng đang trống.
- Nếu môi trường chưa cấu hình hoặc chưa mở kết nối PostgreSQL, hệ thống tự động chuyển sang chế độ In-Memory + `localStorage` để đảm bảo ứng dụng luôn vận hành liên tục.

## 3.3. Detailed Schema Specifications (Bảng PostgreSQL Drizzle ORM)

### 3.3.1. Bảng `users`
Lưu trữ thông tin hồ sơ khách hàng thành viên và điểm/hạng thành viên (`src/db/schema.ts`).

| Tên Cột (SQL) | Kiểu Drizzle / PostgreSQL | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `PRIMARY KEY` | Mã định danh người dùng (VD: `user-1`, `user-staff-1`) |
| `uid` | `text` | `UNIQUE`, `NULL` | UID liên kết xác thực ngoài (nếu có) |
| `email` | `text` | `NOT NULL` | Địa chỉ email đăng nhập |
| `name` | `text` | `NOT NULL` | Họ và tên người dùng |
| `phone` | `text` | `NOT NULL` | Số điện thoại liên hệ |
| `membership_tier` | `text` | `NOT NULL, DEFAULT 'Đồng'` | Hạng thành viên mặc định `'Đồng'`: `'Đồng'`, `'Bạc'`, `'Vàng'`, `'Kim Cương'` |
| `loyalty_points` | `integer` | `NOT NULL, DEFAULT 0` | Số dư điểm thưởng khả dụng hiện tại |
| `avatar` | `text` | `NULL` | Đường dẫn ảnh đại diện |
| `favorite_dish_ids` | `jsonb` (`string[]`) | `DEFAULT []` | Danh sách ID các món ăn yêu thích |
| `dietary_preferences` | `text` | `NULL` | Ghi chú sở thích/dị ứng thực phẩm |
| `created_at` | `timestamp` | `DEFAULT now()` | Thời điểm tạo tài khoản |

*(Lưu ý: Mật khẩu đăng nhập trên server được băm bằng `bcryptjs` salt round = 10 trong `serverPasswordHashes`; vai trò `role`, `position`, `shift`, `status` được quản lý đồng bộ trong danh mục tài khoản server & RBAC).*

### 3.3.2. Bảng `tables`
Lưu trữ sơ đồ mặt bằng 4 khu vực của nhà hàng.

| Tên Cột (SQL) | Kiểu Drizzle / PostgreSQL | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `PRIMARY KEY` | Mã định danh bàn (VD: `T-01`, `V-01`, `G-01`, `R-01`) |
| `name` | `text` | `NOT NULL` | Tên bàn hiển thị (VD: `"Bàn M-01"`, `"Phòng VIP Hoàng Gia"`) |
| `area` | `text` | `NOT NULL` | Khu vực: `'main' \| 'vip' \| 'garden' \| 'rooftop'` |
| `capacity` | `integer` | `NOT NULL` | Sức chứa số lượng khách tối đa |
| `status` | `text` | `NOT NULL, DEFAULT 'available'` | Trạng thái vật lý: `'available' \| 'occupied' \| 'reserved' \| 'cleaning'` |
| `current_reservation_id` | `text` | `NULL` | Mã Booking Code đang giữ/ngồi bàn hiện tại |
| `shape` | `text` | `NOT NULL, DEFAULT 'rectangle'` | Kiểu dáng hiển thị trên sơ đồ: `'round' \| 'rectangle'` |
| `description` | `text` | `NULL` | Mô tả vị trí hoặc ghi chú đặc điểm bàn |

### 3.3.3. Bảng `reservations`
Lưu trữ toàn bộ đơn đặt bàn trực tuyến và đặt bàn tại quầy.

| Tên Cột (SQL) | Kiểu Drizzle / PostgreSQL | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `PRIMARY KEY` | Mã định danh nội bộ đơn đặt bàn |
| `booking_code` | `text` | `UNIQUE, NOT NULL` | Mã tra cứu duy nhất dạng `LGB-XXXXX` |
| `user_id` | `text` | `NULL` | ID thành viên đặt bàn (null nếu là khách vãng lai) |
| `customer_name` | `text` | `NOT NULL` | Họ tên khách hàng |
| `customer_phone` | `text` | `NOT NULL` | Số điện thoại liên hệ & xác thực hủy bàn |
| `customer_email` | `text` | `NOT NULL` (chuỗi `''` nếu không nhập) | Email nhận phiếu xác nhận / thông báo hủy (tùy chọn khi đặt bàn; kiểm tra định dạng nếu có nhập) |
| `guest_count` | `integer` | `NOT NULL` | Số lượng khách dự kiến (1–30 khách) |
| `booking_date` | `text` | `NOT NULL` | Ngày đến dùng bữa (`YYYY-MM-DD`, hợp lệ theo lịch dương) |
| `arrival_time` | `text` | `NOT NULL` | Giờ đến (`HH:mm`, khung giờ phục vụ `10:00 – 22:30`) |
| `table_id` | `text` | `NOT NULL` | ID bàn chính được gán |
| `table_ids` | `jsonb` (`string[]`) | `DEFAULT []` | Toàn bộ danh sách ID bàn chính + bàn ghép (VD: `['T-06', 'T-01']`) phục vụ khóa trùng lịch và giải phóng bàn |
| `table_name` | `text` | `NOT NULL` | Tên bàn hiển thị (ghép nối bằng ` + ` nếu có nhiều bàn) |
| `table_area` | `text` | `NOT NULL` | Khu vực bàn |
| `selected_dishes` | `jsonb` | `NOT NULL, DEFAULT []` | Mảng món đặt trước (`SelectedDishItem[]`: món chuẩn từ `MENU_ITEMS`, SL nguyên dương, độ chín, ghi chú) |
| `pre_order_total` | `integer` | `NOT NULL, DEFAULT 0` | Tổng tiền thực đơn đặt trước (VNĐ) |
| `deposit_amount` | `integer` | `NOT NULL, DEFAULT 0` | Tiền đặt cọc giữ bàn (20% tổng hóa đơn nếu chọn cọc) |
| `discount_amount` | `integer` | `DEFAULT 0` | Tiền giảm từ voucher |
| `voucher_code` | `text` | `NULL` | Mã voucher đã áp dụng |
| `total_amount` | `integer` | `NOT NULL, DEFAULT 0` | Tổng hóa đơn sau giảm giá voucher và trừ điểm thưởng |
| `status` | `text` | `NOT NULL, DEFAULT 'pending'` | Trạng thái FSM (`pending`, `confirmed`, `seated`/`checked_in`, `completed`, `cancelled`). Đơn trực tuyến luôn khởi tạo ở `pending`. |
| `occasion` | `text` | `NULL` | Dịp đặc biệt (Sinh nhật, Kỷ niệm, Tiếp khách...) |
| `special_requests` | `text` | `NULL` | Yêu cầu đặc biệt (dị ứng, trang trí, ghép bàn) |
| `email_confirmation_sent` | `boolean` | `DEFAULT true` | Cờ xác nhận đã gửi email |
| `email_sent_at` | `text` | `NULL` | Thời điểm gửi email (ISO String) |
| `points_earned` | `integer` | `DEFAULT 0` | Điểm tích lũy dự kiến được cộng khi đơn `completed` |
| `points_redeemed` | `integer` | `DEFAULT 0` | Số điểm thưởng đã sử dụng để giảm giá đơn này |
| `points_discount` | `integer` | `DEFAULT 0` | Số tiền giảm tương ứng (`points_redeemed * 100` VNĐ) |
| `created_at` | `timestamp` | `DEFAULT now()` | Thời điểm tạo đơn |

### 3.3.4. Bảng `email_logs`
Lưu trữ nhật ký các email HTML tự động (xác nhận đặt bàn, cập nhật trạng thái, hủy đặt bàn).

| Tên Cột (SQL) | Kiểu Drizzle / PostgreSQL | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `text` | `PRIMARY KEY` | Mã log email |
| `recipient_email` | `text` | `NOT NULL` | Địa chỉ email người nhận |
| `recipient_name` | `text` | `NOT NULL` | Tên khách hàng nhận email |
| `booking_code` | `text` | `NOT NULL` | Mã booking liên quan |
| `sent_at` | `text` | `NOT NULL` | Thời điểm gửi (ISO String) |
| `subject` | `text` | `NOT NULL` | Tiêu đề thư |
| `status` | `text` | `NOT NULL, DEFAULT 'delivered'` | Trạng thái phát thư |
| `type` | `text` | `NOT NULL, DEFAULT 'confirmation'` | Loại thư (`booking_confirmation`, `status_update`, `cancellation`, `reminder`) |
| `preview_body` | `text` | `NULL` | Nội dung HTML đầy đủ để xem trước trong hộp thư |

## 3.4. Domain & Operational Models
Bên cạnh 4 bảng lõi trên PostgreSQL, hệ thống duy trì các mô hình nghiệp vụ sau (lưu trữ tại Server Memory Ledger & đồng bộ `localStorage` cho thao tác POS thời gian thực):
- **`PointsTransaction` (Sổ cái điểm thưởng)**: `id`, `userId`, `amount` (+/-), `type` (`'earn' | 'redeem' | 'refund' | 'bonus'`), `description`, `bookingCode`, `createdAt`, `balanceAfter`.
- **`KitchenTicket` (KDS)**: `id`, `bookingCode`, `tableId`, `orderType` (`dine_in` / `pre_order`), `priority` (`normal` / `rush` / `vip`), danh sách `KitchenTicketItem` phân theo 4 trạm (`hot_kitchen`, `cold_kitchen`, `bar`, `pastry`) và trạng thái (`pending` -> `cooking` -> `ready` -> `served`).
- **`Ingredient`, `DishRecipeBOM`, `InventoryLog` (Kho & Định lượng)**: Quản lý tồn kho nguyên liệu (`currentStock`, `minStockLevel`, `costPerUnit`), định lượng nguyên liệu cốt lõi (`isCrucial`) cho từng món và lịch sử trừ/nhập kho (`order_deduction`, `stock_import`, `manual_adjustment`, `spoilage_waste`).
- **`TableServiceRequest` (Chuông QR tại bàn)**: `type` (`water_ice`, `sommelier`, `cutlery`, `hot_towel`, `bill_request`, `manager`, `other`), `status` (`pending` -> `acknowledged` -> `completed`).
- **`CustomerReview` (CSAT & NPS)**: Điểm `overallRating`, `foodRating`, `serviceRating`, `ambianceRating` (1–5), `npsScore` (0–10), bình luận, phản hồi của nhân viên (`staffResponse`) và mã voucher đền bù nếu có.

---

# 4. Functional Requirements (Yêu cầu chức năng chi tiết)

## 4.1. Unregistered User (Khách vãng lai / Khách chưa đăng nhập)

### 4.1.1. Tra cứu đơn đặt bàn bằng SĐT / Mã Booking Code (`FR-UNREG-01`)
- Người dùng mở modal "Tra cứu" trên Navbar, nhập SĐT hoặc Mã Booking Code (`LGB-XXXXX`) để gọi `POST /api/reservations/lookup`.
- Kết hợp hiển thị các đơn khớp trong PostgreSQL/Server và `localStorage`, hỗ trợ mở phiếu Check-in điện tử (`CheckInBill`) hoặc kích hoạt hủy bàn trực tiếp.

### 4.1.2. Đặt Bàn Trực Tuyến 3 Bước (`FR-UNREG-02`)
- **Bước 01 - Thời Gian & Bàn**: Chọn ngày hợp lệ theo lịch dương (từ chối ngày quá khứ và ngày không tồn tại như `30/02/2027`), khung giờ Trưa (`11:00–13:30`) / Tối (`17:00–21:00`) hoặc giờ tùy chọn trong khung giờ mở cửa **`10:00 – 22:30`**, số khách (`1–30`) và chọn bàn đơn hoặc **ghép bàn** (`selectedMergedTableIds` / `tableIds`) dựa trên `GET /api/tables/availability`.
- **Bước 02 - Chọn Món Trước**: Chọn món lẻ từ thực đơn 5 danh mục (`appetizer`, `main`, `seafood`, `dessert`, `beverage`), chọn độ chín thịt nếu `meatDonenessRequired`, xem gợi ý rượu vang ghép đôi hoặc chọn bộ **Tasting Course** theo số người. Mọi món gửi lên server phải tồn tại trong `MENU_ITEMS` và còn phục vụ (`400 INVALID_MENU_ITEM`).
- **Bước 03 - Xác Nhận & Email (`BookingConfirmation`)**:
  - Nhập Họ tên (2–100 ký tự), SĐT hợp lệ (regex SĐT Việt Nam `/^(?:\+84|0)[0-9]{8,10}$/`), Email (**tùy chọn**; kiểm tra đúng định dạng nếu có nhập), dịp đặc biệt và yêu cầu đặc biệt.
  - **Kiểm soát chặt chẽ Mã Ưu Đãi (Voucher)**: Kiểm tra tồn tại, **hạn sử dụng** (`isVoucherExpired` — từ chối mã đã quá hạn như `SWEETWINE` hết hạn `30/06/2026` với `400 VOUCHER_EXPIRED`), giá trị đơn tối thiểu (`400 VOUCHER_MIN_ORDER`) và điều kiện hạng thành viên (`403 VOUCHER_TIER_REQUIRED` nếu dùng `MEMBERVIP` khi chưa đăng nhập hoặc dưới hạng `Vàng`).
  - **Tiêu điểm thưởng**: Chỉ cho phép khi đã đăng nhập có JWT hợp lệ khớp `userId` (`401 AUTH_REQUIRED` / `403 ACCESS_DENIED`).
  - Tùy chọn Đặt cọc giữ bàn ưu tiên (20% làm tròn theo 10.000đ, hoặc 200.000đ nếu chưa chọn món trước) hoặc Giữ chỗ không cần cọc (giữ tối đa 15 phút).
  - Nút hành động chính hiển thị chuẩn ngữ nghĩa: **"Hoàn Tất Gửi Yêu Cầu Đặt Bàn"**.
  - Khi server trả lỗi nghiệp vụ (`400`, `401`, `403`, `404`, `409`), giao diện **hiển thị trực tiếp thông báo lỗi** trên bước 3 để khách chỉnh sửa, **tuyệt đối không** lưu đơn giả cục bộ (`BK-xxxx`).
  - Sau khi hoàn tất đặt bàn, hệ thống trả về `201 Created` (`status: 'pending'`, sinh mã duy nhất `LGB-XXXXX`), hiển thị phiếu Check-in điện tử (`CheckInBill`), đồng thời giữ nguyên trạng thái phiên người dùng.

### 4.1.3. Khách Hàng Tự Hủy Đặt Bàn Trực Tuyến (`FR-UNREG-03`)
- **Điểm truy cập**: Nút **"Hủy Đặt Bàn"** xuất hiện trên `CheckInBill`, `LookupModal`, và thẻ đơn trong `UserProfileModal` đối với các đơn có trạng thái `pending` hoặc `confirmed`.
- **Đánh giá điều kiện theo Chính sách 120 phút (`checkCancellationEligibility`)**:
  - Tính chính xác số phút còn lại từ thời điểm hiện tại (`Asia/Ho_Chi_Minh`) tới `bookingDate` + `arrivalTime`.
  - **Trường hợp hợp lệ (còn ≥ 120 phút)**: Cho phép chọn 1 trong 6 lý do chuẩn (hoặc nhập ghi chú tùy chỉnh) và gửi `POST /api/reservations/:id/cancel` **bắt buộc kèm `customerPhone` khớp với đơn** (`400 PHONE_REQUIRED` nếu thiếu, `403 PHONE_MISMATCH` nếu sai; chỉ Staff/Admin có JWT hợp lệ được miễn).
  - **Hệ quả xử lý khi hủy thành công**:
    1. Chuyển trạng thái đơn sang `cancelled`, lưu `cancellationReason`, `cancellationNotes`, `cancelledAt`.
    2. Giải phóng toàn bộ bàn thuộc đơn (cả bàn chính và bàn ghép trong `table_ids`) ngay lập tức về `available` (xóa `currentReservationId`).
    3. Ghi nhận và gửi email xác nhận hủy (`type: 'cancellation'`).
    4. Nếu đơn có tiền cọc (`depositAmount > 0`): hiển thị cam kết hoàn 100% tiền cọc trong vòng 24 giờ làm việc.
    5. Nếu đơn có quy đổi điểm (`pointsRedeemed > 0`): tự động hoàn lại toàn bộ số điểm đã dùng vào ví thành viên và ghi nhận dòng `refund` vào Sổ cái điểm thưởng.
  - **Trường hợp quá hạn (< 120 phút hoặc đã qua giờ hẹn)**: Chặn hủy trên cả Frontend (`CancelReservationModal`) và Backend (`400 CANCELLATION_DEADLINE_EXCEEDED`), giải thích do bếp đã sơ chế nguyên liệu tươi sống, đồng thời hiển thị nút gọi trực tiếp **Hotline Quản lý: `0903.888.999`**.

### 4.1.4. Tự Phục Vụ Tại Bàn qua Mã QR (`FR-UNREG-04`)
- Thực khách quét mã QR tại bàn hoặc mở từ thanh điều hướng để gửi nhanh các yêu cầu: Tiếp nước lọc/đá, Gặp Sommelier, Đổi dao dĩa, Khăn ấm, Yêu cầu thanh toán & in hóa đơn, Gặp quản lý hoặc ghi chú riêng.

---

## 4.2. Member (Khách hàng thành viên)

### 4.2.1. Xác thực & Duy trì Phiên Đăng Nhập (`FR-MEM-01`)
- Đăng ký tại `POST /api/users`: Họ tên dài **2–100 ký tự** (`400 INVALID_NAME`), kiểm tra định dạng email/SĐT VN, mật khẩu ≥ 6 ký tự, chặn trùng Email (`409 EMAIL_ALREADY_EXISTS`) và trùng Số điện thoại (`409 PHONE_ALREADY_EXISTS`), đồng thời khóa cứng từ server `role = 'customer'`, `membershipTier = 'Đồng'`, `loyaltyPoints = 0` (bỏ qua mọi giá trị điểm/hạng client gửi kèm).
- Đăng nhập tại `POST /api/auth/login`: So sánh mật khẩu Bcrypt, trả thông báo `401` thống nhất khi sai tài khoản hoặc sai mật khẩu (tránh lộ tài khoản tồn tại), trả về JWT ký bởi `JWT_SECRET` **hạn 24 giờ**, lưu `saveCurrentUser` + token vào `localStorage` và giữ ổn định xuyên suốt quá trình đặt bàn.
- Cập nhật hồ sơ (`PATCH /api/users/:id`): Chỉ cho phép tự sửa thông tin cá nhân của chính mình hoặc Admin sửa; chặn IDOR (`403`) và chặn tự đổi `role`, `loyaltyPoints`, `membershipTier`.

### 4.2.2. Hệ Thống Tích Điểm, Đổi Điểm & Sổ Cái Điểm Thưởng (`FR-MEM-02`)
1. **Phân hạng Thành viên 4 cấp (`calculateTierFromPoints`)**:
   - **Đồng**: `0 – 399` điểm
   - **Bạc**: `400 – 999` điểm
   - **Vàng**: `1.000 – 2.499` điểm (mở khóa voucher `MEMBERVIP` giảm 150.000đ cho đơn từ 1.000.000đ)
   - **Kim Cương**: `>= 2.500` điểm
2. **Cơ chế Tích điểm Vòng đời chuẩn (Pending -> Earn on Completed)**:
   - Tỷ lệ tích điểm: **1 điểm cho mỗi 10.000 VNĐ** trên tổng hóa đơn thanh toán thực tế (`Math.floor(finalTotal / 10000)`).
   - Khi mới tạo đơn (`pending`/`confirmed`), số điểm này ở trạng thái **Điểm tạm tính (Pending)** — hiển thị rõ *"sẽ cộng sau khi hoàn tất dùng bữa"* trên `BookingConfirmation` và `CheckInBill`, **không** cộng trước vào ví để tránh gian lận đặt rồi hủy.
   - Chỉ khi nhân viên xác nhận hoàn tất thanh toán (`status = 'completed'` qua `PATCH /api/reservations/:id/status` hoặc `checkoutAndSettleReservation`), hệ thống mới cộng điểm thực vào `loyaltyPoints`, tự động cập nhật `membershipTier` nếu vượt ngưỡng, và ghi giao dịch `type: 'earn'` vào sổ cái (chống cộng trùng theo `bookingCode`).
3. **Đổi Điểm Giảm Giá Trực Tiếp Khi Đặt Bàn (`Redeem Points`)**:
   - Tại Bước 03 (`BookingConfirmation`), thành viên có thể bật tùy chọn **Sử dụng điểm tích lũy** và nhập/kéo thanh trượt chọn số điểm muốn dùng.
   - Quy tắc quy đổi (đồng bộ Frontend & Backend):
     - Tỷ giá: **`1 điểm = 100 VNĐ`**.
     - Giới hạn trần: Giảm tối đa **30% giá trị thực đơn chọn trước còn lại sau khi đã trừ Voucher**.
     - Khi đơn được tạo thành công, số điểm quy đổi (`pointsRedeemed`) được **trừ ngay lập tức** khỏi ví thành viên và ghi dòng `type: 'redeem'` (số âm) vào Sổ cái.
     - Nếu đơn bị hủy (`POST /api/reservations/:id/cancel` hoặc staff hủy đơn), số điểm đã dùng được **tự động hoàn 100%** kèm dòng `type: 'refund'` vào Sổ cái.
4. **Sổ Cái Biến Động Điểm Thưởng (`Points Ledger`)**:
   - Hiển thị trong tab Ưu Đãi của `UserProfileModal`, kết hợp dữ liệu cục bộ và API `GET /api/users/:id/points-ledger` (**bắt buộc JWT token** của chính chủ `id` hoặc `admin`, từ chối `401`/`403` nếu truy cập trái phép), hiển thị rõ loại giao dịch (`Tích điểm`, `Đổi điểm`, `Hoàn điểm`, `Thưởng`), mô tả, mã đơn liên quan, thời gian và số dư sau giao dịch (`balanceAfter`).

---

## 4.3. Admin (Quản trị viên hệ thống)

- **Quản lý Tài Khoản & RBAC (`FR-ADM-01`)**: Chỉ `role === 'admin'` mới truy cập được tab **Quản Lý Tài Khoản** và gọi `GET /api/users`. Cho phép xem danh sách nhân viên, vai trò, ca trực và tạo/điều chỉnh phân quyền.
- **Quản lý Thực Đơn & Giá Bán (`FR-ADM-02`)**: Tab **Quản Lý Thực Đơn** chỉ mở cho Admin (thêm món, chỉnh sửa giá, đổi trạng thái `isAvailable`, xóa món).
- **Báo Cáo Tài Chính & Doanh Thu (`FR-ADM-03`)**: Tab **Báo Cáo & Phân Tích** chỉ mở cho Admin (doanh thu thực thu, giá trị đơn trung bình, tỷ lệ lấp đầy bàn, thống kê theo khu vực).
- **Chuyển đổi Giao diện (`FR-ADM-04`)**: Chỉ tài khoản Admin mới có nút chuyển nhanh giữa **Giao Diện Quản Trị Admin** và **Bàn Vận Hành Tiếp Tân**.

---

## 4.4. System (Tác tử Hệ thống tự động)

- **Conflict Detection Engine & Multi-Table Slot Mutex (`FR-SYS-01`)**: Khóa tuần tự theo thứ tự định danh trên toàn bộ cặp `tableId:bookingDate` của cả bàn chính và các bàn ghép (`tableIds`) để loại bỏ race condition/deadlock; lưu danh sách `table_ids` vào PostgreSQL; từ chối mọi yêu cầu trùng bất kỳ bàn nào có `|arrival_1 - arrival_2| < 120 phút` (HTTP `409 TABLE_SLOT_CONFLICT`), trừ các đơn đã `cancelled`.
- **Server-Side Integrity (`FR-SYS-02`)**: Kiểm tra ngày lịch dương hợp lệ (`isValidCalendarDate`), giờ mở cửa `10:00–22:30`, từ chối món không thuộc `MENU_ITEMS` hoặc ngừng bán (`400 INVALID_MENU_ITEM`), kiểm tra hạn sử dụng/đơn tối thiểu/hạng voucher, kiểm tra tính duy nhất của `bookingCode` (`409 DUPLICATE_BOOKING_CODE`), bắt buộc JWT khi tiêu điểm, kiểm tra trần giảm điểm 30%, và ép trạng thái ban đầu `pending` cho đơn đặt trực tuyến.
- **Rate Limiting (`FR-SYS-03`)**:
  - `POST /api/auth/login`: Tối đa **5 lần đăng nhập thất bại / 15 phút** (`skipSuccessfulRequests: true` — không giới hạn các lần đăng nhập thành công).
  - `POST /api/reservations`: Tối đa 30 requests / phút.
  - General API: Tối đa 5.000 requests / 15 phút (miễn trừ localhost cho phát triển).
- **Sandbox Cleanup (`FR-SYS-04`)**: `POST /api/test/reset-sandbox` dọn các đơn có đánh dấu kiểm thử (`[TEST]`, SĐT `0900000...`/`0999999...`, email `autotest`, mã `TEST-`) và đưa bàn liên quan về `available`.

---

## 4.5. Staff & Operations (Nhân viên Lễ tân, Phục vụ, Bếp KDS)

- **Cách ly Quyền Hạn Nghiêm Ngặt (`FR-STF-01`)**:
  - Trên Navbar, nhân viên chỉ thấy tab **"Bàn Vận Hành"** (màu xanh dương).
  - Trong `AdminDashboard`, biến `viewMode` của `staff` bị khóa cứng ở `'staff'`; các tab `reports`, `menu`, `staff` bị ẩn khỏi thanh tab và bị chặn bởi `isRestrictedForStaff` với màn hình cảnh báo nếu cố truy cập.
- **Bàn Điều Hành Tiếp Tân (`staff_ops`)**: Xử lý chuông yêu cầu QR tại bàn theo thời gian thực (kèm âm báo Web Audio), nhận khách Walk-in, gọi thêm món tại bàn, thanh toán hóa đơn & hoàn tất đơn.
- **Quản lý Đơn Đặt & Sơ Đồ Bàn (`reservations`, `tables`)**: Tìm kiếm, lọc, xác nhận (`pending` -> `confirmed`), xếp bàn (`confirmed` -> `seated`), hoàn tất (`completed`), hủy đơn và chuyển trạng thái bàn (`available`, `reserved`, `occupied`, `cleaning`).
- **Màn Hình Bếp KDS (`kds`)**: Nhận ticket món từ đơn đặt trước hoặc tại bàn, lọc theo 4 trạm bếp (`hot_kitchen`, `cold_kitchen`, `bar`, `pastry`), chuyển trạng thái chế biến từng món.
- **Kho & Định Lượng BOM (`inventory`)**: Theo dõi tồn kho nguyên liệu, cảnh báo dưới ngưỡng `minStockLevel`, nhập kho, trừ kho theo định lượng BOM và tính Food Cost %.
- **Phản hồi Khách Hàng (`feedback`)**: Theo dõi chỉ số CSAT / NPS và gửi phản hồi tới thực khách.

---

# 5. Non-functional Requirements (Yêu cầu phi chức năng)

- **Usability**: Giao diện Dark Luxury (`Stone-950` + `Amber/Gold`) kết hợp Modal nền sáng dễ đọc cho các thao tác nhập liệu; tương thích Desktop, Tablet POS/iPad và Mobile (375px+).
- **Security**:
  - Băm mật khẩu bằng `bcryptjs` (salt round 10), xác thực qua JWT Bearer Token (`jsonwebtoken`).
  - Bảo vệ chống Privilege Escalation, IDOR, Bypass Voucher theo hạng và tính toán giá phía Client bằng kiểm chứng hoàn toàn ở Server.
  - Chuẩn hóa CORS và chống brute-force bằng `express-rate-limit`.
- **Reliability & Data Consistency**:
  - Slot Mutex chống trùng bàn đồng thời; FSM chặn chuyển trạng thái phi logic; idempotency khi cộng/hoàn điểm thưởng; tự động fallback sang In-Memory/LocalStorage khi PostgreSQL chưa kết nối.
- **Tech Stack & Environment**:
  - **Frontend**: React `19.0.1`, Vite `8.3.0`, TypeScript `7.0.2`, Tailwind CSS `v4.3.3`, `lucide-react`, `qrcode`, `motion`.
  - **Backend**: Node.js (`v20+`/`v22+`), Express `4.21.2`, `tsx`, `bcryptjs`, `jsonwebtoken`, `express-rate-limit`.
  - **Database**: PostgreSQL 15+ kết hợp Drizzle ORM (`drizzle-orm`, `drizzle-kit`, `pg`), timezone chuẩn `Asia/Ho_Chi_Minh`.
- **Software Interfaces (RESTful API Endpoints trong `server.ts`)**:
  - `GET /api/health` — Kiểm tra tình trạng server.
  - `GET /api/menu` — Lấy danh sách thực đơn công khai.
  - `POST /api/auth/login` — Đăng nhập & cấp JWT Token.
  - `GET /api/auth/me` — Lấy hồ sơ người dùng đang xác thực (yêu cầu JWT).
  - `GET /api/tables` — Lấy sơ đồ toàn bộ bàn.
  - `GET /api/tables/availability` — Kiểm tra bàn trống theo `date`, `time`, `guests`.
  - `PUT /api/tables/:id` — Cập nhật thông số/trạng thái bàn (`admin`, `staff`).
  - `GET /api/reservations` — Lấy toàn bộ danh sách đơn (`admin`, `staff`).
  - `POST /api/reservations` — Tạo đơn đặt bàn mới (server-side validation + voucher + redeem points).
  - `POST /api/reservations/lookup` — Tra cứu đơn theo SĐT hoặc Booking Code.
  - `PATCH /api/reservations/:id/status` — Chuyển trạng thái đơn theo FSM & cộng điểm khi `completed` (`admin`, `staff`).
  - `POST /api/reservations/:id/cancel` — Khách tự hủy bàn theo chính sách 120 phút, giải phóng bàn & hoàn điểm.
  - `GET /api/users/:id/points-ledger` — Lấy sổ cái biến động điểm của thành viên (bắt buộc JWT chính chủ hoặc `admin`).
  - `GET /api/users` — Lấy danh sách toàn bộ tài khoản (`admin` only).
  - `POST /api/users` — Đăng ký tài khoản thành viên mới (chặn trùng email/SĐT, tên 2–100 ký tự, khóa mặc định `Đồng`/0 điểm).
  - `PATCH /api/users/:id` — Cập nhật hồ sơ cá nhân (chính chủ hoặc `admin`).
  - `GET /api/email-logs` — Xem nhật ký email đã gửi (`admin`, `staff`).
  - `POST /api/email-logs` — Ghi nhận log email mới.
  - `DELETE /api/email-logs/:id` & `DELETE /api/email-logs` — Xóa log email (`admin`, `staff`).
  - `POST /api/test/reset-sandbox` — Dọn dẹp dữ liệu kiểm thử giả lập (`[TEST]`, `TEST-`).

---

# 6. Appendix (Phụ lục)

### Phụ Lục A: Ma Trận Phân Quyền Vai Trò (RBAC Permission Matrix)

| Chức Năng Nghiệp Vụ | Khách Vãng Lai | Thành Viên (`customer`) | Nhân Viên (`staff`) | Quản Trị Viên (`admin`) |
| :--- | :---: | :---: | :---: | :---: |
| Xem thực đơn & Bàn trống | ✅ Có | ✅ Có | ✅ Có | ✅ Có |
| Đặt bàn trực tuyến & QR tại bàn | ✅ Có | ✅ Có | ✅ Có | ✅ Có |
| Tra cứu & Tự hủy đặt bàn (≥ 120 phút, kèm SĐT) | ✅ Có | ✅ Có | ✅ Có | ✅ Có |
| Áp dụng Voucher công khai còn hạn (`LEGOURMET10`) | ✅ Có | ✅ Có | ✅ Có | ✅ Có |
| Áp dụng Voucher VIP (`MEMBERVIP` - Hạng Vàng+) | ❌ Chặn | ✅ Nếu đủ hạng | ❌ Không | ✅ Nếu đủ hạng |
| Đổi điểm trừ tiền & Xem Sổ cái điểm | ❌ Không | ✅ Có (Chính chủ) | ❌ Không | ✅ Có |
| Nhận điểm tích lũy sau khi đơn `completed` | ❌ Không | ✅ Có | ❌ Không | ✅ Có |
| Bàn điều hành tiếp tân, Sơ đồ bàn, Duyệt/Chuyển đơn | ❌ Không | ❌ Không | ✅ Có | ✅ Có |
| Màn hình Bếp (KDS), Kho BOM & Phản hồi CSAT | ❌ Không | ❌ Không | ✅ Có | ✅ Có |
| Quản lý Thực đơn & Điều chỉnh giá bán | ❌ Không | ❌ Không | ❌ **Chặn** | ✅ Có |
| Báo cáo Tài chính & Doanh thu | ❌ Không | ❌ Không | ❌ **Chặn** | ✅ Có |
| Quản lý Tài khoản & Phân quyền (`GET /api/users`) | ❌ Không | ❌ Không | ❌ **Chặn** | ✅ Có |

### Phụ Lục B: Bảng Ánh Xạ Mã Lỗi HTTP & Business Error Codes

| Mã HTTP | Business Code / Tình huống | Mô Tả Chi Tiết Trong Hệ Thống |
| :--- | :--- | :--- |
| **200 OK** | Thành công | Truy vấn, cập nhật trạng thái, hủy bàn hoặc lấy sổ cái điểm thành công. |
| **201 Created** | Tạo mới thành công | Tạo đơn đặt bàn (`bookingCode: LGB-XXXXX`) hoặc đăng ký tài khoản thành công. |
| **400 Bad Request** | `INVALID_BOOKING_DATE`, `PAST_BOOKING_DATE`, `OUT_OF_OPERATING_HOURS`, `INVALID_MENU_ITEM`, `INVALID_VOUCHER`, `VOUCHER_EXPIRED`, `VOUCHER_MIN_ORDER`, `INVALID_TABLE_STATUS`, `INVALID_STATUS_VALUE`, `INVALID_STATUS_TRANSITION`, `CANCELLATION_DEADLINE_EXCEEDED`, `ALREADY_CANCELLED`, `INVALID_STATUS_FOR_CANCELLATION`, `PHONE_REQUIRED`, `INVALID_NAME` | Ngày không tồn tại (`30/02/2027`), giờ ngoài `10:00–22:30`, món không có trong thực đơn, voucher hết hạn (`SWEETWINE`), trạng thái bàn không hợp lệ, chuyển trạng thái sai FSM, thiếu SĐT khi tự hủy, hoặc tên đăng ký ngoài `2–100` ký tự. |
| **401 Unauthorized** | `AUTH_REQUIRED`, đăng nhập thất bại | Thiếu JWT token trong header `Authorization` khi gọi API bảo vệ (hoặc tiêu điểm), hoặc sai tài khoản/mật khẩu đăng nhập. |
| **403 Forbidden** | `TOKEN_INVALID`, `ACCESS_DENIED`, `VOUCHER_TIER_REQUIRED`, `PHONE_MISMATCH` | JWT token sai chữ ký hoặc đã hết hạn (24h), truy cập trái vai trò RBAC/IDOR (xem sổ cái điểm người khác, tiêu điểm hộ), dùng voucher VIP không đủ hạng, hoặc SĐT hủy đơn không khớp. |
| **404 Not Found** | `RESERVATION_NOT_FOUND`, `TABLE_NOT_FOUND` | Không tìm thấy đơn đặt bàn hoặc mã bàn ăn (bao gồm bàn ghép). |
| **409 Conflict** | `TABLE_SLOT_CONFLICT`, `DUPLICATE_BOOKING_CODE`, `EMAIL_ALREADY_EXISTS`, `PHONE_ALREADY_EXISTS` | Bàn chính hoặc bàn ghép đã có khách đặt trong cửa sổ 120 phút, mã đặt bàn trùng lặp, hoặc Email/SĐT đăng ký đã tồn tại. |
| **429 Too Many Requests** | `AUTH_RATE_LIMIT`, `RESERVATION_RATE_LIMIT`, `RATE_LIMIT_EXCEEDED` | Vượt quá 5 lần đăng nhập thất bại / 15 phút hoặc spam đặt bàn liên tục. |
| **500 Server Error** | Lỗi xử lý nội bộ | Lỗi hệ thống bất thường phía server. |

---

# 7. Wiki & Glossary (Thuật ngữ chuyên ngành)

1. **Conflict Window (Cửa sổ xung đột 120 phút)**: Khoảng thời gian tiêu chuẩn bảo lưu cho mỗi lượt đặt bàn để tránh đặt chồng chéo giữa hai lượt khách.
2. **Cancellation Buffer (Ngưỡng tự hủy 120 phút)**: Thời hạn tối thiểu trước giờ hẹn để khách được phép tự hủy trực tuyến, đảm bảo nhà bếp chưa sơ chế nguyên liệu tươi và đủ điều kiện hoàn 100% cọc.
3. **FSM (Finite State Machine)**: Máy trạng thái hữu hạn kiểm soát nghiêm ngặt quy trình đơn đặt bàn (`pending` → `confirmed` → `seated`/`checked_in` → `completed` hoặc `cancelled`).
4. **Pending Points (Điểm tạm tính)**: Điểm thưởng ước tính trên đơn mới đặt; chỉ được ghi có chính thức vào ví thành viên khi bữa ăn chuyển trạng thái `completed`.
5. **Points Ledger (Sổ cái điểm thưởng)**: Nhật ký bất biến ghi lại toàn bộ biến động cộng (`earn`), trừ (`redeem`), hoàn (`refund`) và thưởng (`bonus`) kèm số dư sau giao dịch.
6. **RBAC (Role-Based Access Control)**: Cơ chế kiểm soát truy cập theo vai trò (`customer`, `staff`, `admin`) trên cả React UI và Express middleware.
7. **KDS (Kitchen Display System)**: Hệ thống điều phối đơn món thời gian thực tại 4 trạm bếp (Bếp Nóng, Bếp Lạnh, Quầy Bar, Bếp Bánh).
8. **BOM (Bill of Materials)**: Định lượng nguyên liệu tiêu hao trên mỗi món ăn dùng để tính giá vốn (COGS / Food Cost %) và tự động trừ kho.
9. **Slot Mutex**: Cơ chế khóa tuần tự bất đồng bộ theo bàn và ngày nhằm loại bỏ tình trạng đặt trùng bàn đồng thời (Race Condition).
