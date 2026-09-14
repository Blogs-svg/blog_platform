# QalamBlog — Blog Platformasi

Ro'yxatdan o'tish / tizimga kirish tizimiga ega, to'liq ishlaydigan blog platformasi.
Backend: **Node.js + Express**. Frontend: sof **HTML, CSS, JavaScript**.

## Ishga tushirish (Visual Studio Code)

1. Ushbu papkani Visual Studio Code (yoki Visual Studio) da oching.
2. Terminalni oching (`Ctrl+ö` yoki `Terminal → New Terminal`) va quyidagini yozing:

   ```bash
   npm install
   ```

3. Serverni ishga tushiring:

   ```bash
   npm start
   ```

4. Brauzerda oching: **http://localhost:3000**

Server ishga tushganda terminalda `✅ Server ishlamoqda: http://localhost:3000` deb chiqadi.

## Imkoniyatlar

- ✅ Ro'yxatdan o'tish (parol `bcrypt` bilan shifrlanadi)
- ✅ Tizimga kirish / chiqish (sessiya orqali, cookie saqlanadi)
- ✅ Barcha foydalanuvchilar postlarini ko'rish (bosh sahifa)
- ✅ Faqat o'z akkountidan post yozish, tahrirlash, o'chirish ("Mening postlarim" panel)
- ✅ Boshqa foydalanuvchi postini tahrirlay olmaydi (ruxsat tekshiruvi backendda)

## Loyiha tuzilishi

```
blog-platform/
├── server.js              # Express server + API (auth, posts)
├── package.json
├── data/
│   ├── users.json         # Foydalanuvchilar bazasi (JSON fayl)
│   └── posts.json         # Postlar bazasi (JSON fayl)
└── public/
    ├── index.html          # Bosh sahifa (postlar ro'yxati)
    ├── login.html          # Kirish sahifasi
    ├── register.html       # Ro'yxatdan o'tish sahifasi
    ├── post.html           # Bitta post ko'rish sahifasi
    ├── dashboard.html      # Post yaratish / tahrirlash / o'chirish paneli
    ├── css/style.css
    └── js/main.js
```

## Ma'lumotlar qayerda saqlanadi?

Bu demo versiya ma'lumotlarni `data/users.json` va `data/posts.json` fayllarida saqlaydi
(oddiy fayl bazasi — o'rnatish talab qilmaydi). Agar keyinchalik haqiqiy bazaga
(masalan, MongoDB yoki PostgreSQL) o'tkazmoqchi bo'lsangiz, faqat `server.js` dagi
`readJSON`/`writeJSON` funksiyalarini almashtirish kifoya — API va frontend o'zgarmaydi.

## Muammo yuzaga kelsa

- **"npm: command not found"** — Node.js o'rnatilmagan. https://nodejs.org dan yuklab oling.
- **Port band bo'lsa** — `server.js` faylida `PORT` qiymatini o'zgartiring (masalan, 4000).
- **Ma'lumotlarni tozalash** — `data/users.json` va `data/posts.json` fayllarini `[]` qilib qo'ying.
