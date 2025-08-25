import ParcelList from "../parcels/ParcelList";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

function CustomerDashboard() {
  return (
    <div className="min-h-[70vh] border p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold  ">My Parcels</h1>
          <Link to="/parcels/create" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5">
            <Plus size={20} />
            Book Parcel
          </Link>
        </div>

        <ParcelList />
      </div>
    </div>
  );
}

export default CustomerDashboard;
