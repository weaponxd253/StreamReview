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
        threeMonthCost: formatProjectedCost(projectedCosts.threeMonth),
        twelveMonthCost: formatProjectedCost(projectedCosts.twelveMonth),
        twelveMonthValue: projectedCosts.twelveMonth,
      };
    });
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

  return {
    calculatePriceComparison,
    formatCurrency,
    formatProjectedCost,
    getBestTwelveMonthProjection,
    getProjectedCosts,
    normalizeDuration,
    parseCurrency,
  };
});
