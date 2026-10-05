const assert = require("node:assert/strict");
const {
  addMonths,
  calculatePriceComparison,
  escapeCsvCell,
  formatDateInput,
  formatCurrency,
  getBestTwelveMonthProjection,
  getBillingIntervalMonths,
  getChargeTotals,
  getComparableCost,
  getDaysUntil,
  getNextRenewalDate,
  getProjectedCosts,
  getUpcomingCharges,
  getValueRating,
  normalizeDuration,
  parseDateOnly,
  parseCurrency,
  summarizeSubscriptionCosts,
} = require("../price-utils");

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

test("normalizes old 1 Month duration", () => {
  assert.equal(normalizeDuration("1 Month"), "Monthly");
  assert.equal(normalizeDuration("3 Months"), "3 Months");
});

test("parses and formats currency", () => {
  assert.equal(parseCurrency("$10.99"), 10.99);
  assert.equal(parseCurrency("27.99"), 27.99);
  assert.equal(formatCurrency(10.99), "$10.99");
});

test("projects monthly subscriptions", () => {
  const costs = getProjectedCosts({ price: "10.99", duration: "Monthly" });

  assert.deepEqual(costs, {
    monthly: 10.99,
    threeMonth: 32.97,
    twelveMonth: 131.88,
  });
});

test("projects 3-month subscriptions", () => {
  const costs = getProjectedCosts({ price: "27.99", duration: "3 Months" });

  assert.deepEqual(costs, {
    monthly: null,
    threeMonth: 27.99,
    twelveMonth: 111.96,
  });
});

test("projects yearly subscriptions", () => {
  const costs = getProjectedCosts({ price: "79.99", duration: "Yearly" });

  assert.deepEqual(costs, {
    monthly: null,
    threeMonth: null,
    twelveMonth: 79.99,
  });
});

test("formats comparison rows", () => {
  const comparison = calculatePriceComparison([
    { plan: "PlayStation Plus Essential - Monthly", price: "10.99", duration: "Monthly" },
    { plan: "PlayStation Plus Essential - 3 Months", price: "27.99", duration: "3 Months" },
    { plan: "PlayStation Plus Essential - Yearly", price: "79.99", duration: "Yearly" },
  ]);

  assert.deepEqual(comparison, [
    {
      name: "PlayStation Plus Essential - Monthly",
      monthlyCost: "$10.99",
      monthlyValue: 10.99,
      threeMonthCost: "$32.97",
      threeMonthValue: 32.97,
      twelveMonthCost: "$131.88",
      twelveMonthValue: 131.88,
    },
    {
      name: "PlayStation Plus Essential - 3 Months",
      monthlyCost: "N/A",
      monthlyValue: null,
      threeMonthCost: "$27.99",
      threeMonthValue: 27.99,
      twelveMonthCost: "$111.96",
      twelveMonthValue: 111.96,
    },
    {
      name: "PlayStation Plus Essential - Yearly",
      monthlyCost: "N/A",
      monthlyValue: null,
      threeMonthCost: "N/A",
      threeMonthValue: null,
      twelveMonthCost: "$79.99",
      twelveMonthValue: 79.99,
    },
  ]);
});

test("gets comparable cost for the selected horizon", () => {
  const plan = { price: "7.99", duration: "3 Months" };

  assert.equal(getComparableCost(plan, "monthly"), null);
  assert.equal(getComparableCost(plan, "threeMonth"), 7.99);
  assert.equal(getComparableCost(plan, "twelveMonth"), 31.96);
});

test("best value requires at least two valid 12-month projections", () => {
  assert.equal(
    getBestTwelveMonthProjection([
      {
        name: "Only Plan",
        twelveMonthCost: "$79.99",
        twelveMonthValue: 79.99,
      },
    ]),
    null
  );

  const best = getBestTwelveMonthProjection([
    {
      name: "Monthly Projection",
      twelveMonthCost: "$131.88",
      twelveMonthValue: 131.88,
    },
    {
      name: "Yearly Plan",
      twelveMonthCost: "$79.99",
      twelveMonthValue: 79.99,
    },
  ]);

  assert.equal(best.name, "Yearly Plan");
});

