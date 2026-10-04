// POST /api/book: the homepage's two forms.
//   type "booking" (default): "Book a call" calendar (#book)
//   type "demo": hero "Request a demo" form
// Validates the request, emails it to hello@sentinelhq.co.uk and sends the visitor
// a short confirmation, both via Resend.
// Env: RESEND_API_KEY (required), BOOKING_TO (optional, defaults to hello@).

const FROM = "SentinelHQ <noreply@sentinelhq.co.uk>";
const TO = process.env.BOOKING_TO || "hello@sentinelhq.co.uk";
const PRODUCTS = ["", "ClubSentinel", "CountyConsent", "SportConsent", "ReferenceSentinel", "CareSentinel", "Not sure yet"];
const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i;
const PHONE_RE = /^[+()\d\s.-]{7,25}$/;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const clean = (v, max) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max + 1) : "");

export function validate(body) {
  const f = {
    name: clean(body.name, 100),
    email: clean(body.email, 254),
    phone: clean(body.phone, 25),
    organisation: clean(body.organisation, 150),
    product: clean(body.product, 40),
    slot: clean(body.slot, 80),
    slotIso: clean(body.slot_iso, 40),
  };
  const errors = [];
  if (!f.name || f.name.length > 100) errors.push("name");
  if (!EMAIL_RE.test(f.email) || f.email.length > 254) errors.push("email");
  if (!PHONE_RE.test(f.phone)) errors.push("phone");
  if (!f.organisation || f.organisation.length > 150) errors.push("organisation");
  if (!PRODUCTS.includes(f.product)) errors.push("product");
  const slotError = checkSlot(f.slot, f.slotIso);
  if (slotError) errors.push("slot");
  return { fields: f, errors, slotError };
}

// Calls run Monday to Friday, on the hour from 10:00 to 16:00 UK time, up to 120 days ahead.
const SLOT_MESSAGES = {
  missing: "Please pick a date and time for your call.",
  past: "That time has already passed. Please pick another date and time.",
  far: "Please pick a date within the next four months.",
  weekend: "Calls run Monday to Friday. Please pick a weekday.",
  hours: "Calls run between 10am and 4pm UK time. Please pick another time.",
};
const londonParts = (date) => Object.fromEntries(
  new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(date).map((p) => [p.type, p.value])
);

export function checkSlot(slot, slotIso, now = Date.now()) {
  const when = new Date(slotIso);
  if (!slot || slot.length > 80 || !slotIso || isNaN(when)) return SLOT_MESSAGES.missing;
  if (when <= now) return SLOT_MESSAGES.past;
  if (when - now > 120 * 864e5) return SLOT_MESSAGES.far;
  const p = londonParts(when);
  if (p.weekday === "Sat" || p.weekday === "Sun") return SLOT_MESSAGES.weekend;
  const h = Number(p.hour), m = Number(p.minute);
  if (m !== 0 || h < 10 || h > 16) return SLOT_MESSAGES.hours;
  return "";
}

export function validateDemo(body) {
  const f = {
    email: clean(body.email, 254),
    first: clean(body.first_name, 60),
    last: clean(body.last_name, 60),
    organisation: clean(body.organisation, 150),
    phone: clean(body.phone, 25),
    products: Array.isArray(body.products) ? body.products.slice(0, 6).map((x) => clean(x, 40)) : [],
  };
  const errors = [];
  if (!EMAIL_RE.test(f.email) || f.email.length > 254) errors.push("email");
  if (!f.first || f.first.length > 60) errors.push("first_name");
  if (!f.last || f.last.length > 60) errors.push("last_name");
  if (!f.organisation || f.organisation.length > 150) errors.push("organisation");
  if (f.phone && !PHONE_RE.test(f.phone)) errors.push("phone");
  if (f.products.some((x) => !x || !PRODUCTS.includes(x))) errors.push("products");
  f.name = `${f.first} ${f.last}`;
  return { fields: f, errors };
}

async function send(payload) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return res.json();
}

function adminEmail(f) {
  const rows = [
    ["Name", f.name], ["Organisation", f.organisation], ["Email", f.email], ["Phone", f.phone],
    ["Product", f.product || "Not given"], ["Requested slot", f.slot], ["Slot (ISO, UTC)", f.slotIso],
  ];
  return {
    from: FROM,
    to: [TO],
    reply_to: f.email,
    subject: `Call booked: ${f.name}, ${f.organisation} (${f.slot})`,
    text: `New call booking from sentinelhq.co.uk\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nReply to this email to contact ${f.name} directly.`,
    html: `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;color:#1b1a16">
<h2 style="font-size:18px;margin:0 0 16px">New call booking from sentinelhq.co.uk</h2>
<table style="border-collapse:collapse;font-size:14px;width:100%">${rows
      .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#6b6b60;width:140px">${esc(k)}</td><td style="padding:6px 0">${esc(v)}</td></tr>`)
      .join("")}</table>
