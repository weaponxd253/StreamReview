document.addEventListener("DOMContentLoaded", () => {
  const subscriptionsKey = "userSubscriptions";

  // Load existing subscriptions from localStorage on page load
  loadSubscriptions();
  
  

  // Add click event listener to add/remove subscription buttons
  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-subscription")) {
      const plan = e.target.getAttribute("data-plan");
      const price = e.target.getAttribute("data-price");
      const duration = e.target.getAttribute("data-duration");

      if (!plan || !price || !duration) {
        alert("Error: Subscription data is incomplete. Please try again.");
        return;
      }

      if (e.target.classList.contains("added")) {
        // If already added, remove the subscription
        removeSubscription(plan, e.target);
      } else {
        // Otherwise, add the subscription
        addSubscription({ plan, price, duration }, e.target);
      }
    }

    // Handle clicks on remove buttons in the subscription list
    if (e.target.classList.contains("remove-subscription")) {
      const plan = e.target.getAttribute("data-plan");

      if (!plan) {
        alert("Error: Unable to remove subscription. Missing plan data.");
        return;
      }

      removeSubscription(plan);
    }
  });

function addSubscription(subscription, buttonElement) {
    const subscriptions = JSON.parse(localStorage.getItem(subscriptionsKey)) || [];

    if (!subscriptions.some(s => s.plan === subscription.plan)) {
        subscriptions.push(subscription);
        localStorage.setItem(subscriptionsKey, JSON.stringify(subscriptions));
        showToast(`Subscription added: ${subscription.plan}`);

        toggleAddIcon(buttonElement, true);
        highlightSubscription(subscription.plan, true);
    } else {
        showToast(`Subscription already exists: ${subscription.plan}`, "error");
    }

    displaySubscriptions(subscriptions);
}


