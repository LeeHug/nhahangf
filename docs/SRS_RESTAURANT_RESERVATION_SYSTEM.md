# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SOFTWARE REQUIREMENTS SPECIFICATION - SRS)
## DỰ ÁN: HỆ THỐNG ĐẶT BÀN VÀ QUẢN LÝ NHÀ HÀNG CAO CẤP LE GOURMET BISTRO

**Mã tài liệu:** SRS-LGB-2026-V2.0  
**Phiên bản:** 2.0.0 (Release Candidate)  
**Tác giả:** Senior Business Analyst (BA)  
**Ngày phê duyệt:** 25/10/2026  
**Trạng thái:** Approved / Ready for Baseline  

---

# MỤC LỤC

- [1. Introduction](#1-introduction)
  - [1.1. Purpose (Mục đích tài liệu)](#11-purpose)
  - [1.2. Scope (Phạm vi hệ thống)](#12-scope)
  - [1.3. References (Tài liệu tham chiếu)](#13-references)
- [2. Overall Description](#2-overall-description)
  - [2.1. Use Case Diagram](#21-use-case-diagram)
    - [2.1.1. Actor Diagram Relationship (Mối quan hệ giữa các tác tử)](#211-actor-diagram-relationship)
    - [2.1.2. Use Case cho Khách Chưa Đăng Ký (Unregistered User)](#212-use-case-for-unregistered-user)
    - [2.1.3. Use Case cho Khách Hàng Thành Viên (Member)](#213-use-case-for-user-member)
    - [2.1.4. Use Case cho Quản Trị Viên Hệ Thống (Admin)](#214-use-case-for-admin)
    - [2.1.5. Use Case cho Hệ Thống Tự Động (System)](#215-use-case-for-system)
    - [2.1.6. Use Case cho Quản Lý Nhà Hàng (Restaurant Manager / Staff)](#216-use-case-for-restaurant-manager--staff)
      - [2.1.6.1. Quản lý Món Ăn và Công Thức (Menu Items)](#2161-quản-lý-món-ăn-và-công-thức)
      - [2.1.6.2. Quản lý Danh Mục Món Ăn (Menu Category)](#2162-quản-lý-danh-mục-món-ăn)
      - [2.1.6.3. Quản lý Sơ Đồ Bàn và Khu Vực (Table Layout & Capacity)](#2163-quản-lý-sơ-đồ-bàn-và-khu-vực)
      - [2.1.6.4. Quản lý Đơn Đặt Bàn và Ca Phục Vụ (Reservations & Shifts)](#2164-quản-lý-đơn-đặt-bàn-và-ca-phục-vụ)
  - [2.2. State Diagram (Biểu đồ chuyển trạng thái)](#22-state-diagram)
    - [2.2.1. Vòng đời Trạng thái Đơn Đặt Bàn (Reservation Lifecycle)](#221-vòng-đời-trạng-thái-đơn-đặt-bàn)
    - [2.2.2. Vòng đời Trạng thái Bàn Ăn Thực Tế (Table Status Lifecycle)](#222-vòng-đời-trạng-thái-bàn-ăn-thực-tế)
  - [2.3. Architectural System (Kiến trúc hệ thống tổng thể)](#23-architectural-system)
  - [2.4. Component Diagram (Biểu đồ thành phần)](#24-component-diagram)
  - [2.5. Design Diagrams (Class, DAO, Service)](#25-design-diagrams)
    - [2.5.1. Class Diagram](#251-class-diagram)
    - [2.5.2. DAO / Repository Diagram](#252-dao--repository-diagram)
    - [2.5.3. Service Layer Diagram](#253-service-layer-diagram)
- [3. Database Design](#3-database-design)
  - [3.1. Entity Relationship Diagram (ERD)](#31-entity-relationship-diagram-erd)
  - [3.2. Database Schema Overview](#32-database-schema-overview)
  - [3.3. Detailed Schema Specifications (Đặc tả chi tiết các bảng)](#33-detailed-schema-specifications)
    - [3.3.1. Bảng `users` (Tài khoản người dùng)](#331-bảng-users)
    - [3.3.2. Bảng `tables` (Sơ đồ bàn ăn & Sức chứa)](#332-bảng-tables)
    - [3.3.3. Bảng `reservations` (Đơn đặt bàn)](#333-bảng-reservations)
    - [3.3.4. Bảng `menu_categories` (Danh mục thực đơn)](#334-bảng-menu_categories)
    - [3.3.5. Bảng `menu_items` (Món ăn & Rượu vang)](#335-bảng-menu_items)
    - [3.3.6. Bảng `pre_orders` (Món đặt trước theo đơn bàn)](#336-bảng-pre_orders)
    - [3.3.7. Bảng `table_service_requests` (Yêu cầu phục vụ tại bàn)](#337-bảng-table_service_requests)
    - [3.3.8. Bảng `email_logs` (Nhật ký thông báo email tự động)](#338-bảng-email_logs)
    - [3.3.9. Bảng `reviews` (Đánh giá & Phản hồi khách hàng)](#339-bảng-reviews)
- [4. Functional Requirements (Yêu cầu chức năng chi tiết)](#4-functional-requirements)
  - [4.1. Unregistered User (Khách vãng lai / Khách chưa đăng nhập)](#41-unregistered-user)
    - [4.1.1. Tra cứu đơn đặt bàn bằng Số điện thoại / Mã Booking Code](#411-tra-cứu-đơn-đặt-bàn)
    - [4.1.2. Xem chi tiết thông tin đơn đặt bàn & trạng thái](#412-xem-chi-tiết-thông-tin-đơn-đặt-bàn)
    - [4.1.3. Xem thực đơn công khai & giá niêm yết](#413-xem-thực-đơn-công-khai)
    - [4.1.4. Thực hiện Đặt Bàn Trực Tuyến (Online Booking Flow)](#414-thực-hiện-đặt-bàn-trực-tuyến)
      - [4.1.4.1. Xác nhận và Nộp đơn đặt bàn (Submit Reservation)](#4141-xác-nhận-và-nộp-đơn-đặt-bàn)
      - [4.1.4.2. Chọn món đặt trước (Pre-order Menu Integration)](#4142-chọn-món-đặt-trước)
    - [4.1.5. Yêu cầu phục vụ tại bàn qua mã QR bàn (Table Self-Service)](#415-yêu-cầu-phục-vụ-tại-bàn)
  - [4.2. Member (Khách hàng thành viên)](#42-member)
    - [4.2.1. Đăng ký & Đăng nhập (Authentication)](#421-đăng-ký--đăng-nhập)
    - [4.2.2. Trang chủ thành viên (Member Dashboard)](#422-trang-chủ-thành-viên)
    - [4.2.3. Đăng xuất (Logout)](#423-đăng-xuất)
    - [4.2.4. Xem & Cập nhật Hồ sơ cá nhân (View Profile)](#424-xem--cập-nhật-hồ-sơ-cá-nhân)
    - [4.2.5. Xem danh sách Lịch sử Đặt Bàn đã tham gia](#425-xem-danh-sách-lịch-sử-đặt-bàn)
      - [4.2.5.1. Filter lịch sử đơn](#4251-filter-lịch-sử-đơn)
      - [4.2.5.2. Search lịch sử đơn](#4252-search-lịch-sử-đơn)
      - [4.2.5.3. Sort lịch sử đơn](#4253-sort-lịch-sử-đơn)
    - [4.2.6. Đánh giá trải nghiệm sau bữa ăn & Chấm điểm dịch vụ](#426-đánh-giá-trải-nghiệm-sau-bữa-ăn)
      - [4.2.6.1. Xem danh sách các bữa ăn đủ điều kiện đánh giá](#4261-xem-danh-sách-bữa-ăn-đủ-điều-kiện)
      - [4.2.6.2. Chấm điểm sao & Viết nhận xét món ăn](#4262-chấm-điểm-sao--viết-nhận-xét)
      - [4.2.6.3. Submit đánh giá](#4263-submit-đánh-giá)
    - [4.2.7. Xem thông báo & Nhật ký Email xác nhận](#427-xem-thông-báo)
    - [4.2.8. Quản lý điểm thưởng tích lũy (Loyalty Points & Tiers)](#428-quản-lý-điểm-thưởng)
  - [4.3. Admin (Quản trị viên hệ thống)](#43-admin)
    - [4.3.1. Quản lý Tài Khoản Người Dùng](#431-quản-lý-tài-khoản-người-dùng)
      - [4.3.1.1. Hiển thị danh sách tài khoản (Sort/Search/Filter)](#4311-hiển-thị-danh-sách-tài-khoản)
      - [4.3.1.2. Tạo tài khoản nhân viên / quản lý](#4312-tạo-tài-khoản-nhân-viên)
      - [4.3.1.3. Khóa / Mở khóa tài khoản](#4313-khóa--mở-khóa-tài-khoản)
    - [4.3.2. Xem chi tiết Profile người dùng & phân quyền RBAC](#432-xem-chi-tiết-profile)
    - [4.3.3. Quản lý Nhóm Tài Khoản & Vai Trò (Roles & Permissions)](#433-quản-lý-nhóm-tài-khoản--vai-trò)
      - [4.3.3.1. Danh sách nhóm tài khoản (Admin, Manager, Staff, Customer)](#4331-danh-sách-nhóm)
      - [4.3.3.2. Cấu hình quyền hạn truy cập module](#4332-cấu-hình-quyền-hạn)
    - [4.3.4. Cấu hình thông số vận hành nhà hàng (Operating Hours, Capacity Threshold)](#434-cấu-hình-thông-số)
  - [4.4. System (Tác tử Hệ thống tự động)](#44-system)
    - [4.4.1. Thuật toán kiểm tra xung đột trùng bàn (Conflict Detection Engine)](#441-thuật-toán-kiểm-tra-xung-đột-trùng-bàn)
    - [4.4.2. Tự động chuyển đổi máy trạng thái bàn (Automated State Transitions)](#442-tự-động-chuyển-đổi-trạng-thái)
    - [4.4.3. Quản lý thông báo và Hàng đợi gửi Email tự động](#443-quản-lý-thông-báo-email)
    - [4.4.4. Rate Limiting và Tường lửa chống tấn công DoS/Brute-force](#444-rate-limiting)
    - [4.4.5. Cơ chế dọn dẹp môi trường kiểm thử Sandbox API](#445-cơ-chế-dọn-dẹp-sandbox)
  - [4.5. User Manager / Restaurant Manager (Quản lý Nhà Hàng & Nhân Viên)](#45-user-manager--restaurant-manager)
    - [4.5.1. Quản lý Thực Đơn Món Ăn (Menu Items Management)](#451-quản-lý-thực-đơn-món-ăn)
      - [4.5.1.1. Hiển thị danh sách món ăn (Search, Filter, Sort)](#4511-hiển-thị-danh-sách-món-ăn)
      - [4.5.1.2. Tạo Tag ẩm thực (Khai vị, Món chính, Tráng miệng, Rượu vang)](#4512-tạo-tag-ẩm-thực)
      - [4.5.1.3. Thêm mới món ăn](#4513-thêm-mới-món-ăn)
      - [4.5.1.4. Import danh sách món ăn từ file Excel/JSON](#4514-import-danh-sách-món-ăn)
      - [4.5.1.5. Xem chi tiết món ăn & nguyên liệu](#4515-xem-chi-tiết-món-ăn)
      - [4.5.1.6. Cập nhật món ăn (Hàng loạt / Từng món)](#4516-cập-nhật-món-ăn)
      - [4.5.1.7. Bật/Tắt trạng thái phục vụ (isAvailable) và Xóa món ăn](#4517-bậttắt-trạng-thái-phục-vụ)
    - [4.5.2. Quản lý Danh Mục Thực Đơn (Category Management)](#452-quản-lý-danh-mục-thực-đơn)
      - [4.5.2.1. Tạo Danh Mục mới](#4521-tạo-danh-mục-mới)
      - [4.5.2.2. Cập nhật Danh Mục](#4522-cập-nhật-danh-mục)
      - [4.5.2.3. Xóa Danh Mục](#4523-xóa-danh-mục)
    - [4.5.3. Quản lý Sơ Đồ Bàn và Khu Vực (Table & Area Management)](#453-quản-lý-sơ-đồ-bàn-và-khu-vực)
      - [4.5.3.1. Thêm Bàn mới (Số bàn, Sức chứa, Khu vực)](#4531-thêm-bàn-mới)
      - [4.5.3.2. Hiển thị danh sách bàn (Search, Filter theo tầng, Sort)](#4532-hiển-thị-danh-sách-bàn)
      - [4.5.3.3. Xem chi tiết bàn ăn & tình trạng đặt chỗ](#4533-xem-chi-tiết-bàn-ăn)
      - [4.5.3.4. Cập nhật thông số bàn ăn (Capacity, Location, Status)](#4534-cập-nhật-thông-số-bàn-ăn)
      - [4.5.3.5. Export & Import sơ đồ bàn](#4535-export--import-sơ-đồ-bàn)
      - [4.5.3.6. Xóa / Tạm ngừng phục vụ bàn](#4536-xóa--tạm-ngừng-phục-vụ-bàn)
    - [4.5.4. Quản lý Đơn Đặt Bàn và Ca Phục Vụ (Reservation & Shift Management)](#454-quản-lý-đơn-đặt-bàn-và-ca-phục-vụ)
      - [4.5.4.1. Tạo đơn đặt bàn tại quầy hoặc qua điện thoại (Manual Booking)](#4541-tạo-đơn-đặt-bàn-tại-quầy)
      - [4.5.4.2. Clone đơn đặt bàn (Tái sử dụng thông tin khách quen)](#4542-clone-đơn-đặt-bàn)
      - [4.5.4.3. Hiển thị danh sách đơn đặt bàn (Live Table Grid / Timeline)](#4543-hiển-thị-danh-sách-đơn-đặt-bàn)
      - [4.5.4.4. Xem chi tiết đơn đặt bàn](#4544-xem-chi-tiết-đơn-đặt-bàn)
        - [4.5.4.4.1. Filter theo ngày / ca / trạng thái](#45441-filter-theo-ngày)
        - [4.5.4.4.2. Search đơn đặt theo SĐT / Tên khách](#45442-search-đơn-đặt)
        - [4.5.4.4.3. Sort danh sách đơn đặt theo thời gian đến](#45443-sort-danh-sách-đơn-đặt)
        - [4.5.4.4.4. Quản lý danh sách món đặt trước trong đơn](#45444-quản-lý-danh-sách-món-đặt-trước)
      - [4.5.4.5. Chuyển trạng thái đơn (Xác nhận, Xếp bàn Seated, Hoàn tất Paid, Hủy)](#4545-chuyển-trạng-thái-đơn)
      - [4.5.4.6. Đổi bàn ăn khi khách yêu cầu](#4546-đổi-bàn-ăn-khi-khách-yêu-cầu)
      - [4.5.4.7. Báo cáo & Thống Kê Nhà Hàng (Reporting & Analytics)](#4547-báo-cáo--thống-kê-nhà-hàng)
        - [4.5.4.7.1. Báo cáo doanh thu & tỷ lệ lấp đầy bàn (Occupancy Rate)](#45471-báo-cáo-doanh-thu)
        - [4.5.4.7.2. Xuất báo cáo ca trực (Export Excel / CSV)](#45472-xuất-báo-cáo-ca-trực)
- [5. Non-functional Requirements (Yêu cầu phi chức năng)](#5-non-functional-requirements)
  - [5.1. Usability (Tính khả dụng & Trải nghiệm người dùng)](#51-usability)
  - [5.2. Reliability (Độ tin cậy & Tính sẵn sàng)](#52-reliability)
  - [5.3. Performance (Hiệu năng hệ thống & Tốc độ phản hồi)](#53-performance)
  - [5.4. Supportability & Maintainability (Khả năng bảo trì & Mở rộng)](#54-supportability--maintainability)
  - [5.5. Design Constraints (Các ràng buộc thiết kế)](#55-design-constraints)
  - [5.6. On-line User Documentation and Help System Requirements](#56-on-line-user-documentation)
  - [5.7. Purchased Components (Các thành phần bên thứ ba)](#57-purchased-components)
  - [5.8. Interfaces (Giao diện tích hợp)](#58-interfaces)
    - [5.8.1. User Interfaces (UI)](#581-user-interfaces)
    - [5.8.2. Hardware Interfaces](#582-hardware-interfaces)
    - [5.8.3. Software Interfaces (RESTful API)](#583-software-interfaces)
    - [5.8.4. Communications Interfaces](#584-communications-interfaces)
  - [5.9. Environment (Môi trường vận hành)](#59-environment)
    - [5.9.1. Target Environment (Môi trường Production)](#591-target-environment)
    - [5.9.2. Development Environment (Môi trường Phát triển)](#592-development-environment)
    - [5.9.3. Database Requirements](#593-database-requirements)
  - [5.10. Licensing Requirements (Yêu cầu bản quyền & Giấy phép)](#510-licensing-requirements)
  - [5.11. Legal, Copyright, and Other Notices](#511-legal-copyright)
  - [5.12. Applicable Standards (Các tiêu chuẩn kỹ thuật áp dụng)](#512-applicable-standards)
- [6. Appendix (Phụ lục)](#6-appendix)
- [7. Wiki & Glossary (Thuật ngữ chuyên ngành)](#7-wiki--glossary)

---

# 1. Introduction

## 1.1. Purpose
Tài liệu Đặc tả Yêu cầu Phần mềm (SRS - Software Requirements Specification) này mô tả toàn diện, chi tiết và chính thức các yêu cầu chức năng, yêu cầu phi chức năng, kiến trúc kỹ thuật và thiết kế cơ sở dữ liệu cho **Hệ Thống Đặt Bàn và Quản Lý Nhà Hàng Cao Cấp Le Gourmet Bistro**.

Tài liệu đóng vai trò là hợp đồng kỹ thuật chuẩn giữa:
- **Khách hàng / Ban Giám Đốc Nhà Hàng**: Định nghĩa kỳ vọng nghiệp vụ và tiêu chí chấp nhận nghiệm thu (Acceptance Criteria).
- **Đội ngũ Phát triển Phần mềm (Developers, Solution Architects)**: Căn cứ thiết kế kiến trúc, cài đặt mã nguồn backend & frontend.
- **Đội ngũ Đảm bảo Chất lượng (QA / Test Engineers)**: Cơ sở thiết kế các kịch bản kiểm thử tự động (Automation Test Suite 100 TCs), kiểm thử chức năng và nghiệm thu hệ thống (UAT).
- **Bộ phận Vận hành & Quản lý Nhà hàng**: Hướng dẫn quy chuẩn quy trình nghiệp vụ đón khách, xếp bàn và điều phối dịch vụ.

## 1.2. Scope
Hệ thống **Le Gourmet Bistro Restaurant Management & Reservation Platform** là giải pháp phần mềm web đa nền tảng (Responsive Web App), hoạt động trên trình duyệt máy tính, máy tính bảng của nhân viên và điện thoại thông minh của khách hàng.

### Phạm vi bao gồm:
1. **Phân hệ Đặt Bàn Khách Hàng (Customer Booking Portal)**:
   - Tra cứu trực quan tình trạng bàn trống theo ngày, khung giờ và số lượng khách thực tế.
   - Thuật toán ngăn chặn đặt trùng bàn (Conflict Prevention) bảo đảm thời gian phục vụ 90 - 120 phút mỗi lượt.
   - Đặt món ăn trước (Pre-order Menu), thanh toán tiền cọc và ghi chú yêu cầu đặc biệt (dị ứng, bàn kỷ niệm).
   - Tra cứu mã đặt bàn tức thời (Booking Code Lookup) bằng Số điện thoại cá nhân.
   - Cổng tự phục vụ tại bàn qua mã QR (Table Self-Service: gọi phục vụ, yêu cầu hóa đơn, gọi thêm món).
2. **Phân hệ Thành Viên & Tích Điểm (Loyalty & Customer Experience)**:
   - Đăng ký, đăng nhập bảo mật qua JWT (JSON Web Token) kết hợp băm mật khẩu Bcrypt.
   - Quản lý lịch sử dùng bữa, lưu món ăn yêu thích, tích lũy điểm thưởng theo các hạng thẻ Đồng, Bạc, Vàng, Kim Cương.
   - Gửi đánh giá phản hồi 5 sao sau bữa ăn và hệ thống hòm thư thông báo xác nhận tự động.
3. **Phân hệ Quản Lý Bàn Ăn & Vận Hành Nhà Hàng (POS & Floor Management)**:
   - Sơ đồ bàn ăn trực quan thời gian thực chia theo khu vực (Tầng trệt Bistro, Tầng 2 Ban Công, Phòng VIP).
   - Quản lý máy trạng thái vòng đời đặt bàn (`pending` -> `confirmed` -> `seated` -> `completed` / `cancelled`).
   - Quản lý trạng thái bàn ăn thực tế (`available`, `reserved`, `occupied`, `cleaning`, `maintenance`).
4. **Phân hệ Quản Trị Hệ Thống (Admin Control Panel)**:
   - Quản trị thực đơn (Menu Management), định mức giá, danh mục và quản lý tình trạng còn/hết món.
   - Quản lý tài khoản nhân viên, phân quyền hạn theo mô hình RBAC (Role-Based Access Control).
   - Báo cáo phân tích doanh thu, tỷ lệ lấp đầy bàn (Occupancy Rate) và xuất báo cáo ca trực.
5. **Hạ Tầng Tích Hợp & Kiểm Thử Tự Động (Automation Testing Hub)**:
   - Môi trường Sandbox Reset API phục vụ kiểm thử cô lập.
   - Tích hợp bộ 100 kịch bản kiểm thử tự động tuần tự bảo đảm độ tin cậy và an toàn thông tin.

### Phạm vi không bao gồm (Out of scope):
- Không tích hợp trực tiếp phần cứng máy in nhiệt công nghiệp qua cổng Serial COM (hệ thống sử dụng in qua Web Print chuẩn).
- Không quản lý chuỗi cung ứng nguyên vật liệu kho chuyên sâu của nhà máy sản xuất (chỉ quản lý tồn kho món ăn ở cấp độ điểm bán).

## 1.3. References
1. *IEEE Std 830-1998*: IEEE Recommended Practice for Software Requirements Specifications.
2. *RFC 7519*: JSON Web Token (JWT) Architecture and Security Standards.
3. *OWASP Top 10 (2021)*: Web Application Security Risks & Remediation Guidelines.
4. *ISTQB Foundation Level*: Standardized Software Testing & Verification Framework.
5. *RESTful API Design Rulebook* - Mark Masse (O'Reilly).

---

# 2. Overall Description

## 2.1. Use Case Diagram

### 2.1.1. Actor Diagram Relationship (Mối quan hệ giữa các tác tử)
Hệ thống xác định 5 tác tử (Actors) chính tham gia tương tác:
1. **Unregistered User (Khách vãng lai)**: Người dùng chưa có tài khoản hoặc chưa đăng nhập vào hệ thống.
2. **Member / Registered Customer (Khách hàng thành viên)**: Khách hàng đã đăng ký tài khoản, có hồ sơ cá nhân và lịch sử đặt bàn. Kế thừa toàn bộ quyền hạn của Unregistered User.
3. **Staff / Waiter (Nhân viên phục vụ & lễ tân)**: Nhân viên nhà hàng phụ trách đón tiếp khách, xếp bàn, cập nhật trạng thái đơn và tiếp nhận yêu cầu gọi phục vụ tại bàn.
4. **Restaurant Manager / Admin (Quản trị viên / Quản lý)**: Người quản lý có toàn quyền cấu hình nhà hàng, sơ đồ bàn ăn, thực đơn, quản lý tài khoản nhân viên và báo cáo doanh thu.
5. **System (Tác tử hệ thống)**: Tiến trình chạy ngầm phụ trách kiểm tra xung đột thời gian thực, quét giải phóng bàn, gửi email tự động và tường lửa chặn DoS.

```
       +-------------------------+
       |   Unregistered User     |
       +-------------------------+
                    ^
                    | (Inherits / Extends)
       +-------------------------+
       |   User Member (VIP)     |
       +-------------------------+

       +-------------------------+
       |   Staff / Waiter        |
       +-------------------------+
                    ^
                    | (Inherits / Extends)
       +-------------------------+
       |   Admin / Manager       |
       +-------------------------+

       +-------------------------+
       |   System (Automated)    |
       +-------------------------+
```

### 2.1.2. Use Case for Unregistered User
- **UC-UNREG-01**: Tra cứu đơn đặt bàn bằng Số điện thoại / Mã Booking Code.
- **UC-UNREG-02**: Xem chi tiết thông tin đơn đặt bàn cá nhân.
- **UC-UNREG-03**: Xem sơ đồ bàn trống và khả dụng theo khung giờ.
- **UC-UNREG-04**: Xem thực đơn công khai kèm bảng giá niêm yết.
- **UC-UNREG-05**: Thực hiện đặt bàn trực tuyến (Online Booking).
- **UC-UNREG-06**: Chọn món ăn đặt trước (Pre-order Items).
- **UC-UNREG-07**: Gửi yêu cầu tự phục vụ tại bàn qua quét mã QR (Gọi nước, gọi nhân viên, xin hóa đơn).
- **UC-UNREG-08**: Đăng ký tài khoản thành viên mới.

### 2.1.3. Use Case for User Member
- **UC-MEM-01**: Đăng nhập hệ thống (Login qua Email & Mật khẩu).
- **UC-MEM-02**: Đăng xuất hệ thống (Logout an toàn, hủy token).
- **UC-MEM-03**: Xem & Cập nhật thông tin hồ sơ cá nhân (Họ tên, SĐT, Ngày sinh, Địa chỉ).
- **UC-MEM-04**: Xem bảng điều khiển thành viên (Member Dashboard & Thẻ thành viên số).
- **UC-MEM-05**: Xem danh sách lịch sử đặt bàn đã tham gia (Kèm Search, Filter trạng thái, Sort theo ngày).
- **UC-MEM-06**: Lưu danh sách món ăn yêu thích (Favorite Dishes).
- **UC-MEM-07**: Chấm điểm đánh giá 5 sao & Viết nhận xét sau khi hoàn tất bữa ăn.
- **UC-MEM-08**: Xem hộp thư thông báo & Lịch sử email xác nhận đã nhận từ hệ thống.
- **UC-MEM-09**: Theo dõi điểm thưởng tích lũy (Loyalty Points) và ưu đãi thăng hạng.

### 2.1.4. Use Case for Admin
- **UC-ADM-01**: Quản lý tài khoản người dùng (Danh sách tài khoản, Search, Filter role, Sort).
- **UC-ADM-02**: Tạo tài khoản cho nhân viên phục vụ / quản lý ca.
- **UC-ADM-03**: Khóa / Mở khóa tài khoản người dùng.
- **UC-ADM-04**: Cấu hình phân quyền nhóm tài khoản (RBAC Matrix).
- **UC-ADM-05**: Cấu hình thông số hoạt động nhà hàng (Khung giờ mở cửa, Thời gian ăn chuẩn 120 phút, Tỷ lệ cọc).
- **UC-ADM-06**: Xem toàn bộ nhật ký kiểm toán hệ thống (Audit Logs & Email Dispatch Logs).
- **UC-ADM-07**: Xem báo cáo tổng quan tài chính, doanh thu món ăn và công suất phục vụ bàn.

### 2.1.5. Use Case for System
- **UC-SYS-01**: Quét và phát hiện xung đột lịch đặt bàn thời gian thực (Conflict Detection Engine).
- **UC-SYS-02**: Tự động chuyển đổi máy trạng thái bàn ăn (`reserved` -> `occupied` -> `cleaning` -> `available`).
- **UC-SYS-03**: Xử lý hàng đợi phát thông báo Email xác nhận đặt bàn tức thì.
- **UC-SYS-04**: Kiểm soát tần suất truy cập (Rate Limiting) phòng chống tấn công brute-force & spam API.
- **UC-SYS-05**: Hỗ trợ endpoint dọn dẹp dữ liệu kiểm thử Sandbox an toàn (`POST /api/test/reset-sandbox`).

### 2.1.6. Use Case for Restaurant Manager / Staff
#### 2.1.6.1. Quản lý Món Ăn và Công Thức (Menu Items)
- **UC-MGR-01**: Xem danh sách món ăn trong thực đơn (Hỗ trợ Search, Filter category, Sort theo giá).
- **UC-MGR-02**: Tạo Tag phân loại hương vị & nhóm món (Chay, Hải sản, Cay, Bán chạy, Chef Special).
- **UC-MGR-03**: Thêm mới món ăn vào thực đơn (Tên món, Giá bán, Mô tả, Hình ảnh, Định mức calo).
- **UC-MGR-04**: Cập nhật thông tin món ăn (Sửa giá bán, mô tả, ảnh).
- **UC-MGR-05**: Bật/Tắt trạng thái phục vụ tức thời (`isAvailable` = true/false khi hết nguyên liệu).
- **UC-MGR-06**: Import & Export danh sách thực đơn qua file Excel/JSON.
- **UC-MGR-07**: Xóa món ăn khỏi danh mục.

#### 2.1.6.2. Quản lý Category of Question / Danh Mục Món Ăn (Menu Category)
- **UC-MGR-08**: Tạo danh mục món ăn mới (Khai vị, Món chính, Món tráng miệng, Bộ sưu tập rượu vang, Đồ uống cao cấp).
- **UC-MGR-09**: Cập nhật tên và thứ tự hiển thị của danh mục.
- **UC-MGR-10**: Xóa danh mục món ăn.

#### 2.1.6.3. Quản lý Sơ Đồ Bàn và Khu Vực (Table Layout & Capacity)
- **UC-MGR-11**: Thêm bàn mới vào sơ đồ (Mã số bàn, Sức chứa chỗ ngồi, Khu vực Tầng 1/Tầng 2/VIP).
- **UC-MGR-12**: Xem danh sách trạng thái bàn thời gian thực (Search, Filter theo tầng, Sort sức chứa).
- **UC-MGR-13**: Cập nhật vị trí, số ghế và trạng thái bàn (`available`, `occupied`, `cleaning`, `maintenance`).
- **UC-MGR-14**: Tạm ngừng phục vụ bàn để bảo trì sửa chữa.
- **UC-MGR-15**: Xóa bàn ăn khỏi sơ đồ.

#### 2.1.6.4. Quản lý Đề thi / Đơn Đặt Bàn và Ca Phục Vụ (Reservations & Shifts)
- **UC-MGR-16**: Tạo đơn đặt bàn trực tiếp tại quầy hoặc qua điện thoại (Manual Booking).
- **UC-MGR-17**: Clone đơn đặt bàn (Sao chép thông tin khách quen sang ngày giờ mới).
- **UC-MGR-18**: Xem danh sách đơn đặt bàn theo ca trực (Timeline View / Grid View).
- **UC-MGR-19**: Xem chi tiết đơn đặt bàn (Bao gồm thông tin liên hệ khách, số khách, món đặt trước, ghi chú).
- **UC-MGR-20**: Chuyển đổi trạng thái đơn đặt bàn:
  - Duyệt đơn (`pending` -> `confirmed`)
  - Nhận khách vào bàn (`confirmed` -> `seated`)
  - Hoàn tất bữa ăn & Thanh toán (`seated` -> `completed`)
  - Hủy đơn đặt bàn (`pending`/`confirmed` -> `cancelled`)
- **UC-MGR-21**: Đổi bàn ăn cho khách đang dùng bữa (Table Transfer).
- **UC-MGR-22**: Tiếp nhận và xử lý yêu cầu gọi phục vụ tại bàn từ khách quét mã QR.
- **UC-MGR-23**: Xem và xuất báo cáo ca trực (Doanh thu thực thu, Số lượt khách, Tỷ lệ hủy).

---

## 2.2. State Diagram (Biểu đồ chuyển trạng thái)

### 2.2.1. Vòng đời Trạng thái Đơn Đặt Bàn (Reservation Lifecycle)
Hệ thống cài đặt máy trạng thái hữu hạn nghiêm ngặt (Strict Finite State Machine) nhằm ngăn ngừa tình trạng dữ liệu không nhất quán:

```
                  +-------------------+
                  |      PENDING      | <----+ (Khách tạo đơn đặt mới)
                  +-------------------+
                    |               |
       (Staff xác nhận)             (Khách / Staff hủy)
                    v               v
            +---------------+   +-------------------+
            |   CONFIRMED   |   |     CANCELLED     | (Trạng thái kết thúc)
            +---------------+   +-------------------+
              |           |
    (Khách đến nhận bàn)  (Hủy trước giờ ăn)
              v           |
      +---------------+   |
      |    SEATED     | <-+
      +---------------+
              |
       (Thanh toán & Trả bàn)
              v
      +---------------+
      |   COMPLETED   | (Trạng thái kết thúc)
      +---------------+
```

**Quy tắc chuyển trạng thái hợp lệ:**
- `PENDING` -> `CONFIRMED` | `CANCELLED`
- `CONFIRMED` -> `SEATED` | `CANCELLED`
- `SEATED` -> `COMPLETED`
- **Các chuyển đổi phi logic bị chặn bởi HTTP 400 Bad Request:**
  - `CANCELLED` -> `SEATED` (CẤM: Không thể xếp bàn cho đơn đã hủy).
  - `COMPLETED` -> `PENDING` (CẤM: Không thể hoàn tác đơn đã kết thúc).
  - `COMPLETED` -> `SEATED` (CẤM: Bữa ăn đã thanh toán xong).

### 2.2.2. Vòng đời Trạng thái Bàn Ăn Thực Tế (Table Status Lifecycle)

```
        +-------------------------------------------------------+
        |                                                       |
        v                                                       |
   +-----------+   (Khách đặt trước)   +------------+           |
   | AVAILABLE | --------------------> |  RESERVED  |           |
   +-----------+                       +------------+           |
        |                                     |                 |
(Khách vào ngồi ngay)                (Khách đến nhận bàn)       |
        |                                     |                 |
        +----------------> +------------+ <---+                 |
                           |  OCCUPIED  |                       |
                           +------------+                       |
                                 |                              |
                          (Khách ra về)                         |
                                 v                              |
                           +------------+                       |
                           |  CLEANING  | ----------------------+
                           +------------+   (Dọn dẹp xong)
                                 |
                          (Hỏng hóc ghế/bàn)
                                 v
                           +-------------+
                           | MAINTENANCE | ---> (Sửa chữa xong -> AVAILABLE)
                           +-------------+
```

---

## 2.3. Architectural System (Kiến trúc hệ thống tổng thể)

Hệ thống được xây dựng theo mô hình **Kiến trúc phân tầng hướng dịch vụ (Tiered Service-Oriented Architecture)**:

```
[ FRONTEND CLIENT TIER ]
   ├── Client Web App (Vite + React 19 + TypeScript + Tailwind CSS)
   ├── Standalone Automation Testing Hub (Independent SPA on Port 5173 / /automation)
   └── Mobile Table Service Web Client (Responsive PWA QR Interface)
            |
            | HTTPS / JSON RESTful APIs / WebSocket
            v
[ REVERSE PROXY & GATEWAY TIER ]
   ├── Express.js API Gateway (Port 3000)
   ├── Security Middlewares (CORS, Helmet, Rate Limiter, Body Parser)
   └── JWT Authentication & RBAC Authorization Filter
            |
            | Controllers / Routing Dispatcher
            v
[ APPLICATION SERVICE TIER ]
   ├── Reservation Conflict Engine (Kiểm tra va chạm lịch đặt)
   ├── Table State Machine Service (Điều phối chuyển đổi trạng thái bàn)
   ├── Authentication & User Service (Bcrypt + JWT Token Management)
   ├── Menu & Pre-Order Service (Tính toán tiền món & tiền cọc)
   ├── Table Service Dispatcher (Xử lý chuông gọi phục vụ tại bàn)
   └── Email Notification & Audit Service (Hàng đợi gửi thư xác nhận)
            |
            | ORM Data Access
            v
[ DATA ACCESS & PERSISTENCE TIER ]
   ├── Drizzle ORM / Native SQL Repositories
   ├── PostgreSQL Database Engine (Tables, Reservations, Users, Menus)
   └── In-Memory Fast Cache / Test Sandbox Registry
```

---

## 2.4. Component Diagram (Biểu đồ thành phần)

```
+-----------------------------------------------------------------------------------+
| Le Gourmet Bistro Web System                                                      |
|                                                                                   |
|  +------------------------+      HTTP/REST      +------------------------------+  |
|  |   React SPA Client     | ------------------> | Express.js API Server        |  |
|  | - BookingFlow UI       |                     | - authRouter                 |  |
|  | - MenuCatalog UI       |                     | - reservationRouter          |  |
|  | - AdminFloorMap UI     |                     | - tableRouter                |  |
|  | - TableServiceModal UI |                     | - menuRouter                 |  |
|  +------------------------+                     | - tableServiceRouter         |  |
|                                                 +------------------------------+  |
|  +------------------------+                                    |                  |
|  | Standalone Test Hub UI |                                    v                  |
|  | - TestMatrix Component |                     +------------------------------+  |
|  | - 100-TC Runner Engine | ------------------> | Service Layer                |  |
|  | - CLI Terminal Stream  |      Direct REST    | - ConflictDetectionService   |  |
|  +------------------------+                     | - StateMachineService        |  |
|                                                 | - EmailNotificationService   |  |
|                                                 +------------------------------+  |
|                                                                |                  |
|                                                                v                  |
|                                                 +------------------------------+  |
|                                                 | Repository / Drizzle ORM     |  |
|                                                 +------------------------------+  |
|                                                                |                  |
|                                                                v                  |
|                                                 +------------------------------+  |
|                                                 | PostgreSQL Database          |  |
|                                                 +------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2.5. Design Diagrams

### 2.5.1. Class Diagram
```
+-------------------+        1..* +----------------------+
|       User        | <---------> |     Reservation      |
+-------------------+             +----------------------+
| - id: string      |             | - id: string         |
| - email: string   |             | - bookingCode: string|
| - passwordHash    |             | - bookingDate: string|
| - name: string    |             | - bookingTime: string|
| - phone: string   |             | - guestCount: number |
| - role: UserRole  |             | - status: ResStatus  |
| - points: number  |             | - depositAmount      |
+-------------------+             +----------------------+
                                       |              |
                                1..*   |              | 1
                                       v              v
                              +---------------+  +--------------+
                              |   PreOrder    |  |    Table     |
                              +---------------+  +--------------+
                              | - id: string  |  | - id: number |
                              | - quantity    |  | - name       |
                              | - price       |  | - capacity   |
                              +---------------+  | - location   |
                                     |           | - status     |
                              1      v           +--------------+
                              +---------------+
                              |   MenuItem    |
                              +---------------+
                              | - id: number  |
                              | - name: string|
                              | - price       |
                              | - isAvailable |
                              +---------------+
```

### 2.5.2. DAO / Repository Diagram
- `UserRepository`: Chịu trách nhiệm CRUD thông tin tài khoản, tìm kiếm theo email/phone, xác thực bcrypt.
- `TableRepository`: Truy vấn danh sách bàn, cập nhật trạng thái bàn, truy vấn khả dụng theo thời gian.
- `ReservationRepository`: Thêm mới đơn, kiểm tra chồng lấn thời gian, cập nhật status, tra cứu theo SĐT/BookingCode.
- `MenuRepository`: Truy vấn danh mục, món ăn, cập nhật giá và cờ `isAvailable`.
- `EmailLogRepository`: Ghi nhận nhật ký thông báo, phục vụ kiểm toán và hộp thư admin.

### 2.5.3. Service Layer Diagram
- `AuthService`: Tiếp nhận thông tin đăng ký/đăng nhập, băm mật khẩu, sinh JWT Token bảo mật kèm claims vai trò.
- `ReservationService`: Điều phối nghiệp vụ đặt bàn: Gọi `TableRepository` kiểm tra sức chứa -> Gọi thuật toán kiểm tra xung đột -> Lưu đơn -> Sinh mã Booking Code -> Gửi email xác nhận.
- `TableStateMachineService`: Quản lý các chuyển đổi trạng thái hợp lệ, cập nhật trạng thái bàn đồng bộ.
- `TableServiceManager`: Tiếp nhận chuông gọi phục vụ từ mã QR bàn, phân phối thông báo tới nhân viên trực tầng.

---

# 3. Database Design

## 3.1. Entity Relationship Diagram (ERD)

```
 +--------------------+       1:N      +--------------------+
 |       USERS        | <------------> |    RESERVATIONS    |
 | PK: id             |                | PK: id             |
 |     email          |                | FK: user_id (opt)  |
 |     password       |                | FK: table_id       |
 |     name           |                |     customer_name  |
 |     phone          |                |     customer_phone |
 |     role           |                |     booking_date   |
 |     loyalty_points |                |     booking_time   |
 +--------------------+                |     guest_count    |
                                       |     status         |
                                       |     booking_code   |
                                       +--------------------+
                                            | 1
                                            |
                                            | 1:N
                                            v
 +--------------------+       1:N      +--------------------+
 |     MENU_ITEMS     | <------------> |     PRE_ORDERS     |
 | PK: id             |                | PK: id             |
 | FK: category_id    |                | FK: reservation_id |
 |     name           |                | FK: menu_item_id   |
 |     price          |                |     quantity       |
 |     is_available   |                |     unit_price     |
 +--------------------+                +--------------------+
         ^ 1
         |
         | N:1
 +--------------------+
 |  MENU_CATEGORIES   |
 | PK: id             |
 |     name           |
 |     display_order  |
 +--------------------+

 +--------------------+       1:N      +--------------------+
 |       TABLES       | <------------> |  TABLE_SERVICE_REQ |
 | PK: id             |                | PK: id             |
 |     name           |                | FK: table_id       |
 |     capacity       |                |     request_type   |
 |     location       |                |     status         |
 |     status         |                |     created_at     |
 +--------------------+                +--------------------+
```

## 3.2. Database Schema Overview
Hệ thống sử dụng cơ sở dữ liệu quan hệ với chuẩn hóa dữ liệu bậc 3 (3NF). Tất cả các trường khóa chính (Primary Key) sử dụng định dạng số nguyên tự tăng (Integer Serial) hoặc chuỗi UUID v4 bất biến. Các ràng buộc khóa ngoại (Foreign Keys) được thiết lập với quy tắc `ON DELETE RESTRICT` hoặc `ON DELETE CASCADE` phù hợp để đảm bảo tính toàn vẹn tham chiếu.

## 3.3. Detailed Schema Specifications

### 3.3.1. Bảng `users`
Lưu trữ thông tin người dùng hệ thống (Khách hàng, Nhân viên, Quản lý).

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(64) | PRIMARY KEY | Khóa chính duy nhất định danh người dùng |
| `email` | VARCHAR(120) | UNIQUE, NOT NULL | Địa chỉ email đăng nhập hệ thống |
| `password` | VARCHAR(255) | NOT NULL | Mật khẩu đã được mã hóa Bcrypt (Salt round = 10) |
| `name` | VARCHAR(100) | NOT NULL | Họ và tên người dùng |
| `phone` | VARCHAR(20) | NULL | Số điện thoại liên hệ chính thức |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'customer' | Vai trò người dùng: 'customer', 'staff', 'admin' |
| `loyalty_points` | INTEGER | NOT NULL, DEFAULT 0 | Điểm tích lũy thành viên VIP |
| `avatar` | VARCHAR(255) | NULL | URL ảnh đại diện |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời điểm tạo tài khoản |

### 3.3.2. Bảng `tables`
Lưu trữ sơ đồ mặt bằng và thông tin bàn ăn vật lý của nhà hàng.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY | Mã số định danh bàn (Bàn 1, Bàn 2,...) |
| `name` | VARCHAR(50) | NOT NULL | Tên hiển thị (Ví dụ: "Bàn 01 - Cửa sổ") |
| `capacity` | INTEGER | NOT NULL, CHECK (capacity > 0) | Sức chứa tối đa của bàn (2, 4, 6, 8, 12 khách) |
| `location` | VARCHAR(50) | NOT NULL | Khu vực bàn: 'Tầng 1 Bistro', 'Tầng 2 Ban Công', 'Phòng VIP' |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'available' | Trạng thái vật lý: 'available', 'reserved', 'occupied', 'cleaning', 'maintenance' |

### 3.3.3. Bảng `reservations`
Lưu trữ toàn bộ thông tin các đơn đặt bàn trực tuyến và tại quầy.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(64) | PRIMARY KEY | Mã định danh UUID nội bộ của đơn đặt |
| `booking_code` | VARCHAR(20) | UNIQUE, NOT NULL | Mã tra cứu ngắn gọn gửi cho khách (VD: "LGB-84920") |
| `table_id` | INTEGER | FK -> `tables(id)`, NOT NULL | Bàn được chỉ định xếp chỗ |
| `customer_name` | VARCHAR(150) | NOT NULL | Họ tên khách hàng đặt bàn |
| `customer_phone` | VARCHAR(20) | NOT NULL | Số điện thoại nhận tin xác nhận & tra cứu |
| `customer_email` | VARCHAR(120) | NULL | Email nhận thư xác nhận tự động |
| `booking_date` | DATE | NOT NULL | Ngày đặt bàn (Định dạng YYYY-MM-DD) |
| `booking_time` | VARCHAR(10) | NOT NULL | Khung giờ đặt bàn (Định dạng HH:mm, VD: "19:00") |
| `guest_count` | INTEGER | NOT NULL, CHECK (guest_count > 0) | Số lượng khách đến dùng bữa |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | Trạng thái đơn: 'pending', 'confirmed', 'seated', 'completed', 'cancelled' |
| `special_requests`| TEXT | NULL | Ghi chú dị ứng, bàn tiệc sinh nhật, hoa tươi |
| `deposit_amount` | NUMERIC(12,2)| DEFAULT 0.00 | Tiền đặt cọc giữ bàn (VNĐ) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời điểm nộp đơn đặt bàn |

### 3.3.4. Bảng `menu_categories`
Quản lý các danh mục phân loại thực đơn.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(50) | PRIMARY KEY | Mã danh mục ('appetizers', 'main_courses', 'desserts', 'wines') |
| `name` | VARCHAR(100) | NOT NULL | Tên danh mục hiển thị ("Món Khai Vị Pháp", "Rượu Vang Đỏ") |
| `display_order` | INTEGER | DEFAULT 1 | Thứ tự ưu tiên sắp xếp trên giao diện thực đơn |

### 3.3.5. Bảng `menu_items`
Lưu trữ danh sách món ăn, đồ uống và giá bán niêm yết.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY | Mã số định danh món ăn |
| `category_id` | VARCHAR(50) | FK -> `menu_categories(id)` | Khóa ngoại trỏ đến danh mục phân loại |
| `name` | VARCHAR(150) | NOT NULL | Tên món ăn (Ví dụ: "Bò Wagyu A5 sốt nấm Truffle") |
| `description` | TEXT | NULL | Mô tả hương vị, nguyên liệu xuất xứ |
| `price` | NUMERIC(12,2)| NOT NULL, CHECK (price >= 0) | Đơn giá niêm yết (VNĐ) |
| `image_url` | VARCHAR(255) | NULL | Đường dẫn hình ảnh chất lượng cao của món ăn |
| `is_available` | BOOLEAN | DEFAULT TRUE | Cờ báo còn món hay đã hết hàng trong ngày |

### 3.3.6. Bảng `pre_orders`
Lưu trữ các món ăn được khách hàng chọn đặt trước theo đơn đặt bàn.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(64) | PRIMARY KEY | Mã bản ghi món đặt trước |
| `reservation_id` | VARCHAR(64) | FK -> `reservations(id)` | Đơn đặt bàn tương ứng |
| `menu_item_id` | INTEGER | FK -> `menu_items(id)` | Món ăn được chọn |
| `quantity` | INTEGER | NOT NULL, CHECK (quantity > 0) | Số lượng phần ăn đặt trước |
| `note` | VARCHAR(255) | NULL | Ghi chú cách chế biến (VD: "Chín vừa Medium-rare") |

### 3.3.7. Bảng `table_service_requests`
Quản lý chuông yêu cầu dịch vụ tự phục vụ tại bàn qua mã QR.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(64) | PRIMARY KEY | Mã yêu cầu phục vụ |
| `table_id` | INTEGER | FK -> `tables(id)` | Bàn phát sinh yêu cầu |
| `request_type` | VARCHAR(30) | NOT NULL | Loại yêu cầu: 'refill_water', 'call_waiter', 'request_bill', 'add_order' |
| `note` | VARCHAR(255) | NULL | Ghi chú thêm của khách tại bàn |
| `status` | VARCHAR(20) | DEFAULT 'pending' | Trạng thái: 'pending', 'in_progress', 'resolved' |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời điểm khách gửi yêu cầu |

### 3.3.8. Bảng `email_logs`
Nhật ký kiểm toán hệ thống thông báo email và thông điệp tự động.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(64) | PRIMARY KEY | Mã bản ghi log email |
| `to_address` | VARCHAR(120) | NOT NULL | Địa chỉ hòm thư người nhận |
| `subject` | VARCHAR(255) | NOT NULL | Tiêu đề thông báo |
| `type` | VARCHAR(30) | NOT NULL | Loại thông báo: 'booking_confirmation', 'status_update', 'table_service', 'feedback' |
| `payload` | JSONB | NULL | Dữ liệu chi tiết đính kèm thông báo |
| `sent_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời điểm gửi thành công |

### 3.3.9. Bảng `reviews`
Quản lý đánh giá và phản hồi của thực khách sau trải nghiệm.

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(64) | PRIMARY KEY | Mã đánh giá |
| `reservation_id` | VARCHAR(64) | FK -> `reservations(id)` | Đơn đặt bàn được đánh giá |
| `customer_name` | VARCHAR(150) | NOT NULL | Tên người nhận xét |
| `rating` | INTEGER | NOT NULL, CHECK (rating BETWEEN 1 AND 5) | Điểm số đánh giá từ 1 đến 5 sao |
| `comment` | TEXT | NULL | Nội dung nhận xét, góp ý món ăn và phục vụ |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Thời điểm gửi đánh giá |

---

# 4. Functional Requirements (Yêu cầu chức năng chi tiết)

## 4.1. Unregistered User (Khách vãng lai / Khách chưa đăng nhập)

### 4.1.1. Tra cứu đơn đặt bàn bằng Số điện thoại / Mã Booking Code
- **Mã chức năng:** `FR-UNREG-01`
- **Mô tả:** Cho phép khách hàng chưa đăng nhập tra cứu toàn bộ đơn đặt bàn hiện có của mình bằng số điện thoại liên hệ hoặc mã đặt bàn đã được cấp.
- **Tác tử:** Unregistered User, Member.
- **Tiền điều kiện:** Người dùng truy cập trang chủ hoặc modal Tra cứu.
- **Luồng sự kiện chính (Main Flow):**
  1. Người dùng bấm nút "Tra Cứu Đặt Bàn" trên Navbar.
  2. Hệ thống hiển thị hộp thoại tìm kiếm yêu cầu nhập Số điện thoại hoặc Mã Booking Code.
  3. Người dùng nhập số điện thoại (Ví dụ: `0901234567`) và nhấn "Tìm Kiếm".
  4. Hệ thống kiểm tra tính hợp lệ cú pháp của số điện thoại (từ 9 đến 11 chữ số, không chứa chữ cái hoặc ký tự đặc biệt).
  5. Hệ thống gửi yêu cầu `POST /api/reservations/lookup` tới backend.
  6. Backend truy vấn và trả về danh sách các đơn đặt bàn có số điện thoại tương ứng.
  7. Hệ thống hiển thị danh sách đơn kèm mã booking, ngày giờ, số khách, bàn và trạng thái hiện tại (`pending`, `confirmed`, `seated`,...).
- **Luồng thay thế (Alternative Flows):**
  - *A1 - Tra cứu bằng Mã Booking:* Người dùng nhập mã `LGB-84920`. Hệ thống lọc chính xác đơn duy nhất có mã này.
  - *A2 - Không có đơn đặt nào:* Nếu số điện thoại chưa từng đặt bàn, hệ thống hiển thị thông báo thân thiện: "Không tìm thấy đơn đặt bàn nào với số điện thoại này. Quý khách vui lòng kiểm tra lại hoặc tạo đơn đặt mới!".
- **Luồng ngoại lệ (Exception Flows):**
  - *E1 - Bỏ trống trường tra cứu:* Hệ thống hiển thị cảnh báo viền đỏ "Vui lòng nhập số điện thoại để tra cứu!".
  - *E2 - Tấn công SQL Injection:* Người dùng nhập payload `' OR '1'='1`. Backend áp dụng Prepared Statement/Parameterized Query, trả về kết quả rỗng, không làm lộ dữ liệu của các khách hàng khác (Đáp ứng kiểm thử an ninh TC-89, TC-90).

### 4.1.2. Xem chi tiết thông tin đơn đặt bàn & trạng thái
- **Mã chức năng:** `FR-UNREG-02`
- **Mô tả:** Hiển thị thẻ chi tiết đầy đủ của đơn đặt bàn được chọn sau khi tra cứu thành công.
- **Dữ liệu hiển thị:** Mã Booking Code, Tên khách hàng, Số điện thoại, Email, Số khách, Tên bàn ăn và khu vực, Ngày giờ dùng bữa, Trạng thái đơn, Danh sách món ăn đặt trước và tiền cọc nếu có.

### 4.1.3. Xem thực đơn công khai & giá niêm yết
- **Mã chức năng:** `FR-UNREG-03`
- **Mô tả:** Khách vãng lai có thể tự do xem toàn bộ thực đơn ẩm thực Pháp của nhà hàng mà không bắt buộc phải đặt bàn trước hoặc đăng nhập.
- **Tiêu chí:** Tải danh sách danh mục (Khai vị, Món chính, Tráng miệng, Rượu vang), hình ảnh sắc nét, giá bán niêm yết rõ ràng bằng VNĐ và trạng thái còn món.

### 4.1.4. Thực hiện Đặt Bàn Trực Tuyến (Online Booking Flow)
- **Mã chức năng:** `FR-UNREG-04`
- **Mô tả:** Quy trình đặt bàn 4 bước trực quan giúp khách hàng chọn ngày giờ, kiểm tra bàn trống, chọn món ăn và hoàn tất xác nhận.
- **Các bước thực hiện:**
  - **Bước 1 (Chọn thời gian & Số khách):** Người dùng chọn Ngày đặt (không được chọn ngày quá khứ), Khung giờ (trong giờ mở cửa 10:00 - 22:30), Số lượng khách (tối thiểu 1 khách).
  - **Bước 2 (Kiểm tra bàn trống & Chọn bàn):** Hệ thống gọi API `GET /api/tables/availability` để hiển thị các bàn có sức chứa phù hợp và còn trống trong khung giờ ăn 120 phút.
  - **Bước 3 (Chọn món đặt trước - Không bắt buộc):** Khách hàng có thể chọn trước các món đặc biệt (như Bò Wagyu A5, Tôm hùm bỏ lò, Rượu vang Bordeaux).
  - **Bước 4 (Thông tin liên hệ & Gửi đơn):** Nhập Họ tên, Số điện thoại (bắt buộc), Email, Ghi chú đặc biệt.

#### 4.1.4.1. Xác nhận và Nộp đơn đặt bàn (Submit Reservation)
- **Quy tắc kiểm tra hợp lệ đầu vào (Input Validation Rules):**
  - `customerName`: Không được để trống, độ dài từ 2 đến 100 ký tự. Hỗ trợ Unicode Tiếng Việt có dấu và Emoji (TC-45). Khử độc mã độc XSS Script (TC-34).
  - `customerPhone`: Bắt buộc, chỉ gồm chữ số, độ dài từ 9 đến 11 số (TC-36, TC-37, TC-38).
  - `customerEmail`: Nếu nhập phải đúng cú pháp RFC 5322 (chứa `@` và tên miền hợp lệ) (TC-40).
  - `guestCount`: Số nguyên dương >= 1 và nhỏ hơn hoặc bằng sức chứa tối đa của bàn được chọn (TC-41).
  - `bookingDate`: Không được nằm trong quá khứ so với thời điểm gửi đơn (TC-42).
- **Phản hồi hệ thống:** Khi đặt thành công, hệ thống trả về mã `201 Created` kèm đối tượng JSON chứa mã `bookingCode`, trạng thái ban đầu luôn là `pending`, đồng thời kích hoạt gửi email xác nhận.

#### 4.1.4.2. Chọn món đặt trước (Pre-order Menu Integration)
- Cho phép khách chọn số lượng từng món.
- Số lượng mỗi món phải là số nguyên dương >= 1 (TC-58, TC-59).
- Hệ thống tự động tính toán tổng tiền tạm tính và cập nhật hiển thị theo thời gian thực.

### 4.1.5. Yêu cầu phục vụ tại bàn qua mã QR bàn (Table Self-Service)
- **Mã chức năng:** `FR-UNREG-05`
- **Mô tả:** Thực khách khi đã ngồi tại bàn có thể sử dụng điện thoại quét mã QR dán tại bàn để mở giao diện tự phục vụ:
  - Bấm nút "Gọi Nước / Châm Thêm Nước Lọc"
  - Bấm nút "Gọi Nhân Viên Phục Vụ Tại Bàn"
  - Bấm nút "Yêu Cầu Thanh Toán / Hóa Đơn" (Tùy chọn: Tiền mặt hoặc Chuyển khoản QR)
  - Góp ý trực tiếp về độ chín/vị mặn ngọt của món ăn gửi thẳng tới bếp trưởng.
- **Tiêu chí bảo mật:** Lọc bỏ mã độc XSS trong ghi chú tại bàn (TC-82).

---

## 4.2. Member (Khách hàng thành viên)

### 4.2.1. Đăng ký & Đăng nhập (Authentication)
- **Mã chức năng:** `FR-MEM-01`
- **Mô tả:** Đăng ký tài khoản thành viên mới hoặc đăng nhập vào hệ thống để hưởng đặc quyền VIP.
- **Đặc tả API:**
  - `POST /api/users` (Đăng ký): Yêu cầu Họ tên, Email hợp lệ, Mật khẩu tối thiểu 6 ký tự. Kiểm tra chống trùng email (TC-12). Trả về mã JWT Token.
  - `POST /api/auth/login` (Đăng nhập): Yêu cầu Email và Password. Nếu sai thông tin, trả về `401 Unauthorized` (TC-15, TC-16). Nếu đúng, cấp phát JWT Token chứa payload `{ id, email, role }` có hạn sử dụng 7 ngày.

### 4.2.2. Trang chủ thành viên (Member Dashboard)
- **Mã chức năng:** `FR-MEM-02`
- **Mô tả:** Hiển thị thẻ thành viên điện tử (Thành viên Bạc/Vàng/Kim Cương), tổng số điểm thưởng loyalty đã tích lũy, số đơn đặt bàn sắp tới và lối tắt xem các món ăn yêu thích.

### 4.2.3. Đăng xuất (Logout)
- **Mã chức năng:** `FR-MEM-03`
- **Mô tả:** Xóa token xác thực khỏi LocalStorage/Cookie của trình duyệt, đưa người dùng về trạng thái Khách vãng lai an toàn.

### 4.2.4. Xem & Cập nhật Hồ sơ cá nhân (View Profile)
- **Mã chức năng:** `FR-MEM-04`
- **Mô tả:** Khách hàng có thể xem thông tin cá nhân và cập nhật số điện thoại, ngày sinh để nhận ưu đãi sinh nhật.
- **Ràng buộc an ninh:** Khách hàng không được phép tự ý thay đổi trường `role` của mình thành `admin` (Chống tấn công Privilege Escalation - TC-19). Không cho phép sửa đổi hồ sơ của user khác (Chống IDOR - TC-21).

### 4.2.5. Xem danh sách Lịch sử Đặt Bàn đã tham gia
- **Mã chức năng:** `FR-MEM-05`
- **Mô tả:** Hiển thị toàn bộ các đơn đặt bàn mà khách hàng đã từng thực hiện trong quá khứ và các đơn sắp tới.
#### 4.2.5.1. Filter lịch sử đơn
- Lọc theo trạng thái: Tất cả, Đang chờ duyệt (`pending`), Đã xác nhận (`confirmed`), Đã dùng bữa (`completed`), Đã hủy (`cancelled`).
#### 4.2.5.2. Search lịch sử đơn
- Tìm kiếm theo Mã Booking Code hoặc Tên món ăn đã đặt trước.
#### 4.2.5.3. Sort lịch sử đơn
- Sắp xếp theo ngày dùng bữa (Mới nhất trước hoặc Cũ nhất trước).

### 4.2.6. Đánh giá trải nghiệm sau bữa ăn & Chấm điểm dịch vụ
- **Mã chức năng:** `FR-MEM-06`
- **Mô tả:** Cho phép khách hàng đã hoàn tất bữa ăn (trạng thái đơn = `completed`) gửi đánh giá chất lượng dịch vụ nhà hàng.
#### 4.2.6.1. Xem danh sách bữa ăn đủ điều kiện đánh giá
- Chỉ hiển thị nút "Viết Đánh Giá" cho các đơn đặt đã có trạng thái `completed`.
#### 4.2.6.2. Chấm điểm sao & Viết nhận xét
- Đánh giá từ 1 đến 5 sao (Ràng buộc: Bắt buộc chọn số sao, không được gửi số sao ngoài khoảng 1-5 hoặc số âm - TC-97, TC-98).
- Nhập bình luận nhận xét (Khử độc Stored XSS - TC-99).
#### 4.2.6.3. Submit đánh giá
- Lưu đánh giá vào hệ thống và cộng 50 điểm thưởng Loyalty vào tài khoản của khách hàng.

### 4.2.7. Xem thông báo & Nhật ký Email xác nhận
- **Mã chức năng:** `FR-MEM-07`
- **Mô tả:** Khách hàng có thể mở mục Thông báo để xem lại toàn bộ email xác nhận bàn, hóa đơn điện tử và các ưu đãi dành riêng cho mình.

### 4.2.8. Quản lý điểm thưởng tích lũy (Loyalty Points & Tiers)
- **Cơ chế tích điểm:** Mỗi 100,000 VNĐ chi tiêu tích lũy 10 điểm thưởng.
- **Hạng thành viên:**
  - *Hạng Đồng (Bronze):* 0 - 499 điểm (Ưu đãi tiêu chuẩn).
  - *Hạng Bạc (Silver):* 500 - 1,499 điểm (Tặng món tráng miệng sinh nhật).
  - *Hạng Vàng (Gold):* 1,500 - 2,999 điểm (Giảm 5% hóa đơn + Ưu tiên giữ bàn VIP).
  - *Hạng Kim Cương (Diamond):* Trên 3,000 điểm (Giảm 10% hóa đơn + Quản lý bàn tiệc riêng).

---

## 4.3. Admin (Quản trị viên hệ thống)

### 4.3.1. Quản lý Tài Khoản Người Dùng
- **Mã chức năng:** `FR-ADM-01`
- **Mô tả:** Xem và quản lý toàn bộ cơ sở dữ liệu người dùng của hệ thống.
- **Yêu cầu phân quyền:** Chỉ tài khoản có `role = 'admin'` mới có quyền truy cập endpoint `GET /api/users` (TC-17, TC-94).
#### 4.3.1.1. Hiển thị danh sách tài khoản (Sort/Search/Filter)
- Tìm kiếm tài khoản theo tên hoặc email.
- Lọc theo vai trò: Khách hàng, Nhân viên, Quản lý.
- Sắp xếp theo ngày tạo hoặc điểm thưởng.
#### 4.3.1.2. Tạo tài khoản nhân viên / quản lý
- Quản trị viên có thể tạo trực tiếp tài khoản công vụ cho nhân viên phục vụ mới mà không cần quy trình xác thực email ngoài.
#### 4.3.1.3. Khóa / Mở khóa tài khoản
- Vô hiệu hóa quyền đăng nhập của tài khoản vi phạm chính sách nhà hàng.

### 4.3.2. Xem chi tiết Profile người dùng & phân quyền RBAC
- **Mã chức năng:** `FR-ADM-02`
- **Mô tả:** Hiển thị chi tiết quyền hạn của từng tài khoản theo bảng ma trận phân quyền RBAC.

### 4.3.3. Quản lý Nhóm Tài Khoản & Vai Trò (Roles & Permissions)
- **Mô hình phân quyền:**
  - `admin`: Quyền tối cao (Toàn quyền hệ thống, sửa menu, đổi cấu hình bàn, xem doanh thu).
  - `staff`: Quyền nhân viên (Xem sơ đồ bàn, đổi trạng thái đơn đặt, xác nhận khách đến bàn, tiếp nhận yêu cầu gọi phục vụ).
  - `customer`: Quyền khách hàng (Chỉ quản lý đơn đặt của bản thân, xem menu, đánh giá món).

### 4.3.4. Cấu hình thông số vận hành nhà hàng
- Cấu hình khung giờ mở cửa tiếp nhận đặt bàn (Mặc định: 10:00 - 22:30).
- Cấu hình thời gian dùng bữa trung bình cho mỗi lượt khách (Mặc định: 120 phút).
- Cấu hình tỷ lệ tiền đặt cọc giữ bàn cho tiệc đoàn (Mặc định: 20% cho tiệc từ 6 khách trở lên).

---

## 4.4. System (Tác tử Hệ thống tự động)

### 4.4.1. Thuật toán kiểm tra xung đột trùng bàn (Conflict Detection Engine)
- **Mã chức năng:** `FR-SYS-01`
- **Mô tả:** Đây là trái tim của hệ thống đặt bàn, đảm bảo không bao giờ xảy ra tình trạng đặt trùng chỗ (Overbooking).
- **Thuật toán xử lý:**
  1. Khi nhận yêu cầu đặt bàn tại Bàn `T` vào Ngày `D`, Giờ `H` (Thời lượng bữa ăn quy ước: 120 phút):
  2. Hệ thống quét toàn bộ các đơn đặt hiện có của Bàn `T` trong Ngày `D` có trạng thái khác `cancelled`.
  3. Kiểm tra điều kiện trùng lặp chính xác: Nếu đã có đơn lúc `H` -> **TỪ CHỐI VỚI HTTP 409 CONFLICT** (TC-49).
  4. Kiểm tra điều kiện giao thoa khoảng thời gian (Overlap Window): Khoảng cách giữa thời gian đặt mới và thời gian đơn hiện tại nhỏ hơn 90 phút -> **TỪ CHỐI VỚI HTTP 409 CONFLICT** (TC-50).
  5. Nếu thời gian đặt mới cách đơn cũ từ 120 phút trở lên (Ví dụ: Ca trước 19:00, ca sau 21:30) -> **CHẤP THUẬN VỚI HTTP 201 CREATED** (TC-51).
  6. Nếu cùng giờ 19:00 nhưng đặt ở Bàn khác còn trống -> **CHẤP THUẬN** (TC-52).

### 4.4.2. Tự động chuyển đổi máy trạng thái bàn (Automated State Transitions)
- **Mã chức năng:** `FR-SYS-02`
- **Mô tả:** Khi nhân viên cập nhật đơn đặt bàn sang trạng thái `seated`, hệ thống tự động đồng bộ đổi trạng thái bàn tương ứng sang `occupied`. Khi đơn chuyển sang `completed`, hệ thống tự động giải phóng bàn về `available` hoặc `cleaning`.

### 4.4.3. Quản lý thông báo và Hàng đợi gửi Email tự động
- **Mã chức năng:** `FR-SYS-03`
- **Mô tả:** Mỗi khi có sự kiện đặt bàn thành công, đổi trạng thái đơn hoặc phát sinh yêu cầu phục vụ, hệ thống ghi nhận một bản ghi vào bảng `email_logs` và thực hiện gửi thông báo tức thời tới khách hàng và nhân viên trực bàn.

### 4.4.4. Rate Limiting và Tường lửa chống tấn công DoS/Brute-force
- **Mã chức năng:** `FR-SYS-04`
- **Cấu hình giới hạn:**
  - Endpoint nhạy cảm Đăng nhập (`POST /api/auth/login`): Tối đa 5 lần thử sai trong 15 phút từ 1 địa chỉ IP. Vượt ngưỡng sẽ trả về mã `429 Too Many Requests`.
  - Endpoint công khai Đặt bàn (`POST /api/reservations`): Tối đa 30 requests trong 1 phút để ngăn chặn spam bot đặt ảo.
  - Endpoint chung: Tối đa 100 requests / 15 phút.

### 4.4.5. Cơ chế dọn dẹp môi trường kiểm thử Sandbox API
- **Mã chức năng:** `FR-SYS-05`
- **Mô tả:** Cung cấp endpoint `POST /api/test/reset-sandbox` cho phép các kỹ sư kiểm thử (QA Tester) dọn dẹp sạch toàn bộ các đơn đặt bàn giả lập (bắt đầu bằng SĐT test 0900000... hoặc 09012345...) và đưa toàn bộ bàn ăn về trạng thái sẵn sàng để chạy lại chuỗi 100 test cases mà không ảnh hưởng tới dữ liệu sản xuất thật.

---

## 4.5. User Manager / Restaurant Manager (Quản lý Nhà Hàng & Nhân Viên)

### 4.5.1. Quản lý Thực Đơn Món Ăn (Menu Items Management)
- **Mã chức năng:** `FR-MGR-01`
#### 4.5.1.1. Hiển thị danh sách món ăn (Search, Filter, Sort)
- Tìm kiếm theo tên món ăn hoặc thành phần nguyên liệu.
- Lọc theo danh mục: Khai vị, Món chính, Tráng miệng, Rượu vang.
- Sắp xếp theo giá tiền (Tăng dần / Giảm dần) hoặc mức độ phổ biến.
#### 4.5.1.2. Tạo Tag ẩm thực
- Gán nhãn cho món: "Gluten-Free", "Vegetarian", "Signature Dish", "Chef Recommendation".
#### 4.5.1.3. Thêm mới món ăn
- Nhập đầy đủ Tên món, Danh mục, Đơn giá, Mô tả chi tiết, Đường dẫn hình ảnh.
- Xác thực: Đơn giá phải là số dương lớn hơn 0 (TC-03).
#### 4.5.1.4. Import danh sách món ăn từ file Excel/JSON
- Cho phép bộ phận bếp tải lên file bảng giá thực đơn định kỳ theo mùa.
#### 4.5.1.5. Xem chi tiết món ăn & nguyên liệu
- Xem thông tin thành phần, định lượng phục vụ và cảnh báo dị ứng.
#### 4.5.1.6. Cập nhật món ăn
- Điều chỉnh giá bán hoặc nội dung mô tả món.
#### 4.5.1.7. Bật/Tắt trạng thái phục vụ (isAvailable) và Xóa món ăn
- Chỉ với 1 click, nhân viên có thể chuyển cờ `isAvailable` thành `false` khi nhà bếp thông báo hết nguyên liệu tươi trong ngày (TC-65).

### 4.5.2. Quản lý Danh Mục Thực Đơn (Category Management)
- **Mã chức năng:** `FR-MGR-02`
- Quản trị viên có thể Thêm, Sửa tên hiển thị, Sắp xếp thứ tự ưu tiên hoặc Xóa các danh mục món ăn trên giao diện.

### 4.5.3. Quản lý Sơ Đồ Bàn và Khu Vực (Table & Area Management)
- **Mã chức năng:** `FR-MGR-03`
#### 4.5.3.1. Thêm Bàn mới
- Nhập Số bàn, Sức chứa chỗ ngồi (từ 2 đến 12 khách), Chọn khu vực (Tầng 1 Bistro, Tầng 2 Ban Công, Phòng VIP).
#### 4.5.3.2. Hiển thị danh sách bàn
- Hiển thị trực quan dưới dạng Thẻ Bàn (Table Cards) kèm màu sắc trực quan theo trạng thái: Xanh lá (Khả dụng), Vàng (Đã đặt trước), Đỏ (Đang có khách ngồi), Xám (Đang dọn dẹp).
#### 4.5.3.3. Cập nhật thông số bàn ăn
- Cập nhật sức chứa bàn hoặc chuyển bàn sang chế độ bảo trì `maintenance` (TC-75).
- Ràng buộc: Chỉ người có token Admin/Staff mới được phép cập nhật bàn (TC-76).

### 4.5.4. Quản lý Đơn Đặt Bàn và Ca Phục Vụ (Reservation & Shift Management)
- **Mã chức năng:** `FR-MGR-04`
#### 4.5.4.1. Tạo đơn đặt bàn tại quầy hoặc qua điện thoại (Manual Booking)
- Lễ tân nhà hàng có thể nhập đơn nhanh cho khách vãng lai bước vào quán (Walk-in Guests) hoặc khách gọi điện đặt bàn trước.
#### 4.5.4.2. Clone đơn đặt bàn (Tái sử dụng thông tin khách quen)
- Sao chép toàn bộ thông tin của khách hàng cũ sang một ngày giờ mới chỉ với 1 thao tác bấm nút.
#### 4.5.4.3. Hiển thị danh sách đơn đặt bàn theo ca trực
- Bộ lọc thông minh theo ngày hiện tại, tuần này hoặc tháng này.
- Hiển thị số lượng khách, tổng tiền cọc và tổng số món đặt trước.
#### 4.5.4.4. Chuyển trạng thái đơn đặt bàn
- Nhân viên thực hiện chuyển đổi trạng thái đơn phù hợp với thực tế đón tiếp khách:
  - Bấm "Xác Nhận" (`pending` -> `confirmed`) sau khi gọi điện thoại chốt lịch với khách.
  - Bấm "Nhận Bàn" (`confirmed` -> `seated`) khi khách bước vào nhà hàng.
  - Bấm "Thanh Toán & Hoàn Tất" (`seated` -> `completed`) khi khách tính tiền ra về.
  - Bấm "Hủy Đơn" (`pending`/`confirmed` -> `cancelled`) khi khách báo bận.
#### 4.5.4.5. Đổi bàn ăn khi khách yêu cầu
- Chuyển khách từ bàn này sang bàn khác nếu khách muốn đổi vị trí ngồi hoặc nhập đoàn đông hơn.
#### 4.5.4.6. Báo cáo & Thống Kê Nhà Hàng
- Xem biểu đồ doanh thu theo ngày, tuần, tháng.
- Thống kê tỷ lệ lấp đầy bàn ăn (Table Occupancy Rate).
- Xuất dữ liệu báo cáo ca trực định dạng file Excel / CSV.

---

# 5. Non-functional Requirements (Yêu cầu phi chức năng)

## 5.1. Usability (Tính khả dụng & Trải nghiệm người dùng)
- **Thiết kế giao diện:** Giao diện tối màu sang trọng (Dark Luxury Aesthetic) với tông màu vàng đồng (Amber/Gold) và đá đen núi lửa (Stone-950), phù hợp chuẩn nhận diện của nhà hàng ẩm thực Pháp cao cấp.
- **Tính đáp ứng (Responsive):** Tương thích 100% trên mọi kích thước màn hình: Desktop (1920x1080), Laptop (1366x768), Tablet iPad (1024x768) và Smartphone iOS/Android (375px - 430px).
- **Khả năng tiếp cận:** Độ tương phản chữ và nền đạt chuẩn WCAG 2.1 Level AA (tối thiểu 4.5:1).
- **Thời gian làm quen:** Nhân viên phục vụ mới có thể nắm vững quy trình xếp bàn và đổi trạng thái trong vòng dưới 15 phút hướng dẫn.

## 5.2. Reliability (Độ tin cậy & Tính sẵn sàng)
- **Độ sẵn sàng (Availability):** Cam kết tỷ lệ hoạt động (Uptime) đạt tối thiểu **99.9%** (tối đa thời gian ngừng hoạt động không quá 8.76 giờ trong cả năm).
- **Tính toàn vẹn dữ liệu (Data Integrity):** Áp dụng Database Transaction cho các thao tác đặt bàn và chuyển trạng thái để đảm bảo nguyên tử (ACID), triệt tiêu hoàn toàn khả năng 2 khách đặt trùng 1 bàn trong cùng 1 giây.
- **Tính lũy đẳng (Idempotency):** Các API cập nhật trạng thái bàn và thanh toán bảo đảm tính lũy đẳng (gửi trùng request nhiều lần vẫn cho ra cùng một trạng thái nhất quán, không phát sinh đơn trùng - TC-77).

## 5.3. Performance (Hiệu năng hệ thống & Tốc độ phản hồi)
- **Thời gian phản hồi API (API Response Time):**
  - Tối thiểu 95% số request truy vấn (Read: Get tables, Get menu, Lookup) phản hồi trong thời gian **dưới 150ms**.
  - Tối thiểu 95% số request ghi (Write: Create booking, Login, Update status) phản hồi trong thời gian **dưới 300ms**.
- **Khả năng chịu tải đồng thời (Throughput & Concurrency):**
  - Hệ thống chịu tải tối thiểu **500 người dùng truy cập đồng thời** (Concurrent Users) trong các khung giờ cao điểm (11:30 - 13:00 và 18:00 - 20:30) mà không suy giảm hiệu năng.

## 5.4. Supportability & Maintainability (Khả năng bảo trì & Mở rộng)
- **Kiến trúc Modular:** Mã nguồn chia tách rõ ràng thành các Controller, Service, Repository độc lập.
- **Mã nguồn TypeScript:** Toàn bộ dự án sử dụng TypeScript nghiêm ngặt (`strict: true`), không sử dụng kiểu dữ liệu `any` bừa bãi, đảm bảo phát hiện lỗi tại thời điểm biên dịch (Compile-time type checking).
- **Hệ thống Kiểm Thử Tự Động Riêng Biệt:** Tích hợp bộ **Automation Test Suite 100 Test Cases** độc lập giúp kiểm tra hồi quy (Regression Testing) toàn bộ hệ thống sau mỗi lần cập nhật tính năng mới chỉ với 1 click.

## 5.5. Design Constraints (Các ràng buộc thiết kế)
- Backend viết bằng **Node.js (Express.js)** với TypeScript.
- Frontend viết bằng **React 19**, đóng gói bằng **Vite**, định kiểu giao diện bằng **Tailwind CSS v4**.
- Cơ sở dữ liệu: **PostgreSQL** kết hợp **Drizzle ORM**.
- Định dạng truyền tải dữ liệu: Chuẩn **JSON over RESTful HTTPS**.

## 5.6. On-line User Documentation and Help System Requirements
- Hệ thống tích hợp tài liệu hướng dẫn nhanh trực tiếp trên giao diện:
  - Tooltip giải thích trạng thái bàn và các bước đặt bàn.
  - Hướng dẫn cấu hình URL máy chủ và hướng dẫn chạy automation test trong file `automation-test-suite/README.md`.

## 5.7. Purchased Components (Các thành phần bên thứ ba)
- Thư viện biểu tượng: `lucide-react`.
- Thư viện mã hóa mật khẩu: `bcryptjs`.
- Thư viện JSON Web Token: `jsonwebtoken`.
- Thư viện sinh mã QR: `qrcode`.
- Thư viện kiểm soát tần suất: `express-rate-limit`.

## 5.8. Interfaces (Giao diện tích hợp)

### 5.8.1. User Interfaces (UI)
- Giao diện Cổng Khách Hàng (Customer Booking Portal).
- Giao diện Bảng Điều Khiển Quản Trị & Sơ Đồ Bàn (Admin POS & Floor Plan).
- Giao diện Tự Phục Vụ Tại Bàn qua Mã QR (Table Service Mobile Interface).
- Giao diện Hệ Thống Kiểm Thử Tự Động Độc Lập (Automation Test Hub UI tại `/automation`).

### 5.8.2. Hardware Interfaces
- Tương thích các dòng máy POS cảm ứng tại quầy thu ngân (Màn hình cảm ứng đa điểm 15-inch trở lên).
- Tương thích máy tính bảng iPad/Android của nhân viên order tại bàn.
- Tương thích camera quét mã QR của mọi dòng điện thoại thông minh hiện đại.

### 5.8.3. Software Interfaces (RESTful API)
Toàn bộ hệ thống giao tiếp qua các RESTful API endpoints tiêu chuẩn:
- `GET /api/health`: Kiểm tra sức khỏe máy chủ.
- `GET /api/menu`: Tải danh sách món ăn và danh mục.
- `POST /api/auth/login`: Xác thực đăng nhập, cấp JWT Token.
- `GET /api/auth/me`: Lấy thông tin hồ sơ người dùng đang đăng nhập.
- `GET /api/tables`: Lấy danh sách toàn bộ sơ đồ bàn ăn.
- `GET /api/tables/availability`: Tra cứu bàn trống theo ngày, giờ và số khách.
- `POST /api/reservations`: Tạo mới đơn đặt bàn trực tuyến.
- `POST /api/reservations/lookup`: Tra cứu lịch sử đơn đặt theo SĐT.
- `PATCH /api/reservations/:id/status`: Cập nhật trạng thái đơn đặt bàn.
- `PUT /api/tables/:id`: Cập nhật cấu hình và trạng thái bàn ăn (Admin).
- `GET /api/email-logs`: Truy vấn nhật ký thông báo email gửi đi.
- `POST /api/test/reset-sandbox`: Reset dữ liệu kiểm thử phục vụ automation test.

### 5.8.4. Communications Interfaces
- Giao thức truyền thông bắt buộc: **HTTPS (TLS 1.3)** mã hóa toàn bộ dữ liệu trên đường truyền.
- Giao thức truyền thông thời gian thực: WebSockets / Polling phục vụ cập nhật trạng thái sơ đồ bàn tức thời.

## 5.9. Environment (Môi trường vận hành)

### 5.9.1. Target Environment (Môi trường Production)
- Hệ điều hành máy chủ: Linux (Ubuntu 22.04 LTS / Debian 12) hoặc Container Docker Alpine.
- Node.js Runtime: Phiên bản LTS 20.x hoặc 22.x.
- Web Server / Reverse Proxy: Nginx hoặc Google Cloud Run / Cloud Load Balancer.

### 5.9.2. Development Environment (Môi trường Phát triển)
- Trình thông dịch: Node.js v20+, npm v10+.
- Trình chạy TypeScript: `tsx` (TypeScript Execute).
- Trình biên dịch: `vite` v8.x, `tailwindcss` v4.x.

### 5.9.3. Database Requirements
- PostgreSQL 15.x trở lên với encoding UTF-8, timezone cấu hình chuẩn `Asia/Ho_Chi_Minh` (GMT+7).

## 5.10. Licensing Requirements (Yêu cầu bản quyền & Giấy phép)
- Toàn bộ mã nguồn thuộc sở hữu độc quyền của thương hiệu **Le Gourmet Bistro**.
- Các thư viện mã nguồn mở sử dụng đều tuân thủ giấy phép MIT hoặc Apache 2.0.

## 5.11. Legal, Copyright, and Other Notices
- Tuân thủ quy định bảo vệ dữ liệu cá nhân Nghị định 13/2023/NĐ-CP của Chính phủ Việt Nam: Không chia sẻ số điện thoại và lịch sử tiêu dùng của thực khách cho bất kỳ bên thứ ba nào.
- Mọi dữ liệu mật khẩu người dùng phải được băm một chiều bằng thuật toán an toàn trước khi lưu vào cơ sở dữ liệu.

## 5.12. Applicable Standards (Các tiêu chuẩn kỹ thuật áp dụng)
- Tiêu chuẩn thiết kế REST API: REST Maturity Model Level 2 / Level 3.
- Tiêu chuẩn mã hóa: SHA-256, Bcrypt, JWT HMAC-SHA256.
- Tiêu chuẩn quy trình kiểm thử: ISTQB Standard for Test Case Specification.

---

# 6. Appendix (Phụ lục)

### Phụ Lục A: Ma Trận Phân Quyền Vai Trò (RBAC Permission Matrix)

| Chức Năng Nghiệp Vụ | Khách Vãng Lai (Unregistered) | Khách Thành Viên (Member) | Nhân Viên (Staff) | Quản Trị Viên (Admin) |
| :--- | :---: | :---: | :---: | :---: |
| Xem thực đơn công khai | ✅ Có | ✅ Có | ✅ Có | ✅ Có |
| Tra cứu đơn đặt bằng SĐT | ✅ Có | ✅ Có | ✅ Có | ✅ Có |
| Đặt bàn trực tuyến | ✅ Có | ✅ Có | ✅ Có | ✅ Có |
| Gọi phục vụ qua QR tại bàn | ✅ Có | ✅ Có | ✅ Có | ✅ Có |
| Quản lý lịch sử đặt bàn cá nhân | ❌ Không | ✅ Có | ✅ Có | ✅ Có |
| Đánh giá 5 sao sau bữa ăn | ❌ Không | ✅ Có | ❌ Không | ❌ Không |
| Tích điểm thành viên VIP | ❌ Không | ✅ Có | ❌ Không | ❌ Không |
| Xem sơ đồ bàn thời gian thực | ❌ Không | ❌ Không | ✅ Có | ✅ Có |
| Duyệt đơn / Xếp bàn Seated | ❌ Không | ❌ Không | ✅ Có | ✅ Có |
| Thêm / Sửa / Xóa món ăn | ❌ Không | ❌ Không | ❌ Không | ✅ Có |
| Đổi cấu hình sức chứa bàn | ❌ Không | ❌ Không | ❌ Không | ✅ Có |
| Quản lý tài khoản người dùng | ❌ Không | ❌ Không | ❌ Không | ✅ Có |
| Xem báo cáo doanh thu tài chính | ❌ Không | ❌ Không | ❌ Không | ✅ Có |

### Phụ Lục B: Bảng Ánh Xạ Mã Lỗi HTTP Chuẩn Hệ Thống

| Mã HTTP | Tên Mã Lỗi | Tình Huống Kích Hoạt Trong Hệ Thống |
| :--- | :--- | :--- |
| **200 OK** | Thành công | Truy vấn danh sách bàn, menu, tra cứu đơn thành công. |
| **201 Created** | Tạo mới thành công | Tạo đơn đặt bàn mới, đăng ký tài khoản mới thành công. |
| **400 Bad Request** | Yêu cầu không hợp lệ | Thiếu trường bắt buộc, sai cú pháp SĐT/email, chuyển trạng thái phi logic. |
| **401 Unauthorized** | Chưa xác thực | Không gửi kèm Bearer Token khi truy cập endpoint quản trị. |
| **403 Forbidden** | Không có quyền hạn | Khách hàng cố tình gọi API dành riêng cho quản trị viên (Admin). |
| **404 Not Found** | Không tìm thấy | Gọi mã đơn đặt bàn hoặc mã bàn ăn không tồn tại trong hệ thống. |
| **409 Conflict** | Xung đột tài nguyên | Đặt trùng bàn đã có khách khác đặt trước trong cùng khung giờ phục vụ. |
| **413 Payload Too Large** | Tải trọng quá lớn | Gửi body request vượt giới hạn kích thước cho phép. |
| **429 Too Many Requests** | Quá số lần thử | Gửi request đăng nhập hoặc đặt bàn vượt ngưỡng rate limit. |
| **500 Server Error** | Lỗi nội bộ máy chủ | Lỗi cơ sở dữ liệu không mong muốn (Cần ghi log và khắc phục). |

---

# 7. Wiki & Glossary (Thuật ngữ chuyên ngành)

1. **SRS (Software Requirements Specification)**: Tài liệu đặc tả yêu cầu phần mềm chuẩn quốc tế định nghĩa toàn bộ tính năng và ràng buộc kỹ thuật của dự án.
2. **Actor (Tác tử)**: Bất kỳ đối tượng người dùng hoặc hệ thống bên ngoài nào tương tác trực tiếp với phần mềm.
3. **Use Case (Kịch bản sử dụng)**: Chuỗi hành động mà tác tử thực hiện với hệ thống để đạt được một mục tiêu cụ thể.
4. **RBAC (Role-Based Access Control)**: Mô hình quản lý phân quyền người dùng dựa trên vai trò công việc (Admin, Staff, Customer).
5. **Conflict Window (Cửa sổ xung đột)**: Khoảng thời gian đệm (90 đến 120 phút) được hệ thống bảo lưu cho mỗi lượt đặt bàn để thực khách thưởng thức trọn vẹn bữa ăn mà không bị gián đoạn.
6. **State Machine (Máy trạng thái hữu hạn)**: Mô hình toán học kiểm soát các trạng thái hợp lệ và quy tắc chuyển đổi trạng thái của đơn đặt bàn và bàn ăn vật lý.
7. **Idempotency (Tính lũy đẳng)**: Tính chất của API cho phép một request được gửi lặp lại nhiều lần mà vẫn tạo ra cùng một kết quả trên máy chủ như khi chỉ gửi 1 lần duy nhất.
8. **Pre-order**: Tính năng cho phép thực khách chọn món ăn và đồ uống ngay khi đặt bàn trước ngày đến nhà hàng.
9. **Booking Code**: Mã định danh ký tự ngắn gọn duy nhất (VD: `LGB-10492`) cấp cho khách hàng dùng để check-in hoặc tra cứu đơn.
10. **Walk-in Guest**: Khách hàng trực tiếp bước vào nhà hàng mà không đặt bàn trước qua mạng.
11. **Table Turnover**: Số lượt khách phục vụ trên một bàn ăn trong suốt một ca làm việc của nhà hàng.
12. **Bcrypt**: Hàm băm mật khẩu một chiều có muối (Salted Hash) đạt tiêu chuẩn bảo mật ngân hàng chống lại tấn công Rainbow Table.
