// src/hooks/useAgents.ts
import { useState, useEffect } from "react";
import { adminApi } from "../services/api";

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getAgents(); // You'll need to create this API method
        setAgents(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch agents");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  return { agents, loading, error };
};
