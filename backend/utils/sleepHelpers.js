// utils/sleepHelpers.js
export const getHeartRateByState = (state) => {
    const baseRates = {
      'deep': 55,
      'light': 65,
      'rem': 70,
      'disturbed': 80
    };
    return baseRates[state] + Math.random() * 10;
  };
  
  export const getRespirationByState = (state) => {
    const baseRates = {
      'deep': 12,
      'light': 18,
      'rem': 20,
      'disturbed': 25
    };
    return baseRates[state] + Math.random() * 5;
  };
  
  export const getMovementByState = (state) => {
    const baseMovements = {
      'deep': 0.2,
      'light': 1.5,
      'rem': 3,
      'disturbed': 8
    };
    return Math.floor(baseMovements[state] * (1 + Math.random()));
  };
  
  export const getQualityScoreByState = (state) => {
    const baseScores = {
      'deep': 90,
      'light': 70,
      'rem': 80,
      'disturbed': 40
    };
    return baseScores[state] + (Math.random() * 20 - 10);
  };