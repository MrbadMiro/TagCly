class HealthFeatures {
  calculateStressLevel(data) {
    let score = 0;
    if (data.heart_rate) {
      score += ((data.heart_rate - 60) / (180 - 60)) * 3; // Normalize to 0-3
    }
    if (data.temperature) {
      score += ((data.temperature - 37) / (41 - 37)) * 3; // Normalize to 0-3
    }
    if (data.activity_intensity) {
      score += data.activity_intensity * 0.4; // Scale to 0-4
    }
    return parseFloat(Math.min(score, 10).toFixed(1));
  }
}

export default new HealthFeatures();
