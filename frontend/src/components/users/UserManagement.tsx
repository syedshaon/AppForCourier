// src/components/admin/UsersPage.tsx

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { userApi } from "@/services/api"; // assume you have userApi like parcelApi
import { ArrowUpDown } from "lucide-react";
import type { User } from "@/types/auth";

type SortConfig = { key: keyof User; direction: "asc" | "desc" };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"ADMIN" | "AGENT" | "CUSTOMER">("CUSTOMER");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await userApi.getAll(); // GET /admin/users

      setUsers(res.data.data.users);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch users");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]));
  };

  const toggleSelectAll = (role: string) => {
    const roleUsers = users.filter((u) => u.role === role);
    const roleUserIds = roleUsers.map((u) => u.id);
    if (roleUserIds.every((id) => selectedIds.includes(id))) {
      setSelectedIds((prev) => prev.filter((id) => !roleUserIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...roleUserIds])]);
    }
  };

  const handleSort = (key: keyof User) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = (role: "ADMIN" | "AGENT" | "CUSTOMER") => {
    const roleUsers = users.filter((u) => u.role === role);
    if (!sortConfig) return roleUsers;
    return [...roleUsers].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? "";
      const bVal = b[sortConfig.key] ?? "";
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const bulkAction = async (action: string, role?: string) => {
    try {
      for (const id of selectedIds) {
        if (action === "deactivate") {
          await userApi.deactivate(id);
        } else if (action === "activate") {
          await userApi.activate(id);
        } else if (action === "changeRole" && role) {
          await userApi.updateRole(id, { role });
        }
      }
      toast.success("Bulk action completed");
      setSelectedIds([]);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed bulk action");
    }
  };

  const renderTable = (role: "ADMIN" | "AGENT" | "CUSTOMER") => (
    <div className="relative  ">
      {/* Bulk action bar */}
      {selectedIds.some((id) => users.find((u) => u.id === id)?.role === role) && (
        <div className="mb-4 p-3   rounded-lg border flex items-center gap-3">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <Button size="sm" variant="destructive" onClick={() => bulkAction("deactivate")}>
            Deactivate
          </Button>
          <Button size="sm" variant="outline" onClick={() => bulkAction("activate")}>
            Activate
          </Button>
          <Select onValueChange={(val) => bulkAction("changeRole", val)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Change Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="AGENT">Agent</SelectItem>
              <SelectItem value="CUSTOMER">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox checked={users.filter((u) => u.role === role).every((u) => selectedIds.includes(u.id))} onCheckedChange={() => toggleSelectAll(role)} />
            </TableHead>
            <TableHead onClick={() => handleSort("firstName")} className="cursor-pointer">
              Name <ArrowUpDown className="inline w-4 h-4" />
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>

            {/* New column only for Customers */}
            {role === "CUSTOMER" && <TableHead>Booked Parcels</TableHead>}

            {/* New column only for Agents */}
            {role === "AGENT" && <TableHead>Assigned Parcels</TableHead>}

            <TableHead>Status</TableHead>
            <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
              Joined <ArrowUpDown className="inline w-4 h-4" />
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedUsers(role).map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <Checkbox checked={selectedIds.includes(u.id)} onCheckedChange={() => toggleSelect(u.id)} />
              </TableCell>
              <TableCell>
                {u.firstName} {u.lastName}
              </TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.phoneNumber}</TableCell>

              {/* Show parcel counts conditionally */}
              {role === "CUSTOMER" && <TableCell>{u._count?.bookedParcels}</TableCell>}
              {role === "AGENT" && <TableCell>{u._count?.assignedParcels}</TableCell>}

              <TableCell>{u.isActive ? <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Active</span> : <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Inactive</span>}</TableCell>
              <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="p-6 container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Users Management</h1>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
        <TabsList>
          <TabsTrigger value="CUSTOMER">Customers</TabsTrigger>
          <TabsTrigger value="AGENT">Agents</TabsTrigger>
          <TabsTrigger value="ADMIN">Admins</TabsTrigger>
        </TabsList>

        <TabsContent value="CUSTOMER">{renderTable("CUSTOMER")}</TabsContent>
        <TabsContent value="AGENT">{renderTable("AGENT")}</TabsContent>
        <TabsContent value="ADMIN">{renderTable("ADMIN")}</TabsContent>
      </Tabs>
    </div>
  );
}
