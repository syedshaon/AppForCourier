// src/components/parcels/ParcelDetail.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { parcelApi } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";
import { Package, MapPin, Clock, User, Truck, CheckCircle, AlertCircle, Phone, Mail, Calendar, DollarSign, Weight, QrCode } from "lucide-react";
import StatusUpdateForm from "./StatusUpdateForm";
import AgentAssignmentForm from "./AgentAssignmentForm";

interface ParcelDetail {
  id: string;
  trackingNumber: string;
  status: string;
  parcelSize: string;
  parcelType: string;
  weight: number | null;
  description: string | null;
  paymentType: string;
  codAmount: number | null;
  shippingCost: number;
  qrCode: string | null;
  pickupDate: string | null;
  expectedDelivery: string;
  actualDelivery: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  agent: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  } | null;
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  statusUpdates: Array<{
    id: string;
    status: string;
    notes: string | null;
    timestamp: string;
    latitude: number | null;
    longitude: number | null;
    agent: {
      firstName: string;
      lastName: string;
    } | null;
  }>;
}

export default function ParcelDetail() {
  const { id } = useParams<{ id: string }>();
  const [parcel, setParcel] = useState<ParcelDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (id) {
      fetchParcel();
    }
  }, [id]);

  const fetchParcel = async () => {
    try {
      const response = await parcelApi.getById(id!);
      setParcel(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch parcel details");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "IN_TRANSIT":
      case "OUT_FOR_DELIVERY":
        return <Truck className="w-5 h-5 text-blue-500" />;
      case "FAILED":
      case "CANCELLED":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "IN_TRANSIT":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "FAILED":
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!parcel) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Parcel Not Found</h2>
        <p className="text-gray-600">The parcel you're looking for doesn't exist.</p>
      </div>
    );
  }

  const canUpdateStatus = user?.role === "AGENT" || user?.role === "ADMIN";
  const isAssignedAgent = user?.role === "AGENT" && parcel.agent?.id === user.id;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="border rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="w-6 h-6" />
              Parcel #{parcel.trackingNumber}
            </h1>
            <p className="text-gray-600">Created on {new Date(parcel.createdAt).toLocaleDateString()}</p>
          </div>

          <div className={`px-4 py-2 rounded-full border ${getStatusColor(parcel.status)} flex items-center gap-2`}>
            {getStatusIcon(parcel.status)}
            <span className="font-semibold capitalize">{parcel.status.toLowerCase().replace("_", " ")}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Parcel Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Information */}
          <div className="border  rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Address Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Pickup Address</h3>
                <div className="text-sm">
                  <p>{parcel.pickupAddress.street}</p>
                  <p>
                    {parcel.pickupAddress.city}, {parcel.pickupAddress.state}
                  </p>
                  <p>
                    {parcel.pickupAddress.zipCode}, {parcel.pickupAddress.country}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">Delivery Address</h3>
                <div className="text-sm">
                  <p>{parcel.deliveryAddress.street}</p>
                  <p>
                    {parcel.deliveryAddress.city}, {parcel.deliveryAddress.state}
                  </p>
                  <p>
                    {parcel.deliveryAddress.zipCode}, {parcel.deliveryAddress.country}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Parcel Details */}
          <div className="border  rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Parcel Details</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Size</label>
                <p className="font-medium capitalize">{parcel.parcelSize.toLowerCase()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Type</label>
                <p className="font-medium capitalize">{parcel.parcelType.toLowerCase()}</p>
              </div>

              {parcel.weight && (
                <div>
                  <label className="  text-sm font-medium text-gray-600 flex items-center gap-1">
                    <Weight className="w-3 h-3" />
                    Weight
                  </label>
                  <p className="font-medium">{parcel.weight} kg</p>
                </div>
              )}

              <div>
                <label className="  text-sm font-medium text-gray-600 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Cost
                </label>
                <p className="font-medium">৳{parcel.shippingCost}</p>
              </div>
            </div>

            {parcel.description && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600">Description</label>
                <p className="text-sm text-gray-700">{parcel.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Payment Type</label>
                <p className="font-medium">{parcel.paymentType}</p>
              </div>

              {parcel.codAmount && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">COD Amount</label>
                  <p className="font-medium">৳{parcel.codAmount}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status History */}
          <div className="border  rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Status History</h2>

            <div className="space-y-4">
              {parcel.statusUpdates.map((update, index) => (
                <div key={update.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">{getStatusIcon(update.status)}</div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="font-semibold capitalize">{update.status.toLowerCase().replace("_", " ")}</p>
                      <p className="text-sm text-gray-500">{new Date(update.timestamp).toLocaleString()}</p>
                    </div>

                    {update.notes && <p className="text-sm text-gray-600 mt-1">{update.notes}</p>}

                    {update.agent && (
                      <p className="text-xs text-gray-500 mt-1">
                        Updated by: {update.agent.firstName} {update.agent.lastName}
                      </p>
                    )}

                    {update.latitude && update.longitude && (
                      <p className="text-xs text-gray-500 mt-1">
                        Location: {update.latitude.toFixed(4)}, {update.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="border  rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </h2>

            <div className="space-y-2">
              <p className="font-medium">
                {parcel.customer.firstName} {parcel.customer.lastName}
              </p>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                {parcel.customer.email}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                {parcel.customer.phoneNumber}
              </div>
            </div>
          </div>

          {/* Agent Information */}
          {parcel.agent && (
            <div className="border  rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Assigned Agent
              </h2>

              <div className="space-y-2">
                <p className="font-medium">
                  {parcel.agent.firstName} {parcel.agent.lastName}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {parcel.agent.phoneNumber}
                </div>
              </div>
            </div>
          )}

          {/* Delivery Information */}
          <div className="border  rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Delivery Timeline
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Expected Delivery</label>
                <p className="font-medium">{new Date(parcel.expectedDelivery).toLocaleDateString()}</p>
              </div>

              {parcel.pickupDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">Pickup Date</label>
                  <p className="font-medium">{new Date(parcel.pickupDate).toLocaleDateString()}</p>
                </div>
              )}

              {parcel.actualDelivery && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">Actual Delivery</label>
                  <p className="font-medium text-green-600">{new Date(parcel.actualDelivery).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* QR Code */}
          {parcel.qrCode && (
            <div className="border  rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QR Code
              </h2>

              <div className="flex justify-center">
                <img src={parcel.qrCode} alt={`QR Code for ${parcel.trackingNumber}`} className="w-32 h-32" />
              </div>

              <p className="text-center text-sm text-gray-600 mt-2">Scan to track this parcel</p>
            </div>
          )}

          {/* Status Update Form */}
          {/* {canUpdateStatus && (user?.role === "ADMIN" || isAssignedAgent) && <StatusUpdateForm parcelId={parcel.id} currentStatus={parcel.status} onStatusUpdate={fetchParcel} />} */}

          {user?.role === "ADMIN" && (
            <AgentAssignmentForm
              parcelId={parcel.id}
              currentAgent={
                parcel.agent
                  ? {
                      id: parcel.agent.id,
                      firstName: parcel.agent.firstName,
                      lastName: parcel.agent.lastName,
                    }
                  : undefined
              }
              onAgentAssigned={fetchParcel}
            />
          )}

          {canUpdateStatus && (user?.role === "ADMIN" || isAssignedAgent) && <StatusUpdateForm parcelId={parcel.id} currentStatus={parcel.status} onStatusUpdate={fetchParcel} />}
        </div>
      </div>
    </div>
  );
}
