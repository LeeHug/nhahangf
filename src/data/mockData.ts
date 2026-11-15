import { MenuItem, RestaurantTable, Reservation, SentEmailLog, UserAccount, UserVoucher, PointsTransaction } from '../types';
import { EXPANDED_TABLES } from './expandedTables';

export const MENU_ITEMS: MenuItem[] = [
  // Khai vị
  {
    id: 'm-01',
    name: 'Gỏi Bò Bóp Thấu Hạt Điều',
    category: 'appetizer',
    price: 185000,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    description: 'Thịt bò tơ mềm thái mỏng bóp cùng khế chua, chuối chát, rau thơm và hạt điều rang bùi béo giòn tan.',
    dietary: ['bestseller'],
    prepTimeMinutes: 15,
  },
  {
    id: 'm-02',
    name: 'Súp Hải Sản Nấm Bào Ngư',
    category: 'appetizer',
    price: 220000,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
    description: 'Nước dùng thanh ngọt hầm từ xương gà và hải sản tươi, nấm bào ngư hữu cơ bồi bổ sức khỏe.',
    dietary: ['gluten_free'],
    prepTimeMinutes: 20,
  },
  {
    id: 'm-03',
    name: 'Salad Rong Nho Trứng Cua Nhật',
    category: 'appetizer',
    price: 165000,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    description: 'Rong nho biển tươi giòn sần sật quyện xốt mè rang Nhật Bản đậm đà, phủ trứng cua óng ả.',
    dietary: ['vegetarian', 'bestseller'],
    prepTimeMinutes: 10,
  },

  // Món chính đặc sắc
  {
    id: 'm-04',
    name: 'Bò Wagyu Nướng Đá Muối Himalaya',
    category: 'main',
    price: 680000,
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    description: 'Bò Wagyu A5 vân mỡ cẩm thạch tuyệt hảo, nướng trực tiếp trên phiến đá muối hồng cổ đại giữ trọn vị mọng nước.',
    isChefSpecial: true,
    dietary: ['bestseller'],
    prepTimeMinutes: 25,
    meatDonenessRequired: true,
    winePairing: {
      recommendedWineName: 'Vang Đỏ Chateau Bordeaux Reserve',
      recommendedWineId: 'm-13',
      sommelierTastingNotes: 'Tannin mềm mượt êm dịu, vị chát đằm cắt giảm độ béo ngậy của vân mỡ cẩm thạch Wagyu.',
      glassPrice: 160000,
      bottlePrice: 890000,
    },
  },
  {
    id: 'm-05',
    name: 'Sườn Cừu Úc Đút Lò Thảo Mộc',
    category: 'main',
    price: 490000,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    description: 'Sườn cừu tươi hảo hạng tẩm ướp lá hương thảo, tỏi nướng và xốt vang đỏ nho đen sóng sánh.',
    isChefSpecial: true,
    prepTimeMinutes: 30,
    meatDonenessRequired: true,
    winePairing: {
      recommendedWineName: 'Vang Đỏ Chateau Bordeaux Reserve',
      recommendedWineId: 'm-13',
      sommelierTastingNotes: 'Hương quả mận và gỗ sồi Pháp tôn bật vị ngọt thơm của thịt cừu hảo hạng.',
      glassPrice: 160000,
      bottlePrice: 890000,
    },
  },

  {
    id: 'm-06',
    name: 'Gà Ta Nướng Mật Ong Rừng & Xôi Chiên Phồng',
    category: 'main',
    price: 350000,
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
    description: 'Gà đồi thả vườn da vàng óng tẩm mật ong hoa rừng Tây Bắc, ăn kèm xôi nếp nương chiên giòn.',
    prepTimeMinutes: 25,
  },

  // Hải sản
  {
    id: 'm-07',
    name: 'Tôm Hùm Bông Nướng Phô Mai Truffle',
    category: 'seafood',
    price: 950000,
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80',
    description: 'Tôm hùm Nha Trang tươi sống ngập thịt, đút lò cùng xốt phô mai Mozzarella béo ngậy và nấm truffle Ý.',
    isChefSpecial: true,
    dietary: ['bestseller'],
    prepTimeMinutes: 30,
    winePairing: {
      recommendedWineName: 'Champagne Dom Pérignon Vintage',
      recommendedWineId: 'm-23',
      sommelierTastingNotes: 'Bọt sủi li ti thanh khiết đánh thức trọn vẹn vị ngọt đậm đà của thịt tôm hùm đút lò.',
      bottlePrice: 1450000,
    },
  },

  {
    id: 'm-08',
    name: 'Cá Hồi Na Uy Áp Chảo Xốt Chanh Leo',
    category: 'seafood',
    price: 380000,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
    description: 'Phi lê cá hồi Na Uy da giòn rụm, thịt hồng mọng nước kết hợp xốt chanh leo nhiệt đới chua thanh dịu nhẹ.',
    dietary: ['gluten_free'],
    prepTimeMinutes: 20,
  },
  {
    id: 'm-09',
    name: 'Mực Trứng Hấp Gừng Hành Hoa',
    category: 'seafood',
    price: 290000,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
    description: 'Mực nháy Phú Quốc ôm trọn trứng béo ngậy, hấp chín tới cùng gừng tươi và hành hoa thơm nức mũi.',
    dietary: ['gluten_free'],
    prepTimeMinutes: 15,
  },

  // Tráng miệng
  {
    id: 'm-10',
    name: 'Panna Cotta Trái Cây Rừng & Hạt Chia',
    category: 'dessert',
    price: 95000,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
    description: 'Bánh kem sữa nấu mịn màng tan chảy trong miệng, rưới mứt quả mọng chua ngọt và hạt chia thanh mát.',
    dietary: ['vegetarian'],
    prepTimeMinutes: 10,
  },
  {
    id: 'm-11',
    name: 'Kem Cháy Creme Brulee Hương Vani Madagascar',
    category: 'dessert',
    price: 110000,
    image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=600&q=80',
    description: 'Lớp đường nâu khò giòn thơm phức bên trên lớp kem sữa trứng béo ngậy ủ hạt vani tự nhiên.',
    dietary: ['vegetarian', 'bestseller'],
    prepTimeMinutes: 10,
  },

  // Đồ uống & Rượu
  {
    id: 'm-12',
    name: 'Trà Lài Sen Vàng Macchiato',
    category: 'beverage',
    price: 75000,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
    description: 'Trà sen thơm dịu hòa quyện hạt sen bùi ngọt, phủ lớp kem macchiato béo mặn sánh mịn.',
    dietary: ['vegetarian'],
    prepTimeMinutes: 5,
  },
  {
    id: 'm-13',
    name: 'Vang Đỏ Chateau Bordeaux Reserve (Chai)',
    category: 'beverage',
    price: 890000,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
    description: 'Rượu vang đỏ xuất xứ Bordeaux nước Pháp, hậu vị chát êm nồng nàn hương gỗ sồi và quả mận chín.',
    dietary: ['bestseller'],
    prepTimeMinutes: 5,
  },
  {
    id: 'm-14',
    name: 'Nước Ép Lựu Đỏ & Bưởi Hồng Tươi',
    category: 'beverage',
    price: 80000,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80',
    description: 'Nước ép nguyên chất 100% không đường tinh luyện, giàu vitamin C và chất chống oxy hóa.',
    dietary: ['vegetarian', 'gluten_free'],
    prepTimeMinutes: 5,
  },

  // Món mới bổ sung đa dạng
  {
    id: 'm-15',
    name: 'Tartare Cá Hồi Na Uy & Trứng Cá Tầm Caviar',
    category: 'appetizer',
    price: 320000,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    description: 'Cá hồi tươi sashimi thái hạt lựu ướp dầu ô-liu chanh vàng, bơ sáp béo ngậy và phủ trứng cá tầm Black Caviar thượng hạng.',
    dietary: ['gluten_free', 'bestseller'],
    prepTimeMinutes: 12,
  },
  {
    id: 'm-16',
    name: 'Gan Ngỗng Pháp Áp Chảo Xốt Vang Port & Lê Chưng',
    category: 'appetizer',
    price: 360000,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    description: 'Gan ngỗng béo Foie Gras thượng hạng áp chảo giòn mặt tan mịn bên trong, hòa quyện xốt vang ngọt Port và lê chưng quế hồi.',
    isChefSpecial: true,
    prepTimeMinutes: 15,
    winePairing: {
      recommendedWineName: 'Vang Đỏ Chateau Bordeaux Reserve',
      recommendedWineId: 'm-13',
      sommelierTastingNotes: 'Sự đối trọng ngọt ngào và vị chát nhẹ làm dịu đi cảm giác béo bùi của gan ngỗng.',
      glassPrice: 160000,
      bottlePrice: 890000,
    },
  },
  {
    id: 'm-17',
    name: 'Thăn Ngoại Bò Black Angus Mỹ Xốt Tiêu Phú Quốc',
    category: 'main',
    price: 520000,
    image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=600&q=80',
    description: 'Bò Black Angus mọng nước áp chảo chín vừa (medium-rare), dùng kèm khoai tây nghiền xốt bơ tỏi và tiêu sọ ngào cay nồng.',
    dietary: ['bestseller'],
    prepTimeMinutes: 25,
    meatDonenessRequired: true,
    winePairing: {
      recommendedWineName: 'Vang Đỏ Chateau Bordeaux Reserve',
      recommendedWineId: 'm-13',
      sommelierTastingNotes: 'Vị chát tannin đằm thắm nâng tầm vị ngọt ngào béo ngậy của thịt thăn ngoại nướng.',
      glassPrice: 160000,
      bottlePrice: 890000,
    },
  },
  {
    id: 'm-18',
    name: 'Bồ Câu Pháp Đút Lò Xốt Nho Đen Pinot Noir',
    category: 'main',
    price: 460000,
    image: 'https://images.unsplash.com/photo-1514944298352-7b243468812c?auto=format&fit=crop&w=600&q=80',
    description: 'Chim bồ câu Pháp tuyển chọn quay da óng ả, thịt ngọt thơm đậm đà, xốt nho đen Pinot Noir thơm ngát.',
    isChefSpecial: true,
    prepTimeMinutes: 30,
  },
  {
    id: 'm-19',
    name: 'Cua Hoàng Đế Alaska Hấp Sake & Bơ Tỏi Đút Lò',
    category: 'seafood',
    price: 1850000,
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=600&q=80',
    description: 'Chân cua King Crab Alaska khổng lồ tươi ngọt tự nhiên, đút lò sốt bơ tỏi lá thyme béo ngậy và xốt ớt xanh chấm độc quyền.',
    isChefSpecial: true,
    dietary: ['bestseller'],
    prepTimeMinutes: 30,
    winePairing: {
      recommendedWineName: 'Champagne Dom Pérignon Vintage',
      recommendedWineId: 'm-23',
      sommelierTastingNotes: 'Sự kết hợp vương giả số 1 giữa Champagne sủi tăm Pháp và chân cua King Crab Alaska.',
      bottlePrice: 1450000,
    },
  },
  {
    id: 'm-20',
    name: 'Sò Điệp Nhật Hokkaido Áp Chảo Xốt Kem Truffle',
    category: 'seafood',
    price: 420000,
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80',
    description: 'Cồi sò điệp Hokkaido size đại áp chảo vàng óng hai mặt, thịt mềm ngọt mọng nước cùng xốt kem béo nấm Truffle đen.',
    dietary: ['gluten_free'],
    prepTimeMinutes: 15,
    winePairing: {
      recommendedWineName: 'Champagne Dom Pérignon Vintage',
      recommendedWineId: 'm-23',
      sommelierTastingNotes: 'Acid thanh nhẹ và vị khoáng chất tinh tế làm bừng sáng độ giòn ngọt của sò điệp.',
      bottlePrice: 1450000,
    },
  },

  {
    id: 'm-21',
    name: 'Bánh Soufflé Sô-cô-la Bỉ Nóng Chảy Kem Bourbon',
    category: 'dessert',
    price: 135000,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    description: 'Bánh Soufflé nở phồng mềm mượt với nhân sô-cô-la đen 70% Bỉ ấm nóng, ăn kèm viên kem vani Bourbon mát lạnh.',
    dietary: ['vegetarian', 'bestseller'],
    prepTimeMinutes: 18,
  },
  {
    id: 'm-22',
    name: 'Mousse Chanh Dây Tráng Gương Thủy Tinh & Hạt Dẻ Cười',
    category: 'dessert',
    price: 125000,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80',
    description: 'Bánh mousse chanh dây thanh mát phủ lớp tráng gương bóng bẩy, nhân caramel mặn và đế hạt dẻ cười giòn bùi.',
    dietary: ['vegetarian'],
    prepTimeMinutes: 10,
  },
  {
    id: 'm-23',
    name: 'Champagne Dom Pérignon Vintage Luminous (Chai)',
    category: 'beverage',
    price: 1450000,
    image: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=600&q=80',
    description: 'Rượu Champagne trứ danh nước Pháp với bọt sủi li ti tinh tế, ngát hương hoa trắng quả đào mọng và bánh mì nướng bơ.',
    dietary: ['bestseller'],
    prepTimeMinutes: 5,
  },
  {
    id: 'm-24',
    name: 'Mocktail Hoàng Hôn Sài Gòn (Chanh Dây & Bạc Hà)',
    category: 'beverage',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    description: 'Thức uống giải nhiệt phân tầng sắc màu tuyệt đẹp giữa chanh dây tươi, siro việt quất tự nấu và lá bạc hà mát lạnh.',
    dietary: ['vegetarian', 'gluten_free'],
    prepTimeMinutes: 5,
  },
];


