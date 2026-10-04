// Shared site data: footer links, per-page SEO and structured data.
// Used by the homepage components and by build.mjs for every page.

export const SITE_URL = "https://sentinelhq.co.uk";
export const LASTMOD = "2026-10-02";

export const LINKEDIN = "https://www.linkedin.com/company/sentinelhq-uk/";

export const REGISTERED_OFFICE =
  "SentinelHQ Limited, 32 Thornbridge, Washington, NE38 8TJ. Registered in England & Wales No. 17242389. ICO ZC175485.";

// [name, href, external?]: each product links to its own website (the old
// /clubsentinel/-style pages on this site 301 to these, see vercel.json).
export const FOOTER_PRODUCTS = [
  ["ClubSentinel", "https://clubsentinel.co.uk", true],
  ["CountyConsent", "https://countyconsent.co.uk", true],
  ["SportConsent", "https://sportconsent.co.uk", true],
  ["ReferenceSentinel", "https://referencesentinel.co.uk", true],
  ["CareSentinel", "https://caresentinel.uk", true],
];

const ORG_ID = `${SITE_URL}/#organization`;

export const ORGANIZATION = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: "SentinelHQ",
  legalName: "SentinelHQ Limited",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/icon-512.png`,
  image: `${SITE_URL}/og-image.png`,
  email: "hello@sentinelhq.co.uk",
  foundingDate: "2026-05-26",
  identifier: { "@type": "PropertyValue", propertyID: "Companies House", value: "17242389" },
  address: {
    "@type": "PostalAddress",
    streetAddress: "32 Thornbridge",
    addressLocality: "Washington",
    addressRegion: "Tyne and Wear",
    postalCode: "NE38 8TJ",
    addressCountry: "GB",
  },
  sameAs: [LINKEDIN, "https://find-and-update.company-information.service.gov.uk/company/17242389"],
};

const publisher = { "@id": ORG_ID };
const app = (o) => ({
  "@type": "SoftwareApplication",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  publisher,
  ...o,
});
const monthly = (price, name, extra = {}) => ({
  "@type": "Offer",
  name,
  price: String(price),
  priceCurrency: "GBP",
  priceSpecification: {
    "@type": "UnitPriceSpecification",
    price: String(price),
    priceCurrency: "GBP",
    unitText: "MONTH",
    billingDuration: "P1M",
    ...extra,
  },
});

export const APPS = {
  club: app({
    "@id": "https://clubsentinel.co.uk/#software",
    name: "ClubSentinel",
    url: "https://clubsentinel.co.uk",
    description:
      "Health and safety compliance software for UK golf clubs: voice-driven records, AI Safety Data Sheet extraction, RIDDOR, COSHH, training, greenkeeping records and a live compliance score.",
    offers: monthly(199, "ClubSentinel, per club"),
  }),
  county: app({
    "@id": "https://countyconsent.co.uk/#software",
    name: "CountyConsent",
    url: "https://countyconsent.co.uk",
    description:
      "Digital parental consent and junior safeguarding software for UK golf clubs and county golf unions: consent, medical and emergency details, audit trail and turning-18 alerts.",
    offers: [monthly(65, "Golf Club"), monthly(199, "County Union")],
  }),
  sport: app({
    "@id": "https://sportconsent.co.uk/#software",
    name: "SportConsent",
    url: "https://sportconsent.co.uk",
    description:
      "Safeguarding and parental consent software for every junior sport: one consent covers a club's activities for 12 months, with turning-18 and erasure handling and a full audit trail.",
    offers: monthly(65, "SportConsent club plan"),
  }),
  reference: app({
    "@id": "https://referencesentinel.co.uk/#software",
    name: "ReferenceSentinel",
    url: "https://referencesentinel.co.uk",
    description:
      "Employment reference checking and workforce compliance software for UK recruitment agencies: AI fraud detection, automated referee chasing, Right to Work and DBS tracking.",
  }),
  care: app({
    "@id": "https://caresentinel.uk/#software",
    name: "CareSentinel",
    url: "https://caresentinel.uk",
    description:
      "Voice-first CQC compliance software for UK care homes: speak an incident and AI writes the record, with RIDDOR flags, COSHH, audits and a live compliance score.",
    offers: {
      "@type": "Offer",
      name: "CareSentinel, per bed",
      price: "6",
      priceCurrency: "GBP",
      priceSpecification: [
        {
          "@type": "UnitPriceSpecification",
          price: "6",
          priceCurrency: "GBP",
          unitText: "per bed per month",
          billingDuration: "P1M",
          referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitText: "bed" },
        },
        {
          "@type": "UnitPriceSpecification",
          minPrice: "198",
          price: "198",
          priceCurrency: "GBP",
          name: "Monthly minimum",
          billingDuration: "P1M",
        },
      ],
    },
  }),
};


const crumb = (name, path) => ({
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "SentinelHQ", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name, item: `${SITE_URL}${path}` },
  ],
});

// Titles < 60 chars, descriptions < 155 chars, golf first, UK wording.
export const PAGES = [
  {
    src: "home",
    path: "/",
    title: "SentinelHQ | Golf Club & Sport Compliance Software UK",
    description:
      "UK compliance and safeguarding software for golf clubs, county unions, junior sport, recruitment agencies and care homes. Built and hosted in the UK.",
    ogAlt: "SentinelHQ: compliance and safeguarding software for golf, sport, recruitment and care",
    schema: () => [
      ORGANIZATION,
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: "SentinelHQ", publisher, inLanguage: "en-GB" },
      APPS.club, APPS.county, APPS.sport, APPS.reference, APPS.care,
    ],
  },
  {
    src: "legal.html",
    path: "/legal.html",
    title: "Legal: Privacy, Security, Terms & DPA | SentinelHQ",
    description:
      "SentinelHQ privacy notice, security overview, terms of service and data processing agreement, including our sub-processors and UK data hosting.",
    ogAlt: "SentinelHQ legal information",
    schema: () => [ORGANIZATION, crumb("Legal", "/legal.html")],
  },
];
