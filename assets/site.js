// Shared chrome for the Patient Access Scoring help site.
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
  <path d="M18.5 10.2a4.3 4.3 0 00-8.1-1.4 3.4 3.4 0 00-4.8 3.1c0 .1 0 .3.02.4A3.2 3.2 0 006 18.8h12a3.6 3.6 0 00.5-7.2z" fill="#fff" opacity="0.95"/>
</svg>`;

function buildHeader() {
  const h = document.createElement("header");
  h.className = "site-header";
  h.innerHTML = `
    <div class="site-header-inner">
      <span class="cloud-badge">${CLOUD_SVG} Health Cloud Help</span>
      <span class="product">Patient Access Scoring for Clinical Service Requests</span>
      <span class="spacer"></span>
      <a class="header-link" href="index.html">Setup Guide Home</a>
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

document.addEventListener("DOMContentLoaded", () => {
  const active = document.body.dataset.page || "index";
  document.body.prepend(buildHeader());
  const layout = document.querySelector(".layout");
  if (layout) layout.prepend(buildSidebar(active));
});
