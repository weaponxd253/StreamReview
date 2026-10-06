document.addEventListener("DOMContentLoaded", () => {
  const subscriptionsKey = "userSubscriptions";
  const budgetKey = "streamReviewBudget";
  const renewalDatesKey = "streamReviewRenewalDates";
  const gamingHoursKey = "streamReviewGamingHours";
  const scenariosKey = "streamReviewScenarios";
  const appBackupVersion = 1;
  const {
    calculatePriceComparison,
    escapeCsvCell,
    formatCurrency,
    formatDateInput,
    getBestTwelveMonthProjection,
    getBillingIntervalMonths,
    getBillingOptionValues,
    getChargeTotals,
    getComparableCost,
    getDaysUntil,
    getNextRenewalDate,
    getValueRating,
    normalizeDuration,
    parseDateOnly,
    summarizeSubscriptionCosts,
    getUpcomingCharges,
  } = window.StreamReviewPriceUtils;
  const uiStateKey = "streamReviewUi";
  const maxScenarios = 8;
  const mainViews = ["browse", "insights", "compare", "scenarios"];
  const compactLayoutQuery = window.matchMedia("(max-width: 991.98px)");
  let storageWarningShown = false;
  let activeComparisonMode = "twelveMonth";
  let activeFilter = "all";
  let activeCategory = "";
  let activeSearch = "";
  let activeView = "browse";
  let activeMainView = "browse";
  // The last provider viewed in each category, so switching categories returns to it.
  const activeProviderByCategory = {};

  const { categories, providers } = window.StreamReviewCatalog;

  const { planById, tierById, legacyPlanToId } = buildIndexes(providers);

  activeCategory = categories[0].id;
  renderProviders();
  restoreUiState();
  loadSubscriptions();
  setView(activeView, { persist: false });

  // "My plan" is its own screen only on the stacked layout; on wide screens it is always visible.
  compactLayoutQuery.addEventListener("change", () => {
    if (activeView === "plan" && !compactLayoutQuery.matches) {
      setView(activeMainView);
    }
  });

  window.addEventListener("hashchange", () => {
    const view = location.hash.slice(1);
    if (view && view !== activeView) {
      setView(view, { persist: false });
    }
  });

  document.body.addEventListener("click", (e) => {
    const viewTarget = e.target.closest("[data-view-target]");
    if (viewTarget) {
      setView(viewTarget.getAttribute("data-view-target"));
    }

    const categoryTab = e.target.closest(".category-tab");
    if (categoryTab) {
      selectCategory(categoryTab.getAttribute("data-category-id"));
    }

    const providerTab = e.target.closest(".provider-tab");
    if (providerTab) {
      selectProvider(providerTab.getAttribute("data-provider-id"));
    }

    const planRow = e.target.closest(".plan-tile");
    const subscriptionButton = planRow ? planRow.querySelector(".add-subscription") : null;
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
    if (resetButton && window.confirm("Clear all selected subscriptions and their renewal dates?")) {
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
      const subscriptions = getStoredSubscriptions();
      updateBudgetControls(subscriptions);
      renderReturnAlerts(subscriptions);
      renderRailExtras(subscriptions);
    }

    const switchButton = e.target.closest(".switch-plan");
    if (switchButton) {
      switchPlan(switchButton.getAttribute("data-from"), switchButton.getAttribute("data-to"));
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

  document.getElementById("providerTabs").addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
      return;
    }

    const tabs = [...document.querySelectorAll(".provider-tab:not(:disabled):not([hidden])")];
    const currentIndex = tabs.indexOf(document.activeElement);
    if (currentIndex === -1) {
      return;
    }

    e.preventDefault();
    const lastIndex = tabs.length - 1;
    const nextIndex = {
      ArrowLeft: currentIndex === 0 ? lastIndex : currentIndex - 1,
      ArrowRight: currentIndex === lastIndex ? 0 : currentIndex + 1,
      Home: 0,
      End: lastIndex,
    }[e.key];
    tabs[nextIndex].focus();
    selectProvider(tabs[nextIndex].getAttribute("data-provider-id"));
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
      const subscriptions = getStoredSubscriptions();
      updateBudgetControls(subscriptions);
      renderReturnAlerts(subscriptions);
      renderRailExtras(subscriptions);
    }

    if (e.target.classList.contains("renewal-date-input")) {
      updateRenewalDate(e.target);
    }

    if (e.target.id === "gamingHours") {
      saveGamingHours(e.target.value);
      updateGamingValue(getStoredSubscriptions());
    }

    if (e.target.id === "planSearch") {
      activeSearch = e.target.value.trim().toLowerCase();
      if (activeView !== "browse") {
        setView("browse");
      }
      applyPlanFilter();
    }
  });

  document.body.addEventListener("change", (e) => {
    if (e.target.id === "importBackup") {
      const file = e.target.files[0];
      e.target.value = "";
      if (file && window.confirm("Importing a backup replaces your current plans, budget, renewal dates, and scenarios. Continue?")) {
        importBackup(file);
      }
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
    const categoryTabs = document.getElementById("categoryTabs");
    const providerTabs = document.getElementById("providerTabs");
    const providerGrid = document.getElementById("providerGrid");
    categoryTabs.textContent = "";
    providerTabs.textContent = "";
    providerGrid.textContent = "";

    categories.forEach((category) => {
      categoryTabs.appendChild(createCategoryTab(category));
    });

    providers.forEach((provider) => {
      providerTabs.appendChild(createProviderTab(provider));
      providerGrid.appendChild(createProviderPanel(provider));
    });
  }

  function createCategoryTab(category) {
    const tab = document.createElement("button");
    tab.className = "category-tab";
    tab.type = "button";
    tab.setAttribute("data-category-id", category.id);

    const icon = document.createElement("i");
    icon.className = category.iconClass;
    icon.setAttribute("aria-hidden", "true");

    const name = document.createElement("span");
    name.className = "tab-full";
    name.textContent = category.name;

    const shortName = document.createElement("span");
    shortName.className = "tab-short";
    shortName.textContent = category.shortName || category.name;

    const count = document.createElement("span");
    count.className = "tab-count";
    count.hidden = true;

    tab.append(icon, name, shortName, count);
    return tab;
  }

  // Provider colours come from the catalog, so new providers need no extra CSS.
  function applyProviderTheme(element, provider) {
    if (!provider || !provider.theme) {
      return;
    }

    element.style.setProperty("--brand", provider.theme.brand);
    element.style.setProperty("--brand-light", provider.theme.light);
    element.style.setProperty("--brand-border", provider.theme.border);
  }

  function createProviderTab(provider) {
    const tab = document.createElement("button");
    tab.className = "provider-tab";
    applyProviderTheme(tab, provider);
    tab.type = "button";
    tab.id = `tab-${provider.id}`;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", `panel-${provider.id}`);
    tab.setAttribute("data-provider-id", provider.id);
    tab.setAttribute("data-categories", getProviderCategories(provider).join(" "));

    const icon = document.createElement("i");
    icon.className = provider.iconClass;
    icon.setAttribute("aria-hidden", "true");

    const name = document.createElement("span");
    name.className = "tab-full";
    name.textContent = provider.name;

    // Narrow screens show just the brand ("PlayStation", "Xbox", "Nintendo").
    const shortName = document.createElement("span");
    shortName.className = "tab-short";
    shortName.textContent = provider.shortName || provider.name;

    const count = document.createElement("span");
    count.className = "tab-count";
    count.hidden = true;

    tab.append(icon, name, shortName, count);
    return tab;
  }

  function createProviderPanel(provider) {
    const panel = document.createElement("section");
    panel.className = "provider-column";
    applyProviderTheme(panel, provider);
    panel.id = `panel-${provider.id}`;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", `tab-${provider.id}`);
    panel.setAttribute("data-provider-id", provider.id);
    panel.setAttribute("data-categories", getProviderCategories(provider).join(" "));

    // Only shown while searching or filtering, when several providers are listed together.
    const title = document.createElement("h3");
    title.className = "provider-panel-title";
    const titleIcon = document.createElement("i");
    titleIcon.className = provider.iconClass;
    titleIcon.setAttribute("aria-hidden", "true");
    title.append(titleIcon, ` ${provider.name}`);

    const tierGrid = document.createElement("div");
    tierGrid.className = "tier-grid";
    provider.tiers.forEach((tier) => {
      tierGrid.appendChild(createTierCard(provider, tier));
    });

    panel.append(title, tierGrid);
    return panel;
  }

  // Each tier is a card; its billing options sit side by side as tiles so they can be
  // compared across one row instead of read down a list.
  function createTierCard(provider, tier) {
    const card = document.createElement("article");
    card.className = "tier-card";

    const header = document.createElement("header");
    header.className = "tier-header";

    const heading = document.createElement("div");
    const tierName = document.createElement("h4");
    tierName.textContent = tier.name;
    const summary = document.createElement("p");
    summary.className = "tier-summary";
    summary.textContent = tier.summary || tier.detailItems
      .map(([label]) => label)
      .filter((label) => !/offer|trial|bonus|availability|price/i.test(label))
      .slice(0, 3)
      .join(" · ");
    heading.append(tierName, summary);

    const infoButton = document.createElement("button");
    infoButton.className = "plan-info";
    infoButton.type = "button";
    infoButton.setAttribute("data-bs-toggle", "offcanvas");
    infoButton.setAttribute("data-bs-target", "#descriptionOffcanvas");
    infoButton.setAttribute("data-tier-id", tier.id);
    infoButton.setAttribute("aria-label", `Show details for ${tier.detailTitle}`);

    const infoIcon = document.createElement("i");
    infoIcon.className = "fa-solid fa-circle-info";
    infoIcon.setAttribute("aria-hidden", "true");
    infoButton.append(infoIcon, " Details");

    header.append(heading, infoButton);

    const tiles = document.createElement("div");
    tiles.className = "plan-tiles";
    const optionValues = getBillingOptionValues(tier.plans);
    tier.plans.forEach((plan, index) => {
      tiles.appendChild(createPlanTile(provider, tier, plan, optionValues[index]));
    });

    card.append(header, tiles);
    return card;
  }

  function createPlanTile(provider, tier, plan, optionValue) {
    const tile = document.createElement("div");
    tile.className = "plan-tile";
    tile.setAttribute("data-plan-id", plan.id);
    tile.setAttribute("data-duration", normalizeDuration(plan.duration));
    tile.setAttribute("data-categories", (tier.categories || getProviderCategories(provider)).join(" "));
    tile.setAttribute("data-search", `${provider.name} ${tier.name} ${plan.label} ${plan.duration}`.toLowerCase());

    const top = document.createElement("div");
    top.className = "plan-tile-top";
    const label = document.createElement("span");
    label.className = "plan-tile-label";
    label.textContent = plan.label;
    top.appendChild(label);
    if (optionValue.isBestValue) {
      const badge = document.createElement("span");
      badge.className = "best-value-badge";
      badge.textContent = "Best value";
      top.appendChild(badge);
    }

    const price = document.createElement("div");
    price.className = "plan-price";
    const priceAmount = document.createElement("strong");
    priceAmount.textContent = formatCurrency(plan.price);
    const priceNote = document.createElement("small");
    priceNote.textContent = getBillingIntervalMonths(plan.duration) === 1
      ? "per month"
      : `${formatCurrency(optionValue.perMonth)}/mo`;
    price.append(priceAmount, priceNote);

    const savings = document.createElement("span");
    savings.className = "plan-savings";
    savings.textContent = optionValue.savingsPercent > 0 ? `Save ${optionValue.savingsPercent}% vs monthly` : "";

    const addButton = document.createElement("button");
    addButton.className = "add-subscription";
    addButton.type = "button";
    addButton.setAttribute("data-plan-id", plan.id);
    addButton.setAttribute("data-plan", getPlanDisplayName(provider, tier, plan));
    addButton.setAttribute("data-price", formatPrice(plan.price));
    addButton.setAttribute("data-duration", plan.duration);
    addButton.setAttribute("aria-label", `Add ${getPlanDisplayName(provider, tier, plan)}`);

    const addIcon = document.createElement("i");
    addIcon.className = "fa-solid fa-plus";
    addIcon.setAttribute("aria-hidden", "true");
    const addLabel = document.createElement("span");
    addLabel.className = "add-label";
    addLabel.textContent = "Add";
    addButton.append(addIcon, addLabel);

    tile.append(top, price, savings, addButton);
    return tile;
  }

  function restoreUiState() {
    let stored = {};
    try {
      stored = JSON.parse(readStorage(uiStateKey)) || {};
    } catch {
      stored = {};
    }

    if (categories.some((category) => category.id === stored.category)) {
      activeCategory = stored.category;
    }

    const storedProviders = stored.providers || {};
    providers.forEach((provider) => {
      getProviderCategories(provider).forEach((categoryId) => {
        if (storedProviders[categoryId] === provider.id) {
          activeProviderByCategory[categoryId] = provider.id;
        }
      });
      if (stored.provider === provider.id) {
        activeProviderByCategory[provider.category] = provider.id;
      }
    });

    const hashView = location.hash.slice(1);
    const requestedView = isKnownView(hashView) ? hashView : stored.view;
    activeView = isKnownView(requestedView) ? requestedView : "browse";
    if (mainViews.includes(stored.mainView)) {
      activeMainView = stored.mainView;
    }
  }

  function saveUiState() {
    writeStorage(uiStateKey, JSON.stringify({
      view: activeView,
      mainView: activeMainView,
      category: activeCategory,
      providers: activeProviderByCategory,
    }));
  }

  function isKnownView(view) {
    return view === "plan" || mainViews.includes(view);
  }

  function setView(requestedView, { persist = true } = {}) {
    let view = isKnownView(requestedView) ? requestedView : "browse";

    // On wide screens the plan rail is always on screen, so "plan" keeps the current main view.
    if (view === "plan" && !compactLayoutQuery.matches) {
      view = activeMainView;
      document.getElementById("planTitle").scrollIntoView({ block: "nearest" });
    }

    const changedMainView = view !== "plan" && view !== activeMainView;
    activeView = view;
    if (view !== "plan") {
      activeMainView = view;
    }

    document.body.setAttribute("data-view", view);
    document.querySelectorAll(".view").forEach((section) => {
      section.classList.toggle("is-active", section.getAttribute("data-view") === activeMainView);
    });
    document.querySelectorAll(".nav-item, .tab-item").forEach((item) => {
      const target = item.getAttribute("data-view-target");
      const isCurrent = item.classList.contains("nav-item") ? target === activeMainView : target === view;
      if (isCurrent) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    if (changedMainView) {
      document.getElementById("main").scrollTop = 0;
    }

    if (persist) {
      saveUiState();
      if (location.hash.slice(1) !== view) {
        history.replaceState(null, "", `#${view}`);
      }
    }
  }

  function getActiveProviderId(categoryId) {
    const remembered = activeProviderByCategory[categoryId];
    if (remembered) {
      return remembered;
    }

    const firstProvider = providers.find((provider) => getProviderCategories(provider).includes(categoryId));
    return firstProvider ? firstProvider.id : "";
  }

  function selectCategory(categoryId) {
    if (!categories.some((category) => category.id === categoryId)) {
      return;
    }

    activeCategory = categoryId;
    // Picking a category is navigation, so it ends any search in progress.
    if (activeSearch) {
      activeSearch = "";
      document.getElementById("planSearch").value = "";
    }

    saveUiState();
    applyPlanFilter();
  }

  function selectProvider(providerId) {
    const provider = providers.find((item) => item.id === providerId);
    if (!provider) {
      return;
    }

    // A provider listed in several categories keeps the current one when it belongs there.
    if (!getProviderCategories(provider).includes(activeCategory)) {
      activeCategory = provider.category;
    }
    activeProviderByCategory[activeCategory] = providerId;
    saveUiState();

    // While a search or filter lists several providers, a tab jumps to that provider's results.
    if (isNarrowingPlans()) {
      document.getElementById(`panel-${providerId}`).scrollIntoView({ block: "start" });
      return;
    }

    applyPlanFilter();
  }

  function getProviderCategories(provider) {
    return [provider.category, ...(provider.alsoIn || [])];
  }

  function getElementCategories(element) {
    return (element.getAttribute("data-categories") || "").split(" ");
  }

  function isNarrowingPlans() {
    return Boolean(activeSearch) || activeFilter !== "all";
  }

  function switchPlan(fromPlanId, toPlanId) {
    const replacement = createSubscription(toPlanId);
    const subscriptions = getStoredSubscriptions();
    if (!replacement || !subscriptions.some((subscription) => subscription.id === fromPlanId)) {
      showToast("That plan could not be switched", "error");
      return;
    }

    const alreadySelected = subscriptions.some((subscription) => subscription.id === toPlanId);
    const nextSubscriptions = alreadySelected
      ? subscriptions.filter((subscription) => subscription.id !== fromPlanId)
      : subscriptions.map((subscription) => (subscription.id === fromPlanId ? replacement : subscription));

    // The old renewal date belongs to a different billing cycle, so it no longer applies.
    removeRenewalDate(fromPlanId);
    saveSubscriptions(nextSubscriptions);
    displaySubscriptions(nextSubscriptions);
    syncDropdownIcons(nextSubscriptions);
    applyPlanFilter();
    showToast(`Switched to ${getShortPlanName(replacement.plan)} - ${planById.get(toPlanId).plan.label}`);
  }

  function addSubscription(planId, buttonElement) {
    const subscriptions = getStoredSubscriptions();
    const subscription = createSubscription(planId);

    if (!subscription) {
      showToast("That plan is unavailable", "error");
      return;
    }

    // One account holds one membership per provider, so picking another tier or
    // billing option replaces the current one instead of stacking both.
    const existing = subscriptions.find((s) => !s.custom && s.providerId === subscription.providerId);
    if (existing && existing.id !== planId) {
      const replaced = subscriptions.map((s) => (s.id === existing.id ? subscription : s));
      removeRenewalDate(existing.id);
      saveSubscriptions(replaced);
      displaySubscriptions(replaced);
      syncDropdownIcons(replaced);
      applyPlanFilter();
      showToast(`Changed ${planById.get(planId).provider.name} to ${getSubscriptionSummaryName(subscription)}`);
      return;
    }

    if (!existing) {
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
    bootstrap.Modal.getInstance(document.getElementById("customModal"))?.hide();
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

  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      if (!storageWarningShown) {
        storageWarningShown = true;
        showToast("Changes can't be saved in this browser. Storage may be full or disabled.", "error");
      }
    }
  }

  function getStoredSubscriptions() {
    const rawSubscriptions = readSubscriptions();
    return normalizeSubscriptions(rawSubscriptions);
  }

  function readSubscriptions() {
    try {
      const parsed = JSON.parse(readStorage(subscriptionsKey));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveSubscriptions(subscriptions) {
    writeStorage(subscriptionsKey, JSON.stringify(subscriptions));
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
      id: subscription.id || getStableCustomId(name, price, duration, subscription.category),
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

  // Imported custom plans without an id need one that stays the same on every read,
  // or their renewal dates and remove button stop matching them.
  function getStableCustomId(name, price, duration, category) {
    const source = [name, formatPrice(price), duration, category || "custom"].join("|");
    let hash = 0;
    for (let index = 0; index < source.length; index += 1) {
      hash = (hash * 31 + source.charCodeAt(index)) | 0;
    }
    return `custom-${(hash >>> 0).toString(36)}`;
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
      const listItem = subscriptionButton.closest(".plan-tile");
      if (listItem) {
        listItem.classList.toggle("selected-subscription", isHighlighted);
      }
    }
  }

  function getSubscriptionButton(planId) {
    return document.querySelector(`.add-subscription[data-plan-id="${CSS.escape(planId)}"]`);
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
    const isSearching = Boolean(activeSearch);
    const isNarrowing = isNarrowingPlans();
    const activeProviderId = getActiveProviderId(activeCategory);

    // Search looks across every category; filters stay within the current one.
    const matchesByCategory = {};
    document.querySelectorAll(".plan-tile").forEach((row) => {
      const duration = row.getAttribute("data-duration");
      const rowCategories = getElementCategories(row);
      const searchableText = row.getAttribute("data-search") || "";
      const isSelected = row.classList.contains("selected-subscription");
      const shouldShow =
        (activeFilter === "all" ||
          (activeFilter === "selected" && isSelected) ||
          (activeFilter === "monthly" && duration === "Monthly") ||
          (activeFilter === "annual" && duration === "Yearly")) &&
        (isSearching || rowCategories.includes(activeCategory)) &&
        (!isSearching || searchableText.includes(activeSearch));

      row.classList.toggle("plan-hidden", !shouldShow);
      if (shouldShow) {
        rowCategories.forEach((categoryId) => {
          matchesByCategory[categoryId] = (matchesByCategory[categoryId] || 0) + 1;
        });
      }
    });

    document.getElementById("providerGrid").classList.toggle("is-multi", isNarrowing);

    document.querySelectorAll(".tier-card").forEach((tierCard) => {
      const hasVisiblePlans = tierCard.querySelector(".plan-tile:not(.plan-hidden)");
      tierCard.classList.toggle("plan-hidden", !hasVisiblePlans);
    });

    // Normally one provider shows at a time. While searching or filtering, every provider
    // with matches is listed so results are never hidden behind another tab.
    document.querySelectorAll(".provider-column").forEach((column) => {
      const providerId = column.getAttribute("data-provider-id");
      const providerCategories = getElementCategories(column);
      const matchCount = column.querySelectorAll(".plan-tile:not(.plan-hidden)").length;
      const isActiveTab = !isNarrowing && providerId === activeProviderId;
      const shouldShowColumn = isNarrowing ? matchCount > 0 : isActiveTab;
      column.classList.toggle("plan-hidden", !shouldShowColumn);

      const tab = document.getElementById(`tab-${providerId}`);
      const tabCount = tab.querySelector(".tab-count");
      tab.hidden = isSearching ? matchCount === 0 : !providerCategories.includes(activeCategory);
      tab.classList.toggle("is-active", isActiveTab);
      tab.setAttribute("aria-selected", String(isActiveTab));
      tab.tabIndex = isActiveTab || (isNarrowing && matchCount > 0) ? 0 : -1;
      tab.disabled = isNarrowing && matchCount === 0;
      tabCount.hidden = !isNarrowing;
      tabCount.textContent = String(matchCount);
    });

    document.querySelectorAll(".category-tab").forEach((tab) => {
      const categoryId = tab.getAttribute("data-category-id");
      const tabCount = tab.querySelector(".tab-count");
      const isActive = categoryId === activeCategory && !isSearching;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-pressed", String(isActive));
      tabCount.hidden = !isSearching;
      tabCount.textContent = String(matchesByCategory[categoryId] || 0);
    });

    const providerEmpty = document.getElementById("providerEmpty");
    providerEmpty.hidden = document.querySelector(".provider-column:not(.plan-hidden)") !== null;
    providerEmpty.textContent = isSearching
      ? `No plans match "${activeSearch}". Use + Custom to track a service that isn't listed.`
      : "No plans match this filter.";
  }


  function toggleAddIcon(buttonElement, isAdded) {
    const icon = buttonElement.querySelector("i");
    const label = buttonElement.querySelector(".add-label");
    const plan = buttonElement.getAttribute("data-plan");

    buttonElement.classList.toggle("added", isAdded);
    if (plan) {
      buttonElement.setAttribute("aria-label", `${isAdded ? "Remove" : "Add"} ${plan}`);
    }

    if (icon) {
      icon.className = isAdded ? "fa-solid fa-check" : "fa-solid fa-plus";
    }

    if (label) {
      label.textContent = isAdded ? "Selected" : "Add";
    }
  }

  function displaySubscriptions(subscriptions) {
    const subscriptionList = document.getElementById("subscriptionList");
    const emptyState = document.getElementById("emptyState");
    const breakdownContainer = document.getElementById("priceBreakdown");
    const hasSubscriptions = subscriptions.length > 0;

    subscriptionList.textContent = "";
    updateStickySummary(subscriptions);
    updateDecisionTools(subscriptions);
    renderReturnAlerts(subscriptions);
    renderRailExtras(subscriptions);

    document.getElementById("decisionTools").hidden = !hasSubscriptions;
    document.getElementById("insightsEmpty").hidden = hasSubscriptions;
    document.getElementById("compareEmpty").hidden = hasSubscriptions;
    document.getElementById("startHint").hidden = hasSubscriptions;

    if (subscriptions.length === 0) {
      emptyState.style.display = "block";
      subscriptionList.style.display = "none";
      breakdownContainer.textContent = "";
      return;
    }

    emptyState.style.display = "none";
    subscriptionList.style.display = "block";

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

    document.getElementById("topMonthly").textContent = summary.monthlyAverageFormatted;
    document.getElementById("topCount").textContent = String(subscriptions.length);
    const tabPlanCount = document.getElementById("tabPlanCount");
    tabPlanCount.hidden = subscriptions.length === 0;
    tabPlanCount.textContent = String(subscriptions.length);
  }

  // The rail keeps the most useful signals next to the plan list: the top savings
  // switch, budget progress and the next charge. Each links to Insights for detail.
  function renderRailExtras(subscriptions) {
    const railExtras = document.getElementById("railExtras");
    const railSavings = document.getElementById("railSavings");
    railExtras.hidden = subscriptions.length === 0;
    railSavings.textContent = "";
    if (!subscriptions.length) {
      return;
    }

    const savings = findBestSavingsOpportunity(subscriptions);
    if (savings) {
      railSavings.appendChild(
        createInsightCard(
          `Save ${formatCurrency(savings.savings)} a year`,
          savings.message,
          "primary",
          createSwitchButton(savings)
        )
      );
    }

    const summary = summarizeSubscriptionCosts(subscriptions);
    const budget = getStoredBudget();
    const budgetAmount = Number.parseFloat(budget.amount);
    const railBudget = document.getElementById("railBudget");
    if (Number.isFinite(budgetAmount) && budgetAmount > 0) {
      const spend = budget.type === "monthly" ? summary.monthlyAverage : summary.twelveMonthProjection;
      const ratio = spend / budgetAmount;
      const meter = document.createElement("span");
      meter.className = `rail-meter ${ratio > 1 ? "over" : ratio >= 0.9 ? "close" : "under"}`;
      const meterFill = document.createElement("span");
      meterFill.style.width = `${Math.min(100, ratio * 100)}%`;
      meter.appendChild(meterFill);
      fillRailRow(
        railBudget,
        "fa-solid fa-wallet",
        budget.type === "monthly" ? "Monthly budget" : "Yearly budget",
        `${formatCurrency(spend)} of ${formatCurrency(budgetAmount)}`,
        meter
      );
    } else {
      fillRailRow(railBudget, "fa-solid fa-wallet", "Budget", "Set a budget");
    }

    const charges = getUpcomingCharges(subscriptions, getStoredRenewalDates(), new Date(), 90);
    const railNextCharge = document.getElementById("railNextCharge");
    if (charges.length) {
      const nextCharge = charges[0];
      fillRailRow(
        railNextCharge,
        "fa-solid fa-calendar-day",
        `Next charge · ${formatShortDate(nextCharge.date)}`,
        `${getShortPlanName(nextCharge.plan)} · ${nextCharge.priceFormatted}`
      );
    } else {
      fillRailRow(railNextCharge, "fa-solid fa-calendar-day", "Upcoming charges", "Add renewal dates to track them");
    }
  }

  function fillRailRow(row, iconClass, label, value, extra = null) {
    row.textContent = "";

    const icon = document.createElement("i");
    icon.className = iconClass;
    icon.setAttribute("aria-hidden", "true");

    const text = document.createElement("span");
    text.className = "rail-row-text";
    const labelElement = document.createElement("span");
    labelElement.className = "rail-row-label";
    labelElement.textContent = label;
    const valueElement = document.createElement("strong");
    valueElement.textContent = value;
    text.append(labelElement, valueElement);
    if (extra) {
      text.appendChild(extra);
    }

    const chevron = document.createElement("i");
    chevron.className = "fa-solid fa-chevron-right rail-row-chevron";
    chevron.setAttribute("aria-hidden", "true");

    row.append(icon, text, chevron);
  }

  function updateDecisionTools(subscriptions) {
    updateBudgetControls(subscriptions);
    renderInsights(subscriptions);
    renderUpcomingCharges(subscriptions);
    updateGamingValue(subscriptions);
  }

  function loadBudgetControls() {
    const budget = getStoredBudget();
    const budgetAmount = document.getElementById("budgetAmount");
    budgetAmount.value = budget.amount;
    updateBudgetControls(getStoredSubscriptions());
  }

  function getStoredBudget() {
    try {
      const parsed = JSON.parse(readStorage(budgetKey));
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
    writeStorage(budgetKey, JSON.stringify(budget));
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
      const parsed = JSON.parse(readStorage(renewalDatesKey));
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveRenewalDates(renewalDates) {
    writeStorage(renewalDatesKey, JSON.stringify(renewalDates));
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

  function updateRenewalDate(input) {
    const planId = input.getAttribute("data-plan-id");
    saveRenewalDate(planId, input.value);

    const subscriptions = getStoredSubscriptions();
    const subscription = subscriptions.find((item) => item.id === planId);
    const status = input.closest(".renewal-control")?.querySelector(".renewal-status");
    if (subscription && status) {
      applyRenewalStatus(status, subscription, input.value);
    }

    // Refresh dependent panels without re-rendering the list, which would replace the focused input.
    renderUpcomingCharges(subscriptions);
    renderReturnAlerts(subscriptions);
    renderRailExtras(subscriptions);
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
    const totals = getChargeTotals(charges);

    chargesList.textContent = "";
    nextThirtyTotal.textContent = formatCurrency(totals.nextThirty);
    nextNinetyTotal.textContent = formatCurrency(totals.nextNinety);

    if (!charges.length) {
      nextChargeBadge.className = "panel-badge is-empty";
      nextChargeBadge.textContent = "No dates yet";
      const emptyItem = document.createElement("li");
      emptyItem.className = "upcoming-empty";
      emptyItem.textContent = subscriptions.length
        ? "Add renewal dates to selected plans."
        : "Select plans to track upcoming charges.";
      chargesList.appendChild(emptyItem);
      return;
    }

    nextChargeBadge.className = "panel-badge";
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
    return readStorage(gamingHoursKey) || "";
  }

  function saveGamingHours(hours) {
    writeStorage(gamingHoursKey, hours || "");
  }

  function updateGamingValue(subscriptions) {
    const hoursValue = getStoredGamingHours();
    const summary = summarizeSubscriptionCosts(subscriptions);
    const valueRating = document.getElementById("valueRating");
    const costPerHour = document.getElementById("costPerHour");
    const costPerWeek = document.getElementById("costPerWeek");
    const weeklyCost = summary.monthlyAverage / 4.345;
    const rating = getValueRating(summary.monthlyAverage, hoursValue);
    const ratingLabels = { Great: "Great value", Good: "Good value", Watch: "Watch spend" };

    costPerWeek.textContent = formatCurrency(weeklyCost);

    if (!rating) {
      valueRating.className = "panel-badge is-empty";
      valueRating.textContent = Number.parseFloat(hoursValue) > 0 ? "No plans" : "No hours yet";
      costPerHour.textContent = "$0.00";
      return;
    }

    costPerHour.textContent = formatCurrency(rating.hourlyCost);
    valueRating.className = "panel-badge";
    valueRating.textContent = ratingLabels[rating.level];
  }

  function getStoredScenarios() {
    try {
      const parsed = JSON.parse(readStorage(scenariosKey));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveScenarios(scenarios) {
    writeStorage(scenariosKey, JSON.stringify(scenarios));
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
    const droppedScenario = scenarios.length > maxScenarios ? scenarios[scenarios.length - 1] : null;
    saveScenarios(scenarios.slice(0, maxScenarios));
    scenarioName.value = "";
    renderScenarios();
    renderReturnAlerts(subscriptions);
    showToast(
      droppedScenario
        ? `Saved ${name}. Removed oldest scenario "${droppedScenario.name}" (limit ${maxScenarios}).`
        : `Saved ${name}`
    );
  }

  function loadScenario(scenarioId) {
    const scenario = getStoredScenarios().find((item) => item.id === scenarioId);
    if (!scenario) {
      showToast("Scenario could not be loaded", "error");
      return;
    }

    if (
      getStoredSubscriptions().length &&
      !window.confirm(`Load "${scenario.name}"? This replaces your current plans, budget, and renewal dates.`)
    ) {
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
    renderReturnAlerts(getStoredSubscriptions());
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
    ["Scenario", "Plans", "Per Cycle", "Monthly Avg", "12-Month", "Next 30", "Next 90", "Value"].forEach((label) => {
      const th = document.createElement("th");
      th.textContent = label;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    const rows = scenarios.map((scenario) => {
      const subscriptions = getScenarioSubscriptions(scenario);
      const summary = summarizeSubscriptionCosts(subscriptions);
      const charges = getUpcomingCharges(subscriptions, scenario.renewalDates || {}, new Date(), 90);
      const { nextThirty, nextNinety } = getChargeTotals(charges);
      const rating = getValueRating(summary.monthlyAverage, scenario.gamingHours);
      return {
        scenario,
        subscriptions,
        summary,
        nextThirty,
        nextNinety,
        value: rating ? rating.level : "No hours",
      };
    });

    // Match the plan comparison rule: only highlight when there is a real choice to make.
    const twelveMonthTotals = rows.map((row) => row.summary.twelveMonthProjection);
    const cheapestTwelve = Math.min(...twelveMonthTotals);
    const hasBestScenario = rows.length >= 2 && cheapestTwelve < Math.max(...twelveMonthTotals);

    const tbody = document.createElement("tbody");
    rows.forEach((rowData) => {
      const row = document.createElement("tr");
      if (hasBestScenario && rowData.summary.twelveMonthProjection === cheapestTwelve) {
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
      `Per billing cycle: ${summary.dueTodayFormatted}`,
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

    const bestSavings = findBestSavingsOpportunity(subscriptions);
    if (bestSavings) {
      insightsPanel.appendChild(
        createInsightCard(
          "Savings found",
          `${bestSavings.message} You could save ${formatCurrency(bestSavings.savings)}.`,
          "primary",
          createSwitchButton(bestSavings)
        )
      );
    }

    if (rankedByTwelveMonth[0]) {
      insightsPanel.appendChild(
        createInsightCard(
          "Cheapest 12-month plan",
          `${getSubscriptionSummaryName(rankedByTwelveMonth[0].subscription)} projects to ${formatCurrency(rankedByTwelveMonth[0].value)}.`,
          "good"
        )
      );
    }

    const mostExpensive = rankedByTwelveMonth.length > 1 ? rankedByTwelveMonth[rankedByTwelveMonth.length - 1] : null;
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

    if (!bestSavings) {
      insightsPanel.appendChild(
        createInsightCard("Billing choices", "Your selected tiers are already using their lowest 12-month billing option.", "neutral")
      );
    }
  }

  function createInsightCard(title, body, tone, action = null) {
    const card = document.createElement("article");
    card.className = `insight-card insight-${tone}`;

    const heading = document.createElement("strong");
    heading.textContent = title;

    const text = document.createElement("p");
    text.textContent = body;

    card.append(heading, text);
    if (action) {
      card.appendChild(action);
    }
    return card;
  }

  function createSwitchButton(opportunity) {
    const button = document.createElement("button");
    button.className = "switch-plan";
    button.type = "button";
    button.setAttribute("data-from", opportunity.currentPlanId);
    button.setAttribute("data-to", opportunity.recommendedPlanId);
    button.innerHTML = '<i class="fa-solid fa-arrow-right-arrow-left" aria-hidden="true"></i>';
    button.append(` Switch to ${planById.get(opportunity.recommendedPlanId).plan.label}`);
    return button;
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
      message: `Switch ${getTierDisplayName(selectedRecord.provider, selectedRecord.tier)} from ${selectedRecord.plan.label} to ${bestAlternative.plan.label}.`,
    };
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
    if (group.provider.theme) {
      groupItem.classList.add("is-themed");
      applyProviderTheme(groupItem, group.provider);
    }

    const groupSummary = summarizeSubscriptionCosts(group.subscriptions);
    const header = document.createElement("div");
    header.className = "subscription-group-header";

    const title = document.createElement("h6");
    title.textContent = group.provider.name;

    const subtotal = document.createElement("span");
    subtotal.textContent = `${groupSummary.twelveMonthProjectionFormatted}/yr`;

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
    applyRenewalStatus(status, subscription, input.value);

    renewalWrap.append(label, input, status);
    return renewalWrap;
  }

  function applyRenewalStatus(statusElement, subscription, renewalDate) {
    const status = getRenewalStatus(subscription, renewalDate);
    statusElement.className = status ? "renewal-status" : "renewal-status is-empty";
    statusElement.textContent = status || "Not set";
  }

  function getRenewalStatus(subscription, renewalDate) {
    const nextRenewal = getNextRenewalDate(renewalDate, subscription.duration);
    const daysUntil = getDaysUntil(nextRenewal);

    if (!nextRenewal || !Number.isFinite(daysUntil)) {
      return "";
    }

    const text = formatDaysUntil(daysUntil);
    return text.charAt(0).toUpperCase() + text.slice(1);
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
      appendCell(row, data.monthlyCost, getComparisonCellClass("monthly", data.monthlyCost), "Monthly");
      appendCell(row, data.threeMonthCost, getComparisonCellClass("threeMonth", data.threeMonthCost), "3-Month");

      const twelveMonthBaseClass = getComparisonCellClass("twelveMonth", data.twelveMonthCost);
      const twelveMonthClass = lowestTwelveMonth && data.twelveMonthValue === lowestTwelveMonth.twelveMonthValue
        ? `${twelveMonthBaseClass} best-value`
        : twelveMonthBaseClass;
      appendCell(row, data.twelveMonthCost, twelveMonthClass, "12-Month");
      tbody.appendChild(row);
    });

    table.append(thead, tbody);
    const tableWrap = document.createElement("div");
    tableWrap.className = "comparison-table-wrap";
    tableWrap.appendChild(table);
    breakdownContainer.appendChild(tableWrap);

    if (lowestTwelveMonth) {
      const savingsHighlight = document.createElement("div");
      savingsHighlight.className = "savings-highlight text-center mt-3";
      const savingsText = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = `Best 12-month value: ${lowestTwelveMonth.name} at ${lowestTwelveMonth.twelveMonthCost}`;
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

    const checked = document.createElement("p");
    checked.className = "prices-checked";
    checked.textContent = `U.S. list prices, checked ${formatLongDate(record.provider.pricesCheckedOn)}.`;

    content.append(intro, benefits, pricing, checked);
  }

  function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toastContainer");
    const toastId = `toast-${Date.now()}`;
    const isError = type === "error";

    // Show one message at a time so rapid actions don't stack toasts over the page.
    // Detach instead of dispose: a toast still fading in has a pending Bootstrap
    // callback that would hit a disposed (null) element.
    toastContainer.querySelectorAll(".toast").forEach((existingToast) => {
      existingToast.remove();
    });

    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${isError ? "danger" : "success"} border-0`;
    toast.setAttribute("id", toastId);
    toast.setAttribute("role", isError ? "alert" : "status");
    toast.setAttribute("aria-live", isError ? "assertive" : "polite");
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

    const bootstrapToast = new bootstrap.Toast(toast, { delay: isError ? 5000 : 2500 });
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
    return `${getTierDisplayName(provider, tier)} - ${plan.label}`;
  }

  // Some tier names already start with the brand ("Disney+ Premium"), so don't repeat it.
  function getTierDisplayName(provider, tier) {
    return tier.name.startsWith(provider.planPrefix) ? tier.name : `${provider.planPrefix} ${tier.name}`;
  }

  function getShortPlanName(plan) {
    return plan.replace(/\s-\s(?:Monthly|3 Months|Yearly(?: \(Up to 8 accounts\))?)$/, "");
  }

  function formatShortDate(dateValue) {
    const date = parseDateOnly(dateValue);
    if (!date) {
      return "No date";
    }

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  function formatLongDate(dateValue) {
    const date = parseDateOnly(dateValue);
    return date
      ? date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
      : "recently";
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

  function appendCell(row, text, className = "", label = "") {
    const cell = document.createElement("td");
    cell.textContent = text;
    if (className) {
      cell.className = className;
    }
    if (label) {
      cell.setAttribute("data-label", label);
    }
    row.appendChild(cell);
  }
});
