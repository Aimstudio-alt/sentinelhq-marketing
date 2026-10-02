import React from "react";

// booking.jsx — SentinelHQ calendar booking, mirroring CareSentinel's book-demo
// flow (calendar + slots on the left, details form on the right, booked
// confirmation with add-to-calendar) in the SentinelHQ cream/serif styling.
// Slots are generated client-side (weekdays, 10am–4pm) for the prototype.

const BK_TIMES = [10, 11, 12, 14, 15, 16]; // London business hours
const BK_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const BK_DOWS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
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

function bkFmtTime(date) {
  return new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })
    .format(date).replace(/\s/g, "").toLowerCase();
}
function bkDateShort(y, m, d) { const dt = new Date(y, m, d); return `${BK_DAYNAMES[dt.getDay()]} ${d} ${BK_MONTHS[m].slice(0, 3)}`; }
function bkDateLong(y, m, d) { const dt = new Date(y, m, d); return `${BK_DAYNAMES[dt.getDay()]} ${d} ${BK_MONTHS[m]} ${y}`; }
function bkPad(n) { return String(n).padStart(2, "0"); }
function bkDayKey(y, m, d) { return `${y}-${m + 1}-${d}`; }

const BkCal = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4.5" width="18" height="17" rx="3" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>);
const BkCheck = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg>);
const BkChevL = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M15 18l-6-6 6-6" /></svg>);
const BkChevR = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M9 18l6-6-6-6" /></svg>);

