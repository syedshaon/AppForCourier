// src/contexts/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectionError: null,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Initializing Socket.IO connection...");

    // Initialize socket connection
    const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Connected to server");
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from server:", reason);
      setIsConnected(false);
      setConnectionError(`Disconnected: ${reason}`);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error.message);
      setConnectionError(`Connection error: ${error.message}`);
      setIsConnected(false);
    });

    newSocket.on("error", (error) => {
      console.error("❌ Socket error:", error);
      setConnectionError(`Socket error: ${error}`);
    });

    newSocket.on("reconnect", (attempt) => {
      console.log(`✅ Reconnected after ${attempt} attempts`);
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on("reconnect_attempt", (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}`);
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("❌ Reconnection error:", error);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed");
      setConnectionError("Reconnection failed");
    });

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up socket connection...");
      newSocket.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={{ socket, isConnected, connectionError }}>{children}</SocketContext.Provider>;
};
