// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { checkAndFixAuthState } from "./utils/authCleanup";

// Layout components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Auth components
import PublicRoute from "./components/auth/PublicRoute"; // Add this import
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import AgentRoute from "./components/auth/AgentRoute";
import CustomerRoute from "./components/auth/CustomerRoute";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import VerifyEmail from "./components/auth/VerifyEmail";

// Static pages
import Homepage from "./components/pages/Homepage";
import TermsAndConditions from "./components/pages/TermsAndConditions";
import Services from "./components/pages/Services";
import Contact from "./components/pages/Contact";
import Pricing from "./components/pages/Pricing";
import NotFound from "./components/pages/NotFound";
import ResetPassword from "./components/auth/ResetPassword";

// Store and API
import { useAuthStore } from "./store/authStore";
import { authApi } from "./services/api";
import { Loader2 } from "lucide-react";

function App() {
  const { setUser, user, isAuthenticated } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    checkAndFixAuthState();
  }, []);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const response = await authApi.getProfile();
          setUser(response.data.data.user);
        }
      } catch (error) {
        console.log("Not authenticated or token invalid");
        // Clear invalid token
        localStorage.removeItem("authToken");
        useAuthStore.getState().logout();
      } finally {
        setIsInitializing(false);
      }
    };

    checkAuth();
  }, [setUser]);

  // Show loading while initializing auth state
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1">
          <Routes>
            {/* Public routes that redirect if authenticated */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginForm />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterForm />
                </PublicRoute>
              }
            />

            {/* Other public routes (don't redirect if authenticated) */}
            <Route path="/" element={<Homepage />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div className="container mx-auto py-10">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p>Welcome to your dashboard!</p>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <div className="container mx-auto py-10">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p>Welcome to admin dashboard!</p>
                  </div>
                </AdminRoute>
              }
            />

            <Route
              path="/agent/*"
              element={
                <AgentRoute>
                  <div className="container mx-auto py-10">
                    <h1 className="text-3xl font-bold">Agent Dashboard</h1>
                    <p>Welcome to agent dashboard!</p>
                  </div>
                </AgentRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div className="container mx-auto py-10">
                    <h1 className="text-3xl font-bold">Profile</h1>
                    <p>User profile page</p>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Catch all route - must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