test("summarizes selected subscription totals", () => {
  const summary = summarizeSubscriptionCosts([
    { price: "3.99", duration: "Monthly" },
    { price: "27.99", duration: "3 Months" },
    { price: "49.99", duration: "Yearly" },
  ]);

  assert.equal(summary.dueTodayFormatted, "$81.97");
  assert.equal(summary.monthlyAverageFormatted, "$17.49");
  assert.equal(summary.twelveMonthProjectionFormatted, "$209.83");
});

test("calculates billing intervals and date helpers", () => {
  assert.equal(getBillingIntervalMonths("Monthly"), 1);
  assert.equal(getBillingIntervalMonths("3 Months"), 3);
  assert.equal(getBillingIntervalMonths("Yearly"), 12);
  assert.equal(formatDateInput(addMonths(parseDateOnly("2026-01-31"), 1)), "2026-02-28");
});

test("finds next renewal date from an original renewal date", () => {
  const today = parseDateOnly("2026-07-22");

  assert.equal(formatDateInput(getNextRenewalDate("2026-07-10", "Monthly", today)), "2026-08-10");
  assert.equal(formatDateInput(getNextRenewalDate("2026-06-01", "3 Months", today)), "2026-09-01");
  assert.equal(getDaysUntil("2026-07-30", today), 8);
});

test("builds upcoming charge list inside a window", () => {
  const charges = getUpcomingCharges(
    [
      { id: "monthly", plan: "Monthly Plan", price: "10.00", duration: "Monthly" },
      { id: "yearly", plan: "Yearly Plan", price: "80.00", duration: "Yearly" },
    ],
    {
      monthly: "2026-07-30",
      yearly: "2026-12-01",
    },
    parseDateOnly("2026-07-22"),
    90
  );

  assert.deepEqual(
    charges.map((charge) => charge.date),
    ["2026-07-30", "2026-08-30", "2026-09-30"]
  );
  assert.equal(charges.reduce((sum, charge) => sum + charge.price, 0), 30);
});

test("parses currency with thousands separators", () => {
  assert.equal(parseCurrency("$1,299.99"), 1299.99);
  assert.equal(parseCurrency(" 49.99 "), 49.99);
});

test("month-end renewals do not drift after short months", () => {
  const today = parseDateOnly("2026-05-15");

  assert.equal(formatDateInput(getNextRenewalDate("2026-01-31", "Monthly", today)), "2026-05-31");
  assert.equal(formatDateInput(getNextRenewalDate("2025-11-30", "3 Months", today)), "2026-05-30");

  const charges = getUpcomingCharges(
    [{ id: "monthly", plan: "Monthly Plan", price: "10.00", duration: "Monthly" }],
    { monthly: "2026-01-31" },
    parseDateOnly("2026-02-01"),
    90
  );

  assert.deepEqual(
    charges.map((charge) => charge.date),
    ["2026-02-28", "2026-03-31", "2026-04-30"]
  );
});

test("day counts are not skewed by daylight saving transitions", () => {
  const originalTz = process.env.TZ;
  process.env.TZ = "America/New_York";

  try {
    assert.equal(getDaysUntil("2026-11-05", parseDateOnly("2026-10-30")), 6);
    assert.equal(getDaysUntil("2026-03-10", parseDateOnly("2026-03-05")), 5);
  } finally {
    if (originalTz === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = originalTz;
    }
  }
});

test("totals charges for the 30- and 90-day windows", () => {
  const totals = getChargeTotals([
    { price: 10, daysUntil: 0 },
    { price: 5, daysUntil: 30 },
    { price: 20, daysUntil: 31 },
  ]);

  assert.deepEqual(totals, { nextThirty: 15, nextNinety: 35 });
});

test("rates value per gaming hour", () => {
  assert.equal(getValueRating(20, ""), null);
  assert.equal(getValueRating(0, "10"), null);
  assert.equal(getValueRating(20, "10").level, "Great");
  assert.equal(getValueRating(40, "10").level, "Good");
  assert.equal(getValueRating(60, "10").level, "Watch");
});

test("escapes CSV cells and neutralizes formulas", () => {
  assert.equal(escapeCsvCell('Say "hi"'), '"Say ""hi"""');
  assert.equal(escapeCsvCell("=HYPERLINK(\"x\")"), '"\'=HYPERLINK(""x"")"');
  assert.equal(escapeCsvCell("@SUM(A1)"), '"\'@SUM(A1)"');
  assert.equal(escapeCsvCell("12.99"), '"12.99"');
  assert.equal(escapeCsvCell(null), '""');
});
