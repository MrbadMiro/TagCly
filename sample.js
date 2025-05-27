// services/mqtt/mqttService.js
const mqtt = require('mqtt');
const logger = require('../../utils/logger');
const ingestionService = require('../data/ingestionService');
const validationService = require('../data/validationService');

class MQTTService {
  constructor() {
    this.client = null;
    this.topic = 'tagcly/pet/+/sensors';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectInterval = 5000;
    
    this.connect();
  }

  connect() {
    try {
      this.client = mqtt.connect('mqtt://localhost:1883', {
        clientId: `tagcly-backend-${Math.random().toString(16).substr(2, 8)}`,
        clean: true,
        connectTimeout: 30000,
        reconnectPeriod: this.reconnectInterval,
      });

      this.client.on('connect', () => {
        logger.info('Connected to MQTT broker');
        this.reconnectAttempts = 0;
        
        this.client.subscribe(this.topic, { qos: 1 }, (err) => {
          if (err) {
            logger.error('MQTT subscription error:', err);
          } else {
            logger.info(`Subscribed to topic: ${this.topic}`);
          }
        });
      });

      this.client.on('message', async (topic, message) => {
        try {
          const data = JSON.parse(message.toString());
          logger.info(`Received data on ${topic}:`, data);

          // Validate data
          const isValid = await validationService.validateSensorData(data);
          if (!isValid) {
            logger.error('Invalid sensor data received:', data);
            return;
          }

          // Ingest data
          await ingestionService.ingestSensorData(data);
          logger.info(`Data ingested successfully for pet ${data.pet_id}`);
          
        } catch (error) {
          logger.error('Error processing MQTT message:', error);
        }
      });

      this.client.on('error', (error) => {
        logger.error('MQTT connection error:', error);
      });

      this.client.on('close', () => {
        logger.warn('MQTT connection closed');
      });

      this.client.on('reconnect', () => {
        this.reconnectAttempts++;
        logger.info(`MQTT reconnecting... (attempt ${this.reconnectAttempts})`);
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          logger.error('Max MQTT reconnection attempts reached');
          this.client.end();
        }
      });

    } catch (error) {
      logger.error('Failed to create MQTT client:', error);
    }
  }

  publish(topic, message) {
    if (this.client && this.client.connected) {
      this.client.publish(topic, JSON.stringify(message), { qos: 1 });
      return true;
    }
    return false;
  }

  disconnect() {
    if (this.client) {
      this.client.end();
    }
  }
}

module.exports = new MQTTService();

// ============================================================================

// models/database/sensorModel.js
const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  timestamp: { 
    type: Date, 
    required: true,
    index: true 
  },
  pet_id: { 
    type: String, 
    required: true,
    index: true 
  },
  device_id: { 
    type: String, 
    required: true 
  },
  temperature: { 
    type: Number, 
    min: 37.0, 
    max: 41.0,
    required: true 
  },
  heart_rate: { 
    type: Number, 
    min: 60, 
    max: 180,
    required: true 
  },
  steps: { 
    type: Number, 
    min: 0,
    required: true 
  },
  activity_intensity: { 
    type: Number, 
    min: 0, 
    max: 10,
    required: true 
  },
  latitude: { 
    type: Number,
    min: -90,
    max: 90,
    required: true 
  },
  longitude: { 
    type: Number,
    min: -180,
    max: 180,
    required: true 
  },
  vocalization: { 
    type: String, 
    enum: ['bark', 'whine', 'none'],
    required: true 
  },
  loudness: { 
    type: Number, 
    min: 0, 
    max: 100,
    required: true 
  },
  status: { 
    type: String, 
    enum: ['ok', 'error'],
    required: true 
  },
  distance_from_home: { 
    type: Number, 
    min: 0,
    default: 0 
  },
  stress_level: { 
    type: Number, 
    min: 0, 
    max: 10,
    default: 0 
  },
  health_score: { 
    type: Number, 
    min: 0, 
    max: 100,
    default: 100 
  },
}, { 
  timestamps: true,
  collection: 'sensor_data'
});

// Compound index for efficient queries
sensorSchema.index({ pet_id: 1, timestamp: -1 });
sensorSchema.index({ timestamp: -1 });

