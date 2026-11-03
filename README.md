# VieTure Studio — Website

Website giới thiệu VieTure Studio. **Build Ideas. Engineer the Future.**

- **React 19 + TypeScript** (`.tsx` giao diện, `.ts` server và phần dùng chung), mỗi component một thư mục
- Server **Node.js + Express** render React sẵn ra HTML (SSR) rồi trình duyệt tiếp quản (hydrate) — tốt cho SEO
- Trang quản trị `/admin` (React) để sửa toàn bộ nội dung, blog, tuyển dụng, hộp thư…
- Song ngữ Việt / Anh · Docker + Nginx trên VPS

## Yêu cầu

- Node.js 22 trở lên

## Chạy trên máy

```bash
npm install
cp .env.example .env     # điền SMTP nếu muốn nhận email thật
npm run cli -- create-user admin admin   # tạo tài khoản quản trị (in ra mật khẩu)
npm run dev              # http://localhost:3000  (web + /admin + API, tự tải lại khi sửa)
```

| Lệnh                | Việc làm                                                        |
| ------------------- | --------------------------------------------------------------- |
| `npm run dev`       | Server phát triển (Vite + SSR + hot reload), một cổng duy nhất  |
| `npm run typecheck` | Kiểm tra kiểu TypeScript toàn dự án                             |
| `npm run build`     | Build client, bundle SSR và server ra `dist/`                   |
| `npm start`         | Chạy bản production từ `dist/`                                  |
| `npm run cli`       | Tạo / đặt lại tài khoản admin (`create-user`, `reset-password`, `list-users`) |

## Cấu trúc

```
index.html, admin.html        # khung HTML (server chèn nội dung trang vào)
src/
  shared/                     # dùng chung server + trình duyệt
    types.ts                  #   kiểu dữ liệu của toàn bộ nội dung
    default-content.ts        #   nội dung mặc định ban đầu
    rich.ts, article.ts       #   định dạng chữ / bài viết an toàn (không cho chèn HTML)
    icons.ts
  server/
    index.ts                  # Express: SSR các trang, API, bảo mật (Helmet, CSP)
    routes/                   # admin.ts, posts.ts (blog), forms.ts (liên hệ + ứng tuyển)
    services/                 # store.ts (lưu file + lịch sử), auth.ts, blog.ts (RSS, sitemap, SEO)
    cli.ts
  client/
    fonts/                    # Inter + JetBrains Mono (tự host)
    site/                     # trang công khai (React)
      entry-client.tsx        #   trình duyệt tiếp quản trang
      entry-server.tsx        #   render trên server
      App.tsx, context.tsx
      pages/                  #   Home/, Blog/, Privacy/
      components/<Tên>/       #   Hero/, Services/, Careers/, Contact/… mỗi thư mục có .tsx + .css
      ui/, hooks/, styles/
    admin/                    # trang quản trị (React)
      App.tsx, schema.ts      #   schema.ts = mô tả các mục admin có thể sửa
      state/, fields/, layout/, ui/, lib/
      pages/<Trang>/          #   Dashboard/, Content/, Blog/, Inbox/, Applications/, Users/…
public/                       # favicon, logo, og.png, robots.txt
Dockerfile, docker-compose.yml, deploy/ (nginx.conf, deploy.sh)
```

## Trang quản trị (/admin)

Toàn bộ nội dung web được sửa tại **`/admin`** — không cần sửa code hay build lại:

