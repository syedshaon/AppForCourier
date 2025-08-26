import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { parcelApi } from "../../services/api";
import { toast } from "sonner";
import { Loader2, MapPin, Package, Weight, Calendar, Phone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useTranslation } from "react-i18next";

const parcelSchema = z.object({
  pickupAddress: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    country: z.string().min(1, "Country is required"),
    phoneNumber: z
      .string()
      .regex(/^[\+]?[0-9\s\-\(\)]{10,15}$/, "Please provide a valid phone number")
      .min(1, "Phone number is required"),
  }),
  deliveryAddress: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    country: z.string().min(1, "Country is required"),
    phoneNumber: z
      .string()
      .regex(/^[\+]?[0-9\s\-\(\)]{10,15}$/, "Please provide a valid phone number")
      .min(1, "Phone number is required"),
  }),
  parcelSize: z.enum(["SMALL", "MEDIUM", "LARGE", "EXTRA_LARGE"]),
  parcelType: z.enum(["DOCUMENT", "PACKAGE", "FRAGILE", "ELECTRONICS", "CLOTHING", "FOOD", "OTHER"]),
  weight: z.number().min(0.1, "Weight must be at least 0.1kg").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be at most 500 characters"),
  paymentType: z.enum(["PREPAID", "COD"]),
  codAmount: z.number().min(0, "COD amount must be positive").optional(),
  pickupDate: z.string().refine((date) => {
    if (!date) return true;
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, "Pickup date must be today or in the future"),
});

type ParcelFormData = z.infer<typeof parcelSchema>;

