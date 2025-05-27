// routes/devRoutes.js
import express from "express";
import {
  generateActivityData,
  generateSleepData,
} from "../../../services/dataGenerator.js";
import mongoose from "mongoose";
const router = express.Router();

// Middleware to check environment
const checkDevEnvironment = (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({
      success: false,
      message:
        "Development routes are only available in non-production environments",
    });
  }
  next();
};

router.use(checkDevEnvironment);

/*
 * @route POST /api/dev/generate-data
 * @description Generate test data for development
 * @access Development only
 * @param {string} petId - ID of the pet
 * @param {number} [days=30] - Number of days of data to generate
 * @param {string} [dataType='activity'] - Type of data to generate
 * @returns {object} Result of data generation
 */
router.post("/generate-data", async (req, res) => {
  try {
    const { petId, days = 30, dataType = "activity" } = req.body;

    if (!petId) {
      return res.status(400).json({
        success: false,
        message: "Pet ID is required",
      });
    }

    let result;
    switch (dataType) {
      case "activity":
        result = await generateActivityData(petId, days);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported data type",
        });
    }

    res.json({
      success: true,
      data: result,
      message: `Successfully generated ${dataType} data`,
    });
  } catch (error) {
    console.error("Data generation error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating test data",
      error: error.message,
    });
  }
});

// In devRoutes.js
router.post("/generate-sleep-data", async (req, res) => {
  try {
    const { petId, days = 7 } = req.body;
    const result = await generateSleepData(petId, days);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
