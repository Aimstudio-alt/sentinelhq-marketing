// Build-time entry: renders the homepage's two interactive islands to static HTML.
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DemoForm } from "./demo-form.jsx";
import { Booking } from "./booking.jsx";

export const renderDemo = () => renderToStaticMarkup(<DemoForm />);
export const renderBooking = () => renderToStaticMarkup(<Booking />);
