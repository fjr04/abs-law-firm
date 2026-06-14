const MAX_FIELD_LENGTH = 5000;
const MAX_MESSAGE_LENGTH = 8000;
const MAX_BODY_BYTES = 50 * 1024;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_PER_IP = 8;
const RATE_LIMIT_PER_EMAIL = 4;
const MIN_FORM_FILL_MS = 2500;

const buckets = new Map();

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
};

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalize(value = '', maxLength = MAX_FIELD_LENGTH) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function normalizeMessage(value = '') {
  return String(value || '').trim().replace(/\r\n/g, '\n').slice(0, MAX_MESSAGE_LENGTH);
}

function isValidEmail(email) {
  if (!email || email.length > 180) return false;
  if (/\.\./.test(email)) return false;
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email);
}

function splitEmails(value = '') {
  return String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .filter(isValidEmail);
}

function getClientIp(headers = {}) {
  const direct = headers['x-forwarded-for'] || headers['X-Forwarded-For'] || headers['x-real-ip'] || headers['X-Real-IP'];
  return String(direct || 'unknown').split(',')[0].trim() || 'unknown';
}

function cleanupBuckets(now) {
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.startedAt > RATE_WINDOW_MS * 2) buckets.delete(key);
  }
}

function hitRateLimit(key, limit) {
  const now = Date.now();
  cleanupBuckets(now);
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.startedAt > RATE_WINDOW_MS) {
    buckets.set(key, { startedAt: now, count: 1 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}

function looksTooSpammy({ name, email, subject, message }) {
  const combined = `${name} ${email} ${subject} ${message}`.toLowerCase();
  const urls = combined.match(/https?:\/\/|www\./g) || [];
  if (urls.length > 2) return true;
  const repeated = /(.)\1{12,}/.test(combined);
  if (repeated) return true;
  const messageLetters = message.replace(/\s/g, '');
  if (messageLetters.length < 12) return true;
  return false;
}

function formatJakartaTime(date = new Date()) {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date) + ' WIB';
  } catch (_) {
    return date.toISOString();
  }
}

function sanitizeForSubject(value = '', fallback = 'Tanpa Subjek') {
  const clean = normalize(value, 90).replace(/[\r\n]+/g, ' ');
  return clean || fallback;
}

function buildReplyMailto({ email }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  return `mailto:${cleanEmail}`;
}

