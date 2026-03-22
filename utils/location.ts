/**
 * Calculates the great-circle distance between two points (latitude and longitude)
 * using the Haversine formula.
 * @returns Distance in kilometers
 */
export const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculates road distance between two points using OSRM API
 * @returns Distance in kilometers or null if failed
 */
export const getRoadDistance = async (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<number | null> => {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`
    );
    const data = await response.json();
    if (data.code === "Ok" && data.routes && data.routes[0]) {
      return data.routes[0].distance / 1000; // convert meters to km
    }
    return null;
  } catch (error) {
    console.warn("Road distance fetch failed:", error);
    return null;
  }
};

/**
 * Formats distance for display
 */
export const formatDistance = (distance: number | null | undefined): string => {
  if (distance == null) return "Unknown";
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)} m`;
  }
  return `${distance.toFixed(1)} km`;
};
