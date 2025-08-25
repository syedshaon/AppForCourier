import UserManagement from "./UserManagement";
import ParcelList from "../parcels/ParcelList";

function AdminDashboard() {
  return (
    <div className="flex 2xl:flex-row flex-col gap-6 min-h-screen border p-6">
      <UserManagement />

      <ParcelList />
    </div>
  );
}

export default AdminDashboard;
