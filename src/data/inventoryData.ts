import { Ingredient, DishRecipeBOM, InventoryLog } from '../types';

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-wagyu',
    name: 'Thăn Bò Wagyu A5 Miyazaki',
    category: 'meat',
    unit: 'g',
    currentStock: 3500, // 3.5 kg
    minStockLevel: 1000,
    costPerUnit: 1400, // 1,400đ / g (250g = 350,000đ)
    supplier: 'Công ty TNHH Nhập Khẩu Nhật Việt Gourmet',
    lastImportDate: '2026-09-24',
  },
  {
    id: 'ing-butter',
    name: 'Bơ Lạt Anchor Pháp',
    category: 'dairy',
    unit: 'g',
    currentStock: 2200,
    minStockLevel: 500,
    costPerUnit: 250, // 250đ / g (20g = 5,000đ)
    supplier: 'Anchor Dairy Gourmet VN',
    lastImportDate: '2026-09-22',
  },
  {
    id: 'ing-truffle',
    name: 'Nấm Truffle Đen Périgord',
    category: 'produce',
    unit: 'g',
    currentStock: 85, // 85g
    minStockLevel: 30,
    costPerUnit: 12000, // 12,000đ / g (5g = 60,000đ)
    supplier: 'Périgord Truffle Gourmet France',
    lastImportDate: '2026-09-20',
  },
  {
    id: 'ing-lamb',
    name: 'Sườn Cừu Úc Cắt Kiểu Pháp',
    category: 'meat',
    unit: 'g',
    currentStock: 4200,
    minStockLevel: 1200,
    costPerUnit: 420, // 420đ / g (350g = 147,000đ)
    supplier: 'MeatWorld Australia Imports',
    lastImportDate: '2026-09-23',
  },
  {
    id: 'ing-chicken',
    name: 'Gà Đồi Tây Bắc Thả Vườn',
    category: 'meat',
    unit: 'g',
    currentStock: 5000,
    minStockLevel: 1500,
    costPerUnit: 160, // 160đ / g (600g = 96,000đ)
    supplier: 'Nông Sản Hữu Cơ Tây Bắc',
    lastImportDate: '2026-09-25',
  },
  {
    id: 'ing-lobster',
    name: 'Tôm Hùm Bông Nha Trang (Tươi Sống)',
    category: 'seafood',
    unit: 'g',
    currentStock: 5400,
    minStockLevel: 1800,
    costPerUnit: 820, // 820đ / g (450g = 369,000đ)
    supplier: 'Hải Sản Tươi Sống Vịnh Nha Trang',
    lastImportDate: '2026-09-25',
  },
  {
    id: 'ing-salmon',
    name: 'Phi Lê Cá Hồi Na Uy Tươi (Salmo Salar)',
    category: 'seafood',
    unit: 'g',
    currentStock: 3200,
    minStockLevel: 1000,
    costPerUnit: 580, // 580đ / g (220g = 127,600đ)
    supplier: 'Leroy Seafood Norway',
    lastImportDate: '2026-09-24',
  },
  {
    id: 'ing-squid',
    name: 'Mực Trứng Phú Quốc Tươi',
    category: 'seafood',
    unit: 'g',
    currentStock: 2500,
    minStockLevel: 800,
    costPerUnit: 340, // 340đ / g (250g = 85,000đ)
    supplier: 'Hải Sản Đảo Ngọc Phú Quốc',
    lastImportDate: '2026-09-24',
  },
  {
    id: 'ing-beef-tender',
    name: 'Thịt Bò Tơ Củ Chi Hảo Hạng',
    category: 'meat',
    unit: 'g',
    currentStock: 2600,
    minStockLevel: 800,
    costPerUnit: 280, // 280đ / g (180g = 50,400đ)
    supplier: 'Hợp Tác Xã Bò Sạch Củ Chi',
    lastImportDate: '2026-09-25',
  },
  {
    id: 'ing-cashew',
    name: 'Hạt Điều Rang Củi Bình Phước',
    category: 'dry_goods',
    unit: 'g',
    currentStock: 1800,
    minStockLevel: 400,
    costPerUnit: 220, // 220đ / g (40g = 8,800đ)
    supplier: 'Hạt Điều Xuất Khẩu Bình Phước',
    lastImportDate: '2026-09-18',
  },
  {
    id: 'ing-abalone-mush',
    name: 'Nấm Bào Ngư Xám Hữu Cơ Đà Lạt',
    category: 'produce',
    unit: 'g',
    currentStock: 1800,
    minStockLevel: 500,
    costPerUnit: 120, // 120đ / g (150g = 18,000đ)
    supplier: 'Trang Trại Nấm Sạch Đà Lạt',
    lastImportDate: '2026-09-24',
  },
  {
    id: 'ing-sea-grapes',
    name: 'Rong Nho Biển Tươi Tách Nước Khánh Hòa',
    category: 'produce',
    unit: 'g',
    currentStock: 1400,
    minStockLevel: 400,
    costPerUnit: 170, // 170đ / g (150g = 25,500đ)
    supplier: 'Rong Biển Khánh Hòa',
    lastImportDate: '2026-09-23',
  },
  {
    id: 'ing-mascarpone',
    name: 'Phô Mai Kem Mascarpone Galbani Ý',
    category: 'dairy',
    unit: 'g',
    currentStock: 1900,
    minStockLevel: 500,
    costPerUnit: 310, // 310đ / g (100g = 31,000đ)
    supplier: 'Galbani Dairy Italy VN',
    lastImportDate: '2026-09-21',
  },
  {
    id: 'ing-heavy-cream',
    name: 'Kem Sữa Béo Heavy Cream Tatua',
    category: 'dairy',
    unit: 'ml',
    currentStock: 2500,
    minStockLevel: 600,
    costPerUnit: 150, // 150đ / ml (100ml = 15,000đ)
    supplier: 'Tatua New Zealand Dairy',
    lastImportDate: '2026-09-24',
  },
  {
    id: 'ing-vanilla',
    name: 'Quả Vani Tự Nhiên Madagascar',
    category: 'spices_sauces',
    unit: 'pcs',
    currentStock: 25,
    minStockLevel: 8,
    costPerUnit: 28000, // 28,000đ / trái
    supplier: 'Madagascar Vanilla Gourmet',
    lastImportDate: '2026-09-15',
  },
  {
    id: 'ing-wine-bordeaux',
    name: 'Rượu Vang Chateau Bordeaux Reserve (Chai 750ml)',
    category: 'beverage_wine',
    unit: 'bottle',
    currentStock: 14,
    minStockLevel: 5,
    costPerUnit: 480000, // 480,000đ / chai (Bán 890,000đ)
    supplier: 'Thăng Long Wine Cellars',
    lastImportDate: '2026-09-20',
  },
  {
    id: 'ing-tea-lotus',
    name: 'Trà Lài Sen Vàng Thượng Hạng',
    category: 'dry_goods',
    unit: 'g',
    currentStock: 2200,
    minStockLevel: 500,
    costPerUnit: 90, // 90đ / g (20g = 1,800đ)
    supplier: 'Trà Sen Cổ Truyền Đồng Tháp',
    lastImportDate: '2026-09-19',
  },
  {
    id: 'ing-pomegranate',
    name: 'Lựu Đỏ Tây Ban Nha Tươi',
    category: 'produce',
    unit: 'g',
    currentStock: 3500,
    minStockLevel: 1000,
    costPerUnit: 80, // 80đ / g (250g = 20,000đ)
    supplier: 'Trái Cây Nhập Khẩu Nam An',
    lastImportDate: '2026-09-25',
  },
  {
    id: 'ing-caviar',
    name: 'Trứng Cá Tầm Caviar Black Thượng Hạng',
    category: 'seafood',
    unit: 'g',
    currentStock: 250,
    minStockLevel: 50,
    costPerUnit: 8000, // 8,000đ / g (15g = 120,000đ)
    supplier: 'Gourmet Caviar House France',
    lastImportDate: '2026-09-25',
  },
  {
    id: 'ing-foie-gras',
    name: 'Gan Ngỗng Béo Foie Gras Rougié Pháp',
    category: 'meat',
    unit: 'g',
    currentStock: 1600,
    minStockLevel: 400,
    costPerUnit: 1500, // 1,500đ / g (120g = 180,000đ)
    supplier: 'Rougié Gourmet France',
    lastImportDate: '2026-09-24',
  },
  {
    id: 'ing-angus-beef',
    name: 'Thăn Ngoại Bò Black Angus Mỹ Prime',
    category: 'meat',
    unit: 'g',
    currentStock: 5200,
    minStockLevel: 1200,
    costPerUnit: 650, // 650đ / g (250g = 162,500đ)
    supplier: 'US Meat Export Federation',
    lastImportDate: '2026-09-26',
  },
  {
    id: 'ing-pigeon',
    name: 'Chim Bồ Câu Pháp Tuyển Chọn (Nguyên Con)',
    category: 'meat',
    unit: 'pcs',
    currentStock: 24,
    minStockLevel: 6,
    costPerUnit: 160000, // 160,000đ / con
    supplier: 'Trang Trại Bồ Câu Pháp Tân Hiệp',
    lastImportDate: '2026-09-25',
  },
  {
    id: 'ing-king-crab',
    name: 'Chân Cua Hoàng Đế King Crab Alaska',
    category: 'seafood',
    unit: 'g',
    currentStock: 4800,
    minStockLevel: 1200,
    costPerUnit: 1800, // 1,800đ / g (600g = 1,080,000đ)
    supplier: 'Alaska Seafood Marketing Institute',
    lastImportDate: '2026-09-26',
  },
  {
    id: 'ing-scallop',
    name: 'Cồi Sò Điệp Nhật Hokkaido Size 2L',
    category: 'seafood',
    unit: 'g',
    currentStock: 3200,
    minStockLevel: 800,
    costPerUnit: 950, // 950đ / g (200g = 190,000đ)
    supplier: 'Hokkaido Seafood Direct Japan',
    lastImportDate: '2026-09-25',
  },
  {
    id: 'ing-belgian-choc',
    name: 'Sô-cô-la Đen 70% Callebaut Bỉ',
    category: 'dry_goods',
    unit: 'g',
    currentStock: 3500,
    minStockLevel: 600,
    costPerUnit: 320, // 320đ / g (120g = 38,400đ)
    supplier: 'Barry Callebaut Belgium',
    lastImportDate: '2026-09-23',
  },
  {
    id: 'ing-passion-fruit',
    name: 'Chanh Dây Tươi Đà Lạt Tuyển Chọn',
    category: 'produce',
    unit: 'g',
    currentStock: 6000,
    minStockLevel: 1200,
    costPerUnit: 60, // 60đ / g
    supplier: 'Nông Sản Sạch Đà Lạt Farm',
    lastImportDate: '2026-09-26',
  },
  {
    id: 'ing-champagne',
    name: 'Rượu Champagne Dom Pérignon Vintage (Chai 750ml)',
    category: 'beverage_wine',
    unit: 'bottle',
    currentStock: 12,
    minStockLevel: 3,
    costPerUnit: 820000, // 820,000đ / chai (Bán 1,450,000đ)
    supplier: 'Moët Hennessy Vietnam Cellars',
    lastImportDate: '2026-09-22',
  },
  {
    id: 'ing-blueberry',
    name: 'Quả Việt Quất Tươi New Zealand',
    category: 'produce',
    unit: 'g',
    currentStock: 2400,
    minStockLevel: 500,
    costPerUnit: 180, // 180đ / g
    supplier: 'Fresh Berry Import New Zealand',
    lastImportDate: '2026-09-25',
  },
];

