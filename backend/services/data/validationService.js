class ValidationService {
  validateSensorData(data) {
    // Required fields check
    if (!data.timestamp || !data.pet_id || !data.device_id) {
      return false;
    }

    // Validate timestamp
    if (isNaN(Date.parse(data.timestamp))) {
      return false;
    }

    // Validate temperature range
    if (
      data.temperature &&
      (data.temperature < 37.0 || data.temperature > 41.0)
    ) {
      return false;
    }

    // Validate heart rate range
    if (data.heart_rate && (data.heart_rate < 60 || data.heart_rate > 180)) {
      return false;
    }

    // Validate GPS coordinates
    if (data.latitude && (data.latitude < -90 || data.latitude > 90)) {
      return false;
    }
    if (data.longitude && (data.longitude < -180 || data.longitude > 180)) {
      return false;
    }

    // Validate status
    if (!["ok", "error"].includes(data.status)) {
      return false;
    }

    return true;
  }
}

module.exports = new ValidationService();
