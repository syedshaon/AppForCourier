// src/components/profile/Profile.tsx
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../services/api";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Eye, EyeOff } from "lucide-react";
import { usePageTitle } from "../../hooks/usePageTitle";

const Profile = () => {
  usePageTitle("Profile");
  const { user, updateUser, logout } = useAuthStore();
  const [profileFormData, setProfileFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setProfileFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
      });
      setIsLoading(false);
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);

    try {
      const response = await authApi.updateProfile(profileFormData);

      const updatedUser = response.data.data.user;

      // Update user in store using updateUser method
      updateUser(updatedUser);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update profile";
      toast.error(message);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    // Validate password length
    if (passwordFormData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    setIsPasswordLoading(true);

    try {
      await authApi.changePassword({
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
      });

      toast.success("Password changed successfully. Please login again.");

      // Clear password form
      setPasswordFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Logout user after a short delay
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to change password";
      toast.error(message);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <div className="text-lg text-destructive">User not found. Please log in again.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Profile Update Card */}
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Profile Information</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" value={profileFormData.firstName} onChange={handleProfileChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" value={profileFormData.lastName} onChange={handleProfileChange} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email} disabled />
              <p className="text-sm text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" name="phoneNumber" value={profileFormData.phoneNumber} onChange={handleProfileChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" value={profileFormData.address} onChange={handleProfileChange} />
            </div>
            <Button type="submit" disabled={isProfileLoading}>
              {isProfileLoading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Change Password</CardTitle>
          <CardDescription>Update your password securely</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="grid gap-4">
            <div className="grid gap-2 relative">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" name="currentPassword" type={showCurrentPassword ? "text" : "password"} value={passwordFormData.currentPassword} onChange={handlePasswordChange} required />
              <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-7 h-10 w-10" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>

            <div className="grid gap-2 relative">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" name="newPassword" type={showNewPassword ? "text" : "password"} value={passwordFormData.newPassword} onChange={handlePasswordChange} required />
              <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-7 h-10 w-10" onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>

            <div className="grid gap-2 relative">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={passwordFormData.confirmPassword} onChange={handlePasswordChange} required />
              <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-7 h-10 w-10" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>

            <Button type="submit" disabled={isPasswordLoading} variant="destructive">
              {isPasswordLoading ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
