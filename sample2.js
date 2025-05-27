#include <WiFi.h>
#include <PubSubClient.h>
#include <DallasTemperature.h>
#include <OneWire.h>
#include <TinyGPSPlus.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <time.h>
#include <ArduinoJson.h>

// Wi-Fi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT settings
const char* mqtt_server = "192.168.1.100";
const int mqtt_port = 1883;
const char* mqtt_topic = "tagcly/pet/PET123/sensors";
const char* pet_id = "PET123";
const char* device_id = "ESP32_001";

// Sensor pins
#define ONE_WIRE_BUS 4 // DS18B20 on GPIO 4
#define I2S_WS 15      // SPH0645/INMP441 word select
#define I2S_SD 32      // SPH0645/INMP441 data
#define I2S_SCK 14     // SPH0645/INMP441 clock

// Sensor objects
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature ds18b20(&oneWire);
TinyGPSPlus gps;
Adafruit_MPU6050 mpu;
WiFiClient espClient;
PubSubClient client(espClient);

// NTP for timestamp
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 5.5 * 3600; // IST: +05:30
char timestamp[32];

// Step counter variables
int stepCount = 0;
float lastAccel = 0;

// Audio processing
int32_t audioSamples[512];
int sampleIndex = 0;

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  ds18b20.begin();
  Serial2.begin(9600, SERIAL_8N1, 16, 17); // NEO-6M on GPIO 16/17
  Wire.begin();
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050");
    while (1);
  }
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  configTime(gmtOffset_sec, 0, ntpServer);
}

void setup_wifi() {
  delay(10);
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
}

void reconnect() {
  while (!client.connected()) {
    Serial.println("Attempting MQTT connection...");
    if (client.connect("ESP32Client")) {
      Serial.println("Connected to MQTT");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      delay(5000);
    }
  }
}

String getTimestamp() {
  time_t now;
  time(&now);
  strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%S+05:30", localtime(&now));
  return String(timestamp);
}

float readTemperature() {
  ds18b20.requestTemperatures();
  float temp = ds18b20.getTempCByIndex(0);
  return (temp >= 37.0 && temp <= 41.0) ? temp : -1;
}

int readHeartRate() {
  // Placeholder: Replace with pulse sensor logic
  return random(60, 181); // Simulate 60-180 BPM
}

void updateSteps(float accel) {
  if (abs(accel - lastAccel) > 1.0) {
    stepCount++;
  }
  lastAccel = accel;
}

String detectVocalization() {
  // Placeholder: Analyze audioSamples
  int maxAmplitude = 0;
  for (int i = 0; i < 512; i++) {
    if (abs(audioSamples[i]) > maxAmplitude) maxAmplitude = abs(audioSamples[i]);
  }
  if (maxAmplitude > 1000) return "bark";
  if (maxAmplitude > 500) return "whine";
  return "none";
}

int calculateLoudness() {
  int maxAmplitude = 0;
  for (int i = 0; i < 512; i++) {
    if (abs(audioSamples[i]) > maxAmplitude) maxAmplitude = abs(audioSamples[i]);
  }
  return map(maxAmplitude, 0, 32768, 0, 100);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Read sensors
  float temperature = readTemperature();
  int heart_rate = readHeartRate();
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  updateSteps(a.acceleration.z);
  float activity_intensity = abs(a.acceleration.x) + abs(a.acceleration.y) + abs(a.acceleration.z);
  activity_intensity = constrain(activity_intensity / 10.0, 0, 10);
  
  float latitude = 0, longitude = 0;
  while (Serial2.available() > 0) {
    if (gps.encode(Serial2.read())) {
      if (gps.location.isValid()) {
        latitude = gps.location.lat();
        longitude = gps.location.lng();
      }
    }
  }

  // Placeholder audio read
  audioSamples[sampleIndex++] = random(-1000, 1000); // Simulate audio
  if (sampleIndex >= 512) sampleIndex = 0;
  String vocalization = detectVocalization();
  int loudness = calculateLoudness();
  String status = (temperature == -1 || !gps.location.isValid()) ? "error" : "ok";

  // Create JSON
  StaticJsonDocument<256> doc;
  doc["timestamp"] = getTimestamp();
  doc["pet_id"] = pet_id;
  doc["device_id"] = device_id;
  if (temperature != -1) doc["temperature"] = temperature;
  doc["heart_rate"] = heart_rate;
  doc["steps"] = stepCount;
  doc["activity_intensity"] = activity_intensity;
  if (gps.location.isValid()) {
    doc["latitude"] = latitude;
    doc["longitude"] = longitude;
  }
  doc["vocalization"] = vocalization;
  doc["loudness"] = loudness;
  doc["status"] = status;

  char buffer[256];
  serializeJson(doc, buffer);

  // Publish to MQTT
  if (client.publish(mqtt_topic, buffer)) {
    Serial.println("Data sent: " + String(buffer));
  } else {
    Serial.println("Failed to send data");
  }

  delay(60000); // Send every minute
}










