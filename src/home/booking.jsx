// booking.jsx — "Book a call": calendar + slots on the left, details form on the right.
// Slots are generated client-side (weekdays, 10am–4pm). Posts to /api/book/ (type: booking).
import React from "react";
import { PRODUCT_OPTIONS } from "./demo-form.jsx";

const BK_TIMES = [10, 11, 12, 14, 15, 16]; // London business hours
const BK_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const BK_DOWS = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const BK_DAYNAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function bkGenSlots() {
  const slots = [];
  const now = new Date(); now.setHours(0, 0, 0, 0);
  for (let i = 1; i <= 45; i++) {
    const d = new Date(now); d.setDate(now.getDate() + i);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;        // weekdays only
    if ((i * 3) % 7 === 0) continue;             // some days fully booked
    BK_TIMES.forEach((h, idx) => {
      if ((i + idx) % 4 === 0) return;           // vary availability within a day
      const s = new Date(d); s.setHours(h, 0, 0, 0);
      slots.push({ id: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}-${h}`, start: s });
    });
  }
  return slots;
}

const bkPad = (n) => String(n).padStart(2, "0");
const bkFmtTime = (date) => `${bkPad(date.getHours())}:${bkPad(date.getMinutes())}`;
function bkDateLong(y, m, d) { const dt = new Date(y, m, d); return `${BK_DAYNAMES[dt.getDay()]} ${d} ${BK_MONTHS[m]} ${y}`; }
function bkDayKey(y, m, d) { return `${y}-${m + 1}-${d}`; }

export function Booking() {
  const today = React.useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const slots = React.useMemo(bkGenSlots, []);
  const slotsByDate = React.useMemo(() => {
    const map = new Map();
    slots.forEach((s) => { const k = bkDayKey(s.start.getFullYear(), s.start.getMonth(), s.start.getDate()); if (!map.has(k)) map.set(k, []); map.get(k).push(s); });
    return map;
  }, [slots]);

  const [viewYear, setViewYear] = React.useState(today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(today.getMonth());
  const [selKey, setSelKey] = React.useState(null);
  const [selSlot, setSelSlot] = React.useState(null);
  const [f, setF] = React.useState({ name: "", email: "", phone: "", org: "", product: "", hp: "" });
  const [err, setErr] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [booked, setBooked] = React.useState("");

  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setErr(""); };
  const firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevDisabled = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const prevMonth = () => { if (prevDisabled) return; if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); } else setViewMonth(viewMonth - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); } else setViewMonth(viewMonth + 1); };
  const dayAvail = (day) => new Date(viewYear, viewMonth, day) > today && (slotsByDate.get(bkDayKey(viewYear, viewMonth, day))?.length ?? 0) > 0;
  const slotsForDate = selKey ? (slotsByDate.get(selKey) ?? []) : [];
  const selLabel = selKey ? (() => { const [y, m, d] = selKey.split("-").map(Number); return bkDateLong(y, m - 1, d); })() : "";

  async function submit(e) {
    e.preventDefault();
    if (!selSlot) { setErr("Please choose a day and time first."); return; }
    if (!f.name.trim() || !f.email.trim() || !f.phone.trim() || !f.org.trim()) { setErr("Please fill in your name, email, phone and organisation."); return; }
    const slot = `${selLabel} · ${bkFmtTime(selSlot.start)}`;
    setSending(true); setErr("");
    try {
      const res = await fetch("/api/book/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "booking", name: f.name, email: f.email, phone: f.phone, organisation: f.org,
          product: f.product, slot, slot_iso: selSlot.start.toISOString(), company_website: f.hp,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setBooked(slot);
    } catch (ex) {
      setErr(`${ex.message} Please try again, or email hello@sentinelhq.co.uk.`);
    } finally { setSending(false); }
  }

  return (
    <div className="book">
      <div className="panel">
        <h3>Choose a day</h3>
        <div className="cal-top">
          <span className="cal-month" aria-live="polite">{BK_MONTHS[viewMonth]} {viewYear}</span>
          <div className="cal-nav">
            <button type="button" onClick={prevMonth} disabled={prevDisabled} aria-label="Previous month">←</button>
            <button type="button" onClick={nextMonth} aria-label="Next month">→</button>
          </div>
        </div>
        <div className="cal">
          {BK_DOWS.map((d) => <span key={d} className="d" aria-hidden="true">{d}</span>)}
          {Array.from({ length: firstDow }).map((_, i) => <span key={`b${i}`} className="x" aria-hidden="true" />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const avail = dayAvail(day);
            const sel = selKey === bkDayKey(viewYear, viewMonth, day);
            return (
              <button key={day} type="button" disabled={!avail} className={sel ? "s" : avail ? "a" : ""}
                aria-pressed={sel} aria-label={`${bkDateLong(viewYear, viewMonth, day)}${avail ? "" : ", unavailable"}`}
                onClick={avail ? () => { setSelKey(bkDayKey(viewYear, viewMonth, day)); setSelSlot(null); setErr(""); } : undefined}>
                {day}
              </button>
            );
          })}
        </div>
        <p className="slots-lbl">{selKey ? `Times on ${selLabel}` : "Pick a highlighted day to see times"}</p>
        {selKey ? (
          slotsForDate.length ? (
            <div className="slots">
              {slotsForDate.map((s) => (
                <button key={s.id} type="button" className={selSlot?.id === s.id ? "s" : ""} aria-pressed={selSlot?.id === s.id}
                  onClick={() => { setSelSlot(s); setErr(""); }}>{bkFmtTime(s.start)}</button>
              ))}
            </div>
          ) : <p className="slots-empty">No times left on this day.</p>
        ) : <p className="slots-empty">Calls run Monday to Friday, 10:00 to 16:00 UK time.</p>}
      </div>

      {booked ? (
        <div className="panel done" role="status">
          <span className="tick" aria-hidden="true">✓</span>
          <h3>You're booked in.</h3>
          <p><b>{booked}</b></p>
          <p>We'll meet {f.name} from {f.org}. A confirmation is on its way to {f.email}, and we'll send a video call link before we meet.</p>
        </div>
      ) : (
        <form className="panel" onSubmit={submit} noValidate>
          <h3>Your details</h3>
          {selSlot && <p className="pick">Your call: <b>{selLabel} · {bkFmtTime(selSlot.start)}</b></p>}
          <div className="f">
            <label>Full name<input id="bk-name" autoComplete="name" value={f.name} onChange={set("name")} /></label>
            <div className="two">
              <label>Email<input id="bk-email" type="email" autoComplete="email" value={f.email} onChange={set("email")} /></label>
              <label>Phone<input id="bk-phone" type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} /></label>
            </div>
            <label>Organisation<input id="bk-org" autoComplete="organization" placeholder="Your organisation" value={f.org} onChange={set("org")} /></label>
            <label>Product<select id="bk-product" value={f.product} onChange={set("product")}>
              <option value="">Select…</option>
              {PRODUCT_OPTIONS.map((p) => <option key={p}>{p}</option>)}
            </select></label>
            <input className="hp" type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.hp} onChange={set("hp")} />
            {err && <p className="err" role="alert">{err}</p>}
            <button className="btn btn-p" type="submit" disabled={sending}>{sending ? "Booking…" : "Book my call"}</button>
          </div>
        </form>
      )}
    </div>
  );
}
