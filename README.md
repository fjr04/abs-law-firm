# ABS Law Office Final V25 — Insurance Polish

Website production-ready untuk ABS Law Office: static frontend ringan + backend kecil `/api/contact` untuk Resend.

## Final fixes di V21

- Favicon/app icon otomatis dibuat dari `public/assets/images/logo.png` saat build.
- Section **Tentang Kami** dikembalikan ke layout teks original yang lebih clean, tetapi tetap memakai motion/hover halus.
- Template email admin dan konfirmasi pengguna memakai logo image ABS, bukan watermark teks “ABS”.
- Teks fallback “Jika tombol tidak otomatis...” di email admin dihapus.
- Tombol WhatsApp tetap ada di website, tetapi tidak ada di template email.
- Fitur email/security tetap dipertahankan.

## File gambar yang perlu dimasukkan

Copy gambar lama ke:

```text
public/assets/images/
```

Minimal:

```text
logo.png
hero.jpg
team-andi.jpg
team-iskandar.jpg
team-adam.jpg
team-widi.jpg
team-caryo.jpg
team-fatha.jpg
team-fauzul.jpg
team-ali.jpg
activity-1/1.jpg
activity-2/1.jpg
activity-3/1.jpg
activity-4/1.jpg
activity-5/1.jpg
activity-6/1.jpg
```

`logo.png` dipakai untuk navbar, favicon/app icon, dan logo header email production. Untuk email, logo hanya tampil jika `SITE_URL` adalah domain publik HTTPS atau Anda mengisi `EMAIL_LOGO_URL`.

## Test lokal

```bash
npm install
cp .env.example .env.local
nano .env.local
npm run local
```

Buka:

```text
http://localhost:3000
```

Gunakan `npm run local` untuk test form/email karena command ini menjalankan frontend dan endpoint `/api/contact` bersamaan.

## Env lokal contoh

```env
RESEND_API_KEY=re_KEY_BARU_ANDA
MAIL_TO=abs.lawoffice88@gmail.com
MAIL_REPLY_TO=abs.lawoffice88@gmail.com
MAIL_FROM="ABS Law Office <konsultasi@fajarrizky.my.id>"
SITE_URL=http://localhost:3000
EMAIL_LOGO_URL=
SEND_USER_CONFIRMATION=true
ALLOWED_ORIGIN=
```

Untuk production, ubah `SITE_URL` dan `ALLOWED_ORIGIN` ke domain HTTPS final.

## Deploy Vercel

```text
Framework Preset : Other
Install Command  : npm install
Build Command    : npm run build
Output Directory : dist
```

Environment Variables Vercel:

```env
RESEND_API_KEY=re_KEY_BARU_ANDA
MAIL_TO=abs.lawoffice88@gmail.com
MAIL_REPLY_TO=abs.lawoffice88@gmail.com
MAIL_FROM=ABS Law Office <konsultasi@fajarrizky.my.id>
SITE_URL=https://fajarrizky.my.id
EMAIL_LOGO_URL=
SEND_USER_CONFIRMATION=true
ALLOWED_ORIGIN=https://fajarrizky.my.id
```

Setelah env diubah, lakukan **Redeploy**.

## Domain yang perlu disesuaikan

Edit:

```text
src/index.html
public/robots.txt
public/sitemap.xml
Vercel Environment Variables
```

Cari placeholder:

```bash
grep -RIn "example.com\|localhost\|vercel.app" src public api .env.example README.md SECURITY_NOTES.md
```

## Catatan deliverability

Tidak ada sistem yang bisa menjamin email 100% selalu masuk inbox karena Gmail tetap memakai reputasi domain, isi pesan, engagement penerima, dan histori spam report. Namun V21 sudah dibuat lebih aman:

- pakai domain verified Resend;
- gunakan sender manusiawi seperti `konsultasi@domain`, bukan `noreply@domain`;
- template user confirmation dibuat sederhana dan tidak memakai tombol marketing;
- tidak menampilkan link `localhost` di email production;
- tetap ada plain text email fallback.

Tambahkan DMARC di DNS Cloudflare:

```text
Type: TXT
Name: _dmarc
Content: v=DMARC1; p=none; rua=mailto:fajarrizky04febriano@gmail.com; adkim=s; aspf=s
TTL: Auto
```

Mulai dari `p=none`, lalu naikkan kebijakan jika reputasi/domain sudah stabil.

## Jangan commit

```text
.env.local
.env
node_modules/
dist/
.vercel/
```


## Fokus konten V25

Narasi pemasaran dan bagian layanan difokuskan pada pendampingan hukum profesional di bidang asuransi: review polis, klaim ditolak atau tertunda, negosiasi, mediasi, dan sengketa klaim. Fitur form, Resend, WhatsApp, keamanan, struktur aset, dan proses deployment tidak diubah.
# abs-law-firm