| Trang | Làm gì |
| --- | --- |
| Tổng quan | Số yêu cầu chưa đọc, phiên bản nội dung, liên hệ mới nhất |
| Nội dung trang chủ | Bật/tắt, sắp xếp các mục; sửa chữ VI/EN; thêm/xoá/sắp xếp lĩnh vực, FAQ, dự án, quy trình…; **+ Thêm khối mới** (Văn bản, Lưới thẻ, Ảnh + chữ, Dải kêu gọi, Bộ sưu tập ảnh) |
| Menu & liên kết | Menu chính, liên kết chân trang, mạng xã hội |
| Thông tin & SEO | Email, điện thoại, Zalo, địa chỉ, **+ kênh liên hệ khác**, nút liên hệ nổi, tiêu đề/mô tả Google |
| Chính sách bảo mật | Nội dung trang `/privacy` |
| Hộp thư liên hệ | Xem, đánh dấu đã đọc, xoá, xuất CSV |
| Blog / Tin tức | Viết bài VI/EN với thanh công cụ + xem trước, ảnh bìa, chuyên mục, thẻ, nháp/đăng/hẹn giờ |
| Hồ sơ ứng tuyển | Lọc theo vị trí/trạng thái, đổi trạng thái (Mới → Phỏng vấn → Đạt/Từ chối), ghi chú, tải CV, xuất CSV |
| Thư viện ảnh | Tải ảnh (PNG/JPG/WebP/GIF ≤ 4MB) cho dự án |
| Lịch sử thay đổi | 30 phiên bản gần nhất, khôi phục 1 click |
| Người dùng | Thêm/xoá, đổi quyền, đặt lại mật khẩu (chỉ Quản trị viên) |

**Quyền:** *Quản trị viên* — toàn quyền. *Biên tập viên* — mọi thứ trừ quản lý người dùng.

**Định dạng chữ** (an toàn, không cho chèn HTML): `[chữ]` → màu gradient, `**chữ**` → đậm,
`[chữ](https://...)` → link, xuống dòng → xuống dòng.

**Tạo tài khoản đầu tiên:** đặt `ADMIN_USERNAME` + `ADMIN_PASSWORD` trong `.env` trước lần chạy đầu,
hoặc dùng lệnh:

```bash
docker compose exec web node dist/server/cli.js create-user <ten> admin     # in ra mật khẩu ngẫu nhiên
docker compose exec web node dist/server/cli.js reset-password <ten>
docker compose exec web node dist/server/cli.js list-users
```

Dữ liệu nằm trong `data/` (volume Docker): `content.json`, `users.json`, `contacts.jsonl`,
`applications.jsonl` + `applications/` (CV, chỉ admin tải được), `history/`, `uploads/`. **Sao lưu thư mục này là đủ.** Nội dung mặc định ban đầu: `src/shared/default-content.ts`.

## Chính sách bảo mật

Trang `/privacy.html` (VI/EN), nội dung trong `src/privacy-content.js`. Form liên hệ bắt buộc tích ô đồng ý
(kiểm tra cả ở trình duyệt và máy chủ; mỗi yêu cầu lưu kèm `consent: true`).
**Đây là bản mẫu — hãy rà soát (thời gian lưu giữ, nhà cung cấp email…) trước khi công bố.**

## Form liên hệ

`POST /api/contact` — kiểm tra dữ liệu, chống spam (honeypot + giới hạn 5 lần/15 phút/IP), rồi:

1. Luôn lưu vào `data/contacts.jsonl`
2. Hiện trong **Hộp thư liên hệ** ở trang quản trị
3. Gửi email tới `CONTACT_TO` (hoặc email trong *Thông tin & SEO*) nếu đã cấu hình SMTP trong `.env`

**Gmail:** bật xác minh 2 bước → tạo *App password* tại https://myaccount.google.com/apppasswords →
dán vào `SMTP_PASS`.

Nếu site được host tĩnh (không có máy chủ Node), form tự chuyển sang mở ứng dụng email của khách.

## Triển khai lên VPS (Docker + Nginx)

```bash
# Trên VPS (đã cài Docker, Nginx)
git clone <repo> vieture-studio && cd vieture-studio
cp .env.example .env && nano .env        # điền SMTP
docker compose up -d --build             # app chạy ở 127.0.0.1:3000

sudo cp deploy/nginx.conf /etc/nginx/sites-available/vieture-studio
sudo nano /etc/nginx/sites-available/vieture-studio   # đổi example.com thành tên miền
sudo ln -s /etc/nginx/sites-available/vieture-studio /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d tenmien.com -d www.tenmien.com   # HTTPS miễn phí
```

### Cập nhật web (giữ nguyên dữ liệu admin)

Từ máy phát triển, sau khi commit:

```bash
./deploy/deploy.sh
```

