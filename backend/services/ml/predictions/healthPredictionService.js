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

export default new HealthPredictionService();
