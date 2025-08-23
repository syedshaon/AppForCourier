// src/components/auth/LoginForm.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../services/api";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { usePageTitle } from "../../hooks/usePageTitle";
import { X, ArrowLeft, Mail } from "lucide-react";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isResetSubmitted, setIsResetSubmitted] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowResendVerification(false);

    try {
      const response = await authApi.login({ email, password });

      const { user: userData, token, refreshToken } = response.data.data;

      // Save both tokens to store
      login(userData, token, refreshToken);
      toast.success("Login successful! Welcome back to Rui Courier!");

      // Redirect based on user role
      if (userData.role === "ADMIN") {
        navigate("/admin");
      } else if (userData.role === "AGENT") {
        navigate("/agent");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error details:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data,
        error: error.message,
      });

      const message = error.response?.data?.message || "An error occurred during login!";

      // Check if the error is due to unverified email
      if (error.response?.data?.message?.includes("verify your email") || error.response?.data?.message?.includes("email verified") || error.response?.data?.message?.includes("email verification")) {
        setShowResendVerification(true);
        toast.error("Please verify your email address before logging in.");
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);

    try {
      await authApi.resendVerification({ email });
      toast.success("Verification email sent! Please check your inbox.");
      setShowResendVerification(false);
    } catch (error: any) {
      console.error("Resend verification error:", error);
      const message = error.response?.data?.message || "Failed to send verification email";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetLoading(true);

    try {
      await authApi.requestPasswordReset({ email: resetEmail });
      setIsResetSubmitted(true);
      toast.success("Password reset instructions sent to your email!");
    } catch (error: any) {
      console.error("Password reset request error:", error);
      const message = error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(message);
    } finally {
      setIsResetLoading(false);
    }
  };

  const resetPasswordMode = () => {
    setIsResetMode(true);
    setResetEmail(email); // Pre-fill with the email from login form
    setShowResendVerification(false); // Hide resend verification when switching to reset mode
  };

  const backToLogin = () => {
    setIsResetMode(false);
    setIsResetSubmitted(false);
    setResetEmail("");
    setShowResendVerification(false);
  };

  usePageTitle(isResetMode ? "Reset Password" : "Login");

  if (isResetMode) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted">
        <Card className="mx-auto max-w-md w-full py-8 relative">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8" onClick={backToLogin}>
            <X className="h-4 w-4" />
          </Button>

          <CardHeader>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>Enter your email address and we'll send you instructions to reset your password.</CardDescription>
          </CardHeader>

          <CardContent>
            {isResetSubmitted ? (
              <div className="text-center space-y-4">
                <div className="rounded-full bg-green-100 p-3 inline-flex">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">Check Your Email</h3>
                <p className="text-sm text-muted-foreground">
                  We've sent password reset instructions to <strong>{resetEmail}</strong>
                </p>
                <p className="text-sm text-muted-foreground">If you don't see the email, check your spam folder.</p>
                <div className="flex flex-col gap-2 pt-4">
                  <Button onClick={backToLogin} className="w-full">
                    Back to Login
                  </Button>
                  <Button variant="outline" onClick={() => setIsResetSubmitted(false)} className="w-full">
                    Send Again
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input id="reset-email" type="email" placeholder="Enter your email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={isResetLoading}>
                  {isResetLoading ? "Sending..." : "Send Reset Instructions"}
                </Button>
                <Button type="button" variant="outline" onClick={backToLogin} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="mx-auto max-w-sm w-full py-8">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLoginSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <button type="button" onClick={resetPasswordMode} className="ml-auto inline-block text-sm underline text-blue-600 hover:text-blue-800">
                  Forgot your password?
                </button>
              </div>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            {/* Resend verification section */}
            {showResendVerification && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">Verify your email address</p>
                    <p className="text-xs text-amber-700 mt-1">Your account needs to be verified before you can login.</p>
                    <Button type="button" variant="outline" size="sm" className="mt-2 text-amber-700 border-amber-300 hover:border-amber-800 hover:border cursor-pointer hover:text-amber-800" onClick={handleResendVerification} disabled={isResending}>
                      {isResending ? "Sending..." : "Resend Verification Email"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="underline text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
