// 📦 Import Required Packages
import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import connectCloudinary from "./config/cloudinary.js"; // Cloudinary Configuration
import mqttService from "./services/external/mqttService.js";

//ml
import devRoutes from "./routes/api/v1/devRoutes.js";

// 📌 Import Routes
import userRoutes from "./routes/api/v1/userRoutes.js";
import orderRoutes from "./routes/api/v1/orderRoutes.js";
import collarRoutes from "./routes/api/v1/collarRoutes.js";
import petRoutes from "./routes/api/v1/petRoutes.js";
// import healthRoutes from "./routes/api/v1/analytics/healthRoutes.js";
import sensorRoutes from "./routes/api/v1/sensorRoutes.js";

// import sensorRoutes from "./routes/sensorRoutes.js";

// 📌 Load Environment Variables
dotenv.config();
const port = process.env.PORT || 5000;

// 🔗 Connect to MongoDB
connectDB();

// MQTT Service
mqttService;

// 🚀 Initialize Express App
const app = express();

// 📌 Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(cookieParser()); // Parse Cookies

// ✅ Connect to Cloudinary
connectCloudinary();

// Add this with your other routes (only in development)
if (process.env.NODE_ENV !== "production") {
  app.use("/api/dev", devRoutes);
}

// ✅ API Routes
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes); // Uncommented to enable the orders route
app.use("/api/collars", collarRoutes);
app.use("/api/pets", petRoutes); // Uncommented to enable the pets route
// app.use("/api/pets", healthRoutes);
app.use("/api/sensors", sensorRoutes);
// app.use("/api/sensors", sensorRoutes);

// ✅ PayPal Payment Route
app.get("/api/config/paypal", (req, res) => {
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});

// ✅ Handle Errors (404)
app.use((req, res, next) => {
  res.status(404).json({ error: "API Not Found" });
});

// 🚀 Start Server
app.listen(port, () => console.log(`✅ Server running on port: ${port}`));
