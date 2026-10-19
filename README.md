# Patient Access Scoring — Setup Guide

A Salesforce-Help-styled, end-to-end setup guide for **Patient Access Scoring** (predictive referral scoring for Clinical Service Requests) in Health Cloud.

The official doc covers this feature in a few sentences buried in the Referral Management checklist. This site fills the gaps customers hit in practice: what each Scoring Framework parameter does, the integration-user permissions the score writeback needs, and troubleshooting for the two failures that block most first installs.

## Contents

| Page | What it covers |
|------|----------------|
| `index.html` | Overview, how it works, the three-step journey |
| `prerequisites.html` | Org/licensing, data readiness (400+ rows, label balance), admin permissions |
| `data-kit.html` | **Step 1** — install the Health Cloud Scoring data kit (CSRScore bundle), verify DMO mappings |
| `scoring-framework.html` | **Step 2** — install the Patient Access Scoring template and set every parameter |
| `cfe-permissions.html` | **Step 3** — configure Copy Field Enrichment writeback + grant integration-user permissions, and verify |
| `troubleshooting.html` | Model stuck in Activating, missing Referral Score field, scores not landing, and more |

## Viewing locally

It's a static site — no build step.

```sh
python3 -m http.server 8080
# then open http://localhost:8080
```

## GitHub Pages

The `.nojekyll` file lets GitHub Pages serve the site as-is. Enable Pages on the `main` branch (root) in the repository settings to get a live URL.

## Notes

- Styling is modeled on the Salesforce Lightning Design System color and type tokens for an authentic Salesforce Help look; it does not bundle or redistribute SLDS assets.
- Parameter reference is based on the Patient Access Scoring template configuration.
- This is a community setup guide, not an official Salesforce publication.
