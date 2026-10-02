import React from "react";
import { FOOTER_PRODUCTS, REGISTERED_OFFICE } from "../site.mjs";

// site-sections.jsx — SentinelHQ, Ditto-inspired.
// Cream canvas, serif display, vivid offset colour-blocks behind white UI cards.

// Brand wordmark: bold descriptor + lighter "Sentinel" / "Consent" / "HQ".
function splitBrand(name) {
  if (name.endsWith("HQ")) return [name.slice(0, -2), "HQ"];
  for (const s of ["Sentinel", "Consent"]) {
    const i = name.indexOf(s);
    if (i > 0) return [name.slice(0, i), s];
  }
  return [name, ""];
}
function Wordmark({ name }) {
  const [a, b] = splitBrand(name);
  return <span className="wm"><b>{a}</b>{b}</span>;
}
// SentinelHQ parent mark: a shield (compliance protection & oversight) with a
// check — distinct from any single product's mark. Line-art, monochrome.
function Mark({ size = 30 }) {
  return (
    <svg viewBox="0 0 28 28" width={size} height={size} fill="none" aria-hidden="true" style={{ flex: "0 0 auto" }}>
      <path d="M14 2.5l9.5 3.4v6.6c0 5.9-3.7 10.4-9.5 13-5.8-2.6-9.5-7.1-9.5-13V5.9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9.6 13.4l3 3 5.8-6.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────
function Nav({ ctaLabel }) {
  return (
    <header className="nav">
      <div className="wrap nav-row">
        <div className="logo"><Mark size={30} /> <Wordmark name="SentinelHQ" /></div>
        <nav className="nav-links">
          <a href="#products">Products</a>
          <a href="#why">Why SentinelHQ</a>
          <a href="#customers">Customers</a>
          <a href="#book">Book a call</a>
        </nav>
        <div className="nav-cta">
          <a className="btn btn-primary btn-sm" href="#book">{ctaLabel}</a>
        </div>
      </div>
    </header>
  );
}

// ─── HERO ────────────────────────────────────────────────────────────────
function Hero({ ctaLabel }) {
  const frameworks = [
    ["Golf clubs", "var(--yellow)"],
    ["Junior golf", "var(--pink)"],
    ["Sports safeguarding", "var(--violet)"],
    ["Recruitment", "var(--blue)"],
    ["Care homes", "var(--green)"],
  ];
  return (
    <section className="hero">
      <div className="wrap">
        <span className="eyebrow" style={{ justifyContent: "center", display: "flex" }}>One platform family</span>
        <h1 className="display" style={{ marginTop: 22, maxWidth: 820, marginInline: "auto" }}>
          Compliance software, and the <em>experts</em> who run it with you.
        </h1>
        <p className="lead">
          Purpose-built platforms that make health, safety, compliance and
          safeguarding practical, provable and embedded in how your team works —
          across golf, sport, recruitment and care.
        </p>
        <div className="hero-cta">
          <a className="btn btn-primary" href="#book">{ctaLabel} <span className="arrow">→</span></a>
          <a className="btn btn-ghost" href="#products">Explore products</a>
        </div>
        <div className="frameworks">
          {frameworks.map(([label, col]) => (
            <span className="fw" key={label}>
              <span className="swatch" style={{ background: col }} /> {label}
            </span>
          ))}
        </div>

        <div className="hero-stage">
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="blob b3" />
          <HeroMock />
        </div>
      </div>
    </section>
  );
}

function HeroMock() {
  const sideItems = [
    ["Overview", true], ["Inspections", false], ["COSHH register", false],
    ["Incidents", false], ["Training", false], ["Assets", false], ["Audits", false],
  ];
  const bars = [42, 58, 36, 70, 64, 80, 55, 72, 88, 60, 92, 76];
  return (
    <div className="uicard">
      <div className="uicard-bar">
        <span className="tl" style={{ background: "#ff5f57" }} />
        <span className="tl" style={{ background: "#febc2e" }} />
        <span className="tl" style={{ background: "#28c840" }} />
        <span className="url">clubsentinel.co.uk</span>
      </div>
      <div className="mock">
        <aside className="side">
          <div className="logo" style={{ padding: "4px 8px 8px", fontSize: 15 }}>
            <span className="mark" style={{ position: "relative", width: 24, height: 24, borderRadius: 7, fontSize: 12 }}>S</span>
            <span style={{ fontSize: 14 }}>ClubSentinel</span>
          </div>
          <div className="group">Workspace</div>
          {sideItems.map(([label, active]) => (
            <div key={label} className={`item ${active ? "active" : ""}`}>
              <span className="glyph" /><span>{label}</span>
            </div>
          ))}
        </aside>
        <div className="main">
          <div className="top">
            <div>
              <div className="title">Compliance overview · Sample club</div>
            </div>
            <span className="pill">8 actions open</span>
          </div>
          <div className="stat-row">
            <div className="stat-card hi"><div className="l">Composite score</div><div className="v">96<small>/100</small></div></div>
            <div className="stat-card"><div className="l">Inspections</div><div className="v">142<small>+18</small></div></div>
            <div className="stat-card"><div className="l">Open RIDDOR</div><div className="v">0</div></div>
            <div className="stat-card"><div className="l">Training due</div><div className="v">3<small>14d</small></div></div>
          </div>
          <div className="ai-status">
            <div className="row">
              <span className="micro" style={{ color: "var(--accent)", letterSpacing: "0.06em" }}>
                <span className="ai-spark">✦</span> AI · GENERATING WORK PLAN
              </span>
              <span className="micro ai-pct">live</span>
            </div>
            <div className="ai-track"><div className="ai-bar" /></div>
          </div>
          <div className="chart">
            <div className="head"><div className="t">Inspections completed</div><div className="micro">12-week trailing</div></div>
            <div className="bars">
              {bars.map((h, i) => <div key={i} className={`b ${i === 10 ? "a" : ""}`} style={{ height: `${h}%` }} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Trust__removed() { return null; }

// ─── PRODUCTS ────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: "club", sector: "For golf clubs", name: "ClubSentinel", col: "var(--yellow)",
    title: <>Health & safety built for <em>UK golf clubs</em>.</>,
    body: "Fire safety, RIDDOR, assets, training and maintenance — all in one place, with the audit trail to prove it. Intelligent AI reads your Safety Data Sheets and drafts your reports, so a member-owned club gets enterprise-grade tooling without the enterprise contract.",
    points: [
      "AI Safety Data Sheet extraction for COSHH",
      "Asset register with in-PWA QR scanner",
      "Incidents & RIDDOR reporting with AI categorisation",
      "Compliance scoring with published methodology",
    ],
    landing: "/clubsentinel/", site: "https://clubsentinel.co.uk", mock: "club",
  },
  {
    id: "county", sector: "For county golf unions & clubs", name: "CountyConsent", col: "var(--pink)",
    title: <>Junior-golf consent & safeguarding, for the <em>whole county</em>.</>,
    body: "Take the parental-consent paperwork off your volunteers. CountyConsent manages consent, medical and emergency details and GDPR obligations across a county's golfers, squads, trips and competitions — one reliable, provable record, with intelligent AI flagging renewals and turning-18 deadlines before they bite. Live today, endorsed by Durham County Golf Union's junior safeguarding leadership.",
    points: [
      "Parental consent with medical & emergency info in one record",
      "Golfers, squads, events, trips & competitions together",
      "Automatic turning-18 alerts with a guided erasure workflow",
      "Timestamped audit trail for parents, unions & auditors",
    ],
    landing: "/countyconsent/", site: "https://countyconsent.co.uk", mock: "county",
  },
  {
    id: "sport", sector: "Every junior sport · clubs & governing bodies", name: "SportConsent", col: "var(--violet)",
    title: <>Every child. Every sport. <em>Protected.</em></>,
    body: "The same safeguarding engine, generalised to every junior sport — football, rugby, netball, hockey, martial arts, dance. Participant-first: one parental consent covers all a club's activities for 12 months, then renews. No permission slip per fixture — and intelligent AI keeps every club's records complete and audit-ready.",
    points: [
      "One consent covers all a club's activities for 12 months",
      "Consent, medical & emergency info on every record",
      "DSAR / erasure and turning-18 GDPR handling built in",
      "Full timestamped audit trail on every record",
    ],
    site: "https://sportconsent.co.uk", mock: "sport",
  },
  {
    id: "reference", sector: "For recruitment agencies", name: "ReferenceSentinel", col: "var(--blue)",
    title: <>Reference checking & <em>workforce compliance</em>, together.</>,
    body: "Send reference requests; candidates nominate referees; referees complete structured questionnaires that intelligent AI scores, fraud-checks and turns into printable reports. Every worker tracked against a five-part readiness model.",
    points: [
      "Five-part readiness: ID · DBS · references · training · sign-off",
      "Structured referee questionnaires, scored & fraud-checked",
      "Add referees or upload off-portal references yourself",
      "Accept short-coverage workers while chases run — date-stamped",
    ],
    landing: "/referencesentinel/", site: "https://referencesentinel.co.uk", mock: "reference",
  },
  {
    id: "care", sector: "For care homes", name: "CareSentinel", col: "var(--green)",
    title: <>Compliance shaped around <em>CQC</em> expectations.</>,
    body: "Moving & handling, infection control, resident risk assessments — recorded, reportable and always audit-ready. Intelligent AI does the heavy lifting on inspections, categorisation and reports; your team reviews and approves. When the inspector arrives, your evidence is two clicks away.",
    points: [
      "Voice-driven AI room inspections",
      "COSHH register with composite compliance scoring",
      "Incident & RIDDOR reporting with AI categorisation",
      "Resident risk assessments & moving-and-handling records",
    ],
    landing: "/caresentinel/", site: "https://caresentinel.uk", mock: "care",
  },
];

function Products() {
  return (
    <section id="products" className="products">
      <div className="wrap">
        <div className="intro">
          <span className="eyebrow">The product family</span>
          <h2 className="h2">One platform. <em>Five</em> regulated sectors.</h2>
          <p className="lead">
            Each product arrives pre-configured for its regulatory context and ships
            with the evidence trail regulators expect — no blank templates to build.
          </p>
        </div>
      </div>
      {PRODUCTS.map((p, i) => (
        <div id={p.id} key={p.id} className="pband" style={{ "--pcol": p.col, background: `color-mix(in oklab, ${p.col} 8%, var(--cream))` }}>
          <div className="wrap">
            <div className={`prow ${i % 2 === 1 ? "flip" : ""}`}>
            <div className="copy">
              <span className="eyebrow">{p.sector}</span>
              <div className="product-name"><Wordmark name={p.name} /></div>
              <h3 className="h3">{p.title}</h3>
              <p className="lead">{p.body}</p>
              <ul className="points">{p.points.map(pt => <li key={pt}>{pt}</li>)}</ul>
              <div className="cta-row">
                {p.landing && (
                  <a className="btn btn-primary learn" href={p.landing}>Explore {p.name} <span className="arrow">→</span></a>
                )}
                <a className={`btn ${p.landing ? "btn-ghost" : "btn-primary"} learn`} href={p.site} target="_blank" rel="noopener noreferrer">
                  {p.landing ? "Visit the live site" : `Visit ${p.name}`} <span className="arrow">→</span>
                </a>
              </div>
            </div>
            <div className="pstage">
              <div className="pblob" />
              <div className="pblob two" />
              <div className="uicard">
                <div className="uicard-bar">
                  <span className="tl" style={{ background: "#ff5f57" }} />
                  <span className="tl" style={{ background: "#febc2e" }} />
                  <span className="tl" style={{ background: "#28c840" }} />
                  <span className="stamp">{p.name.toUpperCase()}</span>
                </div>
                <ProductMock kind={p.mock} />
              </div>
            </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

function ProductMock({ kind }) {
  if (kind === "care") {
    return (
      <div className="pui">
        <div className="pui-head">
          <span className="micro" style={{ color: "var(--pcol)" }}>● VOICE INSPECTION · ROOM 14</span>
          <span className="chip accent">96 / 100</span>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "end", height: 44 }}>
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} className="eqbar" style={{ width: 4, borderRadius: 2, height: `${20 + Math.abs(Math.sin(i * 0.7)) * 80}%`, background: i < 23 ? "var(--pcol)" : "color-mix(in oklab, var(--ink) 14%, transparent)", animationDelay: `${(i % 9) * 0.11}s` }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, borderTop: "1px solid var(--line-2)", paddingTop: 12 }}>
          {["Cleanliness — west window dust", "Safety — call bell working, fire door clear", "Equipment — hoist serviced, bed brakes set", "Environment — 21.4°C, slight draught"].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 10, fontSize: 12.5, color: "var(--muted)" }}>
              <span style={{ flex: "0 0 7px", height: 7, background: "var(--pcol)", borderRadius: 50, marginTop: 6 }} /><span>{t}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (kind === "club") {
    return (
      <div className="pui">
        <div className="pui-head"><span className="micro">ASSET REGISTER</span><span className="chip accent">QR · 3 FOUND</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {[["Ride-on mower #4", "Serviced · OK"], ["Fire panel — clubhouse", "Test due 5d"], ["Petrol store COSHH", "3 substances"], ["Defib — pro shop", "Pads OK"]].map(([n, s], i) => (
            <div className="tile" key={i}><div className="tn">{n}</div><div className="ts micro" style={{ color: i === 1 ? "var(--pcol)" : "var(--soft)" }}>{s}</div></div>
          ))}
        </div>
        <div className="row" style={{ marginTop: 2 }}>
          <div style={{ display: "flex", gap: 6 }}><span className="chip">FIRE</span><span className="chip">RIDDOR</span></div>
          <span className="chip accent">94 / 100</span>
        </div>
      </div>
    );
  }
  if (kind === "reference" || kind === "county" || kind === "sport") {
    const cfg = {
      reference: {
        head: ["WORKER · J. OKAFOR", "ACCEPTED · CHASING 1"],
        segs: [["ID", 100], ["DBS", 100], ["Refs", 60], ["Training", 100], ["Sign-off", 0]],
        rows: [["Reference 1 · previous employer", "Scored 4.6 · no flags"], ["Reference 2 · uploaded (email)", "Counted · manual"], ["Reference 3 · awaiting referee", "Chased 04 Jul · auto"]],
      },
      county: {
        head: ["JUNIOR · A. PATEL (U14)", "READY · RENEWAL 21d"],
        segs: [["Consent", 100], ["Medical", 100], ["Photo", 100], ["Coach DBS", 100], ["Season", 60]],
        rows: [["Parental consent", "Signed 02 Apr · guardian"], ["Medical & dietary", "Nut allergy noted"], ["Photography", "Permitted · club use"]],
      },
      sport: {
        head: ["CLUB · RIVERSIDE RFC", "3 OPEN · NGB VIEW"],
        segs: [["Consent", 100], ["DBS", 80], ["Training", 100], ["Incidents", 60], ["Policy", 100]],
        rows: [["Safeguarding lead", "DBS valid · trained"], ["Incident #24-07", "Escalated to NGB"], ["Volunteer DBS", "2 renewals due 30d"]],
      },
    }[kind];
    return (
      <div className="pui">
        <div className="pui-head"><span className="micro">{cfg.head[0]}</span><span className="chip accent">{cfg.head[1]}</span></div>
        <div className="readiness">
          {cfg.segs.map(([label, pct]) => (
            <div className="seg" key={label}>
              <div className="bar" style={{ background: pct === 100 ? "var(--pcol)" : pct > 0 ? "color-mix(in oklab, var(--pcol) 45%, var(--line))" : "color-mix(in oklab, var(--ink) 12%, transparent)" }} />
              <span className="micro" style={{ fontSize: 9.5 }}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid var(--line-2)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 9 }}>
          {cfg.rows.map(([n, s], i) => (
            <div className="row" key={i} style={{ fontSize: 12.5, color: "var(--muted)" }}>
              <span>{n}</span><span className="micro" style={{ color: i === cfg.rows.length - 1 ? "var(--pcol)" : "var(--soft)", whiteSpace: "nowrap" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

// ─── CUSTOMISATION ─────────────────────────────────────────────────────────
function Custom({ ctaLabel }) {
  const steps = [
    ["01 · Tell us", "Show us your workflow — the modules, fields and rules your regulator and your team actually need.", "Tell us how you work"],
    ["02 · We shape it", "We adapt an existing product or spin up a company-specific version — terminology, workflows and branding to match.", "We shape it, fast"],
    ["03 · It ships", "Your version goes live, branded as yours, hosted and supported in the UK. No enterprise change-request queue.", "It ships as yours"],
  ];
  return (
    <section id="custom">
      <div className="wrap">
        <div className="custom-panel">
          <span className="cblob a" /><span className="cblob b" /><span className="cblob c" />
          <span className="eyebrow">Bespoke by default</span>
          <h2 className="h2">Shaped to your organisation — that's the normal request.</h2>
          <p className="lead">
            We're small and nimble by design. Any SentinelHQ product can be tailored to how
            you work, or built into a company-specific version entirely. You talk directly to
            the people who build it — not a ticket queue.
          </p>
          <div className="custom-steps">
            {steps.map(([num, body, head]) => (
              <div className="cstep" key={num}>
                <div className="num">{num}</div>
                <h4>{head}</h4>
                <p>{body}</p>
              </div>
            ))}
          </div>
          <a className="btn btn-accent" href="#book">Talk about a custom build <span className="arrow">→</span></a>
        </div>
      </div>
    </section>
  );
}

// ─── WHY US ────────────────────────────────────────────────────────────────
function WhyUs() {
  const feats = [
    ["Sector-specific", "Every module reflects the regulator behind it — not a generic checklist to configure.", "var(--green)"],
    ["AI where it earns it", "AI drafts inspections, actions and reports. A human reviews, approves and stays accountable.", "var(--blue)"],
    ["Mid-market pricing", "No six-figure contracts or six-month onboarding. Flat monthly pricing, live the same day.", "var(--yellow)"],
    ["UK-hosted & secure", "Database-level tenant isolation, encryption in transit and at rest, ICO-registered.", "var(--pink)"],
    ["Compliance watch", "We monitor the regulations that affect you and update the platform as they change.", "var(--violet)"],
  ];
  const icons = {
    0: "M4 7h16M4 12h16M4 17h10",
    1: "M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5z",
    2: "M12 3v18M5 8h14M5 16h14",
    3: "M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z",
    4: "M3 12h4l2 6 4-14 2 8h6",
  };
  return (
    <section id="why" className="whyus">
      <div className="wrap">
        <div className="intro">
          <span className="eyebrow">Why SentinelHQ</span>
          <h2 className="h2">Advanced technology meets <em>human</em> expertise.</h2>
          <p className="lead">
            Enterprise platforms start at £30,000 a year and take six months. Generic SaaS
            hands you a blank template. We built for the middle — and hosted it in the UK.
          </p>
        </div>
        <div className="features">
          {feats.map(([t, b, col], i) => (
            <div className="feature" key={t}>
              <div className="fi" style={{ background: col }}>
                <svg className="icon" viewBox="0 0 24 24" style={{ stroke: "#fff" }}><path d={icons[i]} /></svg>
              </div>
              <h4>{t}</h4>
              <p>{b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────
function Testimonials() {
  const items = [
    {
      quote: "Kevin took an initial concept and developed a comprehensive digital safeguarding and parental consent system that has transformed our processes — significantly reducing administration and improving access to critical safeguarding information. CountyConsent has exceeded our expectations and provides a model that could be adopted across many sports.",
      name: "Paul Tinkler", role: "Junior Safeguarding Chair, Durham County Golf Union",
      tag: "CountyConsent", col: "var(--pink)",
    },
    {
      quote: "ClubSentinel has completely changed how we approach health and safety compliance. The AI features are a massive bonus — especially being able to speak a report and have it create and log it there and then. Now it's a simple job to look at the dashboard and see exactly what's due and when.",
      name: "Geoff Aisbitt", role: "Health & Safety Manager, Wearside Golf Club",
      tag: "ClubSentinel", col: "var(--yellow)",
    },
    {
      // PLACEHOLDER: replace with Ray Tatters' approved testimonial text before go-live.
      quote: "[PLACEHOLDER: approved testimonial from Ray Tatters to be added]",
      name: "Ray Tatters", role: "Chairman, Wearside Golf Club",
      tag: "ClubSentinel", col: "var(--yellow)", placeholder: true,
    },
  ];
  return (
    <section id="customers">
      <div className="wrap">
        <div className="intro">
          <span className="eyebrow">Customers</span>
          <h2 className="h2">Don't take our word for it. Take <em>theirs</em>.</h2>
        </div>
        <div className="tgrid">
          {items.map((t, i) => (
            <div className={`tq${t.placeholder ? " tq-placeholder" : ""}`} key={i}>
              <span className="tq-tag" style={{ "--pcol": t.col }}>{t.tag}</span>
              <blockquote>{t.quote}</blockquote>
              <div className="who">
                <div className="av">{t.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
                <div><div className="n">{t.name}</div><div className="r">{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FINALE CTA ──────────────────────────────────────────────────────────
function Finale({ ctaLabel }) {
  return (
    <section className="finale">
      <div className="wrap narrow">
        <span className="eyebrow plain" style={{ justifyContent: "center", display: "flex" }}>Ready when you are</span>
        <h2 className="h2" style={{ marginTop: 18 }}>Ready to get compliant? <em>Sorted.</em></h2>
        <a className="btn btn-primary" href="#book">{ctaLabel} <span className="arrow">→</span></a>
      </div>
      <div className="circles">
        <span className="c c1" /><span className="c c2" /><span className="c c3" /><span className="c c4" /><span className="c c5" />
      </div>
    </section>
  );
}

// ─── FOOTER ────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="logo" style={{ marginBottom: 16 }}>
              <Mark size={28} /> <Wordmark name="SentinelHQ" />
            </div>
            <p className="body" style={{ fontSize: 14, maxWidth: 320 }}>
              Sector-specific compliance and safeguarding platforms for the regulated middle.
              Built and hosted in the United Kingdom.
            </p>
            <a className="micro" style={{ marginTop: 22, display: "inline-block", textDecoration: "none" }} href="mailto:hello@sentinelhq.co.uk">HELLO@SENTINELHQ.CO.UK</a>
          </div>
          <div className="col">
            <h5>Products</h5>
            {FOOTER_PRODUCTS.map(([name, href, ext]) => (
              <a key={name} href={href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{name}</a>
            ))}
          </div>
          <div className="col">
            <h5>Company</h5>
            <a href="#why">Why SentinelHQ</a>
            <a href="#customers">Customers</a>
            <a href="#book">Book a call</a>
          </div>
          <div className="col">
            <h5>Trust</h5>
            <a href="/legal.html#security">Security overview</a>
            <a href="/legal.html#privacy">Privacy notice</a>
            <a href="/legal.html#terms">Terms</a>
            <a href="/legal.html#dpa">Data processing</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 {REGISTERED_OFFICE}</span>
          <span>Built in North East England · Hosted in the UK</span>
        </div>
      </div>
    </footer>
  );
}

export { Nav, Hero, Products, Custom, WhyUs, Testimonials, Finale, Footer };
