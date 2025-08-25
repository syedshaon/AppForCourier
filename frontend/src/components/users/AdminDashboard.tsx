import UserManagement from "./UserManagement";
import ParcelList from "../parcels/ParcelList";

function AdminDashboard() {
  return (
    <div className=" max-w-[1800px] mx-auto flex 2xl:flex-row flex-col gap-6 min-h-[70vh]  p-6">
      <UserManagement />

      <ParcelList />
    </div>
  );
}

export default AdminDashboard;
