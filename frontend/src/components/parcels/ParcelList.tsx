// src/components/parcels/ParcelList.tsx
import { useState, useEffect } from "react";
import { parcelApi } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";
import { Package, Search,  Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface Parcel {
  id: string;
  trackingNumber: string;
  status: string;
  parcelSize: string;
  parcelType: string;
  shippingCost: number;
  createdAt: string;
  expectedDelivery: string;
  customer?: {
    firstName: string;
    lastName: string;
  };
  pickupAddress: {
    city: string;
    state: string;
  };
  deliveryAddress: {
    city: string;
    state: string;
  };
}

export default function ParcelList() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 10,
  });

  const { user } = useAuthStore();

  useEffect(() => {
    fetchParcels();
  }, [filters]);

  const fetchParcels = async () => {
    try {
      let response;
      if (user?.role === "CUSTOMER") {
        response = await parcelApi.getUserParcels(filters);
      } else if (user?.role === "AGENT") {
        response = await parcelApi.getAgentParcels(filters);
      } else if (user?.role === "ADMIN") {
        response = await parcelApi.getAllParcels(filters);
      }

      setParcels(response?.data.data.parcels || []);
      setPagination(response?.data.data.pagination || {});
    } catch (error: any) {
      toast.error("Failed to fetch parcels");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "IN_TRANSIT":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading parcels...</div>;
  }

  return (
    <div className=" min-h-36 rounded-lg shadow-md px-6 container mx-auto py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6" />

          {user?.role === "CUSTOMER" && "My Parcels"}
          {user?.role === "AGENT" && "Assigned Parcels"}
          {user?.role === "ADMIN" && "All Parcels"}
        </h2>

        <div className="flex gap-2 w-full sm:w-auto">
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })} className="p-2 border rounded-md">
            <option className="bg-secondary" value="">
              All Status
            </option>
            <option className="bg-secondary" value="PENDING">
              Pending
            </option>
            <option className="bg-secondary" value="ASSIGNED">
              Assigned
            </option>
            <option className="bg-secondary" value="IN_TRANSIT">
              In Transit
            </option>
            <option className="bg-secondary" value="DELIVERED">
              Delivered
            </option>
          </select>

          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <input type="text" placeholder="Search parcels..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} className="pl-8 pr-4 py-2 border rounded-md w-full" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Tracking #</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">From → To</th>
              <th className="text-left p-3">Size/Type</th>
              <th className="text-left p-3">Cost</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parcels.map((parcel) => (
              <tr key={parcel.id} className="border-b  hover:bg-gray-600 ">
                <td className="p-3 font-mono">{parcel.trackingNumber}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(parcel.status)}`}>{parcel.status.replace("_", " ")}</span>
                </td>
                <td className="p-3">
                  <div className="text-sm">
                    {parcel.pickupAddress.city} → {parcel.deliveryAddress.city}
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-sm">
                    {parcel.parcelSize} / {parcel.parcelType}
                  </div>
                </td>
                <td className="p-3">৳{parcel.shippingCost}</td>
                <td className="p-3">
                  <Link to={`/parcels/${parcel.id}`} className="text-blue-600 hover:text-blue-800">
                    <Eye className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {parcels.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4" />
          <p>No parcels found</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button key={page} onClick={() => setFilters({ ...filters, page })} className={`px-3 py-1 rounded ${page === pagination.currentPage ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
