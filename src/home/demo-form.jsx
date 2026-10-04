// demo-form.jsx: hero "Request a demo" form. Posts to /api/book/ (type: demo).
import React from "react";

export const PRODUCT_OPTIONS = ["ClubSentinel", "CountyConsent", "SportConsent", "ReferenceSentinel", "CareSentinel", "Not sure yet"];

export function DemoForm() {
  const [f, setF] = React.useState({ email: "", first: "", last: "", org: "", phone: "", hp: "" });
  const [products, setProducts] = React.useState([]);
  const [err, setErr] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setErr(""); };
  const toggle = (p) => setProducts(products.includes(p) ? products.filter((x) => x !== p) : [...products, p]);

  async function submit(e) {
    e.preventDefault();
    if (!f.email.trim() || !f.first.trim() || !f.last.trim() || !f.org.trim()) { setErr("Please add your work email, name and organisation."); return; }
    setSending(true); setErr("");
    try {
      const res = await fetch("/api/book/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "demo", email: f.email, first_name: f.first, last_name: f.last,
          organisation: f.org, phone: f.phone, products, company_website: f.hp,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSent(true);
    } catch (ex) {
      setErr(`${ex.message} Please try again, or email hello@sentinelhq.co.uk.`);
    } finally { setSending(false); }
  }

  if (sent) {
    return (
      <div className="lead-form done" role="status">
        <span className="tick" aria-hidden="true">✓</span>
        <h2>Thanks, {f.first}.</h2>
        <p>Your demo request is with us. We'll reply to {f.email} within one working day.</p>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={submit} noValidate aria-labelledby="lf-h">
      <h2 id="lf-h">Request a demo</h2>
      <p className="lf-s">We'll reply within one working day.</p>
      <div className="f">
        <label>Work email<input id="lf-email" type="email" autoComplete="email" required value={f.email} onChange={set("email")} /></label>
        <div className="two">
          <label>First name<input id="lf-first" autoComplete="given-name" required value={f.first} onChange={set("first")} /></label>
          <label>Last name<input id="lf-last" autoComplete="family-name" required value={f.last} onChange={set("last")} /></label>
        </div>
        <label>Organisation<input id="lf-org" autoComplete="organization" placeholder="Your club, agency or care home" required value={f.org} onChange={set("org")} /></label>
        <label>Phone<input id="lf-phone" type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} /></label>
        <fieldset>
          <legend>Which products interest you?</legend>
          <div className="checks">
            {PRODUCT_OPTIONS.map((p) => (
              <label key={p}><input type="checkbox" name="products" value={p} checked={products.includes(p)} onChange={() => toggle(p)} /> {p}</label>
            ))}
          </div>
        </fieldset>
        <input className="hp" type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.hp} onChange={set("hp")} />
        <p className="small">By submitting you agree to our <a href="/legal.html#privacy">privacy policy</a>.</p>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn btn-p" type="submit" disabled={sending}>{sending ? "Sending…" : "Request a demo"}</button>
      </div>
    </form>
  );
}
