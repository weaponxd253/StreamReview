document.addEventListener("DOMContentLoaded", () => {
  const subscriptionsKey = "userSubscriptions";

  const providers = [
    {
      id: "playstation",
      name: "PlayStation Network",
      planPrefix: "PlayStation",
      iconClass: "fa-brands fa-playstation",
      buttonId: "ps",
      collapseId: "collapsePS",
      headerClass: "psHeader",
      rowClass: "psSubheader",
      questionClass: "psQuestion",
      tiers: [
        {
          id: "essential",
          name: "Essential",
          detailTitle: "PlayStation Plus Essential",
          detailIntro: "This is the foundational tier, providing core benefits to enhance your gaming experience:",
          detailItems: [
            ["Online Multiplayer Access", "Play online with friends and other players."],
            ["Monthly Games", "Access to PS4 and PS5 games each month."],
            ["Exclusive Discounts", "Special deals in the PlayStation Store."],
            ["Cloud Storage", "100 GB for your game saves."],
          ],
          plans: [
            { id: "ps-essential-monthly", label: "Monthly", price: 9.99, duration: "Monthly", legacyNames: ["PlayStation Essential - 1 Month"] },
            { id: "ps-essential-3-months", label: "3 Months", price: 24.99, duration: "3 Months" },
            { id: "ps-essential-yearly", label: "Yearly", price: 59.99, duration: "Yearly" },
          ],
        },
        {
          id: "extra",
          name: "Extra",
          detailTitle: "PlayStation Plus Extra",
          detailIntro: "Building upon the Essential tier, the Extra plan offers additional perks:",
          detailItems: [
            ["Game Catalog", "Access up to 400 PS4 and PS5 games."],
            ["Ubisoft+ Classics", "A curated selection of Ubisoft titles."],
          ],
          plans: [
            { id: "ps-extra-monthly", label: "Monthly", price: 14.99, duration: "Monthly", legacyNames: ["PlayStation Extra - 1 Month"] },
            { id: "ps-extra-3-months", label: "3 Months", price: 39.99, duration: "3 Months" },
            { id: "ps-extra-yearly", label: "Yearly", price: 99.99, duration: "Yearly" },
          ],
        },
        {
          id: "premium",
          name: "Premium",
          detailTitle: "PlayStation Plus Premium",
          detailIntro: "Offering all benefits of Essential and Extra tiers, plus exclusive features:",
          detailItems: [
            ["Classics Catalog", "Stream or download games from older PlayStation generations."],
            ["Game Trials", "Try new games before buying."],
            ["Cloud Streaming", "Play on PS4, PS5, or PC."],
          ],
          plans: [
            { id: "ps-premium-monthly", label: "Monthly", price: 17.99, duration: "Monthly", legacyNames: ["PlayStation Premium - 1 Month"] },
            { id: "ps-premium-3-months", label: "3 Months", price: 49.99, duration: "3 Months" },
            { id: "ps-premium-yearly", label: "Yearly", price: 119.99, duration: "Yearly" },
          ],
        },
      ],
    },
    {
      id: "xbox",
      name: "Xbox Game Pass",
      planPrefix: "Xbox",
      iconClass: "fa-brands fa-xbox",
      buttonId: "xbox",
      collapseId: "collapseXbox",
      headerClass: "xboxHeader",
      rowClass: "xboxSubheader",
      questionClass: "xboxQuestion",
      tiers: [
        {
          id: "xbox-core",
          name: "Game Pass Core",
          detailTitle: "Xbox Game Pass Core",
          detailIntro: "Core includes the essentials for console multiplayer and a smaller game library:",
          detailItems: [
            ["Online Console Multiplayer", "Play supported multiplayer games online."],
            ["Game Catalog", "Access a rotating selection of console games."],
            ["Member Deals", "Discounts and promotions on selected titles."],
          ],
          plans: [
            { id: "xbox-core-monthly", label: "Monthly", price: 9.99, duration: "Monthly" },
            { id: "xbox-core-yearly", label: "Yearly", price: 74.99, duration: "Yearly" },
          ],
        },
        {
          id: "xbox-pc",
          name: "Game Pass PC",
          detailTitle: "Xbox Game Pass PC",
          detailIntro: "PC Game Pass focuses on Windows gaming access:",
          detailItems: [
            ["PC Game Library", "Access a rotating catalog of PC titles."],
            ["New Releases", "Includes selected first-party games on release day."],
            ["Member Perks", "Offers and discounts for PC players."],
          ],
          plans: [
            { id: "xbox-pc-monthly", label: "Monthly", price: 14.99, duration: "Monthly" },
          ],
        },
        {
          id: "xbox-standard",
          name: "Game Pass Standard",
          detailTitle: "Xbox Game Pass Standard",
          detailIntro: "Standard combines console catalog access with online console multiplayer:",
          detailItems: [
            ["Console Game Library", "Browse a rotating library of console games."],
            ["Online Multiplayer", "Play supported online console multiplayer."],
            ["Member Deals", "Discounts on selected games and add-ons."],
          ],
          plans: [
            { id: "xbox-standard-monthly", label: "Monthly", price: 14.99, duration: "Monthly" },
          ],
        },
        {
          id: "xbox-ultimate",
          name: "Game Pass Ultimate",
          detailTitle: "Xbox Game Pass Ultimate",
          detailIntro: "Ultimate is the broadest Xbox Game Pass tier:",
          detailItems: [
            ["Console, PC, and Cloud", "Access supported games across multiple ways to play."],
            ["Online Multiplayer", "Includes console multiplayer access."],
            ["Extra Perks", "Includes member rewards, discounts, and partner perks."],
          ],
          plans: [
            { id: "xbox-ultimate-monthly", label: "Monthly", price: 19.99, duration: "Monthly" },
          ],
        },
      ],
    },
    {
      id: "nintendo",
      name: "Nintendo Online",
      planPrefix: "Nintendo",
      iconClass: "fa-solid fa-gamepad",
      buttonId: "nintendo",
      collapseId: "collapseNintendo",
      headerClass: "nintendoHeader",
      rowClass: "nintendoSubHeader",
      questionClass: "nintendoQuestion",
      tiers: [
        {
          id: "nintendo-switch-online",
          name: "Switch Online",
          detailTitle: "Nintendo Switch Online",
          detailIntro: "Switch Online covers core Nintendo online features:",
          detailItems: [
            ["Online Play", "Play compatible Nintendo Switch games online."],
            ["Classic Games", "Access selected classic game libraries."],
            ["Cloud Saves", "Back up supported save data online."],
          ],
          plans: [
            { id: "nintendo-switch-monthly", label: "Monthly", price: 3.99, duration: "Monthly", legacyNames: ["Nintendo Switch Online - 1 Month"] },
            { id: "nintendo-switch-3-months", label: "3 Months", price: 7.99, duration: "3 Months" },
            { id: "nintendo-switch-yearly", label: "Yearly", price: 19.99, duration: "Yearly" },
          ],
        },
        {
          id: "nintendo-family",
          name: "Family Membership",
          detailTitle: "Nintendo Family Membership",
          detailIntro: "Family Membership extends Nintendo Switch Online access across multiple accounts:",
          detailItems: [
            ["Shared Access", "Supports up to 8 Nintendo Accounts."],
            ["Online Play", "Online multiplayer for supported games."],
            ["Classic Games and Cloud Saves", "Includes core Switch Online benefits."],
          ],
          plans: [
            { id: "nintendo-family-monthly", label: "Monthly", price: 34.99, duration: "Monthly" },
          ],
        },
        {
          id: "nintendo-expansion",
          name: "Expansion Pack",
          detailTitle: "Nintendo Switch Online + Expansion Pack",
          detailIntro: "Expansion Pack includes Switch Online benefits plus extra libraries and add-on content:",
          detailItems: [
            ["Expanded Classics", "Access additional classic game catalogs."],
            ["DLC Access", "Includes selected add-on content while subscribed."],
            ["Family Option", "A higher-priced plan supports up to 8 accounts."],
          ],
          plans: [
            { id: "nintendo-expansion-yearly", label: "Yearly", price: 49.99, duration: "Yearly" },
            { id: "nintendo-expansion-family-yearly", label: "Yearly (Up to 8 accounts)", price: 79.99, duration: "Yearly" },
          ],
        },
      ],
    },
  ];

  const { planById, tierById, legacyPlanToId } = buildIndexes(providers);

  renderProviders();
  loadSubscriptions();

  document.body.addEventListener("click", (e) => {
    const subscriptionButton = e.target.closest(".add-subscription");
    if (subscriptionButton) {
      const planId = subscriptionButton.getAttribute("data-plan-id");
      if (!planId || !planById.has(planId)) {
        alert("Error: Subscription data is incomplete. Please try again.");
        return;
      }

      if (subscriptionButton.classList.contains("added")) {
        removeSubscription(planId, subscriptionButton);
      } else {
        addSubscription(planId, subscriptionButton);
      }
    }

    const detailButton = e.target.closest(".plan-info");
    if (detailButton) {
      showPlanDetails(detailButton.getAttribute("data-tier-id"));
    }

    const removeButton = e.target.closest(".remove-subscription");
    if (removeButton) {
      const planId = removeButton.getAttribute("data-plan-id");
      if (!planId) {
        alert("Error: Unable to remove subscription. Missing plan data.");
        return;
      }

      removeSubscription(planId);
    }
  });

  function buildIndexes(providerData) {
    const builtPlanById = new Map();
    const builtTierById = new Map();
    const builtLegacyPlanToId = new Map();

    providerData.forEach((provider) => {
      provider.tiers.forEach((tier) => {
        builtTierById.set(tier.id, { provider, tier });

        tier.plans.forEach((plan) => {
          const record = { provider, tier, plan };
          builtPlanById.set(plan.id, record);
          getPlanNames(record).forEach((name) => {
            builtLegacyPlanToId.set(normalizeKey(name), plan.id);
          });
        });
      });
    });

    return {
      planById: builtPlanById,
      tierById: builtTierById,
      legacyPlanToId: builtLegacyPlanToId,
    };
  }

  function renderProviders() {
    const providerGrid = document.getElementById("providerGrid");
    providerGrid.innerHTML = "";

    providers.forEach((provider) => {
      providerGrid.appendChild(createProviderColumn(provider));
    });
  }

  function createProviderColumn(provider) {
    const column = document.createElement("div");
    column.className = "col-12 col-lg-4 provider-column";

    const buttonRow = document.createElement("div");
    buttonRow.className = "row";

    const buttonCol = document.createElement("div");
    buttonCol.className = "col";

    const collapseButton = document.createElement("button");
    collapseButton.className = "btn btn-primary";
    collapseButton.id = provider.buttonId;
    collapseButton.type = "button";
    collapseButton.setAttribute("data-bs-toggle", "collapse");
    collapseButton.setAttribute("data-bs-target", `#${provider.collapseId}`);
    collapseButton.setAttribute("aria-expanded", "false");
    collapseButton.setAttribute("aria-controls", provider.collapseId);

    const providerIcon = document.createElement("i");
    providerIcon.className = provider.iconClass;
    providerIcon.setAttribute("aria-hidden", "true");
    collapseButton.append(providerIcon, document.createTextNode(` ${provider.name}`));

    buttonCol.appendChild(collapseButton);
    buttonRow.appendChild(buttonCol);
    column.appendChild(buttonRow);

    const collapseRow = document.createElement("div");
    collapseRow.className = "row";

    const collapse = document.createElement("div");
    collapse.className = "collapse multi-collapse";
    collapse.id = provider.collapseId;

    const tierList = document.createElement("ul");
    tierList.className = "list-group list-group-flush";

    provider.tiers.forEach((tier) => {
      const tierItem = document.createElement("li");
      tierItem.className = `list-group-item ${provider.headerClass}`;

      const tierName = document.createElement("span");
      tierName.textContent = tier.name;

      const infoButton = document.createElement("button");
      infoButton.className = `plan-info ${provider.questionClass}`;
      infoButton.type = "button";
      infoButton.setAttribute("data-bs-toggle", "offcanvas");
      infoButton.setAttribute("data-bs-target", "#descriptionOffcanvas");
      infoButton.setAttribute("data-tier-id", tier.id);
      infoButton.setAttribute("aria-label", `Show details for ${tier.detailTitle}`);

      const infoIcon = document.createElement("i");
      infoIcon.className = "fa-solid fa-circle-question";
      infoIcon.setAttribute("aria-hidden", "true");
      infoButton.appendChild(infoIcon);

      tierItem.append(tierName, infoButton);
      tierList.appendChild(tierItem);

      const planList = document.createElement("ul");
      planList.className = "list-group list-group-flush";
      tier.plans.forEach((plan) => {
        planList.appendChild(createPlanRow(provider, tier, plan));
      });
      tierList.appendChild(planList);
    });

    collapse.appendChild(tierList);
    collapseRow.appendChild(collapse);
    column.appendChild(collapseRow);

    return column;
  }

  function createPlanRow(provider, tier, plan) {
    const row = document.createElement("li");
    row.className = `list-group-item ${provider.rowClass}`;

    const label = document.createElement("div");
    label.className = "fw-bold";
    label.textContent = plan.label;

    const dollarIcon = document.createElement("i");
    dollarIcon.className = "fa-solid fa-dollar-sign";
    dollarIcon.setAttribute("aria-hidden", "true");

    const price = document.createElement("span");
    price.textContent = formatPrice(plan.price);

    const addButton = document.createElement("button");
    addButton.className = "add-subscription";
    addButton.type = "button";
    addButton.setAttribute("data-plan-id", plan.id);
    addButton.setAttribute("data-plan", getPlanDisplayName(provider, tier, plan));
    addButton.setAttribute("data-price", formatPrice(plan.price));
    addButton.setAttribute("data-duration", plan.duration);
    addButton.setAttribute("title", "Add Subscription");
    addButton.setAttribute("aria-label", `Add ${getPlanDisplayName(provider, tier, plan)}`);

    const addIcon = document.createElement("i");
    addIcon.className = "fa-solid fa-square-plus icon-plus";
    addIcon.setAttribute("aria-hidden", "true");
    addButton.appendChild(addIcon);

    row.append(label, dollarIcon, price, addButton);
    return row;
  }

  function addSubscription(planId, buttonElement) {
    const subscriptions = getStoredSubscriptions();
    const subscription = createSubscription(planId);

    if (!subscription) {
      showToast("That plan is unavailable", "error");
      return;
    }

    if (!subscriptions.some((s) => s.id === planId)) {
      subscriptions.push(subscription);
      saveSubscriptions(subscriptions);
      showToast(`Added ${getShortPlanName(subscription.plan)}`);

      toggleAddIcon(buttonElement, true);
      highlightSubscription(planId, true);
    } else {
      showToast(`${getShortPlanName(subscription.plan)} is already selected`, "error");
    }

    displaySubscriptions(subscriptions);
  }

  function removeSubscription(planId, buttonElement = null) {
    const subscriptions = getStoredSubscriptions().filter((subscription) => subscription.id !== planId);
    const subscription = createSubscription(planId);

    saveSubscriptions(subscriptions);
    showToast(`Removed ${subscription ? getShortPlanName(subscription.plan) : "subscription"}`);
    displaySubscriptions(subscriptions);

    if (buttonElement) {
      toggleAddIcon(buttonElement, false);
    }

    highlightSubscription(planId, false);
  }

  function loadSubscriptions() {
    const subscriptions = getStoredSubscriptions();
    saveSubscriptions(subscriptions);
    displaySubscriptions(subscriptions);
    syncDropdownIcons(subscriptions);
  }

  function getStoredSubscriptions() {
    const rawSubscriptions = readSubscriptions();
    return normalizeSubscriptions(rawSubscriptions);
  }

  function readSubscriptions() {
    try {
      const parsed = JSON.parse(localStorage.getItem(subscriptionsKey));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveSubscriptions(subscriptions) {
    localStorage.setItem(subscriptionsKey, JSON.stringify(subscriptions));
  }

  function normalizeSubscriptions(rawSubscriptions) {
    const normalized = [];
    const seenIds = new Set();

    rawSubscriptions.forEach((subscription) => {
      const normalizedSubscription = normalizeSubscription(subscription);
      if (!normalizedSubscription || seenIds.has(normalizedSubscription.id)) {
        return;
      }

      seenIds.add(normalizedSubscription.id);
      normalized.push(normalizedSubscription);
    });

    return normalized;
  }

  function normalizeSubscription(subscription) {
    const planId = resolvePlanId(subscription);
    if (planId && planById.has(planId)) {
      return createSubscription(planId);
    }

    if (!subscription || !subscription.plan || !subscription.price || !subscription.duration) {
      return null;
    }

    return {
      id: subscription.id || `legacy:${subscription.plan}`,
      plan: subscription.plan,
      price: String(subscription.price),
      duration: normalizeDuration(subscription.duration),
      providerId: subscription.providerId || "legacy",
      tierId: subscription.tierId || "legacy",
    };
  }

  function resolvePlanId(subscription) {
    if (!subscription) {
      return null;
    }

    if (subscription.id && planById.has(subscription.id)) {
      return subscription.id;
    }

    if (subscription.plan) {
      return legacyPlanToId.get(normalizeKey(subscription.plan)) || null;
    }

    return null;
  }

  function createSubscription(planId) {
    const record = planById.get(planId);
    if (!record) {
      return null;
    }

    const { provider, tier, plan } = record;
    return {
      id: plan.id,
      plan: getPlanDisplayName(provider, tier, plan),
      price: formatPrice(plan.price),
      duration: plan.duration,
      providerId: provider.id,
      tierId: tier.id,
    };
  }

  function highlightSubscription(planId, isHighlighted) {
    const subscriptionButton = document.querySelector(`.add-subscription[data-plan-id="${planId}"]`);

    if (subscriptionButton) {
      const listItem = subscriptionButton.closest(".list-group-item");
      if (listItem) {
        listItem.classList.toggle("selected-subscription", isHighlighted);
      }
    }
  }

  function syncDropdownIcons(subscriptions) {
    const selectedIds = new Set(subscriptions.map((subscription) => subscription.id));
    const addButtons = document.querySelectorAll(".add-subscription");

    addButtons.forEach((button) => {
      const planId = button.getAttribute("data-plan-id");
      const isSelected = selectedIds.has(planId);
      toggleAddIcon(button, isSelected);
      highlightSubscription(planId, isSelected);
    });
  }

  function toggleAddIcon(buttonElement, isAdded) {
    const icon = buttonElement.querySelector("i");
    const plan = buttonElement.getAttribute("data-plan");
    const action = isAdded ? "Remove" : "Add";

    buttonElement.classList.toggle("added", isAdded);
    buttonElement.setAttribute("title", `${action} Subscription`);
    if (plan) {
      buttonElement.setAttribute("aria-label", `${action} ${plan}`);
    }

    if (!icon) {
      return;
    }

    if (isAdded) {
      icon.classList.add("fa-square-minus", "icon-minus");
      icon.classList.remove("fa-square-plus", "icon-plus");
    } else {
      icon.classList.add("fa-square-plus", "icon-plus");
      icon.classList.remove("fa-square-minus", "icon-minus");
    }
  }

  function displaySubscriptions(subscriptions) {
    const subscriptionList = document.getElementById("subscriptionList");
    const emptyState = document.getElementById("emptyState");
    const breakdownContainer = document.getElementById("priceBreakdown");

    subscriptionList.textContent = "";

    if (subscriptions.length === 0) {
      emptyState.style.display = "block";
      subscriptionList.style.display = "none";
      breakdownContainer.textContent = "";
      return;
    }

    emptyState.style.display = "none";
    subscriptionList.style.display = "block";

    let totalPrice = 0;
    const priceBreakdown = document.createElement("div");
    priceBreakdown.classList.add("price-breakdown", "p-3", "text-center");

    const heading = document.createElement("h6");
    const headingText = document.createElement("strong");
    headingText.textContent = "Price Breakdown";
    heading.appendChild(headingText);

    const totalSubscriptions = document.createElement("p");
    totalSubscriptions.append("Total Subscriptions: ", createStrong(String(subscriptions.length)));

    const totalCost = document.createElement("p");

    const summaryList = document.createElement("ul");
    summaryList.classList.add("list-group", "summary-list");

    subscriptions.forEach((subscription) => {
      totalPrice += Number.parseFloat(subscription.price) || 0;
      summaryList.appendChild(createSummaryItem(subscription));
    });

    totalCost.append("Total Cost: ", createStrong(`$${totalPrice.toFixed(2)}`));

    priceBreakdown.append(heading, totalSubscriptions, totalCost, summaryList);
    subscriptionList.appendChild(priceBreakdown);

    displayPriceComparison(subscriptions);
  }

  function createSummaryItem(subscription) {
    const item = document.createElement("li");
    item.classList.add("list-group-item", "py-2", "px-3");

    const details = document.createElement("span");
    const name = document.createElement("strong");
    name.textContent = subscription.plan;
    details.append(name, ` - $${subscription.price} (${subscription.duration})`);

    const removeButton = document.createElement("button");
    removeButton.className = "remove-subscription";
    removeButton.type = "button";
    removeButton.setAttribute("data-plan-id", subscription.id);
    removeButton.setAttribute("aria-label", `Remove ${subscription.plan}`);
    removeButton.title = "Remove Subscription";

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-xmark";
    icon.setAttribute("aria-hidden", "true");
    removeButton.appendChild(icon);

    item.append(details, removeButton);
    return item;
  }

  function calculatePriceComparison(subscriptionPlans) {
    return subscriptionPlans.map((plan) => {
      const baseCost = Number.parseFloat(plan.price);
      const isMonthly = plan.duration === "Monthly" || plan.duration === "1 Month";
      const isThreeMonth = plan.duration === "3 Months";
      const isYearly = plan.duration === "Yearly";

      const costFor3Months = isMonthly
        ? (baseCost * 3).toFixed(2)
        : isThreeMonth
        ? baseCost.toFixed(2)
        : "N/A";
      const costForYearly = isMonthly
        ? (baseCost * 12).toFixed(2)
        : isThreeMonth
        ? (baseCost * 4).toFixed(2)
        : isYearly
        ? baseCost.toFixed(2)
        : "N/A";

      return {
        name: plan.plan,
        monthlyCost: isMonthly ? `$${baseCost.toFixed(2)}` : "N/A",
        threeMonthCost: costFor3Months !== "N/A" ? `$${costFor3Months}` : "N/A",
        yearlyCost: costForYearly !== "N/A" ? `$${costForYearly}` : "N/A",
      };
    });
  }

  function displayPriceComparison(subscriptionPlans) {
    const comparisonData = calculatePriceComparison(subscriptionPlans);
    const breakdownContainer = document.getElementById("priceBreakdown");
    breakdownContainer.textContent = "";

    if (!comparisonData.length) {
      return;
    }

    const table = document.createElement("table");
    table.className = "table table-bordered text-center";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["Plan", "Month-to-Month", "3-Month Subscription", "Yearly Subscription"].forEach((label) => {
      const th = document.createElement("th");
      th.textContent = label;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    const minYearlyCost = comparisonData.reduce((minimum, data) => {
      const yearlyCost = Number.parseFloat(data.yearlyCost.replace("$", ""));
      return Number.isFinite(yearlyCost) ? Math.min(minimum, yearlyCost) : minimum;
    }, Infinity);

    const tbody = document.createElement("tbody");
    comparisonData.forEach((data) => {
      const row = document.createElement("tr");
      appendCell(row, data.name);
      appendCell(row, data.monthlyCost, data.monthlyCost === "N/A" ? "na" : "");
      appendCell(row, data.threeMonthCost, data.threeMonthCost === "N/A" ? "na" : "");

      const yearlyCost = Number.parseFloat(data.yearlyCost.replace("$", ""));
      const yearlyClass = yearlyCost === minYearlyCost ? "best-value" : data.yearlyCost === "N/A" ? "na" : "";
      appendCell(row, data.yearlyCost, yearlyClass);
      tbody.appendChild(row);
    });

    table.append(thead, tbody);
    breakdownContainer.appendChild(table);

    if (comparisonData.some((data) => data.yearlyCost !== "N/A")) {
      const savingsHighlight = document.createElement("div");
      savingsHighlight.className = "savings-highlight text-center mt-3";
      const savingsText = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = "Save money by opting for longer-term subscriptions!";
      savingsText.appendChild(strong);
      savingsHighlight.appendChild(savingsText);
      breakdownContainer.appendChild(savingsHighlight);
    }
  }

  function showPlanDetails(tierId) {
    const record = tierById.get(tierId);
    const title = document.getElementById("offcanvasTitle");
    const content = document.getElementById("offcanvasContent");

    content.textContent = "";

    if (!record) {
      title.textContent = "Plan details";
      const fallback = document.createElement("p");
      fallback.textContent = "Details for this plan are not available yet.";
      content.appendChild(fallback);
      return;
    }

    const { tier } = record;
    title.textContent = tier.detailTitle;

    const intro = document.createElement("p");
    const introStrong = document.createElement("strong");
    introStrong.textContent = tier.detailIntro;
    intro.appendChild(introStrong);

    const benefits = document.createElement("ul");
    tier.detailItems.forEach(([label, description]) => {
      const item = document.createElement("li");
      const itemLabel = document.createElement("strong");
      itemLabel.textContent = `${label}:`;
      item.append(itemLabel, ` ${description}`);
      benefits.appendChild(item);
    });

    const pricing = document.createElement("p");
    pricing.appendChild(createStrong("Pricing:"));
    pricing.append(` ${getTierPricing(tier)}`);

    content.append(intro, benefits, pricing);
  }

  function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toastContainer");
    const toastId = `toast-${Date.now()}`;
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type === "error" ? "danger" : "success"} border-0`;
    toast.setAttribute("id", toastId);
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    const body = document.createElement("div");
    body.className = "d-flex";

    const toastBody = document.createElement("div");
    toastBody.className = "toast-body";
    toastBody.textContent = message;

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "btn-close btn-close-white me-2 m-auto";
    closeButton.setAttribute("data-bs-dismiss", "toast");
    closeButton.setAttribute("aria-label", "Close");

    body.append(toastBody, closeButton);
    toast.appendChild(body);
    toastContainer.appendChild(toast);

    const bootstrapToast = new bootstrap.Toast(toast);
    bootstrapToast.show();

    toast.addEventListener("hidden.bs.toast", () => {
      toast.remove();
    });
  }

  function getPlanNames(record) {
    const { provider, tier, plan } = record;
    return [
      getPlanDisplayName(provider, tier, plan),
      ...(plan.legacyNames || []),
    ];
  }

  function getPlanDisplayName(provider, tier, plan) {
    return `${provider.planPrefix} ${tier.name} - ${plan.label}`;
  }

  function getShortPlanName(plan) {
    return plan.replace(/\s-\s(?:Monthly|3 Months|Yearly(?: \(Up to 8 accounts\))?)$/, "");
  }

  function getTierPricing(tier) {
    return tier.plans.map((plan) => `${plan.label}: $${formatPrice(plan.price)}`).join(" | ");
  }

  function normalizeDuration(duration) {
    return duration === "1 Month" ? "Monthly" : duration;
  }

  function normalizeKey(value) {
    return String(value).trim().toLowerCase();
  }

  function formatPrice(price) {
    return Number.parseFloat(price).toFixed(2);
  }

  function createStrong(text) {
    const strong = document.createElement("strong");
    strong.textContent = text;
    return strong;
  }

  function appendCell(row, text, className = "") {
    const cell = document.createElement("td");
    cell.textContent = text;
    if (className) {
      cell.className = className;
    }
    row.appendChild(cell);
  }
});
