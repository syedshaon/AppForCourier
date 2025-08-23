// src/components/parcels/AgentAssignmentForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { parcelApi } from "../../services/parcelApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAgents } from "../../hooks/useAgents";

const agentAssignmentSchema = z.object({
  agentId: z.string().min(1, "Agent is required"),
});

type AgentAssignmentData = z.infer<typeof agentAssignmentSchema>;

interface AgentAssignmentFormProps {
  parcelId: string;
  currentAgent?: { id: string; firstName: string; lastName: string };
  onAgentAssigned: () => void;
}

export default function AgentAssignmentForm({ parcelId, currentAgent, onAgentAssigned }: AgentAssignmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { agents, loading: agentsLoading } = useAgents();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AgentAssignmentData>({
    resolver: zodResolver(agentAssignmentSchema),
  });

  const onSubmit = async (data: AgentAssignmentData) => {
    setIsLoading(true);
    try {
      await parcelApi.assignAgent(parcelId, data);
      toast.success("Agent assigned successfully!");
      reset();
      onAgentAssigned();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to assign agent");
    } finally {
      setIsLoading(false);
    }
  };

  if (agentsLoading) {
    return (
      <div className="border rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Assign Agent</h3>
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Assign Agent</h3>

      {currentAgent && (
        <div className="mb-4 p-3   rounded-md">
          <p className="text-sm font-medium">Current Agent:</p>
          <p className="text-sm">
            {currentAgent.firstName} {currentAgent.lastName}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Agent</label>
          <select {...register("agentId")} className="w-full p-2 border rounded-md" required>
            <option className="bg-secondary" value="">
              Select an agent
            </option>
            {agents.map((agent) => (
              <option className="bg-secondary" key={agent.id} value={agent.id}>
                {agent.firstName} {agent.lastName} - {agent.phoneNumber}
              </option>
            ))}
          </select>
          {errors.agentId && <p className="text-red-500 text-sm">{errors.agentId.message}</p>}
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Assign Agent"}
        </button>
      </form>
    </div>
  );
}
