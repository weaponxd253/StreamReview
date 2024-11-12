// server.js

const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;
const MONGO_URI = "mongodb://localhost:27017/Stream";

// ==============================
// 1. MongoDB Connection
// ==============================
mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

// ==============================
// 2. Models
// ==============================
const ServiceSchema = new mongoose.Schema({
  name: String,
  hasLiveSports: Boolean,
  hasLiveTV: Boolean,
  plans: [{ plan: String, price: Number }]
});

const Service = mongoose.model("Service", ServiceSchema);

// ==============================
// 3. Middleware
// ==============================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ==============================
// 4. Route Handlers
// ==============================

// Fetch services from MongoDB
app.get("/api/services", async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch services" });
    }
});

// Hardcoded login endpoint (for testing purposes)
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const hardcodedUsername = "user";
    const hardcodedPassword = "password123";

    if (username === hardcodedUsername && password === hardcodedPassword) {
        res.json({ success: true, message: "Login successful" });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// Save rating (simulated functionality)
app.post("/api/rate", (req, res) => {
    const { service, rating } = req.body;

    if (!service || !rating) {
        return res.status(400).json({ error: "Service name and rating are required" });
    }

    console.log(`Received rating: ${rating} for service: ${service}`);
    res.json({ message: "Rating saved successfully" });
});

// Serve HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ==============================
// 5. Server Startup
// ==============================
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
