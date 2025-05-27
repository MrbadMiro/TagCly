import Sensor from "../../models/database/sensorModel.js";

class AggregationService {
  async calculateDailyCumulativeSteps(pet_id, day, newSteps) {
    const today = new Date();
    today.setDate(day);
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await Sensor.aggregate([
      {
        $match: {
          pet_id,
          timestamp: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          totalSteps: { $sum: "$steps" },
        },
      },
    ]);

    const existingSteps = result.length > 0 ? result[0].totalSteps : 0;
    return existingSteps + (newSteps || 0);
  }
}

// ES Modules export
export default new AggregationService();
