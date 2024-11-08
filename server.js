const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json()); // Make sure this is applied before any route handlers

const PORT = 3000;

 const services = [
    {
      name: "Netflix",
      hasLiveSports: false,
      hasLiveTV: false,
      plans: [
        { plan: "Basic (with ads)", price: 6.99 },
        { plan: "Standard (no ads)", price: 15.49 },
        { plan: "Premium (no ads)", price: 19.99 },
      ],
    },
    {
      name: "Disney+",
      hasLiveSports: false,
      hasLiveTV: false,
      plans: [
        { plan: "Basic (with ads)", price: 7.99 },
        { plan: "Premium (no ads)", price: 10.99 },
        { plan: "Bundle (Disney+, Hulu, ESPN+)", price: 12.99 },
      ],
    },
    {
      name: "Hulu",
      hasLiveSports: true,
      hasLiveTV: true,
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
      hasLiveSports: false,
      hasLiveTV: false,
      plans: [
        { plan: "With Ads", price: 9.99 },
        { plan: "Ad-Free", price: 15.99 },
        { plan: "Ultimate Ad-Free", price: 19.99 },
      ],
    },
    {
      name: "Amazon Prime Video",
      hasLiveSports: false,
      hasLiveTV: false,
      plans: [
        { plan: "Included with Amazon Prime", price: 14.99 },
        { plan: "Prime Video Only", price: 8.99 },
      ],
    },
    {
      name: "Apple TV+",
      hasLiveSports: false,
      hasLiveTV: false,
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
      hasLiveSports: true,
      hasLiveTV: true,
      plans: [
        { plan: "Free Tier (Limited content with ads)", price: 0 },
        { plan: "Premium (with ads)", price: 5.99 },
        { plan: "Premium Plus (no ads)", price: 11.99 },
      ],
    },
    {
      name: "Paramount+",
      hasLiveSports: true,
      hasLiveTV: false,
      plans: [
        { plan: "Essential (with ads)", price: 5.99 },
        { plan: "Premium (no ads, includes Showtime)", price: 11.99 },
      ],
    },
    {
      name: "YouTube Premium",
      hasLiveSports: false,
      hasLiveTV: false,
      plans: [
        {
          plan: "YouTube Premium (Ad-Free YouTube + YouTube Music)",
          price: 13.99,
        },
      ],
    },
    {
      name: "Discovery+",
      hasLiveSports: false,
      hasLiveTV: false,
      plans: [
        { plan: "Ad-Supported", price: 4.99 },
        { plan: "Ad-Free", price: 6.99 },
      ],
    },
  ];


app.use(express.static(path.join(__dirname)));

app.get("/api/services", (req, res) => {
 
  res.json(services);
});

app.post("/api/rate", (req, res) => {
  const { service, rating } = req.body;

  // Validate incoming data
  if (!service || !rating) {
      return res.status(400).json({ error: "Service name and rating are required" });
  }

  // Here, you would typically save the rating to a database or file
  // For demonstration, we're just logging it to the console
  console.log(`Received rating: ${rating} for service: ${service}`);

  // Send a success response back to the client
  res.json({ message: "Rating saved successfully" });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
