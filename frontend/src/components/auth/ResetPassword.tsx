// src/components/auth/ResetPassword.tsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { authApi } from "../../services/api";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { usePageTitle } from "../../hooks/usePageTitle";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"form" | "success" | "error">("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid reset link. No token provided.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword({ token, newPassword });
      setStatus("success");
      toast.success("Password reset successfully! You can now login with your new password.");
    } catch (error: any) {
      console.error("Password reset error:", error);
      setStatus("error");

      if (error.response?.status === 400) {
        setErrorMessage(error.response.data?.message || "Invalid or expired reset token.");
      } else if (error.response?.status === 404) {
        setErrorMessage("Reset token not found.");
      } else {
        setErrorMessage("An error occurred during password reset. Please try again.");
      }

      toast.error("Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  usePageTitle("Reset Password");

  if (status === "success") {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-muted">
        <Card className="mx-auto max-w-md w-full py-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Password Reset Successful!</CardTitle>
            <CardDescription>Your password has been reset successfully. You can now login with your new password.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="rounded-full bg-green-100 p-3 inline-flex mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <Button onClick={() => navigate("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-muted">
        <Card className="mx-auto max-w-md w-full py-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-destructive">Reset Failed</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="rounded-full bg-red-100 p-3 inline-flex mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <Button onClick={() => navigate("/login")} className="w-full mb-2">
              Back to Login
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/forgot-password">Request New Reset Link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-muted">
      <Card className="mx-auto max-w-md w-full py-8">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input id="newPassword" type={showPassword ? "text" : "password"} placeholder="Enter new password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm new password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>

            <Button type="button" variant="outline" onClick={() => navigate("/login")} className="w-full">
              Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