// 📦 Import Required Packages
import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import connectCloudinary from "./config/cloudinary.js"; // Cloudinary Configuration

//ml
import devRoutes from "./routes/api/v1/devRoutes.js";

// 📌 Import Routes
import userRoutes from "./routes/api/v1/userRoutes.js";
import orderRoutes from "./routes/api/v1/orderRoutes.js";
import collarRoutes from "./routes/api/v1/collarRoutes.js";
import petRoutes from "./routes/api/v1/petRoutes.js";
import healthRoutes from "./routes/api/v1/analytics/healthRoutes.js";
// import sensorRoutes from "./routes/sensorRoutes.js";

// 📌 Load Environment Variables
dotenv.config();
const port = process.env.PORT || 5000;

// 🔗 Connect to MongoDB
connectDB();

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
app.use("/api/pets", healthRoutes);
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



const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  pet_id: { type: String, required: true },
  device_id: { type: String, required: true },
  temperature: { type: Number, min: 37.0, max: 41.0 },
  heart_rate: { type: Number, min: 60, max: 180 },
  steps: { type: Number, min: 0 },
  activity_intensity: { type: Number, min: 0, max: 10 },
  latitude: { type: Number },
  longitude: { type: Number },
  vocalization: { type: String, enum: ['bark', 'whine', 'none'] },
  loudness: { type: Number, min: 0, max: 100 },
  status: { type: String, enum: ['ok', 'error'], required: true },
  day: { type: Number, min: 1, max: 31 },
  daily_cum_steps: { type: Number, min: 0 },
  movement_pattern: { type: String, enum: ['resting', 'walking', 'playing', 'running'] },
  pet_status: { type: String, enum: ['home', 'walking', 'lost'] },
  distance_from_home: { type: Number, min: 0 },
  stress_level: { type: Number, min: 0, max: 10 },
  health_score: { type: Number, min: 0, max: 100 },
  activity_level: { type: String, enum: ['sedentary', 'moderate', 'active'] },
}, { timestamps: true });

sensorSchema.index({ timestamp: -1 });
sensorSchema.index({ pet_id: 1 });
sensorSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('Sensor', sensorSchema);



const ingestionService = require('../services/ingestionService');
const Sensor = require('../models/database/sensorModel');

