// controllers/health/sleepController.js
import SensorData from "../../../models/database/sensorModel.js";
import mongoose from "mongoose";

/**
 * @desc    Get sleep metrics for a pet
 * @route   GET /api/pets/:petId/sleep
 * @access  Private
 */
export const getSleepMetrics = async (req, res) => {
  try {
    const { petId } = req.params;
    const { days = 7 } = req.query;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pet ID format",
      });
    }

    // Get sleep data from database
    const sleepData = await SensorData.find({
      petId: new mongoose.Types.ObjectId(petId),
      dataType: "sleep",
      timestamp: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
      "sleep.duration": { $exists: true, $gt: 0 }, // Ensure duration exists and is positive
    }).sort({ timestamp: 1 });

    if (!sleepData || sleepData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No valid sleep data found for this pet",
      });
    }

    // Calculate sleep metrics
    const sleepMetrics = calculateSleepQuality(sleepData);
    const sleepTrends = analyzeSleepTrends(sleepData, days);

    res.json({
      success: true,
      data: {
        ...sleepMetrics,
        trends: sleepTrends,
        summary: generateSleepSummary(sleepMetrics, sleepTrends),
      },
      message: "Sleep metrics retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getSleepMetrics:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving sleep metrics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Calculate sleep quality metrics from raw sleep data
 */
export function calculateSleepQuality(sleepData) {
  const totals = sleepData.reduce(
    (acc, data) => {
      const sleep = data.sleep;
      acc.totalDuration += sleep.duration || 0;
      acc.deepSleep += sleep.state === "deep" ? sleep.duration : 0;
      acc.lightSleep += sleep.state === "light" ? sleep.duration : 0;
      acc.remSleep += sleep.state === "rem" ? sleep.duration : 0;
      acc.disturbed += sleep.state === "disturbed" ? sleep.duration : 0;
      acc.heartRateSum += sleep.heartRate || 0;
      acc.respirationSum += sleep.respirationRate || 0;
      acc.movementCount += sleep.movementCount || 0;
      return acc;
    },
    {
      totalDuration: 0,
      deepSleep: 0,
      lightSleep: 0,
      remSleep: 0,
      disturbed: 0,
      heartRateSum: 0,
      respirationSum: 0,
      movementCount: 0,
    }
  );

  const count = sleepData.length;
  const totalSleepMinutes = totals.totalDuration;
  const totalSleepHours = totalSleepMinutes / 60;

  // Calculate percentages
  const deepSleepPercent = (totals.deepSleep / totalSleepMinutes) * 100;
  const remSleepPercent = (totals.remSleep / totalSleepMinutes) * 100;
  const disturbedPercent = (totals.disturbed / totalSleepMinutes) * 100;

  // Calculate averages
  const avgHeartRate = totals.heartRateSum / count;
  const avgRespiration = totals.respirationSum / count;
  const avgMovementsPerHour = totals.movementCount / (totalSleepMinutes / 60);

  // Calculate quality score (0-100)
  const qualityScore = calculateQualityScore(
    deepSleepPercent,
    remSleepPercent,
    disturbedPercent,
    avgMovementsPerHour
  );

  return {
    totalSleepHours: parseFloat(totalSleepHours.toFixed(2)),
    deepSleepPercent: parseFloat(deepSleepPercent.toFixed(1)),
    remSleepPercent: parseFloat(remSleepPercent.toFixed(1)),
    disturbedPercent: parseFloat(disturbedPercent.toFixed(1)),
    avgHeartRate: parseFloat(avgHeartRate.toFixed(1)),
    avgRespiration: parseFloat(avgRespiration.toFixed(1)),
    avgMovementsPerHour: parseFloat(avgMovementsPerHour.toFixed(1)),
    qualityScore: parseFloat(qualityScore.toFixed(1)),
    sleepEfficiency: parseFloat((100 - disturbedPercent).toFixed(1)),
  };
}

/**
 * Analyze sleep trends over time
 */
export function analyzeSleepTrends(sleepData, days) {
  // Group by day
  const dailyData = sleepData.reduce((acc, data) => {
    const date = new Date(data.timestamp).toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = {
        date,
        totalDuration: 0,
        deepSleep: 0,
        qualityScores: [],
      };
    }
    acc[date].totalDuration += data.sleep.duration;
    acc[date].deepSleep +=
      data.sleep.state === "deep" ? data.sleep.duration : 0;
    acc[date].qualityScores.push(
      calculateQualityScore(
        data.sleep.state === "deep" ? 100 : 0,
        data.sleep.state === "rem" ? 100 : 0,
        data.sleep.state === "disturbed" ? 100 : 0,
        data.sleep.movementCount / (data.sleep.duration / 60)
      )
    );
    return acc;
  }, {});

  // Process daily metrics
  const processedDays = Object.values(dailyData).map((day) => ({
    date: day.date,
    totalSleepHours: parseFloat((day.totalDuration / 60).toFixed(2)),
    deepSleepPercent: parseFloat(
      ((day.deepSleep / day.totalDuration) * 100).toFixed(1)
    ),
    qualityScore: parseFloat(
      (
        day.qualityScores.reduce((sum, score) => sum + score, 0) /
        day.qualityScores.length
      ).toFixed(1)
    ),
  }));

  // Sort chronologically
  const sortedDays = processedDays.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Calculate trends
  const currentPeriod = sortedDays.slice(-days);
  const previousPeriod =
    sortedDays.length > days ? sortedDays.slice(-days * 2, -days) : [];

  const currentAvg =
    currentPeriod.reduce((sum, day) => sum + day.qualityScore, 0) /
    currentPeriod.length;
  const previousAvg =
    previousPeriod.length > 0
      ? previousPeriod.reduce((sum, day) => sum + day.qualityScore, 0) /
        previousPeriod.length
      : null;

  const percentageChange = previousAvg
    ? parseFloat((((currentAvg - previousAvg) / previousAvg) * 100).toFixed(1))
    : null;

  return {
    daysAnalyzed: sortedDays.length,
    sleepByDay: sortedDays,
    currentPeriodAverage: parseFloat(currentAvg.toFixed(1)),
    previousPeriodAverage: previousAvg
      ? parseFloat(previousAvg.toFixed(1))
      : null,
    percentageChange,
    sleepLevel: getSleepLevel(currentAvg),
  };
}

/**
 * Calculate sleep quality score (0-100)
 */
function calculateQualityScore(
  deepPercent,
  remPercent,
  disturbedPercent,
  movementsPerHour
) {
  return Math.max(
    0,
    Math.min(
      100,
      70 + // Base score
        deepPercent * 0.2 + // Deep sleep bonus
        remPercent * 0.1 - // REM sleep bonus
        disturbedPercent * 0.3 - // Disturbed sleep penalty
        movementsPerHour * 2 // Movement penalty
    )
  );
}

/**
 * Determine sleep quality level
 */
function getSleepLevel(score) {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

/**
 * Generate human-readable sleep summary
 */
function generateSleepSummary(metrics, trends) {
  let summary = `Your pet slept ${metrics.totalSleepHours} hours on average `;
  summary += `with ${metrics.deepSleepPercent}% deep sleep and `;
  summary += `${metrics.remSleepPercent}% REM sleep. `;
  summary += `Sleep quality is ${getSleepLevel(metrics.qualityScore)}.`;

  if (trends.percentageChange !== null) {
    const direction = trends.percentageChange >= 0 ? "improved" : "declined";
    summary += ` Quality has ${direction} by ${Math.abs(
      trends.percentageChange
    )}% over the period.`;
  }

  return summary;
}

export default {
  getSleepMetrics,
  calculateSleepQuality,
  analyzeSleepTrends,
};
