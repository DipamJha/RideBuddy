/**
 * Utility for geocoding addresses using OpenStreetMap's Nominatim API.
 * Includes a simple in-memory cache to stay within usage limits.
 */

const cache = new Map();

export const geocode = async (query) => {
  if (!query) return null;
  
  // Clean up query (e.g. "Indiranagar, Bangalore")
  const q = query.toLowerCase().trim();
  
  if (cache.has(q)) return cache.get(q);

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
      cache.set(q, result);
      return result;
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

/**
 * Get coordinates for a list of ride locations
 */
export const geocodeRides = async (rides) => {
  const results = await Promise.all(
    rides.map(async (ride) => {
      const fromCoord = await geocode(ride.from);
      return { ...ride, fromCoord };
    })
  );
  return results.filter(r => r.fromCoord !== null);
};
