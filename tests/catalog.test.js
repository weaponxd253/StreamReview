const assert = require("node:assert/strict");
const { categories, providers } = require("../catalog");
const { getBillingIntervalMonths } = require("../price-utils");

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

const tiers = providers.flatMap((provider) => provider.tiers);
const plans = tiers.flatMap((tier) => tier.plans);

test("provider, tier and plan ids are unique", () => {
  for (const ids of [providers.map((p) => p.id), tiers.map((t) => t.id), plans.map((p) => p.id)]) {
    assert.equal(new Set(ids).size, ids.length, `duplicate id in ${ids.join(", ")}`);
  }
});

test("every provider belongs to a known category and has display data", () => {
  const categoryIds = new Set(categories.map((category) => category.id));
  providers.forEach((provider) => {
    assert.ok(categoryIds.has(provider.category), `${provider.id} has unknown category ${provider.category}`);
    assert.ok(provider.name && provider.shortName && provider.planPrefix && provider.iconClass, provider.id);
    assert.match(provider.theme.brand, /^#[0-9a-f]{6}$/i, provider.id);
    assert.match(provider.pricesCheckedOn, /^\d{4}-\d{2}-\d{2}$/, provider.id);
    assert.ok(provider.tiers.length > 0, `${provider.id} has no tiers`);
  });
});

test("every plan has a positive price and a supported billing period", () => {
  plans.forEach((plan) => {
    assert.ok(Number.isFinite(plan.price) && plan.price > 0, `${plan.id} price`);
    assert.ok(getBillingIntervalMonths(plan.duration), `${plan.id} duration ${plan.duration}`);
  });
});

test("tiers have at most three billing options, one per period", () => {
  tiers.forEach((tier) => {
    assert.ok(tier.plans.length >= 1 && tier.plans.length <= 3, tier.id);
    const durations = tier.plans.map((plan) => plan.duration);
    assert.equal(new Set(durations).size, durations.length, `${tier.id} repeats a billing period`);
  });
});

test("every category has at least one provider", () => {
  categories.forEach((category) => {
    assert.ok(providers.some((provider) => provider.category === category.id), category.id);
  });
});

test("extra categories and tier category limits are valid", () => {
  const categoryIds = new Set(categories.map((category) => category.id));
  providers.forEach((provider) => {
    const listedIn = [provider.category, ...(provider.alsoIn || [])];
    assert.equal(new Set(listedIn).size, listedIn.length, `${provider.id} repeats a category`);
    listedIn.forEach((category) => assert.ok(categoryIds.has(category), `${provider.id} lists unknown ${category}`));

    provider.tiers.forEach((tier) => {
      (tier.categories || []).forEach((category) => {
        assert.ok(listedIn.includes(category), `${tier.id} limited to ${category}, which ${provider.id} is not listed in`);
      });
    });

    listedIn.forEach((category) => {
      const hasTier = provider.tiers.some((tier) => !tier.categories || tier.categories.includes(category));
      assert.ok(hasTier, `${provider.id} is listed in ${category} but has no tiers there`);
    });
  });
});