class SensorController {
  async createSensorData(req, res) {
    try {
      await ingestionService.ingestSensorData(req.body);
      res.status(201).json({ message: 'Data saved successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getSensorData(req, res) {
    try {
      const { pet_id } = req.params;
      const { start, end } = req.query;
      const query = { pet_id };
      if (start && end) {
        query.timestamp = { $gte: new Date(start), $lte: new Date(end) };
      }
      const data = await Sensor.find(query).sort({ timestamp: -1 }).limit(100);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new SensorController();



const mqtt = require('mqtt');
const ingestionService = require('./ingestionService');

class MQTTService {
  constructor() {
    this.client = mqtt.connect('mqtt://192.168.1.100:1883');
    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.client.subscribe('tagcly/pet/+/sensors', (err) => {
        if (!err) console.log('Subscribed to tagcly/pet/+/sensors');
      });
    });
    this.client.on('message', async (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        await ingestionService.ingestSensorData(data);
        console.log(`Processed MQTT message from ${topic}`);
      } catch (error) {
        console.error('Error processing MQTT message:', error);
      }
    });
    this.client.on('error', (error) => {
      console.error('MQTT error:', error);
    });
  }
}

module.exports = new MQTTService();



const Sensor = require('../models/database/sensorModel');
const Pet = require('../models/database/petModel');
const gpsService = require('./gpsService');
const healthFeatures = require('./healthFeatures');
const healthPredictionService = require('./healthPredictionService');
const activityPredictionService = require('./activityPredictionService');
const behaviorPredictionService = require('./behaviorPredictionService');
const emergencyPredictionService = require('./emergencyPredictionService');
const aggregationService = require('./aggregationService');

class IngestionService {
  async ingestSensorData(data) {
    // Validate required fields
    if (!data.timestamp || !data.pet_id || !data.device_id || !data.status) {
      throw new Error('Missing required fields');
    }

    // Validate field ranges
    if (data.temperature && (data.temperature < 37.0 || data.temperature > 41.0)) {
      throw new Error('Invalid temperature range');
    }
    if (data.heart_rate && (data.heart_rate < 60 || data.heart_rate > 180)) {
      throw new Error('Invalid heart rate range');
    }
    if (data.steps && data.steps < 0) {
      throw new Error('Steps cannot be negative');
    }
    if (data.activity_intensity && (data.activity_intensity < 0 || data.activity_intensity > 10)) {
      throw new Error('Invalid activity intensity range');
    }
    if (data.loudness && (data.loudness < 0 || data.loudness > 100)) {
      throw new Error('Invalid loudness range');
    }
    if (data.vocalization && !['bark', 'whine', 'none'].includes(data.vocalization)) {
      throw new Error('Invalid vocalization value');
    }
    if (!['ok', 'error'].includes(data.status)) {
      throw new Error('Invalid status value');
    }

    // Prepare sensor data
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
      vocalization: data.vocalization || 'none',
      loudness: data.loudness || 0,
      status: data.status,
    };

    // Compute derived metrics
    sensorData.day = sensorData.timestamp.getDate();
    sensorData.distance_from_home = gpsService.calculateDistanceFromHome(
      sensorData.latitude,
      sensorData.longitude
    );
    sensorData.pet_status = await emergencyPredictionService.predictPetStatus(sensorData);
    sensorData.stress_level = healthFeatures.calculateStressLevel(sensorData);
    sensorData.health_score = healthPredictionService.calculateHealthScore(sensorData);
    sensorData.activity_level = activityPredictionService.predictActivityLevel(sensorData);
    sensorData.movement_pattern = behaviorPredictionService.predictMovementPattern(sensorData);
    sensorData.daily_cum_steps = await aggregationService.calculateDailyCumulativeSteps(
      sensorData.pet_id,
      sensorData.day,
      sensorData.steps
    );

    // Save to sensors collection
    const sensor = new Sensor(sensorData);
    await sensor.save();

    // Update pet status in pets collection
    await Pet.findOneAndUpdate(
      { pet_id: sensorData.pet_id },
      { current_status: sensorData.pet_status },
      { upsert: true }
    );
  }
}

module.exports = new IngestionService();


class GPSService {
  calculateDistanceFromHome(latitude, longitude) {
    if (!latitude || !longitude) return 0;

    const homeLat = 40.7128; // Example: New York City
    const homeLon = -74.0060;

    const R = 6371; // Earth's radius in km
    const dLat = (latitude - homeLat) * Math.PI / 180;
    const dLon = (longitude - homeLon) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(homeLat * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    return parseFloat(distance.toFixed(3));
  }
}

module.exports = new GPSService();



class HealthFeatures {
  calculateStressLevel(data) {
    let score = 0;
    if (data.heart_rate) {
      score += (data.heart_rate - 60) / (180 - 60) * 3; // Normalize to 0-3
    }
    if (data.temperature) {
      score += (data.temperature - 37) / (41 - 37) * 3; // Normalize to 0-3
    }
    if (data.activity_intensity) {
      score += data.activity_intensity * 0.4; // Scale to 0-4
    }
    return parseFloat(Math.min(score, 10).toFixed(1));
  }
}

module.exports = new HealthFeatures();





class HealthPredictionService {
  calculateHealthScore(data) {
    let score = 100;
    if (data.temperature) {
      const tempDeviation = Math.abs(data.temperature - 39) / 2; // Optimal: 39°C
      score -= tempDeviation * 30;
    }
    if (data.heart_rate) {
      const hrDeviation = Math.abs(data.heart_rate - 100) / 60; // Optimal: 100 BPM
      score -= hrDeviation * 30;
    }
    if (data.stress_level) {
      score -= data.stress_level * 4;
    }
    return parseFloat(Math.max(0, Math.min(score, 100)).toFixed(1));
  }
}

module.exports = new HealthPredictionService();


class ActivityPredictionService {
  predictActivityLevel(data) {
    if (!data.activity_intensity) return 'sedentary';
    if (data.activity_intensity > 7) return 'active';
    if (data.activity_intensity > 3) return 'moderate';
    return 'sedentary';
  }
}

module.exports = new ActivityPredictionService();



class BehaviorPredictionService {
  predictMovementPattern(data) {
    if (!data.steps || !data.activity_intensity) return 'resting';
    if (data.activity_intensity > 8 && data.steps > 100) return 'running';
    if (data.activity_intensity > 5 && data.steps > 50) return 'playing';
    if (data.activity_intensity > 2 && data.steps > 10) return 'walking';
    return 'resting';
  }
}

module.exports = new BehaviorPredictionService();



class EmergencyPredictionService {
  async predictPetStatus(data) {
    if (!data.distance_from_home) return 'home';
    if (data.distance_from_home > 0.5) return 'lost';
    if (data.distance_from_home > 0.1) return 'walking';
    return 'home';
  }
}

module.exports = new EmergencyPredictionService();


const Sensor = require('../models/database/sensorModel');

class AggregationService {
  async calculateDailyCumulativeSteps(pet_id, day, newSteps) {
    const startOfDay = new Date();
    startOfDay.setDate(day);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await Sensor.aggregate([
      {
        $match: {
          pet_id,
          timestamp: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          totalSteps: { $sum: '$steps' },
        },
      },
    ]);

    const totalSteps = (result.length > 0 ? result[0].totalSteps : 0) + (newSteps || 0);
    return totalSteps;
  }
}

module.exports = new AggregationService();