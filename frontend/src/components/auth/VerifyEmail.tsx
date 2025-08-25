// src/components/auth/VerifyEmail.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../services/api";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Loader2 } from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. No token provided.");
        toast.error("Invalid verification link");
        return;
      }

      try {
        // Make sure the token is properly encoded
        const encodedToken = encodeURIComponent(token);
        const response = await authApi.verifyEmail(encodedToken);

        if (response.status === 200) {
          setStatus("success");
          setMessage(response.data?.message || "Email verified successfully! You can now log in to your account.");
          toast.success("Email verified successfully!");
        } else {
          setStatus("error");
          setMessage("Email verification failed. Please try again.");
          toast.error("Email verification failed");
        }
      } catch (error: any) {
        console.error("Email verification error:", error);
        setStatus("error");

        if (error.response?.status === 400) {
          setMessage(error.response.data?.message || "Invalid or expired verification token.");
        } else if (error.response?.status === 404) {
          setMessage("Verification token not found.");
        } else if (error.response?.data?.message) {
          setMessage(error.response.data.message);
        } else {
          setMessage("An error occurred during email verification. Please try again.");
        }

        toast.error("Email verification failed");
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleResendVerification = async () => {
    const email = prompt("Please enter your email address to resend the verification email:");

    if (email) {
      try {
        await authApi.resendVerification({ email });
        toast.success("Verification email sent! Please check your inbox.");
      } catch (error: any) {
        const message = error.response?.data?.message || "Failed to resend verification email";
        toast.error(message);
      }
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-muted">
        <Card className="mx-auto max-w-md w-full py-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Verifying Email</CardTitle>
            <CardDescription className="text-center">Please wait while we verify your email address</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-muted">
      <Card className="mx-auto max-w-md w-full py-8">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{status === "success" ? "Email Verified!" : "Verification Failed"}</CardTitle>
          <CardDescription className="text-center">{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {status === "success" ? (
            <Button onClick={() => navigate("/login")} className="w-full">
              Go to Login
            </Button>
          ) : (
            <>
              <Button onClick={handleResendVerification} variant="outline" className="w-full">
                Resend Verification Email
              </Button>
              <Button onClick={() => navigate("/login")} className="w-full">
                Go to Login
              </Button>
              <Button onClick={() => navigate("/register")} variant="secondary" className="w-full">
                Create New Account
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
