# 🏫 VKU Campus Facility Inspection PWA & Native Android App

> 📱 **Ứng dụng kiểm tra cơ sở vật chất khuôn viên trường VKU** — Hoạt động ngoại tuyến 100% (Offline-First), tự động đồng bộ hóa nền khi có mạng, tích hợp Native Camera & Network Monitor, giao diện hiện đại phong cách **Dark Cyan Glassmorphism** và đóng gói thành tệp APK Android gốc với Capacitor.

---

## 🎨 Giao Diện & Trải Nghiệm Người Dùng (UI/UX)

- **Chủ đề Màu sắc (Cyan Neon Theme)**:
  - Màu nhấn chính: **Vibrant Cyan Blue** (`#00d9ff`) kết hợp dải quang phổ `#33f3ff` và `#0088cc`.
  - Hiệu ứng phát sáng neon: `accent-glow` (`rgba(0, 217, 255, 0.4)`).
  - Nền tối đa tầng: `--bg-primary` (`#050a15`), `--bg-secondary` (`#0d1623`), thẻ mờ thủy tinh (`--bg-card` glassmorphism).
- **Phản hồi tương tác**: Hiệu ứng Micro-animations mượt mà, chuyển trang trượt ngang, phản hồi chạm viền sáng và thẻ trạng thái đồng bộ real-time.

---

## 📋 Mục Tiêu Học Tập & Tính Năng Cốt Lõi

### 1. 📱 Cài Đặt PWA Độc Lập (Standalone PWA)
- **Web App Manifest**: Cấu hình chuẩn `manifest.webmanifest` với `display: standalone`, định hướng dọc (`orientation: portrait`), màu chủ đề `#00d9ff` / `#0284c7`, nền tối `#050a15` và hệ thống icon đa kích thước (192x192, 512x512).
- **Service Worker (Cache-First)**: Sử dụng Workbox `injectManifest` tại `src/sw.ts` lưu trữ toàn bộ tài nguyên App Shell (HTML, CSS, JS, Fonts Google Inter, SVG Icons), đảm bảo khởi động tức thì (**< 1s**) khi không có kết nối mạng.

### 2. 💾 Lưu Trữ Biểu Mẫu Ngoại Tuyến & Bản Nháp Cục Bộ
- **Phiếu kiểm tra 5 bước chuẩn hóa theo khuôn viên VKU**:
  1. **Bước 1 — Chọn Khu & Tòa nhà**: Phân nhóm trực quan theo 2 phân khu thực tế của VKU:
     - **Khu V**: Tòa A, Tòa B, Tòa C, Tòa D (`VA`, `VB`, `VC`, `VD`).
     - **Khu K**: Tòa A, Tòa B, Tòa C, Tòa D (`KA`, `KB`, `KC`, `KD`).
     - Lựa chọn nhanh qua thẻ Card với viền Neon Cyan phát sáng khi được chọn.
  2. **Bước 2 — Chọn Tầng & Số phòng**:
     - Danh sách tầng: Tầng Hầm, Tầng 1 đến Tầng 10.
     - Nhập số phòng cụ thể (ví dụ: `301`, `V-A201`...).
     - Nhập họ và tên người kiểm tra/thanh tra.
  3. **Bước 3 — Hạng mục kiểm tra**:
     - Phần cứng (🖥️), Máy chiếu (📽️), Điều hòa (❄️), Hệ thống điện (⚡), Bàn ghế / Nội thất (🪑).
  4. **Bước 4 — Đánh giá & Ghi chú**:
     - Đánh giá chất lượng từ 1 đến 5 sao tương tác mượt mà.
     - Ô ghi chú chi tiết phản ánh tình trạng hỏng hóc hoặc yêu cầu bảo trì.
  5. **Bước 5 — Chụp ảnh & Xác nhận phiếu**:
     - Chụp ảnh trực tiếp bằng Camera thiết bị hoặc chọn từ thư viện (tối đa 5 ảnh).
     - Cho phép xem trước ảnh, xóa ảnh đã chụp.
     - Tóm tắt toàn bộ dữ liệu trước khi gửi.
- **Tự động lưu nháp thời gian thực (IndexedDB)**:
  - Tích hợp thư viện `idb` lưu trữ bản nháp (`drafts` store) ngay tại mỗi bước chuyển đổi.
  - Tự động khôi phục dữ liệu đã nhập nếu người dùng vô tình làm mới trang hoặc đóng trình duyệt.

### 3. 🔄 Hàng Đợi Ngoại Tuyến & Đồng Bộ Hóa Nền (Offline Sync Queue)
- **Gắn thẻ dữ liệu**: Mỗi bài nộp ngoại tuyến được tạo định danh UUID v4 duy nhất, lưu vào IndexedDB với trạng thái `PENDING_SYNC`.
- **Tự động đồng bộ**:
  - Lắng nghe sự kiện `online` của trình duyệt và `@capacitor/network`.
  - Tự động kích hoạt hàng đợi tuần tự (`sequential processing`).
  - Áp dụng cơ chế **Exponential Backoff Retry** (thử lại tối đa 3 lần nếu máy chủ mất kết nối).
  - Cập nhật trạng thái thành `SYNCED` hoặc `SYNC_ERROR`.