export const INITIAL_TABLES: RestaurantTable[] = EXPANDED_TABLES;

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-1',
    bookingCode: 'BK-1001',
    customerName: 'Nguyễn Văn Minh',
    customerPhone: '0903123456',
    customerEmail: 'minh.nguyen@example.com',
    guestCount: 4,
    bookingDate: new Date().toISOString().split('T')[0],
    arrivalTime: '12:00',
    tableId: 'T-02',
    tableName: 'Bàn M-02 (Trung tâm)',
    tableArea: 'main',
    selectedDishes: [
      { dish: MENU_ITEMS[0], quantity: 1, specialNotes: 'Ít ớt cay' },
      { dish: MENU_ITEMS[3], quantity: 2 },
      { dish: MENU_ITEMS[12], quantity: 1 },
    ],
    preOrderTotal: 2435000,
    depositAmount: 500000,
    totalAmount: 2435000,
    status: 'seated',
    occasion: 'Ăn trưa đối tác',
    specialRequests: 'Chuẩn bị thêm khăn lạnh và ly rượu vang đỏ.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    emailConfirmationSent: true,
    emailSentAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'res-2',
    bookingCode: 'BK-1002',
    customerName: 'Trần Thị Thu Trang',
    customerPhone: '0918987654',
    customerEmail: 'thutrang.tran@gmail.com',
    guestCount: 2,
    bookingDate: new Date().toISOString().split('T')[0],
    arrivalTime: '19:00',
    tableId: 'T-04',
    tableName: 'Bàn M-04 (Góc lãng mạn)',
    tableArea: 'main',
    selectedDishes: [
      { dish: MENU_ITEMS[2], quantity: 1 },
      { dish: MENU_ITEMS[7], quantity: 2 },
      { dish: MENU_ITEMS[10], quantity: 2 },
    ],
    preOrderTotal: 1145000,
    depositAmount: 300000,
    totalAmount: 1145000,
    status: 'confirmed',
    occasion: 'Kỷ niệm ngày cưới',
    specialRequests: 'Trang trí nến lung linh và 1 cành hoa hồng trên bàn giúp mình nhé.',
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    emailConfirmationSent: true,
    emailSentAt: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: 'res-3',
    bookingCode: 'BK-1003',
    customerName: 'Lê Hùng',
    customerPhone: '0987654321',
    customerEmail: 'leehung.work03@gmail.com',
    guestCount: 8,
    bookingDate: new Date().toISOString().split('T')[0],
    arrivalTime: '18:30',
    tableId: 'T-07',
    tableName: 'Phòng VIP Hoàng Gia',
    tableArea: 'vip',
    selectedDishes: [
      { dish: MENU_ITEMS[1], quantity: 4 },
      { dish: MENU_ITEMS[6], quantity: 3 },
      { dish: MENU_ITEMS[4], quantity: 2 },
      { dish: MENU_ITEMS[12], quantity: 2 },
    ],
    preOrderTotal: 6490000,
    depositAmount: 1500000,
    totalAmount: 6490000,
    status: 'confirmed',
    occasion: 'Tiệc sinh nhật sếp',
    specialRequests: 'Chuẩn bị phòng lạnh 22 độ trước khi đến, hỗ trợ bảo quản bánh kem.',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    emailConfirmationSent: true,
    emailSentAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'res-4',
    bookingCode: 'BK-1004',
    customerName: 'Đoàn Quang Khải',
    customerPhone: '0933221100',
    customerEmail: 'khai.doan@techcorp.vn',
    guestCount: 12,
    bookingDate: new Date().toISOString().split('T')[0],
    arrivalTime: '11:30',
    tableId: 'T-08',
    tableName: 'Phòng VIP Hoa Sen',
    tableArea: 'vip',
    selectedDishes: [
      { dish: MENU_ITEMS[0], quantity: 3 },
      { dish: MENU_ITEMS[3], quantity: 4 },
      { dish: MENU_ITEMS[6], quantity: 4 },
      { dish: MENU_ITEMS[9], quantity: 6 },
    ],
    preOrderTotal: 7645000,
    depositAmount: 2000000,
    totalAmount: 7645000,
    status: 'seated',
    occasion: 'Ký kết hợp đồng công ty',
    specialRequests: 'Cần máy chiếu trình chiếu slide giới thiệu.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    emailConfirmationSent: true,
    emailSentAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'res-5',
    bookingCode: 'BK-1005',
    customerName: 'Hoàng Diệu Vy',
    customerPhone: '0945678912',
    customerEmail: 'dieuvi.hoang@gmail.com',
    guestCount: 2,
    bookingDate: new Date().toISOString().split('T')[0],
    arrivalTime: '17:30',
    tableId: 'T-13',
    tableName: 'Rooftop R-01 (View thành phố)',
    tableArea: 'rooftop',
    selectedDishes: [
      { dish: MENU_ITEMS[2], quantity: 1 },
      { dish: MENU_ITEMS[7], quantity: 2 },
      { dish: MENU_ITEMS[13], quantity: 2 },
    ],
    preOrderTotal: 1085000,
    depositAmount: 300000,
    totalAmount: 1085000,
    status: 'seated',
    occasion: 'Hẹn hò ngắm hoàng hôn',
    specialRequests: 'Bàn view sát lan can nhìn thẳng ra Landmark 81.',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    emailConfirmationSent: true,
    emailSentAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'res-6',
    bookingCode: 'BK-0988',
    customerName: 'Phạm Hải Đăng',
    customerPhone: '0977889900',
    customerEmail: 'haidang.pham@gmail.com',
    guestCount: 4,
    bookingDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    arrivalTime: '19:00',
    tableId: 'T-05',
    tableName: 'Bàn M-05 (Gia đình)',
    tableArea: 'main',
    selectedDishes: [
      { dish: MENU_ITEMS[5], quantity: 2 },
      { dish: MENU_ITEMS[8], quantity: 2 },
      { dish: MENU_ITEMS[11], quantity: 4 },
    ],
    preOrderTotal: 1580000,
    depositAmount: 400000,
    totalAmount: 1580000,
    status: 'completed',
    occasion: 'Gia đình sum họp',
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    emailConfirmationSent: true,
    emailSentAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
  },
  {
    id: 'res-7',
    bookingCode: 'BK-0972',
    customerName: 'Vũ Thanh Thảo',
    customerPhone: '0908112233',
    customerEmail: 'thao.vu@gmail.com',
    guestCount: 6,
    bookingDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    arrivalTime: '18:00',
    tableId: 'T-12',
    tableName: 'Bàn Vườn V-03 (Giàn hoa)',
    tableArea: 'garden',
    selectedDishes: [
      { dish: MENU_ITEMS[0], quantity: 2 },
      { dish: MENU_ITEMS[4], quantity: 3 },
      { dish: MENU_ITEMS[12], quantity: 1 },
    ],
    preOrderTotal: 2730000,
    depositAmount: 500000,
    totalAmount: 2730000,
    status: 'completed',
    occasion: 'Họp mặt bạn bè đại học',
    createdAt: new Date(Date.now() - 86400000 * 2.5).toISOString(),
    emailConfirmationSent: true,
    emailSentAt: new Date(Date.now() - 86400000 * 2.5).toISOString(),
  },
];

