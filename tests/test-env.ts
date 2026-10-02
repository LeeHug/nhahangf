/**
 * =========================================================================
 * MÔI TRƯỜNG TEST CƠ SỞ (BASE TEST ENVIRONMENT)
 * Dự án: Hệ thống quản lý nhà hàng Le Gourmet Bistro
 * =========================================================================
 * Cung cấp:
 * 1. Giả lập LocalStorage trong bộ nhớ Node.js
 * 2. Giả lập các API trình duyệt (window, document, AudioContext, URL)
 * 3. Bộ tiện ích kiểm thử dạng code tay: kiemTra(), inTieuDe(), inKetQuaTong()
 * 4. Tiện ích nhập thông tin tương tác từ bàn phím (Interactive Readline)
 */

import readline from 'readline';

// -------------------------------------------------------------------------
// 1. GIẢ LẬP LOCALSTORAGE CHO MÔI TRƯỜNG NODE.JS
// -------------------------------------------------------------------------
const boNhoTam: Record<string, string> = {};

export const mockLocalStorage = {
  getItem: (key: string): string | null => {
    return Object.prototype.hasOwnProperty.call(boNhoTam, key) ? boNhoTam[key] : null;
  },
  setItem: (key: string, value: string): void => {
    boNhoTam[key] = String(value);
  },
  removeItem: (key: string): void => {
    delete boNhoTam[key];
  },
  clear: (): void => {
    for (const k in boNhoTam) {
      delete boNhoTam[k];
    }
  },
  dump: (): Record<string, string> => ({ ...boNhoTam })
};

// Gán vào global để các service chạy được trên Node.js
(global as any).localStorage = mockLocalStorage;

// -------------------------------------------------------------------------
// 2. GIẢ LẬP CÁC API TRÌNH DUYỆT (BROWSER GLOBALS MOCK)
// -------------------------------------------------------------------------
if (typeof (global as any).window === 'undefined') {
  (global as any).window = {
    AudioContext: class {
      createOscillator() {
        return {
          connect: () => {},
          start: () => {},
          stop: () => {},
          frequency: { setValueAtTime: () => {} },
          type: 'sine'
        };
      }
      createGain() {
        return {
          connect: () => {},
          gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }
        };
      }
      currentTime = 0;
      destination = {};
      close = () => Promise.resolve();
    }
  };
}

if (typeof (global as any).document === 'undefined') {
  (global as any).document = {
    createElement: () => ({
      href: '',
      download: '',
      click: () => {},
      setAttribute: () => {}
    }),
    body: {
      appendChild: () => {},
      removeChild: () => {}
    }
  };
}

if (typeof (global as any).URL === 'undefined' || !(global as any).URL.createObjectURL) {
  (global as any).URL = {
    ...(global as any).URL,
    createObjectURL: () => 'blob:mock-url-' + Date.now(),
    revokeObjectURL: () => {}
  };
}

// -------------------------------------------------------------------------
// 3. BỘ ĐẾM VÀ HÀM ASSERTION KIỂM TRA KẾT QUẢ DẠNG CODE TAY
// -------------------------------------------------------------------------
export class TestSuiteRunner {
  tenSuite: string;
  soPass = 0;
  soFail = 0;

  constructor(tenSuite: string) {
    this.tenSuite = tenSuite;
  }

  inTieuDe(noiDung: string) {
    console.log(`\n=================================================================`);
    console.log(`  ${noiDung.toUpperCase()}`);
    console.log(`=================================================================`);
  }

  inMuc(mucSo: number | string, tieuDe: string) {
    console.log(`\n--- [Kiểm tra ${mucSo}] ${tieuDe} ---`);
  }

  kiemTra(tenKiemTra: string, dieuKien: boolean, chiTietLoi: string = '') {
    if (dieuKien) {
      this.soPass++;
      console.log(`  [PASS] ${tenKiemTra}`);
    } else {
      this.soFail++;
      console.log(`  [FAIL] ${tenKiemTra}`);
      if (chiTietLoi) {
        console.log(`         -> Chi tiết: ${chiTietLoi}`);
      }
    }
  }

  inTongKet() {
    const tong = this.soPass + this.soFail;
    const tyLe = tong > 0 ? Math.round((this.soPass / tong) * 100) : 0;

    console.log(`\n-----------------------------------------------------------------`);
    console.log(`  TỔNG KẾT: ${this.tenSuite}`);
    console.log(`  Tổng số ca kiểm thử : ${tong}`);
    console.log(`  Thành công (PASS)   : ${this.soPass}`);
    console.log(`  Thất bại   (FAIL)   : ${this.soFail}`);
    console.log(`  Tỷ lệ đạt chuẩn     : ${tyLe}%`);
    console.log(`-----------------------------------------------------------------`);

    if (this.soFail === 0) {
      console.log(`=> ĐÁNH GIÁ: TẤT CẢ TEST ĐỀU ĐẠT CHUẨN XUẤT SẮC (100% PASS)\n`);
    } else {
      console.log(`=> CẢNH BÁO: CÓ ${this.soFail} TRƯỜNG HỢP CẦN XEM LẠI!\n`);
    }

    return { tong, pass: this.soPass, fail: this.soFail };
  }

  datLai() {
    this.soPass = 0;
    this.soFail = 0;
  }
}

// -------------------------------------------------------------------------
// 4. TIỆN ÍCH NHẬP THÔNG TIN TỪ BÀN PHÍM (CLI INTERACTION)
// -------------------------------------------------------------------------
export function taoGiaoDienNhap() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

export function hoiCauHoi(rl: readline.Interface, cauHoi: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(cauHoi, (traLoi) => {
      resolve(traLoi.trim());
    });
  });
}

/**
 * Xóa sạch dữ liệu trong bộ nhớ tạm để mỗi test chạy độc lập hoàn toàn
 */
export function resetTestStorage(): void {
  mockLocalStorage.clear();
}
