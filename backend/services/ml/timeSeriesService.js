// services/ml/timeSeriesService.js
import mongoose from 'mongoose';

/**
 * Analyzes activity trends from sensor data
 * @param {Array} activityData - Array of activity data objects
 * @param {string} [resolution='daily'] - Resolution for analysis
 * @returns {Object} Analysis results with trends and statistics
 */
export function analyzeActivityTrends(activityData, resolution = 'daily') {
  try {
    // Validate input
    if (!Array.isArray(activityData) || activityData.length === 0) {
      throw new Error('Invalid activity data: must be a non-empty array');
    }

    // Process data points to extract intensity values
    const processedData = activityData
      .filter(data => data?.activity?.intensity !== undefined && 
                     data?.activity?.intensity !== null)
      .map(data => ({
        timestamp: data.timestamp,
        value: data.activity.intensity,
        petId: data.petId
      }));

    if (processedData.length === 0) {
      return {
        success: false,
        message: 'No valid activity data with intensity values found'
      };
    }

    // Group data by day
    const groupedData = processedData.reduce((acc, data) => {
      const date = new Date(data.timestamp);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          day: dateKey,
          values: [],
          timestamp: date,
          sampleCount: 0
        };
      }
      
      acc[dateKey].values.push(data.value);
      acc[dateKey].sampleCount++;
      return acc;
    }, {});

    // Calculate daily averages
    const dailyAverages = Object.values(groupedData).map(day => {
      const sum = day.values.reduce((a, b) => a + b, 0);
      return {
        day: day.day,
        timestamp: day.timestamp,
        averageValue: parseFloat((sum / day.values.length).toFixed(2)),
        sampleCount: day.sampleCount
      };
    });

    // Sort by date (oldest first)
    const sortedData = dailyAverages.sort((a, b) => a.timestamp - b.timestamp);

    // Calculate trends
    const currentPeriod = sortedData.slice(-7); // Last 7 days
    const previousPeriod = sortedData.length > 7 ? 
      sortedData.slice(-14, -7) : []; // Previous 7 days

    const currentAvg = currentPeriod.reduce((sum, day) => sum + day.averageValue, 0) / currentPeriod.length;
    const previousAvg = previousPeriod.length > 0 ?
      previousPeriod.reduce((sum, day) => sum + day.averageValue, 0) / previousPeriod.length :
      null;

    const percentageChange = previousAvg !== null && previousAvg !== 0 ?
      parseFloat(((currentAvg - previousAvg) / previousAvg * 100).toFixed(1)) :
      null;

    // Determine activity level
    let activityLevel = "moderate";
    if (currentAvg < 30) activityLevel = "low";
    if (currentAvg > 70) activityLevel = "high";

    // Generate summary message
    const summaryMessage = generateSummaryMessage(
      sortedData, 
      currentAvg,
      percentageChange,
      activityLevel
    );

    return {
      success: true,
      data: {
        daysAnalyzed: sortedData.length,
        activityByDay: sortedData,
        currentPeriodAverage: parseFloat(currentAvg.toFixed(2)),
        previousPeriodAverage: previousAvg ? parseFloat(previousAvg.toFixed(2)) : null,
        percentageChange,
        activityLevel,
        resolution,
        summaryMessage
      },
      message: 'Activity trends analyzed successfully'
    };

  } catch (error) {
    console.error('Error in analyzeActivityTrends:', error);
    return {
      success: false,
      message: 'Error analyzing activity trends',
      error: error.message
    };
  }
}

/**
 * Generates a user-friendly activity summary
 */
function generateSummaryMessage(data, currentAvg, percentageChange, activityLevel) {
  if (!data || data.length === 0) {
    return "No activity data available for analysis";
  }

  let changeText = "";
  if (percentageChange !== null) {
    const direction = percentageChange >= 0 ? "increased" : "decreased";
    changeText = ` (${direction} by ${Math.abs(percentageChange)}% from previous period)`;
  }

  return `Your pet shows ${activityLevel} activity levels${changeText}. ` +
         `Average daily activity: ${currentAvg.toFixed(1)}/100.`;
}

