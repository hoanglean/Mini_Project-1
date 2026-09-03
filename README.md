# 🏫 VKU Campus Facility Inspection PWA & Native Android App

> 📱 **Ứng dụng kiểm tra cơ sở vật chất khuôn viên trường VKU** — Hoạt động ngoại tuyến 100% (Offline-First), tự động đồng bộ hóa nền khi có mạng, tích hợp Camera & Network native và đóng gói thành tệp APK Android gốc với Capacitor.

---

## 📋 Mục Tiêu Học Tập & Tính Năng Cốt Lõi

### 1. 📱 Cài Đặt PWA Độc Lập (Standalone PWA)
- **Manifest**: Đã cấu hình hợp lệ `manifest.webmanifest` với `display: standalone`, màu chủ đề `#0284c7`, background `#0a0f1a`, và biểu tượng đáp ứng (192x192, 512x512).
- **Service Worker (Cache-First)**: Sử dụng Workbox `injectManifest` tại `src/sw.ts` lưu trữ tài nguyên App Shell (HTML, CSS, JS, Font, Image) giúp ứng dụng khởi động ngoại tuyến trong vòng chưa đến một giây (**< 1s**).

### 2. 💾 Lưu Trữ Biểu Mẫu Ngoại Tuyến & Bản Nháp Cục Bộ
- **Phiếu kiểm tra 5 bước**:
  1. **Bước 1 — Chọn Tòa nhà**: Các tòa nhà trong khuôn viên VKU (Tòa A, B, C, D, E, F).
  2. **Bước 2 — Chọn Tầng & Số phòng**: Tầng Hầm, Tầng 1–10, Nhập số phòng và Tên thanh tra.
  3. **Bước 3 — Hạng mục kiểm tra**: Phần cứng (🖥️), Máy chiếu (📽️), Điều hòa (❄️), Điện (⚡), Nội thất (🪑).
  4. **Bước 4 — Đánh giá & Ghi chú**: Đánh giá từ 1–5 sao tương tác và ghi chú mô tả lỗi chi tiết.
  5. **Bước 5 — Chụp ảnh & Xác nhận**: Chụp tối đa 5 ảnh thiết bị (sử dụng Native Camera hoặc Web Fallback) và xem lại toàn bộ thông tin trước khi gửi.
- **Duy trì dữ liệu thời gian thực (IndexedDB)**: Sử dụng thư viện `idb` lưu trữ bản nháp (Draft) ngay khi người dùng tương tác, chống mất dữ liệu khi làm mới trang hoặc tắt trình duyệt.

### 3. 🔄 Hàng Đợi Ngoại Tuyến & Đồng Bộ Hóa Nền (Offline Sync Queue)
- **Gắn thẻ dữ liệu**: Mỗi bài nộp ngoại tuyến được tạo UUID v4, dấu thời gian (timestamp) và lưu với trạng thái `PENDING_SYNC`.
- **Tự động đồng bộ**: Lắng nghe `window.ononline` và `@capacitor/network`. Ngay khi có kết nối mạng, hệ thống tự động gửi các khảo sát trong hàng đợi theo trình tự (sequential) kèm cơ chế **exponential backoff retry** (thử lại tối đa 3 lần nếu xảy ra lỗi).

### 4. 🤖 Đóng Gói APK Android Gốc (Capacitor Bridge)
- Tích hợp `@capacitor/camera` chụp ảnh thiết bị gốc và `@capacitor/network` giám sát kết nối theo thời gian thực.
- Đã được đóng gói và biên dịch thành tệp APK Android sẵn sàng cài đặt.

---

## 🛠️ Điều Kiện Tiên Quyết (Prerequisites)

- **Node.js**: v20.0.0 hoặc v22.0.0+
- **Package Manager**: `npm` (đi kèm Node.js)
- **Công cụ build Android (đối với biên dịch APK)**:
  - Android SDK (v34+)
  - OpenJDK 21 / Android Studio JBR
  - Gradle Wrapper (đã tích hợp trong thư mục `android/`)

---

## 📦 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cài Đặt Dependencies

Mở terminal tại thư mục gốc dự án (`D:/PTUDDNT/Mini_Project1`) và chạy:

```bash
npm install
```

### 2. Khởi Chạy Môi Trường Phát Triển (Dev Mode)

```bash
npm run dev
```

Truy cập ứng dụng tại đường dẫn hiển thị trên terminal (thường là `http://localhost:5173`).

---

## 🏗️ Biên Dịch PWA & Đóng Gói Android APK

### Bước 1: Build PWA Production Bundle

```bash
npm run build
```
Lệnh này sẽ biên dịch TypeScript, đóng gói CSS/JS và tạo Service Worker `dist/sw.js` cùng precache manifest.

### Bước 2: Preview PWA Ngoại Tuyến Trên Trình Duyệt

```bash
npm run preview
```
Mở trình duyệt truy cập `http://localhost:4173` để thử nghiệm PWA ở môi trường Production.

### Bước 3: Đồng Bộ Tài Nguyên Sang Capacitor Android

```bash
npx cap sync
```
Sao chép toàn bộ web assets từ `dist/` sang thư mục Android gốc `android/app/src/main/assets/public`.

### Bước 4: Biên Dịch APK Android Debug