function removeSubscription(plan, buttonElement = null) {
    let subscriptions = JSON.parse(localStorage.getItem(subscriptionsKey)) || [];

    subscriptions = subscriptions.filter(subscription => subscription.plan !== plan);
    localStorage.setItem(subscriptionsKey, JSON.stringify(subscriptions));

    showToast(`Subscription removed: ${plan}`);
    displaySubscriptions(subscriptions);

    if (buttonElement) {
        toggleAddIcon(buttonElement, false);
    }

    highlightSubscription(plan, false);
}
  
  function highlightSubscription(plan, isHighlighted) {
    const subscriptionElement = document.querySelector(`.add-subscription[data-plan="${plan}"]`);
    
    if (subscriptionElement) {
        const listItem = subscriptionElement.closest(".list-group-item");
        if (listItem) {
            if (isHighlighted) {
                listItem.classList.add("selected-subscription");
            } else {
                listItem.classList.remove("selected-subscription");
            }
        }
    }
}



  function toggleAddIcon(buttonElement, isAdded) {
    if (isAdded) {
      buttonElement.classList.add("added", "icon-minus");
      buttonElement.classList.remove("fa-square-plus", "icon-plus");
      buttonElement.classList.add("fa-square-minus");
      buttonElement.setAttribute("title", "Remove Subscription");
    } else {
      buttonElement.classList.remove("added", "icon-minus");
      buttonElement.classList.add("fa-square-plus", "icon-plus");
      buttonElement.classList.remove("fa-square-minus");
      buttonElement.setAttribute("title", "Add Subscription");
    }
  }

  function loadSubscriptions() {
    const subscriptions =
      JSON.parse(localStorage.getItem(subscriptionsKey)) || [];
    displaySubscriptions(subscriptions);

    // Sync the dropdown icons with the current subscriptions
    syncDropdownIcons(subscriptions);
  }

  function syncDropdownIcons(subscriptions) {
    const addButtons = document.querySelectorAll(".add-subscription");
    addButtons.forEach((button) => {
      const plan = button.getAttribute("data-plan");
      if (subscriptions.some((s) => s.plan === plan)) {
        toggleAddIcon(button, true); // Set to "Remove"
      } else {
        toggleAddIcon(button, false); // Set to "Add"
      }
    });
  }

  function displaySubscriptions(subscriptions) {
    const subscriptionList = document.getElementById("subscriptionList");
    const emptyState = document.getElementById("emptyState");

    // Clear the current content
    subscriptionList.innerHTML = "";

    // Check if subscriptions are empty
    if (subscriptions.length === 0) {
      emptyState.style.display = "block";
      subscriptionList.style.display = "none";

      // Clear the price comparison if there are no subscriptions
      const breakdownContainer = document.getElementById("priceBreakdown");
      breakdownContainer.innerHTML = "";
      return;
    }

    emptyState.style.display = "none";
    subscriptionList.style.display = "block";

    let totalPrice = 0;

    // Create a smaller summary list inside the breakdown
    const summaryList = document.createElement("ul");
    summaryList.classList.add("list-group", "summary-list");

    subscriptions.forEach((subscription) => {
      totalPrice += parseFloat(subscription.price); // Calculate total price

      // Create a smaller list item for the summary
      const summaryItem = document.createElement("li");
      summaryItem.classList.add("list-group-item", "py-2", "px-3");
      summaryItem.innerHTML = `
      <strong>${subscription.plan}</strong> - $${subscription.price} (${subscription.duration})
    `;

      summaryList.appendChild(summaryItem);
    });

    // Display the price breakdown
    const priceBreakdown = document.createElement("div");
    priceBreakdown.classList.add("price-breakdown", "p-3", "text-center");
    priceBreakdown.innerHTML = `
    <h6><strong>Price Breakdown</strong></h6>
    <p>Total Subscriptions: <strong>${subscriptions.length}</strong></p>
    <p>Total Cost: <strong>$${totalPrice.toFixed(2)}</strong></p>
  `;

    // Append the smaller list to the breakdown
    priceBreakdown.appendChild(summaryList);

    // Render the breakdown only
    subscriptionList.appendChild(priceBreakdown);

    // Call the comparison table display function
    displayPriceComparison(subscriptions);
  }

  function calculatePriceComparison(subscriptionPlans) {
    return subscriptionPlans.map((plan) => {
      const monthlyCost = parseFloat(plan.price); // Monthly price
      const isMonthly = plan.duration === "1 Month";
      const isThreeMonth = plan.duration === "3 Months";
      const isYearly = plan.duration === "Yearly";

      // Calculate the costs for each duration
      const costFor3Months = isMonthly
        ? (monthlyCost * 3).toFixed(2)
        : isThreeMonth
        ? monthlyCost.toFixed(2)
        : "N/A";
      const costForYearly = isMonthly
        ? (monthlyCost * 12).toFixed(2)
        : isThreeMonth
        ? (monthlyCost * 4).toFixed(2)
        : isYearly
        ? monthlyCost.toFixed(2)
        : "N/A";

      return {
        name: plan.plan, // Plan name
        duration: plan.duration, // Plan duration
        monthlyCost: isMonthly ? `$${monthlyCost.toFixed(2)}` : "N/A",
        threeMonthCost: costFor3Months !== "N/A" ? `$${costFor3Months}` : "N/A",
        yearlyCost: costForYearly !== "N/A" ? `$${costForYearly}` : "N/A"
      };
    });
  }

  function displayPriceComparison(subscriptionPlans) {
    const comparisonData = calculatePriceComparison(subscriptionPlans);
    const breakdownContainer = document.getElementById("priceBreakdown");

    if (!comparisonData.length) {
      breakdownContainer.innerHTML = "";
      return;
    }

    let comparisonTable = `
    <table class="table table-bordered text-center">
      <thead>
        <tr>
          <th>Plan</th>
          <th>Month-to-Month</th>
          <th>3-Month Subscription</th>
          <th>Yearly Subscription</th>
        </tr>
      </thead>
      <tbody>
  `;

    // Find the best yearly value
    let minYearlyCost = Infinity;
    comparisonData.forEach((data) => {
      const yearlyCost =
        parseFloat(data.yearlyCost.replace("$", "")) || Infinity;
      if (yearlyCost < minYearlyCost) {
        minYearlyCost = yearlyCost;
      }
    });

    comparisonData.forEach((data) => {
      const yearlyCost =
        parseFloat(data.yearlyCost.replace("$", "")) || Infinity;
      const isBestValue = yearlyCost === minYearlyCost;

      comparisonTable += `
      <tr>
        <td>${data.name}</td>
        <td class="${data.monthlyCost === "N/A" ? "na" : ""}">${
        data.monthlyCost
      }</td>
        <td class="${data.threeMonthCost === "N/A" ? "na" : ""}">${
        data.threeMonthCost
      }</td>
        <td class="${
          isBestValue ? "best-value" : data.yearlyCost === "N/A" ? "na" : ""
        }">
          ${data.yearlyCost}
        </td>
      </tr>
    `;
    });

    comparisonTable += `
      </tbody>
    </table>
  `;

    // Add savings highlight if yearly subscriptions exist
    const hasYearly = comparisonData.some((data) => data.yearlyCost !== "N/A");
    const savingsHighlight = hasYearly
      ? `
    <div class="savings-highlight text-center mt-3">
      <p><strong>Save money by opting for longer-term subscriptions!</strong></p>
    </div>
  `
      : "";

    breakdownContainer.innerHTML = comparisonTable + savingsHighlight;
  }
  
