# Y2TB-Bot Lite (No Panel)

Bot Facebook Messenger nhẹ, chạy bằng Node.js, hỗ trợ tự cập nhật và hệ thống plugin.

## Yêu cầu
- Node.js >= 16
- npm
- Tài khoản Facebook hoặc `fbstate.json` đã xuất trước đó

## Cài đặt nhanh
```bash
git clone https://github.com/VangBanLaNhat/Y2TB-Bot-lite-noPanel.git
cd Y2TB-Bot-lite-noPanel-main
npm install

# Cấu hình
# 1) Sửa thông tin bot và account tại udata/config.json
# 2) Điều chỉnh tham số lõi tại core/coreconfig.json

npm start
```

### Thông tin đăng nhập
- Ưu tiên đặt file `udata/fbstate.json` (appstate) để đăng nhập không cần mật khẩu.
- Nếu không có, điền `facebook.FBemail` và `facebook.FBpassword` trong `udata/config.json` (cẩn trọng với bảo mật tài khoản).

## Cấu trúc hiện tại
```
.
├─ main.js                # Tiến trình giám sát/restart index.js
├─ index.js               # Luồng chính: cập nhật, nạp config, data, plugin, đăng nhập FB
├─ core/
│  ├─ communication/      # Kết nối Facebook (fb.js)
│  ├─ loadPlugins/        # Plugin lõi (tự nạp)
│  └─ util/               # Tiện ích: config/data loader, log, scanDir, ...
├─ plugins/               # Plugin do người dùng thêm; danh sách tại pluginList.json
├─ data/                  # data.json, user.json (tự sinh, không commit)
├─ udata/                 # config người dùng, fbstate; nên giữ riêng tư
├─ lang/                  # Chuỗi ngôn ngữ, Help.json
├─ logs/                  # Log xoay vòng theo ngày
├─ err.js                 # Xử lý lỗi (nếu dùng)
├─ package.json           # Thông tin gói, script npm
└─ README.md
```

## Cấu hình
- `udata/config.json`
	- `bot_info.botname`, `bot_info.lang`
	- `facebook.prefix`, `admin`, `autoMarkRead`, `selfListen`, `UIDmode`, `blackList`, `whiteList`
	- `FBemail` / `FBpassword` chỉ cần khi không có `fbstate.json`
- `core/coreconfig.json`
	- `main_bot.dataSaveTime` (giây), `developMode`, `toggleLog`, `toggleDebug`
	- `facebook.logLevel`, `userAgent`, `listenEvents`, `updatePresence`

## Plugin
- Đặt plugin người dùng tại `plugins/` và khai báo trong `plugins/pluginList.json`.
- Plugin lõi nằm trong `core/loadPlugins/`, được `loadPlugin.js` tự động nạp.
- Cần ngôn ngữ hay config riêng: thêm file vào `lang/` hoặc `udata/Plugins config/` tùy plugin.

## Dữ liệu & log
- Runtime data: `data/data.json`, `data/user.json` (tự lưu định kỳ; không chỉnh tay khi bot đang chạy).
- Log: `logs/` (được dọn theo ngày hiện tại).

## Cơ chế cập nhật
- `index.js` kiểm tra version GitHub, tải về vào thư mục `update/` rồi tự khởi động lại với mã thoát `7378278`.
- Không sửa tay thư mục `update/`; để bot tự xoá sau khi hoàn tất.

## Gợi ý cải tổ cấu trúc (chưa áp dụng)
- Tách mã nguồn vào `src/` và giữ `data/` / `logs/` ngoài: `src/runtime/index.js`, `src/core/...`, `src/plugins/`.
- Đưa cấu hình mẫu ra `config/config.example.json` và `config/coreconfig.example.json`, rồi ignore bản thật.
- Gom script CLI (xuất fbstate, reset data, lint) vào `scripts/`.
- Thêm `docs/` cho hướng dẫn plugin và API nội bộ.

## Lệnh hữu ích
- `npm start` / `npm test`: chạy bot
- Dừng bot: `Ctrl + C`

## Giấy phép
ISC
