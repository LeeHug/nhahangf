import { RestaurantTable } from '../types';

export const EXPANDED_TABLES: RestaurantTable[] = [
  // ==========================================
  // Sảnh chính (Main Dining) - 15 bàn đa dạng
  // ==========================================
  { id: 'T-01', name: 'Bàn M-01 (Cửa kính phố)', area: 'main', capacity: 2, status: 'available', shape: 'round' },
  { id: 'T-02', name: 'Bàn M-02 (Trung tâm)', area: 'main', capacity: 4, status: 'occupied', currentReservationId: 'BK-1001', shape: 'rectangle' },
  { id: 'T-03', name: 'Bàn M-03 (Trung tâm)', area: 'main', capacity: 4, status: 'available', shape: 'rectangle' },
  { id: 'T-04', name: 'Bàn M-04 (Góc lãng mạn)', area: 'main', capacity: 2, status: 'reserved', currentReservationId: 'BK-1002', shape: 'round' },
  { id: 'T-05', name: 'Bàn M-05 (Gia đình)', area: 'main', capacity: 6, status: 'available', shape: 'rectangle' },
  { id: 'T-06', name: 'Bàn M-06 (Bàn tiệc lớn)', area: 'main', capacity: 10, status: 'available', shape: 'rectangle' },
  { id: 'T-07', name: 'Bàn M-07 (Cửa kính hoa)', area: 'main', capacity: 2, status: 'available', shape: 'round' },
  { id: 'T-08', name: 'Bàn M-08 (Hàng ghế đệm sofa)', area: 'main', capacity: 4, status: 'available', shape: 'rectangle' },
  { id: 'T-09', name: 'Bàn M-09 (Hàng ghế đệm sofa)', area: 'main', capacity: 4, status: 'available', shape: 'rectangle' },
  { id: 'T-10', name: 'Bàn M-10 (Gia đình mở rộng)', area: 'main', capacity: 8, status: 'available', shape: 'rectangle' },
  { id: 'T-31', name: 'Bàn M-11 (Góc Tranh Sơn Dầu Nghệ Thuật)', area: 'main', capacity: 4, status: 'available', shape: 'rectangle' },
  { id: 'T-32', name: 'Bàn M-12 (Quầy Chef’s Table Tương Tác)', area: 'main', capacity: 2, status: 'available', shape: 'round' },
  { id: 'T-33', name: 'Bàn M-13 (Bàn Tiệc Gia Đình Trung Tâm)', area: 'main', capacity: 6, status: 'available', shape: 'rectangle' },
  { id: 'T-34', name: 'Bàn M-14 (Cửa Kính Vòm Cổ Điển)', area: 'main', capacity: 2, status: 'available', shape: 'round' },
  { id: 'T-35', name: 'Bàn M-15 (Dãy Ghế Bành Nhung Xanh)', area: 'main', capacity: 4, status: 'available', shape: 'rectangle' },

  // ==========================================
  // Phòng VIP (VIP Luxury Suites) - 10 phòng VIP đẳng cấp
  // ==========================================
  { id: 'T-11', name: 'Phòng VIP Hoàng Gia', area: 'vip', capacity: 8, status: 'reserved', currentReservationId: 'BK-1003', shape: 'rectangle' },
  { id: 'T-12', name: 'Phòng VIP Hoa Sen Đại Tiệc', area: 'vip', capacity: 12, status: 'occupied', currentReservationId: 'BK-1004', shape: 'rectangle' },
  { id: 'T-13', name: 'Phòng VIP Ánh Dương', area: 'vip', capacity: 6, status: 'available', shape: 'round' },
  { id: 'T-14', name: 'Phòng VIP Khang Ninh', area: 'vip', capacity: 10, status: 'available', shape: 'rectangle' },
  { id: 'T-15', name: 'Phòng VIP Dạ Yến', area: 'vip', capacity: 14, status: 'available', shape: 'rectangle' },
  { id: 'T-16', name: 'Phòng VIP Thiên Thai', area: 'vip', capacity: 6, status: 'available', shape: 'round' },
  { id: 'T-36', name: 'Phòng VIP Kỳ Nam Trầm Hương', area: 'vip', capacity: 8, status: 'available', shape: 'rectangle' },
  { id: 'T-37', name: 'Phòng VIP Bạch Kim Ngoại Giao', area: 'vip', capacity: 16, status: 'available', shape: 'rectangle' },
  { id: 'T-38', name: 'Phòng VIP Bách Hợp Thư Giãn', area: 'vip', capacity: 6, status: 'available', shape: 'round' },
  { id: 'T-39', name: 'Phòng VIP Cung Đình Đại Yến', area: 'vip', capacity: 18, status: 'available', shape: 'rectangle' },

  // ==========================================
  // Sân vườn nhiệt đới (Garden Patio) - 12 bàn xanh mát
  // ==========================================
  { id: 'T-17', name: 'Bàn Vườn V-01 (Bên hồ cá Koi)', area: 'garden', capacity: 4, status: 'available', shape: 'round' },
  { id: 'T-18', name: 'Bàn Vườn V-02 (Dưới tán lộc vừng)', area: 'garden', capacity: 4, status: 'available', shape: 'rectangle' },
  { id: 'T-19', name: 'Bàn Vườn V-03 (Giàn hoa giấy cổ)', area: 'garden', capacity: 6, status: 'available', shape: 'rectangle' },
  { id: 'T-20', name: 'Bàn Vườn V-04 (Đài phun nước)', area: 'garden', capacity: 4, status: 'available', shape: 'round' },
  { id: 'T-21', name: 'Bàn Vườn V-05 (Góc tĩnh lặng)', area: 'garden', capacity: 2, status: 'available', shape: 'round' },
  { id: 'T-22', name: 'Bàn Vườn V-06 (Bàn tiệc BBQ ngoài trời)', area: 'garden', capacity: 8, status: 'available', shape: 'rectangle' },
  { id: 'T-23', name: 'Bàn Vườn V-07 (Lối đi ngập tràn hoa)', area: 'garden', capacity: 4, status: 'available', shape: 'rectangle' },
  { id: 'T-40', name: 'Bàn Vườn V-08 (Chòi Gỗ Thủy Tạ Mặt Hồ)', area: 'garden', capacity: 6, status: 'available', shape: 'round' },
  { id: 'T-41', name: 'Bàn Vườn V-09 (Tán Cây Bàng Vuông)', area: 'garden', capacity: 4, status: 'available', shape: 'rectangle' },
  { id: 'T-42', name: 'Bàn Vườn V-10 (Lối Đi Đèn Lồng Hội An)', area: 'garden', capacity: 2, status: 'available', shape: 'round' },
  { id: 'T-43', name: 'Bàn Vườn V-11 (Bàn Tiệc Rượu Sân Vườn)', area: 'garden', capacity: 8, status: 'available', shape: 'rectangle' },
  { id: 'T-44', name: 'Bàn Vườn V-12 (Vòm Hoa Hồng Leo Pháp)', area: 'garden', capacity: 4, status: 'available', shape: 'round' },

  // ==========================================
  // Ban công & Rooftop ngắm trời (Rooftop City View) - 11 bàn đắt giá
  // ==========================================
  { id: 'T-24', name: 'Rooftop R-01 (View Landmark 81)', area: 'rooftop', capacity: 2, status: 'occupied', currentReservationId: 'BK-1005', shape: 'round' },
  { id: 'T-25', name: 'Rooftop R-02 (Ngắm hoàng hôn)', area: 'rooftop', capacity: 2, status: 'available', shape: 'round' },
  { id: 'T-26', name: 'Rooftop R-03 (Lounge mở)', area: 'rooftop', capacity: 6, status: 'available', shape: 'rectangle' },
  { id: 'T-27', name: 'Rooftop R-04 (Cạnh quầy Bar cocktail)', area: 'rooftop', capacity: 2, status: 'available', shape: 'round' },
  { id: 'T-28', name: 'Rooftop R-05 (Ban công góc 360 độ)', area: 'rooftop', capacity: 4, status: 'available', shape: 'round' },
  { id: 'T-29', name: 'Rooftop R-06 (Bàn tiệc trăng sao)', area: 'rooftop', capacity: 8, status: 'available', shape: 'rectangle' },
  { id: 'T-30', name: 'Rooftop R-07 (Skyline VIP)', area: 'rooftop', capacity: 4, status: 'available', shape: 'round' },
  { id: 'T-45', name: 'Rooftop R-08 (Skyline Edge Kính Vô Cực)', area: 'rooftop', capacity: 2, status: 'available', shape: 'round' },
  { id: 'T-46', name: 'Rooftop R-09 (Khu Vực Sofa Sunset Lounge)', area: 'rooftop', capacity: 6, status: 'available', shape: 'rectangle' },
  { id: 'T-47', name: 'Rooftop R-10 (Góc Ngắm Pháo Hoa Sông Sài Gòn)', area: 'rooftop', capacity: 4, status: 'available', shape: 'round' },
  { id: 'T-48', name: 'Rooftop R-11 (Bàn Đại Tiệc Dưới Ánh Sao)', area: 'rooftop', capacity: 10, status: 'available', shape: 'rectangle' },
];