<p style="font-size:13px;color:#6b6b60;margin-top:20px">Reply to this email to contact ${esc(f.name)} directly.</p></div>`,
  };
}

function visitorEmail(f) {
  const first = f.name.split(/\s+/)[0];
  return {
    from: FROM,
    to: [f.email],
    reply_to: TO,
    subject: `Your SentinelHQ call: ${f.slot}`,
    text: `Hi ${first},\n\nThanks for booking a call with SentinelHQ. We have your request for ${f.slot} (UK time).\n\nWe'll confirm the time and send a video call link before we meet. If you need to change anything, just reply to this email.\n\nSentinelHQ\nhello@sentinelhq.co.uk\nhttps://sentinelhq.co.uk`,
    html: `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;color:#1b1a16;font-size:15px;line-height:1.55">
<p>Hi ${esc(first)},</p>
<p>Thanks for booking a call with SentinelHQ. We have your request for <b>${esc(f.slot)}</b> (UK time).</p>
<p>We'll confirm the time and send a video call link before we meet. If you need to change anything, just reply to this email.</p>
<p style="margin-top:24px">SentinelHQ<br><a href="mailto:hello@sentinelhq.co.uk" style="color:#2d6a45">hello@sentinelhq.co.uk</a><br><a href="https://sentinelhq.co.uk" style="color:#2d6a45">sentinelhq.co.uk</a></p></div>`,
  };
}

function demoAdminEmail(f) {
  const rows = [
    ["Name", f.name], ["Organisation", f.organisation], ["Email", f.email], ["Phone", f.phone || "Not given"],
    ["Products", f.products.length ? f.products.join(", ") : "Not given"],
  ];
  return {
    from: FROM,
    to: [TO],
    reply_to: f.email,
    subject: `Demo request: ${f.name}, ${f.organisation}`,
    text: `New demo request from sentinelhq.co.uk\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nReply to this email to contact ${f.first} directly.`,
    html: `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;color:#14201a">
<h2 style="font-size:18px;margin:0 0 16px">New demo request from sentinelhq.co.uk</h2>
<table style="border-collapse:collapse;font-size:14px;width:100%">${rows
      .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#59645d;width:140px">${esc(k)}</td><td style="padding:6px 0">${esc(v)}</td></tr>`)
      .join("")}</table>
<p style="font-size:13px;color:#59645d;margin-top:20px">Reply to this email to contact ${esc(f.first)} directly.</p></div>`,
  };
}

function demoVisitorEmail(f) {
  return {
    from: FROM,
    to: [f.email],
    reply_to: TO,
    subject: "Your SentinelHQ demo request",
    text: `Hi ${f.first},\n\nThanks for asking for a demo of SentinelHQ. We'll reply within one working day to arrange a time that suits you.\n\nIf there's anything you'd like us to cover, just reply to this email.\n\nSentinelHQ\nhello@sentinelhq.co.uk\nhttps://sentinelhq.co.uk`,
    html: `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;color:#14201a;font-size:15px;line-height:1.55">
<p>Hi ${esc(f.first)},</p>
<p>Thanks for asking for a demo of SentinelHQ. We'll reply within one working day to arrange a time that suits you.</p>
<p>If there's anything you'd like us to cover, just reply to this email.</p>
<p style="margin-top:24px">SentinelHQ<br><a href="mailto:hello@sentinelhq.co.uk" style="color:#1f6b45">hello@sentinelhq.co.uk</a><br><a href="https://sentinelhq.co.uk" style="color:#1f6b45">sentinelhq.co.uk</a></p></div>`,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }
  const body = typeof req.body === "object" && req.body ? req.body : {};

  // Honeypot: bots fill the hidden field. Pretend success, send nothing.
  if (typeof body.company_website === "string" && body.company_website.trim()) {
    return res.status(200).json({ ok: true });
  }

  const isDemo = body.type === "demo";
  const { fields, errors, slotError } = isDemo ? validateDemo(body) : validate(body);
  if (errors.length) {
    const error = isDemo ? "Please check your details." : slotError || "Please check your name, email, phone and organisation.";
    return res.status(400).json({ error, fields: errors });
  }
  if (!process.env.RESEND_API_KEY) {
    console.error("[book] RESEND_API_KEY is not set");
    return res.status(500).json({ error: "Booking is temporarily unavailable." });
  }

  try {
    await send(isDemo ? demoAdminEmail(fields) : adminEmail(fields));
  } catch (e) {
    console.error("[book] admin email failed:", e.message);
    return res.status(502).json({ error: isDemo ? "We couldn't send your request." : "We couldn't send your booking." });
  }
  try {
    await send(isDemo ? demoVisitorEmail(fields) : visitorEmail(fields));
  } catch (e) {
    // The booking reached us; a failed confirmation shouldn't fail the request.
    console.error("[book] confirmation email failed:", e.message);
  }
  return res.status(200).json({ ok: true });
}
