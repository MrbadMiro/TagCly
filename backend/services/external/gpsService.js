class GPSService {
  calculateDistanceFromHome(latitude, longitude) {
    if (!latitude || !longitude) return 0;

    const homeLat = 40.7128; // Example: New York City
    const homeLon = -74.006;

    const R = 6371; // Earth's radius in km
    const dLat = ((latitude - homeLat) * Math.PI) / 180;
    const dLon = ((longitude - homeLon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((homeLat * Math.PI) / 180) *
        Math.cos((latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    return parseFloat(distance.toFixed(3));
  }
}

export default new GPSService();
