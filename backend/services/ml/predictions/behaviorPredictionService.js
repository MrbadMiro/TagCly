export class BehaviorPredictionService {
  predictMovementPattern(data) {
    if (!data.steps || !data.activity_intensity) return "resting";
    if (data.activity_intensity > 8 && data.steps > 100) return "running";
    if (data.activity_intensity > 5 && data.steps > 50) return "playing";
    if (data.activity_intensity > 2 && data.steps > 10) return "walking";
    return "resting";
  }
}

export default new BehaviorPredictionService();
