class ActivityPredictionService {
  predictActivityLevel(data) {
    if (!data.activity_intensity) return "sedentary";
    if (data.activity_intensity > 7) return "active";
    if (data.activity_intensity > 3) return "moderate";
    return "sedentary";
  }
}

export default new ActivityPredictionService();
