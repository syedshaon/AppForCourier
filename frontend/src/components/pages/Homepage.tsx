// src/components/Homepage.tsx
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Clock, Shield } from "lucide-react";
import { usePageTitle } from "../../hooks/usePageTitle";
import ImageSlider from "../layout/ImageSlider";

const Homepage = () => {
  const { isAuthenticated } = useAuthStore();
  usePageTitle("Home");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl text-secondary xl:text-6xl/none">Fast & Reliable Courier Services</h1>
                <p className="max-w-[600px] text-secondary md:text-xl">Rui Courier delivers your parcels with speed and precision. Track your shipments in real-time and experience the best delivery service.</p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                {isAuthenticated ? (
                  <Button asChild size="lg">
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild size="lg">
                      <Link to="/register">Get Started</Link>
                    </Button>
                    <Button variant="outline" asChild size="lg">
                      <Link to="/login">Login</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img src="/delivery.png" width="550" height="550" alt="Hero" className="mx-auto aspect-video overflow-hidden rounded-xl object-cover" />
            </div>
          </div>
        </div>
      </section>
      <ImageSlider />

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-secondary ">Why Choose Rui Courier</h2>
              <p className="max-w-[900px] text-secondary md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">We provide the best delivery experience with our advanced tracking and reliable service.</p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-3 py-12">
            <Card>
              <CardHeader>
                <Truck className="h-12 w-12 text-primary mx-auto" />
                <CardTitle className="text-center">Fast Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">Get your parcels delivered quickly with our efficient delivery network.</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mx-auto" />
                <CardTitle className="text-center">Real-time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">Track your parcels in real-time with our advanced tracking system.</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mx-auto" />
                <CardTitle className="text-center">Secure Handling</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">Your parcels are handled with care and security throughout the delivery process.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ready to Ship?</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">Create an account today and experience the best courier service.</p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              {!isAuthenticated && (
                <Button asChild size="lg">
                  <Link to="/register">Sign Up Now</Link>
                </Button>
              )}
              <Button variant="outline" asChild size="lg">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
