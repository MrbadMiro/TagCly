import Sensor from "../../models/database/sensorModel.js";

class SensorController {
  async createSensorData(req, res) {
    try {
      await ingestionService.ingestSensorData(req.body);
      res.status(201).json({ message: "Data saved successfully" });
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

export default new SensorController();
