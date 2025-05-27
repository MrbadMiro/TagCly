import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true },
    pet_id: { type: String, required: true },
    device_id: { type: String, required: true },
    temperature: { type: Number, min: 37.0, max: 41.0 },
    heart_rate: { type: Number, min: 60, max: 180 },
    steps: { type: Number, min: 0 },
    activity_intensity: { type: Number, min: 0, max: 10 },
    latitude: { type: Number },
    longitude: { type: Number },
    vocalization: { type: String, enum: ["bark", "whine", "none"] },
    loudness: { type: Number, min: 0, max: 100 },
    status: { type: String, enum: ["ok", "error"], required: true },
    day: { type: Number, min: 1, max: 31 },
    daily_cum_steps: { type: Number, min: 0 },
    movement_pattern: {
      type: String,
      enum: ["resting", "walking", "playing", "running"],
    },
    pet_status: { type: String, enum: ["home", "walking", "lost"] },
    distance_from_home: { type: Number, min: 0 },
    stress_level: { type: Number, min: 0, max: 10 },
    health_score: { type: Number, min: 0, max: 100 },
    activity_level: { type: String, enum: ["sedentary", "moderate", "active"] },
  },
  { timestamps: true }
);

sensorSchema.index({ timestamp: -1 });
sensorSchema.index({ pet_id: 1 });
sensorSchema.index({ latitude: 1, longitude: 1 });

export default mongoose.model("Sensor", sensorSchema);
