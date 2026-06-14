# Security and deliverability notes

## Secrets

Jangan commit file `.env`, `.env.local`, atau API key ke GitHub. Simpan API key Resend di Vercel Environment Variables.

Kalau API key pernah terlihat publik, revoke/delete key tersebut dan buat API key baru.

## Form protection

Endpoint `/api/contact` sudah menambahkan:

- validasi server-side;
- escape HTML;
- honeypot field;
- minimum form fill time;
- rate limit best-effort per IP dan email;
- request body size limit;
- optional `ALLOWED_ORIGIN`.

Jika spam meningkat, tambahkan Cloudflare Turnstile atau rate limiter external seperti Upstash Redis.

## Email deliverability

Agar email lebih kecil kemungkinan masuk spam:

1. Pakai domain verified di Resend.
2. Tambahkan DMARC di DNS.
3. Gunakan sender seperti `konsultasi@domain`, bukan `noreply@domain`.
4. Jangan test dengan teks acak atau email palsu.
5. Jangan kirim link `localhost` di production email.
6. Klik `Report not spam` untuk email test dari domain sendiri jika Gmail masih menaruh di spam.

Tetap tidak ada jaminan 100% inbox, karena mailbox provider menilai reputasi domain dan perilaku penerima.