export const INITIAL_RECIPES: DishRecipeBOM[] = [

  // m-04: Bò Wagyu Nướng Đá Muối Himalaya (User's specific highlight example)
  {
    dishId: 'm-04',
    ingredients: [
      { ingredientId: 'ing-wagyu', amount: 250, isCrucial: true },
      { ingredientId: 'ing-butter', amount: 20, isCrucial: false },
      { ingredientId: 'ing-truffle', amount: 5, isCrucial: true },
    ],
    preparationNotes: 'Cắt thăn bò Wagyu A5 dày 2.5cm, ướp cùng bơ lạt đun chảy và nấm Truffle đen thái lát mỏng trước khi áp đá muối.',
  },
  // m-05: Sườn Cừu Úc Đút Lò Thảo Mộc
  {
    dishId: 'm-05',
    ingredients: [
      { ingredientId: 'ing-lamb', amount: 350, isCrucial: true },
      { ingredientId: 'ing-butter', amount: 25, isCrucial: false },
    ],
    preparationNotes: 'Sườn cừu ướp lá hương thảo và bơ lạt, đút lò ở nhiệt độ 200°C trong 18 phút.',
  },
  // m-06: Gà Ta Nướng Mật Ong Rừng & Xôi Chiên Phồng
  {
    dishId: 'm-06',
    ingredients: [
      { ingredientId: 'ing-chicken', amount: 600, isCrucial: true },
      { ingredientId: 'ing-butter', amount: 15, isCrucial: false },
    ],
    preparationNotes: 'Gà đồi ướp mật ong và bơ lạt, quay da giòn rụm.',
  },
  // m-07: Tôm Hùm Bông Nướng Phô Mai Truffle
  {
    dishId: 'm-07',
    ingredients: [
      { ingredientId: 'ing-lobster', amount: 450, isCrucial: true },
      { ingredientId: 'ing-butter', amount: 30, isCrucial: false },
      { ingredientId: 'ing-mascarpone', amount: 60, isCrucial: false },
      { ingredientId: 'ing-truffle', amount: 4, isCrucial: true },
    ],
    preparationNotes: 'Bổ đôi thân tôm hùm, phủ xốt phô mai mascarpone, bơ lạt và nấm truffle đen đút lò.',
  },
  // m-08: Cá Hồi Na Uy Áp Chảo Xốt Chanh Leo
  {
    dishId: 'm-08',
    ingredients: [
      { ingredientId: 'ing-salmon', amount: 220, isCrucial: true },
      { ingredientId: 'ing-butter', amount: 20, isCrucial: false },
    ],
    preparationNotes: 'Áp chảo cá hồi mặt da giòn 70%, mặt thịt 30% cùng bơ lạt thơm.',
  },
  // m-09: Mực Trứng Hấp Gừng Hành Hoa
  {
    dishId: 'm-09',
    ingredients: [
      { ingredientId: 'ing-squid', amount: 250, isCrucial: true },
    ],
    preparationNotes: 'Mực tươi hấp cách thủy với gừng thái chỉ và hành hoa vừa chín tới.',
  },
  // m-01: Gỏi Bò Bóp Thấu Hạt Điều
  {
    dishId: 'm-01',
    ingredients: [
      { ingredientId: 'ing-beef-tender', amount: 180, isCrucial: true },
      { ingredientId: 'ing-cashew', amount: 40, isCrucial: false },
    ],
    preparationNotes: 'Thịt bò tơ thái mỏng áp nhiệt nhanh, trộn khế và rắc hạt điều rang.',
  },
  // m-02: Súp Hải Sản Nấm Bào Ngư
  {
    dishId: 'm-02',
    ingredients: [
      { ingredientId: 'ing-abalone-mush', amount: 150, isCrucial: true },
      { ingredientId: 'ing-squid', amount: 80, isCrucial: false },
    ],
    preparationNotes: 'Nấu súp thanh đạm từ nước cốt hải sản và nấm bào ngư hữu cơ.',
  },
  // m-03: Salad Rong Nho Trứng Cua Nhật
  {
    dishId: 'm-03',
    ingredients: [
      { ingredientId: 'ing-sea-grapes', amount: 150, isCrucial: true },
    ],
    preparationNotes: 'Rong nho ngâm nước đá giòn tan, rưới mè rang Nhật.',
  },
  // m-10: Panna Cotta Trái Cây Rừng
  {
    dishId: 'm-10',
    ingredients: [
      { ingredientId: 'ing-heavy-cream', amount: 120, isCrucial: true },
      { ingredientId: 'ing-vanilla', amount: 0.5, isCrucial: false },
    ],
    preparationNotes: 'Nấu kem béo và vani hạt mịn, đổ khuôn làm mát 4 tiếng.',
  },
  // m-11: Kem Cháy Creme Brulee
  {
    dishId: 'm-11',
    ingredients: [
      { ingredientId: 'ing-heavy-cream', amount: 120, isCrucial: true },
      { ingredientId: 'ing-vanilla', amount: 0.5, isCrucial: false },
    ],
    preparationNotes: 'Khò lớp đường nâu giòn trên mặt kem trứng vani.',
  },
  // m-12: Trà Lài Sen Vàng Macchiato
  {
    dishId: 'm-12',
    ingredients: [
      { ingredientId: 'ing-tea-lotus', amount: 20, isCrucial: true },
      { ingredientId: 'ing-heavy-cream', amount: 40, isCrucial: false },
    ],
    preparationNotes: 'Hãm trà lài sen vàng 90°C, đánh kem macchiato phủ bồng bềnh.',
  },
  // m-13: Vang Đỏ Chateau Bordeaux Reserve
  {
    dishId: 'm-13',
    ingredients: [
      { ingredientId: 'ing-wine-bordeaux', amount: 1, isCrucial: true },
    ],
    preparationNotes: 'Phục vụ nguyên chai ở nhiệt độ 16 - 18°C kèm ly pha lê Bordeaux.',
  },
  // m-14: Nước Ép Lựu Đỏ & Bưởi Hồng Tươi
  {
    dishId: 'm-14',
    ingredients: [
      { ingredientId: 'ing-pomegranate', amount: 250, isCrucial: true },
    ],
    preparationNotes: 'Ép lạnh nguyên chất 100%, phục vụ kèm đá bi.',
  },
  // m-15: Tartare Cá Hồi & Caviar
  {
    dishId: 'm-15',
    ingredients: [
      { ingredientId: 'ing-salmon', amount: 150, isCrucial: true },
      { ingredientId: 'ing-caviar', amount: 15, isCrucial: true },
    ],
    preparationNotes: 'Cá hồi thái hạt lựu ướp dầu ô-liu chanh vàng, phủ trứng cá tầm Black Caviar.',
  },
  // m-16: Gan Ngỗng Pháp Áp Chảo
  {
    dishId: 'm-16',
    ingredients: [
      { ingredientId: 'ing-foie-gras', amount: 120, isCrucial: true },
      { ingredientId: 'ing-butter', amount: 15, isCrucial: false },
    ],
    preparationNotes: 'Gan ngỗng áp chảo nhiệt cao 90 giây mỗi mặt, rưới xốt vang ngọt Port.',
  },
  // m-17: Thăn Ngoại Bò Black Angus Mỹ
  {
    dishId: 'm-17',
    ingredients: [
      { ingredientId: 'ing-angus-beef', amount: 250, isCrucial: true },
      { ingredientId: 'ing-butter', amount: 20, isCrucial: false },
    ],
    preparationNotes: 'Thăn bò Angus nướng than hoa chín medium-rare, xốt tiêu đen Phú Quốc.',
  },
  // m-18: Bồ Câu Pháp Đút Lò
  {
    dishId: 'm-18',
    ingredients: [
      { ingredientId: 'ing-pigeon', amount: 1, isCrucial: true },
      { ingredientId: 'ing-butter', amount: 25, isCrucial: false },
    ],
    preparationNotes: 'Bồ câu Pháp đút lò nhiệt độ 190°C trong 22 phút, xốt nho đen Pinot Noir.',
  },
  // m-19: Cua Hoàng Đế Alaska Hấp Sake
  {
    dishId: 'm-19',
    ingredients: [
      { ingredientId: 'ing-king-crab', amount: 600, isCrucial: true },
      { ingredientId: 'ing-butter', amount: 40, isCrucial: false },
    ],
    preparationNotes: 'Chân cua King Crab hấp rượu sake và đút lò bơ tỏi lá thyme.',
  },
  // m-20: Sò Điệp Nhật Hokkaido Áp Chảo
  {
    dishId: 'm-20',
    ingredients: [
      { ingredientId: 'ing-scallop', amount: 200, isCrucial: true },
      { ingredientId: 'ing-heavy-cream', amount: 60, isCrucial: false },
      { ingredientId: 'ing-truffle', amount: 3, isCrucial: true },
    ],
    preparationNotes: 'Cồi sò điệp áp chảo bơ thơm vàng hai mặt, rưới xốt kem nấm truffle đen.',
  },
  // m-21: Bánh Soufflé Sô-cô-la Bỉ
  {
    dishId: 'm-21',
    ingredients: [
      { ingredientId: 'ing-belgian-choc', amount: 100, isCrucial: true },
      { ingredientId: 'ing-butter', amount: 20, isCrucial: false },
      { ingredientId: 'ing-vanilla', amount: 0.5, isCrucial: false },
    ],
    preparationNotes: 'Nướng lò 200°C trong 12 phút nở phồng bồng bềnh, dùng ngay khi nóng.',
  },
  // m-22: Mousse Chanh Dây Tráng Gương
  {
    dishId: 'm-22',
    ingredients: [
      { ingredientId: 'ing-passion-fruit', amount: 120, isCrucial: true },
      { ingredientId: 'ing-heavy-cream', amount: 80, isCrucial: false },
    ],
    preparationNotes: 'Đổ khuôn tráng gương thủy tinh bóng bẩy, làm mát 4 tiếng.',
  },
  // m-23: Champagne Dom Pérignon Vintage
  {
    dishId: 'm-23',
    ingredients: [
      { ingredientId: 'ing-champagne', amount: 1, isCrucial: true },
    ],
    preparationNotes: 'Ướp lạnh xô đá pha lê nhiệt độ 8°C, phục vụ nguyên chai kèm ly flute.',
  },
  // m-24: Mocktail Hoàng Hôn Sài Gòn
  {
    dishId: 'm-24',
    ingredients: [
      { ingredientId: 'ing-passion-fruit', amount: 80, isCrucial: true },
      { ingredientId: 'ing-blueberry', amount: 40, isCrucial: false },
    ],
    preparationNotes: 'Lắc shaker cùng đá bi, trang trí nhánh bạc hà và lát chanh tươi.',
  },
];


