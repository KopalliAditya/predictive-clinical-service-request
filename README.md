# Predictive Analytics for Clinical Service Requests — Setup Guide

A Salesforce-Help-styled, end-to-end setup guide for **Predictive Analytics for Clinical Service Requests** (predictive scoring for Clinical Service Requests) in Health Cloud.

This site documents the full setup: installing the data kit, each Scoring Framework template parameter, the integration-user permissions the score writeback needs, and troubleshooting.

## Contents

| Page | What it covers |
|------|----------------|
| `index.html` | Overview, how it works, the three-step setup |
| `prerequisites.html` | Org/licensing, data readiness (400+ rows, label balance), admin permissions |
| `data-kit.html` | **Step 1** — install the Health Cloud Scoring data kit (CSRScore bundle), verify DMO mappings |
| `scoring-framework.html` | **Step 2** — install the Predictive Analytics for Clinical Service Requests template and set every parameter |
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
- Parameter reference is based on the Predictive Analytics for Clinical Service Requests template configuration.
- This is a community setup guide, not an official Salesforce publication.
