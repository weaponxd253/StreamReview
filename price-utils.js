(function (root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.StreamReviewPriceUtils = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  function normalizeDuration(duration) {
    return duration === "1 Month" ? "Monthly" : duration;
  }

  function parseCurrency(value) {
    return Number.parseFloat(String(value).replace(/[$,\s]/g, "")) || 0;
  }

  function formatCurrency(value) {
    return `$${Number.parseFloat(value).toFixed(2)}`;
  }

  function formatProjectedCost(value) {
    return Number.isFinite(value) ? formatCurrency(value) : "N/A";
  }

  function getProjectedCosts(subscription) {
    const baseCost = parseCurrency(subscription.price);
    const duration = normalizeDuration(subscription.duration);

    if (duration === "Monthly") {
      return {
        monthly: baseCost,
        threeMonth: baseCost * 3,
        twelveMonth: baseCost * 12,
      };
    }

    if (duration === "3 Months") {
      return {
        monthly: null,
        threeMonth: baseCost,
        twelveMonth: baseCost * 4,
      };
    }

    if (duration === "Yearly") {
      return {
        monthly: null,
        threeMonth: null,
        twelveMonth: baseCost,
      };
    }

    return {
      monthly: null,
      threeMonth: null,
      twelveMonth: null,
    };
  }

  function calculatePriceComparison(subscriptionPlans) {
    return subscriptionPlans.map((plan) => {
      const projectedCosts = getProjectedCosts(plan);

      return {
        name: plan.plan,
        monthlyCost: formatProjectedCost(projectedCosts.monthly),
        monthlyValue: projectedCosts.monthly,
        threeMonthCost: formatProjectedCost(projectedCosts.threeMonth),
        threeMonthValue: projectedCosts.threeMonth,
        twelveMonthCost: formatProjectedCost(projectedCosts.twelveMonth),
        twelveMonthValue: projectedCosts.twelveMonth,
      };
    });
  }

  function getComparableCost(subscription, horizon) {
    const projectedCosts = getProjectedCosts(subscription);

    if (horizon === "monthly") {
      return projectedCosts.monthly;
    }

    if (horizon === "threeMonth") {
      return projectedCosts.threeMonth;
    }

    return projectedCosts.twelveMonth;
  }

  function getBestTwelveMonthProjection(comparisonData) {
    const validCosts = comparisonData.filter((data) => Number.isFinite(data.twelveMonthValue));

    if (validCosts.length < 2) {
      return null;
    }

    return validCosts.reduce((lowest, data) => {
      if (!lowest || data.twelveMonthValue < lowest.twelveMonthValue) {
        return data;
      }

      return lowest;
    }, null);
  }

  function summarizeSubscriptionCosts(subscriptionPlans) {
    const totals = subscriptionPlans.reduce(
      (summary, subscription) => {
        const projectedCosts = getProjectedCosts(subscription);

        summary.dueToday += parseCurrency(subscription.price);
        if (Number.isFinite(projectedCosts.twelveMonth)) {
          summary.twelveMonthProjection += projectedCosts.twelveMonth;
        }

        return summary;
      },
      {
        dueToday: 0,
        twelveMonthProjection: 0,
      }
    );

    const monthlyAverage = totals.twelveMonthProjection / 12;

    return {
      dueToday: totals.dueToday,
      dueTodayFormatted: formatCurrency(totals.dueToday),
      monthlyAverage,
      monthlyAverageFormatted: formatCurrency(monthlyAverage),
      twelveMonthProjection: totals.twelveMonthProjection,
      twelveMonthProjectionFormatted: formatCurrency(totals.twelveMonthProjection),
    };
  }

  function getBillingIntervalMonths(duration) {
    const normalizedDuration = normalizeDuration(duration);

    if (normalizedDuration === "Monthly") {
      return 1;
    }

    if (normalizedDuration === "3 Months") {
      return 3;
    }

    if (normalizedDuration === "Yearly") {
      return 12;
    }

    return null;
  }

  function parseDateOnly(value) {
    if (!value) {
      return null;
    }

    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatDateInput(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function addMonths(date, monthCount) {
    const nextDate = new Date(date.getTime());
    const originalDay = nextDate.getDate();

    nextDate.setMonth(nextDate.getMonth() + monthCount);
    if (nextDate.getDate() !== originalDay) {
      nextDate.setDate(0);
    }

    return nextDate;
  }

  function getNextRenewalDate(renewalDateValue, duration, todayValue = new Date()) {
    const intervalMonths = getBillingIntervalMonths(duration);
    const renewalDate = parseDateOnly(renewalDateValue);
    const today = todayValue instanceof Date ? todayValue : parseDateOnly(todayValue);

    if (!intervalMonths || !renewalDate || !today) {
      return null;
    }

    return getNextRenewalOccurrence(renewalDate, intervalMonths, today).date;
  }

  // Each renewal is counted from the original date so a 31st renewal returns to
  // the 31st after a short month instead of drifting to the 28th.
  function getNextRenewalOccurrence(renewalDate, intervalMonths, todayValue) {
    const normalizedToday = parseDateOnly(formatDateInput(todayValue));
    let periods = 0;
    let date = renewalDate;

    while (date < normalizedToday) {
      periods += 1;
      date = addMonths(renewalDate, periods * intervalMonths);
    }

    return { date, periods };
  }

  function toUtcDay(date) {
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function getDaysUntil(dateValue, todayValue = new Date()) {
    const date = dateValue instanceof Date ? dateValue : parseDateOnly(dateValue);
    const today = todayValue instanceof Date ? todayValue : parseDateOnly(todayValue);

    if (!date || !today) {
      return null;
    }

    // Compare calendar days in UTC so DST transitions (23h/25h days) don't skew the count.
    return Math.round((toUtcDay(date) - toUtcDay(today)) / 86400000);
  }

  function getUpcomingCharges(subscriptionPlans, renewalDates = {}, todayValue = new Date(), daysAhead = 90) {
    const today = todayValue instanceof Date ? todayValue : parseDateOnly(todayValue);
    if (!today) {
      return [];
    }

    const windowEnd = new Date(today.getTime());
    windowEnd.setDate(windowEnd.getDate() + daysAhead);

    return subscriptionPlans
      .flatMap((subscription) => {
        const intervalMonths = getBillingIntervalMonths(subscription.duration);
        const renewalDate = parseDateOnly(renewalDates[subscription.id]);
        const charges = [];

        if (!intervalMonths || !renewalDate) {
          return charges;
        }

        let { date: nextDate, periods } = getNextRenewalOccurrence(renewalDate, intervalMonths, today);

        while (nextDate <= windowEnd) {
          charges.push({
            id: subscription.id,
            plan: subscription.plan,
            price: parseCurrency(subscription.price),
            priceFormatted: formatCurrency(subscription.price),
            date: formatDateInput(nextDate),
            daysUntil: getDaysUntil(nextDate, today),
          });
          periods += 1;
          nextDate = addMonths(renewalDate, periods * intervalMonths);
        }

        return charges;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  function getChargeTotals(charges) {
    return charges.reduce(
      (totals, charge) => {
        if (charge.daysUntil <= 30) {
          totals.nextThirty += charge.price;
        }
        totals.nextNinety += charge.price;
        return totals;
      },
      { nextThirty: 0, nextNinety: 0 }
    );
  }

  function getValueRating(monthlyAverage, hoursValue) {
    const hours = Number.parseFloat(hoursValue);
    if (!Number.isFinite(hours) || hours <= 0 || !(monthlyAverage > 0)) {
      return null;
    }

    const hourlyCost = monthlyAverage / hours;
    if (hourlyCost <= 2) {
      return { hourlyCost, level: "Great" };
    }

    if (hourlyCost <= 5) {
      return { hourlyCost, level: "Good" };
    }

    return { hourlyCost, level: "Watch" };
  }

  // Quotes every cell and neutralizes values a spreadsheet would run as a formula.
  function escapeCsvCell(value) {
    let text = String(value ?? "");
    if (/^[=+\-@\t\r]/.test(text)) {
      text = `'${text}`;
    }
    return `"${text.replace(/"/g, '""')}"`;
  }

  return {
    addMonths,
    calculatePriceComparison,
    escapeCsvCell,
    formatCurrency,
    formatDateInput,
    formatProjectedCost,
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
  };
});
