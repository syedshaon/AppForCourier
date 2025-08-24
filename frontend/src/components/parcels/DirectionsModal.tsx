// src/components/parcels/DirectionsModal.tsx
import { useState } from "react";
import { LoadScript, GoogleMap, DirectionsRenderer } from "@react-google-maps/api";
import { X } from "lucide-react";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 0,
  lng: 0,
};

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface DirectionsModalProps {
  deliveryAddress: Address;
  isOpen: boolean;
  onClose: () => void;
}

export default function DirectionsModal({ deliveryAddress, isOpen, onClose }: DirectionsModalProps) {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  };

  const loadDirections = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current location
      const position = await getCurrentLocation();
      const currentLoc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCurrentLocation(currentLoc);

      // Create DirectionsService
      const DirectionsService = new google.maps.DirectionsService();

      // Format destination address
      const destination = `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.zipCode}, ${deliveryAddress.country}`;

      // Request directions
      const result = await DirectionsService.route({
        origin: currentLoc,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirections(result);
    } catch (err: any) {
      console.error("Error loading directions:", err);
      setError(err.message || "Failed to load directions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapLoad = () => {
    loadDirections();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="border rounded-lg shadow-xl w-full max-w-4xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Directions to Delivery Address</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <GoogleMap mapContainerStyle={mapContainerStyle} center={currentLocation || center} zoom={10} onLoad={handleMapLoad}>
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          </LoadScript>

          {isLoading && (
            <div className="mt-4 text-center">
              <p>Loading directions...</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              <p>Error: {error}</p>
              <p className="text-sm mt-1">Please ensure location services are enabled and try again.</p>
            </div>
          )}

          {directions && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Route Summary:</h3>
              <p className="text-sm">
                Distance: {directions.routes[0].legs[0].distance?.text} • Duration: {directions.routes[0].legs[0].duration?.text}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
