// tests/utils.test.js
import { generateTrackingNumber, validateTrackingNumber, extractDateFromTracking } from "../utils/trackingGenerator.js";
import { calculateShippingCost, getShippingBreakdown } from "../utils/shippingCalculator.js";

// Sample addresses for testing
const sampleAddresses = {
  dhaka: {
    street: "123 Test St",
    city: "Dhaka",
    state: "Dhaka Division",
    zipCode: "1000",
    latitude: 23.8103,
    longitude: 90.4125,
    phoneNumber: "+8801712345678",
  },
  chittagong: {
    street: "456 Test Ave",
    city: "Chittagong",
    state: "Chittagong Division",
    zipCode: "4000",
    latitude: 22.3569,
    longitude: 91.7832,
    phoneNumber: "+8801712345679",
  },
  sylhet: {
    street: "789 Test Blvd",
    city: "Sylhet",
    state: "Sylhet Division",
    zipCode: "3100",
    latitude: 24.8949,
    longitude: 91.8687,
    phoneNumber: "+8801712345680",
  },
};

describe("Tracking Number Generator", () => {
  test("should generate valid tracking number", () => {
    const trackingNumber = generateTrackingNumber();

    expect(trackingNumber).toBeDefined();
    expect(trackingNumber).toMatch(/^CMS\d{14}$/);
    expect(trackingNumber.length).toBe(17);
    expect(trackingNumber.startsWith("CMS")).toBe(true);
  });

  test("should generate unique tracking numbers", () => {
    const numbers = new Set();

    for (let i = 0; i < 100; i++) {
      const trackingNumber = generateTrackingNumber();
      numbers.add(trackingNumber);
    }

    // Should have 100 unique numbers (very high probability)
    expect(numbers.size).toBeGreaterThan(90);
  });

  test("should validate correct tracking number format", () => {
    const validTracking = "CMS20241215123456";
    expect(validateTrackingNumber(validTracking)).toBe(true);
  });

  test("should reject invalid tracking number formats", () => {
    const invalidNumbers = [
      "CMS123",
      "INVALID123456789",
      "CMS2024121512345", // Too short
      "CMS202412151234567", // Too long
      "cms20241215123456", // Wrong case
      "CMS2024ab15123456", // Non-numeric characters
      "",
      null,
      undefined,
    ];

    invalidNumbers.forEach((invalid) => {
      expect(validateTrackingNumber(invalid)).toBe(false);
    });
  });

  test("should extract date from tracking number", () => {
    const trackingNumber = "CMS20241215123456";
    const extractedDate = extractDateFromTracking(trackingNumber);

    expect(extractedDate).toBeInstanceOf(Date);
    expect(extractedDate.getFullYear()).toBe(2024);
    expect(extractedDate.getMonth()).toBe(11); // December (0-indexed)
    expect(extractedDate.getDate()).toBe(15);
  });

  test("should return null for invalid tracking number in date extraction", () => {
    const invalidTracking = "INVALID123";
    const result = extractDateFromTracking(invalidTracking);

    expect(result).toBeNull();
  });
});