### 4. 📊 Dashboard & Quản Lý Lịch Sử
- **Trang chủ (Dashboard)**: Thống kê số lượng theo 4 chỉ số (Tổng phiếu, Bản nháp, Chờ đồng bộ, Đã đồng bộ).
- **Banner kết nối**: Hiển thị trạng thái mạng thời gian thực (Online màu xanh / Ngoại tuyến màu đỏ).
- **Bộ lọc lịch sử**: Phân loại phiếu kiểm tra theo tab: *Tất cả*, *Nháp*, *Chờ đồng bộ*, *Đã đồng bộ*, *Lỗi*.
- **Chi tiết phiếu**: Xem đầy đủ thông tin, hiển thị gallery ảnh chụp, hỗ trợ thao tác xóa phiếu hoặc kích hoạt đồng bộ lại thủ công.

### 5. 🤖 Đóng Gói APK Android Gốc (Capacitor Bridge)
- Tích hợp `@capacitor/camera` chụp ảnh native phần cứng kết hợp fallback Web File Picker.
- Tích hợp `@capacitor/network` theo dõi trạng thái mạng native chuẩn xác.
- Đã cấu hình và kết nối sẵn nền tảng Android (`android/` project).

---

## 🛠️ Điều Kiện Tiên Quyết (Prerequisites)

- **Node.js**: v20.0.0 hoặc v22.0.0+
- **Package Manager**: `npm`
- **Công cụ biên dịch Android (dành cho đóng gói APK)**:
  - Android Studio & Android SDK (API 34+)
  - OpenJDK 21 hoặc JBR đi kèm Android Studio
  - Biến môi trường `JAVA_HOME` và `ANDROID_HOME` đã được cấu hình

---

## 📦 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cài Đặt Thư Viện (Dependencies)

Mở terminal tại thư mục gốc dự án (`d:/Mini_Project1`) và thực hiện:

```bash
npm install
```

### 2. Khởi Chạy Môi Trường Phát Triển (Dev Server)

```bash
npm run dev
```

Mở trình duyệt truy cập: **`http://localhost:5173`**

---

## 🏗️ Biên Dịch PWA & Đóng Gói APK Android

### Bước 1: Build Production Bundle

```bash
npm run build
```
Lệnh này sẽ biên dịch TypeScript, đóng gói CSS/JS qua Vite và tạo Service Worker `dist/sw.js` cùng precache manifest.

### Bước 2: Xem Trước PWA Production (Preview)

```bash
npm run preview
```
Truy cập **`http://localhost:4173`** để kiểm thử PWA trên môi trường build hoàn chỉnh.

### Bước 3: Đồng Bộ Tài Nguyên Sang Capacitor Android

```bash
npx cap sync
```
Lệnh này sao chép toàn bộ web assets từ thư mục `dist/` sang thư mục Android gốc `android/app/src/main/assets/public` và cập nhật các plugin native.

### Bước 4: Biên Dịch Tệp APK Android

**Cách 1: Sử dụng Gradle Wrapper trong thư mục android (Khuyến nghị)**
```bash
cd android
.\gradlew assembleDebug
cd ..
```

**Cách 2: Sử dụng Capacitor CLI**
```bash
npx cap build android
```

**Cách 3: Mở trong Android Studio để chạy máy ảo / điện thoại thật**
```bash
npx cap open android
```

---

## 📍 Vị Trí Tệp APK Sau Khi Biên Dịch

Sau khi lệnh biên dịch hoàn tất, tệp APK được tạo tại:

```
android\app\build\outputs\apk\debug\app-debug.apk
```

**Cách cài đặt lên điện thoại:**
1. Sao chép trực tiếp file `app-debug.apk` vào bộ nhớ điện thoại Android và nhấn cài đặt.
2. Hoặc cài đặt qua cổng kết nối USB với lệnh ADB:
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

## 🧪 Hướng Dẫn Kiểm Thử Chức Năng Ngoại Tuyến (Offline Testing)

### Kiểm thử PWA trên Trình Duyệt (Chrome / Edge DevTools)
1. Chạy lệnh `npm run dev` hoặc `npm run preview`.
2. Mở trình duyệt tại địa chỉ chạy ứng dụng và nhấn **F12** (mở DevTools).
3. Chuyển sang thẻ **Network** -> Thay đổi từ **No throttling** thành **Offline**.
4. **Quan sát giao diện**:
   - Huy hiệu (Badge) trên Header chuyển sang chấm đỏ `OFFLINE`.
   - Banner cảnh báo trên Trang chủ thông báo: *"Chế độ ngoại tuyến — Dữ liệu được lưu cục bộ, sẽ đồng bộ khi có mạng"*.
