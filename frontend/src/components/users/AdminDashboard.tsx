import UserManagement from "./UserManagement";
import ParcelList from "../parcels/ParcelList";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

function AdminDashboard() {
  return (
    <div className="max-w-[1800px] mx-auto">
      <div className="  flex 2xl:flex-row flex-col gap-6 min-h-[70vh]  p-6">
        <UserManagement />

        <ParcelList />
      </div>
      <div className="flex justify-end items-center my-8">
        <Link to="/parcels/create" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5">
          <Plus size={20} />
          Creat a Parcel
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;
