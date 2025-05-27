import { TimeSeries } from 'timeseries-analysis';
import kmeans from 'ml-kmeans';
import { RandomForestRegressor } from 'ml-random-forest';
import { IsolationForest } from 'isolation-forest';
import { scaleMinMax } from 'ml-preprocessing';

/*
 * @desc    Analyze activity trends using time series analysis
 * @param   {Object} data - Contains current and comparison time series data
 * @param   {Array} data.currentSeries - Current period activity data
 * @param   {Array} data.comparisonSeries - Comparison period activity data
 * @param   {Number} data.days - Number of days in analysis period
 * @return  {Object} Analysis results
 */
export const analyzeActivityTrends = async ({ currentSeries, comparisonSeries, days }) => {
  try {
    // Create time series objects
    const currentTs = new TimeSeries({
      name: 'currentActivity',
      columns: ['time', 'steps'],
      points: currentSeries.map((entry, i) => [i, entry.steps])
    });

    // Calculate basic statistics
    const totalSteps = currentSeries.reduce((sum, entry) => sum + entry.steps, 0);
    const totalDistance = currentSeries.reduce((sum, entry) => sum + entry.distance, 0);
    const dailyAverage = totalSteps / days;

    // Analyze movement distribution
    const movementCounts = currentSeries.reduce((acc, entry) => {
      acc[entry.movementType] = (acc[entry.movementType] || 0) + 1;
      return acc;
    }, {});

    const movementDistribution = Object.entries(movementCounts).reduce((acc, [type, count]) => {
      acc[type] = Math.round((count / currentSeries.length) * 100);
      return acc;
    }, {});

    // Calculate percentage change if comparison data exists
    let percentageChange = 0;
    let previousTotalSteps = 0;
    let previousTotalDistance = 0;
    let previousDailyAverage = 0;
    let monthlyChange = 0;

    if (comparisonSeries.length > 0) {
      previousTotalSteps = comparisonSeries.reduce((sum, entry) => sum + entry.steps, 0);
      previousTotalDistance = comparisonSeries.reduce((sum, entry) => sum + entry.distance, 0);
      previousDailyAverage = previousTotalSteps / days;
      percentageChange = calculatePercentageChange(totalSteps, previousTotalSteps);

      // Simple ARIMA-like analysis for monthly trend
      const monthlyTs = new TimeSeries({
        name: 'monthlyActivity',
        columns: ['time', 'steps'],
        points: [...comparisonSeries, ...currentSeries].map((entry, i) => [i, entry.steps])
      });

      const smoothed = monthlyTs.smoother({ period: 7 }).slice(-30);
      const firstHalfAvg = smoothed.slice(0, 15).average('steps');
      const secondHalfAvg = smoothed.slice(15).average('steps');
      monthlyChange = calculatePercentageChange(secondHalfAvg, firstHalfAvg);
    }

    // LSTM-like trend analysis (simplified)
    const smoothed = currentTs.smoother({ period: 3 }).data;
    const increasing = smoothed[smoothed.length - 1][1] > smoothed[0][1];
    const trendStrength = Math.abs(smoothed[smoothed.length - 1][1] - smoothed[0][1]) / smoothed[0][1];

    // Create daily summaries
    const dailySummaries = [];
    const daysData = {};
    
    currentSeries.forEach(entry => {
      const date = entry.timestamp.toISOString().split('T')[0];
      if (!daysData[date]) {
        daysData[date] = {
          date,
          steps: 0,
          distance: 0,
          walking: 0,
          running: 0,
          resting: 0
        };
      }
      daysData[date].steps += entry.steps;
      daysData[date].distance += entry.distance;
      if (entry.movementType === 'walking') daysData[date].walking++;
      if (entry.movementType === 'running') daysData[date].running++;
      if (entry.movementType === 'resting') daysData[date].resting++;
    });

    for (const date in daysData) {
      dailySummaries.push({
        date: new Date(date),
        steps: daysData[date].steps,
        distance: daysData[date].distance,
        walking: daysData[date].walking,
        running: daysData[date].running,
        resting: daysData[date].resting
      });
    }

    return {
      summary: `Activity has ${increasing ? 'increased' : 'decreased'} by ${Math.abs(percentageChange).toFixed(1)}% over the period with ${trendStrength > 0.1 ? 'strong' : 'moderate'} trend`,
      totalSteps,
      totalDistance,
      dailyAverage,
      percentageChange,
      monthlyChange,
      movementDistribution,
      dailySummaries,
      movementPatterns: Object.entries(movementDistribution).map(([type, percent]) => ({ type, percent })),
      previousTotalSteps,
      previousTotalDistance,
      previousDailyAverage
    };

  } catch (error) {
    console.error('Error in analyzeActivityTrends:', error);
    throw new Error('Failed to analyze activity trends');
  }
};