5. Nhấn nút **"+ Kiểm tra mới"**:
   - **Bước 1**: Lựa chọn Khu (Khu V hoặc Khu K) và chọn Tòa nhà (A, B, C, D).
   - **Bước 2**: Chọn tầng (ví dụ: Tầng 3), nhập số phòng (ví dụ: `V-302`), nhập tên thanh tra.
   - **Bước 3**: Chọn hạng mục (ví dụ: Máy chiếu 📽️).
   - **Bước 4**: Chấm sao đánh giá và nhập nội dung mô tả lỗi.
   - **Bước 5**: Chụp hoặc tải ảnh minh chứng, sau đó nhấn **"Gửi kiểm tra"**.
6. **Xác thực lưu trữ ngoại tuyến**:
   - Vào thẻ **Application** -> **IndexedDB** -> `vku-inspector-db` -> `inspections`.
   - Phiếu vừa tạo xuất hiện với trạng thái `PENDING_SYNC`.
7. **Kiểm thử tự động đồng bộ**:
   - Trong thẻ **Network**, chuyển từ **Offline** trở lại **No throttling** (Online).
   - Hệ thống tự động kích hoạt hàng đợi `syncQueue`, đẩy dữ liệu và cập nhật badge thành **ĐÃ ĐỒNG BỘ (Xanh lá)**.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
Mini_Project1/
├── index.html                    # Single Page App Shell với PWA meta & Font Inter
├── vite.config.ts                # Cấu hình Vite & vite-plugin-pwa (InjectManifest mode)
├── capacitor.config.ts           # Cấu hình Capacitor App ID (edu.vku.facility.inspector)
├── postcss.config.js             # Cấu hình PostCSS
├── tsconfig.json                 # Cấu hình TypeScript (ES2022, WebWorker & DOM types)
├── package.json                  # Khai báo các gói thư viện và script
├── README.md                     # Tài liệu hướng dẫn & thông số kỹ thuật dự án
├── public/
│   ├── favicon.svg               # Favicon biểu tượng ứng dụng
│   └── icons/                    # Bộ biểu tượng PWA chuẩn (192x192, 512x512)
├── src/
│   ├── main.ts                   # Điểm khởi chạy, định tuyến, nạp PWA Service Worker
│   ├── sw.ts                     # Service Worker tùy biến (Cache-First tài nguyên tĩnh & fonts)
│   ├── router.ts                 # SPA Hash Router hỗ trợ route tham số (`/detail/:id`)
│   ├── styles/
│   │   ├── index.css             # Hệ thống Design Tokens, Dark Theme & Cyan Neon Accent
│   │   ├── components.css        # Styles cho Header, Navigation, Building Cards, Badges
│   │   └── animations.css        # Hiệu ứng chuyển động Micro-animations mượt mà
│   ├── db/
│   │   ├── schema.ts             # Định nghĩa cấu trúc dữ liệu, Phân khu V/K và Stores
│   │   └── database.ts           # Tương tác IndexedDB (CRUD kiểm tra & tự động lưu nháp)
│   ├── services/
│   │   ├── network-monitor.ts    # Giám sát trạng thái mạng thời gian thực
│   │   ├── sync-queue.ts         # Hàng đợi ngoại tuyến & cơ chế thử lại Exponential Backoff
│   │   └── camera.ts             # Tích hợp Native Capacitor Camera & Web file fallback
│   ├── components/
│   │   ├── header.ts             # Thanh tiêu đề ứng dụng + Live Network Status
│   │   ├── nav.ts                # Thanh điều hướng dưới đáy (Bottom Navigation Bar)
│   │   ├── star-rating.ts        # Component đánh giá 1-5 sao
│   │   ├── step-indicator.ts     # Thanh tiến trình quy trình 5 bước kiểm tra
│   │   ├── toast.ts              # Thông báo nhanh (Toast Notification System)
│   │   └── sync-status.ts        # Các huy hiệu hiển thị trạng thái đồng bộ
│   ├── pages/
│   │   ├── home.ts               # Màn hình Dashboard tổng quan & thao tác nhanh
│   │   ├── inspection-form.ts    # Biểu mẫu kiểm tra 5 bước (Khu V/K, Tòa nhà, Tầng...)
│   │   ├── history.ts            # Màn hình lịch sử kiểm tra kèm bộ lọc trạng thái
│   │   └── inspection-detail.ts  # Màn hình xem chi tiết phiếu, ảnh & đồng bộ lại
│   └── utils/
│       ├── uuid.ts               # Tiện ích sinh mã UUID v4
│       └── date.ts               # Định dạng ngày giờ chuẩn Tiếng Việt
└── android/                      # Thư mục dự án mã nguồn Android Native (Capacitor)
    └── app/build/outputs/apk/debug/app-debug.apk  # Tệp APK hoàn chỉnh sau khi build
```

---

## 👨‍💻 Công Nghệ Sử Dụng

- **Frontend Core**: HTML5, TypeScript, Vanilla CSS (Design system dark mode & Cyan glassmorphism)
- **PWA & Offline-First**: Service Worker API, Workbox (`vite-plugin-pwa`), IndexedDB (`idb` library)
- **Native Bridge**: Capacitor 8 Core, `@capacitor/camera`, `@capacitor/network`, `@ionic/pwa-elements`
- **Build Tooling**: Vite 8, TypeScript Compiler, Android Gradle Plugin (AGP)