document.addEventListener("DOMContentLoaded", () => {
  const planDetails = {
    essential: {
      title: "PlayStation Plus Essential",
      description: `
        <p><strong>This is the foundational tier, providing core benefits to enhance your gaming experience:</strong></p>
        <ul>
          <li><strong>Online Multiplayer Access:</strong> Play online with friends and other players.</li>
          <li><strong>Monthly Games:</strong> Access to PS4 and PS5 games each month.</li>
          <li><strong>Exclusive Discounts:</strong> Special deals in the PlayStation Store.</li>
          <li><strong>Cloud Storage:</strong> 100 GB for your game saves.</li>
        </ul>
        <p><strong>Pricing:</strong> Monthly: $9.99 | Quarterly: $24.99 | Yearly: $79.99</p>
      `,
    },
    extra: {
      title: "PlayStation Plus Extra",
      description: `
        <p><strong>Building upon the Essential tier, the Extra plan offers additional perks:</strong></p>
        <ul>
          <li><strong>Game Catalog:</strong> Access up to 400 PS4 and PS5 games.</li>
          <li><strong>Ubisoft+ Classics:</strong> A curated selection of Ubisoft titles.</li>
        </ul>
        <p><strong>Pricing:</strong> Monthly: $14.99 | Quarterly: $39.99 | Yearly: $134.99</p>
      `,
    },
    premium: {
      title: "PlayStation Plus Premium",
      description: `
        <p><strong>Offering all benefits of Essential and Extra tiers, plus exclusive features:</strong></p>
        <ul>
          <li><strong>Classics Catalog:</strong> Stream or download games from older PlayStation generations.</li>
          <li><strong>Game Trials:</strong> Try new games before buying.</li>
          <li><strong>Cloud Streaming:</strong> Play on PS4, PS5, or PC.</li>
        </ul>
        <p><strong>Pricing:</strong> Monthly: $17.99 | Quarterly: $49.99 | Yearly: $159.99</p>
      `,
    },
  };

  // Attach click event for question marks
  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("psQuestion")) {
      const plan = e.target.getAttribute("data-plan");
      const planDetail = planDetails[plan];
      if (planDetail) {
        document.getElementById("offcanvasTitle").textContent = planDetail.title;
        document.getElementById("offcanvasContent").innerHTML = planDetail.description;
      }
    }
  });
});



  function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toastContainer");

    // Create a unique ID for the toast
    const toastId = `toast-${Date.now()}`;

    // Create toast element
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${
      type === "error" ? "danger" : "success"
    } border-0`;
    toast.setAttribute("id", toastId);
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    // Toast content
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    // Append toast to the container
    toastContainer.appendChild(toast);

    // Initialize the toast (Bootstrap method)
    const bootstrapToast = new bootstrap.Toast(toast);

    // Show the toast
    bootstrapToast.show();

    // Automatically remove the toast from the DOM when hidden
    toast.addEventListener("hidden.bs.toast", () => {
      toast.remove();
    });
  }
});