export const INITIAL_EMAIL_LOGS: SentEmailLog[] = [
  {
    id: 'em-1',
    toEmail: 'minh.nguyen@example.com',
    toName: 'Nguyễn Văn Minh',
    subject: '✨ Xác nhận đặt bàn thành công #BK-1001 - Nhà Hàng Le Gourmet Bistro',
    sentAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    bookingCode: 'BK-1001',
    reservationId: 'res-1',
    type: 'booking_confirmation',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; color: #1c1917; max-width: 560px; margin: 0 auto;">
        <div style="background: #1c1917; color: #f59e0b; padding: 16px 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <strong style="font-size: 16px; letter-spacing: 1px;">LE GOURMET BISTRO</strong>
          <div style="font-size: 11px; color: #d6d3d1; margin-top: 4px;">Xác Nhận Đặt Bàn Thành Công</div>
        </div>
        <div style="padding: 18px 20px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 10px 10px; background: #ffffff;">
          <p style="margin: 0 0 10px;">Kính gửi quý khách <strong>Nguyễn Văn Minh</strong>,</p>
          <p style="margin: 0 0 12px; font-size: 13px; color: #44403c;">Nhà hàng Le Gourmet Bistro trân trọng xác nhận lịch đặt bàn của quý khách:</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; background: #fafaf9; border: 1px solid #e7e5e4;">
            <tr><td style="padding: 8px 12px; color: #78716c;">Mã đặt bàn:</td><td style="padding: 8px 12px; font-weight: bold; color: #b45309;">#BK-1001</td></tr>
            <tr><td style="padding: 8px 12px; color: #78716c;">Bàn & Khu vực:</td><td style="padding: 8px 12px;">Bàn M-02 • Sảnh Chính (4 khách)</td></tr>
            <tr><td style="padding: 8px 12px; color: #78716c;">Trạng thái:</td><td style="padding: 8px 12px; color: #059669; font-weight: bold;">Đã xác nhận</td></tr>
          </table>
          <p style="margin: 14px 0 0; font-size: 12px; color: #78716c;">Địa chỉ: 128 Nguyễn Huệ, Quận 1, TP.HCM • Hotline: 0903.888.999</p>
        </div>
      </div>
    `
  },
  {
    id: 'em-2',
    toEmail: 'thutrang.tran@gmail.com',
    toName: 'Trần Thị Thu Trang',
    subject: '✨ Xác nhận đặt bàn thành công #BK-1002 - Nhà Hàng Le Gourmet Bistro',
    sentAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    bookingCode: 'BK-1002',
    reservationId: 'res-2',
    type: 'booking_confirmation',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; color: #1c1917; max-width: 560px; margin: 0 auto;">
        <div style="background: #1c1917; color: #f59e0b; padding: 16px 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <strong style="font-size: 16px; letter-spacing: 1px;">LE GOURMET BISTRO</strong>
          <div style="font-size: 11px; color: #d6d3d1; margin-top: 4px;">Xác Nhận Đặt Bàn Kỷ Niệm</div>
        </div>
        <div style="padding: 18px 20px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 10px 10px; background: #ffffff;">
          <p style="margin: 0 0 10px;">Kính gửi quý khách <strong>Trần Thị Thu Trang</strong>,</p>
          <p style="margin: 0 0 12px; font-size: 13px; color: #44403c;">Chúng tôi rất hân hạnh đón tiếp quý khách trong dịp kỷ niệm ngày cưới:</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; background: #fafaf9; border: 1px solid #e7e5e4;">
            <tr><td style="padding: 8px 12px; color: #78716c;">Mã đặt bàn:</td><td style="padding: 8px 12px; font-weight: bold; color: #b45309;">#BK-1002</td></tr>
            <tr><td style="padding: 8px 12px; color: #78716c;">Bàn & Số khách:</td><td style="padding: 8px 12px;">Bàn M-04 • 2 khách</td></tr>
            <tr><td style="padding: 8px 12px; color: #78716c;">Ghi chú chuẩn bị:</td><td style="padding: 8px 12px;">Trang trí hoa hồng & nến lãng mạn</td></tr>
          </table>
          <p style="margin: 14px 0 0; font-size: 12px; color: #78716c;">Địa chỉ: 128 Nguyễn Huệ, Quận 1, TP.HCM • Hotline: 0903.888.999</p>
        </div>
      </div>
    `
  },
  {
    id: 'em-3',
    toEmail: 'leehung.work03@gmail.com',
    toName: 'Lê Hùng',
    subject: '✨ Xác nhận đặt bàn thành công #BK-1003 - Nhà Hàng Le Gourmet Bistro',
    sentAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    bookingCode: 'BK-1003',
    reservationId: 'res-3',
    type: 'booking_confirmation',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; color: #1c1917; max-width: 560px; margin: 0 auto;">
        <div style="background: #1c1917; color: #f59e0b; padding: 16px 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <strong style="font-size: 16px; letter-spacing: 1px;">LE GOURMET BISTRO</strong>
          <div style="font-size: 11px; color: #d6d3d1; margin-top: 4px;">Xác Nhận Phòng VIP Hoàng Gia</div>
        </div>
        <div style="padding: 18px 20px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 10px 10px; background: #ffffff;">
          <p style="margin: 0 0 10px;">Kính gửi quý khách <strong>Lê Hùng</strong>,</p>
          <p style="margin: 0 0 12px; font-size: 13px; color: #44403c;">Hệ thống đã xác nhận đặt phòng VIP Hoàng Gia cho đoàn 8 khách cùng thực đơn chọn trước.</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; background: #fafaf9; border: 1px solid #e7e5e4;">
            <tr><td style="padding: 8px 12px; color: #78716c;">Mã đặt bàn:</td><td style="padding: 8px 12px; font-weight: bold; color: #b45309;">#BK-1003</td></tr>
            <tr><td style="padding: 8px 12px; color: #78716c;">Không gian:</td><td style="padding: 8px 12px;">Phòng VIP Hoàng Gia (8 khách)</td></tr>
            <tr><td style="padding: 8px 12px; color: #78716c;">Thực đơn:</td><td style="padding: 8px 12px;">Đã tiếp nhận danh sách món chọn trước cho bếp</td></tr>
          </table>
          <p style="margin: 14px 0 0; font-size: 12px; color: #78716c;">Địa chỉ: 128 Nguyễn Huệ, Quận 1, TP.HCM • Hotline: 0903.888.999</p>
        </div>
      </div>
    `
  }
];

export const INITIAL_USERS: (UserAccount & { passwordHash?: string })[] = [
  {
    id: 'user-1',
    name: 'Lê Hùng',
    email: 'leehung.work03@gmail.com',
    phone: '0987654321',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    role: 'customer',
    loyaltyPoints: 420,
    membershipTier: 'Vàng',
    dietaryPreferences: 'Ưu tiên bàn yên tĩnh lãng mạn, dị ứng nhẹ với động vật giáp xác sống.',
    favoriteDishIds: ['m-04', 'm-07', 'm-13'],
    createdAt: '2025-01-10T08:30:00.000Z',
    passwordHash: '123456',
  },
  {
    id: 'user-2',
    name: 'Nguyễn Thu Hà',
    email: 'thuha.nguyen@gmail.com',
    phone: '0912888999',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    role: 'customer',
    loyaltyPoints: 180,
    membershipTier: 'Bạc',
    dietaryPreferences: 'Thích ăn chay vào ngày rằm, thích không gian sân vườn thoáng mát.',
    favoriteDishIds: ['m-03', 'm-10'],
    createdAt: '2025-02-15T14:20:00.000Z',
    passwordHash: '123456',
  },
  {
    id: 'user-admin',
    name: 'Trần Minh Đức',
    email: 'admin@legourmet.vn',
    phone: '0903888999',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    role: 'admin',
    position: 'Tổng Quản Lý Nhà Hàng (General Manager)',
    shift: 'Toàn thời gian (Full-time)',
    status: 'active',
    loyaltyPoints: 2500,
    membershipTier: 'Kim Cương',
    dietaryPreferences: 'Quản trị viên trưởng hệ thống nhà hàng.',
    favoriteDishIds: ['m-04', 'm-05', 'm-14'],
    createdAt: '2024-11-01T00:00:00.000Z',
    passwordHash: '123456',
  },
  {
    id: 'user-staff-1',
    name: 'Nguyễn Văn An',
    email: 'staff@legourmet.vn',
    phone: '0901234567',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    role: 'staff',
    position: 'Trưởng Ca & Tiếp Tân (Receptionist & Lead)',
    shift: 'Ca Chiều - Tối (15:00 - 23:00)',
    status: 'active',
    loyaltyPoints: 600,
    membershipTier: 'Vàng',
    dietaryPreferences: 'Nhân viên lễ tân tiếp đón và điều phối bàn.',
    favoriteDishIds: ['m-01', 'm-04'],
    createdAt: '2025-01-05T00:00:00.000Z',
    passwordHash: '123456',
  },
  {
    id: 'user-staff-2',
    name: 'Trần Thị Mai',
    email: 'phucvu@legourmet.vn',
    phone: '0909876543',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    role: 'staff',
    position: 'Nhân Viên Phục Vụ Bàn & Thu Ngân',
    shift: 'Ca Sáng - Trưa (10:00 - 16:30)',
    status: 'active',
    loyaltyPoints: 450,
    membershipTier: 'Bạc',
    dietaryPreferences: 'Nhân viên phục vụ tầng và thu ngân bàn.',
    favoriteDishIds: ['m-03', 'm-11'],
    createdAt: '2025-02-01T00:00:00.000Z',
    passwordHash: '123456',
  },
];

export const INITIAL_VOUCHERS: UserVoucher[] = [
  {
    code: 'LEGOURMET10',
    title: 'Giảm 10% Thực Đơn Chọn Trước',
    description: 'Ưu đãi dành cho khách hàng đặt bàn trực tuyến và chọn món trước qua website.',
    discountPercent: 10,
    minOrder: 500000,
    expiryDate: '31/12/2026',
  },
  {
    code: 'MEMBERVIP',
    title: 'Đặc Quyền Thành Viên Vàng / Kim Cương',
    description: 'Giảm trực tiếp 150.000đ cho khách hàng VIP từ đơn đặt món 1.000.000đ trở lên.',
    discountAmount: 150000,
    minOrder: 1000000,
    expiryDate: '31/12/2026',
    tierRequired: 'Vàng',
  },
  {
    code: 'SWEETWINE',
    title: 'Quà Tặng Thưởng Rượu Vang & Tráng Miệng',
    description: 'Giảm ngay 100.000đ khi thực đơn chọn trước có kèm Tráng miệng Pháp hoặc Rượu vang.',
    discountAmount: 100000,
    minOrder: 800000,
    expiryDate: '30/06/2026',
  },
];

export const INITIAL_POINTS_TRANSACTIONS: PointsTransaction[] = [
  {
    id: 'pt-1',
    userId: 'user-1',
    amount: 150,
    type: 'earn',
    description: 'Thưởng hoàn tất bữa ăn tiệc sinh nhật #LGB-89211',
    bookingCode: 'LGB-89211',
    createdAt: '2025-02-14T20:45:00.000Z',
    balanceAfter: 420,
  },
  {
    id: 'pt-2',
    userId: 'user-1',
    amount: -50,
    type: 'redeem',
    description: 'Tiêu 50 điểm giảm 5.000đ khi đặt bàn #LGB-71029',
    bookingCode: 'LGB-71029',
    createdAt: '2025-01-20T19:30:00.000Z',
    balanceAfter: 270,
  },
  {
    id: 'pt-3',
    userId: 'user-1',
    amount: 320,
    type: 'bonus',
    description: 'Thưởng kích hoạt thành viên Vàng thân thiết',
    createdAt: '2025-01-10T08:30:00.000Z',
    balanceAfter: 320,
  },
  {
    id: 'pt-4',
    userId: 'user-2',
    amount: 180,
    type: 'earn',
    description: 'Thưởng hoàn tất bữa ăn tối gia đình #LGB-45901',
    bookingCode: 'LGB-45901',
    createdAt: '2025-02-15T19:00:00.000Z',
    balanceAfter: 180,
  },
];