export default function CreateParcelForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation("createParcel");
  const { user } = useAuthStore();

  const navigate = useNavigate();
  usePageTitle(t("title"));

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ParcelFormData>({
    resolver: zodResolver(parcelSchema),
    defaultValues: {
      paymentType: "PREPAID",
      parcelSize: "MEDIUM",
      parcelType: "PACKAGE",
      pickupAddress: {
        country: "Bangladesh",
        state: "Dhaka",
        city: "Dhaka",
        zipCode: "1207",
        street: "House 123, Road 4, Dhanmondi",
        phoneNumber: "01711223344",
      },
      deliveryAddress: {
        country: "Bangladesh",
        state: "Chattogram",
        city: "Chattogram",
        zipCode: "4000",
        street: "House 456, Road 7, Agrabad",
        phoneNumber: "01712233445",
      },
    },
  });

  const paymentType = watch("paymentType");

  const onSubmit = async (data: ParcelFormData) => {
    setIsLoading(true);
    try {
      const response = await parcelApi.createParcel(data);
      toast.success(t("success"));
      console.log("Created Parcel:", response.data);
      reset();
      navigate(`/parcels/${response.data.data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 border rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {user?.role === "CUSTOMER" && `${t("headingAsCustomer")}`}
        {user?.role === "ADMIN" && `${t("headingAsAdmin")}`} {user?.role === "AGENT" && `${t("headingAsAdmin")}`}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Address Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pickup Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {t("pickupAddress")}
            </h3>
            {renderAddressFields("pickupAddress", register, errors, t)}
          </div>

          {/* Delivery Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {t("deliveryAddress")}
            </h3>
            {renderAddressFields("deliveryAddress", register, errors, t)}
          </div>
        </div>

        {/* Parcel Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            {t("parcelDetails")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t("parcelSize")}</label>
              <Select onValueChange={(value) => setValue("parcelSize", value as any)} defaultValue="MEDIUM">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("parcelSize")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMALL">{t("sizes.SMALL")}</SelectItem>
                  <SelectItem value="MEDIUM">{t("sizes.MEDIUM")}</SelectItem>
                  <SelectItem value="LARGE">{t("sizes.LARGE")}</SelectItem>
                  <SelectItem value="EXTRA_LARGE">{t("sizes.EXTRA_LARGE")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t("parcelType")}</label>
              <Select onValueChange={(value) => setValue("parcelType", value as any)} defaultValue="PACKAGE">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("parcelType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOCUMENT">{t("types.DOCUMENT")}</SelectItem>
                  <SelectItem value="PACKAGE">{t("types.PACKAGE")}</SelectItem>
                  <SelectItem value="FRAGILE">{t("types.FRAGILE")}</SelectItem>
                  <SelectItem value="ELECTRONICS">{t("types.ELECTRONICS")}</SelectItem>
                  <SelectItem value="CLOTHING">{t("types.CLOTHING")}</SelectItem>
                  <SelectItem value="FOOD">{t("types.FOOD")}</SelectItem>
                  <SelectItem value="OTHER">{t("types.OTHER")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Weight className="w-4 h-4 inline mr-1" />
                {t("weight")}
              </label>
              <input type="number" step="0.1" {...register("weight", { valueAsNumber: true })} className="w-full p-2 border rounded-md" placeholder="0.0" />
              {errors.weight && <p className="text-red-500 text-sm">{t("validation.weightMin")}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                {t("pickupDate")}
              </label>
              <input type="date" {...register("pickupDate")} className="w-full p-2 border rounded-md" />
              {errors.pickupDate && <p className="text-red-500 text-sm">{t("validation.pickupDateFuture")}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t("description")}</label>
            <textarea {...register("description")} className="w-full p-2 border rounded-md" rows={3} placeholder={t("descriptionPlaceholder")} />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.type === "min" ? t("validation.descriptionMin") : t("validation.descriptionMax")}</p>}
          </div>
        </div>

        {/* Payment Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t("paymentDetails")}</h3>

          <div>
            <label className="block text-sm font-medium mb-2">{t("paymentType")}</label>
            <Select onValueChange={(value) => setValue("paymentType", value as any)} defaultValue="PREPAID">
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("paymentType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PREPAID">{t("paymentTypes.PREPAID")}</SelectItem>
                <SelectItem value="COD">{t("paymentTypes.COD")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentType === "COD" && (
            <div>
              <label className="block text-sm font-medium mb-2">{t("codAmount")}</label>
              <input type="number" step="0.01" {...register("codAmount", { valueAsNumber: true })} className="w-full p-2 border rounded-md" placeholder="0.00" />
              {errors.codAmount && <p className="text-red-500 text-sm">{t("validation.codAmountMin")}</p>}
            </div>
          )}
        </div>

        <button type="submit" disabled={isLoading} className="w-full cursor-pointer bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t("createParcel")}
        </button>
      </form>
    </div>
  );
}

function renderAddressFields(prefix: string, register: any, errors: any, t: any) {
  const fieldTranslations = {
    street: t("validation.streetRequired"),
    city: t("validation.cityRequired"),
    state: t("validation.stateRequired"),
    zipCode: t("validation.zipCodeRequired"),
    country: t("validation.countryRequired"),
    phoneNumber: t("validation.phoneNumberRequired"),
  };

  return (
    <>
      <div>
        <input {...register(`${prefix}.street`)} placeholder="Street Address" className="w-full p-2 border rounded-md" />
        {errors[prefix]?.street && <p className="text-red-500 text-sm">{fieldTranslations.street}</p>}
      </div>

      <div>
        <input {...register(`${prefix}.city`)} placeholder="City" className="w-full p-2 border rounded-md" />
        {errors[prefix]?.city && <p className="text-red-500 text-sm">{fieldTranslations.city}</p>}
      </div>

      <div>
        <input {...register(`${prefix}.state`)} placeholder="State" className="w-full p-2 border rounded-md" />
        {errors[prefix]?.state && <p className="text-red-500 text-sm">{fieldTranslations.state}</p>}
      </div>

      <div>
        <input {...register(`${prefix}.zipCode`)} placeholder="Zip Code" className="w-full p-2 border rounded-md" />
        {errors[prefix]?.zipCode && <p className="text-red-500 text-sm">{fieldTranslations.zipCode}</p>}
      </div>

      <div>
        <input {...register(`${prefix}.country`)} placeholder="Country" className="w-full p-2 border rounded-md" />
        {errors[prefix]?.country && <p className="text-red-500 text-sm">{fieldTranslations.country}</p>}
      </div>

      <div>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input {...register(`${prefix}.phoneNumber`)} placeholder="Phone Number" className="w-full p-2 pl-10 border rounded-md" />
        </div>
        {errors[prefix]?.phoneNumber && <p className="text-red-500 text-sm">{errors[prefix]?.phoneNumber?.message || fieldTranslations.phoneNumber}</p>}
      </div>
    </>
  );
}
