// Shared site data: footer links, per-page SEO and structured data.
// Used by the homepage components and by build.mjs for every page.

export const SITE_URL = "https://sentinelhq.co.uk";
export const LASTMOD = "2026-10-02";

export const REGISTERED_OFFICE =
  "SentinelHQ Limited, 32 Thornbridge, Washington, NE38 8TJ. Registered in England & Wales No. 17242389. ICO ZC175485.";

// [name, href, external?]: internal SentinelHQ page where one exists, else the product site.
export const FOOTER_PRODUCTS = [
  ["ClubSentinel", "/clubsentinel/", false],
  ["CountyConsent", "/countyconsent/", false],
  ["SportConsent", "https://sportconsent.co.uk", true],
  ["ReferenceSentinel", "/referencesentinel/", false],
  ["CareSentinel", "/caresentinel/", false],
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
  // TODO: add the SentinelHQ LinkedIn company URL once confirmed.
  // linkedin.com/company/sentinelhq belongs to an unrelated company, so it is not used.
  sameAs: ["https://find-and-update.company-information.service.gov.uk/company/17242389"],
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
    "@id": `${SITE_URL}/clubsentinel/#software`,
    name: "ClubSentinel",
    url: `${SITE_URL}/clubsentinel/`,
    sameAs: ["https://clubsentinel.co.uk"],
    description:
      "Health and safety compliance software for UK golf clubs: voice-driven records, AI Safety Data Sheet extraction, RIDDOR, COSHH, training, greenkeeping records and a live compliance score.",
    offers: monthly(199, "ClubSentinel, per club"),
  }),
  county: app({
    "@id": `${SITE_URL}/countyconsent/#software`,
    name: "CountyConsent",
    url: `${SITE_URL}/countyconsent/`,
    sameAs: ["https://countyconsent.co.uk"],
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
    "@id": `${SITE_URL}/referencesentinel/#software`,
    name: "ReferenceSentinel",
    url: `${SITE_URL}/referencesentinel/`,
    sameAs: ["https://referencesentinel.co.uk"],
    description:
      "Employment reference checking and workforce compliance software for UK recruitment agencies: AI fraud detection, automated referee chasing, Right to Work and DBS tracking.",
  }),
  care: app({
    "@id": `${SITE_URL}/caresentinel/#software`,
    name: "CareSentinel",
    url: `${SITE_URL}/caresentinel/`,
    sameAs: ["https://caresentinel.uk"],
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
    src: "clubsentinel/index.html",
    path: "/clubsentinel/",
    title: "ClubSentinel | Golf Club Health & Safety Software UK",
    description:
      "Health and safety software for UK golf clubs. Voice records, AI COSHH data sheet reading, RIDDOR and a live compliance score. £199 a month per club.",
    ogAlt: "ClubSentinel: health and safety software for UK golf clubs",
    schema: (faq) => [ORGANIZATION, APPS.club, faq, crumb("ClubSentinel", "/clubsentinel/")],
  },
  {
    src: "countyconsent/index.html",
    path: "/countyconsent/",
    title: "CountyConsent | Junior Golf Consent Software UK",
    description:
      "Digital parental consent and safeguarding for UK golf clubs and county unions. Medical alerts, audit trail, turning-18 alerts. From £65 a month.",
    ogAlt: "CountyConsent: junior golf consent and safeguarding software",
    schema: (faq) => [ORGANIZATION, APPS.county, faq, crumb("CountyConsent", "/countyconsent/")],
  },
  {
    src: "referencesentinel/index.html",
    path: "/referencesentinel/",
    title: "ReferenceSentinel | Reference Checking Software UK",
    description:
      "Reference checking and workforce compliance for UK recruitment agencies. AI fraud checks, automated chasing, RTW and DBS tracking. Book a demo.",
    ogAlt: "ReferenceSentinel: reference checking software for UK recruitment agencies",
    schema: (faq) => [ORGANIZATION, APPS.reference, faq, crumb("ReferenceSentinel", "/referencesentinel/")],
  },
  {
    src: "caresentinel/index.html",
    path: "/caresentinel/",
    title: "CareSentinel | Care Home Compliance Software UK",
    description:
      "Voice-first CQC compliance software for UK care homes. Speak it and AI writes the record. RIDDOR flags, COSHH, audits. From £6 per bed a month.",
    ogAlt: "CareSentinel: CQC compliance software for UK care homes",
    schema: (faq) => [ORGANIZATION, APPS.care, faq, crumb("CareSentinel", "/caresentinel/")],
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
