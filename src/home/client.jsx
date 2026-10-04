// client.jsx: the only JavaScript the homepage ships: the demo form and the
// booking calendar. Everything else is static HTML.
import React from "react";
import { render } from "react-dom";
import { DemoForm } from "./demo-form.jsx";
import { Booking } from "./booking.jsx";

const demo = document.getElementById("demo-root");
if (demo) render(<DemoForm />, demo);
const book = document.getElementById("book-root");
if (book) render(<Booking />, book);