// Add method to calculate derived metrics
sensorSchema.methods.calculateDerivedMetrics = function() {
  // Calculate stress level based on heart rate and activity
  const normalHeartRate = 80;
  const heartRateStress = Math.abs(this.heart_rate - normalHeartRate) / 20;
  const activityStress = this.activity_intensity > 7 ? (this.activity_intensity - 7) / 3 : 0;
  this.stress_level = Math.min(10, heartRateStress + activityStress);

  // Calculate health score based on multiple factors
  let healthScore = 100;
  
  // Temperature factor
  const normalTemp = 38.5;
  const tempDeviation = Math.abs(this.temperature - normalTemp);
  healthScore -= tempDeviation * 10;
  
  // Heart rate factor
  if (this.heart_rate < 70 || this.heart_rate > 120) {
    healthScore -= 10;
  }
  
  // Activity factor
  if (this.activity_intensity < 2) {
    healthScore -= 5; // Low activity penalty
  }
  
  // Status factor
  if (this.status === 'error') {
    healthScore -= 20;
  }
  
  this.health_score = Math.max(0, Math.min(100, healthScore));
};

module.exports = mongoose.model('Sensor', sensorSchema);

// ============================================================================

// routes/api/sensorRoutes.js
const express = require('express');
const router = express.Router();
const ingestionService = require('../../services/data/ingestionService');
const validationService = require('../../services/data/validationService');
const authMiddleware = require('../../middlewares/authMiddleware');
const logger = require('../../utils/logger');
const Sensor = require('../../models/database/sensorModel');

// POST /api/sensors/data - Ingest sensor data via HTTP
router.post('/data', authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    logger.info('Received sensor data via HTTP:', data);

    // Validate data
    const isValid = await validationService.validateSensorData(data);
    if (!isValid) {
      logger.error('Invalid sensor data:', data);
      return res.status(400).json({ 
        error: 'Invalid data',
        message: 'Sensor data failed validation'
      });
    }

    // Ingest data
    const result = await ingestionService.ingestSensorData(data);
    logger.info('Sensor data ingested via HTTP:', { pet_id: data.pet_id, device_id: data.device_id });
    
    res.status(200).json({ 
      message: 'Data received successfully',
      id: result._id,
      timestamp: result.timestamp
    });
    
  } catch (error) {
    logger.error('Error in sensor data route:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to process sensor data'
    });
  }
});

