// client.jsx — the only JavaScript the homepage ships. Static HTML is
// pre-rendered; this adds the nav shadow, scroll-reveal and the booking island.
import React from "react";
import { render } from "react-dom";
import { Booking } from "./booking.jsx";

const nav = document.querySelector(".shq .nav");
const onScroll = () => { if (nav) nav.classList.toggle("scrolled", window.scrollY > 8); };
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
  const sel = ".intro, .prow, .custom-panel, .feature, .fq-card, .tcard, .trust .head, .logos, .hero-stage, .frameworks";
  const els = Array.from(document.querySelectorAll(".shq " + sel.split(", ").join(", .shq ")));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  els.forEach((el) => {
    // Elements already on screen at load stay visible: no flash, no LCP delay.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;
    el.classList.add("reveal");
    io.observe(el);
  });
}

const root = document.getElementById("book-root");
if (root) render(<Booking />, root);
