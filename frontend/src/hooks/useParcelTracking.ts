// src/hooks/useParcelTracking.ts
import { useEffect } from "react";
import { useSocket } from "../store/SocketContext";

interface StatusUpdate {
  trackingNumber: string;
  status: string;
  notes?: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
}

export const useParcelTracking = (trackingNumber: string | undefined, onStatusUpdate: (update: StatusUpdate) => void) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    console.log("🔍 useParcelTracking effect running", {
      hasSocket: !!socket,
      isConnected,
      trackingNumber,
    });

    if (!socket || !isConnected || !trackingNumber) {
      console.log("❌ Skipping socket setup - missing requirements");
      return;
    }

    console.log(`🎯 Joining parcel room: parcel_${trackingNumber}`);

    // Join the parcel room with acknowledgement
    socket.emit("joinParcel", trackingNumber, (response: any) => {
      console.log("✅ Join parcel acknowledgement:", response);
    });

    // Listen for status updates
    const handleStatusUpdate = (data: StatusUpdate) => {
      console.log("📨 statusUpdated event received:", data);
      if (data.trackingNumber === trackingNumber) {
        console.log("✅ Matching tracking number, updating UI");
        onStatusUpdate(data);
      } else {
        console.log("❌ Tracking number mismatch", {
          received: data.trackingNumber,
          expected: trackingNumber,
        });
      }
    };

    socket.on("statusUpdated", handleStatusUpdate);

    // Listen to all events for debugging
    const handleAnyEvent = (eventName: string, ...args: any[]) => {
      console.log(`📡 Socket event: ${eventName}`, args);
    };

    socket.onAny(handleAnyEvent);

    // Cleanup
    return () => {
      console.log(`🚪 Leaving parcel room: ${trackingNumber}`);
      socket.emit("leaveParcel", trackingNumber);
      socket.off("statusUpdated", handleStatusUpdate);
      socket.offAny(handleAnyEvent);
    };
  }, [socket, isConnected, trackingNumber, onStatusUpdate]);

  return { isConnected: isConnected && !!trackingNumber };
};