/**
 * Helper function to calculate period averages
 */
function calculatePeriodAverage(data, daysBack) {
  if (!data || data.length === 0) return null;
  const periodData = daysBack > 0 ? data.slice(-daysBack) : data;
  const sum = periodData.reduce((total, day) => total + day.averageValue, 0);
  return parseFloat((sum / periodData.length).toFixed(2));
}


/*
 * Analyzes sleep patterns from sleep data
 * @param {Array} sleepData - Array of sleep data objects
 * @param {string} [resolution='daily'] - Resolution for analysis
 * @returns {Object} Sleep analysis results
 */
export function analyzeSleepPatterns(sleepData, resolution = 'daily') {
  if (!Array.isArray(sleepData) || sleepData.length === 0) {
    throw new Error('Invalid sleep data: must be a non-empty array');
  }

  // Group data by day
  const groupedData = sleepData.reduce((acc, data) => {
    const date = new Date(data.timestamp);
    const dateKey = date.toISOString().split('T')[0];
    
    if (!acc[dateKey]) {
      acc[dateKey] = {
        day: dateKey,
        values: [],
        timestamp: date,
        totalDuration: 0,
        deepSleep: 0,
        remSleep: 0,
        disturbed: 0
      };
    }
    
    acc[dateKey].values.push(data);
    acc[dateKey].totalDuration += data.sleep.duration || 0;
    if (data.sleep.state === 'deep') acc[dateKey].deepSleep += data.sleep.duration;
    if (data.sleep.state === 'rem') acc[dateKey].remSleep += data.sleep.duration;
    if (data.sleep.state === 'disturbed') acc[dateKey].disturbed += data.sleep.duration;
    
    return acc;
  }, {});

  // Calculate daily metrics
  const processedData = Object.values(groupedData).map(day => {
    const qualityScore = calculateDailySleepQuality(
      day.totalDuration,
      day.deepSleep,
      day.remSleep,
      day.disturbed
    );

    return {
      day: day.day,
      timestamp: day.timestamp,
      totalDuration: day.totalDuration,
      deepSleepPercent: (day.deepSleep / day.totalDuration) * 100,
      remSleepPercent: (day.remSleep / day.totalDuration) * 100,
      disturbedPercent: (day.disturbed / day.totalDuration) * 100,
      qualityScore
    };
  });

  // Sort by date (oldest first)
  const sortedData = processedData.sort((a, b) => a.timestamp - b.timestamp);

  // Calculate trends
  const currentPeriod = sortedData.slice(-7); // Last 7 days
  const previousPeriod = sortedData.length > 7 ? sortedData.slice(-14, -7) : [];

  const currentAvg = currentPeriod.reduce((sum, day) => sum + day.qualityScore, 0) / currentPeriod.length;
  const previousAvg = previousPeriod.length > 0 ?
    previousPeriod.reduce((sum, day) => sum + day.qualityScore, 0) / previousPeriod.length :
    null;

  const percentageChange = previousAvg !== null ?
    parseFloat(((currentAvg - previousAvg) / previousAvg * 100).toFixed(1)) :
    null;

  return {
    daysAnalyzed: sortedData.length,
    sleepByDay: sortedData,
    currentPeriodAverage: parseFloat(currentAvg.toFixed(1)),
    previousPeriodAverage: previousAvg ? parseFloat(previousAvg.toFixed(1)) : null,
    percentageChange,
    sleepLevel: getSleepLevel(currentAvg)
  };
}

function calculateDailySleepQuality(total, deep, rem, disturbed) {
  return Math.max(0, Math.min(100,
    70 + // Base score
    ((deep / total) * 100 * 0.2) + // Deep sleep bonus
    ((rem / total) * 100 * 0.1) - // REM sleep bonus
    ((disturbed / total) * 100 * 0.3) // Disturbed sleep penalty
  ));
}

function getSleepLevel(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}
export default {
  analyzeActivityTrends,
  analyzeSleepPatterns
};