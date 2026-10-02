// page.jsx — composes the SentinelHQ homepage. Rendered to static HTML at build time.
import React from "react";
import { Nav, Hero, Products, Custom, WhyUs, Testimonials, Finale, Footer } from "./sections.jsx";
import { Booking } from "./booking.jsx";

const PAGE_VARS = {
  "--accent": "var(--green)",
  "--accent-ink": "#0d1f14",
  "--serif": "'Newsreader', Georgia, serif",
  "--sans": "'Hanken Grotesk', system-ui, sans-serif",
};

export function Page() {
  const cta = "Book a free strategy call";
  return (
    <div className="shq" style={PAGE_VARS}>
      <Nav ctaLabel={cta} />
      <main>
        <Hero ctaLabel={cta} />
        <Products />
        <Custom ctaLabel={cta} />
        <WhyUs />
        <Testimonials />
        <div id="book-root"><Booking /></div>
        <Finale ctaLabel={cta} />
      </main>
      <Footer />
    </div>
  );
}
