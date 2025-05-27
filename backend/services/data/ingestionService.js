import Sensor from "../../models/database/sensorModel.js";
import Pet from "../../models/database/petModel.js";
import gpsService from "../external/gpsService.js";
import healthFeatures from "../ml/features/healthFeatures.js";
import healthPredictionService from "../ml/predictions/healthPredictionService.js";
import activityPredictionService from "../ml/predictions/activityPredictionService.js";
import behaviorPredictionService from "../ml/predictions/behaviorPredictionService.js";
import emergencyPredictionService from "../ml/predictions/emergencyPredictionService.js";
import aggregationService from "./aggregationService.js";

class IngestionService {
  async ingestSensorData(data) {
    console.log("🔄 Starting sensor data ingestion...");

    try {
      // Enhanced validation with detailed logging
      this.validateRequiredFields(data);
      this.validateFieldRanges(data);

      // Prepare sensor data
      const sensorData = this.prepareSensorData(data);

      // Compute derived metrics
      await this.computeDerivedMetrics(sensorData);

      // Save to database
      await this.saveSensorData(sensorData);
      await this.updatePetStatus(sensorData);

      console.log(
        `✅ Successfully ingested sensor data for pet ${data.pet_id}`
      );
    } catch (error) {
      console.error(`❌ Error ingesting sensor data: ${error.message}`);
      throw error;
    }
  }

  validateRequiredFields(data) {
    const requiredFields = ["timestamp", "pet_id", "device_id", "status"];
    const missing = requiredFields.filter((field) => !data[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }

    console.log("✅ Required fields validation passed");
  }

  validateFieldRanges(data) {
    const validations = [
      {
        field: "temperature",
        value: data.temperature,
        min: 37.0,
        max: 41.0,
        required: false,
      },
      {
        field: "heart_rate",
        value: data.heart_rate,
        min: 60,
        max: 180,
        required: false,
      },
      {
        field: "steps",
        value: data.steps,
        min: 0,
        max: null,
        required: false,
      },
      {
        field: "activity_intensity",
        value: data.activity_intensity,
        min: 0,
        max: 10,
        required: false,
      },
      {
        field: "loudness",
        value: data.loudness,
        min: 0,
        max: 100,
        required: false,
      },
    ];

    for (const validation of validations) {
      if (validation.value !== undefined && validation.value !== null) {
        if (validation.min !== null && validation.value < validation.min) {
          throw new Error(
            `${validation.field} value ${validation.value} is below minimum ${validation.min}`
          );
        }
        if (validation.max !== null && validation.value > validation.max) {
          throw new Error(
            `${validation.field} value ${validation.value} is above maximum ${validation.max}`
          );
        }
      }
    }

    // Validate enum fields
    if (
      data.vocalization &&
      !["bark", "whine", "none"].includes(data.vocalization)
    ) {
      throw new Error(`Invalid vocalization value: ${data.vocalization}`);
    }

    if (!["ok", "error"].includes(data.status)) {
      throw new Error(`Invalid status value: ${data.status}`);
    }

    console.log("✅ Field range validation passed");
  }

  prepareSensorData(data) {
    const sensorData = {
      timestamp: new Date(data.timestamp),
      pet_id: data.pet_id,
      device_id: data.device_id,
      temperature: data.temperature || null,
      heart_rate: data.heart_rate || null,
      steps: data.steps || 0,
      activity_intensity: data.activity_intensity || 0,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      vocalization: data.vocalization || "none",
      loudness: data.loudness || 0,
      status: data.status,
    };

    console.log("✅ Sensor data prepared");
    return sensorData;
  }

  async computeDerivedMetrics(sensorData) {
    console.log("🔄 Computing derived metrics...");

    try {
      sensorData.day = sensorData.timestamp.getDate();

      sensorData.distance_from_home = gpsService.calculateDistanceFromHome(
        sensorData.latitude,
        sensorData.longitude
      );

      sensorData.pet_status = await emergencyPredictionService.predictPetStatus(
        sensorData
      );

      sensorData.stress_level = healthFeatures.calculateStressLevel(sensorData);

      sensorData.health_score =
        healthPredictionService.calculateHealthScore(sensorData);

      sensorData.activity_level =
        activityPredictionService.predictActivityLevel(sensorData);

      sensorData.movement_pattern =
        behaviorPredictionService.predictMovementPattern(sensorData);

      sensorData.daily_cum_steps =
        await aggregationService.calculateDailyCumulativeSteps(
          sensorData.pet_id,
          sensorData.day,
          sensorData.steps
        );

      console.log("✅ Derived metrics computed");
    } catch (error) {
      console.error("❌ Error computing derived metrics:", error.message);
      // Continue with basic data if derived metrics fail
      sensorData.day = sensorData.timestamp.getDate();
      sensorData.distance_from_home = 0;
      sensorData.pet_status = "home";
      sensorData.stress_level = 0;
      sensorData.health_score = 100;
      sensorData.activity_level = "moderate";
      sensorData.movement_pattern = "resting";
      sensorData.daily_cum_steps = sensorData.steps;
    }
  }

  async saveSensorData(sensorData) {
    try {
      const sensor = new Sensor(sensorData);
      await sensor.save();
      console.log("✅ Sensor data saved to database");
    } catch (error) {
      console.error("❌ Error saving sensor data:", error.message);
      throw new Error(`Database save failed: ${error.message}`);
    }
  }

  async updatePetStatus(sensorData) {
    try {
      await Pet.findOneAndUpdate(
        { pet_id: sensorData.pet_id },
        { current_status: sensorData.pet_status },
        { upsert: true }
      );
      console.log("✅ Pet status updated");
    } catch (error) {
      console.error("❌ Error updating pet status:", error.message);
      // Don't throw here as this is not critical
    }
  }
}

export default new IngestionService();
