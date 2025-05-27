import Sensor from "../../../models/database/sensorModel.js";
import Pet from "../../../models/database/petModel.js";

class EmergencyPredictionService {
  classifyPetStatus(distance) {
    // Default to home if missing
    if (!distance) return "home";

    if (distance < 0.1) return "home"; // Within 100m of home
    if (distance < 0.5) return "walking"; // Within 500m of home
    return "lost"; // More than 500m from home
  }

  async updatePetStatus(sensorDoc) {
    try {
      const petStatus = this.classifyPetStatus(sensorDoc.distance_from_home);

      // Update sensor document
      await Sensor.updateOne(
        { _id: sensorDoc._id },
        { $set: { pet_status: petStatus } }
      );

      // Update pet document with current status
      await Pet.updateOne(
        { pet_id: sensorDoc.pet_id },
        {
          $set: {
            current_status: petStatus,
            last_updated: new Date(),
          },
        },
        { upsert: true }
      );
    } catch (error) {
      console.error("Error updating pet status:", error);
      throw error;
    }
  }
}

export default new EmergencyPredictionService();
