# StreamReview

StreamReview is a static gaming subscription planner. Open `index.html` directly in a browser to use it.

## Commands

```sh
npm run check
npm test
```

## Pricing

Prices are regular U.S. list prices. Each provider in `catalog.js` records when its prices were last checked (`pricesCheckedOn`), and the app shows that date in each plan's details:

- Gaming (PlayStation Plus, Xbox Game Pass, Nintendo Switch Online): checked July 20, 2026.
- Streaming video (Netflix, Disney+, Hulu, HBO Max, Peacock, Paramount+, Apple TV, Prime Video): checked October 6, 2026.

Introductory offers and trials are shown in plan details, but they are excluded from cost projections. Prime Video with Ultra is priced as the standalone plan plus the Ultra add-on.

To add a provider, add an entry to `catalog.js` with its category, theme colours, tiers and plans; `npm test` checks the catalog for duplicate ids, missing fields and unsupported billing periods.

The comparison table projects selected plans into monthly, 3-month, and 12-month costs. It highlights the lowest 12-month projection only when at least two valid 12-month projections are selected.
