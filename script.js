document.addEventListener("DOMContentLoaded", () => {
  const subscriptionsKey = "userSubscriptions";
  const budgetKey = "streamReviewBudget";
  const renewalDatesKey = "streamReviewRenewalDates";
  const gamingHoursKey = "streamReviewGamingHours";
  const scenariosKey = "streamReviewScenarios";
  const appBackupVersion = 1;
  const {
    calculatePriceComparison,
    formatCurrency,
    formatDateInput,
    getBestTwelveMonthProjection,
    getComparableCost,
    getDaysUntil,
    getNextRenewalDate,
    normalizeDuration,
    parseCurrency,
    summarizeSubscriptionCosts,
    getUpcomingCharges,
  } = window.StreamReviewPriceUtils;
  let activeComparisonMode = "twelveMonth";
  let activeFilter = "all";
  let activeCategory = "all";
  let activeSearch = "";

  const providers = [
    {
      id: "playstation",
      name: "PlayStation Plus",
      category: "gaming",
      planPrefix: "PlayStation Plus",
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
            { id: "ps-essential-monthly", label: "Monthly", price: 10.99, duration: "Monthly", legacyNames: ["PlayStation Essential - Monthly", "PlayStation Essential - 1 Month"] },
            { id: "ps-essential-3-months", label: "3 Months", price: 27.99, duration: "3 Months" },
            { id: "ps-essential-yearly", label: "Yearly", price: 79.99, duration: "Yearly" },
          ],
        },
        {
          id: "extra",
          name: "Extra",
          detailTitle: "PlayStation Plus Extra",
          detailIntro: "Building upon the Essential tier, the Extra plan offers additional perks:",
          detailItems: [
            ["Game Catalog", "Access the PlayStation Plus Game Catalog."],
            ["Ubisoft+ Classics", "A curated selection of Ubisoft titles."],
          ],
          plans: [
            { id: "ps-extra-monthly", label: "Monthly", price: 16.99, duration: "Monthly", legacyNames: ["PlayStation Extra - Monthly", "PlayStation Extra - 1 Month"] },
            { id: "ps-extra-3-months", label: "3 Months", price: 43.99, duration: "3 Months" },
            { id: "ps-extra-yearly", label: "Yearly", price: 134.99, duration: "Yearly" },
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
            { id: "ps-premium-monthly", label: "Monthly", price: 19.99, duration: "Monthly", legacyNames: ["PlayStation Premium - Monthly", "PlayStation Premium - 1 Month"] },
            { id: "ps-premium-3-months", label: "3 Months", price: 54.99, duration: "3 Months" },
            { id: "ps-premium-yearly", label: "Yearly", price: 159.99, duration: "Yearly" },
          ],
        },
      ],
    },
    {
      id: "xbox",
      name: "Xbox Game Pass",
      category: "gaming",
      planPrefix: "Xbox",
      iconClass: "fa-brands fa-xbox",
      buttonId: "xbox",
      collapseId: "collapseXbox",
      headerClass: "xboxHeader",
      rowClass: "xboxSubheader",
      questionClass: "xboxQuestion",
      tiers: [
        {
          id: "xbox-essential",
          name: "Game Pass Essential",
          detailTitle: "Xbox Game Pass Essential",
          detailIntro: "Essential covers console, PC, and cloud access with online console multiplayer:",
          detailItems: [
            ["Platform Coverage", "Console, PC, and cloud."],
            ["Online Console Multiplayer", "Included for supported games."],
            ["Intro Offer", "$1 for the first month for eligible accounts; renews at the regular price."],
          ],
          plans: [
            { id: "xbox-essential-monthly", label: "Monthly", price: 9.99, duration: "Monthly", legacyNames: ["Xbox Game Pass Core - Monthly"] },
            { id: "xbox-essential-3-months", label: "3 Months", price: 24.99, duration: "3 Months", legacyNames: ["Xbox Game Pass Core - Yearly"] },
          ],
        },
        {
          id: "xbox-pc",
          name: "Game Pass PC",
          detailTitle: "Xbox Game Pass PC",
          detailIntro: "PC Game Pass focuses on Windows gaming access:",
          detailItems: [
            ["Platform Coverage", "Windows PC."],
            ["Day-One PC Games", "Includes day-one PC games."],
            ["EA Play", "Included with PC Game Pass."],
            ["Intro Offer", "$1 for 14 days for eligible accounts; renews at the regular price."],
          ],
          plans: [
            { id: "xbox-pc-monthly", label: "Monthly", price: 13.99, duration: "Monthly" },
          ],
        },
        {
          id: "xbox-premium",
          name: "Game Pass Premium",
          detailTitle: "Xbox Game Pass Premium",
          detailIntro: "Premium covers console, PC, and cloud at the regular monthly price:",
          detailItems: [
            ["Platform Coverage", "Console, PC, and cloud."],
            ["Game Catalog", "Access the Premium Game Pass library."],
            ["Intro Offer", "$1 for 14 days for eligible accounts; renews at the regular price."],
          ],
          plans: [
            { id: "xbox-premium-monthly", label: "Monthly", price: 14.99, duration: "Monthly", legacyNames: ["Xbox Game Pass Standard - Monthly"] },
          ],
        },
        {
          id: "xbox-ultimate",
          name: "Game Pass Ultimate",
          detailTitle: "Xbox Game Pass Ultimate",
          detailIntro: "Ultimate is the largest Xbox Game Pass benefit package:",
          detailItems: [
            ["Platform Coverage", "Console, PC, and cloud."],
            ["Day-One Releases", "Includes day-one releases."],
            ["Included Benefits", "Cloud gaming, EA Play, Fortnite Crew, and Ubisoft+ Classics."],
            ["Intro Offer", "No general introductory offer shown."],
          ],
          plans: [
            { id: "xbox-ultimate-monthly", label: "Monthly", price: 22.99, duration: "Monthly" },
          ],
        },
      ],
    },
    {
      id: "nintendo",
      name: "Nintendo Switch Online",
      category: "gaming",
      planPrefix: "Nintendo Switch Online",
      iconClass: "fa-solid fa-gamepad",
      buttonId: "nintendo",
      collapseId: "collapseNintendo",
      headerClass: "nintendoHeader",
      rowClass: "nintendoSubHeader",
      questionClass: "nintendoQuestion",
      tiers: [
        {
          id: "nintendo-switch-online",
          name: "Standard Individual",
          detailTitle: "Nintendo Switch Online Standard Individual",
          detailIntro: "The standard individual membership covers core Nintendo Switch Online features:",
          detailItems: [
            ["Online Play", "Play compatible Nintendo Switch games online."],
            ["Classic Games", "Access selected classic game libraries."],
            ["Cloud Saves", "Back up supported save data online."],
            ["Trial", "Nintendo offers a seven-day trial of the standard individual membership."],
          ],
          plans: [
            { id: "nintendo-switch-monthly", label: "Monthly", price: 3.99, duration: "Monthly", legacyNames: ["Nintendo Switch Online - Monthly", "Nintendo Switch Online - 1 Month"] },
            { id: "nintendo-switch-3-months", label: "3 Months", price: 7.99, duration: "3 Months" },
            { id: "nintendo-switch-yearly", label: "Yearly", price: 19.99, duration: "Yearly" },
          ],
        },
        {
          id: "nintendo-family",
          name: "Standard Family",
          detailTitle: "Nintendo Switch Online Standard Family",
          detailIntro: "Family Membership extends Nintendo Switch Online access across multiple accounts:",
          detailItems: [
            ["Shared Access", "Supports up to 8 Nintendo Accounts."],
            ["Online Play", "Online multiplayer for supported games."],
            ["Classic Games and Cloud Saves", "Includes core Switch Online benefits."],
          ],
          plans: [
            { id: "nintendo-family-yearly", label: "Yearly", price: 34.99, duration: "Yearly", legacyNames: ["Nintendo Family Membership - Monthly"] },
          ],
        },
        {
          id: "nintendo-expansion-individual",
          name: "Expansion Pack Individual",
          detailTitle: "Nintendo Switch Online + Expansion Pack Individual",
          detailIntro: "Expansion Pack is offered as a 12-month membership with expanded benefits:",
          detailItems: [
            ["Expanded Classics", "Adds Nintendo 64, Game Boy Advance, Sega Genesis, and other expanded benefits."],
            ["Availability", "Offered as a 12-month membership."],
            ["Bonus Month", "An eligible 12-month Expansion Pack purchase or redemption can receive an additional bonus month through July 28, 2026; separate activation required."],
          ],
          plans: [
            { id: "nintendo-expansion-yearly", label: "Yearly", price: 49.99, duration: "Yearly", legacyNames: ["Nintendo Expansion Pack - Yearly"] },
          ],
        },
        {
          id: "nintendo-expansion-family",
          name: "Expansion Pack Family",
          detailTitle: "Nintendo Switch Online + Expansion Pack Family",
          detailIntro: "Expansion Pack Family covers up to eight Nintendo Accounts with expanded benefits:",
          detailItems: [
            ["Family Coverage", "Covers up to eight Nintendo Accounts."],
            ["Expanded Classics", "Adds Nintendo 64, Game Boy Advance, Sega Genesis, and other expanded benefits."],
            ["Bonus Month", "An eligible 12-month Expansion Pack purchase or redemption can receive an additional bonus month through July 28, 2026; separate activation required."],
          ],
          plans: [
            { id: "nintendo-expansion-family-yearly", label: "Yearly", price: 79.99, duration: "Yearly", legacyNames: ["Nintendo Expansion Pack - Yearly (Up to 8 accounts)"] },
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

    const resetButton = e.target.closest(".reset-subscriptions");
    if (resetButton) {
      clearSubscriptions();
    }

    const comparisonButton = e.target.closest(".comparison-mode");
    if (comparisonButton) {
      activeComparisonMode = comparisonButton.getAttribute("data-mode") || "twelveMonth";
      displayPriceComparison(getStoredSubscriptions());
    }

    const filterButton = e.target.closest(".filter-button");
    if (filterButton) {
      activeFilter = filterButton.getAttribute("data-filter") || "all";
      updateFilterButtons();
      applyPlanFilter();
    }

    const budgetTypeButton = e.target.closest(".budget-type");
    if (budgetTypeButton) {
      const budget = getStoredBudget();
      budget.type = budgetTypeButton.getAttribute("data-budget-type") || "monthly";
      saveBudget(budget);
      updateBudgetControls(getStoredSubscriptions());
    }

    const betterButton = e.target.closest(".better-button");
    if (betterButton) {
      showBetterRecommendation(getStoredSubscriptions());
    }

    const saveScenarioButton = e.target.closest(".scenario-save-button");
    if (saveScenarioButton) {
      saveCurrentScenario();
    }

    const loadScenarioButton = e.target.closest(".load-scenario");
    if (loadScenarioButton) {
      loadScenario(loadScenarioButton.getAttribute("data-scenario-id"));
    }

    const deleteScenarioButton = e.target.closest(".delete-scenario");
    if (deleteScenarioButton) {
      deleteScenario(deleteScenarioButton.getAttribute("data-scenario-id"));
    }

    const copySummaryButton = e.target.closest("#copySummary");
    if (copySummaryButton) {
      copySummaryToClipboard();
    }

    const downloadCsvButton = e.target.closest("#downloadCsv");
    if (downloadCsvButton) {
      downloadCsvExport();
    }

    const printReportButton = e.target.closest("#printReport");
    if (printReportButton) {
      window.print();
    }

    const exportBackupButton = e.target.closest("#exportBackup");
    if (exportBackupButton) {
      exportBackup();
    }
  });

  document.body.addEventListener("submit", (e) => {
    if (e.target.id === "customSubscriptionForm") {
      e.preventDefault();
      addCustomSubscription();
    }
  });

  document.body.addEventListener("input", (e) => {
    if (e.target.id === "budgetAmount") {
      const budget = getStoredBudget();
      budget.amount = e.target.value;
      saveBudget(budget);
      updateBudgetControls(getStoredSubscriptions());
    }

    if (e.target.classList.contains("renewal-date-input")) {
      const planId = e.target.getAttribute("data-plan-id");
      saveRenewalDate(planId, e.target.value);
      displaySubscriptions(getStoredSubscriptions());
    }

    if (e.target.id === "gamingHours") {
      saveGamingHours(e.target.value);
      updateGamingValue(getStoredSubscriptions());
    }

    if (e.target.id === "planSearch") {
      activeSearch = e.target.value.trim().toLowerCase();
      applyPlanFilter();
    }
  });

  document.body.addEventListener("change", (e) => {
    if (e.target.id === "categoryFilter") {
      activeCategory = e.target.value || "all";
      applyPlanFilter();
    }

    if (e.target.id === "importBackup") {
      importBackup(e.target.files[0]);
      e.target.value = "";
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
    column.setAttribute("data-category", provider.category || "gaming");

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
    row.setAttribute("data-plan-id", plan.id);
    row.setAttribute("data-duration", normalizeDuration(plan.duration));
    row.setAttribute("data-category", provider.category || "gaming");
    row.setAttribute("data-search", `${provider.name} ${tier.name} ${plan.label} ${plan.duration}`.toLowerCase());

    const label = document.createElement("div");
    label.className = "fw-bold";
    label.textContent = plan.label;

    const dollarIcon = document.createElement("i");
    dollarIcon.className = "fa-solid fa-dollar-sign";
    dollarIcon.setAttribute("aria-hidden", "true");

    const price = document.createElement("span");
    price.className = "plan-price";
    price.textContent = formatPrice(plan.price);

    const selectedBadge = document.createElement("span");
    selectedBadge.className = "selected-pill";
    selectedBadge.setAttribute("aria-hidden", "true");
    selectedBadge.innerHTML = '<i class="fa-solid fa-check"></i> Selected';

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

    row.append(label, dollarIcon, price, selectedBadge, addButton);
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
      applyPlanFilter();
    } else {
      showToast(`${getShortPlanName(subscription.plan)} is already selected`, "error");
    }

    displaySubscriptions(subscriptions);
  }

  function removeSubscription(planId, buttonElement = null) {
    const currentSubscriptions = getStoredSubscriptions();
    const subscription = currentSubscriptions.find((item) => item.id === planId) || createSubscription(planId);
    const subscriptions = currentSubscriptions.filter((item) => item.id !== planId);

    removeRenewalDate(planId);
    saveSubscriptions(subscriptions);
    showToast(`Removed ${subscription ? getShortPlanName(subscription.plan) : "subscription"}`);
    displaySubscriptions(subscriptions);

    const dropdownButton = buttonElement || getSubscriptionButton(planId);
    if (dropdownButton) {
      toggleAddIcon(dropdownButton, false);
    }
    highlightSubscription(planId, false);
    applyPlanFilter();
  }

  function clearSubscriptions() {
    if (getStoredSubscriptions().length === 0) {
      return;
    }

    saveSubscriptions([]);
    saveRenewalDates({});
    displaySubscriptions([]);
    syncDropdownIcons([]);
    applyPlanFilter();
    showToast("Cleared selected subscriptions");
  }

  function addCustomSubscription() {
    const nameInput = document.getElementById("customName");
    const categoryInput = document.getElementById("customCategory");
    const priceInput = document.getElementById("customPrice");
    const durationInput = document.getElementById("customDuration");
    const renewalInput = document.getElementById("customRenewal");
    const notesInput = document.getElementById("customNotes");
    const price = Number.parseFloat(priceInput.value);

    if (!nameInput.value.trim() || !Number.isFinite(price) || price < 0) {
      showToast("Add a name and valid price for the custom subscription", "error");
      return;
    }

    const subscription = normalizeCustomSubscription({
      id: `custom-${Date.now()}`,
      custom: true,
      name: nameInput.value,
      category: categoryInput.value,
      price: priceInput.value,
      duration: durationInput.value,
      notes: notesInput.value,
    });

    const subscriptions = getStoredSubscriptions();
    subscriptions.push(subscription);
    saveSubscriptions(subscriptions);

    if (renewalInput.value) {
      saveRenewalDate(subscription.id, renewalInput.value);
    }

    document.getElementById("customSubscriptionForm").reset();
    displaySubscriptions(subscriptions);
    syncDropdownIcons(subscriptions);
    showToast(`Added ${subscription.name}`);
  }

  function loadSubscriptions() {
    const subscriptions = getStoredSubscriptions();
    saveSubscriptions(subscriptions);
    displaySubscriptions(subscriptions);
    syncDropdownIcons(subscriptions);
    loadBudgetControls();
    loadGamingValue();
    renderScenarios();
    updateFilterButtons();
    applyPlanFilter();
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
    if (subscription && subscription.custom) {
      return normalizeCustomSubscription(subscription);
    }

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
      category: subscription.category || "custom",
      notes: subscription.notes || "",
    };
  }

  function normalizeCustomSubscription(subscription) {
    const price = Number.parseFloat(subscription.price);
    const name = String(subscription.name || subscription.plan || "").trim();
    const duration = normalizeDuration(subscription.duration);

    if (!name || !Number.isFinite(price) || price < 0 || !duration) {
      return null;
    }

    return {
      id: subscription.id || `custom-${Date.now()}`,
      custom: true,
      name,
      plan: name,
      price: formatPrice(price),
      duration,
      providerId: "custom",
      tierId: subscription.category || "custom",
      category: subscription.category || "custom",
      notes: subscription.notes || "",
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
      category: provider.category || "gaming",
    };
  }

  function highlightSubscription(planId, isHighlighted) {
    const subscriptionButton = getSubscriptionButton(planId);

    if (subscriptionButton) {
      const listItem = subscriptionButton.closest(".list-group-item");
      if (listItem) {
        listItem.classList.toggle("selected-subscription", isHighlighted);
      }
    }
  }

  function getSubscriptionButton(planId) {
    return document.querySelector(`.add-subscription[data-plan-id="${planId}"]`);
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

  function updateFilterButtons() {
    document.querySelectorAll(".filter-button").forEach((button) => {
      button.classList.toggle("active", button.getAttribute("data-filter") === activeFilter);
    });
  }

  function applyPlanFilter() {
    const planRows = document.querySelectorAll(".list-group-item[data-plan-id]");

    planRows.forEach((row) => {
      const duration = row.getAttribute("data-duration");
      const category = row.getAttribute("data-category") || "gaming";
      const searchableText = row.getAttribute("data-search") || "";
      const isSelected = row.classList.contains("selected-subscription");
      const shouldShow =
        (activeFilter === "all" ||
          (activeFilter === "selected" && isSelected) ||
          (activeFilter === "monthly" && duration === "Monthly") ||
          (activeFilter === "annual" && duration === "Yearly")) &&
        (activeCategory === "all" || category === activeCategory) &&
        (!activeSearch || searchableText.includes(activeSearch));

      row.classList.toggle("plan-hidden", !shouldShow);
    });

    document.querySelectorAll(".provider-column").forEach((column) => {
      const visibleRows = column.querySelectorAll(".list-group-item[data-plan-id]:not(.plan-hidden)");
      const category = column.getAttribute("data-category") || "gaming";
      const shouldShowColumn = visibleRows.length > 0 && (activeCategory === "all" || category === activeCategory);
      column.classList.toggle("plan-hidden", !shouldShowColumn);
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
    const subscriptionOverview = document.getElementById("subscriptionOverview");
    const emptyState = document.getElementById("emptyState");
    const breakdownContainer = document.getElementById("priceBreakdown");

    subscriptionList.textContent = "";
    subscriptionOverview.textContent = "";
    updateStickySummary(subscriptions);
    updateDecisionTools(subscriptions);
    renderReturnAlerts(subscriptions);

    if (subscriptions.length === 0) {
      emptyState.style.display = "block";
      subscriptionList.style.display = "none";
      breakdownContainer.textContent = "";
      return;
    }

    emptyState.style.display = "none";
    subscriptionList.style.display = "block";

    subscriptionOverview.appendChild(createSubscriptionOverview(subscriptions));
    groupSubscriptionsByProvider(subscriptions).forEach((group) => {
      subscriptionList.appendChild(createSubscriptionGroup(group));
    });

    displayPriceComparison(subscriptions);
  }

  function updateStickySummary(subscriptions) {
    const summary = summarizeSubscriptionCosts(subscriptions);
    const selectedCount = document.getElementById("stickySelectedCount");
    const dueToday = document.getElementById("stickyDueToday");
    const monthlyAverage = document.getElementById("stickyMonthlyAverage");
    const twelveMonth = document.getElementById("stickyTwelveMonth");
    const resetButton = document.getElementById("resetSubscriptions");

    selectedCount.textContent = String(subscriptions.length);
    dueToday.textContent = summary.dueTodayFormatted;
    monthlyAverage.textContent = summary.monthlyAverageFormatted;
    twelveMonth.textContent = summary.twelveMonthProjectionFormatted;
    resetButton.disabled = subscriptions.length === 0;
  }

  function updateDecisionTools(subscriptions) {
    updateBudgetControls(subscriptions);
    renderInsights(subscriptions);
    renderBetterResult(subscriptions, false);
    renderUpcomingCharges(subscriptions);
    updateGamingValue(subscriptions);

    const betterButton = document.getElementById("betterButton");
    betterButton.disabled = subscriptions.length === 0;
  }

  function loadBudgetControls() {
    const budget = getStoredBudget();
    const budgetAmount = document.getElementById("budgetAmount");
    budgetAmount.value = budget.amount;
    updateBudgetControls(getStoredSubscriptions());
  }

  function getStoredBudget() {
    try {
      const parsed = JSON.parse(localStorage.getItem(budgetKey));
      if (parsed && ["monthly", "yearly"].includes(parsed.type)) {
        return {
          type: parsed.type,
          amount: parsed.amount || "",
        };
      }
    } catch {
      return { type: "monthly", amount: "" };
    }

    return { type: "monthly", amount: "" };
  }

  function saveBudget(budget) {
    localStorage.setItem(budgetKey, JSON.stringify(budget));
  }

  function updateBudgetControls(subscriptions) {
    const budget = getStoredBudget();
    const budgetTypeButtons = document.querySelectorAll(".budget-type");
    const budgetStatus = document.getElementById("budgetStatus");
    const amount = Number.parseFloat(budget.amount);
    const summary = summarizeSubscriptionCosts(subscriptions);
    const projectedSpend = budget.type === "monthly" ? summary.monthlyAverage : summary.twelveMonthProjection;

    budgetTypeButtons.forEach((button) => {
      button.classList.toggle("active", button.getAttribute("data-budget-type") === budget.type);
    });

    if (!Number.isFinite(amount) || amount <= 0) {
      budgetStatus.className = "budget-status neutral";
      budgetStatus.textContent = "Set a budget to track your plan stack.";
      return;
    }

    const difference = amount - projectedSpend;
    const label = budget.type === "monthly" ? "monthly average" : "12-month projection";

    if (difference < 0) {
      budgetStatus.className = "budget-status over";
      budgetStatus.textContent = `Over budget by ${formatCurrency(Math.abs(difference))} against your ${label}.`;
      return;
    }

    if (difference <= amount * 0.1) {
      budgetStatus.className = "budget-status close";
      budgetStatus.textContent = `Close to budget: ${formatCurrency(difference)} left against your ${label}.`;
      return;
    }

    budgetStatus.className = "budget-status under";
    budgetStatus.textContent = `Under budget by ${formatCurrency(difference)} against your ${label}.`;
  }

  function getStoredRenewalDates() {
    try {
      const parsed = JSON.parse(localStorage.getItem(renewalDatesKey));
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveRenewalDates(renewalDates) {
    localStorage.setItem(renewalDatesKey, JSON.stringify(renewalDates));
  }

  function saveRenewalDate(planId, renewalDate) {
    if (!planId) {
      return;
    }

    const renewalDates = getStoredRenewalDates();
    if (renewalDate) {
      renewalDates[planId] = renewalDate;
    } else {
      delete renewalDates[planId];
    }
    saveRenewalDates(renewalDates);
  }

  function removeRenewalDate(planId) {
    const renewalDates = getStoredRenewalDates();
    delete renewalDates[planId];
    saveRenewalDates(renewalDates);
  }

  function getSelectedRenewalDates(subscriptions) {
    const selectedIds = new Set(subscriptions.map((subscription) => subscription.id));
    const renewalDates = getStoredRenewalDates();

    return Object.fromEntries(
      Object.entries(renewalDates).filter(([planId]) => selectedIds.has(planId))
    );
  }

  function renderUpcomingCharges(subscriptions) {
    const chargesList = document.getElementById("upcomingChargesList");
    const nextChargeBadge = document.getElementById("nextChargeBadge");
    const nextThirtyTotal = document.getElementById("nextThirtyTotal");
    const nextNinetyTotal = document.getElementById("nextNinetyTotal");
    const renewalDates = getStoredRenewalDates();
    const charges = getUpcomingCharges(subscriptions, renewalDates, new Date(), 90);
    const thirtyDayTotal = charges
      .filter((charge) => charge.daysUntil <= 30)
      .reduce((sum, charge) => sum + charge.price, 0);
    const ninetyDayTotal = charges.reduce((sum, charge) => sum + charge.price, 0);

    chargesList.textContent = "";
    nextThirtyTotal.textContent = formatCurrency(thirtyDayTotal);
    nextNinetyTotal.textContent = formatCurrency(ninetyDayTotal);

    if (!charges.length) {
      nextChargeBadge.textContent = subscriptions.length ? "Add dates" : "No dates";
      const emptyItem = document.createElement("li");
      emptyItem.className = "upcoming-empty";
      emptyItem.textContent = subscriptions.length
        ? "Add renewal dates to selected plans."
        : "Select plans to track upcoming charges.";
      chargesList.appendChild(emptyItem);
      return;
    }

    nextChargeBadge.textContent = `Next: ${formatShortDate(charges[0].date)}`;
    charges.slice(0, 5).forEach((charge) => {
      const item = document.createElement("li");
      const details = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = getShortPlanName(charge.plan);

      const date = document.createElement("span");
      date.textContent = `${formatShortDate(charge.date)} - ${formatDaysUntil(charge.daysUntil)}`;
      details.append(name, date);

      const amount = document.createElement("strong");
      amount.textContent = charge.priceFormatted;

      item.append(details, amount);
      chargesList.appendChild(item);
    });
  }

  function renderReturnAlerts(subscriptions) {
    const alerts = document.getElementById("returnAlerts");
    const budget = getStoredBudget();
    const budgetAmount = Number.parseFloat(budget.amount);
    const summary = summarizeSubscriptionCosts(subscriptions);
    const renewalDates = getStoredRenewalDates();
    const charges = getUpcomingCharges(subscriptions, renewalDates, new Date(), 7);
    const messages = [];

    if (charges.some((charge) => charge.daysUntil === 0)) {
      messages.push("A renewal is due today.");
    } else if (charges.length) {
      messages.push(`${charges.length} renewal${charges.length === 1 ? "" : "s"} coming in the next 7 days.`);
    }

    if (Number.isFinite(budgetAmount) && budgetAmount > 0) {
      const spend = budget.type === "monthly" ? summary.monthlyAverage : summary.twelveMonthProjection;
      if (spend > budgetAmount) {
        messages.push("Your current setup is over budget.");
      }
    }

    if (subscriptions.length && Object.keys(getSelectedRenewalDates(subscriptions)).length === 0) {
      messages.push("Add renewal dates to unlock charge alerts.");
    }

    if (subscriptions.length && !getStoredScenarios().length) {
      messages.push("Save a scenario to compare this setup later.");
    }

    alerts.textContent = "";
    messages.slice(0, 3).forEach((message) => {
      const alert = document.createElement("div");
      alert.className = "return-alert";
      alert.textContent = message;
      alerts.appendChild(alert);
    });
  }

  function loadGamingValue() {
    const gamingHours = document.getElementById("gamingHours");
    gamingHours.value = getStoredGamingHours();
    updateGamingValue(getStoredSubscriptions());
  }

  function getStoredGamingHours() {
    return localStorage.getItem(gamingHoursKey) || "";
  }

  function saveGamingHours(hours) {
    localStorage.setItem(gamingHoursKey, hours || "");
  }

  function updateGamingValue(subscriptions) {
    const hours = Number.parseFloat(getStoredGamingHours());
    const summary = summarizeSubscriptionCosts(subscriptions);
    const valueRating = document.getElementById("valueRating");
    const costPerHour = document.getElementById("costPerHour");
    const costPerWeek = document.getElementById("costPerWeek");
    const weeklyCost = summary.monthlyAverage / 4.345;

    costPerWeek.textContent = formatCurrency(weeklyCost);

    if (!Number.isFinite(hours) || hours <= 0 || summary.monthlyAverage <= 0) {
      valueRating.textContent = hours > 0 ? "No plans" : "No hours";
      costPerHour.textContent = "$0.00";
      return;
    }

    const hourlyCost = summary.monthlyAverage / hours;
    costPerHour.textContent = formatCurrency(hourlyCost);

    if (hourlyCost <= 2) {
      valueRating.textContent = "Great value";
    } else if (hourlyCost <= 5) {
      valueRating.textContent = "Good value";
    } else {
      valueRating.textContent = "Watch spend";
    }
  }

  function getStoredScenarios() {
    try {
      const parsed = JSON.parse(localStorage.getItem(scenariosKey));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveScenarios(scenarios) {
    localStorage.setItem(scenariosKey, JSON.stringify(scenarios));
  }

  function saveCurrentScenario() {
    const subscriptions = getStoredSubscriptions();
    if (!subscriptions.length) {
      showToast("Select at least one plan before saving a scenario", "error");
      return;
    }

    const scenarioName = document.getElementById("scenarioName");
    const scenarios = getStoredScenarios();
    const name = scenarioName.value.trim() || `Scenario ${scenarios.length + 1}`;
    const scenario = {
      id: `scenario-${Date.now()}`,
      name,
      subscriptionIds: subscriptions.map((subscription) => subscription.id),
      subscriptions,
      budget: getStoredBudget(),
      renewalDates: getSelectedRenewalDates(subscriptions),
      gamingHours: getStoredGamingHours(),
      createdAt: formatDateInput(new Date()),
    };

    scenarios.unshift(scenario);
    saveScenarios(scenarios.slice(0, 8));
    scenarioName.value = "";
    renderScenarios();
    showToast(`Saved ${name}`);
  }

  function loadScenario(scenarioId) {
    const scenario = getStoredScenarios().find((item) => item.id === scenarioId);
    if (!scenario) {
      showToast("Scenario could not be loaded", "error");
      return;
    }

    const subscriptions = getScenarioSubscriptions(scenario);

    saveSubscriptions(subscriptions);
    saveBudget(scenario.budget || { type: "monthly", amount: "" });
    saveRenewalDates(scenario.renewalDates || {});
    saveGamingHours(scenario.gamingHours || "");
    displaySubscriptions(subscriptions);
    syncDropdownIcons(subscriptions);
    loadBudgetControls();
    loadGamingValue();
    applyPlanFilter();
    showToast(`Loaded ${scenario.name}`);
  }

  function deleteScenario(scenarioId) {
    const scenarios = getStoredScenarios();
    const nextScenarios = scenarios.filter((scenario) => scenario.id !== scenarioId);
    saveScenarios(nextScenarios);
    renderScenarios();
  }

  function renderScenarios() {
    const scenarioList = document.getElementById("scenarioList");
    const scenarios = getStoredScenarios();
    scenarioList.textContent = "";

    if (!scenarios.length) {
      const empty = document.createElement("div");
      empty.className = "scenario-empty";
      empty.textContent = "Save your current setup to compare it later.";
      scenarioList.appendChild(empty);
      return;
    }

    scenarios.forEach((scenario) => {
      scenarioList.appendChild(createScenarioCard(scenario));
    });
    scenarioList.appendChild(createScenarioComparisonTable(scenarios));
  }

  function createScenarioCard(scenario) {
    const subscriptions = getScenarioSubscriptions(scenario);
    const summary = summarizeSubscriptionCosts(subscriptions);
    const card = document.createElement("article");
    card.className = "scenario-card";

    const title = document.createElement("h6");
    title.textContent = scenario.name;

    const meta = document.createElement("div");
    meta.className = "scenario-meta";
    meta.append(
      createScenarioMetric("Plans", String(subscriptions.length)),
      createScenarioMetric("Monthly Avg", summary.monthlyAverageFormatted),
      createScenarioMetric("12-Month", summary.twelveMonthProjectionFormatted)
    );

    const actions = document.createElement("div");
    actions.className = "scenario-actions";

    const loadButton = document.createElement("button");
    loadButton.className = "load-scenario";
    loadButton.type = "button";
    loadButton.setAttribute("data-scenario-id", scenario.id);
    loadButton.textContent = "Load";

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-scenario";
    deleteButton.type = "button";
    deleteButton.setAttribute("data-scenario-id", scenario.id);
    deleteButton.setAttribute("aria-label", `Delete ${scenario.name}`);
    deleteButton.innerHTML = '<i class="fa-solid fa-trash" aria-hidden="true"></i>';

    actions.append(loadButton, deleteButton);
    card.append(title, meta, actions);
    return card;
  }

  function getScenarioSubscriptions(scenario) {
    if (Array.isArray(scenario.subscriptions)) {
      return normalizeSubscriptions(scenario.subscriptions);
    }

    return (scenario.subscriptionIds || [])
      .map((planId) => createSubscription(planId))
      .filter(Boolean);
  }

  function createScenarioComparisonTable(scenarios) {
    const wrap = document.createElement("div");
    wrap.className = "scenario-table-wrap";

    const table = document.createElement("table");
    table.className = "scenario-table";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["Scenario", "Plans", "Due Today", "Monthly Avg", "12-Month", "Next 30", "Next 90", "Value"].forEach((label) => {
      const th = document.createElement("th");
      th.textContent = label;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    const rows = scenarios.map((scenario) => {
      const subscriptions = getScenarioSubscriptions(scenario);
      const summary = summarizeSubscriptionCosts(subscriptions);
      const charges = getUpcomingCharges(subscriptions, scenario.renewalDates || {}, new Date(), 90);
      const nextThirty = charges
        .filter((charge) => charge.daysUntil <= 30)
        .reduce((sum, charge) => sum + charge.price, 0);
      const nextNinety = charges.reduce((sum, charge) => sum + charge.price, 0);
      return {
        scenario,
        subscriptions,
        summary,
        nextThirty,
        nextNinety,
        value: getScenarioValueRating(summary, scenario.gamingHours),
      };
    });

    const cheapestTwelve = Math.min(...rows.map((row) => row.summary.twelveMonthProjection));

    const tbody = document.createElement("tbody");
    rows.forEach((rowData) => {
      const row = document.createElement("tr");
      if (rowData.summary.twelveMonthProjection === cheapestTwelve) {
        row.className = "best-scenario";
      }

      [
        rowData.scenario.name,
        String(rowData.subscriptions.length),
        rowData.summary.dueTodayFormatted,
        rowData.summary.monthlyAverageFormatted,
        rowData.summary.twelveMonthProjectionFormatted,
        formatCurrency(rowData.nextThirty),
        formatCurrency(rowData.nextNinety),
        rowData.value,
      ].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });
      tbody.appendChild(row);
    });

    table.append(thead, tbody);
    wrap.appendChild(table);
    return wrap;
  }

  function getScenarioValueRating(summary, hoursValue) {
    const hours = Number.parseFloat(hoursValue);
    if (!Number.isFinite(hours) || hours <= 0 || summary.monthlyAverage <= 0) {
      return "No hours";
    }

    const hourlyCost = summary.monthlyAverage / hours;
    if (hourlyCost <= 2) {
      return "Great";
    }

    if (hourlyCost <= 5) {
      return "Good";
    }

    return "Watch";
  }

  function createScenarioMetric(label, value) {
    const metric = document.createElement("div");
    const metricLabel = document.createElement("span");
    metricLabel.textContent = label;

    const metricValue = document.createElement("strong");
    metricValue.textContent = value;

    metric.append(metricLabel, metricValue);
    return metric;
  }

  function getBackupPayload() {
    return {
      version: appBackupVersion,
      exportedAt: new Date().toISOString(),
      subscriptions: getStoredSubscriptions(),
      budget: getStoredBudget(),
      renewalDates: getStoredRenewalDates(),
      gamingHours: getStoredGamingHours(),
      scenarios: getStoredScenarios(),
    };
  }

  function buildSummaryText() {
    const subscriptions = getStoredSubscriptions();
    const summary = summarizeSubscriptionCosts(subscriptions);
    const renewalDates = getStoredRenewalDates();
    const charges = getUpcomingCharges(subscriptions, renewalDates, new Date(), 90);
    const lines = [
      "StreamReview Summary",
      `Selected subscriptions: ${subscriptions.length}`,
      `Due today: ${summary.dueTodayFormatted}`,
      `Monthly average: ${summary.monthlyAverageFormatted}`,
      `Projected 12-month cost: ${summary.twelveMonthProjectionFormatted}`,
      "",
      "Subscriptions:",
      ...subscriptions.map((subscription) => {
        const renewal = renewalDates[subscription.id] ? `, renews ${renewalDates[subscription.id]}` : "";
        return `- ${subscription.plan}: $${subscription.price} ${subscription.duration}${renewal}`;
      }),
      "",
      "Upcoming charges:",
      ...(charges.length ? charges.slice(0, 8).map((charge) => `- ${charge.date}: ${charge.plan} ${charge.priceFormatted}`) : ["- None tracked"]),
    ];

    return lines.join("\n");
  }

  function copySummaryToClipboard() {
    const summary = buildSummaryText();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summary)
        .then(() => showToast("Copied summary"))
        .catch(() => showToast("Clipboard copy failed", "error"));
      return;
    }

    showToast("Clipboard copy is not available in this browser", "error");
  }

  function downloadCsvExport() {
    const subscriptions = getStoredSubscriptions();
    const renewalDates = getStoredRenewalDates();
    const rows = [
      ["Name", "Category", "Price", "Billing", "Renewal Date", "Notes"],
      ...subscriptions.map((subscription) => [
        subscription.plan,
        getCategoryLabel(subscription.category || "gaming"),
        subscription.price,
        subscription.duration,
        renewalDates[subscription.id] || "",
        subscription.notes || "",
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
    downloadTextFile("streamreview-subscriptions.csv", csv, "text/csv");
  }

  function exportBackup() {
    downloadTextFile(
      "streamreview-backup.json",
      JSON.stringify(getBackupPayload(), null, 2),
      "application/json"
    );
  }

  function importBackup(file) {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        restoreBackup(parsed);
        showToast("Backup imported");
      } catch {
        showToast("Backup import failed", "error");
      }
    });
    reader.readAsText(file);
  }

  function restoreBackup(backup) {
    const subscriptions = normalizeSubscriptions(backup.subscriptions || []);
    saveSubscriptions(subscriptions);
    saveBudget(backup.budget || { type: "monthly", amount: "" });
    saveRenewalDates(backup.renewalDates || {});
    saveGamingHours(backup.gamingHours || "");
    saveScenarios(Array.isArray(backup.scenarios) ? backup.scenarios : []);
    displaySubscriptions(subscriptions);
    syncDropdownIcons(subscriptions);
    loadBudgetControls();
    loadGamingValue();
    renderScenarios();
    applyPlanFilter();
  }

  function downloadTextFile(filename, contents, mimeType) {
    const blob = new Blob([contents], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function escapeCsvCell(value) {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  }

  function renderInsights(subscriptions) {
    const insightsPanel = document.getElementById("insightsPanel");
    insightsPanel.textContent = "";

    if (!subscriptions.length) {
      insightsPanel.appendChild(createInsightCard("No selections yet", "Pick a few plans to unlock smart comparisons.", "neutral"));
      return;
    }

    const rankedByTwelveMonth = subscriptions
      .map((subscription) => ({
        subscription,
        value: getComparableCost(subscription, "twelveMonth"),
      }))
      .filter((item) => Number.isFinite(item.value))
      .sort((a, b) => a.value - b.value);

    const rankedByMonthly = subscriptions
      .map((subscription) => ({
        subscription,
        value: getComparableCost(subscription, "monthly"),
      }))
      .filter((item) => Number.isFinite(item.value))
      .sort((a, b) => b.value - a.value);

    if (rankedByTwelveMonth[0]) {
      insightsPanel.appendChild(
        createInsightCard(
          "Cheapest 12-month plan",
          `${getSubscriptionSummaryName(rankedByTwelveMonth[0].subscription)} projects to ${formatCurrency(rankedByTwelveMonth[0].value)}.`,
          "good"
        )
      );
    }

    const mostExpensive = rankedByTwelveMonth[rankedByTwelveMonth.length - 1];
    if (mostExpensive) {
      insightsPanel.appendChild(
        createInsightCard(
          "Highest 12-month plan",
          `${getSubscriptionSummaryName(mostExpensive.subscription)} projects to ${formatCurrency(mostExpensive.value)}.`,
          "watch"
        )
      );
    }

    if (rankedByMonthly[0]) {
      insightsPanel.appendChild(
        createInsightCard(
          "Largest monthly charge",
          `${getSubscriptionSummaryName(rankedByMonthly[0].subscription)} is ${formatCurrency(rankedByMonthly[0].value)} per month.`,
          "neutral"
        )
      );
    }

    const bestSavings = findBestSavingsOpportunity(subscriptions);
    insightsPanel.appendChild(
      bestSavings
        ? createInsightCard("Savings found", `${bestSavings.message} You could save ${formatCurrency(bestSavings.savings)}.`, "good")
        : createInsightCard("Billing choices", "Your selected tiers are already using their lowest 12-month billing option.", "neutral")
    );
  }

  function createInsightCard(title, body, tone) {
    const card = document.createElement("article");
    card.className = `insight-card insight-${tone}`;

    const heading = document.createElement("strong");
    heading.textContent = title;

    const text = document.createElement("p");
    text.textContent = body;

    card.append(heading, text);
    return card;
  }

  function showBetterRecommendation(subscriptions) {
    renderBetterResult(subscriptions, true);
  }

  function renderBetterResult(subscriptions, shouldReveal) {
    const betterResult = document.getElementById("betterResult");
    const recommendation = findBestSavingsOpportunity(subscriptions);

    if (!subscriptions.length) {
      betterResult.className = "better-result muted-result";
      betterResult.textContent = "Select plans to see savings opportunities.";
      return;
    }

    if (!shouldReveal) {
      betterResult.className = recommendation ? "better-result muted-result" : "better-result success-result";
      betterResult.textContent = recommendation
        ? "A savings check is ready."
        : "Your selected tiers already use their lowest 12-month billing option.";
      return;
    }

    if (!recommendation) {
      betterResult.className = "better-result success-result";
      betterResult.textContent = "Nice stack. No cheaper same-tier billing option is available for your current selections.";
      return;
    }

    betterResult.className = "better-result action-result";
    betterResult.textContent = `${recommendation.message} Estimated 12-month savings: ${formatCurrency(recommendation.savings)}.`;
  }

  function findBestSavingsOpportunity(subscriptions) {
    return subscriptions.reduce((best, subscription) => {
      const opportunity = findSavingsOpportunity(subscription);
      if (!opportunity) {
        return best;
      }

      if (!best || opportunity.savings > best.savings) {
        return opportunity;
      }

      return best;
    }, null);
  }

  function findSavingsOpportunity(subscription) {
    const selectedRecord = planById.get(subscription.id);
    const selectedTwelveMonth = getComparableCost(subscription, "twelveMonth");

    if (!selectedRecord || !Number.isFinite(selectedTwelveMonth)) {
      return null;
    }

    const bestAlternative = selectedRecord.tier.plans.reduce((best, plan) => {
      const candidateSubscription = {
        price: formatPrice(plan.price),
        duration: plan.duration,
      };
      const candidateValue = getComparableCost(candidateSubscription, "twelveMonth");

      if (!Number.isFinite(candidateValue) || plan.id === subscription.id) {
        return best;
      }

      if (!best || candidateValue < best.value) {
        return {
          plan,
          value: candidateValue,
        };
      }

      return best;
    }, null);

    if (!bestAlternative || bestAlternative.value >= selectedTwelveMonth) {
      return null;
    }

    const savings = selectedTwelveMonth - bestAlternative.value;
    if (savings <= 0.009) {
      return null;
    }

    return {
      currentPlanId: subscription.id,
      recommendedPlanId: bestAlternative.plan.id,
      savings,
      message: `Switch ${selectedRecord.tier.name} from ${selectedRecord.plan.label} to ${bestAlternative.plan.label}.`,
    };
  }

  function createSubscriptionOverview(subscriptions) {
    const summary = summarizeSubscriptionCosts(subscriptions);
    const overview = document.createElement("div");
    overview.className = "overview-card";

    const heading = document.createElement("h6");
    heading.textContent = "Selected Subscriptions";

    const metrics = document.createElement("div");
    metrics.className = "overview-metrics";
    metrics.append(
      createMetric("Count", String(subscriptions.length)),
      createMetric("Due Today", summary.dueTodayFormatted),
      createMetric("Monthly Average", summary.monthlyAverageFormatted),
      createMetric("Projected 12-Month Cost", summary.twelveMonthProjectionFormatted)
    );

    overview.append(heading, metrics);
    return overview;
  }

  function createMetric(label, value) {
    const metric = document.createElement("div");
    metric.className = "overview-metric";

    const metricLabel = document.createElement("span");
    metricLabel.textContent = label;

    const metricValue = document.createElement("strong");
    metricValue.textContent = value;

    metric.append(metricLabel, metricValue);
    return metric;
  }

  function groupSubscriptionsByProvider(subscriptions) {
    const providerOrder = new Map(providers.map((provider, index) => [provider.id, index]));
    const groups = new Map();

    subscriptions.forEach((subscription) => {
      const provider = providers.find((item) => item.id === subscription.providerId) || {
        id: subscription.custom ? `custom-${subscription.category || "custom"}` : subscription.providerId || "legacy",
        name: subscription.custom ? getCategoryLabel(subscription.category) : "Other Subscriptions",
      };

      if (!groups.has(provider.id)) {
        groups.set(provider.id, {
          provider,
          subscriptions: [],
        });
      }

      groups.get(provider.id).subscriptions.push(subscription);
    });

    return Array.from(groups.values()).sort((a, b) => {
      const aOrder = providerOrder.has(a.provider.id) ? providerOrder.get(a.provider.id) : Number.MAX_SAFE_INTEGER;
      const bOrder = providerOrder.has(b.provider.id) ? providerOrder.get(b.provider.id) : Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });
  }

  function createSubscriptionGroup(group) {
    const groupItem = document.createElement("li");
    groupItem.className = `subscription-group subscription-group-${group.provider.id}`;

    const groupSummary = summarizeSubscriptionCosts(group.subscriptions);
    const header = document.createElement("div");
    header.className = "subscription-group-header";

    const title = document.createElement("h6");
    title.textContent = group.provider.name;

    const subtotal = document.createElement("span");
    subtotal.textContent = `${groupSummary.twelveMonthProjectionFormatted} / 12 months`;

    const plans = document.createElement("ul");
    plans.className = "subscription-group-list";
    group.subscriptions.forEach((subscription) => {
      plans.appendChild(createSummaryItem(subscription));
    });

    header.append(title, subtotal);
    groupItem.append(header, plans);
    return groupItem;
  }

  function createSummaryItem(subscription) {
    const item = document.createElement("li");
    item.className = "subscription-item";

    const details = document.createElement("div");
    details.className = "subscription-details";
    const name = document.createElement("strong");
    name.textContent = getSubscriptionSummaryName(subscription);

    const meta = document.createElement("span");
    meta.textContent = `$${subscription.price} ${subscription.duration}`;

    const renewal = createRenewalControl(subscription);
    details.append(name, meta, renewal);

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

  function createRenewalControl(subscription) {
    const renewalDates = getStoredRenewalDates();
    const renewalWrap = document.createElement("div");
    renewalWrap.className = "renewal-control";

    const label = document.createElement("label");
    label.setAttribute("for", `renewal-${subscription.id}`);
    label.textContent = "Renews";

    const input = document.createElement("input");
    input.className = "renewal-date-input";
    input.id = `renewal-${subscription.id}`;
    input.type = "date";
    input.setAttribute("data-plan-id", subscription.id);
    input.value = renewalDates[subscription.id] || "";

    const status = document.createElement("span");
    status.className = "renewal-status";
    status.textContent = getRenewalStatus(subscription, input.value);

    renewalWrap.append(label, input, status);
    return renewalWrap;
  }

  function getRenewalStatus(subscription, renewalDate) {
    const nextRenewal = getNextRenewalDate(renewalDate, subscription.duration);
    const daysUntil = getDaysUntil(nextRenewal);

    if (!nextRenewal || !Number.isFinite(daysUntil)) {
      return "Add date";
    }

    if (daysUntil === 0) {
      return "Due today";
    }

    if (daysUntil === 1) {
      return "1 day left";
    }

    return `${daysUntil} days left`;
  }

  function getSubscriptionSummaryName(subscription) {
    if (subscription.custom) {
      return subscription.name || subscription.plan;
    }

    const record = planById.get(subscription.id);
    if (!record) {
      return subscription.plan;
    }

    return `${record.tier.name} - ${record.plan.label}`;
  }

  function getCategoryLabel(category) {
    const labels = {
      gaming: "Gaming",
      streaming: "Streaming Video",
      music: "Music",
      cloud: "Cloud Storage",
      software: "Software",
      "fitness-learning": "Fitness / Learning",
      custom: "Custom",
    };

    return labels[category] || "Custom";
  }

  function displayPriceComparison(subscriptionPlans) {
    const comparisonData = calculatePriceComparison(subscriptionPlans);
    const breakdownContainer = document.getElementById("priceBreakdown");
    breakdownContainer.textContent = "";

    if (!comparisonData.length) {
      return;
    }

    breakdownContainer.appendChild(createComparisonToolbar());

    const table = document.createElement("table");
    table.className = `table table-bordered text-center comparison-${activeComparisonMode}`;

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    appendHeaderCell(headerRow, "Plan");
    appendHeaderCell(headerRow, "Monthly Cost", "monthly");
    appendHeaderCell(headerRow, "3-Month Cost", "threeMonth");
    appendHeaderCell(headerRow, "12-Month Cost", "twelveMonth");
    thead.appendChild(headerRow);

    const lowestTwelveMonth = getBestTwelveMonthProjection(comparisonData);

    const tbody = document.createElement("tbody");
    comparisonData.forEach((data) => {
      const row = document.createElement("tr");
      appendCell(row, data.name, "plan-cell");
      appendCell(row, data.monthlyCost, getComparisonCellClass("monthly", data.monthlyCost));
      appendCell(row, data.threeMonthCost, getComparisonCellClass("threeMonth", data.threeMonthCost));

      const twelveMonthClass = lowestTwelveMonth && data.twelveMonthValue === lowestTwelveMonth.twelveMonthValue
        ? `${getComparisonCellClass("twelveMonth", data.twelveMonthCost)} best-value`
        : data.twelveMonthCost === "N/A"
        ? getComparisonCellClass("twelveMonth", data.twelveMonthCost)
        : getComparisonCellClass("twelveMonth", data.twelveMonthCost);
      appendCell(row, data.twelveMonthCost, twelveMonthClass);
      tbody.appendChild(row);
    });

    table.append(thead, tbody);
    breakdownContainer.appendChild(table);

    if (lowestTwelveMonth) {
      const savingsHighlight = document.createElement("div");
      savingsHighlight.className = "savings-highlight text-center mt-3";
      const savingsText = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = `Lowest 12-month projection: ${lowestTwelveMonth.name} at ${lowestTwelveMonth.twelveMonthCost}`;
      savingsText.appendChild(strong);
      savingsHighlight.appendChild(savingsText);
      breakdownContainer.appendChild(savingsHighlight);
    }
  }

  function createComparisonToolbar() {
    const toolbar = document.createElement("div");
    toolbar.className = "comparison-toolbar";

    const label = document.createElement("span");
    label.textContent = "Compare by";

    const group = document.createElement("div");
    group.className = "comparison-mode-group";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", "Comparison time period");

    [
      ["monthly", "Monthly"],
      ["threeMonth", "3-Month"],
      ["twelveMonth", "12-Month"],
    ].forEach(([mode, text]) => {
      const button = document.createElement("button");
      button.className = "comparison-mode";
      button.type = "button";
      button.setAttribute("data-mode", mode);
      button.classList.toggle("active", activeComparisonMode === mode);
      button.textContent = text;
      group.appendChild(button);
    });

    toolbar.append(label, group);
    return toolbar;
  }

  function getComparisonCellClass(mode, value) {
    const classes = ["currency-cell"];

    if (value === "N/A") {
      classes.push("na");
    }

    if (activeComparisonMode === mode) {
      classes.push("active-period");
    }

    return classes.join(" ");
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

  function formatShortDate(dateValue) {
    const date = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return "No date";
    }

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  function formatDaysUntil(daysUntil) {
    if (daysUntil === 0) {
      return "due today";
    }

    if (daysUntil === 1) {
      return "1 day left";
    }

    return `${daysUntil} days left`;
  }

  function getTierPricing(tier) {
    return tier.plans.map((plan) => `${plan.label}: $${formatPrice(plan.price)}`).join(" | ");
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

  function appendHeaderCell(row, text, mode = "") {
    const cell = document.createElement("th");
    cell.textContent = text;
    if (mode && activeComparisonMode === mode) {
      cell.className = "active-period";
    }
    row.appendChild(cell);
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