// GET /api/sensors/:petId/latest - Get latest sensor data for a pet
router.get('/:petId/latest', authMiddleware, async (req, res) => {
  try {
    const { petId } = req.params;
    
    const latestData = await Sensor.findOne({ pet_id: petId })
      .sort({ timestamp: -1 })
      .limit(1);
    
    if (!latestData) {
      return res.status(404).json({ 
        error: 'No data found',
        message: `No sensor data found for pet ${petId}`
      });
    }
    
    res.json(latestData);
    
  } catch (error) {
    logger.error('Error fetching latest sensor data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/sensors/:petId/history - Get historical sensor data
router.get('/:petId/history', authMiddleware, async (req, res) => {
  try {
    const { petId } = req.params;
    const { limit = 100, startDate, endDate } = req.query;
    
    let query = { pet_id: petId };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const history = await Sensor.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json({
      count: history.length,
      data: history
    });
    
  } catch (error) {
    logger.error('Error fetching sensor history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

// ============================================================================

// services/data/validationService.js
const logger = require('../../utils/logger');

class ValidationService {
  async validateSensorData(data) {
    try {
      // Check if data exists
      if (!data || typeof data !== 'object') {
        logger.error('Data is not an object');
        return false;
      }

      // Check required fields
      const requiredFields = [
        'timestamp', 'pet_id', 'device_id', 'temperature', 
        'heart_rate', 'steps', 'activity_intensity', 
        'latitude', 'longitude', 'vocalization', 'loudness', 'status'
      ];
      
      for (const field of requiredFields) {
        if (!data.hasOwnProperty(field)) {
          logger.error(`Missing required field: ${field}`);
          return false;
        }
      }

      // Validate timestamp
      const timestamp = new Date(data.timestamp);
      if (isNaN(timestamp.getTime())) {
        logger.error('Invalid timestamp format');
        return false;
      }

      // Check if timestamp is not too far in future (allow 1 hour ahead)
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      if (timestamp > oneHourFromNow) {
        logger.error('Timestamp is too far in the future');
        return false;
      }

      // Validate string fields
      if (typeof data.pet_id !== 'string' || data.pet_id.length === 0) {
        logger.error('Invalid pet_id');
        return false;
      }
      
      if (typeof data.device_id !== 'string' || data.device_id.length === 0) {
        logger.error('Invalid device_id');
        return false;
      }

      // Validate numeric ranges
      const validations = [
        { field: 'temperature', min: 37.0, max: 41.0 },
        { field: 'heart_rate', min: 60, max: 180 },
        { field: 'steps', min: 0, max: 100000 },
        { field: 'activity_intensity', min: 0, max: 10 },
        { field: 'latitude', min: -90, max: 90 },
        { field: 'longitude', min: -180, max: 180 },
        { field: 'loudness', min: 0, max: 100 }
      ];

      for (const validation of validations) {
        const value = data[validation.field];
        if (typeof value !== 'number' || isNaN(value)) {
          logger.error(`${validation.field} is not a valid number`);
          return false;
        }
        if (value < validation.min || value > validation.max) {
          logger.error(`${validation.field} is out of range: ${value} (expected ${validation.min}-${validation.max})`);
          return false;
        }
      }

      // Validate enums
      if (!['bark', 'whine', 'none'].includes(data.vocalization)) {
        logger.error('Invalid vocalization value');
        return false;
      }

      if (!['ok', 'error'].includes(data.status)) {
        logger.error('Invalid status value');
        return false;
      }

      return true;
      
    } catch (error) {
      logger.error('Validation error:', error);
      return false;
    }
  }

  validatePetId(petId) {
    return typeof petId === 'string' && petId.length > 0 && petId.length <= 50;
  }

  validateDeviceId(deviceId) {
    return typeof deviceId === 'string' && deviceId.length > 0 && deviceId.length <= 50;
  }
}

module.exports = new ValidationService();

// ============================================================================

// services/data/ingestionService.js
const Sensor = require('../../models/database/sensorModel');
const gpsService = require('../external/gpsService');
const logger = require('../../utils/logger');

class IngestionService {
  constructor() {
    // Default home coordinates (replace with actual coordinates)
    this.defaultHomeLat = 40.7128; // New York City
    this.defaultHomeLon = -74.0060;
  }

  async ingestSensorData(data) {
    try {
      // Calculate distance from home
      data.distance_from_home = gpsService.calculateDistance(
        this.defaultHomeLat, 
        this.defaultHomeLon, 
        data.latitude, 
        data.longitude
      );

      // Create sensor data document
      const sensorData = new Sensor(data);
      
      // Calculate derived metrics
      sensorData.calculateDerivedMetrics();
      
      // Save to database
      const savedData = await sensorData.save();
      
      logger.info(`Sensor data saved for pet ${data.pet_id}:`, {
        id: savedData._id,
        timestamp: savedData.timestamp,
        temperature: savedData.temperature,
        heart_rate: savedData.heart_rate,
        distance_from_home: savedData.distance_from_home,
        health_score: savedData.health_score
      });

      return savedData;
      
    } catch (error) {
      logger.error('Error ingesting sensor data:', error);
      throw error;
    }
  }

  async getLatestData(petId) {
    try {
      return await Sensor.findOne({ pet_id: petId })
        .sort({ timestamp: -1 })
        .limit(1);
    } catch (error) {
      logger.error('Error getting latest sensor data:', error);
      throw error;
    }
  }

  async getHistoricalData(petId, startDate, endDate, limit = 100) {
    try {
      let query = { pet_id: petId };
      
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }
      
      return await Sensor.find(query)
        .sort({ timestamp: -1 })
        .limit(limit);
        
    } catch (error) {
      logger.error('Error getting historical sensor data:', error);
      throw error;
    }
  }
}

module.exports = new IngestionService();

// ============================================================================

// services/external/gpsService.js
class GPSService {
  /**
   * Calculate distance between two GPS coordinates using Haversine formula
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    // Validate input coordinates
    if (!this.isValidCoordinate(lat1, lon1) || !this.isValidCoordinate(lat2, lon2)) {
      return 0;
    }

    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance * 1000) / 1000; // Round to 3 decimal places
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees 
   * @returns {number}
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Validate GPS coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {boolean}
   */
  isValidCoordinate(lat, lon) {
    return (
      typeof lat === 'number' && 
      typeof lon === 'number' &&
      lat >= -90 && 
      lat <= 90 && 
      lon >= -180 && 
      lon <= 180 &&
      !isNaN(lat) && 
      !isNaN(lon)
    );
  }

  /**
   * Check if coordinates indicate the pet is at home
   * @param {number}