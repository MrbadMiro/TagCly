import express from "express";
import sensorController from "../../../controllers/devices/sensorController.js";

const router = express.Router();

router.post("/", sensorController.createSensorData);
router.get("/:pet_id", sensorController.getSensorData);

export default router;
