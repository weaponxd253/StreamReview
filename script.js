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
// Initial Setup on DOMContentLoaded
// =========================
document.addEventListener("DOMContentLoaded", () => {
    setupLoginModal();
    setupSidebar();
    setupDarkModeToggle();
    fetchAndDisplayServices();
    setupPlanModal();
});

// =========================
// Login Modal Functionality
// =========================
function setupLoginModal() {
    const loginIconButton = document.getElementById("loginIconButton");
    const loginModal = document.getElementById("loginModal");
    const closeLoginModal = document.getElementById("closeLoginModal");

    loginIconButton.addEventListener("click", () => loginModal.style.display = "block");
    closeLoginModal.addEventListener("click", () => loginModal.style.display = "none");

    window.addEventListener("click", (event) => {
        if (event.target === loginModal) loginModal.style.display = "none";
    });

    document.getElementById("loginForm").addEventListener("submit", handleLogin);
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.success) {
            alert("Login successful");
            document.getElementById("loginModal").style.display = "none";
            document.getElementById("sidebarContainer").style.display = "block";
            openSidebarBtn.style.display = "flex";
            document.getElementById("loginIconButton").style.display = "none";
        } else {
            alert("Login failed: " + data.message);
        }
    })
    .catch((error) => console.error("Error logging in:", error));
}

// =========================
// Sidebar Functionality
// =========================
function setupSidebar() {
    openSidebarBtn.addEventListener("click", openSidebar);
    closeBtn.addEventListener("click", closeSidebar);
    overlay.addEventListener("click", closeSidebar);
}

function openSidebar() {
    sidebar.classList.add("open-sidebar");
    document.body.classList.add("sidebar-open");
    overlay.classList.add("overlay-active");
    openSidebarBtn.setAttribute("aria-expanded", "true");
}

function closeSidebar() {
    sidebar.classList.remove("open-sidebar");
    document.body.classList.remove("sidebar-open");
    overlay.classList.remove("overlay-active");
    openSidebarBtn.setAttribute("aria-expanded", "false");
}

// =========================
// Theme Toggle Functionality
// =========================
function setupDarkModeToggle() {
    if (localStorage.getItem("darkMode") === "enabled") {
        activateDarkMode();
    }

    darkModeToggle.addEventListener("click", toggleDarkMode);
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const icon = darkModeToggle.querySelector("i");

    if (document.body.classList.contains("dark-mode")) {
        icon.classList.replace("fa-moon", "fa-sun");
        localStorage.setItem("darkMode", "enabled");
    } else {
        icon.classList.replace("fa-sun", "fa-moon");
        localStorage.setItem("darkMode", "disabled");
    }
}

function activateDarkMode() {
    document.body.classList.add("dark-mode");
    darkModeToggle.querySelector("i").classList.replace("fa-moon", "fa-sun");
}

// =========================
// Data Fetching and Display
// =========================
function fetchAndDisplayServices() {
    fetch("http://localhost:3000/api/services")
        .then((response) => response.json())
        .then((data) => {
            data.forEach(createServiceCard);
            initializeStarRatings();
        })
        .catch((error) => console.error("Error fetching services:", error));
}

function createServiceCard(service) {
    const sanitizedServiceName = sanitizeServiceName(service.name);
    const card = document.createElement("div");
    card.classList.add("col-md-4", "mb-4");
    card.innerHTML = generateCardContent(service, sanitizedServiceName);
    servicesContainer.appendChild(card);
}

function generateCardContent(service, sanitizedServiceName) {
    return `
        <div class="card h-100">
            <div class="card-body">
                <h5 class="card-title">${service.name}</h5>
                <div class="star-rating" data-service="${service.name}">
                    ${Array.from({ length: 5 }, (_, i) => `<i class="fas fa-star" data-value="${i + 1}"></i>`).join('')}
                </div>
                <span class="rating-value">0/5</span>
                ${service.plans.map(plan => generatePlanContent(plan, sanitizedServiceName)).join("")}
            </div>
        </div>`;
}

function generatePlanContent(plan, sanitizedServiceName) {
    return `
        <div class="plan mb-3" data-service="${sanitizedServiceName}" data-price="${plan.price}">
            <button class="btn btn-primary add-plan" data-service="${sanitizedServiceName}" data-plan="${plan.plan}" data-price="${plan.price}">
                <i class="fas fa-plus"></i> Add
            </button>
            ${plan.plan}: <span class="price">$${plan.price}/month</span>
        </div>`;
}

