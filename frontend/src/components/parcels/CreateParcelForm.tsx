import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { parcelApi } from "../../services/parcelApi";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";
import { Loader2, MapPin, Package, Weight, Calendar } from "lucide-react";

const parcelSchema = z.object({
  pickupAddress: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    country: z.string().min(1, "Country is required"), // Make country required
  }),
  deliveryAddress: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    country: z.string().min(1, "Country is required"), // Make country required
  }),
  parcelSize: z.enum(["SMALL", "MEDIUM", "LARGE", "EXTRA_LARGE"]),
  parcelType: z.enum(["DOCUMENT", "PACKAGE", "FRAGILE", "ELECTRONICS", "CLOTHING", "FOOD", "OTHER"]),
  weight: z.number().min(0.1, "Weight must be at least 0.1kg").optional(),
  // description: z.string().optional(),
  // description is required and must be at least 10 characters
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be at most 500 characters"),
  paymentType: z.enum(["PREPAID", "COD"]),
  codAmount: z.number().min(0, "COD amount must be positive").optional(),
  // pickupDate: z.string().optional(),
  // if present pickupDate must be a future date
  pickupDate: z.string().refine((date) => {
    if (!date) return true; // allow empty
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // set to start of today
    return selectedDate >= today;
  }, "Pickup date must be today or in the future"),
});

type ParcelFormData = z.infer<typeof parcelSchema>;

export default function CreateParcelForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ParcelFormData>({
    resolver: zodResolver(parcelSchema),
    defaultValues: {
      paymentType: "PREPAID",
      parcelSize: "MEDIUM",
      parcelType: "PACKAGE",
      pickupAddress: {
        country: "Bangladesh", // Set default value here
      },
      deliveryAddress: {
        country: "Bangladesh", // Set default value here
      },
    },
  });

  const paymentType = watch("paymentType");

  const onSubmit = async (data: ParcelFormData) => {
    setIsLoading(true);
    try {
      const response = await parcelApi.createParcel(data);
      toast.success("Parcel created successfully!");
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create parcel");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 border  rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create New Parcel</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Address Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pickup Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Pickup Address
            </h3>
            {renderAddressFields("pickupAddress", register, errors)}
          </div>

          {/* Delivery Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Delivery Address
            </h3>
            {renderAddressFields("deliveryAddress", register, errors)}
          </div>
        </div>

        {/* Parcel Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Parcel Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Parcel Size</label>
              <select {...register("parcelSize")} className="w-full p-2 border rounded-md">
                <option className="bg-secondary " value="SMALL">
                  Small
                </option>
                <option className="bg-secondary " value="MEDIUM">
                  Medium
                </option>
                <option className="bg-secondary " value="LARGE">
                  Large
                </option>
                <option className="bg-secondary " value="EXTRA_LARGE">
                  Extra Large
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Parcel Type</label>
              <select {...register("parcelType")} className="w-full p-2 border rounded-md">
                <option className="bg-secondary " value="DOCUMENT">
                  Document
                </option>
                <option className="bg-secondary " value="PACKAGE">
                  Package
                </option>
                <option className="bg-secondary " value="FRAGILE">
                  Fragile
                </option>
                <option className="bg-secondary " value="ELECTRONICS">
                  Electronics
                </option>
                <option className="bg-secondary " value="CLOTHING">
                  Clothing
                </option>
                <option className="bg-secondary " value="FOOD">
                  Food
                </option>
                <option className="bg-secondary " value="OTHER">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Weight className="w-4 h-4 inline mr-1" />
                Weight (kg)
              </label>
              <input type="number" step="0.1" {...register("weight", { valueAsNumber: true })} className="w-full p-2 border rounded-md" placeholder="0.0" />
              {errors.weight && <p className="text-red-500 text-sm">{errors.weight.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Pickup Date
              </label>
              <input type="date" {...register("pickupDate")} className="w-full p-2 border rounded-md" />
              {errors.pickupDate && <p className="text-red-500 text-sm">{errors.pickupDate.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea {...register("description")} className="w-full p-2 border rounded-md" rows={3} placeholder="Describe your parcel contents..." />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>
        </div>

        {/* Payment Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Payment Details</h3>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" value="PREPAID" {...register("paymentType")} className="w-4 h-4" />
              Prepaid
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" value="COD" {...register("paymentType")} className="w-4 h-4" />
              Cash on Delivery
            </label>
          </div>

          {paymentType === "COD" && (
            <div>
              <label className="block text-sm font-medium mb-2">COD Amount</label>
              <input type="number" step="0.01" {...register("codAmount", { valueAsNumber: true })} className="w-full p-2 border rounded-md" placeholder="0.00" />
              {errors.codAmount && <p className="text-red-500 text-sm">{errors.codAmount.message}</p>}
            </div>
          )}
        </div>

        <button type="submit" disabled={isLoading} className="w-full cursor-pointer bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Parcel"}
        </button>
      </form>
    </div>
  );
}

function renderAddressFields(prefix: string, register: any, errors: any) {
  return (
    <>
      <div>
        <input {...register(`${prefix}.street`)} placeholder="Street Address" className="w-full p-2 border rounded-md" />
        {errors[prefix]?.street && <p className="text-red-500 text-sm">{errors[prefix].street.message}</p>}
      </div>

      <div>
        <input {...register(`${prefix}.city`)} placeholder="City" className="w-full p-2 border rounded-md" />
        {errors[prefix]?.city && <p className="text-red-500 text-sm">{errors[prefix].city.message}</p>}
      </div>

      <div>
        <input {...register(`${prefix}.state`)} placeholder="State" className="w-full p-2 border rounded-md" />
        {errors[prefix]?.state && <p className="text-red-500 text-sm">{errors[prefix].state.message}</p>}
      </div>

      <div>
        <input {...register(`${prefix}.zipCode`)} placeholder="Zip Code" className="w-full p-2 border rounded-md" />
        {errors[prefix]?.zipCode && <p className="text-red-500 text-sm">{errors[prefix].zipCode.message}</p>}
      </div>

      <div>
        <input {...register(`${prefix}.country`)} placeholder="Country" className="w-full p-2 border rounded-md" />
        {errors[prefix]?.country && <p className="text-red-500 text-sm">{errors[prefix].country.message}</p>}
      </div>
    </>
  );
}