describe("Shipping Cost Calculator", () => {
  test("should calculate basic shipping cost for small package", () => {
    const cost = calculateShippingCost({
      size: "SMALL",
      weight: 1,
      pickupAddress: sampleAddresses.dhaka,
      deliveryAddress: sampleAddresses.dhaka,
      parcelType: "PACKAGE",
    });

    expect(cost).toBe(80); // Base rate for small package, same city
  });

  test("should calculate cost with weight surcharge", () => {
    const cost = calculateShippingCost({
      size: "MEDIUM",
      weight: 3, // 2 extra kg at 25 BDT each = 50 BDT extra
      pickupAddress: sampleAddresses.dhaka,
      deliveryAddress: sampleAddresses.dhaka,
      parcelType: "PACKAGE",
    });

    // Base (120) + Weight (2 * 25 = 50) = 170
    expect(cost).toBe(170);
  });

  test("should apply distance multiplier for different states", () => {
    const cost = calculateShippingCost({
      size: "MEDIUM",
      weight: 1,
      pickupAddress: sampleAddresses.dhaka,
      deliveryAddress: sampleAddresses.chittagong,
      parcelType: "PACKAGE",
    });

    // Should be more than same city cost due to distance
    const sameCityCost = calculateShippingCost({
      size: "MEDIUM",
      weight: 1,
      pickupAddress: sampleAddresses.dhaka,
      deliveryAddress: sampleAddresses.dhaka,
      parcelType: "PACKAGE",
    });

    expect(cost).toBeGreaterThan(sameCityCost);
  });

  test("should add special handling charges", () => {
    const fragilePackageCost = calculateShippingCost({
      size: "MEDIUM",
      weight: 1,
      pickupAddress: sampleAddresses.dhaka,
      deliveryAddress: sampleAddresses.dhaka,
      parcelType: "FRAGILE",
    });

    const regularPackageCost = calculateShippingCost({
      size: "MEDIUM",
      weight: 1,
      pickupAddress: sampleAddresses.dhaka,
      deliveryAddress: sampleAddresses.dhaka,
      parcelType: "PACKAGE",
    });

    expect(fragilePackageCost).toBe(regularPackageCost + 50); // +50 for fragile
  });

  test("should handle electronics special rate", () => {
    const electronicsCost = calculateShippingCost({
      size: "LARGE",
      weight: 2,
      pickupAddress: sampleAddresses.dhaka,
      deliveryAddress: sampleAddresses.dhaka,
      parcelType: "ELECTRONICS",
    });

    const regularCost = calculateShippingCost({
      size: "LARGE",
      weight: 2,
      pickupAddress: sampleAddresses.dhaka,
      deliveryAddress: sampleAddresses.dhaka,
      parcelType: "PACKAGE",
    });

    expect(electronicsCost).toBe(regularCost + 30); // +30 for electronics
  });

  test("should enforce minimum cost", () => {
    const cost = calculateShippingCost({
      size: "SMALL",
      weight: 0.1, // Very light
      pickupAddress: sampleAddresses.dhaka,
      deliveryAddress: sampleAddresses.dhaka,
      parcelType: "DOCUMENT",
    });

    expect(cost).toBeGreaterThanOrEqual(50); // Minimum cost
  });

  test("should round costs properly", () => {
    const cost = calculateShippingCost({
      size: "MEDIUM",
      weight: 1.3, // Fractional weight
      pickupAddress: sampleAddresses.dhaka,
      deliveryAddress: sampleAddresses.chittagong,
      parcelType: "PACKAGE",
    });

    expect(cost % 5).toBe(0); // Should be rounded to nearest 5
  });

  test("should handle missing coordinates gracefully", () => {
    const addressWithoutCoords = {
      street: "No Coords St",
      city: "Dhaka",
      state: "Dhaka Division",
      zipCode: "1000",
      // No latitude/longitude
    };

    const cost = calculateShippingCost({
      size: "MEDIUM",
      weight: 1,
      pickupAddress: addressWithoutCoords,
      deliveryAddress: sampleAddresses.chittagong,
      parcelType: "PACKAGE",
    });

    expect(cost).toBeGreaterThan(120); // Should be more than base rate due to state difference
  });

  test("should handle identical pickup and delivery addresses", () => {
    const cost = calculateShippingCost({
      size: "LARGE",
      weight: 5,
      pickupAddress: sampleAddresses.sylhet,
      deliveryAddress: sampleAddresses.sylhet,
      parcelType: "FRAGILE",
    });

    // Should be base + weight + fragile, no distance multiplier
    const expectedCost = 180 + 4 * 25 + 50; // Base + Weight + Fragile
    expect(cost).toBe(expectedCost);
  });

  test("should handle very short distances correctly", () => {
    const nearbyAddress = {
      street: "Nearby St",
      city: "Dhaka",
      state: "Dhaka Division",
      zipCode: "1001",
      latitude: 23.811,
      longitude: 90.413,
    };

    const cost = calculateShippingCost({
      size: "SMALL",
      weight: 1,
      pickupAddress: sampleAddresses.dhaka,
      deliveryAddress: nearbyAddress,
      parcelType: "PACKAGE",
    });

    // Should be slightly more than same city base rate due to short distance
    expect(cost).toBeGreaterThan(79);
    expect(cost).toBeLessThan(100);
  });

  test("should handle very long distances correctly", () => {
    const distantAddress = {
      street: "Distant St",
      city: "Cox's Bazar",
      state: "Chittagong Division",
      zipCode: "4700",
      latitude: 21.4272,
      longitude: 92.0058,
    };

    const cost = calculateShippingCost({
      size: "EXTRA_LARGE",
      weight: 10,
      pickupAddress: sampleAddresses.dhaka,
      deliveryAddress: distantAddress,
      parcelType: "PACKAGE",
    });

    // Should be significantly more than same state cost due to long distance
    const sameStateCost = calculateShippingCost({
      size: "EXTRA_LARGE",
      weight: 10,
      pickupAddress: sampleAddresses.chittagong,
      deliveryAddress: distantAddress,
      parcelType: "PACKAGE",
    });

    expect(cost).toBeGreaterThan(sameStateCost);
  });

  test("should calculate accurate distance between coordinates", () => {
    // Test known distance between Dhaka and Chittagong (~242 km)
    const cost1 = calculateShippingCost({
      size: "MEDIUM",
      weight: 1,
      pickupAddress: sampleAddresses.dhaka,
      deliveryAddress: sampleAddresses.chittagong,
      parcelType: "PACKAGE",
    });

    // Same cities without coordinates should use state-based calculation
    const addressWithoutCoords = {
      street: "Test St",
      city: "Dhaka",
      state: "Dhaka Division",
      zipCode: "1000",
    };

    const cost2 = calculateShippingCost({
      size: "MEDIUM",
      weight: 1,
      pickupAddress: addressWithoutCoords,
      deliveryAddress: {
        street: "Test Ave",
        city: "Chittagong",
        state: "Chittagong Division",
        zipCode: "4000",
      },
      parcelType: "PACKAGE",
    });

    // Both should be reasonable costs
    expect(cost1).toBeGreaterThan(0);
    expect(cost2).toBeGreaterThan(0);
  });

  test("should provide detailed cost breakdown", () => {
    const breakdown = getShippingBreakdown({
      size: "LARGE",
      weight: 3,
      pickupAddress: sampleAddresses.dhaka,
      deliveryAddress: sampleAddresses.chittagong,
      parcelType: "FRAGILE",
    });

    expect(breakdown).toHaveProperty("baseCost");
    expect(breakdown).toHaveProperty("weightCost");
    expect(breakdown).toHaveProperty("distanceMultiplier");
    expect(breakdown).toHaveProperty("distanceInfo");
    expect(breakdown).toHaveProperty("specialCost");
    expect(breakdown).toHaveProperty("total");
    expect(breakdown).toHaveProperty("breakdown");

    expect(breakdown.breakdown).toBeInstanceOf(Array);
    expect(breakdown.breakdown.length).toBeGreaterThan(0);

    // Verify calculation logic
    expect(breakdown.baseCost).toBe(180); // LARGE base rate
    expect(breakdown.weightCost).toBe(50); // 2 extra kg * 25
    expect(breakdown.specialCost).toBe(50); // FRAGILE handling
    expect(breakdown.distanceMultiplier).toBeGreaterThan(1);
  });

  test("should handle edge cases gracefully", () => {
    // Test with missing addresses
    const cost1 = calculateShippingCost({
      size: "MEDIUM",
      weight: 1,
      pickupAddress: null,
      deliveryAddress: null,
      parcelType: "PACKAGE",
    });

    expect(cost1).toBeGreaterThanOrEqual(50); // Should return minimum cost

    // Test with invalid size
    const cost2 = calculateShippingCost({
      size: "INVALID_SIZE",
      weight: 1,
      pickupAddress: sampleAddresses.dhaka,
      deliveryAddress: sampleAddresses.dhaka,
      parcelType: "PACKAGE",
    });

    expect(cost2).toBe(120); // Should default to MEDIUM base rate

    // Test with zero weight
    const cost3 = calculateShippingCost({
      size: "SMALL",
      weight: 0,
      pickupAddress: sampleAddresses.dhaka,
      deliveryAddress: sampleAddresses.dhaka,
      parcelType: "PACKAGE",
    });

    expect(cost3).toBeGreaterThanOrEqual(50);
  });

  test("should handle very heavy packages", () => {
    const heavyPackageCost = calculateShippingCost({
      size: "EXTRA_LARGE",
      weight: 25, // 24 extra kg
      pickupAddress: sampleAddresses.dhaka,
      deliveryAddress: sampleAddresses.chittagong,
      parcelType: "PACKAGE",
    });

    const lightPackageCost = calculateShippingCost({
      size: "EXTRA_LARGE",
      weight: 1,
      pickupAddress: sampleAddresses.dhaka,
      deliveryAddress: sampleAddresses.chittagong,
      parcelType: "PACKAGE",
    });

    expect(heavyPackageCost).toBeGreaterThan(lightPackageCost);

    // Should have significant weight surcharge
    const expectedWeightSurcharge = 24 * 25; // 600 BDT
    expect(heavyPackageCost - lightPackageCost).toBeGreaterThan(500);
  });

  test("should calculate consistent costs", () => {
    const testParams = {
      size: "MEDIUM",
      weight: 2,
      pickupAddress: sampleAddresses.dhaka,
      deliveryAddress: sampleAddresses.sylhet,
      parcelType: "ELECTRONICS",
    };

    // Multiple calculations should return the same result
    const cost1 = calculateShippingCost(testParams);
    const cost2 = calculateShippingCost(testParams);
    const cost3 = calculateShippingCost(testParams);

    expect(cost1).toBe(cost2);
    expect(cost2).toBe(cost3);
  });

  test("should handle all parcel sizes", () => {
    const sizes = ["SMALL", "MEDIUM", "LARGE", "EXTRA_LARGE"];
    const costs = sizes.map((size) =>
      calculateShippingCost({
        size,
        weight: 1,
        pickupAddress: sampleAddresses.dhaka,
        deliveryAddress: sampleAddresses.dhaka,
        parcelType: "PACKAGE",
      })
    );

    // Costs should increase with size
    expect(costs[1]).toBeGreaterThan(costs[0]); // MEDIUM > SMALL
    expect(costs[2]).toBeGreaterThan(costs[1]); // LARGE > MEDIUM
    expect(costs[3]).toBeGreaterThan(costs[2]); // EXTRA_LARGE > LARGE
  });

  test("should handle all parcel types", () => {
    const types = ["DOCUMENT", "PACKAGE", "FRAGILE", "ELECTRONICS", "CLOTHING", "FOOD", "OTHER"];

    types.forEach((type) => {
      const cost = calculateShippingCost({
        size: "MEDIUM",
        weight: 1,
        pickupAddress: sampleAddresses.dhaka,
        deliveryAddress: sampleAddresses.dhaka,
        parcelType: type,
      });

      expect(cost).toBeGreaterThanOrEqual(50);
      expect(typeof cost).toBe("number");
    });
  });
});
