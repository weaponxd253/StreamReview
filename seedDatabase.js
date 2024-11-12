const mongoose = require("mongoose");

const MONGO_URI = "mongodb://localhost:27017/Stream";

// Define the schema
const ServiceSchema = new mongoose.Schema({
    name: String,
    hasLiveSports: Boolean,
    hasLiveTV: Boolean,
    plans: [{ plan: String, price: Number }]
});

// Define the model
const Service = mongoose.model("Service", ServiceSchema);

// Sample data to insert
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
            { plan: "Hulu + Live TV (with ads)", price: 76.99 },
            { plan: "Hulu + Live TV (no ads)", price: 89.99 },
        ],
    },
    // Add additional services as needed
];

// Seed the database
async function seedDatabase() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB");

        // Clear existing data
        await Service.deleteMany({});
        console.log("Existing data cleared.");

        // Insert new data
        await Service.insertMany(services);
        console.log("Database seeded with service data.");

        mongoose.connection.close();
        console.log("Database connection closed.");
    } catch (error) {
        console.error("Error seeding database:", error);
    }
}

seedDatabase();
