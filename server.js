// server.js

const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


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
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
      const user = await User.findOne({ username });
      if (!user) {
          // Respond with a failure message if the user does not exist
          return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
          // Respond with a failure message if the password is incorrect
          return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      // Respond with a success message if login is successful
      res.json({ success: true, message: "Login successful" });
  } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ success: false, message: "Server error" });
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


const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model("User", UserSchema);

// Sign-up endpoint
app.post("/api/signup", async (req, res) => {
  const { username, password } = req.body;
  
  try {
      // Check if the username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
          return res.status(400).json({ success: false, message: "Username already exists" });
      }

      // Hash the password and save the user
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();

      res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
      console.error("Error during sign-up:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
      const user = await User.findOne({ username });
      if (!user) {
          return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
          return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      res.json({ success: true, message: "Login successful" });
  } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ success: false, message: "Server error" });
  }
});
