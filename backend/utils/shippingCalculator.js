/**
 * Calculate shipping cost based on parcel size, weight, and distance
 */

// Base rates in BDT (Bangladeshi Taka)
const BASE_RATES = {
  SMALL: 80,
  MEDIUM: 120,
  LARGE: 180,
  EXTRA_LARGE: 250,
};

// Weight multiplier (per kg)
const WEIGHT_RATE = 25; // 25 BDT per kg

// Distance multiplier (approximate - would use actual distance calculation in production)
const DISTANCE_RATES = {
  SAME_CITY: 1.0,
  SAME_STATE: 1.5,
  DIFFERENT_STATE: 2.0,
};

// Special handling rates
const SPECIAL_RATES = {
  FRAGILE: 50,
  ELECTRONICS: 30,
  FOOD: 20,
};

/**
 * Calculate distance multiplier based on addresses
 */
const calculateDistanceMultiplier = (pickupAddress, deliveryAddress) => {
  if (!pickupAddress || !deliveryAddress) {
    return DISTANCE_RATES.SAME_CITY;
  }

  // Same city
  if (pickupAddress.city.toLowerCase() === deliveryAddress.city.toLowerCase()) {
    return DISTANCE_RATES.SAME_CITY;
  }

  // Same state
  if (pickupAddress.state.toLowerCase() === deliveryAddress.state.toLowerCase()) {
    return DISTANCE_RATES.SAME_STATE;
  }

  // Different state
  return DISTANCE_RATES.DIFFERENT_STATE;
};

/**
 * Calculate actual distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return 0;
  }

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

/**
 * Get distance-based multiplier using coordinates
 */
const getDistanceMultiplier = (distance) => {
  if (distance <= 50) return 1.0; // Within 50km
  if (distance <= 200) return 1.3; // Within 200km
  if (distance <= 500) return 1.6; // Within 500km
  return 2.0; // Over 500km
};

/**
 * Main shipping cost calculation function
 */
export const calculateShippingCost = ({ size, weight, pickupAddress, deliveryAddress, parcelType = "PACKAGE" }) => {
  try {
    // Base cost by size
    let cost = BASE_RATES[size] || BASE_RATES.MEDIUM;

    // Add weight cost
    if (weight && weight > 1) {
      cost += (weight - 1) * WEIGHT_RATE; // First kg included in base rate
    }

    // Calculate distance multiplier
    let distanceMultiplier = calculateDistanceMultiplier(pickupAddress, deliveryAddress);

    // If coordinates are available, use actual distance calculation
    if (pickupAddress.latitude && pickupAddress.longitude && deliveryAddress.latitude && deliveryAddress.longitude) {
      const distance = calculateDistance(pickupAddress.latitude, pickupAddress.longitude, deliveryAddress.latitude, deliveryAddress.longitude);
      distanceMultiplier = getDistanceMultiplier(distance);
    }

    // Apply distance multiplier
    cost *= distanceMultiplier;

    // Add special handling charges
    if (SPECIAL_RATES[parcelType]) {
      cost += SPECIAL_RATES[parcelType];
    }

    // Round to nearest 5 BDT
    cost = Math.ceil(cost / 5) * 5;

    // Minimum cost
    return Math.max(cost, 50);
  } catch (error) {
    console.error("Error calculating shipping cost:", error);
    // Return default cost if calculation fails
    return BASE_RATES.MEDIUM;
  }
};

/**
 * Get shipping cost breakdown for display
 */
export const getShippingBreakdown = ({ size, weight, pickupAddress, deliveryAddress, parcelType = "PACKAGE" }) => {
  const baseCost = BASE_RATES[size] || BASE_RATES.MEDIUM;
  const weightCost = weight && weight > 1 ? (weight - 1) * WEIGHT_RATE : 0;
  const specialCost = SPECIAL_RATES[parcelType] || 0;

  let distanceMultiplier = calculateDistanceMultiplier(pickupAddress, deliveryAddress);
  let distanceInfo = "Same City";

  if (pickupAddress.latitude && pickupAddress.longitude && deliveryAddress.latitude && deliveryAddress.longitude) {
    const distance = calculateDistance(pickupAddress.latitude, pickupAddress.longitude, deliveryAddress.latitude, deliveryAddress.longitude);
    distanceMultiplier = getDistanceMultiplier(distance);
    distanceInfo = `${Math.round(distance)} km`;
  } else {
    if (pickupAddress.city.toLowerCase() !== deliveryAddress.city.toLowerCase()) {
      distanceInfo = pickupAddress.state.toLowerCase() === deliveryAddress.state.toLowerCase() ? "Same State" : "Different State";
    }
  }

  const subtotal = (baseCost + weightCost) * distanceMultiplier + specialCost;
  const total = Math.max(Math.ceil(subtotal / 5) * 5, 50);

  return {
    baseCost,
    weightCost,
    distanceMultiplier,
    distanceInfo,
    specialCost,
    subtotal,
    total,
    breakdown: [{ label: `Base Rate (${size})`, amount: baseCost }, ...(weightCost > 0 ? [{ label: `Weight (${weight} kg)`, amount: weightCost }] : []), { label: `Distance (${distanceInfo})`, amount: `×${distanceMultiplier}` }, ...(specialCost > 0 ? [{ label: `Special Handling (${parcelType})`, amount: specialCost }] : [])],
  };
};
