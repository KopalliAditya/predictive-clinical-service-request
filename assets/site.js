// Shared chrome for the Predictive Analytics for Clinical Service Requests help site.
// Each page sets <body data-page="..."> and this injects the header + left nav.

const NAV = [
  { group: "Get Started", items: [
    { id: "index",             href: "index.html",             label: "Overview" },
    { id: "prerequisites",     href: "prerequisites.html",     label: "Prerequisites" },
  ]},
  { group: "Set Up Scoring", items: [
    { id: "data-kit",          href: "data-kit.html",          label: "Install the Data Kit",            step: 1 },
    { id: "scoring-framework", href: "scoring-framework.html", label: "Install the Scoring Template",    step: 2 },
    { id: "cfe-permissions",   href: "cfe-permissions.html",   label: "Enable the Score Writeback",      step: 3 },
  ]},
  { group: "Reference", items: [
    { id: "troubleshooting",   href: "troubleshooting.html",   label: "Troubleshooting" },
  ]},
];

const CLOUD_SVG = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M18.6 10.1a4.4 4.4 0 00-8.2-1.5 3.5 3.5 0 00-4.9 3.2c0 .15.01.3.03.45A3.3 3.3 0 006 18.9h12.1a3.7 3.7 0 00.5-8.8z" fill="#0176d3"/>
</svg>`;

const SEARCH_SVG = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="10.5" cy="10.5" r="6.5" stroke="#747474" stroke-width="2"/>
  <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="#747474" stroke-width="2" stroke-linecap="round"/>
</svg>`;

function buildHeader() {
  const h = document.createElement("header");
  h.className = "site-header";
  h.innerHTML = `
    <div class="site-header-inner">
      <span class="cloud-badge">${CLOUD_SVG} <span><strong>Salesforce</strong> Help</span></span>
      <span class="product">Health Cloud · Referral Management</span>
      <span class="spacer"></span>
      <span class="search">${SEARCH_SVG}<input type="search" placeholder="Search Salesforce Help" aria-label="Search Salesforce Help"></span>
    </div>`;
  return h;
}

function buildSidebar(active) {
  const aside = document.createElement("aside");
  aside.className = "sidebar";
  let html = "<nav>";
  for (const g of NAV) {
    html += `<h2>${g.group}</h2>`;
    for (const it of g.items) {
      const cls = it.id === active ? "active" : "";
      const num = it.step ? `<span class="step-num">${it.step}</span>` : "";
      html += `<a class="${cls}" href="${it.href}">${num}${it.label}</a>`;
    }
  }
  html += "</nav>";
  aside.innerHTML = html;
  return aside;
}

const IMG_ICO = `<svg class="ico" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="3" y="4" width="18" height="16" rx="2" stroke="#747474" stroke-width="1.6"/>
  <circle cx="8.5" cy="9" r="1.8" stroke="#747474" stroke-width="1.4"/>
  <path d="M4 17l4.5-4.5 3 3L15 12l5 5" stroke="#747474" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Each <figure class="shot" data-src="images/x.png" data-caption="..."> shows the
// image when it loads, otherwise a labeled placeholder with the same caption.
function buildFigures() {
  document.querySelectorAll("figure.shot").forEach((fig) => {
    const src = fig.dataset.src;
    const caption = fig.dataset.caption || "";
    const placeholder = `<div class="placeholder">${IMG_ICO}<span>Screenshot: ${caption}</span></div>`;
    const figcap = caption ? `<figcaption><b>Figure.</b> ${caption}</figcaption>` : "";
    if (src) {
      const img = new Image();
      img.alt = caption;
      img.onload = () => { fig.innerHTML = `<img src="${src}" alt="${caption}">` + figcap; };
      img.onerror = () => { fig.innerHTML = placeholder + figcap; };
      img.src = src;
    } else {
      fig.innerHTML = placeholder + figcap;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const active = document.body.dataset.page || "index";
  document.body.prepend(buildHeader());
  const layout = document.querySelector(".layout");
  if (layout) layout.prepend(buildSidebar(active));
  buildFigures();
});
