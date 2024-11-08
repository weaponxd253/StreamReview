// =========================
// Global Variables & Elements
// =========================

let totalPrice = 0;
let selectedPlans = [];
let chartInstance = null;

const servicesContainer = document.getElementById("servicesContainer");
const totalPriceElem = document.getElementById("totalPrice");
const planBreakdown = document.getElementById("planBreakdown");
const monthlyTotalElem = document.getElementById("monthlyTotal");
const threeMonthTotalElem = document.getElementById("threeMonthTotal");
const sixMonthTotalElem = document.getElementById("sixMonthTotal");
const nineMonthTotalElem = document.getElementById("nineMonthTotal");
const yearlyTotalElem = document.getElementById("yearlyTotal");
const modal = document.getElementById("planModal");
const viewPlanBtn = document.getElementById("viewPlanBtn");
const closeModal = document.querySelector(".close");
const darkModeToggle = document.getElementById("darkModeToggle");
const sidebar = document.getElementById("sidebar");
const openSidebarBtn = document.getElementById("openSidebarBtn");
const closeBtn = document.getElementById("closeBtn");
const overlay = document.getElementById("overlay");

// =========================
// Sidebar Functionality
// =========================

openSidebarBtn.addEventListener("click", () => {
    sidebar.classList.add("open-sidebar");
    document.body.classList.add("sidebar-open");
    overlay.classList.add("overlay-active");
    openSidebarBtn.setAttribute("aria-expanded", "true");
});

closeBtn.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

function closeSidebar() {
    sidebar.classList.remove("open-sidebar");
    document.body.classList.remove("sidebar-open");
    overlay.classList.remove("overlay-active");
    openSidebarBtn.setAttribute("aria-expanded", "false");
}

// =========================
// Theme Handling
// =========================

if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    darkModeToggle.querySelector("i").classList.replace("fa-moon", "fa-sun");
} else {
    darkModeToggle.querySelector("i").classList.replace("fa-sun", "fa-moon");
}

darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const icon = darkModeToggle.querySelector("i");

    if (document.body.classList.contains("dark-mode")) {
        icon.classList.replace("fa-moon", "fa-sun");
        localStorage.setItem("darkMode", "enabled");
    } else {
        icon.classList.replace("fa-sun", "fa-moon");
        localStorage.setItem("darkMode", "disabled");
    }
});

// =========================
// Data Fetching & Display
// =========================

fetch("http://localhost:3000/api/services")
    .then((response) => response.json())
    .then((data) => {
        data.forEach((service) => createServiceCard(service));
        initializeStarRatings();
    })
    .catch((error) => console.error("Error fetching services:", error));

function createServiceCard(service) {
    const sanitizedServiceName = sanitizeServiceName(service.name);
    const card = document.createElement("div");
    card.classList.add("col-md-4", "mb-4");

    const cardContent = `
        <div class="card h-100">
            <div class="card-body">
                <h5 class="card-title">${service.name}</h5>
                <div class="star-rating" data-service="${service.name}">
                    <i class="fas fa-star" data-value="1"></i>
                    <i class="fas fa-star" data-value="2"></i>
                    <i class="fas fa-star" data-value="3"></i>
                    <i class="fas fa-star" data-value="4"></i>
                    <i class="fas fa-star" data-value="5"></i>
                </div>
                <span class="rating-value">0/5</span>
                ${service.plans
                    .map((plan) => `
                        <div class="plan mb-3" data-service="${sanitizedServiceName}" data-price="${plan.price}">
                            <button class="btn btn-primary add-plan" data-service="${sanitizedServiceName}" data-plan="${plan.plan}" data-price="${plan.price}">
                                <i class="fas fa-plus"></i> Add
                            </button>
                            ${plan.plan}: <span class="price">$${plan.price}/month</span>
                        </div>`).join("")}
            </div>
        </div>`;
    card.innerHTML = cardContent;
    servicesContainer.appendChild(card);
}




// =========================
// Event Listeners
// =========================

servicesContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("add-plan")) {
        handlePlanSelection(event.target);
    }
});

viewPlanBtn.addEventListener("click", () => {
    updatePlanBreakdown();
    if (selectedPlans.length > 0) {
        generateChart(selectedPlans);
    }
    modal.style.display = "block";
});

closeModal.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", (event) => {
    if (event.target === modal) modal.style.display = "none";
});

// =========================
// Helper Functions
// =========================

function sanitizeServiceName(name) {
    return name.replace(/\s+/g, '-').toLowerCase();
}

