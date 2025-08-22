// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

// Layout components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Auth components
import AuthInitializer from "./components/auth/AuthInitializer";
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

// Protected pages (commented out for now)
// import Dashboard from "./components/dashboard/Dashboard";
// import AdminDashboard from "./components/admin/AdminDashboard";
// import AgentDashboard from "./components/agent/AgentDashboard";
// import Profile from "./components/profile/Profile";
// import ParcelList from "./components/parcels/ParcelList";
// import MyParcels from "./components/parcels/MyParcels";

// Store and API
import { useAuthStore } from "./store/authStore";
import { authApi } from "./services/api";

function App() {
  const { setUser, user } = useAuthStore();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await authApi.getProfile();
        setUser(response.data.user);
      } catch (error) {
        console.log("Not authenticated");
      }
    };

    checkAuth();
  }, [setUser]);

  return (
    <Router>
      <AuthInitializer />
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected routes - commented out until components are created */}
            {/* <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            <Route
              path="/agent/*"
              element={
                <AgentRoute>
                  <AgentDashboard />
                </AgentRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/parcels"
              element={
                <ProtectedRoute>
                  <ParcelList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-parcels"
              element={
                <CustomerRoute>
                  <MyParcels />
                </CustomerRoute>
              }
            /> */}

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