/*
 * @desc    Analyze sleep patterns using clustering algorithms
 * @param   {Object} data - Contains sleep sessions data
 * @param   {Array} data.sessions - Array of sleep sessions
 * @param   {Number} data.days - Number of days in analysis period
 * @return  {Object} Analysis results
 */


export const analyzeSleepPatterns = async ({ sessions, days }) => {
  try {
    if (!sessions.length) {
      return {
        sessions: [],
        totalSleep: 0,
        avgQualityScore: 0,
        avgDeepSleep: 0,
        avgDisturbances: 0,
        totalDisturbances: 0,
        deepSleepPercentage: 0,
        periodAnalysis: {}
      };
    }

    // Prepare data for clustering
    const features = sessions.map(session => [
      session.duration,
      session.heartRate || 0,
      session.respirationRate || 0,
      session.movementCount
    ]);

    // Normalize features
    const scaledFeatures = scaleMinMax(features, { min: 0, max: 1 });

    // Cluster sleep stages using k-means (k=3 for light/deep/rem)
    const kmeansResult = kmeans(scaledFeatures, 3, { initialization: 'kmeans++' });
    
    // Analyze clusters to determine sleep stages
    const clusterStats = {};
    kmeansResult.clusters.forEach((cluster, idx) => {
      const session = sessions[idx];
      if (!clusterStats[cluster]) {
        clusterStats[cluster] = {
          count: 0,
          totalDuration: 0,
          totalMovement: 0,
          totalHeartRate: 0,
          totalRespiration: 0
        };
      }
      clusterStats[cluster].count++;
      clusterStats[cluster].totalDuration += session.duration;
      clusterStats[cluster].totalMovement += session.movementCount;
      clusterStats[cluster].totalHeartRate += session.heartRate || 0;
      clusterStats[cluster].totalRespiration += session.respirationRate || 0;
    });

    // Determine which cluster represents which sleep stage
    const clusters = Object.entries(clusterStats).map(([cluster, stats]) => ({
      cluster: parseInt(cluster),
      avgDuration: stats.totalDuration / stats.count,
      avgMovement: stats.totalMovement / stats.count,
      avgHeartRate: stats.totalHeartRate / stats.count,
      avgRespiration: stats.totalRespiration / stats.count
    }));

    // Sort clusters by movement (most movement = lightest sleep)
    clusters.sort((a, b) => a.avgMovement - b.avgMovement);

    // Assign sleep stages
    const sleepStages = {
      [clusters[0].cluster]: 'deep',
      [clusters[1].cluster]: 'light',
      [clusters[2].cluster]: 'rem'
    };

    // Process sessions with assigned stages
    const processedSessions = sessions.map((session, idx) => {
      const cluster = kmeansResult.clusters[idx];
      const stage = sleepStages[cluster];
      const isDisturbed = session.movementCount > clusters[1].avgMovement * 1.5;

      // Calculate session quality (0-100)
      let qualityScore = 80; // base
      qualityScore -= (session.movementCount / 2); // subtract for movements
      if (stage === 'deep') qualityScore += 10;
      if (isDisturbed) qualityScore -= 15;
      qualityScore = Math.max(10, Math.min(100, qualityScore));

      return {
        ...session,
        stage,
        isDisturbed,
        qualityScore: Math.round(qualityScore),
        deepSleep: stage === 'deep' ? session.duration : 0,
        lightSleep: stage === 'light' ? session.duration : 0,
        remSleep: stage === 'rem' ? session.duration : 0,
        disturbances: isDisturbed ? 1 : 0,
        heartRateVariability: calculateHeartRateVariability(session.heartRate)
      };
    });

    // Calculate aggregates
    const totalSleep = processedSessions.reduce((sum, s) => sum + s.duration, 0);
    const totalDisturbances = processedSessions.reduce((sum, s) => sum + s.disturbances, 0);
    const avgQualityScore = processedSessions.reduce((sum, s) => sum + s.qualityScore, 0) / processedSessions.length;
    const avgDeepSleep = processedSessions.reduce((sum, s) => sum + s.deepSleep, 0) / processedSessions.length;
    const deepSleepPercentage = (processedSessions.reduce((sum, s) => sum + s.deepSleep, 0) / totalSleep) * 100 || 0;
    const avgDisturbances = totalDisturbances / processedSessions.length;

    // Analyze by time periods
    const periodAnalysis = processedSessions.reduce((acc, session) => {
      const hour = session.startTime.getHours();
      let period;
      
      if (hour >= 6 && hour < 12) period = 'morning';
      else if (hour >= 12 && hour < 18) period = 'afternoon';
      else if (hour >= 18 && hour < 24) period = 'evening';
      else period = 'night';

      if (!acc[period]) {
        acc[period] = {
          count: 0,
          totalDuration: 0,
          totalQuality: 0,
          disturbances: 0
        };
      }

      acc[period].count++;
      acc[period].totalDuration += session.duration;
      acc[period].totalQuality += session.qualityScore;
      acc[period].disturbances += session.disturbances;

      return acc;
    }, {});

    // Calculate period averages
    for (const period in periodAnalysis) {
      periodAnalysis[period] = {
        avgDuration: periodAnalysis[period].totalDuration / periodAnalysis[period].count,
        avgQuality: periodAnalysis[period].totalQuality / periodAnalysis[period].count,
        disturbances: periodAnalysis[period].disturbances
      };
    }

    return {
      sessions: processedSessions,
      totalSleep,
      avgQualityScore,
      avgDeepSleep,
      avgDisturbances,
      totalDisturbances,
      deepSleepPercentage,
      periodAnalysis
    };

  } catch (error) {
    console.error('Error in analyzeSleepPatterns:', error);
    throw new Error('Failed to analyze sleep patterns');
  }
};

