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
# 1) Sửa thông tin bot và account tại config/config.env (copy từ config/config.env.example)

npm start
```

### Thông tin đăng nhập
- Ưu tiên đặt file `config/fbstate.json` (appstate) để đăng nhập không cần mật khẩu.
- Nếu không có, điền `Y2TB_CFG_FACEBOOK_FBEMAIL` và `Y2TB_CFG_FACEBOOK_FBPASSWORD` trong `config/config.env` (cẩn trọng với bảo mật tài khoản).

## Cấu trúc hiện tại
```
.
├─ src/
│  ├─ main.js            # Tiến trình giám sát/restart src/index.js
│  ├─ index.js           # Luồng chính: cập nhật, nạp config, data, plugin, đăng nhập FB
│  ├─ core/              # communication/, loadPlugins/, util/
│  └─ plugins/           # Plugin chính; danh sách tại pluginList.json
├─ config/               # Config env + sample, fbstate/fbsstate, plugins/
├─ data/                 # data.json, user.json (tự sinh, không commit)
├─ lang/                 # Chuỗi ngôn ngữ, Help.json
├─ logs/                 # Log xoay vòng theo ngày
├─ err.js                # Xử lý lỗi (nếu dùng)
├─ package.json          # Thông tin gói, script npm
└─ README.md
```

## Cấu hình
- `config/config.env.example` → copy sang `config/config.env` rồi chỉnh.
- Cấu hình chính dùng biến môi trường:
	- Config thường: `Y2TB_CFG_<SECTION>_<KEY>`
	- Core config: `Y2TB_CORE_<SECTION>_<KEY>`

## Plugin
- Đặt plugin người dùng tại `src/plugins/` và khai báo trong `src/plugins/pluginList.json`.
- Plugin lõi nằm trong `src/core/loadPlugins/`, được `loadPlugin.js` tự động nạp.
- Cần ngôn ngữ hay config riêng: thêm file vào `lang/` hoặc `config/plugins/` tùy plugin.
- Config runtime của plugin vẫn dùng file JSON trong `config/plugins/`.

## Dữ liệu & log
- Runtime data: `data/data.json`, `data/user.json` (tự lưu định kỳ; không chỉnh tay khi bot đang chạy).
- Log: `logs/` (được dọn theo ngày hiện tại).

## Cơ chế cập nhật
- `index.js` kiểm tra version GitHub, tải về vào thư mục `update/` rồi tự khởi động lại với mã thoát `7378278`.
- Không sửa tay thư mục `update/`; để bot tự xoá sau khi hoàn tất.

## Ghi chú
- Runtime data và log nằm ngoài `src/`; không commit `data/`, `logs/`, `update/`, `config/config.env`, `config/fbstate.json`, `config/fbsstate.json`.
- Nếu đổi vị trí thư mục, nhớ cập nhật biến `ROOT` trong các file nguồn.

## Lệnh hữu ích
- `npm start` / `npm test`: chạy bot
- Dừng bot: `Ctrl + C`

## Giấy phép
ISC
