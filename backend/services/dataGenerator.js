import mongoose from "mongoose";
import SensorData from "../models/database/sensorModel.js";
import {
  getHeartRateByState,
  getRespirationByState,
  getMovementByState,
  getQualityScoreByState,
} from "../utils/sleepHelpers.js";

// services/dataGenerator.js
export async function generateActivityData(petId, days = 30) {
  const activityData = [];
  const now = new Date();

  for (let day = 0; day < days; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(now);
      timestamp.setDate(now.getDate() - day);
      timestamp.setHours(hour);

      // Create realistic daily pattern
      let activityValue;
      if (hour >= 7 && hour <= 10) {
        // Morning peak
        activityValue = 60 + Math.random() * 30; // 60-90
      } else if (hour >= 17 && hour <= 20) {
        // Evening peak
        activityValue = 50 + Math.random() * 40; // 50-90
      } else if (hour >= 23 || hour <= 5) {
        // Night
        activityValue = 5 + Math.random() * 15; // 5-20
      } else {
        // Daytime
        activityValue = 30 + Math.random() * 20; // 30-50
      }

      activityData.push({
        petId: new mongoose.Types.ObjectId(petId),
        deviceId: `collar-${petId.slice(0, 8)}`,
        dataType: "activity",
        timestamp: timestamp,
        location: {
          type: "Point",
          coordinates: [
            -122.431297 + Math.random() * 0.01,
            37.773972 + Math.random() * 0.01,
          ],
        },
        activity: {
          intensity: Math.round(activityValue), // Ensure numeric value
          steps: Math.round(activityValue * 10), // Add steps for realism
        },
        sourceDevice: "collar",
        metadata: {
          batteryLevel: Math.floor(70 + Math.random() * 30),
          signalStrength: Math.floor(3 + Math.random() * 2),
        },
      });
    }
  }

  await SensorData.insertMany(activityData);
  return {
    success: true,
    count: activityData.length,
    message: `Generated ${activityData.length} activity data points`,
  };
}

// services/dataGenerator.js
export async function generateSleepData(petId, days = 7) {
  const sleepData = [];
  const now = new Date();

  for (let day = 0; day < days; day++) {
    const date = new Date(now);
    date.setDate(now.getDate() - day);

    // Generate 2-4 sleep sessions per day
    const sessions = 2 + Math.floor(Math.random() * 3);

    for (let i = 0; i < sessions; i++) {
      const state = ["light", "deep", "rem", "disturbed"][
        Math.floor(Math.random() * 4)
      ];
      const duration =
        state === "deep" ? 60 + Math.random() * 60 : 30 + Math.random() * 90;

      sleepData.push({
        petId: new mongoose.Types.ObjectId(petId),
        deviceId: `collar-${petId.slice(-6)}`,
        dataType: "sleep",
        timestamp: new Date(date.setHours(20 + i * 2, 0, 0, 0)),
        location: {
          type: "Point",
          coordinates: [
            -122.431297 + Math.random() * 0.01,
            37.773972 + Math.random() * 0.01,
          ],
        },
        sleep: {
          state: state,
          duration: duration,
          heartRate: getHeartRateByState(state),
          respirationRate: getRespirationByState(state),
          movementCount: getMovementByState(state),
          qualityScore: getQualityScoreByState(state),
        },
        sourceDevice: "collar",
      });
    }
  }

  try {
    await SensorData.insertMany(sleepData);
    return {
      success: true,
      count: sleepData.length,
      message: `Generated ${sleepData.length} sleep records`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
