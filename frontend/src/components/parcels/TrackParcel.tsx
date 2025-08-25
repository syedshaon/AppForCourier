// src/components/parcels/TrackParcel.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { parcelApi } from "../../services/api";
import { toast } from "sonner";
import { Search, MapPin, Clock, CheckCircle, Truck, Wifi, WifiOff } from "lucide-react";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import { useParcelTracking } from "../../hooks/useParcelTracking";
import { useSocket } from "../../store/SocketContext";

interface StatusUpdate {
  status: string;
  notes: string;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
}

interface TrackingInfo {
  trackingNumber: string;
  status: string;
  pickupCity: string;
  deliveryCity: string;
  expectedDelivery: string;
  actualDelivery: string | null;
  statusHistory: StatusUpdate[];
}

interface RealTimeUpdate extends StatusUpdate {
  trackingNumber: string;
  receivedAt: string;
}

export default function TrackParcel() {
  const { trackingNumber: trackingNumberFromUrl } = useParams();
  const [trackingNumber, setTrackingNumber] = useState(trackingNumberFromUrl || "");
  const [isLoading, setIsLoading] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState<RealTimeUpdate[]>([]);
  const { socket, isConnected, connectionError } = useSocket();

  // Use the URL parameter FIRST, then fall back to trackingInfo
  const effectiveTrackingNumber = trackingNumberFromUrl || trackingInfo?.trackingNumber;

  // Handle real-time status updates
  const handleStatusUpdate = (update: any) => {
    const newUpdate: RealTimeUpdate = {
      ...update,
      receivedAt: new Date().toLocaleString(),
      latitude: update.latitude || null,
      longitude: update.longitude || null,
      notes: update.notes || "Status updated",
    };

    setRealTimeUpdates((prev) => [newUpdate, ...prev]);

    // Update the main tracking info if it matches
    if (trackingInfo && update.trackingNumber === trackingInfo.trackingNumber) {
      setTrackingInfo((prev) => ({
        ...prev!,
        status: update.status,
        statusHistory: [
          {
            status: update.status,
            notes: update.notes || "Status updated",
            timestamp: update.timestamp || new Date().toISOString(),
            latitude: update.latitude || null,
            longitude: update.longitude || null,
          },
          ...prev!.statusHistory,
        ],
      }));

      toast.success(`Status updated: ${update.status}`);
    }
  };

  // Use the tracking hook with the effective tracking number
  const { isConnected: isTrackingConnected } = useParcelTracking(effectiveTrackingNumber, handleStatusUpdate);
  if (isConnected) {
    console.log("Tracking socket connected:", isTrackingConnected);
  }

  // Get the latest status update (either from API or real-time)
  const latestUpdate = trackingInfo?.statusHistory[0];
  const hasLocation = latestUpdate?.latitude && latestUpdate?.longitude;

  // Map configuration
  const mapContainerStyle = {
    width: "100%",
    height: "200px",
  };

  const center = hasLocation
    ? {
        lat: latestUpdate.latitude ?? 0,
        lng: latestUpdate.longitude ?? 0,
      }
    : {
        lat: 0,
        lng: 0,
      };

  // Debug logging
  useEffect(() => {
    console.log("📊 TrackParcel component state:", {
      trackingNumberFromUrl,
      effectiveTrackingNumber,
      trackingInfo: trackingInfo?.trackingNumber,
      isConnected,
      connectionError,
      hasSocket: !!socket,
    });
  }, [trackingNumberFromUrl, effectiveTrackingNumber, trackingInfo, isConnected, connectionError, socket]);

  // Fetch tracking info when component mounts with tracking number from URL
  useEffect(() => {
    if (trackingNumberFromUrl) {
      fetchTrackingInfo(trackingNumberFromUrl);
    }
  }, [trackingNumberFromUrl]);

  const fetchTrackingInfo = async (trackingNum: string) => {
    if (!trackingNum.trim()) return;

    setIsLoading(true);
    try {
      const response = await parcelApi.trackParcel(trackingNum);
      setTrackingInfo(response.data.data);
      setTrackingNumber(trackingNum);
      setRealTimeUpdates([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Parcel not found");
      setTrackingInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchTrackingInfo(trackingNumber);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "IN_TRANSIT":
      case "OUT_FOR_DELIVERY":
        return <Truck className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "text-green-600 bg-green-50 border-green-200";
      case "IN_TRANSIT":
      case "OUT_FOR_DELIVERY":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "FAILED":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Connection Status Indicator */}
      <div className={`flex items-center gap-2 p-3 mb-4 rounded-lg ${isConnected ? "bg-green-50 text-green-700 border border-green-200" : "bg-yellow-50 text-yellow-700 border border-yellow-200"}`}>
        {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        <span className="text-sm">{isConnected ? "Real-time updates connected" : "Real-time updates disconnected"}</span>
        {connectionError && <span className="text-xs ml-2">({connectionError})</span>}
      </div>

      <div className="border rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Track Your Parcel</h2>

        <form onSubmit={handleTrack} className="flex gap-2">
          <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Enter tracking number" className="flex-1 p-3 border rounded-lg" required />
          <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Track
          </button>
        </form>
      </div>

      {isLoading && (
        <div className="text-center p-8">
          <p>Loading tracking information...</p>
        </div>
      )}

      {trackingInfo && !isLoading && (
        <div className="border rounded-lg shadow-md p-6">
          {/* Current Status Banner */}
          <div className={`p-4 rounded-lg mb-6 border ${getStatusColor(trackingInfo.status)}`}>
            <div className="flex items-center gap-3">
              {getStatusIcon(trackingInfo.status)}
              <div>
                <h3 className="font-semibold">Current Status</h3>
                <p className="capitalize text-lg">{trackingInfo.status.toLowerCase().replace("_", " ")}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold">From</h3>
              <p>{trackingInfo.pickupCity}</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              {getStatusIcon(trackingInfo.status)}
              <h3 className="font-semibold mt-2">Status</h3>
              <p className="capitalize">{trackingInfo.status.toLowerCase().replace("_", " ")}</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold">To</h3>
              <p>{trackingInfo.deliveryCity}</p>
            </div>
          </div>

          {/* Current Location Map */}
          {hasLocation && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Current Location</h3>
              <div className="border rounded-lg overflow-hidden">
                <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                  <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={12}>
                    <Marker position={center} />
                  </GoogleMap>
                </LoadScript>
                <div className="p-3 bg-gray-50 text-sm">
                  <p className="text-gray-600">Last updated: {new Date(latestUpdate.timestamp).toLocaleString()}</p>
                  <p className="text-gray-500 text-xs">
                    Coordinates: {latestUpdate.latitude?.toFixed(6)}, {latestUpdate.longitude?.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Updates Section */}
          {realTimeUpdates.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Live Updates</h3>
              <div className="space-y-2">
                {realTimeUpdates.slice(0, 5).map((update, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-blue-700">LIVE</span>
                      <span className="text-xs text-blue-600">{update.receivedAt}</span>
                    </div>
                    <p className="mt-1 text-sm">
                      <span className="font-medium capitalize">{update.status.toLowerCase().replace("_", " ")}</span>
                      {update.notes && ` - ${update.notes}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status History */}
          <h3 className="text-lg font-semibold mb-4">Status History</h3>
          <div className="space-y-4">
            {trackingInfo.statusHistory.map((update, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">{getStatusIcon(update.status)}</div>
                <div className="flex-1">
                  <p className="font-semibold capitalize">{update.status.toLowerCase().replace("_", " ")}</p>
                  <p className="text-sm text-gray-600">{update.notes}</p>
                  <p className="text-xs text-gray-500">{new Date(update.timestamp).toLocaleString()}</p>
                  {update.latitude && update.longitude && (
                    <p className="text-xs text-gray-500 mt-1">
                      Location: {update.latitude.toFixed(6)}, {update.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