```bash
# Di chuyển vào thư mục android
cd android

# Lệnh biên dịch APK bằng Gradle (nếu environment đã có JAVA_HOME)
.\gradlew assembleDebug

# Hoặc biên dịch trực tiếp thông qua Capacitor CLI (khuyến nghị):
cd ..
npx cap build android
```

---

## 📍 Vị Trí Tệp APK Sau Khi Biên Dịch

Tệp APK đã được đóng gói hoàn chỉnh tại:

```
D:\PTUDDNT\Mini_Project1\android\app\build\outputs\apk\debug\app-debug.apk
```

**Cách cài đặt lên điện thoại Android:**
1. Sao chép file `app-debug.apk` vào điện thoại Android và mở file để cài đặt trực tiếp.
2. Hoặc sử dụng lệnh ADB qua dây cáp USB:
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

## 🧪 Hướng Dẫn Kiểm Thử Chức Năng Ngoại Tuyến (Offline Testing)

### 1. Kiểm thử PWA trên Google Chrome Desktop / Mobile
1. Khởi chạy `npm run preview` và mở Chrome tại `http://localhost:4173`.
2. Mở **DevTools (F12)** -> Chuyển sang thẻ **Network**.
3. Chọn menu thả xuống Throttling và chọn **Offline**.
4. Quan sát Badge góc trên bên phải ứng dụng chuyển sang **OFFLINE (Màu đỏ)**.
5. Nhấp nút **"+ Kiểm tra mới"** và hoàn thành form 5 bước.
6. Nhấp **"Gửi kiểm tra"** -> Thông báo phiếu đã được lưu cục bộ dưới dạng `PENDING_SYNC`.
7. Kiểm tra dữ liệu: Vào DevTools -> **Application** -> **IndexedDB** -> `vku-inspector-db` -> `inspections` để xem bản ghi vừa tạo.
8. Chuyển lại Network sang **Online** -> Ứng dụng tự động kích hoạt **Sync Queue**, gửi dữ liệu và cập nhật badge thành **Đã đồng bộ (Màu xanh)**.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
Mini_Project1/
├── index.html                    # HTML Shell chính với meta PWA & Google Fonts
├── vite.config.ts                # Vite + vite-plugin-pwa (InjectManifest configuration)
├── capacitor.config.ts           # Cấu hình Capacitor App ID & webDir
├── postcss.config.js             # PostCSS override config
├── tsconfig.json                 # Cấu hình TypeScript với PWA & ServiceWorker types
├── package.json                  # Khai báo dependencies
├── README.md                     # Hướng dẫn thiết lập ứng dụng
├── public/
│   ├── favicon.svg               # SVG Favicon biểu tượng ứng dụng
│   └── icons/                    # Biểu tượng PWA (192x192, 512x512)
├── src/
│   ├── main.ts                   # Entry point, router setup, PWA & Ionic custom elements
│   ├── sw.ts                     # Custom Service Worker (Cache-First strategy & Workbox precache)
│   ├── router.ts                 # SPA Hash Router hỗ trợ route tham số
│   ├── styles/
│   │   ├── index.css             # Design system, CSS custom properties & theme
│   │   ├── components.css        # Styles cho header, nav, step indicator, cards...
│   │   └── animations.css        # Micro-animations & page transitions
│   ├── db/
│   │   ├── schema.ts             # Type definition cho Inspection & IndexedDB DBSchema
│   │   └── database.ts           # Database Service (CRUD & Draft auto-save)
│   ├── services/
│   │   ├── network-monitor.ts    # Giám sát trạng thái mạng real-time
│   │   ├── sync-queue.ts         # Hàng đợi ngoại tuyến & auto retry exponential backoff
│   │   └── camera.ts             # Tích hợp Capacitor Camera + Web fallback file picker
│   ├── components/
│   │   ├── header.ts             # App Header + Live Network Badge
│   │   ├── nav.ts                # Bottom Navigation + Dynamic pending count badge
│   │   ├── star-rating.ts        # Component đánh giá 1-5 sao
│   │   ├── step-indicator.ts     # Thanh tiến trình 5 bước kiểm tra
│   │   ├── toast.ts              # Hệ thống thông báo tức thì (Toast)
│   │   └── sync-status.ts        # Status badges
│   ├── pages/
│   │   ├── home.ts               # Dashboard thống kê tổng quan
│   │   ├── inspection-form.ts    # Form kiểm tra 5 bước chi tiết
│   │   ├── history.ts            # Danh sách lịch sử & bộ lọc trạng thái
│   │   └── inspection-detail.ts  # Xem chi tiết phiếu, ảnh & xóa/đồng bộ lại
│   └── utils/
│       ├── uuid.ts               # Bộ tạo mã UUID v4
│       └── date.ts               # Tiện ích định dạng ngày giờ Tiếng Việt
└── android/                      # Thư mục Native Android Capacitor project
    └── app/build/outputs/apk/debug/app-debug.apk  # Tệp APK đã đóng gói hoàn chỉnh
```

---

## 👨‍💻 Công Nghệ Sử Dụng

- **Frontend Core**: HTML5, TypeScript, Vanilla CSS (Design system dark mode & glassmorphism)
- **PWA & Offline**: Service Worker API, Workbox (`vite-plugin-pwa`), IndexedDB (`idb` library)
- **Native Bridge**: Capacitor 8 Core, `@capacitor/camera`, `@capacitor/network`, `@ionic/pwa-elements`
- **Build Tooling**: Vite 8, TypeScript Compiler, Android Gradle Plugin
