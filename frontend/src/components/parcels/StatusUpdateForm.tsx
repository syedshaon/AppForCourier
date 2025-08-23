// src/components/parcels/StatusUpdateForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { parcelApi } from "../../services/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const statusUpdateSchema = z.object({
  status: z.enum(["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "CANCELLED"]),
  notes: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type StatusUpdateData = z.infer<typeof statusUpdateSchema>;

interface StatusUpdateFormProps {
  parcelId: string;
  currentStatus: string;
  onStatusUpdate: () => void;
}

export default function StatusUpdateForm({ parcelId, currentStatus, onStatusUpdate }: StatusUpdateFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StatusUpdateData>({
    resolver: zodResolver(statusUpdateSchema),
  });

  const onSubmit = async (data: StatusUpdateData) => {
    setIsLoading(true);
    try {
      await parcelApi.updateStatus(parcelId, data);
      toast.success("Status updated successfully!");
      reset();
      onStatusUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const getNextStatusOptions = () => {
    const statusFlow = {
      PENDING: ["ASSIGNED", "CANCELLED"],
      ASSIGNED: ["PICKED_UP", "CANCELLED"],
      PICKED_UP: ["IN_TRANSIT", "FAILED"],
      IN_TRANSIT: ["OUT_FOR_DELIVERY", "FAILED"],
      OUT_FOR_DELIVERY: ["DELIVERED", "FAILED"],
      DELIVERED: [],
      FAILED: [],
      CANCELLED: [],
    };

    return statusFlow[currentStatus as keyof typeof statusFlow] || [];
  };

  const nextStatusOptions = getNextStatusOptions();

  if (nextStatusOptions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-2">Status Update</h3>
        <p className="text-sm text-gray-600">No further status updates available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Update Status</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">New Status</label>
          <select {...register("status")} className="w-full p-2 border rounded-md" required>
            <option value="">Select status</option>
            {nextStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
          {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea {...register("notes")} className="w-full p-2 border rounded-md" rows={3} placeholder="Add update notes..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Latitude</label>
            <input type="number" step="any" {...register("latitude", { valueAsNumber: true })} className="w-full p-2 border rounded-md" placeholder="Optional" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Longitude</label>
            <input type="number" step="any" {...register("longitude", { valueAsNumber: true })} className="w-full p-2 border rounded-md" placeholder="Optional" />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Update Status"}
        </button>
      </form>
    </div>
  );
}
