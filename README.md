# Son's Hibachi — Website

LA-style hibachi food truck · 465 Tacchino St, Reno NV · Built by [Nexora Digital](https://www.nexoradigital.live)

Static site (no build step) + one Vercel serverless function.

| Path | What |
|---|---|
| `/` | Main site: menu, Build-a-Box ordering, reels, story, events form, map |
| `/pitch` | Client proposal / sales pitch page (noindex) |
| `/api/inquiry` | Emails event & catering inquiries via Resend |

## Deploy (Vercel)
1. Import this repo in Vercel. Framework preset: **Other**. No build command.
2. Add environment variables:
   - `RESEND_API_KEY`: from resend.com
   - `INQUIRY_TO_EMAIL`: owner's email (comma-separate for several)
   - `INQUIRY_FROM_EMAIL`: verified sender, e.g. `Son's Hibachi <inquiries@sonshibachi.com>` (optional, defaults to Resend test sender)
3. Redeploy after adding env vars.

If email isn't configured, the form copies the details and points the customer to Instagram DM or a phone call, so no lead is lost.

## Editing the menu
All prices and items live at the top of `assets/js/main.js` (`PROTEINS`, `FORMATS`, `SAUCES`, `EXTRAS`, `MENU`).

## Local preview
`npx serve .` (or any static server). Run `vercel dev` to test the form API.