export const INITIAL_INVENTORY_LOGS: InventoryLog[] = [
  {
    id: 'log-01',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    type: 'stock_import',
    ingredientId: 'ing-wagyu',
    ingredientName: 'Thăn Bò Wagyu A5 Miyazaki',
    quantityChanged: 5000,
    remainingStock: 3500,
    unit: 'g',
    performedBy: 'Trần Văn Hoàng (Bếp Trưởng)',
    notes: 'Nhập lô hàng Wagyu A5 tươi chuyến bay Tokyo - Tân Sơn Nhất',
  },
  {
    id: 'log-02',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    type: 'order_deduction',
    ingredientId: 'ing-wagyu',
    ingredientName: 'Thăn Bò Wagyu A5 Miyazaki',
    quantityChanged: -500, // 2 portions
    remainingStock: 3000,
    unit: 'g',
    referenceDishName: 'Bò Wagyu Nướng Đá Muối Himalaya (x2)',
    referenceBookingCode: 'BK-1002',
    performedBy: 'Hệ thống tự động trừ theo BOM',
  },
  {
    id: 'log-03',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    type: 'order_deduction',
    ingredientId: 'ing-butter',
    ingredientName: 'Bơ Lạt Anchor Pháp',
    quantityChanged: -40,
    remainingStock: 2200,
    unit: 'g',
    referenceDishName: 'Bò Wagyu Nướng Đá Muối Himalaya (x2)',
    referenceBookingCode: 'BK-1002',
    performedBy: 'Hệ thống tự động trừ theo BOM',
  },
  {
    id: 'log-04',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    type: 'order_deduction',
    ingredientId: 'ing-truffle',
    ingredientName: 'Nấm Truffle Đen Périgord',
    quantityChanged: -10,
    remainingStock: 85,
    unit: 'g',
    referenceDishName: 'Bò Wagyu Nướng Đá Muối Himalaya (x2)',
    referenceBookingCode: 'BK-1002',
    performedBy: 'Hệ thống tự động trừ theo BOM',
  },
  {
    id: 'log-05',
    timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    type: 'order_deduction',
    ingredientId: 'ing-lobster',
    ingredientName: 'Tôm Hùm Bông Nha Trang (Tươi Sống)',
    quantityChanged: -450,
    remainingStock: 5400,
    unit: 'g',
    referenceDishName: 'Tôm Hùm Bông Nướng Phô Mai Truffle (x1)',
    referenceBookingCode: 'BK-1004',
    performedBy: 'Hệ thống tự động trừ theo BOM',
  },
];
