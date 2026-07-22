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
    return Number.parseFloat(String(value).replace("$", "")) || 0;
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

  return {
    calculatePriceComparison,
    formatCurrency,
    formatProjectedCost,
    getBestTwelveMonthProjection,
    getComparableCost,
    getProjectedCosts,
    normalizeDuration,
    parseCurrency,
    summarizeSubscriptionCosts,
  };
});