// =========================
// Event Listeners for Plans and Modals
// =========================
function setupPlanModal() {
    servicesContainer.addEventListener("click", (event) => {
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
}

// =========================
// Plan Selection and Management
// =========================
function handlePlanSelection(planButton) {
    const planElem = planButton.parentElement;
    const planName = planElem.closest(".card").querySelector(".card-title").textContent.trim();
    const sanitizedPlanName = sanitizeServiceName(planName);
    const planPrice = parseFloat(planElem.dataset.price);

    if (isNaN(planPrice)) {
        console.error("Invalid price detected.");
        return;
    }

    planButton.classList.contains("active") ? deselectPlan(sanitizedPlanName, planPrice, planButton) : selectPlan(sanitizedPlanName, planPrice, planButton);
    updateTotalPrice();
}

function selectPlan(sanitizedPlanName, planPrice, planButton) {
    totalPrice += planPrice;
    selectedPlans.push({ name: sanitizedPlanName, price: planPrice });
    updateButtonToSelected(planButton, sanitizedPlanName);
}

function deselectPlan(sanitizedPlanName, planPrice, planButton) {
    totalPrice -= planPrice;
    selectedPlans = selectedPlans.filter(plan => !(plan.name === sanitizedPlanName && plan.price === planPrice));
    updateButtonToDeselected(planButton, sanitizedPlanName);
}

function updateButtonToSelected(button, serviceName) {
    button.innerHTML = '<i class="fas fa-check"></i> Remove';
    button.classList.add("active");
}

function updateButtonToDeselected(button, serviceName) {
    button.innerHTML = '<i class="fas fa-plus"></i> Add';
    button.classList.remove("active");
}

// =========================
// Price and Plan Breakdown
// =========================
function updateTotalPrice() {
    totalPriceElem.textContent = totalPrice.toFixed(2);
}

function updatePlanBreakdown() {
    planBreakdown.innerHTML = selectedPlans.map(plan => `<li class="list-group-item">${plan.name}: $${plan.price.toFixed(2)} per month</li>`).join("");
    updateTotals();
}

function updateTotals() {
    const monthlyTotal = selectedPlans.reduce((sum, plan) => sum + plan.price, 0);
    monthlyTotalElem.textContent = monthlyTotal.toFixed(2);
    threeMonthTotalElem.textContent = (monthlyTotal * 3).toFixed(2);
    sixMonthTotalElem.textContent = (monthlyTotal * 6).toFixed(2);
    nineMonthTotalElem.textContent = (monthlyTotal * 9).toFixed(2);
    yearlyTotalElem.textContent = (monthlyTotal * 12).toFixed(2);
}

// =========================
// Star Ratings
// =========================
function initializeStarRatings() {
    document.querySelectorAll(".star-rating").forEach(rating => {
        rating.querySelectorAll("i").forEach(star => {
            star.addEventListener("click", () => updateRating(rating, star));
        });
    });
}

function updateRating(rating, star) {
    const ratingValue = star.getAttribute("data-value");
    rating.nextElementSibling.textContent = `${ratingValue}/5`;
    Array.from(rating.querySelectorAll("i")).forEach((s, i) => s.classList.toggle("selected", i < ratingValue));
    saveRating(rating.dataset.service, ratingValue);
}

function saveRating(service, rating) {
    fetch("http://localhost:3000/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, rating })
    }).then(response => {
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        return response.json();
    }).then(data => console.log("Rating saved:", data))
    .catch(error => console.error("Error saving rating:", error));
}

// =========================
// Chart Generation
// =========================
function generateChart(selectedPlans) {
    const canvas = document.getElementById("planChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const chartData = prepareChartData(selectedPlans);

    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, { type: "doughnut", data: chartData });
}

function prepareChartData(selectedPlans) {
    const labels = selectedPlans.map(plan => plan.name);
    const data = selectedPlans.map(plan => plan.price);
    const dynamicColors = selectedPlans.map(getRandomColor);

    return {
        labels,
        datasets: [{ label: "Price Distribution", data, backgroundColor: dynamicColors, hoverOffset: 4 }]
    };
}

function getRandomColor() {
    return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
}

// =========================
// Helper Functions
// =========================
function sanitizeServiceName(name) {
    return name.replace(/\s+/g, '-').toLowerCase();
}
