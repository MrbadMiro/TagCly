// config/constants.js
module.exports = {
    ACTIVITY_THRESHOLDS: {
      LOW: 30,       // Below 30% activity = low
      MODERATE: 70,  // 30-70% = moderate
      HIGH: 100      // Above 70% = high
    },
    DEFAULT_ANALYSIS_PERIOD: 7, // days
    DATA_RESOLUTIONS: ['hourly', 'daily', 'weekly'],
    // Add other constants here
  };