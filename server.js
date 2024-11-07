const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
const PORT = 3000;

// Streaming services data
const services = [
  {
    name: "Netflix",
    plans: [
      { plan: "Basic (with ads)", price: 6.99 },
      { plan: "Standard (no ads)", price: 15.49 },
      { plan: "Premium (no ads)", price: 19.99 },
    ],
  },
  {
    name: "Disney+",
    plans: [
      { plan: "Basic (with ads)", price: 7.99 },
      { plan: "Premium (no ads)", price: 10.99 },
      { plan: "Bundle (Disney+, Hulu, ESPN+)", price: 12.99 },
    ],
  },
  {
    name: "Hulu",
    plans: [
      { plan: "Basic (with ads)", price: 7.99 },
      { plan: "Premium (no ads)", price: 14.99 },
      {
        plan: "Hulu + Live TV (with ads, includes Disney+ and ESPN+)",
        price: 76.99,
      },
      { plan: "Hulu + Live TV (no ads)", price: 89.99 },
    ],
  },
  {
    name: "HBO Max (now Max)",
    plans: [
      { plan: "With Ads", price: 9.99 },
      { plan: "Ad-Free", price: 15.99 },
      { plan: "Ultimate Ad-Free", price: 19.99 },
    ],
  },
  {
    name: "Amazon Prime Video",
    plans: [
      { plan: "Included with Amazon Prime", price: 14.99 },
      { plan: "Prime Video Only", price: 8.99 },
    ],
  },
  {
    name: "Apple TV+",
    plans: [
      { plan: "Standard Plan", price: 9.99 },
      {
        plan: "Apple One Bundle (includes Apple Music, iCloud, and Apple TV+)",
        price: 16.95,
      },
    ],
  },
  {
    name: "Peacock",
    plans: [
      { plan: "Free Tier (Limited content with ads)", price: 0 },
      { plan: "Premium (with ads)", price: 5.99 },
      { plan: "Premium Plus (no ads)", price: 11.99 },
    ],
  },
  {
    name: "Paramount+",
    plans: [
      { plan: "Essential (with ads)", price: 5.99 },
      { plan: "Premium (no ads, includes Showtime)", price: 11.99 },
    ],
  },
  {
    name: "YouTube Premium",
    plans: [
      {
        plan: "YouTube Premium (Ad-Free YouTube + YouTube Music)",
        price: 13.99,
      },
    ],
  },
  {
    name: "Discovery+",
    plans: [
      { plan: "Ad-Supported", price: 4.99 },
      { plan: "Ad-Free", price: 6.99 },
    ],
  },
];

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Root route to serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API endpoint to return services
app.get("/api/services", (req, res) => {
  res.json(services); // Return the services array
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});