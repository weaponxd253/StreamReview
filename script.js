// Global variables
let totalPrice = 0;
let selectedPlans = [];

// Elements
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

// Function to update total price
function updateTotalPrice() {
    totalPriceElem.textContent = totalPrice.toFixed(2);
}

// Function to update breakdown (selected services only)
function updatePlanBreakdown() {
    planBreakdown.innerHTML = ""; // Clear the previous list
    let monthlyTotal = 0;

    selectedPlans.forEach((plan) => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = `${plan.name}: $${plan.price.toFixed(2)} per month`;
        planBreakdown.appendChild(li);
        monthlyTotal += plan.price;
    });

    // Calculate and display totals for different periods
    const threeMonthTotal = (monthlyTotal * 3).toFixed(2);
    const sixMonthTotal = (monthlyTotal * 6).toFixed(2);
    const nineMonthTotal = (monthlyTotal * 9).toFixed(2);
    const yearlyTotal = (monthlyTotal * 12).toFixed(2);

    monthlyTotalElem.textContent = monthlyTotal.toFixed(2);
    threeMonthTotalElem.textContent = threeMonthTotal;
    sixMonthTotalElem.textContent = sixMonthTotal;
    nineMonthTotalElem.textContent = nineMonthTotal;
    yearlyTotalElem.textContent = yearlyTotal;
}

// Fetch services from the API and display
fetch("http://localhost:3000/api/services")
    .then((response) => response.json())
    .then((data) => {
        data.forEach((service) => {
            createServiceCard(service);
        });
    })
    .catch((error) => console.error("Error fetching services:", error));

// Function to create service cards dynamically
function createServiceCard(service) {
    const card = document.createElement("div");
    card.classList.add("col-md-4", "mb-4");

    const cardContent = `
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title">${service.name}</h5>
        ${service.plans
            .map(
                (plan) => `
          <div class="plan mb-3" data-service="${service.name}" data-price="${plan.price}">
            <button class="btn btn-primary add-plan" data-service="${service.name}" data-plan="${plan.plan}" data-price="${plan.price}">Add</button>
            ${plan.plan}: <span class="price">$${plan.price}/month</span>
          </div>`,
            )
            .join("")}
      </div>
    </div>`;
    card.innerHTML = cardContent;
    servicesContainer.appendChild(card);
}

// Event listener for adding/removing plans
servicesContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("add-plan")) {
        const planElem = event.target.parentElement;
        const cardElem = event.target.closest(".card");
        const planName = cardElem
            .querySelector(".card-title")
            .textContent.trim();
        const planPrice = parseFloat(planElem.dataset.price);
        const planButton = event.target; // Current clicked button

        if (isNaN(planPrice)) {
            console.error("Invalid price detected.");
            return;
        }

        // Check if the plan is already selected (i.e., remove action)
        if (planButton.classList.contains("active")) {
            // Plan is being unselected
            totalPrice -= planPrice;
            selectedPlans = selectedPlans.filter(
                (plan) => !(plan.name === planName && plan.price === planPrice),
            );

            // Update button text and state
            planButton.textContent = "Add";
            planButton.classList.remove("active");

            // Re-enable all other buttons for this service
            const buttonsForService = document.querySelectorAll(
                `button[data-service='${planName}']`,
            );
            buttonsForService.forEach((button) => {
                button.disabled = false;
                button.classList.remove("disabled");
            });
        } else {
            // Plan is being selected
            totalPrice += planPrice;
            selectedPlans.push({ name: planName, price: planPrice });

            // Update button text and state
            planButton.textContent = "Remove";
            planButton.classList.add("active");

            // Disable other buttons for this service
            const buttonsForService = document.querySelectorAll(
                `button[data-service='${planName}']`,
            );
            buttonsForService.forEach((button) => {
                if (button !== planButton) {
                    button.disabled = true;
                    button.classList.add("disabled");
                }
            });
        }

        updateTotalPrice();
    }
});

// Event listener to open modal
viewPlanBtn.addEventListener("click", function () {
    updatePlanBreakdown();

    // Generate the chart if plans are selected
    if (selectedPlans.length > 0) {
        generateChart(selectedPlans);
    }

    modal.style.display = "block";
});

// Close modal on button click or background click
closeModal.addEventListener("click", function () {
    modal.style.display = "none";
});

window.addEventListener("click", function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Add Chart.js for price distribution
let chartInstance = null;

function generateChart(selectedPlans) {
    const canvas = document.getElementById("planChart");
    if (!canvas) {
        console.error("Canvas element not found");
        return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("Unable to get canvas 2D context");
        return;
    }

    const labels = selectedPlans.map((plan) => plan.name);
    const data = selectedPlans.map((plan) => plan.price);

    // Base colors (preset colors)
    const baseColors = [
        "rgb(255, 99, 132)", // Red
        "rgb(54, 162, 235)", // Blue
        "rgb(255, 205, 86)", // Yellow
        "rgb(75, 192, 192)", // Green
        "rgb(153, 102, 255)", // Purple
        "rgb(255, 159, 64)", // Orange
        "rgb(0, 128, 128)", // Teal
        "rgb(0, 255, 127)", // Spring Green
        "rgb(255, 69, 0)", // Red-Orange
        "rgb(106, 90, 205)", // Slate Blue
    ];

    // Function to generate a random RGB color
    function getRandomColor() {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // Generate dynamic colors for all selected plans
    const dynamicColors = selectedPlans.map((_, index) => {
        // If we have a predefined color, use it; otherwise, generate a random color
        return baseColors[index] || getRandomColor();
    });

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: "Price Distribution",
                data: data,
                backgroundColor: dynamicColors, // Assign dynamic or preset colors
                hoverOffset: 4,
            },
        ],
    };

    const config = {
        type: "doughnut",
        data: chartData,
    };

    if (chartInstance) {
        chartInstance.destroy(); // Destroy previous chart to avoid overlap
    }

    chartInstance = new Chart(ctx, config);
}