function buildGmailComposeUrl({ email, emailSubject }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanSubject = `Re: ${emailSubject}`;
  const cleanBody = 'Halo,\n\nTerima kasih telah menghubungi ABS Law Office.\n\n';
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(cleanEmail)}&su=${encodeURIComponent(cleanSubject)}&body=${encodeURIComponent(cleanBody)}`;
}

function buildEmailHeaders(type = 'notification') {
  return {
    'X-ABS-Email-Type': type,
    'X-Entity-Ref-ID': `abs-${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`
  };
}

function buildEmailLogoUrl(siteUrl = '') {
  const direct = normalize(process.env.EMAIL_LOGO_URL || '', 500);
  if (direct && /^https?:\/\//i.test(direct)) return direct;

  const base = normalize(siteUrl || process.env.SITE_URL || '', 500);
  if (!base || base.includes('localhost')) return '';

  return `${base.replace(/\/+$/, '')}/assets/images/logo.png`;
}

function buildEmailHeaderLogo(logoUrl = '') {
  if (!logoUrl) {
    return '';
  }

  return `<img src="${escapeHtml(logoUrl)}" width="150" alt="ABS Law Office" style="display:block;width:150px;max-width:150px;height:auto;border:0;outline:none;text-decoration:none;">`;
}

function buildAdminEmailHtml({ name, email, subject, message, page, submittedAt, emailSubject, siteUrl }) {
  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    subject: escapeHtml(subject),
    message: escapeHtml(message).replace(/\n/g, '<br>'),
    page: escapeHtml(page || '-'),
    submittedAt: escapeHtml(submittedAt),
    emailSubject: escapeHtml(emailSubject),
    logoUrl: buildEmailLogoUrl(siteUrl)
  };
  const gmailReply = escapeHtml(buildGmailComposeUrl({ email, emailSubject }));

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safe.emailSubject}</title>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2f7;padding:30px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:740px;border-collapse:separate;border-spacing:0;">
          <tr>
            <td style="background:#040b16;border-radius:28px 28px 0 0;padding:34px 36px 30px;border-bottom:5px solid #C59B27;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:top;">
                    ${buildEmailHeaderLogo(safe.logoUrl) ? `<div style="margin-bottom:20px;">${buildEmailHeaderLogo(safe.logoUrl)}</div>` : `<div style="font-size:12px;letter-spacing:4px;text-transform:uppercase;color:#F9D976;font-weight:800;margin-bottom:14px;">ABS Law Office</div>`}
                    <h1 style="margin:0;color:#ffffff;font-size:30px;line-height:1.2;font-weight:800;">Permintaan Konsultasi Baru</h1>
                    <p style="margin:12px 0 0;color:#c3cbd6;font-size:14px;line-height:1.7;">Seseorang mengirim pesan melalui formulir website resmi ABS Law Office.</p>
                  </td>
                  <td style="width:24px;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background:#ffffff;border-left:1px solid #e4e8ef;border-right:1px solid #e4e8ef;padding:30px 36px 10px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:0 0 20px;">
                    <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8a94a6;font-weight:800;margin-bottom:7px;">Nama / Instansi</div>
                    <div style="font-size:19px;line-height:1.5;color:#111827;font-weight:800;">${safe.name}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 20px;">
                    <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8a94a6;font-weight:800;margin-bottom:7px;">Email Pengirim</div>
                    <a href="mailto:${safe.email}" style="font-size:18px;color:#0b63ce;text-decoration:none;font-weight:800;">${safe.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 18px;">
                    <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8a94a6;font-weight:800;margin-bottom:7px;">Subjek Keperluan</div>
                    <div style="font-size:18px;line-height:1.5;color:#111827;font-weight:800;">${safe.subject}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background:#ffffff;border-left:1px solid #e4e8ef;border-right:1px solid #e4e8ef;padding:0 36px 28px;">
              <div style="background:#f8fafc;border:1px solid #e4e8ef;border-radius:20px;padding:22px 24px;">
                <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8a94a6;font-weight:800;margin-bottom:10px;">Deskripsi Singkat</div>
                <div style="font-size:16px;line-height:1.85;color:#1f2937;">${safe.message}</div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#ffffff;border-left:1px solid #e4e8ef;border-right:1px solid #e4e8ef;padding:0 36px 30px;">
              <p style="margin:0 0 6px;font-size:13px;color:#64748b;line-height:1.7;"><strong>Waktu masuk:</strong> ${safe.submittedAt}</p>
              <p style="margin:0 0 20px;font-size:13px;color:#64748b;line-height:1.7;"><strong>Halaman:</strong> ${safe.page}</p>
              <a href="${gmailReply}" target="_blank" rel="noopener" style="display:inline-block;background:#C59B27;color:#040b16;text-decoration:none;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;font-weight:900;padding:14px 20px;border-radius:16px;">Balas Email</a>
            </td>
          </tr>

          <tr>
            <td style="background:#f8fafc;border:1px solid #e4e8ef;border-top:0;border-radius:0 0 28px 28px;padding:20px 36px;color:#8a94a6;font-size:12px;line-height:1.6;">
              Email ini dikirim otomatis dari website resmi ABS Law Office.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildAdminTextEmail({ name, email, subject, message, page, submittedAt }) {
  return `Permintaan Konsultasi Baru - ABS Law Office\n\nNama / Instansi: ${name}\nEmail: ${email}\nSubjek: ${subject}\n\nDeskripsi Singkat:\n${message}\n\nWaktu masuk: ${submittedAt}\nHalaman: ${page || '-'}\n\nBalas email ini atau gunakan alamat ${email} untuk menghubungi pengirim.`;
}

function buildUserConfirmationHtml({ name, subject, submittedAt, siteUrl }) {
  const safe = {
    name: escapeHtml(name),
    subject: escapeHtml(subject),
    submittedAt: escapeHtml(submittedAt),
    siteUrl: escapeHtml(siteUrl || ''),
    logoUrl: buildEmailLogoUrl(siteUrl)
  };

  const siteLine = safe.siteUrl && !safe.siteUrl.includes('localhost')
    ? `<p style="margin:16px 0 0;color:#5b667a;font-size:13px;line-height:1.7;"><strong>Website resmi:</strong> <a href="${safe.siteUrl}" style="color:#0b63ce;text-decoration:none;font-weight:800;">${safe.siteUrl}</a></p>`
    : '';

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Konfirmasi Permintaan Konsultasi</title>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;color:#172033;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2f7;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:650px;border-collapse:separate;border-spacing:0;">
          <tr>
            <td style="background:#040b16;border-radius:26px 26px 0 0;padding:32px 34px 28px;border-bottom:5px solid #C59B27;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:top;">
                    ${buildEmailHeaderLogo(safe.logoUrl) ? `<div style="margin-bottom:20px;">${buildEmailHeaderLogo(safe.logoUrl)}</div>` : `<div style="font-size:12px;letter-spacing:4px;text-transform:uppercase;color:#F9D976;font-weight:800;margin-bottom:14px;">ABS Law Office</div>`}
                    <h1 style="margin:0;color:#ffffff;font-size:26px;line-height:1.25;font-weight:800;">Permintaan konsultasi Anda telah diterima</h1>
                  </td>
                  <td style="width:24px;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border-left:1px solid #e4e8ef;border-right:1px solid #e4e8ef;padding:28px 34px;color:#1f2937;font-size:15px;line-height:1.85;">
              <p style="margin:0 0 16px;">Yth. Bapak/Ibu ${safe.name},</p>
              <p style="margin:0 0 16px;">Terima kasih telah menghubungi ABS Law Office. Formulir konsultasi Anda sudah kami terima dan akan ditinjau terlebih dahulu oleh tim kami.</p>
              <div style="background:#f8fafc;border:1px solid #e4e8ef;border-radius:18px;padding:18px 20px;margin:22px 0;">
                <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a94a6;font-weight:800;margin-bottom:8px;">Subjek Keperluan</div>
                <div style="font-size:16px;font-weight:800;color:#111827;line-height:1.5;">${safe.subject}</div>
              </div>
              <p style="margin:0 0 16px;">Tim kami akan menghubungi Anda melalui email atau kontak yang tersedia dalam waktu 1x24 jam kerja.</p>
              <p style="margin:0;color:#5b667a;font-size:13px;line-height:1.7;"><strong>Waktu masuk:</strong> ${safe.submittedAt}</p>
              ${siteLine}
              <p style="margin:18px 0 0;color:#667085;font-size:13px;line-height:1.7;">Jika Anda tidak merasa mengirim permintaan ini, abaikan email ini.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;border:1px solid #e4e8ef;border-top:0;border-radius:0 0 26px 26px;padding:18px 34px;color:#8a94a6;font-size:12px;line-height:1.6;">
              Email ini adalah konfirmasi otomatis dari formulir website ABS Law Office.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildUserConfirmationText({ name, subject, submittedAt, siteUrl }) {
  const websiteLine = siteUrl && !String(siteUrl).includes('localhost') ? `\nWebsite resmi: ${siteUrl}` : '';
  return `Yth. Bapak/Ibu ${name},\n\nTerima kasih telah menghubungi ABS Law Office. Formulir konsultasi Anda sudah kami terima dan akan ditinjau terlebih dahulu oleh tim kami.\n\nSubjek Keperluan: ${subject}\nWaktu masuk: ${submittedAt}${websiteLine}\n\nTim kami akan menghubungi Anda melalui email atau kontak yang tersedia dalam waktu 1x24 jam kerja.\n\nJika Anda tidak merasa mengirim permintaan ini, abaikan email ini.\n\nEmail ini adalah konfirmasi otomatis dari formulir website ABS Law Office.`;
}

async function parseBody(input) {
  if (!input) return {};
  if (typeof input === 'object') return input;
  if (typeof input === 'string') {
    try {
      return JSON.parse(input);
    } catch (_) {
      return Object.fromEntries(new URLSearchParams(input));
    }
  }
  return {};
}

async function sendResendEmail(apiKey, payload) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let details = '';
    try {
      details = JSON.stringify(await response.json());
    } catch (_) {
      details = await response.text();
    }
    const error = new Error(details || 'Resend request failed');
    error.status = response.status;
    throw error;
  }

  return response.json();
}

function shouldSendUserConfirmation() {
  return String(process.env.SEND_USER_CONFIRMATION || 'true').toLowerCase() !== 'false';
}

function assertAllowedOrigin(headers = {}) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  if (!allowedOrigin) return true;
  const origin = headers.origin || headers.Origin;
  if (!origin) return true;
  return origin === allowedOrigin;
}

export async function handleContactRequest({ method = 'POST', body = {}, headers = {} } = {}) {
  if (method === 'OPTIONS') {
    return { status: 204, headers: jsonHeaders, body: '' };
  }

  if (method !== 'POST') {
    return {
      status: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, message: 'Method tidak diizinkan.' })
    };
  }

  if (!assertAllowedOrigin(headers)) {
    return {
      status: 403,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, message: 'Origin tidak diizinkan.' })
    };
  }

  const data = await parseBody(body);

  // Honeypot: spam bot biasanya mengisi field tersembunyi ini.
  if (normalize(data.company_website)) {
    return {
      status: 200,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: true, message: 'Pesan terkirim.' })
    };
  }

  const clientIp = getClientIp(headers);
  if (hitRateLimit(`ip:${clientIp}`, RATE_LIMIT_PER_IP)) {
    return {
      status: 429,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, message: 'Terlalu banyak percobaan. Silakan coba lagi beberapa saat lagi.' })
    };
  }

  const name = normalize(data.name || data.Nama_Pengirim, 120);
  const email = normalize(data.email || data.Email_Pengirim, 180).toLowerCase();
  const subject = normalize(data.subject || data.Subjek, 180);
  const message = normalizeMessage(data.message || data.Pesan);

  const fallbackSite = normalize(process.env.SITE_URL || '', 300);
  const rawPage = normalize(data.page, 300);
  const page = fallbackSite || rawPage || '-';

  const startedAt = Number(data.form_started_at || 0);
  if (startedAt && Date.now() - startedAt < MIN_FORM_FILL_MS) {
    return {
      status: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, message: 'Pengiriman terlalu cepat. Silakan coba kembali.' })
    };
  }

  if (!name || !email || !subject || !message) {
    return {
      status: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, message: 'Harap lengkapi Nama, Email, Subjek, dan Deskripsi Singkat.' })
    };
  }

  if (!isValidEmail(email)) {
    return {
      status: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, message: 'Alamat email tidak valid.' })
    };
  }

  if (hitRateLimit(`email:${email}`, RATE_LIMIT_PER_EMAIL)) {
    return {
      status: 429,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, message: 'Terlalu banyak pengiriman dari email ini. Silakan coba lagi nanti.' })
    };
  }

  if (looksTooSpammy({ name, email, subject, message })) {
    return {
      status: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, message: 'Pesan terlalu pendek atau terlihat tidak valid. Mohon isi deskripsi dengan lebih jelas.' })
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const mailToList = splitEmails(process.env.MAIL_TO || 'abs.lawoffice88@gmail.com');
  const mailFrom = process.env.MAIL_FROM || 'ABS Law Office <onboarding@resend.dev>';
  const mailReplyTo = splitEmails(process.env.MAIL_REPLY_TO || '')[0] || mailToList[0];

  if (!apiKey) {
    return {
      status: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, message: 'Email service belum dikonfigurasi. Set RESEND_API_KEY terlebih dahulu.' })
    };
  }

  if (!mailToList.length) {
    return {
      status: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, message: 'MAIL_TO belum valid.' })
    };
  }

  const submittedAt = formatJakartaTime();
  const cleanName = sanitizeForSubject(name, 'Pengunjung Website');
  const cleanSubject = sanitizeForSubject(subject, 'Konsultasi');
  const emailSubject = `Konsultasi Baru: ${cleanSubject} — ${cleanName}`;

  const adminPayload = {
    from: mailFrom,
    to: mailToList,
    reply_to: email,
    subject: emailSubject,
    html: buildAdminEmailHtml({ name, email, subject, message, page, submittedAt, emailSubject, siteUrl: process.env.SITE_URL || '' }),
    text: buildAdminTextEmail({ name, email, subject, message, page, submittedAt }),
    headers: buildEmailHeaders('admin-notification')
  };

  const userPayload = {
    from: mailFrom,
    to: [email],
    reply_to: mailReplyTo,
    subject: 'Permintaan Konsultasi Anda Telah Diterima — ABS Law Office',
    html: buildUserConfirmationHtml({ name, subject, submittedAt, siteUrl: process.env.SITE_URL || '' }),
    text: buildUserConfirmationText({ name, subject, submittedAt, siteUrl: process.env.SITE_URL || '' }),
    headers: buildEmailHeaders('user-confirmation')
  };

  try {
    await sendResendEmail(apiKey, adminPayload);
    if (shouldSendUserConfirmation()) {
      await sendResendEmail(apiKey, userPayload);
    }
  } catch (error) {
    console.error('Resend error:', error.message || error);
    return {
      status: 502,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, message: 'Email gagal dikirim. Silakan coba lagi beberapa saat lagi.' })
    };
  }

  return {
    status: 200,
    headers: jsonHeaders,
    body: JSON.stringify({ ok: true, message: 'Pesan terkirim.' })
  };
}

async function readRawBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) throw new Error('Request body terlalu besar.');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
  try {
    const body = req.body ?? await readRawBody(req);
    const result = await handleContactRequest({
      method: req.method,
      headers: req.headers || {},
      body
    });

    Object.entries(result.headers || {}).forEach(([key, value]) => res.setHeader(key, value));
    res.status(result.status).send(result.body);
  } catch (error) {
    console.error('Contact API error:', error);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(500).send(JSON.stringify({ ok: false, message: 'Terjadi kesalahan server.' }));
  }
}
