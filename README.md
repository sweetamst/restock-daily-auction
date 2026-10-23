# restock daily auction

Clickable prototype of the **restock buyer portal**. Buyers set a price per device model and state before 16:00 each day. The highest price wins, and the next day everyone sees yesterday's best price.

All data is sample data. There is no backend yet.

## Screens

| Screen | What it shows |
|---|---|
| Dashboard | KPIs and your prices next to yesterday's best |
| Price manager | Price per model and state, search, "best + € 1", save |
| Purchases | Won devices with status filters |
| Guide | How a daily round works and what each device state means |
| Shipments, Invoices | Placeholders for a next step |

## Open it

No build step and no dependencies: open `index.html` in a browser.

To put it online with GitHub Pages: **Settings › Pages**, source **Deploy from a branch**, branch `main`, folder `/ (root)`. After a minute it runs at https://sweetamst.github.io/restock-daily-auction/

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure and fixed copy (labels, guide) |
| `styles.css` | Look and layout |
| `app.js` | Sample data, price logic, filters, round deadline |
| `favicon.svg` | Browser tab icon |
| `Main.dc.html`, `canvas.json` | Original Claude Design source, only opens in Claude |