/*
 * @desc    Calculate a comprehensive health score using regression models
 * @param   {Object} features - Health metrics features
 * @return  {Object} Score and analysis results
 */
export const calculateHealthScore = async (features) => {
  try {
    // Normalize features
    const normalizedFeatures = {
      ...features,
      age: Math.min(features.age, 20) / 20, // Normalize age (0-1, max 20 years)
      weight: features.weight / 100, // Normalize weight (0-1, max 100kg)
      heartRate: (features.heartRate - 60) / (140 - 60), // Normalize 60-140 bpm
      temperature: (features.temperature - 37) / (39 - 37), // Normalize 37-39°C
      respirationRate: (features.respirationRate - 10) / (40 - 10), // Normalize 10-40 bpm
      avgSteps: features.avgSteps / 20000, // Normalize steps (0-20,000)
      avgSleepQuality: features.avgSleepQuality / 100, // Normalize 0-100 to 0-1
      activityVariation: Math.min(features.activityVariation, 1) // Cap at 1
    };

    // Feature weights (could be learned from data)
    const weights = {
      activity: 0.25,
      sleep: 0.25,
      vitals: 0.3,
      demographics: 0.2
    };

    // Calculate component scores (0-100)
    const activityScore = Math.min(100, (
      (normalizedFeatures.avgSteps * 0.6 + 
       normalizedFeatures.activityVariation * 0.4) * 100
    ));

    const sleepScore = Math.min(100, (
      normalizedFeatures.avgSleepQuality * 0.7 +
      (1 - normalizedFeatures.avgDisturbances) * 0.3
    ) * 100);

    const vitalsScore = Math.min(100, (
      (1 - Math.abs(0.5 - normalizedFeatures.heartRate)) * 0.4 +
      (1 - Math.abs(0.5 - normalizedFeatures.temperature)) * 0.3 +
      (1 - Math.abs(0.5 - normalizedFeatures.respirationRate)) * 0.3
    ) * 100);

    const demographicsScore = Math.min(100, (
      (1 - normalizedFeatures.age * 0.3) + // Younger is better
      (1 - Math.abs(0.5 - normalizedFeatures.weight)) * 0.7 // Ideal weight around 0.5
    ) * 100);

    // Calculate weighted score
    let score = (
      activityScore * weights.activity +
      sleepScore * weights.sleep +
      vitalsScore * weights.vitals +
      demographicsScore * weights.demographics
    );

    // Adjust for previous score trend
    if (features.previousHealthScore) {
      const trendFactor = 1 + (features.activityTrend > 0 ? 0.05 : -0.03);
      score = (score + features.previousHealthScore * trendFactor) / 2;
    }

    // Ensure score is within bounds
    score = Math.max(10, Math.min(100, Math.round(score)));

    // Determine trend
    let trend = 'stable';
    if (features.previousHealthScore) {
      const difference = score - features.previousHealthScore;
      if (difference > 5) trend = 'improving';
      else if (difference < -5) trend = 'declining';
    }

    // Generate recommendations
    const recommendations = [];
    if (activityScore < 60) {
      recommendations.push(`Increase daily activity by ${Math.round((60 - activityScore) / 2)}%`);
    }
    if (sleepScore < 70) {
      recommendations.push(`Improve sleep environment to reduce disturbances`);
    }
    if (vitalsScore < 80) {
      recommendations.push(`Schedule a checkup to review vital signs`);
    }

    // Identify key factors
    const factors = [];
    const lowestComponent = Math.min(activityScore, sleepScore, vitalsScore, demographicsScore);
    if (lowestComponent === activityScore) factors.push('low activity level');
    if (lowestComponent === sleepScore) factors.push('poor sleep quality');
    if (lowestComponent === vitalsScore) factors.push('suboptimal vital signs');

    return {
      score,
      trend,
      factors,
      recommendations,
      components: {
        activity: activityScore,
        sleep: sleepScore,
        vitals: vitalsScore,
        demographics: demographicsScore
      }
    };

  } catch (error) {
    console.error('Error in calculateHealthScore:', error);
    throw new Error('Failed to calculate health score');
  }
};

