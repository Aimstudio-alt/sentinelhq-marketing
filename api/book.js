const FROM_EMAIL = 'noreply@sentinelhq.co.uk';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hello@sentinelhq.co.uk';

function escape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

async function sendEmail(payload) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, org, product, when } = req.body || {};

  if (!name || !email || !org || !when) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const safeName = escape(name);
  const safeEmail = escape(email);
  const safePhone = phone ? escape(phone) : '—';
  const safeOrg = escape(org);
  const safeProduct = product ? escape(product) : 'SentinelHQ';
  const safeWhen = escape(when);

  try {
    await sendEmail({
      from: FROM_EMAIL,
      to: [email],
      subject: `Your SentinelHQ strategy call — ${safeWhen}`,
      html: `
        <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#111827;">
          <div style="background:#10263b;padding:24px;border-radius:12px 12px 0 0;">
            <h1 style="color:#c9a84c;margin:0;font-size:20px;font-weight:700;">SentinelHQ</h1>
          </div>
          <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
            <h2 style="color:#111827;font-size:22px;margin:0 0 12px;">You're booked in, ${safeName}.</h2>
            <p style="color:#4b5563;line-height:1.6;margin:0 0 20px;">
              We've confirmed your strategy call for <strong>${safeOrg}</strong>. Here are the details:
            </p>
            <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
              <p style="margin:0 0 8px;color:#374151;"><strong>When:</strong> ${safeWhen}</p>
              <p style="margin:0;color:#374151;"><strong>Platform:</strong> ${safeProduct}</p>
            </div>
            <p style="color:#4b5563;line-height:1.6;margin:0 0 24px;">
              We'll send you a video call link before the session. If you need to reschedule, just reply to this email.
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
            <p style="color:#9ca3af;font-size:13px;margin:0;">SentinelHQ — purpose-built compliance platforms for regulated sectors</p>
          </div>
        </div>
      `,
    });
  } catch (e) {
    console.error('[book] Confirmation email failed:', e);
  }

  try {
    await sendEmail({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `Strategy call booked: ${safeName} — ${safeOrg} — ${safeWhen}`,
      html: `
        <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="color:#111827;">New SentinelHQ strategy call booking</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:8px 0;color:#6b7280;width:130px;">Name</td><td style="padding:8px 0;color:#111827;font-weight:600;">${safeName}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Organisation</td><td style="padding:8px 0;color:#111827;font-weight:600;">${safeOrg}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Email</td><td style="padding:8px 0;color:#111827;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Phone</td><td style="padding:8px 0;color:#111827;">${safePhone}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">When</td><td style="padding:8px 0;color:#111827;font-weight:600;">${safeWhen}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;">Platform</td><td style="padding:8px 0;color:#111827;">${safeProduct}</td></tr>
          </table>
        </div>
      `,
    });
  } catch (e) {
    console.error('[book] Admin notification failed:', e);
  }

  return res.status(200).json({ success: true });
}
