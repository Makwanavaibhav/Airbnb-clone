// ─── Base URL — reads from Vite env, falls back to localhost dev server ───────
const BASE = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}`;

/**
 * Fetch ALL hotels from the backend.
 * @returns {Promise<Array>}
 */
export async function fetchAllHotels() {
  const res = await fetch(`${BASE}/api/hotels`);
  if (!res.ok) throw new Error(`Failed to fetch hotels: ${res.status}`);
  return res.json();
}

/**
 * Fetch hotels filtered by city slug ("udaipur" | "goa" | "mumbai").
 * @param {string} city
 * @returns {Promise<Array>}
 */
export async function fetchHotelsByCity(city) {
  const res = await fetch(`${BASE}/api/hotels/city/${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error(`Failed to fetch hotels for city '${city}': ${res.status}`);
  return res.json();
}

/**
 * Fetch a single hotel by numeric id.
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export async function fetchHotelById(id) {
  const res = await fetch(`${BASE}/api/hotels/${id}`);
  if (!res.ok) throw new Error(`Hotel ${id} not found: ${res.status}`);
  return res.json();
}