function Booking() {
  const today = React.useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  // Slots are generated client-side (weekdays, 10am–4pm) — the only source.
  const slots = React.useMemo(bkGenSlots, []);
  const slotsByDate = React.useMemo(() => {
    const map = new Map();
    slots.forEach(s => { const k = bkDayKey(s.start.getFullYear(), s.start.getMonth(), s.start.getDate()); if (!map.has(k)) map.set(k, []); map.get(k).push(s); });
    return map;
  }, [slots]);

  const [viewYear, setViewYear] = React.useState(today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(today.getMonth());
  const [selKey, setSelKey] = React.useState(null);
  const [selSlot, setSelSlot] = React.useState(null);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [org, setOrg] = React.useState("");
  const [product, setProduct] = React.useState("");
  const [hp, setHp] = React.useState("");
  const [err, setErr] = React.useState(false);
  const [booked, setBooked] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [sendErr, setSendErr] = React.useState("");
  const [when, setWhen] = React.useState("");

  const firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevDisabled = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  function prevMonth() { if (prevDisabled) return; if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); } else setViewMonth(m => m - 1); }
  function nextMonth() { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); } else setViewMonth(m => m + 1); }
  function dayAvail(day) { const d = new Date(viewYear, viewMonth, day); if (d <= today) return false; return (slotsByDate.get(bkDayKey(viewYear, viewMonth, day))?.length ?? 0) > 0; }
  function isToday(day) { return viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate(); }
  function selectDay(day) { setSelKey(bkDayKey(viewYear, viewMonth, day)); setSelSlot(null); }

  const slotsForDate = selKey ? (slotsByDate.get(selKey) ?? []) : [];

  let pickText = "No date selected yet", pickEmpty = true;
  if (selKey && selSlot) { const [y, m, d] = selKey.split("-").map(Number); pickText = `${bkDateShort(y, m - 1, d)} · ${bkFmtTime(selSlot.start)}`; pickEmpty = false; }
  else if (selKey) { const [y, m, d] = selKey.split("-").map(Number); pickText = `${bkDateShort(y, m - 1, d)} — pick a time below`; }

  async function submit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !org.trim() || !selSlot) { setErr(true); return; }
    setErr(false);
    setSendErr("");
    const [y, m, d] = selKey.split("-").map(Number);
    const slot = `${bkDateLong(y, m - 1, d)} · ${bkFmtTime(selSlot.start)}`;
    setSending(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone, organisation: org, product,
          slot, slot_iso: selSlot.start.toISOString(),
          company_website: hp, // honeypot
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setWhen(slot);
      setBooked(true);
    } catch (ex) {
      setSendErr(`${ex.message} Please try again, or email hello@sentinelhq.co.uk.`);
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="book" className="booking">
      <div className="wrap">
        <div className="intro">
          <span className="eyebrow">Book a call</span>
          <h2 className="h2">A 30-minute walkthrough, on a <em>live</em> system.</h2>
          <p className="lead">Pick a time that suits you. We'll tailor the session to how your organisation runs compliance and safeguarding — and send a video call link before we meet.</p>
        </div>

        <div className="bk-grid">
          {/* Calendar */}
          <div className="bk-card bk-cal">
            <div className="bk-cal-top">
              <span className="bk-month">{BK_MONTHS[viewMonth]} {viewYear}</span>
              <div className="bk-navs">
                <button className="bk-arrow" type="button" onClick={prevMonth} disabled={prevDisabled} aria-label="Previous month"><BkChevL /></button>
                <button className="bk-arrow" type="button" onClick={nextMonth} aria-label="Next month"><BkChevR /></button>
              </div>
            </div>
            <div className="bk-dow">{BK_DOWS.map(d => <span key={d}>{d}</span>)}</div>
            <div className="bk-days">
              {Array.from({ length: firstDow }).map((_, i) => <span key={`b${i}`} className="bk-day blank" />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const avail = dayAvail(day);
                const sel = selKey === bkDayKey(viewYear, viewMonth, day);
                return (
                  <button key={day} type="button" disabled={!avail}
                    className={`bk-day ${avail ? "avail" : "unavail"} ${sel ? "sel" : ""}`}
                    onClick={avail ? () => selectDay(day) : undefined} aria-pressed={sel}>
                    {day}{isToday(day) && <span className="bk-today" />}
                  </button>
                );
              })}
            </div>
            <div className="bk-foot">
              <div className="bk-slots-lbl"><span className="d" />
                {selKey ? (() => { const [y, m, d] = selKey.split("-").map(Number); return `Times for ${bkDateShort(y, m - 1, d)}`; })() : "Pick a date to see available times"}
              </div>
              {!selKey ? (
                <p className="bk-empty">Calls run Monday–Friday, 10am–4pm. Select a highlighted date above.</p>
              ) : slotsForDate.length === 0 ? (
                <p className="bk-empty">No slots available for this date.</p>
              ) : (
                <div className="bk-slots">
                  {slotsForDate.map(s => (
                    <button key={s.id} type="button" className={`bk-slot${selSlot?.id === s.id ? " sel" : ""}`} onClick={() => setSelSlot(s)} aria-pressed={selSlot?.id === s.id}>{bkFmtTime(s.start)}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form / success */}
          <div className="bk-card bk-form">
            {booked ? (
              <div className="bk-success">
                <div className="bk-success-badge"><BkCheck /></div>
                <h3 className="h3">You're booked in.</h3>
                <div className="bk-when"><BkCal /><span>{when}</span></div>
                <p className="bk-who">We'll meet <b>{name}</b> from <b>{org}</b>. A confirmation is on its way to <b>{email}</b>, and we'll send a video call link before we meet.</p>
              </div>
            ) : (
              <React.Fragment>
                <div className="bk-form-hd">
                  <div className="bk-badge"><BkCal /></div>
                  <h3 className="h3">Book your free call</h3>
                </div>
                <div className={`bk-pick${pickEmpty ? " empty" : ""}`}><BkCal /><span>{pickText}</span></div>
                <form onSubmit={submit} noValidate className="form">
                  <div className="field"><label htmlFor="bk-name">Full name</label><input id="bk-name" autoComplete="name" placeholder="Jane Okafor" value={name} onChange={e => { setName(e.target.value); setErr(false); }} /></div>
                  <div className="field"><label htmlFor="bk-email">Work email</label><input id="bk-email" type="email" autoComplete="email" placeholder="jane@org.co.uk" value={email} onChange={e => { setEmail(e.target.value); setErr(false); }} /></div>
                  <div className="row">
                    <div className="field"><label htmlFor="bk-phone">Phone</label><input id="bk-phone" type="tel" autoComplete="tel" placeholder="07700 900123" value={phone} onChange={e => { setPhone(e.target.value); setErr(false); }} /></div>
                    <div className="field"><label htmlFor="bk-org">Organisation</label><input id="bk-org" autoComplete="organization" placeholder="Your organisation" value={org} onChange={e => { setOrg(e.target.value); setErr(false); }} /></div>
                  </div>
                  <div className="field"><label htmlFor="bk-product">Product of interest</label>
                    <select id="bk-product" value={product} onChange={e => setProduct(e.target.value)}>
                      <option value="">Select…</option>
                      <option>ClubSentinel</option>
                      <option>CountyConsent</option>
                      <option>SportConsent</option>
                      <option>ReferenceSentinel</option>
                      <option>CareSentinel</option>
                      <option>Not sure yet</option>
                    </select>
                  </div>
                  <button className="btn btn-primary bk-submit" type="submit" disabled={sending}>{sending ? "Booking…" : <>Book my call <span className="arrow">→</span></>}</button>
                  <input type="text" name="company_website" aria-label="Leave this field empty" tabIndex="-1" autoComplete="off" value={hp} onChange={e => setHp(e.target.value)} style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} aria-hidden="true" />
                  {err && <p className="bk-err" role="alert">{!selSlot ? "Please choose a date & time first." : "Please fill in your name, email, phone and organisation."}</p>}
                  {sendErr && <p className="bk-err" role="alert">{sendErr}</p>}
                </form>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export { Booking };