Script tự sao lưu `data/` vào `/root/backups` trên VPS (giữ 20 bản), rồi **chỉ cập nhật code**.
`data/` (nội dung, tài khoản, hộp thư, ảnh, lịch sử) và `.env` không bao giờ bị ghi đè.
Khi bản mới có thêm chữ hoặc mục mặc định, server chỉ **bổ sung phần còn thiếu** vào `content.json`,
không động vào nội dung đã sửa trong admin.

Khôi phục dữ liệu từ bản sao lưu (trên VPS):

```bash
cd /opt/VieTure-Studio && docker compose stop
tar xzf /root/backups/vieture-data-YYYYMMDD-HHMMSS.tgz && docker compose start
```
Yêu cầu liên hệ được lưu ở `./data/contacts.jsonl` trên VPS.

## Chất lượng

Lighthouse (bản build production, nhiều lần đo ngày 2026-10-17; điểm hiệu năng dao động theo tải máy):

| Thiết bị   | Performance | Accessibility | Best Practices | SEO |
| ---------- | ----------- | ------------- | -------------- | --- |
| Điện thoại | 86–92       | 100           | 100            | 100 |
| Máy tính   | 97–100      | 100           | 100            | 100 |

## Font chữ

- Toàn bộ trang: **Inter** (bản variable, mọi độ đậm 100–900 trong một file)
- Nhãn kỹ thuật: **JetBrains Mono** (500)

Chỉ nạp bộ ký tự Latin + tiếng Việt, tự host (xem `src/fonts.css`, `src/fonts.js`).

## Tuyển dụng

- **Đăng tin**: *Hồ sơ ứng tuyển → + Đăng tin tuyển dụng mới* (hoặc *Nội dung trang chủ → Tuyển dụng*). Mỗi vị trí có
  trang riêng `/careers/<mã>` (Google Jobs), danh sách ở `/careers`, nhận CV tự do ở `/careers/general`.
  Vị trí hết hạn hoặc bỏ tích *Đang tuyển* tự ẩn.
- **Ứng viên** điền hồ sơ 4 bước như một CV đầy đủ (ảnh chân dung, học vấn, chứng chỉ, ngoại ngữ, kinh nghiệm,
  dự án, người tham chiếu…); file CV PDF hoặc link chỉ là tuỳ chọn. Các lựa chọn và nhóm mục nằm ở `src/shared/apply.ts`.
- **Admin** (*Hồ sơ ứng tuyển*): thanh giai đoạn (Mới → Đang xem xét → Phỏng vấn → Đạt → Đề nghị nhận việc →
  Đã nhận việc / Không phù hợp), tìm kiếm & lọc, chấm sao, đặt lịch phỏng vấn (+ file lịch `.ics`), email mẫu
  (xác nhận, mời phỏng vấn, offer, từ chối), ghi chú, lịch sử thao tác, in / lưu PDF từng hồ sơ, xuất CSV.
- CV và ảnh lưu riêng tư trong `data/applications/`, chỉ xem được khi đã đăng nhập admin. Có SMTP / Telegram
  thì mỗi hồ sơ mới được báo ngay.

## Blog

Trang `/blog` (lọc theo chuyên mục) và `/blog/<đường-dẫn>` được **server dựng sẵn HTML** (Google đọc trực tiếp),
có canonical, Open Graph, dữ liệu cấu trúc `BlogPosting`, bài liên quan, nút chia sẻ. `/blog/rss.xml` và
`/sitemap.xml` tự cập nhật. Trang chủ có mục *Tin tức* hiện 3 bài mới nhất. Bài lưu trong `data/posts.json`.

Định dạng nội dung bài: `## Tiêu đề`, `### Tiêu đề nhỏ`, `- gạch đầu dòng`, `1. danh sách số`, `> trích dẫn`,
`![chú thích](/uploads/anh.jpg)`, khối code ```` ``` ````, cộng định dạng chữ chung (`**đậm**`, `[nổi bật]`, `[link](url)`).

Các trang là ứng dụng JavaScript nạp từ khung HTML; địa chỉ công khai **không có đuôi `.html`**
(`/privacy.html` → 301 → `/privacy`).
