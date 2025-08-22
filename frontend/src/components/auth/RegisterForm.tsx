// src/components/auth/RegisterForm.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../services/api";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { usePageTitle } from "../../hooks/usePageTitle";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      toast.error("You must agree to the terms and conditions");
      setIsLoading(false);
      return;
    }

    try {
      // Prepare data in the format expected by the backend
      const registerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      };

      const response = await authApi.register(registerData);

      // Check if the response has the expected structure
      if (response.data && response.data.user && response.data.token) {
        const { user, token, emailSent } = response.data;

        login(user, token);

        if (emailSent) {
          toast.success("Registration successful! Please check your email to verify your account.");
        } else {
          toast.success("Registration successful! However, we could not send the verification email.");
        }

        // Redirect based on user role
        if (user.role === "ADMIN") {
          navigate("/admin");
        } else if (user.role === "AGENT") {
          navigate("/agent");
        } else {
          navigate("/dashboard");
        }
      } else {
        // Handle case where response structure is different
        console.log("Unexpected response structure:", response.data);

        if (response.data.message) {
          toast.success(response.data.message);
        } else {
          toast.success("Registration successful! Please check your email to verify your account.");
        }

        // Redirect to login page since we don't have user data to auto-login
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const message = error.response.data?.message || error.response.data?.error || "An error occurred during registration";

        if (error.response.status === 409) {
          toast.error(message);
        } else if (error.response.status === 400) {
          toast.error(message);
        } else {
          toast.error(message);
        }
      } else if (error.request) {
        // The request was made but no response was received
        toast.error("Network error. Please check your connection and try again.");
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  usePageTitle("Register");

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="mx-auto max-w-md w-full py-8">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" name="firstName" placeholder="John" required value={formData.firstName} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" name="lastName" placeholder="Doe" required value={formData.lastName} onChange={handleChange} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required value={formData.email} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="+1 (555) 123-4567" required value={formData.phoneNumber} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" placeholder="123 Main St, City, State" value={formData.address} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" name="password" type="password" required minLength={6} value={formData.password} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} value={formData.confirmPassword} onChange={handleChange} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" checked={agreeToTerms} onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)} />
              <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I agree to the{" "}
                <Link to="/terms" className="underline">
                  terms and conditions
                </Link>
              </label>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;
