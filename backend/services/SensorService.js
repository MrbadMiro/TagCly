// const mongoose = require("mongoose");
// const SensorModel = require("../models/sensorModel");
// const logger = require("../utils/logger");
// const { validateSensorData } = require("../utils/validation");

// /**
//  * Service for handling sensor data from IoT devices
//  */
// class SensorService {
//   /**
//    * Save incoming sensor data to MongoDB
//    * @param {Object} sensorData - The sensor data to save
//    * @returns {Promise<Object>} - The saved sensor document
//    */
//   async saveSensorData(sensorData) {
//     try {
//       // Validate the incoming sensor data
//       const { isValid, errors } = validateSensorData(sensorData);
//       if (!isValid) {
//         logger.warn(`Invalid sensor data: ${errors.join(", ")}`);
//         return null;
//       }

//       // Create and save the sensor data document
//       const sensorDocument = new SensorModel({
//         collarId: sensorData.collarId,
//         sensorType: sensorData.sensorType,
//         value: sensorData.value,
//         timestamp: sensorData.timestamp || new Date(),
//         metadata: sensorData.metadata || {},
//       });

//       const savedData = await sensorDocument.save();
//       logger.info(`Saved sensor data: ${savedData._id}`);
//       return savedData;
//     } catch (error) {
//       logger.error("Error saving sensor data:", error);
//       throw error;
//     }
//   }

//   /**
//    * Get sensor data for a specific collar
//    * @param {string} collarId - The ID of the collar
//    * @param {string} sensorType - Optional sensor type filter
//    * @param {Object} timeRange - Optional time range filter { start, end }
//    * @returns {Promise<Array>} - Array of sensor data documents
//    */
//   async getSensorData(collarId, sensorType = null, timeRange = {}) {
//     try {
//       const query = { collarId };

//       // Add sensor type filter if provided
//       if (sensorType) {
//         query.sensorType = sensorType;
//       }

//       // Add time range filter if provided
//       if (timeRange.start || timeRange.end) {
//         query.timestamp = {};
//         if (timeRange.start) {
//           query.timestamp.$gte = new Date(timeRange.start);
//         }
//         if (timeRange.end) {
//           query.timestamp.$lte = new Date(timeRange.end);
//         }
//       }

//       // Execute query and return results
//       return await SensorModel.find(query).sort({ timestamp: -1 }).limit(1000);
//     } catch (error) {
//       logger.error("Error retrieving sensor data:", error);
//       throw error;
//     }
//   }

//   /**
//    * Get the latest sensor reading for a specific collar and sensor type
//    * @param {string} collarId - The ID of the collar
//    * @param {string} sensorType - The sensor type
//    * @returns {Promise<Object>} - The latest sensor reading
//    */
//   async getLatestReading(collarId, sensorType) {
//     try {
//       return await SensorModel.findOne({
//         collarId,
//         sensorType,
//       }).sort({ timestamp: -1 });
//     } catch (error) {
//       logger.error(`Error getting latest ${sensorType} reading:`, error);
//       throw error;
//     }
//   }

//   /**
//    * Get aggregated sensor data for analytics
//    * @param {string} collarId - The ID of the collar
//    * @param {string} sensorType - The sensor type
//    * @param {string} timeFrame - The time frame for aggregation (hour, day, week)
//    * @returns {Promise<Array>} - Array of aggregated data
//    */
//   async getAggregatedData(collarId, sensorType, timeFrame = "day") {
//     try {
//       const now = new Date();
//       let startDate;

//       // Determine start date based on time frame
//       switch (timeFrame) {
//         case "hour":
//           startDate = new Date(now.getTime() - 60 * 60 * 1000);
//           break;
//         case "day":
//           startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
//           break;
//         case "week":
//           startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//           break;
//         default:
//           startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
//       }

//       // Determine appropriate aggregation time unit
//       let timeUnit;
//       if (timeFrame === "hour") {
//         timeUnit = { minute: { $minute: "$timestamp" } };
//       } else if (timeFrame === "day") {
//         timeUnit = { hour: { $hour: "$timestamp" } };
//       } else {
//         timeUnit = { day: { $dayOfWeek: "$timestamp" } };
//       }

//       // Run aggregation pipeline
//       return await SensorModel.aggregate([
//         {
//           $match: {
//             collarId,
//             sensorType,
//             timestamp: { $gte: startDate },
//           },
//         },
//         {
//           $group: {
//             _id: timeUnit,
//             avgValue: { $avg: "$value" },
//             minValue: { $min: "$value" },
//             maxValue: { $max: "$value" },
//             count: { $sum: 1 },
//           },
//         },
//         { $sort: { _id: 1 } },
//       ]);
//     } catch (error) {
//       logger.error("Error getting aggregated sensor data:", error);
//       throw error;
//     }
//   }

//   /**
//    * Delete old sensor data to manage database size
//    * @param {number} daysToKeep - Number of days of data to retain
//    * @returns {Promise<Object>} - Result of deletion operation
//    */
//   async cleanupOldData(daysToKeep = 30) {
//     try {
//       const cutoffDate = new Date();
//       cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

//       const result = await SensorModel.deleteMany({
//         timestamp: { $lt: cutoffDate },
//       });

//       logger.info(`Cleaned up ${result.deletedCount} old sensor records`);
//       return result;
//     } catch (error) {
//       logger.error("Error cleaning up old sensor data:", error);
//       throw error;
//     }
//   }
// }

// module.exports = new SensorService();
