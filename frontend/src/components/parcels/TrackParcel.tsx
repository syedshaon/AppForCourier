// src/components/parcels/TrackParcel.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { parcelApi } from "../../services/parcelApi";
import { toast } from "sonner";
import { Search, MapPin, Clock, CheckCircle, Truck } from "lucide-react";

interface TrackingInfo {
  trackingNumber: string;
  status: string;
  pickupCity: string;
  deliveryCity: string;
  expectedDelivery: string;
  actualDelivery: string | null;
  statusHistory: Array<{
    status: string;
    notes: string;
    timestamp: string;
    latitude: number | null;
    longitude: number | null;
  }>;
}

export default function TrackParcel() {
  const { trackingNumber: trackingNumberFromUrl } = useParams();
  const [trackingNumber, setTrackingNumber] = useState(trackingNumberFromUrl || "");
  const [isLoading, setIsLoading] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);

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
      setTrackingNumber(trackingNum); // Update input field with the tracking number
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

  return (
    <div className="max-w-4xl mx-auto p-6">
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

          <h3 className="text-lg font-semibold mb-4">Status History</h3>
          <div className="space-y-4">
            {trackingInfo.statusHistory.map((update, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">{getStatusIcon(update.status)}</div>
                <div className="flex-1">
                  <p className="font-semibold capitalize">{update.status.toLowerCase().replace("_", " ")}</p>
                  <p className="text-sm text-gray-600">{update.notes}</p>
                  <p className="text-xs text-gray-500">{new Date(update.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
