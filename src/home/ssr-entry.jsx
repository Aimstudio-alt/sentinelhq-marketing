// Build-time entry: renders the homepage to static HTML.
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Page } from "./page.jsx";

export const render = () => renderToStaticMarkup(<Page />);