function handlePlanSelection(planButton) {
    const planElem = planButton.parentElement;
    const cardElem = planButton.closest(".card");
    const planName = cardElem.querySelector(".card-title").textContent.trim();
    const sanitizedPlanName = sanitizeServiceName(planName);
    const planPrice = parseFloat(planElem.dataset.price);

    if (isNaN(planPrice)) {
        console.error("Invalid price detected.");
        return;
    }

    if (planButton.classList.contains("active")) {
        deselectPlan(sanitizedPlanName, planPrice, planButton);
    } else {
        selectPlan(sanitizedPlanName, planPrice, planButton);
    }
    updateTotalPrice();
}

function selectPlan(sanitizedPlanName, planPrice, planButton) {
    totalPrice += planPrice;
    selectedPlans.push({ name: sanitizedPlanName, price: planPrice });
    planButton.innerHTML = '<i class="fas fa-check"></i> Remove';
    planButton.classList.add("active");

    const buttonsForService = document.querySelectorAll(`button[data-service='${sanitizedPlanName}']`);
    buttonsForService.forEach((button) => {
        if (button !== planButton) {
            button.disabled = true;
            button.classList.add("disabled");
        }
    });
}

function deselectPlan(sanitizedPlanName, planPrice, planButton) {
    totalPrice -= planPrice;
    selectedPlans = selectedPlans.filter((plan) => !(plan.name === sanitizedPlanName && plan.price === planPrice));
    planButton.innerHTML = '<i class="fas fa-plus"></i> Add';
    planButton.classList.remove("active");

    const buttonsForService = document.querySelectorAll(`button[data-service='${sanitizedPlanName}']`);
    buttonsForService.forEach((button) => {
        button.disabled = false;
        button.classList.remove("disabled");
    });
}

// =========================
// Main Functions
// =========================

function updateTotalPrice() {
    totalPriceElem.textContent = totalPrice.toFixed(2);
}

function updatePlanBreakdown() {
    planBreakdown.innerHTML = "";
    let monthlyTotal = 0;

    selectedPlans.forEach((plan) => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = `${plan.name}: $${plan.price.toFixed(2)} per month`;
        planBreakdown.appendChild(li);
        monthlyTotal += plan.price;
    });

    monthlyTotalElem.textContent = monthlyTotal.toFixed(2);
    threeMonthTotalElem.textContent = (monthlyTotal * 3).toFixed(2);
    sixMonthTotalElem.textContent = (monthlyTotal * 6).toFixed(2);
    nineMonthTotalElem.textContent = (monthlyTotal * 9).toFixed(2);
    yearlyTotalElem.textContent = (monthlyTotal * 12).toFixed(2);
}

function initializeStarRatings() {
    const starRatings = document.querySelectorAll(".star-rating");

    starRatings.forEach(rating => {
        const stars = rating.querySelectorAll("i");
        const ratingValueDisplay = rating.nextElementSibling;

        stars.forEach(star => {
            star.addEventListener("click", () => {
                const ratingValue = star.getAttribute("data-value");

                ratingValueDisplay.textContent = `${ratingValue}/5`;

                stars.forEach(s => s.classList.remove("selected"));

                for (let i = 0; i < ratingValue; i++) {
                    stars[i].classList.add("selected");
                }

                saveRating(rating.dataset.service, ratingValue);
            });
        });
    });
}

function saveRating(service, rating) {
    fetch("http://localhost:3000/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, rating }),
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => console.log("Rating saved:", data))
    .catch((error) => console.error("Error saving rating:", error));
}



// =========================
// Chart Generation
// =========================

function generateChart(selectedPlans) {
    const canvas = document.getElementById("planChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const labels = selectedPlans.map(plan => plan.name);
    const data = selectedPlans.map(plan => plan.price);
    const baseColors = ["rgb(255, 99, 132)", "rgb(54, 162, 235)", "rgb(255, 205, 86)", "rgb(75, 192, 192)", "rgb(153, 102, 255)", "rgb(255, 159, 64)", "rgb(0, 128, 128)", "rgb(0, 255, 127)", "rgb(255, 69, 0)", "rgb(106, 90, 205)"];
    const dynamicColors = selectedPlans.map((_, index) => baseColors[index] || getRandomColor());

    const chartData = {
        labels: labels,
        datasets: [{ label: "Price Distribution", data: data, backgroundColor: dynamicColors, hoverOffset: 4 }]
    };

    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, { type: "doughnut", data: chartData });
}

function getRandomColor() {
    return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
}