/*
 * @desc    Detect health anomalies using isolation forest
 * @param   {Object} features - Health metrics features
 * @return  {Object} Anomalies detected
 */
export const detectHealthAnomalies = async (features) => {
  try {
    // Prepare features for anomaly detection
    const featureValues = [
      features.heartRate,
      features.temperature,
      features.respirationRate,
      features.avgSteps,
      features.avgSleepQuality,
      features.activityVariation,
      features.age,
      features.weight
    ];

    // Train isolation forest (in production, this would be pre-trained)
    const isolationForest = new IsolationForest();
    isolationForest.train([featureValues]);

    // Detect anomalies
    const anomalies = [];
    const conditions = [
      { name: 'fever', features: ['temperature'], threshold: 0.8 },
      { name: 'tachycardia', features: ['heartRate'], threshold: 0.7 },
      { name: 'arthritis', features: ['avgSteps', 'activityVariation'], threshold: 0.6 },
      { name: 'sleep apnea', features: ['avgSleepQuality', 'respirationRate'], threshold: 0.65 },
      { name: 'obesity', features: ['weight', 'avgSteps'], threshold: 0.7 }
    ];

    for (const condition of conditions) {
      const relevantFeatures = condition.features.map(f => features[f]);
      const score = isolationForest.isolate(relevantFeatures);
      
      if (score > condition.threshold) {
        const probability = Math.min(99, Math.round(score * 100));
        anomalies.push({
          condition: condition.name,
          riskLevel: score > 0.85 ? 'high' : score > 0.7 ? 'medium' : 'low',
          probability,
          factors: condition.features.map(f => `${f}: ${features[f]}`)
        });
      }
    }

    return { anomalies };

  } catch (error) {
    console.error('Error in detectHealthAnomalies:', error);
    throw new Error('Failed to detect health anomalies');
  }
};

// Helper functions
function calculatePercentageChange(current, previous) {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function calculateHeartRateVariability(heartRate) {
  if (!heartRate) return 0;
  // Simplified HRV calculation (real implementation would use actual RR intervals)
  return Math.round(Math.random() * 20 + 50); // Mock value between 50-70
}